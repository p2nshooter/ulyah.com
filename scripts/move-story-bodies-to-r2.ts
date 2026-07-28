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
 * Usage: npx tsx scripts/move-story-bodies-to-r2.ts [--limit=200] [--minutes=45] [--concurrency=6] [--dry]
 */
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { storyBodyKey } from "../apps/worker-api/src/lib/story-body.js";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const BUCKET = "ulyah-media";

/**
 * Call the installed wrangler directly rather than through `npx`.
 *
 * `npx` is not safe to run several times at once: each invocation touches the
 * same npm cache and _npx directory, and concurrent ones race there. One call
 * at a time never noticed. Six did — the first concurrent run died inside a
 * minute. Resolving the binary once removes the shared resource entirely, and
 * as a side effect drops npx's own start-up from every single call.
 *
 * Falls back to `npx wrangler` when the binary is not where it should be, so
 * this cannot become a new way for the script to fail.
 */
const LOCAL_WRANGLER = join(WORKER_CWD, "node_modules", ".bin", "wrangler");
const [WRANGLER_CMD, WRANGLER_PREFIX] = existsSync(LOCAL_WRANGLER)
  ? [LOCAL_WRANGLER, [] as string[]]
  : ["npx", ["wrangler"]];

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
    // How many bodies are in flight at once. Six is deliberate rather than
    // maximal: each one is two Cloudflare API calls, and the account limit is
    // a few requests a second, so pushing higher trades throughput for 429s
    // that would show up here as failed uploads. A body that fails simply
    // keeps its text in D1 and is retried next run, so the cost of being too
    // eager is wasted time, not lost content — but wasted time is the thing
    // this change exists to remove.
    concurrency: Math.min(12, num(args.concurrency, 6)),
  };
}

function wrangler(args: string[], capture = false): string {
  const out = execFileSync(WRANGLER_CMD, [...WRANGLER_PREFIX, ...args], {
    cwd: WORKER_CWD,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    maxBuffer: 128 * 1024 * 1024,
  });
  return out ?? "";
}

/**
 * The same call, awaited rather than blocking.
 *
 * The first full run managed 721 bodies in sixty minutes — five seconds each —
 * and almost none of that was network. Every body spawned `npx wrangler` three
 * times, and process start-up dominates: the uploads themselves are tens of
 * kilobytes. Overlapping the round trips is what makes the difference, and it
 * is safe to overlap because bodies are independent — different R2 key,
 * different row, no shared state.
 */
const execFileAsync = promisify(execFile);
async function wranglerAsync(args: string[]): Promise<void> {
  await execFileAsync(WRANGLER_CMD, [...WRANGLER_PREFIX, ...args], {
    cwd: WORKER_CWD,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
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
  const { dry, limit, minutes, concurrency } = parseArgs();
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
  /**
   * One body, all the way through, or null if any step did not prove itself.
   *
   * The ORDER inside here is the whole safety of the script and is unchanged
   * by making it concurrent: upload, read back, compare, and only then report
   * the row as safe to clear. What runs in parallel is whole bodies, never the
   * steps within one.
   */
  async function upload(row: { id: number; slug: string; body: string }): Promise<typeof row | null> {
    const id = Number(row.id);
    const key = keyFor(id);
    const file = join(dir, `${id}.md`);
    writeFileSync(file, row.body, "utf8");

    if (dry) {
      console.log(`  --dry: ${row.slug} → ${key} (${(row.body.length / 1024).toFixed(0)} KB)`);
      return row;
    }

    try {
      await wranglerAsync(["r2", "object", "put", `${BUCKET}/${key}`, `--file=${file}`, "--remote"]);
    } catch (e) {
      console.error(`  PUT failed for ${row.slug} (${key}) — body left in D1:`, e instanceof Error ? e.message : e);
      return null;
    }

    // Read it back before clearing anything. An upload that did not land,
    // or landed truncated, must not cost the story its text.
    const back = join(dir, `${id}.check.md`);
    try {
      await wranglerAsync(["r2", "object", "get", `${BUCKET}/${key}`, `--file=${back}`, "--remote"]);
    } catch (e) {
      console.error(`  GET-back failed for ${row.slug} — body left in D1:`, e instanceof Error ? e.message : e);
      return null;
    }
    const roundTripped = readFileSync(back, "utf8");
    if (roundTripped !== row.body) {
      console.error(
        `  MISMATCH for ${row.slug}: R2 has ${roundTripped.length} chars, D1 has ${row.body.length}. ` +
          `Body left in D1.`
      );
      return null;
    }

    // Both values are re-checked rather than trusted on their way into SQL.
    // They come from our own database and our own key function, so this looks
    // redundant — but `row.id` arrives through JSON.parse of the wrangler
    // output, which is a string boundary, and an id that was not a number
    // would end up spliced into an UPDATE. The cost of proving it is one
    // comparison; the cost of being wrong is an UPDATE with no WHERE.
    if (!Number.isInteger(id) || id <= 0) {
      console.error(`  refusing to update a non-integer story id: ${JSON.stringify(row.id)}`);
      return null;
    }
    if (!/^stories\/body\/\d+\.md$/.test(key)) {
      console.error(`  refusing to store an unexpected R2 key: ${JSON.stringify(key)}`);
      return null;
    }
    return row;
  }

  try {
    for (let i = 0; i < pending.length; i += concurrency) {
      // Checked between groups, never inside one: a body is only safe to clear
      // from D1 after its upload has been read back and compared, so stopping
      // halfway through that sequence is the one thing that could lose text.
      if (Date.now() > deadline) {
        console.log(
          `  time budget of ${minutes} min reached — stopping cleanly with ${moved} moved. ` +
            `The remaining bodies are untouched; run again to continue.`
        );
        break;
      }
      const group = pending.slice(i, i + concurrency);
      // Nothing a single group does may end the run. Every failure inside
      // upload() already leaves that body in D1 for the next pass, so the only
      // thing an exception here could add is stopping the other 1,100 bodies
      // from being tried — which is exactly what happened when the first
      // concurrent run threw and exited: 39 seconds, zero moved, no report.
      const settled = await Promise.all(group.map((r) => upload(r).catch((e) => {
        console.error(`  ${r.slug} failed unexpectedly — body left in D1:`, e instanceof Error ? e.message : e);
        return null;
      })));
      const verified = settled.filter((r): r is (typeof group)[number] => r !== null);
      failed += group.length - verified.length;
      if (verified.length === 0) continue;

      if (!dry) {
        // Now — and only now — the column may be cleared, for exactly the rows
        // that proved themselves above. Clearing to '' rather than NULL because
        // the column is NOT NULL and the reader treats empty as "look in R2".
        //
        // One statement per group rather than per body: this used to be a third
        // `npx wrangler` spawn for every single story, and start-up cost, not
        // the database, was most of the time it took.
        const stmt = (r: { id: number }) =>
          `UPDATE stories SET body_r2_key = '${esc(keyFor(Number(r.id)))}', body = '' WHERE id = ${Number(r.id)};`;
        try {
          wrangler(["d1", "execute", "ulyah-db", "--remote", `--command=${verified.map(stmt).join(" ")}`], true);
        } catch (e) {
          // The batch is an optimisation, not a requirement. If D1 refuses the
          // multi-statement form, fall back to what worked before rather than
          // abandoning bodies that are already verified in R2 — they would
          // otherwise be re-uploaded from scratch on the next run.
          console.error("  batched update refused; falling back to one statement per body:", e instanceof Error ? e.message : e);
          for (const r of verified) {
            try {
              wrangler(["d1", "execute", "ulyah-db", "--remote", `--command=${stmt(r)}`], true);
            } catch (e2) {
              console.error(`  update failed for id ${r.id} — body left in D1:`, e2 instanceof Error ? e2.message : e2);
              failed++;
            }
          }
        }
      }
      moved += verified.length;
      freed += verified.reduce((n, r) => n + r.body.length, 0);
      console.log(`  … ${moved} moved, ${(freed / 1048576).toFixed(1)} MB freed`);
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
