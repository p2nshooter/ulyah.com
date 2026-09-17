/**
 * Is the database still where the owner wants it?
 *
 * Owner: "pastikan database di bawah 10gb, sekitar 5gb saja." Two lines, and
 * they mean different things:
 *
 *   TARGET, 5 GB   — where the database is supposed to sit. Crossing it is not
 *                    a failure, it is the moment to decide what moves to R2
 *                    next, while there is still half the file to work with.
 *   CEILING, 10 GB — Cloudflare's hard limit for one D1 database on a paid plan
 *                    (the free plan stops at 500 MB). Reaching it is not a
 *                    slowdown: every write fails, including the admin's own
 *                    two-step verification, which is how the last fill-up
 *                    surfaced — the owner could not log in, while the sites
 *                    looked healthy because reads were unaffected.
 *
 * So: under target, one line and exit 0. Over target, a GitHub warning
 * annotation and exit 0 — there is room, but the gap is now somebody's job.
 * Over ceiling, exit 1 so the run goes red, because a silent green run is
 * exactly how a full database gets discovered by a locked-out login instead of
 * by a workflow.
 *
 * It measures the WHOLE FILE (Cloudflare's own `file_size`), not the live rows.
 * SQLite does not return freed pages to the file and D1 offers no VACUUM, so the
 * file never shrinks after a prune — which is fine, since freed pages are reused
 * by later writes, but it does mean the file size is the number that must stay
 * under the limit, and the only number worth checking here.
 *
 * Usage: npx tsx scripts/d1-ceiling.ts [--target-mb=5120] [--ceiling-mb=10240]
 *   Requires CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN and D1_DATABASE_ID —
 *   the same three the maintenance workflow already resolves.
 */

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  const num = (v: unknown, d: number, lo: number, hi: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= lo && n <= hi ? n : d;
  };
  return {
    // Both in MB, so either can be dialled down (500 on the free plan) without
    // the script having to know which plan it is running against.
    targetMb: num(args["target-mb"] ?? process.env.D1_TARGET_MB, 5120, 1, 1_048_576),
    ceilingMb: num(args["ceiling-mb"] ?? process.env.D1_CEILING_MB, 10240, 1, 1_048_576),
  };
}

async function fileSizeMb(): Promise<number | null> {
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const dbId = process.env.D1_DATABASE_ID;
  if (!acct || !token || !dbId) return null;
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/d1/database/${dbId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { result?: { file_size?: number } };
  const bytes = j.result?.file_size;
  return typeof bytes === "number" ? Math.round((bytes / 1048576) * 10) / 10 : null;
}

const gb = (mb: number) => `${(mb / 1024).toFixed(2)} GB`;

async function main() {
  const { targetMb, ceilingMb } = parseArgs();
  const sizeMb = await fileSizeMb();

  if (sizeMb === null) {
    // Not a failure: a fork, or a run without the secrets. Say so plainly
    // rather than reporting a size nobody measured.
    console.log("D1 size not available (missing CLOUDFLARE_* / D1_DATABASE_ID) — size not checked.");
    return;
  }

  const line =
    `D1 ulyah-db: ${gb(sizeMb)} — target ${gb(targetMb)}, ceiling ${gb(ceilingMb)}, ` +
    `${gb(Math.max(0, ceilingMb - sizeMb))} below the ceiling.`;

  if (sizeMb >= ceilingMb) {
    console.log(`::error::${line} Over the CEILING — writes are at risk. Prune or spill to R2 now.`);
    process.exit(1);
  }
  if (sizeMb >= targetMb) {
    console.log(
      `::warning::${line} Over the ${gb(targetMb)} target — ` +
        `${gb(sizeMb - targetMb)} to move to R2 before it becomes urgent.`
    );
    return;
  }
  console.log(line);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
