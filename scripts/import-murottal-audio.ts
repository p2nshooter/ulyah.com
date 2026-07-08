/**
 * Imports real Qur'an recitation audio from EveryAyah.com — explicitly
 * licensed for non-commercial redistribution (arsitektur doc §10.1) — into
 * the R2 bucket + `audio_cache` table.
 *
 * This CANNOT run inside the Claude Code build sandbox: that environment
 * only allows outbound traffic to package registries (npm/pypi/github), not
 * arbitrary hosts like everyayah.com. It is written to run in an
 * environment with normal internet access — e.g. `workflow_dispatch` in
 * .github/workflows/import-audio.yml, or locally with `wrangler login`.
 *
 * Usage:
 *   npx tsx scripts/import-murottal-audio.ts --qori=alafasy --surah=1-5
 *   npx tsx scripts/import-murottal-audio.ts --qori=sudais --surah=1
 *
 * Requires `wrangler` to already be authenticated (CLOUDFLARE_API_TOKEN /
 * `wrangler login`) with access to the `ulyah-db` D1 database and the
 * MEDIA_R2 bucket — same credentials the deploy workflow uses.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface QoriDef {
  id: number; // matches packages/db-schema/migrations/0002_seed_static.sql
  everyAyahDir: string;
}

// EveryAyah.com folder-name convention for each qori. Extend as needed —
// full catalogue: https://everyayah.com/data/status.php
const QORI: Record<string, QoriDef> = {
  alafasy: { id: 1, everyAyahDir: "Alafasy_128kbps" },
  sudais: { id: 2, everyAyahDir: "Abdurrahmaan_As-Sudais_192kbps" },
  ghamdi: { id: 3, everyAyahDir: "Saad_Al_Ghamidi_64kbps" },
  husary: { id: 4, everyAyahDir: "Husary_128kbps" },
};

// surah_id -> ayah_count (114 entries). Needed to know how many files to
// request per surah without an extra network round-trip.
const AYAH_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77,
  227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62,
  55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19,
  36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  const qoriKey = (args.qori as string) ?? "alafasy";
  const qori = QORI[qoriKey];
  if (!qori) throw new Error(`Unknown --qori=${qoriKey}. Options: ${Object.keys(QORI).join(", ")}`);

  const range = ((args.surah as string) ?? "1-114").split("-").map(Number);
  const [start, end] = range.length === 2 ? range : [range[0]!, range[0]!];
  return { qori, qoriKey, start: start!, end: end ?? start! };
}

async function fetchWithRetry(url: string, retries = 3): Promise<ArrayBuffer | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.arrayBuffer();
    } catch (err) {
      if (i === retries - 1) {
        console.warn(`  failed after ${retries} attempts: ${url} (${err})`);
        return null;
      }
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

async function main() {
  const { qori, qoriKey, start, end } = parseArgs();
  const tmpDir = mkdtempSync(join(tmpdir(), "ulyah-audio-"));
  const sqlInserts: string[] = [];

  console.log(`Importing ${qoriKey} (qori_id=${qori.id}) for surah ${start}-${end}...`);

  for (let surah = start; surah <= end; surah++) {
    const ayahCount = AYAH_COUNTS[surah - 1];
    if (!ayahCount) continue;

    for (let ayah = 1; ayah <= ayahCount; ayah++) {
      const fileName = `${String(surah).padStart(3, "0")}${String(ayah).padStart(3, "0")}.mp3`;
      const url = `https://everyayah.com/data/${qori.everyAyahDir}/${fileName}`;
      const r2Key = `audio/qori/${qoriKey}/${fileName}`;

      const buf = await fetchWithRetry(url);
      if (!buf) continue;

      const localPath = join(tmpDir, fileName);
      writeFileSync(localPath, Buffer.from(buf));

      const bucket = process.env.R2_BUCKET_NAME || "ulyah-media";
      execFileSync(
        "npx",
        ["wrangler", "r2", "object", "put", `${bucket}/${r2Key}`, `--file=${localPath}`, "--remote"],
        { cwd: join(import.meta.dirname, "..", "apps", "worker-api"), stdio: "inherit" }
      );
      rmSync(localPath);

      sqlInserts.push(
        `INSERT INTO audio_cache (ayah_id, qori_id, r2_key) SELECT id, ${qori.id}, '${r2Key}' FROM ayah WHERE surah_id = ${surah} AND number = ${ayah} ON CONFLICT (ayah_id, qori_id) DO UPDATE SET r2_key = excluded.r2_key;`
      );

      await new Promise((r) => setTimeout(r, 50)); // be polite to everyayah.com
    }

    // Flush audio_cache rows to D1 after EVERY surah so a timeout/crash
    // mid-run never loses the index for already-uploaded audio — re-runs
    // are idempotent (upsert + r2 overwrite).
    if (sqlInserts.length > 0) {
      const sqlFile = join(tmpDir, `audio_cache_${surah}.sql`);
      writeFileSync(sqlFile, sqlInserts.join("\n"));
      execFileSync("npx", ["wrangler", "d1", "execute", "ulyah-db", "--remote", `--file=${sqlFile}`], {
        cwd: join(import.meta.dirname, "..", "apps", "worker-api"),
        stdio: "inherit",
      });
      rmSync(sqlFile);
      sqlInserts.length = 0;
    }
    console.log(`  surah ${surah}: done (${ayahCount} ayat)`);
  }

  rmSync(tmpDir, { recursive: true, force: true });
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
