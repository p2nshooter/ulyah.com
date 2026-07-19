import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PesantrenKitabReader, type KitabDetail } from "@/components/PesantrenKitabReader";
import { localePath } from "@/lib/paths";

export const revalidate = 300;

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

// Always request the reader's own language — the API localizes the matn
// translation/explanation server-side (one cached blob per kitab+lang), so a
// sibling site never shows Indonesian (owner rule + AdSense language purity).
async function fetchKitab(slug: string, locale: string): Promise<KitabResponse | null> {
  try {
    return await api.get<KitabResponse>(`/content/pesantren/kitab/${slug}?lang=${locale}`);
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
  const data = await fetchKitab(slug, locale);
  if (!data) return { title: "Kitab" };
  const k = data.kitab;
  return {
    title: `${k.title_id} — Kitab Pesantren`,
    description: `${k.title_id} (${k.title_ar}) karya ${k.author ?? "ulama klasik"}. ${k.description_id ?? ""}`.trim(),
    alternates: { canonical: localePath(locale, `/kitab-pesantren/${slug}`) },
    // Its own manifest ("widget per buku") — the browser's install prompt
    // names the app after THIS specific kitab, not the library as a whole,
    // and scopes it to only this book's route (see manifest-kitab route.ts).
    manifest: `/manifest-kitab.webmanifest?slug=${slug}&locale=${locale}`,
  };
}

export default async function KitabPesantrenDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ install?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const { install } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const data = await fetchKitab(slug, locale);
  if (!data) notFound();

  return (
    <PesantrenKitabReader
      locale={locale}
      kitab={data.kitab}
      chapters={data.chapters}
      autoPromptInstall={install === "1"}
      translationPending={data.translationPending === true}
    />
  );
}
