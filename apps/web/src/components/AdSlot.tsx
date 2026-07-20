"use client";

import { useEffect, useRef, useState } from "react";
import { fetchAdView, type AdView } from "@/lib/ad-config";

/**
 * A single, visitor-friendly ad placement. Reads the central config (edited
 * only from the ulyah.com admin) and:
 *   - renders NOTHING when this site is turned off (the default) or on the
 *     admin portal;
 *   - renders a tasteful PREVIEW box when the site is on but no real ad-unit
 *     id has been pasted yet, so positions can be checked before approval;
 *   - renders the real AdSense unit once the id is pasted.
 *
 * Placement guidance (owner: "ramah, tidak mengganggu; kamu yang hitung jarak"):
 * in-content ads sit BETWEEN finished blocks with generous spacing and a
 * reserved height so nothing ever shifts under the reader — never sticky,
 * never interstitial, never mid-sentence.
 */
export function AdSlot({
  placement = "in_article",
  className = "",
  label = "Ruang Iklan",
}: {
  placement?: "in_article" | "list" | "footer" | "sidebar";
  className?: string;
  label?: string;
}) {
  const [view, setView] = useState<AdView | null>(null);
  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    // Never show ads inside the admin portal.
    if (typeof window !== "undefined" && window.location.pathname.includes("/admin")) return;
    fetchAdView().then((v) => {
      if (alive) setView(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  const slotId = view?.slots?.[placement] || "";

  useEffect(() => {
    if (!view?.enabled || !slotId || pushedRef.current) return;
    pushedRef.current = true;
    try {
      // Global adsbygoogle array is created by the loader script in layout head.
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ??= []).push({});
    } catch {
      /* ad blocker / not ready — the reserved space simply stays empty */
    }
  }, [view?.enabled, slotId]);

  if (!view || !view.enabled) return null;

  // Real ad.
  if (slotId && view.clientId) {
    return (
      <div className={`my-8 flex justify-center ${className}`} aria-hidden={false}>
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: 90 }}
          data-ad-client={view.clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Preview placeholder (site on, no real id yet) — lets the owner see the
  // position without violating policy (no fake ad content, clearly labelled).
  return (
    <div
      className={`my-8 flex min-h-[90px] items-center justify-center rounded-xl border border-dashed border-accent/40 bg-accent/5 text-xs text-[var(--color-text-secondary)] ${className}`}
    >
      <span className="opacity-70">▭ {label} · pratinjau posisi</span>
    </div>
  );
}
