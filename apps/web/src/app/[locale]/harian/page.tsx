import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { NarrateButton } from "@/components/NarrateButton";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.explore.daily.title} — ULYAH.COM`,
    description: dict.explore.daily.desc,
    alternates: { canonical: `/${locale}/harian` },
  };
}

interface RandomAyah {
  surah_id: number;
  number: number;
  text_ar: string;
  translation: string | null;
  surah_name: string;
}

interface DailyHadits {
  id: number;
  text_ar: string | null;
  text_id: string | null;
  text_en: string | null;
  narrator: string | null;
  grade: string | null;
  source: string;
}

function DailyCard({
  eyebrow,
  arabic,
  body,
  footer,
  narrateText,
  locale,
  listenLabel,
  stopLabel,
}: {
  eyebrow: string;
  arabic: string;
  body: string;
  footer: string;
  narrateText: string;
  locale: string;
  listenLabel: string;
  stopLabel: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/[0.05] to-transparent p-6 shadow-[0_2px_24px_rgba(184,137,43,0.08)] sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 text-8xl text-accent/[0.06]">
        ✦
      </div>
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent">{eyebrow}</p>
      <p dir="rtl" className="font-arabic mt-4 text-right text-2xl leading-loose text-[var(--color-text-primary)] sm:text-3xl">
        {arabic}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-accent/10 pt-4">
        <p className="text-xs text-[var(--color-text-secondary)]/70">{footer}</p>
        <NarrateButton
          paragraphs={[narrateText]}
          listenLabel={listenLabel}
          stopLabel={stopLabel}
          lang={locale}
          className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 px-3.5 py-1.5 text-xs font-medium text-accent transition hover:bg-accent/10"
        />
      </div>
    </div>
  );
}

export default async function HarianPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  let ayah: RandomAyah | null = null;
  let hadits: DailyHadits | null = null;
  try {
    const [ayahRes, haditsRes] = await Promise.all([
      api.get<{ ayah: RandomAyah }>(`/quran/random?lang=${locale}`),
      api.get<{ hadits: DailyHadits | null }>(`/quran/hadits-of-day?lang=${locale}`),
    ]);
    ayah = ayahRes.ayah;
    hadits = haditsRes.hadits;
  } catch {
    ayah = null;
    hadits = null;
  }

  const haditsText = hadits ? (locale === "en" ? hadits.text_en ?? hadits.text_id : hadits.text_id ?? hadits.text_en) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">{dict.explore.daily.title}</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-[var(--color-text-secondary)]">
        {dict.explore.daily.desc}
      </p>

      <div className="mt-10 space-y-6">
        {ayah && (
          <DailyCard
            eyebrow={`${dict.reader.ayahLabel} — ${ayah.surah_name} : ${ayah.number}`}
            arabic={ayah.text_ar}
            body={ayah.translation ?? dict.reader.translationNotAvailable}
            footer={`— ${ayah.surah_name} : ${ayah.number}`}
            narrateText={ayah.translation ?? ""}
            locale={locale}
            listenLabel={dict.donation.virtuesListen}
            stopLabel={dict.syukur.stop}
          />
        )}

        {ayah && (
          <div className="py-1">
            <AdSlot minHeight={100} />
          </div>
        )}

        {hadits && haditsText && (
          <DailyCard
            eyebrow={dict.reader.haditsLabel}
            arabic={hadits.text_ar ?? ""}
            body={haditsText}
            footer={hadits.source}
            narrateText={haditsText}
            locale={locale}
            listenLabel={dict.donation.virtuesListen}
            stopLabel={dict.syukur.stop}
          />
        )}

        {!ayah && !hadits && (
          <p className="text-center text-sm text-[var(--color-text-secondary)]">{dict.reader.noContentYet}</p>
        )}
      </div>
    </div>
  );
}
