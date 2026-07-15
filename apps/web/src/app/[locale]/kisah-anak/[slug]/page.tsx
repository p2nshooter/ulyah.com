import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { kidsLabels } from "@/lib/kids-labels";
import { KidsStoryPlayer } from "@/components/kids/KidsStoryPlayer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  return {
    title: `${t.title} — ULYAH.COM`,
    description: t.metaDescription,
  };
}

export default async function KidsStoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B3D2E]/10 via-transparent to-transparent px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href={`/${locale}/kisah-anak`} className="text-sm text-accent hover:underline">
          {t.backToList}
        </Link>
      </div>

      <div className="mt-6">
        <KidsStoryPlayer slug={slug} uiLocale={locale} />
      </div>
    </div>
  );
}
