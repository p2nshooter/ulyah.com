import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/dictionaries";
import { ShareButtons } from "@/components/ShareButtons";
import { pwaLabels } from "@/lib/pwa-labels";
import { contactLabels } from "@/lib/contact-labels";

export function Footer({ locale, dict }: { locale: string; dict: Dictionary }) {
  return (
    <footer className="border-t border-[var(--color-border)] bg-primary-dark bg-primary px-4 py-12 text-[#f4efe3] sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 desktop:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="" width={38} height={38} className="rounded-[9px] shadow-[var(--shadow-gold)]" />
            {/* Footer is always the dark-green brand background, so the
                pure-gold wordmark (not the theme-aware pair) always applies. */}
            <Image src="/brand/wordmark-ar-gold.png" alt="Ulyah" width={138} height={38} className="h-[34px] w-auto" />
          </div>
          <p className="mt-2 text-xs text-[#f4efe3]/50">{dict.common.tagline}</p>
          <p className="mt-3 max-w-xs text-sm text-[#f4efe3]/70">{dict.footer.desc}</p>
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-accent">{dict.footer.followUs}</p>
            <ShareButtons
              url={`https://ulyah.com/${locale}`}
              title={`${dict.common.siteName} — ${dict.common.tagline}`}
              copyLabel={dict.crypto.copy}
              copiedLabel={dict.crypto.copied}
              compact
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">{dict.footer.platform}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
            <li><Link href={`/${locale}/quran`}>{dict.nav.quran}</Link></li>
            <li><Link href={`/${locale}/audiobook`}>{dict.nav.audiobook}</Link></li>
            <li><Link href={`/${locale}/kitab`}>{dict.nav.kitab}</Link></li>
            <li><Link href={`/${locale}/hadits`}>{dict.nav.hadits}</Link></li>
            <li><Link href={`/${locale}/kisah`}>{dict.nav.kisah}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">{dict.footer.info}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
            <li><Link href={`/${locale}/tentang`}>{dict.nav.about}</Link></li>
            <li><Link href={`/${locale}/syukur`}>{dict.syukur.navLabel}</Link></li>
            <li><Link href={`/${locale}/terima-kasih`}>{dict.nav.thanks}</Link></li>
            <li><Link href={`/${locale}/kontak`}>{contactLabels(locale).navLabel}</Link></li>
            <li><Link href={`/${locale}/daftar`}>{dict.auth.registerTitle}</Link></li>
            <li><Link href={`/${locale}/masuk`}>{dict.auth.loginTitle}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">{dict.footer.help}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
            <li><Link href={`/${locale}/donasi`}>{dict.nav.donate}</Link></li>
            <li><Link href={`/${locale}#download-app`}>{pwaLabels(locale).downloadSectionTitle}</Link></li>
            <li><Link href={`/${locale}/kebijakan-privasi`}>{dict.footer.privacyPolicy}</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-[#f4efe3]/50">{dict.footer.rights}</p>
    </footer>
  );
}
