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

const TENANT = (process.env.NEXT_PUBLIC_TENANT ?? "ulyah") as string;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

// Master Adsterra switch — read ONCE per page from the central ad config
// (the ulyah.com admin toggle). Cached module-level so every NetworkAd slot on
// the page shares a single fetch. Fail-open (show) if the config can't be read;
// when the admin has turned it OFF, every slot returns null — no exception.
let _adsterraMaster: boolean | null = null;
let _adsterraPromise: Promise<boolean> | null = null;
function fetchAdsterraMaster(): Promise<boolean> {
  if (_adsterraMaster !== null) return Promise.resolve(_adsterraMaster);
  if (!_adsterraPromise) {
    _adsterraPromise = fetch(`${API_BASE}/content/ad-config?site=${TENANT}`)
      .then((r) => r.json())
      .then((d: { adsterra?: boolean }) => (_adsterraMaster = d?.adsterra !== false))
      .catch(() => (_adsterraMaster = true));
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

// Ad label in each site's own language.
const LABEL: Record<string, string> = {
  ulyah: "Iklan",
  dawa: "Publicidad",
  "1fr": "Publicité",
  tilawa: "Werbung",
  xad: "Sponsored",
};

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

function AdFrame({
  doc,
  width,
  height,
  title,
  onEmpty,
}: {
  doc: string;
  width: number | string;
  height: number;
  title: string;
  onEmpty?: (empty: boolean) => void;
}) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [show, setShow] = useState(false);
  // Until an ad actually paints we do NOT reserve the full height — an unfilled
  // network (e.g. while the Adsterra domain is still being verified) would
  // otherwise leave a large empty labelled box on every page ("css ganjil").
  const [filled, setFilled] = useState(false);

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

  // After the sandboxed (same-origin srcdoc) iframe loads, poll its content a
  // few times — ad scripts inject asynchronously. If nothing paints, collapse
  // the slot so no empty gap or lonely "Iklan" label is left behind.
  useEffect(() => {
    if (!show) return;
    let tries = 0;
    let done = false;
    const check = () => {
      if (done) return;
      tries += 1;
      let has = false;
      try {
        const body = frameRef.current?.contentDocument?.body;
        has = !!body && body.scrollHeight > 10 && body.childElementCount > 0;
      } catch {
        // Cross-origin read blocked → assume it may have filled; keep it.
        has = true;
      }
      if (has) {
        done = true;
        setFilled(true);
        onEmpty?.(false);
      } else if (tries >= 6) {
        done = true;
        setFilled(false);
        onEmpty?.(true);
      } else {
        window.setTimeout(check, 700);
      }
    };
    const id = window.setTimeout(check, 700);
    return () => {
      done = true;
      window.clearTimeout(id);
    };
  }, [show, onEmpty]);

  return (
    <div
      ref={holderRef}
      style={{ minHeight: filled ? height : 0 }}
      className="flex w-full justify-center overflow-hidden transition-[min-height] duration-300"
    >
      {show ? (
        <iframe
          ref={frameRef}
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
            height: filled ? height : 0,
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
  const inv = INVENTORY[TENANT];
  const pathname = usePathname();
  // Master Adsterra switch (admin ON/OFF). When OFF, hide every unit — no
  // exception. Starts from the module cache so a second slot never flashes.
  const [adsterraOn, setAdsterraOn] = useState<boolean>(_adsterraMaster ?? true);
  useEffect(() => {
    let alive = true;
    fetchAdsterraMaster().then((on) => alive && setAdsterraOn(on));
    return () => {
      alive = false;
    };
  }, []);
  // Nothing is shown — no label, no reserved gap — until an ad actually paints.
  // This keeps the page clean when the network has no fill (e.g. while the
  // Adsterra domain is still being verified) instead of leaving an empty box.
  const [filled, setFilled] = useState(false);
  const onEmpty = (isEmpty: boolean) => setFilled(!isEmpty);
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
  const wrap = `${filled ? "my-6" : "my-0"} flex flex-col items-center gap-1 ${className}`;
  const tag = (
    <span className="select-none text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)] opacity-50">
      {label}
    </span>
  );

  if (unit === "rectangle") {
    if (!inv.rect) return null;
    return (
      <aside className={wrap} aria-label={label}>
        {filled && tag}
        <AdFrame doc={bannerDoc(inv.rect)} width={inv.rect.w} height={inv.rect.h} title={`${label} 300x250`} onEmpty={onEmpty} />
      </aside>
    );
  }

  if (unit === "native") {
    if (!inv.native) return null;
    return (
      <aside className={`${wrap} w-full`} aria-label={label}>
        {filled && tag}
        <div className="w-full max-w-3xl">
          <AdFrame doc={nativeDoc(inv.native)} width="100%" height={260} title={`${label} native`} onEmpty={onEmpty} />
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
  // Reserve the taller of the two candidates before we know the breakpoint,
  // so there is never a layout jump on first paint.
  return (
    <aside className={wrap} aria-label={label}>
      {filled && tag}
      {wide === null ? null : (
        <AdFrame doc={bannerDoc(b)} width={b.w} height={b.h} title={`${label} ${b.w}x${b.h}`} onEmpty={onEmpty} />
      )}
    </aside>
  );
}
