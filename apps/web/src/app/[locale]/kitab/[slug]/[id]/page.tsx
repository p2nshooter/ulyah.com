import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kitabLabels } from "@/lib/kitab-labels";
import { KitabDescriptionReader } from "@/components/KitabDescriptionReader";

interface BookDetail {
  id: number;
  title_ar: string;
  title_translated: string | null;
  author: string | null;
  author_death_year: string | null;
  description_ar: string | null;
  description_translated: string | null;
  description_lang: string | null;
  source: string | null;
  topics: string[];
  topics_translated: (string | null)[] | null;
  category_slug: string;
  category_name: string | null;
  category_name_ar: string | null;
  category_icon: string | null;
}

export default async function KitabBookPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; id: string }>;
}) {
  const { locale: raw, slug, id } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kitabLabels(locale);

  let book: BookDetail | null = null;
  let nextBook: { id: number; title_ar: string } | null = null;
  try {
    const res = await api.get<{ book: BookDetail; next_book: { id: number; title_ar: string } | null }>(
      `/content/kitab/book/${id}?lang=${locale}`
    );
    book = res.book;
    nextBook = res.next_book;
  } catch {
    book = null;
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>
        <Link href={`/${locale}/kitab`} className="mt-4 inline-block text-sm text-accent hover:underline">
          ← {t.backToCategories}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link href={`/${locale}/kitab/${slug}`} className="text-sm text-accent hover:underline">
        ← {t.backToCategory}
      </Link>

      <div className="card-premium-static mt-5 p-6 sm:p-8">
        <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
          <span>{book.category_icon ?? "📗"}</span>
          {book.category_name}
        </p>
        {book.title_translated ? (
          <>
            <h1 className="mt-3 font-heading text-2xl leading-relaxed text-[var(--color-text-primary)] sm:text-3xl">
              {book.title_translated}
            </h1>
            <p dir="rtl" className="font-arabic mt-1 text-lg text-[var(--color-text-secondary)]">
              {book.title_ar}
            </p>
          </>
        ) : (
          <h1 dir="rtl" className="font-arabic mt-3 text-2xl leading-relaxed text-[var(--color-text-primary)] sm:text-3xl">
            {book.title_ar}
          </h1>
        )}
        {book.author && (
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            {t.author}: <span className="font-medium text-[var(--color-text-primary)]">{book.author}</span>
            {book.author_death_year ? ` (${t.died} ${book.author_death_year})` : ""}
          </p>
        )}

        {book.description_ar && (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t.about}</p>
              <KitabDescriptionReader
                text={book.description_translated ?? book.description_ar}
                listenLabel={t.listen}
                stopLabel={t.stop}
                lang={book.description_translated ? locale : "ar"}
                nextHref={nextBook ? `/${locale}/kitab/${slug}/${nextBook.id}` : null}
              />
            </div>
            {!book.description_translated && t.arabicOnlyNote && (
              <p className="mt-2 text-xs italic text-[var(--color-text-secondary)]">{t.arabicOnlyNote}</p>
            )}
            <p dir="rtl" className="font-arabic mt-3 text-lg leading-loose text-[var(--color-text-primary)]">
              {book.description_ar}
            </p>
            {book.description_translated && (
              <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-subtle,transparent)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">{t.translationLabel}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                  {book.description_translated}
                </p>
              </div>
            )}
          </div>
        )}

        {book.topics.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold">{t.topics}</p>
            <ul className="mt-3 space-y-1.5 text-[var(--color-text-secondary)]">
              {book.topics.map((topic, i) => {
                const translated = book.topics_translated?.[i];
                return (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {translated ? (
                      <span>{translated}</span>
                    ) : (
                      <span dir="rtl" className="font-arabic">{topic}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {book.source && (
          <p className="mt-6 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-secondary)]">
            {t.source}: {book.source}
          </p>
        )}
      </div>

      {nextBook && (
        <Link
          href={`/${locale}/kitab/${slug}/${nextBook.id}`}
          className="mt-6 block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-accent"
        >
          <p className="text-xs text-[var(--color-text-secondary)]">{t.next} →</p>
          <p dir="rtl" className="font-arabic mt-1 text-lg">{nextBook.title_ar}</p>
        </Link>
      )}
    </div>
  );
}
