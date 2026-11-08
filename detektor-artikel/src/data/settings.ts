/** Setelan yang diatur admin; semuanya punya nilai bawaan yang langsung bekerja. Disimpan di k/ (R2). */
import type { Store } from '../lib/store.ts';
import { FX_DOC, effectiveFx, type FxDoc } from './fx.ts';
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
  /** Kurs yang diisi admin (dipakai bila kurs otomatis mati atau gagal). `fx` sudah berisi kurs yang berlaku. */
  fxManual?: number;
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

/**
 * Pengaturan mesin + kurs hari ini (MASTER-BLUEPRINT §28.4): `fx` = kurs otomatis harian bila aktif, `fxManual` = kurs yang
 * diisi admin (cadangan). Dua dokumen dibaca bersamaan; cron hanya menulis dokumen kurs.
 */
export async function getEngine(store: Store): Promise<EngineSettings> {
  const [s, fx] = await Promise.all([store.get<Partial<EngineSettings>>('k/engine.json'), store.get<FxDoc>(FX_DOC)]);
  const base: EngineSettings = !s
    ? structuredClone(DEFAULT_ENGINE)
    : {
        ...DEFAULT_ENGINE,
        ...s,
        models: { ...DEFAULT_ENGINE.models, ...s.models },
        effort: { ...DEFAULT_ENGINE.effort, ...s.effort },
        thresholds: { ...DEFAULT_ENGINE.thresholds, ...s.thresholds },
        prices: { ...DEFAULT_ENGINE.prices, ...s.prices },
      };
  const manual = base.fxManual ?? base.fx;
  return { ...base, fxManual: manual, fx: effectiveFx(manual, fx) };
}

/* ── token berbayar (pemilik, 2 Nov 2026: "sistem token berbayar … keuntungan mulai 10x, 20x sampai 500x, bisa diedit manual") ── */

export interface TokenPackage {
  key: string;
  name: { id: string; en: string };
  /** Token paket (untuk paket bernominal tetap: dihitung dari nominal — lihat `targetIdr`). */
  tokens: number;
  /** Diskon paket: 0–10, 15, 20, 25, 30 % (pemilik, 8 Nov 2026), bawaan 0. Harga dihitung otomatis dari markup. */
  discountPct: number;
  note: { id: string; en: string };
  /** Tingkat yang dibuka paket ini (1 Starter … 6 Super Enterprise) — mesin mengikuti pembelian. */
  tier?: number;
  /** Paket bernominal tetap (Enterprise Rp10 jt, Super Enterprise Rp20 jt): token = nominal ÷ harga token setelah diskon. */
  targetIdr?: number;
}

/** Pilihan diskon paket yang boleh dipakai admin (pemilik: „0-10, 15,20 & 25, 30“). */
export const DISCOUNT_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30] as const;
export const normalizeDiscount = (v: unknown): number => {
  const n = Math.round(Number(v) || 0);
  return DISCOUNT_STEPS.reduce((best, s) => (Math.abs(s - n) < Math.abs(best - n) ? s : best), 0);
};

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
  /** Versi susunan paket (2 = enam paket + Enterprise, diskon bawaan 0 — 8 Nov 2026). */
  pkgVersion?: number;
  /**
   * Naskah yang pernah diunggah member yang sama dengan mesin yang sama (MASTER-BLUEPRINT §26): bagian itu ditagih persen
   * ini dari harga normal (bawaan 50 — pemilik, 8 Nov 2026). Biaya AI perusahaan untuk bagian itu selalu 0.
   */
  reusePct: number;
  packages: TokenPackage[];
  manualText: string;
  updatedAt?: number;
  updatedBy?: string;
}

export const MARKUP_MIN = 5;
export const MARKUP_MAX = 500;

/** Enam paket (pemilik, 8 Nov 2026): diskon kosong dulu — admin yang mengisi. */
export function DEFAULT_PACKAGES(): TokenPackage[] {
  return [
    { key: 'starter', tier: 1, name: { id: 'Starter', en: 'Starter' }, tokens: 300, discountPct: 0, note: { id: 'Untuk mencoba beberapa naskah · mesin Essential & Smart Auto', en: 'To try a few texts · Essential engine & Smart Auto' } },
    { key: 'reguler', tier: 2, name: { id: 'Reguler', en: 'Regular' }, tokens: 1_000, discountPct: 0, note: { id: 'Membuka mesin Advanced', en: 'Unlocks the Advanced engine' } },
    { key: 'pro', tier: 3, name: { id: 'Pro (guru, dosen, juri)', en: 'Pro (teachers, judges)' }, tokens: 3_000, discountPct: 0, note: { id: 'Membuka Expert & Forensic Panel — cocok untuk sesi lomba', en: 'Unlocks Expert & Forensic Panel — suits contest sessions' } },
    { key: 'lembaga', tier: 4, name: { id: 'Lembaga', en: 'Institution' }, tokens: 12_000, discountPct: 0, note: { id: 'Untuk sekolah, kampus, panitia', en: 'For schools, campuses, organisers' } },
    { key: 'enterprise', tier: 5, targetIdr: 10_000_000, name: { id: 'Enterprise', en: 'Enterprise' }, tokens: 0, discountPct: 0, note: { id: 'Semua mesin terbuka, termasuk Elite. Disarankan Expert & Elite untuk hasil terbaik.', en: 'Every engine unlocked, including Elite. Expert & Elite recommended for the best results.' } },
    { key: 'super-enterprise', tier: 6, targetIdr: 20_000_000, name: { id: 'Super Enterprise', en: 'Super Enterprise' }, tokens: 0, discountPct: 0, note: { id: 'Semua mesin terbuka untuk volume terbesar. Disarankan Expert & Elite.', en: 'Every engine unlocked for the largest volumes. Expert & Elite recommended.' } },
  ];
}

export const DEFAULT_BILLING: BillingSettings = {
  tokenUnitUsd: 0.001,
  markup: 20,
  wordsPerPage: 300,
  welcomeTokens: 0,
  maxConcurrent: 3,
  reusePct: 50,
  pkgVersion: 2,
  packages: DEFAULT_PACKAGES(),
  manualText: '',
};

export async function getBilling(store: Store): Promise<BillingSettings> {
  const s = await store.get<Partial<BillingSettings>>('k/billing.json');
  const b = s ? { ...DEFAULT_BILLING, ...s } : structuredClone(DEFAULT_BILLING);
  b.markup = Math.min(MARKUP_MAX, Math.max(MARKUP_MIN, Number(b.markup) || DEFAULT_BILLING.markup));
  b.tokenUnitUsd = Number(b.tokenUnitUsd) > 0 ? Number(b.tokenUnitUsd) : DEFAULT_BILLING.tokenUnitUsd;
  b.reusePct = Math.min(100, Math.max(0, Math.round(Number(b.reusePct ?? DEFAULT_BILLING.reusePct))));
  if (!Number.isFinite(b.reusePct)) b.reusePct = DEFAULT_BILLING.reusePct;
  // Susunan paket lama (4 paket, diskon 10/20/30 %) → enam paket dengan diskon 0 (pemilik, 8 Nov 2026: „Diskon kosongin
  // aja dulu“); nama dan token yang sudah diubah admin dipertahankan.
  if ((s?.pkgVersion ?? 1) < 2) {
    const old = new Map((b.packages ?? []).map((p) => [p.key, p]));
    b.packages = DEFAULT_PACKAGES().map((d) => (old.has(d.key) && !d.targetIdr ? { ...d, name: old.get(d.key)!.name ?? d.name, tokens: old.get(d.key)!.tokens || d.tokens } : d));
    b.pkgVersion = 2;
  }
  const defs = new Map(DEFAULT_PACKAGES().map((p) => [p.key, p]));
  b.packages = (b.packages ?? DEFAULT_PACKAGES()).map((p, i) => ({
    ...p,
    tier: Math.min(6, Math.max(1, Math.round(Number(p.tier ?? defs.get(p.key)?.tier ?? i + 1)))),
    targetIdr: p.targetIdr ?? defs.get(p.key)?.targetIdr,
    discountPct: normalizeDiscount(p.discountPct),
  }));
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
  /** Biaya AI yang tidak dikeluarkan karena hasil tersimpan dipakai ulang (MASTER-BLUEPRINT §26). */
  saved?: number;
  /** Kata yang tidak dikirim ke AI karena hasil tersimpan. */
  savedWords?: number;
}

export async function spendToday(store: Store): Promise<number> {
  const s = await store.get<SpendDay>(`k/spend/${wibDate()}.json`);
  return s?.usd ?? 0;
}

/** Satu tulis per pemeriksaan selesai (bukan per panggilan API) — tidak menjadi kunci panas. */
export async function addSpend(store: Store, usd: number, words = 0, saved = 0, savedWords = 0): Promise<void> {
  if (!(usd > 0) && !(words > 0) && !(saved > 0)) return;
  await store.cas<SpendDay>(
    `k/spend/${wibDate()}.json`,
    (cur) => ({
      usd: Math.round(((cur?.usd ?? 0) + Math.max(0, usd)) * 1e6) / 1e6,
      words: (cur?.words ?? 0) + Math.max(0, words),
      checks: (cur?.checks ?? 0) + (words > 0 ? 1 : 0),
      saved: Math.round(((cur?.saved ?? 0) + Math.max(0, saved)) * 1e6) / 1e6,
      savedWords: (cur?.savedWords ?? 0) + Math.max(0, savedWords),
    }),
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
