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

/* ── Seri G- BERGERAK: video dibuat GPU (pemilik, 24 Nov 2026: „Series G- wajib sudah dengan animasi saat produksi, jd 100%
 * di buatkan GPU") ─────────────────────────────────────────────────────────────────────────────────────────────────────
 * Lukisan G- (gambar GPU) diubah GPU menjadi video pendek lewat Space ZeroGPU Hugging Face — gratis dalam jatah harian akun
 * pemilik kunci. Antrean `axto-gpu/video-jobs.json` ditulis workflow axto (ops/gpu-sync.mjs): {c, id, img, prompt}. Hasil →
 * `axto-gpu/vid/<c>/<id>-v<versi>.mp4` + `axto-gpu/video-done.json`; workflow axto menyalinnya ke R2 axto.io dan karya G- baru tampil
 * setelah videonya ada. Model: Wan 2.2 I2V cepat (gerak paling baik), cadangan LTX-Video distilled. Tanpa teks. */

interface VideoJob { c: string; id: number; v?: number; img: string; prompt: string }
/** Kunci & berkas video per versi lukisan (seri G- dibuat ulang 24 Nov 2026: id yang sama bisa berganti lukisan). */
const kunciVideo = (j: VideoJob) => `${j.c}:${j.id}:v${j.v ?? 1}`;
interface VideoDone { done: Record<string, { at: string; bytes: number; space: string }>; failed: Record<string, number> }

const VIDEO_PER_TICK = 2;
const VIDEO_TIMEOUT_MS = 150_000;
const VIDEO_BUDGET_MS = 11 * 60_000;
const VIDEO_NEGATIVE = "text, letters, words, writing, numbers, subtitles, watermark, logo, signature, people, face, blurry, distorted, deformed, melting, static, frozen, low quality";

/** Space gambar→video ZeroGPU (Gradio REST: POST /gradio_api/call/<api>, lalu GET SSE hasilnya). */
export const VIDEO_SPACES: { space: string; api: string; data: (img: unknown, prompt: string, seed: number) => unknown[] }[] = [
  // zerogpu-aoti/wan2-2-fp8da-aoti-faster · generate_video(image, prompt, steps, negative, duration, guidance, guidance_2, seed, randomize)
  { space: "zerogpu-aoti-wan2-2-fp8da-aoti-faster", api: "generate_video", data: (img, prompt, seed) => [img, prompt, 4, VIDEO_NEGATIVE, 2.5, 1, 1, seed, false] },
  // Lightricks/ltx-video-distilled · image_to_video(prompt, negative, image, video, height, width, mode, duration, frames, seed, randomize, guidance, texture)
  { space: "lightricks-ltx-video-distilled", api: "image_to_video", data: (img, prompt, seed) => [prompt, VIDEO_NEGATIVE, img, null, 512, 512, "image-to-video", 2.5, 9, seed, false, 1, true] },
];

/** Ambil berkas hasil dari data „complete" Gradio (gr.Video → {video: FileData} atau FileData). */
export function urlVideo(base: string, out: unknown): string | null {
  const first = Array.isArray(out) ? out[0] : out;
  const f = (first && typeof first === "object" && "video" in (first as object) ? (first as { video: unknown }).video : first) as { url?: string; path?: string } | null;
  if (!f || typeof f !== "object") return null;
  if (typeof f.url === "string" && /^https:\/\//.test(f.url)) return f.url;
  return typeof f.path === "string" ? `${base}/file=${f.path}` : null;
}

/** Satu render video lewat satu Space. null = gagal (pindah Space/kunci). */
export async function renderVideo(rawKey: string, spec: (typeof VIDEO_SPACES)[number], job: VideoJob, fetchImpl: typeof fetch = fetch, ms = VIDEO_TIMEOUT_MS): Promise<ArrayBuffer | null> {
  const base = `https://${spec.space}.hf.space/gradio_api`;
  const auth = { Authorization: `Bearer ${rawKey}` };
  // antrean ZeroGPU bisa panjang; tick terjadwal Workers dibatasi 15 menit → tiap render dipotong (lalu Space/kunci berikutnya)
  const signal = AbortSignal.timeout(ms);
  try {
    const img = { path: job.img, meta: { _type: "gradio.FileData" } };
    const seed = job.id % 2_147_483_647;
    const r = await fetchImpl(`${base}/call/${spec.api}`, { method: "POST", signal, headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ data: spec.data(img, job.prompt, seed) }) });
    if (!r.ok) return null;
    const ev = ((await r.json()) as { event_id?: string }).event_id;
    if (!ev) return null;
    const s = await fetchImpl(`${base}/call/${spec.api}/${ev}`, { signal, headers: auth });
    if (!s.ok) return null;
    const sse = await s.text();
    const m = /event:\s*complete\s*\r?\ndata:\s*(.+)/.exec(sse);
    if (!m?.[1]) return null;
    const url = urlVideo(base, JSON.parse(m[1]));
    if (!url) return null;
    const v = await fetchImpl(url, { signal, headers: auth });
    if (!v.ok) return null;
    const bytes = await v.arrayBuffer();
    return bytes.byteLength > 20_000 ? bytes : null;
  } catch {
    return null;
  }
}

/** Satu putaran video: sampai VIDEO_PER_TICK karya, kunci HF & Space bergiliran. Mengembalikan jumlah video baru. */
export async function axtoVideoTick(env: Env, fetchImpl: typeof fetch = fetch): Promise<number> {
  if (!env.MEDIA_R2) return 0;
  const queue = await readJson<{ jobs: VideoJob[] }>(env, "axto-gpu/video-jobs.json", { jobs: [] });
  const state = await readJson<VideoDone>(env, "axto-gpu/video-done.json", { done: {}, failed: {} });
  state.failed ??= {};
  const pending = queue.jobs.filter((j) => /^https:\/\/axto\.io\/gpu\//.test(j.img) && !state.done[kunciVideo(j)] && (state.failed[kunciVideo(j)] ?? 0) < 4).slice(0, VIDEO_PER_TICK);
  if (!pending.length) return 0;
  const keys = (await listKeySummaries(env, { fresh: false })).filter((k) => (k.provider === "hf-zerogpu" || k.provider === "hf-inference") && (k.status === "active" || k.status === "slow"));
  if (!keys.length) return 0;
  const start = Math.floor(Date.now() / 900_000) % keys.length;
  const until = Date.now() + VIDEO_BUDGET_MS;
  const save = () => env.MEDIA_R2!.put("axto-gpu/video-done.json", JSON.stringify(state), { httpMetadata: { contentType: "application/json" } });
  let made = 0;
  for (const [i, job] of pending.entries()) {
    if (Date.now() > until) break;
    let ok = false;
    for (let t = 0; t < Math.min(3, keys.length) && !ok && Date.now() < until; t += 1) {
      const k = keys[(start + i + t) % keys.length];
      if (!k) continue;
      try {
        const row = await getKeyRow(env, k.id);
        if (!row) continue;
        const raw = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, env.KEY_ENCRYPTION_SECRET);
        for (const spec of VIDEO_SPACES) {
          if (Date.now() > until) break;
          const vid = await renderVideo(raw, spec, job, fetchImpl);
          if (!vid) continue;
          await env.MEDIA_R2.put(`axto-gpu/vid/${job.c}/${job.id}-v${job.v ?? 1}.mp4`, vid, { httpMetadata: { contentType: "video/mp4" } });
          state.done[kunciVideo(job)] = { at: new Date().toISOString(), bytes: vid.byteLength, space: spec.space };
          ok = true;
          made += 1;
          break;
        }
      } catch {
        // kunci berikutnya
      }
    }
    if (!ok) state.failed[kunciVideo(job)] = (state.failed[kunciVideo(job)] ?? 0) + 1;
    await save();
  }
  return made;
}
