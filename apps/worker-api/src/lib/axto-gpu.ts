import { decryptApiKey } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";
import { getKeyRow, listKeySummaries } from "./keypool-store.js";

/**
 * Produksi seri G- axto.io dengan kunci GPU ulyah.com (pemilik, 23 Nov 2026: „tandai serinya dengan G- biar jelas bahwa ini
 * karya GPU" · „Series G- masih blm terlihat, biar cepet live").
 *
 * Alur tanpa rahasia baru: workflow axto menulis antrean `axto-gpu/jobs.json` ke bucket media ini (deskripsi karya dari
 * DNA axto, TANPA teks — teks Al-Qur'an/hadits tidak pernah dibuat mesin); heartbeat 15 menit ini merender beberapa
 * pekerjaan dengan kunci Hugging Face yang hidup (bergiliran, pindah kunci bila ditolak), menyimpan PNG ke
 * `axto-gpu/out/<c>/<id>.png` dan mencatatnya di `axto-gpu/done.json`; workflow axto menyalin hasil ke R2 axto.io dan
 * memberi nomor seri G-. Kunci mentah tidak pernah keluar dari fungsi ini.
 */

interface Job { c: string; id: number; prompt: string }
interface Done { done: Record<string, { at: string; bytes: number; model: string }>; failed: Record<string, number> }

const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const PER_TICK = 6;
const NEGATIVE = "text, letters, words, writing, calligraphy, arabic script, numbers, watermark, signature, logo, blurry, lowres, deformed";

async function readJson<T>(env: Env, key: string, fallback: T): Promise<T> {
  try {
    const o = await env.MEDIA_R2?.get(key);
    return o ? ((await o.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function render(rawKey: string, prompt: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${rawKey}`, "Content-Type": "application/json", Accept: "image/png" },
      body: JSON.stringify({ inputs: prompt, parameters: { negative_prompt: NEGATIVE, width: 768, height: 768, num_inference_steps: 24, guidance_scale: 7 } }),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const bytes = await res.arrayBuffer();
    return bytes.byteLength > 20_000 ? bytes : null;
  } catch {
    return null;
  }
}

/** Satu putaran: sampai PER_TICK pekerjaan, kunci HF hidup bergiliran. Mengembalikan jumlah karya baru. */
export async function axtoGpuTick(env: Env): Promise<number> {
  if (!env.MEDIA_R2) return 0;
  const queue = await readJson<{ jobs: Job[] }>(env, "axto-gpu/jobs.json", { jobs: [] });
  const state = await readJson<Done>(env, "axto-gpu/done.json", { done: {}, failed: {} });
  state.failed ??= {};
  const pending = queue.jobs.filter((j) => !state.done[`${j.c}:${j.id}`] && (state.failed[`${j.c}:${j.id}`] ?? 0) < 3).slice(0, PER_TICK);
  if (!pending.length) return 0;
  const keys = (await listKeySummaries(env, { fresh: false })).filter((k) => (k.provider === "hf-inference" || k.provider === "hf-zerogpu") && (k.status === "active" || k.status === "slow"));
  if (!keys.length) return 0;
  const start = Math.floor(Date.now() / 900_000) % keys.length;
  let made = 0;
  for (const [i, job] of pending.entries()) {
    let ok = false;
    for (let t = 0; t < Math.min(3, keys.length) && !ok; t += 1) {
      const k = keys[(start + i + t) % keys.length];
      if (!k) continue;
      try {
        const row = await getKeyRow(env, k.id);
        if (!row) continue;
        const raw = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, env.KEY_ENCRYPTION_SECRET);
        const img = await render(raw, job.prompt);
        if (!img) continue;
        await env.MEDIA_R2.put(`axto-gpu/out/${job.c}/${job.id}.png`, img, { httpMetadata: { contentType: "image/png" } });
        state.done[`${job.c}:${job.id}`] = { at: new Date().toISOString(), bytes: img.byteLength, model: MODEL };
        ok = true;
        made += 1;
      } catch {
        // kunci berikutnya
      }
    }
    if (!ok) state.failed[`${job.c}:${job.id}`] = (state.failed[`${job.c}:${job.id}`] ?? 0) + 1;
  }
  await env.MEDIA_R2.put("axto-gpu/done.json", JSON.stringify(state), { httpMetadata: { contentType: "application/json" } });
  return made;
}
