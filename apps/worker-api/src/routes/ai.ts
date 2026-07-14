import { Hono } from "hono";
import { extractJson } from "@ulyah/ai-engine";
import type { Env } from "../env.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import { requireAdmin } from "../lib/auth-middleware.js";
import { orchestrate, orchestraHealth, capabilityRegistry, answerGrounded, selfTest, type Capability } from "../lib/orchestra.js";
import { listWorkers, runWorker } from "../lib/orchestra-workers.js";

export const aiRoute = new Hono<{ Bindings: Env }>();

// POST /ai/generate/story — trigger the zero-hand pipeline (admin/internal only)
aiRoute.post("/generate/story", requireAdmin, async (c) => {
  const body = await c.req.json<{ ayahId: number; priority?: number }>();
  const job = await c.env.DB.prepare(
    "INSERT INTO generation_jobs (job_type, target_table, target_id, status, priority) VALUES ('story', 'stories', ?, 'queued', ?) RETURNING id"
  )
    .bind(body.ayahId, body.priority ?? 5)
    .first<{ id: number }>();

  return c.json({ queued: true, jobId: job?.id });
});

// POST /ai/tts — text -> audio, voice chosen per language + content category
// (§28.3 "suara yang sholeh": tenang, hangat, adab pelafalan istilah Arab).
// Language switch must be 100% consistent, so this endpoint always resolves
// a locale-matched persona first; if no TTS-scope key is donated for that
// language yet, it explicitly reports that rather than silently mixing in a
// different language's voice.
aiRoute.post("/tts", async (c) => {
  const rl = await checkRateLimit(c.env, `tts:${c.req.header("cf-connecting-ip") ?? "anon"}`, 20, 60);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded" }, 429);

  const { text, lang, category } = await c.req.json<{
    text: string;
    lang?: string;
    category?: "tafsir" | "hadits" | "kisah" | "hikmah";
  }>();
  if (!text || text.length > 2000) return c.json({ error: "text required, max 2000 chars" }, 400);

  const targetLang = lang ?? "id";
  const warmCategory = category === "kisah" || category === "hikmah";
  const persona = await c.env.DB.prepare(
    `SELECT * FROM voice_persona WHERE lang = ? AND gender = ? ORDER BY id LIMIT 1`
  )
    .bind(targetLang, warmCategory ? "female" : "male")
    .first<{ id: number; name: string; tts_voice_id: string | null; tts_engine: string }>();

  if (!persona) {
    return c.json(
      { error: `No voice persona configured for lang="${targetLang}" yet.`, fallbackAvailable: false },
      404
    );
  }

  // Cloudflare Workers AI is billable, so it's OFF by default and only used
  // when the admin explicitly flips the "CF Worker AI" switch on. Until then
  // (and always for the browser-voice path) the site relies on the zero-cost
  // browser Web Speech voice and any donated TTS-scope keys — "manfaatin yang
  // gratis dulu". When off, en/zh fall through to the same donated-key notice.
  let cfWorkerAiEnabled = false;
  try {
    const raw = await c.env.CACHE_KV.get("scaling:settings");
    if (raw) cfWorkerAiEnabled = JSON.parse(raw).cfWorkerAiEnabled === true;
  } catch {
    cfWorkerAiEnabled = false;
  }

  if (cfWorkerAiEnabled && (targetLang === "en" || targetLang === "zh")) {
    try {
      const result = await c.env.AI.run("@cf/myshell-ai/melotts", { prompt: text, lang: targetLang } as any);
      const audio = (result as any).audio as string | undefined;
      return c.json({ engine: "workers-ai", voice: persona.name, audio_base64: audio ?? null });
    } catch (err) {
      return c.json({ error: "TTS generation failed", detail: String(err) }, 502);
    }
  }

  return c.json(
    {
      error: `TTS for lang="${targetLang}" requires a donated TTS-scope key (voice persona "${persona.name}" / ${persona.tts_voice_id}) — none active yet.`,
      voicePersona: persona,
      fallbackAvailable: false,
    },
    503
  );
});

// GET /ai/recommend/:ayahId — related ayat/kisah (keyword overlap heuristic;
// swappable for a real embeddings-based recommender once a GPU key is donated)
aiRoute.get("/recommend/:ayahId", async (c) => {
  const ayahId = Number(c.req.param("ayahId"));
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, slug FROM stories
     WHERE status = 'published' AND category_id IN (
       SELECT category_id FROM stories WHERE related_ayah_id = ?
     )
     LIMIT 5`
  )
    .bind(ayahId)
    .all();
  return c.json({ recommended: results });
});

// POST /ai/summarize — ringkas tafsir panjang, routed through Orchestra Core
// so it transparently fails over across every donated text key.
aiRoute.post("/summarize", async (c) => {
  const rl = await checkRateLimit(c.env, `summarize:${c.req.header("cf-connecting-ip") ?? "anon"}`, 10, 60);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded" }, 429);

  const { text } = await c.req.json<{ text: string }>();
  if (!text) return c.json({ error: "text required" }, 400);

  const r = await orchestrate(c.env, {
    capability: "summarize",
    prompt: `Ringkas teks berikut menjadi maksimal 3 kalimat Bahasa Indonesia tanpa menambah klaim baru:\n\n${text}\n\nOUTPUT (JSON): { "summary": "..." }`,
  });
  if (!r.ok || !r.text) {
    return c.json({ error: "No active AI key available — donate one via /donate/api-key", attempts: r.attempts }, 503);
  }
  const json = extractJson<{ summary: string }>(r.text);
  return c.json({ summary: json?.summary ?? r.text, servedBy: r.servedBy });
});

// POST /ai/translate — multi-language translation via Orchestra Core. Keeps
// the site's "terjemah multi-bahasa konsisten" promise using whatever text
// key is healthiest, with automatic failover.
aiRoute.post("/translate", async (c) => {
  const rl = await checkRateLimit(c.env, `translate:${c.req.header("cf-connecting-ip") ?? "anon"}`, 20, 60);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded" }, 429);

  const { text, targetLang } = await c.req.json<{ text: string; targetLang: string }>();
  if (!text || !targetLang) return c.json({ error: "text and targetLang required" }, 400);
  if (text.length > 4000) return c.json({ error: "text too long (max 4000)" }, 400);

  const r = await orchestrate(c.env, {
    capability: "translate",
    prompt: `Translate the text below into language code "${targetLang}". Preserve meaning faithfully, keep Arabic religious terms transliterated, and output ONLY the translation with no preamble:\n\n${text}`,
  });
  if (!r.ok || !r.text) {
    return c.json({ error: "No active AI key available for translation", attempts: r.attempts }, 503);
  }
  return c.json({ translation: r.text.trim(), servedBy: r.servedBy });
});

// POST /ai/ask — RAG-grounded Q&A: retrieves ayat + hadith from Ulyah's own
// database first, then answers ONLY from those sources with citations (no
// fabricated rulings). Guest-facing but rate-limited.
aiRoute.post("/ask", async (c) => {
  const rl = await checkRateLimit(c.env, `ask:${c.req.header("cf-connecting-ip") ?? "anon"}`, 15, 3600);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded — silakan daftar untuk akses lebih.", registerHint: true }, 429);

  const { question, locale, specialist } = await c.req.json<{ question: string; locale?: string; specialist?: string }>();
  if (!question || question.length > 500) return c.json({ error: "question required (max 500 chars)" }, 400);

  const r = await answerGrounded(c.env, { question, locale, specialist });
  if (!r.ok || !r.text) {
    return c.json({ error: "AI belum tersedia (belum ada API key aktif di pool).", sources: r.sources, attempts: r.attempts }, 503);
  }
  return c.json({ answer: r.text.trim(), sources: r.sources, servedBy: r.servedBy });
});

// GET /ai/orchestra/health — live key-pool health grouped by provider/scope/
// status (admin observability for Orchestra Core).
aiRoute.get("/orchestra/health", requireAdmin, async (c) => {
  return c.json({ health: await orchestraHealth(c.env), registry: capabilityRegistry() });
});

// POST /ai/orchestra/run — run an arbitrary capability through the failover
// chain and return the full attempt trail (admin-only diagnostics).
aiRoute.post("/orchestra/run", requireAdmin, async (c) => {
  const { capability, prompt } = await c.req.json<{ capability: Capability; prompt: string }>();
  if (!capability || !prompt) return c.json({ error: "capability and prompt required" }, 400);
  const r = await orchestrate(c.env, { capability, prompt });
  return c.json(r, r.ok ? 200 : 503);
});

// POST /ai/orchestra/self-test — the engine runs each worker against live
// keys and reports what genuinely works right now (admin proof).
aiRoute.post("/orchestra/self-test", requireAdmin, async (c) => {
  return c.json(await selfTest(c.env));
});

// GET /ai/orchestra/workers — the named worker registry (the AI grouping).
aiRoute.get("/orchestra/workers", requireAdmin, (c) => c.json({ workers: listWorkers() }));

// POST /ai/orchestra/worker — dispatch a named worker (admin diagnostics).
aiRoute.post("/orchestra/worker", requireAdmin, async (c) => {
  const { name, input } = await c.req.json<{ name: string; input: Record<string, string> }>();
  if (!name) return c.json({ error: "worker name required" }, 400);
  const r = await runWorker(c.env, name, input ?? {});
  return c.json(r, r.ok ? 200 : 503);
});
