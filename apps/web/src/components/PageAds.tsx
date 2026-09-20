"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { localizedRoute } from "@ulyah/shared/routes";

/**
 * Places this site's AdSense units on the page — at the top, through the middle
 * and at the bottom — wherever the page's own template does not already carry
 * one.
 *
 * ONE NETWORK, NO SWITCHES. This used to inject Adsterra units, and later a mix
 * of the two; Adsterra is gone from the ecosystem (owner: "hapus iklan adsterra
 * … ganti dengan adsense aja") and the per-site config that gated the rest went
 * with it ("pokoknya ketika ads di pasang langsung online"). So every slot here
 * is an AdSense unit and it is placed on every site, immediately. A domain
 * Google has not accepted yet simply does not fill, and AdSlot collapses the
 * space it was holding.
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
/**
 * And at least this far, in pixels, from every other ad on the page.
 *
 * Blocks are not a length: three list rows can be 90px, and two units placed
 * one block apart then sit almost on top of each other. Measured on the hub's
 * kitab index: in-content units at y=448 and y=547, 99px apart, on a page
 * 1714px tall. That reads as a page built around its ads, which is both the
 * thing readers resent and the thing "ads must not exceed the content" is
 * measured on.
 */
const MIN_GAP_PX = 500;

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
function candidateBlocks(main: HTMLElement): { host: HTMLElement; blocks: HTMLElement[] } {
  let node: HTMLElement = main;
  let best: { host: HTMLElement; blocks: HTMLElement[] } = { host: main, blocks: [] };
  for (let depth = 0; depth < 5; depth += 1) {
    const blocks = realBlocks(node);
    if (blocks.length > best.blocks.length) best = { host: node, blocks };
    if (blocks.length >= MIN_CANDIDATES) return { host: node, blocks };
    const kids = Array.from(node.children).filter((c): c is HTMLElement => c instanceof HTMLElement);
    let dominant: HTMLElement | null = null;
    for (const k of kids) if (!dominant || k.offsetHeight > dominant.offsetHeight) dominant = k;
    if (!dominant || dominant.offsetHeight < node.offsetHeight * 0.35) break;
    node = dominant;
  }
  // A page built as one atomic block (a single long prose column, a table)
  // offers no section boundaries at the normal threshold. Rather than give up
  // and leave the middle empty, accept paragraph-sized boundaries.
  if (best.blocks.length < 2) {
    const loose = realBlocks(node, FALLBACK_BLOCK_PX);
    if (loose.length > best.blocks.length) best = { host: node, blocks: loose };
  }
  return best;
}

/** Where an element sits in the document, in page coordinates. */
function pageTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

/**
 * A host for one injected unit, carrying the region it was placed for.
 *
 * The region is WRITTEN DOWN rather than inferred later, and that is the whole
 * point of the attribute. Regions are otherwise read from position — is this
 * unit before the first block, inside the content, or after <main> — and the
 * lead unit sits AFTER the first block by design, so a positional reading files
 * it under "middle". `have.top` then stays 0, and since placement is retried
 * five times as the page settles, every retry added another leaderboard: three
 * of them on a long page, until the total cap stopped it. Measured in Chromium,
 * not reasoned about.
 */
function makeAnchor(kind: Kind): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-ulyah-ad-anchor", "");
  el.setAttribute("data-ad-region", kind);
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
    // The ads are live wherever the code puts them (owner: "pokoknya ketika ads
    // di pasang langsung online"), so placement starts with the page rather
    // than with a config fetch. This used to wait on one, which also meant that
    // whenever the fetch failed — and for weeks it always did, blocked by a CORS
    // header nobody could see — not one unit was placed on any page.
    if (SKIP.some((p) => pathname?.includes(p))) return;

    const created: Slot[] = [];
    let cancelled = false;
    const timers: number[] = [];
    let observer: ResizeObserver | null = null;
    let growDebounce = 0;
    /**
     * The level of the tree this route's sections live at, decided once.
     *
     * Placement is retried as the page settles, and `candidateBlocks` descends
     * by HEIGHT — so the level it picks can change between two runs, for the
     * most ordinary reason there is: the first unit loaded and made its branch
     * taller. The second run then measures a different list, whose first block
     * is somewhere else entirely, and inserts against it. That is how the hub
     * ended up with the leaderboard BELOW the two in-content units it is
     * supposed to lead: each was placed correctly, against a different page.
     *
     * Deciding once and re-reading the same host keeps every retry talking
     * about the same page.
     */
    let sectionHost: HTMLElement | null = null;

    const place = () => {
      if (cancelled) return;
      try {
        const main = document.querySelector("main");
        if (!(main instanceof HTMLElement)) return;
        if (document.body.scrollHeight < 400) return;

        let blocks: HTMLElement[] = [];
        if (sectionHost && document.contains(sectionHost)) blocks = realBlocks(sectionHost);
        if (blocks.length < 2) {
          const found = candidateBlocks(main);
          sectionHost = found.host;
          blocks = found.blocks;
        }
        const firstBlock = blocks[0] ?? null;

        // What the page already carries, by region.
        //
        // Two kinds of unit, counted two ways. The ones WE injected know their
        // own region (the anchor says so), which is what keeps a retry from
        // re-placing a region it already filled. The ones the template placed
        // itself have to be read from position, which is all we can know about
        // them.
        const have: Record<Kind, number> = { top: 0, middle: 0, bottom: 0 };
        let total = 0;

        for (const a of document.querySelectorAll<HTMLElement>("[data-ulyah-ad-anchor]")) {
          const kind = (a.getAttribute("data-ad-region") as Kind | null) ?? "middle";
          have[kind] += 1;
          total += 1;
        }

        const wraps = Array.from(document.querySelectorAll("[data-adsense-slot]")).filter(
          (e): e is HTMLElement => e instanceof HTMLElement && !e.closest("[data-ulyah-ad-anchor]")
        );
        // The template's own lead unit, if it placed one — the ordering rule
        // below is about what the READER sees, so it has to respect a unit we
        // did not put there.
        let leadUnit: HTMLElement | null = null;
        for (const w of wraps) {
          if (!main.contains(w)) have.bottom += 1;
          else if (firstBlock && before(w, firstBlock)) {
            have.top += 1;
            if (!leadUnit) leadUnit = w;
          } else have.middle += 1;
        }
        total += wraps.length;

        const add = (host: HTMLElement, kind: Kind) => {
          created.push({ host, kind, i: created.length });
          have[kind] += 1;
          total += 1;
        };
        const room = () => total < MAX_TOTAL;

        // 1. LEAD — one unit at the first natural pause, which is AFTER the
        //    opening block, not above it.
        //
        //    Two reasons, and they point the same way. The reader meets the
        //    page first — the owner's long-standing rule, "biar ga mengganggu
        //    di atas" — and an ad in the first screenful that arrives before
        //    the content is the one people scroll past on reflex. A unit that
        //    sits where the eye already stops, at the end of the first section,
        //    is both less rude and more looked-at; viewability is what a
        //    display unit is paid on.
        //
        //    It falls back to the very top only when the page has ONE block and
        //    there is no "after the first" to speak of.
        if (have.top < QUOTA.top && firstBlock && room()) {
          const anchor = makeAnchor("top");
          if (blocks.length > 1) firstBlock.insertAdjacentElement("afterend", anchor);
          else firstBlock.insertAdjacentElement("beforebegin", anchor);
          add(anchor, "top");
          leadUnit = anchor;
        }
        leadUnit ??= document.querySelector<HTMLElement>('[data-ad-region="top"]');

        // 2. MIDDLE — spread across the section boundaries. Positions come from
        //    the block list, not from pixels, so they stay put as ads load.
        const midNeed = QUOTA.middle - have.middle;
        if (midNeed > 0 && blocks.length >= 2) {
          // Never above the lead unit. A middle that lands before the
          // leaderboard is not a smaller mistake than a missing one: the
          // reader meets an in-content ad first and the page reads as
          // ad-first, which is the impression the whole layout is arranged to
          // avoid.
          const usable = blocks
            .slice(0, -1) // never after the final block
            .filter((b) => !leadUnit || before(leadUnit, b));
          // Every ad already on the page, in page coordinates — what the new
          // one has to keep MIN_GAP_PX away from.
          const taken = Array.from(
            document.querySelectorAll<HTMLElement>("[data-adsense-slot],[data-ulyah-ad-anchor]")
          ).map(pageTop);
          const picked: number[] = [];
          for (let n = 1; n <= midNeed && usable.length; n += 1) {
            if (!room()) break;
            const ideal = Math.min(usable.length - 1, Math.round((usable.length * n) / (midNeed + 1)));
            // Walk outwards from the ideal index for a slot far enough from
            // the ones already taken — in blocks AND in pixels.
            let chosen = -1;
            for (let d = 0; d < usable.length && chosen < 0; d += 1) {
              for (const idx of [ideal + d, ideal - d]) {
                if (idx < 0 || idx >= usable.length) continue;
                if (picked.some((p) => Math.abs(p - idx) < MIN_BLOCK_STRIDE)) continue;
                const y = pageTop(usable[idx]!) + usable[idx]!.offsetHeight;
                if (taken.some((t) => Math.abs(t - y) < MIN_GAP_PX)) continue;
                chosen = idx;
                break;
              }
            }
            // Nowhere left with room around it. A page that cannot hold
            // another unit politely simply carries fewer — the quota is a
            // ceiling, never a target to be met at the reader's expense.
            if (chosen < 0) break;
            picked.push(chosen);
            const anchor = makeAnchor("middle");
            usable[chosen]!.insertAdjacentElement("afterend", anchor);
            taken.push(pageTop(anchor));
            add(anchor, "middle");
          }
        }

        // 3. BOTTOM — siblings after <main>, before the footer.
        while (have.bottom < QUOTA.bottom && room() && main.parentElement) {
          const anchor = makeAnchor("bottom");
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
