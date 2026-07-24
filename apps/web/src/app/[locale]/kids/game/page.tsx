import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";
import { localePath } from "@/lib/paths";
import { KidsGames } from "@/components/kids/KidsGames";

// Static shell; the games themselves are a client island, so this route costs
// the rest of the site nothing until a child opens it.
export const revalidate = 86400;

const META = {
  id: { title: "Game Belajar Qur'an — Al-Qur'an Kids", desc: "Game seru untuk anak: tebak huruf hijaiyah, cari huruf, kartu pasangan, dan urutkan huruf." },
  en: { title: "Qur'an Learning Games — Al-Qur'an Kids", desc: "Fun games for children: guess the hijaiyah letter, find the letter, matching cards, and put them in order." },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const m = locale === "id" ? META.id : META.en;
  return {
    title: `${m.title} — ${TENANT.siteName}`,
    description: m.desc,
    alternates: { canonical: localePath(locale, `/kids/game`) },
  };
}

export default async function KidsGamePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-rose-50 pb-16 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <Link href={`/${locale}/kids`} className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
          ← Al-Qur&apos;an Kids
        </Link>
        <div className="mt-5">
          <KidsGames locale={locale} />
        </div>
      </div>
    </div>
  );
}
