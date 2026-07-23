import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";

/**
 * Absolute URL of the per-work Open Graph / share image served by the worker
 * (`/content/og/cover.svg`). Each kitab/kisah gets its OWN cover image — the
 * same deterministic jewel binding + tooled motif as its shelf card, with the
 * given (already-localized) title stamped on it — instead of every page falling
 * back to the one generic site logo. Text is passed through so the image
 * matches the page's language and the route stays edge-cacheable.
 */
export function ogCoverUrl(opts: {
  slug: string;
  title: string;
  subtitle?: string;
  /** true when the title is Arabic/RTL (e.g. a kitab's `title_ar`) */
  rtl?: boolean;
}): string {
  const q = new URLSearchParams({ slug: opts.slug, t: opts.title, kicker: TENANT.siteName });
  if (opts.subtitle) q.set("sub", opts.subtitle);
  if (opts.rtl) q.set("rtl", "1");
  return `${api.base}/content/og/cover.svg?${q.toString()}`;
}
