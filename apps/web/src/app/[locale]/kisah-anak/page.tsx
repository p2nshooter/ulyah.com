import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { kidsLabels } from "@/lib/kids-labels";
import { PageHero } from "@/components/PageHero";
import { api } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: `/${locale}/kisah-anak` },
  };
}

interface StorySummary {
  id: number;
  slug: string;
  title_id: string;
  title_en: string | null;
  summary_id: string | null;
  summary_en: string | null;
  cover_variant: "boy" | "girl";
}

export default async function KidsStoryListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);

  let stories: StorySummary[] = [];
  try {
    const res = await api.get<{ stories: StorySummary[] }>("/content/kids-stories");
    stories = res.stories;
  } catch {
    stories = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <PageHero icon="🌴" title={t.title} subtitle={t.subtitle} />

      {stories.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">{t.emptyList}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {stories.map((s) => {
            const title = locale === "en" ? s.title_en ?? s.title_id : s.title_id;
            const summary = locale === "en" ? s.summary_en ?? s.summary_id : s.summary_id;
            return (
              <Link
                key={s.id}
                href={`/${locale}/kisah-anak/${s.slug}`}
                className="card-premium flex flex-col gap-2 p-5"
              >
                <span className="text-3xl">{s.cover_variant === "girl" ? "👧" : "👦"}</span>
                <h2 className="font-heading text-lg">{title}</h2>
                {summary && <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">{summary}</p>}
                <p className="mt-1 text-xs text-accent">{t.readStory}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
