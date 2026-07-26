/**
 * Scrubs the digitisation artefacts out of the kitab pesantren Arabic.
 *
 * The matn came from OpenITI, which keeps the printed edition's page breaks
 * inline as `ms01`, `ms02`… markers, and in places kept a stray `</span>` from
 * the HTML the text was scraped out of. Both are rendered to the reader as if
 * they were part of the kitab: 2,719 of 7,843 matn carry one.
 *
 * A few rows are nothing but a `</span>` — an empty block in the middle of a
 * bab. Those are dropped, since there is no kitab text in them to keep.
 *
 * Usage: npx tsx scripts/clean-pesantren-text.ts [--dry]
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const WORKER_CWD = join(import.meta.dirname, "..", "apps", "worker-api");

/**
 * The page marker as OpenITI writes it: the letters ms followed by the page
 * number, standing alone between two words of Arabic. Bounded on both sides so
 * an Arabic word is never clipped, and case-insensitive because the printed
 * editions are not consistent.
 */
const PAGE_MARKER = /(^|[^\p{L}\p{N}])ms\d+(?=[^\p{L}\p{N}]|$)/giu;
/**
 * OpenITI wraps a Qur'anic quotation inside the prose in @QB@ … @QE@. These are
 * not junk — they mark where a fiqh text stops speaking and starts quoting the
 * Qur'an — but shown raw they read as gibberish: "لآية @QB@ فاغسلوا وجوهكم @QE@".
 *
 * They become the ornate parentheses the printed kitab use for exactly this,
 * ﴿ ﴾, so the ayah keeps the boundary its author gave it.
 */
const QURAN_OPEN = /@QB@\s*/g;
const QURAN_CLOSE = /\s*@QE@/g;

/** A whole tag, closing bracket and all. */
const HTML_TAG = /<\/?[a-z][a-z0-9]*(?:\s[^<>]*)?>/gi;
/**
 * The half-written tags the scrape left behind — `</span` with no bracket. This
 * has to stop at the tag name: an earlier version allowed attributes here too,
 * and with no `>` to stop at it swallowed the whole rest of the row. That would
 * have deleted 268 rows of Sirah Ibnu Hisyam.
 */
const HTML_STUB = /<\/?[a-z][a-z0-9]*(?=\s|$)/gi;

export function cleanMatn(text: string): string {
  return text
    .replace(HTML_TAG, " ")
    .replace(HTML_STUB, " ")
    .replace(QURAN_OPEN, "﴿")
    .replace(QURAN_CLOSE, "﴾")
    .replace(PAGE_MARKER, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    // Arabic punctuation only. The latin dot is left alone because the nazham
    // editions use " ... " to separate the two halves of a bait.
    .replace(/[ \t]+([،؛؟])/g, "$1")
    .trim();
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

interface Row {
  id: number;
  kitab_slug: string;
  text_ar: string;
}

async function main() {
  const dry = process.argv.includes("--dry");

  const PAGE = 1000;
  const rows: Row[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const page = d1Json<Row>(
      `SELECT m.id, b.kitab_slug AS kitab_slug, m.text_ar FROM pesantren_matn m ` +
        `JOIN pesantren_bab b ON b.id = m.bab_id ` +
        `WHERE m.text_ar GLOB '*[A-Za-z]*' ORDER BY m.id LIMIT ${PAGE} OFFSET ${offset};`
    );
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  console.log(`${rows.length} matn contain latin characters.`);

  const updates: string[] = [];
  const drops: number[] = [];
  const perKitab = new Map<string, number>();
  for (const r of rows) {
    const cleaned = cleanMatn(r.text_ar);
    if (cleaned === r.text_ar) continue;
    perKitab.set(r.kitab_slug, (perKitab.get(r.kitab_slug) ?? 0) + 1);
    // A row left with no letter or digit was only ever markup. "</span>:" is
    // four of these — cleaning leaves a bare colon, which is no more a matn
    // than the tag was.
    if (!/[\p{L}\p{N}]/u.test(cleaned)) {
      drops.push(r.id);
      continue;
    }
    updates.push(`UPDATE pesantren_matn SET text_ar = ${sq(cleaned)} WHERE id = ${r.id};`);
  }

  for (const [slug, n] of [...perKitab].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${slug}: ${n}`);
  }
  console.log(`${updates.length} matn to clean, ${drops.length} empty matn to drop.`);
  if (drops.length) console.log(`  dropping ids: ${drops.join(", ")}`);

  if (dry) {
    console.log("Dry run — nothing written.");
    return;
  }
  if (!updates.length && !drops.length) return;

  const tmp = mkdtempSync(join(tmpdir(), "ulyah-pes-clean-"));
  const BATCH = 200;
  for (let i = 0; i < updates.length; i += BATCH) {
    d1File(updates.slice(i, i + BATCH).join("\n"), tmp);
    console.log(`  cleaned ${Math.min(i + BATCH, updates.length)}/${updates.length}`);
  }
  if (drops.length) {
    d1File(`DELETE FROM pesantren_matn WHERE id IN (${drops.join(",")});`, tmp);
  }
  rmSync(tmp, { recursive: true, force: true });
  console.log("Done.");
}

if (process.argv[1]?.includes("clean-pesantren-text")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
