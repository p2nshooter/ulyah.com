import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { NarrateButton } from "@/components/NarrateButton";
import { narrateLabels } from "@/lib/narrate-labels";
import { localePath } from "@/lib/paths";

interface Person {
  slug: string;
  category_slug: string;
  name_id: string;
  name_ar: string;
  title_id: string | null;
  summary_id: string;
  full_story_slug: string | null;
}

interface StorySection {
  section_order: number;
  heading_id: string;
  body_id: string;
  quran_refs: string | null;
}

async function fetchPerson(slug: string, locale: string): Promise<{ person: Person; sections: StorySection[] } | null> {
  try {
    const r = await api.get<{ person: Person; sections?: StorySection[] }>(`/content/kisah-tokoh/${slug}?lang=${locale}`);
    return { person: r.person, sections: r.sections ?? [] };
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
    title: `${data.person.name_id} — Kisah Islami`,
    description: data.person.summary_id.slice(0, 160),
    alternates: { canonical: localePath(locale, `/kisah/tokoh/${slug}`) },
  };
}

export default async function KisahTokohPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const data = await fetchPerson(slug, locale);
  if (!data) notFound();
  const { person, sections } = data;
  const narrateParagraphs = [
    person.summary_id,
    ...sections.flatMap((s) => [s.heading_id, ...s.body_id.split(/\n\s*\n/)]),
  ];

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">
        {person.category_slug === "kisah-para-nabi"
          ? "Kisah Para Nabi"
          : person.category_slug === "kisah-sahabat"
            ? "Kisah Sahabat"
            : "Kisah Ulama"}
      </p>
      <h1 className="mt-1 font-heading text-3xl">{person.name_id}</h1>
      <p dir="rtl" className="mt-1 font-arabic text-2xl text-[var(--color-text-secondary)]">
        {person.name_ar}
      </p>
      {person.title_id && <p className="mt-2 text-sm text-accent">{person.title_id}</p>}

      <div className="mt-6">
        <NarrateButton
          paragraphs={narrateParagraphs}
          listenLabel={narrateLabels(locale).listen}
          stopLabel={narrateLabels(locale).stop}
          lang={locale}
        />
      </div>

      <div className="mt-6">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-primary)]">
          {person.summary_id}
        </p>
      </div>

      {sections.length > 0 && (
        <div className="reveal-stagger mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.section_order}>
              <h2 className="flex items-baseline gap-2.5 font-heading text-xl">
                <span className="grid h-7 w-7 shrink-0 translate-y-0.5 place-items-center rounded-full bg-accent/12 text-xs font-semibold text-accent">
                  {s.section_order}
                </span>
                {s.heading_id}
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                {s.body_id}
              </p>
              {s.quran_refs && (
                <p className="mt-2.5 rounded-lg border border-accent/25 bg-accent/5 px-3 py-1.5 text-xs leading-relaxed text-accent">
                  📖 {s.quran_refs}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </article>
  );
}
