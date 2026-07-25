import { api } from "@/lib/api";
import { TENANT_MARKETPLACE } from "@/lib/store";

/**
 * The store's shelves for THIS site, fetched once and shared by the three
 * places that need them: the store page, each category page, and the sitemap.
 *
 * `detail` is what decides whether a category gets a url of its own. A shelf
 * with a real buying guide earns a page and enters the sitemap; a shelf without
 * one stays a card that links straight to Amazon. A page carrying one paragraph
 * and one outbound button is the thin-affiliate pattern Google penalises, so the
 * page is made conditional on the writing existing rather than on somebody
 * remembering not to create it.
 */
export interface Shelf {
  id: number;
  slug: string;
  label: string;
  blurb: string;
  keywords: string;
  department: string | null;
  icon: string | null;
  detail: string | null;
}

export interface StoreData {
  tag: string | null;
  shelves: Shelf[];
}

const EMPTY: StoreData = { tag: null, shelves: [] };

export async function storeData(): Promise<StoreData> {
  if (!TENANT_MARKETPLACE) return EMPTY;
  try {
    const r = await api.get<{ tag: string | null; shelves: Shelf[] }>(
      `/content/store?marketplace=${TENANT_MARKETPLACE}`
    );
    // No tag means no store: an untagged Amazon link is traffic given away.
    if (!r.tag) return EMPTY;
    return { tag: r.tag, shelves: Array.isArray(r.shelves) ? r.shelves : [] };
  } catch {
    // A store we cannot read is an empty store, never a broken page.
    return EMPTY;
  }
}

/** The categories that have earned a page — used for routing and the sitemap. */
export async function shelvesWithPages(): Promise<Shelf[]> {
  const { shelves } = await storeData();
  return shelves.filter((s) => (s.detail ?? "").trim().length > 0);
}
