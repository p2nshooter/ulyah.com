/**
 * Delete machine translations that were made FROM Arabic.
 *
 * Two problems, one delete.
 *
 * THE CONTENT PROBLEM, which is the reason this exists at all. Arabic
 * religious prose has a fixed idiom that machine translation does not know,
 * and the cache filled up with the results. Real rows from `mt:ar-id`:
 *
 *   عن أبي ذر الغفاري      → "Atas wewenang Abu Dzar al-Ghifari"
 *   أم القرآن              → "Bunda Al-Qur'an"
 *   صلى الله عليه وسلم     → "semoga Allah sholawat dan saw"
 *
 * "عن" in a sanad means "dari" — who narrated from whom. Rendered as "atas
 * wewenang" it says the hadith was transmitted "by the authority of", which is
 * not what the chain says. "أم القرآن" is Al-Fatihah; "Bunda Al-Qur'an" is not
 * a name any Muslim reader would recognise. Owner: "alquran jgn d terjemahin
 * sembarangan, krn alquran udah punya tafsirnya sendiri" — and hadits matn
 * sits under the same rule, because it is scripture too.
 *
 * These are not translations that need improving. They are wrong, and a wrong
 * translation of a hadith is worse than no translation: the reader cannot tell
 * that it is wrong. The curated columns (`hadits.text_id`, `hadits.text_en`)
 * are real, sourced translations, and the code already falls back to them
 * whenever the cache misses — so deleting these rows does not empty a page, it
 * restores the sourced text.
 *
 * THE SPACE PROBLEM, which is why it is urgent. D1 is capped at 500 MB on the
 * free plan and ulyah-db reached it, so every write fails — including the
 * admin's own two-step verification, which is how this surfaced: the owner
 * could not log in. Arabic-sourced rows are 69% of mt_cache. Removing them is
 * both the correctness fix and the largest block of space available without
 * touching a single piece of content anyone wrote.
 *
 * BOUNDED ON PURPOSE. The free plan allows 100,000 row writes a day and a
 * delete is a write, so the run stops at --budget and reports what is left.
 * Spending the whole allowance here would leave none for the deploy's own
 * migration, which is the thing this is trying to unblock.
 *
 * Usage: npx tsx scripts/prune-mt-arabic.ts [--budget=60000] [--chunk=5000] [--dry]
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");

/** Every cache key whose SOURCE language is Arabic: `mt:ar-<tgt>:<hash>`. */
const ARABIC_SOURCED = "mt:ar-__:%";

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
    // 60k of the 100k daily allowance. The rest is left for the deploy's
    // migration and for whatever the sites write while this runs.
    budget: int(args.budget, 60000, 1, 100000),
    // Big enough to be worth a round trip, small enough to stay well inside
    // D1's statement timeout.
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

/** How much Arabic-sourced machine output is still in D1. */
function remaining(): { rows: number; mb: number } {
  const r = d1Json<{ rows: number; mb: number | null }>(
    `SELECT COUNT(*) AS rows, ROUND(COALESCE(SUM(LENGTH(k)+LENGTH(v)),0)/1048576.0,1) AS mb
       FROM mt_cache WHERE k LIKE '${ARABIC_SOURCED}';`
  )[0];
  return { rows: Number(r?.rows ?? 0), mb: Number(r?.mb ?? 0) };
}

/** The whole-file figure, so the headroom against the 500 MB cap is visible. */
async function fileSizeMb(): Promise<number | null> {
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const dbId = process.env.D1_DATABASE_ID;
  if (!acct || !token || !dbId) return null;
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/d1/database/${dbId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { result?: { file_size?: number } };
    const bytes = j.result?.file_size;
    return typeof bytes === "number" ? Math.round((bytes / 1048576) * 10) / 10 : null;
  } catch {
    return null;
  }
}

async function main() {
  const { dry, budget, chunk } = parseArgs();

  const before = remaining();
  const fileBefore = await fileSizeMb();
  console.log(
    `Arabic-sourced machine translations in D1: ${before.rows} row(s), ${before.mb} MB.` +
      (fileBefore === null ? "" : ` Database file: ${fileBefore} MB (cap 500 MB).`)
  );
  if (before.rows === 0) {
    console.log("Nothing to prune. The hadits reader is on its curated translations.");
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
    // Delete by key through a bounded subquery: D1 is not built with
    // SQLITE_ENABLE_UPDATE_DELETE_LIMIT, so `DELETE ... LIMIT` is a syntax
    // error and the bound has to live in the SELECT.
    wrangler([
      "d1",
      "execute",
      "ulyah-db",
      "--remote",
      `--command=DELETE FROM mt_cache WHERE k IN (SELECT k FROM mt_cache WHERE k LIKE '${ARABIC_SOURCED}' LIMIT ${take});`,
    ]);
    const left = remaining();
    const freedRows = before.rows - left.rows - deleted;
    deleted += Math.max(0, freedRows);
    console.log(`  pass ${pass}: ${left.rows} row(s) left, ${left.mb} MB`);
    // Nothing went: another writer holds them, or the pattern no longer
    // matches. Either way a second identical pass will not do better.
    if (freedRows <= 0) {
      console.error("  a pass deleted nothing; stopping rather than looping.");
      break;
    }
    if (left.rows === 0) break;
  }

  const after = remaining();
  const fileAfter = await fileSizeMb();
  console.log(
    `Deleted ${deleted} row(s) in ${pass} pass(es). ${after.rows} left (${after.mb} MB).` +
      (fileAfter === null ? "" : ` Database file: ${fileAfter} MB.`) +
      (after.rows > 0 ? ` Run again tomorrow — the free plan allows 100,000 row writes a day.` : "")
  );
}

await main();
