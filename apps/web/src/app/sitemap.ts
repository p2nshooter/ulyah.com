import type { MetadataRoute } from "next";
import { LOCALES } from "@ulyah/shared/i18n";
import { KISAH_YUSUF_SERIES } from "../../../../scripts/content/kisah-yusuf";
import { KISAH_MUSA_SERIES } from "../../../../scripts/content/kisah-musa";
import { KISAH_DZULQARNAIN_SERIES } from "../../../../scripts/content/kisah-dzulqarnain";
import { KISAH_ASHABUL_KAHFI_SERIES } from "../../../../scripts/content/kisah-ashabul-kahfi";
import { KISAH_NUH_SERIES } from "../../../../scripts/content/kisah-nuh";

const BASE = "https://ulyah.com";
const ROUTES = ["", "/quran", "/hadits", "/sanad", "/kisah", "/kitab", "/kitab-pesantren", "/amalan", "/nasakh", "/audiobook", "/harian", "/jadwal-sholat", "/radio", "/quran-flipbook", "/widget", "/anak", "/zakat", "/kiblat", "/kalender-hijriyah", "/waris", "/imsakiyah", "/tanya", "/donasi", "/tentang", "/syukur", "/terima-kasih", "/kontak", "/cari", "/kebijakan-privasi"];

// The hadith books are a fixed, known set (migration 0012_hadits_collections).
// Hardcoding the slugs keeps the sitemap buildable offline — no API round-trip
// at build time — while still surfacing every readable collection to crawlers.
// The kitab-library categories are intentionally NOT hardcoded here (they're a
// large, evolving set); the /kitab landing page links them all, so Googlebot
// still reaches every category by crawling.
const HADITS_COLLECTIONS = [
  "bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "ahmad", "darimi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const l of LOCALES) {
    for (const r of ROUTES) {
      entries.push({
        url: `${BASE}/${l.code}${r}`,
        changeFrequency: r === "" || r === "/harian" ? "daily" : "weekly",
        priority: r === "" ? 1 : r === "/quran" || r === "/hadits" ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((x) => [x.code, `${BASE}/${x.code}${r}`])),
        },
      });
    }
    for (const slug of HADITS_COLLECTIONS) {
      entries.push({ url: `${BASE}/${l.code}/hadits/${slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const ep of KISAH_YUSUF_SERIES) {
      entries.push({ url: `${BASE}/${l.code}/kisah/${ep.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_MUSA_SERIES) {
      entries.push({ url: `${BASE}/${l.code}/kisah/${ep.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_DZULQARNAIN_SERIES) {
      entries.push({ url: `${BASE}/${l.code}/kisah/${ep.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_ASHABUL_KAHFI_SERIES) {
      entries.push({ url: `${BASE}/${l.code}/kisah/${ep.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
    for (const ep of KISAH_NUH_SERIES) {
      entries.push({ url: `${BASE}/${l.code}/kisah/${ep.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return entries;
}
