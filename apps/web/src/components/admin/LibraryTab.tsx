"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  kitab: { total: number; byCategory: { name_id: string; n: number }[] };
  hadits: {
    total: number;
    byGrade: { bucket: string; n: number }[];
    collections: { slug: string; name_id: string; author: string | null; n: number }[];
  };
  pesantren: { kitab: number; bab: number; matan: number };
  amalan: { grp: string; n: number }[];
  nasakh: number;
  stories: number;
  ebooks: number;
  tafsir: number;
}

const GRADE_META: Record<string, { label: string; cls: string }> = {
  mutawatir: { label: "Mutawatir", cls: "text-emerald-600 dark:text-emerald-300" },
  shahih: { label: "Shahih", cls: "text-green-600 dark:text-green-300" },
  hasan: { label: "Hasan", cls: "text-amber-600 dark:text-amber-300" },
  dhaif: { label: "Lemah (Dhaif)", cls: "text-orange-600 dark:text-orange-300" },
  maudhu: { label: "Palsu (Maudhu')", cls: "text-red-600 dark:text-red-300" },
  lain: { label: "Perlu Ditinjau", cls: "text-[var(--color-text-secondary)]" },
};
const GRADE_ORDER = ["mutawatir", "shahih", "hasan", "dhaif", "maudhu", "lain"];
const AMALAN_LABEL: Record<string, string> = {
  doa: "Doa Harian",
  dzikir: "Dzikir",
  thibb: "Thibbun Nabawi",
  kecantikan: "Kebersihan & Keindahan",
};

/**
 * "Perpustakaan" — a single admin board that catalogues and counts every
 * body of content on the site, so the owner sees the whole library at a
 * glance: hadith by authenticity grade (palsu/lemah/shahih/mutawatir), the
 * kitab catalogue + readable pesantren kitab, amalan, nasakh-mansukh, kisah,
 * ebooks, tafsir.
 */
export function LibraryTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get<Stats>("/admin/library-stats")
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-sm text-danger">Gagal memuat statistik perpustakaan.</p>;
  if (!stats) return <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>;

  const gradeMap = Object.fromEntries(stats.hadits.byGrade.map((g) => [g.bucket, g.n]));
  const amalanTotal = stats.amalan.reduce((s, a) => s + a.n, 0);

  return (
    <div className="space-y-6">
      {/* Headline counters */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 desktop:grid-cols-4">
        <Tile label="Hadits (semua kitab)" value={stats.hadits.total.toLocaleString("id")} />
        <Tile label="Kitab (katalog Shamela)" value={stats.kitab.total.toLocaleString("id")} />
        <Tile label="Kitab Pesantren (baca)" value={`${stats.pesantren.kitab} kitab · ${stats.pesantren.matan} matan`} />
        <Tile label="Amalan Harian" value={amalanTotal.toLocaleString("id")} />
        <Tile label="Nasakh & Mansukh" value={stats.nasakh.toLocaleString("id")} />
        <Tile label="Kisah (terbit)" value={stats.stories.toLocaleString("id")} />
        <Tile label="E-book / PDF" value={stats.ebooks.toLocaleString("id")} />
        <Tile label="Tafsir (entri)" value={stats.tafsir.toLocaleString("id")} />
      </div>

      {/* Hadith by grade */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Hadits menurut derajat</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          Semua tetap disimpan & ditampilkan, tapi jelas berlabel — termasuk yang palsu/lemah sebagai peringatan.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 desktop:grid-cols-6">
          {GRADE_ORDER.map((g) => (
            <div key={g} className="rounded-lg border border-[var(--color-border)] p-3 text-center">
              <p className={`font-heading text-xl ${GRADE_META[g].cls}`}>{(gradeMap[g] ?? 0).toLocaleString("id")}</p>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{GRADE_META[g].label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hadith collections */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Kitab Hadits</p>
        <div className="mt-3 space-y-1.5">
          {stats.hadits.collections.map((col) => (
            <div key={col.slug} className="flex items-center justify-between gap-3 text-sm">
              <span>
                {col.name_id}
                {col.author ? <span className="text-[var(--color-text-secondary)]"> · {col.author}</span> : null}
              </span>
              <span className="font-heading tabular-nums text-accent">{col.n.toLocaleString("id")}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Amalan breakdown */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Amalan Harian per kelompok</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.amalan.map((a) => (
            <div key={a.grp} className="rounded-lg border border-[var(--color-border)] p-3 text-center">
              <p className="font-heading text-xl text-accent">{a.n}</p>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{AMALAN_LABEL[a.grp] ?? a.grp}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kitab catalogue by category */}
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <p className="font-heading text-base">Katalog Kitab per bidang</p>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {stats.kitab.byCategory.map((cat) => (
            <div key={cat.name_id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-[var(--color-text-secondary)]">{cat.name_id}</span>
              <span className="font-heading tabular-nums text-accent">{cat.n.toLocaleString("id")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-lg">{value}</p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
