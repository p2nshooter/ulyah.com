import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { localePath } from "@/lib/paths";
import { ContinuousStoryReader, type StorySection } from "@/components/ContinuousStoryReader";

interface Person {
  slug: string;
  category_slug: string;
  name_id: string;
  name_ar: string;
  title_id: string | null;
  summary_id: string;
  full_story_slug: string | null;
}

const CATEGORY_LABEL: Record<string, Record<string, string>> = {
  "kisah-para-nabi": { id: "Kisah Para Nabi", en: "Stories of the Prophets", fr: "Récits des Prophètes", de: "Geschichten der Propheten", es: "Relatos de los Profetas", ar: "قصص الأنبياء" },
  "kisah-sahabat": { id: "Kisah Sahabat", en: "Stories of the Companions", fr: "Récits des Compagnons", de: "Geschichten der Gefährten", es: "Relatos de los Compañeros", ar: "قصص الصحابة" },
  "kisah-ulama-dunia": { id: "Kisah Ulama", en: "Stories of the Scholars", fr: "Récits des Savants", de: "Geschichten der Gelehrten", es: "Relatos de los Sabios", ar: "قصص العلماء" },
};
function categoryLabel(slug: string, locale: string): string {
  const m = CATEGORY_LABEL[slug] ?? CATEGORY_LABEL["kisah-para-nabi"]!;
  return m[locale] ?? m.en!;
}

async function fetchPerson(slug: string, locale: string): Promise<{ person: Person; sections: StorySection[] } | null> {
  try {
    const r = await api.get<{ person: Person; sections?: StorySection[] }>(`/content/kisah-tokoh/${slug}?lang=${locale}`);
    return { person: r.person, sections: r.sections ?? [] };
  } catch {
    return null;
  }
}

/** Slug of the next person in the same category (curriculum order), so the
 * continuous reader can roll on through the whole menu until stopped. */
async function nextPersonSlug(category: string, currentSlug: string): Promise<string | null> {
  try {
    const r = await api.get<{ persons: { slug: string }[] }>(`/content/kisah-tokoh?category=${category}`);
    const slugs = r.persons.map((p) => p.slug);
    const i = slugs.indexOf(currentSlug);
    if (i < 0) return null;
    return slugs[(i + 1) % slugs.length] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const data = await fetchPerson(slug, locale);
  if (!data) return { title: "Kisah" };
  return {
    title: `${data.person.name_id} — ${categoryLabel(data.person.category_slug, locale)}`,
    description: data.person.summary_id.slice(0, 160),
    alternates: { canonical: localePath(locale, `/kisah/tokoh/${slug}`) },
  };
}

export default async function KisahTokohPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ autoread?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const { autoread } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const data = await fetchPerson(slug, locale);
  if (!data) notFound();
  const { person, sections } = data;

  const nextSlug = await nextPersonSlug(person.category_slug, slug);
  const nextHref = nextSlug ? `${localePath(locale, `/kisah/tokoh/${nextSlug}`)}?autoread=1` : undefined;

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">
        {categoryLabel(person.category_slug, locale)}
      </p>
      <h1 className="mt-1 font-heading text-3xl">{person.name_id}</h1>
      <p dir="rtl" className="mt-1 font-arabic text-2xl text-[var(--color-text-secondary)]">
        {person.name_ar}
      </p>
      {person.title_id && <p className="mt-2 text-sm text-accent">{person.title_id}</p>}

      {/* Continuous read-all: reads the summary + every section, highlights &
          scrolls, then auto-advances to the next figure in this category and
          keeps going through the whole menu until stopped. */}
      <ContinuousStoryReader
        locale={locale}
        summary={person.summary_id}
        sections={sections}
        nextHref={nextHref}
        autoStart={autoread === "1"}
      />
    </article>
  );
}
