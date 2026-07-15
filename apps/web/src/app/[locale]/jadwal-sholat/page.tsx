import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
    // only being reachable inside the full ULYAH.COM app shell. Dynamic route
    // (not the old static file) so start_url matches the visitor's actual
    // locale and scope is always spec-valid — see route.ts for why.
    manifest: `/manifest-sholat.webmanifest?locale=${locale}`,
  };
}

export default async function JadwalSholatPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ install?: string }>;
}) {
  const { locale: raw } = await params;
  const { install } = await searchParams;
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
          <div className="flex flex-col items-end gap-1.5">
            <InstallAppButton app="sholat" labeled autoPrompt={install === "1"} />
            <span className="text-xs text-[var(--color-text-secondary)]">{t.installStandalone}</span>
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

        {/* Standalone-app users have no browser address bar to remind them
            whose app this is — this card carries that identity itself, and
            invites them toward the full ULYAH.COM experience too. */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-[#06251b] p-8 text-center text-[#f4efe3]">
          <Image
            src="/brand/wordmark-ar-gold.png"
            alt="Ulyah"
            width={160}
            height={44}
            className="mx-auto h-9 w-auto"
          />
          <p className="mt-3 text-xs uppercase tracking-[0.3em] text-accent">ulyah.com</p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#f4efe3]/80">{t.brandTagline}</p>
          <Link
            href={`/${locale}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
          >
            {t.brandCta}
          </Link>
        </div>

        <div className="mt-6">
        </div>
      </div>
    </div>
  );
}
