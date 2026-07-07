import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";

interface StoryRow {
  id: number;
  title: string;
  slug: string;
  episode_number: number | null;
}

export default async function AudiobookPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const storyLang = locale === "id" ? "id" : "en";

  let stories: StoryRow[] = [];
  try {
    const res = await api.get<{ stories: StoryRow[] }>(`/content/stories?lang=${storyLang}`);
    stories = res.stories;
  } catch {
    stories = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{dict.explore.audiobook.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.explore.audiobook.desc}</p>

      <div className="mt-8 space-y-3">
        {stories.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>}
        {stories.map((s) => (
          <Link
            key={s.id}
            href={`/${locale}/kisah/${s.slug}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-accent"
          >
            <div>
              {s.episode_number && (
                <p className="text-xs font-medium uppercase tracking-wide text-accent">Episode {s.episode_number}</p>
              )}
              <p className="mt-1 font-heading text-lg">{s.title}</p>
            </div>
            <span className="text-xl">🎧</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
