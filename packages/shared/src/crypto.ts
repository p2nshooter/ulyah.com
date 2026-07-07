// Web Crypto (SubtleCrypto) helpers — run identically in Cloudflare Workers
// and Node 20+, no native addons. Used for:
//  - encrypting donated AI/GPU API keys before they ever touch D1 (§11.4)
//  - hashing admin/client passwords (PBKDF2, no bcrypt native binding on Workers)
//  - TOTP for the hidden admin portal (§12.3)
//  - hashing IPs for the append-only audit log (§17)

const te = new TextEncoder();
const td = new TextDecoder();

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * WebCrypto's BufferSource types want a view backed by a concrete
 * ArrayBuffer (not the wider ArrayBufferLike a plain `Uint8Array` carries),
 * so every Uint8Array we hand to `crypto.subtle.*` goes through this first.
 */
function toArrayBuffer(u: Uint8Array): ArrayBuffer {
  return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
}

// ── API key encryption (AES-256-GCM) ────────────────────────────────────

async function importAesKey(secretB64: string): Promise<CryptoKey> {
  const raw = fromB64(secretB64);
  if (raw.length !== 32) {
    throw new Error("KEY_ENCRYPTION_SECRET must decode to exactly 32 bytes (AES-256)");
  }
  return crypto.subtle.importKey("raw", toArrayBuffer(raw), "AES-GCM", false, ["encrypt", "decrypt"]);
}

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64
}

export async function encryptApiKey(rawKey: string, secretB64: string): Promise<EncryptedPayload> {
  const key = await importAesKey(secretB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(te.encode(rawKey))
  );
  return { ciphertext: toB64(ct), iv: toB64(iv) };
}

export async function decryptApiKey(payload: EncryptedPayload, secretB64: string): Promise<string> {
  const key = await importAesKey(secretB64);
  const iv = fromB64(payload.iv);
  const ct = fromB64(payload.ciphertext);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: toArrayBuffer(iv) }, key, toArrayBuffer(ct));
  return td.decode(pt);
}

// ── Password hashing (PBKDF2-SHA256, 210k iterations — OWASP 2024 baseline) ─

const PBKDF2_ITERATIONS = 210_000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", toArrayBuffer(te.encode(password)), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: toArrayBuffer(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toB64(salt)}$${toB64(bits)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = fromB64(parts[2]!);
  const expected = parts[3]!;
  const keyMaterial = await crypto.subtle.importKey("raw", toArrayBuffer(te.encode(password)), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: toArrayBuffer(salt), iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return constantTimeEqual(toB64(bits), expected);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── TOTP (RFC 6238), HMAC-SHA1, 6 digits, 30s step — Google Authenticator compatible ─

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  let bits = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  let secret = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    secret += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return secret;
}

function base32Decode(input: string): Uint8Array {
  const clean = input.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

async function totpAt(secret: string, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(base32Decode(secret)),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const counterBytes = new ArrayBuffer(8);
  const view = new DataView(counterBytes);
  view.setUint32(4, counter, false);
  const hmac = new Uint8Array(await crypto.subtle.sign("HMAC", key, counterBytes));
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

/** Verifies a 6-digit TOTP code, allowing ±1 time step for clock drift. */
export async function verifyTotp(secret: string, token: string, stepSeconds = 30): Promise<boolean> {
  const counter = Math.floor(Date.now() / 1000 / stepSeconds);
  for (const drift of [0, -1, 1]) {
    if ((await totpAt(secret, counter + drift)) === token) return true;
  }
  return false;
}

export function totpOtpAuthUrl(secret: string, email: string, issuer = "ULYAH Admin"): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;
}

// ── Misc ─────────────────────────────────────────────────────────────────

export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", toArrayBuffer(te.encode(input)));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function randomToken(bytes = 32): string {
  return toB64(crypto.getRandomValues(new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
