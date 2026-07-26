/**
 * Huruf sambung: the rule the Iqro drills were generated without.
 *
 * Six Arabic letters — ا د ذ ر ز و — never join to the letter that follows.
 * The generator did not know that, so it built "joined pairs" by walking the
 * alphabet: اَبَ and رَزَ were presented exactly like بَتَ, and a child was shown
 * shapes that do not touch with no reason given. That is the central lesson of
 * the second book, taught by accident and therefore not at all.
 *
 * A drill may only show a non-joining letter followed by another when it is in
 * the group that exists to TEACH the rule — six of them, in jilid 2.
 *
 *   npx tsx scripts/check-iqro-joining.mjs
 */
import { getJilid, JILID_NUMBERS } from "../apps/web/src/lib/iqro.ts";

const NON = ["ا", "د", "ذ", "ر", "ز", "و"];
const TAUGHT_IN_JILID = 2;
const TAUGHT_COUNT = 6;

let bad = 0;
for (const n of JILID_NUMBERS.slice(0, 2)) {
  const flat = getJilid(n).rows.flat();
  const offenders = flat.filter((u) => u.ar.length > 2 && NON.includes(u.ar[0]));
  const allowed = n === TAUGHT_IN_JILID ? TAUGHT_COUNT : 0;
  const ok = offenders.length === allowed;
  if (!ok) bad++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} jilid ${n}: ${flat.length} drills, ` +
      `${offenders.length} starting with a non-joining letter (allowed ${allowed})`
  );
  if (!ok) for (const o of offenders.slice(0, 6)) console.log(`        ${o.ar}`);
}

// Every drill must still be non-empty and carry its audio slots.
for (const n of JILID_NUMBERS) {
  const flat = getJilid(n).rows.flat();
  const broken = flat.filter((u) => !u.ar.trim() || !u.latin.trim() || u.codes.length === 0);
  if (broken.length) {
    bad++;
    console.log(`  FAIL jilid ${n}: ${broken.length} drill(s) missing text or audio slots`);
  }
}
console.log(bad ? `\niqro joining: FAILED (${bad})` : "\niqro joining: ok");
if (bad) process.exit(1);
