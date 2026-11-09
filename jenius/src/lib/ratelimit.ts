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

/**
 * Penghitung kejadian dalam jendela waktu (pemilik, 7 Nov 2026: „jgn sampe ada kebocoran biaya baik dari engine maupun
 * dari kecurangan member“). `bump` menambah satu dan mengembalikan jumlah baru; `count` hanya membaca. KV saja (penghitung
 * singkat, kedaluwarsa sendiri), tidak pernah data tahan lama.
 */
export async function bump(env: Env, key: string, windowSec: number): Promise<number> {
  if (!env.RL) return 0;
  const k = `ct:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`;
  try {
    const next = Number((await env.RL.get(k)) ?? '0') + 1;
    await env.RL.put(k, String(next), { expirationTtl: Math.max(60, windowSec + 60) });
    return next;
  } catch {
    return 0;
  }
}

export async function count(env: Env, key: string, windowSec: number): Promise<number> {
  if (!env.RL) return 0;
  try {
    return Number((await env.RL.get(`ct:${key}:${Math.floor(Date.now() / (windowSec * 1000))}`)) ?? '0');
  } catch {
    return 0;
  }
}
