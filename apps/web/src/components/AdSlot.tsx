"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { AD_CLIENT_ID, AD_SLOT } from "@/lib/ad-config";

/**
 * One Google AdSense placement.
 *
 * It renders. There is no config to read and no switch to be off: a slot in the
 * code is a live unit (owner: "pokoknya ketika ads di pasang langsung online").
 * The account and the unit id are constants — see lib/ad-config.ts, which also
 * explains what this replaced and why an unapproved domain simply does not
 * fill rather than erroring.
 *
 * ── The redesign, and why ────────────────────────────────────────────────
 *
 * It used to be a bordered box with `my-8` and a permanent 90px floor, plus a
 * dashed "▭ Ruang Iklan / posisi iklan «footer»" placeholder printed on every
 * page of a site awaiting approval. Three problems, all visible to readers:
 *
 *   · a reader saw our internal workflow printed into their reading;
 *   · an AdSense unit that gets no fill collapses to zero height, but the
 *     wrapper kept its margins and min-height, leaving a labelled hole;
 *   · it looked bolted on rather than part of the page.
 *
 * So now: a hairline rule either side of a very small caption, which reads as a
 * section divider the page meant to have; the caption appears only once
 * something has actually painted; and the space collapses on a confirmed
 * no-fill, which is also what an unapproved domain looks like — nothing, rather
 * than a hole with a label over it. The scaffolding is gone entirely.
 *
 * This is the ecosystem's only ad network now (owner: "ganti dengan adsense
 * aja"), so every unit on every page comes through here.
 */

/**
 * The caption over each unit, per site language.
 *
 * It is not decoration and it is not negotiable: an ad a reader cannot tell
 * apart from the article is the one policy line that costs an account, and it
 * is also what makes the ads worth having — a click from somebody who knew
 * what they were clicking is the only kind an advertiser pays for.
 */
const AD_L: Record<string, { label: string }> = {
  id: { label: "Iklan" },
  en: { label: "Sponsored" },
  fr: { label: "Publicité" },
  de: { label: "Werbung" },
  es: { label: "Publicidad" },
  ar: { label: "إعلان" },
};

export type AdPlacement = "in_article" | "in_article_1" | "in_article_2" | "list" | "footer" | "sidebar";

/**
 * How each placement asks to be filled, and how much room to hold for it.
 *
 * ONE UNIT, SHAPED TO THE CONTENT. The account has a single responsive display
 * unit, so the shape comes from `data-ad-format` rather than from having six
 * units: a wide, short banner where the page wants a rule across it (above the
 * content, and again at the foot), a block that sits in a column of prose
 * between sections, and a tall one in a margin rail. Google picks the creative
 * within whatever shape it is given.
 *
 * `reserve` is held only while the ad is on its way — see the render below,
 * which releases it the moment the unit paints. Reserving the WRONG amount is
 * its own bug: too little and the page jumps when the ad arrives (the thing
 * Core Web Vitals measures), too much and a slow fill shows a gap. These are
 * the usual rendered heights of a responsive unit in each shape.
 */
const PLACEMENT: Record<
  AdPlacement,
  { format: string; reserve: number; responsive: boolean; maxWidth?: number; framed?: boolean }
> = {
  // Above the content: a leaderboard, never a block — a 250px slab between the
  // header and the first paragraph is the layout readers complain about.
  list: { format: "horizontal", reserve: 110, responsive: true },
  // Between sections, in the reading column.
  in_article: { format: "auto", reserve: 250, responsive: true, framed: true },
  in_article_1: { format: "auto", reserve: 250, responsive: true, framed: true },
  in_article_2: { format: "auto", reserve: 250, responsive: true, framed: true },
  // The closing unit, under the last section and above the footer.
  footer: { format: "horizontal", reserve: 110, responsive: true },
  // A margin rail: fixed width, tall, and never full-width-responsive or it
  // would try to span the page it is sitting beside.
  sidebar: { format: "vertical", reserve: 600, responsive: false, maxWidth: 300 },
};

/** How long to let AdSense answer before treating silence as a no-fill. */
const FILL_GRACE_MS = 12_000;

export function AdSlot({
  placement = "in_article",
  className = "",
  label,
}: {
  placement?: AdPlacement;
  className?: string;
  label?: string;
}) {
  const adL = AD_L[DEFAULT_LOCALE] ?? AD_L.en!;
  const pathname = usePathname();
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  /** null = still waiting, true = an ad painted, false = confirmed no-fill. */
  const [filled, setFilled] = useState<boolean | null>(null);

  /**
   * The one place a unit does NOT render: the admin portal. The owner is
   * working there, not reading, and an ad in a control panel is nobody's
   * impression. It is read from `pathname` rather than a config, because it is
   * a property of the page, not a setting.
   */
  const inAdmin = pathname?.includes("/admin") ?? false;

  // Ask AdSense to fill the unit, once.
  useEffect(() => {
    if (inAdmin || pushedRef.current) return;
    pushedRef.current = true;
    try {
      // The loader script in <head> creates this array.
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ??= []).push({});
    } catch {
      /* blocked or not ready — the fill watch below collapses the space */
    }
  }, [inAdmin]);

  /**
   * Did an ad actually arrive?
   *
   * AdSense marks the element itself: `data-ad-status="filled"` or
   * `"unfilled"`. That is the direct signal and it is what decides whether the
   * caption and the reserved space stay. Without it an unfilled unit left a
   * labelled empty band on every page — the reader pays for an impression that
   * was never served. A creative that paints without setting the attribute is
   * still caught by the height check.
   */
  useEffect(() => {
    if (inAdmin) return;
    const el = insRef.current;
    if (!el) return;
    let stopped = false;
    const startedAt = Date.now();
    const tick = () => {
      if (stopped) return;
      const status = el.getAttribute("data-ad-status");
      if (status === "filled" || el.offsetHeight > 20) {
        setFilled(true);
        return;
      }
      if (status === "unfilled" || Date.now() - startedAt > FILL_GRACE_MS) {
        setFilled(false);
        return;
      }
      window.setTimeout(tick, 600);
    };
    const id = window.setTimeout(tick, 800);
    return () => {
      stopped = true;
      window.clearTimeout(id);
    };
  }, [inAdmin]);

  if (inAdmin) return null;

  const caption = label ?? adL.label;

  /**
   * The reserved height exists for exactly one moment: between the unit being
   * asked for and the ad arriving. Hold it after that and it becomes the
   * opposite of the bug it prevents — a 90px leaderboard inside a 250px floor
   * leaves 160px of white space under every filled ad, permanently, which is
   * worse than the layout shift the floor was there to stop.
   *
   * So: reserve while waiting (filled === null), release the moment an ad
   * paints and takes its own height (true), and collapse to nothing on a
   * confirmed no-fill (false).
   */
  const spec = PLACEMENT[placement];
  const reserved = filled === null ? spec.reserve : 0;
  return (
    <aside
      className={
        `${filled === false ? "my-0" : "my-10"} flex w-full flex-col items-center ${className} ` +
        // An in-content unit is given the same quiet card the rest of the
        // page uses for its own blocks — a hairline, a soft radius, a barely
        // tinted ground. It is not decoration: a unit floating loose in a
        // column of prose reads as something that fell onto the page, and a
        // reader's eye files it as debris rather than as an offer. Framed, it
        // reads as part of the design and gets looked at.
        //
        // The banner shapes stay unframed on purpose: a full-width rule ABOVE
        // a card would box the page in, and the hairline caption is already
        // the frame they need.
        (filled === true && spec.framed
          ? "rounded-2xl border border-(--color-border) bg-(--color-card)/60 px-3 py-4 sm:px-5"
          : "")
      }
      aria-label={caption}
      data-adsense-slot={placement}
    >
      {/* The caption only exists once there is something to caption, so a
          page never shows an "Iklan" rule floating over nothing.

          It is also not negotiable: an ad a reader cannot tell apart from the
          article is the one policy line that costs an account, and it is the
          same line that makes the ads worth having — somebody who clicks
          knowing what it is, is a click the advertiser actually wanted. */}
      {filled === true && (
        <div aria-hidden className="mb-2.5 flex w-full max-w-3xl select-none items-center gap-3 px-2 opacity-45">
          <span className="h-px flex-1 bg-(--color-border-gold)" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">{caption}</span>
          <span className="h-px flex-1 bg-(--color-border-gold)" />
        </div>
      )}
      <ins
        ref={insRef}
        className="adsbygoogle block w-full transition-[min-height] duration-500"
        style={{ display: "block", width: "100%", minHeight: reserved, maxWidth: spec.maxWidth }}
        data-ad-client={AD_CLIENT_ID}
        data-ad-slot={AD_SLOT}
        data-ad-format={spec.format}
        data-full-width-responsive={spec.responsive ? "true" : "false"}
      />
    </aside>
  );
}
