"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { NetworkAd, tenantHasNetworkAds, type NetworkAdUnit } from "@/components/NetworkAd";

/**
 * Guarantees every page and every link carries a full set of Adsterra units,
 * placed at the top, through the middle and at the bottom.
 *
 * The owner's rule is "per halaman per link wajib ada adsterra dengan posisi
 * atas bawah tengah, minimal 6 iklan per page". Hard-coding that into each
 * template does not hold: the article template already carried seven units,
 * while home, category, about, contact, privacy and terms carried three or
 * four — and any page added later would start from zero.
 *
 * So this works from what the page ACTUALLY rendered:
 *
 *   1. it finds the units already on the page ([data-network-ad]) and sorts them into
 *      top / middle / bottom, so a template that places its own ads is never
 *      doubled up;
 *   2. it fills each region up to QUOTA, which is what makes "atas tengah
 *      bawah" true on every route rather than only on articles;
 *   3. middles go on spaced section boundaries, never straight after a heading
 *      and never inside a block, so an ad cannot split a heading from its text.
 *
 * REGIONS ARE DECIDED BY DOM POSITION, NOT BY PIXELS. An earlier version cut
 * the page into percentage bands of its height. That looked right until the
 * ads themselves loaded: each one made the page taller, the bands slid under
 * the units already placed, and a page could end up reporting five "bottom"
 * ads and no middle at all. Document order does not move when an iframe grows,
 * so the quota stays true however the page reflows.
 *
 * Placement is measured after paint and retried, because several pages settle
 * their height late (fonts, images, client data). Slots are only ever ADDED,
 * never moved, so an ad that has begun loading is never remounted.
 */

/** Units per region. Six per page, weighted towards the reading middle. */
const QUOTA = { top: 1, middle: 3, bottom: 2 } as const;
/** Ceiling, so a rich article template is not turned into a wall. */
const MAX_TOTAL = 8;

/** A block shorter than this is a caption; an ad after it looks arbitrary. */
const MIN_BLOCK_PX = 60;
/** When a page is one atomic block, fall back to this smaller threshold so
 *  paragraph-level boundaries become usable rather than placing nothing. */
const FALLBACK_BLOCK_PX = 24;
/** A level needs this many real blocks to count as the page's section level. */
const MIN_CANDIDATES = 3;
/** Keep injected middles at least this many blocks apart. */
const MIN_BLOCK_STRIDE = 2;

const RETRY_MS = [300, 1100, 2400, 4500, 8000];

/** Routes where an injected ad would get in the way of a focused task. The
 *  closing cluster in the layout still runs on these. */
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

/** Elements an ad must never follow — a heading belongs with its text. */
const NEVER_AFTER = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

type Kind = "top" | "middle" | "bottom";
interface Slot {
  host: HTMLElement;
  kind: Kind;
  i: number;
}

function realBlocks(node: HTMLElement, minPx = MIN_BLOCK_PX): HTMLElement[] {
  return Array.from(node.children).filter(
    (c): c is HTMLElement =>
      c instanceof HTMLElement &&
      c.offsetHeight >= minPx &&
      !NEVER_AFTER.has(c.tagName) &&
      !c.hasAttribute("data-ulyah-ad-anchor") &&
      !c.hasAttribute("data-network-ad")
  );
}

/**
 * Find the level of the tree where the page is really divided into sections.
 * Most templates wrap everything in one or two centring divs and then put the
 * whole body inside a single tall child, so the top level offers one candidate
 * and there is nowhere to place anything. Keep descending into the dominant
 * child until a level offers enough blocks to choose boundaries from.
 */
function candidateBlocks(main: HTMLElement): HTMLElement[] {
  let node: HTMLElement = main;
  let best: HTMLElement[] = [];
  for (let depth = 0; depth < 5; depth += 1) {
    const blocks = realBlocks(node);
    if (blocks.length > best.length) best = blocks;
    if (blocks.length >= MIN_CANDIDATES) return blocks;
    const kids = Array.from(node.children).filter((c): c is HTMLElement => c instanceof HTMLElement);
    let dominant: HTMLElement | null = null;
    for (const k of kids) if (!dominant || k.offsetHeight > dominant.offsetHeight) dominant = k;
    if (!dominant || dominant.offsetHeight < node.offsetHeight * 0.35) break;
    node = dominant;
  }
  // A page built as one atomic block (a single long prose column, a table)
  // offers no section boundaries at the normal threshold. Rather than give up
  // and leave the middle empty, accept paragraph-sized boundaries.
  if (best.length < 2) {
    const loose = realBlocks(node, FALLBACK_BLOCK_PX);
    if (loose.length > best.length) best = loose;
  }
  return best;
}

function makeAnchor(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-ulyah-ad-anchor", "");
  return el;
}

/** True when `b` comes after `a` in document order. */
function before(a: Node, b: Node): boolean {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

export function PageAds() {
  const pathname = usePathname();
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    // NetworkAd itself obeys the central ulyah.com switch and renders nothing
    // when it is off, so an anchor left behind is simply an empty div.
    if (!tenantHasNetworkAds()) return;
    if (SKIP.some((p) => pathname?.includes(p))) return;

    const created: Slot[] = [];
    let cancelled = false;
    const timers: number[] = [];
    let observer: ResizeObserver | null = null;
    let growDebounce = 0;

    const place = () => {
      if (cancelled) return;
      try {
        const main = document.querySelector("main");
        if (!(main instanceof HTMLElement)) return;
        if (document.body.scrollHeight < 400) return;

        const blocks = candidateBlocks(main);
        const firstBlock = blocks[0] ?? null;

        // Sort every unit already on the page into a region by DOM position.
        const have: Record<Kind, number> = { top: 0, middle: 0, bottom: 0 };
        const wraps = Array.from(document.querySelectorAll("[data-network-ad]")).filter(
          (e): e is HTMLElement => e instanceof HTMLElement
        );
        for (const w of wraps) {
          if (!main.contains(w)) have.bottom += 1;
          else if (firstBlock && before(w, firstBlock)) have.top += 1;
          else have.middle += 1;
        }
        let total = wraps.length;

        const add = (host: HTMLElement, kind: Kind) => {
          created.push({ host, kind, i: created.length });
          have[kind] += 1;
          total += 1;
        };
        const room = () => total < MAX_TOTAL;

        // 1. TOP — one unit above the first real block, so it sits under the
        //    site header and over the content.
        if (have.top < QUOTA.top && firstBlock && room()) {
          const anchor = makeAnchor();
          firstBlock.insertAdjacentElement("beforebegin", anchor);
          add(anchor, "top");
        }

        // 2. MIDDLE — spread across the section boundaries. Positions come from
        //    the block list, not from pixels, so they stay put as ads load.
        const midNeed = QUOTA.middle - have.middle;
        if (midNeed > 0 && blocks.length >= 2) {
          const usable = blocks.slice(0, -1); // never after the final block
          const picked: number[] = [];
          for (let n = 1; n <= midNeed && usable.length; n += 1) {
            if (!room()) break;
            const ideal = Math.min(usable.length - 1, Math.round((usable.length * n) / (midNeed + 1)));
            // Walk outwards from the ideal index for a slot far enough from
            // the ones already taken.
            let chosen = -1;
            for (let d = 0; d < usable.length && chosen < 0; d += 1) {
              for (const idx of [ideal + d, ideal - d]) {
                if (idx < 0 || idx >= usable.length) continue;
                if (picked.some((p) => Math.abs(p - idx) < MIN_BLOCK_STRIDE)) continue;
                chosen = idx;
                break;
              }
            }
            if (chosen < 0) break;
            picked.push(chosen);
            const anchor = makeAnchor();
            usable[chosen]!.insertAdjacentElement("afterend", anchor);
            add(anchor, "middle");
          }
        }

        // 3. BOTTOM — siblings after <main>, before the footer.
        while (have.bottom < QUOTA.bottom && room() && main.parentElement) {
          const anchor = makeAnchor();
          main.insertAdjacentElement("afterend", anchor);
          add(anchor, "bottom");
        }

        if (created.length && !cancelled) setSlots([...created]);
      } catch {
        /* markup we cannot place into — the template's own ads still run */
      }
    };

    for (const d of RETRY_MS) timers.push(window.setTimeout(place, d));

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
      /* retry schedule still covers most pages */
    }

    return () => {
      cancelled = true;
      for (const t of timers) window.clearTimeout(t);
      window.clearTimeout(growDebounce);
      observer?.disconnect();
      setSlots([]);
      const doomed = created.map((s) => s.host);
      window.setTimeout(() => {
        for (const h of doomed) {
          try {
            h.remove();
          } catch {
            /* already gone with the route change */
          }
        }
      }, 0);
    };
  }, [pathname]);

  if (!slots.length) return null;

  return <>{slots.map((s) => createPortal(unitFor(s), s.host, `pa-${s.i}`))}</>;
}

/**
 * Which format each injected slot uses. A leaderboard reads best across the
 * top, the middle rotates so the page is not three identical grey boxes, and
 * the bottom closes with a native block and a clearly-labelled partner card.
 */
function unitFor(s: Slot) {
  if (s.kind === "top") return <NetworkAd unit="banner" />;
  if (s.kind === "bottom") return <NetworkAd unit={s.i % 2 === 0 ? "native" : "rectangle"} />;
  const mid: NetworkAdUnit[] = ["native", "rectangle", "banner"];
  return <NetworkAd unit={mid[s.i % mid.length]!} />;
}
