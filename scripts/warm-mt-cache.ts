/**
 * Pre-warms the machine-translation KV cache for the short taxonomy strings the
 * sibling sites render — category names and the kisah "tokoh" person index
 * (name + honorific). Runs in GitHub Actions, NOT in the Worker.
 *
 * Why this exists: the Worker translates on demand via Google's free gtx
 * endpoint, but Google routinely blocks Cloudflare's datacenter IPs, so those
 * runtime calls return null and the code falls back to the Indonesian source —
 * which is why dawa.es/kisah showed "Kisah Para Nabi", "Nabi Adam", "Manusia &
 * Nabi Pertama" untranslated. A GitHub Actions runner is NOT blocked, so it can
 * translate every string once and write the result into the SAME cache the
 * Worker reads — the D1 `mt_cache` table (migration 0046), keyed
 * `mt:<src>-<tgt>:<hashKey(text)>`. (It used to write KV, whose 1,000/day free
 * write cap silently dropped everything — the real reason the sibling sites
 * stayed Indonesian.) After a run, the Worker serves the cached translation
 * with no upstream call. Idempotent INSERT ... ON CONFLICT, safe to run daily.
 *
 * Usage: npx tsx scripts/warm-mt-cache.ts [--langs=en,fr,de,es] [--dry]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const GTX_BASE = "https://translate.googleapis.com/translate_a/single";

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    langs: ((args.langs as string) || "en,fr,de,es").split(",").map((s) => s.trim()).filter(Boolean),
    dry: args.dry === "true",
  };
}

// EXACT copy of the Worker's cache-key hash (apps/worker-api/src/lib/mt.ts) —
// must stay byte-identical or the Worker won't find what we write.
function hashKey(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
const toGoogleLang = (code: string): string => (code === "zh" ? "zh-CN" : code);

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

async function gtx(text: string, tl: string): Promise<string | null> {
  const url = `${GTX_BASE}?client=gtx&sl=id&tl=${toGoogleLang(tl)}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ulyah.com/1.0)" } });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const out = (data[0] as unknown[]).map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
    return out.trim() || null;
  } catch {
    return null;
  }
}

/** Gather the distinct id-source strings the sibling sites render as taxonomy. */
function collectStrings(): string[] {
  const set = new Set<string>();
  const add = (s: unknown) => {
    const t = typeof s === "string" ? s.trim() : "";
    if (t) set.add(t);
  };
  for (const r of d1Json<{ name: string }>("SELECT name FROM categories;")) add(r.name);
  // Kisah person index: name + honorific (list) AND the full profile summary
  // (detail page body) — the summary was the long Indonesian block still shown
  // on dawa.es/kisah/tokoh even after the taxonomy was warmed.
  for (const r of d1Json<{ name_id: string; title_id: string | null; summary_id: string | null }>(
    "SELECT name_id, title_id, summary_id FROM kisah_person;"
  )) {
    add(r.name_id);
    add(r.title_id);
    add(r.summary_id);
  }
  // Story titles AND bodies (audiobook articles + kisah episodes) — authored id.
  for (const r of d1Json<{ title: string; body: string }>(
    "SELECT DISTINCT title, body FROM stories WHERE lang = 'id' AND status = 'published';"
  )) {
    add(r.title);
    add(r.body);
  }
  // Children's stories: title + body + moral.
  for (const r of d1Json<{ title_id: string; body_id: string | null; moral_id: string | null }>(
    "SELECT title_id, body_id, moral_id FROM kisah_anak;"
  )) {
    add(r.title_id);
    add(r.body_id);
    add(r.moral_id);
  }
  // Amalan harian: title + translation + note (all id-source).
  for (const r of d1Json<{ title_id: string; translation_id: string | null; note_id: string | null }>(
    "SELECT title_id, translation_id, note_id FROM amalan_item;"
  )) {
    add(r.title_id);
    add(r.translation_id);
    add(r.note_id);
  }
  return [...set];
}

async function main() {
  const { langs, dry } = parseArgs();
  const strings = collectStrings();
  console.log(`Collected ${strings.length} distinct id strings to warm into [${langs.join(", ")}].`);

  let translated = 0;
  let failed = 0;
  const pairs: { key: string; value: string }[] = [];

  for (const lang of langs) {
    if (lang === "id") continue;
    for (const text of strings) {
      const value = await gtx(text, lang);
      if (!value || value === text) {
        failed++;
        continue;
      }
      pairs.push({ key: `mt:id-${lang}:${hashKey(text)}`, value });
      translated++;
    }
    console.log(`  ${lang}: ${pairs.length} pairs staged so far`);
  }

  console.log(`Translated ${translated}, failed/unchanged ${failed}, ${pairs.length} rows to write to D1.`);
  if (dry || pairs.length === 0) {
    console.log(dry ? "--dry: not writing." : "nothing to write.");
    return;
  }

  // Write into the D1 `mt_cache` table the Worker reads (migration 0046), NOT
  // KV. KV's free plan caps writes at 1,000/day — that cap silently dropped
  // EVERY translation and is exactly why the sibling sites stayed Indonesian
  // for days. D1 has no such daily write cap. INSERT ... ON CONFLICT keeps it
  // idempotent; ~400 rows per `d1 execute --file` stays well under limits.
  // Self-sufficient: ensure the table exists so this job doesn't depend on a
  // deploy having run migration 0046 first.
  wrangler([
    "d1",
    "execute",
    "ulyah-db",
    "--remote",
    "--command=CREATE TABLE IF NOT EXISTS mt_cache (k TEXT PRIMARY KEY, v TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));",
  ]);

  const esc = (s: string) => s.replace(/'/g, "''");
  const dir = mkdtempSync(join(tmpdir(), "mtwarm-"));
  try {
    let wrote = 0;
    for (let i = 0; i < pairs.length; i += 400) {
      const chunk = pairs.slice(i, i + 400);
      const values = chunk.map((p) => `('${esc(p.key)}','${esc(p.value)}')`).join(",");
      const file = join(dir, `mt-${i}.sql`);
      writeFileSync(file, `INSERT INTO mt_cache (k, v) VALUES ${values} ON CONFLICT(k) DO UPDATE SET v = excluded.v;`, "utf8");
      wrangler(["d1", "execute", "ulyah-db", "--remote", `--file=${file}`]);
      wrote += chunk.length;
      console.log(`  wrote ${wrote}/${pairs.length}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log("Done — sibling sites now serve these from D1 with no runtime translate call, no KV write cap.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
