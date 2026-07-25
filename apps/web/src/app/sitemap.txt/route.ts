import { sitemapEntries } from "@/lib/sitemap-source";

/**
 * Plain-text sitemap at https://<site>/sitemap.txt — one absolute URL per line,
 * UTF-8, the format Search Console accepts as a "text sitemap". It exists
 * alongside sitemap.xml because the XML route renders dynamically on
 * Cloudflare/OpenNext, and a flat text list is the most robust thing to hand a
 * crawler that trips over that.
 *
 * It now renders from the same source as sitemap.xml. It did not before, and
 * the two had drifted badly: this file still held a hand-written list of 31
 * routes plus five story series (37 urls against the XML's 6,333), wrote
 * Indonesian slugs on the Spanish, French and German sites — dawa.es/jadwal-sholat,
 * the exact thing the owner objected to — and listed every domainless language
 * including the ones switched off, whose urls only redirect. robots.txt points
 * Google at both files, so it was being given two contradictory answers about
 * the same site.
 */

// No longer force-static: the page list comes from the database, the same way
// sitemap.xml gets it, and a build-time snapshot would go stale the moment a
// story is published. The response is cached at the edge for a day instead.
export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await sitemapEntries();
  const body = entries.map((e) => e.url).join("\n") + "\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
