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

// GET /audio/:qori/:surah/:ayah — stream murottal for one ayah
audioRoute.get("/:qori/:surah/:ayah", async (c) => {
  const qoriId = Number(c.req.param("qori"));
  const surah = Number(c.req.param("surah"));
  const ayahNum = Number(c.req.param("ayah"));

  const row = await c.env.DB.prepare(
    `SELECT ac.r2_key FROM audio_cache ac
     JOIN ayah a ON a.id = ac.ayah_id
     WHERE ac.qori_id = ? AND a.surah_id = ? AND a.number = ?`
  )
    .bind(qoriId, surah, ayahNum)
    .first<{ r2_key: string }>();

  if (!row) return c.json({ error: "Audio not available for this qori/ayah yet" }, 404);
  return streamR2Object(c, row.r2_key);
});

// GET /audio/queue/:surah?qori= — ordered playlist for auto-next mode (§6.3)
audioRoute.get("/queue/:surah", async (c) => {
  const surah = Number(c.req.param("surah"));
  const qoriId = Number(c.req.query("qori") ?? "1");

  const { results } = await c.env.DB.prepare(
    `SELECT a.number, ac.r2_key, ac.duration
     FROM ayah a
     LEFT JOIN audio_cache ac ON ac.ayah_id = a.id AND ac.qori_id = ?
     WHERE a.surah_id = ?
     ORDER BY a.number`
  )
    .bind(qoriId, surah)
    .all();

  return c.json({
    surah,
    qori_id: qoriId,
    queue: results.map((r: any) => ({
      number: r.number,
      url: r.r2_key ? `/audio/${qoriId}/${surah}/${r.number}` : null,
      duration: r.duration,
    })),
  });
});

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
