"use client";

import { useParams } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { haditsLabels } from "@/lib/hadits-labels";

/**
 * The hadith pages throw when the API cannot answer (see hadits/page.tsx)
 * rather than render — and cache — an empty shelf. Where there is no earlier
 * good page to keep serving, this is what the reader sees: an honest
 * "try again", inside the site's own chrome, never "no hadith found".
 */
export default function HaditsError({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const raw = params?.locale ?? DEFAULT_LOCALE;
  const t = haditsLabels(isValidLocale(raw) ? raw : DEFAULT_LOCALE);
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <p className="text-4xl" aria-hidden>
        🕌
      </p>
      <h1 className="mt-4 font-heading text-2xl">{t.title}</h1>
      <p className="mt-3 text-sm text-text-secondary">{t.unavailable}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white dark:bg-accent dark:text-primary"
      >
        {t.retry}
      </button>
    </div>
  );
}
