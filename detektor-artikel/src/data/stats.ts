/**
 * Rekap pemakaian & keuangan per member (pemilik, 8 Nov 2026: „Di simpan d portal member sendiri dan di portal admin, agar
 * admin tau sudah berapa token yg d keluarkan, berapa yg di bayar dan berapa profitnya“; docs/MASTER-BLUEPRINT.md §27).
 *
 * Satu dokumen per member `u/stats/{uid}.json`, ditambah sekali per kejadian (penanda create-once mencegah hitung ganda):
 * pemeriksaan selesai/gagal (settleCheck), sesi lomba diselesaikan (settleBatch), pesanan lunas (completeOrder), deposit
 * ditukar token. Tidak pernah dihapus. Biaya AI, komisi, dan laba hanya untuk portal admin (rahasia perusahaan); member
 * melihat pembayaran, token dibeli, token terpakai, dan jumlah pemeriksaannya sendiri.
 */
import type { Store } from '../lib/store.ts';

export interface MemberStats {
  v: 1;
  /** Pemeriksaan selesai (termasuk Cek Gratis). */
  checks: number;
  freeChecks: number;
  /** Token yang benar-benar dipotong (pemeriksaan + sesi lomba). */
  tokensUsed: number;
  /** Token masuk dari pembelian (pesanan paket + tukar deposit). */
  tokensBought: number;
  /** Uang diterima dari pesanan lunas (paket token & isi deposit). */
  paidIdr: number;
  paidUsd: number;
  /** Biaya AI nyata semua pemeriksaannya (termasuk Cek Gratis & yang gagal), US$. */
  costUsd: number;
  freeCostUsd: number;
  /** Biaya AI yang tidak dikeluarkan karena hasil tersimpan (§26), US$. */
  savedUsd: number;
  /** Komisi afiliasi yang dibayarkan karena pesanan member ini. */
  commissionIdr: number;
  /** Isi saldo deposit (Rupiah) dari pesanan deposit yang lunas. */
  depositTopupIdr: number;
  /** Saldo deposit yang ditukar menjadi token (beli paket dari deposit + tukar bebas) dan token yang dihasilkannya. */
  depositToTokensIdr: number;
  tokensFromDeposit: number;
  firstAt?: number;
  lastAt?: number;
  rebuiltAt?: number;
}

export const statsKey = (uid: string) => `u/stats/${uid}.json`;

export const emptyStats = (): MemberStats => ({
  v: 1, checks: 0, freeChecks: 0, tokensUsed: 0, tokensBought: 0, paidIdr: 0, paidUsd: 0, costUsd: 0, freeCostUsd: 0, savedUsd: 0, commissionIdr: 0,
  depositTopupIdr: 0, depositToTokensIdr: 0, tokensFromDeposit: 0,
});

export async function getStats(store: Store, uid: string): Promise<MemberStats> {
  return { ...emptyStats(), ...((await store.get<MemberStats>(statsKey(uid))) ?? {}) };
}

type Delta = Partial<Omit<MemberStats, 'v' | 'firstAt' | 'lastAt' | 'rebuiltAt'>>;

/** Menambah rekap sekali per `once` (kunci penanda). Aman diulang. */
export async function addStats(store: Store, uid: string, once: string, d: Delta, at = Date.now()): Promise<void> {
  if (!(await store.createOnce(`u/stats-once/${once}`, { at }))) return;
  await store.cas<MemberStats>(statsKey(uid), (cur) => {
    const s = { ...emptyStats(), ...(cur ?? {}) };
    for (const [k, v] of Object.entries(d) as [keyof Delta, number][]) {
      if (typeof v === 'number' && Number.isFinite(v)) (s[k] as number) = Math.round(((s[k] as number) + v) * 1e6) / 1e6;
    }
    s.firstAt = Math.min(s.firstAt ?? at, at);
    s.lastAt = Math.max(s.lastAt ?? at, at);
    return s;
  }, 'Rekap member');
}

/** Angka admin: pendapatan, nilai token terpakai, biaya AI, dan laba (Rupiah, kurs dari Admin → Mesin). */
export function money(s: MemberStats, fx: number) {
  const revenueIdr = s.paidIdr + s.paidUsd * fx;
  const costIdr = s.costUsd * fx;
  const perToken = s.tokensBought > 0 ? revenueIdr / s.tokensBought : 0;
  const usedValueIdr = Math.min(revenueIdr, s.tokensUsed * perToken);
  const usedShare = s.tokensBought > 0 ? Math.min(1, s.tokensUsed / s.tokensBought) : 0;
  return {
    revenueIdr,
    costIdr,
    perToken,
    usedValueIdr,
    savedIdr: s.savedUsd * fx,
    /** Laba kas: semua uang masuk − biaya AI − komisi. */
    cashProfitIdr: revenueIdr - costIdr - s.commissionIdr,
    /** Laba atas token terpakai: nilai token yang sudah dipakai − biaya AI − bagian komisinya. */
    usedProfitIdr: usedValueIdr - costIdr - s.commissionIdr * usedShare,
  };
}

/** Jumlah semua member (untuk dasbor keuangan admin). */
export function sumStats(all: MemberStats[]): MemberStats {
  const t = emptyStats();
  for (const s of all) {
    for (const k of Object.keys(t) as (keyof MemberStats)[]) {
      if (k === 'v') continue;
      if (typeof s[k] === 'number' && typeof t[k] === 'number' && k !== 'firstAt' && k !== 'lastAt' && k !== 'rebuiltAt') (t[k] as number) += s[k] as number;
    }
  }
  return t;
}
