"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { TENANT } from "@/lib/tenant";
import { pwaLabels } from "@/lib/pwa-labels";
import { InstallAppButton } from "@/components/InstallAppButton";

/**
 * The "Download App" card for the site's ONE installable app (the main app
 * in the header — per owner instruction there are no separate mini-apps).
 * Only collapses to a quiet "already installed" confirmation when it can
 * positively confirm that *right now* — standalone display-mode, or Chrome's
 * getInstalledRelatedApps() where supported. A remembered localStorage flag
 * from a past visit was tried here first and caused a real bug: a
 * stale/incorrect flag permanently hid the card even when the app plainly
 * was not installed, with no way to recover.
 */
export function MainAppInstallCard({ locale }: { locale: string }) {
  const t = pwaLabels(locale);
  const [installed, setInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    // This card lives on the regular site, so `standalone` above is almost
    // never true here even when the app genuinely IS installed (the visitor
    // is just browsing this page in a normal tab, not the installed app's
    // window). Where Chrome supports it, ask it directly rather than always
    // showing the pitch for an app already on the device.
    const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> };
    nav.getInstalledRelatedApps?.()
      .then((related) => {
        if (related.length > 0) setInstalled(true);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="card-premium flex flex-col items-start gap-3 p-6">
      {TENANT.id === "ulyah" ? (
        <>
          <Image src="/brand/wordmark-ar.png" alt={TENANT.siteName} width={110} height={30} className="block h-6 w-auto dark:hidden" />
          <Image src="/brand/wordmark-ar-gold.png" alt={TENANT.siteName} width={110} height={30} className="hidden h-6 w-auto dark:block" />
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Image src={TENANT.logoIcon} alt={TENANT.siteName} width={32} height={32} className="h-8 w-8 rounded-lg" />
          <span className="font-heading text-base font-semibold text-accent">{TENANT.siteName}</span>
        </div>
      )}
      {installed ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          🕋 {t.mainAppName} · <span className="text-success">✓ {t.installedBadge}</span>
        </p>
      ) : (
        <>
          <p className="font-heading text-lg">🕋 {t.mainAppName}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">{t.mainAppDesc}</p>
          <InstallAppButton app="main" labeled />
        </>
      )}
    </div>
  );
}
