import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { StoryReader } from "@/components/StoryReader";
import { StoryDownloads } from "@/components/StoryDownloads";

interface StoryDetail {
  id: number;
  title: string;
  body: string;
  lang: string;
  episode_number: number | null;
  pdf_ebook_id: number | null;
  audio_r2_key: string | null;
  published_at: string | null;
  category_name: string | null;
}

function metaDescription(body: string): string {
  const plain = body.replace(/\s+/g, " ").trim();
  return plain.length > 160 ? `${plain.slice(0, 157)}...` : plain;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const storyLang = locale; // the API localizes non-authored languages server-side

  try {
    const data = await api.get<{ story: StoryDetail }>(`/content/stories/${slug}?lang=${storyLang}`);
    const description = metaDescription(data.story.body);
    return {
      title: `${data.story.title}`,
      description,
      alternates: { canonical: `/${locale}/kisah/${slug}` },
      openGraph: {
        title: data.story.title,
        description,
        type: "article",
        publishedTime: data.story.published_at ?? undefined,
        url: `https://ulyah.com/${locale}/kisah/${slug}`,
      },
    };
  } catch {
    return {};
  }
}

export default async function KisahDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ autoplay?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const { autoplay } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const storyLang = locale; // the API localizes non-authored languages server-side

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: story.title,
            description: metaDescription(story.body),
            inLanguage: storyLang,
            articleSection: story.category_name ?? "Kisah Islami",
            datePublished: story.published_at ?? undefined,
            author: { "@type": "Organization", name: "ULYAH.COM" },
            publisher: {
              "@type": "Organization",
              name: "ULYAH.COM",
              logo: { "@type": "ImageObject", url: "https://ulyah.com/icon-512.png" },
            },
            mainEntityOfPage: `https://ulyah.com/${locale}/kisah/${slug}`,
            ...(story.audio_r2_key
              ? { audio: { "@type": "AudioObject", contentUrl: `${api.base}/content/stories/${story.id}/audio` } }
              : {}),
          }),
        }}
      />
      {story.episode_number && (
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Episode {story.episode_number}</p>
      )}
      <h1 className="mt-1 font-heading text-3xl">{story.title}</h1>

      {fallbackUsed && <p className="mt-3 text-xs text-warning">{dict.reader.translationNotAvailable}</p>}

      <div className="mt-6">
        <StoryDownloads
          storyId={story.id}
          title={story.title}
          body={story.body}
          audioAvailable={Boolean(story.audio_r2_key)}
          pdfEbookId={story.pdf_ebook_id}
          dict={dict}
        />
      </div>

      <div className="mt-8">
        <StoryReader
          body={story.body}
          lang={storyLang}
          dict={dict}
          autoStart={autoplay === "1"}
          nextHref={nextEpisode ? `/${locale}/kisah/${nextEpisode.slug}?autoplay=1` : null}
        />
      </div>

      <div className="mt-10">
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
