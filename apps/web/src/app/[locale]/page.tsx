import Link from "next/link";
import Image from "next/image";
import { TENANT } from "@/lib/tenant";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { QuranReaderWidget } from "@/components/QuranReaderWidget";
import { RadioQoriWidget } from "@/components/RadioQoriWidget";
import { PrayerTimesWidget } from "@/components/PrayerTimesWidget";

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  // Quick-access tiles — each links straight to the feature it names, so the
  // hero row doubles as real navigation instead of being purely decorative.
  const featureIcons: [string, string, string][] = [
    ["📖", dict.featureIcons.quranComplete, `/${locale}/quran`],
    ["📝", dict.featureIcons.tafsirTranslation, `/${locale}/quran`],
    ["📜", dict.featureIcons.asbabunNuzul, `/${locale}/quran`],
    ["🕌", dict.featureIcons.haditsSupport, `/${locale}/hadits`],
    ["📗", dict.featureIcons.kitabLibrary, `/${locale}/kitab`],
    ["✨", dict.featureIcons.storiesWisdom, `/${locale}/kisah`],
    ["🕋", dict.featureIcons.prayerSchedule, `/${locale}/jadwal-sholat`],
    ["🎙️", dict.featureIcons.qualityAudio, `/${locale}/audiobook`],
    ["💰", dict.featureIcons.zakatCalculator, `/${locale}/zakat`],
    ["🧭", dict.featureIcons.qiblaDirection, `/${locale}/kiblat`],
    ["📅", dict.featureIcons.hijriCalendar, `/${locale}/kalender-hijriyah`],
    ["👪", dict.featureIcons.warisCalculator, `/${locale}/waris`],
    ["🌙", dict.featureIcons.imsakiyahRamadhan, `/${locale}/imsakiyah`],
    ["💬", dict.featureIcons.aiChat, `/${locale}/tanya`],
  ];

  const stats: [string, string, string][] = [
    ["📖", dict.stats.surah, dict.stats.surahLabel],
    ["✦", dict.stats.ayat, dict.stats.ayatLabel],
    ["🎙️", dict.stats.qari, dict.stats.qariLabel],
    ["✓", dict.stats.trusted, dict.stats.trustedLabel],
    ["♥", dict.stats.free, dict.stats.freeLabel],
  ];

  const explore: [string, { title: string; desc: string; cta: string }, string][] = [
    ["🎧", dict.explore.audiobook, `/${locale}/audiobook`],
    ["📗", dict.explore.kitab, `/${locale}/kitab`],
    ["🕌", dict.explore.kisah, `/${locale}/kisah`],
    ["🗓️", dict.explore.daily, `/${locale}/harian`],
  ];

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="pattern-islamic bg-[var(--color-bg)] px-4 pb-10 pt-12 sm:px-6 desktop:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 desktop:grid-cols-2">
          <div className="hero-entrance">
            <h1 className="font-heading text-4xl leading-[1.15] tracking-tight sm:text-5xl desktop:text-6xl">
              {dict.hero.titleLine1}
              <br />
              <span className="text-primary dark:text-accent">{dict.hero.titleLine2}</span>
              <br />
              {dict.hero.titleLine3}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
              {dict.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/quran`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110 dark:bg-accent dark:text-primary"
              >
                ▶ {dict.hero.ctaPrimary}
              </Link>
              <Link
                href={`/${locale}/quran`}
                className="rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-medium transition hover:border-accent"
              >
                {dict.hero.ctaSecondary}
              </Link>
            </div>
            <div className="reveal-stagger mt-10 grid grid-cols-4 gap-y-5">
              {featureIcons.map(([icon, label, href]) => (
                <Link key={label} href={href} className="group text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl border border-accent/30 bg-accent/5 text-lg transition group-hover:border-accent group-hover:bg-accent/15">
                    {icon}
                  </div>
                  <p className="mx-auto mt-1.5 max-w-[72px] text-[10px] leading-tight text-[var(--color-text-secondary)] transition group-hover:text-accent">
                    {label}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quote + brand visual */}
          <div className="hero-entrance relative" style={{ animationDelay: "180ms" }}>
            <div className="overflow-hidden rounded-3xl bg-[#06251b] p-8 text-[#f4efe3] shadow-2xl">
              <blockquote>
                <span className="font-heading text-5xl leading-none text-accent">“</span>
                <p className="mt-2 font-heading text-xl leading-relaxed italic text-[#f4efe3]">{dict.hero.quote}</p>
                <cite className="mt-3 block text-xs not-italic text-accent">{dict.hero.quoteSource}</cite>
              </blockquote>
              <div className="mt-6 flex justify-center">
                <Image
                  src={TENANT.id === "ulyah" ? "/brand/ulyah-logo-dark.webp" : TENANT.logoIcon}
                  alt={TENANT.siteName}
                  width={640}
                  height={640}
                  priority
                  className="h-auto w-full max-w-[300px] rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="bg-[#06251b] px-4 py-7 text-[#f4efe3] sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 sm:grid-cols-5">
          {stats.map(([icon, value, label]) => (
            <div key={label} className="flex items-center justify-center gap-3">
              <span className="text-xl text-accent">{icon}</span>
              <div>
                <p className="font-heading text-xl leading-none text-accent sm:text-2xl">{value}</p>
                <p className="mt-1 text-[11px] text-[#f4efe3]/70">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ── Radio Qori Dunia — always-on world reciters stream ─ */}
      <section className="px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <RadioQoriWidget locale={locale} />
        </div>
      </section>

      {/* ── Jadwal Sholat — IP-locked prayer times, Hijri countdown ─ */}
      <section className="px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <PrayerTimesWidget locale={locale} />
        </div>
      </section>

      {/* ── Interactive Qur'an reader ────────────────────────── */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="section-divider mb-4"><span>✿</span></div>
          <h2 className="text-center font-heading text-2xl sm:text-3xl">{dict.reader.sectionTitle}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--color-text-secondary)]">
            {dict.reader.sectionSubtitle}
          </p>
          <div className="mt-8">
            <QuranReaderWidget locale={locale} dict={dict} />
          </div>
          <div className="mt-6 text-center">
            <Link
              href={`/${locale}/quran`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {dict.reader.viewAllSurah} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Explore cards ────────────────────────────────────── */}
      <section className="bg-[var(--color-surface)] px-4 py-16 dark:bg-white/[0.03] sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="section-divider mb-4"><span>✿</span></div>
          <h2 className="text-center font-heading text-2xl sm:text-3xl">{dict.explore.title}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--color-text-secondary)]">
            {dict.explore.subtitle}
          </p>
          <div className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-2 desktop:grid-cols-4">
            {explore.map(([icon, item, href]) => (
              <Link key={item.title} href={href} className="card-premium group relative overflow-hidden p-6">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-2xl">{icon}</div>
                <p className="mt-4 font-heading text-lg">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.desc}</p>
                <span className="mt-3 inline-block text-sm font-medium text-accent group-hover:underline">
                  {item.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#06251b] px-6 py-14 text-center text-[#f4efe3]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at bottom, rgba(184,137,43,0.5), transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="font-heading text-2xl sm:text-3xl">{dict.ctaBanner.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[#f4efe3]/80">{dict.ctaBanner.desc}</p>
            <Link
              href={`/${locale}/quran`}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-medium text-primary shadow-lg transition hover:brightness-105"
            >
              ▶ {dict.ctaBanner.button}
            </Link>
            <p className="mt-4 text-xs text-[#f4efe3]/60">{dict.ctaBanner.note}</p>
          </div>
        </div>
      </section>

    </div>
  );
}
