/** Tagihan dan bukti bayar: dokumen per tagihan, indeks antrean admin dan indeks per member; berkas bukti privat di R2. */
import type { Store } from '../lib/store.ts';
import { invTs } from '../lib/store.ts';
import { newId } from '../lib/crypto.ts';
import { wibDate } from '../lib/i18n.ts';
import type { Course, Currency, Invoice, InvoiceStatus, Pricing, ProofFile, Tier } from './model.ts';
import { priceFor } from './model.ts';

export const invKey = (id: string) => `c/invoices/${id}.json`;
const openIdx = (createdAt: number, id: string) => `i/inv-open/${invTs(createdAt)}~${id}`;
const userIdx = (uid: string, createdAt: number, id: string) => `i/inv-user/${uid}/${invTs(createdAt)}~${id}`;
/** Indeks semua tagihan (ringkasan status untuk admin & laporan pendapatan); ditulis ulang saat status berubah. */
const allIdx = (createdAt: number, id: string) => `i/inv-all/${invTs(createdAt)}~${id}`;
const touchAll = (store: Store, inv: Invoice) => store.put(allIdx(inv.createdAt, inv.id), {}, { number: inv.number, status: inv.status, amount: inv.amount, currency: inv.currency ?? 'IDR', userId: inv.userId, decidedAt: inv.decidedAt ?? 0 });

/** Tagihan lama (sebelum ada mata uang) dianggap Rupiah. */
export const getInvoice = async (store: Store, id: string): Promise<Invoice | null> => {
  const inv = await store.get<Invoice>(invKey(id));
  return inv ? { ...inv, currency: inv.currency ?? 'IDR' } : null;
};

/** Nomor tagihan berurutan per tahun dihitung dari penghitung CAS (satu tulis per tagihan, tidak panas). */
async function nextNumber(store: Store): Promise<string> {
  const year = wibDate().slice(0, 4);
  const doc = await store.cas<{ n: number }>(`k/inv-seq-${year}.json`, (cur) => ({ n: (cur?.n ?? 0) + 1 }), 'Nomor tagihan');
  return `LJ-${year}-${String(doc?.n ?? 1).padStart(6, '0')}`;
}

export async function createInvoice(store: Store, userId: string, courses: Course[], tier: Tier, pricing: Pricing, currency: Currency = 'IDR'): Promise<Invoice> {
  const uniq = [...new Set(courses)];
  if (!uniq.length) throw new Error('Pilih minimal satu bahasa.');
  const inv: Invoice = {
    id: newId('inv'),
    number: await nextNumber(store),
    userId,
    courses: uniq,
    tier,
    amount: priceFor(pricing, tier, uniq, currency),
    currency,
    status: 'unpaid',
    createdAt: Date.now(),
    files: [],
  };
  await store.put(invKey(inv.id), inv);
  await store.createOnce(userIdx(userId, inv.createdAt, inv.id), {}, { number: inv.number, status: inv.status, amount: inv.amount });
  await touchAll(store, inv);
  return inv;
}

export async function listUserInvoices(store: Store, uid: string): Promise<Invoice[]> {
  const { items } = await store.list(`i/inv-user/${uid}/`, { limit: 50 });
  const docs = await Promise.all(items.map((i) => getInvoice(store, i.id)));
  return docs.filter((d): d is Invoice => Boolean(d));
}

export async function listOpenInvoices(store: Store, limit = 100): Promise<Invoice[]> {
  const { items } = await store.list('i/inv-open/', { limit });
  const docs = await Promise.all(items.map((i) => getInvoice(store, i.id)));
  return docs.filter((d): d is Invoice => Boolean(d && d.status === 'review'));
}

export const proofKey = (invoiceId: string, name: string) => `p/proof/${invoiceId}/${name}`;

/** Member mengunggah bukti: status → review dan masuk antrean admin. Bisa diulang setelah ditolak. */
export async function submitProof(store: Store, inv: Invoice, files: ProofFile[], note: string): Promise<Invoice> {
  const next = await store.cas<Invoice>(invKey(inv.id), (cur) => {
    if (!cur || (cur.status !== 'unpaid' && cur.status !== 'rejected')) return null;
    return { ...cur, status: 'review', submittedAt: Date.now(), files: [...cur.files, ...files], note: note.slice(0, 500), reason: undefined };
  }, 'Tagihan');
  if (!next || next.status !== 'review') throw new Error('Tagihan ini tidak bisa menerima bukti lagi.');
  await store.createOnce(openIdx(next.submittedAt!, next.id), {}, { number: next.number, userId: next.userId, amount: next.amount });
  await touchAll(store, next);
  return next;
}

export async function decideInvoice(store: Store, id: string, status: Extract<InvoiceStatus, 'approved' | 'rejected'>, by: string, reason: string, days: number): Promise<Invoice | null> {
  const next = await store.cas<Invoice>(invKey(id), (cur) => {
    if (!cur || cur.status !== 'review') return null;
    const now = Date.now();
    return { ...cur, status, decidedAt: now, decidedBy: by, reason: reason.slice(0, 500) || undefined, ...(status === 'approved' ? { activeFrom: now, activeUntil: now + days * 86_400_000 } : {}) };
  }, 'Tagihan');
  if (next && next.status !== 'review') {
    // keluarkan dari antrean admin
    const { items } = await store.list('i/inv-open/', { limit: 1000 });
    await store.del(items.filter((i) => i.id === id).map((i) => i.key));
    await touchAll(store, next);
  }
  return next;
}

export async function cancelInvoice(store: Store, id: string, uid: string): Promise<boolean> {
  const next = await store.cas<Invoice>(invKey(id), (cur) => (cur && cur.userId === uid && cur.status === 'unpaid' ? { ...cur, status: 'cancelled' } : null), 'Tagihan');
  if (next?.status === 'cancelled') await touchAll(store, next);
  return next?.status === 'cancelled';
}

export async function listAllInvoices(store: Store, limit = 200): Promise<{ id: string; number: string; status: string; amount: number; currency: Currency; userId: string; decidedAt: number }[]> {
  const { items } = await store.list<{ number: string; status: string; amount: number; currency?: Currency; userId: string; decidedAt: number }>('i/inv-all/', { limit });
  return items.map((i) => ({ id: i.id, number: i.meta.number, status: i.meta.status, amount: Number(i.meta.amount ?? 0), currency: i.meta.currency ?? 'IDR', userId: i.meta.userId, decidedAt: Number(i.meta.decidedAt ?? 0) }));
}

/**
 * Pembayaran otomatis (PayPal / Stripe) terkonfirmasi: unpaid/review/rejected → approved, idempoten. Mengembalikan tagihan
 * (sudah approved) atau null bila tidak ditemukan / dibatalkan. Pemanggil lalu memberi langganan (grantSubs, idempoten).
 */
export type PaidInfo = { method: 'paypal'; paypal: NonNullable<Invoice['paypal']> } | { method: NonNullable<Invoice['gateway']>['id']; gateway: NonNullable<Invoice['gateway']> };

export async function markPaid(store: Store, id: string, days: number, info: PaidInfo): Promise<Invoice | null> {
  const now = Date.now();
  const next = await store.cas<Invoice>(invKey(id), (cur) => {
    if (!cur || cur.status === 'approved' || cur.status === 'cancelled') return null;
    const detail = info.method === 'paypal' ? { paypal: info.paypal } : { gateway: info.gateway };
    return { ...cur, ...detail, currency: cur.currency ?? 'IDR', status: 'approved', method: info.method, paidAt: now, decidedAt: now, decidedBy: info.method, activeFrom: now, activeUntil: now + days * 86_400_000, reason: undefined };
  }, 'Tagihan');
  if (!next || next.status !== 'approved') return next ?? null;
  const { items } = await store.list('i/inv-open/', { limit: 1000 });
  await store.del(items.filter((i) => i.id === id).map((i) => i.key));
  await touchAll(store, next);
  return next;
}

/** Simpan id order PayPal pada tagihan (sebelum pembeli menyetujui). */
export async function attachPaypalOrder(store: Store, id: string, orderId: string, mode: 'live' | 'sandbox'): Promise<void> {
  await store.cas<Invoice>(invKey(id), (cur) => (cur && cur.status !== 'approved' ? { ...cur, paypal: { orderId, mode } } : null), 'Tagihan');
}

/** Simpan referensi pembayaran gerbang (Stripe/Xendit/Midtrans) pada tagihan sebelum pembeli membayar. */
export async function attachGateway(store: Store, id: string, gateway: NonNullable<Invoice['gateway']>): Promise<void> {
  await store.cas<Invoice>(invKey(id), (cur) => (cur && cur.status !== 'approved' ? { ...cur, gateway } : null), 'Tagihan');
}
