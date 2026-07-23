import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";
import { localePath } from "@/lib/paths";
import { TAJWID_GUIDE, type GuideRule } from "@/lib/tajwid-guide";

// Self-contained page chrome (mushaf-labels pattern): Indonesian on ulyah.com,
// English as the fallback for every other locale — never leaks Indonesian.
const PAGE = {
  id: {
    title: "Panduan Tajwid Lengkap",
    subtitle:
      "Seluruh hukum tajwid — nun & mim sukun, mad, qalqalah, ghunnah, lam ta'rif, hukum ra, dan tanda waqaf — dengan definisi, huruf, cara membaca, dan contoh ayat.",
    legend: "Keterangan warna di Mushaf",
    coloredBadge: "Diwarnai di Mushaf",
    explainedBadge: "Dijelaskan saja",
    huruf: "Huruf",
    cara: "Cara membaca",
    contoh: "Contoh",
    tryTitle: "Coba langsung di Mushaf Utsmani",
    trySub: "Aktifkan tombol “Tajwid ✓” lalu ketuk huruf berwarna untuk penjelasannya.",
    tryCta: "Buka Mushaf",
    note: "Catatan",
  },
  en: {
    title: "Complete Tajwid Guide",
    subtitle:
      "Every tajwid rule — nun & mim sakinah, madd, qalqalah, ghunnah, the definite article, ra, and the waqf signs — with definitions, letters, how to read, and example verses.",
    legend: "Colour key used in the Mushaf",
    coloredBadge: "Coloured in the Mushaf",
    explainedBadge: "Explained only",
    huruf: "Letters",
    cara: "How to read",
    contoh: "Examples",
    tryTitle: "Try it live in the Uthmani Mushaf",
    trySub: "Turn on the “Tajwid ✓” button, then tap a coloured letter for its explanation.",
    tryCta: "Open the Mushaf",
    note: "Note",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const p = locale === "id" ? PAGE.id : PAGE.en;
  return {
    title: `${p.title} — ${TENANT.siteName}`,
    description: p.subtitle,
    alternates: { canonical: localePath(locale, `/quran/tajwid`) },
  };
}

export default async function TajwidGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const isId = locale === "id";
  const p = isId ? PAGE.id : PAGE.en;
  const tr = <T extends { id: string; en: string }>(o: T) => (isId ? o.id : o.en);

  const coloredRules: GuideRule[] = TAJWID_GUIDE.flatMap((g) => g.rules).filter((r) => r.colored && r.color);

  return (
    <div className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="hero-entrance font-heading text-2xl sm:text-3xl">{p.title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">{p.subtitle}</p>

        {/* Colour legend — every rule the Mushaf actually paints. */}
        <section className="card-premium mt-6 p-5">
          <h2 className="font-heading text-base">{p.legend}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {coloredRules.map((r) => (
              <span
                key={r.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1 text-xs"
              >
                <span aria-hidden className="h-3 w-3 rounded-full" style={{ backgroundColor: r.color }} />
                {tr(r.name)}
              </span>
            ))}
          </div>
        </section>

        {/* Each rule group as a section of cards. */}
        <div className="mt-8 space-y-10">
          {TAJWID_GUIDE.map((g) => (
            <section key={g.key}>
              <h2 className="font-heading text-xl text-accent">{tr(g.title)}</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{tr(g.intro)}</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {g.rules.map((r) => (
                  <article
                    key={r.key}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
                    style={r.colored && r.color ? { borderInlineStartWidth: 4, borderInlineStartColor: r.color } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-2 font-heading text-base">
                          {r.colored && r.color && (
                            <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
                          )}
                          {tr(r.name)}
                        </p>
                        <p className="font-arabic mt-0.5 text-lg text-[var(--color-text-secondary)]" dir="rtl">
                          {r.ar}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${
                          r.colored ? "bg-accent/15 text-accent" : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {r.colored ? p.coloredBadge : p.explainedBadge}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed">{tr(r.def)}</p>

                    {r.huruf && (
                      <p className="mt-2 text-sm">
                        <span className="text-[var(--color-text-secondary)]">{p.huruf}: </span>
                        <span className="font-arabic text-lg" dir="rtl">
                          {r.huruf}
                        </span>
                      </p>
                    )}

                    <p className="mt-1 text-sm">
                      <span className="text-[var(--color-text-secondary)]">{p.cara}: </span>
                      {tr(r.cara)}
                    </p>

                    {r.examples.length > 0 && (
                      <div className="mt-3 rounded-xl bg-black/[0.03] p-3 dark:bg-white/[0.04]">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">{p.contoh}</p>
                        <ul className="mt-1.5 space-y-1.5">
                          {r.examples.map((ex, i) => (
                            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                              <span className="font-arabic text-xl" dir="rtl" style={r.colored && r.color ? { color: r.color } : undefined}>
                                {ex.ar}
                              </span>
                              <span className="text-xs text-[var(--color-text-secondary)]">
                                {ex.latin}
                                {ex.ref && ex.ref !== "—" ? ` · ${ex.ref}` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {r.note && (
                      <p className="mt-2 text-xs italic text-[var(--color-text-secondary)]">
                        {p.note}: {tr(r.note)}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Try-it CTA into the live Mushaf. */}
        <Link
          href={`/${locale}/quran/mushaf`}
          className="card-premium shimmer-gold mt-10 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center"
        >
          <div>
            <p className="flex items-center gap-2 font-heading text-lg">
              <span className="float-soft inline-block">📖</span> {p.tryTitle}
            </p>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-text-secondary)]">{p.trySub}</p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg">{p.tryCta} →</span>
        </Link>
      </div>
    </div>
  );
}
