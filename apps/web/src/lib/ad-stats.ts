"use client";

import { TENANT } from "@/lib/tenant";
import type { AdUnitKind } from "@/lib/ad-config";

/**
 * How many times the ads were shown, filled and clicked — counted by the page,
 * sent once.
 *
 * Owner: "buatkan berapa kali tampil di seluruh pengunjung dan brp kali d klik
 * serta perkiraan pendapatan AdSense … ini berlaku di ekosistem ulyah.com
 * walaupun belum di acc." Three numbers per unit kind:
 *
 *   shown   the unit was placed on a page a reader loaded. Counted on EVERY
 *           site, approved or not — on a site Google has not accepted yet it
 *           is the inventory that approval would turn into money.
 *   filled  AdSense put an ad in it (`data-ad-status="filled"`). This is the
 *           impression Google pays on, so it only happens on approved domains.
 *   clicked a reader clicked the ad — see noteClick for how that is known.
 *
 * WHY ONE REQUEST PER PAGE. The database these land in is D1 on the free plan:
 * 500 MB and 100,000 row writes a day, shared with everything else the
 * platform writes. A row per impression would spend the day's writes on
 * bookkeeping. So every unit on a page adds to one tally in memory, and the
 * tally goes out in a single beacon when the reader leaves (`pagehide`, or the
 * tab going to the background, which is the last moment a mobile browser
 * reliably lets a page speak). The server turns that into ONE upsert on a
 * one-row-per-site-per-day table.
 *
 * Nothing here is sent to Google or changes an ad. It observes the page.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

type Tally = Record<AdUnitKind, { shown: number; filled: number; clicked: number }>;

const fresh = (): Tally => ({
  banner: { shown: 0, filled: 0, clicked: 0 },
  flex: { shown: 0, filled: 0, clicked: 0 },
});

let tally: Tally = fresh();
let armed = false;

function isEmpty(t: Tally): boolean {
  return (["banner", "flex"] as const).every((k) => !t[k].shown && !t[k].filled && !t[k].clicked);
}

/** Send what this page counted, then start over. Never throws. */
function flush(): void {
  if (isEmpty(tally)) return;
  const body = JSON.stringify({ site: TENANT.id, ...tally });
  tally = fresh();
  try {
    const url = `${API_BASE}/track/ads`;
    // text/plain is CORS-safelisted, so the beacon needs no preflight — the
    // same reason the pageview beacon uses it.
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }));
    } else {
      fetch(url, { method: "POST", body, headers: { "Content-Type": "text/plain" }, keepalive: true }).catch(() => {});
    }
  } catch {
    /* analytics never breaks a page */
  }
}

/**
 * Listen once per page load for the moments a page can still speak.
 *
 * `visibilitychange → hidden` is the one mobile browsers honour; `pagehide`
 * covers a real unload and the back/forward cache. Client-side navigation
 * inside the site is neither, so AdSlot's unmount also flushes — otherwise a
 * reader who read five pages would be reported once, at the end.
 */
function arm(): void {
  if (armed || typeof window === "undefined") return;
  armed = true;
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("blur", onWindowBlur);
  window.addEventListener("focus", onWindowFocus);
}

export function noteShown(unit: AdUnitKind): void {
  arm();
  tally[unit].shown += 1;
}

export function noteFilled(unit: AdUnitKind): void {
  arm();
  tally[unit].filled += 1;
}

/** Flush now — for a route change, where no browser event fires. */
export function flushAdStats(): void {
  flush();
}

/**
 * How a click is known.
 *
 * An AdSense creative is a cross-origin iframe; nothing on this side can see
 * inside it, and nothing should. What CAN be seen is the one thing a click on
 * an iframe always does: it moves focus into the iframe, so this window
 * blurs, and `document.activeElement` becomes that iframe. If the iframe sits
 * inside one of our units, a reader clicked that ad.
 *
 * It is an ESTIMATE, labelled as one wherever it is shown: a keyboard user
 * tabbing into an ad counts, and a click that opens nothing may not. AdSense's
 * own dashboard is the authority on clicks; this exists so the owner can see
 * the whole ecosystem in one place, including the sites AdSense does not
 * report on yet. It changes nothing about the ad and sends Google nothing.
 *
 * `lastClicked` makes one focus one click; it is cleared when focus comes back
 * to the page, so a reader who returns and clicks the same ad again has
 * clicked twice.
 */
let lastClicked: Element | null = null;

function onWindowBlur(): void {
  // activeElement is updated just after the blur fires.
  window.setTimeout(() => {
    const el = document.activeElement;
    if (!el || el.tagName !== "IFRAME" || el === lastClicked) return;
    const host = el.closest<HTMLElement>("[data-ad-unit]");
    if (!host) return;
    const unit = host.getAttribute("data-ad-unit");
    if (unit !== "banner" && unit !== "flex") return;
    lastClicked = el;
    tally[unit].clicked += 1;
    // A click usually opens the advertiser — the page may not get another
    // chance to report.
    flush();
  }, 0);
}

function onWindowFocus(): void {
  lastClicked = null;
}
