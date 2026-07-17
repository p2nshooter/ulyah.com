import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { haditsLabels } from "@/lib/hadits-labels";
import { PageHero } from "@/components/PageHero";

interface CollectionRow {
  slug: string;
  name_id: string;
  name_ar: string;
  author: string | null;
  total: number;
  has_native_id: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = haditsLabels(locale);
  return {
    title: `${t.title} — ULYAH.COM`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/hadits` },
  };
}

export default async function HaditsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = haditsLabels(locale);

  let collections: CollectionRow[] = [];
  try {
    const res = await api.get<{ collections: CollectionRow[] }>(`/content/hadits/collections`);
    collections = res.collections;
  } catch {
    collections = [];
  }

  const total = collections.reduce((n, c) => n + c.total, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <PageHero
        icon="🕌"
        title={t.title}
        subtitle={total > 0 ? `${t.subtitle} · ${total.toLocaleString(locale)} ${t.hadithCount}` : t.subtitle}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 desktop:grid-cols-3">
        {collections.length === 0 && (
          <p className="col-span-full text-center text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>
        )}
        {collections.map((c) => (
          <Link key={c.slug} href={`/${locale}/hadits/${c.slug}`} className="card-premium flex flex-col gap-2 p-5">
            <p dir="rtl" className="font-arabic text-xl leading-snug text-[var(--color-text-primary)]">
              {c.name_ar}
            </p>
            <p className="font-heading text-base">{c.name_id}</p>
            {c.author && <p className="text-xs text-[var(--color-text-secondary)]">{t.author}: {c.author}</p>}
            <p className="mt-1 text-xs font-medium text-accent">
              {c.total.toLocaleString(locale)} {t.hadithCount}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
