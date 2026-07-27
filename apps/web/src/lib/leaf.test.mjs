/**
 * A leaf that splits a matn in half is worse than a leaf that runs long: the
 * reader loses the sentence and the reciter stops mid-word. And the pager
 * follows the reciter, so leafOf has to find every passage — a passage on no
 * leaf would freeze the page while the voice carried on.
 *
 * Sizes here are the real ones: an Alfiyah bait is ~45 characters, a passage of
 * Minhajut Thalibin runs to 12,517.
 */
import { paginateLeaves, leafOf, LEAF_INK } from "./leaf.ts";

let failed = 0;
function ok(cond, label) {
  if (cond) return;
  failed++;
  console.error(`FAIL  ${label}`);
}
function eq(got, want, label) {
  ok(got === want, `${label}\n  got:  ${got}\n  want: ${want}`);
}

const bait = (id) => ({ id, text_ar: "ب".repeat(45), translation_id: "t".repeat(40) });
const long = (id, n) => ({ id, text_ar: "ط".repeat(n), translation_id: null });

// --- nothing is ever lost or reordered ---------------------------------
const many = Array.from({ length: 200 }, (_, i) => bait(i + 1));
const leaves = paginateLeaves(many);
eq(
  leaves.reduce((n, l) => n + l.length, 0),
  200,
  "every passage lands on exactly one leaf"
);
eq(
  leaves.flat().map((m) => m.id).join(","),
  many.map((m) => m.id).join(","),
  "leaves keep the kitab's own order"
);
ok(leaves.length > 1, `200 bait fill more than one leaf, got ${leaves.length}`);
ok(
  leaves.every((l) => l.length > 0),
  "no empty leaf is ever emitted"
);

// --- a passage is never cut across a turn -------------------------------
const huge = [long(1, 12517), bait(2), long(3, 6760)];
const wide = paginateLeaves(huge);
ok(
  wide.every((l) => l.length >= 1),
  "a passage longer than a whole leaf still gets a leaf"
);
eq(wide.flat().length, 3, "the long passages are not dropped");
ok(
  wide.some((l) => l.length === 1 && l[0].id === 1),
  "the 12,517-character matn sits alone rather than being split"
);

// --- the budget is respected where it can be ----------------------------
const packed = paginateLeaves(Array.from({ length: 40 }, (_, i) => bait(i + 1)));
for (const l of packed) {
  const ink = l.reduce((n, m) => n + m.text_ar.length + (m.translation_id?.length ?? 0), 0);
  // Only the passage that tips the leaf over may exceed the budget.
  const withoutLast = ink - (l[l.length - 1].text_ar.length + (l[l.length - 1].translation_id?.length ?? 0));
  ok(withoutLast <= LEAF_INK, `a leaf fills up to the budget, not past it (${withoutLast} > ${LEAF_INK})`);
}

// --- the pager can always follow the reciter ----------------------------
for (const m of many) {
  ok(leafOf(leaves, m.id) >= 0, `passage ${m.id} is findable, or the page would freeze mid-recitation`);
}
eq(leafOf(leaves, many[0].id), 0, "the first passage is on the first leaf");
eq(leafOf(leaves, 99999), -1, "an unknown passage reports no leaf rather than guessing 0");
eq(leafOf(leaves, null), -1, "nothing being read reports no leaf");

// --- degenerate input ---------------------------------------------------
eq(paginateLeaves([]).length, 1, "an empty bab still renders one (blank) leaf");
eq(paginateLeaves([]) [0].length, 0, "that leaf holds nothing");

if (failed) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log("leaf pagination: order kept, nothing split, the reciter is always findable.");
