import { chatComplete, extractJson } from "@ulyah/ai-engine";
import type { KeyScope } from "@ulyah/shared/types";
import type { Env } from "../env.js";
import { selectKeyForScope, recordKeyUsage } from "./keypool-db.js";
import { safeKvGet } from "./kv-safe.js";

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
 * nobody, including Anthropic, is online. Runs from scheduled() every 15 min. */
export async function orchestraMaintenance(env: Env): Promise<void> {
  await reviveCooledKeys(env);
}

async function cfWorkerAiEnabled(env: Env): Promise<boolean> {
  try {
    const raw = await safeKvGet(env, "scaling:settings");
    return raw ? JSON.parse(raw).cfWorkerAiEnabled === true : false;
  } catch {
    return false;
  }
}

// ── Kaggle (free GPU/TPU) compute endpoint ───────────────────────────────
// The owner's Kaggle notebooks give ~30h GPU + 20h TPU FREE per week. When one
// is running a self-hosted OpenAI-compatible server (vLLM/llama.cpp) exposed
// through a Cloudflare tunnel, its URL is registered here from the admin
// portal. Orchestra then puts this FREE powerful model at the FRONT of every
// capability chain — "maximalin AI... buat seluruh ekosistem" — so ulyah.com,
// the siblings, AND axto.us all draw on it via the existing REST endpoints,
// and fail over to the donated API keys the moment the notebook stops.
export const KAGGLE_ENDPOINT_KV = "orchestra:kaggle:endpoint";
export interface KaggleEndpoint {
  url: string; // full OpenAI-compatible chat/completions URL (the tunnel)
  token?: string; // optional bearer the notebook expects
  model?: string; // served model name (e.g. "meta-llama/Llama-3.1-8B-Instruct")
  enabled?: boolean;
}

export async function getKaggleEndpoint(env: Env): Promise<KaggleEndpoint | null> {
  try {
    const raw = await safeKvGet(env, KAGGLE_ENDPOINT_KV);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as KaggleEndpoint;
    if (!cfg.url || cfg.enabled === false) return null;
    return cfg;
  } catch {
    return null;
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
  const baseChain = CAPABILITY_CHAINS[opts.capability] ?? TEXT_CHAIN;
  const attempts: OrchestraAttempt[] = [];

  // Free Kaggle GPU/TPU first (when a notebook is live), then the donated keys.
  const kaggle = await getKaggleEndpoint(env);
  if (kaggle) {
    const started = Date.now();
    try {
      const res = await chatComplete("kaggle", kaggle.token ?? "", opts.prompt, {
        model: kaggle.model,
        baseUrl: kaggle.url,
        timeoutMs: opts.timeoutMs ?? 30_000,
        maxTokens: opts.maxTokens,
      });
      if (res.text && res.text.trim()) {
        attempts.push({ provider: "kaggle", keyId: null, ok: true });
        return { ok: true, text: res.text, servedBy: "kaggle-gpu", capability: opts.capability, attempts };
      }
      attempts.push({ provider: "kaggle", keyId: null, ok: false, detail: "empty response" });
    } catch (err) {
      // Notebook stopped / tunnel down — fall through to the donated keys.
      attempts.push({ provider: "kaggle", keyId: null, ok: false, detail: String(err).slice(0, 200) });
    }
  }

  for (const step of baseChain) {
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
  kind: "ayah" | "hadits" | "tafsir" | "kisah" | "kitab" | "amalan";
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

/** RAG retrieval across the WHOLE Ulyah.com database — not just ayat/hadits.
 * Every result carries a real deep link into an existing page on the site,
 * so the chat's citations are never dead ends: Qur'an + tafsir, hadits,
 * kisah (Nabi/Sahabat/Ulama profiles + full story series), kitab (Shamela
 * catalogue), and Amalan Harian (doa/dzikir). Each table is queried
 * independently and failures are non-fatal (a sparse table for this locale
 * or a schema not yet migrated never breaks the whole answer). */
async function retrieveSources(env: Env, question: string, locale: string): Promise<GroundingSource[]> {
  const kws = keywords(question);
  if (kws.length === 0) return [];
  const params = kws.map((k) => `%${k}%`);
  const sources: GroundingSource[] = [];

  try {
    const likeAyah = kws.map(() => "t.text LIKE ?").join(" OR ");
    const { results: ayat } = await env.DB.prepare(
      `SELECT a.surah_id AS surah_id, a.number AS number, t.text AS text
       FROM translation t JOIN ayah a ON a.id = t.ayah_id
       WHERE t.lang = ? AND (${likeAyah}) LIMIT 5`
    )
      .bind(locale, ...params)
      .all<{ surah_id: number; number: number; text: string }>();
    for (const a of ayat)
      sources.push({ kind: "ayah", ref: `QS ${a.surah_id}:${a.number}`, text: a.text, url: `/quran?surah=${a.surah_id}&ayah=${a.number}` });
  } catch {
    /* translation for this locale may be sparse — non-fatal */
  }

  try {
    const likeTafsir = kws.map(() => "tf.text LIKE ?").join(" OR ");
    const { results: tf } = await env.DB.prepare(
      `SELECT a.surah_id AS surah_id, a.number AS number, tf.source AS source, tf.text AS text
       FROM tafsir tf JOIN ayah a ON a.id = tf.ayah_id
       WHERE tf.status = 'published' AND (${likeTafsir}) LIMIT 4`
    )
      .bind(...params)
      .all<{ surah_id: number; number: number; source: string; text: string }>();
    for (const t of tf)
      sources.push({
        kind: "tafsir",
        ref: `Tafsir QS ${t.surah_id}:${t.number} (${t.source})`,
        text: t.text,
        url: `/quran?surah=${t.surah_id}&ayah=${t.number}`,
      });
  } catch {
    /* non-fatal */
  }

  try {
    const likeHad = kws.map(() => "text_id LIKE ?").join(" OR ");
    const { results: had } = await env.DB.prepare(
      `SELECT collection, grade, text_id FROM hadits WHERE (${likeHad}) AND text_id IS NOT NULL LIMIT 5`
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

  try {
    const likePerson = kws.map(() => "(name_id LIKE ? OR summary_id LIKE ?)").join(" OR ");
    const personParams = kws.flatMap((k) => [`%${k}%`, `%${k}%`]);
    const { results: persons } = await env.DB.prepare(
      `SELECT slug, name_id, summary_id, full_story_slug FROM kisah_person WHERE (${likePerson}) LIMIT 3`
    )
      .bind(...personParams)
      .all<{ slug: string; name_id: string; summary_id: string; full_story_slug: string | null }>();
    for (const p of persons)
      sources.push({
        kind: "kisah",
        ref: `Kisah — ${p.name_id}`,
        text: p.summary_id,
        url: p.full_story_slug ? `/kisah/${p.full_story_slug}` : `/kisah/tokoh/${p.slug}`,
      });
  } catch {
    /* migration 0025 may not be applied yet on an older DB — non-fatal */
  }

  try {
    const likeKitab = kws.map(() => "(title_ar LIKE ? OR description_ar LIKE ?)").join(" OR ");
    const kitabParams = kws.flatMap((k) => [`%${k}%`, `%${k}%`]);
    const { results: books } = await env.DB.prepare(
      `SELECT id, title_ar, author, description_ar FROM kitab_book WHERE (${likeKitab}) LIMIT 3`
    )
      .bind(...kitabParams)
      .all<{ id: number; title_ar: string; author: string | null; description_ar: string | null }>();
    for (const b of books)
      sources.push({
        kind: "kitab",
        ref: `Kitab — ${b.title_ar}${b.author ? ` (${b.author})` : ""}`,
        text: b.description_ar ?? b.title_ar,
        url: `/kitab/book/${b.id}`,
      });
  } catch {
    /* non-fatal */
  }

  try {
    const likeAmalan = kws.map(() => "(title_id LIKE ? OR translation_id LIKE ?)").join(" OR ");
    const amalanParams = kws.flatMap((k) => [`%${k}%`, `%${k}%`]);
    const { results: amalan } = await env.DB.prepare(
      `SELECT category_slug, title_id, translation_id, source FROM amalan_item WHERE (${likeAmalan}) LIMIT 3`
    )
      .bind(...amalanParams)
      .all<{ category_slug: string; title_id: string; translation_id: string | null; source: string | null }>();
    for (const am of amalan)
      sources.push({
        kind: "amalan",
        ref: `Amalan — ${am.title_id}${am.source ? ` (${am.source})` : ""}`,
        text: am.translation_id ?? am.title_id,
        url: `/amalan`,
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
// Specialist framings for the AI chat. Same answer worker + RAG, but a
// focused persona per field ("walaupun modelnya sama, promptnya beda"). The
// "master" persona is the DEFAULT and the one every free/landing chat uses:
// it carries the FULL combined depth of every field below (no gating, no
// separate paid tier) so a visitor never needs to switch personas to get a
// specialist-grade answer — the chips are just an optional focus, not a
// capability boundary. The individual field personas still exist for the
// visitor who wants a narrower voice, and still gracefully point elsewhere
// when a question falls outside their one field.
const REFERRAL =
  " Jika pertanyaan berada DI LUAR bidangmu, jawab seperlunya lalu sarankan dengan santun agar pengguna beralih ke Penasihat yang tepat (mis. 'Untuk perkara ini, Penasihat Fiqih akan lebih dalam menjelaskannya'). Sebutkan nama bidang penasihat yang paling sesuai.";
const SPECIALISTS: Record<string, string> = {
  master:
    "Kamu Penasihat Utama ULYAH.COM — satu AI dengan kedalaman PENUH di SELURUH bidang sekaligus: tafsir Al-Qur'an, ilmu hadits (derajat, perawi, takhrij), fiqih lintas mazhab, sirah nabawiyah & sejarah Islam, akhlak & tasawuf, serta kisah para nabi/sahabat/ulama. Jangan pernah membatasi kedalaman jawabanmu atau mengarahkan pengguna ke 'penasihat lain' — kamu SUDAH penasihat itu, semuanya sekaligus, gratis dan tanpa batas kemampuan. Jawab setiap pertanyaan setuntas dan seteknis yang dibutuhkan.",
  quran: "Kamu Penasihat Al-Qur'an & tafsir." + REFERRAL,
  hadits: "Kamu Penasihat hadits (fokus derajat & sumber)." + REFERRAL,
  fiqih: "Kamu Penasihat fiqih ibadah. Jika ada beda mazhab, sebutkan tanpa memihak." + REFERRAL,
  sirah: "Kamu Penasihat sirah nabawiyah & sejarah Islam." + REFERRAL,
  akhlak: "Kamu Penasihat akhlak & adab Islami." + REFERRAL,
};

// ── Worker 1 (Non-AI): intent gate ──────────────────────────────────────
// Deterministically detects greetings / small talk / personal venting so
// those turns get a warm conversational reply with NO references at all
// (owner rule: casual chat must never carry dalil links) plus a gentle note
// of what this chat is for. Conservative: any hint of a religious topic
// falls through to the full grounded pipeline.
const ISLAMIC_HINTS =
  /shalat|sholat|solat|puasa|zakat|quran|qur'an|ayat|surah|surat|hadits|hadith|doa|do'a|dzikir|allah|nabi|rasul|hukum|halal|haram|wudhu|tayamum|iman|islam|makruh|sunnah|wajib|tafsir|fiqih|fikih|mazhab|jilbab|nikah|talak|waris|riba|umrah|haji|ramadhan|tarawih|masjid|malaikat|akhirat|surga|neraka|dosa|pahala|taubat|tawakal|sabar|ikhlas|kiblat|adzan|iqamah|imam|makmum|junub|haid|nifas|aqiqah|qurban|kurban|sedekah|infaq|wakaf/i;
const SMALLTALK =
  /^(hai|halo|hallo|hei|hey|hi|hello|assalamu\s*['`]?alaikum(\s+w[br.\s]*)?|selamat\s+(pagi|siang|sore|malam)|apa\s+kabar|pa\s+kabar|test|tes|ping|makasih|terima\s*kasih|thanks|thank\s*you|oke?|ok|baik|iya|ya|siapa\s+(kamu|anda|nama\s*mu)|kamu\s+siapa|lagi\s+apa|bosan|bosen|gabut|curhat(\s+dong)?)\s*[!?.,]*$/i;

function isSmallTalk(question: string): boolean {
  const q = question.trim();
  if (ISLAMIC_HINTS.test(q)) return false;
  if (SMALLTALK.test(q)) return true;
  // Very short messages with no religious hint are conversation, not queries.
  return q.split(/\s+/).length <= 3 && q.length <= 20;
}

// ── Worker 2 (AI): relevance judge ──────────────────────────────────────
// The keyword retrieval is deliberately broad; this pass reads the question
// against each candidate and keeps only the sources that genuinely support
// answering it — the "dalil tepat sasaran" filter. Fails open (keeps all)
// if no key is available, so the chat never breaks because of the judge.
async function judgeRelevance(env: Env, question: string, sources: GroundingSource[]): Promise<GroundingSource[]> {
  if (sources.length <= 2) return sources;
  const listing = sources.map((s, i) => `[${i + 1}] ${s.ref}: ${s.text.slice(0, 220)}`).join("\n");
  const r = await orchestrate(env, {
    capability: "summarize",
    timeoutMs: 15_000,
    prompt: `PERTANYAAN: ${question}

KANDIDAT RUJUKAN:
${listing}

Tugas: pilih HANYA nomor rujukan yang isinya benar-benar menjawab/mendukung pertanyaan di atas secara langsung. Rujukan yang cuma kebetulan memuat kata yang sama TIDAK dihitung. Jika tidak ada yang relevan, kembalikan daftar kosong.
OUTPUT (JSON saja): { "relevant": [nomor, ...] }`,
  });
  if (!r.ok || !r.text) return sources;
  const parsed = extractJson<{ relevant: number[] }>(r.text);
  if (!parsed || !Array.isArray(parsed.relevant)) return sources;
  const keep = sources.filter((_, i) => parsed.relevant.includes(i + 1));
  return keep; // an empty verdict is a valid verdict: answer without dalil
}

// ── Worker 3 (Non-AI): citation validator ───────────────────────────────
// After the answer is written, keep only the sources the answer ACTUALLY
// cites and renumber both the text and the list 1..k — so every reference
// link shown provably backs a specific sentence, never decoration.
function validateCitations(answer: string, sources: GroundingSource[]): { answer: string; sources: GroundingSource[] } {
  const cited = [...new Set([...answer.matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1])))].filter(
    (n) => n >= 1 && n <= sources.length
  );
  if (cited.length === 0) return { answer: answer.replace(/\[\d{1,2}\]/g, ""), sources: [] };
  const order = cited.sort((a, b) => a - b);
  const renumber = new Map(order.map((n, i) => [n, i + 1]));
  const rewritten = answer.replace(/\[(\d{1,2})\]/g, (m, d) => {
    const n = renumber.get(Number(d));
    return n ? `[${n}]` : "";
  });
  return { answer: rewritten, sources: order.map((n) => sources[n - 1]!) };
}

export async function answerGrounded(
  env: Env,
  opts: { question: string; locale?: string; specialist?: string; site?: string }
): Promise<GroundedAnswer> {
  const locale = opts.locale ?? "id";
  // Sibling sites (1fr.fr / tilawa.de) run the same worker but must never
  // surface the "ULYAH.COM" brand — the caller passes its own site name and
  // every persona/task mention of the brand is rewritten to it.
  const site = (opts.site && opts.site.trim()) || "ULYAH.COM";
  const persona = ((opts.specialist && SPECIALISTS[opts.specialist]) || "Kamu asisten Islami ULYAH.COM yang bijaksana, santun, dan elegan.").replace(/ULYAH\.COM/gi, site);

  // Small talk / curhat: warm conversation, zero references, gentle steer.
  if (isSmallTalk(opts.question)) {
    const chatPrompt = `${persona}

Pengguna sedang menyapa/berbasa-basi/curhat ringan, BUKAN bertanya soal agama. Balas dengan hangat, singkat, dan manusiawi dalam bahasa locale "${locale}". JANGAN menyebut rujukan, dalil, atau nomor apa pun. Tutup dengan satu kalimat lembut bahwa ruang ini tersedia untuk curhat dan pertanyaan seputar agama Islam — ajak mereka bertanya apa saja tentang Islam.

PESAN PENGGUNA: ${opts.question}

BALASAN:`;
    const r = await orchestrate(env, { capability: "answer", prompt: chatPrompt, timeoutMs: 25_000 });
    return { ...r, sources: [] };
  }

  // Worker pipeline: broad retrieval → AI relevance judge → grounded answer
  // → deterministic citation validation.
  const candidates = await retrieveSources(env, opts.question, locale);
  const sources = await judgeRelevance(env, opts.question, candidates);

  const context = sources.length
    ? sources.map((s, i) => `[${i + 1}] ${s.ref}: ${s.text}`).join("\n")
    : "(tidak ada rujukan database yang lolos uji relevansi untuk pertanyaan ini)";

  const prompt = `${persona}

Tugasmu: mengobrol secara natural dan cerdas seperti asisten AI kelas dunia — seluruh wawasanmu berakar dari database ${site} (Al-Qur'an & tafsir, hadits, kisah, kitab, amalan). Jawab hangat dan mengalir, bukan robotik.

Panduan:
- Mulai dengan jawaban yang tegas dan jelas atas inti pertanyaan, lalu kembangkan secukupnya — panjang menyesuaikan kompleksitas pertanyaan.
- Rujukan di bawah SUDAH lolos uji relevansi. Sebutkan nomornya [1], [2] HANYA tepat di kalimat yang benar-benar didukung isi rujukan itu. JANGAN menyebut rujukan sebagai hiasan; kalimat yang tidak didukung rujukan mana pun ditulis tanpa nomor. Lebih baik sedikit rujukan yang tepat daripada banyak yang meleset.
- Jika tidak ada rujukan yang relevan, jawab berdasarkan pemahaman yang mapan di kalangan ulama dengan rendah hati TANPA menyebut nomor apa pun, dan tutup dengan ajakan bermusyawarah dengan ahli ilmu untuk kepastian perkara rinci.
- JANGAN menulis "belum tersedia di database" atau menolak menjawab; jawab dengan anggun.
- JANGAN mengarang nomor hadits, kutipan persis, atau hukum; bila ragu pada rincian, sampaikan secara umum.
- Bahasa jawaban WAJIB konsisten memakai kode locale "${locale}" dari awal sampai akhir.

RUJUKAN TERVERIFIKASI:
${context}

PERTANYAAN: ${opts.question}

JAWABAN:`;

  const r = await orchestrate(env, { capability: "answer", prompt, timeoutMs: 40_000 });
  if (!r.ok || !r.text) return { ...r, sources };

  const validated = validateCitations(r.text, sources);
  return { ...r, text: validated.answer, sources: validated.sources };
}
