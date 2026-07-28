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
 * Usage: npx tsx scripts/move-story-bodies-to-r2.ts [--limit=200] [--minutes=45] [--dry]
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
  const num = (v: unknown, d: number) =>
    Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d;
  return {
    dry: args.dry === "true",
    // Kept modest by default: every body is a separate R2 round trip, and a
    // run that is interrupted has still banked everything it finished.
    limit: num(args.limit, 200),
    // A wall-clock budget, because --limit alone cannot express the real
    // constraint. Each body is a PUT, a GET-back and a D1 UPDATE — a few
    // seconds — so 2,300 of them take about two hours, and the workflow job
    // is capped at sixty minutes. The first full run was therefore killed
    // mid-body and reported "cancelled": not a failure anyone would notice,
    // and not a success either. Stopping ourselves a little early turns that
    // into a green run that says how far it got and how much is left, which
    // is the difference between a resumable job and one that silently stalls.
    minutes: num(args.minutes, 45),
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
  const { dry, limit, minutes } = parseArgs();
  const deadline = Date.now() + minutes * 60_000;

  const pending = d1Json<{ id: number; slug: string; body: string }>(
    `SELECT id, slug, body FROM stories
      WHERE body_r2_key IS NULL AND body IS NOT NULL AND body <> ''
      ORDER BY LENGTH(body) DESC LIMIT ${Number(limit) | 0};`
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
      // Checked between bodies, never during one: a body is only safe to clear
      // from D1 after its upload has been read back and compared, so stopping
      // halfway through that sequence is the one thing that could lose text.
      if (Date.now() > deadline) {
        console.log(
          `  time budget of ${minutes} min reached — stopping cleanly with ${moved} moved. ` +
            `The remaining bodies are untouched; run again to continue.`
        );
        break;
      }
      const id = Number(row.id);
      const key = keyFor(id);
      const file = join(dir, `${id}.md`);
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
      const back = join(dir, `${id}.check.md`);
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
      //
      // Both values are re-checked rather than trusted on their way into SQL.
      // They come from our own database and our own key function, so this
      // looks redundant — but `row.id` arrives through JSON.parse of the
      // wrangler output, which is a string boundary, and an id that was not a
      // number would end up spliced into an UPDATE. The cost of proving it is
      // one comparison; the cost of being wrong is an UPDATE with no WHERE.
      if (!Number.isInteger(id) || id <= 0) {
        console.error(`  refusing to update a non-integer story id: ${JSON.stringify(row.id)}`);
        failed++;
        continue;
      }
      if (!/^stories\/body\/\d+\.md$/.test(key)) {
        console.error(`  refusing to store an unexpected R2 key: ${JSON.stringify(key)}`);
        failed++;
        continue;
      }
      wrangler([
        "d1",
        "execute",
        "ulyah-db",
        "--remote",
        `--command=UPDATE stories SET body_r2_key = '${esc(key)}', body = '' WHERE id = ${id};`,
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

// tsx compiles these scripts to CommonJS (the workspace root is not
// "type": "module"), and CommonJS has no top-level await — `await main()` dies
// at transform time with "Top-level await is currently not supported", before
// a single line runs. It failed exactly that way in D1 Maintenance run
// 30382603040, so the entry point is a .catch() instead.
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
