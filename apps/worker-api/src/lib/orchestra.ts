import { chatComplete } from "@ulyah/ai-engine";
import type { KeyScope } from "@ulyah/shared/types";
import type { Env } from "../env.js";
import { selectKeyForScope, recordKeyUsage } from "./keypool-db.js";

/**
 * ORCHESTRA CORE — the real routing brain for ULYAH.COM's AI.
 *
 * Design rule (from the owner's Arsitektur_baru / Orchestra Core docs):
 * Anthropic is NEVER a single point of failure, and requests are described by
 * CAPABILITY (what work is needed), not by provider name. Each capability maps
 * to an ordered failover chain of provider steps; Orchestra walks the chain
 * until one succeeds, records per-key health as it goes, and — only if every
 * donated key fails and the admin has enabled it — falls back to the free
 * Cloudflare Workers AI model. Swapping providers later = editing this
 * registry, not the callers. This is deliberately serverless-friendly: no
 * long-lived process, it just picks the healthiest key per request.
 *
 * What is real here: capability→chain routing, live failover across donated
 * keys, per-key health recording (via recordKeyUsage), and cooldown auto-wake
 * of rate-limited keys. What is still blueprint (see the admin Orchestra Core
 * tab): the full worker/co-worker hierarchy, self-learning, and RAG — those
 * build ON TOP of this router.
 */

export type Capability =
  | "reasoning" // complex analysis, architecture-grade thinking
  | "translate" // multi-language translation
  | "summarize" // condense long tafsir/kitab text
  | "answer" // Q&A (must be grounded in DB by the caller — RAG first)
  | "classify" // fast labelling (hadith grade, category, intent)
  | "sanad" // isnad / narrator analysis
  | "content"; // article/kisah drafting

interface ProviderStep {
  provider: string; // matches ai_key_pool.provider ("google-ai-studio" | "groq" | "openrouter" | …)
  scope: KeyScope; // matches ai_key_pool.scope
  model?: string;
}

// Cheapest/fastest first, always with at least two independent providers so a
// single provider's outage or rate-limit never blocks the capability.
const TEXT_CHAIN: ProviderStep[] = [
  { provider: "google-ai-studio", scope: "text", model: "gemini-2.0-flash" },
  { provider: "groq", scope: "text" },
  { provider: "openrouter", scope: "text" },
];

const CAPABILITY_CHAINS: Record<Capability, ProviderStep[]> = {
  // Reasoning prefers the strongest free reasoning model, then any text key.
  reasoning: [
    { provider: "google-ai-studio", scope: "text", model: "gemini-2.0-flash" },
    { provider: "openrouter", scope: "text", model: "deepseek/deepseek-chat" },
    { provider: "groq", scope: "text" },
  ],
  translate: TEXT_CHAIN,
  summarize: TEXT_CHAIN,
  answer: TEXT_CHAIN,
  // Classification is short + high-volume, so lead with the fastest provider.
  classify: [{ provider: "groq", scope: "text" }, ...TEXT_CHAIN],
  sanad: [
    { provider: "google-ai-studio", scope: "text", model: "gemini-2.0-flash" },
    { provider: "openrouter", scope: "text" },
    { provider: "groq", scope: "text" },
  ],
  content: TEXT_CHAIN,
};

export interface OrchestraAttempt {
  provider: string;
  keyId: number | null;
  ok: boolean;
  detail?: string;
}

export interface OrchestraResult {
  ok: boolean;
  text: string | null;
  servedBy: string | null; // "provider#keyId" or "workers-ai"
  capability: Capability;
  attempts: OrchestraAttempt[];
}

/** Bring rate-limited keys back automatically once their cooldown has elapsed —
 * "jika ada AI yg kena rate limited pastikan bangun otomatis, jgn diem aja".
 * A 5-minute cooldown is a safe default for free tiers; the next real request
 * re-tests the key for good and re-demotes it if it's still throttled. */
async function reviveCooledKeys(env: Env): Promise<void> {
  try {
    await env.DB.prepare(
      "UPDATE ai_key_pool SET status = 'active' WHERE status = 'rate_limited' AND last_health_check < datetime('now', '-5 minutes')"
    ).run();
  } catch {
    /* non-fatal: revival is best-effort */
  }
}

async function cfWorkerAiEnabled(env: Env): Promise<boolean> {
  try {
    const raw = await env.CACHE_KV.get("scaling:settings");
    return raw ? JSON.parse(raw).cfWorkerAiEnabled === true : false;
  } catch {
    return false;
  }
}

/**
 * Run one AI job through the failover chain for its capability. Returns which
 * provider/key actually served it plus the full attempt trail (for the admin
 * observability view). Never throws — a total failure is reported as
 * `{ ok: false }` so callers can degrade gracefully instead of 500-ing.
 */
export async function orchestrate(
  env: Env,
  opts: { capability: Capability; prompt: string; timeoutMs?: number }
): Promise<OrchestraResult> {
  await reviveCooledKeys(env);
  const chain = CAPABILITY_CHAINS[opts.capability] ?? TEXT_CHAIN;
  const attempts: OrchestraAttempt[] = [];

  for (const step of chain) {
    const selected = await selectKeyForScope(env, step.scope, step.provider);
    if (!selected) {
      attempts.push({ provider: step.provider, keyId: null, ok: false, detail: "no active key for this provider/scope" });
      continue;
    }
    const started = Date.now();
    try {
      const res = await chatComplete(step.provider, selected.rawKey, opts.prompt, {
        model: step.model,
        timeoutMs: opts.timeoutMs ?? 30_000,
      });
      await recordKeyUsage(env, selected.entry.id, Date.now() - started, true);
      attempts.push({ provider: step.provider, keyId: selected.entry.id, ok: true });
      return { ok: true, text: res.text, servedBy: `${step.provider}#${selected.entry.id}`, capability: opts.capability, attempts };
    } catch (err) {
      // recordKeyUsage(false) flips the key to 'rate_limited'; reviveCooledKeys
      // will bring it back after the cooldown, so a transient 429 self-heals.
      await recordKeyUsage(env, selected.entry.id, Date.now() - started, false);
      attempts.push({ provider: step.provider, keyId: selected.entry.id, ok: false, detail: String(err).slice(0, 200) });
    }
  }

  // Free last resort — only when the admin has switched Cloudflare Workers AI on.
  if (await cfWorkerAiEnabled(env)) {
    try {
      const out = (await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { prompt: opts.prompt } as never)) as {
        response?: string;
      };
      attempts.push({ provider: "workers-ai", keyId: null, ok: true });
      return { ok: true, text: out.response ?? "", servedBy: "workers-ai", capability: opts.capability, attempts };
    } catch (err) {
      attempts.push({ provider: "workers-ai", keyId: null, ok: false, detail: String(err).slice(0, 200) });
    }
  }

  return { ok: false, text: null, servedBy: null, capability: opts.capability, attempts };
}

export interface OrchestraHealthRow {
  provider: string;
  scope: string;
  status: string;
  keys: number;
  avg_latency_ms: number | null;
  quota_used: number | null;
}

/** Live health snapshot grouped by provider/scope/status — powers the admin
 * Orchestra Core observability view (who's active, slow, rate-limited). */
export async function orchestraHealth(env: Env): Promise<OrchestraHealthRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT provider, scope, status, COUNT(*) AS keys, AVG(latency_ms) AS avg_latency_ms, SUM(quota_used) AS quota_used
     FROM ai_key_pool GROUP BY provider, scope, status ORDER BY provider, scope`
  ).all<OrchestraHealthRow>();
  return results as OrchestraHealthRow[];
}

/** The capability registry, exposed read-only so the admin UI can render the
 * exact failover chain each capability will use. */
export function capabilityRegistry(): Record<string, { provider: string; scope: string; model?: string }[]> {
  return CAPABILITY_CHAINS as unknown as Record<string, { provider: string; scope: string; model?: string }[]>;
}

// ── RAG Answer Worker: Database First ────────────────────────────────────────
// The owner's core rule ("AI tidak boleh langsung mengambil jawaban dari
// internet apabila database internal sudah memiliki referensi", "jawaban wajib
// berdalil + link Ulyah"). So the answer worker RETRIEVES from Ulyah's own
// Qur'an translations and hadith first, then asks the model to answer ONLY
// from that retrieved context and cite it — never free-form invention. This is
// the guardrail that keeps a religious Q&A honest.

const STOPWORDS = new Set([
  "yang", "untuk", "dengan", "adalah", "dari", "pada", "atau", "dan", "apa", "apakah", "bagaimana", "kenapa",
  "mengapa", "itu", "ini", "the", "and", "for", "what", "how", "why", "is", "are", "about", "tentang", "dalam",
]);

export interface GroundingSource {
  kind: "ayah" | "hadits";
  ref: string;
  text: string;
}

export interface GroundedAnswer extends OrchestraResult {
  sources: GroundingSource[];
}

function keywords(q: string): string[] {
  return [...new Set(
    q
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
  )].slice(0, 5);
}

async function retrieveSources(env: Env, question: string, locale: string): Promise<GroundingSource[]> {
  const kws = keywords(question);
  if (kws.length === 0) return [];
  const likeAyah = kws.map(() => "t.text LIKE ?").join(" OR ");
  const likeHad = kws.map(() => "text_id LIKE ?").join(" OR ");
  const params = kws.map((k) => `%${k}%`);
  const sources: GroundingSource[] = [];

  try {
    const { results: ayat } = await env.DB.prepare(
      `SELECT a.surah_id AS surah_id, a.number AS number, t.text AS text
       FROM translation t JOIN ayah a ON a.id = t.ayah_id
       WHERE t.lang = ? AND (${likeAyah}) LIMIT 4`
    )
      .bind(locale, ...params)
      .all<{ surah_id: number; number: number; text: string }>();
    for (const a of ayat) sources.push({ kind: "ayah", ref: `QS ${a.surah_id}:${a.number}`, text: a.text });
  } catch {
    /* translation for this locale may be sparse — non-fatal */
  }

  try {
    const { results: had } = await env.DB.prepare(
      `SELECT collection, grade, text_id FROM hadits WHERE (${likeHad}) AND text_id IS NOT NULL LIMIT 4`
    )
      .bind(...params)
      .all<{ collection: string; grade: string | null; text_id: string }>();
    for (const h of had)
      sources.push({ kind: "hadits", ref: `HR ${h.collection}${h.grade ? ` (${h.grade})` : ""}`, text: h.text_id });
  } catch {
    /* non-fatal */
  }

  return sources;
}

/**
 * Answer a question grounded in Ulyah's own database. Retrieves relevant ayat
 * + hadith, then routes an "answer" job through Orchestra Core with a strict
 * prompt: use ONLY the provided sources, cite them, and if the database has
 * nothing relevant, say so instead of inventing — never fabricate religious
 * rulings. Returns the answer plus the exact sources used.
 */
export async function answerGrounded(
  env: Env,
  opts: { question: string; locale?: string }
): Promise<GroundedAnswer> {
  const locale = opts.locale ?? "id";
  const sources = await retrieveSources(env, opts.question, locale);

  const context = sources.length
    ? sources.map((s, i) => `[${i + 1}] ${s.ref}: ${s.text}`).join("\n")
    : "(tidak ada rujukan yang ditemukan di database Ulyah.com)";

  const prompt = `Kamu asisten Islami ULYAH.COM. Jawab pertanyaan HANYA berdasarkan rujukan di bawah ini dari database Ulyah.com. Sebutkan nomor rujukan [1], [2] yang kamu pakai. Jika rujukan tidak memuat jawaban, katakan dengan jujur bahwa jawaban belum tersedia di database dan sarankan bertanya kepada ustadz — JANGAN mengarang dalil atau hukum. Bahasa jawaban: "${locale}".

RUJUKAN:
${context}

PERTANYAAN: ${opts.question}

JAWABAN (ringkas, santun, dengan sitasi):`;

  const r = await orchestrate(env, { capability: "answer", prompt });
  return { ...r, sources };
}
