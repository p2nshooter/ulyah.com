import { Hono } from "hono";
import type { Env } from "../env.js";

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

// Murottal (Qur'an recitation) is no longer proxied/stored here — the
// frontend streams it directly from the reciter's own public CDN
// (apps/web/src/lib/qori-cdn.ts). Re-downloading every reciter's every ayah
// into R2 took hours per reciter to store a full copy of audio that already
// has a free public home; the browser's own HTTP cache is enough.

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
