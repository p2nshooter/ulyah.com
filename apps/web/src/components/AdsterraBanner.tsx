"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * One Adsterra display banner, rendered inside an isolated <iframe srcDoc> so
 * the network's global `atOptions` variable can't clobber other banners on the
 * same page (their invoke script keys off that single global — without the
 * iframe, three banners on one page would all render as whichever loaded last).
 *
 * Adsterra is the interim fill while Google AdSense is pending its redesign /
 * approval; the AdSense path in <AdSlot> is left untouched and takes over the
 * moment an ad-unit id is configured in the admin panel.
 */
const KEYS: Record<string, string> = {
  "160x300": "5598d3947725de64460e05698b10851d",
  "160x600": "65cf82f8accb22ec39550e05bb808fbc",
  "300x250": "96123a4a53798c8bf60792bffec51a90",
  "320x50": "c7a89c9467cee8902928e404f04a5925",
  "468x60": "43de5175051326c3521298136c0b8fb0",
  "728x90": "594fdae1d663886caf58661e9e8c3f22",
};

export type AdsterraSize = keyof typeof KEYS;

export function AdsterraBanner({ size, className = "" }: { size: AdsterraSize; className?: string }) {
  const [w, h] = size.split("x").map(Number) as [number, number];
  const key = KEYS[size];
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []); // only inject the ad iframe on the client

  const srcDoc = useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head>` +
      `<body><script type="text/javascript">atOptions={'key':'${key}','format':'iframe','height':${h},'width':${w},'params':{}};</script>` +
      `<script type="text/javascript" src="https://www.highperformanceformat.com/${key}/invoke.js"></script></body></html>`,
    [key, w, h]
  );

  if (!mounted) return <div style={{ width: w, height: h, maxWidth: "100%" }} className={className} aria-hidden />;

  return (
    <iframe
      title="advertisement"
      aria-hidden
      srcDoc={srcDoc}
      width={w}
      height={h}
      scrolling="no"
      loading="lazy"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      style={{ border: 0, width: w, height: h, maxWidth: "100%", display: "block", margin: "0 auto" }}
      className={className}
    />
  );
}

/** Picks a banner size that fits the placement + viewport, so a leaderboard
 * slot becomes a mobile banner on phones and a rectangle stays a rectangle. */
export function useResponsiveAdSize(format: "auto" | "horizontal" | "rectangle"): AdsterraSize {
  const [size, setSize] = useState<AdsterraSize>(format === "horizontal" ? "320x50" : "300x250");
  useEffect(() => {
    const pick = () => {
      const wide = typeof window !== "undefined" && window.innerWidth >= 768;
      if (format === "horizontal") setSize(wide ? "728x90" : "320x50");
      else setSize("300x250"); // rectangle / auto reads well on both phone and desktop
    };
    pick();
    window.addEventListener("resize", pick);
    return () => window.removeEventListener("resize", pick);
  }, [format]);
  return size;
}
