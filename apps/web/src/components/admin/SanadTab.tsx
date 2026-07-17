"use client";

/**
 * Sanad Explorer — "mata rantai sanad" the admin portal now actually builds.
 * Every chain shown here is extracted straight from the hadith's own Arabic
 * text (already licensed, already in our DB — see worker-api/lib/sanad.ts),
 * never invented: no standalone open-source narrator-biography (ʻilm
 * ar-rijāl) database exists to draw from, so this deliberately does NOT
 * pretend to grade narrators — it shows exactly what the source text says,
 * labelled plainly as a pattern-based extraction so nobody mistakes it for a
 * scholarly critical edition.
 */

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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

export function SanadTab() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selected, setSelected] = useState("");
  const [sample, setSample] = useState<SampleRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api
      .get<{ collections: Collection[] }>("/content/hadits/collections")
      .then((r) => {
        setCollections(r.collections);
        if (r.collections.length) setSelected(r.collections[0]!.slug);
      })
      .catch(() => setErr(true));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setSample(null);
    api
      .get<{ sample: SampleRow[] }>(`/content/hadits/${selected}/sanad-sample?limit=20`)
      .then((r) => setSample(r.sample))
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, [selected]);

  const withChain = sample?.filter((s) => s.chain.length > 0) ?? [];
  const coverage = sample && sample.length > 0 ? Math.round((withChain.length / sample.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/40 bg-[var(--color-card)] p-4">
        <p className="font-heading text-lg">🔗 Sanad Explorer — Mata Rantai Perawi</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Rantai perawi di bawah ini <b>diekstrak otomatis</b> dari teks Arab hadits yang sudah ada di database
          (bukan dikarang, bukan database biografi perawi terpisah — proyek open source untuk itu belum ditemukan
          yang layak). Ekstraksi membaca kata kunci periwayatan klasik (حدثنا، أخبرنا، عن، قال) langsung dari
          <code className="mx-1 rounded bg-black/10 px-1">text_ar</code> setiap hadits. Berguna untuk telusur cepat,
          bukan pengganti kitab ilmu rijal.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">Koleksi:</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-sm"
          >
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name_id} {c.author ? `— ${c.author}` : ""}
              </option>
            ))}
          </select>
          {sample && (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] text-accent">
              {withChain.length}/{sample.length} hadits contoh punya rantai terdeteksi ({coverage}%)
            </span>
          )}
        </div>

        {err && <p className="mt-3 text-xs text-danger">Gagal memuat (butuh login admin).</p>}
        {loading && <p className="mt-3 text-xs text-[var(--color-text-secondary)]">Memuat…</p>}

        {sample && (
          <div className="mt-4 space-y-3">
            {withChain.length === 0 && (
              <p className="text-xs text-[var(--color-text-secondary)]">
                Tidak ada rantai terdeteksi pada contoh ini — koleksi ini mungkin berisi matan tanpa isnad lengkap.
              </p>
            )}
            {withChain.map((row) => (
              <div key={row.id} className="rounded-xl border border-[var(--color-border)] p-3">
                <p className="text-xs font-medium text-primary dark:text-accent">Hadits No. {row.hadith_number}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {row.chain.map((link, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="rounded-lg bg-black/5 px-2 py-1 dir-rtl font-arabic" dir="rtl">
                        {link.name}
                      </span>
                      {i < row.chain.length - 1 && <span className="text-[var(--color-text-secondary)]">←</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
