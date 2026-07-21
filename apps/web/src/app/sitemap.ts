import type { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";
import { KISAH_YUSUF_SERIES } from "../../../../scripts/content/kisah-yusuf";
import { KISAH_MUSA_SERIES } from "../../../../scripts/content/kisah-musa";
import { KISAH_DZULQARNAIN_SERIES } from "../../../../scripts/content/kisah-dzulqarnain";
import { KISAH_ASHABUL_KAHFI_SERIES } from "../../../../scripts/content/kisah-ashabul-kahfi";
import { KISAH_NUH_SERIES } from "../../../../scripts/content/kisah-nuh";

const BASE = TENANT.siteUrl;
const ROUTES = ["", "/quran", "/hadits", "/sanad", "/kisah", "/kitab", "/kitab-pesantren", "/amalan", "/haji-umroh", "/nasakh", "/audiobook", "/harian", "/jadwal-sholat", "/radio", "/quran-flipbook", "/widget", "/anak", "/zakat", "/kiblat", "/kalender-hijriyah", "/waris", "/imsakiyah", "/tanya", "/donasi", "/tentang", "/syukur", "/terima-kasih", "/kontak", "/cari", "/kebijakan-privasi"];

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

// Cross-DOMAIN hreflang (owner: Update Global Seluruh Portal §3): the same
// route exists on all four sites, each in its own language, so every sitemap
// URL declares its translations on the sibling domains — id → ulyah.com,
// fr → 1fr.fr, de → tilawa.de, es → dawa.es — each at its bare native URL.
function crossDomainLanguages(route: string): Record<string, string> {
  return {
    id: `https://ulyah.com${route}`,
    en: `https://xad.es${route}`,
    fr: `https://1fr.fr${route}`,
    de: `https://tilawa.de${route}`,
    es: `https://dawa.es${route}`,
    "x-default": `https://ulyah.com${route}`,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  // One language per DOMAIN: each site's sitemap lists ONLY its own default
  // language at bare URLs (ulyah.com=id, xad.es=en, 1fr.fr=fr, tilawa.de=de,
  // dawa.es=es); the other languages live on their sibling domains and are
  // referenced via the cross-domain hreflang alternates below. Listing every
  // LOCALES prefix here (e.g. ulyah.com/en/*) would duplicate the sibling
  // domains' content and trip AdSense/Search Console duplicate checks
  // (owner: "hati-hati sitemap, jangan sampai duplikat").
  const OWN_LOCALES = LOCALES.filter((l) => l.code === DEFAULT_LOCALE);
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
