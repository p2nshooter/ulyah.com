/**
 * The rule that decides whether an unchanged translation may be STORED.
 *
 * Getting this wrong writes Indonesian into a Spanish key permanently, on a
 * site people read as religion. Owner: "yg terbaik, dan yg paling shoheh,
 * karena ini agama". So the cases below lean on the refusals: everything the
 * rule accepts is a name or a label, and everything with scripture in it is
 * rejected no matter how short.
 *
 * The strings are real ones from the corpus, not invented shapes.
 */
import assert from "node:assert/strict";
import { echoIsFaithful } from "./echo-faithful.ts";
import { maskProtected } from "./mt-key.mjs";

// ── Accepted: names and labels, identical in Spanish by nature ──────────────
for (const ok of [
  "Adam",
  "Nuh",
  "Ibrahim",
  "Nabi Adam",
  "Nabi Musa",
  "Al-Fatihah",
  "Al-Baqarah",
  "Bilal bin Rabah",
  "Ramadan",
]) {
  assert.equal(echoIsFaithful(ok), true, `a proper noun may echo: ${ok}`);
}

// ── Refused: scripture, in every form ──────────────────────────────────────
// This is the rule that matters. Arabic returned unchanged was not translated,
// it was skipped — the failure the masking exists to prevent.
for (const arabic of [
  "بسم الله",
  "الحمد لله",
  "لا إله إلا الله",
  "إنما الأعمال بالنيات",
  "Nabi Adam عليه السلام",
]) {
  assert.equal(echoIsFaithful(arabic), false, `Arabic is never a faithful echo: ${arabic}`);
}

// A masked string carries scripture even though the Arabic is hidden.
const { masked } = maskProtected("Rasulullah bersabda: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ");
assert.ok(/@@\d+@@/.test(masked), "the fixture really is masked");
assert.equal(echoIsFaithful(masked), false, "a sentinel means scripture is embedded — never echo");
assert.equal(echoIsFaithful("@@0@@"), false, "a bare sentinel is not a translation");

// ── Refused: prose, however short ───────────────────────────────────────────
for (const prose of [
  "Beliau berkata kepada para sahabatnya pada suatu pagi.",
  "Siapa yang bersabar akan menang.",
  "Ini kisah pertama.",
  "Apakah engkau tahu?",
  "Manusia dan Nabi Pertama yang diciptakan Allah",
]) {
  assert.equal(echoIsFaithful(prose), false, `prose must keep being retried: ${prose}`);
}

// Terminal punctuation disqualifies even a two-word string.
assert.equal(echoIsFaithful("Nabi Adam."), false, "a full stop means a sentence");
assert.equal(echoIsFaithful("Kenapa?"), false, "a question is prose");

// ── Refused: edges ─────────────────────────────────────────────────────────
assert.equal(echoIsFaithful(""), false, "empty is not a translation");
assert.equal(echoIsFaithful("   "), false, "whitespace is not a translation");
assert.equal(echoIsFaithful("1907"), false, "digits alone are not a translation");
assert.equal(echoIsFaithful("— :"), false, "punctuation alone is not a translation");
assert.equal(
  echoIsFaithful("Kisah Para Nabi Dan Rasul Yang Wajib Diketahui"),
  false,
  "a long title is not a proper noun"
);
assert.equal(echoIsFaithful("Satu Dua Tiga Empat"), false, "four words is past the limit");
assert.equal(echoIsFaithful("Satu Dua Tiga"), true, "three words is within it");

// The limits are on the TRIMMED string, so padding cannot smuggle prose in.
assert.equal(echoIsFaithful("  Nabi Adam  "), true, "padding is ignored");

console.log("check-echo-faithful: ok — names may echo, scripture never does");
