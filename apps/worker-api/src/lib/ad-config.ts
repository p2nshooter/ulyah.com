import type { Env } from "../env.js";
import { safeKvGet, safeKvPut } from "./kv-safe.js";

/**
 * ONE central ad configuration for the whole network — every site reads it
 * from api.ulyah.com, and the ulyah.com admin portal is the only place that
 * edits it (owner: "semua dikontrol dari portal admin ulyah.com").
 *
 * Model (v2 — per-site approval checklist):
 *  - `slots`: placement → the ONE real AdSense ad-unit id, pasted once by the
 *    owner after AdSense approval. While empty, enabled sites show a tasteful
 *    PREVIEW box so ad positions/spacing can be checked before going live.
 *  - `sites[id]` = { enabled, approved }:
 *      enabled  — show/hide this site's ads (default OFF everywhere).
 *      approved — the owner's "AdSense has accepted THIS site" checkbox. Only
 *                 when a site is BOTH enabled AND approved does it serve real
 *                 ads; enabled-but-not-approved shows preview only. This is the
 *                 checklist the owner asked for: "checklist dulu mana yang
 *                 sudah di-acc agar tidak langsung semua aktif — kalau dicentang
 *                 & disimpan, website itu langsung terisi id iklannya".
 *
 * So the go-live flow is: enable a site → preview positions → paste the real
 * unit id once → tick 'approved' on the sites AdSense accepted → those sites
 * instantly serve live ads, the rest stay in preview. One control point.
 */
export const AD_CLIENT_ID = "ca-pub-6371903555702163";

export type AdSite =
  | "ulyah" | "1fr" | "tilawa" | "dawa"
  | "axto-io" | "axto-dev" | "axto-us"
  | "profity-in" | "oldco-in"
  | "xaa-es" | "xad-es" | "jai-lat" | "lie-skin";

export const AD_SITES: AdSite[] = [
  "ulyah", "1fr", "tilawa", "dawa",
  "axto-io", "axto-dev", "axto-us",
  "profity-in", "oldco-in",
  "xaa-es", "xad-es", "jai-lat", "lie-skin",
];

// Placement names used across the network's AdSlot components. The older
// tenants/AXTO use in_article/list/footer/sidebar; the newer English article
// sites use in_article_1/in_article_2/sidebar/footer. One responsive ad-unit
// id can drive them all, or the owner can give each its own.
export const AD_PLACEMENTS = ["in_article", "in_article_1", "in_article_2", "list", "footer", "sidebar"] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export interface SiteAdState {
  enabled: boolean;
  approved: boolean;
}

export interface AdConfig {
  clientId: string;
  slots: Record<string, string>;
  sites: Record<string, SiteAdState>;
}

const KV_KEY = "ads:cfg:v1";

export function defaultAdConfig(): AdConfig {
  const sites: Record<string, SiteAdState> = {};
  for (const s of AD_SITES) sites[s] = { enabled: false, approved: false };
  const slots: Record<string, string> = {};
  for (const p of AD_PLACEMENTS) slots[p] = "";
  return { clientId: AD_CLIENT_ID, slots, sites };
}

/** Coerce a stored site value that may be the old boolean form OR the new
 * { enabled, approved } object into the new shape. */
function coerceSite(v: unknown): SiteAdState {
  if (typeof v === "boolean") return { enabled: v, approved: false };
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return { enabled: o.enabled === true, approved: o.approved === true };
  }
  return { enabled: false, approved: false };
}

export async function getAdConfig(env: Env): Promise<AdConfig> {
  const raw = await safeKvGet(env, KV_KEY);
  const def = defaultAdConfig();
  if (!raw) return def;
  try {
    const parsed = JSON.parse(raw) as Partial<AdConfig>;
    const sites: Record<string, SiteAdState> = { ...def.sites };
    for (const s of AD_SITES) sites[s] = coerceSite((parsed.sites as Record<string, unknown> | undefined)?.[s]);
    return {
      clientId: AD_CLIENT_ID, // never trust a stored client id
      slots: { ...def.slots, ...(parsed.slots ?? {}) },
      sites,
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
  for (const s of AD_SITES) clean.sites[s] = coerceSite(cfg.sites?.[s]);
  await safeKvPut(env, KV_KEY, JSON.stringify(clean));
}

/** The public per-site view a site fetches to decide what to render.
 * `slots` are returned whenever the site is ENABLED so the site can show
 * either a preview (no id yet, or not approved) or the real ad (approved +
 * id present). The AdSlot component gates the real ad on `approved`. */
export function publicAdView(cfg: AdConfig, site: string) {
  const st = coerceSite(cfg.sites[site]);
  return {
    enabled: st.enabled,
    approved: st.approved,
    clientId: cfg.clientId,
    slots: st.enabled ? cfg.slots : {},
  };
}
