import { sitemapIndex } from "@/lib/sitemap-source";
import { TENANT } from "@/lib/tenant";

/**
 * https://<site>/sitemap.xml — the sitemap INDEX.
 *
 * The sitemaps themselves are one per language per section
 * (/sitemap/id-kisah.xml …), served by app/sitemap/[file]/route.ts, and
 * /sitemap.xml is the one address robots.txt has always named and Google
 * already knows — so the index is written here.
 */

// Same cadence as the children: rendered once, refreshed hourly, never rebuilt
// per request against a 10 ms CPU budget.
export const revalidate = 3600;

/** XML text escaping. Our urls are ascii slugs, but a sitemap that can be broken
 *  by one ampersand in a slug is a trap worth closing at the source. */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const entries = await sitemapIndex();
  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map(
        (e) =>
          `  <sitemap>\n` +
          `    <loc>${esc(`${TENANT.siteUrl}/sitemap/${e.id}.xml`)}</loc>\n` +
          (e.lastModified ? `    <lastmod>${e.lastModified.toISOString()}</lastmod>\n` : "") +
          `  </sitemap>\n`
      )
      .join("") +
    `</sitemapindex>\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
