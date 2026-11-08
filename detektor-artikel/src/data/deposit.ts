/**
 * Saldo deposit Rupiah (pemilik, 2 Nov 2026): member bisa mengisi saldo Rupiah lewat transfer (diverifikasi admin),
 * lalu membeli paket token atau menukar saldo menjadi token kapan saja. Saldo deposit TIDAK bisa diuangkan.
 *
 * Harga token saat menukar mengikuti markup yang ditetapkan perusahaan (rahasia — yang tampil ke member hanya
 * "1 token = Rp X"). Setiap mutasi atomik (CAS) dan idempoten (kunci di dokumen yang sama), seperti dompet token.
 *
 * Membeli token dari deposit melibatkan dua dokumen (deposit & dompet token). Urutannya: jurnal operasi dibuat
 * (create-once) → deposit dipotong (kunci `buy:<op>`) → token dikreditkan (kunci `dep:<op>`) → jurnal ditutup.
 * Bila Worker berhenti di tengah, cron menyelesaikan ke depan: deposit yang sudah terpotong SELALU berbuah token
 * (kredit idempoten), operasi yang belum memotong deposit dibatalkan. Tidak ada uang member yang bisa hilang.
 */
import { addStats } from './stats.ts';
import type { Store } from '../lib/store.ts';
import { credit } from './wallet.ts';

export interface Deposit {
  balanceIdr: number;
  totalIdr: number;
  updatedAt: number;
  applied?: string[];
}

export interface DepositOp {
  id: string;
  uid: string;
  idr: number;
  tokens: number;
  note: string;
  state: 'started' | 'done' | 'aborted';
  createdAt: number;
}

export interface DepositEntry {
  at: number;
  kind: 'topup' | 'buy' | 'convert' | 'refund' | 'admin';
  idr: number;
  note: string;
  balance: number;
}

const key = (uid: string) => `c/deposits/${uid}.json`;
const opKey = (id: string) => `c/deposit-ops/${id}.json`;
const openKey = (id: string) => `i/deposit-ops-open/${id}`;
const KEEP = 500;

export async function getDeposit(store: Store, uid: string): Promise<Deposit> {
  return (await store.get<Deposit>(key(uid))) ?? { balanceIdr: 0, totalIdr: 0, updatedAt: 0, applied: [] };
}

export async function depositBalance(store: Store, uid: string): Promise<number> {
  return (await getDeposit(store, uid)).balanceIdr;
}

type Result = 'applied' | 'duplicate' | 'insufficient';

async function mutate(store: Store, uid: string, delta: number, idem: string): Promise<{ result: Result; balance: number }> {
  if (!Number.isInteger(delta)) throw new Error('Nilai deposit harus bilangan bulat Rupiah.');
  let result: Result = 'applied';
  let balance = 0;
  await store.cas<Deposit>(
    key(uid),
    (cur) => {
      const d: Deposit = cur ?? { balanceIdr: 0, totalIdr: 0, updatedAt: 0, applied: [] };
      balance = d.balanceIdr;
      if (d.applied?.includes(idem)) {
        result = 'duplicate';
        return null;
      }
      if (delta < 0 && d.balanceIdr + delta < 0) {
        result = 'insufficient';
        return null;
      }
      result = 'applied';
      balance = d.balanceIdr + delta;
      return { balanceIdr: balance, totalIdr: d.totalIdr + (delta > 0 && idem.startsWith('topup:') ? delta : 0), updatedAt: Date.now(), applied: [...(d.applied ?? []), idem].slice(-KEEP) };
    },
    'Saldo deposit',
  );
  return { result, balance };
}

async function log(store: Store, uid: string, e: Omit<DepositEntry, 'at'>): Promise<void> {
  await store.append(`dep/${uid}`, { at: Date.now(), ...e });
}

/** Isi saldo dari pesanan deposit yang disetujui admin. Idempoten per nomor pesanan. */
export async function topUp(store: Store, uid: string, idr: number, orderId: string, note: string): Promise<boolean> {
  if (!(idr > 0)) return false;
  const r = await mutate(store, uid, Math.round(idr), `topup:${orderId}`);
  if (r.result === 'applied') await log(store, uid, { kind: 'topup', idr: Math.round(idr), note, balance: r.balance });
  return r.result === 'applied';
}

/** Koreksi admin (+/−), idempoten per kunci. */
export async function adminAdjust(store: Store, uid: string, idr: number, note: string, idem: string): Promise<Result> {
  const r = await mutate(store, uid, Math.round(idr), `admin:${idem}`);
  if (r.result === 'applied') await log(store, uid, { kind: 'admin', idr: Math.round(idr), note, balance: r.balance });
  return r.result;
}

export class DepositInsufficientError extends Error {
  constructor(readonly available: number, readonly needed: number) {
    super('Saldo deposit tidak cukup.');
    this.name = 'DepositInsufficientError';
  }
}

/**
 * Tukar saldo deposit menjadi token (beli paket atau tukar bebas). `opId` dibuat pemanggil sekali per klik,
 * jadi klik ganda/ulang tidak pernah memotong dua kali.
 */
export async function spendForTokens(store: Store, uid: string, opId: string, idr: number, tokens: number, kind: 'buy' | 'convert', note: string): Promise<'done' | 'duplicate'> {
  if (!Number.isInteger(idr) || idr <= 0 || !Number.isInteger(tokens) || tokens <= 0) throw new Error('Nilai penukaran tidak sah.');
  const fresh: DepositOp = { id: opId, uid, idr, tokens, note, state: 'started', createdAt: Date.now() };
  let op = fresh;
  if (await store.createOnce(opKey(opId), fresh)) {
    await store.put(openKey(opId), {}, { uid, at: fresh.createdAt });
  } else {
    // Nomor operasi yang sama dikirim ulang: selalu pakai nilai yang tersimpan (bukan nilai dari permintaan ini),
    // dan operasi yang sudah dibatalkan tidak pernah dijalankan lagi.
    const ex = await store.get<DepositOp>(opKey(opId));
    if (!ex || ex.uid !== uid || ex.state === 'aborted') throw new DepositInsufficientError(0, idr);
    op = ex;
  }
  ({ idr, tokens, note } = op);
  const r = await mutate(store, uid, -idr, `buy:${opId}`);
  if (r.result === 'insufficient') {
    await store.cas<DepositOp>(opKey(opId), (o) => (o && o.state === 'started' ? { ...o, state: 'aborted' } : null));
    await store.del(openKey(opId));
    throw new DepositInsufficientError(r.balance, idr);
  }
  if (r.result === 'duplicate') {
    // Kunci sudah ada: bisa klik ulang yang sah (deposit sudah terpotong → token dikreditkan idempoten), atau
    // operasi yang sudah dibatalkan cron (penanda tanpa potongan) → tidak boleh menghasilkan token.
    const cur = await store.get<DepositOp>(opKey(opId));
    if (!cur || cur.state === 'aborted') throw new DepositInsufficientError(r.balance, idr);
  }
  if (r.result === 'applied') await log(store, uid, { kind, idr: -idr, note: `${note} → ${tokens} token`, balance: r.balance });
  await credit(store, uid, tokens, 'purchase', note, `dep:${opId}`);
  await addStats(store, uid, `dep:${opId}`, { tokensBought: tokens, tokensFromDeposit: tokens, depositToTokensIdr: idr });
  await store.cas<DepositOp>(opKey(opId), (o) => (o && o.state === 'started' ? { ...o, state: 'done' } : null));
  await store.del(openKey(opId));
  return r.result === 'applied' ? 'done' : 'duplicate';
}

/** Cron: selesaikan operasi yang terputus (lihat penjelasan di atas). */
export async function repairDepositOps(store: Store, olderThanMs = 5 * 60_000): Promise<number> {
  const { items } = await store.list<{ uid: string; at: number }>('i/deposit-ops-open/', { limit: 100 });
  let fixed = 0;
  for (const it of items) {
    const op = await store.get<DepositOp>(opKey(it.id));
    if (!op || op.state !== 'started') {
      await store.del(it.key);
      continue;
    }
    if (Date.now() - op.createdAt < olderThanMs) continue;
    const d = await getDeposit(store, op.uid);
    if (d.applied?.includes(`buy:${op.id}`)) {
      await credit(store, op.uid, op.tokens, 'purchase', op.note, `dep:${op.id}`);
      await addStats(store, op.uid, `dep:${op.id}`, { tokensBought: op.tokens, tokensFromDeposit: op.tokens, depositToTokensIdr: op.idr });
      await store.cas<DepositOp>(opKey(op.id), (o) => (o && o.state === 'started' ? { ...o, state: 'done' } : null));
    } else {
      // Deposit belum terpotong: tutup operasinya, lalu pastikan tidak ada potongan yang menyusul dengan kunci ini.
      await store.cas<DepositOp>(opKey(op.id), (o) => (o && o.state === 'started' ? { ...o, state: 'aborted' } : null));
      await mutate(store, op.uid, 0, `buy:${op.id}`);
    }
    await store.del(it.key);
    fixed += 1;
  }
  return fixed;
}

export async function depositLedger(store: Store, uid: string, limit = 30): Promise<DepositEntry[]> {
  const { items } = await store.list(`l/dep/${uid}/`, { limit });
  const out: DepositEntry[] = [];
  for (const it of items) {
    const e = await store.get<DepositEntry>(it.key);
    if (e) out.push(e);
  }
  return out;
}
