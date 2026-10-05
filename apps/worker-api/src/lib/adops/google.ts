/**
 * Google OAuth for the AdOps runner, Workers-native (WebCrypto, no SDK).
 *
 * - Ad Manager accepts a SERVICE ACCOUNT: we sign a JWT (RS256) with its
 *   private key and exchange it for an access token.
 * - AdSense Management API does not accept service accounts: it needs the
 *   owner's OAuth client + a refresh token, exchanged for an access token.
 *
 * Tokens live ~1 hour; they are cached in KV for 50 minutes so the 15-minute
 * cron does not mint a new one every tick.
 */
import type { Env } from "../../env.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
/** Ad Manager API v1 (REST) scope, plus the classic one the docs still name. */
export const ADMANAGER_SCOPES = "https://www.googleapis.com/auth/admanager https://www.googleapis.com/auth/dfp";
export const ADSENSE_SCOPE = "https://www.googleapis.com/auth/adsense.readonly";

export interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

/** Parse and sanity-check a pasted service-account JSON key. Throws a readable error. */
export function parseServiceAccount(json: string): ServiceAccount {
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new Error("JSON service account tidak valid (bukan JSON).");
  }
  if (o.type !== undefined && o.type !== "service_account") throw new Error(`Tipe kredensial "${String(o.type)}", seharusnya "service_account".`);
  if (typeof o.client_email !== "string" || !o.client_email.includes("@")) throw new Error("client_email tidak ada di JSON.");
  if (typeof o.private_key !== "string" || !o.private_key.includes("PRIVATE KEY")) throw new Error("private_key tidak ada di JSON.");
  return { client_email: o.client_email, private_key: o.private_key, token_uri: typeof o.token_uri === "string" ? o.token_uri : undefined };
}

const b64url = (bytes: ArrayBuffer | Uint8Array): string => {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64urlJson = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)));

async function importPkcs8(pem: string): Promise<CryptoKey> {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

/** A signed JWT assertion for the token endpoint (RFC 7523). Exported for the offline check. */
export async function signJwt(sa: ServiceAccount, scope: string, nowSec: number): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const claims = { iss: sa.client_email, scope, aud: sa.token_uri ?? TOKEN_URL, iat: nowSec, exp: nowSec + 3600 };
  const unsigned = `${b64urlJson(header)}.${b64urlJson(claims)}`;
  const key = await importPkcs8(sa.private_key);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${b64url(sig)}`;
}

async function postToken(body: URLSearchParams): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  const text = await res.text();
  if (!res.ok) throw new Error(`Token Google ditolak (${res.status}): ${text.slice(0, 300)}`);
  const j = JSON.parse(text) as { access_token?: string; expires_in?: number };
  if (!j.access_token) throw new Error("Token Google kosong.");
  return { access_token: j.access_token, expires_in: j.expires_in ?? 3600 };
}

async function cached(env: Env, key: string, mint: () => Promise<{ access_token: string; expires_in: number }>): Promise<string> {
  const hit = await env.CACHE_KV.get(key).catch(() => null);
  if (hit) return hit;
  const t = await mint();
  const ttl = Math.max(60, Math.min(3000, t.expires_in - 600));
  await env.CACHE_KV.put(key, t.access_token, { expirationTtl: ttl }).catch(() => undefined);
  return t.access_token;
}

/** Access token for Ad Manager from a service account. */
export async function adManagerToken(env: Env, sa: ServiceAccount): Promise<string> {
  return cached(env, `adops:token:gam:${sa.client_email}`, async () => {
    const assertion = await signJwt(sa, ADMANAGER_SCOPES, Math.floor(Date.now() / 1000));
    return postToken(new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }));
  });
}

/** Access token for AdSense from the owner's OAuth client + refresh token. */
export async function adsenseToken(env: Env, clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  return cached(env, `adops:token:adsense:${clientId.slice(0, 24)}`, () =>
    postToken(new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken }))
  );
}

/** Exchange an authorization code (from the "Hubungkan AdSense" consent) for a refresh token. */
export async function exchangeAdsenseCode(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri }),
  });
  const j = (await res.json().catch(() => ({}))) as { refresh_token?: string; error?: string; error_description?: string };
  if (!res.ok || !j.refresh_token) throw new Error(`Google tidak memberi refresh token: ${j.error_description ?? j.error ?? res.status}`);
  return j.refresh_token;
}

/** Consent URL for the AdSense read-only scope (offline access → refresh token). */
export function adsenseConsentUrl(clientId: string, redirectUri: string, state: string): string {
  const q = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: ADSENSE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}
