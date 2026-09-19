import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { routePath } from "@/lib/paths";
import { PageHero } from "@/components/PageHero";
import { fillLabels } from "@/lib/fill-labels";

/**
 * The index of figures — every prophet, companion, tabi'in and scholar whose
 * story the library carries.
 *
 * WHY IT EXISTS. `/kisah/tokoh` was already a declared route: it is in
 * ROUTE_SLUGS, so every site emitted an hreflang for it (dawa.es
 * /historias/figuras, tilawa.de /geschichten/personen) and the sitemap listed
 * it — while nothing rendered it. Next matched the url against
 * /kisah/[slug] with slug="tokoh", found no such story, and answered the
 * framework's bare "404: This page could not be found" WITH HTTP 200.
 *
 * A 200 that says 404 is a soft-404: the worst of both. Search engines index
 * it, see an error page under a url we advertise in five languages, and mark
 * the site down for it — which is exactly the kind of thing that costs a site
 * its ad approval. And a reader who clicked a figure's breadcrumb got a bare
 * framework error with none of the site's own chrome.
 *
 * So the route now renders what it always promised: the names, grouped by
 * category, each linking to that figure's story.
 */
export const revalidate = 3600;

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

// The same categories the story index builds a person list for, in the same
// order — this page is that list, on its own url.
const CATEGORIES = [
  "kisah-para-nabi",
  "kisah-sahabat",
  "kisah-tabiin",
  "kisah-tabiin-tabiin",
  "kisah-ulama-dunia",
  "kisah-wali-songo",
  "kisah-ulama-nusantara",
];

const ICON: Record<string, string> = {
  "kisah-para-nabi": "🕌",
  "kisah-sahabat": "🤝",
  "kisah-tabiin": "📿",
  "kisah-tabiin-tabiin": "📿",
  "kisah-ulama-dunia": "🌍",
  "kisah-wali-songo": "🕌",
  "kisah-ulama-nusantara": "🌴",
};

interface Labels {
  title: string;
  subtitle: string;
  metaDesc: string;
  empty: string;
  back: string;
}

const EN: Labels = {
  title: "Figures",
  subtitle: "Prophets, companions, tabi'in and scholars — every name the library tells the story of.",
  metaDesc:
    "An index of the prophets, companions, tabi'in and scholars whose lives are told in the story library — browse by name.",
  empty: "The index of figures is still being prepared.",
  back: "All stories",
};

const L: Record<string, Labels> = {
  en: EN,
  id: {
    title: "Tokoh",
    subtitle: "Para nabi, sahabat, tabi'in dan ulama — setiap nama yang kisahnya ada di pustaka ini.",
    metaDesc:
      "Indeks para nabi, sahabat, tabi'in dan ulama yang kisahnya dikisahkan di pustaka — telusuri berdasarkan nama.",
    empty: "Indeks tokoh masih disiapkan.",
    back: "Semua kisah",
  },
  es: {
    title: "Figuras",
    subtitle: "Profetas, compañeros, tabi'ín y sabios — cada nombre cuya historia cuenta esta biblioteca.",
    metaDesc:
      "Índice de los profetas, compañeros, tabi'ín y sabios cuyas vidas se narran en la biblioteca de historias — explora por nombre.",
    empty: "El índice de figuras aún se está preparando.",
    back: "Todas las historias",
  },
  fr: {
    title: "Figures",
    subtitle: "Prophètes, compagnons, tabi'in et savants — chaque nom dont la bibliothèque raconte l'histoire.",
    metaDesc:
      "Index des prophètes, compagnons, tabi'in et savants dont la vie est racontée dans la bibliothèque — parcourez par nom.",
    empty: "L'index des figures est en cours de préparation.",
    back: "Toutes les histoires",
  },
  de: {
    title: "Persönlichkeiten",
    subtitle: "Propheten, Gefährten, Tabi'un und Gelehrte — jeder Name, dessen Geschichte diese Bibliothek erzählt.",
    metaDesc:
      "Index der Propheten, Gefährten, Tabi'un und Gelehrten, deren Leben in der Bibliothek erzählt wird — nach Namen durchsuchen.",
    empty: "Der Index der Persönlichkeiten wird noch vorbereitet.",
    back: "Alle Geschichten",
  },
};

const labels = (locale: string): Labels => L[locale] ?? fillLabels(locale, EN);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);
  return {
    title: t.title,
    description: t.metaDesc,
    alternates: { canonical: routePath(locale, "/kisah/tokoh") },
  };
}

export default async function TokohIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);

  let categories: CategoryRow[] = [];
  try {
    const res = await api.getCached<{ categories: CategoryRow[] }>(`/content/categories?lang=${locale}`, 3600);
    categories = res.categories;
  } catch {
    categories = [];
  }

  const ordered = CATEGORIES.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is CategoryRow => Boolean(c)
  );

  // One request per category, each independently recoverable: a category whose
  // list fails renders empty rather than taking the page down with it.
  const sections = await Promise.all(
    ordered.map(async (cat) => ({
      cat,
      persons: await api
        .getCached<{ persons: PersonRow[] }>(`/content/kisah-tokoh?category=${cat.slug}&lang=${locale}`, 3600)
        .then((r) => r.persons)
        .catch(() => [] as PersonRow[]),
    }))
  );

  const total = sections.reduce((n, s) => n + s.persons.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <PageHero icon="👥" title={t.title} subtitle={t.subtitle} />

      <Link href={routePath(locale, "/kisah")} className="mt-6 inline-block text-sm text-accent hover:underline">
        ← {t.back}
      </Link>

      {total === 0 && <p className="mt-8 text-sm text-text-secondary">{t.empty}</p>}

      {sections
        .filter((s) => s.persons.length > 0)
        .map(({ cat, persons }) => (
          <section key={cat.slug} className="mt-10">
            <h2 className="font-heading text-xl">
              <span className="mr-2" aria-hidden>
                {ICON[cat.slug] ?? "📖"}
              </span>
              {cat.name}
              <span className="ml-2 text-xs font-normal text-text-secondary">{persons.length}</span>
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 desktop:grid-cols-3">
              {persons.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={
                      p.full_story_slug
                        ? routePath(locale, `/kisah/${p.full_story_slug}`)
                        : routePath(locale, `/kisah/tokoh/${p.slug}`)
                    }
                    className="flex items-baseline justify-between gap-2 rounded-lg border border-(--color-border) px-3 py-2 text-sm transition hover:border-accent"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{p.name_id}</span>
                      {p.title_id && (
                        <span className="block truncate text-[11px] text-text-secondary">{p.title_id}</span>
                      )}
                    </span>
                    <span dir="rtl" className="shrink-0 font-arabic text-sm text-text-secondary">
                      {p.name_ar}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}
