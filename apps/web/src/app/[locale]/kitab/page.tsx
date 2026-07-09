import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kitabLabels } from "@/lib/kitab-labels";
import { PageHero } from "@/components/PageHero";

interface CategoryRow {
  slug: string;
  name_ar: string;
  name_id: string;
  icon: string | null;
  book_count: number;
}

export default async function KitabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kitabLabels(locale);

  let categories: CategoryRow[] = [];
  try {
    const res = await api.get<{ categories: CategoryRow[] }>("/content/kitab/categories");
    categories = res.categories;
  } catch {
    categories = [];
  }

  const total = categories.reduce((n, c) => n + c.book_count, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <PageHero
        icon="📚"
        title={t.title}
        subtitle={total > 0 ? `${t.subtitle} · ${total.toLocaleString(locale)} ${t.works}` : t.subtitle}
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 desktop:grid-cols-3">
        {categories.length === 0 && (
          <p className="col-span-full text-center text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>
        )}
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/${locale}/kitab/${c.slug}`}
            className="card-premium flex items-center gap-4 p-5"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-xl">
              {c.icon ?? "📗"}
            </span>
            <div className="min-w-0">
              <p className="font-heading text-base leading-snug">{c.name_id}</p>
              <p dir="rtl" className="font-arabic mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
                {c.name_ar}
              </p>
              <p className="mt-1.5 text-xs font-medium text-accent">
                {c.book_count.toLocaleString(locale)} {t.works}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-[var(--color-text-secondary)]">{t.note}</p>
    </div>
  );
}
