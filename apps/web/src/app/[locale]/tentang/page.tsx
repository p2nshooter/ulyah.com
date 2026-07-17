import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.nav.about}`,
    description: dict.hero.description,
    alternates: { canonical: `/${locale}/tentang` },
  };
}

export default async function TentangPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const s = dict.syukur;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{dict.nav.about}</h1>
      <div className="prose prose-sm mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
        <p>{dict.hero.description}</p>
        <p>{dict.donation.subtitle}</p>
        <p>{dict.ctaBanner.note}</p>
      </div>

      {/* Karya Abadi — short dedication summary, full version on /syukur */}
      <div className="mt-10 rounded-2xl border border-accent/30 bg-[var(--color-card)] p-6 text-center">
        <p className="font-heading text-xl text-primary dark:text-accent">{s.karyaAbadiTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">{s.karyaAbadiIntro}</p>
        <p className="mt-4 text-xs italic leading-relaxed text-[var(--color-text-secondary)]">
          “{s.karyaAbadiQuote}”
        </p>
        <Link href={`/${locale}/syukur`} className="mt-5 inline-block text-xs font-medium text-accent hover:underline">
          {s.navLabel} →
        </Link>
      </div>
    </div>
  );
}
