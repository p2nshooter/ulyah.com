import type { Env } from "../env.js";
import { safeKvPut } from "./kv-safe.js";

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

async function translateChunk(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  const url = `${MYMEMORY_BASE}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "ulyah.com/1.0 (Islamic library, on-demand translation)" },
  });
  if (!res.ok) return null;
  const data = await res.json<{ responseData?: { translatedText?: string }; responseStatus?: number | string }>();
  if (String(data.responseStatus ?? "200") !== "200") return null;
  const translated = data.responseData?.translatedText;
  return translated && translated.trim() ? translated.trim() : null;
}

/**
 * On-demand translation via MyMemory's free, keyless API, KV-cached per
 * (text, sourceLang, targetLang) so any given piece of text is ever sent to
 * the translator once, then served from cache to every visitor after that.
 * This mirrors the fetch-and-cache pattern used for tafsir/asbabun nuzul
 * (lib/tafsir-source.ts) instead of machine-translating and bulk-storing
 * everything in D1 up front. Defaults to Arabic source (the original use
 * case: kitab descriptions) but also translates English fallback sources
 * (e.g. the spa5k Al-Wahidi asbabun nuzul edition) into Indonesian.
 */
export async function translateText(
  env: Env,
  text: string,
  targetLang: "id" | "en",
  sourceLang: "ar" | "en" = "ar"
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || sourceLang === targetLang) return null;

  const kvKey = `mt:${sourceLang}-${targetLang}:${hashKey(trimmed)}`;
  const cached = await env.CACHE_KV.get(kvKey);
  if (cached !== null) return cached || null;

  try {
    const chunks = chunkText(trimmed, 450);
    const parts = await Promise.all(chunks.map((chunk) => translateChunk(chunk, sourceLang, targetLang)));
    if (parts.some((p) => p === null)) {
      // Failure marker with a short TTL — retry soon rather than caching a miss for 90 days.
      await safeKvPut(env, kvKey, "", { expirationTtl: 60 * 60 * 6 });
      return null;
    }
    const result = parts.join(" ");
    await safeKvPut(env, kvKey, result, { expirationTtl: KV_TTL });
    return result;
  } catch {
    return null;
  }
}
