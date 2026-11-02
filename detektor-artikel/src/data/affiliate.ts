/**
 * Program afiliasi (pemilik, 2 Nov 2026: "Bikin sistem affiliate ya komisi 15%").
 * Komisi = persen (bawaan 15%) dari setiap pesanan token yang LUNAS milik member yang direferensikan,
 * dicatat tepat sekali per pesanan (create-once), bisa ditukar token atau dicairkan lewat persetujuan admin.
 * Anti-curang: referal terikat sekali saat daftar, tidak bisa mereferensikan diri sendiri (akun maupun IP sama).
 */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { newId } from '../lib/crypto.ts';

export interface AffiliateSettings {
  enabled: boolean;
  ratePct: number;
  minPayoutIdr: number;
  cookieDays: number;
}

export const DEFAULT_AFFILIATE: AffiliateSettings = { enabled: true, ratePct: 15, minPayoutIdr: 100_000, cookieDays: 30 };

export async function getAffiliateSettings(store: Store): Promise<AffiliateSettings> {
  const s = await store.get<Partial<AffiliateSettings>>('k/affiliate.json');
  const out = { ...DEFAULT_AFFILIATE, ...s };
  out.ratePct = Math.min(50, Math.max(0, out.ratePct));
  return out;
}

export interface Affiliate {
  uid: string;
  code: string;
  balanceIdr: number;
  totalIdr: number;
  paidIdr: number;
  convertedIdr: number;
  referred: number;
  createdAt: number;
  /** Pesanan yang komisinya sudah dicatat (atomik bersama saldo). */
  applied?: string[];
}

const affKey = (uid: string) => `c/affiliates/${uid}.json`;

const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export async function ensureAffiliate(store: Store, uid: string): Promise<Affiliate> {
  const have = await store.get<Affiliate>(affKey(uid));
  if (have) return have;
  for (let i = 0; i < 8; i += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(7));
    const code = Array.from(bytes, (b) => ALPHA[b % ALPHA.length]).join('');
    if (await store.createOnce(`u/refcode/${code}`, { uid })) {
      const a: Affiliate = { uid, code, balanceIdr: 0, totalIdr: 0, paidIdr: 0, convertedIdr: 0, referred: 0, createdAt: Date.now() };
      if (await store.createOnce(affKey(uid), a)) return a;
      await store.del(`u/refcode/${code}`);
      return (await store.get<Affiliate>(affKey(uid)))!;
    }
  }
  throw new Error('Tidak bisa membuat kode afiliasi.');
}

export async function getAffiliate(store: Store, uid: string): Promise<Affiliate | null> {
  return store.get<Affiliate>(affKey(uid));
}

export async function uidForCode(store: Store, code: string): Promise<string | null> {
  if (!/^[A-Z0-9]{5,12}$/.test(code)) return null;
  return (await store.get<{ uid: string }>(`u/refcode/${code}`))?.uid ?? null;
}

export async function noteReferral(store: Store, refUid: string, newUid: string): Promise<void> {
  await store.cas<Affiliate>(affKey(refUid), (a) => (a ? { ...a, referred: a.referred + 1 } : null), 'Afiliasi');
  await store.createOnce(`i/referrals/${refUid}/${invTs()}~${newUid}`, {}, { at: Date.now() });
}

/** Komisi atas satu pesanan lunas — tepat sekali (penjaga u/commission/<order>). */
export async function payCommission(store: Store, refUid: string, orderId: string, buyerEmail: string, priceIdr: number, ratePct: number): Promise<number> {
  const amount = Math.floor((priceIdr * ratePct) / 100);
  if (amount <= 0) return 0;
  await ensureAffiliate(store, refUid);
  let applied = false;
  await store.cas<Affiliate>(
    affKey(refUid),
    (a) => {
      applied = false;
      if (!a || a.applied?.includes(orderId)) return null;
      applied = true;
      return { ...a, balanceIdr: a.balanceIdr + amount, totalIdr: a.totalIdr + amount, applied: [...(a.applied ?? []), orderId].slice(-2000) };
    },
    'Afiliasi',
  );
  if (!applied) return 0;
  const masked = buyerEmail.replace(/^(.{2}).*(@.*)$/, '$1***$2');
  await store.append(`aff/${refUid}`, { at: Date.now(), kind: 'commission', idr: amount, note: `${ratePct}% × pesanan ${orderId} (${masked})` });
  return amount;
}

/** Kurangi saldo komisi (tukar token / pencairan). Mengembalikan false bila saldo kurang. */
export async function debitAffiliate(store: Store, uid: string, idr: number, field: 'paidIdr' | 'convertedIdr', note: string): Promise<boolean> {
  let ok = false;
  await store.cas<Affiliate>(
    affKey(uid),
    (a) => {
      ok = false;
      if (!a || a.balanceIdr < idr || idr <= 0) return null;
      ok = true;
      return { ...a, balanceIdr: a.balanceIdr - idr, [field]: a[field] + idr };
    },
    'Afiliasi',
  );
  if (ok) await store.append(`aff/${uid}`, { at: Date.now(), kind: field === 'paidIdr' ? 'payout' : 'convert', idr: -idr, note });
  return ok;
}

export async function creditAffiliateBack(store: Store, uid: string, idr: number, note: string): Promise<void> {
  await store.cas<Affiliate>(affKey(uid), (a) => (a ? { ...a, balanceIdr: a.balanceIdr + idr, paidIdr: Math.max(0, a.paidIdr - idr) } : null), 'Afiliasi');
  await store.append(`aff/${uid}`, { at: Date.now(), kind: 'payout_rejected', idr, note });
}

export interface Payout {
  id: string;
  uid: string;
  email: string;
  idr: number;
  bank: string;
  status: 'requested' | 'paid' | 'rejected';
  createdAt: number;
  doneAt?: number;
  by?: string;
}

export async function requestPayout(store: Store, uid: string, email: string, idr: number, bank: string): Promise<Payout | null> {
  const id = newId('pay');
  if (!(await debitAffiliate(store, uid, idr, 'paidIdr', `Permintaan pencairan ${id}`))) return null;
  const p: Payout = { id, uid, email, idr, bank: bank.slice(0, 300), status: 'requested', createdAt: Date.now() };
  await store.put(`c/payouts/${id}.json`, p);
  await store.createOnce(`i/payouts/${invTs(p.createdAt)}~${id}`, {}, { uid, email, idr, at: p.createdAt });
  return p;
}
