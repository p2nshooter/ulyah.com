import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { NasakhLibrary } from "@/components/NasakhLibrary";
import { t } from "@/lib/ui-strings";

export const revalidate = 300;

interface NasakhEntry {
  id: number;
  entry_order: number;
  title_id: string;
  naskh_type: string;
  mansukh_ref: string | null;
  mansukh_ar: string | null;
  mansukh_id: string | null;
  nasikh_ref: string | null;
  nasikh_ar: string | null;
  nasikh_id: string | null;
  explanation_id: string | null;
  source: string | null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: "Nasakh & Mansukh",
    description: t("nasakhHeroDesc", locale),
  };
}

export default async function NasakhPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

  let entries: NasakhEntry[] = [];
  try {
    const res = await api.get<{ entries: NasakhEntry[] }>("/content/nasakh");
    entries = res.entries;
  } catch {
    entries = [];
  }

  return (
    <div className="pb-6">
      <div className="mx-auto max-w-4xl px-4 pt-14 sm:px-6">
        <PageHero
          icon="🔁"
          title="Nasakh & Mansukh"
          subtitle={t("nasakhIntro", locale)}
        />
      </div>
      <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6">
      </div>

      {entries.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[var(--color-text-secondary)]">
          {t("kitabLoadError", locale)}
        </p>
      ) : (
        <NasakhLibrary locale={locale} entries={entries} />
      )}
    </div>
  );
}
