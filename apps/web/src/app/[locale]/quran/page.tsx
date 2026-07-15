import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { QuranReaderWidget } from "@/components/QuranReaderWidget";
import { mushafLabels } from "@/lib/mushaf-labels";

// Self-contained labels (radio-labels pattern) for the widget banner below
// the reader — points straight at the installable Qur'an Flipbook widget so
// it is discoverable from the page people actually read the Qur'an on.
function widgetBannerLabels(locale: string): { title: string; desc: string; cta: string; store: string } {
  if (locale === "id")
    return {
      title: "Widget Al-Qur'an Flipbook",
      desc: "Mushaf digital dengan animasi buku membalik — bisa dipasang di layar utama HP sebagai aplikasi sendiri.",
      cta: "Buka & Pasang Widget →",
      store: "Semua widget",
    };
  if (locale === "ar")
    return {
      title: "ودجت المصحف (فليب بوك)",
      desc: "مصحف رقمي بتأثير تقليب الصفحات — يمكن تثبيته على الشاشة الرئيسية كتطبيق مستقل.",
      cta: "افتح وثبّت الودجت ←",
      store: "كل الودجات",
    };
  return {
    title: "Qur'an Flipbook Widget",
    desc: "A digital mushaf with a page-turn animation — installable on your home screen as its own app.",
    cta: "Open & Install Widget →",
    store: "All widgets",
  };
}

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

        <div className="mt-6">
          <QuranReaderWidget locale={locale} dict={dict} />
        </div>

        {/* The installable Qur'an widget, right where Qur'an readers are. */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 font-heading text-lg">
              <span>📖</span> {widgetBannerLabels(locale).title}
            </p>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">{widgetBannerLabels(locale).desc}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/quran-flipbook?install=1`}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
            >
              📲 {widgetBannerLabels(locale).cta}
            </Link>
            <Link href={`/${locale}/widget`} className="text-sm text-accent hover:underline">
              {widgetBannerLabels(locale).store}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
