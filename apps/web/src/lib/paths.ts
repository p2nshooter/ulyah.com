import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";

/**
 * URL path for a page in `locale`. The site's OWN language lives at BARE
 * paths — ulyah.com without /id, 1fr.fr without /fr, tilawa.de without /de,
 * dawa.es without /es (middleware rewrites bare → default locale and 301s
 * the prefixed twins away). Canonicals and share URLs must agree with that,
 * or Search Console reports canonical-pointing-at-redirect chains.
 */
export function localePath(locale: string, path = ""): string {
  const p = path === "" || path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return p === "" ? "/" : p;
  return `/${locale}${p}`;
}
