import type { Env } from "../env.js";

// Free, keyless Google Translate ("gtx") endpoint — much more reliable and
// higher-limit than MyMemory, and handles long text in one request. Used as
// the primary; MyMemory stays as a fallback so a hiccup on one still yields
// a translation rather than leaking the untranslated source language.
const GTX_BASE = "https://translate.googleapis.com/translate_a/single";
const MYMEMORY_BASE = "https://api.mymemory.translated.net/get";

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

// Cloudflare Workers AI translation (Meta M2M100). Runs on Cloudflare's own
// infrastructure — no external fetch — so unlike the free Google/MyMemory
// endpoints it is never rate-limited or IP-blocked from the Worker's egress.
// That was the real cause of siblings "still showing a lot of Indonesian":
// the free endpoints intermittently refuse the Worker, MT returns null, and
// localizeBatch falls back to the Indonesian source. This model is the
// reliable last line so a translation almost always exists.
const M2M_LANG: Record<string, string> = {
  id: "indonesian", en: "english", fr: "french", de: "german", es: "spanish",
  ar: "arabic", ru: "russian", zh: "chinese", ja: "japanese", nl: "dutch",
  tr: "turkish", ur: "urdu", bn: "bengali", sv: "swedish",
};
async function cfAiTranslate(
  env: Env,
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const sl = M2M_LANG[sourceLang];
  const tl = M2M_LANG[targetLang];
  if (!sl || !tl) return null; // model can't do this pair — leave to others
  try {
    const r = (await env.AI.run("@cf/meta/m2m100-1.2b", {
      text,
      source_lang: sl,
      target_lang: tl,
    })) as { translated_text?: string } | null;
    const out = r?.translated_text?.trim();
    return out ? out : null;
  } catch {
    return null;
  }
}

async function translateChunk(env: Env, text: string, sourceLang: string, targetLang: string): Promise<string | null> {
  return (
    (await googleTranslate(text, sourceLang, targetLang)) ??
    (await mymemoryTranslate(text, sourceLang, targetLang)) ??
    (await cfAiTranslate(env, text, sourceLang, targetLang))
  );
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

// ── Translation cache backend: D1, not KV ────────────────────────────────
// The whole ecosystem's translations were being written to KV, whose FREE
// plan caps writes at 1,000/day. The taxonomy alone is 5,000+ strings × the
// sibling languages, so the daily cap was exhausted after ~0 useful writes
// and EVERY string fell back to Indonesian on 1fr.fr/dawa.es/tilawa.de/xad.es
// — no matter how often the cache was "warmed". D1 has no such daily write
// cap (and the app already writes to it constantly for analytics), so the
// translation cache lives here now. Same `mt:<src>-<tgt>:<hash>` key, moved
// from a KV namespace to the `mt_cache` table (migration 0046). All ops are
// wrapped so a cache hiccup degrades to a live/​source result, never a 500.
async function mtDbGet(env: Env, key: string): Promise<string | null> {
  try {
    const row = await env.DB.prepare("SELECT v FROM mt_cache WHERE k = ?").bind(key).first<{ v: string }>();
    return row ? row.v : null;
  } catch {
    return null;
  }
}

async function mtDbGetMany(env: Env, keys: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniq = [...new Set(keys)];
  for (let i = 0; i < uniq.length; i += 90) {
    const chunk = uniq.slice(i, i + 90);
    const ph = chunk.map(() => "?").join(",");
    try {
      const { results } = await env.DB.prepare(`SELECT k, v FROM mt_cache WHERE k IN (${ph})`)
        .bind(...chunk)
        .all<{ k: string; v: string }>();
      for (const r of results) map.set(r.k, r.v);
    } catch {
      /* ignore — misses just get retranslated */
    }
  }
  return map;
}

async function mtDbPut(env: Env, key: string, value: string): Promise<void> {
  try {
    await env.DB.prepare("INSERT INTO mt_cache (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v")
      .bind(key, value)
      .run();
  } catch {
    /* non-fatal: the memo still holds it for this isolate */
  }
}

async function mtDbPutMany(env: Env, entries: { k: string; v: string }[]): Promise<void> {
  if (!entries.length) return;
  try {
    await env.DB.batch(
      entries.map((e) =>
        env.DB.prepare("INSERT INTO mt_cache (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(
          e.k,
          e.v
        )
      )
    );
  } catch {
    /* non-fatal */
  }
}

// ── Runtime translation budget (Error 1102 guard) ────────────────────────
// A page rendered in a language whose cache is still thin misses on hundreds
// of strings. The batched path is cheap, but when a batched upstream call
// fails — and Google's endpoint IS routinely blocked from Cloudflare IPs — the
// old code retried EVERY string individually through the Workers AI chain.
// Hundreds of inference subrequests in one request is exactly what Cloudflare
// kills with "Error 1102 — Worker exceeded resource limits", which is what
// visitors hit when switching ulyah.com to one of the newer languages.
//
// So the runtime is BOUNDED: a handful of upstream batches, a small per-string
// retry fan-out, a wall-clock deadline, and a cap on how many chunks one long
// passage may spend. Whatever doesn't fit renders in the source language
// (never a hole, never a 1102) and is filled in by the nightly warm job on a
// GitHub runner, which has no such limits and persists everything to D1.
const MAX_UPSTREAM_BATCHES = 3;
const MAX_SINGLE_RETRIES = 6;
const UPSTREAM_DEADLINE_MS = 5000;
const MAX_RUNTIME_CHUNKS = 8;

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
  const cached = await mtDbGet(env, kvKey);
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
  const cached = await mtDbGet(env, kvKey);
  if (cached !== null) {
    memSet(kvKey, cached);
    return cached || null;
  }

  try {
    // Google handles the whole passage in one request — try that first.
    let result = await googleTranslate(trimmed, sourceLang, targetLang);
    if (!result) {
      // Fall back to chunked translation (Google per-chunk, MyMemory, then
      // Cloudflare Workers AI — the reliable last line). A very long passage
      // splits into many chunks, and one inference subrequest per chunk is the
      // other way a single request used to trip Cloudflare's resource limits
      // (Error 1102). Above the cap we don't attempt it at runtime at all: the
      // reader gets the source text and the warm job — which runs on a GitHub
      // runner with no such limits — translates it into D1 for the next visit.
      const chunks = chunkText(trimmed, 450);
      if (chunks.length > MAX_RUNTIME_CHUNKS) return null;
      const parts = await Promise.all(chunks.map((chunk) => translateChunk(env, chunk, sourceLang, targetLang)));
      result = parts.some((p) => p === null) ? null : parts.join(" ");
    }
    if (!result) {
      // Failure is transient now that Workers AI backs the chain — hold a
      // short-lived miss in the isolate memo only, NEVER persist "" to D1
      // (a stored failure marker is what used to freeze a page in Indonesian
      // forever). The next request retries and almost always succeeds.
      memSet(kvKey, "");
      return null;
    }
    memSet(kvKey, result);
    await mtDbPut(env, kvKey, result);
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

/**
 * Any run of Arabic script, including the marks and punctuation that belong to
 * it. Masked before translation and put back afterwards, untouched.
 *
 * This is not a nicety. Measured in the live cache: 232 Spanish rows had the
 * Arabic matn of a hadith DELETED and replaced with a Spanish pious phrase —
 * "si dios quiere", "Dios te bendiga" — because the translator recognised
 * "إن شاء الله" and rendered it. One row read:
 *
 *     De Tamim Ad-De … dijo:
 *     si dios quiere                     ← the words of the Prophet ﷺ, gone
 *     "La religión es un consejo …"
 *     Fuente: RRHH. Musulmán no. 55.     ← RRHH is the HR department
 *
 * The Qur'an and hadith are reproduced, never paraphrased by a machine. Masking
 * the script is the only way to guarantee that, because no prompt binds gtx and
 * the on-demand path uses it.
 *
 * ؀-ۿ Arabic, ݐ-ݿ supplement, ࢠ-ࣿ extended-A,
 * ﭐ-﷿ and ﹰ-﻿ presentation forms.
 */
const ARABIC_RUN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+(?:[\s؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]*[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿])?/g;

function maskProtected(text: string): { masked: string; map: string[] } {
  const map: string[] = [];
  // Arabic first: a run may contain a word the term list also matches, and the
  // script must win — reproducing it is stricter than transliterating it.
  const withArabic = text.replace(ARABIC_RUN, (m) => {
    const i = map.length;
    map.push(m);
    return `@@${i}@@`;
  });
  const masked = withArabic.replace(PROTECT_RE, (m) => {
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

  // One batched D1 read for the whole list (chunked internally) instead of N
  // parallel lookups — keeps a cold 100-item list well inside the per-request
  // budget. Keys not in the memo are gathered and fetched together.
  const keyByIdx = new Map<number, string>();
  const needDbKeys: string[] = [];
  texts.forEach((raw, idx) => {
    const trimmed = raw?.trim();
    if (!trimmed) return;
    const kvKey = `mt:${sourceLang}-${targetLang}:${hashKey(trimmed)}`;
    keyByIdx.set(idx, kvKey);
    const mem = memGet(kvKey);
    if (mem) out[idx] = mem;
    else if (mem === undefined) needDbKeys.push(kvKey);
  });
  const dbHits = await mtDbGetMany(env, needDbKeys);

  texts.forEach((raw, idx) => {
    const trimmed = raw?.trim();
    if (!trimmed || out[idx]) return;
    const kvKey = keyByIdx.get(idx)!;
    const hit = dbHits.get(kvKey);
    if (hit) {
      memSet(kvKey, hit);
      out[idx] = hit;
    } else {
      misses.push({ idx, text: trimmed.replace(/\s*\n\s*/g, " "), kvKey });
    }
  });

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

  const startedAt = Date.now();
  let usedBatches = 0;
  for (const batch of batches) {
    // Stay inside the request's resource budget — see the note above. Once the
    // budget is spent, the remaining misses simply render in the source
    // language instead of taking the whole page down with a 1102.
    if (usedBatches >= MAX_UPSTREAM_BATCHES || Date.now() - startedAt > UPSTREAM_DEADLINE_MS) break;
    usedBatches++;

    const joined = batch.map((m) => m.text).join("\n");
    const translated = await googleTranslate(joined, sourceLang, targetLang);
    const parts = translated?.split("\n").map((s) => s.trim()) ?? [];
    if (parts.length === batch.length) {
      const writes: { k: string; v: string }[] = [];
      batch.forEach((m, i) => {
        out[m.idx] = parts[i] || m.text;
        if (parts[i]) {
          memSet(m.kvKey, parts[i]!);
          writes.push({ k: m.kvKey, v: parts[i]! });
        }
      });
      await mtDbPutMany(env, writes);
    } else {
      // Batch upstream failed (null) or the split mismatched — never
      // mis-assign. Retry a BOUNDED slice one string at a time via the
      // reliable chain (Google → MyMemory → Workers AI); the rest serve source
      // and are picked up by the warm job. The cap is what keeps a cold cache
      // from fanning out into hundreds of inference subrequests.
      const retry = batch.slice(0, MAX_SINGLE_RETRIES);
      await Promise.all(
        retry.map(async (m) => {
          const t = await translateChunk(env, m.text, sourceLang, targetLang);
          out[m.idx] = t || m.text;
          if (t) {
            memSet(m.kvKey, t);
            await mtDbPut(env, m.kvKey, t);
          }
        })
      );
    }
  }

  // Anything still null (empty inputs already handled) falls back to source.
  return out.map((v, i) => v ?? texts[i]?.trim() ?? null);
}
