#!/usr/bin/env node
/**
 * Mengenkripsi kredensial PayPal untuk Worker xscan.es sebelum dikirim ke alur kerja `paypal-seed.yml`
 * (repositori publik: teks asli tidak boleh lewat GitHub). Sama persis dengan `sealSeed` di src/data/paypal.ts:
 * ECDH P-256 (kunci sementara) + HKDF-SHA256 („xscan paypal seed v1“) + AES-256-GCM → `ecies1.<x>~<y>.<iv>.<ct>`.
 *
 * Pakai (kredensial dari variabel lingkungan, bukan argumen, agar tidak tercatat di riwayat shell):
 *   PAYPAL_MODE=sandbox PAYPAL_CLIENT_ID=… PAYPAL_SECRET=… node scripts/seal-paypal-seed.mjs https://xscan.es
 * Tanpa akses ke situs: jalankan alur kerja Seed PayPal tanpa masukan, salin JSON kunci publiknya ke PAYPAL_SEED_PUBKEY.
 * Keluaran: satu baris `ecies1.…` untuk masukan `sealed` alur kerja Seed PayPal.
 */
const base = (process.argv[2] || 'https://xscan.es').replace(/\/$/, '');
const mode = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
const clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
const secret = (process.env.PAYPAL_SECRET || '').trim();
if (!clientId || !secret) {
  console.error('Isi PAYPAL_CLIENT_ID dan PAYPAL_SECRET di variabel lingkungan.');
  process.exit(1);
}
// Kunci publik: dari variabel PAYPAL_SEED_PUBKEY (JSON yang dicetak alur kerja tanpa masukan) atau diambil dari situs.
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
const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify({ mode, clientId, secret })));
const epk = await subtle.exportKey('jwk', eph.publicKey);
process.stdout.write(['ecies1', `${epk.x}~${epk.y}`, b64url(iv), b64url(ct)].join('.') + '\n');
