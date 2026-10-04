import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { legalLabels, LEGAL_ROUTES, type LegalKey } from "@/lib/legal-pages";
import { routePath } from "@/lib/paths";

/** Metadata for one of the four legal pages (lib/legal-pages.ts). */
export async function legalMetadata(key: LegalKey, params: Promise<{ locale: string }>): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = legalLabels(key, locale);
  return { title: t.title, description: t.intro, alternates: { canonical: routePath(locale, LEGAL_ROUTES[key]) } };
}

/** The page itself: same layout as the privacy policy. */
export async function LegalPage({ pageKey, params }: { pageKey: LegalKey; params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = legalLabels(pageKey, locale);
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{t.title}</h1>
      <p className="mt-2 text-xs text-text-secondary">{t.lastUpdated}</p>
      <p className="mt-6 text-[15px] leading-relaxed text-text-primary">{t.intro}</p>
      <div className="mt-10 space-y-8">
        {t.sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-heading text-lg text-primary dark:text-accent">{s.heading}</h2>
            <div className="mt-2 space-y-2">
              {s.body.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-text-secondary">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
