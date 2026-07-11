import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { NarrateButton } from "@/components/NarrateButton";
import { api } from "@/lib/api";

// Without this, Next statically prerenders this page once at build time
// (this route has no dynamic segments and the locale layout's
// generateStaticParams makes it a static-generation candidate) — the
// founder-photo lookup below would be baked into that one build forever,
// so an admin uploading a new photo via Portal Admin -> Media would never
// see it appear here until the next deploy. Revalidating every 5 minutes
// keeps the "no redeploy needed" promise MediaTab.tsx makes to the admin.
export const revalidate = 300;

// The family behind Ulyah — proper nouns, reproduced faithfully as given.
// Photos are admin-uploaded (Portal Admin -> Media), never hardcoded — see
// lib/media.ts / GET /content/media/:key. mediaKey is null-safe: until an
// admin uploads a photo, the card simply shows no image.
const FOUNDERS = [
  { name: "Yusron Efendi", lineage: "bin H. Mursyidi", mediaKey: "founder_yusron_photo" },
  { name: "Ulyah Munayah", lineage: "binti H. Moch. Hilwani", mediaKey: "founder_ulyah_photo" },
];
const CHILDREN = [
  "Kultsum Nurunnajah Efendi",
  "Ahmad Muhayyal Fatah Al Hasan Efendi",
  "Ahmad Muhayyal Fathir Al Husein Efendi",
  "Ahmad Yafiq Mumtaz Efendi",
  "Ahmad Yaser Ulya Efendi",
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  return {
    title: `${dict.syukur.title} — ${dict.common.siteName}`,
    description: dict.syukur.subtitle,
    alternates: { canonical: `/${locale}/syukur` },
  };
}

export default async function SyukurPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const s = dict.syukur;

  let mediaSet: Record<string, boolean> = {};
  try {
    const res = await api.get<{ media: Record<string, boolean> }>("/content/media-status");
    mediaSet = res.media;
  } catch {
    mediaSet = {};
  }

  return (
    <div className="relative overflow-hidden">
      {/* Elegant dark hero */}
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
          <p className="font-arabic text-4xl text-accent sm:text-5xl">الْحَمْدُ لِلّٰهِ</p>
          <h1 className="mt-5 font-heading text-3xl sm:text-4xl">{s.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#f4efe3]/80 sm:text-base">{s.subtitle}</p>
          <div className="mt-8 flex justify-center">
            <NarrateButton paragraphs={[s.intro, s.dua]} listenLabel={s.listen} stopLabel={s.stop} lang={locale} />
          </div>
        </div>
      </section>

      {/* Gratitude prose */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-lg leading-loose text-[var(--color-text-primary)] sm:text-xl">{s.intro}</p>
        </div>
      </section>

      {/* Family */}
      <section className="bg-[var(--color-surface)] px-4 py-16 dark:bg-white/[0.03] sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-2xl">{s.familyTitle}</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{s.foundersLabel}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {FOUNDERS.map((f) => (
              <div key={f.name} className="rounded-2xl border border-accent/30 bg-[var(--color-card)] p-6">
                {mediaSet[f.mediaKey] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${api.base}/content/media/${f.mediaKey}`}
                    alt={f.name}
                    className="mx-auto mb-4 h-28 w-28 rounded-full border-2 border-accent/40 object-cover shadow-md"
                  />
                )}
                <p className="font-heading text-xl text-primary dark:text-accent">{f.name}</p>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{f.lineage}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm font-semibold text-accent">{s.childrenLabel}</p>
          <ol className="mx-auto mt-4 max-w-md space-y-2 text-left">
            {CHILDREN.map((c, i) => (
              <li
                key={c}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-medium text-accent">
                  {i + 1}
                </span>
                <span className="text-sm">{c}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing du'a */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-accent/30 bg-gradient-to-b from-accent/10 to-transparent p-8 text-center">
          <p className="font-arabic text-2xl text-accent">اللّٰهُمَّ آمِيْن</p>
          <p className="mt-4 text-base leading-loose text-[var(--color-text-primary)]">{s.dua}</p>
          <div className="mt-6 flex justify-center">
            <NarrateButton paragraphs={[s.dua]} listenLabel={s.listen} stopLabel={s.stop} lang={locale} />
          </div>
        </div>
      </section>

      {/* Karya Abadi — perpetual dedication */}
      <section className="relative overflow-hidden bg-[#06251b] px-4 py-20 text-center text-[#f4efe3] sm:px-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 0%, rgba(184,137,43,0.6), transparent 60%), url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0l8 22 22 8-22 8-8 22-8-22-22-8 22-8z' fill='%23B8892B' fill-opacity='0.15'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl text-accent sm:text-4xl">{s.karyaAbadiTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#f4efe3]/85 sm:text-base">
            {s.karyaAbadiIntro}
          </p>

          <blockquote className="mx-auto mt-8 max-w-lg border-l-2 border-accent/50 pl-5 text-left text-sm italic leading-relaxed text-[#f4efe3]/75 sm:text-base">
            “{s.karyaAbadiQuote}”
          </blockquote>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-[#f4efe3]/85 sm:text-base">
            {s.karyaAbadiDedicationIntro}
          </p>

          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-accent/30 bg-white/[0.03] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {s.karyaAbadiDedicationLabel}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#f4efe3]/85 sm:text-base">
              {s.karyaAbadiDedicationBody}
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-lg text-sm italic leading-relaxed text-[#f4efe3]/70">
            {s.karyaAbadiClosing}
          </p>

          <p dir="rtl" className="font-arabic mt-6 text-xl text-accent sm:text-2xl">
            {s.karyaAbadiDua}
          </p>

          <p className="mt-8 text-[11px] uppercase tracking-[0.15em] text-[#f4efe3]/50">{s.karyaAbadiFeatures}</p>
        </div>
      </section>
    </div>
  );
}
