import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/sitemap-source";

/**
 * https://<site>/sitemap.xml — the XML sitemap, with hreflang alternates on the
 * section routes.
 *
 * The list itself lives in lib/sitemap-source so that this route and the plain
 * text sitemap next door render the SAME pages. They used to hold two separate
 * copies and had already drifted apart by 6,300 urls.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return sitemapEntries();
}
