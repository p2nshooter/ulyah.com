import { Hono } from "hono";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { translateText, translateCachedOnly, localizeBatch, localizeBatchProtected } from "../lib/mt.js";
import { listMediaStatus } from "../lib/media.js";
import { safeKvGet, safeKvPut } from "../lib/kv-safe.js";
import { extractSanadChain } from "../lib/sanad.js";
import { tenantFromReq } from "./analytics.js";
import { getAdConfig, publicAdView } from "../lib/ad-config.js";
import type { Env } from "../env.js";

export const contentRoute = new Hono<{ Bindings: Env }>();

// GET /content/ad-config?site=<id> — the ONE public ad config every site reads
// (the four ulyah tenants + the three AXTO sites) to decide whether/what ads to
// render. Editable only from the ulyah.com admin portal. Public + non-secret;
// served CORS-open and never edge-cached long so an admin toggle propagates in
// under a minute.
contentRoute.get("/ad-config", async (c) => {
  const site = c.req.query("site") || tenantFromReq(c) || "ulyah";
  const cfg = await getAdConfig(c.env);
  c.header("Access-Control-Allow-Origin", "*");
  c.header("X-No-Edge-Cache", "1");
  c.header("Cache-Control", "public, max-age=60");
  return c.json(publicAdView(cfg, site));
});

// GET /content/site-pages — per-tenant page visibility + custom labels, so the
// site's nav and each page can be shown/hidden/renamed from the admin portal
// (owner: "jgn ada yg hardcode, semua dynamic dari portal admin"). Absent rows
// mean "visible, built-in label"; only overrides are returned. Tenant is read
// from the request Origin, never trusted from the client.
contentRoute.get("/site-pages", async (c) => {
  // Client calls carry the sibling Origin; server-side (SSR) calls pass an
  // explicit ?tenant since they have no Origin. Both only read visibility data.
  const tenant = c.req.query("tenant") || tenantFromReq(c);
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT path, visible, custom_label FROM tenant_pages WHERE tenant = ?"
    )
      .bind(tenant)
      .all<{ path: string; visible: number; custom_label: string | null }>();
    return c.json({
      tenant,
      pages: results.map((r) => ({ path: r.path, visible: r.visible === 1, label: r.custom_label })),
    });
  } catch {
    // Table not migrated yet, or a transient error — fail open (all visible).
    return c.json({ tenant, pages: [] });
  }
});

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

// GET /content/stories?category=&lang=&page= — stories are AUTHORED in id/en
// (per-language rows); every other site locale gets the English rows with
// their titles machine-translated server-side (batched + KV-cached), so a
// Russian/German/… visitor sees list text in their own language instead of
// English-with-a-Russian-voice.
contentRoute.get("/stories", async (c) => {
  const category = c.req.query("category");
  const requested = c.req.query("lang") ?? "id";
  const authored = requested === "id" || requested === "en";
  const lang = authored ? requested : "en";
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

  const { results } = await query.all<Record<string, unknown>>();
  if (!authored && results.length) {
    // Protected localize so "Bukhari/Muslim/no." in audiobook titles are not
    // mangled by the translator on sibling sites.
    const titles = await localizeBatchProtected(c.env, results.map((r) => r.title as string), requested, "en");
    results.forEach((r, i) => {
      r.title = titles[i] ?? r.title;
    });
  }
  return c.json({ stories: results, page, lang: requested });
});

// GET /content/stories/:slug?lang= — falls back to an authored language when
// the requested one isn't authored for this story (never 404s solely because
// of a missing translation when the base content exists). For locales beyond
// id/en, the fallback story's title and body are machine-translated
// paragraph by paragraph (batched + KV-cached) so text and narration follow
// the chosen language together.
contentRoute.get("/stories/:slug", async (c) => {
  const slug = c.req.param("slug");
  const requestedLang = c.req.query("lang") ?? "id";
  const lang = requestedLang === "id" || requestedLang === "en" ? requestedLang : "en";

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

  // Localize the served story into the requested (non-authored) locale.
  if (requestedLang !== s.lang) {
    const st = story as Record<string, unknown> & { title: string; body: string; lang: string };
    const paras = st.body.split(/\n\s*\n/);
    // Protected localize keeps hadith collection names & "no." intact in both
    // the title and the narrated body.
    const loc = await localizeBatchProtected(c.env, [st.title, ...paras], requestedLang, st.lang);
    st.title = loc[0] ?? st.title;
    st.body = paras.map((p, i) => loc[i + 1] ?? p).join("\n\n");
  }

  return c.json({ story, transcript, fallbackUsed, nextEpisode, lang: requestedLang });
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

// GET /content/categories?lang=&countedOnly=1 — `countedOnly` drops any
// category with zero published stories (in `lang`, if given) so a page like
// /audiobook never offers a filter chip that leads to an empty result. Other
// callers (e.g. the Kisah taxonomy page, which mixes stories with the
// person-index) omit it and get every category, unchanged.
contentRoute.get("/categories", async (c) => {
  const lang = c.req.query("lang");
  const countedOnly = c.req.query("countedOnly") === "1";
  const { results } = await (lang
    ? c.env.DB.prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM stories st WHERE st.category_id = c.id AND st.status = 'published' AND st.lang = ?) AS story_count
         FROM categories c ORDER BY c.name`
      ).bind(lang)
    : c.env.DB.prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM stories st WHERE st.category_id = c.id AND st.status = 'published') AS story_count
         FROM categories c ORDER BY c.name`
      )
  ).all<{ story_count: number }>();
  const categories = countedOnly ? results.filter((r) => r.story_count > 0) : results;
  return c.json({ categories });
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
  const cached = await safeKvGet(c.env, "hadits:collections");
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

  // Category names come pre-translated from D1 (stored under the reserved
  // slug '_cat' by scripts/translate-pesantren.ts) — no runtime MT.
  const requestedLang = c.req.query("lang") ?? "id";
  const lang = isValidLocale(requestedLang) ? requestedLang : "id";
  if (lang !== "id" && lang !== "ar" && results.length > 0) {
    try {
      const { results: tr } = await c.env.DB.prepare("SELECT k, v FROM pes_i18n WHERE slug = '_cat' AND lang = ?")
        .bind(lang)
        .all<{ k: string; v: string }>();
      const map = new Map(tr.map((r) => [r.k, r.v]));
      for (const row of results as Record<string, unknown>[]) {
        const t = map.get(String(row.slug));
        if (t) row.name_id = t;
      }
    } catch {
      /* pes_i18n not migrated yet — serve Indonesian */
    }
  }
  return c.json({ categories: results, lang });
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

  // Localize list titles/descriptions from the pre-translated D1 strings
  // (scripts/translate-pesantren.ts) — one extra query, no runtime MT.
  const requestedLang = c.req.query("lang") ?? "id";
  const lang = isValidLocale(requestedLang) ? requestedLang : "id";
  if (lang !== "id" && lang !== "ar" && results.length > 0) {
    try {
      const { results: tr } = await c.env.DB.prepare(
        "SELECT slug, k, v FROM pes_i18n WHERE lang = ? AND k IN ('k:title_id', 'k:description_id')"
      )
        .bind(lang)
        .all<{ slug: string; k: string; v: string }>();
      const map = new Map(tr.map((r) => [`${r.slug}|${r.k}`, r.v]));
      for (const row of results as Record<string, unknown>[]) {
        const t = map.get(`${row.slug}|k:title_id`);
        const d = map.get(`${row.slug}|k:description_id`);
        if (t) row.title_id = t;
        if (d) row.description_id = d;
      }
    } catch {
      /* pes_i18n not migrated yet — serve Indonesian */
    }
  }
  return c.json({ kitab: results, lang });
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

  // Native-language reading (owner rule + AdSense: a sibling site must not
  // show Indonesian matn translations). For any locale other than id/ar the
  // WHOLE kitab's Indonesian fields are machine-translated once in the
  // background and stored as ONE KV blob — never a per-string subrequest
  // storm (the known Error-1102 failure mode, see lib/mt.ts). First request
  // serves Indonesian + translationPending; the reader refetches shortly
  // after and gets the stored translation.
  const requestedLang = c.req.query("lang") ?? "id";
  const wantLang = isValidLocale(requestedLang) ? requestedLang : "id";
  if (wantLang !== "id" && wantLang !== "ar") {
    // Primary source: pre-translated strings in D1, written by the
    // translate-content GitHub Actions job (scripts/translate-pesantren.ts).
    // One query, free-plan safe — the in-Worker background translation could
    // never finish under the free plan's subrequest/KV-write caps, which is
    // why sibling sites kept serving Indonesian.
    let tr: Record<string, string> | null = null;
    try {
      const { results } = await c.env.DB.prepare("SELECT k, v FROM pes_i18n WHERE slug = ? AND lang = ?")
        .bind(slug, wantLang)
        .all<{ k: string; v: string }>();
      if (results && results.length > 0) {
        tr = {};
        for (const r of results) tr[r.k] = r.v;
      }
    } catch {
      /* table may not exist yet on a fresh DB — fall through to KV */
    }

    const blobKey = `pes-i18n:v1:${slug}:${wantLang}`;
    if (!tr) {
      const blob = await safeKvGet(c.env, blobKey);
      if (blob) {
        try {
          tr = JSON.parse(blob) as Record<string, string>;
        } catch {
          tr = null;
        }
      }
    }

    if (tr) {
      const kk = kitab as Record<string, unknown>;
      for (const f of ["title_id", "description_id", "category_name"]) {
        if (typeof kk[f] === "string" && tr[`k:${f}`]) kk[f] = tr[`k:${f}`];
      }
      for (const ch of chapters as { id: unknown; name_id: unknown; matn: Record<string, unknown>[] }[]) {
        if (tr[`b:${ch.id}`]) ch.name_id = tr[`b:${ch.id}`];
        for (const m of ch.matn) {
          if (tr[`mt:${m.id}`]) m.title_id = tr[`mt:${m.id}`];
          if (tr[`tr:${m.id}`]) m.translation_id = tr[`tr:${m.id}`];
          if (tr[`ex:${m.id}`]) m.explanation_id = tr[`ex:${m.id}`];
        }
      }
      return c.json({ kitab, chapters, lang: wantLang });
    }

    // Not translated yet — serve Indonesian, flag pending, and still try the
    // best-effort background path (it can succeed for small kitab). Never
    // edge-cache this interim response: the translated one must replace it
    // the moment it exists (index.ts checks this header).
    c.header("X-No-Edge-Cache", "1");
    c.executionCtx.waitUntil(translatePesantrenKitab(c.env, blobKey, wantLang, kitab, chapters));
    return c.json({ kitab, chapters, lang: "id", translationPending: true });
  }

  return c.json({ kitab, chapters });
});

// Background whole-kitab translation: joins the Indonesian strings into a
// few large chunks (one gtx call each, separator-preserved), then stores a
// single KV blob keyed by kitab+lang. Runs after the response is sent.
const PES_SEP = "\n⁂\n";
async function translatePesantrenKitab(
  env: Env,
  blobKey: string,
  lang: string,
  kitab: unknown,
  chapters: unknown
): Promise<void> {
  try {
    // A concurrent request may already be translating — a tiny KV lock keeps
    // the expensive job single-flight without blocking anyone.
    const lockKey = `${blobKey}:lock`;
    if (await safeKvGet(env, lockKey)) return;
    await safeKvPut(env, lockKey, "1", { expirationTtl: 300 });

    const entries: [string, string][] = [];
    const kk = kitab as Record<string, unknown>;
    for (const f of ["title_id", "description_id", "category_name"]) {
      if (typeof kk[f] === "string" && (kk[f] as string).trim()) entries.push([`k:${f}`, kk[f] as string]);
    }
    for (const ch of chapters as { id: unknown; name_id: unknown; matn: Record<string, unknown>[] }[]) {
      if (typeof ch.name_id === "string" && ch.name_id.trim()) entries.push([`b:${ch.id}`, ch.name_id]);
      for (const m of ch.matn) {
        if (typeof m.title_id === "string" && m.title_id.trim()) entries.push([`mt:${m.id}`, m.title_id]);
        if (typeof m.translation_id === "string" && (m.translation_id as string).trim())
          entries.push([`tr:${m.id}`, m.translation_id as string]);
        if (typeof m.explanation_id === "string" && (m.explanation_id as string).trim())
          entries.push([`ex:${m.id}`, m.explanation_id as string]);
      }
    }
    if (entries.length === 0) return;

    // Group into ≤3500-char batches; each batch is ONE translator call.
    const out: Record<string, string> = {};
    let batch: [string, string][] = [];
    let size = 0;
    const flush = async () => {
      if (batch.length === 0) return;
      const joined = batch.map(([, v]) => v.replace(/\n{2,}/g, "\n")).join(PES_SEP);
      const translated = await translateText(env, joined, lang, "id");
      if (translated) {
        const parts = translated.split(/\n?\s*⁂\s*\n?/);
        if (parts.length === batch.length) {
          batch.forEach(([key], i) => {
            const t = parts[i]?.trim();
            if (t) out[key] = t;
          });
        }
      }
      batch = [];
      size = 0;
    };
    for (const e of entries) {
      if (size + e[1].length > 3500 && batch.length > 0) await flush();
      batch.push(e);
      size += e[1].length;
    }
    await flush();

    if (Object.keys(out).length > 0) {
      await safeKvPut(env, blobKey, JSON.stringify(out), { expirationTtl: 60 * 60 * 24 * 90 });
    }
  } catch {
    /* background best-effort — the next visit simply retries */
  }
}

// ── Kisah Anak — short sequential children's stories, watch/listen-only ───
// Both kisah-anak endpoints accept ?lang= and return normalized `title`,
// `moral` (and `body` on the detail route) in that language: Indonesian and
// English come straight from their authored columns; every other supported
// locale is machine-translated from the Indonesian source (batched +
// KV-cached) — so the film's captions AND narration follow the chosen
// language together instead of only the voice switching.
function kisahAnakLang(c: { req: { query: (k: string) => string | undefined } }): string {
  return c.req.query("lang") ?? "id";
}

contentRoute.get("/kisah-anak", async (c) => {
  const lang = kisahAnakLang(c);
  const { results } = await c.env.DB.prepare(
    "SELECT id, slug, episode_order, title_id, title_en, moral_id, moral_en, motif, age_range FROM kisah_anak ORDER BY episode_order"
  ).all<{ title_id: string; title_en: string | null; moral_id: string | null; moral_en: string | null }>();

  let episodes: unknown[] = results;
  if (lang === "id") {
    episodes = results.map((r) => ({ ...r, title: r.title_id, moral: r.moral_id }));
  } else if (lang === "en") {
    episodes = results.map((r) => ({ ...r, title: r.title_en ?? r.title_id, moral: r.moral_en ?? r.moral_id }));
  } else {
    const texts = results.flatMap((r) => [r.title_id, r.moral_id]);
    const loc = await localizeBatch(c.env, texts, lang, "id");
    episodes = results.map((r, i) => ({ ...r, title: loc[i * 2] ?? r.title_id, moral: loc[i * 2 + 1] ?? r.moral_id }));
  }
  return c.json({ episodes, lang });
});

contentRoute.get("/kisah-anak/:slug", async (c) => {
  const slug = c.req.param("slug");
  const lang = kisahAnakLang(c);
  const episode = await c.env.DB.prepare("SELECT * FROM kisah_anak WHERE slug = ?").bind(slug).first<{
    title_id: string;
    title_en: string | null;
    body_id: string;
    body_en: string | null;
    moral_id: string | null;
    moral_en: string | null;
  }>();
  if (!episode) return c.json({ error: "Not found" }, 404);

  let title = episode.title_id;
  let body = episode.body_id;
  let moral = episode.moral_id;
  if (lang === "en") {
    title = episode.title_en ?? title;
    body = episode.body_en ?? body;
    moral = episode.moral_en ?? moral;
  } else if (lang !== "id") {
    // Translate paragraph by paragraph so the film player's one-scene-per-
    // paragraph split survives translation exactly.
    const paras = episode.body_id.split(/\n\s*\n/);
    const loc = await localizeBatch(c.env, [episode.title_id, episode.moral_id, ...paras], lang, "id");
    title = loc[0] ?? title;
    moral = loc[1] ?? moral;
    body = paras.map((p, i) => loc[i + 2] ?? p).join("\n\n");
  }

  const next = await c.env.DB.prepare(
    "SELECT slug, title_id FROM kisah_anak WHERE episode_order = (SELECT episode_order + 1 FROM kisah_anak WHERE slug = ?)"
  )
    .bind(slug)
    .first<{ slug: string; title_id: string }>();
  return c.json({ episode: { ...episode, title, body, moral }, next: next ?? null, lang });
});

// ── Sanad Explorer — narrator chain extracted from the hadith's own text ──
// See lib/sanad.ts: pattern-extracted from `text_ar`, never invented. Admin-
// facing "mata rantai sanad" tool: pick a collection/hadith, see the chain.

// GET /content/hadits/:collection/:number/sanad — one hadith's extracted
// narrator chain plus its own Arabic text (so the extraction is auditable
// against its source in the same response, never a black box).
contentRoute.get("/hadits/:collection/:number/sanad", async (c) => {
  const slug = c.req.param("collection");
  const number = Number(c.req.param("number"));
  const row = await c.env.DB.prepare(
    "SELECT id, hadith_number, text_ar, source FROM hadits WHERE collection = ? AND hadith_number = ?"
  )
    .bind(slug, number)
    .first<{ id: number; hadith_number: number; text_ar: string | null; source: string }>();
  if (!row) return c.json({ error: "Hadith not found" }, 404);
  return c.json({
    hadith: { id: row.id, hadith_number: row.hadith_number, text_ar: row.text_ar, source: row.source },
    chain: extractSanadChain(row.text_ar),
  });
});

// GET /content/hadits/:collection/sanad-sample?limit= — a batch of chains for
// the admin Sanad Explorer overview (default 20 per collection).
contentRoute.get("/hadits/:collection/sanad-sample", async (c) => {
  const slug = c.req.param("collection");
  const limit = Math.min(50, Number(c.req.query("limit") ?? "20"));
  const { results } = await c.env.DB.prepare(
    "SELECT id, hadith_number, text_ar FROM hadits WHERE collection = ? ORDER BY hadith_number LIMIT ?"
  )
    .bind(slug, limit)
    .all<{ id: number; hadith_number: number; text_ar: string | null }>();
  const sample = results.map((r) => ({
    id: r.id,
    hadith_number: r.hadith_number,
    chain: extractSanadChain(r.text_ar),
  }));
  return c.json({ collection: slug, sample });
});

// ── Kisah person index (Nabi/Sahabat/Ulama "click a name" navigation) ─────
// See migration 0025: browsable name → full-story, distinct from the episode
// list at /content/stories. `full_story_slug` (when set) points at an
// existing `stories` row so the frontend can send the reader straight into
// the rich multi-episode experience; otherwise the frontend renders the
// person's own one-page profile from `summary_id`.

// GET /content/kisah-tokoh?category=<slug> — the name list for one tier
// (kisah-para-nabi | kisah-sahabat | kisah-ulama-dunia), in curriculum order.
// The person index is authored in Indonesian; with ?lang= the honorific
// (title_id) and profile summary are machine-translated server-side. Names
// are proper nouns and never translated.
contentRoute.get("/kisah-tokoh", async (c) => {
  const category = c.req.query("category");
  const lang = c.req.query("lang") ?? "id";
  const { results } = await (category
    ? c.env.DB.prepare(
        "SELECT slug, category_slug, name_id, name_ar, title_id, full_story_slug, sort_order FROM kisah_person WHERE category_slug = ? ORDER BY sort_order"
      ).bind(category)
    : c.env.DB.prepare(
        "SELECT slug, category_slug, name_id, name_ar, title_id, full_story_slug, sort_order FROM kisah_person ORDER BY category_slug, sort_order"
      )
  ).all<Record<string, unknown>>();
  if (lang !== "id" && results.length) {
    const titles = await localizeBatch(c.env, results.map((r) => r.title_id as string | null), lang, "id");
    results.forEach((r, i) => {
      r.title_id = titles[i] ?? r.title_id;
    });
  }
  return c.json({ persons: results, lang });
});

// GET /content/kisah-tokoh/:slug?lang= — one person's full profile plus the
// full multi-section story (kisah_person_section, see migration 0035). For a
// non-Indonesian ?lang the summary AND every section heading/body are
// machine-translated server-side (batched + KV-cached); quran_refs stay as-is
// (surah names are proper nouns).
contentRoute.get("/kisah-tokoh/:slug", async (c) => {
  const slug = c.req.param("slug");
  const lang = c.req.query("lang") ?? "id";
  const person = await c.env.DB.prepare("SELECT * FROM kisah_person WHERE slug = ?").bind(slug).first<
    Record<string, unknown> & { title_id: string | null; summary_id: string }
  >();
  if (!person) return c.json({ error: "Not found" }, 404);
  const { results: sections } = await c.env.DB.prepare(
    "SELECT section_order, heading_id, body_id, quran_refs FROM kisah_person_section WHERE person_slug = ? ORDER BY section_order"
  )
    .bind(slug)
    .all<{ section_order: number; heading_id: string; body_id: string; quran_refs: string | null }>();
  if (lang !== "id") {
    const paras = person.summary_id.split(/\n\s*\n/);
    const texts = [person.title_id, ...paras, ...sections.flatMap((s) => [s.heading_id, s.body_id])];
    const loc = await localizeBatch(c.env, texts, lang, "id");
    person.title_id = loc[0] ?? person.title_id;
    person.summary_id = paras.map((p, i) => loc[i + 1] ?? p).join("\n\n");
    const base = 1 + paras.length;
    sections.forEach((s, i) => {
      s.heading_id = loc[base + i * 2] ?? s.heading_id;
      s.body_id = loc[base + i * 2 + 1] ?? s.body_id;
    });
  }
  return c.json({ person, sections, lang });
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

// GET /content/amalan/all?lang= — every category with its items inlined, so
// the widget can render the whole library (and narrate it) in one fetch.
// With a non-Indonesian ?lang, the Indonesian text fields (title_id,
// translation_id, note_id, category name_id) are machine-translated to that
// language server-side (batched + KV-cached, see mt.localizeBatch) so the
// TEXT matches the chosen language — the "voice changes but the words don't"
// inconsistency the owner reported. Arabic and transliteration are sacred
// text/aids and never touched.
contentRoute.get("/amalan/all", async (c) => {
  const lang = c.req.query("lang") ?? "id";
  const [{ results: cats }, { results: items }] = await Promise.all([
    c.env.DB.prepare(
      "SELECT slug, grp, name_id, name_ar, icon, sort_order FROM amalan_category ORDER BY sort_order"
    ).all(),
    c.env.DB.prepare(
      `SELECT category_slug, item_order, title_id, arabic, latin, translation_id, note_id, repeat_count, source
       FROM amalan_item ORDER BY category_slug, item_order`
    ).all(),
  ]);

  if (lang !== "id") {
    const rows = items as Record<string, unknown>[];
    const catRows = cats as Record<string, unknown>[];
    const texts: (string | null)[] = [
      ...catRows.map((r) => r.name_id as string | null),
      ...rows.flatMap((r) => [r.title_id as string | null, r.translation_id as string | null, r.note_id as string | null]),
    ];
    const localized = await localizeBatch(c.env, texts, lang, "id");
    catRows.forEach((r, i) => {
      r.name_id = localized[i] ?? r.name_id;
    });
    rows.forEach((r, i) => {
      const base = catRows.length + i * 3;
      r.title_id = localized[base] ?? r.title_id;
      r.translation_id = localized[base + 1] ?? r.translation_id;
      r.note_id = localized[base + 2] ?? r.note_id;
    });
  }

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
  return c.json({ categories, lang });
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

// ── Live streaming hub (see migration 0028) ───────────────────────────────
// YouTube's /embed/live_stream?channel= endpoint answers "Video unavailable"
// for many channels even while they ARE live (owner screenshots), so we
// resolve the channel's current live broadcast to a concrete video id by
// reading the canonical link of /channel/UC…/live. Cached per channel in KV
// for 10 minutes; a not-live/failed lookup caches "" so YouTube isn't
// hammered on every page view.
async function resolveLiveVideoId(env: Env, channelId: string): Promise<string | null> {
  const key = `yt:live:${channelId}`;
  const cached = await safeKvGet(env, key);
  if (cached !== null) return cached || null;
  let id: string | null = null;
  try {
    const res = await fetch(`https://www.youtube.com/channel/${channelId}/live?hl=en`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        // Cloudflare Worker egress IPs get YouTube's EU "consent" interstitial
        // instead of the real page, so the canonical/live markers never matched
        // and EVERY auto stream fell back to REPLAY (owner: "g ada satupun yg
        // live"). These cookies pre-accept consent so the real watch page loads.
        Cookie: "CONSENT=YES+1; SOCS=CAISEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/);
      // HONEST live detection (owner: "statusnya live padahal g live"). Only
      // `"isLiveNow":true` means "streaming RIGHT NOW". The looser markers we
      // used before — `isLiveContent` and `hlsManifestUrl` — persist on the VOD
      // of an ENDED stream, so a channel that finished a broadcast falsely read
      // as LIVE. Requiring isLiveNow means the badge is truthful: live only when
      // genuinely live, otherwise the card honestly plays the latest recording.
      const liveNow = /"isLiveNow"\s*:\s*true/.test(html);
      if (canonical && liveNow) id = canonical[1] ?? null;
    }
  } catch {
    // network hiccup → cache the miss briefly and let the playlist fallback carry the card
  }
  // Cache a hit for 10 min; cache a miss for only 3 min so a channel that just
  // went live shows up quickly rather than staying "REPLAY" for a full window.
  await safeKvPut(env, key, id ?? "", { expirationTtl: id ? 60 * 10 : 60 * 3 });
  return id;
}

// Latest upload of a channel via YouTube's RSS feed — the reliable fallback
// when the channel isn't live: uploads-playlist embeds (UU…) are refused by
// the privacy-enhanced player for many channels ("Video tidak tersedia",
// owner screenshot), while a concrete video id always embeds. Cached 30 min.
async function resolveLatestVideoId(env: Env, channelId: string): Promise<string | null> {
  const key = `yt:latest:${channelId}`;
  const cached = await safeKvGet(env, key);
  if (cached !== null) return cached || null;
  let id: string | null = null;
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; UlyahBot/1.0)" },
    });
    if (res.ok) {
      const xml = await res.text();
      id = xml.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1] ?? null;
    }
  } catch {
    // cache the miss; the client still has the plain-YouTube playlist fallback
  }
  await safeKvPut(env, key, id ?? "", { expirationTtl: 60 * 30 });
  return id;
}

// GET /content/live-streams — every slot, including offline ones (the page
// renders those as the branded offline card, so the layout never collapses).
// Auto rows carry channel_id + the resolved live video_id (null when the
// channel isn't live right now or can't be resolved — the client then embeds
// the channel's uploads playlist instead of a dead iframe).
contentRoute.get("/live-streams", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, platform, slot, kind, region, title, url, is_live FROM live_stream WHERE kind = 'manual' OR is_live = 1 ORDER BY kind = 'auto' DESC, slot"
  ).all<{ id: number; platform: string; slot: number; kind: string; region: string | null; title: string | null; url: string | null; is_live: number }>();
  const streams = await Promise.all(
    results.map(async (s) => {
      const ch = s.kind === "auto" && s.url ? s.url.match(/channel\/(UC[\w-]{10,})/)?.[1] : undefined;
      if (!ch) return { ...s, channel_id: null, video_id: null, latest_video_id: null };
      const video_id = await resolveLiveVideoId(c.env, ch);
      const latest_video_id = video_id ? null : await resolveLatestVideoId(c.env, ch);
      return { ...s, channel_id: ch, video_id, latest_video_id };
    })
  );
  return c.json({ streams });
});

// GET /content/video-anak — the owner's 45 kids videos (see migration 0030),
// grouped client-side by series.
contentRoute.get("/video-anak", async (c) => {
  const [{ results: videos }, { results: channels }] = await Promise.all([
    c.env.DB.prepare(
      "SELECT id, series, video_order, title, youtube_id, country FROM video_anak ORDER BY series, video_order"
    ).all(),
    c.env.DB.prepare(
      "SELECT id, country, title, channel_id, language, sort_order FROM video_anak_channel WHERE visible = 1 ORDER BY country, sort_order"
    ).all(),
  ]);
  return c.json({ videos, channels });
});

// GET /content/hajj-packages?tenant=… — the public Hajj & Umrah product cards
// for a site (migration 0038). Tenant-scoped, only visible rows, ordered by the
// admin's sort_order. `features` is stored as a JSON array; parse it here so the
// client gets a real array (falls back to [] on any malformed value).
contentRoute.get("/hajj-packages", async (c) => {
  const tenant = c.req.query("tenant") || "ulyah";
  const { results } = await c.env.DB.prepare(
    `SELECT id, kind, title, provider, description, price, duration, departure, image_url, badge, features, contact_url
       FROM hajj_package WHERE tenant = ? AND visible = 1 ORDER BY sort_order, id`
  )
    .bind(tenant)
    .all<{
      id: number; kind: string; title: string; provider: string | null; description: string | null;
      price: string | null; duration: string | null; departure: string | null; image_url: string | null;
      badge: string | null; features: string | null; contact_url: string | null;
    }>();
  const packages = results.map((r) => {
    let features: string[] = [];
    try {
      const parsed = r.features ? JSON.parse(r.features) : [];
      if (Array.isArray(parsed)) features = parsed.filter((x): x is string => typeof x === "string");
    } catch {
      /* malformed JSON — show the card without bullets rather than 500 */
    }
    return { ...r, features };
  });
  return c.json({ packages });
});
