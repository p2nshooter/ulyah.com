/**
 * Which languages may a machine translator be pointed at?
 *
 * The rule is one sentence — a page may be translated into the language of the
 * site showing it, and into nothing else — and it is worth a check because it
 * is enforced in one place and read in several. If the gate ever widens back to
 * the twenty-four languages ulyah.com used to render itself in, nothing else in
 * the build would notice: the site would still compile, still typecheck, still
 * serve. It would simply start writing cache rows nobody reads again, into the
 * one resource the platform cannot afford to run out of, and the first symptom
 * would be a full database.
 *
 * So the list is pinned here, both halves of it:
 *   · the five that ARE served, one per site (id, en, de, es, fr);
 *   · a sample of the ones that are not, including languages that used to be.
 *
 * And the pruning predicate is checked against the same list, because a prune
 * that disagrees with the gate is the worst of both: it deletes translations the
 * sites are still reading, every night, and they are re-fetched every day.
 *
 *   npx tsx scripts/check-mt-targets.ts
 */
import { MT_TARGET_LANGS, machineTranslationAllowed, LOCALE_SITE } from "../packages/shared/src/i18n";

let failed = 0;
function check(what: string, got: unknown, want: unknown, why: string) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what.padEnd(52)} → ${JSON.stringify(got)} (expected ${JSON.stringify(want)})`);
  if (!ok) console.log(`        ${why}`);
}

console.log("=== the list is one language per site ===");
check("MT_TARGET_LANGS", [...MT_TARGET_LANGS], ["id", "en", "de", "es", "fr"], "ulyah.com + the four sibling domains");
check(
  "every domain language is in it",
  Object.keys(LOCALE_SITE).every((c) => MT_TARGET_LANGS.includes(c)),
  true,
  "a sibling site that cannot be translated into renders in Indonesian"
);

console.log("\n=== a site's own language is a legal target ===");
// Owner: "tetep terjemahkan ke bahasa Indonesia untuk ulyah.com dan bahasa
// masing-masing dr ekosistem." An English tafsir edition must still reach an
// Indonesian reader in Indonesian.
check("en → id (English source, Indonesian reader)", machineTranslationAllowed("id", "en"), true, "ulyah.com is translated INTO Indonesian");
check("ar → id (Arabic source, Indonesian reader)", machineTranslationAllowed("id", "ar"), true, "same rule; scripture itself is masked in lib/mt.ts");
check("id → fr (1fr.fr)", machineTranslationAllowed("fr", "id"), true, "the sibling sites are why MT exists");
check("id → de (tilawa.de)", machineTranslationAllowed("de", "id"), true, "");
check("id → es (dawa.es)", machineTranslationAllowed("es", "id"), true, "");
check("id → en (xad.es)", machineTranslationAllowed("en", "id"), true, "");

console.log("\n=== nothing else is ===");
for (const code of ["ru", "ar", "zh", "ja", "th", "ur", "hi", "tr", "nl", "pl"]) {
  check(`id → ${code}`, machineTranslationAllowed(code, "id"), false, "ulyah.com is not rendered in this language any more");
}
check("empty target", machineTranslationAllowed("", "id"), false, "a missing lang must never fall through to translating");

console.log("\n=== same language in and out is not a translation ===");
check("id → id", machineTranslationAllowed("id", "id"), false, "would spend an upstream call to return the input");
check("fr → fr", machineTranslationAllowed("fr", "fr"), false, "");

console.log("\n=== the prune keeps exactly what the gate serves ===");
// scripts/prune-mt-unserved.ts deletes every mt_cache row whose target is NOT
// in MT_TARGET_LANGS. Run that predicate here over a realistic set of keys.
const kept = (k: string) => MT_TARGET_LANGS.includes(k.slice(6, 8));
for (const [key, want, why] of [
  ["mt:en-id:abc123", true, "an English source rendered for ulyah.com"],
  ["mt:id-fr:abc123", true, "1fr.fr reads this on every page"],
  ["mt:ar-es:abc123", true, "dawa.es reads this (Arabic-sourced rows have their own rule)"],
  ["mt:id-th:abc123", false, "Thai is not served anywhere"],
  ["mt:id-ru:abc123", false, "Russian is not served anywhere"],
  ["mt:en-ja:abc123", false, "Japanese is not served anywhere"],
] as [string, boolean, string][]) {
  check(`${key} survives the prune`, kept(key), want, why);
}

console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
