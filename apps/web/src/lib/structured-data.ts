import { TENANT } from "@/lib/tenant";
import { localizedRoute } from "@ulyah/shared/routes";
import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";

/**
 * Structured data (JSON-LD) — how a page tells Google what it actually IS.
 *
 * Without it a search result is a blue link and a grey line. With it Google can
 * show the breadcrumb path, the author, the publication date, the book cover —
 * which is what makes a result worth clicking once it ranks. Three pages had
 * it; the 4,967-entry kitab catalogue, the 62 figures and the pesantren books
 * had none, which is most of the site.
 *
 * Two rules held throughout, because structured data that lies is worse than
 * none — Google issues manual penalties for it:
 *   · every field describes something the visitor can actually see on the page;
 *   · nothing is invented. No made-up ratings, no author we do not know, no
 *     date we did not record. A missing field is omitted, not guessed.
 */

/** This site's absolute url for a route, with the slug in its own language. */
export function absUrl(locale: string, route: string): string {
  const slug = localizedRoute(route, locale);
  return locale === DEFAULT_LOCALE ? `${TENANT.siteUrl}${slug}` : `${TENANT.siteUrl}/${locale}${slug}`;
}

const publisher = () => ({
  "@type": "Organization" as const,
  name: TENANT.siteName,
  url: TENANT.siteUrl,
  logo: { "@type": "ImageObject" as const, url: `${TENANT.siteUrl}/icon-512.png` },
});

/** Drop undefined/null/empty so nothing empty is ever emitted. */
function clean<T extends Record<string, unknown>>(o: T): T {
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) delete o[k];
  }
  return o;
}

/**
 * The trail shown under a result in Google — "ulyah.com › Kitab › Balaghah"
 * instead of a bare url. The most widely honoured rich result there is, and the
 * cheapest to be right about.
 */
export function breadcrumbs(locale: string, trail: { name: string; route: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: TENANT.siteName, item: absUrl(locale, "") },
      ...trail.map((t, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: t.name,
        item: absUrl(locale, t.route),
      })),
    ],
  };
}

/** A book: the kitab catalogue, the pesantren kitab, the hadith collections. */
export function book(opts: {
  locale: string;
  route: string;
  name: string;
  alternateName?: string | null;
  author?: string | null;
  description?: string | null;
  inLanguage?: string;
  image?: string | null;
}) {
  return clean({
    "@context": "https://schema.org",
    "@type": "Book",
    name: opts.name,
    alternateName: opts.alternateName ?? undefined,
    url: absUrl(opts.locale, opts.route),
    // Only when we actually know who wrote it — a book with no recorded author
    // simply has no author field.
    author: opts.author ? { "@type": "Person", name: opts.author } : undefined,
    description: opts.description ?? undefined,
    inLanguage: opts.inLanguage ?? opts.locale,
    image: opts.image ?? undefined,
    publisher: publisher(),
    isAccessibleForFree: true,
  });
}

/** A person the site has a biography page for — the kisah figures. */
export function person(opts: {
  locale: string;
  route: string;
  name: string;
  alternateName?: string | null;
  jobTitle?: string | null;
  description: string;
}) {
  return clean({
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    alternateName: opts.alternateName ?? undefined,
    // "Nabi", "Sahabat" — the honorific the page itself shows.
    jobTitle: opts.jobTitle ?? undefined,
    description: opts.description,
    url: absUrl(opts.locale, opts.route),
    subjectOf: { "@type": "WebPage", "@id": absUrl(opts.locale, opts.route) },
  });
}

/** A list page — the catalogue categories, a story index. Helps Google see the
 *  page as a hub worth crawling rather than a wall of links. */
export function itemList(opts: {
  locale: string;
  route: string;
  name: string;
  description?: string | null;
  items: { name: string; route: string }[];
}) {
  return clean({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description ?? undefined,
    url: absUrl(opts.locale, opts.route),
    isPartOf: { "@type": "WebSite", name: TENANT.siteName, url: TENANT.siteUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.slice(0, 100).map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: absUrl(opts.locale, it.route),
      })),
    },
  });
}

/** Questions and answers that are genuinely both ON the page. */
export function faq(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

/** Render one or more JSON-LD blocks. */
export function jsonLdProps(data: unknown) {
  return {
    type: "application/ld+json" as const,
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
