import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { zakatLabels } from "@/lib/zakat-labels";
import { ZakatCalculator } from "@/components/ZakatCalculator";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = zakatLabels(locale);
  return {
    title: `${t.title}`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/zakat` },
  };
}

export default async function ZakatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = zakatLabels(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">🕋 {t.title}</h1>
      <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>

      <div className="mt-8">
        <ZakatCalculator locale={locale} />
      </div>
    </div>
  );
}
