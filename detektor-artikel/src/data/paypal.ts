/**
 * PayPal — bayar cepat tanpa unggah bukti (pemilik, 8 Nov 2026; MASTER-BLUEPRINT §28.4).
 *
 * - Mode sandbox / live; Client ID dan Secret per mode diisi di Admin → PayPal (CRUD), keduanya disegel dengan MASTER_KEY
 *   (`k/paypal.json`), tidak pernah dikirim ke peramban; admin hanya melihat 4 karakter terakhir.
 * - Kredensial awal bisa ditanam lewat secret Worker `PAYPAL_SEED` oleh alur kerja `paypal-seed.yml`. Karena repositori
 *   publik, isinya **terenkripsi untuk Worker ini** (`ecies1.…`: ECDH P-256 + HKDF-SHA256 + AES-GCM; kunci publik di
 *   `/api/paypal/seed-key`, kunci privat disegel MASTER_KEY di R2) — teks asli tidak pernah lewat GitHub. Satu nilai seed
 *   ditanam sekali (`seedId`) dan tidak pernah menimpa kredensial yang diisi admin; hapus di Admin = benar-benar terhapus.
 * - Orders v2 (intent CAPTURE, USD): buat pesanan → member menyetujui di PayPal → capture di server (nominal, mata uang,
 *   nomor pesanan dicek) → token masuk lewat jalur pelunasan yang sama dengan transfer. Webhook bertanda tangan
 *   (verify-webhook-signature) menuntaskan pesanan bila member menutup jendela sebelum kembali.
 */
import type { Env } from '../env.ts';
import type { Store } from '../lib/store.ts';
import { seal, unseal, b64url, fromB64url, type Sealed } from '../lib/crypto.ts';

export type PaypalMode = 'sandbox' | 'live';
export const PAYPAL_DOC = 'k/paypal.json';

export interface PaypalCreds {
  clientId: Sealed;
  secret: Sealed;
  idLast4: string;
  secretLast4: string;
  savedAt: number;
  savedBy: string;
}

export interface PaypalDoc {
  enabled: boolean;
  mode: PaypalMode;
  sandbox?: PaypalCreds | null;
  live?: PaypalCreds | null;
  /** ID webhook terdaftar per mode (untuk verifikasi tanda tangan). */
  webhook?: { sandbox?: string; live?: string };
  seeded?: boolean;
  /** Sidik nilai `PAYPAL_SEED` yang sudah diproses (agar seed yang sama tidak ditanam ulang setelah admin menghapus). */
  seedId?: string;
  updatedAt?: number;
  updatedBy?: string;
}

export const isPaypalMode = (x: unknown): x is PaypalMode => x === 'sandbox' || x === 'live';

export function paypalBase(env: Env, mode: PaypalMode): string {
  if (env.PAYPAL_BASE_URL) return env.PAYPAL_BASE_URL.replace(/\/$/, '');
  return mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

const last4 = (s: string) => s.slice(-4);

export async function sealCreds(env: Env, clientId: string, secret: string, by: string): Promise<PaypalCreds> {
  if (!env.MASTER_KEY) throw new Error('MASTER_KEY belum dipasang.');
  return {
    clientId: await seal(env.MASTER_KEY, clientId, 'paypal'),
    secret: await seal(env.MASTER_KEY, secret, 'paypal'),
    idLast4: last4(clientId),
    secretLast4: last4(secret),
    savedAt: Date.now(),
    savedBy: by,
  };
}

/* ── seed terenkripsi (ECIES) ─────────────────────────────────────────────── */

export const SEED_KEY_DOC = 'k/paypal-seed-key.json';
interface SeedKeyDoc { pub: JsonWebKey; priv: Sealed; at: number }
const ECDH = { name: 'ECDH', namedCurve: 'P-256' } as const;
const SEED_INFO = new TextEncoder().encode('xscan paypal seed v1');

/** Kunci publik untuk mengenkripsi seed (dibuat sekali; kunci privatnya disegel MASTER_KEY dan tidak pernah keluar). */
export async function seedPublicKey(env: Env, store: Store): Promise<{ kty: string; crv: string; x: string; y: string }> {
  if (!env.MASTER_KEY) throw new Error('MASTER_KEY belum dipasang.');
  let cur = await store.get<SeedKeyDoc>(SEED_KEY_DOC);
  if (!cur) {
    const kp = (await crypto.subtle.generateKey(ECDH, true, ['deriveBits'])) as CryptoKeyPair;
    const pub = (await crypto.subtle.exportKey('jwk', kp.publicKey)) as JsonWebKey;
    const priv = (await crypto.subtle.exportKey('jwk', kp.privateKey)) as JsonWebKey;
    const doc: SeedKeyDoc = { pub, priv: await seal(env.MASTER_KEY, priv, 'paypal-seed'), at: Date.now() };
    cur = (await store.createOnce(SEED_KEY_DOC, doc)) ? doc : await store.get<SeedKeyDoc>(SEED_KEY_DOC);
  }
  const p = cur!.pub;
  return { kty: 'EC', crv: 'P-256', x: p.x!, y: p.y! };
}

async function aesFromShared(priv: CryptoKey, pub: CryptoKey, usage: KeyUsage): Promise<CryptoKey> {
  const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: pub }, priv, 256);
  const hk = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: SEED_INFO }, hk, { name: 'AES-GCM', length: 256 }, false, [usage]);
}

/** Enkripsi seed untuk kunci publik Worker (dipakai skrip operator dan uji; formatnya `ecies1.<epk>.<iv>.<ct>`). */
export async function sealSeed(pubJwk: { x: string; y: string }, plaintext: string): Promise<string> {
  const pub = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: pubJwk.x, y: pubJwk.y, ext: true }, ECDH, false, []);
  const eph = (await crypto.subtle.generateKey(ECDH, true, ['deriveBits'])) as CryptoKeyPair;
  const key = await aesFromShared(eph.privateKey, pub, 'encrypt');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  const epk = (await crypto.subtle.exportKey('jwk', eph.publicKey)) as JsonWebKey;
  return ['ecies1', `${epk.x}~${epk.y}`, b64url(iv), b64url(ct)].join('.');
}

async function openSeed(env: Env, store: Store, raw: string): Promise<string> {
  if (!raw.startsWith('ecies1.')) return raw; // JSON polos: hanya untuk uji lokal
  const [, epk, iv, ct] = raw.split('.');
  const [x, y] = String(epk).split('~');
  const doc = await store.get<SeedKeyDoc>(SEED_KEY_DOC);
  if (!doc || !x || !y || !iv || !ct) throw new Error('seed tidak bisa dibuka');
  const priv = await crypto.subtle.importKey('jwk', await unseal<JsonWebKey>(env.MASTER_KEY!, doc.priv, 'paypal-seed'), ECDH, false, ['deriveBits']);
  const pub = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x, y, ext: true }, ECDH, false, []);
  const key = await aesFromShared(priv, pub, 'decrypt');
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64url(iv) }, key, fromB64url(ct)));
}

async function seedFingerprint(raw: string): Promise<string> {
  return b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))).slice(0, 22);
}

/** Dokumen PayPal. Seed (`PAYPAL_SEED`) ditanam sekali per nilai, hanya ke mode yang belum berisi kredensial. */
export async function getPaypal(env: Env, store: Store): Promise<PaypalDoc> {
  const doc = await store.get<PaypalDoc>(PAYPAL_DOC);
  if (!env.PAYPAL_SEED || !env.MASTER_KEY) {
    if (doc) return doc;
    const fresh: PaypalDoc = { enabled: false, mode: 'sandbox', updatedAt: Date.now() };
    return (await store.createOnce(PAYPAL_DOC, fresh)) ? fresh : ((await store.get<PaypalDoc>(PAYPAL_DOC)) ?? fresh);
  }
  const seedId = await seedFingerprint(env.PAYPAL_SEED);
  if (doc?.seedId === seedId) return doc;
  let seed: { mode: PaypalMode; creds: PaypalCreds } | null = null;
  try {
    const s = JSON.parse(await openSeed(env, store, env.PAYPAL_SEED)) as { mode?: string; clientId?: string; secret?: string };
    if (s.clientId && s.secret) {
      const mode: PaypalMode = isPaypalMode(s.mode) ? s.mode : 'sandbox';
      seed = { mode, creds: await sealCreds(env, s.clientId.trim(), s.secret.trim(), 'seed') };
    }
  } catch {
    seed = null; // seed rusak / kunci berbeda: abaikan, admin mengisi manual
  }
  const apply = (cur: PaypalDoc | null): PaypalDoc => {
    const base: PaypalDoc = cur ?? { enabled: false, mode: 'sandbox' };
    if (base.seedId === seedId) return base;
    if (!seed || base[seed.mode]) return { ...base, seedId }; // tidak pernah menimpa isi admin
    const fresh = !cur || (!base.sandbox && !base.live);
    return { ...base, [seed.mode]: seed.creds, mode: fresh ? seed.mode : base.mode, enabled: fresh ? true : base.enabled, seeded: true, seedId, updatedAt: Date.now(), updatedBy: 'seed' };
  };
  if (!doc) {
    const next = apply(null);
    if (await store.createOnce(PAYPAL_DOC, next)) return next;
  }
  let out: PaypalDoc | null = null;
  await store.cas<PaypalDoc>(PAYPAL_DOC, (cur) => {
    out = apply(cur);
    return cur && out === cur ? null : out;
  }, 'PayPal seed');
  return out ?? (await store.get<PaypalDoc>(PAYPAL_DOC))!;
}

export const paypalReady = (d: PaypalDoc): boolean => d.enabled && Boolean(d[d.mode]);

async function creds(env: Env, d: PaypalDoc): Promise<{ id: string; secret: string }> {
  const c = d[d.mode];
  if (!c || !env.MASTER_KEY) throw new PaypalError('not_configured', 'PayPal belum dikonfigurasi.');
  return { id: await unseal<string>(env.MASTER_KEY, c.clientId, 'paypal'), secret: await unseal<string>(env.MASTER_KEY, c.secret, 'paypal') };
}

export class PaypalError extends Error {
  constructor(public code: string, msg: string, public status = 0) {
    super(msg);
  }
}

const tokenCache = new Map<string, { token: string; until: number }>();

export async function accessToken(env: Env, d: PaypalDoc): Promise<string> {
  const c = await creds(env, d);
  const key = `${d.mode}:${c.id}`;
  const hit = tokenCache.get(key);
  if (hit && hit.until > Date.now() + 60_000) return hit.token;
  const r = await fetch(`${paypalBase(env, d.mode)}/v1/oauth2/token`, {
    method: 'POST',
    headers: { authorization: `Basic ${btoa(`${c.id}:${c.secret}`)}`, 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: 'grant_type=client_credentials',
  });
  const j = (await r.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!r.ok || !j.access_token) throw new PaypalError('auth', `PayPal menolak kredensial (${r.status}${j.error_description ? `: ${j.error_description}` : ''}).`, r.status);
  tokenCache.set(key, { token: j.access_token, until: Date.now() + (j.expires_in ?? 3000) * 1000 });
  return j.access_token;
}

async function call<T>(env: Env, d: PaypalDoc, path: string, init: { method?: string; body?: unknown; requestId?: string } = {}): Promise<T> {
  const token = await accessToken(env, d);
  const r = await fetch(`${paypalBase(env, d.mode)}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      accept: 'application/json',
      prefer: 'return=representation',
      ...(init.requestId ? { 'paypal-request-id': init.requestId } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const j = (await r.json().catch(() => ({}))) as T & { name?: string; message?: string; details?: { issue?: string }[] };
  if (!r.ok) throw new PaypalError(j.details?.[0]?.issue ?? j.name ?? 'http', `PayPal ${r.status}: ${j.message ?? j.name ?? 'gagal'}`, r.status);
  return j;
}

export interface CreatedOrder {
  id: string;
  approveUrl: string;
}

/** Membuat pesanan PayPal untuk satu invoice (nominal USD dibekukan di invoice). Idempoten per nomor invoice. */
export async function createPaypalOrder(
  env: Env,
  d: PaypalDoc,
  o: { orderId: string; invoiceNo: string; amountUsd: number; description: string; brand: string; returnUrl: string; cancelUrl: string; locale?: string },
): Promise<CreatedOrder> {
  const res = await call<{ id: string; links?: { rel: string; href: string }[] }>(env, d, '/v2/checkout/orders', {
    method: 'POST',
    requestId: `create-${o.orderId}`,
    body: {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: o.orderId,
        custom_id: o.orderId,
        invoice_id: o.invoiceNo,
        description: o.description.slice(0, 127),
        amount: { currency_code: 'USD', value: o.amountUsd.toFixed(2) },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: o.brand.slice(0, 127),
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            return_url: o.returnUrl,
            cancel_url: o.cancelUrl,
            ...(o.locale ? { locale: o.locale } : {}),
          },
        },
      },
    },
  });
  const approve = res.links?.find((l) => l.rel === 'payer-action' || l.rel === 'approve')?.href;
  if (!res.id || !approve) throw new PaypalError('no_approve', 'PayPal tidak mengembalikan tautan persetujuan.');
  return { id: res.id, approveUrl: approve };
}

export interface CaptureResult {
  status: string;
  captureId: string;
  amount: string;
  currency: string;
  customId: string;
  payerEmail?: string;
}

function captureOf(j: {
  status?: string;
  payer?: { email_address?: string };
  purchase_units?: { custom_id?: string; reference_id?: string; payments?: { captures?: { id: string; status: string; custom_id?: string; amount: { value: string; currency_code: string } }[] } }[];
}): CaptureResult {
  const pu = j.purchase_units?.[0];
  const cap = pu?.payments?.captures?.[0];
  return {
    status: cap?.status ?? j.status ?? 'UNKNOWN',
    captureId: cap?.id ?? '',
    amount: cap?.amount.value ?? '',
    currency: cap?.amount.currency_code ?? '',
    customId: cap?.custom_id ?? pu?.custom_id ?? pu?.reference_id ?? '',
    payerEmail: j.payer?.email_address,
  };
}

/** Capture pesanan yang sudah disetujui; bila sudah pernah di-capture, ambil statusnya (aman diulang). */
export async function capturePaypalOrder(env: Env, d: PaypalDoc, paypalOrderId: string, ourOrderId: string): Promise<CaptureResult> {
  if (!/^[A-Z0-9-]{6,40}$/i.test(paypalOrderId)) throw new PaypalError('bad_id', 'ID pesanan PayPal tidak sah.');
  try {
    return captureOf(await call(env, d, `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, { method: 'POST', body: {}, requestId: `capture-${ourOrderId}` }));
  } catch (err) {
    if (err instanceof PaypalError && (err.code === 'ORDER_ALREADY_CAPTURED' || err.status === 422)) {
      return captureOf(await call(env, d, `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`));
    }
    throw err;
  }
}

/** Verifikasi tanda tangan webhook lewat API PayPal. */
export async function verifyWebhook(env: Env, d: PaypalDoc, headers: Headers, event: unknown): Promise<boolean> {
  const id = d.webhook?.[d.mode];
  if (!id) return false;
  const h = (n: string) => headers.get(n) ?? '';
  const res = await call<{ verification_status?: string }>(env, d, '/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: {
      auth_algo: h('paypal-auth-algo'),
      cert_url: h('paypal-cert-url'),
      transmission_id: h('paypal-transmission-id'),
      transmission_sig: h('paypal-transmission-sig'),
      transmission_time: h('paypal-transmission-time'),
      webhook_id: id,
      webhook_event: event,
    },
  });
  return res.verification_status === 'SUCCESS';
}

export const WEBHOOK_EVENTS = ['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.REFUNDED', 'PAYMENT.CAPTURE.REVERSED', 'CHECKOUT.ORDER.APPROVED'];

/** Mendaftarkan (atau menemukan) webhook untuk URL situs ini; mengembalikan ID-nya. */
export async function registerWebhook(env: Env, d: PaypalDoc, url: string): Promise<string> {
  try {
    const r = await call<{ id: string }>(env, d, '/v1/notifications/webhooks', { method: 'POST', body: { url, event_types: WEBHOOK_EVENTS.map((name) => ({ name })) } });
    return r.id;
  } catch (err) {
    if (!(err instanceof PaypalError) || !/ALREADY_EXISTS/i.test(err.code + err.message)) throw err;
    const list = await call<{ webhooks?: { id: string; url: string }[] }>(env, d, '/v1/notifications/webhooks');
    const hit = list.webhooks?.find((w) => w.url === url);
    if (!hit) throw err;
    return hit.id;
  }
}
