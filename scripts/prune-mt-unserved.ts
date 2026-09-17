/**
 * Delete machine translations into languages the ecosystem no longer serves.
 *
 * WHY THESE ROWS EXIST. ulyah.com used to offer 28 languages, translated in
 * place by machine and cached in D1. Warming those languages was, by the warm
 * job's own description, "the largest writer in the ecosystem": every UI string,
 * every kisah paragraph, every hadith line, times twenty-four languages nobody
 * had finished reviewing.
 *
 * WHY THEY MUST GO. The owner switched that off — "stop auto translate di
 * ulyah.com, cukup ulyah.com menggunakan bahasa Indonesia dan ekosistem situs yg
 * lain menggunakan bahasa extensi situsnya masing-masing." Nothing reads these
 * rows any more: the gate in apps/worker-api/src/lib/mt.ts refuses every target
 * outside the four sibling sites, on the read path as well as the write path. So
 * they are not a cache — they are dead weight sitting in the one place the whole
 * platform cannot afford to run out of.
 *
 * WHICH ROWS SURVIVE. A key is `mt:<src>-<tgt>:<hash>`, so the target language
 * is two characters at a fixed offset. Everything whose target is one of the
 * four ecosystem languages (en/de/es/fr — MT_TARGET_LANGS, derived from the
 * sites that actually exist) stays: 1fr.fr, tilawa.de, dawa.es and xad.es read
 * those on every page.
 *
 * BOUNDED ON PURPOSE, exactly like prune-mt-arabic.ts: a delete is a row write,
 * the free plan allows 100,000 a day, and spending the whole allowance here
 * would leave none for the deploy's own migration or for what the sites write
 * while this runs. The run stops at --budget and reports what is left; the
 * nightly schedule drains the rest.
 *
 * Usage: npx tsx scripts/prune-mt-unserved.ts [--budget=60000] [--chunk=5000] [--dry]
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { MT_TARGET_LANGS } from "../packages/shared/src/i18n";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");

/**
 * `mt:` (3 chars) + source (2) + `-` (1) + target (2) + `:`, so SQLite's
 * 1-based substr puts the target at position 7. The LIKE keeps the rule to rows
 * that really carry that shape, so a future key format is left alone rather than
 * deleted by a coincidence of offsets.
 */
const KEPT = MT_TARGET_LANGS.map((l) => `'${l}'`).join(",");
const UNSERVED = `k LIKE 'mt:__-__:%' AND substr(k, 7, 2) NOT IN (${KEPT})`;

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  const int = (v: unknown, d: number, lo: number, hi: number) => {
    const n = Math.trunc(Number(v));
    return Number.isFinite(n) && n >= lo && n <= hi ? n : d;
  };
  return {
    dry: args.dry === "true",
    budget: int(args.budget, 60000, 1, 100000),
    chunk: int(args.chunk, 5000, 100, 10000),
  };
}

function wrangler(args: string[], capture = false): string {
  return (
    execFileSync("npx", ["wrangler", ...args], {
      cwd: WORKER_CWD,
      encoding: "utf8",
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
      maxBuffer: 64 * 1024 * 1024,
    }) ?? ""
  );
}

function d1Json<T>(sql: string): T[] {
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], true);
  try {
    const parsed = JSON.parse(out);
    return ((Array.isArray(parsed) ? parsed[0]?.results : parsed?.results) ?? []) as T[];
  } catch {
    return [];
  }
}

/** How much translation into unserved languages is still in D1. */
function remaining(): { rows: number; mb: number } {
  const r = d1Json<{ rows: number; mb: number | null }>(
    `SELECT COUNT(*) AS rows, ROUND(COALESCE(SUM(LENGTH(k)+LENGTH(v)),0)/1048576.0,1) AS mb
       FROM mt_cache WHERE ${UNSERVED};`
  )[0];
  return { rows: Number(r?.rows ?? 0), mb: Number(r?.mb ?? 0) };
}

/** The per-language breakdown, so a run says WHAT it is removing, not just how much. */
function byLanguage(): { lang: string; rows: number; mb: number }[] {
  return d1Json<{ lang: string; rows: number; mb: number | null }>(
    `SELECT substr(k, 7, 2) AS lang, COUNT(*) AS rows,
            ROUND(COALESCE(SUM(LENGTH(k)+LENGTH(v)),0)/1048576.0,1) AS mb
       FROM mt_cache WHERE ${UNSERVED}
      GROUP BY lang ORDER BY rows DESC LIMIT 12;`
  ).map((r) => ({ lang: String(r.lang), rows: Number(r.rows ?? 0), mb: Number(r.mb ?? 0) }));
}

function main() {
  const { dry, budget, chunk } = parseArgs();

  const before = remaining();
  console.log(`Serving translations into: ${MT_TARGET_LANGS.join(", ")} (the four ecosystem sites).`);
  console.log(`Machine translation into every OTHER language, still in D1: ${before.rows} row(s), ${before.mb} MB.`);
  for (const r of byLanguage()) console.log(`    →${r.lang}: ${r.rows} row(s), ${r.mb} MB`);

  if (before.rows === 0) {
    console.log("Nothing to prune — mt_cache holds only the languages the ecosystem serves.");
    return;
  }
  if (dry) {
    console.log(`--dry: would delete up to ${Math.min(budget, before.rows)} row(s) in chunks of ${chunk}.`);
    return;
  }

  let deleted = 0;
  let pass = 0;
  while (deleted < budget) {
    const take = Math.min(chunk, budget - deleted);
    pass++;
    // Bounded through a subquery: D1 is not built with
    // SQLITE_ENABLE_UPDATE_DELETE_LIMIT, so `DELETE … LIMIT` is a syntax error.
    wrangler([
      "d1",
      "execute",
      "ulyah-db",
      "--remote",
      `--command=DELETE FROM mt_cache WHERE k IN (SELECT k FROM mt_cache WHERE ${UNSERVED} LIMIT ${take});`,
    ]);
    const left = remaining();
    const freedRows = before.rows - left.rows - deleted;
    deleted += Math.max(0, freedRows);
    console.log(`  pass ${pass}: ${left.rows} row(s) left, ${left.mb} MB`);
    // Nothing went: another writer holds them, or the predicate no longer
    // matches. A second identical pass will not do better.
    if (freedRows <= 0) {
      console.error("  a pass deleted nothing; stopping rather than looping.");
      break;
    }
    if (left.rows === 0) break;
  }

  const after = remaining();
  console.log(
    `Deleted ${deleted} row(s) in ${pass} pass(es). ${after.rows} left (${after.mb} MB).` +
      (after.rows > 0 ? " Run again tomorrow — the free plan allows 100,000 row writes a day." : "")
  );
}

// tsx compiles these scripts to CommonJS (the workspace root is not
// "type": "module"), and CommonJS has no top-level await, so the entry point is
// a plain call with a .catch() — see the same note in prune-mt-arabic.ts.
try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
