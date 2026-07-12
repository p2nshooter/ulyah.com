import type { Env } from "../env.js";
import { safeKvPut } from "./kv-safe.js";

// Free, keyless Google Translate ("gtx") endpoint — much more reliable and
// higher-limit than MyMemory, and handles long text in one request. Used as
// the primary; MyMemory stays as a fallback so a hiccup on one still yields
// a translation rather than leaking the untranslated source language.
const GTX_BASE = "https://translate.googleapis.com/translate_a/single";
const MYMEMORY_BASE = "https://api.mymemory.translated.net/get";
// Static classical-Arabic prose never changes, so once a description is
// translated it stays correct forever — a long TTL just bounds KV storage,
// it isn't a freshness concern.
const KV_TTL = 60 * 60 * 24 * 90;

function hashKey(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function chunkText(text: string, maxBytes: number): string[] {
  const sentences = text.split(/(?<=[.!?؟۔])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    const candidate = current ? `${current} ${s}` : s;
    if (new TextEncoder().encode(candidate).length > maxBytes && current) {
      chunks.push(current);
      current = s;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

// Google's translate endpoint wants "zh-CN" for Simplified Chinese, not the
// site's own bare "zh" locale code — every other site locale (id, en, ru,
// de, fr, ar, ja) matches Google's code as-is.
function toGoogleLang(code: string): string {
  return code === "zh" ? "zh-CN" : code;
}

/** Primary: Google's free gtx endpoint. Handles long text in one request;
 * response is [[[translatedSegment, originalSegment, ...], ...], ...]. */
async function googleTranslate(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  const sl = toGoogleLang(sourceLang);
  const tl = toGoogleLang(targetLang);
  const url = `${GTX_BASE}?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ulyah.com/1.0)" } });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const out = (data[0] as unknown[])
      .map((seg) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
      .join("");
    return out.trim() ? out.trim() : null;
  } catch {
    return null;
  }
}

/** Fallback: MyMemory's free API (per-chunk, smaller limits). */
async function mymemoryTranslate(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ulyah.com/1.0 (Islamic library, on-demand translation)" },
    });
    if (!res.ok) return null;
    const data = await res.json<{ responseData?: { translatedText?: string }; responseStatus?: number | string }>();
    if (String(data.responseStatus ?? "200") !== "200") return null;
    const translated = data.responseData?.translatedText;
    return translated && translated.trim() ? translated.trim() : null;
  } catch {
    return null;
  }
}

async function translateChunk(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  return (await googleTranslate(text, sourceLang, targetLang)) ?? (await mymemoryTranslate(text, sourceLang, targetLang));
}

/**
 * On-demand translation (Google gtx primary, MyMemory fallback), KV-cached
 * per (text, sourceLang, targetLang) so any given piece of text is ever
 * sent to the translator once, then served from cache to every visitor
 * after that. This mirrors the fetch-and-cache pattern used for
 * tafsir/asbabun nuzul (lib/tafsir-source.ts) instead of machine-translating
 * and bulk-storing everything in D1 up front. `targetLang` accepts any of
 * the site's locale codes (id/en/ru/de/fr/ar/zh/ja, packages/shared/i18n) —
 * every visitor's own language gets a real translation, not just id/en.
 */
/**
 * Cache-only translation: returns a previously-cached translation or null,
 * and NEVER calls the translation API. Use this on list pages that render
 * many items at once (e.g. a kitab category of 24 titles) — calling the live
 * translateText for each would fire a storm of subrequests on a single page
 * load and can trip Cloudflare's Worker resource limits (Error 1102). Titles
 * fill in progressively as their detail pages (which do call translateText)
 * warm the cache.
 */
export async function translateCachedOnly(
  env: Env,
  text: string,
  targetLang: string,
  sourceLang: "ar" | "en" = "ar"
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || sourceLang === targetLang) return null;
  const kvKey = `mt:${sourceLang}-${targetLang}:${hashKey(trimmed)}`;
  const cached = await env.CACHE_KV.get(kvKey);
  return cached ? cached : null;
}

export async function translateText(
  env: Env,
  text: string,
  targetLang: string,
  sourceLang: "ar" | "en" = "ar"
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || sourceLang === targetLang) return null;

  const kvKey = `mt:${sourceLang}-${targetLang}:${hashKey(trimmed)}`;
  const cached = await env.CACHE_KV.get(kvKey);
  if (cached !== null) return cached || null;

  try {
    // Google handles the whole passage in one request — try that first.
    let result = await googleTranslate(trimmed, sourceLang, targetLang);
    if (!result) {
      // Fall back to chunked translation (Google per-chunk, then MyMemory).
      const chunks = chunkText(trimmed, 450);
      const parts = await Promise.all(chunks.map((chunk) => translateChunk(chunk, sourceLang, targetLang)));
      result = parts.some((p) => p === null) ? null : parts.join(" ");
    }
    if (!result) {
      // Failure marker with a short TTL — retry soon rather than caching a miss for 90 days.
      await safeKvPut(env, kvKey, "", { expirationTtl: 60 * 60 * 6 });
      return null;
    }
    await safeKvPut(env, kvKey, result, { expirationTtl: KV_TTL });
    return result;
  } catch {
    return null;
  }
}
