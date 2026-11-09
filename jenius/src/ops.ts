/**
 * Pekerjaan berkala jenius.es tanpa cron Cloudflare (9 Nov 2026): akun ini memakai paket Workers gratis dan batas
 * 5 cron per akun sudah terpakai oleh situs lain, sehingga cron jenius ditolak saat deploy. Pekerjaan yang sama —
 * satu langkah impor buku terbuka, ringkasan jalur, dan cadangan harian — dijalankan lewat dua jalan:
 *  1. workflow `.github/workflows/jenius-ops.yml` memanggil POST /api/ops/tick dengan kunci sekali pakai; hanya hash
 *     SHA-256 kunci itu yang ditulis ke R2 (`k/ops.json`, berlaku 6 jam);
 *  2. kunjungan halaman memicu satu langkah di latar, paling sering sekali per menit (klaim CAS pada `k/tick.json`).
 * Bila akun kelak memakai Workers Paid, cron bisa dipasang lagi di wrangler.jsonc — `scheduled` tetap ada.
 */
import type { Env } from './env.ts';
import { Store } from './lib/store.ts';
import { sha256Hex, timingSafeEqual } from './lib/crypto.ts';
import { runImport, type ImportResult } from './catalog/importer.ts';
import { allSources, sourceId } from './catalog/sources.ts';
import { runBackup } from './backup.ts';

export interface TickResult {
  import: ImportResult;
  summary: boolean;
  backup?: { ok: boolean; copied: number; error?: string };
}

/** Satu langkah kerja berkala. `refresh` dipanggil bila ada buku yang berubah atau ringkasan belum ada. */
export async function tick(env: Env, refresh: (store: Store) => Promise<unknown>, opts: { budgetMs?: number; now?: number } = {}): Promise<TickResult> {
  const store = new Store(env.DATA);
  const now = opts.now ?? Date.now();
  const only = env.IMPORT_ONLY ? new Set(env.IMPORT_ONLY.split(',').map((s) => s.trim())) : null;
  const sources = only ? allSources().filter((s) => only.has(sourceId(s))) : undefined;
  const r = await runImport(env, { budgetMs: opts.budgetMs ?? 20_000, sources, now });
  let summary = false;
  if (r.worked || !(await store.get('k/lanes.json'))) {
    await refresh(store);
    summary = true;
  }
  const out: TickResult = { import: r, summary };
  // Cadangan harian: bila yang terakhir lebih dari 20 jam lalu.
  const last = (await store.get<{ at?: number }>('k/backup-state.json'))?.at ?? 0;
  if (env.BACKUPS && now - last > 20 * 3600_000) out.backup = await runBackup(env, now);
  return out;
}

/** Kunci dari workflow: cocok dengan hash di R2 yang ditulis paling lama 6 jam lalu. */
export async function opsKeyValid(env: Env, key: string, now = Date.now()): Promise<boolean> {
  if (!key || key.length < 32) return false;
  const doc = await new Store(env.DATA).get<{ hash?: string; at?: number }>('k/ops.json');
  if (!doc?.hash || !doc.at || now - doc.at > 6 * 3600_000 || doc.at > now + 300_000) return false;
  return timingSafeEqual(await sha256Hex(key), doc.hash);
}

let lastLocal = 0;
/** Dipanggil dari permintaan halaman: paling sering sekali per menit di seluruh situs (klaim CAS), tanpa memperlambat halaman. */
export async function lazyTick(env: Env, refresh: (store: Store) => Promise<unknown>, now = Date.now()): Promise<TickResult | null> {
  if (now - lastLocal < 60_000) return null;
  lastLocal = now;
  const store = new Store(env.DATA);
  let won = false;
  await store.cas<{ at: number }>('k/tick.json', (cur) => {
    if (cur && now - cur.at < 60_000) return null;
    won = true;
    return { at: now };
  }, 'Tick');
  if (!won) return null;
  return tick(env, refresh, { budgetMs: 15_000, now });
}
