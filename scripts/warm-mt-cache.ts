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
 * translate every string once and write the result into the SAME KV cache the
 * Worker reads (`mt:<src>-<tgt>:<hashKey(text)>`). After a run, the Worker
 * serves the cached translation with no upstream call. Idempotent bulk write,
 * safe to run daily.
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
  for (const r of d1Json<{ name_id: string; title_id: string | null }>(
    "SELECT name_id, title_id FROM kisah_person;"
  )) {
    add(r.name_id);
    add(r.title_id);
  }
  // Story list titles the sibling sites show (authored id rows).
  for (const r of d1Json<{ title: string }>(
    "SELECT DISTINCT title FROM stories WHERE lang = 'id' AND status = 'published';"
  )) add(r.title);
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

  console.log(`Translated ${translated}, failed/unchanged ${failed}, ${pairs.length} KV pairs to write.`);
  if (dry || pairs.length === 0) {
    console.log(dry ? "--dry: not writing." : "nothing to write.");
    return;
  }

  // One bulk write per ~9000 pairs (wrangler bulk limit is 10k) into the same
  // cache the Worker reads via `CACHE_KV`. TTL matches the Worker's 90 days.
  const dir = mkdtempSync(join(tmpdir(), "mtwarm-"));
  try {
    for (let i = 0; i < pairs.length; i += 9000) {
      const chunk = pairs.slice(i, i + 9000).map((p) => ({ ...p, expiration_ttl: 60 * 60 * 24 * 90 }));
      const file = join(dir, `bulk-${i}.json`);
      writeFileSync(file, JSON.stringify(chunk), "utf8");
      wrangler(["kv", "bulk", "put", "--binding=CACHE_KV", "--remote", file]);
      console.log(`  wrote ${chunk.length} pairs`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log("Done — sibling sites now serve these from cache with no runtime translate call.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
