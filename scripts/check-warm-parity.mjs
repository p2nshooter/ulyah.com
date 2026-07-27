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

function decide(langs, measureAll, collectable = 0) {
  const cached = new Map();
  const measured = measureAll ? Object.keys(REAL) : langs;
  for (const l of measured) cached.set(l, REAL[l] ?? 0);
  // Mirrors warm-mt-cache.ts: parity is capped at the number of strings that
  // still exist to warm, so a historical total nobody can reach cannot become
  // a benchmark nobody can clear.
  const best = Math.min(Math.max(0, ...cached.values()), collectable || Number.POSITIVE_INFINITY);
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

// ── The deadlock the cap fixes ─────────────────────────────────────────────
//
// Real D1 counts on 27 July, with 5,204 distinct Indonesian strings left to
// collect. id→en holds 18,805 rows — keys written for text since edited or
// removed, plus the Worker's own runtime translations — so the old benchmark
// was a number no language could reach. Every pass went to Spanish, and the
// twenty-two languages at 1% were never reached at all.
const LIVE = { en: 18805, fr: 9765, de: 9113, es: 4367, ha: 714, th: 773 };
const COLLECTABLE = 5204;

// Languages with a live site today. The real code puts these first whatever
// their count — "utamain yg saat ini di pakai dulu" — so a mirror that sorts
// on count alone does not model the queue at all.
const LIVE_SITE = new Set(["en", "fr", "de", "es"]);

function decideLive(collectable) {
  const cached = new Map(Object.entries(LIVE));
  const best = Math.min(Math.max(0, ...cached.values()), collectable || Number.POSITIVE_INFINITY);
  const queue = [...cached.keys()].sort((a, b) => cached.get(a) - cached.get(b));
  const stillShort = queue.filter((l) => cached.get(l) < best * PARITY_RATIO);
  const short = [
    ...stillShort.filter((l) => LIVE_SITE.has(l)),
    ...stillShort.filter((l) => !LIVE_SITE.has(l)),
  ];
  return { best, short };
}

const stuck = decideLive(0); // uncapped — the old behaviour
ok("DEADLOCK: uncapped, the benchmark is a total nobody can reach",
   stuck.best === 18805, `best=${stuck.best}`);
ok("DEADLOCK: uncapped, even fully-warmed languages look short",
   stuck.short.includes("de") && stuck.short.includes("fr"), stuck.short.join(","));
ok("DEADLOCK: uncapped, Spanish is picked forever",
   stuck.short[0] === "es", `picked=${stuck.short[0]}`);

const fixed = decideLive(COLLECTABLE);
ok("FIXED: the benchmark is what can actually be warmed",
   fixed.best === COLLECTABLE, `best=${fixed.best}`);
ok("FIXED: languages holding every collectable string drop out",
   !fixed.short.includes("de") && !fixed.short.includes("fr") && !fixed.short.includes("en"),
   fixed.short.join(","));
ok("FIXED: Spanish is still short and still goes first — it genuinely lags",
   fixed.short[0] === "es", `picked=${fixed.short[0]}`);
ok("FIXED: the 1% languages are finally in the queue",
   fixed.short.includes("ha") && fixed.short.includes("th"), fixed.short.join(","));

// And once Spanish fills, the queue moves on rather than looping.
const done = { ...LIVE, es: COLLECTABLE };
const cachedDone = new Map(Object.entries(done));
const bestDone = Math.min(Math.max(...cachedDone.values()), COLLECTABLE);
const stillShortDone = [...cachedDone.keys()]
  .sort((a, b) => cachedDone.get(a) - cachedDone.get(b))
  .filter((l) => cachedDone.get(l) < bestDone * PARITY_RATIO);
const shortDone = [
  ...stillShortDone.filter((l) => LIVE_SITE.has(l)),
  ...stillShortDone.filter((l) => !LIVE_SITE.has(l)),
];
ok("FIXED: once Spanish fills, a switched-off language is next",
   shortDone[0] === "ha", `next=${shortDone[0]}`);

// ── Yielding a turn when a language cannot progress ────────────────────────
//
// Capping parity was not enough. Spanish still lags by ~837 strings, and ~831
// of those are answers the echo rule refuses ON PURPOSE — prose, or text with
// Arabic in it. They will never succeed, so Spanish can never reach parity and
// took every pass anyway. The chain now passes over whatever the last pass
// warmed without gaining anything.
function decideWithSkip(collectable, skip) {
  const cached = new Map(Object.entries(LIVE));
  const best = Math.min(Math.max(0, ...cached.values()), collectable || Number.POSITIVE_INFINITY);
  const queue = [...cached.keys()].sort((a, b) => cached.get(a) - cached.get(b));
  const stillShort = queue.filter((l) => cached.get(l) < best * PARITY_RATIO);
  const passedOver = stillShort.filter((l) => skip.includes(l));
  const eligible = stillShort.filter((l) => !skip.includes(l));
  return [
    ...eligible.filter((l) => LIVE_SITE.has(l)),
    ...eligible.filter((l) => !LIVE_SITE.has(l)),
    ...passedOver,
  ];
}

const spinning = decideWithSkip(COLLECTABLE, []);
ok("SPIN: with nothing skipped, Spanish takes the pass again",
   spinning[0] === "es", `picked=${spinning[0]}`);

const yielded = decideWithSkip(COLLECTABLE, ["es"]);
ok("YIELD: after a pass that gained nothing, Hausa gets the turn",
   yielded[0] === "ha", `picked=${yielded[0]}`);
ok("YIELD: Spanish is only moved to the back, never dropped",
   yielded.includes("es") && yielded[yielded.length - 1] === "es", yielded.join(","));

// If EVERY remaining language is skipped, warming one of them still beats
// warming nothing at all.
const allSkipped = decideWithSkip(COLLECTABLE, ["es", "ha", "th"]);
ok("YIELD: when everyone is skipped the run still picks somebody",
   allSkipped.length > 0 && allSkipped[0] != null, allSkipped.join(","));

const failed = bad > 0;
console.log(failed ? `parity check FAILED (${bad})` : "parity check: ok");
if (failed) process.exit(1);
