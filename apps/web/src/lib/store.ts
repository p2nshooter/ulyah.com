import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";

/**
 * Which Amazon each site sends its readers to.
 *
 * Amazon's product data comes in the marketplace's own language, so a site is
 * paired with the Amazon that already speaks it: no translation involved, and
 * nothing to fall out of date. That is the whole reason the store is per site
 * rather than one shared catalogue.
 *
 * ulyah.com is absent on purpose. AMAZON DOES NOT OPERATE IN INDONESIA — there
 * is no amazon.co.id — so the only options for an Indonesian page would have
 * been English product titles from amazon.com or amazon.sg. The owner's call
 * was "jangan pasang di ulyah.com dulu", and this map is where that decision
 * lives: no entry, no store, no route.
 */
export const MARKETPLACE_BY_LOCALE: Record<string, string> = {
  en: "com",
  fr: "fr",
  de: "de",
  es: "es",
};

/** Every marketplace the store may talk to — the allow-list for user input. */
export const MARKETPLACES = ["com", "fr", "de", "es"] as const;
export type Marketplace = (typeof MARKETPLACES)[number];

export const MARKETPLACE_HOST: Record<string, string> = {
  com: "www.amazon.com",
  fr: "www.amazon.fr",
  de: "www.amazon.de",
  es: "www.amazon.es",
};

/** This build's marketplace, or null on a site that has none (ulyah.com). */
export const TENANT_MARKETPLACE: string | null = MARKETPLACE_BY_LOCALE[DEFAULT_LOCALE] ?? null;

/**
 * A shelf's link: an Amazon search, pre-filtered and carrying our tag.
 *
 * This is what makes "thousands of products without picking any" possible and
 * legal at the same time. Amazon permits linking to search results with an
 * associate tag; it does not permit copying the results onto our own page. So
 * the reader arrives at Amazon inside the right aisle and chooses there.
 *
 * `keywords` are written in the marketplace's own language — "coran" on
 * amazon.fr — so the search lands where a French reader expects.
 */
export function searchUrl(
  marketplace: string,
  keywords: string,
  tag: string,
  department?: string | null
): string {
  const host = MARKETPLACE_HOST[marketplace] ?? MARKETPLACE_HOST.com!;
  const q = new URLSearchParams({ k: keywords, tag, linkCode: "ll2" });
  // Amazon's search index — "stripbooks" for books, "electronics", … — narrows
  // a broad word to the right department instead of the whole store.
  if (department) q.set("i", department);
  return `https://${host}/s?${q.toString()}`;
}

/** Amazon search departments worth offering. The VALUE is Amazon's, identical
 *  in every marketplace; only the label shown to the owner is ours. */
export const DEPARTMENTS = [
  { value: "", label: "Semua departemen" },
  { value: "stripbooks", label: "Buku" },
  { value: "electronics", label: "Elektronik" },
  { value: "hpc", label: "Kesehatan & perawatan" },
  { value: "kitchen", label: "Rumah & dapur" },
  { value: "fashion", label: "Fesyen" },
  { value: "toys-and-games", label: "Mainan & permainan" },
  { value: "sporting", label: "Olahraga & luar ruang" },
  { value: "luggage", label: "Tas & koper" },
] as const;
