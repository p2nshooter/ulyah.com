/**
 * The five sites of the owner's ecosystem that run on this API and each have
 * their own admin portal (docs/ADSENSE-BLUEPRINT.md §18). `tenant` is what an
 * admin session carries: null for ulyah.com (the hub), the site id for a sibling.
 * dawa.es is not here: it is no longer the owner's site.
 */
export type SiteId = "ulyah" | "1fr" | "tilawa" | "dawaim" | "xad";

export interface SiteInfo {
  id: SiteId;
  domain: string;
  name: string;
  /** The site's own language — the admin portal speaks it. */
  lang: string;
}

export const SITES: Record<SiteId, SiteInfo> = {
  ulyah: { id: "ulyah", domain: "ulyah.com", name: "ULYAH.COM", lang: "id" },
  "1fr": { id: "1fr", domain: "1fr.fr", name: "One Faith France", lang: "fr" },
  tilawa: { id: "tilawa", domain: "tilawa.de", name: "Tilawa", lang: "de" },
  dawaim: { id: "dawaim", domain: "dawa.im", name: "Dawa", lang: "es" },
  xad: { id: "xad", domain: "xad.es", name: "XAD", lang: "en" },
};

export const SITE_IDS = Object.keys(SITES) as SiteId[];

export const isSiteId = (v: unknown): v is SiteId => typeof v === "string" && (SITE_IDS as string[]).includes(v);

/** The site an admin session belongs to: a sibling admin's tenant, else ulyah.com. */
export function siteOfTenant(tenant: string | null | undefined): SiteId {
  return isSiteId(tenant) ? tenant : "ulyah";
}

/**
 * Which site a request acts on. A sibling admin or demo is locked to its own site;
 * the ulyah owner (tenant null, not demo) may name any site.
 */
export function actingSite(session: { tenant?: string | null; role?: string } | undefined, requested: unknown): SiteId {
  if (session?.tenant) return siteOfTenant(session.tenant);
  if (session?.role === "demo") return "ulyah";
  return isSiteId(requested) ? requested : "ulyah";
}
