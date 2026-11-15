/** Pengaturan & konten situs dari R2 (semua teks publik dinamis dari admin), dengan bawaan di model.ts. */
import type { Store } from '../lib/store.ts';
import { CURRENCIES, DEFAULT_PAYMENT, DEFAULT_PRICING, DEFAULT_SITE, METHOD_TEMPLATES, type Currency, type PayMethod, type Payment, type Pricing, type SiteContent } from './model.ts';

export const SITE_DOC = 'k/site.json';
export const PRICING_DOC = 'k/pricing.json';
export const PAYMENT_DOC = 'k/payment.json';

function merge<T extends object>(base: T, over: Partial<T> | null): T {
  if (!over) return structuredClone(base);
  const out = structuredClone(base) as Record<string, unknown>;
  for (const [k, v] of Object.entries(over)) {
    const cur = out[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && cur && typeof cur === 'object' && !Array.isArray(cur)) out[k] = merge(cur as object, v as object);
    else if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export async function getSite(store: Store): Promise<SiteContent> {
  return merge(DEFAULT_SITE, await store.get<Partial<SiteContent>>(SITE_DOC));
}

export async function getPricing(store: Store): Promise<Pricing> {
  return merge(DEFAULT_PRICING, await store.get<Partial<Pricing>>(PRICING_DOC));
}

/** Dokumen rekening versi pertama (SeaBank + BNI tetap) — dibaca sekali lalu diubah ke daftar metode. */
interface LegacyPayment { bank?: string; account?: string; holder?: string; note?: string; whatsapp?: string; bni?: { name: string; swift: string; code: string; holder: string; address: string; accounts: Record<Currency, string> } }

function fromLegacy(o: LegacyPayment): PayMethod[] {
  const base = { bankName: '', swift: '', code: '', address: '', instructions: '' };
  const out: PayMethod[] = [];
  if (o.bank && o.account) out.push({ ...base, id: 'seabank', kind: 'bank', name: o.bank, currencies: ['IDR'], account: o.account, holder: o.holder ?? '', enabled: true });
  if (o.bni) {
    const b = o.bni;
    for (const cur of CURRENCIES) {
      if (!b.accounts?.[cur]) continue;
      out.push({ id: `bni-${cur.toLowerCase()}`, kind: cur === 'IDR' ? 'bank' : 'swift', name: cur === 'IDR' ? 'BNI' : `BNI (${cur})`, currencies: [cur], account: b.accounts[cur], holder: b.holder, bankName: b.name, swift: b.swift, code: b.code, address: b.address, instructions: '', enabled: true });
    }
  }
  return [...out, ...structuredClone(METHOD_TEMPLATES)];
}

export function normalizePayment(doc: (Partial<Payment> & LegacyPayment) | null): Payment {
  if (!doc) return structuredClone(DEFAULT_PAYMENT);
  const methods = Array.isArray(doc.methods) ? doc.methods : fromLegacy(doc);
  return { methods, note: doc.note ?? DEFAULT_PAYMENT.note, whatsapp: doc.whatsapp ?? '' };
}

export async function getPayment(store: Store): Promise<Payment> {
  return normalizePayment(await store.get<Partial<Payment> & LegacyPayment>(PAYMENT_DOC));
}

/** Ubah rekening secara compare-and-swap (dua admin menyimpan bersamaan tidak saling menimpa). */
export async function updatePayment(store: Store, fn: (p: Payment) => Payment): Promise<Payment> {
  const out = await store.cas<Payment & { updatedAt?: number }>(PAYMENT_DOC, (cur) => ({ ...fn(normalizePayment(cur as (Partial<Payment> & LegacyPayment) | null)), updatedAt: Date.now() }), 'Rekening');
  return normalizePayment(out);
}

export async function saveDoc<T>(store: Store, key: string, value: T): Promise<void> {
  await store.put(key, { ...(value as object), updatedAt: Date.now() });
}
