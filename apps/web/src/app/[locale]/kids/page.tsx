import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kidsLabels } from "@/lib/kids-labels";
import { KidsHijaiyah } from "@/components/KidsHijaiyah";

export const revalidate = 86400;

interface SurahRow {
  id: number;
  name_ar: string;
  name_transliteration: string;
  name_id?: string;
  name_en?: string;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  return { title: t.metaTitle, description: t.metaDesc };
}

// Bright colour per card so the shelf reads playful, not like the adult reader.
const CARD_TINTS = [
  "from-rose-400 to-orange-300",
  "from-sky-400 to-cyan-300",
  "from-violet-400 to-fuchsia-300",
  "from-emerald-400 to-lime-300",
  "from-amber-400 to-yellow-300",
  "from-indigo-400 to-sky-300",
];

export default async function KidsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);

  // Juz 30 = surah 78 (An-Naba) … 114 (An-Nas). Show them shortest-first
  // (An-Nas → … → An-Naba), the order children usually memorize in.
  let juz30: SurahRow[] = [];
  try {
    const res = await api.get<{ surah: SurahRow[] }>("/quran/surah");
    juz30 = res.surah.filter((s) => s.id >= 78).sort((a, b) => b.id - a.id);
  } catch {
    juz30 = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-rose-50 pb-16 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      {/* Own bright hero — deliberately not the adult PageHero. */}
      <header className="mx-auto max-w-4xl px-4 pt-12 text-center sm:px-6">
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-rose-400 text-5xl shadow-lg">
          🧒
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-amber-100">{t.title}</h1>
        <p className="mx-auto mt-2 max-w-xl text-base text-slate-600 dark:text-slate-300">{t.subtitle}</p>
      </header>

      {/* Module 4 — Hijaiyah letters */}
      <section className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-amber-100">
            🔤 {t.hijaiyahTitle}
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">28 {t.letters}</span>
        </div>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t.hijaiyahDesc}</p>
        <KidsHijaiyah tapHint={t.tapToHear} />
      </section>

      {/* Module 1 — Hafalan Juz 30 */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-amber-100">
            🎧 {t.hifzTitle}
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {juz30.length} {t.surahs}
          </span>
        </div>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{t.hifzDesc}</p>

        {juz30.length === 0 ? (
          <p className="text-center text-sm text-slate-500">{t.loading}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {juz30.map((s, i) => (
              <Link
                key={s.id}
                href={`/${locale}/kids/${s.id}`}
                className={`group relative flex min-h-[112px] flex-col justify-between rounded-3xl bg-gradient-to-br ${
                  CARD_TINTS[i % CARD_TINTS.length]
                } p-4 text-white shadow-md ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-white/30 text-xs font-bold">
                    {s.id}
                  </span>
                  <span aria-hidden className="text-lg opacity-90 transition group-hover:scale-110">🔊</span>
                </div>
                <div>
                  <p dir="rtl" className="font-arabic text-2xl leading-tight drop-shadow-sm">{s.name_ar}</p>
                  <p className="mt-0.5 text-sm font-semibold">{s.name_transliteration}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
