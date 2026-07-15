"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { pwaLabels } from "@/lib/pwa-labels";
import { InstallAppButton } from "@/components/InstallAppButton";

/**
 * One card in the "Download App" section. Only collapses to a quiet
 * "already installed" confirmation when it can positively confirm that
 * *right now* — standalone display-mode AND this exact page's manifest
 * matches this card's app. A remembered localStorage flag from a past visit
 * was tried here first and caused a real bug: a stale/incorrect flag (e.g.
 * from an interrupted install, or an app installed then later removed —
 * neither has a reliable browser event) permanently hid the card even when
 * the app plainly was not installed, with no way to recover. Showing the
 * pitch again to someone who already installed is a minor annoyance;
 * hiding the only way to install is not acceptable.
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
  app: "main" | "sholat" | "radio";
  icon: string;
  name: string;
  desc: string;
  cta: React.ReactNode;
}) {
  const t = pwaLabels(locale);
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const manifestHref = document.querySelector('link[rel="manifest"]')?.getAttribute("href") ?? "";
    const manifestMatches =
      app === "sholat"
        ? manifestHref.includes("sholat")
        : app === "radio"
          ? manifestHref.includes("radio")
          : !manifestHref.includes("sholat") && !manifestHref.includes("radio");
    setInstalled(standalone && manifestMatches);

    // This card lives on the regular site, so `standalone` above is almost
    // never true here even when the app genuinely IS installed (the visitor
    // is just browsing this page in a normal tab, not the installed app's
    // window). Where Chrome supports it, ask it directly rather than always
    // showing the pitch for an app already on the device.
    if (app === "main") {
      const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> };
      nav.getInstalledRelatedApps?.()
        .then((related) => {
          if (related.length > 0) setInstalled(true);
        })
        .catch(() => {});
    }
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
        // A plain <a> (not next/link) forces a full document reload, so the
        // browser starts fresh with manifest-sholat.json as the only
        // manifest it has ever seen in this tab — client-side navigation
        // between two different manifests is unreliable for getting
        // beforeinstallprompt to fire for the right one. ?install=1 tells
        // that page to fire the native prompt the instant it's ready.
        <a
          href={`/${locale}/jadwal-sholat?install=1`}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
        >
          {t.sholatAppCta}
        </a>
      }
    />
  );
}

export function RadioAppInstallCard({ locale }: { locale: string }) {
  const t = pwaLabels(locale);
  return (
    <AppInstallCard
      locale={locale}
      app="radio"
      icon="📻"
      name={t.radioAppName}
      desc={t.radioAppDesc}
      cta={
        // Same reasoning as the Jadwal Sholat card: a full document reload so
        // the tab sees manifest-radio.webmanifest as the only manifest, which
        // is what makes beforeinstallprompt fire for the right app.
        <a
          href={`/${locale}/radio?install=1`}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
        >
          {t.radioAppCta}
        </a>
      }
    />
  );
}
