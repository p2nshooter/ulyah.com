import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { sanadLabels } from "@/lib/sanad-labels";
import { PageHero } from "@/components/PageHero";
import { api } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = sanadLabels(locale);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: `/${locale}/sanad` },
  };
}

interface ChainSummary {
  chain_id: number;
  hadits_id: number;
  text_id: string | null;
  source: string;
  collection: string | null;
  link_count: number;
}

export default async function SanadListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = sanadLabels(locale);

  let chains: ChainSummary[] = [];
  try {
    const res = await api.get<{ chains: ChainSummary[] }>("/content/sanad/list");
    chains = res.chains;
  } catch {
    chains = [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <PageHero icon="🌳" title={t.title} subtitle={t.subtitle} />

      <h2 className="mt-8 text-center font-heading text-lg text-accent">{t.browseTitle}</h2>

      {chains.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--color-text-secondary)]">{t.emptyList}</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {chains.map((c) => (
            <Link
              key={c.chain_id}
              href={`/${locale}/sanad/${c.hadits_id}`}
              className="card-premium flex flex-col gap-2 p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-accent">
                {c.source} {c.collection ? `· ${c.collection}` : ""}
              </p>
              {c.text_id && <p className="line-clamp-2 text-sm text-[var(--color-text-secondary)]">{c.text_id}</p>}
              <p className="mt-1 text-xs text-accent">
                {t.linkCount(c.link_count)} · {t.viewChain}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
