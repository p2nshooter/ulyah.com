/**
 * Turns every published article (kisah, Tadabbur, hadith articles, ebook text)
 * into a real, downloadable MP3 audiobook — with NO API key of any kind.
 *
 * Synthesis is done by fully-offline, open-source engines installed on the
 * runner:
 *   • Piper (neural, natural voices) where a voice model exists for the
 *     language — highest quality, MIT-licensed, runs on CPU.
 *   • eSpeak-NG as the universal fallback — covers every language the site
 *     uses (Indonesian, Arabic, Russian, German, French, Chinese, Japanese,
 *     English), guaranteed to be available.
 * Output is converted to MP3 with ffmpeg. No third-party service, no key, no
 * copyright: the audio is generated from the site's own text.
 *
 * Runs OUTSIDE the Worker (GitHub Actions / local) so long articles aren't
 * bound by Worker limits. Idempotent: articles that already have audio are
 * skipped, and each story's audio_r2_key is written right after upload so a
 * crash mid-run never loses finished work.
 *
 * Usage (deps: espeak-ng, ffmpeg; optional piper + voices in ./voices):
 *   npx tsx scripts/generate-audiobooks.ts --lang=id --limit=25
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BUCKET = process.env.R2_BUCKET_NAME || "ulyah-media";
const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const VOICES_DIR = process.env.PIPER_VOICES_DIR || join(import.meta.dirname, "..", "voices");
const PIPER_BIN = process.env.PIPER_BIN || "piper";

// Preferred Piper voice model per language (downloaded best-effort by the
// workflow). If the model file is absent the script falls back to eSpeak-NG,
// so a missing model never breaks a run.
const PIPER_MODEL: Record<string, string> = {
  en: "en_US-lessac-medium.onnx",
  ar: "ar_JO-kareem-medium.onnx",
  ru: "ru_RU-dmitri-medium.onnx",
  de: "de_DE-thorsten-medium.onnx",
  fr: "fr_FR-siwis-medium.onnx",
  zh: "zh_CN-huayan-medium.onnx",
};

// eSpeak-NG voice code per language — the guaranteed universal fallback.
const ESPEAK_VOICE: Record<string, string> = {
  id: "id",
  en: "en-us",
  ru: "ru",
  de: "de",
  fr: "fr",
  ar: "ar",
  zh: "cmn",
  ja: "ja",
};

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return { lang: (args.lang as string) || "", limit: Number(args.limit ?? "25") };
}

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

function fetchPendingStories(lang: string, limit: number): StoryRow[] {
  const where = ["status = 'published'", "(audio_r2_key IS NULL OR audio_r2_key = '')", "length(body) > 40"];
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

/** Synthesize one article to a WAV file using Piper if a model exists for the
 * language, otherwise eSpeak-NG. Returns the wav path or null on failure. */
function synthesizeWav(text: string, lang: string, tmp: string): string | null {
  const textPath = join(tmp, "in.txt");
  const wavPath = join(tmp, "out.wav");
  writeFileSync(textPath, text);

  const model = PIPER_MODEL[lang] ? join(VOICES_DIR, PIPER_MODEL[lang]!) : null;
  if (model && existsSync(model)) {
    try {
      // piper reads text from stdin, writes a WAV.
      execFileSync("bash", ["-c", `cat ${JSON.stringify(textPath)} | ${PIPER_BIN} --model ${JSON.stringify(model)} --output_file ${JSON.stringify(wavPath)}`], {
        stdio: "inherit",
      });
      if (existsSync(wavPath)) return wavPath;
    } catch (err) {
      console.warn(`  piper failed (${lang}), falling back to espeak-ng: ${err}`);
    }
  }

  const voice = ESPEAK_VOICE[lang] ?? "en-us";
  try {
    // -s 150 wpm (calm pace), -p 40 slightly lower pitch for a warmer tone.
    execFileSync("espeak-ng", ["-v", voice, "-s", "150", "-p", "40", "-f", textPath, "-w", wavPath], {
      stdio: "inherit",
    });
    if (existsSync(wavPath)) return wavPath;
  } catch (err) {
    console.warn(`  espeak-ng failed (${lang}): ${err}`);
  }
  return null;
}

// Wrangler rejects R2 uploads over 300 MiB, so every MP3 must land safely
// under that. Speech tolerates low bitrates well; pick one from the actual
// duration so even a 9-hour story fits, and shrink further if the estimate
// was off.
const MAX_UPLOAD_BYTES = 280 * 1024 * 1024;

function wavDurationSeconds(wavPath: string): number {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", wavPath],
      { encoding: "utf8" }
    );
    const dur = parseFloat(out.trim());
    return Number.isFinite(dur) && dur > 0 ? dur : 0;
  } catch {
    return 0;
  }
}

function encodeMp3(wavPath: string, mp3Path: string, kbps: number): boolean {
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-i", wavPath, "-codec:a", "libmp3lame", "-b:a", `${kbps}k`, "-ac", "1", "-ar", "22050", mp3Path],
      { stdio: "inherit" }
    );
    return existsSync(mp3Path);
  } catch (err) {
    console.warn(`  ffmpeg failed: ${err}`);
    return false;
  }
}

function toMp3(wavPath: string, mp3Path: string): boolean {
  const duration = wavDurationSeconds(wavPath);
  // Fit the whole story under the upload cap; 96k mono is plenty for speech.
  let kbps = duration > 0 ? Math.min(96, Math.floor((MAX_UPLOAD_BYTES * 8) / duration / 1000)) : 64;
  kbps = Math.max(kbps, 24);
  for (;;) {
    if (!encodeMp3(wavPath, mp3Path, kbps)) return false;
    const size = statSync(mp3Path).size;
    if (size <= MAX_UPLOAD_BYTES) return true;
    if (kbps <= 24) {
      console.warn(`  still ${(size / 1024 / 1024).toFixed(0)} MiB at ${kbps}kbps — skipping story`);
      return false;
    }
    kbps = Math.max(24, Math.floor(kbps / 2));
    console.warn(`  re-encoding at ${kbps}kbps to fit the 300 MiB upload limit`);
  }
}

async function main() {
  const { lang, limit } = parseArgs();
  const stories = fetchPendingStories(lang, limit);
  console.log(`Found ${stories.length} article(s) needing audiobooks${lang ? ` [${lang}]` : ""}.`);

  const tmp = mkdtempSync(join(tmpdir(), "ulyah-tts-"));
  let done = 0;

  let failed = 0;

  for (const story of stories) {
    console.log(`\n▶ #${story.id} [${story.lang}] ${story.title}`);
    try {
      const wav = synthesizeWav(story.body, story.lang, tmp);
      if (!wav) {
        console.warn("  synthesis failed — skipping");
        failed++;
        continue;
      }
      const mp3Path = join(tmp, `story-${story.id}.mp3`);
      if (!toMp3(wav, mp3Path)) {
        rmSync(wav, { force: true });
        failed++;
        continue;
      }

      const r2Key = `audio/story/${story.id}.mp3`;
      wrangler(["r2", "object", "put", `${BUCKET}/${r2Key}`, `--file=${mp3Path}`, "--remote"]);
      rmSync(mp3Path, { force: true });
      rmSync(wav, { force: true });

      const upd = `UPDATE stories SET audio_r2_key = '${r2Key}', qc_status = 'published' WHERE id = ${story.id};`;
      wrangler(["d1", "execute", "ulyah-db", "--remote", `--command=${upd}`]);
      done++;
      console.log(`  ✓ audiobook uploaded`);
    } catch (err) {
      // One broken story must never sink the whole nightly run — the rest of
      // the queue still deserves its audio.
      failed++;
      console.warn(`  ✗ story #${story.id} failed: ${err}`);
    }
  }

  rmSync(tmp, { recursive: true, force: true });
  console.log(`\nDone. ${done} audiobook(s) generated, ${failed} skipped (no API key used).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
