/**
 * Pre-translates every kitab pesantren into the sibling sites' languages and
 * stores the result in R2, so the Worker serves native-language kitab with ONE
 * read — no runtime machine translation at all.
 *
 * Why here and not in the Worker: the Workers free plan allows only 50
 * subrequests per request and 1,000 KV writes per day. Translating a whole
 * kitab needs dozens of translator calls + dozens of writes, so the old
 * in-Worker background job could never complete and sibling sites kept
 * showing Indonesian. A GitHub Actions runner has no such limits and can
 * retry for minutes until every string is translated.
 *
 * R2, not D1 (owner, 30 Oct 2026: "Semua database wajib ke R2, pastikan hemat D1";
 * docs/R2-DATA-BLUEPRINT.md §5, step 1). This job is the only writer of
 *   pes-i18n/<lang>/<kitab>.json   { slug, lang, srcHash, complete, updatedAt, strings }
 *   pes-i18n/<lang>/_index.json    { lang, updatedAt, migratedFromD1, categories, kitab }
 * (read by apps/worker-api/src/lib/pes-i18n-r2.ts). The first run for a language
 * copies what D1's pes_i18n holds, with the same keys, and checks every object by
 * reading it back; after that nothing here writes to D1. The kitab text itself is
 * still read from D1 until its own move (step 3).
 *
 * Idempotent: a (kitab, lang) whose source hash matches the index is skipped,
 * so scheduled runs only pick up new/changed kitab.
 *
 * Usage: npx tsx scripts/translate-pesantren.ts [--langs=en,fr,de,es] [--force]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { maskProtected } from "./mt-key.mjs";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const GTX_BASE = "https://translate.googleapis.com/translate_a/single";
const MYMEMORY_BASE = "https://api.mymemory.translated.net/get";
const SEP = "\n⁂\n";
const BUCKET = "ulyah-media";
const PREFIX = "pes-i18n";

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    // The four sibling sites. English (xad.es) was missing from the old default, so three kitab
    // were never translated into it (docs/ADSENSE-BLUEPRINT.md §19.3).
    langs: ((args.langs as string) || "en,fr,de,es")
      .split(",")
      .map((s) => s.trim())
      .filter((l) => /^[a-z]{2}$/.test(l)),
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

/** One attempt, no retries: a missing object is an answer, not an error to wait out. */
function r2GetJson<T>(key: string, tmp: string): T | null {
  const local = join(tmp, `get-${key.replace(/[^a-z0-9.-]/gi, "_")}`);
  try {
    execFileSync("npx", ["wrangler", "r2", "object", "get", `${BUCKET}/${key}`, `--file=${local}`, "--remote"], {
      cwd: WORKER_CWD,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(readFileSync(local, "utf8")) as T;
  } catch {
    return null;
  } finally {
    rmSync(local, { force: true });
  }
}

/** Write, then read back: an object that did not arrive whole fails the run instead of leaving a gap. */
function r2PutJson(key: string, value: unknown, tmp: string): void {
  const body = JSON.stringify(value);
  const local = join(tmp, `put-${key.replace(/[^a-z0-9.-]/gi, "_")}`);
  writeFileSync(local, body, "utf8");
  wrangler(["r2", "object", "put", `${BUCKET}/${key}`, `--file=${local}`, "--content-type=application/json", "--remote"], true);
  rmSync(local, { force: true });
  const back = r2GetJson<unknown>(key, tmp);
  if (JSON.stringify(back) !== body) throw new Error(`R2 read-back does not match what was written: ${key}`);
}

interface KitabObject {
  slug: string;
  lang: string;
  srcHash: string | null;
  complete: boolean;
  updatedAt: string;
  strings: Record<string, string>;
}
interface LangIndex {
  lang: string;
  updatedAt: string;
  migratedFromD1?: string;
  categories: Record<string, string>;
  kitab: Record<string, { title_id?: string; description_id?: string; srcHash: string | null; complete: boolean }>;
}

/**
 * The once-only move of what D1 holds for one language (docs/R2-DATA-BLUEPRINT.md §5): same keys,
 * every object read back and compared, and the total checked against the D1 row count. Any
 * difference stops the run before the index records the language as moved.
 */
function migrateFromD1(lang: string, index: LangIndex, tmp: string): void {
  const rows = d1Json<{ slug: string; k: string; v: string }>(
    `SELECT slug, k, v FROM pes_i18n WHERE lang = '${lang}' ORDER BY slug, k;`
  );
  const meta = new Map(
    d1Json<{ slug: string; src_hash: string }>(`SELECT slug, src_hash FROM pes_i18n_meta WHERE lang = '${lang}';`).map((m) => [
      m.slug,
      m.src_hash,
    ])
  );
  const bySlug = new Map<string, Record<string, string>>();
  for (const r of rows) {
    const m = bySlug.get(r.slug) ?? {};
    m[r.k] = r.v;
    bySlug.set(r.slug, m);
  }
  let moved = 0;
  const now = new Date().toISOString();
  for (const [slug, strings] of bySlug) {
    if (slug === "_cat") {
      Object.assign(index.categories, strings);
      moved += Object.keys(strings).length;
      continue;
    }
    const srcHash = meta.get(slug) ?? null;
    const obj: KitabObject = { slug, lang, srcHash, complete: srcHash !== null, updatedAt: now, strings };
    r2PutJson(`${PREFIX}/${lang}/${slug}.json`, obj, tmp);
    index.kitab[slug] = {
      title_id: strings["k:title_id"],
      description_id: strings["k:description_id"],
      srcHash,
      complete: srcHash !== null,
    };
    moved += Object.keys(strings).length;
  }
  if (moved !== rows.length) throw new Error(`${lang}: ${rows.length} rows in D1 but ${moved} moved to R2`);
  index.migratedFromD1 = now;
  r2PutJson(`${PREFIX}/${lang}/_index.json`, { ...index, updatedAt: now }, tmp);
  const kitabMoved = [...bySlug.keys()].filter((k) => k !== "_cat").length;
  console.log(`Moved ${lang} from D1: ${kitabMoved} kitab, ${rows.length} string(s), every one read back and matched.`);
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

/**
 * The shared list in mt-key.mjs protects the book names and "no.", but not the
 * citation markers themselves — "HR." (hadits riwayat) and "QS." (Qur'an surat).
 * gtx renders "HR." as "recursos humanos" in Spanish.
 *
 * They are masked here rather than added to the shared list on purpose: that
 * list feeds hashKey, so growing it would change the cache key of every string
 * containing one of these and orphan the entries already written under the old
 * key. This script writes to pes_i18n by (kitab, lang) and never hashes masked
 * text, so it can protect more without moving anyone's keys.
 */
const CITATION_MARKER = /\b(?:HR|QS)\s*\.?/gi;

function maskProtectedPlus(text: string): { masked: string; map: string[] } {
  const { masked, map } = maskProtected(text);
  // Sentinels are @@n@@ — the marker pattern cannot match inside one.
  const out = masked.replace(CITATION_MARKER, (m) => {
    const i = map.length;
    map.push(m);
    return `@@${i}@@`;
  });
  return { masked: out, map };
}

/**
 * Puts the masked runs back exactly as they were. Refuses if a sentinel went
 * missing: a translator that ate an @@n@@ has swallowed a hadith's Arabic or a
 * citation, and half-restored text is worse than no translation at all.
 */
function unmaskProtected(text: string, map: string[]): string | null {
  let out = text;
  for (let i = 0; i < map.length; i++) {
    const sentinel = new RegExp(`@@\\s*${i}\\s*@@`, "g");
    if (!sentinel.test(out)) return null;
    out = out.replace(sentinel, map[i]);
  }
  return /@@\d+@@/.test(out) ? null : out;
}

/**
 * Translate, with the things that must not be translated hidden first.
 *
 * gtx renders "HR." — hadits riwayat, "narrated by" — as "recursos humanos" in
 * Spanish, turns narrator names into their nearest common noun, and will
 * happily replace a run of Arabic with a pious phrase of its own. So the Arabic
 * and the protected terms are masked to @@n@@ before the request and restored
 * after it, and a response that lost a sentinel is thrown away.
 */
async function translateProtected(text: string, target: string): Promise<string | null> {
  const { masked, map } = maskProtectedPlus(text);
  // Nothing left to translate once the Arabic is hidden — keep the original.
  if (!/[A-Za-zÀ-ɏ]/.test(masked.replace(/@@\d+@@/g, ""))) return text;
  const out = await translate(masked, target);
  if (!out) return null;
  return unmaskProtected(out, map);
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
  console.log(`${kitabs.length} kitab, ${babs.length} bab, ${matns.length} matn.`);

  const tmp = mkdtempSync(join(tmpdir(), "ulyah-pes-i18n-"));
  let jobs = 0;
  let skipped = 0;
  let failedJobs = 0;

  const cats = d1Json<{ slug: string; name_id: string | null }>("SELECT slug, name_id FROM pesantren_category;");

  for (const lang of langs) {
    const indexKey = `${PREFIX}/${lang}/_index.json`;
    const index: LangIndex = r2GetJson<LangIndex>(indexKey, tmp) ?? { lang, updatedAt: "", categories: {}, kitab: {} };
    if (!index.migratedFromD1) migrateFromD1(lang, index, tmp);

    // Category names (short, few) live in the index, so the categories route reads one object.
    let catsAdded = 0;
    for (const cat of cats) {
      if (!cat.name_id?.trim() || (!force && index.categories[cat.slug])) continue;
      const t = await translateProtected(cat.name_id, lang);
      if (t) {
        index.categories[cat.slug] = t;
        catsAdded++;
      }
      await sleep(300);
    }
    if (catsAdded) console.log(`Categories → ${lang}: ${catsAdded} translated`);

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
      const srcHash = hashKey(entries.map(([k, v]) => `${k}=${v}`).join(""));

      const known = index.kitab[kitab.slug];
      if (!force && known?.complete && known.srcHash === srcHash) {
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
        const translated = await translateProtected(joined, lang);
        const parts = translated?.split(/\n?\s*⁂\s*\n?/) ?? [];
        if (parts.length === batch.length) {
          batch.forEach(([key], i) => {
            const t = parts[i]?.trim();
            if (t) out[key] = t;
          });
        } else {
          // Separator got eaten — translate the batch string by string.
          for (const [key, v] of batch) {
            const t = await translateProtected(v.replace(/\n{2,}/g, "\n"), lang);
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

      // A string that failed this time keeps its earlier translation instead of falling back to
      // Indonesian; strings of matn that no longer exist are dropped. The hash is recorded only
      // when the whole kitab made it, so a partial run is retried next time.
      const objKey = `${PREFIX}/${lang}/${kitab.slug}.json`;
      const prev = keys.length < entries.length ? r2GetJson<KitabObject>(objKey, tmp) : null;
      const strings: Record<string, string> = {};
      for (const [k] of entries) {
        const v = out[k] ?? prev?.strings?.[k];
        if (v) strings[k] = v;
      }
      const complete = keys.length === entries.length && ok;
      r2PutJson(
        objKey,
        { slug: kitab.slug, lang, srcHash: complete ? srcHash : null, complete, updatedAt: new Date().toISOString(), strings } satisfies KitabObject,
        tmp
      );
      index.kitab[kitab.slug] = {
        title_id: strings["k:title_id"],
        description_id: strings["k:description_id"],
        srcHash: complete ? srcHash : null,
        complete,
      };
      console.log(`  ✓ ${keys.length}/${entries.length} strings stored${complete ? "" : " (partial — will retry next run)"}`);
      jobs++;
      // Kept current as it goes, so a run cut short does not lose the kitab it finished.
      r2PutJson(indexKey, { ...index, updatedAt: new Date().toISOString() }, tmp);
    }
    r2PutJson(indexKey, { ...index, updatedAt: new Date().toISOString() }, tmp);
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
