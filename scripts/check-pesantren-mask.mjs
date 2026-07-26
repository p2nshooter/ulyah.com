/**
 * The kitab pesantren translator sends Indonesian terjemah to gtx for the
 * sibling sites. Until now it sent them raw, and gtx does two things to a
 * hadith that no reader can catch:
 *
 *   · "HR." — hadits riwayat, "narrated by" — comes back as "recursos humanos"
 *     in Spanish. That bug was already found live, in 232 rows;
 *   · a run of Arabic gets replaced with a pious phrase of the translator's
 *     own invention, because it recognised the script and rendered it.
 *
 * The terjemah now being filled from the hadith corpus ends with exactly that
 * citation — "(HR. Bukhari no. 1)" — so this is not hypothetical.
 *
 * These cases run the masking against a translator written to commit both
 * crimes, and assert the citation and the Arabic come back untouched.
 */
import { maskProtected } from "./mt-key.mjs";

/**
 * The shared list covers the book names and "no." but not the citation markers
 * themselves, so the translator script masks those too. Kept in step with
 * CITATION_MARKER in scripts/translate-pesantren.ts.
 */
const CITATION_MARKER = /\b(?:HR|QS)\s*\.?/gi;
function maskProtectedPlus(text) {
  const { masked, map } = maskProtected(text);
  const out = masked.replace(CITATION_MARKER, (m) => {
    const i = map.length;
    map.push(m);
    return `@@${i}@@`;
  });
  return { masked: out, map };
}

let failed = 0;
function ok(cond, label) {
  if (cond) return;
  failed++;
  console.error(`FAIL  ${label}`);
}

/** The same restore the translator script performs. */
function unmask(text, map) {
  let out = text;
  for (let i = 0; i < map.length; i++) {
    const sentinel = new RegExp(`@@\\s*${i}\\s*@@`, "g");
    if (!sentinel.test(out)) return null;
    out = out.replace(sentinel, map[i]);
  }
  return /@@\d+@@/.test(out) ? null : out;
}

/** Renders any Arabic as a pious phrase and mangles the citation, as gtx does. */
function hostileTranslator(masked) {
  return masked
    .replace(/[؀-ۿ][؀-ۿ\s]*/g, "si dios quiere")
    .replace(/\bHR\.?/gi, "recursos humanos")
    .replace(/\bBukhari\b/gi, "el bujarra")
    .replace(/\bno\.?/gi, "número")
    .replace(/Telah menceritakan kepada kami/gi, "Nos han contado");
}

const TERJEMAH =
  "Telah menceritakan kepada kami Abdullah bin Yusuf, Rasulullah bersabda: " +
  "إنما الأعمال بالنيات\n\n(HR. Bukhari no. 1)";

const { masked, map } = maskProtectedPlus(TERJEMAH);

ok(!/[؀-ۿ]/.test(masked), `no Arabic reaches the translator: ${JSON.stringify(masked)}`);
ok(masked.includes("@@"), "something was actually masked");

const restored = unmask(hostileTranslator(masked), map);
ok(restored !== null, "the hostile translation still restores");
ok(
  restored?.includes("إنما الأعمال بالنيات"),
  `the Arabic survives verbatim: ${JSON.stringify(restored)}`
);
ok(!restored?.includes("si dios quiere"), "no invented pious phrase reaches the reader");
ok(restored?.includes("Bukhari"), `the narrator's book keeps its name: ${JSON.stringify(restored)}`);
ok(!restored?.includes("recursos humanos"), "HR. never becomes human resources");
ok(!restored?.includes("el bujarra"), "Bukhari is never rendered as a common noun");
// The prose around the protected parts is still expected to be translated.
ok(restored?.includes("Nos han contado"), "the Indonesian prose really was translated");

// A translator that eats a sentinel must be refused outright, not half-applied.
ok(unmask(masked.replace(/@@0@@/, ""), map) === null, "a lost sentinel throws the whole string away");

// A row that is nothing but Arabic has nothing to translate.
const arabicOnly = maskProtectedPlus("إنما الأعمال بالنيات");
ok(
  !/[A-Za-z]/.test(arabicOnly.masked.replace(/@@\d+@@/g, "")),
  "an Arabic-only row leaves no translatable text behind"
);

if (failed) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log("pesantren masking: citations and Arabic survive a translator that attacks both.");
