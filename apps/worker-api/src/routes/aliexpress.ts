import { Hono } from "hono";
import type { Context } from "hono";
import type { Env } from "../env.js";
import { getSetting } from "../lib/settings.js";

/**
 * AliExpress affiliate bridge — one door for all twelve sites.
 *
 * WHY THIS LIVES HERE AND NOWHERE ELSE. The network runs twelve independent
 * front-ends on twelve domains. Giving each of them the app secret would mean
 * twelve copies of a credential, twelve places to rotate it, and twelve chances
 * to leak it into a client bundle. Worse, AliExpress issues ONE access token
 * per app: whichever site refreshed last would silently invalidate the others.
 *
 * So the secret and the token live in exactly one place — this worker — and the
 * sites call `/aliexpress/product` and `/aliexpress/link`, which are CORS-open,
 * read-only, and return nothing an attacker could use to impersonate the app.
 *
 * TOKEN LIFECYCLE. The authorization code arrives once, at /auth/aliexpress/
 * callback, and is exchanged for an access token plus a refresh token. Both go
 * into KV. Every later call reads the access token, and refreshes it when it is
 * within REFRESH_MARGIN_MS of expiry — so a working integration never needs the
 * owner to visit the authorize page again.
 *
 * WHAT IS NOT VERIFIED. None of this has been run against the live API: the app
 * is still in review, no key or secret exists yet, and the sandbox this was
 * written in cannot reach api-sg.aliexpress.com at all. The signing scheme and
 * endpoint paths follow AliExpress's documented open-platform contract, but the
 * first real call is the first test. Errors are therefore reported verbatim
 * rather than swallowed — when something is wrong, the owner needs to see what
 * AliExpress actually said, not a tidy 500.
 */

export const aliexpressRoute = new Hono<{ Bindings: Env }>();

/** System endpoints (auth). Signed over path + params. */
const REST_BASE = "https://api-sg.aliexpress.com/rest";
/** Business endpoints (affiliate methods). Signed over params only. */
const SYNC_BASE = "https://api-sg.aliexpress.com/sync";

const KV_TOKEN = "aliexpress:token";
/** Refresh this long before the token actually expires. */
const REFRESH_MARGIN_MS = 6 * 60 * 60 * 1000; // 6 hours
/** How long a product lookup stays cached. Prices move; a day is the compromise. */
const PRODUCT_TTL_S = 6 * 60 * 60;
/** A generated affiliate link is stable — cache it hard. */
const LINK_TTL_S = 30 * 24 * 60 * 60;

interface StoredToken {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms. */
  expiresAt: number;
  /** Epoch ms the refresh token itself dies, when the API tells us. */
  refreshExpiresAt?: number;
  obtainedAt: number;
}

/* ------------------------------------------------------------------ */
/* Signing                                                             */
/* ------------------------------------------------------------------ */

/**
 * HMAC-SHA256, uppercase hex — the `sha256` sign method.
 *
 * AliExpress also accepts an older MD5 scheme. It is not implemented here on
 * purpose: MD5 signing requires wrapping the payload in the secret at both
 * ends, and there is no reason to carry a weaker option that nothing uses.
 */
async function signHmacSha256(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * Build the string that gets signed: parameters sorted by key, then key and
 * value concatenated with no separator at all. System endpoints prefix the
 * API path; business endpoints do not.
 */
function signBase(params: Record<string, string>, path?: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  return path ? `${path}${sorted}` : sorted;
}

async function withSign(
  params: Record<string, string>,
  secret: string,
  path?: string
): Promise<Record<string, string>> {
  return { ...params, sign: await signHmacSha256(secret, signBase(params, path)) };
}

/* ------------------------------------------------------------------ */
/* Credentials                                                         */
/* ------------------------------------------------------------------ */

interface Creds {
  appKey: string;
  appSecret: string;
  trackingId: string | null;
}

/**
 * Credentials come from the admin portal first (encrypted at rest in D1) and
 * fall back to worker secrets. Returns null when the app has not been
 * configured, which is the state today and is not an error.
 */
async function creds(env: Env): Promise<Creds | null> {
  const appKey = await getSetting(env, "ALIEXPRESS_APP_KEY");
  const appSecret = await getSetting(env, "ALIEXPRESS_APP_SECRET");
  if (!appKey || !appSecret) return null;
  return { appKey, appSecret, trackingId: await getSetting(env, "ALIEXPRESS_TRACKING_ID") };
}

/* ------------------------------------------------------------------ */
/* Token store                                                         */
/* ------------------------------------------------------------------ */

async function readToken(env: Env): Promise<StoredToken | null> {
  const raw = await env.CACHE_KV.get(KV_TOKEN).catch(() => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredToken;
  } catch {
    return null;
  }
}

async function writeToken(env: Env, t: StoredToken): Promise<void> {
  // No expirationTtl: the refresh token outlives the access token by a long
  // way, and a KV entry that expired on the access token's schedule would
  // throw away the only thing that can renew it.
  await env.CACHE_KV.put(KV_TOKEN, JSON.stringify(t)).catch(() => {});
}

/** Read the token response in either of the two shapes the API returns it in. */
function parseTokenPayload(j: Record<string, unknown>): StoredToken | null {
  const body = (j.data as Record<string, unknown> | undefined) ?? j;
  const accessToken = String(body.access_token ?? "");
  const refreshToken = String(body.refresh_token ?? "");
  if (!accessToken || !refreshToken) return null;
  const now = Date.now();
  // expires_in is documented in seconds but has been observed in milliseconds.
  // Anything larger than a decade of seconds is milliseconds.
  const rawExpiry = Number(body.expires_in ?? 0);
  const ms = rawExpiry > 315_360_000 ? rawExpiry : rawExpiry * 1000;
  const rawRefresh = Number(body.refresh_token_valid_time ?? 0);
  return {
    accessToken,
    refreshToken,
    expiresAt: now + (ms > 0 ? ms : 24 * 60 * 60 * 1000),
    refreshExpiresAt: rawRefresh > 0 ? (rawRefresh > 1e12 ? rawRefresh : now + rawRefresh * 1000) : undefined,
    obtainedAt: now,
  };
}

async function callRest(
  c: Creds,
  path: string,
  extra: Record<string, string>
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> | null; text: string }> {
  const params = await withSign(
    { app_key: c.appKey, sign_method: "sha256", timestamp: String(Date.now()), ...extra },
    c.appSecret,
    path
  );
  const res = await fetch(`${REST_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  }).catch(() => null);
  if (!res) return { ok: false, status: 0, json: null, text: "network error reaching AliExpress" };
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* keep the raw text — an HTML error page is itself the diagnosis */
  }
  return { ok: res.ok, status: res.status, json, text };
}

/**
 * The access token every business call uses, refreshed when it is close to
 * expiring. Returns null when the app has never been authorised.
 */
async function accessToken(env: Env, c: Creds): Promise<string | null> {
  const stored = await readToken(env);
  if (!stored) return null;
  if (Date.now() < stored.expiresAt - REFRESH_MARGIN_MS) return stored.accessToken;

  const r = await callRest(c, "/auth/token/refresh", { refresh_token: stored.refreshToken });
  const next = r.json ? parseTokenPayload(r.json) : null;
  if (!next) {
    // Refresh failed. The old token may still have hours left on it, so hand it
    // back rather than breaking every site over a refresh that can be retried
    // on the next request.
    return Date.now() < stored.expiresAt ? stored.accessToken : null;
  }
  await writeToken(env, next);
  return next.accessToken;
}

/* ------------------------------------------------------------------ */
/* OAuth                                                               */
/* ------------------------------------------------------------------ */

/**
 * GET /auth/aliexpress/start — send the owner to AliExpress to authorise.
 *
 * A convenience, not a requirement: the same thing can be done by pasting the
 * authorize URL by hand. Having it here means the redirect_uri is built from
 * the same constant the callback is mounted on, so the two cannot drift apart
 * — which is the single commonest way an OAuth integration breaks.
 */
type Ctx = Context<{ Bindings: Env }>;

/**
 * The redirect_uri handed to AliExpress, and the path the callback answers on.
 *
 * These two must be byte-identical or the exchange fails with an error that
 * does not say so. Deriving both from one constant is the whole reason it is
 * a constant.
 */
export const ALIEXPRESS_CALLBACK_PATH = "/auth/aliexpress/callback";

async function handleStart(c: Ctx) {
  const cr = await creds(c.env);
  if (!cr) return c.json({ error: "AliExpress app key/secret not configured yet" }, 503);
  const redirect = `${c.env.API_BASE_URL.replace(/\/$/, "")}${ALIEXPRESS_CALLBACK_PATH}`;
  const url =
    "https://api-sg.aliexpress.com/oauth/authorize" +
    `?response_type=code&force_auth=true&client_id=${encodeURIComponent(cr.appKey)}` +
    `&redirect_uri=${encodeURIComponent(redirect)}`;
  return c.redirect(url, 302);
}

aliexpressRoute.get("/auth/start", handleStart);

/**
 * GET /auth/aliexpress/callback — receive the authorization code.
 *
 * This is the URL registered in the AliExpress app console. It runs once per
 * authorisation and its only job is to turn `code` into a token pair and put
 * them in KV. It returns plain text rather than JSON because a human is
 * reading it in a browser, having just clicked a button.
 */
async function handleCallback(c: Ctx) {
  const code = c.req.query("code");
  if (!code) {
    const err = c.req.query("error_description") ?? c.req.query("error") ?? "no code in callback";
    return c.text(`AliExpress authorisation failed: ${err}`, 400);
  }
  const cr = await creds(c.env);
  if (!cr) return c.text("AliExpress app key/secret are not configured in the admin portal yet.", 503);

  const r = await callRest(cr, "/auth/token/create", { code });
  const token = r.json ? parseTokenPayload(r.json) : null;
  if (!token) {
    // Verbatim, on purpose. A generic failure here costs hours; the API's own
    // message usually names the problem outright.
    return c.text(`AliExpress rejected the code exchange (HTTP ${r.status}):\n\n${r.text}`, 502);
  }
  await writeToken(c.env, token);
  return c.text(
    "AliExpress connected.\n\n" +
      `Access token stored, expires ${new Date(token.expiresAt).toISOString()}.\n` +
      "It refreshes itself from now on — you should not need this page again.\n" +
      "You can close this tab."
  );
}

aliexpressRoute.get("/auth/callback", handleCallback);

/**
 * The same two handlers, mounted at the tidier top-level paths.
 *
 * `/auth/aliexpress/callback` is what goes in the AliExpress app console, and
 * it reads better there than `/aliexpress/auth/callback`. Both work, because a
 * redirect_uri that does not match the registered one to the character fails
 * with an unhelpful error, and the cost of accepting two spellings is one line.
 */
export const aliexpressAuthRoute = new Hono<{ Bindings: Env }>();
aliexpressAuthRoute.get("/start", handleStart);
aliexpressAuthRoute.get("/callback", handleCallback);

/** GET /aliexpress/status — is the bridge live? Safe to expose: no secrets. */
aliexpressRoute.get("/status", async (c) => {
  const cr = await creds(c.env);
  const t = await readToken(c.env);
  return c.json({
    configured: Boolean(cr),
    trackingId: Boolean(cr?.trackingId),
    authorised: Boolean(t),
    expiresAt: t ? new Date(t.expiresAt).toISOString() : null,
    // Named plainly so the admin panel can say what is missing rather than
    // just showing a red dot.
    missing: [
      ...(cr ? [] : ["app key/secret"]),
      ...(cr && !cr.trackingId ? ["tracking id"] : []),
      ...(t ? [] : ["authorisation"]),
    ],
  });
});

/* ------------------------------------------------------------------ */
/* Business calls                                                      */
/* ------------------------------------------------------------------ */

async function callSync(
  env: Env,
  cr: Creds,
  method: string,
  extra: Record<string, string>
): Promise<{ ok: boolean; json: Record<string, unknown> | null; text: string; status: number }> {
  const token = await accessToken(env, cr);
  if (!token) return { ok: false, json: null, text: "not authorised", status: 401 };
  const params = await withSign(
    {
      method,
      app_key: cr.appKey,
      session: token,
      sign_method: "sha256",
      timestamp: String(Date.now()),
      ...extra,
    },
    cr.appSecret
  );
  const res = await fetch(SYNC_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params).toString(),
  }).catch(() => null);
  if (!res) return { ok: false, json: null, text: "network error reaching AliExpress", status: 0 };
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* raw text is the diagnosis */
  }
  return { ok: res.ok, json, text, status: res.status };
}

/** Every site in the network reads these, so they answer any origin. */
function open(c: { header: (k: string, v: string) => void }, maxAge: number): void {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Cache-Control", `public, max-age=${maxAge}`);
}

/**
 * GET /aliexpress/product?id=<productId>&locale=&currency=&country=
 *
 * Cached in KV, because twelve sites hitting the same product on the same day
 * is twelve calls against a rate limit for one answer. The cache key carries
 * the locale and currency: the same product priced in two currencies is two
 * different answers and must not share an entry.
 */
aliexpressRoute.get("/product", async (c) => {
  const id = (c.req.query("id") ?? "").replace(/[^0-9]/g, "").slice(0, 24);
  if (!id) return c.json({ error: "id required" }, 400);
  const locale = (c.req.query("locale") ?? "EN").slice(0, 8).toUpperCase();
  const currency = (c.req.query("currency") ?? "USD").slice(0, 4).toUpperCase();
  const country = (c.req.query("country") ?? "US").slice(0, 4).toUpperCase();

  const cacheKey = `aliexpress:product:${id}:${locale}:${currency}:${country}`;
  const hit = await c.env.CACHE_KV.get(cacheKey).catch(() => null);
  if (hit) {
    open(c, PRODUCT_TTL_S);
    c.header("X-Cache", "HIT");
    return c.body(hit, 200, { "Content-Type": "application/json" });
  }

  const cr = await creds(c.env);
  if (!cr) return c.json({ error: "AliExpress not configured" }, 503);

  const r = await callSync(c.env, cr, "aliexpress.affiliate.productdetail.get", {
    product_ids: id,
    target_language: locale,
    target_currency: currency,
    ship_to_country: country,
    ...(cr.trackingId ? { tracking_id: cr.trackingId } : {}),
  });
  if (!r.ok || !r.json) {
    return c.json({ error: "aliexpress call failed", status: r.status, detail: r.text.slice(0, 600) }, 502);
  }
  const payload = JSON.stringify(r.json);
  await c.env.CACHE_KV.put(cacheKey, payload, { expirationTtl: PRODUCT_TTL_S }).catch(() => {});
  open(c, PRODUCT_TTL_S);
  c.header("X-Cache", "MISS");
  return c.body(payload, 200, { "Content-Type": "application/json" });
});

/**
 * GET /aliexpress/link?url=<aliexpress product or search url>
 *
 * Turns an ordinary AliExpress URL into a tracked one. Without a tracking id
 * this endpoint refuses rather than returning an untracked link: a link that
 * looks like it works and earns nothing is worse than an honest error, because
 * nobody discovers the problem until a payout that never arrives.
 */
aliexpressRoute.get("/link", async (c) => {
  const url = c.req.query("url") ?? "";
  if (!/^https?:\/\/[a-z0-9.-]*aliexpress\.[a-z.]+\//i.test(url)) {
    return c.json({ error: "url must be an aliexpress.com link" }, 400);
  }
  const cr = await creds(c.env);
  if (!cr) return c.json({ error: "AliExpress not configured" }, 503);
  if (!cr.trackingId) return c.json({ error: "tracking id not set — links would earn nothing" }, 503);

  const cacheKey = `aliexpress:link:${url}`;
  const hit = await c.env.CACHE_KV.get(cacheKey).catch(() => null);
  if (hit) {
    open(c, LINK_TTL_S);
    c.header("X-Cache", "HIT");
    return c.body(hit, 200, { "Content-Type": "application/json" });
  }

  const r = await callSync(c.env, cr, "aliexpress.affiliate.link.generate", {
    promotion_link_type: "0",
    source_values: url,
    tracking_id: cr.trackingId,
  });
  if (!r.ok || !r.json) {
    return c.json({ error: "aliexpress call failed", status: r.status, detail: r.text.slice(0, 600) }, 502);
  }
  const payload = JSON.stringify(r.json);
  await c.env.CACHE_KV.put(cacheKey, payload, { expirationTtl: LINK_TTL_S }).catch(() => {});
  open(c, LINK_TTL_S);
  c.header("X-Cache", "MISS");
  return c.body(payload, 200, { "Content-Type": "application/json" });
});
