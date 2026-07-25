/**
 * The --one parity decision, checked against the numbers that exposed it.
 *
 * A dispatch of `--langs=de --one` translated nothing and exited successfully.
 * The cause: coverage was measured only for the languages the run was asked to
 * warm, so de became both the queue and the benchmark, was trivially at 100%,
 * and the run announced "every language is at parity". A run that does nothing
 * while reporting success is the worst failure this job has, because it is
 * indistinguishable from a corpus that was already finished.
 *
 *   node scripts/check-warm-parity.mjs
 */
// Real mt:id-<lang> counts from D1 at the moment the run did nothing.
const REAL = { en: 15833, fr: 4357, de: 4151, es: 2371, bn: 1002, ha: 533 };
const PARITY_RATIO = 0.99;

function decide(langs, measureAll) {
  const cached = new Map();
  const measured = measureAll ? Object.keys(REAL) : langs;
  for (const l of measured) cached.set(l, REAL[l] ?? 0);
  const best = Math.max(0, ...cached.values());
  const queue = [...langs].sort((a, b) => (cached.get(a) ?? 0) - (cached.get(b) ?? 0));
  const short = queue.filter((l) => (cached.get(l) ?? 0) < best * PARITY_RATIO);
  return { best, picked: short[0] ?? null };
}

let bad = 0;
const ok = (n, c, x = "") => { if (!c) bad++; console.log(`  ${c ? "ok  " : "FAIL"} ${n} ${x}`); };

// The dispatch that did nothing: --langs=de --one
const before = decide(["de"], false);
ok("BEFORE: de is its own benchmark", before.best === 4151, `best=${before.best}`);
ok("BEFORE: nothing is picked, run exits having done nothing", before.picked === null);

const after = decide(["de"], true);
ok("AFTER: the benchmark is the best-covered language", after.best === 15833, `best=${after.best}`);
ok("AFTER: de is picked and warmed", after.picked === "de", `picked=${after.picked}`);

// The normal all-languages dispatch must be unchanged: neediest first.
const allLangs = Object.keys(REAL);
const allBefore = decide(allLangs, false);
const allAfter = decide(allLangs, true);
ok("all-languages behaviour is unchanged", allBefore.picked === allAfter.picked && allAfter.picked === "ha",
   `${allBefore.picked} / ${allAfter.picked}`);

// A language that genuinely IS the best must still report parity, not loop.
const bestOnly = decide(["en"], true);
ok("asking for the best-covered language still reports parity", bestOnly.picked === null);

const failed = bad > 0;
console.log(failed ? `parity check FAILED (${bad})` : "parity check: ok");
if (failed) process.exit(1);
