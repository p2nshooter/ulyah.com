"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { AdsterraBanner, useResponsiveAdSize } from "@/components/AdsterraBanner";

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
interface AdConfig {
  slotId: string;
  enabled: boolean;
  previewMode: boolean;
}
let configPromise: Promise<AdConfig> | null = null;
function getAdConfig(): Promise<AdConfig> {
  if (!configPromise) {
    configPromise = api
      .get<AdConfig>("/content/adsense-config")
      .catch(() => ({ slotId: "", enabled: false, previewMode: false }));
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
  position,
  className = "",
}: {
  /** Optional override; normally left unset so the admin-configured id is used. */
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  minHeight?: number;
  label?: string;
  /** A human name for this placement, shown in the admin preview so the owner
   * can verify each slot's position against their AdSense plan. */
  position?: string;
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotId, setSlotId] = useState<string | null>(slot ?? null);
  const [ready, setReady] = useState(Boolean(slot));
  const [preview, setPreview] = useState(false);

  // Resolve the site-wide ad-unit id from the admin config (unless a slot was
  // passed explicitly).
  useEffect(() => {
    if (slot) return;
    let cancelled = false;
    getAdConfig().then((cfg) => {
      if (cancelled) return;
      if (cfg.enabled && cfg.slotId) {
        setSlotId(cfg.slotId);
      } else if (cfg.previewMode) {
        setPreview(true);
      }
      setReady(true);
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

  // Admin preview: no real id yet, but the owner turned on "preview slots" to
  // verify placement — render a clearly-labelled placeholder (only they see
  // it; visitors get nothing until a real id is set).
  if (!slotId && preview) {
    return (
      <div
        className={`mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/[0.04] p-4 text-center ${className}`}
        style={{ minHeight }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">📢 Slot Iklan AdSense</p>
        {position && <p className="text-xs text-[var(--color-text-secondary)]">Posisi: {position}</p>}
        <p className="text-[10px] text-[var(--color-text-secondary)]/70">
          (pratinjau admin — aktif otomatis setelah ID iklan diisi)
        </p>
      </div>
    );
  }

  // Still resolving the admin config — render nothing (no empty box, no shift).
  if (!ready) return null;

  // AdSense not configured yet → fill the placement with an Adsterra banner so
  // the slot earns from day one. AdSense (kept intact) takes over automatically
  // once an ad-unit id is set. Admin pages never mount an AdSlot, so this never
  // shows in the portal.
  if (!slotId) {
    return <AdsterraFill format={format} minHeight={minHeight} label={label} className={className} />;
  }

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

/** Interim Adsterra fill, framed identically to the AdSense card so it reads
 * as an elegant, on-brand placement rather than a bare ad. */
function AdsterraFill({
  format,
  minHeight,
  label,
  className,
}: {
  format: "auto" | "horizontal" | "rectangle";
  minHeight: number;
  label: string;
  className: string;
}) {
  const size = useResponsiveAdSize(format);
  useEffect(() => {
    sendAdEvent("impression");
  }, []);
  return (
    <div
      className={`mx-auto flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-b from-accent/[0.06] to-transparent text-center shadow-sm ${className}`}
      style={{ minHeight }}
    >
      <div className="flex w-full items-center justify-center gap-1.5 border-b border-accent/10 py-1.5">
        <span aria-hidden className="text-[10px]">✦</span>
        <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-secondary)]/70">{label}</p>
        <span aria-hidden className="text-[10px]">✦</span>
      </div>
      <div className="flex w-full items-center justify-center p-2">
        <AdsterraBanner size={size} />
      </div>
    </div>
  );
}
