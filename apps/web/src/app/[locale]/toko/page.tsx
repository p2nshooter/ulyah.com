import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { storeLabels } from "@/lib/store-labels";
import { TENANT_MARKETPLACE, searchUrl } from "@/lib/store";
import { jsonLdProps, breadcrumbs } from "@/lib/structured-data";

/**
 * The Amazon store — clear categories, thousands of products behind each.
 *
 * The page holds no products, and that is the design rather than a shortcut.
 * Amazon's Associates agreement forbids scraping their pages, and the only
 * sanctioned source — the Product Advertising API — opens after three
 * qualifying sales. Even with it, copying Amazon's own descriptions would cost
 * ranking rather than add it: that text is identical across thousands of
 * affiliate sites, and Google names thin affiliate pages as a manual-penalty
 * category. So each card carries sentences the owner wrote, which exist nowhere
 * else, and the link opens a filtered Amazon search where the reader picks from
 * Amazon's thousands (owner: "ga usah sy pilih, nanti milih sendiri customer —
 * yang penting kategorinya jelas banget").
 *
 * Two things this page refuses to do:
 *
 *  · exist on ulyah.com. Amazon does not operate in Indonesia, so an Indonesian
 *    page could only show an English store. No marketplace → notFound(), no
 *    route, nothing in the sitemap;
 *
 *  · render without a tracking tag. An untagged Amazon link is traffic given
 *    away for nothing.
 */

export const revalidate = 300;

interface Shelf {
  id: number;
  slug: string;
  label: string;
  blurb: string;
  keywords: string;
  department: string | null;
  icon: string | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = storeLabels(locale);
  return { title: t.title, description: t.intro };
}

export default async function StorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = storeLabels(locale);

  // No Amazon for this site — the page does not exist here. Copied to a local
  // so the narrowing survives into the callbacks below: TypeScript does not
  // keep a narrowed IMPORTED binding inside a closure.
  if (!TENANT_MARKETPLACE) notFound();
  const marketplace: string = TENANT_MARKETPLACE;

  let tag: string | null = null;
  let shelves: Shelf[] = [];
  try {
    const r = await api.get<{ tag: string | null; shelves: Shelf[] }>(
      `/content/store?marketplace=${marketplace}`
    );
    tag = r.tag;
    shelves = Array.isArray(r.shelves) ? r.shelves : [];
  } catch {
    // A store we cannot read is an empty store, never a broken page.
  }
  if (!tag) shelves = [];

  return (
    <>
      <script {...jsonLdProps(breadcrumbs(locale, [{ name: t.title, route: "/toko" }]))} />
      <PageHero icon="🛒" title={t.title} subtitle={t.intro} />

      <div className="mx-auto w-full max-w-4xl px-4 pb-16">
        {/* Amazon requires the disclosure, and a reader deserves it before the
            first link rather than in a footnote after it. */}
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          <b>{t.disclosure}</b> {t.noExtraCost}
        </p>

        {shelves.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">{t.empty}</p>
        ) : (
          <ul className="mt-6 grid gap-3 desktop:grid-cols-2">
            {shelves.map((s) => (
              <li
                key={s.id}
                className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4"
              >
                <h2 className="font-heading text-base leading-snug">
                  {s.icon && <span className="mr-1.5">{s.icon}</span>}
                  {s.label}
                </h2>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {s.blurb}
                </p>
                <a
                  href={searchUrl(marketplace, s.keywords, tag!, s.department)}
                  target="_blank"
                  // sponsored: this link is paid, and Google requires it to say
                  // so. Unmarked affiliate links at any scale are a link-scheme
                  // violation, which would undo the indexing work rather than
                  // add to it.
                  rel="sponsored nofollow noopener"
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-3 py-2 text-xs font-bold text-white"
                >
                  {t.browseOnAmazon} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
