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
/**
 * Best-effort KV read — the read-side twin of safeKvPut. The free tier also
 * caps KV at 100k reads/day; once exhausted, `KV.get()` THROWS on every
 * call, and because cache reads sit at the top of nearly every route
 * (rate-limit, Qur'an, hadits, machine-translation), an unguarded get turns
 * quota exhaustion into a sitewide "all content gone" outage while D1 is
 * perfectly healthy (owner incident, 2026-07-16). A failed read is just a
 * cache miss: return null and let the route recompute from D1.
 */
export async function safeKvGet(env: Env, key: string): Promise<string | null> {
  try {
    return await env.CACHE_KV.get(key);
  } catch (e) {
    console.warn(`safeKvGet miss for ${key}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

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
