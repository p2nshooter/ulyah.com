import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { localizedRoute } from "@ulyah/shared/routes";

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

/**
 * The href an internal link should carry: the site's own words, at the url the
 * site actually serves.
 *
 * Use this for every internal <Link>. Writing the path by hand —
 * a hand-written `/<locale>/kitab` costs a sibling site TWO redirects on every
 * single click and every crawl:
 *
 *   /es/kitab  →301→  /kitab  →301→  /libros
 *        (the site's own language never carries a prefix)
 *              (a sibling serves its own language's slug)
 *
 * and one on the hub (/id/kitab →301→ /kitab). Redirects are not free: they
 * are a round trip before anything renders, they dilute the crawl budget of a
 * site that has just been accepted for ads, and Search Console reports the
 * internal links as pointing at redirects.
 *
 * `route` is the canonical route as it exists on disk (/kitab, /kisah/<slug>),
 * with an optional query or hash — those are carried through untouched.
 */
export function routePath(locale: string, route: string): string {
  const cut = route.search(/[?#]/);
  const path = cut === -1 ? route : route.slice(0, cut);
  const tail = cut === -1 ? "" : route.slice(cut);
  return localePath(locale, localizedRoute(path, locale)) + tail;
}
