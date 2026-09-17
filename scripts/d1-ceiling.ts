/**
 * Is the database still comfortably under its ceiling?
 *
 * Owner: "pastikan database di bawah 10gb." 10 GB is Cloudflare's hard limit for
 * one D1 database on a paid plan (the free plan stops at 500 MB), and a D1 that
 * reaches its limit does not slow down — it stops. Every write fails, including
 * the admin's own two-step verification, which is how the last fill-up surfaced:
 * the owner could not log in, while the sites looked perfectly healthy because
 * reads were unaffected.
 *
 * So the ceiling is measured on every maintenance run and reported out loud,
 * with three bands:
 *
 *   under the warn line   → fine, one line of output, exit 0
 *   over the warn line    → a GitHub warning annotation, exit 0. There is still
 *                           room; this is the point at which somebody should
 *                           decide what to move to R2 next.
 *   over the ceiling      → exit 1, so the run goes red. Not because failing a
 *                           job fixes anything, but because a silent green run
 *                           is exactly how a full database is discovered by a
 *                           locked-out login instead of by a workflow.
 *
 * It measures the WHOLE FILE (Cloudflare's own `file_size`), not the live rows.
 * SQLite does not return freed pages to the file and D1 offers no VACUUM, so the
 * file never shrinks after a prune — which is fine, since freed pages are reused
 * by later writes, but it does mean the file size is the number that must stay
 * under the limit, and the only number worth checking here.
 *
 * Usage: npx tsx scripts/d1-ceiling.ts [--ceiling-mb=10240] [--warn-pct=75]
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
    // 10 GB, expressed in MB so it can be dialled down to 500 on the free plan
    // without the script having to know which plan it is running against.
    ceilingMb: num(args["ceiling-mb"] ?? process.env.D1_CEILING_MB, 10240, 1, 1_048_576),
    warnPct: num(args["warn-pct"], 75, 1, 100),
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
  const { ceilingMb, warnPct } = parseArgs();
  const sizeMb = await fileSizeMb();

  if (sizeMb === null) {
    // Not a failure: a fork, or a run without the secrets. Say so plainly
    // rather than reporting a size nobody measured.
    console.log("D1 size not available (missing CLOUDFLARE_* / D1_DATABASE_ID) — ceiling not checked.");
    return;
  }

  const pct = Math.round((sizeMb / ceilingMb) * 1000) / 10;
  const line = `D1 ulyah-db: ${gb(sizeMb)} of ${gb(ceilingMb)} (${pct}%), ${gb(Math.max(0, ceilingMb - sizeMb))} free.`;

  if (sizeMb >= ceilingMb) {
    console.log(`::error::${line} Over the ceiling — writes are at risk. Prune or spill to R2 now.`);
    process.exit(1);
  }
  if (pct >= warnPct) {
    console.log(`::warning::${line} Past ${warnPct}% — decide what moves to R2 before it becomes urgent.`);
    return;
  }
  console.log(line);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
