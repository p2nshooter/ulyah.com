import type { Env } from "../env.js";

/**
 * Stateless, HMAC-signed session tokens — deliberately NOT stored in KV.
 *
 * The previous implementation wrote every session to KV on login and read it
 * back on every authenticated request. On Cloudflare's free tier (1000 KV
 * writes/day) that write, combined with all the cache writes elsewhere,
 * exhausted the daily budget and made `KV put()` throw "limit exceeded for
 * the day" — which surfaced to users as a broken admin/client login. A
 * signed token needs no storage at all: the signature itself proves the
 * token was minted by this server, and an embedded expiry bounds its life.
 *
 * Token format:  base64url(payloadJSON) "." base64url(HMAC-SHA256(payload))
 * signed with ADMIN_SESSION_SECRET (falls back to KEY_ENCRYPTION_SECRET so a
 * missing secret never silently disables auth).
 */

export type SessionSubject = "admin" | "client" | "admin_pending_totp";

export interface SessionData {
  subject: SessionSubject;
  id: number;
  email: string;
  // Only present on an `admin_pending_totp` token during first-time TOTP
  // enrollment — carries the freshly generated secret through the two-step
  // flow inside the signed token itself, so it needs no KV storage (which
  // could be write-exhausted). Never present on a real admin/client session.
  totpSecret?: string;
}

interface TokenPayload extends SessionData {
  exp: number; // unix seconds
}

const ADMIN_TTL = 60 * 60 * 8; // 8h
const PENDING_TTL = 60 * 5; // 5 min to complete TOTP enrollment/verification
const CLIENT_TTL = 60 * 60 * 24 * 14; // 14d

const te = new TextEncoder();

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function secretOf(env: Env): string {
  return env.ADMIN_SESSION_SECRET || env.KEY_ENCRYPTION_SECRET || "ulyah-dev-session-secret";
}

async function hmac(env: Env, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(secretOf(env)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(message));
  return new Uint8Array(sig);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function createSession(env: Env, data: SessionData): Promise<string> {
  const ttl = data.subject === "client" ? CLIENT_TTL : data.subject === "admin" ? ADMIN_TTL : PENDING_TTL;
  const payload: TokenPayload = { ...data, exp: Math.floor(Date.now() / 1000) + ttl };
  const payloadB64 = b64urlEncode(te.encode(JSON.stringify(payload)));
  const sig = await hmac(env, payloadB64);
  return `${payloadB64}.${b64urlEncode(sig)}`;
}

export async function getSession(env: Env, token: string | undefined | null): Promise<SessionData | null> {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;
  try {
    const expected = await hmac(env, payloadB64);
    const got = b64urlDecode(sigB64);
    if (!constantTimeEqual(expected, got)) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64))) as TokenPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { subject: payload.subject, id: payload.id, email: payload.email, totpSecret: payload.totpSecret };
  } catch {
    return null;
  }
}

/**
 * Stateless tokens can't be individually revoked without a denylist; logout
 * clears the cookie client-side and the short TTL bounds any leaked token.
 * Kept async + same signature so existing callers don't change.
 */
export async function destroySession(_env: Env, _token: string): Promise<void> {
  /* no-op: cookie is cleared by the caller; token self-expires */
}

export function sessionCookieName(subject: "admin" | "client"): string {
  return subject === "admin" ? "ulyah_admin_sess" : "ulyah_client_sess";
}
