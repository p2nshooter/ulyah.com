"use client";

import type { Dictionary } from "@/dictionaries";

export interface AyahBundleView {
  ayah: { id: number; surah_id: number; number: number; text_ar: string };
  translation: { text: string } | null;
  translationLang?: string | null;
  tafsir: { text: string; source: string }[];
  asbabun_nuzul: { text: string; source: string }[];
  hadits?: { text_id: string; narrator: string | null; source: string }[];
  stories?: { id: number; title: string; slug: string }[];
}

export function AyahCard({
  bundle,
  surahName,
  dict,
  showHadits = true,
  isActive = false,
}: {
  bundle: AyahBundleView;
  surahName: string;
  dict: Dictionary;
  showHadits?: boolean;
  isActive?: boolean;
}) {
  const { ayah, translation, tafsir, asbabun_nuzul, hadits, stories } = bundle;

  return (
    <article
      id={`ayah-${ayah.number}`}
      className={`scroll-mt-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 transition ${
        isActive ? "ayah-active-highlight ring-1 ring-accent" : ""
      }`}
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">
        {surahName} : {ayah.number}
      </p>
      <p dir="rtl" className="font-arabic mb-4 text-right text-2xl leading-loose sm:text-3xl">
        {ayah.text_ar}
      </p>

      {translation && (
        <p className="text-[15px] leading-relaxed text-[var(--color-text-primary)]">{translation.text}</p>
      )}

      {tafsir.length > 0 && (
        <details className="mt-4 border-t border-[var(--color-border)] pt-3" open>
          <summary className="cursor-pointer text-sm font-medium text-primary dark:text-accent">
            {dict.reader.tafsirLabel}
          </summary>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{tafsir[0]!.text}</p>
        </details>
      )}

      {asbabun_nuzul.length > 0 && (
        <details className="mt-3 border-t border-[var(--color-border)] pt-3">
          <summary className="cursor-pointer text-sm font-medium text-primary dark:text-accent">
            {dict.reader.asbabunNuzulLabel}
          </summary>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{asbabun_nuzul[0]!.text}</p>
        </details>
      )}

      {showHadits && hadits && hadits.length > 0 && (
        <details className="mt-3 border-t border-[var(--color-border)] pt-3">
          <summary className="cursor-pointer text-sm font-medium text-primary dark:text-accent">
            {dict.reader.haditsLabel}
          </summary>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            “{hadits[0]!.text_id}” — {hadits[0]!.narrator ?? ""} ({hadits[0]!.source})
          </p>
        </details>
      )}

      {stories && stories.length > 0 && (
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
          <p className="text-sm font-medium text-primary dark:text-accent">{dict.reader.storyLabel}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{stories[0]!.title}</p>
        </div>
      )}
    </article>
  );
}
