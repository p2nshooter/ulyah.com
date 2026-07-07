import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { QuranReaderWidget } from "@/components/QuranReaderWidget";
import { DonationButtons } from "@/components/DonationButtons";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  const featureIcons: [string, string][] = [
    ["📖", dict.featureIcons.quranComplete],
    ["🗒️", dict.featureIcons.tafsirTranslation],
    ["📜", dict.featureIcons.asbabunNuzul],
    ["🎙️", dict.featureIcons.storiesWisdom],
    ["🔊", dict.featureIcons.qualityAudio],
  ];

  const stats: [string, string][] = [
    [dict.stats.surah, dict.stats.surahLabel],
    [dict.stats.ayat, dict.stats.ayatLabel],
    [dict.stats.qari, dict.stats.qariLabel],
    [dict.stats.trusted, dict.stats.trustedLabel],
    [dict.stats.free, dict.stats.freeLabel],
  ];

  const explore: [string, { title: string; desc: string; cta: string }, string][] = [
    ["🎧", dict.explore.audiobook, `/${locale}/audiobook`],
    ["📗", dict.explore.kitab, `/${locale}/kitab`],
    ["🕌", dict.explore.kisah, `/${locale}/kisah`],
    ["🗓️", dict.explore.daily, `/${locale}/harian`],
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary px-4 py-16 text-[#f4efe3] sm:px-6 desktop:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 desktop:grid-cols-2">
          <div>
            <h1 className="font-heading text-3xl leading-tight sm:text-4xl desktop:text-5xl">
              {dict.hero.titleLine1}
              <br />
              <span className="text-accent">{dict.hero.titleLine2}</span>
              <br />
              {dict.hero.titleLine3}
            </h1>
            <p className="mt-5 max-w-xl text-sm text-[#f4efe3]/80 sm:text-base">{dict.hero.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${locale}/quran`} className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white">
                ▶ {dict.hero.ctaPrimary}
              </Link>
              <Link
                href={`/${locale}/quran`}
                className="rounded-full border border-[#f4efe3]/40 px-6 py-3 text-sm font-medium"
              >
                {dict.hero.ctaSecondary}
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-5">
              {featureIcons.map(([icon, label]) => (
                <div key={label} className="text-center">
                  <div className="text-xl">{icon}</div>
                  <p className="mt-1 text-[11px] text-[#f4efe3]/70">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="rounded-2xl border border-[#f4efe3]/15 bg-white/5 p-6">
            <p className="font-heading text-lg italic text-accent">{dict.hero.quote}</p>
            <cite className="mt-3 block text-xs text-[#f4efe3]/60 not-italic">{dict.hero.quoteSource}</cite>
          </blockquote>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-primary-dark bg-[#06251b] px-4 py-6 text-[#f4efe3] sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-5">
          {stats.map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="font-heading text-xl text-accent sm:text-2xl">{value}</p>
              <p className="text-[11px] text-[#f4efe3]/70">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Qur'an reader */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-heading text-2xl sm:text-3xl">{dict.reader.sectionTitle}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--color-text-secondary)]">
            {dict.reader.sectionSubtitle}
          </p>
          <div className="mt-8">
            {/* No downloads and no hadith block on the landing preview by design — full detail lives on /quran */}
            <QuranReaderWidget locale={locale} dict={dict} showHadits={false} compact />
          </div>
          <div className="mt-4 text-center">
            <Link href={`/${locale}/quran`} className="text-sm font-medium text-accent hover:underline">
              {dict.reader.viewAllSurah} →
            </Link>
          </div>
        </div>
      </section>

      {/* Explore cards */}
      <section className="bg-[var(--color-surface)] px-4 py-14 dark:bg-white/[0.03] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-heading text-2xl sm:text-3xl">{dict.explore.title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--color-text-secondary)]">
            {dict.explore.subtitle}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 desktop:grid-cols-4">
            {explore.map(([icon, item, href]) => (
              <div key={item.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
                <div className="text-2xl">{icon}</div>
                <p className="mt-3 font-heading text-lg">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
                <Link href={href} className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl sm:text-3xl">{dict.donation.title}</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{dict.donation.subtitle}</p>
          <div className="mt-8">
            <DonationButtons dict={dict} />
          </div>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">{dict.donation.voluntaryNote}</p>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-4 mb-14 rounded-3xl bg-primary px-6 py-10 text-center text-[#f4efe3] sm:mx-6">
        <h2 className="font-heading text-2xl sm:text-3xl">{dict.ctaBanner.title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#f4efe3]/80">{dict.ctaBanner.desc}</p>
        <Link
          href={`/${locale}/quran`}
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-white"
        >
          ▶ {dict.ctaBanner.button}
        </Link>
        <p className="mt-3 text-xs text-[#f4efe3]/60">{dict.ctaBanner.note}</p>
      </section>
    </div>
  );
}
