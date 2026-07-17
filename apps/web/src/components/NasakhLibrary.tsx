"use client";

import Link from "next/link";
import { NarrateButton } from "@/components/NarrateButton";

interface NasakhEntry {
  id: number;
  entry_order: number;
  title_id: string;
  naskh_type: string;
  mansukh_ref: string | null;
  mansukh_ar: string | null;
  mansukh_id: string | null;
  nasikh_ref: string | null;
  nasikh_ar: string | null;
  nasikh_id: string | null;
  explanation_id: string | null;
  source: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  hukm: "Naskh Hukum",
  tilawah: "Naskh Bacaan (Tilawah)",
  hukm_tilawah: "Naskh Hukum & Bacaan",
};

/**
 * Nasakh & Mansukh — each entry pairs the abrogated (mansukh) ruling/verse
 * with the abrogating (nasikh) one, with a short explanation and source.
 * Every entry is narratable aloud with the zero-key browser voice.
 */
export function NasakhLibrary({ locale, entries }: { locale: string; entries: NasakhEntry[] }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="space-y-5">
        {entries.map((e) => {
          const narration = [
            e.title_id,
            e.mansukh_id ? `Yang dinasakh: ${e.mansukh_id}` : "",
            e.nasikh_id ? `Penggantinya: ${e.nasikh_id}` : "",
            e.explanation_id ?? "",
          ].filter(Boolean);
          return (
            <article key={e.id} className="card-premium-static p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-lg">
                  <span className="mr-2 text-accent">{e.entry_order}.</span>
                  {e.title_id}
                </p>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent">
                  {TYPE_LABEL[e.naskh_type] ?? e.naskh_type}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {/* Mansukh (abrogated) */}
                <div className="rounded-xl border border-orange-500/30 bg-orange-500/[0.06] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">
                    Mansukh (dihapus) {e.mansukh_ref ? `· ${e.mansukh_ref}` : ""}
                  </p>
                  {e.mansukh_ar && (
                    <p dir="rtl" className="font-arabic mt-1.5 text-lg leading-loose">
                      {e.mansukh_ar}
                    </p>
                  )}
                  {e.mansukh_id && (
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{e.mansukh_id}</p>
                  )}
                </div>
                {/* Nasikh (abrogating) */}
                <div className="rounded-xl border border-green-500/30 bg-green-500/[0.06] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-300">
                    Nasikh (pengganti) {e.nasikh_ref ? `· ${e.nasikh_ref}` : ""}
                  </p>
                  {e.nasikh_ar && (
                    <p dir="rtl" className="font-arabic mt-1.5 text-lg leading-loose">
                      {e.nasikh_ar}
                    </p>
                  )}
                  {e.nasikh_id && (
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{e.nasikh_id}</p>
                  )}
                </div>
              </div>

              {e.explanation_id && (
                <div className="mt-3 rounded-xl border border-[var(--color-border)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">Penjelasan</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{e.explanation_id}</p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {e.source && <p className="text-[11px] italic text-[var(--color-text-secondary)]/70">📖 {e.source}</p>}
                <NarrateButton paragraphs={narration} listenLabel="🔊 Dengarkan" stopLabel="⏹" lang={locale} />
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--color-text-secondary)]">
        Ilmu nasakh-mansukh termasuk pembahasan Ulumul Qur'an. Sebagian kasus disepakati ulama, sebagian lain
        diperdebatkan cakupannya —{" "}
        <Link href={`/${locale}/kitab`} className="text-accent hover:underline">
          pelajari lebih dalam di perpustakaan kitab
        </Link>
        .
      </p>
    </div>
  );
}
