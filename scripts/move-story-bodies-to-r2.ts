/**
 * Move story bodies out of D1 and into R2, leaving the key behind.
 *
 * D1 hit Cloudflare's 500 MB per-database ceiling and stopped accepting
 * writes — the owner could not even pass two-step verification, because that
 * writes a session. Reads were fine, so the sites stayed up while nothing
 * could be saved. `stories` held 84.9 MB of it, 37 KB to a row, because these
 * are multi-volume kisah rather than posts.
 *
 * Owner: "yg di penuhin R2, klo D1 mah kunci2 aja".
 *
 * ORDER MATTERS, and it is the whole safety of this script:
 *
 *   1. read the body from D1
 *   2. PUT it to R2
 *   3. GET it back and compare — byte for byte
 *   4. only then clear the column and record the key
 *
 * Step 3 is not paranoia. Clearing a column is irreversible, the text is
 * religious content, and "the upload probably worked" is not good enough to
 * bet a kisah on. A story that fails any step keeps its body in D1 and is
 * simply retried next run; the reader falls back to the column whenever
 * body_r2_key is null, so a half-finished run leaves nothing broken.
 *
 * Idempotent and resumable: it only ever looks at rows where body_r2_key IS
 * NULL, so re-running continues where it stopped.
 *
 * Usage: npx tsx scripts/move-story-bodies-to-r2.ts [--limit=200] [--dry]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { storyBodyKey } from "../apps/worker-api/src/lib/story-body.js";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const BUCKET = "ulyah-media";

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    dry: args.dry === "true",
    // Kept modest by default: every body is a separate R2 round trip, and a
    // run that is interrupted has still banked everything it finished.
    limit: Number.isFinite(Number(args.limit)) && Number(args.limit) > 0 ? Number(args.limit) : 200,
  };
}

function wrangler(args: string[], capture = false): string {
  const out = execFileSync("npx", ["wrangler", ...args], {
    cwd: WORKER_CWD,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    maxBuffer: 128 * 1024 * 1024,
  });
  return out ?? "";
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

// The key is IMPORTED, not re-derived. A private copy here that drifted from
// the Worker's would write bodies under keys the Worker never looks up, and
// every affected story would quietly serve empty — the same silent-drift trap
// the mt_cache key already has a guard for.
const keyFor = storyBodyKey;
const esc = (s: string) => s.replace(/'/g, "''");

async function main() {
  const { dry, limit } = parseArgs();

  const pending = d1Json<{ id: number; slug: string; body: string }>(
    `SELECT id, slug, body FROM stories
      WHERE body_r2_key IS NULL AND body IS NOT NULL AND body <> ''
      ORDER BY LENGTH(body) DESC LIMIT ${limit};`
  );
  if (pending.length === 0) {
    console.log("Nothing left to move — every story body is already in R2.");
    return;
  }
  const totalMb = pending.reduce((n, r) => n + r.body.length, 0) / 1048576;
  console.log(`${pending.length} story body/bodies to move (${totalMb.toFixed(1)} MB). Largest first.`);

  const dir = mkdtempSync(join(tmpdir(), "storybody-"));
  let moved = 0;
  let freed = 0;
  let failed = 0;
  try {
    for (const row of pending) {
      const key = keyFor(row.id);
      const file = join(dir, `${row.id}.md`);
      writeFileSync(file, row.body, "utf8");

      if (dry) {
        console.log(`  --dry: ${row.slug} → ${key} (${(row.body.length / 1024).toFixed(0)} KB)`);
        moved++;
        continue;
      }

      try {
        wrangler(["r2", "object", "put", `${BUCKET}/${key}`, `--file=${file}`, "--remote"], true);
      } catch (e) {
        console.error(`  PUT failed for ${row.slug} (${key}) — body left in D1:`, e instanceof Error ? e.message : e);
        failed++;
        continue;
      }

      // Read it back before clearing anything. An upload that did not land,
      // or landed truncated, must not cost the story its text.
      const back = join(dir, `${row.id}.check.md`);
      try {
        wrangler(["r2", "object", "get", `${BUCKET}/${key}`, `--file=${back}`, "--remote"], true);
      } catch (e) {
        console.error(`  GET-back failed for ${row.slug} — body left in D1:`, e instanceof Error ? e.message : e);
        failed++;
        continue;
      }
      const roundTripped = readFileSync(back, "utf8");
      if (roundTripped !== row.body) {
        console.error(
          `  MISMATCH for ${row.slug}: R2 has ${roundTripped.length} chars, D1 has ${row.body.length}. ` +
            `Body left in D1.`
        );
        failed++;
        continue;
      }

      // Only now is it safe. Clearing to '' rather than NULL because the
      // column is NOT NULL, and the reader treats empty as "look in R2".
      wrangler([
        "d1",
        "execute",
        "ulyah-db",
        "--remote",
        `--command=UPDATE stories SET body_r2_key = '${esc(key)}', body = '' WHERE id = ${row.id};`,
      ], true);
      moved++;
      freed += row.body.length;
      if (moved % 25 === 0) console.log(`  … ${moved} moved, ${(freed / 1048576).toFixed(1)} MB freed`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  console.log(
    `Moved ${moved} body/bodies to R2, freeing ${(freed / 1048576).toFixed(1)} MB in D1. ` +
      (failed > 0 ? `${failed} left in place after a failed check — re-run to retry.` : "None failed.")
  );
  const left = d1Json<{ n: number }>(
    "SELECT COUNT(*) AS n FROM stories WHERE body_r2_key IS NULL AND body IS NOT NULL AND body <> '';"
  );
  console.log(`${left[0]?.n ?? "?"} still to move.`);
}

await main();
