import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kitabLabels } from "@/lib/kitab-labels";
import { AdSlot } from "@/components/AdSlot";

interface BookRow {
  id: number;
  title_ar: string;
  author: string | null;
  author_death_year: string | null;
  source: string | null;
  excerpt: string | null;
}

interface CategoryDetail {
  slug: string;
  name_ar: string;
  name_id: string;
  name: string;
  icon: string | null;
}

export default async function KitabCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const { q = "", page: pageRaw } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kitabLabels(locale);
  const page = Math.max(1, Number(pageRaw ?? "1") || 1);

  let category: CategoryDetail | null = null;
  let books: BookRow[] = [];
  let total = 0;
  try {
    const qs = new URLSearchParams({ page: String(page), lang: locale });
    if (q) qs.set("q", q);
    const res = await api.get<{ category: CategoryDetail; books: BookRow[]; total: number }>(
      `/content/kitab/category/${slug}?${qs.toString()}`
    );
    category = res.category;
    books = res.books;
    total = res.total;
  } catch {
    category = null;
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>
        <Link href={`/${locale}/kitab`} className="mt-4 inline-block text-sm text-accent hover:underline">
          ← {t.backToCategories}
        </Link>
      </div>
    );
  }

  const pageSize = 24;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <Link href={`/${locale}/kitab`} className="text-sm text-accent hover:underline">
        ← {t.backToCategories}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-2xl">
          {category.icon ?? "📗"}
        </span>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl">{category.name}</h1>
          <p dir="rtl" className="font-arabic mt-1 text-[var(--color-text-secondary)]">
            {category.name_ar}
          </p>
          <p className="mt-1 text-xs font-medium text-accent">
            {total.toLocaleString(locale)} {t.worksInCategory}
          </p>
        </div>
      </div>

      <form action={`/${locale}/kitab/${slug}`} className="mt-6">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-2.5 text-sm"
        />
      </form>

      <div className="mt-6 grid gap-3">
        {books.length === 0 && <p className="text-center text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>}
        {books.map((b, i) => (
          <div key={b.id}>
            {i === 6 && books.length > 8 && <AdSlot minHeight={100} className="mb-3" />}
            <Link href={`/${locale}/kitab/${slug}/${b.id}`} className="card-premium block p-4">
              <p dir="rtl" className="font-arabic text-lg leading-snug text-[var(--color-text-primary)]">
                {b.title_ar}
              </p>
              {b.author && (
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {t.author}: {b.author}
                  {b.author_death_year ? ` (${t.died} ${b.author_death_year})` : ""}
                </p>
              )}
              {b.excerpt && <p dir="rtl" className="font-arabic mt-2 line-clamp-2 text-sm text-[var(--color-text-secondary)]">{b.excerpt}</p>}
            </Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link href={`/${locale}/kitab/${slug}?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page - 1}`} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 hover:border-accent">
              ← {t.prev}
            </Link>
          )}
          <span className="text-[var(--color-text-secondary)]">
            {t.page} {page}/{totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/${locale}/kitab/${slug}?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${page + 1}`} className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 hover:border-accent">
              {t.next} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
