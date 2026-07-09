/**
 * Fetches real tafsir (Indonesian: Tafsir As-Sa'di; English: Tafsir Ibn
 * Kathir) and asbabun nuzul (English: Al-Wahidi) from spa5k/tafsir_api on
 * GitHub — a static mirror of quran.com's tafsir API, CC-licensed classical
 * texts — and writes packages/db-schema/seed/tafsir.sql +
 * asbabun_nuzul.sql. Fills the near-total gap (2 tafsir rows, 1 asbabun_nuzul
 * row) that left the Qur'an reader's "Ringkasan Ayat Ini" panel empty for
 * effectively every ayah.
 *
 * Usage: npx tsx scripts/generate-tafsir-seed.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir";

const AYAH_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77,
  227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62,
  55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19,
  36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];
const SURAH_START_ID: number[] = (() => {
  const starts: number[] = [];
  let acc = 1;
  for (const n of AYAH_COUNTS) {
    starts.push(acc);
    acc += n;
  }
  return starts;
})();

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

async function fetchSurahRaw(edition: string, surah: number, retries = 4): Promise<unknown | null> {
  const url = `${BASE}/${edition}/${surah}.json`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
    }
  }
  return null;
}

interface Job {
  edition: string;
  lang: string;
  source: string;
  table: "tafsir" | "asbabun_nuzul";
  outFile: string;
  minLen: number;
  // Different editions on spa5k/tafsir_api use different per-surah JSON
  // shapes — tafsir editions are a flat array (index = ayah - 1), the
  // asbab edition is `{ayahs: [{ayah, surah, text}], empty_ayahs: [...]}`
  // since most ayat have no specific narrated occasion of revelation.
  parse: (raw: unknown, startId: number) => { ayahId: number; text: string }[];
}

function flatArrayParser(raw: unknown, startId: number): { ayahId: number; text: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry, idx) => ({ ayahId: startId + idx, text: String((entry as { text?: string })?.text ?? "").trim() }));
}

function asbabParser(raw: unknown, startId: number): { ayahId: number; text: string }[] {
  const ayahs = (raw as { ayahs?: { ayah: number; text: string }[] })?.ayahs ?? [];
  return ayahs.map((a) => ({ ayahId: startId + (a.ayah - 1), text: String(a.text ?? "").trim() }));
}

// One file per edition, not merged — a combined tafsir file came out to
// ~107MB, over GitHub's 100MB hard per-file limit.
const JOBS: Job[] = [
  { edition: "id-tafsir-as-saadi", lang: "id", source: "Tafsir As-Sa'di", table: "tafsir", outFile: "tafsir_id.sql", minLen: 20, parse: flatArrayParser },
  { edition: "en-tafisr-ibn-kathir", lang: "en", source: "Tafsir Ibn Kathir", table: "tafsir", outFile: "tafsir_en.sql", minLen: 20, parse: flatArrayParser },
  {
    edition: "en-asbab-al-nuzul-by-al-wahidi",
    lang: "en",
    source: "Asbab An-Nuzul by Al-Wahidi",
    table: "asbabun_nuzul",
    outFile: "asbabun_nuzul.sql",
    minLen: 40,
    parse: asbabParser,
  },
];

// D1/SQLite rejects an overlong single statement (SQLITE_TOOBIG) — a fixed
// 500-row batch worked fine for short hadith text but blew past the limit
// for full tafsir paragraphs (~10KB/row average, some much longer). Batch
// by accumulated byte size instead of row count so it adapts to either.
const MAX_STMT_BYTES = 400_000;

function writeSeedFile(outFile: string, table: string, rows: string[]) {
  if (!rows.length) return;
  const cols =
    table === "tafsir" ? "(ayah_id, source, text, ai_generated, status, lang)" : "(ayah_id, text, source, lang)";
  const stmts: string[] = [];
  let batch: string[] = [];
  let batchBytes = 0;
  const flush = () => {
    if (batch.length) stmts.push(`INSERT INTO ${table} ${cols} VALUES\n  ${batch.join(",\n  ")};`);
    batch = [];
    batchBytes = 0;
  };
  for (const row of rows) {
    const rowBytes = Buffer.byteLength(row, "utf8");
    if (batch.length && batchBytes + rowBytes > MAX_STMT_BYTES) flush();
    batch.push(row);
    batchBytes += rowBytes;
  }
  flush();
  const outPath = join(import.meta.dirname, "..", "packages", "db-schema", "seed", outFile);
  writeFileSync(outPath, stmts.join("\n\n") + "\n");
  console.log(`Wrote ${outPath} (${rows.length} rows, ${stmts.length} statements)`);
}

async function main() {
  const byFile = new Map<string, string[]>();

  for (const job of JOBS) {
    console.log(`\n=== ${job.edition} (${job.lang}) → ${job.table} ===`);
    const rows: string[] = byFile.get(job.outFile) ?? [];
    let inserted = 0;

    for (let surah = 1; surah <= 114; surah++) {
      const raw = await fetchSurahRaw(job.edition, surah);
      if (!raw) {
        console.log(`  surah ${surah}: fetch failed, skipping`);
        continue;
      }
      const startId = SURAH_START_ID[surah - 1]!;
      for (const { ayahId, text } of job.parse(raw, startId)) {
        if (text.length < job.minLen) continue;
        if (job.table === "tafsir") {
          rows.push(`(${ayahId}, '${esc(job.source)}', '${esc(text)}', 0, 'published', '${job.lang}')`);
        } else {
          rows.push(`(${ayahId}, '${esc(text)}', '${esc(job.source)}', '${job.lang}')`);
        }
        inserted++;
      }
      if (surah % 20 === 0) console.log(`  ...surah ${surah}/114 (${inserted} rows so far)`);
    }

    console.log(`  ${job.edition}: ${inserted} rows`);
    byFile.set(job.outFile, rows);
    // Write after every job (not just at the very end) so a later job's
    // failure never loses an already-successful fetch.
    writeSeedFile(job.outFile, job.table, rows);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
