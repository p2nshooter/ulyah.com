import type { Env } from "../env.js";
import { safeKvGet, safeKvPut } from "./kv-safe.js";

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

// Per-isolate memo in front of KV. The free-tier KV READ quota (100k/day)
// was exhausted on 2026-07-16 and every unguarded get() threw, taking all
// content routes down at once. safeKvGet already makes that non-fatal; this
// memo also makes it rare — repeated texts (nav labels, titles, amalan rows)
// resolve in-memory without touching KV at all while the isolate lives.
const MT_MEM_MAX = 5000;
const mtMem = new Map<string, string>();
function memGet(key: string): string | undefined {
  const v = mtMem.get(key);
  if (v !== undefined) {
    mtMem.delete(key);
    mtMem.set(key, v); // refresh LRU position
  }
  return v;
}
function memSet(key: string, value: string): void {
  if (mtMem.size >= MT_MEM_MAX) {
    const oldest = mtMem.keys().next().value;
    if (oldest !== undefined) mtMem.delete(oldest);
  }
  mtMem.set(key, value);
}

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
  sourceLang: string = "ar"
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || sourceLang === targetLang) return null;
  const kvKey = `mt:${sourceLang}-${targetLang}:${hashKey(trimmed)}`;
  const mem = memGet(kvKey);
  if (mem !== undefined) return mem || null;
  const cached = await safeKvGet(env, kvKey);
  if (cached !== null) memSet(kvKey, cached);
  return cached ? cached : null;
}

export async function translateText(
  env: Env,
  text: string,
  targetLang: string,
  sourceLang: string = "ar"
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed || sourceLang === targetLang) return null;

  const kvKey = `mt:${sourceLang}-${targetLang}:${hashKey(trimmed)}`;
  const mem = memGet(kvKey);
  if (mem !== undefined) return mem || null;
  const cached = await safeKvGet(env, kvKey);
  if (cached !== null) {
    memSet(kvKey, cached);
    return cached || null;
  }

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
      memSet(kvKey, "");
      await safeKvPut(env, kvKey, "", { expirationTtl: 60 * 60 * 6 });
      return null;
    }
    memSet(kvKey, result);
    await safeKvPut(env, kvKey, result, { expirationTtl: KV_TTL });
    return result;
  } catch {
    return null;
  }
}

/**
 * Localize MANY short texts in as few upstream calls as possible. Reads the
 * KV cache per text (cheap), then translates all misses in newline-joined
 * batches — one gtx request per ~30 texts instead of one per text, which is
 * what keeps a cold cache inside Cloudflare's per-request subrequest budget
 * (the naive per-field loop hit it immediately on 100-item categories).
 * Internal newlines are flattened to spaces before joining, so the split is
 * unambiguous. If a batch comes back with the wrong segment count (MT
 * engines occasionally eat line breaks), that batch falls back to the
 * originals rather than mis-assigning translations to the wrong rows.
 * Returns the input text unchanged wherever translation isn't available —
 * the reader sees the source language, never a hole.
 */
// Proper nouns and tokens that must NEVER be machine-translated — hadith
// collections, imams, and the "no." abbreviation. Left to gtx, "Bukhari"
// became "Boukhari/Bujari", "Muslim" became the adjective "musulman", and
// "no." became "non." on the sibling audiobook lists (owner: "css/menu error").
// Longest first so "Abu Dawud" masks before "Dawud". Word-boundary, case-i.
const PROTECTED_TERMS = [
  "Abu Dawud", "Ibnu Majah", "Ibn Majah", "An-Nasa'i", "Ad-Darimi",
  "Bukhari", "Muslim", "Tirmidzi", "Tirmidhi", "Nasa'i", "Nasai",
  "Ahmad", "Malik", "Darimi", "Baihaqi", "Hakim", "Thabrani", "no.", "No.",
];
const PROTECT_RE = new RegExp(
  `(${PROTECTED_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
  "gi"
);

function maskProtected(text: string): { masked: string; map: string[] } {
  const map: string[] = [];
  const masked = text.replace(PROTECT_RE, (m) => {
    const i = map.length;
    map.push(m);
    return `@@${i}@@`;
  });
  return { masked, map };
}
function restoreProtected(text: string, map: string[]): string {
  return text.replace(/@@\s*(\d+)\s*@@/g, (_, d) => map[Number(d)] ?? "");
}

/**
 * Like localizeBatch, but shields Islamic proper nouns and "no." from the
 * translator so a hadith audiobook title keeps "Bukhari"/"Muslim"/"no." intact
 * across every language instead of being mangled. gtx passes the @@n@@
 * sentinels through unchanged (verified), then they are restored.
 */
export async function localizeBatchProtected(
  env: Env,
  texts: (string | null | undefined)[],
  targetLang: string,
  sourceLang = "en"
): Promise<(string | null)[]> {
  if (targetLang === sourceLang) return texts.map((t) => t ?? null);
  const maps: (string[] | null)[] = [];
  const masked = texts.map((t) => {
    if (!t) {
      maps.push(null);
      return t ?? null;
    }
    const { masked, map } = maskProtected(t);
    maps.push(map);
    return masked;
  });
  const out = await localizeBatch(env, masked, targetLang, sourceLang);
  return out.map((v, i) => (v && maps[i] ? restoreProtected(v, maps[i]!) : v));
}

export async function localizeBatch(
  env: Env,
  texts: (string | null | undefined)[],
  targetLang: string,
  sourceLang = "id"
): Promise<(string | null)[]> {
  if (targetLang === sourceLang) return texts.map((t) => t ?? null);

  const out: (string | null)[] = new Array(texts.length).fill(null);
  const misses: { idx: number; text: string; kvKey: string }[] = [];

  await Promise.all(
    texts.map(async (raw, idx) => {
      const trimmed = raw?.trim();
      if (!trimmed) return;
      const kvKey = `mt:${sourceLang}-${targetLang}:${hashKey(trimmed)}`;
      const cached = memGet(kvKey) ?? (await safeKvGet(env, kvKey));
      if (cached !== null && cached !== undefined) memSet(kvKey, cached);
      if (cached) out[idx] = cached;
      else if (cached === "") out[idx] = trimmed; // known-failed recently — serve source
      else misses.push({ idx, text: trimmed.replace(/\s*\n\s*/g, " "), kvKey });
    })
  );

  // Batch misses: ≤30 texts and ≤6000 chars per upstream call.
  const batches: (typeof misses)[] = [];
  let cur: typeof misses = [];
  let curLen = 0;
  for (const m of misses) {
    if (cur.length >= 30 || curLen + m.text.length > 6000) {
      if (cur.length) batches.push(cur);
      cur = [];
      curLen = 0;
    }
    cur.push(m);
    curLen += m.text.length;
  }
  if (cur.length) batches.push(cur);

  for (const batch of batches) {
    const joined = batch.map((m) => m.text).join("\n");
    const translated = await googleTranslate(joined, sourceLang, targetLang);
    const parts = translated?.split("\n").map((s) => s.trim()) ?? [];
    if (parts.length === batch.length) {
      await Promise.all(
        batch.map((m, i) => {
          out[m.idx] = parts[i] || m.text;
          if (parts[i]) memSet(m.kvKey, parts[i]!);
          return parts[i] ? safeKvPut(env, m.kvKey, parts[i]!, { expirationTtl: KV_TTL }) : Promise.resolve();
        })
      );
    } else {
      // Segment-count mismatch — never mis-assign; serve source text.
      for (const m of batch) out[m.idx] = m.text;
    }
  }

  // Anything still null (empty inputs already handled) falls back to source.
  return out.map((v, i) => v ?? texts[i]?.trim() ?? null);
}
