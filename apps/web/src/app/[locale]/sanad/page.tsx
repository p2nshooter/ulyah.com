import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { sanadLabels } from "@/lib/sanad-labels";
import { SanadExplorer } from "@/components/SanadExplorer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = sanadLabels(locale);
  return {
    title: `${t.title} — ULYAH.COM`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/sanad` },
  };
}

export default async function SanadPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = sanadLabels(locale);

  return (
    <div className="px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-heading text-3xl">🔗 {t.title}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>

        <div className="mt-6">
        </div>

        <div className="mt-8">
          <SanadExplorer locale={locale} />
        </div>
      </div>
    </div>
  );
}
