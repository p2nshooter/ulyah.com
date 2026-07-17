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
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
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

function toMp3(wavPath: string, mp3Path: string): boolean {
  try {
    execFileSync("ffmpeg", ["-y", "-i", wavPath, "-codec:a", "libmp3lame", "-qscale:a", "4", mp3Path], {
      stdio: "inherit",
    });
    return existsSync(mp3Path);
  } catch (err) {
    console.warn(`  ffmpeg failed: ${err}`);
    return false;
  }
}

async function main() {
  const { lang, limit } = parseArgs();
  const stories = fetchPendingStories(lang, limit);
  console.log(`Found ${stories.length} article(s) needing audiobooks${lang ? ` [${lang}]` : ""}.`);

  const tmp = mkdtempSync(join(tmpdir(), "ulyah-tts-"));
  let done = 0;

  for (const story of stories) {
    console.log(`\n▶ #${story.id} [${story.lang}] ${story.title}`);
    const wav = synthesizeWav(story.body, story.lang, tmp);
    if (!wav) {
      console.warn("  synthesis failed — skipping");
      continue;
    }
    const mp3Path = join(tmp, `story-${story.id}.mp3`);
    if (!toMp3(wav, mp3Path)) continue;

    const r2Key = `audio/story/${story.id}.mp3`;
    wrangler(["r2", "object", "put", `${BUCKET}/${r2Key}`, `--file=${mp3Path}`, "--remote"]);
    rmSync(mp3Path, { force: true });
    rmSync(wav, { force: true });

    const upd = `UPDATE stories SET audio_r2_key = '${r2Key}', qc_status = 'published' WHERE id = ${story.id};`;
    wrangler(["d1", "execute", "ulyah-db", "--remote", `--command=${upd}`]);
    done++;
    console.log(`  ✓ audiobook uploaded`);
  }

  rmSync(tmp, { recursive: true, force: true });
  console.log(`\nDone. ${done} audiobook(s) generated (no API key used).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
