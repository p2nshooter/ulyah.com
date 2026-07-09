import type { Env } from "../env.js";

/**
 * Tafsir and asbabun nuzul, fetched on demand from spa5k/tafsir_api (a
 * static, CC-licensed mirror of quran.com's tafsir API on GitHub) and
 * cached per-surah in KV — never bulk-imported into D1. One surah's worth
 * of commentary is a few hundred KB at most; storing all 6,236 ayat's
 * commentary permanently (both were tried) meant a 90MB+ SQL import that
 * kept hitting D1's per-statement size limit, for content a stable public
 * API already serves. This mirrors the same fix applied to murottal audio:
 * stream from the source, cache lightly, don't re-host a full copy.
 */

const BASE = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir";
const KV_TTL = 60 * 60 * 24 * 30; // 30 days — this is static classical text, never changes

const TAFSIR_EDITIONS: Record<string, { edition: string; source: string }> = {
  id: { edition: "id-tafsir-as-saadi", source: "Tafsir As-Sa'di" },
  en: { edition: "en-tafisr-ibn-kathir", source: "Tafsir Ibn Kathir" },
};
const ASBAB_EDITION = "en-asbab-al-nuzul-by-al-wahidi";
const ASBAB_SOURCE = "Asbab An-Nuzul by Al-Wahidi";

async function fetchJsonCached<T>(env: Env, kvKey: string, url: string): Promise<T | null> {
  const cached = await env.CACHE_KV.get(kvKey);
  if (cached) return JSON.parse(cached) as T;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as T;
  await env.CACHE_KV.put(kvKey, JSON.stringify(data), { expirationTtl: KV_TTL });
  return data;
}

/** Resolve one ayah's tafsir text in the requested language, falling back
 * to English then Indonesian — whichever edition actually exists. */
export async function fetchTafsir(
  env: Env,
  lang: string | null,
  surah: number,
  ayahNumber: number
): Promise<{ text: string; source: string; lang: string } | null> {
  const candidates = [...new Set([lang, "en", "id"].filter(Boolean))] as string[];
  for (const l of candidates) {
    const ed = TAFSIR_EDITIONS[l];
    if (!ed) continue;
    const data = await fetchJsonCached<{ text: string }[]>(
      env,
      `tafsir:${ed.edition}:${surah}`,
      `${BASE}/${ed.edition}/${surah}.json`
    );
    const text = data?.[ayahNumber - 1]?.text?.trim();
    if (text && text.length >= 20) return { text, source: ed.source, lang: l };
  }
  return null;
}

/** Resolve one ayah's occasion-of-revelation narration, if the source has
 * one — most ayat don't (only ~1,088 of 6,236 do), which is a real
 * scholarly fact, not a gap to fill. */
export async function fetchAsbabunNuzul(
  env: Env,
  surah: number,
  ayahNumber: number
): Promise<{ text: string; source: string } | null> {
  const data = await fetchJsonCached<{ ayahs?: { ayah: number; text: string }[] }>(
    env,
    `asbab:${ASBAB_EDITION}:${surah}`,
    `${BASE}/${ASBAB_EDITION}/${surah}.json`
  );
  const hit = data?.ayahs?.find((a) => a.ayah === ayahNumber);
  const text = hit?.text?.trim();
  if (text && text.length >= 40) return { text, source: ASBAB_SOURCE };
  return null;
}
