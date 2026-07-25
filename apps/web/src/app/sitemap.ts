import type { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE, LOCALE_SITE, ALL_LOCALES, localeCanonicalUrl, HUB_SITE, isLocaleReady } from "@ulyah/shared/i18n";
import { localizedRoute } from "@ulyah/shared/routes";
import { TENANT } from "@/lib/tenant";

const BASE = TENANT.siteUrl;
const ROUTES = ["", "/quran", "/hadits", "/sanad", "/kisah", "/kitab", "/kitab-pesantren", "/amalan", "/haji-umroh", "/nasakh", "/audiobook", "/harian", "/jadwal-sholat", "/radio", "/quran-flipbook", "/widget", "/anak", "/kids", "/zakat", "/kiblat", "/kalender-hijriyah", "/waris", "/imsakiyah", "/tanya", "/donasi", "/tentang", "/syukur", "/terima-kasih", "/kontak", "/cari", "/kebijakan-privasi"];

// The hadith collections, the story slugs and the kitab catalogue all come
// from the database now (see contentPaths below). They used to be hardcoded
// here, which is exactly why only a handful of pages were ever announced.

// Every site serves its OWN language at BARE URLs (no /id on ulyah.com, no
// /fr on 1fr.fr, …) — the middleware rewrites bare → default locale and 301s
// the prefixed twins, so the sitemap must list the bare form.
/** This site's url for a route, with the slug in this site's own language —
 *  dawa.es/horarios-de-oracion, never dawa.es/jadwal-sholat. */
function urlFor(localeCode: string, route: string): string {
  const slug = localizedRoute(route, localeCode);
  return localeCode === DEFAULT_LOCALE ? `${BASE}${slug}` : `${BASE}/${localeCode}${slug}`;
}

// Full hreflang graph for a route (owner: "link sitemap mengikuti bahasa, jangan
// bahasa Indonesia semua"). Every one of the 28 ecosystem languages declares
// where its copy of the route lives: the four with their own domain point there
// (en → xad.es, fr → 1fr.fr, de → tilawa.de, es → dawa.es), Indonesian is bare
// on the hub, and every other language (ar/ru/zh/ja + the India/Turkey/Persia/…
// set) is the hub under its /<code> prefix — via the shared localeCanonicalUrl,
// so all five sitemaps stay consistent.
function crossDomainLanguages(route: string): Record<string, string> {
  const langs: Record<string, string> = {};
  // Only languages actually being served. A language still being finished
  // redirects to the site's own language, so declaring an hreflang for it would
  // point search engines at a URL that immediately redirects — a Search Console
  // error, and a promise of a page that does not exist yet. They reappear here
  // automatically the moment they reach 100%.
  for (const l of ALL_LOCALES) {
    if (!isLocaleReady(l.code)) continue;
    // Each language's copy lives at ITS OWN url — the French alternate of
    // /jadwal-sholat is 1fr.fr/horaires-priere, not 1fr.fr/jadwal-sholat.
    // Pointing hreflang at a url that only redirects is a Search Console
    // error and wastes the crawl.
    langs[l.code] = localeCanonicalUrl(l.code, localizedRoute(route, l.code));
  }
  langs["x-default"] = `${HUB_SITE}${route}`;
  return langs;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

/**
 * Every content path the site publishes, read from the database at build time.
 *
 * The sitemap was a hardcoded list — 31 section routes and five story series
 * someone remembered to add — so search engines were never told about the 1,191
 * stories, 4,967 catalogue entries, 62 figures and the rest. Those pages
 * existed and were reachable, but nothing announced them, and Google does not
 * find what it is not shown (owner: "harusnya sitemap 1 situs ini ribuan").
 *
 * Reading it from the database means new content enters the sitemap by
 * existing. A failed fetch is not fatal: the section routes below are still
 * emitted, so a bad build day costs the DISCOVERY of new pages, never the
 * pages already indexed.
 */
async function contentPaths(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/content/sitemap`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const j = (await res.json()) as { paths?: string[]; ok?: boolean };
    return j.ok && Array.isArray(j.paths) ? j.paths : [];
  } catch {
    return [];
  }
}

/** How often a section changes, and how much it matters, by its first segment. */
function weightFor(path: string): { changeFrequency: "daily" | "weekly" | "monthly"; priority: number } {
  if (path.startsWith("/hadits/")) return { changeFrequency: "weekly", priority: 0.8 };
  if (path.startsWith("/kisah/tokoh/")) return { changeFrequency: "monthly", priority: 0.6 };
  if (path.startsWith("/kisah/")) return { changeFrequency: "monthly", priority: 0.6 };
  if (path.startsWith("/kitab-pesantren/")) return { changeFrequency: "monthly", priority: 0.7 };
  // A catalogue entry is one book among thousands; the category page above it
  // is what deserves the crawler's attention first.
  if (/^\/kitab\/[^/]+\/\d+$/.test(path)) return { changeFrequency: "monthly", priority: 0.4 };
  if (path.startsWith("/kitab/")) return { changeFrequency: "weekly", priority: 0.7 };
  return { changeFrequency: "monthly", priority: 0.5 };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const lastModified = new Date();
  // Every language this DOMAIN actually hosts gets its own URLs — on ulyah.com
  // that is Indonesian at bare paths. The four languages with their OWN domain
  // are NOT listed here: they live on the sibling sites and are referenced
  // through the cross-domain hreflang alternates, so nothing is duplicated
  // (owner: "hati-hati sitemap, jangan sampai duplikat"). Unfinished languages
  // are excluded too — they redirect home, so their urls would be redirects.
  const OWN_LOCALES = LOCALES.filter(
    (l) => isLocaleReady(l.code) && (!LOCALE_SITE[l.code] || LOCALE_SITE[l.code] === TENANT.siteUrl)
  );

  const content = await contentPaths();

  for (const l of OWN_LOCALES) {
    // Section routes carry the full hreflang graph: they are the pages a
    // reader lands on from search, and the ones that exist in every language.
    for (const r of ROUTES) {
      entries.push({
        url: urlFor(l.code, r),
        lastModified,
        changeFrequency: r === "" || r === "/harian" ? "daily" : "weekly",
        priority: r === "" ? 1 : r === "/quran" || r === "/hadits" ? 0.9 : 0.7,
        alternates: { languages: crossDomainLanguages(r) },
      });
    }

    // Content pages. No per-entry alternates: with thousands of pages that
    // would multiply the file for no gain, and each one already declares its
    // canonical in the page head.
    for (const p of content) {
      const w = weightFor(p);
      entries.push({ url: urlFor(l.code, p), lastModified, ...w });
    }
  }

  return entries;
}
