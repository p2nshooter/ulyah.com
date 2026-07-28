/**
 * Keep D1 roomy: spill bulk text to R2 whenever too much of it piles up.
 *
 * Owner: "D1 di jadiin write awal, klo penuh pindahin ke R2, dan ngebacanya
 * dari R2, begitu seterusnya, jd D1 selalu luas."
 *
 * So D1 is the desk and R2 is the shelf. New content is written to D1, where
 * it is queryable and transactional; when the desk gets crowded the biggest
 * things on it go to the shelf, and reads follow the key. Run often enough,
 * the desk never fills — which matters because a full D1 does not degrade, it
 * stops: every write fails, including the admin's own login.
 *
 * WHY THIS MEASURES LIVE DATA AND NOT file_size
 *
 * The obvious loop — "spill until the database is smaller" — does not
 * terminate. SQLite does not return freed pages to the file, and D1 offers no
 * VACUUM, so file_size stays where it is no matter how much is moved out; the
 * freed pages are simply reused by later writes. A loop watching file_size
 * would spill every story in the ecosystem and still think it had made no
 * progress.
 *
 * What IS monotonic is the bulk still sitting in D1 — SUM(LENGTH(body)) over
 * the rows not yet moved. That is what the watermark is measured against, and
 * file_size is reported alongside it only so the headroom is visible.
 *
 * Hysteresis on purpose: spill starts at HIGH and continues to LOW, rather
 * than trimming to a single line. Spilling one story every run to sit exactly
 * at a threshold would mean an R2 round trip on every scheduled pass forever.
 *
 * Usage: npx tsx scripts/d1-watermark.ts [--high=40] [--low=15] [--batch=100] [--dry]
 *   --high  MB of story bodies in D1 that triggers a spill
 *   --low   MB to spill down to once triggered
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  const num = (v: unknown, d: number) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : d);
  return {
    dry: args.dry === "true",
    // Defaults chosen against the real numbers: stories held 84.9 MB when the
    // database stopped accepting writes. Spilling down to 15 MB leaves recent
    // work on the desk — where an edit is cheap — and puts the long tail on
    // the shelf.
    high: num(args.high, 40),
    low: num(args.low, 15),
    batch: num(args.batch, 100),
  };
}

function wrangler(args: string[], capture = false): string {
  return (
    execFileSync("npx", ["wrangler", ...args], {
      cwd: WORKER_CWD,
      encoding: "utf8",
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
      maxBuffer: 128 * 1024 * 1024,
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

/** Bulk text still held in D1, in MB. The number the watermark is about. */
function bulkInD1(): { mb: number; rows: number } {
  const r = d1Json<{ mb: number | null; rows: number }>(
    `SELECT ROUND(COALESCE(SUM(LENGTH(body)),0)/1048576.0,2) AS mb, COUNT(*) AS rows
       FROM stories WHERE body_r2_key IS NULL AND body IS NOT NULL AND body <> '';`
  )[0];
  return { mb: Number(r?.mb ?? 0), rows: Number(r?.rows ?? 0) };
}

/** The whole-file figure, for the log only — see the note above on why it is
 *  not the thing being controlled. */
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
  const { dry, high, low, batch } = parseArgs();
  if (low > high) {
    console.error(`--low (${low}) must not exceed --high (${high}).`);
    process.exit(1);
  }

  const file = await fileSizeMb();
  let bulk = bulkInD1();
  console.log(
    `Story bodies still in D1: ${bulk.mb} MB across ${bulk.rows} row(s).` +
      (file === null ? "" : ` Whole database file: ${file} MB (of Cloudflare's 500 MB cap).`)
  );

  if (bulk.mb <= high) {
    console.log(`Under the ${high} MB high-water mark — nothing to spill. D1 has room.`);
    return;
  }
  console.log(`Above the ${high} MB high-water mark. Spilling to R2 until under ${low} MB.`);
  if (dry) {
    console.log(`--dry: would spill roughly ${(bulk.mb - low).toFixed(1)} MB.`);
    return;
  }

  // Each pass takes the largest bodies first, so the fewest R2 round trips buy
  // the most room. The loop re-measures rather than trusting an estimate: a
  // body whose read-back check failed is still in D1 and must not be counted
  // as freed.
  let passes = 0;
  while (bulk.mb > low && bulk.rows > 0) {
    passes++;
    // The batch size is argv-derived, so it is reduced to an integer here, at
    // the point it becomes part of a command line, rather than trusted from
    // parseArgs two functions away. Same reasoning as the mover's SQL guards:
    // the proof belongs where the string is built.
    const safeBatch = Math.max(1, Math.min(1000, Math.trunc(Number(batch) || 0) || 100));
    execFileSync("npx", ["tsx", "scripts/move-story-bodies-to-r2.ts", `--limit=${safeBatch}`], {
      cwd: join(import.meta.dirname, ".."),
      stdio: "inherit",
    });
    const before = bulk;
    bulk = bulkInD1();
    console.log(`  pass ${passes}: ${before.mb} MB → ${bulk.mb} MB`);
    // A pass that freed nothing will not free anything next time either —
    // every remaining body is failing its read-back check. Stop rather than
    // spin against R2.
    if (bulk.mb >= before.mb) {
      console.error("  a pass freed nothing; stopping rather than looping. Check the mover's output above.");
      break;
    }
  }

  const after = await fileSizeMb();
  console.log(
    `Done in ${passes} pass(es). ${bulk.mb} MB of bodies left in D1 across ${bulk.rows} row(s).` +
      (after === null ? "" : ` File is ${after} MB — it does not shrink, but its freed pages are reused, ` +
        `which is what lets writes work again.`)
  );
}

// tsx compiles these scripts to CommonJS (the workspace root is not
// "type": "module"), and CommonJS has no top-level await — `await main()` dies
// at transform time with "Top-level await is currently not supported", before
// a single line runs. It failed exactly that way in D1 Maintenance run
// 30382603040, so the entry point is a .catch() instead.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
