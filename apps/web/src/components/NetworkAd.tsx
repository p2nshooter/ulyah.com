"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Adsterra ad placement — visitor-first.
 *
 * Owner supplied Adsterra banner + native units for TWO sites only (dawa.es
 * and ulyah.com); every other tenant renders nothing. Design rules, all in
 * service of "yg penting pengunjung tetep nyaman":
 *   - each unit lives in its OWN sandboxed <iframe> (srcdoc). This isolates
 *     Adsterra's global `atOptions` so several banner sizes can coexist on one
 *     page, AND — critically — the sandbox omits `allow-top-navigation`, so an
 *     ad can never hijack or redirect the page the visitor is reading;
 *   - the slot reserves its exact height up front, so content never shifts
 *     under the reader when the ad loads (no layout jump);
 *   - the iframe only mounts when it scrolls near the viewport (lazy), so ads
 *     never slow the first paint or the reading experience;
 *   - a small, muted "Iklan/Publicidad" label keeps it honest and unobtrusive;
 *   - only banner + native formats are used — never popunder, interstitial or
 *     sticky bars.
 */

type Tenant = "ulyah" | "dawa";
const TENANT = (process.env.NEXT_PUBLIC_TENANT ?? "ulyah") as string;

interface Banner {
  key: string;
  w: number;
  h: number;
}
interface Native {
  pl: string;
  container: string;
}

// Public ad-unit ids (safe in the browser — that is how ad networks work).
const INVENTORY: Record<Tenant, { lead: Banner; mobile: Banner; rect: Banner; native: Native }> = {
  ulyah: {
    lead: { key: "43de5175051326c3521298136c0b8fb0", w: 468, h: 60 },
    mobile: { key: "c7a89c9467cee8902928e404f04a5925", w: 320, h: 50 },
    rect: { key: "96123a4a53798c8bf60792bffec51a90", w: 300, h: 250 },
    native: { pl: "pl30370139", container: "f1bb94c167450510581bdb45f60c9547" },
  },
  dawa: {
    lead: { key: "0edfdb3a49a2fe7806e3fad5a024f255", w: 728, h: 90 },
    mobile: { key: "5cd1db88d80f04e3013aa4740e58290a", w: 320, h: 50 },
    rect: { key: "9f9666d9859c7821548cbe92829722f5", w: 300, h: 250 },
    native: { pl: "pl30477122", container: "838f097f32d8d1cec906187de951db18" },
  },
};

const LABEL: Record<string, string> = { ulyah: "Iklan", dawa: "Publicidad" };

function bannerDoc(b: Banner): string {
  // Isolated document: its own atOptions + invoke.js, transparent, no scroll.
  return (
    `<!doctype html><html><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=${b.w}, initial-scale=1">` +
    `<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}` +
    `body{display:flex;align-items:center;justify-content:center}</style></head><body>` +
    `<script type="text/javascript">atOptions={'key':'${b.key}','format':'iframe','height':${b.h},'width':${b.w},'params':{}};</script>` +
    `<script type="text/javascript" src="//www.highperformanceformat.com/${b.key}/invoke.js"></script>` +
    `</body></html>`
  );
}

function nativeDoc(n: Native): string {
  return (
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<style>html,body{margin:0;padding:0;background:transparent}</style></head><body>` +
    `<script async data-cfasync="false" src="//${n.pl}.effectivecpmnetwork.com/${n.container}/invoke.js"></script>` +
    `<div id="container-${n.container}"></div>` +
    `</body></html>`
  );
}

const SANDBOX = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

function AdFrame({ doc, width, height, title }: { doc: string; width: number | string; height: number; title: string }) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  // Lazy-mount: only build the ad iframe when the slot nears the viewport.
  useEffect(() => {
    const el = holderRef.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "500px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show]);

  return (
    <div ref={holderRef} style={{ minHeight: height }} className="flex w-full justify-center">
      {show ? (
        <iframe
          title={title}
          srcDoc={doc}
          width={typeof width === "number" ? width : undefined}
          height={height}
          scrolling="no"
          loading="lazy"
          sandbox={SANDBOX}
          style={{
            border: "0",
            width: typeof width === "number" ? width : "100%",
            maxWidth: "100%",
            height,
            display: "block",
            overflow: "hidden",
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * A network ad slot.
 *   - "banner"  responsive top/section banner (leaderboard on desktop,
 *     320x50 on mobile)
 *   - "rectangle" 300x250 in-content block
 *   - "native"  wide native banner (auto content, reserved height)
 */
export function NetworkAd({
  unit = "banner",
  className = "",
}: {
  unit?: "banner" | "rectangle" | "native";
  className?: string;
}) {
  const inv = INVENTORY[TENANT as Tenant];
  const pathname = usePathname();
  // Desktop-vs-mobile is decided after mount so we load ONLY the size shown.
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    if (unit !== "banner") return;
    const mq = window.matchMedia("(min-width: 640px)");
    setWide(mq.matches);
    const on = (e: MediaQueryListEvent) => setWide(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [unit]);

  if (!inv) return null; // tenant has no network ads (1fr, tilawa, xad, …)
  if (pathname?.includes("/admin")) return null; // never in the admin portal

  const label = LABEL[TENANT] ?? "Ad";
  const wrap = `my-6 flex flex-col items-center gap-1 ${className}`;
  const tag = (
    <span className="select-none text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)] opacity-50">
      {label}
    </span>
  );

  if (unit === "rectangle") {
    return (
      <aside className={wrap} aria-label={label}>
        {tag}
        <AdFrame doc={bannerDoc(inv.rect)} width={inv.rect.w} height={inv.rect.h} title={`${label} 300x250`} />
      </aside>
    );
  }

  if (unit === "native") {
    return (
      <aside className={`${wrap} w-full`} aria-label={label}>
        {tag}
        <div className="w-full max-w-3xl">
          <AdFrame doc={nativeDoc(inv.native)} width="100%" height={260} title={`${label} native`} />
        </div>
      </aside>
    );
  }

  // banner (responsive). Reserve the taller of the two heights before we know
  // the breakpoint, so there is never a layout jump on first paint.
  const b = wide ? inv.lead : inv.mobile;
  return (
    <aside className={wrap} aria-label={label}>
      {tag}
      {wide === null ? (
        <div style={{ minHeight: 90 }} className="w-full" />
      ) : (
        <AdFrame doc={bannerDoc(b)} width={b.w} height={b.h} title={`${label} ${b.w}x${b.h}`} />
      )}
    </aside>
  );
}
