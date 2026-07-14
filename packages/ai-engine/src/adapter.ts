// Unified chat-completion adapter. Covers every donated free-tier TEXT
// provider so no key type is left unusable: the OpenAI-compatible ones
// (OpenRouter, Groq, NVIDIA NIM, Hugging Face router) share one code path,
// and Google AI Studio (Gemini) has its own. Cloudflare Workers AI is called
// via the `env.AI` binding directly in apps/worker-api (no raw-fetch key),
// so it isn't included here.

export interface ChatCompletionResult {
  text: string;
  latencyMs: number;
}

const OPENAI_COMPATIBLE_BASE: Record<string, string> = {
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  "nvidia-nim": "https://integrate.api.nvidia.com/v1/chat/completions",
  "hf-inference": "https://router.huggingface.co/v1/chat/completions",
};

const DEFAULT_MODEL: Record<string, string> = {
  openrouter: "deepseek/deepseek-chat",
  groq: "llama-3.3-70b-versatile",
  "nvidia-nim": "meta/llama-3.1-8b-instruct",
  "hf-inference": "meta-llama/Llama-3.1-8B-Instruct",
};

export async function chatComplete(
  provider: string,
  rawKey: string,
  prompt: string,
  opts: { model?: string; timeoutMs?: number } = {}
): Promise<ChatCompletionResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);

  try {
    if (provider === "google-ai-studio") {
      const model = opts.model ?? "gemini-2.0-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": rawKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: controller.signal,
        }
      );
      if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
      const json = (await res.json()) as any;
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return { text, latencyMs: Date.now() - started };
    }

    const url = OPENAI_COMPATIBLE_BASE[provider];
    if (!url) throw new Error(`No chat-completion adapter registered for provider "${provider}"`);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${rawKey}` },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL[provider],
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${provider} API error ${res.status}: ${await res.text()}`);
    const json = (await res.json()) as any;
    const text = json.choices?.[0]?.message?.content ?? "";
    return { text, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timeout);
  }
}

/** Best-effort JSON extraction — models sometimes wrap output in ```json fences despite instructions. */
export function extractJson<T = unknown>(text: string): T | null {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenceMatch ? fenceMatch[1]! : text;
  try {
    return JSON.parse(candidate.trim()) as T;
  } catch {
    const braceMatch = candidate.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
