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

async function fetchJsonCached<T>(env: Env, kvKey: string, url: string): Promise<T | null> {
  const cached = await safeKvGet(env, kvKey);
  if (cached) return JSON.parse(cached) as T;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as T;
  await safeKvPut(env, kvKey, JSON.stringify(data), { expirationTtl: KV_TTL });
  return data;
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

/**
 * Resolve one ayah's tafsir. Indonesian readers get the authoritative Tafsir
 * Kemenag RI (equran.id); everyone else gets Ibn Kathir. Each source falls
 * back to the other so the panel is populated whenever any source has it.
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
  return (
    (await fetchSpa5kTafsir(env, lang, surah, ayahNumber)) ??
    (await fetchSpa5kTafsir(env, "en", surah, ayahNumber)) ??
    (await fetchKemenagTafsir(env, surah, ayahNumber))
  );
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
  if (uiLang && uiLang !== nativeLocale && (nativeLocale === "en" || nativeLocale === "ar")) {
    const translated = await translateText(env, text, uiLang, nativeLocale === "en" ? "en" : undefined);
    if (translated) return { text: translated, source: `${ed.name} (diterjemahkan)`, lang: uiLang };
    return null; // don't leak a foreign-language wall of text into the panel
  }
  return { text, source: ed.name, lang: nativeLocale };
}

/** Sahih Asbab al-Nuzul for one ayah — authentic Arabic, translated to the
 * reader's language on demand (never leaking raw Arabic into a non-Arabic
 * panel). An entry can cover a range of ayat via its `ayahs` array. */
async function fetchSahihAsbab(
  env: Env,
  surah: number,
  ayahNumber: number,
  lang: string | null
): Promise<{ text: string; source: string } | null> {
  const padded = String(surah).padStart(3, "0");
  const data = await fetchJsonCached<{ ayahs: number[]; occasions: string[] }[]>(
    env,
    `asbab:sahih:${surah}`,
    `${SAHIH_ASBAB}/${padded}.json`
  );
  const hit = data?.find((e) => Array.isArray(e.ayahs) && e.ayahs.includes(ayahNumber));
  const arabic = hit?.occasions?.map((o) => o.trim()).filter(Boolean).join("\n\n").trim();
  if (!arabic || arabic.length < 40) return null;

  if (lang === "ar") return { text: arabic, source: SAHIH_ASBAB_SOURCE };
  const translated = await translateText(env, arabic, lang ?? "id", "ar");
  if (translated) return { text: translated, source: `${SAHIH_ASBAB_SOURCE} (diterjemahkan)` };
  // Translation genuinely failed — better to fall through to another source
  // than to dump untranslated Arabic into, say, an Indonesian panel.
  return null;
}

/**
 * Resolve one ayah's occasion-of-revelation. Priority: the curated Indonesian
 * dataset (Al-Wahidi & As-Suyuthi) — a `null` entry there is an explicit "no
 * specific occasion" and is respected; then the authentic Sahih Asbab al-Nuzul
 * (Arabic, translated on demand); then the spa5k Al-Wahidi (English) edition.
 */
export async function fetchAsbabunNuzul(
  env: Env,
  surah: number,
  ayahNumber: number,
  lang: string | null = "id"
): Promise<{ text: string; source: string } | null> {
  const key = `${surah}_${ayahNumber}`;
  if (key in ASBAB_DATA) {
    const text = ASBAB_DATA[key];
    return text ? { text, source: "Asbabun Nuzul — Al-Wahidi & As-Suyuthi" } : null;
  }

  const sahih = await fetchSahihAsbab(env, surah, ayahNumber, lang);
  if (sahih) return sahih;

  const data = await fetchJsonCached<{ ayahs?: { ayah: number; text: string }[] }>(
    env,
    `asbab:${ASBAB_EDITION}:${surah}`,
    `${SPA5K}/${ASBAB_EDITION}/${surah}.json`
  );
  const hit = data?.ayahs?.find((a) => a.ayah === ayahNumber);
  const text = hit?.text?.trim();
  if (!text || text.length < 40) return null;

  // This fallback edition is English-only. Surfacing raw English in an
  // otherwise all-Indonesian panel (translation, Tafsir Kemenag) reads as a
  // broken/inconsistent page, so translate it on demand and cache the
  // result forever (same fetch-and-cache shape as lib/mt.ts elsewhere).
  // If translation genuinely fails for an Indonesian reader, return null so
  // the reader shows its honest "no specific occasion" state — NEVER leak
  // untranslated English into the Indonesian UI.
  if (!lang || lang === "id") {
    const translated = await translateText(env, text, "id", "en");
    return translated ? { text: translated, source: `${ASBAB_SOURCE} (diterjemahkan)` } : null;
  }
  return { text, source: ASBAB_SOURCE };
}
