import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api, ebookDownloadUrl } from "@/lib/api";
import { StoryReader } from "@/components/StoryReader";

interface StoryDetail {
  id: number;
  title: string;
  body: string;
  lang: string;
  episode_number: number | null;
  pdf_ebook_id: number | null;
  audio_r2_key: string | null;
}

export default async function KisahDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const storyLang = locale === "id" ? "id" : "en";

  let data: { story: StoryDetail; fallbackUsed: boolean; nextEpisode: { slug: string; title: string } | null } | null = null;
  try {
    data = await api.get(`/content/stories/${slug}?lang=${storyLang}`);
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p>{dict.common.error}</p>
      </div>
    );
  }

  const { story, fallbackUsed, nextEpisode } = data;

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      {story.episode_number && (
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Episode {story.episode_number}</p>
      )}
      <h1 className="mt-1 font-heading text-3xl">{story.title}</h1>

      {fallbackUsed && <p className="mt-3 text-xs text-warning">{dict.reader.translationNotAvailable}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        {story.pdf_ebook_id && (
          <a
            href={ebookDownloadUrl(story.pdf_ebook_id)}
            className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm hover:border-accent"
          >
            📄 PDF
          </a>
        )}
      </div>

      <div className="mt-8">
        <StoryReader body={story.body} lang={storyLang} dict={dict} />
      </div>

      {nextEpisode && (
        <Link
          href={`/${locale}/kisah/${nextEpisode.slug}`}
          className="mt-10 block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-accent"
        >
          <p className="text-xs text-[var(--color-text-secondary)]">Next →</p>
          <p className="mt-1 font-heading text-lg">{nextEpisode.title}</p>
        </Link>
      )}
    </article>
  );
}
