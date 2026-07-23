import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { coverFor } from "@/lib/book-cover";
import { AdSlot } from "@/components/AdSlot";

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
// then the generations after them, then scholars, then the Nusantara shelves
// (Wali Songo, Ulama Nusantara), then everything else. Kept as an explicit list
// (rather than whatever order the DB happens to return) so newly-added tiers
// with zero stories yet still show up in the right place instead of not
// appearing at all — this is the clear taxonomy that keeps additions from
// blurring or duplicating across shelves.
const CATEGORY_ORDER = [
  "kisah-para-nabi",
  "kisah-sahabat",
  "kisah-tabiin",
  "kisah-tabiin-tabiin",
  "kisah-ulama-dunia",
  "kisah-wali-songo",
  "kisah-ulama-nusantara",
  "kisah-islami",
];

// "Listen" cue per site language — every cover carries it because the whole
// library is meant to be read aloud (owner: "temanya dibacakan").
const LISTEN: Record<string, string> = {
  id: "Dengarkan",
  en: "Listen",
  fr: "Écouter",
  de: "Anhören",
  es: "Escuchar",
  ar: "استمع",
};

// A per-shelf emblem so each category's covers feel like a distinct collection
// on the shelf (mosque = prophets/Nusantara, companions, scholars…).
const SHELF_ICON: Record<string, string> = {
  "kisah-para-nabi": "🕌",
  "kisah-sahabat": "🤝",
  "kisah-tabiin": "📿",
  "kisah-tabiin-tabiin": "📿",
  "kisah-ulama-dunia": "🌍",
  "kisah-wali-songo": "🕌",
  "kisah-ulama-nusantara": "🌴",
  "kisah-islami": "📖",
};

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

  const episodeLabel = ({ id: "Episode", en: "Episode", fr: "Épisode", de: "Folge", es: "Episodio", ar: "الحلقة" } as Record<string, string>)[locale] ?? "Episode";
  const listen = LISTEN[locale] ?? LISTEN.en;

  // The first readable figure — "Baca Semua" reads this list's titles then
  // dives into this figure's full story and chains through the rest of the menu.
  const firstSection = sections.find((s) => s.persons.length > 0);
  const firstReadHref = firstSection ? `/${locale}/kisah/tokoh/${firstSection.persons[0]!.slug}?autoread=1` : null;

  // The gold "listen" chip that sits on the bottom edge of every cover.
  const listenChip = (foil: string, ink: string) => (
    <span
      style={{ color: ink, borderColor: foil }}
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] opacity-80 transition group-hover:opacity-100"
    >
      <span aria-hidden>🔊</span>
      {listen}
    </span>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      {firstReadHref && (
        <a data-read-next href={firstReadHref} className="hidden" aria-hidden>
          next
        </a>
      )}
      <h1 className="font-heading text-3xl">{dict.explore.kisah.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.explore.kisah.desc}</p>

      {!hasAnyContent && <p className="mt-8 text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>}

      <div className="mt-10 space-y-14">
        {sections.map(({ cat, stories, persons }) => {
          const hasContent = stories.length > 0 || persons.length > 0;
          if (!hasContent && !hasAnyContent) return null;
          const showAd = !adPlaced && hasContent;
          if (showAd) adPlaced = true;
          const shelfIcon = SHELF_ICON[cat.slug] ?? "📖";
          return (
            <section key={cat.id}>
              <h2 className="flex items-center gap-2 font-heading text-xl text-primary dark:text-accent">
                <span aria-hidden>{shelfIcon}</span>
                {cat.name}
              </h2>

              {/* Person index — every name is a bound volume on the shelf,
                  whether it already has a full multi-episode series or just its
                  own profile page. */}
              {persons.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 desktop:grid-cols-4">
                  {persons.map((p) => {
                    const cv = coverFor(p.slug);
                    return (
                      <Link
                        key={p.slug}
                        href={p.full_story_slug ? `/${locale}/kisah/${p.full_story_slug}` : `/${locale}/kisah/tokoh/${p.slug}`}
                        aria-label={p.name_id}
                        style={{ background: cv.cover }}
                        className="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-r-lg rounded-l-sm p-4 pl-6 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/20 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.6)]"
                      >
                        <span aria-hidden style={{ background: cv.spine }} className="absolute inset-y-0 left-0 w-3" />
                        <span aria-hidden style={{ background: cv.foil }} className="absolute inset-y-0 left-3 w-px opacity-40" />
                        <span aria-hidden style={{ borderColor: cv.foil }} className="pointer-events-none absolute inset-2 left-5 rounded-sm border opacity-15" />

                        <div className="relative">
                          <span className="text-2xl drop-shadow">{shelfIcon}</span>
                          <p dir="rtl" style={{ color: cv.foil }} className="font-arabic mt-2 line-clamp-2 text-lg leading-snug">
                            {p.name_ar}
                          </p>
                          <p style={{ color: cv.ink }} className="mt-1 font-heading text-sm leading-snug line-clamp-2">
                            {p.name_id}
                          </p>
                          {p.title_id && (
                            <p style={{ color: cv.ink }} className="mt-0.5 text-[11px] leading-snug opacity-70 line-clamp-1">
                              {p.title_id}
                            </p>
                          )}
                        </div>

                        <div className="relative mt-3 flex items-center justify-end">{listenChip(cv.foil, cv.ink)}</div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {stories.length === 0 && persons.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>
              ) : stories.length > 0 ? (
                <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 desktop:grid-cols-4 ${persons.length > 0 ? "mt-6" : "mt-4"}`}>
                  {stories.map((s) => {
                    const cv = coverFor(s.slug);
                    return (
                      <Link
                        key={s.id}
                        href={`/${locale}/kisah/${s.slug}`}
                        aria-label={s.title}
                        style={{ background: cv.cover }}
                        className="group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-r-lg rounded-l-sm p-4 pl-6 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/20 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.6)]"
                      >
                        <span aria-hidden style={{ background: cv.spine }} className="absolute inset-y-0 left-0 w-3" />
                        <span aria-hidden style={{ background: cv.foil }} className="absolute inset-y-0 left-3 w-px opacity-40" />
                        <span aria-hidden style={{ borderColor: cv.foil }} className="pointer-events-none absolute inset-2 left-5 rounded-sm border opacity-15" />

                        <div className="relative">
                          <span className="text-2xl drop-shadow">{shelfIcon}</span>
                          <p style={{ color: cv.foil }} className="mt-2 text-[10px] font-semibold uppercase tracking-wide opacity-90">
                            {s.episode_number ? `${episodeLabel} ${s.episode_number}` : cat.name}
                          </p>
                          <p style={{ color: cv.ink }} className="mt-1 font-heading text-sm leading-snug line-clamp-4">
                            {s.title}
                          </p>
                        </div>

                        <div className="relative mt-3 flex items-center justify-end">{listenChip(cv.foil, cv.ink)}</div>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
              {showAd && <AdSlot placement="list" className="mt-6" />}
            </section>
          );
        })}
      </div>
    </div>
  );
}
