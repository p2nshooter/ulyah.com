import type { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE, LOCALE_SITE, ALL_LOCALES, localeCanonicalUrl, HUB_SITE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";
import { KISAH_YUSUF_SERIES } from "../../../../scripts/content/kisah-yusuf";
import { KISAH_MUSA_SERIES } from "../../../../scripts/content/kisah-musa";
import { KISAH_DZULQARNAIN_SERIES } from "../../../../scripts/content/kisah-dzulqarnain";
import { KISAH_ASHABUL_KAHFI_SERIES } from "../../../../scripts/content/kisah-ashabul-kahfi";
import { KISAH_NUH_SERIES } from "../../../../scripts/content/kisah-nuh";

const BASE = TENANT.siteUrl;
const ROUTES = ["", "/quran", "/hadits", "/sanad", "/kisah", "/kitab", "/kitab-pesantren", "/amalan", "/haji-umroh", "/nasakh", "/audiobook", "/harian", "/jadwal-sholat", "/radio", "/quran-flipbook", "/widget", "/anak", "/kids", "/zakat", "/kiblat", "/kalender-hijriyah", "/waris", "/imsakiyah", "/tanya", "/donasi", "/tentang", "/syukur", "/terima-kasih", "/kontak", "/cari", "/kebijakan-privasi"];

// The hadith books are a fixed, known set (migration 0012_hadits_collections).
// Hardcoding the slugs keeps the sitemap buildable offline — no API round-trip
// at build time — while still surfacing every readable collection to crawlers.
// The kitab-library categories are intentionally NOT hardcoded here (they're a
// large, evolving set); the /kitab landing page links them all, so Googlebot
// still reaches every category by crawling.
const HADITS_COLLECTIONS = [
  "bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "ahmad", "darimi",
];

// Every site serves its OWN language at BARE URLs (no /id on ulyah.com, no
// /fr on 1fr.fr, …) — the middleware rewrites bare → default locale and 301s
// the prefixed twins, so the sitemap must list the bare form.
function urlFor(localeCode: string, route: string): string {
  return localeCode === DEFAULT_LOCALE ? `${BASE}${route}` : `${BASE}/${localeCode}${route}`;
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
  for (const l of ALL_LOCALES) langs[l.code] = localeCanonicalUrl(l.code, route);
  langs["x-default"] = `${HUB_SITE}${route}`;
  return langs;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  // Every language this DOMAIN actually hosts gets its own URLs — on ulyah.com
  // that's Indonesian (bare) plus the ~23 languages served in place under a
  // /<code> prefix (Arabic, Russian, Chinese, Japanese, Urdu, Hindi, Turkish,
  // …), so the sitemap "follows the language" instead of listing Indonesian
  // only. The four languages with their OWN domain (en/de/es/fr) are NOT listed
  // here — they live on the sibling sites and are referenced via the
  // cross-domain hreflang alternates, so we never duplicate their content
  // (owner: "hati-hati sitemap, jangan sampai duplikat"). On a sibling tenant
  // LOCALES is already just that one language, and it is hosted there, so this
  // filter keeps it.
  const OWN_LOCALES = LOCALES.filter(
    (l) => !LOCALE_SITE[l.code] || LOCALE_SITE[l.code] === TENANT.siteUrl
  );
  for (const l of OWN_LOCALES) {
    for (const r of ROUTES) {
      entries.push({
        url: urlFor(l.code, r),
        changeFrequency: r === "" || r === "/harian" ? "daily" : "weekly",
        priority: r === "" ? 1 : r === "/quran" || r === "/hadits" ? 0.9 : 0.7,
        alternates: {
          languages: crossDomainLanguages(r),
        },
      });
    }
    for (const slug of HADITS_COLLECTIONS) {
      entries.push({ url: urlFor(l.code, `/hadits/${slug}`), changeFrequency: "weekly", priority: 0.8 });
    }
    for (const ep of KISAH_YUSUF_SERIES) {
      entries.push({ url: urlFor(l.code, `/kisah/${ep.slug}`), changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_MUSA_SERIES) {
      entries.push({ url: urlFor(l.code, `/kisah/${ep.slug}`), changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_DZULQARNAIN_SERIES) {
      entries.push({ url: urlFor(l.code, `/kisah/${ep.slug}`), changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_ASHABUL_KAHFI_SERIES) {
      entries.push({ url: urlFor(l.code, `/kisah/${ep.slug}`), changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_NUH_SERIES) {
      entries.push({ url: urlFor(l.code, `/kisah/${ep.slug}`), changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return entries;
}
