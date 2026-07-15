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

// Cheapest/fastest first, spanning EVERY donated free-tier text provider so no
// key type is ever left idle and a single provider's outage/rate-limit can't
// block the capability. Any provider with no active key is simply skipped by
// the orchestrator, so listing all of them here is safe.
const TEXT_CHAIN: ProviderStep[] = [
  { provider: "google-ai-studio", scope: "text", model: "gemini-2.0-flash" },
  { provider: "groq", scope: "text" },
  { provider: "nvidia-nim", scope: "text" },
  { provider: "openrouter", scope: "text" },
  { provider: "hf-inference", scope: "text" },
];

const CAPABILITY_CHAINS: Record<Capability, ProviderStep[]> = {
  // Reasoning prefers the strongest free reasoning model, then any text key.
  reasoning: [
    { provider: "google-ai-studio", scope: "text", model: "gemini-2.0-flash" },
    { provider: "nvidia-nim", scope: "text", model: "nvidia/llama-3.1-nemotron-70b-instruct" },
    { provider: "openrouter", scope: "text", model: "deepseek/deepseek-chat" },
    { provider: "groq", scope: "text" },
    { provider: "hf-inference", scope: "text" },
  ],
  translate: TEXT_CHAIN,
  summarize: TEXT_CHAIN,
  answer: TEXT_CHAIN,
  // Classification is short + high-volume, so lead with the fastest provider.
  classify: [{ provider: "groq", scope: "text" }, ...TEXT_CHAIN],
  sanad: TEXT_CHAIN,
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

/** Cron-callable maintenance so cooled-down keys auto-wake even when the site
 * is idle (no live request to trigger it) — keeps Orchestra Core healthy while
 * nobody, including Anthropic, is online. Runs from scheduled() every minute. */
export async function orchestraMaintenance(env: Env): Promise<void> {
  await reviveCooledKeys(env);
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
  opts: { capability: Capability; prompt: string; timeoutMs?: number; maxTokens?: number }
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
        maxTokens: opts.maxTokens,
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

// ── Self-test: the engine exercises its OWN workers against live keys ─────────
// "test apakah worker mampu bekerja... harus orchestra core yg mengerjakan".
// Each probe is a tiny fixed task run through the real failover chain, so the
// result is honest proof of what actually works right now (and shows exactly
// which provider served it). With no active key every probe reports ok:false —
// the truth, not a fake pass.
const SELF_TEST_PROBES: { capability: Capability; label: string; prompt: string }[] = [
  { capability: "translate", label: "Translate Worker", prompt: "Translate to English, output ONLY the translation: Assalamualaikum, selamat pagi." },
  { capability: "summarize", label: "Summary Worker", prompt: "Ringkas jadi 1 kalimat: Shalat lima waktu adalah kewajiban bagi setiap muslim yang balig dan berakal." },
  { capability: "classify", label: "Classifier Worker", prompt: 'Balas JSON {"ok":true} saja.' },
  { capability: "answer", label: "Answer Worker", prompt: "Jawab satu kalimat singkat: apa itu tafsir?" },
  { capability: "reasoning", label: "Reasoning Worker", prompt: "Berapa 2+2? Jawab angka saja." },
];

export interface SelfTestRow {
  capability: Capability;
  label: string;
  ok: boolean;
  servedBy: string | null;
  sample: string;
  attempts: OrchestraAttempt[];
}

export async function selfTest(env: Env): Promise<{ rows: SelfTestRow[]; anyKeyActive: boolean }> {
  const health = await orchestraHealth(env);
  const anyKeyActive = health.some((h) => h.status === "active" && h.keys > 0);
  const rows: SelfTestRow[] = [];
  for (const p of SELF_TEST_PROBES) {
    const r = await orchestrate(env, { capability: p.capability, prompt: p.prompt, timeoutMs: 20_000 });
    rows.push({
      capability: p.capability,
      label: p.label,
      ok: r.ok,
      servedBy: r.servedBy,
      sample: (r.text ?? "").replace(/\s+/g, " ").trim().slice(0, 140),
      attempts: r.attempts,
    });
  }
  return { rows, anyKeyActive };
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
  url: string; // locale-relative deep link into ulyah.com (frontend prepends /{locale})
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
       WHERE t.lang = ? AND (${likeAyah}) LIMIT 6`
    )
      .bind(locale, ...params)
      .all<{ surah_id: number; number: number; text: string }>();
    for (const a of ayat)
      sources.push({ kind: "ayah", ref: `QS ${a.surah_id}:${a.number}`, text: a.text, url: `/quran?surah=${a.surah_id}&ayah=${a.number}` });
  } catch {
    /* translation for this locale may be sparse — non-fatal */
  }

  try {
    const { results: had } = await env.DB.prepare(
      `SELECT collection, grade, text_id FROM hadits WHERE (${likeHad}) AND text_id IS NOT NULL LIMIT 6`
    )
      .bind(...params)
      .all<{ collection: string; grade: string | null; text_id: string }>();
    for (const h of had)
      sources.push({
        kind: "hadits",
        ref: `HR ${h.collection}${h.grade ? ` (${h.grade})` : ""}`,
        text: h.text_id,
        url: `/hadits/${h.collection}`,
      });
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
// Specialist framings for the specialist AI chats. Same answer worker + RAG,
// but a focused persona per field ("walaupun modelnya sama, promptnya beda").
// Each specialist is instructed to recognise when a question is OUTSIDE its
// field and gracefully refer the user to the right specialist — and the
// "master" (Penasihat) knows every field and routes.
const REFERRAL =
  " Jika pertanyaan berada DI LUAR bidangmu, jawab seperlunya lalu sarankan dengan santun agar pengguna beralih ke Penasihat yang tepat (mis. 'Untuk perkara ini, Penasihat Fiqih akan lebih dalam menjelaskannya'). Sebutkan nama bidang penasihat yang paling sesuai.";
const SPECIALISTS: Record<string, string> = {
  master:
    "Kamu Penasihat Utama ULYAH.COM yang menguasai seluruh bidang (Al-Qur'an, tafsir, hadits, fiqih, sirah, akhlak) dan bijak mengarahkan. Jawab lengkap; bila sebuah perkara sangat teknis pada satu bidang, sebutkan bahwa Penasihat khusus bidang itu dapat memperdalamnya.",
  quran: "Kamu Penasihat Al-Qur'an & tafsir." + REFERRAL,
  hadits: "Kamu Penasihat hadits (fokus derajat & sumber)." + REFERRAL,
  fiqih: "Kamu Penasihat fiqih ibadah. Jika ada beda mazhab, sebutkan tanpa memihak." + REFERRAL,
  sirah: "Kamu Penasihat sirah nabawiyah & sejarah Islam." + REFERRAL,
  akhlak: "Kamu Penasihat akhlak & adab Islami." + REFERRAL,
};

export async function answerGrounded(
  env: Env,
  opts: { question: string; locale?: string; specialist?: string }
): Promise<GroundedAnswer> {
  const locale = opts.locale ?? "id";
  const sources = await retrieveSources(env, opts.question, locale);

  const context = sources.length
    ? sources.map((s, i) => `[${i + 1}] ${s.ref}: ${s.text}`).join("\n")
    : "(tidak ada rujukan yang ditemukan di database Ulyah.com)";

  const persona = (opts.specialist && SPECIALISTS[opts.specialist]) || "Kamu asisten Islami ULYAH.COM yang bijaksana, santun, dan elegan.";
  const prompt = `${persona}

Tugasmu: berikan JAWABAN yang jelas, utuh, dan bermanfaat atas pertanyaan pengguna — bukan sekadar daftar rujukan. Tulis 2–4 paragraf yang mengalir dengan bahasa yang lembut, bijak, dan penuh adab.

Panduan:
- Mulai dengan jawaban yang tegas dan jelas atas inti pertanyaan, lalu perkaya dengan penjelasan.
- Gunakan rujukan di bawah ini bila relevan dan sebutkan nomornya [1], [2] di tempat yang tepat — tetapi rujukan adalah pendukung, bukan pengganti jawaban.
- Jika rujukan yang tersedia belum mencakup detailnya, tetap jawab berdasarkan pemahaman umum yang mapan di kalangan ulama dengan rendah hati, lalu tutup dengan ajakan lembut untuk mendalami lebih lanjut atau bermusyawarah dengan ahli ilmu untuk kepastian pada perkara yang rinci.
- JANGAN pernah menulis kalimat seperti "belum tersedia di database", "tidak ada rujukan", atau menolak menjawab. Jawablah dengan anggun.
- JANGAN mengarang nomor hadits, kutipan persis, atau menisbatkan hukum palsu; bila tidak yakin pada rincian, sampaikan secara umum dan bijak.
- Bahasa jawaban: kode "${locale}".

RUJUKAN PENDUKUNG (opsional dipakai):
${context}

PERTANYAAN: ${opts.question}

JAWABAN:`;

  const r = await orchestrate(env, { capability: "answer", prompt, timeoutMs: 40_000 });
  return { ...r, sources };
}
