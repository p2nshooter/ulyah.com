import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { QuranReaderWidget } from "@/components/QuranReaderWidget";
import { mushafLabels } from "@/lib/mushaf-labels";
import { TENANT } from "@/lib/tenant";
import { localePath } from "@/lib/paths";

// Self-contained labels (radio-labels pattern) for the install banner below
// the reader — the installable Mushaf app (same MushafReader engine as
// /quran/mushaf, packaged with its own home-screen identity). Siblings render
// their own native language (fr/de); English is the fallback, never Indonesian.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.reader.allSurah} — ${TENANT.siteName}`,
    description: dict.reader.sectionSubtitle,
    alternates: { canonical: localePath(locale, `/quran`) },
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
        <h1 className="hero-entrance font-heading text-2xl sm:text-3xl">{dict.reader.allSurah}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{dict.reader.sectionSubtitle}</p>

        {/* Mushaf Utsmani — the flagship Qur'an experience, promoted at the top
            of the Qur'an page (explicit owner request: key services must be
            visible, never buried). */}
        <Link
          href={`/${locale}/quran/mushaf`}
          className="card-premium shimmer-gold mt-6 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center"
        >
          <div>
            <p className="flex items-center gap-2 font-heading text-lg">
              <span className="float-soft inline-block">📖</span> {mushafT.title}
            </p>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">{mushafT.subtitle}</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg">
            {mushafT.navLabel} →
          </span>
        </Link>

        {/* Complete tajwid reference — pairs with the coloured Mushaf. */}
        <Link
          href={`/${locale}/quran/tajwid`}
          className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4 transition hover:border-accent"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span aria-hidden>🎨</span>
            {locale === "id"
              ? "Panduan Tajwid Lengkap — semua hukum, warna & contoh"
              : locale === "ar"
                ? "دليل التجويد الكامل"
                : "Complete Tajwid Guide — every rule, colour & example"}
          </span>
          <span className="shrink-0 text-accent">→</span>
        </Link>

        <div className="mt-6">
          <QuranReaderWidget locale={locale} dict={dict} />
        </div>

      </div>
    </div>
  );
}
