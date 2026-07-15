import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { NarrateButton } from "@/components/NarrateButton";

interface Person {
  slug: string;
  category_slug: string;
  name_id: string;
  name_ar: string;
  title_id: string | null;
  summary_id: string;
  full_story_slug: string | null;
}

async function fetchPerson(slug: string): Promise<Person | null> {
  try {
    const r = await api.get<{ person: Person }>(`/content/kisah-tokoh/${slug}`);
    return r.person;
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
  const person = await fetchPerson(slug);
  if (!person) return { title: "Kisah — ULYAH.COM" };
  return {
    title: `${person.name_id} — Kisah Islami · ULYAH.COM`,
    description: person.summary_id.slice(0, 160),
    alternates: { canonical: `/${locale}/kisah/tokoh/${slug}` },
  };
}

export default async function KisahTokohPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const person = await fetchPerson(slug);
  if (!person) notFound();

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
          paragraphs={[person.summary_id]}
          listenLabel={locale === "id" ? "Dengarkan" : "Listen"}
          stopLabel={locale === "id" ? "Hentikan" : "Stop"}
          lang={locale}
        />
      </div>

      <div className="mt-6">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-primary)]">
          {person.summary_id}
        </p>
      </div>

      <div className="mt-10">
      </div>
    </article>
  );
}
