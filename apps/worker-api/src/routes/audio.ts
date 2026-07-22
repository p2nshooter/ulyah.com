import { Hono } from "hono";
import type { Env } from "../env.js";
import { MUROTTAL_SOURCES, sourceUrlCandidates } from "../lib/murottal-sources.js";

export const audioRoute = new Hono<{ Bindings: Env }>();

/** Streams an R2 object with HTTP Range support (needed for audio seeking). */
async function streamR2Object(c: any, key: string) {
  const range = c.req.header("range");
  const options: R2GetOptions = {};

  if (range) {
    const match = /bytes=(\d+)-(\d*)/.exec(range);
    if (match) {
      const start = Number(match[1]);
      const end = match[2] ? Number(match[2]) : undefined;
      options.range = end !== undefined ? { offset: start, length: end - start + 1 } : { offset: start };
    }
  }

  const obj = await c.env.MEDIA_R2.get(key, options);
  if (!obj) return c.json({ error: "Audio not found" }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("accept-ranges", "bytes");
  headers.set("cache-control", "public, max-age=31536000, immutable");

  if (range && "range" in obj) {
    const r2Range = (obj as any).range;
    const total = obj.size;
    const start = r2Range?.offset ?? 0;
    const length = r2Range?.length ?? total - start;
    headers.set("content-range", `bytes ${start}-${start + length - 1}/${total}`);
    return new Response(obj.body, { status: 206, headers });
  }

  return new Response(obj.body, { status: 200, headers });
}

// ── Murottal from R2 (owner: R2 is the PRIMARY player source) ─────────────
//
// GET /audio/qori2/:folder/:file  (file = <SSS><AAA>.mp3)
//
// Serves the self-hosted murottal library: radio, per-ayah Qur'an reader and
// Mushaf Utsmani all point here first (apps/web/src/lib/qori-cdn.ts). Three
// tiers keep it fast and self-completing:
//   1. Cloudflare edge cache (per-colo, free) — repeat plays of the same ayah
//      in a colo never touch R2 at all;
//   2. R2 — the permanent library (filled by the bulk importer and by tier 3);
//   3. source-CDN fill — an R2 miss transparently fetches the 128 kbps file
//      from the reciter's own CDN, streams it to the listener AND stores it
//      into R2 + audio_cache in the background, so every gap heals itself the
//      first time anyone plays it. Playback is never blocked on the import
//      workflow finishing.
//
// WHY "qori2": the ORIGINAL audio/qori/ library was filled before the
// 128 kbps importer fixes (#93/#94), so a large share of it is low-bitrate,
// muffled audio ("mendem, kaya kaset kusut"). Serving R2-first from that
// prefix made the muffled files the PRIMARY source — and worse, they were
// then stamped into edge and browser caches with a one-year immutable
// Cache-Control. Bytes behind an immutable URL can never be repaired in
// place; only a NEW URL escapes every stale cache. audio/qori2/ is that
// clean-slate library: HiFi-only from day one, self-healing at 128 kbps.
// The legacy prefix is purged in the background (see index.ts scheduled).
const MUROTTAL_PREFIX = "audio/qori2/";

async function serveMurottal(c: any, folder: string, file: string) {
  if (!MUROTTAL_SOURCES[folder] || !/^\d{6}\.mp3$/.test(file)) {
    return c.json({ error: "Unknown murottal path" }, 404);
  }
  const surah = Number(file.slice(0, 3));
  const ayah = Number(file.slice(3, 6));
  const key = `${MUROTTAL_PREFIX}${folder}/${file}`;

  const rangeHeader = c.req.header("range");
  const rangeStart = rangeHeader ? Number(/bytes=(\d+)-/.exec(rangeHeader)?.[1] ?? 0) : 0;
  // The files are one-ayah MP3s (tiny). Only a nonzero-offset seek needs a
  // real 206; a plain load or a bytes=0- probe is happily served the full
  // 200 body, which lets the edge cache carry the hot path.
  const cacheable = rangeStart === 0;
  const cache = (caches as unknown as { default: Cache }).default;
  // Canonical cache key on the qori2 URL no matter which route matched — the
  // legacy /audio/qori/ alias must never read the poisoned low-bitrate
  // entries cached under its own URL.
  const canonical = new URL(c.req.url);
  canonical.pathname = `/audio/qori2/${folder}/${file}`;
  canonical.search = "";
  const cacheKey = new Request(canonical.toString(), { method: "GET" });

  if (cacheable) {
    const hit = await cache.match(cacheKey).catch(() => undefined);
    if (hit) {
      const res = new Response(hit.body, hit);
      res.headers.set("X-Murottal-Source", "edge");
      return res;
    }
  }

  const audioHeaders = () => {
    const h = new Headers();
    h.set("content-type", "audio/mpeg");
    h.set("accept-ranges", "bytes");
    h.set("cache-control", "public, max-age=31536000, immutable");
    // Audio is public and non-credentialed — let every sibling domain play it.
    h.set("access-control-allow-origin", "*");
    return h;
  };

  // Tier 2 — R2.
  const options: R2GetOptions = {};
  if (rangeStart > 0) options.range = { offset: rangeStart };
  const obj = await c.env.MEDIA_R2.get(key, options).catch(() => null);
  if (obj) {
    const headers = audioHeaders();
    headers.set("etag", obj.httpEtag);
    headers.set("X-Murottal-Source", "r2");
    if (rangeStart > 0) {
      const total = obj.size;
      headers.set("content-range", `bytes ${rangeStart}-${total - 1}/${total}`);
      return new Response(obj.body, { status: 206, headers });
    }
    const res = new Response(obj.body, { status: 200, headers });
    const [toClient, toEdge] = res.body!.tee();
    c.executionCtx.waitUntil(
      cache.put(cacheKey, new Response(toEdge, { status: 200, headers: new Headers(headers) })).catch(() => {})
    );
    return new Response(toClient, { status: 200, headers });
  }

  // Tier 3 — fill from the source CDN (highest bitrate first), serve it now,
  // and persist to R2 + audio_cache in the background.
  let buf: ArrayBuffer | null = null;
  for (const url of sourceUrlCandidates(folder, surah, ayah)) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "ulyah.com murottal" } });
      if (res.ok) {
        const b = await res.arrayBuffer();
        if (b.byteLength > 2000) {
          buf = b;
          break;
        }
      }
    } catch {
      /* try the next bitrate/source */
    }
  }
  if (!buf) return c.json({ error: "Audio not found" }, 404);

  const bytes = buf;
  c.executionCtx.waitUntil(
    (async () => {
      await c.env.MEDIA_R2.put(key, bytes, { httpMetadata: { contentType: "audio/mpeg" } }).catch(() => {});
      // Catalog row so the importer/admin can see true completeness; the
      // subselects resolve ids without an extra read round-trip.
      // Upsert: a legacy low-bitrate row for this (ayah, qori) must not block
      // recording the fresh HiFi key.
      await c.env.DB.prepare(
        `INSERT INTO audio_cache (ayah_id, qori_id, r2_key)
         SELECT a.id, q.id, ?3 FROM ayah a, qori q
         WHERE a.surah_id = ?1 AND a.number = ?2 AND q.audio_base_path = ?4
         ON CONFLICT(ayah_id, qori_id) DO UPDATE SET r2_key = excluded.r2_key`
      )
        .bind(surah, ayah, key, `audio/qori/${folder}`)
        .run()
        .catch(() => {});
    })()
  );

  const headers = audioHeaders();
  headers.set("X-Murottal-Source", "cdn-fill");
  if (rangeStart > 0) {
    const total = bytes.byteLength;
    const body = bytes.slice(rangeStart);
    headers.set("content-range", `bytes ${rangeStart}-${total - 1}/${total}`);
    return new Response(body, { status: 206, headers });
  }
  c.executionCtx.waitUntil(cache.put(cacheKey, new Response(bytes.slice(0), { status: 200, headers: new Headers(headers) })).catch(() => {}));
  return new Response(bytes, { status: 200, headers });
}

// Canonical HiFi route.
audioRoute.get("/qori2/:folder/:file", (c) => serveMurottal(c, c.req.param("folder"), c.req.param("file")));
// Legacy alias — old cached pages/JS keep working, but they too are served
// the fresh HiFi bytes (never the poisoned legacy library).
audioRoute.get("/qori/:folder/:file", (c) => serveMurottal(c, c.req.param("folder"), c.req.param("file")));

// CORS preflight for the audio paths (some browsers preflight crossorigin
// media fetches).
const murottalPreflight = (c: any) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Range");
  return c.body(null, 204);
};
audioRoute.options("/qori2/:folder/:file", murottalPreflight);
audioRoute.options("/qori/:folder/:file", murottalPreflight);

// GET /audio/story/:id — stream kisah/hikmah narration (TTS or recorded)
audioRoute.get("/story/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const story = await c.env.DB.prepare("SELECT audio_r2_key, qc_status FROM stories WHERE id = ?")
    .bind(id)
    .first<{ audio_r2_key: string | null; qc_status: string }>();

  if (!story?.audio_r2_key) return c.json({ error: "Story audio not available" }, 404);
  if (story.qc_status !== "published") return c.json({ error: "Story audio pending QC review" }, 403);

  return streamR2Object(c, story.audio_r2_key);
});
