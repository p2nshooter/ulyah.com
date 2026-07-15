import { Hono } from "hono";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { translateText, translateCachedOnly } from "../lib/mt.js";
import { listMediaStatus } from "../lib/media.js";
import { safeKvPut } from "../lib/kv-safe.js";
import type { Env } from "../env.js";

export const contentRoute = new Hono<{ Bindings: Env }>();

// GET /content/media-status — which admin-managed images are actually
// uploaded (boolean only, no admin data) — lets a page skip rendering an
// <img> for a photo nobody has uploaded yet, avoiding a broken-image icon.
contentRoute.get("/media-status", async (c) => {
  const status = await listMediaStatus(c.env);
  return c.json({ media: Object.fromEntries(status.map((m) => [m.key, m.set])) });
});

// GET /content/media/:key — public, cached image served from R2 (admin-
// uploaded founder photos etc., see lib/media.ts + routes/admin.ts). Not
// hardcoded into the repo: the admin portal can replace it any time.
contentRoute.get("/media/:key", async (c) => {
  const key = c.req.param("key");
  const row = await c.env.DB.prepare("SELECT r2_key, content_type FROM site_media WHERE key = ?")
    .bind(key)
    .first<{ r2_key: string; content_type: string }>();
  if (!row) return c.json({ error: "not found" }, 404);
  const obj = await c.env.MEDIA_R2.get(row.r2_key);
  if (!obj) return c.json({ error: "file missing from storage" }, 404);
  return new Response(obj.body, {
    headers: { "Content-Type": row.content_type, "Cache-Control": "public, max-age=86400" },
  });
});

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

  // Titles listed here are the same Arabic-only source as the detail page
  // (see /kitab/book/:id) — translate each into the visitor's own locale so
  // browsing a category isn't "banyak kitab masih Arab tanpa terjemahan".
  // Cached per-title forever after the first translation, so repeat page
  // views (and titles shared across the ~4.9k-work library) cost nothing.
  const requestedLocale = c.req.query("lang") ?? DEFAULT_LOCALE;
  const targetLang = isValidLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const books = rows.results as { id: number; title_ar: string }[];
  // Cache-ONLY translation here: never fire live MT for a whole page of
  // titles at once. Doing so (24 parallel subrequests) tripped Cloudflare's
  // Worker resource limits → Error 1102 on category pages. Titles fill in as
  // their detail pages warm the cache. Warm a few in the background so a fresh
  // category doesn't stay all-Arabic forever, without blocking the response.
  const titleTranslations =
    targetLang !== "ar" && books.length > 0
      ? await Promise.all(books.map((b) => translateCachedOnly(c.env, b.title_ar, targetLang)))
      : books.map(() => null);
  const booksWithTranslation = books.map((b, i) => ({ ...b, title_translated: titleTranslations[i] }));
  if (targetLang !== "ar") {
    const missing = books.filter((b, i) => !titleTranslations[i]).slice(0, 6);
    if (missing.length > 0) {
      c.executionCtx.waitUntil(
        Promise.all(missing.map((b) => translateText(c.env, b.title_ar, targetLang))).then(() => undefined)
      );
    }
  }

  return c.json({ category: cat, books: booksWithTranslation, total: count?.n ?? 0, page, pageSize });
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

  // Title, description, and topics are all stored Arabic-only (the
  // classical source language). Every non-Arabic reader gets a live,
  // KV-cached translation of all three — not description alone — into
  // their OWN site locale (id/en/ru/de/fr/zh/ja), not a blanket English
  // fallback. An Arabic-reading visitor sees the Arabic as-is (no
  // translation needed, same language).
  const requestedLocale = c.req.query("lang") ?? DEFAULT_LOCALE;
  const targetLang = isValidLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const shouldTranslate = targetLang !== "ar";

  const [title_translated, description_translated, topics_translated] = await Promise.all([
    shouldTranslate && typeof book.title_ar === "string" && book.title_ar
      ? translateText(c.env, book.title_ar, targetLang)
      : Promise.resolve(null),
    shouldTranslate && typeof book.description_ar === "string" && book.description_ar
      ? translateText(c.env, book.description_ar, targetLang)
      : Promise.resolve(null),
    shouldTranslate && topics.length > 0
      ? Promise.all(topics.map((topic) => translateText(c.env, topic, targetLang)))
      : Promise.resolve(null),
  ]);

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
    book: { ...rest, topics, title_translated, description_translated, topics_translated, description_lang: targetLang },
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
  await safeKvPut(c.env, "hadits:collections", body, { expirationTtl: 60 * 60 * 24 });
  return c.body(body, 200, { "Content-Type": "application/json" });
});

// GET /content/hadits/:collection?page=&lang= — one readable page of a book
contentRoute.get("/hadits/:collection", async (c) => {
  const slug = c.req.param("collection");
  const page = Math.max(1, Number(c.req.query("page") ?? "1"));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const requestedLocale = c.req.query("lang") ?? DEFAULT_LOCALE;
  const locale = isValidLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;

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
      .all<{ id: number; hadith_number: number; text_ar: string; text_id: string; text_en: string | null }>(),
  ]);

  // `text_id` is the field the reader displays/narrates as "the translated
  // line" for whatever locale was requested — it must actually BE that
  // locale's text, not always literal Indonesian. Previously any locale
  // other than "id" got the raw Indonesian column back untouched (even
  // English readers), narrated in the wrong voice. Now: Indonesian readers
  // get the native column (or an on-demand translation for collections that
  // don't have one, e.g. Arba'in/Qudsi); English readers reuse the stored
  // text_en when present (no wasted call); every other locale (ar/ru/de/fr/
  // zh/ja) is translated on demand from Arabic, KV-cached forever after.
  let hadits = rows.results;
  if (locale !== "ar") {
    hadits = await Promise.all(
      hadits.map(async (h) => {
        if (locale === "id" && coll.has_native_id === 1) return h;
        if (locale === "en" && h.text_en) return { ...h, text_id: h.text_en };
        const translated = await translateText(c.env, h.text_ar, locale);
        return { ...h, text_id: translated ?? h.text_en ?? h.text_id };
      })
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

// ── Kitab Pesantren (readable matn library, see migration 0017) ───────────
// A tidy, fully-structured reading library — category → kitab (with author)
// → bab (chapter) → matan (Arabic + terjemah + penjelasan). Separate from
// the Shamela *catalogue* (/content/kitab/*) which is metadata only.

// GET /content/pesantren/categories — categories + kitab count each.
contentRoute.get("/pesantren/categories", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.slug, c.name_id, c.name_ar, c.icon, c.sort_order,
            (SELECT COUNT(*) FROM pesantren_kitab k WHERE k.category_slug = c.slug) AS kitab_count
     FROM pesantren_category c ORDER BY c.sort_order`
  ).all();
  return c.json({ categories: results });
});

// GET /content/pesantren/kitab — the full kitab list (grouped client-side by
// category), each with author + bab count, for the library index.
contentRoute.get("/pesantren/kitab", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT k.slug, k.category_slug, k.title_ar, k.title_id, k.author, k.author_death_year,
            k.description_id, k.sort_order,
            (SELECT COUNT(*) FROM pesantren_bab b WHERE b.kitab_slug = k.slug) AS bab_count
     FROM pesantren_kitab k ORDER BY k.sort_order`
  ).all();
  return c.json({ kitab: results });
});

// GET /content/pesantren/kitab/:slug — one kitab in full: its chapters, each
// with its matan rows (Arabic + terjemah + penjelasan + linked ayat/hadits).
contentRoute.get("/pesantren/kitab/:slug", async (c) => {
  const slug = c.req.param("slug");
  const kitab = await c.env.DB.prepare(
    `SELECT k.*, c.name_id AS category_name, c.icon AS category_icon
     FROM pesantren_kitab k LEFT JOIN pesantren_category c ON c.slug = k.category_slug
     WHERE k.slug = ?`
  )
    .bind(slug)
    .first();
  if (!kitab) return c.json({ error: "Kitab not found" }, 404);

  const [{ results: babs }, { results: matn }] = await Promise.all([
    c.env.DB.prepare("SELECT id, bab_order, name_id, name_ar FROM pesantren_bab WHERE kitab_slug = ? ORDER BY bab_order")
      .bind(slug)
      .all(),
    c.env.DB.prepare(
      `SELECT m.id, m.bab_id, m.matn_order, m.title_id, m.title_ar, m.text_ar,
              m.translation_id, m.explanation_id, m.quran_refs_json, m.hadits_refs_json
       FROM pesantren_matn m JOIN pesantren_bab b ON b.id = m.bab_id
       WHERE b.kitab_slug = ? ORDER BY b.bab_order, m.matn_order`
    )
      .bind(slug)
      .all(),
  ]);

  // Fold matan rows into their chapter, parsing the ref JSON once server-side.
  const byBab = new Map<number, unknown[]>();
  for (const m of matn as Record<string, unknown>[]) {
    const list = byBab.get(m.bab_id as number) ?? [];
    list.push({
      id: m.id,
      order: m.matn_order,
      title_id: m.title_id,
      title_ar: m.title_ar,
      text_ar: m.text_ar,
      translation_id: m.translation_id,
      explanation_id: m.explanation_id,
      quran_refs: m.quran_refs_json ? JSON.parse(m.quran_refs_json as string) : [],
      hadits_refs: m.hadits_refs_json ? JSON.parse(m.hadits_refs_json as string) : [],
    });
    byBab.set(m.bab_id as number, list);
  }
  const chapters = (babs as Record<string, unknown>[]).map((b) => ({
    id: b.id,
    order: b.bab_order,
    name_id: b.name_id,
    name_ar: b.name_ar,
    matn: byBab.get(b.id as number) ?? [],
  }));

  return c.json({ kitab, chapters });
});

// ── Amalan Harian (doa/dzikir/thibb/kecantikan, see migration 0018) ───────
// Voice-ready: every item carries Arabic + Latin + terjemah + sumber sahih.

// GET /content/amalan/categories — categories grouped by `grp`, item count each.
contentRoute.get("/amalan/categories", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT c.slug, c.grp, c.name_id, c.name_ar, c.icon, c.sort_order,
            (SELECT COUNT(*) FROM amalan_item i WHERE i.category_slug = c.slug) AS item_count
     FROM amalan_category c ORDER BY c.sort_order`
  ).all();
  return c.json({ categories: results });
});

// GET /content/amalan/all — every category with its items inlined, so the
// widget can render the whole library (and narrate it) in one fetch.
contentRoute.get("/amalan/all", async (c) => {
  const [{ results: cats }, { results: items }] = await Promise.all([
    c.env.DB.prepare(
      "SELECT slug, grp, name_id, name_ar, icon, sort_order FROM amalan_category ORDER BY sort_order"
    ).all(),
    c.env.DB.prepare(
      `SELECT category_slug, item_order, title_id, arabic, latin, translation_id, note_id, repeat_count, source
       FROM amalan_item ORDER BY category_slug, item_order`
    ).all(),
  ]);
  const byCat = new Map<string, unknown[]>();
  for (const it of items as Record<string, unknown>[]) {
    const list = byCat.get(it.category_slug as string) ?? [];
    list.push(it);
    byCat.set(it.category_slug as string, list);
  }
  const categories = (cats as Record<string, unknown>[]).map((cat) => ({
    ...cat,
    items: byCat.get(cat.slug as string) ?? [],
  }));
  return c.json({ categories });
});

// ── Nasakh & Mansukh (see migration 0019) ─────────────────────────────────
// GET /content/nasakh — all abrogating/abrogated entries, ordered.
contentRoute.get("/nasakh", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, entry_order, title_id, naskh_type, mansukh_ref, mansukh_ar, mansukh_id,
            nasikh_ref, nasikh_ar, nasikh_id, explanation_id, source
     FROM nasakh_mansukh ORDER BY entry_order`
  ).all();
  return c.json({ entries: results });
});

// ── Pohon Sanad (isnad chain tree, see migration 0027) ────────────────────
// Only ever shows PUBLISHED chains — a chain reaches that status only after
// an admin approves it (see routes/admin.ts), since a heuristically
// extracted chain can mis-segment a name and misrepresenting a hadith's
// authentication chain is a real scholarly-accuracy concern.

// GET /content/sanad/list?page= — published chains, newest-approved first,
// for the public landing page's browse list.
contentRoute.get("/sanad/list", async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? "1"));
  const pageSize = 24;
  const offset = (page - 1) * pageSize;
  const { results } = await c.env.DB.prepare(
    `SELECT sc.id AS chain_id, sc.hadits_id, h.text_id, h.source, h.collection, h.hadith_number,
            (SELECT COUNT(*) FROM sanad_link sl WHERE sl.sanad_chain_id = sc.id) AS link_count
     FROM sanad_chain sc
     JOIN hadits h ON h.id = sc.hadits_id
     WHERE sc.status = 'published'
     ORDER BY sc.id DESC LIMIT ? OFFSET ?`
  )
    .bind(pageSize, offset)
    .all();
  return c.json({ chains: results, page });
});

// GET /content/sanad/:haditsId — one hadith's full published chain, ordered
// from the narrator closest to the compiler through to the Prophet ﷺ, with
// each perawi's biographical fields (nullable — filled in over time by the
// admin, same as every other "being completed" field on this site).
contentRoute.get("/sanad/:haditsId", async (c) => {
  const haditsId = Number(c.req.param("haditsId"));
  if (!Number.isInteger(haditsId)) return c.json({ error: "Invalid hadits id" }, 400);

  const hadits = await c.env.DB.prepare(
    "SELECT id, text_ar, text_id, source, collection, hadith_number, grade FROM hadits WHERE id = ?"
  )
    .bind(haditsId)
    .first();
  if (!hadits) return c.json({ error: "Hadits not found" }, 404);

  const chain = await c.env.DB.prepare("SELECT id FROM sanad_chain WHERE hadits_id = ? AND status = 'published'")
    .bind(haditsId)
    .first<{ id: number }>();
  if (!chain) return c.json({ hadits, chain: null });

  const { results: links } = await c.env.DB.prepare(
    `SELECT sl.position, p.id AS perawi_id, p.name_ar, p.bio_id, p.bio_en, p.generation, p.reliability_grade, p.death_year_hijri
     FROM sanad_link sl JOIN perawi p ON p.id = sl.perawi_id
     WHERE sl.sanad_chain_id = ? ORDER BY sl.position`
  )
    .bind(chain.id)
    .all();

  return c.json({ hadits, chain: { id: chain.id, links } });
});

// GET /content/sanad/perawi/:id/chains — every OTHER published chain this
// narrator appears in, so a visitor can explore across hadith by narrator
// rather than only ever seeing one linear chain — the closest thing to a
// "tree" without a full force-directed graph.
contentRoute.get("/sanad/perawi/:id/chains", async (c) => {
  const perawiId = Number(c.req.param("id"));
  if (!Number.isInteger(perawiId)) return c.json({ error: "Invalid perawi id" }, 400);

  const { results } = await c.env.DB.prepare(
    `SELECT DISTINCT sc.hadits_id, h.source, h.collection
     FROM sanad_link sl
     JOIN sanad_chain sc ON sc.id = sl.sanad_chain_id
     JOIN hadits h ON h.id = sc.hadits_id
     WHERE sl.perawi_id = ? AND sc.status = 'published'
     LIMIT 30`
  )
    .bind(perawiId)
    .all();
  return c.json({ chains: results });
});
