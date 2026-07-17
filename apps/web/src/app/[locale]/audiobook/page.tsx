import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.explore.audiobook.title} — ULYAH.COM`,
    description: dict.explore.audiobook.desc,
    alternates: { canonical: `/${locale}/audiobook` },
  };
}

interface StoryRow {
  id: number;
  title: string;
  slug: string;
  episode_number: number | null;
  category_name: string | null;
  category_slug?: string | null;
  audio_r2_key: string | null;
  series_key: string | null;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
}

const CATEGORY_ICON: Record<string, string> = {
  "kisah-para-nabi": "🕌",
  "kisah-sahabat": "🌙",
  "kisah-tabiin": "🌿",
  "kisah-tabiin-tabiin": "🌱",
  "kisah-ulama-dunia": "🌍",
  "kisah-islami": "✨",
  "hikmah-harian": "💡",
  "tafsir-tematik": "📖",
  "fiqih-pernikahan": "💍",
  "fiqih-warisan": "⚖️",
  "pondasi-iman": "🕋",
  tadabbur: "📿",
  "hadits-pilihan": "🕌",
};

export default async function AudiobookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: raw } = await params;
  const { category } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const storyLang = locale; // the API localizes non-authored languages server-side

  let stories: StoryRow[] = [];
  let categories: CategoryRow[] = [];
  try {
    const [storiesRes, catRes] = await Promise.all([
      api.get<{ stories: StoryRow[] }>(
        `/content/stories?lang=${storyLang}${category ? `&category=${category}` : ""}`
      ),
      api.get<{ categories: CategoryRow[] }>(`/content/categories?lang=${storyLang}&countedOnly=1`),
    ]);
    stories = storiesRes.stories;
    categories = catRes.categories;
  } catch {
    stories = [];
    categories = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <PageHero icon="🎧" title={dict.explore.audiobook.title} subtitle={dict.explore.audiobook.desc} />

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link
            href={`/${locale}/audiobook`}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              !category ? "border-accent bg-accent text-primary" : "border-[var(--color-border)] hover:border-accent"
            }`}
          >
            ✦ {dict.common.all}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/audiobook?category=${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                category === c.slug ? "border-accent bg-accent text-primary" : "border-[var(--color-border)] hover:border-accent"
              }`}
            >
              {CATEGORY_ICON[c.slug] ?? "📚"} {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {stories.length === 0 && (
          <p className="col-span-2 text-center text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>
        )}
        {stories.map((s, i) => (
          <div key={s.id} className={i === 3 && stories.length > 4 ? "sm:col-span-2" : ""}>
            <Link
              href={`/${locale}/kisah/${s.slug}`}
              className="card-premium relative flex items-center justify-between gap-3 overflow-hidden p-4"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  {s.episode_number ? `Episode ${s.episode_number}` : s.category_name ?? dict.explore.audiobook.title}
                </p>
                <p className="mt-1 truncate font-heading text-lg">{s.title}</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  {s.audio_r2_key ? `🎧 ${dict.reader.downloadAudiobook}` : `⏳ ${dict.reader.audioProcessing}`}
                </p>
              </div>
              <span className="shrink-0 grid h-11 w-11 place-items-center rounded-full bg-accent/10 text-xl text-accent">
                ▶
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
