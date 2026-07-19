import Image from "next/image";
import { pwaLabels } from "@/lib/pwa-labels";
import { TENANT } from "@/lib/tenant";
import { MainAppInstallCard } from "@/components/AppInstallCard";

/**
 * The explicit, permanent "where do I download the app" pointer — a
 * dedicated section for the site's ONE installable app (the main app in the
 * header; per owner instruction there are no separate mini-apps).
 * `id="download-app"` gives the footer link something to jump to. The banner
 * above the heading is each tenant's own brand mark — a sibling site never
 * shows Ulyah branding.
 */
export function DownloadAppSection({ locale }: { locale: string }) {
  const t = pwaLabels(locale);
  const banner = TENANT.id === "ulyah" ? "/brand/wordmark-banner.webp" : TENANT.logoBanner;

  return (
    <section id="download-app" className="scroll-mt-20 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {banner && (
          <Image
            src={banner}
            alt={TENANT.siteName}
            width={1200}
            height={800}
            className="mx-auto mb-6 h-auto w-full max-w-[280px] rounded-2xl shadow-md"
          />
        )}
        <h2 className="text-center font-heading text-2xl sm:text-3xl">{t.downloadSectionTitle}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--color-text-secondary)]">
          {t.downloadSectionSubtitle}
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <MainAppInstallCard locale={locale} />
        </div>
      </div>
    </section>
  );
}
