"use client";

import { useEffect, useRef } from "react";

/**
 * A single AdSense unit, framed as a premium card consistent with the rest of
 * the site rather than a bare utilitarian box — well-integrated placement
 * genuinely earns attention (and therefore legitimate clicks) without any
 * deceptive UI. Reserved height prevents layout shift. The publisher script
 * lives in <head> (layout.tsx); this only renders the <ins> and requests a
 * fill.
 *
 * IMPORTANT: never disguise this as a "next" button, download link, or part
 * of the reading content — that violates AdSense policy and risks the whole
 * account being suspended. The "Sponsored" label must stay visible; only the
 * framing may be elegant.
 *
 * Slot IDs come from the AdSense dashboard after the account is approved.
 * Until a real slot id is supplied the container renders as an unobtrusive
 * reserved space, so placement/layout is final now and ads simply light up
 * once the ids are filled in — no redesign needed later.
 */
const CLIENT = "ca-pub-6371903555702163";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  format = "auto",
  minHeight = 130,
  label = "Sponsored",
  className = "",
}: {
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  minHeight?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* adblock or script not ready — ignore */
    }
  }, [slot]);

  return (
    <div
      className={`mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-b from-accent/[0.06] to-transparent text-center shadow-sm ${className}`}
      style={{ minHeight }}
      aria-hidden={!slot}
    >
      <div className="flex items-center justify-center gap-1.5 border-b border-accent/10 py-1.5">
        <span aria-hidden className="text-[10px]">
          ✦
        </span>
        <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-secondary)]/70">
          {label}
        </p>
        <span aria-hidden className="text-[10px]">
          ✦
        </span>
      </div>
      {slot ? (
        <ins
          ref={ref}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="grid place-items-center" style={{ minHeight: minHeight - 28 }}>
          <span className="text-[10px] text-[var(--color-text-secondary)]/30">ULYAH</span>
        </div>
      )}
    </div>
  );
}
