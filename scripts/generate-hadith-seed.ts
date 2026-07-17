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
  key: string; // used in output filename + `hadits.collection` slug
  editionPrefix: string;
  idStart: number; // first `hadits.id` this collection occupies
  sourceLabel: string; // e.g. "Sahih al-Bukhari"
  // Most collections ship a native Indonesian edition. Arba'in Nawawi and
  // Hadits Qudsi don't (fawazahmed0 has only Arabic + English for them), so we
  // import Arabic + English and store the English into text_id as a readable
  // stopgap; the reader translates to Indonesian on demand (KV-cached).
  hasInd: boolean;
}

// idStart ranges are generously spaced so no collection's real hadith count
// can ever collide with the next one's range. These MUST match the ranges in
// migration 0012_hadits_collections.sql.
const COLLECTIONS: Collection[] = [
  { key: "bukhari", editionPrefix: "bukhari", idStart: 1001, sourceLabel: "Sahih al-Bukhari", hasInd: true },
  { key: "muslim", editionPrefix: "muslim", idStart: 9001, sourceLabel: "Sahih Muslim", hasInd: true },
  { key: "tirmidhi", editionPrefix: "tirmidhi", idStart: 20001, sourceLabel: "Jami' At-Tirmidzi", hasInd: true },
  { key: "abudawud", editionPrefix: "abudawud", idStart: 30001, sourceLabel: "Sunan Abu Dawud", hasInd: true },
  { key: "nasai", editionPrefix: "nasai", idStart: 40001, sourceLabel: "Sunan An-Nasa'i", hasInd: true },
  { key: "ibnmajah", editionPrefix: "ibnmajah", idStart: 50001, sourceLabel: "Sunan Ibnu Majah", hasInd: true },
  { key: "malik", editionPrefix: "malik", idStart: 60001, sourceLabel: "Muwatta Malik", hasInd: true },
  { key: "nawawi", editionPrefix: "nawawi", idStart: 70001, sourceLabel: "Arba'in An-Nawawi", hasInd: false },
  { key: "qudsi", editionPrefix: "qudsi", idStart: 75001, sourceLabel: "Hadits Qudsi", hasInd: false },
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
    const [ar, en, idEd] = await Promise.all([
      loadEdition(`ara-${col.editionPrefix}`),
      loadEdition(`eng-${col.editionPrefix}`),
      col.hasInd ? loadEdition(`ind-${col.editionPrefix}`) : Promise.resolve(null),
    ]);

    // Index by hadithnumber for a robust join (arrays should already align
    // 1:1, but a hadithnumber-keyed join is defensive against any gaps).
    const enByNum = new Map(en.hadiths.map((h) => [h.hadithnumber, h.text]));
    const idByNum = idEd ? new Map(idEd.hadiths.map((h) => [h.hadithnumber, h.text])) : null;

    const rows: string[] = [];
    let skipped = 0;
    let nextId = col.idStart;
    // Drive the join off the Arabic edition — it's the one edition every
    // collection has, and the sacred source text we must never fabricate.
    for (const arHadith of ar.hadiths) {
      // hadithnumber is USUALLY an integer, but Bukhari/Muslim both split some
      // narrations into sub-parts numbered e.g. 1390.1/1390.2/1390.3 — a float.
      // Never feed that into the DB `id` (INTEGER PRIMARY KEY): assign a plain
      // sequential id instead, and keep the original (possibly fractional)
      // number only in the human-readable citation string.
      const n = arHadith.hadithnumber;
      const textAr = arHadith.text?.trim();
      const textEn = enByNum.get(n)?.trim();
      // Collections WITH a native Indonesian edition keep pure Indonesian and
      // skip any row the ID edition is missing (preserves quality, matches the
      // original behaviour). Collections WITHOUT one (Arba'in, Qudsi) store the
      // English as a readable stopgap; the reader replaces it with an on-demand
      // Indonesian translation — see apps/worker-api/src/lib/mt.ts.
      const textId = idByNum ? idByNum.get(n)?.trim() : textEn;
      if (!textAr || !textEn || !textId) {
        skipped++;
        continue; // incomplete row across the editions — skip rather than insert a gap
      }
      const hadithId = nextId++;
      const hadithNumber = hadithId - col.idStart + 1;
      const source = `${col.sourceLabel} no. ${n}`;
      rows.push(
        `(${hadithId}, ${esc(textAr)}, ${esc(textId)}, ${esc(textEn)}, NULL, 'shahih', ${esc(source)}, ${esc(col.key)}, ${hadithNumber})`
      );
    }

    console.log(`  ${rows.length} complete records, ${skipped} skipped (incomplete across editions).`);

    const langNote = col.hasInd ? "Arabic + Indonesian + English" : "Arabic + English (Indonesian translated on demand)";
    const lines: string[] = [
      `-- Auto-generated by scripts/generate-hadith-seed.ts — DO NOT hand-edit.`,
      `-- Source: fawazahmed0/hadith-api (github.com/fawazahmed0/hadith-api), Unlicense / public domain.`,
      `-- ${col.sourceLabel} — ${rows.length} hadith, ${langNote}, matched by hadithnumber.`,
      `-- Bulk-imported rows leave narrator NULL — the translated text already includes the full isnad.`,
      "",
    ];
    for (const batch of batchByBytes(rows)) {
      lines.push(
        `INSERT OR IGNORE INTO hadits (id, text_ar, text_id, text_en, narrator, grade, source, collection, hadith_number) VALUES\n  ${batch.join(",\n  ")};`
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
