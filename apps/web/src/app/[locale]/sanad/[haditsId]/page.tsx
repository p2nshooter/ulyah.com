import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { sanadLabels } from "@/lib/sanad-labels";
import { SanadChainView } from "@/components/SanadChainView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = sanadLabels(locale);
  return {
    title: `${t.chainTitle} — ULYAH.COM`,
    description: t.metaDescription,
  };
}

export default async function SanadDetailPage({
  params,
}: {
  params: Promise<{ locale: string; haditsId: string }>;
}) {
  const { locale: raw, haditsId } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = sanadLabels(locale);
  const id = Number(haditsId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06251b] via-transparent to-transparent px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href={`/${locale}/sanad`} className="text-sm text-accent hover:underline">
          {t.backToList}
        </Link>
        <h1 className="mt-3 text-center font-heading text-2xl sm:text-3xl">{t.chainTitle}</h1>
      </div>

      <div className="mt-8">
        <SanadChainView haditsId={id} locale={locale} />
      </div>
    </div>
  );
}
