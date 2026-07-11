import { Hono } from "hono";
import { chatComplete, extractJson } from "@ulyah/ai-engine";
import type { Env } from "../env.js";
import { selectKeyForScope, recordKeyUsage } from "../lib/keypool-db.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import { requireAdmin } from "../lib/auth-middleware.js";

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

// POST /ai/summarize — ringkas tafsir panjang, uses best available text key
aiRoute.post("/summarize", async (c) => {
  const rl = await checkRateLimit(c.env, `summarize:${c.req.header("cf-connecting-ip") ?? "anon"}`, 10, 60);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded" }, 429);

  const { text } = await c.req.json<{ text: string }>();
  if (!text) return c.json({ error: "text required" }, 400);

  const selected = await selectKeyForScope(c.env, "text");
  if (!selected) return c.json({ error: "No active AI key available — donate one via /donate/api-key" }, 503);

  const started = Date.now();
  try {
    const res = await chatComplete(
      selected.entry.provider,
      selected.rawKey,
      `Ringkas teks berikut menjadi maksimal 3 kalimat Bahasa Indonesia tanpa menambah klaim baru:\n\n${text}\n\nOUTPUT (JSON): { "summary": "..." }`
    );
    await recordKeyUsage(c.env, selected.entry.id, Date.now() - started, true);
    const json = extractJson<{ summary: string }>(res.text);
    return c.json({ summary: json?.summary ?? res.text });
  } catch (err) {
    await recordKeyUsage(c.env, selected.entry.id, Date.now() - started, false);
    return c.json({ error: "Summarization failed", detail: String(err) }, 502);
  }
});
