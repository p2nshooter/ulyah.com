/**
 * Gerbang pembayaran otomatis berbasis halaman pembayaran (redirect): Stripe (kartu internasional), Xendit dan Midtrans
 * (VA bank, QRIS, e-wallet, kartu — Indonesia). Semuanya tersembunyi dari member sampai pengelola mengisi kunci di
 * Admin → Gerbang otomatis dan menyalakannya. Kunci rahasia & token webhook disegel dengan MASTER_KEY sebelum disimpan di R2.
 *
 * Alur yang sama untuk ketiganya: server membuat pembayaran (referensi = id tagihan) → pembeli membayar di halaman gerbang →
 * kembali ke /api/bayar/<gerbang>/kembali/<tagihan> (server menanyakan status ke API gerbang) dan/atau webhook
 * /api/bayar/<gerbang>/webhook (diverifikasi, lalu status dibaca ulang dari API) → tagihan lunas bila status lunas,
 * tagihan, mata uang dan nominal cocok. Keduanya idempoten.
 */
import type { Store } from '../lib/store.ts';
import { seal, unseal, timingSafeEqual, type Sealed } from '../lib/crypto.ts';
import type { Currency, Invoice } from './model.ts';

export type GwId = 'stripe' | 'xendit' | 'midtrans';
export const GATEWAYS: GwId[] = ['stripe', 'xendit', 'midtrans'];
export type GwMode = 'live' | 'test';
export interface GwCreds { pub: string; secret?: Sealed; hook?: Sealed }
export interface GwConfig { enabled: boolean; mode: GwMode; currencies: Currency[]; live: GwCreds; test: GwCreds; updatedAt?: number }

export class GwError extends Error {}

interface Meta {
  name: string;
  /** Kalimat untuk pembeli di halaman tagihan. */
  buyer: string;
  button: string;
  /** Mata uang yang didukung gerbang; pengelola memilih sebagian. */
  supports: Currency[];
  pub: { label: string; required: boolean; pattern: Record<GwMode, RegExp>; example: Record<GwMode, string> };
  secret: { label: string; pattern: Record<GwMode, RegExp>; example: Record<GwMode, string> };
  hook: { label: string; required: boolean; pattern?: RegExp; hint: string } | null;
  /** Bisa mendaftarkan webhook lewat API (tombol di admin). */
  autoHook: boolean;
  setup: string;
}

export const GW_META: Record<GwId, Meta> = {
  stripe: {
    name: 'Stripe', buyer: 'Visa, Mastercard, American Express, JCB dan dompet digital yang didukung, melalui halaman aman Stripe.', button: 'Bayar dengan kartu (Stripe)',
    supports: ['USD', 'JPY', 'IDR'],
    pub: { label: 'Publishable key', required: false, pattern: { live: /^pk_live_/, test: /^pk_test_/ }, example: { live: 'pk_live_…', test: 'pk_test_…' } },
    secret: { label: 'Secret key', pattern: { live: /^(sk|rk)_live_/, test: /^(sk|rk)_test_/ }, example: { live: 'sk_live_… / rk_live_…', test: 'sk_test_… / rk_test_…' } },
    hook: { label: 'Rahasia webhook (signing secret)', required: true, pattern: /^whsec_/, hint: 'whsec_… — atau tekan „Daftarkan webhook“ agar terisi otomatis.' },
    autoHook: true,
    setup: 'Dasbor Stripe → Developers → API keys. Webhook dapat didaftarkan otomatis dari halaman ini.',
  },
  xendit: {
    name: 'Xendit', buyer: 'Virtual account bank, QRIS, e-wallet (OVO, DANA, ShopeePay, LinkAja) dan kartu, melalui halaman aman Xendit.', button: 'Bayar via Xendit (VA, QRIS, e-wallet, kartu)',
    supports: ['IDR', 'USD'],
    pub: { label: 'Public key (opsional)', required: false, pattern: { live: /^xnd_public_production_/, test: /^xnd_public_development_/ }, example: { live: 'xnd_public_production_…', test: 'xnd_public_development_…' } },
    secret: { label: 'Secret API key', pattern: { live: /^xnd_production_/, test: /^xnd_development_/ }, example: { live: 'xnd_production_…', test: 'xnd_development_…' } },
    hook: { label: 'Callback verification token', required: true, hint: 'Dasbor Xendit → Settings → Webhooks: salin „Verification token“ dan isi URL callback Invoices dengan URL webhook di bawah.' },
    autoHook: false,
    setup: 'Dasbor Xendit → Settings → API keys (izin Write untuk Money-in). Isi URL webhook „Invoices paid“ di Settings → Webhooks.',
  },
  midtrans: {
    name: 'Midtrans', buyer: 'GoPay, QRIS, ShopeePay, virtual account bank dan kartu, melalui halaman aman Midtrans.', button: 'Bayar via Midtrans (GoPay, QRIS, VA, kartu)',
    supports: ['IDR'],
    pub: { label: 'Client key', required: false, pattern: { live: /^Mid-client-/, test: /^SB-Mid-client-/ }, example: { live: 'Mid-client-…', test: 'SB-Mid-client-…' } },
    secret: { label: 'Server key', pattern: { live: /^Mid-server-/, test: /^SB-Mid-server-/ }, example: { live: 'Mid-server-…', test: 'SB-Mid-server-…' } },
    hook: null,
    autoHook: false,
    setup: 'Dasbor Midtrans → Settings → Access keys. Isi „Payment Notification URL“ (Settings → Configuration) dengan URL webhook di bawah; tanda tangan diverifikasi dengan server key.',
  },
};

const DOC = (id: GwId) => `k/gw-${id}.json`;
const empty = (id: GwId): GwConfig => ({ enabled: false, mode: 'test', currencies: [...GW_META[id].supports], live: { pub: '' }, test: { pub: '' } });

export async function getGw(store: Store, id: GwId): Promise<GwConfig> {
  const c = await store.get<GwConfig>(DOC(id));
  const e = empty(id);
  return c ? { ...e, ...c, live: { ...e.live, ...c.live }, test: { ...e.test, ...c.test } } : e;
}
export async function getAllGw(store: Store): Promise<Record<GwId, GwConfig>> {
  const all = await Promise.all(GATEWAYS.map((g) => getGw(store, g)));
  return Object.fromEntries(GATEWAYS.map((g, i) => [g, all[i]])) as Record<GwId, GwConfig>;
}

export interface GwInput { pub: string; secret: string; hook: string }

/** Simpan; rahasia hanya diganti bila diisi. `clear` menghapus semua kunci satu mode. Format kunci diperiksa per mode. */
export async function saveGw(store: Store, master: string, id: GwId, next: { enabled: boolean; mode: GwMode; currencies: Currency[]; live: GwInput; test: GwInput }, clear?: GwMode): Promise<GwConfig> {
  const meta = GW_META[id];
  const cur = await getGw(store, id);
  const out: GwConfig = { enabled: next.enabled, mode: next.mode, currencies: next.currencies.filter((x) => meta.supports.includes(x)), live: { ...cur.live }, test: { ...cur.test }, updatedAt: Date.now() };
  for (const m of ['live', 'test'] as const) {
    if (clear === m) {
      out[m] = { pub: '' };
      continue;
    }
    const pub = next[m].pub.trim(), sec = next[m].secret.trim(), hook = next[m].hook.trim();
    if (pub && !meta.pub.pattern[m].test(pub)) throw new GwError(`${meta.pub.label} ${m} harus berformat ${meta.pub.example[m]}.`);
    if (sec && !meta.secret.pattern[m].test(sec)) throw new GwError(`${meta.secret.label} ${m} harus berformat ${meta.secret.example[m]}.`);
    if (hook && meta.hook?.pattern && !meta.hook.pattern.test(hook)) throw new GwError(`${meta.hook.label} tidak sesuai format.`);
    out[m].pub = pub;
    if (sec) out[m].secret = await seal(master, sec, `gw-${id}-${m}`);
    if (hook && meta.hook) out[m].hook = await seal(master, hook, `gw-${id}-hook-${m}`);
  }
  await store.put(DOC(id), out);
  return out;
}

export async function setGwHook(store: Store, master: string, id: GwId, mode: GwMode, hook: string): Promise<void> {
  const cur = await getGw(store, id);
  cur[mode].hook = await seal(master, hook, `gw-${id}-hook-${mode}`);
  await store.put(DOC(id), { ...cur, updatedAt: Date.now() });
}

export const gwReady = (c: GwConfig) => c.enabled && Boolean(c[c.mode].secret) && c.currencies.length > 0;
export const gwServes = (c: GwConfig, cur: Currency) => gwReady(c) && c.currencies.includes(cur);
const secretOf = (c: GwConfig, id: GwId, master: string, mode: GwMode = c.mode) => {
  const s = c[mode].secret;
  if (!s) throw new GwError(`${GW_META[id].secret.label} ${GW_META[id].name} (${mode}) belum diisi.`);
  return unseal<string>(master, s, `gw-${id}-${mode}`);
};
const hookOf = (c: GwConfig, id: GwId, master: string, mode: GwMode = c.mode) => (c[mode].hook ? unseal<string>(master, c[mode].hook!, `gw-${id}-hook-${mode}`) : Promise.resolve(''));

/** Hasil pembayaran yang dibaca dari API gerbang (nominal dalam satuan utama, mis. 32.00 USD). */
export interface GwPaid { paid: boolean; invoiceId: string; amount: number; currency: string; ref: string; payer?: string; mode: GwMode }
export interface CheckoutOpts { brand: string; email: string; name: string; description: string; returnUrl: string; cancelUrl: string }

/** Satuan terkecil Stripe: JPY tanpa desimal; IDR dan USD dikali 100. */
export const minorUnits = (amount: number, cur: Currency) => (cur === 'JPY' ? Math.round(amount) : Math.round(amount * 100));
export const amountMatches = (paid: number, inv: Invoice) => Math.abs(paid - inv.amount) < (inv.currency === 'USD' ? 0.01 : 1);

const b64 = (s: string) => btoa(s);
async function req(url: string, init: RequestInit, label: string): Promise<Record<string, any>> {
  const res = await fetch(url, init);
  const j = (await res.json().catch(() => ({}))) as Record<string, any>;
  if (!res.ok) throw new GwError(`${label} menolak permintaan (${res.status}${j.error?.code ? ` ${j.error.code}` : j.error_code ? ` ${j.error_code}` : ''}).`);
  return j;
}
async function hmacHex(key: string, data: string, hash: 'SHA-256' | 'SHA-512' = 'SHA-256'): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash }, false, ['sign']);
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data)))].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function sha512Hex(s: string): Promise<string> {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-512', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ── Stripe ──────────────────────────────────────────────────────────────── */
const STRIPE = 'https://api.stripe.com';
export const STRIPE_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed', 'charge.refunded'];
const form = (o: Record<string, string | number>) => Object.entries(o).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
async function stripe(c: GwConfig, master: string, method: 'GET' | 'POST' | 'DELETE', path: string, body?: Record<string, string | number>, idem?: string, mode: GwMode = c.mode) {
  const headers: Record<string, string> = { Authorization: `Bearer ${await secretOf(c, 'stripe', master, mode)}`, 'Stripe-Version': '2024-06-20' };
  if (body) headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (idem) headers['Idempotency-Key'] = idem;
  return req(`${STRIPE}${path}`, { method, headers, body: body ? form(body) : undefined }, 'Stripe');
}
const stripeSession = (s: Record<string, any>, mode: GwMode): GwPaid => {
  const cur = String(s.currency ?? '').toUpperCase();
  const minor = Number(s.amount_total ?? -1);
  return { paid: s.payment_status === 'paid', invoiceId: String(s.metadata?.invoice ?? s.client_reference_id ?? ''), amount: cur === 'JPY' ? minor : minor / 100, currency: cur, ref: String(s.id ?? ''), payer: s.customer_details?.email ?? undefined, mode };
};

/** Verifikasi header Stripe-Signature (t=…,v1=…) dengan toleransi 5 menit, seperti pustaka resmi Stripe. */
export async function stripeSignatureOk(secret: string, header: string | undefined, body: string, now = Date.now()): Promise<boolean> {
  if (!header || !secret) return false;
  const parts = header.split(',').map((p) => p.split('=') as [string, string]);
  const t = Number(parts.find(([k]) => k === 't')?.[1]);
  const sigs = parts.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length || Math.abs(now / 1000 - t) > 300) return false;
  const expected = await hmacHex(secret, `${t}.${body}`);
  return sigs.some((s) => timingSafeEqual(s, expected));
}

/* ── Xendit ──────────────────────────────────────────────────────────────── */
const XENDIT = 'https://api.xendit.co';
const xAuth = async (c: GwConfig, master: string, mode?: GwMode) => ({ Authorization: `Basic ${b64(`${await secretOf(c, 'xendit', master, mode)}:`)}` });
const xenditInvoice = (j: Record<string, any>, mode: GwMode): GwPaid => ({
  paid: j.status === 'PAID' || j.status === 'SETTLED', invoiceId: String(j.external_id ?? ''), amount: Number(j.paid_amount ?? j.amount ?? -1), currency: String(j.currency ?? ''), ref: String(j.id ?? ''), payer: j.payer_email ?? undefined, mode,
});

/* ── Midtrans ────────────────────────────────────────────────────────────── */
const MT_SNAP: Record<GwMode, string> = { live: 'https://app.midtrans.com', test: 'https://app.sandbox.midtrans.com' };
const MT_API: Record<GwMode, string> = { live: 'https://api.midtrans.com', test: 'https://api.sandbox.midtrans.com' };
const mAuth = async (c: GwConfig, master: string, mode?: GwMode) => ({ Authorization: `Basic ${b64(`${await secretOf(c, 'midtrans', master, mode)}:`)}`, Accept: 'application/json' });
const midtransStatus = (j: Record<string, any>, mode: GwMode): GwPaid => ({
  paid: j.transaction_status === 'settlement' || (j.transaction_status === 'capture' && (j.fraud_status ?? 'accept') === 'accept'),
  invoiceId: String(j.custom_field1 ?? String(j.order_id ?? '').replace(/~[^~]*$/, '')), amount: Number(j.gross_amount ?? -1), currency: String(j.currency ?? 'IDR'), ref: String(j.order_id ?? ''), mode,
});

/* ── antarmuka bersama ───────────────────────────────────────────────────── */

/** Buat pembayaran; kembalikan referensi gerbang dan URL halaman pembayaran. */
export async function gwCheckout(id: GwId, c: GwConfig, master: string, inv: Invoice, o: CheckoutOpts): Promise<{ ref: string; url: string }> {
  if (!c.currencies.includes(inv.currency)) throw new GwError(`${GW_META[id].name} tidak dipakai untuk ${inv.currency}.`);
  if (id === 'stripe') {
    const j = await stripe(c, master, 'POST', '/v1/checkout/sessions', {
      mode: 'payment', client_reference_id: inv.id, ...(o.email ? { customer_email: o.email } : {}),
      'metadata[invoice]': inv.id, 'metadata[number]': inv.number, 'payment_intent_data[metadata][invoice]': inv.id, 'payment_intent_data[description]': `${o.brand} ${inv.number}`,
      'line_items[0][quantity]': 1, 'line_items[0][price_data][currency]': inv.currency.toLowerCase(), 'line_items[0][price_data][unit_amount]': minorUnits(inv.amount, inv.currency),
      'line_items[0][price_data][product_data][name]': `${o.brand} — ${o.description}`,
      success_url: `${o.returnUrl}?ref={CHECKOUT_SESSION_ID}`, cancel_url: o.cancelUrl,
    }, `checkout-${inv.id}-${inv.amount}-${inv.currency}-${c.mode}`);
    if (!j.id || !j.url) throw new GwError('Sesi pembayaran Stripe tidak terbentuk.');
    return { ref: String(j.id), url: String(j.url) };
  }
  if (id === 'xendit') {
    const j = await req(`${XENDIT}/v2/invoices`, {
      method: 'POST', headers: { ...(await xAuth(c, master)), 'Content-Type': 'application/json' },
      body: JSON.stringify({ external_id: inv.id, amount: inv.amount, currency: inv.currency, description: `${o.brand} ${o.description}`, ...(o.email ? { payer_email: o.email } : {}), customer: { given_names: o.name || 'Member', ...(o.email ? { email: o.email } : {}) }, success_redirect_url: o.returnUrl, failure_redirect_url: o.cancelUrl, invoice_duration: 86_400 }),
    }, 'Xendit');
    if (!j.id || !j.invoice_url) throw new GwError('Tagihan Xendit tidak terbentuk.');
    return { ref: String(j.id), url: String(j.invoice_url) };
  }
  // Midtrans: order_id wajib unik per transaksi → id tagihan + penanda waktu; id tagihan juga di custom_field1.
  const orderId = `${inv.id}~${Date.now().toString(36)}`;
  const j = await req(`${MT_SNAP[c.mode]}/snap/v1/transactions`, {
    method: 'POST', headers: { ...(await mAuth(c, master)), 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction_details: { order_id: orderId, gross_amount: Math.round(inv.amount) }, item_details: [{ id: inv.number, price: Math.round(inv.amount), quantity: 1, name: `${o.brand} ${inv.number}`.slice(0, 50) }], customer_details: { first_name: (o.name || 'Member').slice(0, 50), ...(o.email ? { email: o.email } : {}) }, custom_field1: inv.id, callbacks: { finish: o.returnUrl } }),
  }, 'Midtrans');
  if (!j.redirect_url) throw new GwError('Transaksi Midtrans tidak terbentuk.');
  return { ref: orderId, url: String(j.redirect_url) };
}

/** Baca status pembayaran langsung dari API gerbang. */
export async function gwStatus(id: GwId, c: GwConfig, master: string, ref: string, mode: GwMode = c.mode): Promise<GwPaid> {
  if (id === 'stripe') {
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(ref)) throw new GwError('Sesi Stripe tidak dikenal.');
    return stripeSession(await stripe(c, master, 'GET', `/v1/checkout/sessions/${encodeURIComponent(ref)}`, undefined, undefined, mode), mode);
  }
  if (id === 'xendit') return xenditInvoice(await req(`${XENDIT}/v2/invoices/${encodeURIComponent(ref)}`, { headers: await xAuth(c, master, mode) }, 'Xendit'), mode);
  return midtransStatus(await req(`${MT_API[mode]}/v2/${encodeURIComponent(ref)}/status`, { headers: await mAuth(c, master, mode) }, 'Midtrans'), mode);
}

/**
 * Webhook: false = tanda tangan/token tidak sah; null = peristiwa yang tidak melunasi (dicatat saja);
 * selain itu status pembayaran yang **dibaca ulang dari API** (bukan dipercaya dari isi webhook).
 */
export async function gwWebhook(id: GwId, c: GwConfig, master: string, headers: Headers, body: string): Promise<GwPaid | null | false> {
  if (id === 'stripe') {
    if (!(await stripeSignatureOk(await hookOf(c, id, master), headers.get('stripe-signature') ?? undefined, body))) return false;
    const evt = JSON.parse(body) as { type?: string; livemode?: boolean; data?: { object?: Record<string, any> } };
    if (evt.type !== 'checkout.session.completed' && evt.type !== 'checkout.session.async_payment_succeeded') return null;
    const mode: GwMode = evt.livemode ? 'live' : 'test';
    return gwStatus(id, c, master, String(evt.data?.object?.id ?? ''), mode);
  }
  if (id === 'xendit') {
    const token = await hookOf(c, id, master);
    if (!token || !timingSafeEqual(headers.get('x-callback-token') ?? '', token)) return false;
    const evt = JSON.parse(body) as Record<string, any>;
    if (!evt.id || (evt.status !== 'PAID' && evt.status !== 'SETTLED')) return null;
    return gwStatus(id, c, master, String(evt.id));
  }
  const evt = JSON.parse(body) as Record<string, any>;
  const server = await secretOf(c, id, master);
  const expected = await sha512Hex(`${evt.order_id ?? ''}${evt.status_code ?? ''}${evt.gross_amount ?? ''}${server}`);
  if (!evt.signature_key || !timingSafeEqual(String(evt.signature_key), expected)) return false;
  return gwStatus(id, c, master, String(evt.order_id));
}

/** Uji kunci rahasia mode aktif. */
export async function gwTest(id: GwId, c: GwConfig, master: string): Promise<void> {
  if (id === 'stripe') await stripe(c, master, 'GET', '/v1/balance');
  else if (id === 'xendit') await req(`${XENDIT}/balance`, { headers: await xAuth(c, master) }, 'Xendit');
  else {
    // Order fiktif: 404 = kunci diterima; 401 = kunci ditolak.
    const res = await fetch(`${MT_API[c.mode]}/v2/luaja-cek-kunci/status`, { headers: await mAuth(c, master) });
    const j = (await res.json().catch(() => ({}))) as { status_code?: string };
    if (res.status === 401 || j.status_code === '401') throw new GwError('Midtrans menolak server key (401).');
  }
}

/** Stripe: buat endpoint webhook (mode aktif) dan simpan rahasianya. Endpoint lama dengan URL sama dihapus dulu. */
export async function stripeRegisterHook(store: Store, c: GwConfig, master: string, url: string): Promise<void> {
  const list = await stripe(c, master, 'GET', '/v1/webhook_endpoints?limit=100');
  for (const w of (list.data ?? []) as { id: string; url: string }[]) if (w.url === url) await stripe(c, master, 'DELETE', `/v1/webhook_endpoints/${encodeURIComponent(w.id)}`).catch(() => undefined);
  const body: Record<string, string> = { url, description: 'Pelunasan tagihan otomatis' };
  STRIPE_EVENTS.forEach((e, i) => { body[`enabled_events[${i}]`] = e; });
  const j = await stripe(c, master, 'POST', '/v1/webhook_endpoints', body);
  if (!j.secret) throw new GwError('Webhook Stripe tidak terbentuk.');
  await setGwHook(store, master, 'stripe', c.mode, String(j.secret));
}
