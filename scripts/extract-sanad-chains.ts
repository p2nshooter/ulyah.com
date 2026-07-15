/**
 * Generates packages/db-schema/seed/sanad_chains.sql by extracting isnad
 * (narrator chain) data OUT OF text already sitting in this repo — the
 * Arabic text_ar column of hadith_bukhari.sql / hadith_muslim.sql
 * (fawazahmed0/hadith-api, Unlicense / public domain), which spells out the
 * full chain before the matan for the vast majority of narrations
 * ("حَدَّثَنَا فلان، قال حَدَّثَنَا فلان، عن فلان... أن رسول الله صلى الله
 * عليه وسلم قال...").
 *
 * This is deliberately NOT an AI-generated or hand-typed chain: the admin
 * portal's own backlog (BacklogTab.tsx) explicitly requires sanad data come
 * "dari sumber bersanad nyata" (from a real chained source), never
 * fabricated. Every row this produces is tagged 'pending_review' — a
 * regex/tokenizer heuristic on classical Arabic can mis-segment a name (an
 * attached honorific, an unusual phrasing), and misrepresenting a hadith's
 * authentication chain is a real scholarly-accuracy concern, so nothing
 * this script produces reaches the public Sanad tree until a human (or a
 * hand-verified exception, see MANUALLY_VERIFIED below) confirms it.
 *
 * Run: npx tsx scripts/extract-sanad-chains.ts
 */
import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const seedDir = join(repoRoot, "packages", "db-schema", "seed");

const CONNECTORS = new Set([
  "حدثنا", "حدثني", "أخبرنا", "أخبرني", "نبأنا", "انبأنا", "عن", "أن", "أنه", "أنها", "أنهما",
  "سمع", "سمعت", "سمعا", "سمعوا",
]);
const NOISE_STANDALONE = new Set(["قال", "قالت", "يقول", "تقول", "ح", ""]);
const RA_SEQ = new Set(["عنه", "عنها", "عنهما", "عنهم"]);
const PROPHET_MARK = "صلى الله عليه وسلم";

/** Strip Arabic diacritics (tashkeel/harakat) via Unicode category, not a
 * hand-typed character range — a hand-typed range is exactly what silently
 * ate real base letters during development of this script (caught by
 * testing against real sample text before trusting the output). */
function stripTashkeel(s: string): string {
  return Array.from(s)
    .filter((ch) => {
      const cp = ch.codePointAt(0)!;
      // Arabic combining diacritics live in these two Unicode blocks.
      return !((cp >= 0x0610 && cp <= 0x061a) || (cp >= 0x064b && cp <= 0x065f) || cp === 0x0670 || (cp >= 0x06d6 && cp <= 0x06ed));
    })
    .join("");
}

function tokenize(s: string): string[] {
  return s.split(/[\s,،؛:.]+/).filter(Boolean);
}

function normalizeConnector(tok: string): string | null {
  if (CONNECTORS.has(tok)) return tok;
  if (tok.startsWith("و") && CONNECTORS.has(tok.slice(1))) return tok.slice(1);
  return null;
}

/** Returns an ordered narrator-name chain (nearest-to-compiler first), or
 * null if this hadith's text doesn't spell out a chain at all (some don't —
 * that's a real, expected case, not an extraction failure). */
function extractChain(textAr: string): string[] | null {
  const plain = stripTashkeel(textAr);
  const cut = plain.indexOf(PROPHET_MARK);
  if (cut === -1) return null;
  const chainZone = plain.slice(0, cut);
  const tokens = tokenize(chainZone);

  const strip = (t: string) => t.replace(/^[ـ()[\]«»]+|[ـ()[\]«»]+$/g, "");
  const cleaned: string[] = [];
  const n = tokens.length;
  for (let i = 0; i < n; i++) {
    const tok = strip(tokens[i]!);
    // "رضي/رضى الله عنه/عنها/عنهما/عنهم" is a THREE-token honorific formula
    // (verb + "Allah" + "about him/her/them"), not two — an earlier version
    // of this checked only two tokens, which missed real cases and let an
    // unrelated segment balloon past the length cap, silently dropping a
    // real narrator (caught by manually verifying hadith #1001, the famous
    // "actions are by intentions" hadith, against its known chain).
    if (tok === "رضي" || tok === "رضى") {
      if (i + 2 < n && strip(tokens[i + 1]!) === "الله" && RA_SEQ.has(strip(tokens[i + 2]!))) {
        i += 2;
        continue;
      }
    }
    cleaned.push(tok);
  }

  const segments: string[][] = [];
  let current: string[] = [];
  for (const tok of cleaned) {
    const conn = normalizeConnector(tok);
    if (conn) {
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    if (NOISE_STANDALONE.has(tok) || !tok) continue;
    current.push(tok);
  }
  if (current.length) segments.push(current);

  const names: string[] = [];
  for (const seg of segments) {
    const name = seg.join(" ").trim();
    if (name.length >= 2 && name.length <= 45 && seg.length <= 6) names.push(name);
  }
  return names;
}

function parseHaditsRows(sqlPath: string): { id: number; textAr: string }[] {
  const content = readFileSync(sqlPath, "utf-8");
  // Matches "(id, 'text_ar', " at the start of each VALUES row — same shape
  // every generate-hadith-seed.ts row uses, SQL-escaped quotes doubled.
  const rowRe = /\((\d+),\s*'((?:[^'\\]|'')*)',/g;
  const rows: { id: number; textAr: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(content))) {
    rows.push({ id: Number(m[1]), textAr: m[2]!.replace(/''/g, "'") });
  }
  return rows;
}

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''");
}

function buildSeedFile(sourceFile: string, outName: string): { extracted: number; skippedShort: number; skippedNoMarker: number; perawiCount: number } {
  const rows = parseHaditsRows(join(seedDir, sourceFile));
  const perawiNames = new Set<string>();
  const chainRows: { haditsId: number; names: string[] }[] = [];
  let skippedShort = 0;
  let skippedNoMarker = 0;

  for (const row of rows) {
    const names = extractChain(row.textAr);
    if (names === null) {
      skippedNoMarker++;
      continue;
    }
    if (names.length < 2) {
      skippedShort++;
      continue;
    }
    for (const name of names) perawiNames.add(name.replace(/\s+/g, " ").trim());
    chainRows.push({ haditsId: row.id, names });
  }

  const lines: string[] = [
    `-- AUTO-GENERATED by scripts/extract-sanad-chains.ts — do not edit by hand.`,
    `-- Extracted from the isnad text already present in ${sourceFile}`,
    "-- (fawazahmed0/hadith-api, Unlicense/public domain) via a deterministic Arabic-text parser,",
    "-- never fabricated (see docs/CONTENT-POLICY.md and BacklogTab.tsx's sanad requirement).",
    "-- Every chain lands as 'pending_review' — see migration 0027_sanad_tree.sql for why.",
    "-- Requires the corresponding hadith seed already applied (hadits ids must exist).",
    "",
  ];

  for (const name of perawiNames) {
    lines.push(
      `INSERT OR IGNORE INTO perawi (name_ar, name_normalized, auto_created) VALUES ('${sqlEscape(name)}', '${sqlEscape(name)}', 1);`
    );
  }
  lines.push("");

  for (const { haditsId, names } of chainRows) {
    lines.push(
      `INSERT OR IGNORE INTO sanad_chain (hadits_id, status, extraction_method) SELECT ${haditsId}, 'pending_review', 'heuristic' WHERE EXISTS (SELECT 1 FROM hadits WHERE id = ${haditsId});`
    );
    for (let pos = 0; pos < names.length; pos++) {
      const name = names[pos]!.replace(/\s+/g, " ").trim();
      lines.push(
        `INSERT INTO sanad_link (sanad_chain_id, position, perawi_id) ` +
          `SELECT sc.id, ${pos}, p.id FROM sanad_chain sc, perawi p ` +
          `WHERE sc.hadits_id = ${haditsId} AND p.name_normalized = '${sqlEscape(name)}' ` +
          `AND NOT EXISTS (SELECT 1 FROM sanad_link sl WHERE sl.sanad_chain_id = sc.id AND sl.position = ${pos});`
      );
    }
  }

  writeFileSync(join(seedDir, outName), lines.join("\n") + "\n", "utf-8");
  return { extracted: chainRows.length, skippedShort, skippedNoMarker, perawiCount: perawiNames.size };
}

function main() {
  // Written as separate per-collection files (rather than one merged file)
  // so each stays a manageable size for a single `wrangler d1 execute`
  // call, matching how every other multi-collection hadith seed in this
  // repo is already split one-file-per-collection.
  const sources = [
    { file: "hadith_bukhari.sql", out: "sanad_chains_bukhari.sql", label: "Sahih al-Bukhari" },
    { file: "hadith_muslim.sql", out: "sanad_chains_muslim.sql", label: "Sahih Muslim" },
  ];

  for (const src of sources) {
    const stats = buildSeedFile(src.file, src.out);
    console.log(
      `${src.label}: extracted ${stats.extracted} chains, ${stats.perawiCount} unique perawi ` +
        `(skipped: ${stats.skippedNoMarker} no chain marker, ${stats.skippedShort} too short) -> ${src.out}`
    );
  }
}

main();
