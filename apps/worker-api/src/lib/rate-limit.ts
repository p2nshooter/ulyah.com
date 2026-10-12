import type { Env } from "../env.js";
import { safeKvGet, safeKvPut } from "./kv-safe.js";

/**
 * Fixed-window per-key rate limiter backed by KV — arsitektur doc §17
 * ("Rate limiting per-IP di level Worker") and §12.3 ("lockout otomatis
 * setelah percobaan gagal berulang" for the admin login form).
 *
 * Fail-open: rate limiting is defence-in-depth, never the thing that should
 * block a legitimate login/registration. If KV is unavailable (e.g. the
 * daily write budget is exhausted), the request is allowed through.
 */
export async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const kvKey = `rl:${key}`;
  let count = 0;
  try {
    const current = await safeKvGet(env, kvKey);
    count = current ? parseInt(current, 10) : 0;
  } catch {
    return { allowed: true, remaining: limit }; // KV read failed — fail open
  }

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await safeKvPut(env, kvKey, String(count + 1), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - count - 1 };
}

export async function resetRateLimit(env: Env, key: string): Promise<void> {
  try {
    await env.CACHE_KV.delete(`rl:${key}`);
  } catch {
    /* non-fatal */
  }
}

/**
 * The same fixed-window limit, kept in this isolate's memory instead of KV.
 *
 * For the high-volume public beacons (pageview, install, the reader/AI helpers)
 * the KV version cost one KV write per request — and the free plan allows the
 * whole account 1,000 KV writes a DAY. They ran out within hours, and with them
 * every real cache write: the sitemap, the coverage figures, the purge flags.
 * Once KV cannot cache, those answers are recomputed from D1 on every request,
 * which is how a rate limiter ended up spending the D1 read quota.
 *
 * Per isolate is looser than global — a determined flood spread over many colos
 * gets more through — and that is acceptable for endpoints whose worst case is
 * a few extra pageview rows. Login, 2FA, donations and uploads keep the KV
 * limiter above, where a global count matters and the volume is tiny.
 */
const localWindows = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimitLocal(
  key: string,
  limit: number,
  windowSeconds: number,
  now = Date.now()
): { allowed: boolean; remaining: number } {
  const hit = localWindows.get(key);
  if (!hit || hit.resetAt <= now) {
    if (localWindows.size > 10_000) {
      for (const [k, v] of localWindows) if (v.resetAt <= now) localWindows.delete(k);
      if (localWindows.size > 10_000) localWindows.clear();
    }
    localWindows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1 };
  }
  if (hit.count >= limit) return { allowed: false, remaining: 0 };
  hit.count++;
  return { allowed: true, remaining: limit - hit.count };
}
