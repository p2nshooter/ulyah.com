import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE, LOCALES } from "@ulyah/shared/i18n";
import { localizedRoute } from "@ulyah/shared/routes";
import { PageHero } from "@/components/PageHero";
import { storeLabels } from "@/lib/store-labels";
import { TENANT_MARKETPLACE, searchUrl } from "@/lib/store";
import { storeData, shelvesWithPages } from "@/lib/store-data";
import { jsonLdProps, breadcrumbs } from "@/lib/structured-data";

/**
 * One category, with a buying guide worth reading.
 *
 * This page exists only where `detail` has been written. That is the whole
 * point of splitting the store: an address is worth minting when there is
 * something at it, and a page holding one paragraph and one button is the thin
 * affiliate page Google names as a manual-penalty category. Categories without
 * a guide stay on the store index as cards that link straight to Amazon.
 *
 * The guide is our own writing — not Amazon's product copy, which is identical
 * across thousands of affiliate sites and counts for nothing. It is the only
 * part of this page a search engine has any reason to rank.
 */

export const revalidate = 300;

export async function generateStaticParams() {
  const shelves = await shelvesWithPages();
  return shelves.map((s) => ({ slug: s.slug }));
}

async function shelfFor(slug: string) {
  const { tag, shelves } = await storeData();
  const shelf = shelves.find((s) => s.slug === slug && (s.detail ?? "").trim().length > 0);
  return shelf && tag ? { shelf, tag } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const found = await shelfFor(slug);
  if (!found) return {};
  const t = storeLabels(locale);
  return {
    title: `${found.shelf.label} — ${t.title}`,
    description: found.shelf.blurb,
  };
}

export default async function ShelfPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = storeLabels(locale);

  if (!TENANT_MARKETPLACE) notFound();
  const marketplace: string = TENANT_MARKETPLACE;

  const found = await shelfFor(slug);
  if (!found) notFound();
  const { shelf, tag } = found;

  const dir = LOCALES.find((l) => l.code === locale)?.dir ?? "ltr";
  const storePath = `/${locale}${localizedRoute("/toko", locale)}`;
  // The guide is stored as plain paragraphs separated by blank lines.
  const paragraphs = shelf.detail!.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <script
        {...jsonLdProps(
          breadcrumbs(locale, [
            { name: t.title, route: "/toko" },
            { name: shelf.label, route: `/toko/${shelf.slug}` },
          ])
        )}
      />
      <PageHero icon={shelf.icon ?? "🛒"} title={shelf.label} subtitle={shelf.blurb} />

      <div className="mx-auto w-full max-w-3xl px-4 pb-16">
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          <b>{t.disclosure}</b> {t.noExtraCost}
        </p>

        <article dir={dir} className="mt-6 space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed">
              {p}
            </p>
          ))}
        </article>

        <a
          href={searchUrl(marketplace, shelf.keywords, tag, shelf.department)}
          target="_blank"
          // sponsored: this link is paid, and Google requires it to say so.
          rel="sponsored nofollow noopener"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-white"
        >
          {t.browseOnAmazon} ↗
        </a>

        <p className="mt-8 text-xs">
          <Link href={storePath} className="text-[var(--color-accent)] underline">
            ← {t.title}
          </Link>
        </p>
      </div>
    </>
  );
}
