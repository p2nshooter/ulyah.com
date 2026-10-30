import type { Env } from "../env.js";

/**
 * Kitab pesantren translations, read from R2.
 *
 * Owner, 30 Oct 2026: "Semua database wajib ke R2, pastikan hemat D1" (docs/R2-DATA-BLUEPRINT.md §5, step 1).
 * They lived in D1 (`pes_i18n`), which is full; scripts/translate-pesantren.ts copied them here once with
 * the same keys and is now the only writer:
 *
 *   pes-i18n/<lang>/<kitab>.json  one kitab:  { slug, lang, srcHash, complete, updatedAt, strings: { key: text } }
 *   pes-i18n/<lang>/_index.json   the list:   { lang, updatedAt, migratedFromD1, categories: { slug: name },
 *                                              kitab: { slug: { title_id, description_id, srcHash, complete } } }
 *
 * Keys are those `pes_i18n` used: k:title_id, k:description_id, b:<bab id>, mt:/tr:/ex:<matn id>. A route reads
 * D1 only when R2 has nothing, while the move settles (D1 read-only for 7 days).
 */
export interface PesIndex {
  lang: string;
  updatedAt: string;
  migratedFromD1?: string;
  categories: Record<string, string>;
  kitab: Record<string, { title_id?: string; description_id?: string; srcHash?: string | null; complete?: boolean }>;
}
export interface PesKitab {
  slug: string;
  lang: string;
  srcHash: string | null;
  complete: boolean;
  updatedAt: string;
  strings: Record<string, string>;
}

const SLUG = /^[a-z0-9-]{1,80}$/;
const LANG = /^[a-z]{2}$/;

async function readJson<T>(env: Env, key: string): Promise<T | null> {
  if (!env.MEDIA_R2) return null;
  try {
    const obj = await env.MEDIA_R2.get(key);
    return obj ? ((await obj.json()) as T) : null;
  } catch {
    return null;
  }
}

// The index is small and read by two list routes on every sibling site, so an isolate keeps it a few
// minutes; a kitab object is read once per (uncached) page and not kept.
const indexMemo = new Map<string, { at: number; v: PesIndex | null }>();
const INDEX_TTL_MS = 5 * 60_000;

export async function pesIndex(env: Env, lang: string): Promise<PesIndex | null> {
  if (!LANG.test(lang)) return null;
  const hit = indexMemo.get(lang);
  if (hit && Date.now() - hit.at < INDEX_TTL_MS) return hit.v;
  const v = await readJson<PesIndex>(env, `pes-i18n/${lang}/_index.json`);
  indexMemo.set(lang, { at: Date.now(), v });
  return v;
}

export async function pesKitab(env: Env, slug: string, lang: string): Promise<PesKitab | null> {
  if (!SLUG.test(slug) || !LANG.test(lang)) return null;
  const v = await readJson<PesKitab>(env, `pes-i18n/${lang}/${slug}.json`);
  return v && v.strings && typeof v.strings === "object" ? v : null;
}
