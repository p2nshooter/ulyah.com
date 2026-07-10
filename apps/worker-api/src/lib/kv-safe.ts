import type { Env } from "../env.js";

/**
 * Best-effort KV write. Cloudflare's free tier caps KV at 1000 writes/day;
 * once exhausted, `KV.put()` throws "KV put() limit exceeded for the day".
 * Every write here is a *cache* write — losing one only means the next
 * request recomputes the value, never a user-visible failure. So we swallow
 * the error rather than letting it bubble up and 500 an otherwise-fine
 * request (which is exactly what made login, hadits and the Qur'an reader
 * all break at once when the budget ran out).
 *
 * Session/auth state does NOT go through KV anymore (see session.ts), so no
 * correctness-critical write depends on this succeeding.
 */
export async function safeKvPut(
  env: Env,
  key: string,
  value: string,
  options?: KVNamespacePutOptions
): Promise<void> {
  try {
    await env.CACHE_KV.put(key, value, options);
  } catch (e) {
    console.warn(`safeKvPut skipped for ${key}:`, e instanceof Error ? e.message : e);
  }
}
