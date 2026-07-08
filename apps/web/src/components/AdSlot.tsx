"use client";

import { useEffect, useRef } from "react";

/**
 * A single AdSense unit with reserved height so ads never cause layout shift
 * (good Core Web Vitals + a professional feel). The publisher script lives in
 * <head> (layout.tsx); this only renders the <ins> and requests a fill.
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
  minHeight = 120,
  label = "Advertisement",
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
      className={`mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/40 text-center dark:bg-white/[0.02] ${className}`}
      style={{ minHeight }}
      aria-hidden={!slot}
    >
      <p className="pt-1 text-[9px] uppercase tracking-widest text-[var(--color-text-secondary)]/50">{label}</p>
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
        <div className="grid place-items-center" style={{ minHeight: minHeight - 16 }}>
          <span className="text-[10px] text-[var(--color-text-secondary)]/40">ULYAH · {label}</span>
        </div>
      )}
    </div>
  );
}
