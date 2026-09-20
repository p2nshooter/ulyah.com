"use client";

import { TENANT } from "@/lib/tenant";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

export interface AdView {
  enabled: boolean;
  approved: boolean;
  /** Google places the ads itself — our own units stand down. See SiteAdState. */
  autoAds: boolean;
  clientId: string;
  slots: Record<string, string>;
}

const EMPTY: AdView = { enabled: false, approved: false, autoAds: false, clientId: "", slots: {} };

/**
 * One fetch per page load, shared by every AdSlot (the config is tiny and
 * identical for all slots on the page). Always api.ulyah.com, so every tenant
 * reads the SAME central config edited from the ulyah admin.
 *
 * A PLAIN fetch, deliberately — not the `api` helper, which sends
 * `credentials: "include"` and a JSON content-type on everything.
 *
 * That combination is why no site could read this. A credentialed cross-origin
 * request is refused by the browser unless the server answers with the caller's
 * exact origin; `/content/ad-config` answers `Access-Control-Allow-Origin: *`
 * (the route sets it explicitly, overwriting what the CORS middleware echoed).
 * `*` with credentials is not a weaker rule, it is an invalid one: the response
 * is thrown away before any code sees it, `fetchAdView` falls into its catch,
 * and every AdSlot on every page decides the site is switched off. No error, no
 * warning — just no ads, everywhere, forever.
 *
 * There is nothing to send credentials FOR: the ad config is public, the same
 * for every visitor, and carries no cookie. So this asks for it the way it
 * should always have been asked for. `no-store` keeps an admin toggle
 * effective on the very next refresh.
 */
let cached: Promise<AdView> | null = null;

export function fetchAdView(): Promise<AdView> {
  if (cached) return cached;
  cached = fetch(`${API_BASE}/content/ad-config?site=${encodeURIComponent(TENANT.id)}`, { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<AdView>) : Promise.reject(new Error(String(r.status)))))
    .then((v) => ({
      enabled: !!v.enabled,
      approved: !!v.approved,
      autoAds: !!v.autoAds,
      clientId: v.clientId ?? "",
      slots: v.slots ?? {},
    }))
    .catch(() => EMPTY);
  return cached;
}
