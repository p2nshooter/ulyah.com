"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { sanadLabels } from "@/lib/sanad-labels";
import { AdSlot } from "@/components/AdSlot";

interface Collection {
  slug: string;
  name_id: string;
  name_ar: string;
  author: string | null;
}
interface SanadLink {
  order: number;
  name: string;
  marker: string;
}
interface SampleRow {
  id: number;
  hadith_number: number;
  chain: SanadLink[];
}

/**
 * Public "Sanad Explorer" — lets any visitor browse the chain of narrators
 * carried in a hadith's own Arabic text, for any of the site's collections.
 * The chain is a pattern-based extraction from text already in the database
 * (see worker-api/lib/sanad.ts) — labelled plainly as automatic so nobody
 * mistakes it for a curated ʻilm ar-rijāl reference.
 */
export function SanadExplorer({ locale }: { locale: string }) {
  const t = sanadLabels(locale);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState("");
  const [sample, setSample] = useState<SampleRow[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ collections: Collection[] }>("/content/hadits/collections")
      .then((r) => {
        setCollections(r.collections);
        if (r.collections.length) setSelected(r.collections[0]!.slug);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setSample(null);
    api
      .get<{ sample: SampleRow[] }>(`/content/hadits/${selected}/sanad-sample?limit=25`)
      .then((r) => setSample(r.sample.filter((s) => s.chain.length > 0)))
      .catch(() => setSample([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium text-[var(--color-text-secondary)]">{t.chooseCollection}:</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        >
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name_id} {c.author ? `— ${c.author}` : ""}
            </option>
          ))}
        </select>
      </div>

      <p className="rounded-xl border border-accent/25 bg-accent/5 p-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        ℹ️ {t.disclaimer}
      </p>

      {loading && <p className="text-sm text-[var(--color-text-secondary)]">…</p>}

      {sample && sample.length === 0 && !loading && <p className="text-sm text-[var(--color-text-secondary)]">{t.noChain}</p>}

      {sample && sample.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sample.map((row) => (
            <div key={row.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-accent">
                {t.hadithNo} {row.hadith_number}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {row.chain.map((link, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span dir="rtl" className="rounded-lg bg-black/5 px-2.5 py-1.5 font-arabic text-sm dark:bg-white/5">
                      {link.name}
                    </span>
                    {i < row.chain.length - 1 && <span className="text-accent">←</span>}
                  </span>
                ))}
              </div>
              <Link
                href={`/${locale}/hadits/${selected}`}
                className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
              >
                {t.viewFull}
              </Link>
            </div>
          ))}
        </div>
      )}

      <AdSlot minHeight={110} format="horizontal" />
    </div>
  );
}
