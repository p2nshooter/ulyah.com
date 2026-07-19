import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { contactLabels } from "@/lib/contact-labels";
import { localePath } from "@/lib/paths";

const EMAIL = "salam@ulyah.com";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = contactLabels(locale);
  return {
    title: `${t.title}`,
    description: t.subtitle,
    alternates: { canonical: localePath(locale, `/kontak`) },
  };
}

export default async function KontakPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = contactLabels(locale);

  const otherLinks: [string, string][] = [
    [dict.nav.donate, `/${locale}/donasi`],
    [dict.nav.thanks, `/${locale}/terima-kasih`],
    [dict.footer.privacyPolicy, `/${locale}/kebijakan-privasi`],
    [dict.nav.about, `/${locale}/tentang`],
  ];

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">{t.title}</h1>
      <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">{t.subtitle}</p>

      <p className="mt-8 text-center text-[15px] leading-relaxed text-[var(--color-text-primary)]">{t.intro}</p>

      <div className="mt-8 rounded-2xl border border-accent/30 bg-[var(--color-card)] p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">{t.emailLabel}</p>
        <a
          href={`mailto:${EMAIL}`}
          className="mt-2 inline-block font-heading text-xl text-primary hover:underline dark:text-accent"
        >
          {EMAIL}
        </a>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">{t.responseNote}</p>

      {/* Dedication — the tone matches /syukur, kept brief for a contact page */}
      <div className="mt-10 rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/[0.06] to-transparent p-6 text-center">
        <p className="font-arabic text-xl text-accent">بِسْمِ اللّٰهِ</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {t.dedication}
        </p>
      </div>

      <div className="mt-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-secondary)]">
          {t.otherLinksLabel}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {otherLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm hover:border-accent hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
