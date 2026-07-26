/**
 * Fills the Indonesian translation of hadith-based kitab pesantren from the
 * hadith corpus this site already holds — no machine translation, no copying
 * from a publisher.
 *
 * Bulughul Maram and Arba'in Nawawi are compilations: every matn in them is a
 * hadith that also appears, word for word, in the nine books. Those nine books
 * are already in D1 with a full Indonesian translation, imported from
 * fawazahmed0/hadith-api (Unlicense — public domain) and gadingnst/hadith-api
 * (MIT). So the terjemah for these kitab does not need to be produced: it needs
 * to be *found*, by matching the Arabic.
 *
 * Matching is deliberately timid. The matn is normalised (harakat, tatweel and
 * punctuation removed, alif/ya/ta-marbuta folded), cut into 4-word shingles,
 * and looked up in an inverted index over the corpus. A hadith is accepted only
 * when it contains a large majority of the matn's shingles AND beats the
 * runner-up by a clear margin — anything less is left NULL, because a hadith
 * shown with the wrong terjemah is worse than a hadith shown in Arabic only.
 *
 * Every filled row records where its terjemah came from, so any reader can
 * check it against the printed book.
 *
 * Usage:
 *   npx tsx scripts/link-pesantren-hadits.ts [--kitab=arbainnawawi,bulughulmaram]
 *                                            [--min=0.55] [--margin=0.10] [--dry]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");

/** Kitab whose matn are hadith. Nothing else is touched. */
const DEFAULT_KITAB = ["arbainnawawi", "bulughulmaram"];

/** How the corpus names each book when we cite it back to the reader. */
const BOOK_ID: Record<string, string> = {
  bukhari: "Bukhari",
  muslim: "Muslim",
  tirmidhi: "Tirmidzi",
  abudawud: "Abu Dawud",
  nasai: "An-Nasa'i",
  ibnmajah: "Ibnu Majah",
  malik: "Malik",
  ahmad: "Ahmad",
  darimi: "Ad-Darimi",
  riyadhus: "Riyadhus Shalihin",
  nawawi: "Arba'in An-Nawawi",
  qudsi: "Hadits Qudsi",
  dehlawi: "Ad-Dehlawi",
};

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? "true"];
    })
  );
  return {
    kitab: ((args.kitab as string) || DEFAULT_KITAB.join(","))
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    min: Number(args.min ?? 0.55),
    margin: Number(args.margin ?? 0.1),
    dry: args.dry === "true",
  };
}

function wrangler(argv: string[], capture = false): string {
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

function d1Json<T>(sql: string): T[] {
  const out = wrangler(["d1", "execute", "ulyah-db", "--remote", "--json", `--command=${sql}`], true);
  try {
    const parsed = JSON.parse(out);
    const results = Array.isArray(parsed) ? parsed[0]?.results : parsed?.results;
    return (results ?? []) as T[];
  } catch {
    console.error("Could not parse d1 --json output");
    return [];
  }
}

function d1File(sql: string, tmp: string): void {
  const p = join(tmp, `stmt-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  writeFileSync(p, sql);
  wrangler(["d1", "execute", "ulyah-db", "--remote", `--file=${p}`]);
  rmSync(p, { force: true });
}

function sq(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

/**
 * Folds an Arabic string down to the letters that carry meaning, so that two
 * printings of the same hadith compare equal: harakat and tatweel go, the alif
 * and ya and ta-marbuta families collapse onto one member each, and everything
 * that is not an Arabic letter becomes a space.
 */
export function normalizeArabic(s: string): string {
  return s
    .replace(/[ً-ْٰـۖ-ۭ]/g, "")
    .replace(/[آأإاٱ]/g, "ا")
    .replace(/[ىيئ]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/[^ء-غف-ي]+/g, " ")
    .trim();
}

const SHINGLE = 4;
/** Index every other position: any run of >= SHINGLE+1 shared words still hits. */
const INDEX_STRIDE = 2;

export function shingles(words: string[], stride = 1): string[] {
  const out: string[] = [];
  for (let i = 0; i + SHINGLE <= words.length; i += stride) {
    out.push(words.slice(i, i + SHINGLE).join(" "));
  }
  return out;
}

export interface MatchResult {
  index: number;
  score: number;
  runnerUp: number;
}

/**
 * Builds the shingle index over a corpus once, then answers "which entry
 * contains this passage?" — returning null unless one entry clearly wins.
 */
export function buildMatcher(corpusArabic: string[]) {
  const index = new Map<string, number[]>();
  const own: Set<string>[] = [];
  for (let i = 0; i < corpusArabic.length; i++) {
    const words = normalizeArabic(corpusArabic[i]).split(" ").filter(Boolean);
    own.push(new Set(shingles(words, 1)));
    for (const sh of shingles(words, INDEX_STRIDE)) {
      const bucket = index.get(sh);
      if (bucket) bucket.push(i);
      else index.set(sh, [i]);
    }
  }

  // "dari Abu Hurairah, Rasulullah bersabda" opens thousands of hadith. A
  // shingle that common carries no evidence of identity, so it is ignored both
  // when shortlisting candidates and when deciding a match is distinctive.
  const commonDf = Math.max(50, Math.floor(corpusArabic.length * 0.005));
  /** A match built only out of boilerplate is not a match. */
  const MIN_RARE = 4;

  function match(text: string, min: number, margin: number): MatchResult | null {
    const words = normalizeArabic(text).split(" ").filter(Boolean);
    const query = shingles(words, 1);
    if (query.length < 3) return null;

    const rare = query.filter((sh) => (index.get(sh)?.length ?? 0) <= commonDf);
    if (rare.length < MIN_RARE) return null;

    // Count how many of the passage's shingles each candidate could hold.
    const seen = new Map<number, number>();
    for (const sh of rare) {
      const bucket = index.get(sh);
      if (!bucket) continue;
      for (const ci of bucket) seen.set(ci, (seen.get(ci) ?? 0) + 1);
    }
    if (!seen.size) return null;

    // Score the few plausible candidates properly: what share of the passage
    // does this entry actually contain?
    const shortlist = [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
    let best = -1;
    let bestScore = 0;
    let bestShared = 0;
    let runnerUp = 0;
    for (const [ci] of shortlist) {
      let shared = 0;
      for (const sh of rare) if (own[ci].has(sh)) shared++;
      const score = shared / rare.length;
      if (score > bestScore) {
        runnerUp = bestScore;
        bestScore = score;
        bestShared = shared;
        best = ci;
      } else if (score > runnerUp) runnerUp = score;
    }
    if (best < 0 || bestShared < MIN_RARE) return null;
    if (bestScore < min || bestScore - runnerUp < margin) return null;
    return { index: best, score: bestScore, runnerUp };
  }

  return { match, size: index.size };
}

interface HadithRow {
  id: number;
  collection: string | null;
  hadith_number: number | null;
  text_ar: string | null;
  text_id: string | null;
}
interface MatnRow {
  id: number;
  kitab_slug: string;
  text_ar: string;
}

/** Pulls the corpus in pages — one 38k-row payload would blow the argv/stdout budget. */
function loadCorpus(): HadithRow[] {
  const PAGE = 2000;
  const rows: HadithRow[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = d1Json<HadithRow>(
      `SELECT id, collection, hadith_number, text_ar, text_id FROM hadits ` +
        `WHERE text_ar IS NOT NULL AND TRIM(text_ar) <> '' AND text_id IS NOT NULL AND TRIM(text_id) <> '' ` +
        `ORDER BY id LIMIT ${PAGE} OFFSET ${offset};`
    );
    rows.push(...page);
    process.stdout.write(`\r  corpus: ${rows.length} hadits`);
    if (page.length < PAGE) break;
  }
  process.stdout.write("\n");
  return rows;
}

/** The book and number a reader can look the terjemah up in. */
function citation(h: HadithRow): string {
  const book = BOOK_ID[h.collection ?? ""] ?? h.collection ?? "hadits";
  return h.hadith_number ? `HR. ${book} no. ${h.hadith_number}` : `HR. ${book}`;
}

async function main() {
  const { kitab, min, margin, dry } = parseArgs();
  console.log(`Linking terjemah for: ${kitab.join(", ")} (min=${min}, margin=${margin}${dry ? ", dry" : ""})`);

  const matns = d1Json<MatnRow>(
    `SELECT m.id, b.kitab_slug AS kitab_slug, m.text_ar FROM pesantren_matn m ` +
      `JOIN pesantren_bab b ON b.id = m.bab_id ` +
      `WHERE b.kitab_slug IN (${kitab.map(sq).join(",")}) ` +
      `AND (m.translation_id IS NULL OR TRIM(m.translation_id) = '') ` +
      `ORDER BY b.kitab_slug, b.bab_order, m.matn_order;`
  );
  console.log(`${matns.length} matn without terjemah.`);
  if (!matns.length) return;

  const corpus = loadCorpus();
  if (!corpus.length) {
    console.error("Corpus is empty — nothing to match against.");
    process.exit(1);
  }

  const matcher = buildMatcher(corpus.map((h) => h.text_ar ?? ""));
  console.log(`Index: ${matcher.size} shingles over ${corpus.length} hadits.`);

  const updates: string[] = [];
  const perKitab = new Map<string, { hit: number; miss: number }>();
  for (const m of matns) {
    const stat = perKitab.get(m.kitab_slug) ?? { hit: 0, miss: 0 };
    perKitab.set(m.kitab_slug, stat);

    const hit = matcher.match(m.text_ar, min, margin);
    if (!hit) {
      stat.miss++;
      continue;
    }

    const h = corpus[hit.index];
    const terjemah = `${(h.text_id ?? "").trim()}\n\n(${citation(h)})`;
    updates.push(`UPDATE pesantren_matn SET translation_id = ${sq(terjemah)} WHERE id = ${m.id};`);
    stat.hit++;
  }

  for (const [slug, s] of perKitab) {
    const total = s.hit + s.miss;
    console.log(`  ${slug}: ${s.hit}/${total} matched (${((s.hit / total) * 100).toFixed(1)}%)`);
  }

  if (dry) {
    console.log(`Dry run — ${updates.length} rows would be filled.`);
    return;
  }
  if (!updates.length) {
    console.log("Nothing matched confidently. Leaving every row as it was.");
    return;
  }

  const tmp = mkdtempSync(join(tmpdir(), "ulyah-pes-hadits-"));
  const BATCH = 200;
  for (let i = 0; i < updates.length; i += BATCH) {
    d1File(updates.slice(i, i + BATCH).join("\n"), tmp);
    console.log(`  wrote ${Math.min(i + BATCH, updates.length)}/${updates.length}`);
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log(`Filled ${updates.length} matn with a terjemah from the corpus.`);
}

// Only when run directly — the check script imports the matcher and must not
// touch the database.
if (process.argv[1]?.includes("link-pesantren-hadits")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
