/**
 * Scripture is never machine-translated out of Arabic.
 *
 * This is a rule about content, enforced here because it is invisible at
 * runtime: a bad hadith translation looks exactly like a good one to anyone
 * who cannot read the original. It went unnoticed long enough to write 307,634
 * rows and fill the database, and what those rows say is:
 *
 *   عن أبي ذر الغفاري   →  "Atas wewenang Abu Dzar al-Ghifari"
 *   أم القرآن           →  "Bunda Al-Qur'an"
 *
 * "عن" in a chain of narration means "dari" — who heard it from whom. "Atas
 * wewenang" makes a different claim about the sanad. "أم القرآن" is a name for
 * Al-Fatihah. Owner: "alquran jgn d terjemahin sembarangan, krn alquran udah
 * punya tafsirnya sendiri" — hadits matn and asbabun nuzul are under the same
 * rule, being scripture and narration about scripture.
 *
 * Human translations are fine as a SOURCE: `hadits.text_en` and `text_id` were
 * made by people from the Arabic, and carrying one of them into French is a
 * problem machine translation can actually solve. What must never happen is a
 * machine reading the Arabic itself.
 *
 * Catalogue metadata — a kitab's `title_ar`, its description, its topic list —
 * is deliberately NOT covered. A book title is a label, not scripture, and
 * leaving those untranslated would put Arabic headings on the French site.
 *
 *   node scripts/check-no-arabic-mt.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const content = read("apps/worker-api/src/routes/content.ts");
const tafsir = read("apps/worker-api/src/lib/tafsir-source.ts");

const results = [];
const check = (ok, label, detail) => results.push({ ok: Boolean(ok), label, detail });

// ── 1. Hadits ────────────────────────────────────────────────────────────────
// The reader's per-hadith translation must not take `text_ar` as its input.
// Matching the argument rather than the mention: `text_ar` legitimately appears
// all over this file (it is selected, returned, and fed to the sanad parser).
const HADITS_FROM_ARABIC = /translate(?:Text|CachedOnly)\s*\(\s*[^)]*?\.text_ar\b/;
check(
  !HADITS_FROM_ARABIC.test(content),
  "hadits are not machine-translated from text_ar",
  "found translateText(..., <something>.text_ar, ...) in routes/content.ts"
);

// And it must still be translated for locales that have no curated column —
// otherwise the "fix" is just a French reader staring at Indonesian.
check(
  /translateText\(\s*c\.env,\s*source,\s*locale,\s*from\s*\)/.test(content),
  "hadits are still translated, from the curated column",
  "expected translateText(c.env, source, locale, from) — the text_en/text_id path"
);
check(
  /const from = h\.text_en \? \("en" as const\) : \("id" as const\)/.test(content),
  "the curated English column is preferred as the source",
  "expected the source language to follow text_en when present"
);

// ── 2. Asbabun nuzul ─────────────────────────────────────────────────────────
// The Sahih Arabic collection is for Arabic readers. Everyone else falls
// through to the Al-Wahidi English edition, which people translated.
const sahih = tafsir.slice(tafsir.indexOf("async function fetchSahihAsbab"));
const sahihBody = sahih.slice(0, sahih.indexOf("\n}\n") + 1);
check(
  /if \(lang !== "ar"\) return null;/.test(sahihBody),
  "Sahih Asbab al-Nuzul is served to Arabic readers only",
  'expected an early `if (lang !== "ar") return null;` in fetchSahihAsbab'
);
check(
  !/translateText\(/.test(sahihBody),
  "Sahih Asbab al-Nuzul is not machine-translated",
  "found a translateText call inside fetchSahihAsbab"
);

// ── 3. The tafsir source picker ──────────────────────────────────────────────
// An Arabic tafsir edition is handed over as Arabic, labelled so the panel can
// set it right-to-left. Only English editions are translated onward.
check(
  !/nativeLocale === "en" \|\| nativeLocale === "ar"/.test(tafsir) &&
    !/nativeLocale === "ar" \? undefined/.test(tafsir),
  "the tafsir picker does not machine-translate Arabic editions",
  "fetchTafsirEdition still routes an Arabic-native edition through translateText"
);

// ── 4. Nothing quietly relies on the Arabic default ──────────────────────────
// translateText's fourth argument defaults to "ar". That default is right for
// the kitab catalogue and wrong for anything scriptural, so every call in the
// two files above states its source language explicitly.
for (const [file, src] of [
  ["routes/content.ts", content],
  ["lib/tafsir-source.ts", tafsir],
]) {
  const calls = [...src.matchAll(/translate(?:Text|CachedOnly)\(([^;]*?)\)\s*[;,)]/gs)];
  const scriptural = calls.filter((m) => /text_ar|arabic|\bmatn\b/i.test(m[1]));
  check(
    scriptural.length === 0,
    `no scriptural Arabic reaches the translator in ${file}`,
    scriptural.map((m) => m[0].replace(/\s+/g, " ").slice(0, 90)).join(" | ")
  );
}

for (const r of results) {
  console.log((r.ok ? "ok   " : "FAIL ") + r.label + (r.ok ? "" : `\n       ${r.detail}`));
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed === 0 ? 0 : 1);
