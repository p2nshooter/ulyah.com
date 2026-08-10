import Link from "next/link";
import { KitabCover } from "@/components/KitabCover";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";
import { haditsLabels } from "@/lib/hadits-labels";
import { HaditsReader, type HaditsItem } from "@/components/HaditsReader";
import { localePath } from "@/lib/paths";
import { breadcrumbs, jsonLdHtml, jsonLdProps } from "@/lib/structured-data";

/**
 * Served from cache instead of rebuilt per request.
 *
 * Every one of these pages ran a full render — and its API calls — for each
 * visitor AND each crawler hit. With the ecosystem newly indexable, that put
 * the account past the Workers free plan's 100,000 requests a day and every
 * site answered Error 1027 until midnight UTC.
 *
 * Hadith text is static once imported.
 */
export const revalidate = 86400;

interface CollectionMeta {
  slug: string;
  name_id: string;
  name_ar: string;
  author: string | null;
  has_native_id: number;
}

// Fixed reading order (matches sort_order in migration 0012). When the last
// page of a collection finishes narrating, playback continues into the next
// book automatically instead of just stopping — "auto next pindah sesi".
const COLLECTION_ORDER = ["bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah", "malik", "nawawi", "qudsi", "ahmad", "darimi"];

interface PageData {
  collection: CollectionMeta;
  hadits: HaditsItem[];
  total: number;
  page: number;
  totalPages: number;
}

async function load(slug: string, page: number, locale: string): Promise<PageData | null> {
  try {
    return await api.getCached<PageData>(`/content/hadits/${slug}?page=${page}&lang=${locale}`, 86400);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; collection: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { locale: raw, collection } = await params;
  const { page: pageRaw } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const page = Math.max(1, Number(pageRaw ?? "1"));
  const data = await load(collection, page, locale);
  if (!data) return {};
  const t = haditsLabels(locale);
  const suffix = page > 1 ? ` — ${t.page} ${page}` : "";
  return {
    title: `${data.collection.name_id}${suffix}`,
    description: `${data.collection.name_id} (${data.collection.name_ar}) — ${data.total.toLocaleString(locale)} ${t.hadithCount}. ${t.subtitle}`,
    alternates: {
      canonical: localePath(locale, page > 1 ? `/hadits/${collection}?page=${page}` : `/hadits/${collection}`),
    },
  };
}

export default async function HaditsCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; collection: string }>;
  searchParams: Promise<{ page?: string; autoplay?: string }>;
}) {
  const { locale: raw, collection } = await params;
  const { page: pageRaw, autoplay } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = haditsLabels(locale);
  const page = Math.max(1, Number(pageRaw ?? "1"));

  const data = await load(collection, page, locale);

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-text-secondary">{t.noResults}</p>
        <Link href={`/${locale}/hadits`} className="mt-4 inline-block text-sm text-accent hover:underline">
          ← {t.backToBooks}
        </Link>
      </div>
    );
  }

  const { collection: meta, hadits, total, totalPages } = data;
  const base = `/${locale}/hadits/${collection}`;

  // Auto-next target once this page finishes narrating: next page in this
  // book, or if this was the last page, the first page of the next book in
  // reading order (falls off the end after the last collection).
  let nextPageHref: string | null = null;
  if (page < totalPages) {
    nextPageHref = `${base}?page=${page + 1}&autoplay=1`;
  } else {
    const idx = COLLECTION_ORDER.indexOf(collection);
    const nextSlug = idx >= 0 ? COLLECTION_ORDER[idx + 1] : undefined;
    if (nextSlug) nextPageHref = `/${locale}/hadits/${nextSlug}?autoplay=1`;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* The Book description already existed; the trail did not, and the
          breadcrumb is the rich result Google shows most often. */}
      <script
        {...jsonLdProps(
          breadcrumbs(locale, [
            { name: t.title, route: "/hadits" },
            { name: meta.name_id, route: `/hadits/${collection}` },
          ])
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml({
            "@context": "https://schema.org",
            "@type": "Book",
            name: meta.name_id,
            alternateName: meta.name_ar,
            author: meta.author ? { "@type": "Person", name: meta.author } : undefined,
            inLanguage: ["ar", locale],
            numberOfPages: total,
            publisher: { "@type": "Organization", name: TENANT.siteName, url: TENANT.siteUrl },
          }),
        }}
      />

      <Link href={`/${locale}/hadits`} className="text-sm text-accent hover:underline">
        ← {t.backToBooks}
      </Link>

      {/* The collection opens as its own bound kitab — same binding art the
          shelf card and the share image use, so it is recognisably the book
          the reader just picked up. */}
      <div className="mt-4 grid gap-5 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-center">
        <KitabCover
          slug={meta.slug}
          titleAr={meta.name_ar}
          title={meta.name_id}
          size="hero"
          ribbon
          meta={`${total.toLocaleString(locale)} ${t.hadithCount}`}
        />
        <div>
          <h1 className="font-heading text-2xl">{meta.name_id}</h1>
          <p dir="rtl" className="font-arabic mt-1 text-2xl leading-snug text-text-primary">{meta.name_ar}</p>
          <p className="mt-2 text-xs text-text-secondary">
            {meta.author ? `${t.author}: ${meta.author} · ` : ""}
            {total.toLocaleString(locale)} {t.hadithCount}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <HaditsReader
          hadits={hadits}
          lang={locale}
          labels={t}
          translatedNote={meta.has_native_id === 0}
          autoStart={autoplay === "1"}
          nextPageHref={nextPageHref}
        />
      </div>

      <div className="mt-8">
      </div>

      <nav className="mt-8 flex items-center justify-between gap-3 text-sm">
        {page > 1 ? (
          <Link href={`${base}?page=${page - 1}`} className="rounded-lg border border-(--color-border) px-4 py-2 hover:border-accent">
            ← {t.prev}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-xs text-text-secondary">
          {t.page} {page.toLocaleString(locale)} {t.of} {totalPages.toLocaleString(locale)}
        </span>
        {page < totalPages ? (
          <Link href={`${base}?page=${page + 1}`} className="rounded-lg border border-(--color-border) px-4 py-2 hover:border-accent">
            {t.next} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
