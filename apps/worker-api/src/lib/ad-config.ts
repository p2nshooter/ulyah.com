import type { Env } from "../env.js";
import { safeKvGet, safeKvPut } from "./kv-safe.js";

/**
 * ONE central ad configuration for the whole network — every site reads it
 * from api.ulyah.com, and the ulyah.com admin portal is the only place that
 * edits it (owner: "semua dikontrol dari portal admin ulyah.com").
 *
 * ONE NETWORK. Adsterra is gone from the ecosystem (owner: "hapus iklan
 * adsterra di ekosistem ulyah.com, ganti dengan adsense aja"), so the master
 * switch and the per-site Adsterra toggles went with it. A stored config that
 * still carries those fields simply loses them on the next read — they are not
 * read, not written, and not returned to any site.
 *
 * Model (v3 — AdSense only, per-site approval checklist):
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
  | "ulyah" | "1fr" | "tilawa" | "dawa" | "xad"
  | "axto-io" | "axto-dev" | "axto-us"
  | "profity-in" | "oldco-in"
  | "xaa-es" | "xad-es" | "jai-lat" | "lie-skin";

export const AD_SITES: AdSite[] = [
  // ulyah ecosystem (one language per domain): id, en=xad.es, fr, de, es
  "ulyah", "1fr", "tilawa", "dawa", "xad",
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
  /**
   * AUTO ADS — let Google place the ads itself.
   *
   * The manual path needs an ad-unit id (`data-ad-slot`), which only exists
   * after somebody creates a unit in the AdSense dashboard. Auto ads needs no
   * id at all: the same loader script this site already carries on every page
   * is the whole integration, and Google decides the placements from a setting
   * in the dashboard.
   *
   * When this is on, our own units stand down — AdSlot renders nothing and the
   * page-fill engine places nothing — because Google is already inserting its
   * own and two sets of placements on one page is how a site ends up ad-heavy.
   * So: `autoAds` on = Google's placements only; off = ours only.
   */
  autoAds: boolean;
}

export interface AdConfig {
  clientId: string;
  slots: Record<string, string>;
  sites: Record<string, SiteAdState>;
}

const KV_KEY = "ads:cfg:v1";

export function defaultAdConfig(): AdConfig {
  const sites: Record<string, SiteAdState> = {};
  for (const s of AD_SITES) sites[s] = { enabled: false, approved: false, autoAds: false };
  const slots: Record<string, string> = {};
  for (const p of AD_PLACEMENTS) slots[p] = "";
  return { clientId: AD_CLIENT_ID, slots, sites };
}

/**
 * Coerce a stored site value into the current shape. Three generations of it
 * are in the database — a bare boolean, { enabled, approved }, and the same
 * plus an `adsterra` flag — and all three have to read cleanly, because the
 * config is one row that is only ever rewritten in full. Anything unknown
 * (including that dead `adsterra` field) is dropped.
 */
function coerceSite(v: unknown): SiteAdState {
  if (typeof v === "boolean") return { enabled: v, approved: false, autoAds: false };
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return { enabled: o.enabled === true, approved: o.approved === true, autoAds: o.autoAds === true };
  }
  return { enabled: false, approved: false, autoAds: false };
}

function normalizeAdConfig(parsed: Partial<AdConfig>): AdConfig {
  const def = defaultAdConfig();
  const sites: Record<string, SiteAdState> = { ...def.sites };
  for (const s of AD_SITES) sites[s] = coerceSite((parsed.sites as Record<string, unknown> | undefined)?.[s]);
  return {
    clientId: AD_CLIENT_ID, // never trust a stored client id
    slots: { ...def.slots, ...(parsed.slots ?? {}) },
    sites,
  };
}

/**
 * @param consistent When true (the ADMIN read path), read from D1 — the
 *   read-after-write-consistent source of truth, so a toggle saved in the
 *   admin is visible on the very next refresh (KV's ~60 s edge read-cache used
 *   to serve the stale value and snap the switch back ON). When false (the
 *   high-traffic PUBLIC per-site view), read the fast KV cache and only fall
 *   back to D1 — eventual (<1 min) propagation is fine for what a site renders.
 */
export async function getAdConfig(env: Env, consistent = false): Promise<AdConfig> {
  if (consistent) {
    try {
      const row = await env.DB.prepare("SELECT json FROM ad_config WHERE id = 1").first<{ json: string }>();
      if (row?.json) return normalizeAdConfig(JSON.parse(row.json) as Partial<AdConfig>);
    } catch {
      /* fall through to KV */
    }
  }
  const raw = await safeKvGet(env, KV_KEY);
  if (raw) {
    try {
      return normalizeAdConfig(JSON.parse(raw) as Partial<AdConfig>);
    } catch {
      /* fall through */
    }
  }
  // KV empty/unparneable — try D1 before giving up on the default.
  try {
    const row = await env.DB.prepare("SELECT json FROM ad_config WHERE id = 1").first<{ json: string }>();
    if (row?.json) return normalizeAdConfig(JSON.parse(row.json) as Partial<AdConfig>);
  } catch {
    /* fall through */
  }
  return defaultAdConfig();
}

export async function saveAdConfig(env: Env, cfg: AdConfig): Promise<AdConfig> {
  const clean: AdConfig = { clientId: AD_CLIENT_ID, slots: {}, sites: {} };
  for (const p of AD_PLACEMENTS) {
    // slot ids are digits only, ≤20 chars
    clean.slots[p] = String(cfg.slots?.[p] ?? "").replace(/[^0-9]/g, "").slice(0, 20);
  }
  for (const s of AD_SITES) clean.sites[s] = coerceSite(cfg.sites?.[s]);
  const json = JSON.stringify(clean);
  // D1 first — the consistent store the admin reads back on refresh. The
  // single row is pinned to id = 1 (UPSERT), so there is never more than one.
  try {
    await env.DB.prepare(
      `INSERT INTO ad_config (id, json, updated_at) VALUES (1, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = datetime('now')`
    )
      .bind(json)
      .run();
  } catch (e) {
    console.warn("ad_config D1 write failed, KV still updated:", e instanceof Error ? e.message : e);
  }
  // KV too — best-effort warm cache for the public per-site view.
  await safeKvPut(env, KV_KEY, json);
  // Return the exact config we just wrote so the caller never has to re-read.
  return clean;
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
    autoAds: st.autoAds,
    clientId: cfg.clientId,
    // Auto ads needs no unit ids, and sending them would only invite a second
    // set of placements on a page Google is already filling.
    slots: st.enabled && !st.autoAds ? cfg.slots : {},
  };
}
