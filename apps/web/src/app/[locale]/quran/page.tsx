import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { QuranReaderWidget } from "@/components/QuranReaderWidget";
import { mushafLabels } from "@/lib/mushaf-labels";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.reader.allSurah} — ULYAH.COM`,
    description: dict.reader.sectionSubtitle,
    alternates: { canonical: `/${locale}/quran` },
  };
}

export default async function QuranPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const mushafT = mushafLabels(locale);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading text-2xl sm:text-3xl">{dict.reader.allSurah}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{dict.reader.sectionSubtitle}</p>

        <Link
          href={`/${locale}/quran/mushaf`}
          className="mt-6 flex items-center justify-between gap-4 overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-[#06251b] to-[#0B3D2E] p-6 text-[#f4efe3] shadow-lg transition hover:brightness-110 sm:p-8"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">✦ {mushafT.navLabel}</p>
            <p className="mt-2 font-heading text-xl sm:text-2xl">{mushafT.title}</p>
            <p className="mt-1 max-w-lg text-sm text-[#f4efe3]/70">{mushafT.subtitle}</p>
          </div>
          <span className="hidden shrink-0 text-4xl sm:block">📖</span>
        </Link>

        <div className="mt-6">
          <QuranReaderWidget locale={locale} dict={dict} />
        </div>
      </div>
    </div>
  );
}
