import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { AmalanLibrary, type AmalanCategory } from "@/components/AmalanLibrary";
import { amalanLabels } from "@/lib/amalan-labels";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = amalanLabels(locale);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: `/${locale}/amalan` },
  };
}

export default async function AmalanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = amalanLabels(locale);

  let categories: AmalanCategory[] = [];
  try {
    const res = await api.get<{ categories: AmalanCategory[] }>("/content/amalan/all");
    categories = res.categories;
  } catch {
    categories = [];
  }

  return (
    <div className="pb-6">
      <div className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <PageHero icon="🤲" title={t.title} subtitle={t.subtitle} />
      </div>

      {categories.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[var(--color-text-secondary)]">{t.loading}</p>
      ) : (
        <AmalanLibrary locale={locale} categories={categories} />
      )}
    </div>
  );
}
