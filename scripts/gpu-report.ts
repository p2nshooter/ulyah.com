/**
 * The latest GPU key check, summarised without secrets (owner, 22–23 Nov 2026: is every GPU key alive, and can it make
 * axto.io's art?). Reads R2 c/gpu_check/latest.json — written by the Worker once a day and whenever an admin presses the
 * button — and prints counts per provider and verdict. Never a key, never a donor's name.
 *   npx tsx scripts/gpu-report.ts        (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, CLOUDFLARE_ACCOUNT_ID, R2_BUCKET)
 */
import { R2S3 } from "./lib/r2-s3.ts";

interface Row { provider: string; alive: boolean; status: string; forAxto?: { usable: boolean }; render?: { tried: boolean; ok: boolean } | null }
interface Report { at: string; checked: number; alive: number; usableForAxto: number; rows: Row[] }

export function summarise(rep: Report): string[] {
  const by = new Map<string, { n: number; alive: number; usable: number; status: Record<string, number> }>();
  for (const r of rep.rows ?? []) {
    const b = by.get(r.provider) ?? { n: 0, alive: 0, usable: 0, status: {} };
    b.n++;
    if (r.alive) b.alive++;
    if (r.forAxto?.usable) b.usable++;
    b.status[r.status] = (b.status[r.status] ?? 0) + 1;
    by.set(r.provider, b);
  }
  const out = [`Cek GPU ${rep.at}: ${rep.checked} kunci, ${rep.alive} hidup, ${rep.usableForAxto} bisa untuk animasi axto.io`];
  for (const [p, b] of [...by].sort(([a], [c]) => a.localeCompare(c))) {
    out.push(`- ${p}: ${b.n} kunci · ${b.alive} hidup · ${b.usable} bisa render · ${Object.entries(b.status).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  }
  const tried = (rep.rows ?? []).filter((r) => r.render?.tried);
  if (tried.length) out.push(`Uji render: ${tried.filter((r) => r.render!.ok).length}/${tried.length} berhasil`);
  return out;
}

async function main(): Promise<void> {
  const r2 = R2S3.fromEnv();
  if (!r2) {
    console.error("R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / CLOUDFLARE_ACCOUNT_ID wajib.");
    process.exit(1);
  }
  const got = await r2.getJson<Report>("c/gpu_check/latest.json");
  console.log(got ? summarise(got.value).join("\n") : "Belum ada laporan cek GPU.");
}

if (process.argv[1] && /(^|[\\/])gpu-report\.ts$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
