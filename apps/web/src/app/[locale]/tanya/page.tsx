import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { AiChat } from "@/components/AiChat";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: "Tanya AI Islami — ULYAH.COM",
    description: "Tanya jawab Islami berbasis Al-Qur'an & hadits dari database ULYAH.COM, dengan rujukan.",
    alternates: { canonical: `/${locale}/tanya` },
  };
}

export default async function TanyaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">💬 Tanya AI Islami</h1>
      <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
        Dijawab oleh worker Orchestra Core berbasis database ULYAH.COM — dengan dalil &amp; rujukan, tanpa mengarang.
      </p>
      <div className="mt-8">
        <AiChat locale={locale} />
      </div>
    </div>
  );
}
