"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

/**
 * A single AdSense unit, framed as a premium card consistent with the rest of
 * the site rather than a bare utilitarian box — well-integrated placement
 * genuinely earns attention (and therefore legitimate clicks) without any
 * deceptive UI. Reserved height prevents layout shift.
 *
 * The ad-unit id is NOT hardcoded here: it is read once, site-wide, from the
 * value the owner types into the admin AdSense panel (GET /content/adsense-
 * config). So a single input in the portal lights up every AdSlot across the
 * whole site — no per-placement ids, no redeploy. Until an id is configured
 * (i.e. before AdSense approval) this renders nothing at all — no empty box.
 *
 * IMPORTANT: never disguise this as a "next" button, download link, or part
 * of the reading content — that violates AdSense policy. The "Sponsored"
 * label stays visible; only the framing is elegant.
 */
const CLIENT = "ca-pub-6371903555702163";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

// Fetch the admin ad config once per page load, shared across every AdSlot.
let configPromise: Promise<{ slotId: string; enabled: boolean }> | null = null;
function getAdConfig(): Promise<{ slotId: string; enabled: boolean }> {
  if (!configPromise) {
    configPromise = api
      .get<{ slotId: string; enabled: boolean }>("/content/adsense-config")
      .catch(() => ({ slotId: "", enabled: false }));
  }
  return configPromise;
}

function ensureAdsenseLoaded() {
  if (typeof document === "undefined") return;
  if (document.querySelector("script[data-ulyah-adsense]")) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
  s.crossOrigin = "anonymous";
  s.setAttribute("data-ulyah-adsense", "1");
  document.head.appendChild(s);
}

function sendAdEvent(type: "impression" | "click") {
  const page = typeof window !== "undefined" ? window.location.pathname : "/";
  api.post("/analytics/ad-event", { type, page }).catch(() => {});
}

export function AdSlot({
  slot,
  format = "auto",
  minHeight = 130,
  label = "Sponsored",
  className = "",
}: {
  /** Optional override; normally left unset so the admin-configured id is used. */
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  minHeight?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotId, setSlotId] = useState<string | null>(slot ?? null);
  const [ready, setReady] = useState(Boolean(slot));

  // Resolve the site-wide ad-unit id from the admin config (unless a slot was
  // passed explicitly).
  useEffect(() => {
    if (slot) return;
    let cancelled = false;
    getAdConfig().then((cfg) => {
      if (cancelled) return;
      if (cfg.enabled && cfg.slotId) {
        setSlotId(cfg.slotId);
        setReady(true);
      } else {
        setReady(true); // resolved, but nothing to show
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slot]);

  // Request a fill + count a first-party impression once we have an id.
  useEffect(() => {
    if (!slotId) return;
    ensureAdsenseLoaded();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* adblock or not ready — ignore */
    }
    sendAdEvent("impression");
  }, [slotId]);

  // Best-effort click estimate: the real click happens inside a cross-origin
  // Google iframe we cannot read, but a click there blurs our window while the
  // pointer is over this ad container. That heuristic is an ESTIMATE (labelled
  // as such in the admin panel), not a manipulation of the ad itself.
  useEffect(() => {
    if (!slotId) return;
    let pointerInside = false;
    const el = containerRef.current;
    if (!el) return;
    const onEnter = () => (pointerInside = true);
    const onLeave = () => (pointerInside = false);
    const onBlur = () => {
      if (pointerInside && document.activeElement?.tagName === "IFRAME") sendAdEvent("click");
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onBlur);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onBlur);
    };
  }, [slotId]);

  // Before an id is configured (pre-approval) render nothing — no empty box.
  if (!ready || !slotId) return null;

  return (
    <div
      ref={containerRef}
      className={`mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-b from-accent/[0.06] to-transparent text-center shadow-sm ${className}`}
      style={{ minHeight }}
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
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
