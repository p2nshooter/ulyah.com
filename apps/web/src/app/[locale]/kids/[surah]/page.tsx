import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { kidsLabels } from "@/lib/kids-labels";
import { KidsSurahPlayer, type KidsAyah } from "@/components/KidsSurahPlayer";
import { KIDS_SURAHS } from "@/lib/kids-surahs";

export const revalidate = 86400;

interface SurahDetail {
  surah: { id: number; name_ar: string; name_transliteration: string };
  ayat: { number: number; text_ar: string; text_translit: string | null; translation: string | null }[];
}

async function load(id: number, locale: string): Promise<SurahDetail | null> {
  try {
    return await api.get<SurahDetail>(`/quran/surah/${id}?lang=${locale}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; surah: string }>;
}): Promise<Metadata> {
  const { locale: raw, surah } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = kidsLabels(locale);
  const data = await load(Number(surah), locale);
  const name = data?.surah.name_transliteration ?? "";
  return { title: `${name} — ${t.title}`, description: t.metaDesc };
}

export default async function KidsSurahPage({
  params,
}: {
  params: Promise<{ locale: string; surah: string }>;
}) {
  const { locale: raw, surah } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const id = Number(surah);
  // Al-Qur'an Kids covers Juz 30, Juz 29 and the favourite surahs.
  if (!Number.isInteger(id) || !KIDS_SURAHS.has(id)) notFound();

  const t = kidsLabels(locale);
  const data = await load(id, locale);
  if (!data) notFound();

  const ayat: KidsAyah[] = data.ayat.map((a) => ({
    number: a.number,
    ar: a.text_ar,
    meaning: a.translation ?? a.text_translit ?? "",
  }));

  return (
    <KidsSurahPlayer
      locale={locale}
      surahId={id}
      nameAr={data.surah.name_ar}
      nameLatin={data.surah.name_transliteration}
      ayat={ayat}
      labels={{
        back: t.back,
        playAll: t.playAll,
        pause: t.pause,
        repeat: t.repeat,
        repeatOn: t.repeatOn,
        ayahMeaning: t.ayahMeaning,
      }}
    />
  );
}
