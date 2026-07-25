import type { MetadataRoute } from "next";
import { sitemapEntries, sitemapGroups, type SitemapGroup } from "@/lib/sitemap-source";

/**
 * The XML sitemaps, one per language per section — /sitemap/id-kisah.xml,
 * /sitemap/id-kitab.xml, and so on.
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
 * The list itself lives in lib/sitemap-source so these routes and the plain
 * text sitemap next door describe the SAME pages — they used to hold separate
 * copies and had drifted apart by 6,300 urls.
 */
export async function generateSitemaps(): Promise<SitemapGroup[]> {
  return sitemapGroups();
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const groups = await sitemapGroups();
  const group = groups.find((g) => g.id === id);
  // An unknown id means a stale url — answer with nothing rather than with the
  // whole site under a name that no longer means anything.
  return group ? sitemapEntries(group) : [];
}
