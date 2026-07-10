import Link from "next/link";
import { pwaLabels } from "@/lib/pwa-labels";
import { InstallAppButton } from "@/components/InstallAppButton";

/**
 * The explicit, permanent "where do I download the app" pointer requested
 * alongside the quiet header icon (InstallAppButton on its own is easy to
 * miss) — a dedicated section naming both installable PWAs so visitors don't
 * have to guess. `id="download-app"` gives the footer link something to jump to.
 *
 * The Jadwal Sholat card links to /jadwal-sholat rather than installing
 * directly from here: the browser's install prompt always installs whichever
 * manifest is linked in the CURRENT page's <head>, and only the
 * /jadwal-sholat route itself overrides that to manifest-sholat.json — an
 * install button here would silently install the main app under the wrong
 * label.
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
          <div className="card-premium flex flex-col items-start gap-3 p-6">
            <p className="font-heading text-lg">🕋 {t.mainAppName}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{t.mainAppDesc}</p>
            <InstallAppButton app="main" labeled />
          </div>
          <div className="card-premium flex flex-col items-start gap-3 p-6">
            <p className="font-heading text-lg">🕌 {t.sholatAppName}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{t.sholatAppDesc}</p>
            <Link
              href={`/${locale}/jadwal-sholat`}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
            >
              {t.sholatAppCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
