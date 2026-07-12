import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { hijriCalendarLabels } from "@/lib/hijri-calendar-labels";
import { HijriCalendar } from "@/components/HijriCalendar";
import { AdSlot } from "@/components/AdSlot";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = hijriCalendarLabels(locale);
  return {
    title: `${t.title} — ULYAH.COM`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/kalender-hijriyah` },
  };
}

export default async function HijriCalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = hijriCalendarLabels(locale);

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">📅 {t.title}</h1>
      <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>

      <AdSlot position="hijri-top" />

      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <HijriCalendar locale={locale} />
      </div>
    </div>
  );
}
