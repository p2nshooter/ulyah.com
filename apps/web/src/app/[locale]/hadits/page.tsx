import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { haditsLabels } from "@/lib/hadits-labels";
import { PageHero } from "@/components/PageHero";
import { localePath } from "@/lib/paths";
import { coverFor } from "@/lib/book-cover";

interface CollectionRow {
  slug: string;
  name_id: string;
  name: string; // localized to the requested language by the API
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
    title: `${t.title}`,
    description: t.subtitle,
    alternates: { canonical: localePath(locale, `/hadits`) },
  };
}

export default async function HaditsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = haditsLabels(locale);

  let collections: CollectionRow[] = [];
  try {
    const res = await api.get<{ collections: CollectionRow[] }>(`/content/hadits/collections?lang=${locale}`);
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

      {/* Each collection as a bound book on the shelf — same jewel-tone cover
          treatment as the Kitab library (Bukhari, Muslim, … now have a spine
          and a gold-foil Arabic title instead of a plain card). */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 desktop:grid-cols-4">
        {collections.length === 0 && (
          <p className="col-span-full text-center text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>
        )}
        {collections.map((c) => {
          const cv = coverFor(c.slug);
          return (
            <Link
              key={c.slug}
              href={`/${locale}/hadits/${c.slug}`}
              aria-label={c.name || c.name_id}
              style={{ background: cv.cover }}
              className="group relative flex min-h-[196px] flex-col justify-between overflow-hidden rounded-l-sm rounded-r-lg p-4 pl-6 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/20 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.6)]"
            >
              {/* binding spine + gold hairline + faint foil frame */}
              <span aria-hidden style={{ background: cv.spine }} className="absolute inset-y-0 left-0 w-3" />
              <span aria-hidden style={{ background: cv.foil }} className="absolute inset-y-0 left-3 w-px opacity-40" />
              <span
                aria-hidden
                style={{ borderColor: cv.foil }}
                className="pointer-events-none absolute inset-2 left-5 rounded-sm border opacity-15"
              />

              <div className="relative">
                <span className="text-2xl drop-shadow">📖</span>
                <p dir="rtl" style={{ color: cv.foil }} className="font-arabic mt-2 line-clamp-2 text-lg leading-snug">
                  {c.name_ar}
                </p>
                <p style={{ color: cv.ink }} className="mt-1 font-heading text-sm leading-snug">
                  {c.name || c.name_id}
                </p>
                {c.author && (
                  <p style={{ color: cv.ink }} className="mt-0.5 line-clamp-1 text-[11px] opacity-70">
                    {c.author}
                  </p>
                )}
              </div>

              <div className="relative mt-3 flex items-center justify-between gap-2">
                <span style={{ color: cv.foil }} className="text-xs font-medium tabular-nums opacity-90">
                  {c.total.toLocaleString(locale)} {t.hadithCount}
                </span>
                <span
                  style={{ color: cv.ink, borderColor: cv.foil }}
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] opacity-80 transition group-hover:opacity-100"
                >
                  <span aria-hidden>🔊</span>
                  {t.read}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
