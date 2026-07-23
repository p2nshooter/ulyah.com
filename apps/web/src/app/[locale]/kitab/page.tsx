import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kitabLabels } from "@/lib/kitab-labels";
import { coverFor } from "@/lib/book-cover";
import { PageHero } from "@/components/PageHero";

interface CategoryRow {
  slug: string;
  name_ar: string;
  name_id: string;
  name: string;
  icon: string | null;
  book_count: number;
}

export default async function KitabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kitabLabels(locale);

  let categories: CategoryRow[] = [];
  try {
    const res = await api.get<{ categories: CategoryRow[] }>(`/content/kitab/categories?lang=${locale}`);
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

      {/* Bridge to the readable pesantren library — the Shamela catalogue below
          is breadth (metadata for ~5k works); this is depth (full readable
          matn, bab by bab, with terjemah + penjelasan). */}
      <Link
        href={`/${locale}/kitab-pesantren`}
        className="mt-8 flex items-center gap-4 rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/10 to-transparent p-5 transition hover:border-accent"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-2xl">🏫</span>
        <div className="min-w-0">
          <p className="font-heading text-base">{t.bridgeTitle}</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{t.bridgeDesc}</p>
        </div>
        <span className="ml-auto shrink-0 text-accent">→</span>
      </Link>

      {/* Digital-library shelf — every category is a bound kitab: a jewel-tone
          cover with a gold-foiled Arabic title, a spine down the binding edge,
          and a "listen" cue because every summary here is narratable (owner:
          "kaya cover kitab atau model voice speaker, temanya dibacakan"). */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 desktop:grid-cols-4">
        {categories.length === 0 && (
          <p className="col-span-full text-center text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>
        )}
        {categories.map((c) => {
          const cv = coverFor(c.slug);
          return (
            <Link
              key={c.slug}
              href={`/${locale}/kitab/${c.slug}`}
              aria-label={c.name}
              style={{ background: cv.cover }}
              className="group relative flex min-h-[196px] flex-col justify-between overflow-hidden rounded-r-lg rounded-l-sm p-4 pl-6 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/20 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.6)]"
            >
              {/* binding spine + gold hairline */}
              <span aria-hidden style={{ background: cv.spine }} className="absolute inset-y-0 left-0 w-3" />
              <span aria-hidden style={{ background: cv.foil }} className="absolute inset-y-0 left-3 w-px opacity-40" />
              {/* faint foil frame */}
              <span
                aria-hidden
                style={{ borderColor: cv.foil }}
                className="pointer-events-none absolute inset-2 left-5 rounded-sm border opacity-15"
              />

              <div className="relative">
                <span className="text-2xl drop-shadow">{c.icon ?? "📖"}</span>
                <p dir="rtl" style={{ color: cv.foil }} className="font-arabic mt-2 line-clamp-2 text-lg leading-snug">
                  {c.name_ar}
                </p>
                <p style={{ color: cv.ink }} className="mt-1 font-heading text-sm leading-snug">
                  {c.name}
                </p>
              </div>

              <div className="relative mt-3 flex items-center justify-between gap-2">
                <span style={{ color: cv.foil }} className="text-xs font-medium tabular-nums opacity-90">
                  {c.book_count.toLocaleString(locale)} {t.works}
                </span>
                <span
                  style={{ color: cv.ink, borderColor: cv.foil }}
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] opacity-80 transition group-hover:opacity-100"
                >
                  <span aria-hidden>🔊</span>
                  {t.listen}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-[var(--color-text-secondary)]">{t.note}</p>
    </div>
  );
}
