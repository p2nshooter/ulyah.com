import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { LiveHub } from "@/components/LiveHub";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const title =
    locale === "en" ? "Live Streaming — Watch on ULYAH.COM" : "Live Streaming — Tonton di ULYAH.COM";
  const description =
    locale === "en"
      ? "Live Islamic broadcasts — YouTube, TikTok, and Facebook streams, watched right here on ulyah.com."
      : "Siaran langsung Islami — stream YouTube, TikTok, dan Facebook, ditonton langsung di ulyah.com.";
  return { title, description, alternates: { canonical: `/${locale}/live` } };
}

export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const isId = locale !== "en" && locale !== "ar";

  return (
    <div className="px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="hero-entrance text-center">
          <span aria-hidden className="float-soft inline-block text-5xl">📡</span>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">
            {isId ? "Live Streaming" : "Live Streaming"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {isId
              ? "Siaran langsung kajian dan tilawah — ditonton langsung di sini, tanpa berpindah situs."
              : "Live lectures and recitation — watched right here, without leaving the site."}
          </p>
        </div>

        <div className="mt-10">
          <LiveHub locale={locale} />
        </div>
      </div>
    </div>
  );
}
