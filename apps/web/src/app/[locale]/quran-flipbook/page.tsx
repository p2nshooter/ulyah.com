import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { flipbookLabels } from "@/lib/flipbook-labels";
import { MushafReader } from "@/components/MushafReader";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = flipbookLabels(locale);
  return {
    title: `${t.title} — ULYAH.COM`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/quran-flipbook` },
    manifest: `/manifest-quran-flipbook.webmanifest?locale=${locale}`,
  };
}

export default async function QuranFlipbookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ install?: string }>;
}) {
  const { locale: raw } = await params;
  const { install } = await searchParams;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = flipbookLabels(locale);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl">📖 {t.title}</h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>
          </div>
        </div>

        {/* One Qur'an reading engine site-wide: this installable widget wraps
            the same MushafReader as /quran/mushaf (the old 5-ayat chunker it
            replaced was a duplicate, lower-fidelity reader). */}
        <div className="mt-6">
          <MushafReader locale={locale} />
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-[#06251b] p-8 text-center text-[#f4efe3]">
          <Image src="/brand/wordmark-ar-gold.png" alt="Ulyah" width={160} height={44} className="mx-auto h-9 w-auto" />
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-accent">ulyah.com</p>
          <Link
            href={`/${locale}/widget`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
          >
            {locale === "id" ? "Jelajahi semua widget ULYAH" : "Explore all ULYAH widgets"}
          </Link>
        </div>
      </div>
    </div>
  );
}
