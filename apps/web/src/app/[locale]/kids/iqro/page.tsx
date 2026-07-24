import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { kidsLabels } from "@/lib/kids-labels";
import { IQRO } from "@/lib/iqro";

export const revalidate = 86400;

const TINTS = [
  "from-rose-400 to-orange-300",
  "from-sky-400 to-cyan-300",
  "from-violet-400 to-fuchsia-300",
  "from-emerald-400 to-lime-300",
  "from-amber-400 to-yellow-300",
  "from-indigo-400 to-sky-300",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  return { title: `${t.iqroTitle} — ${t.title}`, description: t.iqroDesc };
}

export default async function IqroIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-rose-50 pb-16 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <Link
          href={`/${locale}/kids`}
          className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-slate-200"
        >
          ← {t.back}
        </Link>

        <header className="mt-6 text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-emerald-300 to-sky-400 text-4xl shadow-lg">
            📖
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-800 sm:text-3xl dark:text-amber-100">{t.iqroTitle}</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-300">{t.iqroDesc}</p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {IQRO.map((j, i) => (
            <Link
              key={j.no}
              href={`/${locale}/kids/iqro/${j.no}`}
              className={`flex min-h-[120px] flex-col justify-between rounded-3xl bg-gradient-to-br ${
                TINTS[i % TINTS.length]
              } p-4 text-white shadow-md ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/30 text-lg font-extrabold">
                {j.no}
              </span>
              <div>
                <p className="font-heading text-base font-bold">
                  {t.jilid} {j.no}
                </p>
                <p className="mt-0.5 text-xs opacity-90">{j.focus}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
