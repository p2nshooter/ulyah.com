import { pwaLabels } from "@/lib/pwa-labels";
import { MainAppInstallCard, SholatAppInstallCard } from "@/components/AppInstallCard";

/**
 * The explicit, permanent "where do I download the app" pointer — a
 * dedicated section naming both installable PWAs so visitors don't have to
 * guess. `id="download-app"` gives the footer link something to jump to.
 * Each card carries the Arabic ULYAH mark and shrinks to a quiet "already
 * installed" state once that particular app is on the visitor's device, so
 * the two cards always point at whichever app is still missing.
 */
export function DownloadAppSection({ locale }: { locale: string }) {
  const t = pwaLabels(locale);

  return (
    <section id="download-app" className="scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-heading text-2xl sm:text-3xl">{t.downloadSectionTitle}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--color-text-secondary)]">
          {t.downloadSectionSubtitle}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <MainAppInstallCard locale={locale} />
          <SholatAppInstallCard locale={locale} />
        </div>
      </div>
    </section>
  );
}
