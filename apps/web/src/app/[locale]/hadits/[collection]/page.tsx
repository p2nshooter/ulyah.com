import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { haditsLabels } from "@/lib/hadits-labels";
import { HaditsReader, type HaditsItem } from "@/components/HaditsReader";
import { AdSlot } from "@/components/AdSlot";

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
const COLLECTION_ORDER = ["bukhari", "muslim", "tirmidhi", "abudawud", "nasai", "ibnmajah", "malik", "nawawi", "qudsi"];

interface PageData {
  collection: CollectionMeta;
  hadits: HaditsItem[];
  total: number;
  page: number;
  totalPages: number;
}

async function load(slug: string, page: number, locale: string): Promise<PageData | null> {
  try {
    return await api.get<PageData>(`/content/hadits/${slug}?page=${page}&lang=${locale}`);
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
    title: `${data.collection.name_id}${suffix} — ULYAH.COM`,
    description: `${data.collection.name_id} (${data.collection.name_ar}) — ${data.total.toLocaleString(locale)} ${t.hadithCount}. ${t.subtitle}`,
    alternates: { canonical: `/${locale}/hadits/${collection}${page > 1 ? `?page=${page}` : ""}` },
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
        <p className="text-sm text-[var(--color-text-secondary)]">{t.noResults}</p>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: meta.name_id,
            alternateName: meta.name_ar,
            author: meta.author ? { "@type": "Person", name: meta.author } : undefined,
            inLanguage: ["ar", locale],
            numberOfPages: total,
            publisher: { "@type": "Organization", name: "ULYAH.COM" },
          }),
        }}
      />

      <Link href={`/${locale}/hadits`} className="text-sm text-accent hover:underline">
        ← {t.backToBooks}
      </Link>

      <div className="mt-4">
        <p dir="rtl" className="font-arabic text-2xl leading-snug text-[var(--color-text-primary)]">{meta.name_ar}</p>
        <h1 className="mt-1 font-heading text-2xl">{meta.name_id}</h1>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {meta.author ? `${t.author}: ${meta.author} · ` : ""}
          {total.toLocaleString(locale)} {t.hadithCount}
        </p>
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
        <AdSlot minHeight={110} />
      </div>

      <nav className="mt-8 flex items-center justify-between gap-3 text-sm">
        {page > 1 ? (
          <Link href={`${base}?page=${page - 1}`} className="rounded-lg border border-[var(--color-border)] px-4 py-2 hover:border-accent">
            ← {t.prev}
          </Link>
        ) : (
          <span />
        )}
        <span className="text-xs text-[var(--color-text-secondary)]">
          {t.page} {page.toLocaleString(locale)} {t.of} {totalPages.toLocaleString(locale)}
        </span>
        {page < totalPages ? (
          <Link href={`${base}?page=${page + 1}`} className="rounded-lg border border-[var(--color-border)] px-4 py-2 hover:border-accent">
            {t.next} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
