import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";

// The search page itself is a client component, so its per-page metadata
// (unique title + canonical) lives here in a segment layout instead.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.nav.searchPlaceholder} — ULYAH.COM`,
    description: dict.hero.description,
    alternates: { canonical: `/${locale}/cari` },
  };
}

export default function CariLayout({ children }: { children: React.ReactNode }) {
  return children;
}
