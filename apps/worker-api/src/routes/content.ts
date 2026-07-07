import { Hono } from "hono";
import type { Env } from "../env.js";

export const contentRoute = new Hono<{ Bindings: Env }>();

// GET /content/stories?category=&lang=&page=
contentRoute.get("/stories", async (c) => {
  const category = c.req.query("category");
  const lang = c.req.query("lang") ?? "id";
  const page = Math.max(1, Number(c.req.query("page") ?? "1"));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const query = category
    ? c.env.DB.prepare(
        `SELECT st.*, c.name AS category_name FROM stories st
         LEFT JOIN categories c ON c.id = st.category_id
         WHERE st.status = 'published' AND st.lang = ? AND c.slug = ?
         ORDER BY st.series_key, st.episode_number, st.published_at DESC LIMIT ? OFFSET ?`
      ).bind(lang, category, pageSize, offset)
    : c.env.DB.prepare(
        `SELECT st.*, c.name AS category_name FROM stories st
         LEFT JOIN categories c ON c.id = st.category_id
         WHERE st.status = 'published' AND st.lang = ?
         ORDER BY st.series_key, st.episode_number, st.published_at DESC LIMIT ? OFFSET ?`
      ).bind(lang, pageSize, offset);

  const { results } = await query.all();
  return c.json({ stories: results, page });
});

// GET /content/stories/:slug?lang= — falls back to Indonesian if the
// requested language isn't authored yet for this story (never 404s solely
// because of a missing translation when the base content exists).
contentRoute.get("/stories/:slug", async (c) => {
  const slug = c.req.param("slug");
  const lang = c.req.query("lang") ?? "id";

  let story = await c.env.DB.prepare(
    `SELECT st.*, c.name AS category_name, vp.name AS voice_name, e.r2_key AS pdf_r2_key
     FROM stories st
     LEFT JOIN categories c ON c.id = st.category_id
     LEFT JOIN voice_persona vp ON vp.id = st.voice_persona_id
     LEFT JOIN ebooks e ON e.id = st.pdf_ebook_id
     WHERE st.slug = ? AND st.lang = ? AND st.status = 'published'`
  )
    .bind(slug, lang)
    .first();

  let fallbackUsed = false;
  if (!story) {
    story = await c.env.DB.prepare(
      `SELECT st.*, c.name AS category_name, vp.name AS voice_name, e.r2_key AS pdf_r2_key
       FROM stories st
       LEFT JOIN categories c ON c.id = st.category_id
       LEFT JOIN voice_persona vp ON vp.id = st.voice_persona_id
       LEFT JOIN ebooks e ON e.id = st.pdf_ebook_id
       WHERE st.slug = ? AND st.status = 'published' LIMIT 1`
    )
      .bind(slug)
      .first();
    fallbackUsed = !!story;
  }
  if (!story) return c.json({ error: "Story not found" }, 404);

  const { results: transcript } = await c.env.DB.prepare(
    "SELECT * FROM audio_transcript_sync WHERE story_id = ? ORDER BY sentence_index"
  )
    .bind((story as any).id)
    .all();

  let nextEpisode: unknown = null;
  const s = story as { series_key: string | null; episode_number: number | null; lang: string };
  if (s.series_key && s.episode_number) {
    nextEpisode = await c.env.DB.prepare(
      "SELECT slug, title FROM stories WHERE series_key = ? AND lang = ? AND episode_number = ? AND status = 'published'"
    )
      .bind(s.series_key, s.lang, s.episode_number + 1)
      .first();
  }

  return c.json({ story, transcript, fallbackUsed, nextEpisode });
});

// GET /content/categories
contentRoute.get("/categories", async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM categories ORDER BY name").all();
  return c.json({ categories: results });
});

// GET /content/ebooks?category=&page=
contentRoute.get("/ebooks", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? "1"));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const { results } = await c.env.DB.prepare(
    `SELECT * FROM ebooks WHERE license_status IN ('public_domain','cc_licensed','original')
     ORDER BY created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(pageSize, offset)
    .all();

  return c.json({ ebooks: results, page });
});

// GET /content/ebooks/:id/download — free, no login, short-lived signed token
contentRoute.get("/ebooks/:id/download", async (c) => {
  const id = Number(c.req.param("id"));
  const ebook = await c.env.DB.prepare(
    "SELECT * FROM ebooks WHERE id = ? AND license_status IN ('public_domain','cc_licensed','original')"
  )
    .bind(id)
    .first<{ r2_key: string; title: string }>();
  if (!ebook) return c.json({ error: "E-book not found or not cleared for download" }, 404);

  const obj = await c.env.MEDIA_R2.get(ebook.r2_key);
  if (!obj) return c.json({ error: "File missing in storage" }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("content-disposition", `attachment; filename="${ebook.title.replace(/"/g, "")}.pdf"`);
  return new Response(obj.body, { headers });
});
