/**
 * Build-time tenant configuration — ONE codebase and ONE content database
 * serve four sites:
 *
 *   • ulyah.com          — the global Islamic platform (default tenant, id)
 *   • 1fr.fr             — One Faith France, French only
 *   • tilawa.de          — Tilawa, German only
 *   • dawa.es            — Dawa, Spanish only
 *   • xad.es             — the English member of the ecosystem, English only
 *
 * The tenant is fixed at BUILD time via NEXT_PUBLIC_TENANT,
 * and the deploy workflow builds/deploys the app twice (ulyah-web and
 * onefaith-web workers). Build-time — not hostname sniffing — so there are
 * no runtime edge cases and each deployment is fully static-optimizable.
 * packages/shared/src/i18n.ts reads the same variable to narrow LOCALES and
 * switch DEFAULT_LOCALE, so routing, dictionaries, and hreflang stay in
 * lock-step with this file.
 */

export type TenantId = "ulyah" | "1fr" | "tilawa" | "dawa" | "xad";

export interface TenantConfig {
  id: TenantId;
  /** Public origin (canonical URLs, sitemap, OpenGraph). */
  siteUrl: string;
  siteName: string;
  /** Short brand line under the logo; per-locale where it matters. */
  tagline: Record<string, string>;
  /** Square app icon and wide banner (public/ paths). */
  logoIcon: string;
  logoBanner: string | null;
  /** Wordmark images for header/footer; null = render siteName as text. */
  wordmark: string | null;
  wordmarkGold: string | null;
  acquisitionEmail: string | null;
  features: {
    /** Ad slots (AdSense/Adsterra) allowed at all. */
    ads: boolean;
    /** Donation CTA promoted into the header + hero. */
    donationForward: boolean;
    /** Public "this site is for sale" acquisition section/page. */
    forSale: boolean;
  };
}

const ULYAH: TenantConfig = {
  id: "ulyah",
  siteUrl: "https://ulyah.com",
  siteName: "ULYAH.COM",
  tagline: {},
  logoIcon: "/icon.png",
  logoBanner: null,
  wordmark: "/brand/wordmark-ar.png",
  wordmarkGold: "/brand/wordmark-ar-gold.png",
  acquisitionEmail: null,
  features: { ads: true, donationForward: false, forSale: false },
};

const ONEFAITH: TenantConfig = {
  id: "1fr",
  siteUrl: "https://1fr.fr",
  siteName: "One Faith France",
  tagline: {
    fr: "Le Portail Islamique en Français",
  },
  logoIcon: "/brand/1fr/icon.png",
  logoBanner: "/brand/1fr/banner.png",
  wordmark: null,
  wordmarkGold: null,
  acquisitionEmail: "salam@ulyah.com",
  // Owner (Update Global Seluruh Portal §2): the AdSense loader script must be
  // present on every page of EVERY site — ads are enabled on all tenants.
  features: { ads: true, donationForward: true, forSale: true },
};

const TILAWA: TenantConfig = {
  id: "tilawa",
  siteUrl: "https://tilawa.de",
  siteName: "Tilawa",
  tagline: {
    de: "Das islamische Portal auf Deutsch",
  },
  logoIcon: "/brand/tilawa/icon.png",
  logoBanner: "/brand/tilawa/banner.png",
  wordmark: null,
  wordmarkGold: null,
  // All acquisition offers go to the OWNER's inbox (owner: "semua email
  // penawaran ke salam@ulyah.com") — the sibling domain's own mailbox is an
  // asset the BUYER receives, not the negotiation channel.
  acquisitionEmail: "salam@ulyah.com",
  features: { ads: true, donationForward: true, forSale: true },
};

const DAWA: TenantConfig = {
  id: "dawa",
  siteUrl: "https://dawa.es",
  siteName: "Dawa",
  tagline: {
    es: "El Portal Islámico en Español",
  },
  logoIcon: "/brand/dawa/icon.png",
  logoBanner: "/brand/dawa/banner.png",
  wordmark: null,
  wordmarkGold: null,
  acquisitionEmail: "salam@ulyah.com",
  features: { ads: true, donationForward: true, forSale: true },
};

const XAD: TenantConfig = {
  id: "xad",
  siteUrl: "https://xad.es",
  // XAD = "eXplore Ayah Daily" — the English member of the ecosystem.
  siteName: "XAD",
  tagline: {
    en: "eXplore Ayah Daily — Qur'an, Hadith & Tafsir in English",
  },
  logoIcon: "/brand/xad/icon.svg",
  logoBanner: "/brand/xad/banner.svg",
  wordmark: null,
  wordmarkGold: null,
  acquisitionEmail: "salam@ulyah.com",
  // Core English member of the ecosystem — ads on, donation forward, not for sale.
  features: { ads: true, donationForward: true, forSale: false },
};

const TENANTS: Record<string, TenantConfig> = { "1fr": ONEFAITH, tilawa: TILAWA, dawa: DAWA, xad: XAD, ulyah: ULYAH };

export const TENANT: TenantConfig = TENANTS[process.env.NEXT_PUBLIC_TENANT ?? "ulyah"] ?? ULYAH;

export function tenantTagline(locale: string, fallback: string): string {
  // Prefer the requested locale, then the tenant's own default language, then
  // the caller's fallback — so a sibling site always shows a native tagline.
  const first = Object.keys(TENANT.tagline)[0];
  return TENANT.tagline[locale] ?? (first ? TENANT.tagline[first] : undefined) ?? fallback;
}
