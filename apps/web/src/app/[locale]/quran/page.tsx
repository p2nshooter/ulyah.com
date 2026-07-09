import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { QuranReaderWidget } from "@/components/QuranReaderWidget";
import { AdSlot } from "@/components/AdSlot";

export default async function QuranPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-heading text-2xl sm:text-3xl">{dict.reader.allSurah}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{dict.reader.sectionSubtitle}</p>
        <div className="mt-6">
          <QuranReaderWidget locale={locale} dict={dict} />
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <AdSlot minHeight={110} />
        </div>
      </div>
    </div>
  );
}
