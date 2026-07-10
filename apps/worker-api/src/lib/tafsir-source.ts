import type { Env } from "../env.js";
import { ASBAB_DATA } from "./asbabun-nuzul-data.js";
import { translateText } from "./mt.js";
import { safeKvPut } from "./kv-safe.js";

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
const KV_TTL = 60 * 60 * 24 * 30; // 30 days — static classical text, never changes

const SPA5K_TAFSIR: Record<string, { edition: string; source: string }> = {
  en: { edition: "en-tafisr-ibn-kathir", source: "Tafsir Ibn Kathir" },
  id: { edition: "id-tafsir-as-saadi", source: "Tafsir As-Sa'di" },
};
const ASBAB_EDITION = "en-asbab-al-nuzul-by-al-wahidi";
const ASBAB_SOURCE = "Asbab An-Nuzul by Al-Wahidi";

async function fetchJsonCached<T>(env: Env, kvKey: string, url: string): Promise<T | null> {
  const cached = await env.CACHE_KV.get(kvKey);
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

/**
 * Resolve one ayah's occasion-of-revelation. The curated Indonesian dataset
 * (Al-Wahidi & As-Suyuthi) wins; a `null` entry there is an explicit "no
 * specific occasion" and is respected. Ayat absent from the curated set fall
 * back to the spa5k Al-Wahidi (English) edition.
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

  const data = await fetchJsonCached<{ ayahs?: { ayah: number; text: string }[] }>(
    env,
    `asbab:${ASBAB_EDITION}:${surah}`,
    `${SPA5K}/${ASBAB_EDITION}/${surah}.json`
  );
  const hit = data?.ayahs?.find((a) => a.ayah === ayahNumber);
  const text = hit?.text?.trim();
  if (!text || text.length < 40) return null;

  // This fallback edition is English-only. Surfacing raw English in an
  // otherwise all-Indonesian panel (translation, Tafsir Kemenag) read as a
  // broken/inconsistent page, so translate it on demand and cache the
  // result forever (same fetch-and-cache shape as lib/mt.ts elsewhere).
  if (!lang || lang === "id") {
    const translated = await translateText(env, text, "id", "en");
    if (translated) return { text: translated, source: `${ASBAB_SOURCE} (diterjemahkan)` };
  }
  return { text, source: ASBAB_SOURCE };
}
