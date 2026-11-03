/**
 * Dompet token berbayar — "bayar dulu, lalu otomatis berkurang saat dipakai".
 * Satu dokumen per member, setiap perubahan lewat compare-and-swap. Setiap mutasi uang punya KUNCI
 * IDEMPOTENSI yang dicatat di dokumen dompet yang sama (atomik): mengulang operasi yang sama — karena
 * jaringan putus, cron, atau klik ganda — tidak pernah menambah atau memotong dua kali.
 */
import type { Store } from '../lib/store.ts';

export interface Wallet {
  balance: number;
  updatedAt: number;
  /** Kunci idempotensi terakhir yang sudah diterapkan (maks. 500). */
  applied?: string[];
}

export interface Reservation {
  tokens: number;
  at: number;
}

const key = (uid: string) => `c/wallets/${uid}.json`;
const KEEP = 500;

export class InsufficientError extends Error {
  constructor(readonly available: number, readonly needed: number) {
    super('Token tidak cukup.');
    this.name = 'InsufficientError';
  }
}

export async function getWallet(store: Store, uid: string): Promise<Wallet | null> {
  return store.get<Wallet>(key(uid));
}

export async function balanceOf(store: Store, uid: string): Promise<number> {
  return (await getWallet(store, uid))?.balance ?? 0;
}

/**
 * Satu mutasi atomik. delta < 0 hanya berhasil bila saldo cukup. Mengembalikan:
 *  'applied' (baru diterapkan) · 'duplicate' (kunci sudah pernah diterapkan) · 'insufficient'.
 */
async function mutate(store: Store, uid: string, delta: number, idem: string): Promise<{ result: 'applied' | 'duplicate' | 'insufficient'; balance: number }> {
  let result: 'applied' | 'duplicate' | 'insufficient' = 'applied';
  let balance = 0;
  await store.cas<Wallet>(
    key(uid),
    (cur) => {
      const w: Wallet = cur ?? { balance: 0, updatedAt: 0, applied: [] };
      balance = w.balance;
      if (w.applied?.includes(idem)) {
        result = 'duplicate';
        return null;
      }
      if (delta < 0 && w.balance + delta < 0) {
        result = 'insufficient';
        return null;
      }
      result = 'applied';
      balance = w.balance + delta;
      return { balance, updatedAt: Date.now(), applied: [...(w.applied ?? []), idem].slice(-KEEP) };
    },
    'Dompet token',
  );
  return { result, balance };
}

export async function reserve(store: Store, uid: string, tokens: number, note: string, idem: string): Promise<Reservation> {
  const r = await mutate(store, uid, -tokens, `reserve:${idem}`);
  if (r.result === 'insufficient') throw new InsufficientError(r.balance, tokens);
  if (r.result === 'applied') await store.append(`ledger/${uid}`, { at: Date.now(), kind: 'reserve', tokens: -tokens, note, balance: r.balance });
  return { tokens, at: Date.now() };
}

/** Kembalikan token (sisa pesanan, pemeriksaan gagal). Aman diulang dengan kunci yang sama. */
export async function refund(store: Store, uid: string, tokens: number, note: string, idem: string): Promise<void> {
  if (!(tokens > 0)) return;
  const r = await mutate(store, uid, tokens, `refund:${idem}`);
  if (r.result === 'applied') await store.append(`ledger/${uid}`, { at: Date.now(), kind: 'refund', tokens, note, balance: r.balance });
}

/** Tambah token (pembelian, koreksi admin, sambutan, tukar komisi). Aman diulang dengan kunci yang sama. */
export async function credit(store: Store, uid: string, tokens: number, kind: 'purchase' | 'admin' | 'welcome', note: string, idem: string, by?: string): Promise<boolean> {
  if (tokens === 0) return false;
  const r = await mutate(store, uid, tokens, `${kind}:${idem}`);
  if (r.result === 'insufficient') return false;
  if (r.result === 'applied') await store.append(`ledger/${uid}`, { at: Date.now(), kind, tokens, note, by, balance: r.balance });
  return r.result === 'applied';
}

export async function wasApplied(store: Store, uid: string, idem: string): Promise<boolean> {
  return Boolean((await getWallet(store, uid))?.applied?.includes(idem));
}

export interface LedgerEntry {
  at: number;
  kind: string;
  tokens: number;
  note: string;
  balance?: number;
}

export async function ledger(store: Store, uid: string, limit = 30): Promise<LedgerEntry[]> {
  const { items } = await store.list(`l/ledger/${uid}/`, { limit });
  const out: LedgerEntry[] = [];
  for (const it of items) {
    const e = await store.get<LedgerEntry>(it.key);
    if (e) out.push(e);
  }
  return out;
}
