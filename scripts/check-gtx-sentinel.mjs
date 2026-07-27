/**
 * The @@n@@ sentinels must survive Google Translate.
 *
 * They are what stops a hadith's matn being paraphrased: maskProtected hides
 * every Arabic run behind @@0@@, @@1@@ …, and a translation is only accepted
 * if all of them come back. gtx does not respect that shape. A Spanish pass
 * reported:
 *
 *   Of the 2527 that failed: … 1619 lost a @@n@@ sentinel and were rejected
 *   Upstream: … gtx answered 394 of 401
 *
 * — nearly every batch answered, two thirds of the answers discarded.
 *
 * So the marker is swapped for an ordinary-looking word for the journey and
 * swapped back on return. The format itself cannot change: the cache key is
 * hash(mask(text).trim()), so renaming the sentinel would orphan every one of
 * the 400,000+ rows already stored under it. This checks the round trip, and
 * checks it survives what MT actually does to a token like that — spacing the
 * letters out, and changing their case.
 *
 * The live endpoint cannot be reached from CI, so this tests the transport,
 * not Google. That is the honest limit of it.
 */
import assert from "node:assert/strict";
import { toGtxTokens, fromGtxTokens } from "./gtx-tokens.ts";
import { maskProtected } from "./mt-key.mjs";

const count = (s) => (s.match(/@@\d+@@/g) ?? []).length;

// A real story paragraph: Indonesian prose with a quoted matn and a citation.
const source =
  "Rasulullah bersabda: إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ — dan beliau mengulanginya. " +
  "(HR. Bukhari no. 1, Muslim no. 1907)";
const { masked } = maskProtected(source);
assert.ok(count(masked) >= 2, `the fixture must actually carry sentinels (got ${count(masked)})`);

// 1. Clean round trip: nothing lost, nothing invented.
assert.equal(fromGtxTokens(toGtxTokens(masked)), masked, "an untouched round trip returns the original");

// 2. No @@ survives the outbound swap — that is the whole point.
assert.equal(count(toGtxTokens(masked)), 0, "no @@n@@ is left for gtx to trip over");

// 3. What MT actually does to such a token, one damage at a time.
const sent = toGtxTokens(masked);
const damaged = {
  "spaces between the letters": sent.replace(/XQZ(\d+)ZQX/g, (_m, n) => `X Q Z ${n} Z Q X`),
  "lower-cased": sent.toLowerCase(),
  "mixed case": sent.replace(/XQZ(\d+)ZQX/g, (_m, n) => `Xqz${n}Zqx`),
  "leading space only": sent.replace(/XQZ(\d+)ZQX/g, (_m, n) => ` XQZ ${n}ZQX`),
};
for (const [what, text] of Object.entries(damaged)) {
  assert.equal(
    count(fromGtxTokens(text)),
    count(masked),
    `every sentinel must come back when MT ${what}`
  );
}

// 4. The NUMBERS are not negotiable. They decide which Arabic run goes back
//    where, so a token whose digits changed must stay broken and be caught by
//    the caller's count check rather than quietly restoring the wrong run.
const renumbered = sent.replace(/XQZ0ZQX/, "XQZ9ZQX");
const back = fromGtxTokens(renumbered);
assert.ok(back.includes("@@9@@"), "a changed number is restored verbatim, not guessed");
assert.ok(!back.includes("@@0@@"), "the original number is not silently reinstated");

// 5. Text with no sentinels is untouched by either direction.
const plain = "Beliau berkata kepada para sahabatnya pada suatu pagi.";
assert.equal(toGtxTokens(plain), plain, "plain text goes out unchanged");
assert.equal(fromGtxTokens(plain), plain, "plain text comes back unchanged");

// 6. A double-digit index still works — the corpus has paragraphs with more
//    than ten Arabic runs, and "@@1@@" must not swallow "@@12@@".
const many = Array.from({ length: 14 }, (_, i) => `@@${i}@@`).join(" teks ");
assert.equal(fromGtxTokens(toGtxTokens(many)), many, "double-digit sentinels round-trip");
assert.equal(count(fromGtxTokens(toGtxTokens(many))), 14, "all fourteen survive");

console.log("check-gtx-sentinel: ok — @@n@@ survives the trip through gtx");
