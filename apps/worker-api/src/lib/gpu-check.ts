import { decryptApiKey } from "@ulyah/shared/crypto";
import { testApiKey } from "@ulyah/key-pool";
import { getProvider } from "@ulyah/shared/providers";
import type { Env } from "../env.js";
import { getKeyRow, listKeySummaries, logValidation, setKeyState, type KeySummary } from "./keypool-store.js";

/**
 * GPU key check — is every GPU key in the admin portal still alive, and what can it actually do for axto.io's
 * animations? (Owner, 22 Nov 2026: "cek jg setiap key gpu yg ada d portal admin, apakah masih aktif dan bisa di test
 * untuk membuat sebagian animasi axto.io yg lebih bagus".)
 *
 * For every key whose provider is a GPU provider (Hugging Face ZeroGPU / Inference, Replicate, Modal, Kaggle, NVIDIA)
 * or whose scope is gpu/image:
 *   1. the provider's own read-only auth probe (packages/key-pool testApiKey) — alive, rejected or rate-limited;
 *   2. a capability probe — what the account can run (NVIDIA: the image/video models it lists; Hugging Face: the
 *      token's role and its Inference permission; Replicate / Modal / Kaggle: the account answers);
 *   3. with `render`, one small real render on a free tier (Hugging Face Inference, text-to-image), to prove the key
 *      can make art, not merely log in. The image is kept in R2 for the admin to see.
 * The verdict per key is "bisa untuk animasi axto.io" only when it is alive AND has a way to render.
 * Raw keys never leave this function; the report (R2 `c/gpu_check/latest.json`) carries ids, providers and verdicts.
 */

export interface GpuCheckRow {
  id: number;
  provider: string;
  scope: string;
  donor_label: string | null;
  alive: boolean;
  status: string;
  latency_ms: number;
  detail: string;
  capabilities: string[];
  render: { tried: boolean; ok: boolean; detail: string; image?: string } | null;
  forAxto: { usable: boolean; reason: string };
}

export interface GpuCheckReport {
  at: string;
  checked: number;
  alive: number;
  usableForAxto: number;
  rows: GpuCheckRow[];
}

const GPU_PROVIDERS = new Set(["hf-zerogpu", "hf-inference", "replicate", "modal", "kaggle", "nvidia-maxine", "nvidia-nim"]);
export const isGpuKey = (k: Pick<KeySummary, "provider" | "scope">): boolean =>
  k.scope === "gpu" || k.scope === "image" || getProvider(k.provider)?.kind === "gpu" || GPU_PROVIDERS.has(k.provider);

const VISUAL_MODEL = /sdxl|stable-diffusion|stable_diffusion|flux|cosmos|edify|video|image|diffusion|sana|kandinsky|playground|consistory|bria/i;

async function getJson(url: string, headers: Record<string, string>): Promise<{ ok: boolean; status: number; body: unknown }> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json", ...headers } });
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { ok: res.ok, status: res.status, body };
  } catch {
    return { ok: false, status: 0, body: null };
  }
}

/** What the account can do, read-only. */
async function capabilities(provider: string, rawKey: string): Promise<string[]> {
  if (provider === "nvidia-nim" || provider === "nvidia-maxine") {
    const r = await getJson("https://integrate.api.nvidia.com/v1/models", { Authorization: `Bearer ${rawKey}` });
    const ids = ((r.body as { data?: { id?: string }[] })?.data ?? []).map((m) => String(m.id ?? ""));
    const visual = ids.filter((id) => VISUAL_MODEL.test(id));
    return [`${ids.length} model terdaftar`, ...(visual.length ? [`model gambar/video: ${visual.slice(0, 8).join(", ")}`] : ["tidak ada model gambar/video di daftar"])];
  }
  if (provider === "hf-zerogpu" || provider === "hf-inference") {
    const r = await getJson("https://huggingface.co/api/whoami-v2", { Authorization: `Bearer ${rawKey}` });
    const b = r.body as { name?: string; auth?: { accessToken?: { role?: string; fineGrained?: { scoped?: { permissions?: string[] }[]; global?: string[] } } } };
    const tok = b?.auth?.accessToken;
    const perms = [...(tok?.fineGrained?.global ?? []), ...(tok?.fineGrained?.scoped ?? []).flatMap((x) => x.permissions ?? [])];
    const inference = tok?.role === "write" || tok?.role === "read" || perms.some((p) => /inference/i.test(p));
    return [`akun ${b?.name ?? "?"}`, `token ${tok?.role ?? (perms.length ? "fine-grained" : "?")}`, inference ? "boleh memanggil Inference API (teks→gambar)" : "tanpa izin Inference"];
  }
  if (provider === "replicate") {
    const r = await getJson("https://api.replicate.com/v1/account", { Authorization: `Token ${rawKey}` });
    const b = r.body as { username?: string; type?: string };
    return r.ok ? [`akun ${b?.username ?? "?"} (${b?.type ?? "?"})`, "model gambar & video lewat predictions (berbayar per detik)"] : [`akun tidak menjawab (HTTP ${r.status})`];
  }
  if (provider === "modal") return ["GPU serverless — perlu aplikasi Modal yang di-deploy untuk merender"];
  if (provider === "kaggle") return ["notebook GPU/TPU (±30 jam/minggu) — untuk render batch, bukan panggilan langsung"];
  return [];
}

/** One small real render on Hugging Face's free Inference, to prove the key can make an image. */
async function tryRender(env: Env, provider: string, rawKey: string, id: number): Promise<GpuCheckRow["render"]> {
  if (provider !== "hf-zerogpu" && provider !== "hf-inference") {
    return { tried: false, ok: false, detail: "uji render otomatis hanya untuk Hugging Face (gratis); penyedia ini berbayar per detik" };
  }
  const model = "stabilityai/stable-diffusion-xl-base-1.0";
  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${rawKey}`, "Content-Type": "application/json", Accept: "image/png" },
      body: JSON.stringify({
        inputs: "ornate golden islamic geometric arabesque frame, deep emerald background, luminous, no text",
        parameters: { width: 512, height: 512, num_inference_steps: 12 },
      }),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) {
      return { tried: true, ok: false, detail: `HTTP ${res.status}${type ? ` (${type.split(";")[0]})` : ""}` };
    }
    const bytes = await res.arrayBuffer();
    const key = `gpu-check/${id}.png`;
    await env.MEDIA_R2?.put(key, bytes, { httpMetadata: { contentType: type } });
    return { tried: true, ok: true, detail: `${model}: gambar ${Math.round(bytes.byteLength / 1024)} KB`, image: key };
  } catch {
    return { tried: true, ok: false, detail: "penyedia tidak menjawab" };
  }
}

export async function runGpuCheck(env: Env, opts: { render?: boolean; limit?: number } = {}): Promise<GpuCheckReport> {
  const keys = (await listKeySummaries(env, { fresh: true })).filter((k) => k.status !== "revoked" && isGpuKey(k)).slice(0, opts.limit ?? 60);
  const rows: GpuCheckRow[] = [];
  for (let i = 0; i < keys.length; i += 6) {
    const batch = keys.slice(i, i + 6);
    rows.push(
      ...(await Promise.all(
        batch.map(async (k): Promise<GpuCheckRow> => {
          const base = { id: k.id, provider: k.provider, scope: k.scope, donor_label: k.donor_label };
          try {
            const row = await getKeyRow(env, k.id);
            if (!row) throw new Error("dokumen kunci tidak ada");
            const raw = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, env.KEY_ENCRYPTION_SECRET);
            const test = await testApiKey(k.provider, raw);
            const status = test.passed ? (test.optimal ? "active" : "slow") : test.dead ? "rejected" : "rate_limited";
            await setKeyState(env, k.id, { status, latency_ms: test.latencyMs, passed: test.passed });
            await logValidation(env, { key_id: k.id, test_type: "gpu_check", passed: test.passed, latency_ms: test.latencyMs, safety_score: test.safetyScore, detail: test.detail });
            const caps = test.passed ? await capabilities(k.provider, raw) : [];
            const render = test.passed && opts.render ? await tryRender(env, k.provider, raw, k.id) : null;
            const canRender =
              render?.ok ||
              caps.some((c) => /model gambar\/video:|Inference API|predictions/.test(c));
            return {
              ...base,
              alive: test.passed,
              status,
              latency_ms: test.latencyMs,
              detail: test.detail,
              capabilities: caps,
              render,
              forAxto: test.passed
                ? canRender
                  ? { usable: true, reason: render?.ok ? "render nyata berhasil" : "akun aktif dan punya jalur render gambar/video" }
                  : { usable: false, reason: "aktif, tetapi tidak ada jalur render langsung (perlu aplikasi/notebook sendiri)" }
                : { usable: false, reason: test.dead ? "kunci ditolak penyedia (mati)" : "sementara dibatasi / tidak menjawab" },
            };
          } catch {
            // Never echo an exception to the admin page: it could carry a provider's response or a stack.
            return { ...base, alive: false, status: k.status, latency_ms: 0, detail: "gagal diuji (dekripsi atau jaringan)", capabilities: [], render: null, forAxto: { usable: false, reason: "gagal diuji" } };
          }
        })
      ))
    );
  }
  const report: GpuCheckReport = {
    at: new Date().toISOString(),
    checked: rows.length,
    alive: rows.filter((r) => r.alive).length,
    usableForAxto: rows.filter((r) => r.forAxto.usable).length,
    rows,
  };
  await env.MEDIA_R2?.put("c/gpu_check/latest.json", JSON.stringify(report), { httpMetadata: { contentType: "application/json" } });
  return report;
}

export async function latestGpuCheck(env: Env): Promise<GpuCheckReport | null> {
  try {
    const o = await env.MEDIA_R2?.get("c/gpu_check/latest.json");
    return o ? ((await o.json()) as GpuCheckReport) : null;
  } catch {
    return null;
  }
}
