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

// ── Al-Qur'an Kids audio (hijaiyah letters + Iqro base syllables) ──────────
// GET /audio/kids/:code — the real recorded audio for one kids slot, uploaded
// or recorded from the admin "Al-Qur'an Kids" console. Returns 404 when a slot
// has no recording yet, so the kids page falls back to an Arabic voice.
audioRoute.get("/kids/:code", async (c) => {
  const code = c.req.param("code");
  if (!/^(h-\d{1,2}|s-\d{1,2}-[aiu])$/.test(code)) return c.json({ error: "bad code" }, 400);
  const row = await c.env.DB.prepare("SELECT r2_key FROM kids_audio WHERE code = ?")
    .bind(code)
    .first<{ r2_key: string }>();
  if (!row) return c.json({ error: "not found" }, 404);
  return streamR2Object(c, row.r2_key);
});

// ── Murottal: a redirect to the reciter's CDN ─────────────────────────────
//
// GET /audio/qori2/:folder/:file  (file = <SSS><AAA>.mp3)
//
// Owner: "hilangin audio2 alquran murottal ganti dengan cdn." We keep no
// recitation of our own any more. This route used to BE the library — R2 first,
// filled by a bulk importer and topped up from real listening — and the players
// asked it before anything else. Now the players go straight to the reciter's
// CDN (apps/web/src/lib/qori-cdn.ts) and this URL answers 302 to the same file.
//
// Why keep it at all, rather than delete the route:
//   · every page, bookmark and cached JS bundle from the R2 era still asks for
//     this URL, and a 404 is a silent player;
//   · it is the one per-ayah URL that resolves from a pure formula for the
//     alquran.cloud reciters, whose direct URL otherwise needs a metadata
//     lookup — so the web player keeps it as the backstop behind the CDN.
//
// A redirect costs the Worker no bytes, no R2 read, no D1 write and no storage:
// the listener fetches from the CDN, with its Range handling and its own edge.
// The legacy /audio/qori/ alias points here too, so the poisoned low-bitrate
// objects from the old library can never be served again by either path.
const MUROTTAL_CACHE_SECONDS = 86400;

function serveMurottal(c: any, folder: string, file: string) {
  if (!MUROTTAL_SOURCES[folder] || !/^\d{6}\.mp3$/.test(file)) {
    return c.json({ error: "Unknown murottal path" }, 404);
  }
  const surah = Number(file.slice(0, 3));
  const ayah = Number(file.slice(3, 6));

  // Candidates are ordered best-bitrate-first; the top one is what the
  // importer used to store, so a listener gets exactly the audio the library
  // would have held.
  const url = sourceUrlCandidates(folder, surah, ayah)[0];
  if (!url) return c.json({ error: "Audio not found" }, 404);

  // A hand-built Response, not c.redirect(): Hono's helper takes a location and
  // a status and nothing else, so the cache and CORS headers below would have
  // been dropped on the floor — silently, because `c` is untyped here.
  //
  // 302, not 301: which CDN and which bitrate answers for a reciter is a
  // decision we may revisit (a source going quiet is the reason the R2 mirror
  // existed), and a permanent redirect cached in browsers would outlive it.
  // A day of freshness is plenty to keep the hop off the hot path.
  return new Response(null, {
    status: 302,
    headers: {
      location: url,
      "cache-control": `public, max-age=${MUROTTAL_CACHE_SECONDS}`,
      // The redirect itself is cross-origin readable; the audio bytes carry the
      // CDN's own CORS headers, which is what a crossorigin player reads.
      "access-control-allow-origin": "*",
      "X-Murottal-Source": "cdn-redirect",
    },
  });
}

// Canonical HiFi route.
audioRoute.get("/qori2/:folder/:file", (c) => serveMurottal(c, c.req.param("folder"), c.req.param("file")));
// Legacy alias — old cached pages/JS keep working, and they are redirected to
// the same CDN file, so the poisoned low-bitrate objects the old library held
// under this prefix can never be served again.
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
