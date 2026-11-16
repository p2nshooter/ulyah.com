/**
 * PayPal (Orders v2) untuk pembayaran otomatis USD & JPY. Kredensial diisi pengelola di panel admin — live dan sandbox
 * terpisah — dan rahasianya disegel dengan MASTER_KEY sebelum disimpan di R2 (tidak pernah di kode atau log).
 * Alur: buat order (custom_id = id tagihan) → pembeli menyetujui → server menangkap pembayaran → tagihan lunas →
 * langganan aktif. Webhook PAYMENT.CAPTURE.COMPLETED (diverifikasi ke PayPal) menjadi jalur cadangan yang idempoten.
 */
import type { Store } from '../lib/store.ts';
import { seal, unseal, type Sealed } from '../lib/crypto.ts';
import type { Currency, Invoice } from './model.ts';

export type PaypalMode = 'live' | 'sandbox';
export interface PaypalCreds { clientId: string; secret?: Sealed; webhookId: string }
export interface PaypalConfig { enabled: boolean; mode: PaypalMode; live: PaypalCreds; sandbox: PaypalCreds; updatedAt?: number }

export const PAYPAL_DOC = 'k/paypal.json';
const EMPTY: PaypalConfig = { enabled: false, mode: 'sandbox', live: { clientId: '', webhookId: '' }, sandbox: { clientId: '', webhookId: '' } };
export const PAYPAL_CURRENCIES: Currency[] = ['USD', 'JPY'];

export async function getPaypalConfig(store: Store): Promise<PaypalConfig> {
  const c = await store.get<PaypalConfig>(PAYPAL_DOC);
  return c ? { ...EMPTY, ...c, live: { ...EMPTY.live, ...c.live }, sandbox: { ...EMPTY.sandbox, ...c.sandbox } } : structuredClone(EMPTY);
}

/** Simpan konfigurasi; rahasia hanya diganti bila diisi (kosong = tetap). */
export async function savePaypalConfig(store: Store, master: string, next: { enabled: boolean; mode: PaypalMode; live: { clientId: string; secret: string; webhookId: string }; sandbox: { clientId: string; secret: string; webhookId: string } }): Promise<PaypalConfig> {
  const cur = await getPaypalConfig(store);
  const out: PaypalConfig = { enabled: next.enabled, mode: next.mode, live: { ...cur.live }, sandbox: { ...cur.sandbox }, updatedAt: Date.now() };
  for (const m of ['live', 'sandbox'] as const) {
    out[m].clientId = next[m].clientId.trim();
    out[m].webhookId = next[m].webhookId.trim();
    if (next[m].secret.trim()) out[m].secret = await seal(master, next[m].secret.trim(), `paypal-${m}`);
  }
  await store.put(PAYPAL_DOC, out);
  return out;
}

export const paypalBase = (mode: PaypalMode) => (mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');
/** Siap dipakai: aktif + client id + rahasia untuk mode yang dipilih. */
export const paypalReady = (c: PaypalConfig) => c.enabled && Boolean(c[c.mode].clientId && c[c.mode].secret);

export class PaypalError extends Error {}

const NAMA_MODE: Record<PaypalMode, string> = { live: 'LIVE', sandbox: 'Sandbox' };
/** Bentuk kredensial REST PayPal: client ID dan secret ±80 karakter huruf/angka/-/_ (client ID diawali „A“, secret „E“). */
const BENTUK = /^[A-Za-z0-9_-]{40,120}$/;

/**
 * Pemeriksaan bentuk sebelum menghubungi PayPal — kesalahan tempel yang paling sering: spasi/baris baru ikut tersalin,
 * secret ditempel di kolom client ID (atau sebaliknya), kredensial Sandbox dimasukkan ke LIVE.
 */
export function periksaBentuk(m: PaypalMode, clientId: string, secret?: string): string | null {
  if (!clientId) return `Client ID ${NAMA_MODE[m]} kosong.`;
  if (/\s/.test(clientId)) return `Client ID ${NAMA_MODE[m]} mengandung spasi atau baris baru — salin ulang tanpa spasi.`;
  if (!BENTUK.test(clientId)) return `Client ID ${NAMA_MODE[m]} tidak berbentuk kredensial REST PayPal (biasanya ±80 karakter diawali „A“). Pastikan yang disalin adalah Client ID aplikasi REST, bukan e-mail, merchant ID, atau API signature.`;
  if (secret !== undefined) {
    if (!secret) return `Secret ${NAMA_MODE[m]} kosong.`;
    if (/\s/.test(secret)) return `Secret ${NAMA_MODE[m]} mengandung spasi atau baris baru — salin ulang tanpa spasi.`;
    if (!BENTUK.test(secret)) return `Secret ${NAMA_MODE[m]} tidak berbentuk secret REST PayPal (biasanya ±80 karakter diawali „E“).`;
    if (secret === clientId) return `Secret ${NAMA_MODE[m]} sama dengan Client ID — kolom tertukar.`;
  }
  return null;
}

/** Penjelasan jawaban PayPal saat token ditolak, dengan langkah perbaikan yang jelas (tanpa menyalin rahasia). */
function jelaskanTolak(m: PaypalMode, status: number, isi: { error?: string; error_description?: string }): string {
  const kode = isi.error ?? '';
  const ket = isi.error_description ? ` — PayPal: „${isi.error_description.slice(0, 120)}“` : '';
  if (status === 401 || kode === 'invalid_client') {
    return `PayPal ${NAMA_MODE[m]} menolak pasangan Client ID & Secret (401 ${kode || 'invalid_client'})${ket}. Pasangan ini tidak dikenal di lingkungan ${NAMA_MODE[m]}: buka developer.paypal.com → Apps & Credentials → pilih tab ${m === 'live' ? 'Live' : 'Sandbox'} → aplikasi yang sama → salin Client ID dan Secret (tombol „Show“) dari aplikasi itu, lalu simpan lagi di sini. Kredensial Sandbox tidak berlaku di LIVE dan sebaliknya.`;
  }
  if (status === 403) return `PayPal ${NAMA_MODE[m]} menolak akses (403 ${kode})${ket}. Aplikasi REST belum diizinkan untuk fitur ini atau akun bisnis belum diverifikasi.`;
  if (status >= 500) return `PayPal ${NAMA_MODE[m]} sedang bermasalah (${status}). Coba lagi beberapa menit lagi.`;
  return `PayPal ${NAMA_MODE[m]} menolak permintaan token (${status} ${kode})${ket}.`;
}

async function token(c: PaypalConfig, master: string, modeOverride?: PaypalMode): Promise<string> {
  const m = modeOverride ?? c.mode;
  const cr = c[m];
  if (!cr.clientId || !cr.secret) throw new PaypalError(`Kredensial PayPal ${NAMA_MODE[m]} belum lengkap (Client ID dan Secret wajib diisi).`);
  const bentuk = periksaBentuk(m, cr.clientId);
  if (bentuk) throw new PaypalError(bentuk);
  let secret: string;
  try { secret = await unseal<string>(master, cr.secret, `paypal-${m}`); } catch { throw new PaypalError(`Secret ${NAMA_MODE[m]} tidak bisa dibuka dengan kunci induk server saat ini — tempel ulang secret-nya lalu simpan.`); }
  const res = await fetch(`${paypalBase(m)}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${cr.clientId}:${secret}`)}`, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    let isi: { error?: string; error_description?: string } = {};
    try { isi = (await res.json()) as typeof isi; } catch { /* bukan JSON */ }
    throw new PaypalError(jelaskanTolak(m, res.status, isi));
  }
  return ((await res.json()) as { access_token: string }).access_token;
}

export interface Diagnosis { mode: PaypalMode; ok: boolean; pesan: string; webhook: boolean }
/** Uji kedua mode satu per satu: bentuk kredensial, token, dan keberadaan webhook id. */
export async function diagnosa(c: PaypalConfig, master: string): Promise<Diagnosis[]> {
  const out: Diagnosis[] = [];
  for (const m of ['live', 'sandbox'] as const) {
    const cr = c[m];
    if (!cr.clientId && !cr.secret) { out.push({ mode: m, ok: false, pesan: 'Belum diisi.', webhook: Boolean(cr.webhookId) }); continue; }
    try { await token(c, master, m); out.push({ mode: m, ok: true, pesan: `Client ID & Secret ${NAMA_MODE[m]} diterima PayPal.`, webhook: Boolean(cr.webhookId) }); }
    catch (err) { out.push({ mode: m, ok: false, pesan: err instanceof PaypalError ? err.message : 'PayPal tidak dapat dihubungi.', webhook: Boolean(cr.webhookId) }); }
  }
  return out;
}

/** Nilai dalam format PayPal: JPY tanpa desimal, USD dua desimal. */
export const ppValue = (amount: number, cur: Currency) => (cur === 'JPY' ? String(Math.round(amount)) : (Math.round(amount * 100) / 100).toFixed(2));

export async function createOrder(c: PaypalConfig, master: string, inv: Invoice, brand: string, returnUrl: string): Promise<{ id: string; approveUrl: string }> {
  if (!PAYPAL_CURRENCIES.includes(inv.currency)) throw new PaypalError('PayPal hanya untuk USD dan JPY.');
  const t = await token(c, master);
  const res = await fetch(`${paypalBase(c.mode)}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `order-${inv.id}-${inv.amount}-${inv.currency}` },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{ reference_id: inv.id, custom_id: inv.id, invoice_id: inv.number, description: `${brand} ${inv.number}`, amount: { currency_code: inv.currency, value: ppValue(inv.amount, inv.currency) } }],
      payment_source: { paypal: { experience_context: { brand_name: brand, shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW', return_url: returnUrl, cancel_url: returnUrl } } },
    }),
  });
  const j = (await res.json()) as { id?: string; links?: { rel: string; href: string }[]; message?: string };
  if (!res.ok || !j.id) throw new PaypalError(`Order PayPal gagal dibuat (${res.status}).`);
  return { id: j.id, approveUrl: j.links?.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href ?? '' };
}

export interface Captured { status: string; invoiceId: string; amount: number; currency: string; captureId: string; payer?: string }

function readCapture(j: Record<string, any>): Captured {
  const pu = j.purchase_units?.[0] ?? {};
  const cap = pu.payments?.captures?.[0] ?? {};
  return { status: String(cap.status ?? j.status ?? ''), invoiceId: String(cap.custom_id ?? pu.custom_id ?? pu.reference_id ?? ''), amount: Number(cap.amount?.value ?? 0), currency: String(cap.amount?.currency_code ?? ''), captureId: String(cap.id ?? ''), payer: j.payer?.email_address };
}

export async function captureOrder(c: PaypalConfig, master: string, orderId: string): Promise<Captured> {
  const t = await token(c, master);
  const res = await fetch(`${paypalBase(c.mode)}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json', 'PayPal-Request-Id': `capture-${orderId}` },
  });
  const j = (await res.json()) as Record<string, any>;
  // Sudah ditangkap sebelumnya (mis. oleh webhook) → baca order apa adanya.
  if (!res.ok && j?.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') return getOrder(c, master, orderId);
  if (!res.ok) throw new PaypalError(`Penangkapan pembayaran gagal (${res.status}).`);
  return readCapture(j);
}

export async function getOrder(c: PaypalConfig, master: string, orderId: string): Promise<Captured> {
  const t = await token(c, master);
  const res = await fetch(`${paypalBase(c.mode)}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: `Bearer ${t}` } });
  if (!res.ok) throw new PaypalError(`Order tidak ditemukan (${res.status}).`);
  return readCapture((await res.json()) as Record<string, any>);
}

/** Verifikasi tanda tangan webhook lewat API PayPal (verify-webhook-signature). */
export async function verifyWebhook(c: PaypalConfig, master: string, headers: Headers, body: string): Promise<boolean> {
  const webhookId = c[c.mode].webhookId;
  if (!webhookId) return false;
  const t = await token(c, master);
  const res = await fetch(`${paypalBase(c.mode)}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transmission_id: headers.get('paypal-transmission-id'), transmission_time: headers.get('paypal-transmission-time'), cert_url: headers.get('paypal-cert-url'),
      auth_algo: headers.get('paypal-auth-algo'), transmission_sig: headers.get('paypal-transmission-sig'), webhook_id: webhookId, webhook_event: JSON.parse(body),
    }),
  });
  if (!res.ok) return false;
  return ((await res.json()) as { verification_status?: string }).verification_status === 'SUCCESS';
}

export const WEBHOOK_EVENTS = ['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.APPROVED', 'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REFUNDED'];

/** Daftarkan webhook di akun PayPal (mode aktif) lalu kembalikan id-nya. Bila URL sudah terdaftar, id lama dipakai. */
export async function registerWebhook(c: PaypalConfig, master: string, url: string, mode?: PaypalMode): Promise<string> {
  const t = await token(c, master, mode);
  const base = paypalBase(mode ?? c.mode);
  const list = (await (await fetch(`${base}/v1/notifications/webhooks`, { headers: { Authorization: `Bearer ${t}` } })).json()) as { webhooks?: { id: string; url: string }[] };
  const found = list.webhooks?.find((w) => w.url === url);
  if (found) return found.id;
  const res = await fetch(`${base}/v1/notifications/webhooks`, {
    method: 'POST', headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, event_types: WEBHOOK_EVENTS.map((name) => ({ name })) }),
  });
  const j = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !j.id) throw new PaypalError(`Webhook gagal didaftarkan (${res.status}).`);
  return j.id;
}

/** Uji koneksi: ambil token saja (mode aktif, atau mode yang disebut). */
export async function testConnection(c: PaypalConfig, master: string, mode?: PaypalMode): Promise<void> {
  await token(c, master, mode);
}

/** Hapus seluruh kredensial satu mode (client ID, secret, webhook). Bila mode itu yang aktif, PayPal dinonaktifkan. */
export async function clearPaypalMode(store: Store, mode: PaypalMode): Promise<PaypalConfig> {
  const cur = await getPaypalConfig(store);
  const out: PaypalConfig = { ...cur, [mode]: { clientId: '', webhookId: '' }, enabled: cur.mode === mode ? false : cur.enabled, updatedAt: Date.now() };
  await store.put(PAYPAL_DOC, out);
  return out;
}
