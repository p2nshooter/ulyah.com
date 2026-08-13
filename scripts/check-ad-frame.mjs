// The ad frame must exist, and its <title> must match the one NetworkAd reads.
//
// NetworkAd decides whether a slot filled by looking inside the frame. It first
// checks the frame's title, because a missing frame.html does not produce an
// error — the iframe quietly loads this site's own 404 page, which is
// same-origin and full of content. Measured in Chromium against a real build:
//
//   frame present, no ad   title "Advertisement"              scrollHeight 0    no-fill
//   frame missing (404)    title "404: This page could not…"  scrollHeight 90   FILLED
//
// The second row is what a reader sees as an "Iklan" rule with an empty hole
// under it on every page. Two ways that comes back: the file stops being
// deployed, or somebody renames the title. Both are silent, so both are
// asserted here.

import { readFileSync } from "node:fs";

const FRAME = "apps/web/public/ads/frame.html";
const COMPONENT = "apps/web/src/components/NetworkAd.tsx";

let frame;
try {
  frame = readFileSync(FRAME, "utf8");
} catch {
  console.error(`${FRAME} is missing.\n`);
  console.error("Every ad unit loads this file. Without it each slot shows the");
  console.error("site's 404 page inside a 90-250px iframe, which the fill watch");
  console.error("reads as a filled ad and reserves space for.");
  process.exit(1);
}

const inFrame = frame.match(/<title>([^<]*)<\/title>/);
if (!inFrame) {
  console.error(`${FRAME} has no <title>. NetworkAd uses it to recognise the frame.`);
  process.exit(1);
}

const component = readFileSync(COMPONENT, "utf8");
const inComponent = component.match(/const FRAME_TITLE = "([^"]*)"/);
if (!inComponent) {
  console.error(`${COMPONENT} no longer declares FRAME_TITLE — the fill watch cannot`);
  console.error("recognise the frame without it. Restore the constant or update this check.");
  process.exit(1);
}

if (inFrame[1] !== inComponent[1]) {
  console.error("The ad frame's title and the one NetworkAd looks for disagree:\n");
  console.error(`  ${FRAME}      <title>${inFrame[1]}</title>`);
  console.error(`  ${COMPONENT}  FRAME_TITLE = "${inComponent[1]}"`);
  console.error("\nWhile they disagree, no ad is ever recognised as filled and every");
  console.error("slot collapses. Make them the same string.");
  process.exit(1);
}

// The frame is reachable by URL, so its query string is attacker-controllable.
// Nothing unvalidated may reach a script src or the page becomes a way to run
// arbitrary third-party JavaScript on our own origin.
for (const guard of ["HEX32", "PL"]) {
  if (!frame.includes(guard)) {
    console.error(`${FRAME} no longer validates its query string (${guard} is gone).`);
    console.error("The page is reachable by URL; without validation it will load any");
    console.error("script an attacker names, on this origin.");
    process.exit(1);
  }
}

console.log(`ad frame: present, title "${inFrame[1]}" matches NetworkAd, query string still validated.`);
