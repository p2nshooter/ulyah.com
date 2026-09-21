/**
 * Is the database still where the owner wants it?
 *
 * Owner: "pastikan database di bawah 10gb, sekitar 5gb saja" — and those are
 * the right lines for a PAID plan. This account is on the free one, where a
 * single D1 database stops at 500 MB, so the defaults are the free-plan lines
 * and the paid ones are an override away.
 *
 * That distinction is not pedantry. Measured on 2026-09-21 the database was
 * 0.47 GB and this script reported "9.53 GB below the ceiling" — a green line
 * for a database sitting at 94% of the limit that actually applies to it, with
 * about 30 MB of headroom. The last fill-up happened at 509.95 MB.
 *
 *   TARGET, 400 MB  — where the database is supposed to sit. Crossing it is not
 *                     a failure, it is the moment to decide what moves to R2
 *                     next, while there is still room to work with.
 *   CEILING, 500 MB — Cloudflare's hard limit for one D1 database on the free
 *                     plan. Reaching it is not a slowdown: every write fails,
 *                     including the admin's own two-step verification, which is
 *                     how the last fill-up surfaced — the owner could not log
 *                     in, while the sites looked healthy because reads were
 *                     unaffected.
 *
 * On a paid plan, pass --target-mb=5120 --ceiling-mb=10240 (or set
 * D1_TARGET_MB / D1_CEILING_MB) and the owner's original numbers apply.
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
    // Both in MB. The defaults are the FREE plan's lines, because that is what
    // this account is on and a limit you are not measured against is not a
    // limit. Raise them on a paid plan rather than editing this file.
    targetMb: num(args["target-mb"] ?? process.env.D1_TARGET_MB, 400, 1, 1_048_576),
    ceilingMb: num(args["ceiling-mb"] ?? process.env.D1_CEILING_MB, 500, 1, 1_048_576),
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

/**
 * Read the number in the unit it is actually in. "0.03 GB below the ceiling"
 * is the same fact as "30 MB left" and communicates none of it — and 30 MB is
 * roughly one day of writing.
 */
const gb = (mb: number) => (mb < 1024 ? `${Math.round(mb)} MB` : `${(mb / 1024).toFixed(2)} GB`);

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
