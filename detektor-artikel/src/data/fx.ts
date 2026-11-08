/**
 * Kurs USD/IDR harian otomatis (pemilik, 8 Nov 2026: „pastikan live update setiap hari otomatis mengikuti harga dollar … tp
 * pastiin yg update hanya mata uang jgn update semua“; MASTER-BLUEPRINT §28.4).
 *
 * Satu dokumen kecil `k/fx.json` ditulis sekali sehari oleh cron — hanya angka kurs (tidak menulis ulang pengaturan lain).
 * Harga Rupiah = modal US$ × markup × kurs; harga USD = harga Rupiah ÷ kurs yang sama. Sumber gratis tanpa kunci, dicoba
 * berurutan; nilai di luar 5.000–50.000 atau loncatan > 20 % dari kurs kemarin ditolak (kurs lama tetap dipakai).
 */
import type { Env } from '../env.ts';
import type { Store } from '../lib/store.ts';

export const FX_DOC = 'k/fx.json';

export interface FxDoc {
  /** Kurs otomatis dipakai (bawaan) atau admin mengunci kurs manual di Admin → Mesin. */
  auto: boolean;
  usdIdr?: number;
  at?: number;
  source?: string;
  /** Percobaan terakhir yang gagal (untuk peringatan admin). */
  lastError?: { at: number; msg: string };
  /** 30 kurs harian terakhir. */
  history?: { d: string; r: number }[];
}

const SOURCES: { name: string; url: string; pick: (j: unknown) => number | undefined }[] = [
  { name: 'open.er-api.com', url: 'https://open.er-api.com/v6/latest/USD', pick: (j) => (j as { rates?: Record<string, number> }).rates?.IDR },
  { name: 'frankfurter.app (ECB)', url: 'https://api.frankfurter.app/latest?from=USD&to=IDR', pick: (j) => (j as { rates?: Record<string, number> }).rates?.IDR },
  { name: 'currency-api (jsDelivr)', url: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json', pick: (j) => (j as { usd?: Record<string, number> }).usd?.idr },
];

export async function getFx(store: Store): Promise<FxDoc> {
  return { auto: true, ...((await store.get<FxDoc>(FX_DOC)) ?? {}) };
}

export const saneRate = (r: unknown): r is number => typeof r === 'number' && Number.isFinite(r) && r > 5_000 && r < 50_000;

/** Ambil kurs hari ini dan simpan; mengembalikan kurs yang berlaku. Aman dipanggil berulang. */
export async function refreshFx(env: Env, store: Store, now = Date.now()): Promise<FxDoc> {
  const cur = await getFx(store);
  const sources = env.FX_URLS ? env.FX_URLS.split(',').map((url, i) => ({ name: `test-${i}`, url, pick: SOURCES[i % SOURCES.length]!.pick })) : SOURCES;
  let lastErr = '';
  for (const s of sources) {
    try {
      const r = await fetch(s.url, { headers: { accept: 'application/json' } });
      if (!r.ok) throw new Error(`${s.name}: HTTP ${r.status}`);
      const rate = s.pick(await r.json());
      if (!saneRate(rate)) throw new Error(`${s.name}: kurs tidak wajar (${rate})`);
      if (cur.usdIdr && Math.abs(rate - cur.usdIdr) / cur.usdIdr > 0.2) throw new Error(`${s.name}: loncatan > 20 % (${cur.usdIdr} → ${rate})`);
      const d = new Date(now + 7 * 3600_000).toISOString().slice(0, 10);
      const history = [...(cur.history ?? []).filter((h) => h.d !== d), { d, r: Math.round(rate * 100) / 100 }].slice(-30);
      const next: FxDoc = { auto: cur.auto, usdIdr: Math.round(rate * 100) / 100, at: now, source: s.name, history };
      await store.put(FX_DOC, next);
      return next;
    } catch (err) {
      lastErr = err instanceof Error ? err.message : String(err);
    }
  }
  const failed: FxDoc = { ...cur, lastError: { at: now, msg: lastErr.slice(0, 300) } };
  await store.put(FX_DOC, failed);
  return failed;
}

/** Kurs yang dipakai harga: otomatis bila aktif dan tersedia, selain itu kurs manual di Admin → Mesin. */
export function effectiveFx(manual: number, fx: FxDoc | null): number {
  return fx?.auto !== false && saneRate(fx?.usdIdr) ? fx!.usdIdr! : manual;
}
