/**
 * The content bot does not publish thin articles, and does not invent reading
 * times.
 *
 * AdSense refused axto.dev with "Low value content" while the site carried 102
 * articles, so this is not about how many get written. 32 of them came from
 * this bot at a median of 429 words, one as short as 95, each declaring "7 min"
 * because the prompt asked the model for a number between 5 and 8 and it
 * returned the middle every time. A reader who finishes a "7 min" article in
 * ninety seconds has been misled by the page.
 *
 * Both rules are asserted against real numbers taken from that library, so a
 * regression fails here rather than on a review that takes weeks to appeal.
 *
 *   npx tsx scripts/check-article-depth.ts
 */
import {
  countWords,
  readingMinutes,
  MIN_WORDS,
  MIN_WORDS_PER_LANG,
} from "../apps/worker-api/src/lib/article-depth.js";

const results: { ok: boolean; label: string; detail?: string }[] = [];
const check = (ok: unknown, label: string, detail?: string) =>
  results.push({ ok: Boolean(ok), label, detail });

// ── counting ────────────────────────────────────────────────────────────────
check(countWords(["one two three"]) === 3, "counts words in one string");
check(countWords(["one two", "three four five"]) === 5, "counts across parts");
check(countWords(["  spaced   out  "]) === 2, "collapses runs of whitespace");
check(countWords(["", "   ", "\n"]) === 0, "empty and blank parts count as nothing");
check(countWords([]) === 0, "an empty article is zero words, not NaN");
check(countWords(["line\none\ttwo"]) === 3, "newlines and tabs separate words");

// ── the bar ─────────────────────────────────────────────────────────────────
// The real medians from the axto.dev library, which must not pass.
check(MIN_WORDS >= 900, `MIN_WORDS is at least 900 (is ${MIN_WORDS})`);
check(429 < MIN_WORDS, "the generated median of 429 words is rejected");
check(95 < MIN_WORDS, "the shortest generated article, 95 words, is rejected");
check(360 < MIN_WORDS, "the hand-written median of 360 words is rejected");
check(1200 >= MIN_WORDS, "a genuinely developed 1,200-word article is accepted");
check(
  MIN_WORDS_PER_LANG > 0 && MIN_WORDS_PER_LANG < MIN_WORDS,
  "a mirrored article's per-language bar sits below the single-language one",
  `MIN_WORDS_PER_LANG=${MIN_WORDS_PER_LANG}, MIN_WORDS=${MIN_WORDS}`
);

// ── reading time ────────────────────────────────────────────────────────────
// Every one of these is a real article that claimed something else.
check(readingMinutes(288) === 1, "288 words reads as 1 min, not the 7 it claimed");
check(readingMinutes(520) === 3, "520 words reads as 3 min, not the 9 it claimed");
check(readingMinutes(429) === 2, "the generated median reads as 2 min, not 7");
check(readingMinutes(0) === 1, "an empty article never reads as 0 min");
check(readingMinutes(1) === 1, "one word never reads as 0 min");
check(readingMinutes(1400) === 7, "1,400 words genuinely is a 7-minute read");
// Monotonic: a longer article can never show a shorter time.
let monotonic = true;
for (let w = 0; w < 4000; w += 37) {
  if (readingMinutes(w + 37) < readingMinutes(w)) monotonic = false;
}
check(monotonic, "reading time never decreases as an article grows");

for (const r of results) {
  console.log((r.ok ? "ok   " : "FAIL ") + r.label + (r.ok || !r.detail ? "" : `\n       ${r.detail}`));
}
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed === 0 ? 0 : 1);
