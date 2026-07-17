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

interface PersonRow {
  slug: string;
  name_id: string;
  name_ar: string;
  title_id: string | null;
  full_story_slug: string | null;
}

// Categories with a full "click a name" person index (migration 0025) —
// every Nabi/Sahabat/Ulama's name is browsable even before a full
// multi-episode series exists for them, unlike the episode-only sections
// below which only ever showed names that already had published episodes.
const PERSON_INDEX_CATEGORIES = new Set([
  "kisah-para-nabi",
  "kisah-sahabat",
  "kisah-tabiin",
  "kisah-tabiin-tabiin",
  "kisah-ulama-dunia",
]);

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

  const storyLang = locale; // the API localizes non-authored languages server-side

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
        const [storiesRes, personsRes] = await Promise.all([
          api.get<{ stories: StoryRow[] }>(`/content/stories?category=${cat.slug}&lang=${storyLang}`),
          PERSON_INDEX_CATEGORIES.has(cat.slug)
            ? api.get<{ persons: PersonRow[] }>(`/content/kisah-tokoh?category=${cat.slug}&lang=${locale}`).catch(() => ({ persons: [] }))
            : Promise.resolve({ persons: [] as PersonRow[] }),
        ]);
        return { cat, stories: storiesRes.stories, persons: personsRes.persons };
      } catch {
        return { cat, stories: [] as StoryRow[], persons: [] as PersonRow[] };
      }
    })
  );

  const hasAnyContent = sections.some((s) => s.stories.length > 0 || s.persons.length > 0);
  let adPlaced = false;

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{dict.explore.kisah.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.explore.kisah.desc}</p>

      {!hasAnyContent && <p className="mt-8 text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>}

      <div className="mt-8 space-y-12">
        {sections.map(({ cat, stories, persons }) => {
          const hasContent = stories.length > 0 || persons.length > 0;
          if (!hasContent && !hasAnyContent) return null;
          const showAd = !adPlaced && hasContent;
          if (showAd) adPlaced = true;
          return (
            <section key={cat.id}>
              <h2 className="font-heading text-xl text-primary dark:text-accent">{cat.name}</h2>

              {/* Person index — every name is clickable, whether it already has
                  a full multi-episode series or just its own profile page. */}
              {persons.length > 0 && (
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {persons.map((p) => (
                    <Link
                      key={p.slug}
                      href={p.full_story_slug ? `/${locale}/kisah/${p.full_story_slug}` : `/${locale}/kisah/tokoh/${p.slug}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3.5 hover:border-accent"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-heading text-base">{p.name_id}</span>
                        {p.title_id && <span className="block truncate text-xs text-[var(--color-text-secondary)]">{p.title_id}</span>}
                      </span>
                      <span dir="rtl" className="shrink-0 font-arabic text-sm text-accent/80">
                        {p.name_ar}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {stories.length === 0 && persons.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>
              ) : stories.length > 0 ? (
                <div className={`space-y-3 ${persons.length > 0 ? "mt-6" : "mt-4"}`}>
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
              ) : null}
              {showAd && (
                <div className="mt-4">
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
