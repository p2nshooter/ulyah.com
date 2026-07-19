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
  const m = META[locale] ?? META.en!;
  const data = await fetchKitab(slug, locale);
  if (!data) return { title: m.section };
  const k = data.kitab;
  return {
    title: `${k.title_id} — ${m.section}`,
    description: `${k.title_id} (${k.title_ar}) ${m.by} ${k.author ?? "—"}. ${k.description_id ?? ""}`.trim(),
    alternates: { canonical: localePath(locale, `/kitab-pesantren/${slug}`) },
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

  return (
    <PesantrenKitabReader
      locale={locale}
      kitab={data.kitab}
      chapters={data.chapters}
      autoReadStart={autoread === "1"}
      autoReadMode={autoMode}
      translationPending={data.translationPending === true}
    />
  );
}
