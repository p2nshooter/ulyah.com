import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";

interface StoryRow {
  id: number;
  title: string;
  slug: string;
  episode_number: number | null;
  category_name: string | null;
}

interface CategoryRow {
  id: number;
  name: string;
  slug: string;
}

// Fixed reading order for the library's taxonomy — the 25 prophets first,
// then the generations after them, then scholars, then everything else that
// doesn't fit a tier above. Kept as an explicit list (rather than whatever
// order the DB happens to return) so newly-added tiers with zero stories yet
// still show up in the right place instead of not appearing at all.
const CATEGORY_ORDER = [
  "kisah-para-nabi",
  "kisah-sahabat",
  "kisah-tabiin",
  "kisah-tabiin-tabiin",
  "kisah-ulama-dunia",
  "kisah-islami",
];

export default async function KisahListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const storyLang = locale === "id" ? "id" : "en"; // series currently authored in id/en; see docs/CONTENT-POLICY.md

  let categories: CategoryRow[] = [];
  try {
    const res = await api.get<{ categories: CategoryRow[] }>("/content/categories");
    categories = res.categories;
  } catch {
    categories = [];
  }

  const orderedCategories = CATEGORY_ORDER.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is CategoryRow => Boolean(c)
  );

  const sections = await Promise.all(
    orderedCategories.map(async (cat) => {
      try {
        const res = await api.get<{ stories: StoryRow[] }>(
          `/content/stories?category=${cat.slug}&lang=${storyLang}`
        );
        return { cat, stories: res.stories };
      } catch {
        return { cat, stories: [] as StoryRow[] };
      }
    })
  );

  const hasAnyStory = sections.some((s) => s.stories.length > 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{dict.explore.kisah.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.explore.kisah.desc}</p>

      {!hasAnyStory && <p className="mt-8 text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>}

      <div className="mt-8 space-y-12">
        {sections.map(({ cat, stories }) => {
          if (stories.length === 0 && !hasAnyStory) return null;
          return (
            <section key={cat.id}>
              <h2 className="font-heading text-xl text-primary dark:text-accent">{cat.name}</h2>
              {stories.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {stories.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${locale}/kisah/${s.slug}`}
                      className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-accent"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-accent">
                        {s.episode_number ? `Episode ${s.episode_number}` : cat.name}
                      </p>
                      <p className="mt-1 font-heading text-lg">{s.title}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
