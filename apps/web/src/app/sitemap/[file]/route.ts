import type { MetadataRoute } from "next";
import { sitemapEntries, sitemapGroups } from "@/lib/sitemap-source";

/**
 * The XML sitemaps, one per language per section — /sitemap/id-kisah.xml,
 * /sitemap/id-kitab.xml, and so on. /sitemap.xml (next door) is their index.
 *
 * It used to be a single file of 6,333 urls. That is legal and it is also
 * unreadable: Search Console reports discovered/indexed PER SITEMAP, so one
 * file gives one number for the entire site and no way to see that (say) the
 * kitab catalogue is being ignored while the stories are fine.
 *
 * Split by language first (owner: "pisahkan semua sitemap sesuai bahasa
 * masing-masing untuk memperluas SEO"), then by section, and the report becomes
 * a diagnosis. A language switched on later simply arrives with its own files.
 *
 * These were app/sitemap.ts with generateSitemaps. Next.js 16 maps that file
 * to /sitemap.xml as well, where it collides with the index route, so the
 * files are written here — same urls, same XML.
 *
 * The list itself lives in lib/sitemap-source so these routes and the plain
 * text sitemap describe the SAME pages — they used to hold separate copies and
 * had drifted apart by 6,300 urls.
 */

// Rendered once, refreshed hourly — never rebuilt per request against a 10 ms
// CPU budget.
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await sitemapGroups()).map((g) => ({ file: `${g.id}.xml` }));
}

/** XML text escaping. Our urls are ascii slugs, but a sitemap that can be broken
 *  by one ampersand in a slug is a trap worth closing at the source. */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const iso = (d: string | Date) => (typeof d === "string" ? d : d.toISOString());

function urlset(entries: MetadataRoute.Sitemap): string {
  const rows = entries.map((e) => {
    let row = `<url>\n<loc>${esc(e.url)}</loc>\n`;
    for (const [lang, href] of Object.entries(e.alternates?.languages ?? {})) {
      if (href) row += `<xhtml:link rel="alternate" hreflang="${esc(lang)}" href="${esc(String(href))}" />\n`;
    }
    if (e.lastModified) row += `<lastmod>${iso(e.lastModified)}</lastmod>\n`;
    if (e.changeFrequency) row += `<changefreq>${e.changeFrequency}</changefreq>\n`;
    if (typeof e.priority === "number") row += `<priority>${e.priority}</priority>\n`;
    return row + `</url>\n`;
  });
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    rows.join("") +
    `</urlset>\n`
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!file.endsWith(".xml")) return new Response("Not found", { status: 404 });
  const id = file.slice(0, -".xml".length);
  const group = (await sitemapGroups()).find((g) => g.id === id);
  // An unknown id means a stale url — answer with an empty set rather than with
  // the whole site under a name that no longer means anything.
  const body = urlset(group ? await sitemapEntries(group) : []);
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
