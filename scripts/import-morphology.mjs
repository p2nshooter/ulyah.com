/**
 * Imports the Quranic Arabic Corpus (QAC) word-by-word morphology into the D1
 * `quran_morphology` table so the reader can show nahwu-shorof for every ayah.
 *
 * Source: https://github.com/mustafa0x/quran-morphology (a fork of QAC
 * morphology v0.4, corpus.quran.com — Kais Dukes, University of Leeds, GPL).
 * Runs on a GitHub runner (not the Worker): ~130k segments far exceed a
 * Worker's budget. Idempotent — skips if the table is already populated (pass
 * --force to reimport). Fetches the source at run time, so nothing large is
 * committed to the repo.
 *
 * Usage: node scripts/import-morphology.mjs [--force]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");
const SOURCE_URL = "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";
const FORCE = process.argv.includes("--force");

function wrangler(argv, capture = false) {
  for (let i = 0; i < 5; i++) {
    try {
      return execFileSync("npx", ["wrangler", ...argv], {
        cwd: WORKER_CWD,
        stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
        encoding: "utf8",
        maxBuffer: 512 * 1024 * 1024,
      });
    } catch (err) {
      if (i === 4) throw err;
      execFileSync("sleep", [String(3 * 2 ** i)]);
    }
  }
  return "";
}

function d1Count() {
  try {
    const out = wrangler(
      ["d1", "execute", "ulyah-db", "--remote", "--json", "--command=SELECT COUNT(*) AS n FROM quran_morphology;"],
      true
    );
    const parsed = JSON.parse(out);
    const results = Array.isArray(parsed) ? parsed[0]?.results : parsed?.results;
    return Number(results?.[0]?.n ?? 0);
  } catch {
    return 0; // table not created yet
  }
}

const esc = (s) => `'${String(s).replace(/'/g, "''")}'`;
const KNOWN_POS = new Set([
  "N", "PN", "ADJ", "IMPN", "ACT_PCPL", "PASS_PCPL", "VN", "PRON", "DEM", "REL", "T", "LOC",
  "V", "P", "DET", "CONJ", "SUB", "ACC", "COND", "NEG", "PRO", "EMPH", "INTG", "VOC", "FUT",
  "CERT", "RES", "EXP", "AVR", "ANS", "INC", "SUR", "INL", "PREV", "IMPV",
]);

function parseLine(line) {
  const [loc, form, tag, features = ""] = line.split("\t");
  const [surah, ayah, word, segment] = loc.split(":").map(Number);
  const parts = features.split("|");
  const root = (parts.find((p) => p.startsWith("ROOT:")) || "").slice(5) || null;
  const lemma = (parts.find((p) => p.startsWith("LEM:")) || "").slice(4) || null;
  const pos = parts.find((p) => KNOWN_POS.has(p)) || tag;
  return { surah, ayah, word, segment, form, tag, features, pos, root, lemma };
}

async function main() {
  // Make sure the table exists (migration 0047).
  wrangler([
    "d1",
    "execute",
    "ulyah-db",
    "--remote",
    "--file=../../packages/db-schema/migrations/0047_quran_morphology.sql",
  ]);

  const existing = d1Count();
  if (existing > 0 && !FORCE) {
    console.log(`quran_morphology already has ${existing} rows — skipping (use --force to reimport).`);
    return;
  }

  console.log(`Fetching QAC morphology from ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const text = await res.text();
  const rows = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && /^\d+:\d+:\d+:\d+\t/.test(l))
    .map(parseLine);
  console.log(`Parsed ${rows.length} segments.`);
  if (!rows.length) throw new Error("no rows parsed — source format may have changed");

  const dir = mkdtempSync(join(tmpdir(), "morph-"));
  try {
    const PER_STMT = 800; // rows per multi-row INSERT
    const PER_FILE = 20; // statements per file → 16k rows/file
    let fileIdx = 0;
    for (let i = 0; i < rows.length; i += PER_STMT * PER_FILE) {
      const slice = rows.slice(i, i + PER_STMT * PER_FILE);
      const stmts = [];
      for (let j = 0; j < slice.length; j += PER_STMT) {
        const chunk = slice.slice(j, j + PER_STMT);
        const values = chunk
          .map(
            (r) =>
              `(${r.surah},${r.ayah},${r.word},${r.segment},${esc(r.form)},${esc(r.tag)},${esc(r.features)},${esc(r.pos)},${r.root ? esc(r.root) : "NULL"},${r.lemma ? esc(r.lemma) : "NULL"})`
          )
          .join(",");
        stmts.push(
          `INSERT OR IGNORE INTO quran_morphology (surah,ayah,word,segment,form,tag,features,pos,root,lemma) VALUES ${values};`
        );
      }
      const file = join(dir, `morph-${fileIdx}.sql`);
      writeFileSync(file, stmts.join("\n"), "utf8");
      wrangler(["d1", "execute", "ulyah-db", "--remote", `--file=${file}`]);
      console.log(`  wrote rows ${i}–${i + slice.length}`);
      fileIdx++;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  console.log(`Done — imported ${rows.length} morphology segments into D1.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
