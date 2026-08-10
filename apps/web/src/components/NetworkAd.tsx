"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Adsterra ad placement — visitor-first.
 *
 * Owner supplied Adsterra banner + native units per tenant; a tenant with no
 * inventory renders nothing. Design rules, all in service of "yg penting
 * pengunjung tetep nyaman":
 *   - each unit lives in its OWN sandboxed <iframe>, loaded from /ads/frame.html
 *     on this site's own origin. This isolates Adsterra's global `atOptions` so
 *     several banner sizes can coexist on one page, AND — critically — the
 *     sandbox omits `allow-top-navigation`, so an ad can never hijack or
 *     redirect the page the visitor is reading. It must be a real file rather
 *     than `srcdoc`: an about:srcdoc document has no hostname, an opaque origin
 *     and no referrer, which is exactly the identity the network needs to match
 *     the request to a registered site;
 *   - the slot reserves its exact height while the ad loads, so content never
 *     shifts under the reader AND the ad script has a real viewport to paint
 *     into (a zero-height frame is what stopped ads rendering at all);
 *   - the iframe only mounts when it scrolls near the viewport (lazy), so ads
 *     never slow the first paint or the reading experience;
 *   - a small, muted label between two hairlines keeps it honest and reads as
 *     a deliberate section divider rather than a bolted-on box;
 *   - only banner + native formats are used — never popunder, interstitial or
 *     sticky bars.
 *
 * WHY THE LOAD LOGIC LOOKS THE WAY IT DOES. An earlier version kept the slot
 * (and the iframe) at height 0 until it could prove an ad had painted, and it
 * gave up after six 700 ms polls. Two things went wrong with that, and together
 * they are why Adsterra "ga muncul":
 *   1. the ad script was asked to render into a 0 px viewport, which suppresses
 *      fill and viewability on most networks;
 *   2. ~4.2 s is far too short — any slower response locked the slot shut
 *      permanently, with no retry.
 * So now the frame carries its real height from the moment it mounts, and the
 * emptiness check is patient (up to ~25 s) before it collapses anything.
 */

const TENANT = (process.env.NEXT_PUBLIC_TENANT ?? "ulyah") as string;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

// Master Adsterra switch — read ONCE per page from the central ad config
// (the ulyah.com admin toggle). Cached module-level so every NetworkAd slot on
// the page shares a single fetch. Fail-open (show) if the config can't be read;
// when the admin has turned it OFF, every slot returns null — no exception.
const ADSTERRA_LS_KEY = `adsterra:${TENANT}`;

// Last-known master state, persisted so a page load respects an OFF toggle
// instantly (no flash of ads) even before the fresh fetch resolves.
function readAdsterraLS(): boolean | null {
  try {
    const v = localStorage.getItem(ADSTERRA_LS_KEY);
    return v === null ? null : v === "1";
  } catch {
    return null;
  }
}

let _adsterraMaster: boolean | null = null;
let _adsterraPromise: Promise<boolean> | null = null;
function fetchAdsterraMaster(): Promise<boolean> {
  if (_adsterraMaster !== null) return Promise.resolve(_adsterraMaster);
  if (!_adsterraPromise) {
    // no-store: always read the CURRENT switch state, never a cached copy, so an
    // admin OFF hides ads on the next refresh instead of up to a minute later.
    _adsterraPromise = fetch(`${API_BASE}/content/ad-config?site=${TENANT}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { adsterra?: boolean }) => {
        const on = d?.adsterra !== false;
        _adsterraMaster = on;
        try {
          localStorage.setItem(ADSTERRA_LS_KEY, on ? "1" : "0");
        } catch {
          /* private mode / storage full — fine, we just lose the sticky hint */
        }
        return on;
      })
      // On network failure honour the last-known state; only fail-open (show)
      // when we have never successfully read the config on this device.
      .catch(() => (_adsterraMaster = readAdsterraLS() ?? true));
  }
  return _adsterraPromise;
}

interface Banner {
  key: string;
  w: number;
  h: number;
}
interface Native {
  pl: string;
  container: string;
}
// Not every site was given every size. Fields are optional and the component
// falls back gracefully (desktop: lead→wide→rect; mobile: mobile→rect).
interface TenantAds {
  lead?: Banner; // 728x90 leaderboard
  wide?: Banner; // 468x60 banner
  mobile?: Banner; // 320x50 mobile banner
  rect?: Banner; // 300x250 rectangle
  sky?: Banner; // 160x600 skyscraper (only where supplied)
  native?: Native;
}

// Public ad-unit ids (safe in the browser — that is how ad networks work).
// One Adsterra inventory per tenant; every site now monetises with the network.
const INVENTORY: Record<string, TenantAds> = {
  ulyah: {
    // 728x90 was missing entirely: the unit exists in the Adsterra dashboard
    // and nothing here referenced it, so every desktop banner slot on ulyah.com
    // fell back to the 468x60 and the widest inventory went unused.
    lead: { key: "594fdae1d663886caf58661e9e8c3f22", w: 728, h: 90 },
    wide: { key: "43de5175051326c3521298136c0b8fb0", w: 468, h: 60 },
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
  "1fr": {
    lead: { key: "522efc4634b8157053ada057e9c5372b", w: 728, h: 90 },
    wide: { key: "4a228d4a4ac4b9aa0d85afa4b8df15ac", w: 468, h: 60 },
    rect: { key: "ac7d9a34efbdb15afe2170c5f7e0fec7", w: 300, h: 250 },
    native: { pl: "pl30460827", container: "eeb62eb94066800f48ec6f3dcc6eb93a" },
  },
  tilawa: {
    wide: { key: "0b779fe2b8580c718b63255eb0ab94c0", w: 468, h: 60 },
    mobile: { key: "75a9f0c7d69ebfbec7aadf4d3ca66c18", w: 320, h: 50 },
    rect: { key: "6599067e75afd3b869159c0b094fe5f3", w: 300, h: 250 },
    native: { pl: "pl30477239", container: "7ba2bc8ee8c8868ae6028d0d358ef52e" },
  },
  xad: {
    lead: { key: "e3d8fa05b18b4a40d6b861f6dca5561d", w: 728, h: 90 },
    mobile: { key: "8e92c2a078eb7f3eed217eb891fc9fe6", w: 320, h: 50 },
    rect: { key: "9748f45401ddd3f96c910486f3a71623", w: 300, h: 250 },
    sky: { key: "95044feb7a28fdd0e449b3edc1d52fdf", w: 160, h: 600 },
    native: { pl: "pl30477257", container: "de9149dd93fc5a1803fe9c6ad380875b" },
  },
};

/** True when this tenant has any Adsterra inventory at all. */
export function tenantHasNetworkAds(): boolean {
  return !!INVENTORY[TENANT];
}

// Ad label in each site's own language.
const LABEL: Record<string, string> = {
  ulyah: "Iklan",
  dawa: "Publicidad",
  "1fr": "Publicité",
  tilawa: "Werbung",
  xad: "Sponsored",
};

/**
 * The URL of the isolated frame for one unit.
 *
 * These used to be inline `srcdoc` documents. That gave each unit its own
 * document — which invoke.js needs, since it reads one global `atOptions` —
 * but at the cost of the document's identity: inside `about:srcdoc` the
 * hostname is empty, the origin is the string "null" and the referrer is
 * empty. The ad network matches a request to a registered site by domain and
 * referrer, so with none of the three it returned no ad at all, on every
 * tenant, for every unit. See public/ads/frame.html.
 */
function bannerSrc(b: Banner): string {
  return `/ads/frame.html?key=${encodeURIComponent(b.key)}&w=${b.w}&h=${b.h}`;
}

function nativeSrc(n: Native): string {
  return `/ads/frame.html?pl=${encodeURIComponent(n.pl)}&container=${encodeURIComponent(n.container)}`;
}

const SANDBOX = "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

/** How long we let a unit try to paint before we accept it is a no-fill and
 *  collapse the slot. Generous on purpose: the old 4.2 s cutoff silently
 *  killed every ad that answered slowly. */
const FILL_GRACE_MS = 25_000;

function AdFrame({
  src,
  width,
  height,
  title,
  onFill,
}: {
  src: string;
  width: number | string;
  height: number;
  title: string;
  onFill?: (filled: boolean) => void;
}) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [mounted, setMounted] = useState(false);
  // `null` = still loading (keep the space reserved so the ad has somewhere to
  // paint), `true` = an ad painted, `false` = confirmed no-fill, collapse.
  const [filled, setFilled] = useState<boolean | null>(null);

  // Lazy-mount: only build the ad iframe when the slot nears the viewport.
  useEffect(() => {
    const el = holderRef.current;
    if (!el || mounted) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  // Patient fill watch. The frame already has its real height, so the ad script
  // renders into a proper viewport; this only decides whether to KEEP the space.
  useEffect(() => {
    if (!mounted) return;
    let stopped = false;
    const startedAt = Date.now();
    const tick = () => {
      if (stopped) return;
      let has = false;
      try {
        const body = frameRef.current?.contentDocument?.body;
        // scrollHeight is the one signal that works for both the banner iframe
        // and the native container; the frame body is 0-high until something
        // actually paints (the two <script> tags contribute no height).
        has = !!body && body.scrollHeight > 12;
      } catch {
        // Cross-origin read blocked → assume it may have filled; keep it.
        has = true;
      }
      if (has) {
        setFilled(true);
        onFill?.(true);
        return; // settled — an ad is there, stop polling
      }
      if (Date.now() - startedAt > FILL_GRACE_MS) {
        setFilled(false);
        onFill?.(false);
        return; // genuine no-fill — collapse and stop
      }
      window.setTimeout(tick, 900);
    };
    const id = window.setTimeout(tick, 1200);
    return () => {
      stopped = true;
      window.clearTimeout(id);
    };
  }, [mounted, onFill]);

  // Reserve the height while loading and once filled; only a confirmed
  // no-fill collapses to nothing.
  const reserved = filled === false ? 0 : height;

  return (
    <div
      ref={holderRef}
      style={{ minHeight: reserved }}
      className="flex w-full justify-center overflow-hidden transition-[min-height] duration-500"
    >
      {mounted ? (
        <iframe
          ref={frameRef}
          title={title}
          src={src}
          width={typeof width === "number" ? width : undefined}
          height={height}
          scrolling="no"
          loading="lazy"
          sandbox={SANDBOX}
          style={{
            border: "0",
            width: typeof width === "number" ? width : "100%",
            maxWidth: "100%",
            height: reserved,
            display: "block",
            overflow: "hidden",
          }}
        />
      ) : null}
    </div>
  );
}

export type NetworkAdUnit = "banner" | "rectangle" | "native" | "sidebar";

/**
 * A network ad slot.
 *   - "banner"    responsive top/section banner (leaderboard on desktop,
 *                 320x50 on mobile)
 *   - "rectangle" 300x250 in-content block
 *   - "native"    wide native banner (auto content, reserved height)
 *   - "sidebar"   tall unit for a desktop margin rail (skyscraper where the
 *                 tenant has one, otherwise the 300x250 rectangle)
 */
export function NetworkAd({
  unit = "banner",
  className = "",
  framed = true,
}: {
  unit?: NetworkAdUnit;
  className?: string;
  /** Draw the hairline + label divider around the unit. Off for rail units,
   *  where a bare block sits better in the margin. */
  framed?: boolean;
}) {
  const inv = INVENTORY[TENANT];
  const pathname = usePathname();
  // Master Adsterra switch (admin ON/OFF). When OFF, hide every unit — no
  // exception. Starts from the module cache so a second slot never flashes.
  const [adsterraOn, setAdsterraOn] = useState<boolean>(_adsterraMaster ?? true);
  useEffect(() => {
    let alive = true;
    // Instantly apply the last-known state (so an OFF site never flashes an ad),
    // then confirm with a fresh no-store fetch.
    const ls = readAdsterraLS();
    if (ls !== null) setAdsterraOn(ls);
    fetchAdsterraMaster().then((on) => alive && setAdsterraOn(on));
    return () => {
      alive = false;
    };
  }, []);
  // The label appears only once an ad has actually painted, so a no-fill never
  // leaves a lonely "Iklan" caption behind.
  const [filled, setFilled] = useState(false);
  // Memoised: an inline arrow here re-ran AdFrame's watch effect on every
  // parent render, restarting the poll chain from zero each time.
  const onFill = useCallback((isFilled: boolean) => setFilled(isFilled), []);
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

  if (!inv) return null; // safety: a tenant with no configured inventory
  if (!adsterraOn) return null; // master Adsterra switch is OFF → hide everything
  if (pathname?.includes("/admin")) return null; // never in the admin portal

  const label = LABEL[TENANT] ?? "Ad";
  const wrap = `${filled ? "my-8" : "my-0"} flex w-full flex-col items-center ${className}`;

  // A hairline rule either side of a very small caption. Reads as a section
  // divider the page meant to have, not as a box bolted onto the layout.
  const tag = (
    <div
      aria-hidden
      className="mb-2 flex w-full max-w-3xl select-none items-center gap-3 px-2 opacity-45"
    >
      <span className="h-px flex-1 bg-(--color-border-gold)" />
      <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
        {label}
      </span>
      <span className="h-px flex-1 bg-(--color-border-gold)" />
    </div>
  );

  if (unit === "sidebar") {
    const b = inv.sky ?? inv.rect;
    if (!b) return null;
    return (
      <aside className={`flex flex-col items-center ${className}`} aria-label={label} data-network-ad="">
        <AdFrame src={bannerSrc(b)} width={b.w} height={b.h} title={`${label} ${b.w}x${b.h}`} onFill={onFill} />
      </aside>
    );
  }

  if (unit === "rectangle") {
    if (!inv.rect) return null;
    return (
      <aside className={wrap} aria-label={label} data-network-ad="">
        {filled && framed && tag}
        <AdFrame src={bannerSrc(inv.rect)} width={inv.rect.w} height={inv.rect.h} title={`${label} 300x250`} onFill={onFill} />
      </aside>
    );
  }

  if (unit === "native") {
    if (!inv.native) return null;
    return (
      <aside className={`${wrap}`} aria-label={label} data-network-ad="">
        {filled && framed && tag}
        <div className="w-full max-w-3xl">
          <AdFrame src={nativeSrc(inv.native)} width="100%" height={260} title={`${label} native`} onFill={onFill} />
        </div>
      </aside>
    );
  }

  // banner (responsive). Desktop prefers the leaderboard, then the 468 banner;
  // mobile prefers the 320x50, then the 300x250 rectangle (both fit a phone).
  const desktop = inv.lead ?? inv.wide ?? inv.rect;
  const mobile = inv.mobile ?? inv.rect ?? inv.wide;
  const b = wide ? desktop : mobile;
  if (!b) return null;
  return (
    <aside className={wrap} aria-label={label} data-network-ad="">
      {filled && framed && tag}
      {wide === null ? null : (
        <AdFrame src={bannerSrc(b)} width={b.w} height={b.h} title={`${label} ${b.w}x${b.h}`} onFill={onFill} />
      )}
    </aside>
  );
}
