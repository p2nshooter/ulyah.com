"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { fetchAdView, type AdView } from "@/lib/ad-config";

/**
 * One Google AdSense placement.
 *
 * Reads the central config (edited only from the ulyah.com admin, so every site
 * in the network is governed from one place) and renders the real unit when
 * THIS site is enabled, ticked as approved, and an ad-unit id has been pasted.
 *
 * ── The redesign, and why ────────────────────────────────────────────────
 *
 * It used to be a bordered box with `my-8` and a permanent 90px floor, plus a
 * dashed "▭ Ruang Iklan / posisi iklan «footer»" placeholder shown to ANY
 * visitor of a site that was enabled but not yet approved. Three problems, all
 * visible to readers:
 *
 *   · a reader on a site awaiting approval saw internal scaffolding on every
 *     page — our workflow, printed into their reading;
 *   · an AdSense unit that gets no fill collapses to zero height, but the
 *     wrapper kept its margins and min-height, leaving a labelled hole;
 *   · it looked nothing like the network units beside it, so a page carrying
 *     both read as two bolted-on systems rather than one design.
 *
 * So now: the unit shares the hairline-and-caption treatment the network slots
 * use (NetworkAd), the caption appears only once something has actually
 * painted, the space collapses on a confirmed no-fill, and the position marker
 * is an OWNER TOOL — it appears only on a URL carrying `?ads=preview`, never
 * for an ordinary visitor.
 */

/** Ad caption + owner-tool wording, per site language. */
const AD_L: Record<string, { label: string; pos: string; waiting: string; noId: string }> = {
  id: { label: "Iklan", pos: "posisi iklan", waiting: "menunggu ACC AdSense", noId: "belum ada ID iklan" },
  en: { label: "Sponsored", pos: "ad position", waiting: "awaiting AdSense approval", noId: "no ad ID yet" },
  fr: { label: "Publicité", pos: "emplacement", waiting: "en attente d'approbation AdSense", noId: "pas encore d'ID d'annonce" },
  de: { label: "Werbung", pos: "Anzeigenplatz", waiting: "wartet auf AdSense-Freigabe", noId: "noch keine Anzeigen-ID" },
  es: { label: "Publicidad", pos: "posición del anuncio", waiting: "esperando aprobación de AdSense", noId: "aún sin ID de anuncio" },
  ar: { label: "إعلان", pos: "موضع الإعلان", waiting: "بانتظار موافقة AdSense", noId: "لا يوجد معرّف إعلان بعد" },
};

export type AdPlacement = "in_article" | "in_article_1" | "in_article_2" | "list" | "footer" | "sidebar";

/**
 * Reserved height per placement while the unit loads.
 *
 * Reserving the WRONG height is its own bug: too little and the page jumps when
 * the ad paints (the thing Core Web Vitals measures), too much and a no-fill
 * leaves a gap for the seconds before the watch below collapses it. These are
 * the usual rendered heights of a responsive unit in each position.
 */
const RESERVED: Record<AdPlacement, number> = {
  in_article: 250,
  in_article_1: 250,
  in_article_2: 250,
  list: 250,
  footer: 120,
  sidebar: 600,
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
  const [view, setView] = useState<AdView | null>(null);
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  /** null = still waiting, true = an ad painted, false = confirmed no-fill. */
  const [filled, setFilled] = useState<boolean | null>(null);
  /** The owner's position marker: opt-in through the URL, never automatic. */
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let alive = true;
    if (typeof window === "undefined") return;
    // Never inside the admin portal — the owner is working there, not reading.
    if (window.location.pathname.includes("/admin")) return;
    try {
      setPreview(new URLSearchParams(window.location.search).get("ads") === "preview");
    } catch {
      /* no search params — no preview */
    }
    fetchAdView().then((v) => {
      if (alive) setView(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const slotId = view?.slots?.[placement] || "";
  // A real ad needs all three: the site is live for AdSense (the owner ticked
  // "approved" after Google accepted THIS domain), a unit id exists, and we
  // know the publisher id.
  const live = !!view?.enabled && !!view?.approved && !!slotId && !!view?.clientId;

  // Ask AdSense to fill the unit, once.
  useEffect(() => {
    if (!live || pushedRef.current) return;
    pushedRef.current = true;
    try {
      // The loader script in <head> creates this array.
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ??= []).push({});
    } catch {
      /* blocked or not ready — the fill watch below collapses the space */
    }
  }, [live]);

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
    if (!live) return;
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
  }, [live]);

  if (pathname?.includes("/admin")) return null;
  if (!view || !view.enabled) return null;

  const caption = label ?? adL.label;

  if (live) {
    // Collapse a confirmed no-fill entirely: no margins, no caption, no gap.
    const reserved = filled === false ? 0 : RESERVED[placement];
    return (
      <aside
        className={`${filled === false ? "my-0" : "my-8"} flex w-full flex-col items-center transition-[min-height] duration-500 ${className}`}
        aria-label={caption}
        data-adsense-slot={placement}
      >
        {/* The caption only exists once there is something to caption — the
            same rule the network units follow, so a page never shows a label
            floating over nothing. */}
        {filled === true && (
          <div aria-hidden className="mb-2 flex w-full max-w-3xl select-none items-center gap-3 px-2 opacity-45">
            <span className="h-px flex-1 bg-(--color-border-gold)" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">{caption}</span>
            <span className="h-px flex-1 bg-(--color-border-gold)" />
          </div>
        )}
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          style={{ display: "block", width: "100%", minHeight: reserved, maxWidth: placement === "sidebar" ? 300 : undefined }}
          data-ad-client={view.clientId}
          data-ad-slot={slotId}
          data-ad-format={placement === "sidebar" ? "vertical" : "auto"}
          data-full-width-responsive={placement === "sidebar" ? "false" : "true"}
        />
      </aside>
    );
  }

  // ── Owner tool ───────────────────────────────────────────────────────────
  // The position marker, drawn ONLY on a URL carrying ?ads=preview. It is how
  // the owner checks where each unit will land before a site goes live; a
  // visitor must never be shown the scaffolding, which is what used to happen
  // on every enabled-but-unapproved site.
  if (!preview) return null;
  return (
    <div
      className={`my-8 flex min-h-[90px] flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-accent/50 bg-accent/5 text-center text-xs text-text-secondary ${className}`}
      data-ad-placeholder={placement}
    >
      <span className="font-medium opacity-80">▭ {caption}</span>
      <span className="text-[10px] opacity-60">
        {adL.pos} «{placement}» · {slotId ? adL.waiting : adL.noId}
      </span>
    </div>
  );
}
