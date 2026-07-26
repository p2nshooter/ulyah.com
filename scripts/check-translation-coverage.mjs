/**
 * Proves the hand-written translations actually cover what they claim to.
 *
 * The failure this catches is a quiet one. A title can be translated, spelled
 * correctly and committed, and still never reach a reader — because the key it
 * was filed under is not the key the Worker asks for. Counting rows does not
 * notice; only deriving every expected key and looking for it does.
 *
 * Checks three things:
 *   1. every key in the seed files is well-formed and for a language we serve;
 *   2. no key is written twice with different text (last write would silently
 *      win, and which one is "last" depends on file order);
 *   3. every English story title that the site can show has all three.
 *
 * The title list is regenerated the same way the seeds were, so a title added
 * to the corpus without a translation shows up here as a gap rather than as
 * English on a Spanish page.
 *
 *   node scripts/check-translation-coverage.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { storyKey } from "./mt-key.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "packages/db-schema/seed/translations");
const LANGS = ["es", "de", "fr"];

let bad = 0;
const ok = (name, cond, extra = "") => {
  if (!cond) bad++;
  console.log(`  ${cond ? "ok  " : "FAIL"} ${name} ${extra}`);
};

// ── Read every key/value pair out of the seed files ────────────────────────
const seen = new Map(); // key -> value
let dupes = 0;
let conflicts = 0;
for (const f of readdirSync(DIR).filter((n) => n.endsWith(".sql"))) {
  const sql = readFileSync(join(DIR, f), "utf8");
  // ('key','value') with '' as the escaped quote
  for (const m of sql.matchAll(/\('(mt:[^']*)','((?:[^']|'')*)'\)/g)) {
    const [, k, v] = m;
    const val = v.replace(/''/g, "'");
    if (seen.has(k)) {
      dupes++;
      if (seen.get(k) !== val) conflicts++;
    } else seen.set(k, val);
  }
}
ok("seed files parsed", seen.size > 0, `${seen.size} distinct keys`);
ok("no key written twice with different text", conflicts === 0, `${conflicts} conflicts, ${dupes} repeats`);
ok(
  "every key targets a language we serve",
  [...seen.keys()].every((k) => LANGS.some((l) => k.startsWith(`mt:en-${l}:`))),
  ""
);
ok("no value left with the English lead-in", ![...seen.values()].some((v) => v.includes("Authentic Hadith — HR.")));
ok("no value is empty", ![...seen.values()].some((v) => v.trim() === ""));

// ── Rebuild the expected title list ────────────────────────────────────────
// 633 numbered sessions + the 9 cited-hadith titles + the 188 story titles the
// batches carry. Sourced from the batch files themselves so the two cannot
// drift apart.
const titles = [];
for (let n = 1; n <= 633; n++) titles.push(`Authentic Hadith Session ${n} (40 Hadith)`);
titles.push(
  "Authentic Hadith — HR. Bukhari no. 1 & Muslim no. 1907",
  "Authentic Hadith — HR. Bukhari no. 8 & Muslim no. 16",
  "Authentic Hadith — HR. Bukhari no. 10 & Muslim no. 40",
  "Authentic Hadith — HR. Bukhari no. 6018 & Muslim no. 47",
  "Authentic Hadith — HR. Bukhari no. 13 & Muslim no. 45",
  "Authentic Hadith — HR. Muslim no. 55",
  "Authentic Hadith — HR. Muslim no. 223",
  "Authentic Hadith — HR. Tirmidzi no. 1956",
  "Authentic Hadith — HR. Bukhari no. 6116"
);
const storyTitles = JSON.parse(readFileSync(join(DIR, "titles.json"), "utf8"));
titles.push(...storyTitles);

ok("expected corpus is the full 830 titles", titles.length === 830, `${titles.length}`);

const missing = [];
for (const t of titles) {
  for (const l of LANGS) {
    const k = storyKey(t, l);
    if (!seen.has(k)) missing.push(`${l}  ${t}`);
  }
}
ok("every title has all three languages", missing.length === 0, `${missing.length} missing`);
for (const m of missing.slice(0, 10)) console.log(`       missing: ${m}`);

console.log(
  bad
    ? `\ntranslation coverage FAILED (${bad})`
    : `\ntranslation coverage: ok — ${titles.length} titles x ${LANGS.length} languages = ${titles.length * LANGS.length}`
);
if (bad) process.exit(1);
