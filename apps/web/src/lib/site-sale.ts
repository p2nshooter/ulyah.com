import { TENANT } from "./tenant";
import { getCached } from "./api";
import type { SaleCtx } from "./sale-copy";

/**
 * ulyah.com is for sale (owner, 28–29 Oct 2026; docs/ADSENSE-BLUEPRINT.md §17):
 * US$250,000, negotiable, offers from US$50,000, shown from the very top of the
 * home page and a dedicated header menu, everything set from Admin → Situs dijual
 * (stored in R2 by the API, GET /sale?site=). Since 29 Oct (§17.3) 1fr.fr, tilawa.de,
 * dawa.im and xad.es are sold the same way, at the same price, each in its own
 * language, all managed from the ulyah.com admin.
 *
 * dawa.es is no longer the owner's: it keeps its old acquisition page untouched.
 */

export interface SaleTerms {
  visible: boolean;
  priceUsd: number;
  minOfferUsd: number;
  negotiable: boolean;
  whatsapp: string;
  email: string;
  /** Empty = the Masjidil Haram channel of the /live hub. */
  makkahLiveUrl: string;
}

export const SALE_DEFAULTS: SaleTerms = {
  visible: true,
  priceUsd: 250_000,
  minOfferUsd: 50_000,
  negotiable: true,
  whatsapp: "+6285691234561",
  email: "salam@ulyah.com",
  makkahLiveUrl: "",
};

/** The five sites on sale (worker-api lib/sites.ts). */
export const SALE_SITE_IDS = ["ulyah", "1fr", "tilawa", "dawaim", "xad"] as const;
export const IS_SALE_SITE = (SALE_SITE_IDS as readonly string[]).includes(TENANT.id);

/** A body of unknown shape → the terms, every field checked (scripts/check-api-shape-guards.ts). */
export function toSaleTerms(raw: unknown): SaleTerms {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : d);
  const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
  return {
    visible: typeof r.visible === "boolean" ? r.visible : SALE_DEFAULTS.visible,
    priceUsd: num(r.priceUsd, SALE_DEFAULTS.priceUsd),
    minOfferUsd: num(r.minOfferUsd, SALE_DEFAULTS.minOfferUsd),
    negotiable: typeof r.negotiable === "boolean" ? r.negotiable : SALE_DEFAULTS.negotiable,
    whatsapp: str(r.whatsapp, SALE_DEFAULTS.whatsapp),
    email: str(r.email, SALE_DEFAULTS.email),
    makkahLiveUrl: str(r.makkahLiveUrl, SALE_DEFAULTS.makkahLiveUrl),
  };
}

/**
 * The current terms for a server-rendered page: cached for everyone (no credentials) and
 * refreshed every five minutes, so a change in the admin reaches the page without a deploy.
 * If the API cannot be reached the page still renders, with the published defaults.
 */
export async function saleTerms(): Promise<SaleTerms> {
  if (!IS_SALE_SITE) return { ...SALE_DEFAULTS, visible: false };
  try {
    return toSaleTerms(await getCached<unknown>(`/sale?site=${TENANT.id}`, 300));
  } catch {
    return SALE_DEFAULTS;
  }
}

/** What the sale words need to know about this site and its terms (lib/sale-copy.ts). */
export function saleContext(terms: SaleTerms, locale: string, stats: { kitabTotal: number; kitabCats: number; iqroLevels: number } = { kitabTotal: 0, kitabCats: 0, iqroLevels: 0 }): SaleCtx {
  return {
    name: TENANT.siteName,
    domain: TENANT.siteUrl.replace(/^https?:\/\//, ""),
    price: usd(terms.priceUsd, locale),
    min: usd(terms.minOfferUsd, locale),
    negotiable: terms.negotiable,
    ...stats,
  };
}

/** The read-only demo login of a site's admin portal, for prospective buyers (docs/ADSENSE-BLUEPRINT.md §18). */
export interface SaleDemo { url: string; email: string; password: string }

export function toSaleDemo(raw: unknown): SaleDemo | null {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  if (r.enabled !== true || typeof r.url !== "string" || typeof r.email !== "string" || typeof r.password !== "string") return null;
  return { url: r.url, email: r.email, password: r.password };
}

/** The demo login for this site, refreshed every five minutes; none when switched off or unreachable. */
export async function saleDemo(): Promise<SaleDemo | null> {
  if (!IS_SALE_SITE) return null;
  try {
    return toSaleDemo(await getCached<unknown>(`/sale/demo?site=${TENANT.id}`, 300));
  } catch {
    return null;
  }
}

/** Another site on sale, for the "also for sale" list of every sale page. */
export interface SaleSiteSummary { site: string; domain: string; name: string; priceUsd: number; minOfferUsd: number; negotiable: boolean }

export function toSaleNetwork(raw: unknown): SaleSiteSummary[] {
  const list = raw && typeof raw === "object" && Array.isArray((raw as { sites?: unknown }).sites) ? ((raw as { sites: unknown[] }).sites) : [];
  return list.filter((x): x is SaleSiteSummary => {
    const r = x as Partial<SaleSiteSummary> | null;
    return !!r && typeof r.site === "string" && typeof r.domain === "string" && typeof r.name === "string" && typeof r.priceUsd === "number" && typeof r.minOfferUsd === "number";
  }).map((x) => ({ ...x, negotiable: x.negotiable !== false }));
}

/** Every site on sale (visible ones), refreshed every five minutes; empty when unreachable. */
export async function saleNetwork(): Promise<SaleSiteSummary[]> {
  if (!IS_SALE_SITE) return [];
  try {
    return toSaleNetwork(await getCached<unknown>("/sale/network", 300));
  } catch {
    return [];
  }
}

/**
 * A dollar amount the way each language writes it: "US$250.000" (id), "US$250,000" (en),
 * "250 000 $ US" (fr), "250.000 US$" (de, es).
 */
export function usd(n: number, locale = "id"): string {
  const v = Math.round(n);
  if (locale === "fr") return `${v.toLocaleString("fr-FR")} $ US`;
  if (locale === "de") return `${v.toLocaleString("de-DE")} US$`;
  if (locale === "es") return `${v.toLocaleString("es-ES", { useGrouping: true })} US$`;
  return `US$${v.toLocaleString(locale === "id" ? "id-ID" : "en-US")}`;
}

/** "US$250K" / "US$1,2M" — the short form for the header pill. */
export function usdShort(n: number): string {
  if (n >= 1_000_000) return `US$${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })}M`;
  if (n >= 1_000) return `US$${Math.round(n / 1_000)}K`;
  return `US$${n}`;
}

/** A wa.me link with a prefilled first message. */
export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
