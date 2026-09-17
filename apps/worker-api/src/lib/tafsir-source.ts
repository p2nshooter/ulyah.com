import type { Env } from "../env.js";
import { ASBAB_DATA } from "./asbabun-nuzul-data.js";
import { translateText } from "./mt.js";
import { safeKvGet, safeKvPut } from "./kv-safe.js";
import { FEATURED_TAFSIR, findEdition, type TafsirEdition } from "./tafsir-editions.js";

/**
 * Tafsir + asbabun nuzul, fetched on demand and KV-cached per surah — never
 * bulk-imported into D1. This mirrors the reference implementation the site
 * owner provided:
 *   - Tafsir (Indonesian): equran.id — the official Tafsir Kemenag RI, free,
 *     no API key, per-ayah, CORS-friendly. One surah's tafsir is fetched once
 *     and cached; each ayah is then picked out of it.
 *   - Tafsir (other languages): spa5k/tafsir_api (Ibn Kathir) as before.
 *   - Asbabun nuzul: a curated dataset (Al-Wahidi & As-Suyuthi) shipped in
 *     asbabun-nuzul-data.ts, with the spa5k Al-Wahidi edition as a fallback
 *     for ayat not in the curated set.
 */

const EQURAN = "https://equran.id/api/v2/tafsir";
const SPA5K = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir";
// Sahih Asbab al-Nuzul (صحيح أسباب النزول, Ibrahim Muhammad al-Ali) — an
// authentic, hadith-analysed occasions-of-revelation dataset. Higher quality
// than the English Al-Wahidi fallback; Arabic, so translated on demand for
// non-Arabic readers. Per-surah files are zero-padded to 3 digits.
const SAHIH_ASBAB = "https://raw.githubusercontent.com/mostafaahmed97/asbab-al-nuzul-dataset/main/data/structured/json";
const SAHIH_ASBAB_SOURCE = "Sahih Asbabun Nuzul — Ibrahim Muhammad al-Ali";
const KV_TTL = 60 * 60 * 24 * 30; // 30 days — static classical text, never changes

const SPA5K_TAFSIR: Record<string, { edition: string; source: string }> = {
  en: { edition: "en-tafisr-ibn-kathir", source: "Tafsir Ibn Kathir" },
  id: { edition: "id-tafsir-as-saadi", source: "Tafsir As-Sa'di" },
};
const ASBAB_EDITION = "en-asbab-al-nuzul-by-al-wahidi";
const ASBAB_SOURCE = "Asbab An-Nuzul by Al-Wahidi";

/**
 * Fetch an upstream JSON edition, KV-cached, and NEVER throw.
 *
 * Every tafsir and asbabun source behind this lives on somebody else's host
 * (equran.id, raw.githubusercontent). The callers all treat null as "this
 * source has nothing for this ayah" and move to the next one — but a rejected
 * fetch is not null, it is an exception, and it used to escape all the way out:
 * the ayah bundle builds its parts with Promise.all, so one unreachable host
 * did not cost the tafsir panel, it cost the whole ayah — a 500 where the
 * Arabic, the translation and the hadits were all already in hand.
 *
 * A source being down is ordinary and must read as "nothing from here".
 */
async function fetchJsonCached<T>(env: Env, kvKey: string, url: string): Promise<T | null> {
  try {
    const cached = await safeKvGet(env, kvKey);
    if (cached) return JSON.parse(cached) as T;
  } catch {
    /* a poisoned/garbled cache entry is a miss, not a failure */
  }
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    await safeKvPut(env, kvKey, JSON.stringify(data), { expirationTtl: KV_TTL });
    return data;
  } catch {
    return null;
  }
}

interface EquranTafsir {
  data?: { tafsir?: { ayat: number; teks: string }[] };
}

/** Indonesian tafsir for one ayah, from equran.id (Tafsir Kemenag RI). */
async function fetchKemenagTafsir(
  env: Env,
  surah: number,
  ayahNumber: number
): Promise<{ text: string; source: string; lang: string } | null> {
  const data = await fetchJsonCached<EquranTafsir>(env, `tafsir:kemenag:${surah}`, `${EQURAN}/${surah}`);
  const hit = data?.data?.tafsir?.find((t) => t.ayat === ayahNumber);
  const text = hit?.teks?.trim();
  if (text && text.length >= 20) return { text, source: "Tafsir Kemenag RI", lang: "id" };
  return null;
}

/** spa5k tafsir (per-surah flat array indexed by ayah-1). */
async function fetchSpa5kTafsir(
  env: Env,
  lang: string,
  surah: number,
  ayahNumber: number
): Promise<{ text: string; source: string; lang: string } | null> {
  const ed = SPA5K_TAFSIR[lang];
  if (!ed) return null;
  const data = await fetchJsonCached<{ text: string }[]>(
    env,
    `tafsir:${ed.edition}:${surah}`,
    `${SPA5K}/${ed.edition}/${surah}.json`
  );
  const text = data?.[ayahNumber - 1]?.text?.trim();
  if (text && text.length >= 20) return { text, source: ed.source, lang };
  return null;
}

/** Native "(translated)" suffix per UI language — the source label must not
 * leak Indonesian "(diterjemahkan)" onto a French/German/Spanish page. */
export function translatedSuffix(lang: string | null): string {
  switch (lang) {
    case "fr": return "(traduit)";
    case "de": return "(übersetzt)";
    case "es": return "(traducido)";
    case "en": return "(translated)";
    case "ru": return "(переведено)";
    case "zh": return "(已翻译)";
    case "ja": return "(翻訳)";
    default: return "(diterjemahkan)";
  }
}

/**
 * Resolve one ayah's tafsir. Indonesian readers get the authoritative Tafsir
 * Kemenag RI (equran.id); everyone else gets Ibn Kathir. Each source falls
 * back to the other so the panel is populated whenever any source has it.
 *
 * LANGUAGE PURITY (owner rule + AdSense): a locale without its own native
 * tafsir edition (fr/de/es/ru/zh/ja) must NEVER be handed raw English or
 * Indonesian — the fallback text is machine-translated into the UI language
 * (KV-cached forever by mt.ts) before it leaves this function.
 */
export async function fetchTafsir(
  env: Env,
  lang: string | null,
  surah: number,
  ayahNumber: number
): Promise<{ text: string; source: string; lang: string } | null> {
  const wantId = !lang || lang === "id";
  if (wantId) {
    return (
      (await fetchKemenagTafsir(env, surah, ayahNumber)) ??
      (await fetchSpa5kTafsir(env, "id", surah, ayahNumber)) ??
      (await fetchSpa5kTafsir(env, "en", surah, ayahNumber))
    );
  }
  const native = await fetchSpa5kTafsir(env, lang, surah, ayahNumber);
  if (native) return native;

  const fallback =
    (await fetchSpa5kTafsir(env, "en", surah, ayahNumber)) ??
    (await fetchKemenagTafsir(env, surah, ayahNumber));
  if (!fallback) return null;
  if (fallback.lang === lang) return fallback;

  const translated = await translateText(env, fallback.text, lang, fallback.lang);
  if (translated) {
    return { text: translated, source: `${fallback.source} ${translatedSuffix(lang)}`, lang };
  }
  // Translation genuinely failed — an empty panel is more honest than a
  // wrong-language one on a single-language site.
  return null;
}

// ── Multi-edition access (the tafsir "source picker") ─────────────────────
// The full spa5k catalogue is in tafsir-editions.ts; these helpers let the
// reader offer several classical tafsirs per ayah instead of just the single
// default one fetchTafsir() picks. Same fetch-and-KV-cache model, so adding
// editions costs nothing at rest.

/** Locale code the site uses for a given spa5k edition's own language, so the
 * reader knows whether an edition needs translating into the visitor's UI. */
const SPA5K_LANG_TO_LOCALE: Record<string, string> = {
  indonesian: "id",
  english: "en",
  arabic: "ar",
  russian: "ru",
  french: "fr",
  chinese: "zh",
  japanese: "ja",
};

export interface TafsirEditionSummary {
  slug: string;
  name: string;
  author: string;
  lang: string; // ULYAH locale code this edition reads in natively
}

/**
 * The tafsir editions to offer a reader in `uiLang`. Always includes the
 * featured set for that locale; Indonesian additionally leads with Tafsir
 * Kemenag RI (a non-spa5k source, resolved separately in fetchTafsir/here).
 * Falls back to the English featured set for locales with none of their own,
 * so the picker is never empty.
 */
export function listTafsirEditions(uiLang: string | null): TafsirEditionSummary[] {
  const lang = uiLang && FEATURED_TAFSIR[uiLang] ? uiLang : "en";
  const out: TafsirEditionSummary[] = [];
  if (lang === "id") {
    out.push({ slug: "kemenag", name: "Tafsir Ringkas Kemenag RI", author: "Kementerian Agama RI", lang: "id" });
  }
  for (const slug of FEATURED_TAFSIR[lang] ?? []) {
    const ed = findEdition(slug);
    if (ed) out.push({ slug: ed.slug, name: ed.name, author: ed.author, lang: SPA5K_LANG_TO_LOCALE[ed.lang] ?? ed.lang });
  }
  return out;
}

/**
 * Fetch one specific edition's tafsir for one ayah. `edition` is either a
 * spa5k slug or the pseudo-slug "kemenag" (equran.id). If the edition's own
 * language differs from `uiLang`, the text is translated into `uiLang` and
 * cached — never leaking, say, raw English into an Indonesian panel. Returns
 * null when that edition has no text for this ayah (some editions are sparse).
 */
export async function fetchTafsirByEdition(
  env: Env,
  edition: string,
  surah: number,
  ayahNumber: number,
  uiLang: string | null
): Promise<{ text: string; source: string; lang: string } | null> {
  if (edition === "kemenag") return fetchKemenagTafsir(env, surah, ayahNumber);

  const ed: TafsirEdition | undefined = findEdition(edition);
  if (!ed) return null;
  const data = await fetchJsonCached<{ text: string }[] | { ayahs?: { ayah: number; text: string }[] }>(
    env,
    `tafsir:${ed.slug}:${surah}`,
    `${SPA5K}/${ed.slug}/${surah}.json`
  );
  // Two shapes exist upstream: a flat array indexed by ayah-1, or an object
  // with an `ayahs` array keyed by ayah number. Handle both.
  let raw: string | undefined;
  if (Array.isArray(data)) raw = data[ayahNumber - 1]?.text;
  else raw = data?.ayahs?.find((a) => a.ayah === ayahNumber)?.text;
  const text = raw?.trim();
  if (!text || text.length < 20) return null;

  const nativeLocale = SPA5K_LANG_TO_LOCALE[ed.lang] ?? ed.lang;
  // English editions are machine-translated for other locales; ARABIC ONES ARE
  // NOT. An Arabic tafsir is scholarship on scripture written in the idiom of
  // scripture, and machine translation does not survive contact with it — the
  // same pass that produced "Bunda Al-Qur'an" for أم القرآن was translating
  // this. Owner: "alquran jgn d terjemahin sembarangan, krn alquran udah punya
  // tafsirnya sendiri." A reader who picked an Arabic edition by name gets the
  // Arabic, labelled `lang: "ar"` so the panel renders it right-to-left.
  if (uiLang && uiLang !== nativeLocale && nativeLocale === "en") {
    const translated = await translateText(env, text, uiLang, "en");
    if (translated) return { text: translated, source: `${ed.name} (diterjemahkan)`, lang: uiLang };
    return null; // don't leak a foreign-language wall of text into the panel
  }
  return { text, source: ed.name, lang: nativeLocale };
}

/**
 * Sahih Asbab al-Nuzul for one ayah — authentic Arabic. An entry can cover a
 * range of ayat via its `ayahs` array.
 *
 * ARABIC READERS ONLY. This used to be machine-translated on demand for every
 * locale, and that is where a large part of the damage came from: an occasion
 * of revelation is a narration with a chain, and machine translation flattens
 * the chain's idiom into nonsense ("عن أبي ذر" → "atas wewenang Abu Dzar").
 * Wrong is worse than absent here, because the reader has no way to tell.
 *
 * For every other locale this returns null, and the caller falls through to
 * the Al-Wahidi English edition, which is a real translation done by people
 * and can be carried into other languages from there.
 */
async function fetchSahihAsbab(
  env: Env,
  surah: number,
  ayahNumber: number,
  lang: string | null
): Promise<{ text: string; source: string } | null> {
  if (lang !== "ar") return null;
  const padded = String(surah).padStart(3, "0");
  const data = await fetchJsonCached<{ ayahs: number[]; occasions: string[] }[]>(
    env,
    `asbab:sahih:${surah}`,
    `${SAHIH_ASBAB}/${padded}.json`
  );
  const hit = data?.find((e) => Array.isArray(e.ayahs) && e.ayahs.includes(ayahNumber));
  const arabic = hit?.occasions?.map((o) => o.trim()).filter(Boolean).join("\n\n").trim();
  if (!arabic || arabic.length < 40) return null;
  return { text: arabic, source: SAHIH_ASBAB_SOURCE };
}

/**
 * Resolve one ayah's occasion-of-revelation. Priority: the curated Indonesian
 * dataset (Al-Wahidi & As-Suyuthi) — a `null` entry there is an explicit "no
 * specific occasion" and is respected; then the authentic Sahih Asbab al-Nuzul
 * (Arabic, translated on demand); then the spa5k Al-Wahidi (English) edition.
 *
 * AN OCCASION THAT EXISTS IS ALWAYS SHOWN. Owner: "jgn sampe hilang panel
 * asbabun nuzul." This used to return null whenever the on-demand translation
 * failed, and the reader then rendered its "no specific occasion is narrated
 * for this ayah" state — which is not a degraded panel, it is a false
 * statement: the occasion IS narrated, we simply could not translate it that
 * second. A missed translation is transient (upstream rate limit, a blocked
 * Worker egress); the sentence it replaced was wrong and cached.
 *
 * So the last resort is the text we actually have, labelled with the language
 * it is in, and the panel keeps its content. `lang` tells the reader what it
 * received: it is the display language when the text was translated, and the
 * source's own language when it was not — the caller renders `dir` from it and
 * the source label carries the rest.
 */
export async function fetchAsbabunNuzul(
  env: Env,
  surah: number,
  ayahNumber: number,
  lang: string | null = "id"
): Promise<{ text: string; source: string; lang: string } | null> {
  const want = lang ?? "id";
  // The best untranslated answer seen so far. Only ever used if every
  // translation attempt below fails — never in place of one that worked.
  let asIs: { text: string; source: string; lang: string } | null = null;

  const key = `${surah}_${ayahNumber}`;
  if (key in ASBAB_DATA) {
    const text = ASBAB_DATA[key];
    if (!text) return null; // curated "no specific occasion" — a real answer
    // The curated dataset is authored in Indonesian — translate it for any
    // other UI language rather than leaking Indonesian onto a sibling site.
    const curated = "Asbabun Nuzul — Al-Wahidi & As-Suyuthi";
    if (want === "id") return { text, source: curated, lang: "id" };
    const translated = await translateText(env, text, want, "id");
    if (translated) return { text: translated, source: `${curated} ${translatedSuffix(want)}`, lang: want };
    // Hold it, try the other sources, and fall back to it only at the end.
    asIs = { text, source: `${curated} (Bahasa Indonesia)`, lang: "id" };
  }

  const sahih = await fetchSahihAsbab(env, surah, ayahNumber, lang);
  if (sahih) return { ...sahih, lang: "ar" };

  const data = await fetchJsonCached<{ ayahs?: { ayah: number; text: string }[] }>(
    env,
    `asbab:${ASBAB_EDITION}:${surah}`,
    `${SPA5K}/${ASBAB_EDITION}/${surah}.json`
  );
  const hit = data?.ayahs?.find((a) => a.ayah === ayahNumber);
  const text = hit?.text?.trim();
  if (!text || text.length < 40) return asIs;

  // This fallback edition is English-only, so it is translated on demand and
  // cached forever. If the translation fails, the English is shown as English
  // rather than the panel claiming no occasion exists.
  if (want === "en") return { text, source: ASBAB_SOURCE, lang: "en" };
  const translatedEn = await translateText(env, text, want, "en");
  if (translatedEn) return { text: translatedEn, source: `${ASBAB_SOURCE} ${translatedSuffix(want)}`, lang: want };
  return asIs ?? { text, source: `${ASBAB_SOURCE} (English)`, lang: "en" };
}
