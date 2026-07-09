/**
 * Generates packages/db-schema/seed/hadith_bukhari.sql and hadith_muslim.sql
 * from fawazahmed0/hadith-api (github.com/fawazahmed0/hadith-api, Unlicense /
 * public domain — verified via the repo's LICENSE file) — the full text of
 * Sahih al-Bukhari (7,589 hadith) and Sahih Muslim (7,563 hadith), the two
 * collections traditionally called "Sahihain" ("the two authentic books"),
 * in Arabic, Indonesian, and English, matched by hadithnumber.
 *
 * This exists so ULYAH's hadith library can grow far beyond a small hand-
 * curated set WITHOUT recalling hadith text/attribution from memory (a real
 * misquotation risk for sacred text) — every row here is machine-ingested
 * from a structured, cross-validated, permissively-licensed public dataset.
 * The AI-free content engine (packages: apps/worker-api/src/lib/compile.ts)
 * then compiles these into narratable ~30-minute sessions.
 *
 * Bulk-imported rows leave `narrator` NULL: the translated text from this
 * dataset already includes the full isnad chain naturally ("Telah
 * menceritakan kepada kami [Fulan]... Rasulullah bersabda:"), so wrapping it
 * again in a synthetic "Dari X, Rasulullah bersabda:" template would be
 * redundant. `grade` is 'shahih' for every row: inclusion in Sahih Bukhari or
 * Sahih Muslim IS the classical criterion for that grading, by scholarly
 * consensus on these two specific collections.
 *
 * Run: npx tsx scripts/generate-hadith-seed.ts
 * (Set HADITH_SOURCE_DIR to a local directory of pre-downloaded edition
 * JSON files to skip the network fetch during iteration.)
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const outDir = join(repoRoot, "packages", "db-schema", "seed");
const CACHE_DIR = process.env.HADITH_SOURCE_DIR;

const BASE_URL = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions";
const MAX_STATEMENT_BYTES = 60_000;

interface HadithRecord {
  hadithnumber: number;
  text: string;
  reference?: { book: number; hadith: number };
}
interface EditionFile {
  metadata: { name: string };
  hadiths: HadithRecord[];
}

interface Collection {
  key: string; // used in output filename
  editionPrefix: "bukhari" | "muslim";
  idStart: number; // first `hadits.id` this collection occupies
  sourceLabel: string; // e.g. "Sahih al-Bukhari"
}

const COLLECTIONS: Collection[] = [
  { key: "bukhari", editionPrefix: "bukhari", idStart: 1001, sourceLabel: "Sahih al-Bukhari" },
  { key: "muslim", editionPrefix: "muslim", idStart: 9001, sourceLabel: "Sahih Muslim" },
];

function esc(s: string | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return `'${s.replace(/'/g, "''")}'`;
}

function batchByBytes(rows: string[]): string[][] {
  const out: string[][] = [];
  let current: string[] = [];
  let currentBytes = 0;
  for (const row of rows) {
    const rowBytes = Buffer.byteLength(row, "utf-8") + 2;
    if (current.length > 0 && currentBytes + rowBytes > MAX_STATEMENT_BYTES) {
      out.push(current);
      current = [];
      currentBytes = 0;
    }
    current.push(row);
    currentBytes += rowBytes;
  }
  if (current.length > 0) out.push(current);
  return out;
}

async function loadEdition(editionName: string): Promise<EditionFile> {
  if (CACHE_DIR) {
    const cachedPath = join(CACHE_DIR, `${editionName}.json`);
    if (existsSync(cachedPath)) {
      return JSON.parse(readFileSync(cachedPath, "utf-8"));
    }
  }
  const res = await fetch(`${BASE_URL}/${editionName}.json`);
  if (!res.ok) throw new Error(`Failed to fetch ${editionName}: HTTP ${res.status}`);
  return res.json();
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  for (const col of COLLECTIONS) {
    console.log(`Loading ${col.sourceLabel}...`);
    const [ar, id, en] = await Promise.all([
      loadEdition(`ara-${col.editionPrefix}`),
      loadEdition(`ind-${col.editionPrefix}`),
      loadEdition(`eng-${col.editionPrefix}`),
    ]);

    // Index by hadithnumber for a robust join (arrays should already align
    // 1:1, but a hadithnumber-keyed join is defensive against any gaps).
    const arByNum = new Map(ar.hadiths.map((h) => [h.hadithnumber, h.text]));
    const enByNum = new Map(en.hadiths.map((h) => [h.hadithnumber, h.text]));

    const rows: string[] = [];
    let skipped = 0;
    let nextId = col.idStart;
    for (const idHadith of id.hadiths) {
      // hadithnumber is USUALLY an integer, but Bukhari/Muslim both split some
      // narrations into sub-parts numbered e.g. 1390.1/1390.2/1390.3 — a float.
      // Never feed that into the DB `id` (INTEGER PRIMARY KEY): assign a plain
      // sequential id instead, and keep the original (possibly fractional)
      // number only in the human-readable citation string.
      const n = idHadith.hadithnumber;
      const textId = idHadith.text?.trim();
      const textAr = arByNum.get(n)?.trim();
      const textEn = enByNum.get(n)?.trim();
      if (!textId || !textAr || !textEn) {
        skipped++;
        continue; // incomplete row across the three editions — skip rather than insert a gap
      }
      const hadithId = nextId++;
      const source = `${col.sourceLabel} no. ${n}`;
      rows.push(
        `(${hadithId}, ${esc(textAr)}, ${esc(textId)}, ${esc(textEn)}, NULL, 'shahih', ${esc(source)})`
      );
    }

    console.log(`  ${rows.length} complete records, ${skipped} skipped (incomplete across editions).`);

    const lines: string[] = [
      `-- Auto-generated by scripts/generate-hadith-seed.ts — DO NOT hand-edit.`,
      `-- Source: fawazahmed0/hadith-api (github.com/fawazahmed0/hadith-api), Unlicense / public domain.`,
      `-- ${col.sourceLabel} — ${rows.length} hadith, Arabic + Indonesian + English, matched by hadithnumber.`,
      `-- Bulk-imported rows leave narrator NULL — the translated text already includes the full isnad.`,
      "",
    ];
    for (const batch of batchByBytes(rows)) {
      lines.push(
        `INSERT OR IGNORE INTO hadits (id, text_ar, text_id, text_en, narrator, grade, source) VALUES\n  ${batch.join(",\n  ")};`
      );
    }

    const outPath = join(outDir, `hadith_${col.key}.sql`);
    writeFileSync(outPath, lines.join("\n") + "\n");
    console.log(`  wrote ${outPath}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
