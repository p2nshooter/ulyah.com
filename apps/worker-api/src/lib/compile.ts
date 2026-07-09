import type { Env } from "./../env.js";

/**
 * Deterministic, AI-free content compiler.
 *
 * The platform must keep producing readable/narratable content even when no
 * AI key is active ("walaupun tanpa AI ... tidak pernah berhenti kecuali
 * dihentikan di portal admin"), and each listening session should run at
 * least ~30 minutes so visitors can settle in ("audiobook nya terlalu
 * singkat, harusnya minimal 30 menit setiap sesinya"). This composes long
 * "Tadabbur" and "Hadits" SESSIONS purely from data ALREADY in the database —
 * the CC-BY Qur'an translations, whatever tafsir rows exist, and the vetted
 * `hadits` table — woven with fixed template prose. It invents no religious
 * claim and copies no third party's work: it only re-presents the site's own
 * sourced rows, with the source cited. Safe to auto-publish, and fully
 * narratable by the offline TTS pipeline / browser voice engine with no keys.
 *
 * A session accumulates content across MULTIPLE surahs (or hadith) — using a
 * KV cursor to remember where the previous session left off — until it
 * clears a target character budget equivalent to roughly half an hour of
 * natural narration, then wraps to the next tick. Progress persists across
 * cron ticks so a slow trickle of new translations/tafsir never stalls it.
 */

// ~150 spoken words/min, ~5.5 chars/word incl. spacing -> ~24,750 chars/30min.
// Aim a little over so sessions comfortably clear half an hour.
const TARGET_SESSION_CHARS = 26_000;
const MAX_SESSION_CHARS = 70_000; // hard ceiling — still well over an hour, keeps D1 rows sane

const PLACE_LABEL: Record<string, Record<string, string>> = {
  id: { meccan: "Makkiyah", medinan: "Madaniyah" },
  en: { meccan: "Meccan", medinan: "Medinan" },
};

const SESSION_INTRO: Record<string, string> = {
  id: "Mari kita mulai sesi tadabbur Al-Qur'an ini bersama-sama, merenungkan firman Allah ayat demi ayat dengan hati yang tenang.",
  en: "Let us begin this Qur'an reflection session together, pondering the words of Allah verse by verse with a tranquil heart.",
};

const AYAH_LABEL: Record<string, (n: number) => string> = {
  id: (n) => `Ayat ${n}.`,
  en: (n) => `Verse ${n}.`,
};

const TAFSIR_LEAD: Record<string, string> = {
  id: "Renungan: ",
  en: "Reflection: ",
};

const SESSION_CLOSING: Record<string, string> = {
  id: "Demikianlah sesi tadabbur kita kali ini. Semoga Allah menjadikan Al-Qur'an sebagai penyejuk hati kita, cahaya di dada kita, penghapus kesedihan kita, dan pelipur segala kegundahan kita. Aamiin.",
  en: "Such was our reflection session for now. May Allah make the Qur'an the comfort of our hearts, the light of our chests, the remover of our sorrows, and the relief of all our worries. Ameen.",
};

const SOURCE_NOTE: Record<string, string> = {
  id: "Sumber teks: terjemahan quran-json (CC-BY-4.0) dan tafsir yang tersimpan di basis data ULYAH. Disusun otomatis oleh mesin konten ULYAH tanpa menambah klaim di luar sumber.",
  en: "Text sources: quran-json translation (CC-BY-4.0) and tafsir stored in the ULYAH database. Automatically compiled by the ULYAH content engine, adding no claims beyond the sources.",
};

interface AyahCursor {
  surah: number;
  ayah: number;
}

async function getCursor(env: Env, key: string): Promise<AyahCursor> {
  const raw = await env.CACHE_KV.get(key);
  if (!raw) return { surah: 1, ayah: 1 };
  try {
    const parsed = JSON.parse(raw) as AyahCursor;
    return parsed.surah >= 1 && parsed.surah <= 114 ? parsed : { surah: 1, ayah: 1 };
  } catch {
    return { surah: 1, ayah: 1 };
  }
}

async function setCursor(env: Env, key: string, cursor: AyahCursor): Promise<void> {
  await env.CACHE_KV.put(key, JSON.stringify(cursor));
}

async function nextEpisodeNumber(env: Env, seriesKey: string, lang: string): Promise<number> {
  const row = await env.DB.prepare("SELECT COALESCE(MAX(episode_number), 0) AS n FROM stories WHERE series_key = ? AND lang = ?")
    .bind(seriesKey, lang)
    .first<{ n: number }>();
  return (row?.n ?? 0) + 1;
}

/** Ensure a category exists (by slug) and return its id. */
async function ensureCategory(env: Env, slug: string, name: string): Promise<number | null> {
  const existing = await env.DB.prepare("SELECT id FROM categories WHERE slug = ?").bind(slug).first<{ id: number }>();
  if (existing) return existing.id;
  const row = await env.DB.prepare("INSERT INTO categories (name, slug, auto_created) VALUES (?, ?, 1) RETURNING id")
    .bind(name, slug)
    .first<{ id: number }>();
  return row?.id ?? null;
}

/**
 * Assemble ONE long-form Tadabbur session (~30+ minutes of narration),
 * continuing from wherever the previous session for this language left off —
 * spanning as many surahs as needed to clear the target length, wrapping
 * back to Al-Fatihah after An-Nas so the whole Qur'an cycles repeatedly.
 * Returns 1 if a session was produced, 0 if nothing was available to compile.
 */
export async function runDeterministicCompile(env: Env, langs: string[]): Promise<number> {
  const categoryId = await ensureCategory(env, "tadabbur", "Tadabbur Al-Qur'an");

  for (const lang of langs) {
    if (!SESSION_INTRO[lang]) continue; // only id/en templated for now
    const cursorKey = `compile:tadabbur:cursor:${lang}`;
    const start = await getCursor(env, cursorKey);
    let s = start.surah;
    let a = start.ayah;

    const parts: string[] = [];
    const surahNames: string[] = [];
    let charCount = 0;
    let touchedAny = false;
    let guard = 0;

    while (charCount < TARGET_SESSION_CHARS && guard < 130) {
      guard++;
      if (s > 114) {
        s = 1;
        a = 1;
        if (touchedAny) break; // completed a full wrap already this session — stop, don't loop forever
        continue;
      }

      const surah = await env.DB.prepare(
        "SELECT name_transliteration, ayah_count, revelation_place FROM surah WHERE id = ?"
      )
        .bind(s)
        .first<{ name_transliteration: string; ayah_count: number; revelation_place: string }>();
      if (!surah) {
        s++;
        a = 1;
        continue;
      }

      const { results: rows } = await env.DB.prepare(
        `SELECT a.number, t.text AS translation,
                (SELECT tf.text FROM tafsir tf WHERE tf.ayah_id = a.id AND tf.status = 'published' LIMIT 1) AS tafsir
         FROM ayah a LEFT JOIN translation t ON t.ayah_id = a.id AND t.lang = ?
         WHERE a.surah_id = ? AND a.number >= ? ORDER BY a.number`
      )
        .bind(lang, s, a)
        .all<{ number: number; translation: string | null; tafsir: string | null }>();

      if (rows.length === 0 || !rows.some((r) => r.translation)) {
        s++;
        a = 1;
        continue; // no translation for this language in this surah — skip it entirely
      }

      const place = PLACE_LABEL[lang]?.[surah.revelation_place] ?? surah.revelation_place;
      const rangeLabel = a === 1 ? `1–${surah.ayah_count}` : `${a}–${surah.ayah_count}`;
      parts.push(`— ${surah.name_transliteration} (${place}, ${rangeLabel}) —`);
      surahNames.push(surah.name_transliteration);
      touchedAny = true;

      const ayahLabel = AYAH_LABEL[lang]!;
      const tafsirLead = TAFSIR_LEAD[lang]!;
      let lastProcessed = a - 1;
      for (const r of rows) {
        lastProcessed = r.number;
        if (!r.translation) continue;
        let block = `${ayahLabel(r.number)} ${r.translation.trim()}`;
        if (r.tafsir?.trim()) block += `\n${tafsirLead}${r.tafsir.trim()}`;
        parts.push(block);
        charCount += block.length;
        if (charCount >= TARGET_SESSION_CHARS) break;
      }

      if (lastProcessed >= surah.ayah_count) {
        s++;
        a = 1;
      } else {
        a = lastProcessed + 1; // ran out of budget mid-surah — resume exactly here next tick
      }
    }

    if (!touchedAny) continue; // nothing available for this language yet — try the next

    await setCursor(env, cursorKey, { surah: s, ayah: a });

    const episodeNumber = await nextEpisodeNumber(env, "tadabbur-sesi", lang);
    const uniqueSurahs = [...new Set(surahNames)];
    const rangeTitle = uniqueSurahs.length === 1 ? uniqueSurahs[0] : `${uniqueSurahs[0]} – ${uniqueSurahs[uniqueSurahs.length - 1]}`;
    const title =
      lang === "id"
        ? `Tadabbur Al-Qur'an — Sesi ${episodeNumber}: ${rangeTitle}`
        : `Qur'an Reflection — Session ${episodeNumber}: ${rangeTitle}`;
    const body = [
      SESSION_INTRO[lang],
      ...parts,
      "",
      SESSION_CLOSING[lang] ?? SESSION_CLOSING.en!,
      "",
      SOURCE_NOTE[lang] ?? SOURCE_NOTE.en!,
    ]
      .join("\n\n")
      .slice(0, MAX_SESSION_CHARS);

    const firstAyah = await env.DB.prepare("SELECT id FROM ayah WHERE surah_id = ? AND number = 1")
      .bind(start.surah)
      .first<{ id: number }>();

    await env.DB.prepare(
      `INSERT INTO stories
         (title, slug, lang, category_id, body, ai_generated, qc_status, source_format, status,
          series_key, episode_number, related_ayah_id, published_at)
       VALUES (?, ?, ?, ?, ?, 0, 'published', 'html', 'published', 'tadabbur-sesi', ?, ?, datetime('now'))`
    )
      .bind(title, `tadabbur-sesi-${episodeNumber}`, lang, categoryId, body, episodeNumber, firstAyah?.id ?? null)
      .run();

    return 1;
  }
  return 0;
}

const HADITH_SESSION_INTRO: Record<string, string> = {
  id: "Selamat datang di kajian hadits shahih pilihan ULYAH. Mari kita simak beberapa sabda Rasulullah shallallahu 'alaihi wa sallam berikut, satu demi satu, dengan hati yang lapang untuk mengamalkannya.",
  en: "Welcome to this ULYAH session of selected authentic hadith. Let us listen to several sayings of the Messenger of Allah (peace be upon him), one by one, with hearts open to living by them.",
};

const HADITH_ITEM_TMPL: Record<string, (i: number, n: string, tr: string, grade: string, source: string) => string> = {
  id: (i, narrator, tr, grade, source) =>
    `Hadits ke-${i}. Dari ${narrator} radhiyallahu 'anhu, Rasulullah shallallahu 'alaihi wa sallam bersabda: "${tr}" (Derajat: ${grade}. Sumber: ${source}.)`,
  en: (i, narrator, tr, grade, source) =>
    `Hadith ${i}. On the authority of ${narrator} (may Allah be pleased with him), the Messenger of Allah (peace be upon him) said: "${tr}" (Grade: ${grade}. Source: ${source}.)`,
};

const HADITH_SESSION_CLOSING: Record<string, string> = {
  id: "Demikian kumpulan hadits pilihan pada sesi ini. Semoga Allah memberi kita taufik untuk mengamalkan kandungan hadits-hadits yang mulia ini dalam keseharian kita.",
  en: "That concludes this session's selection of hadith. May Allah grant us the ability to live by the meaning of these noble narrations in our daily lives.",
};

/**
 * Assemble ONE long-form Hadith session from not-yet-included rows in the
 * vetted `hadits` table, continuing from a per-language cursor. Sessions
 * naturally grow as more hadith are curated into the seed over time.
 */
export async function runHadithCompile(env: Env, langs: string[]): Promise<number> {
  const categoryId = await ensureCategory(env, "hadits-pilihan", "Hadits Pilihan");
  const SESSION_MAX_ITEMS = 40; // safety cap on hadith per session

  for (const lang of langs) {
    const itemTmpl = HADITH_ITEM_TMPL[lang];
    if (!itemTmpl) continue;

    const cursorKey = `compile:hadits:cursor:${lang}`;
    const lastId = Number((await env.CACHE_KV.get(cursorKey)) ?? "0");

    const { results: rows } = await env.DB.prepare(
      "SELECT id, text_id, text_en, narrator, grade, source FROM hadits WHERE id > ? ORDER BY id LIMIT ?"
    )
      .bind(lastId, SESSION_MAX_ITEMS)
      .all<{ id: number; text_id: string | null; text_en: string | null; narrator: string | null; grade: string | null; source: string | null }>();

    const usable = rows.filter((h) => (lang === "en" ? h.text_en : h.text_id));
    if (usable.length === 0) continue; // nothing new for this language yet

    const parts = usable.map((h, i) =>
      itemTmpl(i + 1, h.narrator ?? "seorang sahabat", (lang === "en" ? h.text_en : h.text_id)!, h.grade ?? "shahih", h.source ?? "")
    );
    const body = [
      HADITH_SESSION_INTRO[lang],
      ...parts,
      "",
      HADITH_SESSION_CLOSING[lang] ?? HADITH_SESSION_CLOSING.en!,
      "",
      SOURCE_NOTE[lang] ?? SOURCE_NOTE.en!,
    ].join("\n\n");

    const episodeNumber = await nextEpisodeNumber(env, "hadits-sesi", lang);
    const title =
      lang === "id"
        ? `Kajian Hadits Shahih — Sesi ${episodeNumber} (${usable.length} Hadits)`
        : `Authentic Hadith Session ${episodeNumber} (${usable.length} Hadith)`;

    await env.DB.prepare(
      `INSERT INTO stories
         (title, slug, lang, category_id, body, ai_generated, qc_status, source_format, status,
          series_key, episode_number, published_at)
       VALUES (?, ?, ?, ?, ?, 0, 'published', 'html', 'published', 'hadits-sesi', ?, datetime('now'))`
    )
      .bind(title, `hadits-sesi-${episodeNumber}`, lang, categoryId, body, episodeNumber)
      .run();

    await env.CACHE_KV.put(cursorKey, String(usable[usable.length - 1]!.id));
    return 1;
  }
  return 0;
}
