import Link from "next/link";
import Image from "next/image";
import type { Dictionary } from "@/dictionaries";
import { ShareButtons } from "@/components/ShareButtons";
import { contactLabels } from "@/lib/contact-labels";
import { navLabels } from "@/lib/nav-labels";
import { TENANT } from "@/lib/tenant";

/**
 * Footer columns mirror the header's grouped navigation exactly (both read
 * lib/nav-labels.ts) — one place to add a page, zero chance of the two
 * drifting apart. The extra "Informasi/Bantuan" column keeps the pages that
 * deliberately live only down here (privacy, donate, contact, accounts).
 */
export function Footer({ locale, dict }: { locale: string; dict: Dictionary }) {
  const nav = navLabels(locale);

  return (
    <footer className="border-t border-[var(--color-border)] bg-primary-dark bg-primary px-4 py-12 text-[#f4efe3] sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 desktop:grid-cols-6">
        <div className="sm:col-span-2 desktop:col-span-2">
          <div className="flex items-center gap-2.5">
            <Image src={TENANT.logoIcon} alt="" width={38} height={38} className="rounded-[9px] shadow-[var(--shadow-gold)]" />
            {TENANT.wordmarkGold ? (
              /* Footer is always the dark-green brand background, so the
                 pure-gold wordmark (not the theme-aware pair) always applies. */
              <Image src={TENANT.wordmarkGold} alt={TENANT.siteName} width={138} height={38} className="h-[34px] w-auto" />
            ) : (
              <span className="font-heading text-xl font-semibold tracking-wide text-accent">{TENANT.siteName}</span>
            )}
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

        {nav.groups.map((g) => (
          <div key={g.key}>
            <p className="text-sm font-semibold text-accent">
              {g.icon} {g.label}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
              {g.items.map((it) => (
                <li key={it.path}>
                  <Link href={`/${locale}${it.path}`} className="transition hover:text-accent">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 border-t border-[#f4efe3]/10 pt-8 sm:grid-cols-2 desktop:grid-cols-4">
        <div>
          <p className="text-sm font-semibold text-accent">{dict.footer.info}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
            <li><Link href={`/${locale}/tentang`} className="transition hover:text-accent">{dict.nav.about}</Link></li>
            <li><Link href={`/${locale}/syukur`} className="transition hover:text-accent">{dict.syukur.navLabel}</Link></li>
            <li><Link href={`/${locale}/terima-kasih`} className="transition hover:text-accent">{dict.nav.thanks}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">{contactLabels(locale).navLabel}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
            <li><Link href={`/${locale}/kontak`} className="transition hover:text-accent">{contactLabels(locale).navLabel}</Link></li>
            <li><Link href={`/${locale}/tanya`} className="transition hover:text-accent">Tanya AI</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">{dict.auth.loginTitle}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
            <li><Link href={`/${locale}/daftar`} className="transition hover:text-accent">{dict.auth.registerTitle}</Link></li>
            <li><Link href={`/${locale}/masuk`} className="transition hover:text-accent">{dict.auth.loginTitle}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-accent">{dict.footer.help}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#f4efe3]/80">
            <li><Link href={`/${locale}/donasi`} className="transition hover:text-accent">{dict.nav.donate}</Link></li>
            <li><Link href={`/${locale}/kebijakan-privasi`} className="transition hover:text-accent">{dict.footer.privacyPolicy}</Link></li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-7xl text-xs text-[#f4efe3]/50">{dict.footer.rights}</p>
    </footer>
  );
}
