import Link from "next/link";
import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kidsLabels } from "@/lib/kids-labels";
import { KidsHijaiyah } from "@/components/KidsHijaiyah";
import { JUZ30, JUZ29, PILIHAN } from "@/lib/kids-surahs";

export const revalidate = 86400;

interface SurahRow {
  id: number;
  name_ar: string;
  name_transliteration: string;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  return { title: t.metaTitle, description: t.metaDesc };
}

const CARD_TINTS = [
  "from-rose-400 to-orange-300",
  "from-sky-400 to-cyan-300",
  "from-violet-400 to-fuchsia-300",
  "from-emerald-400 to-lime-300",
  "from-amber-400 to-yellow-300",
  "from-indigo-400 to-sky-300",
];

function SurahGrid({ locale, ids, byId }: { locale: string; ids: number[]; byId: Map<number, SurahRow> }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ids.map((id, i) => {
        const s = byId.get(id);
        if (!s) return null;
        return (
          <Link
            key={id}
            href={`/${locale}/kids/${id}`}
            className={`group relative flex min-h-[112px] flex-col justify-between rounded-3xl bg-gradient-to-br ${
              CARD_TINTS[i % CARD_TINTS.length]
            } p-4 text-white shadow-md ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/30 text-xs font-bold">{id}</span>
              <span aria-hidden className="text-lg opacity-90 transition group-hover:scale-110">🔊</span>
            </div>
            <div>
              <p dir="rtl" className="font-arabic text-2xl leading-tight drop-shadow-sm">{s.name_ar}</p>
              <p className="mt-0.5 text-sm font-semibold">{s.name_transliteration}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SectionHead({ icon, title, desc, count }: { icon: string; title: string; desc: string; count?: string }) {
  return (
    <>
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-800 dark:text-amber-100">
          {icon} {title}
        </h2>
        {count && <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{count}</span>}
      </div>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{desc}</p>
    </>
  );
}

export default async function KidsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);

  let byId = new Map<number, SurahRow>();
  try {
    const res = await api.get<{ surah: SurahRow[] }>("/quran/surah");
    byId = new Map(res.surah.map((s) => [s.id, s]));
  } catch {
    byId = new Map();
  }

  // Which letter slots already have a real recording (else the grid uses an
  // Arabic voice).
  let filledAudio: string[] = [];
  try {
    filledAudio = (await api.get<{ codes: string[] }>("/content/kids-audio")).codes;
  } catch {
    filledAudio = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-rose-50 pb-16 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <header className="mx-auto max-w-4xl px-4 pt-12 text-center sm:px-6">
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 to-rose-400 text-5xl shadow-lg">
          🧒
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-800 sm:text-4xl dark:text-amber-100">{t.title}</h1>
        <p className="mx-auto mt-2 max-w-xl text-base text-slate-600 dark:text-slate-300">{t.subtitle}</p>
      </header>

      {/* Iqro — learn to read */}
      <section className="mx-auto mt-10 max-w-4xl px-4 sm:px-6">
        <SectionHead icon="📖" title={t.iqroTitle} desc={t.iqroDesc} count={`6 ${t.jilid}`} />
        <Link
          href={`/${locale}/kids/iqro`}
          className="flex items-center justify-between rounded-3xl bg-gradient-to-br from-emerald-400 to-sky-400 p-5 text-white shadow-md ring-1 ring-black/5 transition-transform hover:-translate-y-0.5 hover:shadow-xl"
        >
          <span className="font-heading text-lg font-bold">📖 {t.iqroTitle}</span>
          <span aria-hidden className="text-2xl">→</span>
        </Link>
      </section>

      {/* Hijaiyah letters */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
        <SectionHead icon="🔤" title={t.hijaiyahTitle} desc={t.hijaiyahDesc} count={`28 ${t.letters}`} />
        <KidsHijaiyah tapHint={t.tapToHear} filled={filledAudio} />
      </section>

      {/* Hafalan Juz 30 */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
        <SectionHead icon="🎧" title={t.hifzTitle} desc={t.hifzDesc} count={`${JUZ30.length} ${t.surahs}`} />
        {byId.size === 0 ? (
          <p className="text-center text-sm text-slate-500">{t.loading}</p>
        ) : (
          <SurahGrid locale={locale} ids={JUZ30} byId={byId} />
        )}
      </section>

      {/* Hafalan Juz 29 */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
        <SectionHead icon="🎧" title={t.juz29Title} desc={t.juz29Desc} count={`${JUZ29.length} ${t.surahs}`} />
        {byId.size > 0 && <SurahGrid locale={locale} ids={JUZ29} byId={byId} />}
      </section>

      {/* Surat pilihan */}
      <section className="mx-auto mt-12 max-w-4xl px-4 sm:px-6">
        <SectionHead icon="⭐" title={t.pilihanTitle} desc={t.pilihanDesc} count={`${PILIHAN.length} ${t.surahs}`} />
        {byId.size > 0 && <SurahGrid locale={locale} ids={PILIHAN} byId={byId} />}
      </section>
    </div>
  );
}
