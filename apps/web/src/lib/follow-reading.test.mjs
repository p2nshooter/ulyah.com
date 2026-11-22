/**
 * The reading band (owner, 22 Nov 2026: "penunjuk kata langsung pindah ke atas"). A word or the first line of a
 * passage inside the band never moves the page; outside it, the TOP edge — never the centre — goes to the
 * reading line, so a passage taller than the screen still shows the words being read.
 */
import { followDelta, READING_BAND } from "./follow-reading.ts";

let failed = 0;
function eq(got, want, label) {
  if (got === want) return;
  failed++;
  console.error(`FAIL  ${label}\n  got:  ${got}\n  want: ${want}`);
}
const H = 800;
const line = Math.round(H * READING_BAND.line); // 240

eq(followDelta(300, 330, H), 0, "a word in the band does not move the page");
eq(followDelta(40, 70, H), 40 - line, "a word under the sticky header comes down to the reading line");
eq(followDelta(700, 730, H), 700 - line, "a word near the player bar goes up to the reading line");
// A passage 2,000 px tall whose top is on screen: its first line is in the band — leave it.
eq(followDelta(200, 2200, H), 0, "a tall passage whose first line is visible stays put");
// The old bug: centring a 2,000 px passage put its top 600 px ABOVE the screen. Now its top is the target.
eq(followDelta(-600, 1400, H), -600 - line, "a tall passage above the screen is brought back by its TOP");
eq(followDelta(900, 2900, H), 900 - line, "a tall passage below the screen is landed by its top, not its middle");

if (failed) {
  console.error(`\n${failed} reading-band check(s) failed`);
  process.exit(1);
}
console.log("reading band: ok");
