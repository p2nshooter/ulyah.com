import type { Env } from "./../env.js";

/**
 * Deterministic, AI-free content compiler.
 *
 * The platform must keep producing readable/narratable content even when no
 * AI key is active ("walaupun tanpa AI ... tidak pernah berhenti kecuali
 * dihentikan di portal admin"). This composes a long "Tadabbur Surah" article
 * purely from data ALREADY in the database — the CC-BY Qur'an translations and
 * whatever tafsir rows exist — woven with fixed template prose. It invents no
 * religious claim and copies no third party's work: it only re-presents the
 * site's own sourced rows, with the source cited. Safe to auto-publish, and
 * fully narratable by the browser voice engine (StoryReader) with no keys.
 */

const INTRO: Record<string, (name: string, count: number, place: string) => string> = {
  id: (name, count, place) =>
    `Tadabbur Surah ${name}. Surah yang mulia ini terdiri dari ${count} ayat dan termasuk golongan ${place}. Marilah kita renungkan maknanya ayat demi ayat, memohon kepada Allah agar hati kita dilembutkan dan dibimbing oleh cahaya firman-Nya.`,
  en: (name, count, place) =>
    `Reflections on Surah ${name}. This noble surah consists of ${count} verses and was revealed in ${place}. Let us reflect upon its meaning verse by verse, asking Allah to soften our hearts and guide us by the light of His words.`,
};

const AYAH_LABEL: Record<string, (n: number) => string> = {
  id: (n) => `Ayat ${n}.`,
  en: (n) => `Verse ${n}.`,
};

const TAFSIR_LEAD: Record<string, string> = {
  id: "Renungan: ",
  en: "Reflection: ",
};

const CLOSING: Record<string, string> = {
  id: "Demikianlah untaian makna dari surah yang mulia ini. Semoga Allah menjadikan Al-Qur'an sebagai penyejuk hati kita, cahaya di dada kita, penghapus kesedihan kita, dan pelipur segala kegundahan kita. Aamiin.",
  en: "Such are the strands of meaning from this noble surah. May Allah make the Qur'an the comfort of our hearts, the light of our chests, the remover of our sorrows, and the relief of all our worries. Ameen.",
};

const PLACE_LABEL: Record<string, Record<string, string>> = {
  id: { meccan: "Makkiyah", medinan: "Madaniyah" },
  en: { meccan: "Mecca", medinan: "Medina" },
};

const SOURCE_NOTE: Record<string, string> = {
  id: "Sumber teks: terjemahan quran-json (CC-BY-4.0) dan tafsir yang tersimpan di basis data ULYAH. Disusun otomatis oleh mesin konten ULYAH tanpa menambah klaim di luar sumber.",
  en: "Text sources: quran-json translation (CC-BY-4.0) and tafsir stored in the ULYAH database. Automatically compiled by the ULYAH content engine, adding no claims beyond the sources.",
};

const MAX_BODY_CHARS = 45_000; // stay well under D1 row/statement limits

export interface CompiledArticle {
  title: string;
  slug: string;
  seriesKey: string;
  episodeNumber: number;
  body: string;
}

/** Build a full-surah tadabbur article for one language, or null if that
 * language has no translations for the surah yet (nothing to compile). */
export async function compileSurahTadabbur(
  env: Env,
  surahId: number,
  lang: string
): Promise<CompiledArticle | null> {
  const surah = await env.DB.prepare(
    "SELECT id, name_transliteration, revelation_place, ayah_count FROM surah WHERE id = ?"
  )
    .bind(surahId)
    .first<{ name_transliteration: string; revelation_place: string; ayah_count: number }>();
  if (!surah) return null;

  const { results: rows } = await env.DB.prepare(
    `SELECT a.number,
            t.text AS translation,
            (SELECT tf.text FROM tafsir tf WHERE tf.ayah_id = a.id AND tf.status = 'published' LIMIT 1) AS tafsir
     FROM ayah a
     LEFT JOIN translation t ON t.ayah_id = a.id AND t.lang = ?
     WHERE a.surah_id = ?
     ORDER BY a.number`
  )
    .bind(lang, surahId)
    .all<{ number: number; translation: string | null; tafsir: string | null }>();

  const translated = rows.filter((r) => r.translation && r.translation.trim().length > 0);
  if (translated.length === 0) return null; // no translation in this language — skip

  const intro = (INTRO[lang] ?? INTRO.en)!;
  const ayahLabel = (AYAH_LABEL[lang] ?? AYAH_LABEL.en)!;
  const tafsirLead = TAFSIR_LEAD[lang] ?? TAFSIR_LEAD.en!;
  const place = PLACE_LABEL[lang]?.[surah.revelation_place] ?? surah.revelation_place;

  const parts: string[] = [intro(surah.name_transliteration, surah.ayah_count, place), ""];
  for (const r of rows) {
    if (!r.translation) continue;
    let block = `${ayahLabel(r.number)} ${r.translation.trim()}`;
    if (r.tafsir && r.tafsir.trim().length > 0) {
      block += `\n${tafsirLead}${r.tafsir.trim()}`;
    }
    parts.push(block);
    if (parts.join("\n\n").length > MAX_BODY_CHARS) break; // long surahs: cap, still hours of narration
  }
  parts.push("", CLOSING[lang] ?? CLOSING.en!);
  parts.push("", SOURCE_NOTE[lang] ?? SOURCE_NOTE.en!);

  const titleName = surah.name_transliteration;
  const title = lang === "id" ? `Tadabbur Surah ${titleName}` : `Reflections on Surah ${titleName}`;

  return {
    title,
    slug: `tadabbur-surah-${surahId}`,
    seriesKey: "tadabbur-surah",
    episodeNumber: surahId,
    body: parts.join("\n\n").slice(0, MAX_BODY_CHARS + 2000),
  };
}

/** Ensure a category exists (by slug) and return its id. */
async function ensureCategory(env: Env, slug: string, name: string): Promise<number | null> {
  const existing = await env.DB.prepare("SELECT id FROM categories WHERE slug = ?").bind(slug).first<{ id: number }>();
  if (existing) return existing.id;
  const row = await env.DB.prepare(
    "INSERT INTO categories (name, slug, auto_created) VALUES (?, ?, 1) RETURNING id"
  )
    .bind(name, slug)
    .first<{ id: number }>();
  return row?.id ?? null;
}

async function ensureTadabburCategory(env: Env): Promise<number | null> {
  return ensureCategory(env, "tadabbur", "Tadabbur Al-Qur'an");
}

const HADITH_TMPL: Record<
  string,
  (n: string, ar: string, tr: string, grade: string, source: string) => { title: string; body: string }
> = {
  id: (narrator, ar, tr, grade, source) => ({
    title: `Hadits Shahih — ${source}`,
    body: [
      `Dari ${narrator} radhiyallahu 'anhu, Rasulullah shallallahu 'alaihi wa sallam bersabda:`,
      ar,
      `"${tr}"`,
      `Derajat hadits: ${grade}. Sumber: ${source}.`,
      "Semoga Allah memberi kita taufik untuk mengamalkan kandungan hadits yang mulia ini.",
    ].join("\n\n"),
  }),
  en: (narrator, ar, tr, grade, source) => ({
    title: `Authentic Hadith — ${source}`,
    body: [
      `On the authority of ${narrator} (may Allah be pleased with him), the Messenger of Allah (peace be upon him) said:`,
      ar,
      `"${tr}"`,
      `Grade: ${grade}. Source: ${source}.`,
      "May Allah grant us the ability to live by the meaning of this noble hadith.",
    ].join("\n\n"),
  }),
};

/**
 * Compile one not-yet-compiled hadith from the (vetted) `hadits` table into a
 * narratable article per language. Uses only what is stored in the DB — no
 * fabrication. Bounded to one per call.
 */
export async function runHadithCompile(env: Env, langs: string[]): Promise<number> {
  const categoryId = await ensureCategory(env, "hadits-pilihan", "Hadits Pilihan");
  const { results: rows } = await env.DB.prepare(
    "SELECT id, text_ar, text_id, text_en, narrator, grade, source FROM hadits ORDER BY id"
  ).all<{
    id: number;
    text_ar: string | null;
    text_id: string | null;
    text_en: string | null;
    narrator: string | null;
    grade: string | null;
    source: string | null;
  }>();

  for (const h of rows) {
    for (const lang of langs) {
      const tmpl = HADITH_TMPL[lang];
      if (!tmpl) continue;
      const translation = lang === "en" ? h.text_en : h.text_id;
      if (!translation) continue; // no rendering for this language

      const slug = `hadits-${h.id}`;
      const exists = await env.DB.prepare("SELECT id FROM stories WHERE slug = ? AND lang = ?")
        .bind(slug, lang)
        .first<{ id: number }>();
      if (exists) continue;

      const { title, body } = tmpl(
        h.narrator ?? "seorang sahabat",
        h.text_ar ?? "",
        translation,
        h.grade ?? "shahih",
        h.source ?? ""
      );

      await env.DB.prepare(
        `INSERT INTO stories
           (title, slug, lang, category_id, body, ai_generated, qc_status, source_format, status,
            series_key, episode_number, published_at)
         VALUES (?, ?, ?, ?, ?, 0, 'published', 'html', 'published', 'hadits-pilihan', ?, datetime('now'))`
      )
        .bind(title, slug, lang, categoryId, body, h.id)
        .run();

      return 1; // one per tick
    }
  }
  return 0;
}

/**
 * Find one (surah, lang) pair that has no compiled article yet, compile it,
 * and publish it. Returns the number of articles produced (0 or 1). This is
 * the AI-free heartbeat of the content engine — bounded to one article per
 * call so a single cron tick stays within CPU limits.
 */
export async function runDeterministicCompile(env: Env, langs: string[]): Promise<number> {
  const categoryId = await ensureTadabburCategory(env);

  for (let surahId = 1; surahId <= 114; surahId++) {
    for (const lang of langs) {
      const slug = `tadabbur-surah-${surahId}`;
      const exists = await env.DB.prepare("SELECT id FROM stories WHERE slug = ? AND lang = ?")
        .bind(slug, lang)
        .first<{ id: number }>();
      if (exists) continue;

      const article = await compileSurahTadabbur(env, surahId, lang);
      if (!article) continue; // no translation for this lang yet — try next

      const relatedAyah = await env.DB.prepare("SELECT id FROM ayah WHERE surah_id = ? AND number = 1")
        .bind(surahId)
        .first<{ id: number }>();

      await env.DB.prepare(
        `INSERT INTO stories
           (title, slug, lang, category_id, body, ai_generated, qc_status, source_format, status,
            series_key, episode_number, related_ayah_id, published_at)
         VALUES (?, ?, ?, ?, ?, 0, 'published', 'html', 'published', ?, ?, ?, datetime('now'))`
      )
        .bind(
          article.title,
          article.slug,
          lang,
          categoryId,
          article.body,
          article.seriesKey,
          article.episodeNumber,
          relatedAyah?.id ?? null
        )
        .run();

      return 1; // one per tick
    }
  }
  return 0; // everything already compiled — engine idles cleanly
}
