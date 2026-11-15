/** Kriptografi lewat WebCrypto (tersedia di Workers dan Node). Tidak ada rahasia di kode ini. */

const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i += 1) out[i] = b.charCodeAt(i);
  return out;
}

export async function sha256Hex(s: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a: string, b: string): boolean {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

async function hmacKey(secret: string, hash: 'SHA-256' | 'SHA-1' = 'SHA-256', raw?: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', (raw ?? enc.encode(secret)) as BufferSource, { name: 'HMAC', hash }, false, ['sign']);
}

export async function hmac(secret: string, data: string): Promise<string> {
  return b64url(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data)));
}

/* ── id ─────────────────────────────────────────────────────────────── */

const ALPHA = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Id berurutan waktu + acak, mis. chk_01JC8…  */
export function newId(prefix: string): string {
  let t = Date.now();
  let time = '';
  for (let i = 0; i < 10; i += 1) {
    time = ALPHA[t % 32] + time;
    t = Math.floor(t / 32);
  }
  const r = crypto.getRandomValues(new Uint8Array(10));
  let rand = '';
  for (const b of r) rand += ALPHA[b % 32];
  return `${prefix}_${time}${rand}`;
}

/** Kode verifikasi pendek untuk laporan cetak, mis. 7Q4K-92XD. */
export function verifyCode(): string {
  const r = crypto.getRandomValues(new Uint8Array(8));
  let s = '';
  for (const b of r) s += ALPHA[b % 32];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

/* ── enkripsi data (AES-256-GCM, kunci diturunkan dari MASTER_KEY) ───── */

const keyCache = new Map<string, Promise<CryptoKey>>();

function dataKey(master: string, info: string): Promise<CryptoKey> {
  const id = `${info}|${master.length}|${master.slice(0, 4)}`;
  let p = keyCache.get(id);
  if (!p) {
    p = (async () => {
      const base = await crypto.subtle.importKey('raw', enc.encode(master), 'HKDF', false, ['deriveKey']);
      return crypto.subtle.deriveKey(
        { name: 'HKDF', hash: 'SHA-256', salt: enc.encode('aca-r2-v1'), info: enc.encode(info) },
        base,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
      );
    })();
    keyCache.set(id, p);
  }
  return p;
}

export interface Sealed {
  v: 1;
  iv: string;
  ct: string;
}

export async function seal(master: string, value: unknown, info = 'data'): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await dataKey(master, info), enc.encode(JSON.stringify(value)));
  return { v: 1, iv: b64url(iv), ct: b64url(ct) };
}

export async function unseal<T>(master: string, sealed: Sealed, info = 'data'): Promise<T> {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64url(sealed.iv) }, await dataKey(master, info), fromB64url(sealed.ct));
  return JSON.parse(dec.decode(pt)) as T;
}

/* ── sandi (PBKDF2-SHA256, 100.000 iterasi = batas aman CPU Workers) ── */

const ITER = 100_000;

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>, iter: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256);
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${b64url(salt)}$${b64url(await pbkdf2(password, salt, ITER))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, iter, salt, hash] = stored.split('$');
  if (alg !== 'pbkdf2' || !iter || !salt || !hash) return false;
  const got = await pbkdf2(password, fromB64url(salt), Number(iter));
  return timingSafeEqual(b64url(got), hash);
}

/* ── TOTP (RFC 6238, SHA-1, 6 digit, 30 detik) ────────────────────────── */

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(s: string): Uint8Array<ArrayBuffer> {
  const clean = s.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export function newTotpSecret(): string {
  return base32Encode(crypto.getRandomValues(new Uint8Array(20)));
}

export async function totpAt(secret: string, counter: number): Promise<string> {
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i -= 1) {
    msg[i] = c & 255;
    c = Math.floor(c / 256);
  }
  const key = await hmacKey('', 'SHA-1', base32Decode(secret));
  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, msg));
  const off = h[h.length - 1]! & 15;
  const code = ((h[off]! & 127) << 24) | (h[off + 1]! << 16) | (h[off + 2]! << 8) | h[off + 3]!;
  return String(code % 1_000_000).padStart(6, '0');
}

export async function verifyTotp(secret: string, code: string, now = Date.now()): Promise<boolean> {
  const clean = code.replace(/\D/g, '');
  if (clean.length !== 6) return false;
  const step = Math.floor(now / 30_000);
  for (const d of [-1, 0, 1]) {
    if (timingSafeEqual(await totpAt(secret, step + d), clean)) return true;
  }
  return false;
}
