// AI/GPU provider registry — arsitektur doc §11. Metadata only; the actual
// validation HTTP calls live in packages/key-pool (needs `fetch`, which is
// fine in Workers but kept out of this environment-agnostic package).

export type ProviderKind = "text" | "tts" | "gpu" | "image";

export interface ProviderDef {
  id: string;
  label: string;
  kind: ProviderKind;
  freeTier: string;
  homepage: string;
  /** Cheapest possible authenticated GET/POST used to validate a key without burning quota. */
  validation: {
    method: "GET" | "POST";
    url: string;
    authHeader: (key: string) => Record<string, string>;
    body?: unknown;
  };
}

export const AI_PROVIDERS: ProviderDef[] = [
  {
    id: "openrouter",
    label: "OpenRouter",
    kind: "text",
    freeTier: "Banyak model gratis (DeepSeek, Llama, Gemma, Mistral, Qwen)",
    homepage: "https://openrouter.ai",
    validation: {
      method: "GET",
      url: "https://openrouter.ai/api/v1/auth/key",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
  {
    id: "groq",
    label: "Groq",
    kind: "text",
    freeTier: "Inferensi sangat cepat, tier gratis generous",
    homepage: "https://groq.com",
    validation: {
      method: "GET",
      url: "https://api.groq.com/openai/v1/models",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
  {
    id: "google-ai-studio",
    label: "Google AI Studio (Gemini)",
    kind: "text",
    freeTier: "Tier gratis Gemini API",
    homepage: "https://aistudio.google.com",
    validation: {
      method: "GET",
      url: "https://generativelanguage.googleapis.com/v1beta/models",
      authHeader: (key) => ({ "x-goog-api-key": key }),
    },
  },
  {
    id: "workers-ai",
    label: "Cloudflare Workers AI",
    kind: "text",
    freeTier: "Kuota gratis harian, model bawaan edge",
    homepage: "https://developers.cloudflare.com/workers-ai",
    validation: {
      method: "GET",
      url: "https://api.cloudflare.com/client/v4/user/tokens/verify",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
  {
    id: "hf-inference",
    label: "Hugging Face Inference API",
    kind: "text",
    freeTier: "Model open-source gratis",
    homepage: "https://huggingface.co/inference-api",
    validation: {
      method: "GET",
      url: "https://huggingface.co/api/whoami-v2",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
  {
    id: "hf-zerogpu",
    label: "Hugging Face ZeroGPU",
    kind: "gpu",
    freeTier: "GPU gratis untuk Spaces",
    homepage: "https://huggingface.co/docs/hub/spaces-zerogpu",
    validation: {
      method: "GET",
      url: "https://huggingface.co/api/whoami-v2",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
  {
    id: "replicate",
    label: "Replicate",
    kind: "gpu",
    freeTier: "Berbayar per-detik (opsional)",
    homepage: "https://replicate.com",
    validation: {
      method: "GET",
      url: "https://api.replicate.com/v1/account",
      authHeader: (key) => ({ Authorization: `Token ${key}` }),
    },
  },
  {
    id: "modal",
    label: "Modal",
    kind: "gpu",
    freeTier: "Kredit gratis compute serverless GPU",
    homepage: "https://modal.com",
    validation: {
      method: "GET",
      url: "https://api.modal.com/auth/verify",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
  {
    id: "kaggle",
    label: "Kaggle (GPU/TPU notebooks)",
    kind: "gpu",
    freeTier: "±30 jam GPU + 20 jam TPU gratis per minggu per akun",
    homepage: "https://www.kaggle.com/docs/api",
    // Kaggle's API uses HTTP Basic auth (username:key from kaggle.json). Paste
    // the credential as "username:key" so the probe can authenticate; a bare
    // key still ingests but lands in pending_verification until confirmed.
    validation: {
      method: "GET",
      url: "https://www.kaggle.com/api/v1/datasets/list?page=1",
      authHeader: (key) => ({
        Authorization: `Basic ${btoa(key.includes(":") ? key : `kaggle:${key}`)}`,
      }),
    },
  },
  {
    id: "elevenlabs",
    label: "ElevenLabs TTS",
    kind: "tts",
    freeTier: "Berbayar di luar kuota gratis",
    homepage: "https://elevenlabs.io",
    validation: {
      method: "GET",
      url: "https://api.elevenlabs.io/v1/user",
      authHeader: (key) => ({ "xi-api-key": key }),
    },
  },
  {
    id: "nvidia-nim",
    label: "NVIDIA NIM (build.nvidia.com)",
    kind: "text",
    freeTier: "Kredit gratis untuk model open-source terhosting NVIDIA (Nemotron, Llama, dll.)",
    homepage: "https://build.nvidia.com",
    validation: {
      method: "GET",
      url: "https://integrate.api.nvidia.com/v1/models",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
  {
    id: "nvidia-maxine",
    label: "NVIDIA Maxine (gRPC AI services)",
    kind: "gpu",
    freeTier: "Kredit gratis — Active Speaker Detection & video AI via gRPC",
    homepage: "https://build.nvidia.com/explore/maxine",
    validation: {
      method: "GET",
      // Maxine's control plane is gRPC-only; we validate the underlying NGC
      // API key the same way NIM does since both are issued from the same
      // build.nvidia.com account.
      url: "https://integrate.api.nvidia.com/v1/models",
      authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
    },
  },
];

export function getProvider(id: string): ProviderDef | undefined {
  return AI_PROVIDERS.find((p) => p.id === id);
}
