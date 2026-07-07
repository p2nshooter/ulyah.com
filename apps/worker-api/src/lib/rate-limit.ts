import type { Env } from "../env.js";

/**
 * Fixed-window per-key rate limiter backed by KV — arsitektur doc §17
 * ("Rate limiting per-IP di level Worker") and §12.3 ("lockout otomatis
 * setelah percobaan gagal berulang" for the admin login form).
 */
export async function checkRateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const kvKey = `rl:${key}`;
  const current = await env.CACHE_KV.get(kvKey);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  await env.CACHE_KV.put(kvKey, String(count + 1), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - count - 1 };
}

export async function resetRateLimit(env: Env, key: string): Promise<void> {
  await env.CACHE_KV.delete(`rl:${key}`);
}
