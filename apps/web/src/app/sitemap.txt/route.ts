import { LOCALES } from "@ulyah/shared/i18n";
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

const BASE = "https://ulyah.com";

const ROUTES = [
  "", "/quran", "/hadits", "/kisah", "/kitab", "/kitab-pesantren", "/amalan", "/nasakh", "/audiobook",
  "/harian", "/jadwal-sholat", "/radio", "/zakat", "/kiblat", "/kalender-hijriyah", "/waris", "/imsakiyah", "/tanya",
  "/donasi", "/tentang", "/syukur", "/terima-kasih", "/kontak", "/cari", "/kebijakan-privasi",
];

const HADITS_COLLECTIONS = [
  "bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "ahmad", "darimi",
];

export function GET() {
  const lines: string[] = [];
  for (const l of LOCALES) {
    for (const r of ROUTES) lines.push(`${BASE}/${l.code}${r}`);
    for (const slug of HADITS_COLLECTIONS) lines.push(`${BASE}/${l.code}/hadits/${slug}`);
    for (const ep of KISAH_YUSUF_SERIES) lines.push(`${BASE}/${l.code}/kisah/${ep.slug}`);
    for (const ep of KISAH_MUSA_SERIES) lines.push(`${BASE}/${l.code}/kisah/${ep.slug}`);
    for (const ep of KISAH_DZULQARNAIN_SERIES) lines.push(`${BASE}/${l.code}/kisah/${ep.slug}`);
    for (const ep of KISAH_ASHABUL_KAHFI_SERIES) lines.push(`${BASE}/${l.code}/kisah/${ep.slug}`);
    for (const ep of KISAH_NUH_SERIES) lines.push(`${BASE}/${l.code}/kisah/${ep.slug}`);
  }
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
