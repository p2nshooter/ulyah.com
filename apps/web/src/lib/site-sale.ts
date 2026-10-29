import { TENANT } from "./tenant";
import { getCached } from "./api";

/**
 * ulyah.com is for sale (owner, 28–29 Oct 2026; docs/ADSENSE-BLUEPRINT.md §17):
 * US$250,000, negotiable, offers from US$50,000, shown from the very top of the
 * home page and a dedicated header menu, everything set from Admin → Situs dijual
 * (stored in R2 by the API, GET /sale).
 *
 * Only ulyah.com uses these terms; the sibling sites keep their own acquisition
 * page (app/[locale]/acquisition) with its fixed copy.
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

/** ulyah.com itself is the site on sale. */
export const IS_SALE_SITE = TENANT.id === "ulyah";

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
    return toSaleTerms(await getCached<unknown>("/sale", 300));
  } catch {
    return SALE_DEFAULTS;
  }
}

/** "US$250.000" in Indonesian grouping, "US$250,000" in English. */
export function usd(n: number, locale = "id"): string {
  return `US$${Math.round(n).toLocaleString(locale === "id" ? "id-ID" : "en-US")}`;
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
