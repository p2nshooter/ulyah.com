import Link from "next/link";
import { routePath } from "@/lib/paths";
import { usd, waLink, type SaleDemo, type SaleSiteSummary, type SaleTerms } from "@/lib/site-sale";
import type { SaleCopy } from "@/lib/sale-copy";
import { MakkahLive } from "./MakkahLive";
import { SaleOfferForm } from "./SaleOfferForm";

/**
 * /acquisition on a site that is for sale (docs/ADSENSE-BLUEPRINT.md §17, §17.3): the price in
 * the clearest place, what the site holds, the income it carries, what the buyer receives,
 * the steps, the admin portal's demo login, the offer form, the questions and the other
 * sites on sale — in the site's own language (lib/sale-copy.ts). Every number is the site's
 * own; nothing about traffic or income is claimed in figures.
 */
export function SiteSale({
  copy, terms, locale, site, demo, network,
}: {
  copy: SaleCopy;
  terms: SaleTerms;
  locale: string;
  site: string;
  demo: SaleDemo | null;
  network: SaleSiteSummary[];
}) {
  const price = usd(terms.priceUsd, locale);
  const min = usd(terms.minOfferUsd, locale);
  const wa = terms.whatsapp ? waLink(terms.whatsapp, copy.waText) : "";
  const p = (path: string) => routePath(locale, path);
  const others = network.filter((n) => n.site !== site);

  return (
    <div data-testid="site-sale">
      {/* ── Hero: the offer and the price, first ── */}
      <section className="relative overflow-hidden bg-primary text-[#f4efe3]">
        <div aria-hidden className="pattern-islamic pointer-events-none absolute inset-0 opacity-15" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 desktop:grid-cols-[1.25fr_1fr] desktop:py-20">
          <div className="hero-entrance">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-accent-light)">{copy.eyebrow}</p>
            <h1 className="mt-4 font-heading text-3xl leading-tight text-[#f4efe3] sm:text-4xl desktop:text-5xl">{copy.h1}</h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#f4efe3]/85">{copy.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#offer" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-primary shadow-lg transition hover:brightness-110" data-testid="sale-cta">
                {copy.ctaOffer}
              </a>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#f4efe3]/40 px-6 py-3 text-sm font-medium text-[#f4efe3] transition hover:border-accent">
                  {copy.ctaWa}
                </a>
              )}
            </div>
          </div>
          <div className="hero-entrance rounded-3xl border border-accent/50 bg-black/25 p-7 text-center shadow-2xl backdrop-blur-sm" style={{ animationDelay: "160ms" }} data-testid="sale-price-card">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--color-accent-light)">{copy.priceLabel}</p>
            <p className="mt-2 font-heading text-5xl font-bold text-(--color-accent-xl) sm:text-6xl" data-testid="sale-price">{price}</p>
            {terms.negotiable && <p className="mt-3 inline-block rounded-full bg-accent/20 px-4 py-1 text-sm font-semibold text-(--color-accent-xl)">{copy.nego}</p>}
            <div className="mt-5 border-t border-[#f4efe3]/15 pt-5">
              <p className="text-sm text-[#f4efe3]/75">{copy.minLabel}</p>
              <p className="mt-1 font-heading text-3xl text-[#f4efe3]" data-testid="sale-min">{min}</p>
            </div>
            <p className="mt-5 text-xs text-[#f4efe3]/70">
              {copy.emailLabel}: <a href={`mailto:${terms.email}`} className="font-semibold text-(--color-accent-light) hover:underline">{terms.email}</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── The numbers ── */}
      <section className="border-b border-(--color-border) bg-(--color-bg) px-4 py-10 sm:px-6">
        <div className="reveal-stagger mx-auto grid max-w-7xl grid-cols-2 gap-6 text-center sm:grid-cols-3 desktop:grid-cols-6">
          {copy.numbers.map(([n, label]) => (
            <div key={label}>
              <div className="font-heading text-3xl text-primary dark:text-accent">{n}</div>
              <div className="mt-1 text-xs text-text-secondary">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Makkah, 24 hours ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 desktop:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl">{copy.liveTitle}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">{copy.liveText}</p>
          <Link href={p("/live")} className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">{copy.liveLink}</Link>
        </div>
        <MakkahLive url={terms.makkahLiveUrl} words={copy.liveBox} />
      </section>

      {/* ── What is inside ── */}
      <section className="bg-(--color-surface)/50 px-4 py-16 sm:px-6 dark:bg-white/3">
        <div className="mx-auto max-w-7xl">
          <h2 className="section-divider text-center font-heading text-2xl sm:text-3xl"><span>{copy.insideTitle}</span></h2>
          <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 desktop:grid-cols-3">
            {copy.inside.map((g) => (
              <div key={g.title} className="card-premium rounded-3xl p-6">
                <div className="text-3xl" aria-hidden>{g.icon}</div>
                <h3 className="mt-3 font-heading text-lg">{g.title}</h3>
                <ul className="mt-4 space-y-3">
                  {g.items.map(([t, d]) => (
                    <li key={t} className="text-sm">
                      <span className="font-semibold text-text-primary dark:text-[#f4efe3]">{t}</span>
                      <span className="block text-text-secondary">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Income it already carries + why it matters ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="section-divider text-center font-heading text-2xl sm:text-3xl"><span>{copy.incomeTitle}</span></h2>
        <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2">
          {copy.income.map(([icon, t, d]) => (
            <div key={t} className="flex gap-4 rounded-3xl border border-(--color-border) p-6">
              <div className="text-3xl" aria-hidden>{icon}</div>
              <div>
                <h3 className="font-heading text-lg">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-primary/5 p-6 text-sm leading-relaxed text-text-secondary dark:bg-white/5">
          <b className="text-text-primary dark:text-[#f4efe3]">{copy.benefitLabel}</b> {copy.benefitText}
        </div>
      </section>

      {/* ── What the buyer receives + the steps ── */}
      <section className="bg-primary px-4 py-16 text-[#f4efe3] sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 desktop:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl text-(--color-accent-xl) sm:text-3xl">{copy.receiveTitle}</h2>
            <ul className="mt-6 space-y-3">
              {copy.receive.map((r) => (
                <li key={r} className="flex gap-3 text-[15px]"><span className="text-(--color-accent-light)" aria-hidden>◆</span>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl text-(--color-accent-xl) sm:text-3xl">{copy.stepsTitle}</h2>
            <ol className="mt-6 space-y-4">
              {copy.steps.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-heading font-bold text-primary">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-[#f4efe3]/75">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── The admin portal, open to look at ── */}
      {demo && (
        <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6" data-testid="sale-demo">
          <div className="card-premium-static grid items-center gap-8 rounded-3xl p-6 sm:p-8 desktop:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl">{copy.demo.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">{copy.demo.text}</p>
              <a href={demo.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 dark:bg-accent dark:text-primary">
                {copy.demo.open}
              </a>
            </div>
            <dl className="rounded-2xl bg-primary p-5 text-sm text-[#f4efe3]">
              <dt className="text-xs uppercase tracking-[0.2em] text-(--color-accent-light)">{copy.demo.address}</dt>
              <dd className="mt-1 break-all font-mono">{demo.url}</dd>
              <dt className="mt-4 text-xs uppercase tracking-[0.2em] text-(--color-accent-light)">{copy.demo.user}</dt>
              <dd className="mt-1 break-all font-mono" data-testid="sale-demo-user">{demo.email}</dd>
              <dt className="mt-4 text-xs uppercase tracking-[0.2em] text-(--color-accent-light)">{copy.demo.pass}</dt>
              <dd className="mt-1 break-all font-mono" data-testid="sale-demo-pass">{demo.password}</dd>
            </dl>
          </div>
        </section>
      )}

      {/* ── The offer ── */}
      <section id="offer" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-heading text-2xl sm:text-3xl">{copy.offerTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-text-secondary">{copy.offerLead}</p>
          <div className="card-premium-static mt-8 rounded-3xl p-6 sm:p-8">
            <SaleOfferForm site={site} locale={locale} words={copy.form} minOfferUsd={terms.minOfferUsd} email={terms.email} />
          </div>
          <p className="mt-4 text-center text-sm text-text-secondary">
            {copy.offerDirect} <a href={`mailto:${terms.email}`} className="font-semibold text-accent hover:underline">{terms.email}</a>
            {wa && <> · <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">WhatsApp</a></>}
          </p>
        </div>
      </section>

      {/* ── Questions ── */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="section-divider text-center font-heading text-2xl"><span>{copy.faqTitle}</span></h2>
        <div className="mt-8 divide-y divide-(--color-border) rounded-2xl border border-(--color-border)">
          {copy.faq.map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold">{q}<span className="float-right text-text-secondary transition group-open:rotate-45" aria-hidden>+</span></summary>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── The other sites on sale ── */}
      {others.length > 0 && (
        <section className="border-t border-(--color-border) bg-(--color-surface)/40 px-4 py-14 sm:px-6 dark:bg-white/3" data-testid="sale-network">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-heading text-2xl">{copy.network.title}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-text-secondary">{copy.network.lead}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 desktop:grid-cols-4">
              {others.map((n) => (
                <a key={n.site} href={`https://${n.domain}/acquisition`} target="_blank" rel="noopener" className="card-premium flex flex-col rounded-2xl p-5" data-testid="sale-network-site">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">{n.domain}</span>
                  <span className="mt-1 font-heading text-lg">{n.name}</span>
                  <span className="mt-3 font-heading text-2xl text-primary dark:text-accent">{usd(n.priceUsd, locale)}</span>
                  <span className="text-xs text-text-secondary">{n.negotiable ? `${copy.network.nego} · ` : ""}{copy.network.minimum} {usd(n.minOfferUsd, locale)}</span>
                  <span className="mt-4 text-sm font-semibold text-accent">{copy.network.view}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── For international buyers (ulyah.com speaks Indonesian) ── */}
      {locale === "id" && (
        <section lang="en" className="border-t border-(--color-border) bg-(--color-surface)/40 px-4 py-12 sm:px-6 dark:bg-white/3">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-heading text-xl">For international buyers</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              ULYAH.COM — a complete Islamic platform (the Qur&apos;an with audio, translation and tafsir, a classical kitab library,
              hadith, stories, children&apos;s learning, daily-worship tools, 24-hour Makkah and Madinah live, an AI assistant and an
              admin portal) — is for sale with its domain, source code, content and income channels. Asking price{" "}
              <b>{usd(terms.priceUsd, "en")}</b>{terms.negotiable ? ", negotiable" : ""}; offers from <b>{usd(terms.minOfferUsd, "en")}</b>. Use the form above or write
              to <a href={`mailto:${terms.email}`} className="font-semibold text-accent hover:underline">{terms.email}</a>.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
