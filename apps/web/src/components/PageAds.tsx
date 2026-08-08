"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { NetworkAd, tenantHasNetworkAds, type NetworkAdUnit } from "@/components/NetworkAd";

/**
 * In-content ad placement for EVERY page, without touching a single page file.
 *
 * The owner asked for 4–5 ads on every page and link, "tp yg elegan, posisi yg
 * pas, indah dan elegan". Two ads bolted together above the footer is neither
 * five nor elegant, and editing ~50 page files by hand would drift apart the
 * moment a new page is added. So this component reads the page that actually
 * rendered and places the units itself:
 *
 *   - it measures <main> and works out how many slots the page can carry
 *     without crowding — roughly one per 900 px of content, capped at 3 — so a
 *     short page never gets the same load as a long reading page;
 *   - it spreads them evenly down the usable height instead of using one fixed
 *     gap, so a 1,700 px page and a 6,000 px page both look deliberate;
 *   - it only ever inserts BETWEEN top-level blocks (after a section, never
 *     inside one), so an ad can never land mid-sentence or split a card grid;
 *   - it leaves the tail of the page alone — the footer cluster is already
 *     there and two ads back to back read as a wall;
 *   - it rotates native → rectangle → banner so the page does not read as
 *     three identical grey boxes.
 *
 * MEASURING MORE THAN ONCE MATTERS. Many pages here (kisah, hadits, kitab,
 * anak…) fetch their content from api.ulyah.com after mount, so <main> is still
 * a min-h-screen skeleton for the first second or two. A single early
 * measurement saw an empty page and placed nothing. So placement retries on a
 * schedule and watches <main> for growth, and it only ever ADDS slots below the
 * ones already placed — an ad that has started loading is never moved or
 * remounted, which would burn the impression and flicker.
 *
 * Anchors are plain sibling nodes appended after a block and removed on
 * cleanup, and every DOM call is guarded, so a page whose markup does not suit
 * injection simply gets no in-content ads rather than an error.
 *
 * Together with the banner + native pair the layout renders before the footer,
 * a normal content page ends up with 5 units and a genuinely short one with 3.
 */

/** Roughly how much content earns one in-content slot. Deliberately generous
 *  (ceil, not round) so a medium page still gets two rather than one — the
 *  owner asked for 4–5 units per page, and the footer pair only supplies two. */
const PX_PER_SLOT = 900;
/** Never more than this many injected units, however long the page. */
const MAX_SLOTS = 3;
/** A block shorter than this is a caption or a one-line note; putting an ad
 *  after it looks arbitrary. */
const MIN_BLOCK_PX = 60;
/** A level of the tree needs at least this many real blocks before we accept
 *  it as the place where the page is actually divided into sections. */
const MIN_CANDIDATES = 3;
/** Below this many in-content units, add one more to the closing cluster. */
const TAIL_TOPUP_BELOW = 2;
/** Absolute floor for the gap between two injected units. */
const MIN_SEP_PX = 450;
/** Re-measure at these delays, then stop. Covers server-rendered pages (the
 *  first tick) through to slow client-side data (the last). */
const RETRY_MS = [350, 1200, 2600, 5000, 9000];

/** Formats in the order they are used down the page. */
const ROTATION: NetworkAdUnit[] = ["native", "rectangle", "banner"];

/** Pages where an injected ad would get in the way of a focused task. The
 *  footer pair still runs on these; only the in-content ones are skipped. */
const SKIP = [
  "/admin",
  "/masuk",
  "/daftar",
  "/akun",
  "/donasi",
  "/kiblat", // live compass — needs the full screen steady
  "/quran/mushaf", // page-turning reader
  "/quran-flipbook",
];

/** Elements an ad must never be placed directly after: a heading belongs with
 *  the text underneath it, and splitting the two reads as a mistake. */
const NEVER_AFTER = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

function realBlocks(node: HTMLElement): HTMLElement[] {
  return Array.from(node.children).filter(
    (c): c is HTMLElement =>
      c instanceof HTMLElement &&
      c.offsetHeight >= MIN_BLOCK_PX &&
      !NEVER_AFTER.has(c.tagName) &&
      !c.hasAttribute("data-ulyah-ad-anchor")
  );
}

/**
 * Find the level of the tree where the page is actually divided into sections.
 *
 * Most pages here wrap everything in one or two centring divs, and several
 * (waris, zakat, kebijakan-privasi) then put the ENTIRE body inside a single
 * tall child — so the top level offers exactly one candidate and there is
 * nowhere to place anything. So instead of only drilling through single-child
 * wrappers, keep descending into the dominant child until a level offers enough
 * real blocks to choose boundaries from.
 */
function candidateBlocks(main: HTMLElement): HTMLElement[] {
  let node: HTMLElement = main;
  let best: HTMLElement[] = [];
  for (let depth = 0; depth < 5; depth += 1) {
    const blocks = realBlocks(node);
    if (blocks.length > best.length) best = blocks;
    if (blocks.length >= MIN_CANDIDATES) return blocks;
    // Descend into the child that holds essentially the whole level — that is
    // the wrapper hiding the real sections.
    const kids = Array.from(node.children).filter((c): c is HTMLElement => c instanceof HTMLElement);
    let dominant: HTMLElement | null = null;
    for (const k of kids) {
      if (!dominant || k.offsetHeight > dominant.offsetHeight) dominant = k;
    }
    if (!dominant || dominant.offsetHeight < node.offsetHeight * 0.35) break;
    node = dominant;
  }
  return best;
}

export function PageAds() {
  const pathname = usePathname();
  const [anchors, setAnchors] = useState<HTMLElement[]>([]);
  /** Where the extra closing unit goes when the page was too short to carry
   *  two in-content slots. Null means the cluster in the layout is enough. */
  const [tail, setTail] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!tenantHasNetworkAds()) return;
    if (SKIP.some((p) => pathname?.includes(p))) return;

    const created: HTMLElement[] = [];
    /** Y of the lowest anchor placed so far, relative to the top of <main>. */
    let lastY = 0;
    let cancelled = false;
    const timers: number[] = [];
    let observer: ResizeObserver | null = null;
    let growDebounce = 0;

    /** Add whatever slots the page can now carry, below the ones already there. */
    const place = () => {
      if (cancelled || created.length >= MAX_SLOTS) return;
      try {
        const main = document.querySelector("main");
        if (!(main instanceof HTMLElement)) return;

        const total = main.offsetHeight;
        if (total < MIN_SEP_PX) return;

        const blocks = candidateBlocks(main);
        if (blocks.length < 2) return;

        // How many the page has earned, and how far apart they should sit.
        const want = Math.min(MAX_SLOTS, Math.max(1, Math.ceil(total / PX_PER_SLOT)));
        if (created.length >= want) return;
        // Leave the last stretch to the footer cluster — proportional, so a
        // medium page is not squeezed out by a fixed reserve.
        const usable = total - Math.min(500, total * 0.15);
        const sep = Math.max(MIN_SEP_PX, usable / (want + 1));

        const mainTop = main.getBoundingClientRect().top + window.scrollY;
        const last = blocks[blocks.length - 1];

        for (const block of blocks) {
          if (created.length >= want) break;
          if (block === last) break; // never after the final block
          const bottom = block.getBoundingClientRect().bottom + window.scrollY - mainTop;
          if (bottom > usable) break;
          if (bottom - lastY < sep) continue;

          const anchor = document.createElement("div");
          anchor.setAttribute("data-ulyah-ad-anchor", "");
          anchor.className = "w-full";
          block.insertAdjacentElement("afterend", anchor);
          created.push(anchor);
          lastY = bottom;
        }

        if (created.length && !cancelled) setAnchors([...created]);
      } catch {
        /* markup we cannot place into — the footer cluster still runs */
      }
    };

    for (const delay of RETRY_MS) timers.push(window.setTimeout(place, delay));

    // After the last retry, settle the page's total. A page that could only
    // take 0–1 in-content units would otherwise close on just the layout's
    // banner + native pair; give it one more so it still reads as a proper set.
    timers.push(
      window.setTimeout(() => {
        if (cancelled || created.length >= TAIL_TOPUP_BELOW) return;
        const host = document.getElementById("ulyah-ad-tail");
        if (host instanceof HTMLElement) setTail(host);
      }, RETRY_MS[RETRY_MS.length - 1]! + 600)
    );

    // Content that arrives late (client-side fetches) grows <main>; re-run then
    // too, so those pages get their slots as soon as they have the height.
    try {
      const main = document.querySelector("main");
      if (main instanceof HTMLElement && typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          window.clearTimeout(growDebounce);
          growDebounce = window.setTimeout(place, 400);
        });
        observer.observe(main);
      }
    } catch {
      /* no ResizeObserver — the retry schedule still covers most pages */
    }

    return () => {
      cancelled = true;
      for (const t of timers) window.clearTimeout(t);
      window.clearTimeout(growDebounce);
      observer?.disconnect();
      setAnchors([]);
      setTail(null);
      // Let React unmount the portals before the containers go away.
      const doomed = [...created];
      window.setTimeout(() => {
        for (const a of doomed) {
          try {
            a.remove();
          } catch {
            /* already gone with the route change */
          }
        }
      }, 0);
    };
  }, [pathname]);

  if (!anchors.length && !tail) return null;

  return (
    <>
      {anchors.map((anchor, i) =>
        createPortal(
          <NetworkAd unit={ROTATION[i % ROTATION.length]} className="my-2" />,
          anchor,
          `ulyah-ad-${i}`
        )
      )}
      {tail ? createPortal(<NetworkAd unit="rectangle" />, tail, "ulyah-ad-tail") : null}
    </>
  );
}
