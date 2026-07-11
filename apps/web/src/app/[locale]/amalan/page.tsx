import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { AmalanLibrary, type AmalanCategory } from "@/components/AmalanLibrary";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return {
    title: "Amalan Harian — Doa, Dzikir, Thibbun Nabawi · ULYAH.COM",
    description:
      "Kumpulan amalan harian tersusun rapi: doa dari bangun tidur sampai tidur lagi, dzikir pagi-petang, pengobatan ala Nabi (thibbun nabawi) yang sahih, serta adab kebersihan & keindahan diri — lengkap Arab, latin, terjemah, dan suara.",
  };
}

export default async function AmalanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  let categories: AmalanCategory[] = [];
  try {
    const res = await api.get<{ categories: AmalanCategory[] }>("/content/amalan/all");
    categories = res.categories;
  } catch {
    categories = [];
  }

  return (
    <div className="pb-6">
      <div className="mx-auto max-w-5xl px-4 pt-14 sm:px-6">
        <PageHero
          icon="🤲"
          title="Amalan Harian"
          subtitle="Doa dari bangun tidur sampai tidur lagi, dzikir, thibbun nabawi (pengobatan Nabi ﷺ), dan adab kebersihan & keindahan — semua bersumber sahih, lengkap Arab, latin, terjemah, dan bisa didengarkan."
        />
      </div>

      <div className="mx-auto mt-6 max-w-5xl px-4 sm:px-6">
        <AdSlot minHeight={110} format="horizontal" />
      </div>

      {categories.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[var(--color-text-secondary)]">
          Koleksi sedang disiapkan, coba muat ulang sebentar lagi.
        </p>
      ) : (
        <AmalanLibrary locale={locale} categories={categories} />
      )}
    </div>
  );
}
