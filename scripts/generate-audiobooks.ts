/**
 * Turns every published article (kisah, Tadabbur, ebook text) into a real,
 * downloadable MP3 audiobook.
 *
 * Runs OUTSIDE the Worker (GitHub Actions / local) so long articles aren't
 * bound by Worker CPU/subrequest limits. For each published story that has no
 * audio yet it synthesises narration with an OpenAI-compatible Text-to-Speech
 * endpoint, uploads the MP3 to R2, and points `stories.audio_r2_key` at it so
 * the site serves it as a downloadable audiobook (`/content/stories/:id/audio`).
 *
 * The TTS endpoint is fully configurable so the donated multilingual key is
 * used, never hardcoded:
 *   TTS_API_KEY   (required)  — e.g. the NVIDIA chatterbox-multilingual key
 *   TTS_BASE_URL  (optional)  — default https://integrate.api.nvidia.com/v1
 *   TTS_MODEL     (optional)  — default "chatterbox-multilingual-tts"
 *   TTS_VOICE     (optional)  — default "alloy"
 * Point these at NVIDIA, ElevenLabs, or any OpenAI-compatible /audio/speech.
 *
 * Idempotent: articles that already have audio are skipped, and each story's
 * audio_r2_key is written immediately after upload, so a crash mid-run never
 * loses finished work.
 *
 * Usage:
 *   TTS_API_KEY=... npx tsx scripts/generate-audiobooks.ts --lang=id --limit=20
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TTS_BASE_URL = process.env.TTS_BASE_URL || "https://integrate.api.nvidia.com/v1";
const TTS_MODEL = process.env.TTS_MODEL || "chatterbox-multilingual-tts";
const TTS_VOICE = process.env.TTS_VOICE || "alloy";
const TTS_API_KEY = process.env.TTS_API_KEY || "";
const BUCKET = process.env.R2_BUCKET_NAME || "ulyah-media";
const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    lang: (args.lang as string) || "",
    limit: Number(args.limit ?? "25"),
  };
}

/** Run a wrangler command, retrying transient Cloudflare 5xx blips. */
function wrangler(argv: string[], capture = false): string {
  for (let i = 0; i < 5; i++) {
    try {
      return execFileSync("npx", ["wrangler", ...argv], {
        cwd: WORKER_CWD,
        stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
      });
    } catch (err) {
      if (i === 4) throw err;
      execFileSync("sleep", [String(3 * 2 ** i)]);
    }
  }
  return "";
}

interface StoryRow {
  id: number;
  lang: string;
  title: string;
  body: string;
}

/** Query published stories missing audio via `wrangler d1 execute --json`. */
function fetchPendingStories(lang: string, limit: number): StoryRow[] {
  const where = [
    "status = 'published'",
    "(audio_r2_key IS NULL OR audio_r2_key = '')",
    "length(body) > 40",
  ];
  if (lang) where.push(`lang = '${lang.replace(/'/g, "")}'`);
  const sql = `SELECT id, lang, title, body FROM stories WHERE ${where.join(" AND ")} ORDER BY id LIMIT ${limit};`;
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], true);
  try {
    const parsed = JSON.parse(out);
    const results = Array.isArray(parsed) ? parsed[0]?.results : parsed?.results;
    return (results ?? []) as StoryRow[];
  } catch {
    console.error("Could not parse d1 --json output");
    return [];
  }
}

/** Split text into TTS-sized chunks at sentence boundaries. */
function chunk(text: string, maxLen = 1600): string[] {
  const sentences = text.split(/(?<=[.!?؟。！\n])\s+/);
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + " " + s).length > maxLen && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur += (cur ? " " : "") + s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

async function synthesizeChunk(text: string, lang: string): Promise<Buffer | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${TTS_BASE_URL}/audio/speech`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${TTS_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          model: TTS_MODEL,
          input: text,
          voice: TTS_VOICE,
          language: lang,
          response_format: "mp3",
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`TTS HTTP ${res.status}: ${body.slice(0, 200)}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 100) throw new Error("suspiciously small audio");
      return buf;
    } catch (err) {
      console.warn(`  TTS attempt ${attempt + 1} failed: ${err}`);
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return null;
}

async function main() {
  if (!TTS_API_KEY) {
    console.error("TTS_API_KEY is required (set it as a GitHub secret — never hardcoded).");
    process.exit(1);
  }
  const { lang, limit } = parseArgs();
  const stories = fetchPendingStories(lang, limit);
  console.log(`Found ${stories.length} article(s) needing audiobooks${lang ? ` [${lang}]` : ""}.`);

  const tmp = mkdtempSync(join(tmpdir(), "ulyah-tts-"));
  let done = 0;

  for (const story of stories) {
    console.log(`\n▶ #${story.id} [${story.lang}] ${story.title}`);
    const parts = chunk(story.body);
    const buffers: Buffer[] = [];
    let failed = false;

    for (let i = 0; i < parts.length; i++) {
      const audio = await synthesizeChunk(parts[i]!, story.lang);
      if (!audio) {
        console.warn(`  chunk ${i + 1}/${parts.length} failed — skipping this article for now`);
        failed = true;
        break;
      }
      buffers.push(audio);
      process.stdout.write(`  ${i + 1}/${parts.length}\r`);
    }
    if (failed || buffers.length === 0) continue;

    // MP3 frames concatenate cleanly for playback.
    const mp3 = Buffer.concat(buffers);
    const localPath = join(tmp, `story-${story.id}.mp3`);
    writeFileSync(localPath, mp3);

    const r2Key = `audio/story/${story.id}.mp3`;
    wrangler(["r2", "object", "put", `${BUCKET}/${r2Key}`, `--file=${localPath}`, "--remote"]);
    rmSync(localPath);

    // Point the article at its audiobook + mark audio published — done per
    // story so a mid-run crash never loses finished audio.
    const upd = `UPDATE stories SET audio_r2_key = '${r2Key}', qc_status = 'published' WHERE id = ${story.id};`;
    wrangler(["d1", "execute", "ulyah-db", "--remote", `--command=${upd}`]);
    done++;
    console.log(`  ✓ audiobook uploaded (${(mp3.length / 1024).toFixed(0)} KB)`);
  }

  rmSync(tmp, { recursive: true, force: true });
  console.log(`\nDone. ${done} audiobook(s) generated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
