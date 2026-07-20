import type { Env } from "../env.js";
import { safeKvGet, safeKvPut } from "./kv-safe.js";

/**
 * ONE central ad configuration for the whole network — every site (the four
 * ulyah tenants AND the three AXTO sites) reads it from api.ulyah.com, and the
 * ulyah.com admin portal is the only place that edits it (owner: "semua
 * dikontrol dari portal admin ulyah.com, sekali input ID langsung live semua,
 * atau show/hide per situs").
 *
 * Model:
 *  - `slots`: placement name → real AdSense ad-unit id. Empty until the owner
 *    pastes the approved id; while empty, an enabled site shows a tasteful
 *    PREVIEW box in each slot so positions can be checked before approval.
 *  - `sites`: per-site on/off (show/hide). DEFAULT OFF for every site, so no
 *    ad (real or preview) appears anywhere until the owner turns a site on.
 *  - Turning ads real is a single action: paste the ad-unit id(s) → every
 *    enabled site immediately serves the live ad in that placement.
 */
export const AD_CLIENT_ID = "ca-pub-6371903555702163";

export type AdSite = "ulyah" | "1fr" | "tilawa" | "dawa" | "axto-io" | "axto-dev" | "axto-us" | "profity-in" | "oldco-in";
export const AD_SITES: AdSite[] = ["ulyah", "1fr", "tilawa", "dawa", "axto-io", "axto-dev", "axto-us", "profity-in", "oldco-in"];

// Placement names the AdSlot component uses across the sites. Kept small and
// deliberate — visitor-friendly density (owner: "iklan yang benar-benar ramah,
// tidak mengganggu"). One responsive ad-unit id can drive all placements, or
// the owner can give each its own id.
export const AD_PLACEMENTS = ["in_article", "list", "footer", "sidebar"] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export interface AdConfig {
  clientId: string;
  slots: Record<string, string>;
  sites: Record<string, boolean>;
}

const KV_KEY = "ads:cfg:v1";

export function defaultAdConfig(): AdConfig {
  const sites: Record<string, boolean> = {};
  for (const s of AD_SITES) sites[s] = false; // default: all hidden
  const slots: Record<string, string> = {};
  for (const p of AD_PLACEMENTS) slots[p] = "";
  return { clientId: AD_CLIENT_ID, slots, sites };
}

export async function getAdConfig(env: Env): Promise<AdConfig> {
  const raw = await safeKvGet(env, KV_KEY);
  const def = defaultAdConfig();
  if (!raw) return def;
  try {
    const parsed = JSON.parse(raw) as Partial<AdConfig>;
    return {
      clientId: AD_CLIENT_ID, // never trust a stored client id
      slots: { ...def.slots, ...(parsed.slots ?? {}) },
      sites: { ...def.sites, ...(parsed.sites ?? {}) },
    };
  } catch {
    return def;
  }
}

export async function saveAdConfig(env: Env, cfg: AdConfig): Promise<void> {
  const clean: AdConfig = { clientId: AD_CLIENT_ID, slots: {}, sites: {} };
  for (const p of AD_PLACEMENTS) {
    // slot ids are digits only, ≤20 chars
    clean.slots[p] = String(cfg.slots?.[p] ?? "").replace(/[^0-9]/g, "").slice(0, 20);
  }
  for (const s of AD_SITES) clean.sites[s] = cfg.sites?.[s] === true;
  await safeKvPut(env, KV_KEY, JSON.stringify(clean));
}

/** The public per-site view a site fetches to decide what to render. */
export function publicAdView(cfg: AdConfig, site: string) {
  const enabled = cfg.sites[site] === true;
  return {
    enabled,
    clientId: cfg.clientId,
    // Only expose slot ids when the site is enabled (nothing to leak, but keeps
    // the payload honest to what the site will render).
    slots: enabled ? cfg.slots : {},
  };
}
