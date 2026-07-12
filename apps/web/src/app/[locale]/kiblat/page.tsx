import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { qiblaLabels } from "@/lib/qibla-labels";
import { QiblaCompass } from "@/components/QiblaCompass";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = qiblaLabels(locale);
  return {
    title: `${t.title} — ULYAH.COM`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/kiblat` },
  };
}

export default async function KiblatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = qiblaLabels(locale);

  return (
    <div className="mx-auto max-w-lg px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">🧭 {t.title}</h1>
      <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>

      <AdSlot position="qibla-top" />

      <div className="mt-8">
        <QiblaCompass locale={locale} />
      </div>
    </div>
  );
}
