/**
 * The whole path for one hadith paragraph — mask, translate, restore — against
 * a translator built to destroy it: one that renders Arabic as a pious phrase
 * (exactly what put "si dios quiere" where the matn should be, 232 times) and
 * mangles names. Whatever survives did so because it was never sent.
 *
 *   node scripts/check-scripture-survives.mjs
 */
// Full path for one real hadith paragraph: mask -> translate -> restore.
// The "translator" here is a stub that mangles anything it is given, which is
// the point: whatever survives did so because it was never sent.
import { maskProtected } from "./mt-key.mjs";

const SOURCE = `From Tamim Ad-Dari radhiyallahu 'anhu, the Messenger of Allah said:

إِنَّ الدِّينَ النَّصِيحَةُ

"The religion is sincere counsel: to Allah, to His Book, to His Messenger."

Grade: authentic. Source: HR. Muslim no. 55.`;

const { masked, map } = maskProtected(SOURCE);

// A translator that would have destroyed the original: it renders Arabic as a
// pious phrase (exactly what produced "si dios quiere") and mangles names.
const hostile = (t) =>
  t.replace(/[؀-ۿ][؀-ۿ\s]*/g, "si dios quiere")
   .replace(/Muslim/g, "musulmán")
   .replace(/HR\./g, "RRHH.")
   .replace(/The religion is sincere counsel/, "La religión es un consejo sincero")
   .replace(/From/, "De").replace(/the Messenger of Allah said/, "el Mensajero de Allah dijo")
   .replace(/Grade: authentic\. Source:/, "Grado: auténtico. Fuente:");

const translated = hostile(masked);
const final = translated.replace(/@@\s*(\d+)\s*@@/g, (_, d) => map[Number(d)] ?? "");

const arabicIntact = final.includes("إِنَّ الدِّينَ النَّصِيحَةُ");
const nameIntact = final.includes("Muslim no. 55") || final.includes("Muslim");
const noPious = !final.includes("si dios quiere");
console.log(final);
console.log("\n--- checks ---");
console.log((arabicIntact ? "ok   " : "FAIL ") + "Arabic matn reproduced character-for-character");
console.log((noPious   ? "ok   " : "FAIL ") + "no pious phrase substituted for scripture");
console.log((nameIntact? "ok   " : "FAIL ") + "collector name survived");
process.exit(arabicIntact && noPious && nameIntact ? 0 : 1);
