import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PesantrenKitabReader, type KitabDetail } from "@/components/PesantrenKitabReader";
import { routePath } from "@/lib/paths";
import { fillLabels } from "@/lib/fill-labels";
import { book as bookLd, breadcrumbs, jsonLdProps } from "@/lib/structured-data";

export const revalidate = 300;

/**
 * Empty on purpose — and required, or `revalidate` above does nothing.
 *
 * A dynamic segment with no generateStaticParams is never registered as a
 * cacheable route: it gets no entry in the prerender manifest and re-renders
 * on every request forever, whatever revalidate says. Declaring it — with
 * nothing to prerender — makes Next treat the route as incrementally static:
 * nothing is built at deploy time, each url renders once on first request, and
 * every hit after that is served from cache until it expires.
 */
export function generateStaticParams() {
  return [];
}

interface Chapter {
  id: number;
  order: number;
  name_id: string;
  name_ar: string | null;
  matn: {
    id: number;
    order: number;
    title_id: string | null;
    title_ar: string | null;
    text_ar: string;
    translation_id: string | null;
    explanation_id: string | null;
    quran_refs: { s: number; v: number; label?: string }[];
    hadits_refs: string[];
  }[];
}
interface KitabResponse {
  kitab: KitabDetail;
  chapters: Chapter[];
  translationPending?: boolean;
}

// Localized metadata suffixes — sibling sites must not show Indonesian.
const META: Record<string, { section: string; by: string }> = {
  id: { section: "Kitab Pesantren", by: "karya" },
  en: { section: "Classical Texts", by: "by" },
  fr: { section: "Textes Classiques", by: "par" },
  de: { section: "Klassische Werke", by: "von" },
  es: { section: "Textos Clásicos", by: "por" },
};

// Always request the reader's own language — the API localizes the matn
// translation/explanation server-side (pre-translated strings in D1), so a
// sibling site never shows Indonesian (owner rule + AdSense language purity).
/**
 * Null means "not usable", not merely "threw".
 *
 * `api.get<T>` annotates what the endpoint is SUPPOSED to answer and checks
 * nothing. A 200 carrying `{}` resolves, and `{}` is truthy — so `if (!data)`
 * waves it through and the page dies on the first nested read, as an HTTP 500
 * caused by a request that succeeded. Checking the shape once, here, is what
 * lets every line below it read `data.x.y` without a second thought.
 */
async function fetchKitab(slug: string, locale: string): Promise<KitabResponse | null> {
  try {
    const r = await api.getCached<KitabResponse>(`/content/pesantren/kitab/${slug}?lang=${locale}`, 300);
    return r?.kitab && Array.isArray(r.chapters) ? r : null;
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
  const m = META[locale] ?? fillLabels(locale, META.en!);
  const data = await fetchKitab(slug, locale);
  if (!data) return { title: m.section };
  const k = data.kitab;
  return {
    title: `${k.title_id} — ${m.section}`,
    description: `${k.title_id} (${k.title_ar}) ${m.by} ${k.author ?? "—"}. ${k.description_id ?? ""}`.trim(),
    alternates: { canonical: routePath(locale, `/kitab-pesantren/${slug}`) },
  };
}

export default async function KitabPesantrenDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ autoread?: string; mode?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const { autoread, mode } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const data = await fetchKitab(slug, locale);
  if (!data) notFound();

  const autoMode = mode === "arab" || mode === "arti" ? mode : "semua";

  // A readable classical work: Book + where it sits in the pesantren library.
  const k = data.kitab;
  const ld = [
    bookLd({
      locale,
      route: `/kitab-pesantren/${slug}`,
      name: k.title_id || k.title_ar || slug,
      alternateName: k.title_id ? k.title_ar : null,
      author: k.author,
      description: k.description_id,
    }),
    breadcrumbs(locale, [
      { name: (META[locale] ?? fillLabels(locale, META.en!)).section, route: "/kitab-pesantren" },
      { name: k.title_id || k.title_ar || slug, route: `/kitab-pesantren/${slug}` },
    ]),
  ];

  return (
    <>
      <script {...jsonLdProps(ld)} />
    <PesantrenKitabReader
      locale={locale}
      kitab={data.kitab}
      chapters={data.chapters}
      autoReadStart={autoread === "1"}
      autoReadMode={autoMode}
      translationPending={data.translationPending === true}
    />
    </>
  );
}
