"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { pwaLabels } from "@/lib/pwa-labels";
import { InstallAppButton } from "@/components/InstallAppButton";

const INSTALLED_KEY = "ulyah_pwa_installed";

/**
 * One card in the "Download App" section. Checks install state itself
 * (localStorage is origin-scoped, so a flag set from /jadwal-sholat is
 * readable from the homepage and vice versa — each card can tell whether
 * *the other* app is already installed, not just itself). Once an app is
 * installed, its card shrinks to just the brand mark and a quiet
 * confirmation instead of repeating a pitch for something already on the
 * visitor's home screen.
 */
export function AppInstallCard({
  locale,
  app,
  icon,
  name,
  desc,
  cta,
}: {
  locale: string;
  app: "main" | "sholat";
  icon: string;
  name: string;
  desc: string;
  cta: React.ReactNode;
}) {
  const t = pwaLabels(locale);
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const flagged = window.localStorage.getItem(`${INSTALLED_KEY}_${app}`) === "1";
    // If we're currently running standalone (already installed as *some*
    // app) and the manifest actually linked on this page matches this
    // card's app, that confirms it beyond the flag alone.
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const manifestHref = document.querySelector('link[rel="manifest"]')?.getAttribute("href") ?? "";
    const manifestMatches = app === "sholat" ? manifestHref.includes("sholat") : !manifestHref.includes("sholat");
    setInstalled(flagged || (standalone && manifestMatches));
  }, [app]);

  return (
    <div className="card-premium flex flex-col items-start gap-3 p-6">
      <Image
        src="/brand/wordmark-ar.png"
        alt="Ulyah"
        width={110}
        height={30}
        className="block h-6 w-auto dark:hidden"
      />
      <Image
        src="/brand/wordmark-ar-gold.png"
        alt="Ulyah"
        width={110}
        height={30}
        className="hidden h-6 w-auto dark:block"
      />
      {installed ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          {icon} {name} · <span className="text-success">✓ {t.installedBadge}</span>
        </p>
      ) : (
        <>
          <p className="font-heading text-lg">
            {icon} {name}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">{desc}</p>
          {cta}
        </>
      )}
    </div>
  );
}

export function MainAppInstallCard({ locale }: { locale: string }) {
  const t = pwaLabels(locale);
  return (
    <AppInstallCard
      locale={locale}
      app="main"
      icon="🕋"
      name={t.mainAppName}
      desc={t.mainAppDesc}
      cta={<InstallAppButton app="main" labeled />}
    />
  );
}

export function SholatAppInstallCard({ locale }: { locale: string }) {
  const t = pwaLabels(locale);
  return (
    <AppInstallCard
      locale={locale}
      app="sholat"
      icon="🕌"
      name={t.sholatAppName}
      desc={t.sholatAppDesc}
      cta={
        <Link
          href={`/${locale}/jadwal-sholat`}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
        >
          {t.sholatAppCta}
        </Link>
      }
    />
  );
}
