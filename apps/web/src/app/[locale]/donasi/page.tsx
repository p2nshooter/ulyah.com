import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { DonationButtons } from "@/components/DonationButtons";
import { ApiKeyDonationForm } from "@/components/ApiKeyDonationForm";
import { CryptoDonationSection } from "@/components/CryptoDonationSection";
import { DonationVirtues } from "@/components/DonationVirtues";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.donation.title}`,
    description: dict.donation.subtitle,
    alternates: { canonical: `/${locale}/donasi` },
  };
}

export default async function DonasiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const impact: [string, string][] = [
    ["🖥️", dict.donation.impactServer],
    ["🧠", dict.donation.impactAiGpu],
    ["✍️", dict.donation.impactContent],
    ["🔓", dict.donation.impactAccess],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">{dict.donation.title}</h1>
      <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">{dict.donation.subtitle}</p>

      <div className="mt-8 grid grid-cols-2 gap-3 desktop:grid-cols-4">
        {impact.map(([icon, label]) => (
          <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
            <div className="text-xl">{icon}</div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <DonationVirtues dict={dict} locale={locale} />
      </div>

      <div className="mt-10">
        <DonationButtons dict={dict} />
      </div>

      <div className="mt-12">
        <CryptoDonationSection dict={dict} locale={locale} />
      </div>

      <div className="mt-12">
        <ApiKeyDonationForm dict={dict} />
      </div>

      <p className="mt-8 text-center text-xs text-[var(--color-text-secondary)]">{dict.donation.voluntaryNote}</p>
    </div>
  );
}
