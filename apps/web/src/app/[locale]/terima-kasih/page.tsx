import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { thanksLabels } from "@/lib/thanks-labels";
import { NarrateButton } from "@/components/NarrateButton";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = thanksLabels(locale);
  return {
    title: `${t.title}`,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/terima-kasih` },
  };
}

export default async function TerimaKasihPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const t = thanksLabels(locale);

  const narratable = [t.intro, ...t.sections.flatMap((s) => s.body), t.closingDua];

  return (
    <div className="relative overflow-hidden">
      {/* Dark hero, matching /syukur's gratitude register */}
      <section className="relative bg-[#06251b] px-4 py-20 text-center text-[#f4efe3] sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(184,137,43,0.6), transparent 60%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0l8 22 22 8-22 8-8 22-8-22-22-8 22-8z' fill='%23B8892B' fill-opacity='0.15'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <p className="font-arabic text-3xl text-accent sm:text-4xl">جَزَاكُمُ اللّٰهُ خَيْرًا</p>
          <h1 className="mt-5 font-heading text-3xl sm:text-4xl">{t.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#f4efe3]/80 sm:text-base">
            {t.subtitle}
          </p>
          <div className="mt-8 flex justify-center">
            <NarrateButton
              paragraphs={narratable}
              listenLabel={dict.syukur.listen}
              stopLabel={dict.syukur.stop}
              lang={locale}
            />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-lg leading-loose text-[var(--color-text-primary)] sm:text-xl">{t.intro}</p>
        </div>
      </section>

      {/* Sections */}
      <div className="space-y-0">
        {t.sections.map((s, i) => (
          <section
            key={s.heading}
            className={`px-4 py-14 sm:px-6 ${i % 2 === 1 ? "bg-[var(--color-surface)] dark:bg-white/[0.03]" : ""}`}
          >
            <div className="mx-auto max-w-2xl">
              <h2 className="text-center font-heading text-2xl text-primary dark:text-accent">{s.heading}</h2>
              <div className="mt-5 space-y-4">
                {s.body.map((p, j) => (
                  <p key={j} className="text-sm leading-relaxed text-[var(--color-text-secondary)] sm:text-base">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Closing du'a */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/10 to-transparent p-8 text-center">
          <p className="font-arabic text-2xl text-accent">اللّٰهُمَّ آمِيْن</p>
          <p className="mt-4 text-base leading-loose text-[var(--color-text-primary)]">{t.closingDua}</p>
        </div>
      </section>
    </div>
  );
}
