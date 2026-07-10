import { Hono } from "hono";
import { resolveTranslationLang, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { fetchTafsir, fetchAsbabunNuzul } from "../lib/tafsir-source.js";
import type { Env } from "../env.js";

export const quranRoute = new Hono<{ Bindings: Env }>();

function langParam(c: any): { lang: string | null; requested: string } {
  const requested = c.req.query("lang") ?? DEFAULT_LOCALE;
  return { lang: resolveTranslationLang(requested), requested };
}

// GET /quran/surah — 114 surah + metadata (language-independent)
quranRoute.get("/surah", async (c) => {
  const cached = await c.env.CACHE_KV.get("quran:surah:all");
  if (cached) return c.body(cached, 200, { "Content-Type": "application/json" });

  const { results } = await c.env.DB.prepare("SELECT * FROM surah ORDER BY id").all();
  const body = JSON.stringify({ surah: results });
  await c.env.CACHE_KV.put("quran:surah:all", body, { expirationTtl: 60 * 60 * 24 });
  return c.body(body, 200, { "Content-Type": "application/json" });
});

// Reciter roster moved to apps/web/src/lib/qori-cdn.ts — it's static config
// for CDN URL construction, not data that needs a database round-trip.

// GET /quran/surah/:id?lang= — surah detail + all ayat (Arabic + translation
// in the requested UI language, falling back per packages/shared/i18n rules)
quranRoute.get("/surah/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id) || id < 1 || id > 114) {
    return c.json({ error: "Invalid surah id (1-114)" }, 400);
  }
  const { lang, requested } = langParam(c);

  const cacheKey = `quran:surah:${id}:full:${requested}`;
  const cached = await c.env.CACHE_KV.get(cacheKey);
  if (cached) return c.body(cached, 200, { "Content-Type": "application/json" });

  const surah = await c.env.DB.prepare("SELECT * FROM surah WHERE id = ?").bind(id).first();
  if (!surah) return c.json({ error: "Surah not found" }, 404);

  const { results: ayat } = lang
    ? await c.env.DB.prepare(
        `SELECT a.id, a.number, a.text_ar, a.text_translit, t.text AS translation
         FROM ayah a
         LEFT JOIN translation t ON t.ayah_id = a.id AND t.lang = ?
         WHERE a.surah_id = ?
         ORDER BY a.number`
      )
        .bind(lang, id)
        .all()
    : await c.env.DB.prepare(
        "SELECT id, number, text_ar, text_translit, NULL AS translation FROM ayah WHERE surah_id = ? ORDER BY number"
      )
        .bind(id)
        .all();

  const body = JSON.stringify({ surah, ayat, lang: requested, translationLang: lang });
  await c.env.CACHE_KV.put(cacheKey, body, { expirationTtl: 60 * 60 * 24 });
  return c.body(body, 200, { "Content-Type": "application/json" });
});

// GET /quran/ayah/:surah/:number?lang= — full "satu ayat terpadu" bundle (§6.1)
quranRoute.get("/ayah/:surah/:number", async (c) => {
  const surahId = Number(c.req.param("surah"));
  const number = Number(c.req.param("number"));
  if (!Number.isInteger(surahId) || !Number.isInteger(number)) {
    return c.json({ error: "Invalid surah/ayah number" }, 400);
  }
  const { lang, requested } = langParam(c);

  // Bump this version whenever the bundle's content sources change so old
  // cached bundles don't keep serving stale/empty tafsir/asbabun. v3 = tafsir
  // now comes from equran.id (Tafsir Kemenag RI) + the curated asbabun nuzul
  // dataset (see lib/tafsir-source.ts). TTL is short so future fixes self-heal
  // in minutes, not hours.
  const cacheKey = `quran:ayah:v3:${surahId}:${number}:${requested}`;
  const cached = await c.env.CACHE_KV.get(cacheKey);
  if (cached) return c.body(cached, 200, { "Content-Type": "application/json" });

  const ayah = await c.env.DB.prepare("SELECT * FROM ayah WHERE surah_id = ? AND number = ?")
    .bind(surahId, number)
    .first<{ id: number }>();
  if (!ayah) return c.json({ error: "Ayah not found" }, 404);

  // Tafsir + asbabun nuzul are fetched live from spa5k/tafsir_api (GitHub)
  // and cached per-surah in KV — not stored in D1. See lib/tafsir-source.ts.
  const [translation, tafsirHit, asbabHit, hadits, stories] = await Promise.all([
    lang
      ? c.env.DB.prepare("SELECT * FROM translation WHERE ayah_id = ? AND lang = ? LIMIT 1")
          .bind(ayah.id, lang)
          .first()
      : Promise.resolve(null),
    fetchTafsir(c.env, lang, surahId, number),
    fetchAsbabunNuzul(c.env, surahId, number),
    c.env.DB.prepare(
      `SELECT h.*, m.relevance_note FROM hadits h
       JOIN ayah_hadits_map m ON m.hadits_id = h.id
       WHERE m.ayah_id = ?`
    )
      .bind(ayah.id)
      .all(),
    c.env.DB.prepare("SELECT * FROM stories WHERE related_ayah_id = ? AND status = 'published'")
      .bind(ayah.id)
      .all(),
  ]);

  const body = JSON.stringify({
    ayah,
    translation,
    lang: requested,
    translationLang: lang,
    tafsir: tafsirHit ? [tafsirHit] : [],
    asbabun_nuzul: asbabHit ? [asbabHit] : [],
    hadits: hadits.results,
    stories: stories.results,
  });
  await c.env.CACHE_KV.put(cacheKey, body, { expirationTtl: 60 * 15 });
  return c.body(body, 200, { "Content-Type": "application/json" });
});

// Days since the Unix epoch, in UTC — a stable per-day seed so "content of
// the day" is the same for every visitor on a given day (and cacheable),
// rather than re-rolling on every request.
function dayOfYearSeed(): number {
  return Math.floor(Date.now() / 86_400_000);
}

// GET /quran/random?lang= — "Ayat Hari Ini" widget
quranRoute.get("/random", async (c) => {
  const { lang, requested } = langParam(c);
  const totalRow = await c.env.DB.prepare("SELECT MAX(id) AS max_id FROM ayah").first<{ max_id: number }>();
  const maxId = totalRow?.max_id ?? 6236;
  const randomId = (dayOfYearSeed() % maxId) + 1;

  const ayah = lang
    ? await c.env.DB.prepare(
        `SELECT a.*, s.name_transliteration AS surah_name, t.text AS translation
         FROM ayah a
         JOIN surah s ON s.id = a.surah_id
         LEFT JOIN translation t ON t.ayah_id = a.id AND t.lang = ?
         WHERE a.id >= ? LIMIT 1`
      )
        .bind(lang, randomId)
        .first()
    : await c.env.DB.prepare(
        `SELECT a.*, s.name_transliteration AS surah_name, NULL AS translation
         FROM ayah a JOIN surah s ON s.id = a.surah_id WHERE a.id >= ? LIMIT 1`
      )
        .bind(randomId)
        .first();

  return c.json({ ayah, lang: requested });
});

// GET /quran/hadits-of-day?lang= — "Hadits Hari Ini" widget, same pick for
// everyone on a given day. Drawn from the full vetted `hadits` table
// (curated + the ingested Sahihain collections).
quranRoute.get("/hadits-of-day", async (c) => {
  const requested = c.req.query("lang") ?? DEFAULT_LOCALE;
  const totalRow = await c.env.DB.prepare("SELECT COUNT(*) AS n, MIN(id) AS min_id FROM hadits").first<{
    n: number;
    min_id: number;
  }>();
  if (!totalRow || totalRow.n === 0) return c.json({ hadits: null, lang: requested });

  const offset = dayOfYearSeed() % totalRow.n;
  const hadits = await c.env.DB.prepare("SELECT * FROM hadits ORDER BY id LIMIT 1 OFFSET ?").bind(offset).first();

  return c.json({ hadits, lang: requested });
});

// GET /quran/search?q=&type=ayah|tafsir|hadits|kisah|ebook&lang=
quranRoute.get("/search", async (c) => {
  const q = c.req.query("q")?.trim();
  const type = c.req.query("type") ?? "all";
  const { lang } = langParam(c);
  if (!q || q.length < 2) return c.json({ results: {} });
  const like = `%${q}%`;

  const results: Record<string, unknown[]> = {};

  if ((type === "all" || type === "ayah") && lang) {
    const { results: r } = await c.env.DB.prepare(
      `SELECT a.surah_id, a.number, a.text_ar, t.text AS translation, s.name_transliteration AS surah_name
       FROM ayah a
       JOIN surah s ON s.id = a.surah_id
       LEFT JOIN translation t ON t.ayah_id = a.id AND t.lang = ?
       WHERE t.text LIKE ? OR a.text_translit LIKE ?
       LIMIT 20`
    )
      .bind(lang, like, like)
      .all();
    results.ayah = r;
  }
  // Tafsir text now lives on GitHub (see lib/tafsir-source.ts), fetched
  // per-ayah on demand — there's no local full-text index left to search
  // against, so this type simply returns nothing rather than a stale D1 hit.
  if (type === "all" || type === "hadits") {
    const { results: r } = await c.env.DB.prepare("SELECT * FROM hadits WHERE text_id LIKE ? LIMIT 20")
      .bind(like)
      .all();
    results.hadits = r;
  }
  if (type === "all" || type === "kisah") {
    const { results: r } = await c.env.DB.prepare(
      "SELECT * FROM stories WHERE (title LIKE ? OR body LIKE ?) AND status = 'published' LIMIT 20"
    )
      .bind(like, like)
      .all();
    results.kisah = r;
  }
  if (type === "all" || type === "ebook") {
    const { results: r } = await c.env.DB.prepare(
      "SELECT * FROM ebooks WHERE title LIKE ? AND license_status != 'unverified' LIMIT 20"
    )
      .bind(like)
      .all();
    results.ebook = r;
  }

  return c.json({ query: q, results });
});
