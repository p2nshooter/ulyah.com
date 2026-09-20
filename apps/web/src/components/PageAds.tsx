"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { localizedRoute } from "@ulyah/shared/routes";
import { fetchAdView } from "@/lib/ad-config";

/**
 * Places this site's AdSense units on the page — at the top, through the middle
 * and at the bottom — wherever the page's own template does not already carry
 * one.
 *
 * ONE NETWORK NOW. This used to inject Adsterra units, and later a mix of the
 * two. Adsterra is gone from the ecosystem (owner: "hapus iklan adsterra di
 * ekosistem ulyah.com, ganti dengan adsense aja"), so every slot here is an
 * AdSense unit and a site that is not live for AdSense gets nothing — which is
 * the correct behaviour either way: AdSlot renders null until the site is
 * enabled, approved and carrying a unit id.
 *
 * The owner's rule was "per halaman per link wajib ada iklan dengan posisi atas
 * bawah tengah". Hard-coding that into each template does not hold: the article
 * template already carried several units while home, category, about, contact,
 * privacy and terms carried three or four — and any page added later would
 * start from zero.
 *
 * So this works from what the page ACTUALLY rendered:
 *
 *   1. it finds the units already on the page ([data-adsense-slot]) and sorts
 *      them into top / middle / bottom, so a template that places its own ads
 *      is never doubled up;
 *   2. it fills each region up to QUOTA, which is what makes "atas tengah
 *      bawah" true on every route rather than only on articles;
 *   3. middles go on spaced section boundaries, never straight after a heading
 *      and never inside a block, so an ad cannot split a heading from its text.
 *
 * REGIONS ARE DECIDED BY DOM POSITION, NOT BY PIXELS. An earlier version cut
 * the page into percentage bands of its height. That looked right until the
 * ads themselves loaded: each one made the page taller, the bands slid under
 * the units already placed, and a page could end up reporting five "bottom"
 * ads and no middle at all. Document order does not move when a unit grows,
 * so the quota stays true however the page reflows.
 *
 * Placement is measured after paint and retried, because several pages settle
 * their height late (fonts, images, client data). Slots are only ever ADDED,
 * never moved, so an ad that has begun loading is never remounted.
 */

/**
 * Units per region.
 *
 * Six-to-eight was a two-network number: Adsterra filled most of them and
 * AdSense took a couple. With one network the same count would be eight AdSense
 * units on a page, and "ads must not exceed the content" is a policy a site
 * gets measured against — worst case for a domain that was only just accepted.
 *
 * Four, weighted to the reading middle, is what a long article carries
 * comfortably: one above the content, two between sections, one after it. Short
 * pages take fewer, because the middles need real section boundaries to land
 * on and there simply are not four of them.
 */
const QUOTA = { top: 1, middle: 2, bottom: 1 } as const;
/** Ceiling, counting the units a template placed itself. */
const MAX_TOTAL = 5;

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

/**
 * Routes where an injected ad would get in the way of a focused task. The
 * closing cluster in the layout still runs on these.
 *
 * EVERY SITE'S SPELLING, not just this repo's. The paths are written here as
 * the routes exist on disk — Indonesian, like every folder — but a sibling site
 * serves them in its own language, and `usePathname()` returns what the browser
 * shows. So on dawa.es the compass is /quibla and the mushaf is /coran/mushaf,
 * neither of which contains "/kiblat" or "/quran/mushaf": the list matched
 * nothing, and ads were being injected into exactly the pages this list exists
 * to protect — the live qibla compass and the page-turning reader.
 *
 * Expanding through localizedRoute at module load keeps one list while making
 * it true on all five domains.
 */
const SKIP_ROUTES = [
  "/admin",
  "/masuk",
  "/daftar",
  "/akun",
  "/donasi",
  "/kiblat", // live compass — needs the full screen steady
  "/quran/mushaf", // page-turning reader
  "/quran-flipbook",
];
const SKIP = [...new Set(SKIP_ROUTES.flatMap((r) => [r, localizedRoute(r, DEFAULT_LOCALE)]))];

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
      !c.hasAttribute("data-adsense-slot")
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
  /**
   * Is AdSense live for THIS site — accepted by Google, ticked in the ulyah.com
   * admin, and carrying a unit id?
   *
   * Nothing is placed until it is. That is not only an optimisation: AdSlot
   * renders null on a site that is not live, so an anchor injected early would
   * hold an empty div AND count as a filled region in the measurement below,
   * which is how a page ends up with its quota "met" by nothing at all.
   *
   * It reads the same module-cached fetch every AdSlot on the page uses, so the
   * slots the template placed itself are in the DOM by the time the first
   * measurement runs and are counted rather than duplicated.
   */
  const [adsense, setAdsense] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAdView().then((v) => {
      if (!alive) return;
      const hasUnit = Boolean(v.slots?.in_article_1 || v.slots?.in_article || v.slots?.in_article_2);
      // Auto ads places its own units; ours would be a second set on the same
      // page, so this engine stands down entirely.
      setAdsense(Boolean(v.enabled && v.approved && !v.autoAds && v.clientId && hasUnit));
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    // Nothing to place until this site is actually serving AdSense. AdSlot
    // renders null when it is not, so an anchor placed early would be an empty
    // div — harmless, but the measurement would count it as a filled region.
    if (!adsense) return;
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
        const wraps = Array.from(document.querySelectorAll("[data-adsense-slot]")).filter(
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
  }, [pathname, adsense]);

  if (!slots.length) return null;

  return <>{slots.map((s) => createPortal(unitFor(s), s.host, `pa-${s.i}`))}</>;
}

/**
 * Which placement each injected slot uses.
 *
 * Distinct placement names rather than one repeated: they are what the admin
 * can give separate unit ids to when the owner wants per-position reporting,
 * and until then they all resolve to the same master id. The top of the page
 * and the closing slot read differently from the in-content ones, so they get
 * their own names too.
 */
function unitFor(s: Slot) {
  if (s.kind === "top") return <AdSlot placement="list" />;
  if (s.kind === "bottom") return <AdSlot placement="footer" />;
  return <AdSlot placement={s.i % 2 === 0 ? "in_article_1" : "in_article_2"} />;
}
