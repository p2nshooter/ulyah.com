import type { Env } from "../env.js";
import { safeKvPut } from "./kv-safe.js";

/**
 * Mushaf Utsmani page data — the standard 604-page Madinah Mushaf pagination
 * (the layout printed in virtually every physical Mushaf worldwide, including
 * the one Kemenag RI distributes in Indonesia). Fetched on demand from
 * alquran.cloud's free, no-key "quran-uthmani" edition and cached forever
 * (page boundaries and Uthmani-script text are fixed, they never change) —
 * the same fetch-and-cache model as lib/tafsir-source.ts, so this costs
 * nothing at rest and needs no bulk import into D1.
 *
 * Page/juz boundaries are NOT hardcoded here: "jump to this surah/juz" is
 * resolved by fetching that one ayah/juz from the same API on demand (see
 * resolvePageForSurahStart / resolvePageForJuzStart below) rather than a
 * hand-typed lookup table, which would risk a transcription error somewhere
 * across 114 surahs + 30 juz with no way to verify it here.
 */

const ALQURAN_CLOUD = "https://api.alquran.cloud/v1";
const KV_TTL = 60 * 60 * 24 * 365; // 1 year — Mushaf pagination is permanently fixed

export interface MushafAyah {
  globalNumber: number;
  surahNumber: number;
  numberInSurah: number;
  textUthmani: string;
  page: number;
  juz: number;
}

interface AlQuranAyahRaw {
  number: number;
  text: string;
  surah: { number: number };
  numberInSurah: number;
  juz: number;
  page: number;
}

function toMushafAyah(raw: AlQuranAyahRaw): MushafAyah {
  return {
    globalNumber: raw.number,
    surahNumber: raw.surah.number,
    numberInSurah: raw.numberInSurah,
    textUthmani: raw.text,
    page: raw.page,
    juz: raw.juz,
  };
}

async function fetchJsonCached<T>(env: Env, kvKey: string, url: string): Promise<T | null> {
  const cached = await env.CACHE_KV.get(kvKey);
  if (cached) return JSON.parse(cached) as T;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as T;
  await safeKvPut(env, kvKey, JSON.stringify(data), { expirationTtl: KV_TTL });
  return data;
}

/** All ayat on one Mushaf page (1-604), in the fixed Uthmani-script layout. */
export async function fetchMushafPage(env: Env, pageNumber: number): Promise<MushafAyah[] | null> {
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) return null;
  const data = await fetchJsonCached<{ data?: { ayahs?: AlQuranAyahRaw[] } }>(
    env,
    `mushaf:page:${pageNumber}`,
    `${ALQURAN_CLOUD}/page/${pageNumber}/quran-uthmani`
  );
  const ayahs = data?.data?.ayahs;
  if (!ayahs || ayahs.length === 0) return null;
  return ayahs.map(toMushafAyah);
}

/** The Mushaf page a given surah's ayah 1 falls on — for "jump to surah". */
export async function resolvePageForSurahStart(env: Env, surahNumber: number): Promise<number | null> {
  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) return null;
  const data = await fetchJsonCached<{ data?: AlQuranAyahRaw }>(
    env,
    `mushaf:surah-start-page:${surahNumber}`,
    `${ALQURAN_CLOUD}/ayah/${surahNumber}:1/quran-uthmani`
  );
  return data?.data?.page ?? null;
}

/** The Mushaf page a given juz (1-30) starts on — for "jump to juz". */
export async function resolvePageForJuzStart(env: Env, juzNumber: number): Promise<number | null> {
  if (!Number.isInteger(juzNumber) || juzNumber < 1 || juzNumber > 30) return null;
  const data = await fetchJsonCached<{ data?: { ayahs?: AlQuranAyahRaw[] } }>(
    env,
    `mushaf:juz-start-page:${juzNumber}`,
    `${ALQURAN_CLOUD}/juz/${juzNumber}/quran-uthmani`
  );
  const first = data?.data?.ayahs?.[0];
  return first?.page ?? null;
}
