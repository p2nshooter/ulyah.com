import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";

interface RandomAyah {
  surah_id: number;
  number: number;
  text_ar: string;
  translation: string | null;
  surah_name: string;
}

export default async function HarianPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  let ayah: RandomAyah | null = null;
  try {
    const res = await api.get<{ ayah: RandomAyah }>(`/quran/random?lang=${locale}`);
    ayah = res.ayah;
  } catch {
    ayah = null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{dict.explore.daily.title}</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.explore.daily.desc}</p>

      {ayah && (
        <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            {ayah.surah_name} : {ayah.number}
          </p>
          <p dir="rtl" className="font-arabic mt-4 text-right text-2xl leading-loose">
            {ayah.text_ar}
          </p>
          {ayah.translation && <p className="mt-4 text-[15px] leading-relaxed">{ayah.translation}</p>}
        </div>
      )}
    </div>
  );
}
