/**
 * Splits a bab into leaves, the way a printed kitab is set.
 *
 * Not "n passages per page": the matn of a classical kitab are wildly uneven —
 * a line of Alfiyah is 40 characters, a passage of Minhajut Thalibin is 12,000.
 * Ten of the first fit a page comfortably; one of the second overflows it. So
 * a leaf is filled by how much ink it holds, and a passage longer than a whole
 * leaf simply gets one to itself rather than being cut mid-sentence — a matn
 * broken across a page turn is unreadable, and the reciter would stop mid-word.
 */

/** Roughly what fits on one leaf at the default reading size. */
export const LEAF_INK = 1400;
/** However full the leaf already is, a new passage may still start on it. */
const LEAF_MIN_ITEMS = 1;

export interface LeafItem {
  id: number;
  /** The Arabic, which is what dominates the page. */
  text_ar: string;
  /** The terjemah set underneath it, if the kitab has one yet. */
  translation_id?: string | null;
}

/** Every leaf is a run of consecutive passages — order is never rearranged. */
export function paginateLeaves<T extends LeafItem>(items: T[], ink = LEAF_INK): T[][] {
  const leaves: T[][] = [];
  let leaf: T[] = [];
  let used = 0;

  for (const item of items) {
    const cost = (item.text_ar?.length ?? 0) + (item.translation_id?.length ?? 0);
    // Start a new leaf once this one is full — but never emit an empty leaf,
    // so a single passage longer than the budget still gets a page of its own.
    if (leaf.length >= LEAF_MIN_ITEMS && used + cost > ink) {
      leaves.push(leaf);
      leaf = [];
      used = 0;
    }
    leaf.push(item);
    used += cost;
  }
  if (leaf.length) leaves.push(leaf);
  return leaves.length ? leaves : [[]];
}

/** Which leaf a passage sits on — how the pager follows the reciter. */
export function leafOf<T extends LeafItem>(leaves: T[][], id: number | null | undefined): number {
  if (id == null) return -1;
  for (let i = 0; i < leaves.length; i++) {
    if (leaves[i].some((m) => m.id === id)) return i;
  }
  return -1;
}
