import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { prayerLabels } from "@/lib/prayer-labels";
import { PrayerTimesWidget } from "@/components/PrayerTimesWidget";
import { RadioQoriWidget } from "@/components/RadioQoriWidget";
import { InstallAppButton } from "@/components/InstallAppButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = prayerLabels(locale);
  return {
    title: `${t.title} — ULYAH.COM`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/jadwal-sholat` },
    // A separate manifest (distinct "id") from the site's main app, so this
    // page can be installed as its own standalone reminder app rather than
    // only being reachable inside the full ULYAH.COM app shell.
    manifest: "/manifest-sholat.json",
  };
}

export default async function JadwalSholatPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = prayerLabels(locale);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl">🕌 {t.title}</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
            <InstallAppButton />
            {t.installStandalone}
          </div>
        </div>

        <div className="mt-6">
          <PrayerTimesWidget locale={locale} />
        </div>

        {/* The live Radio Qori Dunia keeps running here too — this page is
            meant to work as a standalone "always-on" reminder app, not just
            a prayer-time lookup. */}
        <div className="mt-6">
          <RadioQoriWidget locale={locale} />
        </div>
      </div>
    </div>
  );
}
