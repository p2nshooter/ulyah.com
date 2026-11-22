/**
 * Keep what is being read in view — ONE rule for every reader on the site (Qur'an per ayat, mushaf, kitab
 * leaves and scroll view, kisah, hadits, "baca semua").
 *
 * Owner, 22 Nov 2026: "pembacaan al-quran per ayat masih kurang konsisten, dan umumnya semua pembacaan kitabnya
 * jg kurang konsisten, tidak auto memba slide, auto pindah dan penunjuk kata langsung pindah ke atas".
 *
 * Why the pointer "jumped up": every reader called `scrollIntoView({ block: "center", behavior: "smooth" })` on
 * its own — per word, per passage, per leaf — eleven calls in all, racing each other. A passage taller than the
 * screen was centred on its MIDDLE, which threw its first lines (the words being read) above the top edge; each
 * new word re-centred the page, so it never stood still; and a new smooth scroll cancelled the one in flight
 * half-way.
 *
 * The rule now:
 *  · nothing moves while the thing being read sits inside the READING BAND (16%–72% of the visible height: below
 *    a sticky header, above the player bar);
 *  · when it leaves the band, its TOP edge — never its centre — is brought to the reading line (30% from the top),
 *    so the words being spoken are always on screen however long the passage is;
 *  · one smooth scroll at a time: while one is in flight, the next word simply waits for the next check;
 *  · a visitor scrolling by hand (wheel, touch, keys) pauses following for six seconds — reading is theirs;
 *  · `prefers-reduced-motion` → the scroll is instant.
 */

export const READING_BAND = { top: 0.16, bottom: 0.72, line: 0.3 } as const;
const USER_PAUSE_MS = 6000;
const SCROLL_IN_FLIGHT_MS = 700;

let installed = false;
let userScrollAt = 0;
let programmaticUntil = 0;

function install(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const mark = () => {
    if (Date.now() > programmaticUntil) userScrollAt = Date.now();
  };
  window.addEventListener("wheel", mark, { passive: true });
  window.addEventListener("touchmove", mark, { passive: true });
  window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(e.key)) mark();
  });
}

/** Start following again at once (e.g. the visitor pressed play). */
export function resumeFollow(): void {
  userScrollAt = 0;
}

function scrollParent(el: Element): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight + 4) return p;
  }
  return null;
}

/**
 * Where an element sits relative to the band of a viewport `height` tall: 0 = in the band, otherwise how far
 * to scroll (px, positive = down) to put its top on the reading line. Pure, so it is checked without a browser.
 */
export function followDelta(top: number, bottom: number, height: number): number {
  const lineTop = height * READING_BAND.top;
  const lineBottom = height * READING_BAND.bottom;
  // The part that matters is the beginning: the whole of a word, or the first line of a passage.
  const head = Math.min(bottom, top + 64);
  if (top >= lineTop && head <= lineBottom) return 0;
  return Math.round(top - height * READING_BAND.line);
}

export function followReading(el: Element | null | undefined, opts: { force?: boolean } = {}): void {
  if (!el || typeof window === "undefined") return;
  install();
  const now = Date.now();
  if (!opts.force && now - userScrollAt < USER_PAUSE_MS) return;
  if (!opts.force && now < programmaticUntil) return;
  const box = scrollParent(el);
  const r = el.getBoundingClientRect();
  const view = box ? box.getBoundingClientRect() : { top: 0, height: window.innerHeight };
  const delta = followDelta(r.top - view.top, r.bottom - view.top, view.height);
  if (delta === 0) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  programmaticUntil = now + (reduce ? 50 : SCROLL_IN_FLIGHT_MS);
  (box ?? window).scrollBy({ top: delta, behavior: reduce ? "auto" : "smooth" });
}

/** By id — the common case for passages rendered elsewhere in the tree. */
export function followReadingId(id: string, opts?: { force?: boolean }): void {
  if (typeof document === "undefined") return;
  followReading(document.getElementById(id), opts);
}
