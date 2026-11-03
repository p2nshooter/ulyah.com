/** Batas laju sederhana di KV (diizinkan aturan R2: KV hanya untuk penghitung singkat, bukan data tahan lama). */
import type { Env } from '../env.ts';

export async function limit(env: Env, key: string, max: number, windowSec: number): Promise<boolean> {
  if (!env.RL) return true;
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const k = `rl:${key}:${bucket}`;
  try {
    const cur = Number((await env.RL.get(k)) ?? '0');
    if (cur >= max) return false;
    await env.RL.put(k, String(cur + 1), { expirationTtl: Math.max(60, windowSec + 60) });
    return true;
  } catch {
    return true;
  }
}
