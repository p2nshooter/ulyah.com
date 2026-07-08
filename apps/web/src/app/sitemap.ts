import type { MetadataRoute } from "next";
import { LOCALES } from "@ulyah/shared/i18n";
import { KISAH_YUSUF_SERIES } from "../../../../scripts/content/kisah-yusuf";

const BASE = "https://ulyah.com";
const ROUTES = ["", "/quran", "/kisah", "/kitab", "/audiobook", "/harian", "/donasi", "/tentang", "/syukur", "/cari"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const l of LOCALES) {
    for (const r of ROUTES) {
      entries.push({
        url: `${BASE}/${l.code}${r}`,
        changeFrequency: r === "" || r === "/harian" ? "daily" : "weekly",
        priority: r === "" ? 1 : r === "/quran" ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(LOCALES.map((x) => [x.code, `${BASE}/${x.code}${r}`])),
        },
      });
    }
    for (const ep of KISAH_YUSUF_SERIES) {
      entries.push({ url: `${BASE}/${l.code}/kisah/${ep.slug}`, changeFrequency: "monthly", priority: 0.6 });
    }
  }
  return entries;
}
