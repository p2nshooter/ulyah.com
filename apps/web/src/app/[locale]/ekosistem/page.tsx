import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";
import { routePath } from "@/lib/paths";
import { ecoLink, ecosystemCopy, type EcoSection } from "@/lib/ecosystem";

/**
 * The ecosystem page (lib/ecosystem.ts): AXTO and XAA introduced in this
 * site's own language and words, labelled as the publisher's own promotion.
 * Exists only where a copy was written for the site and language.
 */

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const c = ecosystemCopy(TENANT.id, locale);
  if (!c) return {};
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: routePath(locale, `/ekosistem`) },
  };
}

function Section({ s, href, icon }: { s: EcoSection; href: string; icon: string }) {
  return (
    <section className="card-premium p-6 sm:p-8">
      <h2 className="font-heading text-2xl">
        <span aria-hidden="true">{icon} </span>
        {s.title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">{s.lead}</p>
      <ul className="mt-5 space-y-3">
        {s.points.map((p, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/12 text-sm text-accent">✦</span>
            {p}
          </li>
        ))}
      </ul>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="mt-6 inline-block rounded-full bg-accent px-7 py-2.5 font-heading text-base font-semibold text-primary shadow-(--ul-shadow-gold) transition hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {s.cta} →
      </a>
    </section>
  );
}

export default async function EkosistemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const c = ecosystemCopy(TENANT.id, locale);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="hero-entrance text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">✦ {c.eyebrow}</p>
        <h1 className="mt-3 font-heading text-3xl sm:text-4xl">{c.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-text-secondary">{c.intro}</p>
      </div>

      <div className="reveal-stagger mt-12 space-y-8">
        <Section s={c.axto} href={ecoLink("https://axto.io", TENANT.siteUrl)} icon="🧠" />
        <Section s={c.xaa} href={ecoLink("https://xaa.es", TENANT.siteUrl)} icon="🏛️" />
      </div>

      <section className="mt-10 rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <p className="text-[15px] leading-relaxed">🤲 {c.rule}</p>
      </section>

      <p className="mt-8 text-center text-sm leading-relaxed text-text-secondary">{c.closing}</p>
    </div>
  );
}
