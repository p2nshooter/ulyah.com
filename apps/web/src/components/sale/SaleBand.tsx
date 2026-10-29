import Link from "next/link";
import { routePath } from "@/lib/paths";
import { saleContext, usd, type SaleTerms } from "@/lib/site-sale";
import { saleCopy } from "@/lib/sale-copy";

/**
 * The very first thing on the home page of a site that is for sale (owner, 28 Oct 2026: "di
 * homepage paling depan tulis web ini di jual … kasih harga di posisi yg paling jelas"; since
 * 29 Oct every site of the ecosystem, §17.3): the price, negotiable, the minimum offer and the
 * way to the full offer, in the site's language. Rendered with the page, so it is in the HTML.
 */
export function SaleBand({ terms, locale }: { terms: SaleTerms; locale: string }) {
  if (!terms.visible) return null;
  const b = saleCopy(locale, saleContext(terms, locale)).band;
  return (
    <section aria-label={b.aria} className="relative overflow-hidden border-b border-accent/40 bg-primary text-[#f4efe3]" data-testid="sale-band">
      <div aria-hidden className="pattern-islamic pointer-events-none absolute inset-0 opacity-15" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 text-center sm:px-6 desktop:flex-row desktop:justify-between desktop:text-left">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-(--color-accent-light)">{b.eyebrow}</p>
          <p className="mt-1 font-heading text-lg leading-snug text-[#f4efe3] sm:text-xl">
            <strong className="text-(--color-accent-xl)">{b.strong}</strong>{b.rest}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-2xl border border-accent/50 bg-black/20 px-4 py-2 text-center">
            <div className="font-heading text-2xl font-bold leading-none text-(--color-accent-xl)" data-testid="sale-band-price">{usd(terms.priceUsd, locale)}</div>
            <div className="mt-1 text-[11px] text-[#f4efe3]/80">
              {terms.negotiable ? b.nego : ""}{b.minimum} <b className="text-(--color-accent-light)">{usd(terms.minOfferUsd, locale)}</b>
            </div>
          </div>
          <Link
            href={routePath(locale, "/acquisition")}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-primary shadow-lg transition hover:brightness-110"
          >
            {b.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
