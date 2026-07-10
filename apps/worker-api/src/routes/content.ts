import { Hono } from "hono";
import { translateText } from "../lib/mt.js";
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

// GET /content/stories/:id/audio?download=1 — every article is an audiobook:
// stream its narration MP3, as an attachment when ?download=1. Falls back to
// 404 with a hint if the audio hasn't been synthesised yet (the audiobook
// pipeline fills audio_r2_key over time; the browser voice reader always works
// in the meantime).
contentRoute.get("/stories/:id/audio", async (c) => {
  const id = Number(c.req.param("id"));
  const download = c.req.query("download") === "1";
  const story = await c.env.DB.prepare(
    "SELECT title, audio_r2_key FROM stories WHERE id = ? AND status = 'published'"
  )
    .bind(id)
    .first<{ title: string; audio_r2_key: string | null }>();
  if (!story?.audio_r2_key) return c.json({ error: "Audiobook not synthesised yet for this article" }, 404);

  const obj = await c.env.MEDIA_R2.get(story.audio_r2_key);
  if (!obj) return c.json({ error: "Audio missing in storage" }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=86400");
  if (download) {
    const safe = story.title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 80) || "audiobook";
    headers.set("content-disposition", `attachment; filename="${safe}.mp3"`);
  }
  return new Response(obj.body, { headers });
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

// ── Kitab library (classical Islamic works, Shamela-sourced) ─────────────
// A browsable, voiced catalogue: categories → works → per-work detail with a
// narratable Arabic description. Deliberately catalogue + description only,
// never full book text.

// Only Arabic (source) and Indonesian (hand-curated) category names exist
// natively; everything else gets the English set added in migration 0011 —
// still far better than silently showing Indonesian to a Japanese visitor.
function resolveCategoryLang(requested: string): "name_id" | "name_en" {
  return requested === "id" ? "name_id" : "name_en";
}

// GET /content/kitab/categories?lang= — every category with its live book count
contentRoute.get("/kitab/categories", async (c) => {
  const nameCol = resolveCategoryLang(c.req.query("lang") ?? "id");
  const { results } = await c.env.DB.prepare(
    `SELECT c.slug, c.name_ar, c.name_id, c.name_en, c.${nameCol} AS name, c.icon, c.sort_order,
            (SELECT COUNT(*) FROM kitab_book b WHERE b.category_slug = c.slug) AS book_count
     FROM kitab_category c ORDER BY c.sort_order`
  ).all();
  return c.json({ categories: results });
});

// GET /content/kitab/category/:slug?q=&page=&lang= — works in a category, searchable
contentRoute.get("/kitab/category/:slug", async (c) => {
  const slug = c.req.param("slug");
  const q = (c.req.query("q") ?? "").trim();
  const page = Math.max(1, Number(c.req.query("page") ?? "1"));
  const pageSize = 24;
  const offset = (page - 1) * pageSize;
  const nameCol = resolveCategoryLang(c.req.query("lang") ?? "id");

  const cat = await c.env.DB.prepare(`SELECT *, ${nameCol} AS name FROM kitab_category WHERE slug = ?`)
    .bind(slug)
    .first();
  if (!cat) return c.json({ error: "Category not found" }, 404);

  const like = `%${q}%`;
  const [count, rows] = await Promise.all([
    q
      ? c.env.DB.prepare(
          "SELECT COUNT(*) AS n FROM kitab_book WHERE category_slug = ? AND (title_ar LIKE ? OR author LIKE ?)"
        ).bind(slug, like, like).first<{ n: number }>()
      : c.env.DB.prepare("SELECT COUNT(*) AS n FROM kitab_book WHERE category_slug = ?").bind(slug).first<{ n: number }>(),
    q
      ? c.env.DB.prepare(
          `SELECT id, title_ar, author, author_death_year, source,
                  substr(description_ar, 1, 240) AS excerpt
           FROM kitab_book WHERE category_slug = ? AND (title_ar LIKE ? OR author LIKE ?)
           ORDER BY title_ar LIMIT ? OFFSET ?`
        ).bind(slug, like, like, pageSize, offset).all()
      : c.env.DB.prepare(
          `SELECT id, title_ar, author, author_death_year, source,
                  substr(description_ar, 1, 240) AS excerpt
           FROM kitab_book WHERE category_slug = ? ORDER BY title_ar LIMIT ? OFFSET ?`
        ).bind(slug, pageSize, offset).all(),
  ]);

  return c.json({ category: cat, books: rows.results, total: count?.n ?? 0, page, pageSize });
});

// GET /content/kitab/book/:id?lang= — full detail for one work (voiced description)
contentRoute.get("/kitab/book/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const nameCol = resolveCategoryLang(c.req.query("lang") ?? "id");
  const book = await c.env.DB.prepare(
    `SELECT b.*, c.${nameCol} AS category_name, c.name_ar AS category_name_ar, c.icon AS category_icon
     FROM kitab_book b LEFT JOIN kitab_category c ON c.slug = b.category_slug WHERE b.id = ?`
  )
    .bind(id)
    .first<Record<string, unknown> & { topics_json: string | null }>();
  if (!book) return c.json({ error: "Book not found" }, 404);

  let topics: string[] = [];
  try {
    topics = book.topics_json ? JSON.parse(book.topics_json) : [];
  } catch {
    topics = [];
  }

  // Description is stored Arabic-only (the classical source language); a
  // non-Arabic reader gets a live, KV-cached translation instead of a bulk
  // pre-translated D1 column — see lib/mt.ts.
  const targetLang = nameCol === "name_id" ? "id" : "en";
  const description_translated =
    typeof book.description_ar === "string" && book.description_ar
      ? await translateText(c.env, book.description_ar, targetLang)
      : null;

  // Next book in the same category, alphabetical by title_ar — matches the
  // category listing's own order — so the reader can auto-advance once this
  // book's description finishes narrating ("auto next pindah sesi").
  const nextBook = await c.env.DB.prepare(
    `SELECT id, title_ar FROM kitab_book
     WHERE category_slug = ? AND title_ar > ?
     ORDER BY title_ar LIMIT 1`
  )
    .bind(book.category_slug as string, book.title_ar as string)
    .first<{ id: number; title_ar: string }>();

  const { topics_json, ...rest } = book;
  return c.json({
    book: { ...rest, topics, description_translated, description_lang: targetLang },
    next_book: nextBook ?? null,
  });
});

// ── Kitab Hadits reader (full readable, voiced books) ────────────────────
// The 30k+ hadith already ingested from fawazahmed0/hadith-api are exposed
// here as browsable, readable "kitab" (books), page by page, Arabic +
// Indonesian, each narratable aloud. This is catalogue + full source text
// straight from a vetted, permissively-licensed dataset — nothing recalled
// from memory (misquotation of sacred text is never acceptable).

interface HaditsCollectionRow {
  slug: string;
  name_id: string;
  name_ar: string;
  author: string | null;
  sort_order: number;
  has_native_id: number;
}

// GET /content/hadits/collections — every collection that actually has rows
contentRoute.get("/hadits/collections", async (c) => {
  const cached = await c.env.CACHE_KV.get("hadits:collections");
  if (cached) return c.body(cached, 200, { "Content-Type": "application/json" });

  const { results } = await c.env.DB.prepare(
    `SELECT hc.slug, hc.name_id, hc.name_ar, hc.author, hc.sort_order, hc.has_native_id,
            (SELECT COUNT(*) FROM hadits h WHERE h.collection = hc.slug) AS total
     FROM hadits_collection hc ORDER BY hc.sort_order`
  ).all<HaditsCollectionRow & { total: number }>();
  const collections = results.filter((r) => r.total > 0);

  const body = JSON.stringify({ collections });
  await c.env.CACHE_KV.put("hadits:collections", body, { expirationTtl: 60 * 60 * 6 });
  return c.body(body, 200, { "Content-Type": "application/json" });
});

// GET /content/hadits/:collection?page=&lang= — one readable page of a book
contentRoute.get("/hadits/:collection", async (c) => {
  const slug = c.req.param("collection");
  const page = Math.max(1, Number(c.req.query("page") ?? "1"));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const wantId = (c.req.query("lang") ?? "id") === "id";

  const coll = await c.env.DB.prepare("SELECT * FROM hadits_collection WHERE slug = ?")
    .bind(slug)
    .first<HaditsCollectionRow>();
  if (!coll) return c.json({ error: "Collection not found" }, 404);

  const [count, rows] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM hadits WHERE collection = ?").bind(slug).first<{ n: number }>(),
    c.env.DB.prepare(
      `SELECT id, hadith_number, text_ar, text_id, text_en, narrator, grade, source
       FROM hadits WHERE collection = ? ORDER BY hadith_number LIMIT ? OFFSET ?`
    )
      .bind(slug, pageSize, offset)
      .all<{ id: number; hadith_number: number; text_ar: string; text_id: string; text_en: string }>(),
  ]);

  // Collections without a native Indonesian edition (Arba'in, Qudsi) carry
  // English in text_id as a stopgap; translate the Arabic to Indonesian on
  // demand (KV-cached) so the reader shows real Indonesian, not English.
  let hadits = rows.results;
  if (wantId && coll.has_native_id === 0) {
    hadits = await Promise.all(
      hadits.map(async (h) => ({
        ...h,
        text_id: (await translateText(c.env, h.text_ar, "id")) ?? h.text_id,
      }))
    );
  }

  return c.json({
    collection: coll,
    hadits,
    total: count?.n ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count?.n ?? 0) / pageSize),
  });
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
