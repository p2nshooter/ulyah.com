import type { Env } from "../env.js";

/**
 * Trusted Qur'an translations and Al-Mukhtasar tafsir, read from R2 (written by scripts/import-quran-translations.ts).
 *
 * Owner, 22 Nov 2026: "Klo Al-quran mah jgn di terjemah sembarangan, cari langsung tafsir2 dari setiap negara … yg
 * tafsirnya sholeh" — and "Jgn ke D1, pindah ke R2". Each language carries ONE translation by a named scholar or
 * institution from QuranEnc.com, stored exactly as published, with its footnotes, its version and its source — all
 * three are shown with the text (QuranEnc's terms of republication). Nothing here is ever machine-translated: a
 * language without a trusted translation simply has none here, and the caller keeps its own fallback.
 *
 * Read once per isolate per surah and held for an hour, so a reader moving through a surah costs one R2 read.
 */

export type QuranKind = "tr" | "mukhtasar";

export interface TrustedAyah {
  a: number;
  t: string;
  f?: string;
}

export interface TrustedMeta {
  key: string;
  title: string;
  version: string;
  source: string;
  url: string;
}

export interface TrustedSurah {
  meta: TrustedMeta;
  byAyah: Map<number, TrustedAyah>;
}

const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: Promise<TrustedSurah | null> }>();

async function readJson<T>(env: Env, key: string): Promise<T | null> {
  try {
    const obj = await env.MEDIA_R2?.get(key);
    if (!obj) return null;
    return (await obj.json()) as T;
  } catch {
    return null;
  }
}

/** The trusted translation (or Al-Mukhtasar) of one surah in one language, or null when there is none. */
export function trustedSurah(env: Env, kind: QuranKind, lang: string, surah: number): Promise<TrustedSurah | null> {
  if (!/^[a-z]{2}$/.test(lang) || !Number.isInteger(surah) || surah < 1 || surah > 114) return Promise.resolve(null);
  const key = `${kind}:${lang}:${surah}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value;
  const value = (async () => {
    const [meta, file] = await Promise.all([
      readJson<TrustedMeta & { ayat?: number }>(env, `quran/${kind}/${lang}/meta.json`),
      readJson<{ ayat?: TrustedAyah[] }>(env, `quran/${kind}/${lang}/${surah}.json`),
    ]);
    // The meta is written last by the importer: no meta, no trusted text (a half-written import is never shown).
    if (!meta?.key || !Array.isArray(file?.ayat) || file!.ayat!.length === 0) return null;
    const byAyah = new Map<number, TrustedAyah>();
    for (const x of file!.ayat!) if (x && typeof x.a === "number" && typeof x.t === "string") byAyah.set(x.a, x);
    return {
      meta: { key: meta.key, title: meta.title, version: String(meta.version), source: meta.source || "QuranEnc.com", url: meta.url },
      byAyah,
    };
  })();
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 2000) cache.delete(cache.keys().next().value as string);
  return value;
}

/** "Indonesian Translation - Ministry of Religious Affairs · QuranEnc.com v1.0.3" — the credit shown with the text. */
export function creditLine(m: TrustedMeta): string {
  return `${m.title} · ${m.source} v${m.version}`;
}
