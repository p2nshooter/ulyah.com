import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";

export default async function TentangPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="font-heading text-3xl">{dict.nav.about}</h1>
      <div className="prose prose-sm mt-6 space-y-4 text-[15px] leading-relaxed text-[var(--color-text-primary)]">
        <p>{dict.hero.description}</p>
        <p>{dict.donation.subtitle}</p>
        <p>{dict.ctaBanner.note}</p>
      </div>
    </div>
  );
}
