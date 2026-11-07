/**
 * Harga & token.
 *
 * 1 TOKEN = satuan kerja AI yang tetap (bawaan: senilai US$0,001 biaya API = "modal" per token).
 *   - Pemakaian token sebuah pemeriksaan = biaya API nyata ÷ satuan token → TIDAK tergantung markup.
 *   - Harga 1 token (Rp) = satuan token × kurs × markup (5–500×, diatur admin).
 *   - Harga paket = token × harga token × (1 − diskon paket).
 * Akibatnya: begitu admin menyimpan markup baru, SEMUA harga promosi (paket, harga per halaman) ikut
 * berubah, sedangkan token yang sudah dibeli klien tetap bernilai kerja yang sama.
 *
 * Pengaman tidak-rugi: token yang disisihkan di muka bernilai jual ≥ biaya API terburuk mutlak, dan yang
 * dipotong tidak pernah melebihi yang disisihkan → pendapatan ≥ biaya API. Semua dihitung di server.
 */
import type { BillingSettings, EngineSettings, Price } from '../data/settings.ts';

/** Mesin pemeriksaan: AUTO = bertingkat termurah dulu (sistem memilih), satu model, atau forensik (ketiganya). */
export type Mode = 'auto' | 'haiku' | 'sonnet' | 'opus' | 'forensic';
export const MODES: Mode[] = ['auto', 'haiku', 'sonnet', 'opus', 'forensic'];
export const isMode = (x: unknown): x is Mode => typeof x === 'string' && (MODES as string[]).includes(x);

const TOK_PER_WORD = 1.7; // Bahasa Indonesia (English ± 1,35) — dipakai yang lebih besar agar aman
const SYS = 3000;

function price(eng: EngineSettings, model: string): Price {
  return eng.prices[model] ?? { in: 4, out: 20, cacheRead: 0.4 };
}

const usd = (p: Price, tin: number, tout: number) => (tin * p.in + tout * p.out) / 1e6;

export interface CostRange {
  min: number;
  typical: number;
  max: number;
}

/** Perkiraan biaya API (US$) untuk satu naskah. */
export function estimateCostUsd(words: number, mode: Mode, rubric: boolean, eng: EngineSettings): CostRange {
  const T = Math.max(150, words) * TOK_PER_WORD;
  const h = price(eng, eng.models.t1);
  const s = price(eng, eng.models.t2);
  const o = price(eng, eng.models.t3);
  const haikuIn = (SYS + T) * 2 + (1800 + 0.6 * T) + (rubric ? 4500 + T : 0);
  const haikuOut = 2.9 * T + 600 + 2 * T + 1200 + (rubric ? 2500 + 1.6 * T : 0);
  const tier1 = usd(h, haikuIn, haikuOut);
  const sonnet = (f: number) => usd(s, SYS + T + 300, 2.9 * f * T + 1500);
  const opus = (f: number) => usd(o, SYS + T + 300, 3.9 * f * T + 2500);
  const rub = (p: Price) => (rubric ? usd(p, 4500 + T, 2500 + 1.6 * T) : 0);
  const opusShare = Math.min(1, (eng.maxOpusSentences * 22) / Math.max(150, words));
  if (mode === 'forensic') {
    const f = tier1 + sonnet(1) + opus(1) + rub(s) + rub(o);
    return { min: tier1 + sonnet(1) + opus(1) + rub(s), typical: f, max: f * 1.3 };
  }
  if (mode === 'haiku') return { min: tier1 * 0.7, typical: tier1, max: tier1 * 1.6 };
  if (mode === 'sonnet' || mode === 'opus') {
    // Pemeriksa per kalimat, per paragraf, dan rubrik berjalan di model terpilih; uji tebak lanjutan tetap Haiku.
    const p = mode === 'sonnet' ? s : o;
    const one = usd(p, (SYS + T) * 2 + (rubric ? 4500 + T : 0), 2.9 * T + 600 + 2 * T + (rubric ? 2500 + 1.6 * T : 0)) + usd(h, 1800 + 0.6 * T, 1200);
    return { min: one * 0.7, typical: one, max: one * 1.6 };
  }
  const typical = tier1 + 0.3 * sonnet(0.5) + 0.08 * opus(0.3) + (rubric ? 0.3 * rub(s) : 0);
  const maxAuto = tier1 + sonnet(1) + opus(opusShare) + rub(s) + rub(o);
  return { min: tier1, typical, max: maxAuto * 1.3 };
}

/**
 * Batas biaya MUTLAK (tidak bisa dilampaui): setiap panggilan dibatasi max_tokens dan jumlah panggilan
 * dibatasi pemotongan naskah.
 */
export function hardBoundUsd(words: number, mode: Mode, rubric: boolean, eng: EngineSettings): number {
  const T = Math.max(150, words) * TOK_PER_WORD;
  const chunks = Math.max(1, Math.ceil(Math.max(150, words) / 2000));
  const h = price(eng, eng.models.t1);
  const s = price(eng, eng.models.t2);
  const o = price(eng, eng.models.t3);
  const inT = SYS + T + 600;
  if (mode === 'haiku' || mode === 'sonnet' || mode === 'opus') {
    const p = mode === 'haiku' ? h : mode === 'sonnet' ? s : o;
    return chunks * usd(p, inT, 16000) + usd(p, inT, 12000) + usd(h, inT, 4000) + (rubric ? usd(p, inT + 1500, 16000) : 0);
  }
  let total = chunks * usd(h, inT, 16000) + usd(h, inT, 12000) + usd(h, inT, 4000) + (rubric ? usd(h, inT + 1500, 16000) : 0);
  total += chunks * usd(s, inT, 16000) + (rubric ? usd(s, inT + 1500, 16000) : 0);
  total += (mode === 'forensic' ? chunks : 1) * usd(o, inT, 16000) + (rubric ? usd(o, inT + 1500, 16000) : 0);
  return total;
}

/* ── token & harga ────────────────────────────────────────────────────── */

/** Token yang terpakai untuk biaya API tertentu (tidak tergantung markup). */
export function tokensFor(costUsd: number, b: BillingSettings): number {
  if (!(costUsd > 0)) return 0;
  return Math.max(1, Math.ceil(costUsd / b.tokenUnitUsd - 1e-9));
}

/** Harga 1 token dalam Rupiah = satuan token × kurs × markup. */
export function tokenPriceIdr(b: BillingSettings, eng: EngineSettings): number {
  return b.tokenUnitUsd * eng.fx * b.markup;
}

/** Modal (biaya API) 1 token dalam Rupiah. */
export function tokenCostIdr(b: BillingSettings, eng: EngineSettings): number {
  return b.tokenUnitUsd * eng.fx;
}

function niceIdr(x: number): number {
  if (x >= 100_000) return Math.round(x / 1000) * 1000;
  if (x >= 10_000) return Math.round(x / 500) * 500;
  return Math.max(100, Math.round(x / 100) * 100);
}

export interface PackagePrice {
  idr: number;
  usd: number;
  /** Modal API bila semua token paket terpakai (Rp). */
  costIdr: number;
}

/** Harga paket diturunkan dari markup — ikut berubah otomatis begitu markup disimpan. */
export function packagePrice(p: { tokens: number; discountPct: number }, b: BillingSettings, eng: EngineSettings): PackagePrice {
  const disc = Math.min(50, Math.max(0, p.discountPct || 0)) / 100;
  const idr = niceIdr(p.tokens * tokenPriceIdr(b, eng) * (1 - disc));
  const usdv = Math.max(0.5, Math.round(p.tokens * b.tokenUnitUsd * b.markup * (1 - disc) * 2) / 2);
  return { idr, usd: usdv, costIdr: Math.round(p.tokens * tokenCostIdr(b, eng)) };
}

/** Bagian afiliasi terbesar yang bisa diatur admin (lihat getAffiliateSettings: 0–50 %). */
export const AFFILIATE_MAX_SHARE = 0.5;

/** Pendapatan minimum per Rupiah modal (markup × (1 − diskon terbesar)). */
export function minRevenueMultiple(b: BillingSettings): number {
  const maxDisc = Math.min(50, Math.max(0, ...b.packages.map((p) => p.discountPct || 0))) / 100;
  return Math.max(1, b.markup * (1 - maxDisc));
}

export interface Rate {
  /** Token per 1.000 token masukan AI. */
  in: number;
  /** Token per 1.000 token keluaran AI (termasuk token berpikir). */
  out: number;
  /** Token per 1.000 token masukan yang dibaca dari cache. */
  cache: number;
}

/** Tarif terbuka per model: token per 1.000 token AI (tetap; tidak membuka markup atau modal). */
export function rateCard(b: BillingSettings, eng: EngineSettings): Record<string, Rate> {
  const out: Record<string, Rate> = {};
  const k = 1000 / 1e6 / b.tokenUnitUsd;
  for (const m of [eng.models.t1, eng.models.t2, eng.models.t3]) {
    const p = price(eng, m);
    out[m] = { in: Math.round(p.in * k * 10000) / 10000, out: Math.round(p.out * k * 10000) / 10000, cache: Math.round(p.cacheRead * k * 10000) / 10000 };
  }
  return out;
}

export function lineTokens(rate: Rate, inTok: number, outTok: number, cacheTok: number): number {
  return Math.round(((inTok * rate.in + outTok * rate.out + cacheTok * rate.cache) / 1000) * 100) / 100;
}

export interface TokenEstimate {
  min: number;
  typical: number;
  reserve: number;
}

export function estimateTokens(words: number, mode: Mode, rubric: boolean, b: BillingSettings, eng: EngineSettings): TokenEstimate {
  const c = estimateCostUsd(words, mode, rubric, eng);
  const reserveUsd = mode === 'auto' ? Math.min(c.max, Math.max(c.typical * 3, c.min * 4)) : c.max;
  // Pengaman tidak-rugi: nilai jual token yang disisihkan — sesudah diskon paket terbesar DAN komisi afiliasi
  // terbesar yang mungkin — tetap ≥ biaya API terburuk mutlak pemeriksaan ini.
  const noLoss = Math.ceil(hardBoundUsd(words, mode, rubric, eng) / b.tokenUnitUsd / (minRevenueMultiple(b) * (1 - AFFILIATE_MAX_SHARE)));
  return { min: tokensFor(c.min, b), typical: tokensFor(c.typical, b), reserve: Math.max(tokensFor(reserveUsd, b), noLoss) };
}

export interface ModePages {
  mode: Mode;
  /** Token per halaman (rentang). */
  perPage: { low: number; high: number };
  /** Halaman yang bisa diperiksa dengan saldo (rentang). */
  pages: { low: number; high: number };
  /** Harga per halaman dalam Rupiah (rentang) — ikut markup. */
  idrPerPage: { low: number; high: number };
}

/** Prediksi per mesin (Haiku, Sonnet, Opus, AUTO) — selalu rentang & perkiraan. */
export function predictByMode(balance: number, b: BillingSettings, eng: EngineSettings, rubric = true): ModePages[] {
  const docWords = b.wordsPerPage * 5;
  const tp = tokenPriceIdr(b, eng);
  return (['haiku', 'sonnet', 'opus', 'auto'] as Mode[]).map((mode) => {
    const c = estimateCostUsd(docWords, mode, rubric, eng);
    const lo = c.min / 5;
    const hi = mode === 'auto' ? (c.typical * 2.2) / 5 : c.max / 5;
    const tLow = Math.max(0.1, Math.round((lo / b.tokenUnitUsd) * 10) / 10);
    const tHigh = Math.max(tLow, Math.round((hi / b.tokenUnitUsd) * 10) / 10);
    return {
      mode,
      perPage: { low: tLow, high: tHigh },
      pages: { low: Math.floor(balance / tHigh), high: Math.floor(balance / tLow) },
      idrPerPage: { low: Math.round(tLow * tp), high: Math.round(tHigh * tp) },
    };
  });
}

export interface PagePrediction {
  perPage: { low: number; high: number };
  pages: { low: number; high: number };
  basis: 'measured' | 'model';
}

/** Prediksi halaman gabungan untuk saldo (memakai biaya nyata rata-rata bila datanya sudah cukup). */
export function predictPages(balance: number, b: BillingSettings, eng: EngineSettings, measuredPer1k: number | null, rubric = true): PagePrediction {
  const docWords = b.wordsPerPage * 5;
  const c = estimateCostUsd(docWords, 'auto', rubric, eng);
  let lowCost = c.min / 5;
  let highCost = (c.typical * 2.2) / 5;
  let basis: PagePrediction['basis'] = 'model';
  if (measuredPer1k !== null) {
    const perPage = (measuredPer1k * b.wordsPerPage) / 1000;
    lowCost = perPage * 0.6;
    highCost = perPage * 1.8;
    basis = 'measured';
  }
  const tLow = Math.max(0.1, Math.round((lowCost / b.tokenUnitUsd) * 10) / 10);
  const tHigh = Math.max(tLow, Math.round((highCost / b.tokenUnitUsd) * 10) / 10);
  return { perPage: { low: tLow, high: tHigh }, pages: { low: Math.floor(balance / tHigh), high: Math.floor(balance / tLow) }, basis };
}

/* ── kuota gratis: prediksi biaya (pemilik, 7 Nov 2026; docs/MASTER-BLUEPRINT.md §20) ───────────────────────── */

/**
 * Ukuran kuota gratis. Satu halaman normal = kertas Legal (maks. 700 kata / 4.800 karakter / 1.600 token masukan);
 * Cek Gratis = Haiku satu lintasan, keluaran dibatasi. Nilai ini dipakai untuk PREDIKSI di admin; kuota gratisnya sendiri
 * dibangun di fase X1 dengan nilai yang sama.
 */
export const FREE_QUOTA = {
  pagesPerWeek: 10,
  wordsPerPage: 700,
  charsPerPage: 4800,
  tokensPerPage: 1600,
  /** Prompt sistem Cek Gratis (dibaca dari cache setelah panggilan pertama). */
  systemTokens: 1200,
  /** Keluaran maksimum per halaman. */
  maxOutPerPage: 900,
  /** Halaman khas: ±500 kata. */
  typicalInPerPage: 1000,
  typicalOutPerPage: 600,
  /** Anggaran biaya AI harian perusahaan untuk semua Cek Gratis (US$). */
  dailyBudgetUsd: 5,
} as const;

/** Model Cek Gratis: Haiku termurah yang ada di daftar harga (pemilik: „hanya menggunakan haiku yg paling murah“). */
export function freeModel(eng: EngineSettings): string {
  const haikus = Object.keys(eng.prices).filter((m) => /haiku/i.test(m));
  const cost = (m: string) => eng.prices[m].in + eng.prices[m].out;
  return haikus.sort((a, b) => cost(a) - cost(b))[0] ?? 'claude-haiku-5-5';
}

export interface FreeCase {
  perPageUsd: number;
  perMemberWeekUsd: number;
  perMemberWeekIdr: number;
  perMemberWeekTokens: number;
  /** Harga jual setara token itu pada markup yang berlaku (untuk ditunjukkan ke member). */
  perMemberWeekRetailIdr: number;
  membersWeekIdr: number;
  membersMonthIdr: number;
}

export interface FreeForecast {
  model: string;
  members: number;
  typical: FreeCase;
  worst: FreeCase;
  /** Paket termurah dan berapa member aktif gratis yang ditutup labanya sebulan (kasus terburuk). */
  breakEven: { pkg: string; priceIdr: number; costIdr: number; membersCoveredPerMonth: number } | null;
  /** Halaman dan kuota member yang muat dalam anggaran harian. */
  budget: { usdPerDay: number; worstPagesPerDay: number; memberQuotasPerWeek: number; neededUsdPerDay: number };
}

/** Prediksi biaya kuota gratis per minggu untuk `members` member aktif yang menghabiskan seluruh kuotanya. */
export function freeQuotaForecast(eng: EngineSettings, b: BillingSettings, members: number): FreeForecast {
  const model = freeModel(eng);
  const p = price(eng, model);
  const q = FREE_QUOTA;
  const usd = (input: number, cached: number, output: number) => (input * p.in + cached * (p.cacheRead ?? p.in) + output * p.out) / 1e6;
  const one = (perPage: number): FreeCase => {
    const week = perPage * q.pagesPerWeek;
    const tokens = tokensFor(week, b);
    return {
      perPageUsd: perPage,
      perMemberWeekUsd: week,
      perMemberWeekIdr: Math.round(week * eng.fx),
      perMemberWeekTokens: tokens,
      perMemberWeekRetailIdr: Math.round(tokens * tokenPriceIdr(b, eng)),
      membersWeekIdr: Math.round(week * members * eng.fx),
      membersMonthIdr: Math.round(((week * members * 52) / 12) * eng.fx),
    };
  };
  const typical = one(usd(q.typicalInPerPage, q.systemTokens, q.typicalOutPerPage));
  const worst = one(usd(q.systemTokens + q.tokensPerPage, 0, q.maxOutPerPage));
  const cheapest = [...b.packages].sort((x, y) => x.tokens - y.tokens)[0];
  let breakEven: FreeForecast['breakEven'] = null;
  if (cheapest) {
    const pp = packagePrice(cheapest, b, eng);
    const perMemberMonth = (worst.perMemberWeekUsd * 52 * eng.fx) / 12;
    breakEven = { pkg: cheapest.name.id, priceIdr: pp.idr, costIdr: pp.costIdr, membersCoveredPerMonth: Math.floor((pp.idr - pp.costIdr) / perMemberMonth) };
  }
  const worstPagesPerDay = Math.floor(q.dailyBudgetUsd / worst.perPageUsd);
  return {
    model,
    members,
    typical,
    worst,
    breakEven,
    budget: {
      usdPerDay: q.dailyBudgetUsd,
      worstPagesPerDay,
      memberQuotasPerWeek: Math.floor((worstPagesPerDay * 7) / q.pagesPerWeek),
      neededUsdPerDay: (worst.perMemberWeekUsd * members) / 7,
    },
  };
}
