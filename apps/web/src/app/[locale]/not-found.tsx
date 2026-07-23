import Link from "next/link";
import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";

// Rendered inside the locale layout, so a 404 still carries the global
// <head> (AdSense meta + loader, canonical base) and the site chrome —
// satisfying "every crawlable page, including error pages" for AdSense.
// not-found.tsx receives no params in Next's App Router, so we localize into
// the tenant's OWN default language (build-time: fr on 1fr.fr, de on tilawa.de,
// es on dawa.es, en on xad.es, id on ulyah.com) instead of leaving a hardcoded
// Indonesian page that would read as untranslated content on the sibling sites.
export default function NotFound() {
  const dict = getDictionary(DEFAULT_LOCALE);
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-heading text-6xl text-accent">404</p>
      <h1 className="mt-4 font-heading text-2xl">{dict.common.notFoundTitle}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.common.notFoundBody}</p>
      <Link
        href={`/${DEFAULT_LOCALE}`}
        className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white dark:bg-accent dark:text-primary"
      >
        ← {dict.nav.home}
      </Link>
    </div>
  );
}
