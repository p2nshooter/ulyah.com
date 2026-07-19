/**
 * Pre-translates every kitab pesantren into the sibling sites' languages and
 * stores the result in D1 (`pes_i18n`), so the Worker serves native-language
 * kitab with ONE database read — no runtime machine translation at all.
 *
 * Why here and not in the Worker: the Workers free plan allows only 50
 * subrequests per request and 1,000 KV writes per day. Translating a whole
 * kitab needs dozens of translator calls + dozens of writes, so the old
 * in-Worker background job could never complete and sibling sites kept
 * showing Indonesian. A GitHub Actions runner has no such limits and can
 * retry for minutes until every string is translated.
 *
 * Idempotent: a (kitab, lang) whose source hash matches pes_i18n_meta is
 * skipped, so scheduled runs only pick up new/changed kitab.
 *
 * Usage: npx tsx scripts/translate-pesantren.ts --langs=fr,de,es [--force]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const GTX_BASE = "https://translate.googleapis.com/translate_a/single";
const MYMEMORY_BASE = "https://api.mymemory.translated.net/get";
const SEP = "\n⁂\n";

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    langs: ((args.langs as string) || "fr,de,es").split(",").map((s) => s.trim()).filter(Boolean),
    force: args.force === "true",
  };
}

function wrangler(argv: string[], capture = false): string {
  for (let i = 0; i < 5; i++) {
    try {
      return execFileSync("npx", ["wrangler", ...argv], {
        cwd: WORKER_CWD,
        stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
        encoding: "utf8",
        maxBuffer: 256 * 1024 * 1024,
      });
    } catch (err) {
      if (i === 4) throw err;
      execFileSync("sleep", [String(3 * 2 ** i)]);
    }
  }
  return "";
}

function d1Json<T>(sql: string): T[] {
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], true);
  try {
    const parsed = JSON.parse(out);
    const results = Array.isArray(parsed) ? parsed[0]?.results : parsed?.results;
    return (results ?? []) as T[];
  } catch {
    console.error("Could not parse d1 --json output");
    return [];
  }
}

/** Execute a (possibly large) SQL script via --file to dodge argv limits. */
function d1File(sql: string, tmp: string): void {
  const p = join(tmp, `stmt-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  writeFileSync(p, sql);
  wrangler(["d1", "execute", "ulyah-db", "--remote", `--file=${p}`]);
  rmSync(p, { force: true });
}

function sq(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

// Same FNV-1a hash the Worker uses — stable fingerprint for skip logic.
function hashKey(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function gtx(text: string, target: string, source = "id"): Promise<string | null> {
  const url = `${GTX_BASE}?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" } });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const out = (data[0] as unknown[])
      .map((seg) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
      .join("");
    return out.trim() ? out.trim() : null;
  } catch {
    return null;
  }
}

async function mymemory(text: string, target: string, source = "id"): Promise<string | null> {
  try {
    const res = await fetch(`${MYMEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`, {
      headers: { "User-Agent": "ulyah.com content localizer" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { responseData?: { translatedText?: string }; responseStatus?: number | string };
    if (String(data.responseStatus ?? "200") !== "200") return null;
    const t = data.responseData?.translatedText;
    return t && t.trim() ? t.trim() : null;
  } catch {
    return null;
  }
}

/** Translate one string with retries; falls back to sentence-chunked MyMemory. */
async function translate(text: string, target: string): Promise<string | null> {
  for (let i = 0; i < 4; i++) {
    const r = await gtx(text, target);
    if (r) return r;
    await sleep(1500 * (i + 1));
  }
  // MyMemory caps request size, so go sentence by sentence.
  const sentences = text.split(/(?<=[.!?؟۔])\s+/);
  const parts: string[] = [];
  let buf = "";
  const flushables: string[] = [];
  for (const s of sentences) {
    const cand = buf ? `${buf} ${s}` : s;
    if (cand.length > 450 && buf) {
      flushables.push(buf);
      buf = s;
    } else buf = cand;
  }
  if (buf) flushables.push(buf);
  for (const chunk of flushables) {
    const r = (await gtx(chunk, target)) ?? (await mymemory(chunk, target));
    if (!r) return null;
    parts.push(r);
    await sleep(400);
  }
  return parts.join(" ");
}

interface KitabRow {
  slug: string;
  title_id: string | null;
  description_id: string | null;
}
interface BabRow {
  id: number;
  kitab_slug: string;
  name_id: string | null;
}
interface MatnRow {
  id: number;
  kitab_slug: string;
  title_id: string | null;
  translation_id: string | null;
  explanation_id: string | null;
}

async function main() {
  const { langs, force } = parseArgs();
  console.log(`Pre-translating kitab pesantren into: ${langs.join(", ")}${force ? " (forced)" : ""}`);

  const kitabs = d1Json<KitabRow>("SELECT slug, title_id, description_id FROM pesantren_kitab ORDER BY slug;");
  const babs = d1Json<BabRow>("SELECT id, kitab_slug, name_id FROM pesantren_bab ORDER BY kitab_slug, bab_order;");
  const matns = d1Json<MatnRow>(
    "SELECT m.id, b.kitab_slug AS kitab_slug, m.title_id, m.translation_id, m.explanation_id FROM pesantren_matn m JOIN pesantren_bab b ON b.id = m.bab_id ORDER BY b.kitab_slug, b.bab_order, m.matn_order;"
  );
  const meta = d1Json<{ slug: string; lang: string; src_hash: string }>(
    "SELECT slug, lang, src_hash FROM pes_i18n_meta;"
  );
  const metaMap = new Map(meta.map((m) => [`${m.slug}:${m.lang}`, m.src_hash]));
  console.log(`${kitabs.length} kitab, ${babs.length} bab, ${matns.length} matn.`);

  const tmp = mkdtempSync(join(tmpdir(), "ulyah-pes-i18n-"));
  let jobs = 0;
  let skipped = 0;
  let failedJobs = 0;

  // Category names (short, few) — stored under the reserved slug '_cat' so
  // the categories endpoint can localize with one query.
  const cats = d1Json<{ slug: string; name_id: string | null }>("SELECT slug, name_id FROM pesantren_category;");
  for (const lang of langs) {
    const catRows: string[] = [];
    for (const cat of cats) {
      if (!cat.name_id?.trim()) continue;
      const t = await translate(cat.name_id, lang);
      if (t) catRows.push(`('_cat', ${sq(lang)}, ${sq(cat.slug)}, ${sq(t)})`);
      await sleep(300);
    }
    if (catRows.length > 0) {
      d1File(
        `INSERT INTO pes_i18n (slug, lang, k, v) VALUES ${catRows.join(",")} ON CONFLICT(slug, lang, k) DO UPDATE SET v = excluded.v;`,
        tmp
      );
      console.log(`Categories → ${lang}: ${catRows.length} stored`);
    }
  }

  for (const kitab of kitabs) {
    // Entry list mirrors what the Worker's reader consumes.
    const entries: [string, string][] = [];
    if (kitab.title_id?.trim()) entries.push(["k:title_id", kitab.title_id]);
    if (kitab.description_id?.trim()) entries.push(["k:description_id", kitab.description_id]);
    for (const b of babs.filter((b) => b.kitab_slug === kitab.slug)) {
      if (b.name_id?.trim()) entries.push([`b:${b.id}`, b.name_id]);
    }
    for (const m of matns.filter((m) => m.kitab_slug === kitab.slug)) {
      if (m.title_id?.trim()) entries.push([`mt:${m.id}`, m.title_id]);
      if (m.translation_id?.trim()) entries.push([`tr:${m.id}`, m.translation_id]);
      if (m.explanation_id?.trim()) entries.push([`ex:${m.id}`, m.explanation_id]);
    }
    if (entries.length === 0) continue;
    const srcHash = hashKey(entries.map(([k, v]) => `${k}=${v}`).join(""));

    for (const lang of langs) {
      if (!force && metaMap.get(`${kitab.slug}:${lang}`) === srcHash) {
        skipped++;
        continue;
      }
      console.log(`\n▶ ${kitab.slug} → ${lang} (${entries.length} strings)`);

      // Batch entries ≤3000 chars per translator call, separator-joined.
      const out: Record<string, string> = {};
      let batch: [string, string][] = [];
      let size = 0;
      let ok = true;
      const flush = async () => {
        if (batch.length === 0) return;
        const joined = batch.map(([, v]) => v.replace(/\n{2,}/g, "\n")).join(SEP);
        const translated = await translate(joined, lang);
        const parts = translated?.split(/\n?\s*⁂\s*\n?/) ?? [];
        if (parts.length === batch.length) {
          batch.forEach(([key], i) => {
            const t = parts[i]?.trim();
            if (t) out[key] = t;
          });
        } else {
          // Separator got eaten — translate the batch string by string.
          for (const [key, v] of batch) {
            const t = await translate(v.replace(/\n{2,}/g, "\n"), lang);
            if (t) out[key] = t;
            else ok = false;
            await sleep(300);
          }
        }
        batch = [];
        size = 0;
        await sleep(500);
      };
      for (const e of entries) {
        if (size + e[1].length > 3000 && batch.length > 0) await flush();
        batch.push(e);
        size += e[1].length;
      }
      await flush();

      const keys = Object.keys(out);
      if (keys.length === 0) {
        console.warn(`  ✗ no strings translated for ${kitab.slug}/${lang} — leaving untouched`);
        failedJobs++;
        continue;
      }

      // Upsert rows in chunks; only stamp meta when the whole kitab made it,
      // so partial runs are retried next time.
      const rows = keys.map((k) => `(${sq(kitab.slug)}, ${sq(lang)}, ${sq(k)}, ${sq(out[k]!)})`);
      for (let i = 0; i < rows.length; i += 80) {
        const stmt = `INSERT INTO pes_i18n (slug, lang, k, v) VALUES ${rows.slice(i, i + 80).join(",")} ON CONFLICT(slug, lang, k) DO UPDATE SET v = excluded.v;`;
        d1File(stmt, tmp);
      }
      const complete = keys.length === entries.length && ok;
      if (complete) {
        d1File(
          `INSERT INTO pes_i18n_meta (slug, lang, src_hash, updated_at) VALUES (${sq(kitab.slug)}, ${sq(lang)}, ${sq(srcHash)}, datetime('now')) ON CONFLICT(slug, lang) DO UPDATE SET src_hash = excluded.src_hash, updated_at = excluded.updated_at;`,
          tmp
        );
      }
      console.log(`  ✓ ${keys.length}/${entries.length} strings stored${complete ? "" : " (partial — will retry next run)"}`);
      jobs++;
    }
  }

  rmSync(tmp, { recursive: true, force: true });
  console.log(`\nDone. ${jobs} kitab-language jobs written, ${skipped} already current, ${failedJobs} failed.`);
  // Fail the run only when nothing at all could be translated — that means
  // every translator endpoint is down and a human should see red.
  if (jobs === 0 && failedJobs > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
