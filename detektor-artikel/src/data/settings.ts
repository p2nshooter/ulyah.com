/** Setelan yang diatur admin; semuanya punya nilai bawaan yang langsung bekerja. Disimpan di k/ (R2). */
import type { Store } from '../lib/store.ts';
import type { Thresholds } from '../engine/fuse.ts';
import { DEFAULT_THRESHOLDS } from '../engine/fuse.ts';
import type { Sealed } from '../lib/crypto.ts';

export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

export interface Price {
  in: number;
  out: number;
  cacheRead: number;
}

export interface EngineSettings {
  models: { t1: string; t2: string; t3: string };
  effort: { t1: Effort; regen: Effort; t2: Effort; t3: Effort };
  thresholds: Thresholds;
  maxOpusSentences: number;
  regen: boolean;
  rubricVerify: boolean;
  prices: Record<string, Price>;
  fx: number;
  retentionDays: number;
  dailyCapUsd: number;
  updatedAt?: number;
  updatedBy?: string;
}

export const DEFAULT_ENGINE: EngineSettings = {
  models: { t1: 'claude-haiku-5-5', t2: 'claude-sonnet-5-5', t3: 'claude-opus-5-5' },
  effort: { t1: 'high', regen: 'low', t2: 'high', t3: 'high' },
  thresholds: DEFAULT_THRESHOLDS,
  maxOpusSentences: 40,
  regen: true,
  rubricVerify: true,
  prices: {
    'claude-haiku-5-5': { in: 0.1, out: 0.5, cacheRead: 0.01 },
    'claude-sonnet-5-5': { in: 2, out: 10, cacheRead: 0.2 },
    'claude-opus-5-5': { in: 4, out: 20, cacheRead: 0.2 },
    'claude-fable-5-1': { in: 10, out: 50, cacheRead: 0.25 },
    'claude-opus-5': { in: 5, out: 25, cacheRead: 0.5 },
    'claude-sonnet-5': { in: 2, out: 10, cacheRead: 0.2 },
  },
  fx: 16500,
  retentionDays: 30,
  dailyCapUsd: 25,
};

export async function getEngine(store: Store): Promise<EngineSettings> {
  const s = await store.get<Partial<EngineSettings>>('k/engine.json');
  if (!s) return structuredClone(DEFAULT_ENGINE);
  return {
    ...DEFAULT_ENGINE,
    ...s,
    models: { ...DEFAULT_ENGINE.models, ...s.models },
    effort: { ...DEFAULT_ENGINE.effort, ...s.effort },
    thresholds: { ...DEFAULT_ENGINE.thresholds, ...s.thresholds },
    prices: { ...DEFAULT_ENGINE.prices, ...s.prices },
  };
}

/* ── token berbayar (pemilik, 2 Nov 2026: "sistem token berbayar … keuntungan mulai 10x, 20x sampai 500x, bisa diedit manual") ── */

export interface TokenPackage {
  key: string;
  name: { id: string; en: string };
  tokens: number;
  /** Diskon paket (0–50%). Harga dihitung otomatis dari markup — tidak diisi manual. */
  discountPct: number;
  note: { id: string; en: string };
}

export interface BillingSettings {
  /** Modal per token: 1 token = satuan kerja AI senilai US$ ini (bawaan 0,001). */
  tokenUnitUsd: number;
  /** Keuntungan: harga = modal × markup, 5–500× (pemilik, 7 Nov 2026: „Dr 5-500 saja“; sebelumnya 10–500×, 2 Nov 2026). */
  markup: number;
  /** Kata per halaman untuk prediksi halaman (A4, 12 pt, spasi 1,5). */
  wordsPerPage: number;
  /** Token sambutan untuk akun baru (bawaan 0: sistem berbayar). */
  welcomeTokens: number;
  /** Batas pemeriksaan berjalan bersamaan per member (anti-curang & anti-banjir). */
  maxConcurrent: number;
  packages: TokenPackage[];
  manualText: string;
  updatedAt?: number;
  updatedBy?: string;
}

export const MARKUP_MIN = 5;
export const MARKUP_MAX = 500;

export const DEFAULT_BILLING: BillingSettings = {
  tokenUnitUsd: 0.001,
  markup: 20,
  wordsPerPage: 300,
  welcomeTokens: 0,
  maxConcurrent: 3,
  packages: [
    { key: 'starter', name: { id: 'Starter', en: 'Starter' }, tokens: 300, discountPct: 0, note: { id: 'Untuk mencoba beberapa naskah', en: 'To try a few texts' } },
    { key: 'reguler', name: { id: 'Reguler', en: 'Regular' }, tokens: 1_000, discountPct: 10, note: { id: 'Hemat 10%', en: 'Save 10%' } },
    { key: 'pro', name: { id: 'Pro (guru, dosen, juri)', en: 'Pro (teachers, judges)' }, tokens: 3_000, discountPct: 20, note: { id: 'Hemat 20% — cocok untuk sesi lomba', en: 'Save 20% — suits contest sessions' } },
    { key: 'lembaga', name: { id: 'Lembaga', en: 'Institution' }, tokens: 12_000, discountPct: 30, note: { id: 'Hemat 30% untuk sekolah, kampus, panitia', en: 'Save 30% for schools, campuses, organisers' } },
  ],
  manualText: '',
};

export async function getBilling(store: Store): Promise<BillingSettings> {
  const s = await store.get<Partial<BillingSettings>>('k/billing.json');
  const b = s ? { ...DEFAULT_BILLING, ...s } : structuredClone(DEFAULT_BILLING);
  b.markup = Math.min(MARKUP_MAX, Math.max(MARKUP_MIN, Number(b.markup) || DEFAULT_BILLING.markup));
  b.tokenUnitUsd = Number(b.tokenUnitUsd) > 0 ? Number(b.tokenUnitUsd) : DEFAULT_BILLING.tokenUnitUsd;
  b.packages = (b.packages ?? DEFAULT_BILLING.packages).map((p) => ({ ...p, discountPct: Math.min(50, Math.max(0, Number(p.discountPct) || 0)) }));
  return b;
}

export interface KeyRecord {
  primary?: Sealed;
  last4?: string;
  savedAt?: number;
  savedBy?: string;
  models?: string[];
}

export const KEY_DOC = 'k/secrets/anthropic.json';

export function wibDate(ms = Date.now()): string {
  return new Date(ms + 7 * 3600_000).toISOString().slice(0, 10);
}

export interface SpendDay {
  usd: number;
  words: number;
  checks: number;
}

export async function spendToday(store: Store): Promise<number> {
  const s = await store.get<SpendDay>(`k/spend/${wibDate()}.json`);
  return s?.usd ?? 0;
}

/** Satu tulis per pemeriksaan selesai (bukan per panggilan API) — tidak menjadi kunci panas. */
export async function addSpend(store: Store, usd: number, words = 0): Promise<void> {
  if (!(usd > 0) && !(words > 0)) return;
  await store.cas<SpendDay>(
    `k/spend/${wibDate()}.json`,
    (cur) => ({ usd: Math.round(((cur?.usd ?? 0) + Math.max(0, usd)) * 1e6) / 1e6, words: (cur?.words ?? 0) + Math.max(0, words), checks: (cur?.checks ?? 0) + (words > 0 ? 1 : 0) }),
    'Biaya harian',
  );
}

/** Biaya nyata rata-rata per 1.000 kata, 14 hari terakhir (null bila data < 20.000 kata). */
export async function measuredCostPer1k(store: Store): Promise<number | null> {
  let usd = 0;
  let words = 0;
  for (let d = 0; d < 14; d += 1) {
    const s = await store.get<SpendDay>(`k/spend/${wibDate(Date.now() - d * 86_400_000)}.json`);
    if (s?.words) {
      usd += s.usd;
      words += s.words;
    }
  }
  return words >= 20_000 ? (usd * 1000) / words : null;
}

/* ── kuota gratis (pemilik, 7 Nov 2026; docs/MASTER-BLUEPRINT.md §20) ─────────────────────────────────────────── */

/**
 * Kuota gratis member — SATU dokumen (`k/free.json`) yang dibaca semua bagian: prediksi biaya di admin sekarang, penegakan
 * kuota dan teks halaman di fase X1. Pemilik: „Untuk gratis halaman sifatnya dynamic page ya, bisa d rubah dr portal admin,
 * misal admin mau rubah 5 halaman perminggu, atau 10 halaman perbulan … pastikan ketika admin rubah, semua ikut berubah jgn
 * sampai ada miss dan konflik“. Tidak ada salinan angka di tempat lain dan tidak ada cache: setiap permintaan membaca
 * dokumen ini, jadi perubahan admin berlaku seketika di semua halaman.
 */
export type FreePeriod = 'week' | 'month';

export interface FreeSettings {
  enabled: boolean;
  /** Periode reset: per minggu (Senin 00.00) atau per bulan (tanggal 1, 00.00), waktu lokal `resetTz`. */
  period: FreePeriod;
  /** Halaman normal gratis per periode. */
  pages: number;
  /** Satu halaman normal = kertas Legal: maks. kata / karakter / token masukan, mana yang tercapai lebih dulu. */
  wordsPerPage: number;
  charsPerPage: number;
  tokensPerPage: number;
  /** Maks. halaman per pemeriksaan (tidak pernah lebih dari `pages`). */
  maxPerCheck: number;
  /** Anggaran biaya AI harian perusahaan untuk semua Cek Gratis (US$). 0 = Cek Gratis berhenti. */
  dailyBudgetUsd: number;
  resetTz: string;
  updatedAt?: number;
  updatedBy?: string;
}

/** Bawaan bila dokumen admin belum ada. Pemilik, 8 Nov 2026: gratis 5 halaman per minggu (diubah di Admin). */
export const DEFAULT_FREE: FreeSettings = {
  enabled: true,
  period: 'week',
  pages: 5,
  wordsPerPage: 700,
  charsPerPage: 5600,
  tokensPerPage: 1600,
  maxPerCheck: 5,
  dailyBudgetUsd: 5,
  resetTz: 'Asia/Jakarta',
};

/** Batas setiap isian (dipakai server dan formulir admin — satu sumber). */
export const FREE_LIMITS = {
  // Pemilik, 8 Nov 2026: „gratis 1-20 halaman / minggu itu pun dynamic page“.
  pages: [1, 20],
  wordsPerPage: [100, 2000],
  charsPerPage: [500, 20000],
  tokensPerPage: [200, 5000],
  maxPerCheck: [1, 20],
  dailyBudgetUsd: [0, 1000],
} as const;

const clampN = (v: unknown, [lo, hi]: readonly [number, number], d: number, int = true) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return d;
  const x = Math.min(hi, Math.max(lo, n));
  return int ? Math.round(x) : Math.round(x * 100) / 100;
};

/** Menormalkan isian apa pun menjadi pengaturan yang sah dan tidak saling bertentangan. */
export function normalizeFree(s: Partial<FreeSettings> | null | undefined): FreeSettings {
  const b = { ...DEFAULT_FREE, ...(s ?? {}) };
  const pages = clampN(b.pages, FREE_LIMITS.pages, DEFAULT_FREE.pages);
  return {
    enabled: b.enabled !== false,
    period: b.period === 'month' ? 'month' : 'week',
    pages,
    wordsPerPage: clampN(b.wordsPerPage, FREE_LIMITS.wordsPerPage, DEFAULT_FREE.wordsPerPage),
    charsPerPage: clampN(b.charsPerPage, FREE_LIMITS.charsPerPage, DEFAULT_FREE.charsPerPage),
    tokensPerPage: clampN(b.tokensPerPage, FREE_LIMITS.tokensPerPage, DEFAULT_FREE.tokensPerPage),
    // Konflik dicegah di sini: maks. per pemeriksaan tidak pernah melebihi kuota satu periode.
    maxPerCheck: Math.min(pages, clampN(b.maxPerCheck, FREE_LIMITS.maxPerCheck, DEFAULT_FREE.maxPerCheck)),
    dailyBudgetUsd: clampN(b.dailyBudgetUsd, FREE_LIMITS.dailyBudgetUsd, DEFAULT_FREE.dailyBudgetUsd, false),
    resetTz: typeof b.resetTz === 'string' && /^[A-Za-z_]+\/[A-Za-z_]+$/.test(b.resetTz) ? b.resetTz : DEFAULT_FREE.resetTz,
    updatedAt: b.updatedAt,
    updatedBy: b.updatedBy,
  };
}

export const FREE_DOC = 'k/free.json';

export async function getFree(store: Store): Promise<FreeSettings> {
  return normalizeFree(await store.get<Partial<FreeSettings>>(FREE_DOC));
}

/** Biaya AI semua Cek Gratis hari ini (WIB) — dibandingkan dengan `dailyBudgetUsd` kuota gratis. */
export async function freeSpendToday(store: Store): Promise<number> {
  return (await store.get<{ usd: number }>(`k/free-spend/${wibDate()}.json`))?.usd ?? 0;
}

/** Satu tulis per Cek Gratis selesai/gagal (bukan per panggilan) — tidak menjadi kunci panas. */
export async function addFreeSpend(store: Store, usd: number): Promise<void> {
  if (!(usd > 0)) return;
  await store.cas<{ usd: number }>(`k/free-spend/${wibDate()}.json`, (cur) => ({ usd: Math.round(((cur?.usd ?? 0) + usd) * 1e6) / 1e6 }), 'Biaya gratis harian');
}
