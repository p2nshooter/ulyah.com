/**
 * The cleaner edits the Arabic of classical kitab in place, so the one thing it
 * must never do is take a letter that belongs to the text.
 *
 * These cases are the real strings out of the database — a Safinatun Najah line
 * with a page break inside it, an Alfiyah bait, a row that is nothing but a
 * leftover tag — plus the near-misses that would betray a careless regex:
 * Arabic words that contain no latin at all, and a digit that is part of the
 * text rather than a page number.
 */
import { cleanMatn } from "./clean-pesantren-text.ts";

let failed = 0;
function eq(got, want, label) {
  if (got === want) return;
  failed++;
  console.error(`FAIL  ${label}\n  got:  ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`);
}
function ok(cond, label) {
  if (cond) return;
  failed++;
  console.error(`FAIL  ${label}`);
}

// A page marker sitting between two words keeps both words and the space.
eq(
  cleanMatn("بنوم أو غيره إلا نوم قاعد ، ممكن مقعده ms01 من الأرض"),
  "بنوم أو غيره إلا نوم قاعد، ممكن مقعده من الأرض",
  "page marker leaves the words on either side of it intact"
);

// One at the end of a row, and one at the start.
eq(cleanMatn("أقسامها تمت بخير ختمت ms2"), "أقسامها تمت بخير ختمت", "trailing marker goes with its space");
eq(cleanMatn("ms7 وقد صنف فيه بعض شيوخ"), "وقد صنف فيه بعض شيوخ", "leading marker goes with its space");

// Two-digit and zero-padded forms both occur in the editions.
eq(cleanMatn("كمسلمي أضمرت ms08 والنون"), "كمسلمي أضمرت والنون", "zero-padded marker");

// Leftover markup, whole or half-written — sirah has both.
eq(cleanMatn("</span\n\nقال ابن هشام: جهرة"), "قال ابن هشام: جهرة", "an unterminated tag is markup, not text");
eq(cleanMatn("</span>"), "", "a row that is only a tag cleans down to nothing and is dropped");
eq(cleanMatn("</span>:"), ":", "a tag with a stray colon keeps only what is left");

// What the caller drops: a row with no letter and no digit left in it was only
// ever markup, whatever punctuation the scrape left behind.
const isEmptyMatn = (s) => !/[\p{L}\p{N}]/u.test(cleanMatn(s));
ok(isEmptyMatn("</span>"), "a bare tag counts as an empty matn");
ok(isEmptyMatn("</span>:"), "a tag leaving only a colon counts as an empty matn");
ok(isEmptyMatn("   "), "whitespace counts as an empty matn");
ok(!isEmptyMatn("قال ms03 النبي"), "a row with Arabic left in it is never dropped");
ok(!isEmptyMatn("40"), "a row that is only a number still carries something");

// A Qur'anic quotation inside the prose keeps its boundary, in the ornate
// parentheses the printed kitab use. Real Fathul Mu'in and Al-Waraqat lines.
eq(
  cleanMatn("( غسل ) ظاهر ( وجهه ) لآية @QB@ فاغسلوا وجوهكم @QE@ وهو طولا"),
  "( غسل ) ظاهر ( وجهه ) لآية ﴿فاغسلوا وجوهكم﴾ وهو طولا",
  "an ayah quoted inside fiqh prose gets its ornate parentheses"
);
eq(
  cleanMatn("جاز بالزيادة مثل قوله تعالى @QB@ ليس كمثله شيء @QE@"),
  "جاز بالزيادة مثل قوله تعالى ﴿ليس كمثله شيء﴾",
  "the marker at the end of a line closes cleanly"
);
ok(
  !/@Q[BE]@/.test(cleanMatn("لآية @QB@ فاغسلوا وجوهكم @QE@")),
  "no raw quote marker survives"
);
// The words of the ayah are untouched — only its wrapper changes.
eq(
  (cleanMatn("لآية @QB@ فاغسلوا وجوهكم @QE@").match(/[؀-ۿ]+/g) ?? []).join(" "),
  "لآية فاغسلوا وجوهكم",
  "the ayah itself is not edited, only its wrapper"
);

// The bare S OpenITI uses for the salawat, from the one Fathul Qarib row that
// has it.
eq(
  cleanMatn("(و) الثاني (الصلاة على النبي S)، ويكره أن يجمع"),
  "(و) الثاني (الصلاة على النبي ﷺ)، ويكره أن يجمع",
  "the salawat abbreviation is restored, not deleted"
);
// A latin S that is not preceded by Arabic is left alone.
eq(cleanMatn("S"), "S", "a lone S with no Arabic before it is not touched");

// --- what must NOT change ------------------------------------------------
const UNTOUCHED = [
  "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى",
  "فالضم في اسم مفرد كأحمد ... وجمع تكسير كجاء الأعبد",
  "الحمد لله رب العالمين قيوم السموات والأرضين",
];
for (const s of UNTOUCHED) {
  eq(cleanMatn(s), s, `pure Arabic is returned byte for byte: ${s.slice(0, 30)}…`);
}

// A number that belongs to the text is not a page marker.
eq(cleanMatn("وهي أربعون حديثا 40 في الأصول"), "وهي أربعون حديثا 40 في الأصول", "a bare number is left alone");

// "ms" glued to an Arabic word must not be clipped out of it.
eq(cleanMatn("مسلم"), "مسلم", "an Arabic word is never touched by the latin marker rule");

// The cleaner must be idempotent — running it twice changes nothing further.
const messy = "قال ms03 النبي </span> صلى الله عليه وسلم ms04";
const once = cleanMatn(messy);
eq(cleanMatn(once), once, "cleaning an already-clean row is a no-op");
ok(!/ms\d/i.test(once), `no page marker survives: ${JSON.stringify(once)}`);
ok(!/[<>]/.test(once), `no markup survives: ${JSON.stringify(once)}`);

// Nothing may silently gain or lose Arabic letters.
const arabicOnly = (s) => (s.match(/[؀-ۿ]/g) ?? []).join("");
for (const s of [messy, "بنوم أو غيره إلا نوم قاعد ، ممكن مقعده ms01 من الأرض", ...UNTOUCHED]) {
  eq(arabicOnly(cleanMatn(s)), arabicOnly(s), `every Arabic letter survives: ${s.slice(0, 30)}…`);
}

if (failed) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log("pesantren cleaner: markers and markup go, every Arabic letter stays.");
