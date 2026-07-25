import type { MetadataRoute } from "next";
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_SITE,
  ALL_LOCALES,
  localeCanonicalUrl,
  HUB_SITE,
  isLocaleReady,
} from "@ulyah/shared/i18n";
import { localizedRoute } from "@ulyah/shared/routes";
import { TENANT } from "@/lib/tenant";

/**
 * THE list of pages this site announces to search engines.
 *
 * There are two sitemap routes — /sitemap.xml and /sitemap.txt, both named in
 * robots.txt — and until now each carried its own copy of the answer. They
 * drifted, exactly as duplicated lists do: the XML learned to read the database
 * (6,333 urls) and to write each site's slugs in its own language, while the
 * TXT stayed a hand-written list of 31 routes with Indonesian slugs on the
 * Spanish, French and German sites, advertising languages that are switched off
 * and therefore only redirect. Google was being handed two contradictory
 * answers about the same site.
 *
 * So both now come from here, and cannot disagree again.
 */

const BASE = TENANT.siteUrl;

/** The section pages — the ones that exist regardless of what is in the database. */
export const ROUTES = [
  "",
  "/quran",
  "/hadits",
  "/sanad",
  "/kisah",
  "/kitab",
  "/kitab-pesantren",
  "/amalan",
  "/haji-umroh",
  "/nasakh",
  "/audiobook",
  "/harian",
  "/jadwal-sholat",
  "/radio",
  "/quran-flipbook",
  "/widget",
  "/anak",
  "/kids",
  "/zakat",
  "/kiblat",
  "/kalender-hijriyah",
  "/waris",
  "/imsakiyah",
  "/tanya",
  "/donasi",
  "/tentang",
  "/syukur",
  "/terima-kasih",
  "/kontak",
  "/cari",
  "/kebijakan-privasi",
];

// The hadith collections, the story slugs and the kitab catalogue all come from
// the database (see contentPaths below). They used to be hardcoded, which is
// exactly why only a handful of pages were ever announced.

// Every site serves its OWN language at BARE URLs (no /id on ulyah.com, no /fr
// on 1fr.fr, …) — the middleware rewrites bare → default locale and 301s the
// prefixed twins, so the sitemap must list the bare form.
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
    // Pointing hreflang at a url that only redirects is a Search Console error
    // and wastes the crawl.
    langs[l.code] = localeCanonicalUrl(l.code, localizedRoute(route, l.code));
  }
  langs["x-default"] = `${HUB_SITE}${route}`;
  return langs;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

/** A page in the sitemap, with a real modification date only when we hold one. */
type ContentPath = { path: string; lastModified?: Date };

/**
 * SQLite's datetime('now') writes "2026-01-02 03:04:05" in UTC. Turn that into
 * a Date; anything unparseable — or dated in the future, which no published
 * page can honestly be — yields undefined and the page simply carries no date.
 */
function parseDbDate(value: string, now: number): Date | undefined {
  const iso = /[Zz]|[+-]\d{2}:?\d{2}$/.test(value)
    ? value.replace(" ", "T")
    : value.replace(" ", "T") + "Z";
  const at = new Date(iso).getTime();
  if (Number.isNaN(at) || at > now) return undefined;
  return new Date(at);
}

/**
 * Every content path the site publishes, read from the database.
 *
 * The sitemap was a hardcoded list — 31 section routes and five story series
 * someone remembered to add — so search engines were never told about the 1,191
 * stories, 4,967 catalogue entries, 62 figures and the rest. Those pages
 * existed and were reachable, but nothing announced them, and Google does not
 * find what it is not shown (owner: "harusnya sitemap 1 situs ini ribuan").
 *
 * Reading it from the database means new content enters the sitemap by
 * existing. A failed fetch is not fatal: the section routes are still emitted,
 * so a bad day costs the DISCOVERY of new pages, never the pages already
 * indexed.
 *
 * The api answers in two lists: `dated` carries the stories, whose publication
 * date is recorded, and `paths` carries everything whose change date we do not
 * know. That split is the point — see DAILY_ROUTES below.
 */
async function contentPaths(): Promise<ContentPath[]> {
  try {
    const res = await fetch(`${API_BASE}/content/sitemap`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const j = (await res.json()) as { paths?: string[]; dated?: [string, string][]; ok?: boolean };
    if (!j.ok) return [];
    const now = Date.now();
    const out: ContentPath[] = Array.isArray(j.paths) ? j.paths.map((path) => ({ path })) : [];
    if (Array.isArray(j.dated)) {
      for (const [path, mod] of j.dated) {
        if (typeof path !== "string" || !path) continue;
        out.push({ path, lastModified: typeof mod === "string" ? parseDbDate(mod, now) : undefined });
      }
    }
    return out;
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

/**
 * Section pages whose content is genuinely different today than yesterday — the
 * home page's daily ayah, today's prayer times, the imsakiyah table, the daily
 * reading. Those, and only those, are honestly stamped with the build date.
 *
 * Every other section (/quran, /kitab, /tentang, /kebijakan-privasi …) is the
 * same page it was last month, so it goes out with NO lastmod rather than a
 * fresh one. Google's rule is blunt and worth respecting: lastmod values it can
 * tell are automatic get ignored site-wide, and that would cost us the 1,191
 * story dates that are real.
 */
const DAILY_ROUTES = new Set(["", "/harian", "/jadwal-sholat", "/imsakiyah", "/kalender-hijriyah"]);

/**
 * Which languages THIS domain hosts.
 *
 * The four languages that own a domain live there, not under ulyah.com/<code>,
 * so listing them here would advertise duplicate content of the sibling sites
 * (owner: "hati-hati sitemap, jangan sampai duplikat"). Languages still being
 * finished are excluded too: they redirect to the site's own language, so their
 * urls would be an invitation to a redirect.
 */
function ownLocales() {
  return LOCALES.filter(
    (l) => isLocaleReady(l.code) && (!LOCALE_SITE[l.code] || LOCALE_SITE[l.code] === TENANT.siteUrl)
  );
}

/** Every entry this site publishes — the single source both sitemaps render. */
export async function sitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const buildDate = new Date();
  const content = await contentPaths();

  for (const l of ownLocales()) {
    // Section routes carry the full hreflang graph: they are the pages a reader
    // lands on from search, and the ones that exist in every language.
    for (const r of ROUTES) {
      const daily = DAILY_ROUTES.has(r);
      entries.push({
        url: urlFor(l.code, r),
        ...(daily ? { lastModified: buildDate } : {}),
        changeFrequency: daily ? "daily" : "weekly",
        priority: r === "" ? 1 : r === "/quran" || r === "/hadits" ? 0.9 : 0.7,
        alternates: { languages: crossDomainLanguages(r) },
      });
    }

    // Content pages. No per-entry alternates: with thousands of pages that
    // would multiply the file for no gain, and each one already declares its
    // canonical in the page head. lastModified appears only where the database
    // actually recorded one.
    for (const p of content) {
      entries.push({
        url: urlFor(l.code, p.path),
        ...(p.lastModified ? { lastModified: p.lastModified } : {}),
        ...weightFor(p.path),
      });
    }
  }

  return entries;
}
