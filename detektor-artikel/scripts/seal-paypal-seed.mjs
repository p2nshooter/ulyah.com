#!/usr/bin/env node
/**
 * Mengenkripsi kredensial PayPal untuk Worker xscan.es sebelum dikirim ke alur kerja `paypal-seed.yml`
 * (repositori publik: teks asli tidak boleh lewat GitHub). Sama persis dengan `sealSeed` di src/data/paypal.ts:
 * ECDH P-256 (kunci sementara) + HKDF-SHA256 („xscan paypal seed v1“) + AES-256-GCM → `ecies1.<x>~<y>.<iv>.<ct>`.
 *
 * Kredensial dibaca dari variabel lingkungan (bukan argumen, agar tidak tercatat di riwayat shell):
 *   Seed v2 (beberapa mode sekaligus):
 *     PAYPAL_SANDBOX_CLIENT_ID, PAYPAL_SANDBOX_SECRET, PAYPAL_LIVE_CLIENT_ID, PAYPAL_LIVE_SECRET
 *     PAYPAL_ACTIVATE=live|sandbox  (diaktifkan setelah uji koneksinya berhasil)
 *     PAYPAL_REPLACE=1              (menimpa kredensial yang sudah ada — hanya atas perintah pemilik)
 *   Seed v1: PAYPAL_MODE=sandbox|live PAYPAL_CLIENT_ID=… PAYPAL_SECRET=…
 * Kunci publik: PAYPAL_SEED_PUBKEY (JSON yang dicetak alur kerja Seed PayPal tanpa masukan) atau diambil dari
 * `<situs>/api/paypal/seed-key` (argumen pertama, bawaan https://xscan.es).
 * Keluaran: satu baris `ecies1.…` untuk masukan `sealed` alur kerja Seed PayPal.
 */
const base = (process.argv[2] || 'https://xscan.es').replace(/\/$/, '');
const env = (k) => (process.env[k] || '').trim();
const payload = {};
for (const m of ['sandbox', 'live']) {
  const id = env(`PAYPAL_${m.toUpperCase()}_CLIENT_ID`);
  const sec = env(`PAYPAL_${m.toUpperCase()}_SECRET`);
  if (id && sec) payload[m] = { clientId: id, secret: sec };
}
if (env('PAYPAL_CLIENT_ID') && env('PAYPAL_SECRET')) {
  payload.mode = env('PAYPAL_MODE') === 'live' ? 'live' : 'sandbox';
  payload.clientId = env('PAYPAL_CLIENT_ID');
  payload.secret = env('PAYPAL_SECRET');
}
if (env('PAYPAL_ACTIVATE') === 'live' || env('PAYPAL_ACTIVATE') === 'sandbox') payload.activate = env('PAYPAL_ACTIVATE');
if (env('PAYPAL_REPLACE') === '1') payload.replace = true;
if (!payload.sandbox && !payload.live && !payload.clientId) {
  console.error('Isi kredensial di variabel lingkungan (lihat keterangan di awal berkas).');
  process.exit(1);
}
let pubJwk;
if (process.env.PAYPAL_SEED_PUBKEY) {
  pubJwk = JSON.parse(process.env.PAYPAL_SEED_PUBKEY);
} else {
  const res = await fetch(`${base}/api/paypal/seed-key`);
  if (!res.ok) {
    console.error(`Kunci publik tidak bisa diambil dari ${base} (HTTP ${res.status}).`);
    process.exit(1);
  }
  pubJwk = await res.json();
}
const { subtle } = globalThis.crypto;
const ECDH = { name: 'ECDH', namedCurve: 'P-256' };
const b64url = (b) => Buffer.from(b).toString('base64url');
const pub = await subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: pubJwk.x, y: pubJwk.y, ext: true }, ECDH, false, []);
const eph = await subtle.generateKey(ECDH, true, ['deriveBits']);
const bits = await subtle.deriveBits({ name: 'ECDH', public: pub }, eph.privateKey, 256);
const hk = await subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
const key = await subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: new TextEncoder().encode('xscan paypal seed v1') }, hk, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
const epk = await subtle.exportKey('jwk', eph.publicKey);
process.stdout.write(['ecies1', `${epk.x}~${epk.y}`, b64url(iv), b64url(ct)].join('.') + '\n');
