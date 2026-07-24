import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kidsLabels } from "@/lib/kids-labels";
import { getJilid, IQRO } from "@/lib/iqro";
import { IqroReader } from "@/components/IqroReader";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return IQRO.map((j) => ({ jilid: String(j.no) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; jilid: string }>;
}): Promise<Metadata> {
  const { locale: raw, jilid } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  return { title: `${t.jilid} ${jilid} — ${t.iqroTitle}`, description: t.iqroDesc };
}

export default async function IqroJilidPage({
  params,
}: {
  params: Promise<{ locale: string; jilid: string }>;
}) {
  const { locale: raw, jilid } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  const j = getJilid(Number(jilid));
  if (!j) notFound();

  const next = getJilid(j.no + 1);

  let filledAudio: string[] = [];
  try {
    filledAudio = (await api.get<{ codes: string[] }>("/content/kids-audio")).codes;
  } catch {
    filledAudio = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-rose-50 pb-16 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
        <Link
          href={`/${locale}/kids/iqro`}
          className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-slate-200"
        >
          ← {t.iqroTitle}
        </Link>

        <header className="mt-6 text-center">
          <h1 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-amber-100">
            {t.jilid} {j.no}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{j.focus}</p>
          <p className="mt-1 text-xs text-slate-500">👆 {t.tapToHear}</p>
        </header>

        <div className="mt-6">
          <IqroReader rows={j.rows} tapHint={t.tapToHear} filled={filledAudio} />
        </div>

        {next && (
          <div className="mt-8 text-center">
            <Link
              href={`/${locale}/kids/iqro/${next.no}`}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-400 to-lime-400 px-5 py-2.5 text-sm font-bold text-white shadow-lg ring-1 ring-black/10 hover:brightness-105"
            >
              {t.jilid} {next.no} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
