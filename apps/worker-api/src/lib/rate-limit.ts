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
