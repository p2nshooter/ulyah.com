import { LOCALES, DEFAULT_LOCALE, LOCALE_SITE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";
import { KISAH_YUSUF_SERIES } from "../../../../../scripts/content/kisah-yusuf";
import { KISAH_MUSA_SERIES } from "../../../../../scripts/content/kisah-musa";
import { KISAH_DZULQARNAIN_SERIES } from "../../../../../scripts/content/kisah-dzulqarnain";
import { KISAH_ASHABUL_KAHFI_SERIES } from "../../../../../scripts/content/kisah-ashabul-kahfi";
import { KISAH_NUH_SERIES } from "../../../../../scripts/content/kisah-nuh";

/**
 * Plain-text sitemap served at https://ulyah.com/sitemap.txt — one absolute
 * URL per line, UTF-8, exactly the format Google Search Console accepts as a
 * "text sitemap". This exists alongside the Next.js-generated sitemap.xml
 * because the XML route is rendered dynamically on Cloudflare/OpenNext and
 * Search Console has been rejecting it; a static text list is the most
 * robust, un-blockable way to get every URL indexed. Kept in sync with
 * sitemap.ts (same ROUTES / collections / kisah series).
 */

export const dynamic = "force-static";

// Per-tenant base URL — the sibling sites (tilawa.de, 1fr.fr) MUST list their
// own domain here, not ulyah.com, so submitting just the root domain to Search
// Console indexes the whole site ("biar cukup https://tilawa.de"). This was
// hardcoded to ulyah.com, which made the siblings' text sitemap advertise
// ulyah.com URLs instead of their own.
const BASE = TENANT.siteUrl;

const ROUTES = [
  "", "/quran", "/hadits", "/sanad", "/kisah", "/kitab", "/kitab-pesantren", "/amalan", "/haji-umroh", "/nasakh", "/audiobook",
  "/harian", "/jadwal-sholat", "/radio", "/quran-flipbook", "/widget", "/anak", "/kids", "/zakat", "/kiblat", "/kalender-hijriyah", "/waris", "/imsakiyah", "/tanya",
  "/donasi", "/tentang", "/syukur", "/terima-kasih", "/kontak", "/cari", "/kebijakan-privasi",
];

const HADITS_COLLECTIONS = [
  "bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "ahmad", "darimi",
];

export function GET() {
  const lines: string[] = [];
  // The default locale lives at BARE URLs (middleware rewrite) — the text
  // sitemap must list those, matching sitemap.xml.
  const prefix = (code: string) => (code === DEFAULT_LOCALE ? "" : `/${code}`);
  // Only the languages THIS domain actually hosts (ulyah.com = id + the ~23
  // domainless languages; a sibling = its single language). The four languages
  // that own a domain live there, not under ulyah.com/<code>, so listing them
  // here would advertise duplicate content of the sibling sites.
  const OWN_LOCALES = LOCALES.filter(
    (l) => !LOCALE_SITE[l.code] || LOCALE_SITE[l.code] === TENANT.siteUrl
  );
  for (const l of OWN_LOCALES) {
    const p = prefix(l.code);
    for (const r of ROUTES) lines.push(`${BASE}${p}${r}` || BASE);
    for (const slug of HADITS_COLLECTIONS) lines.push(`${BASE}${p}/hadits/${slug}`);
    for (const ep of KISAH_YUSUF_SERIES) lines.push(`${BASE}${p}/kisah/${ep.slug}`);
    for (const ep of KISAH_MUSA_SERIES) lines.push(`${BASE}${p}/kisah/${ep.slug}`);
    for (const ep of KISAH_DZULQARNAIN_SERIES) lines.push(`${BASE}${p}/kisah/${ep.slug}`);
    for (const ep of KISAH_ASHABUL_KAHFI_SERIES) lines.push(`${BASE}${p}/kisah/${ep.slug}`);
    for (const ep of KISAH_NUH_SERIES) lines.push(`${BASE}${p}/kisah/${ep.slug}`);
  }
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
