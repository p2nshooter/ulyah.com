import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PesantrenKitabReader, type KitabDetail } from "@/components/PesantrenKitabReader";

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
}

async function fetchKitab(slug: string): Promise<KitabResponse | null> {
  try {
    return await api.get<KitabResponse>(`/content/pesantren/kitab/${slug}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchKitab(slug);
  if (!data) return { title: "Kitab — ULYAH.COM" };
  const k = data.kitab;
  return {
    title: `${k.title_id} — Kitab Pesantren · ULYAH.COM`,
    description: `${k.title_id} (${k.title_ar}) karya ${k.author ?? "ulama klasik"}. ${k.description_id ?? ""}`.trim(),
  };
}

export default async function KitabPesantrenDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const data = await fetchKitab(slug);
  if (!data) notFound();

  return <PesantrenKitabReader locale={locale} kitab={data.kitab} chapters={data.chapters} />;
}
