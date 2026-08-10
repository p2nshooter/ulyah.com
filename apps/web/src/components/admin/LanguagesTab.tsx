"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ALL_LOCALES, LOCALE_SITE, DEFAULT_LOCALE, localeReadiness } from "@ulyah/shared/i18n";

/**
 * How finished each of the 28 languages actually is.
 *
 * A language is only offered to visitors once it reaches 100% — a page that is
 * Thai in the header and English in the article is worse for a reader than not
 * having Thai at all. This tab is where that gate becomes visible: what is
 * live, what is still being worked on, and exactly which strings are holding a
 * language back.
 *
 * The percentages are MEASURED, not declared (scripts/generate-locale-readiness.ts):
 *  · UI      — dictionary strings that are genuinely in this language
 *  · Konten  — how much of the site's own writing (tafsir, kisah, kitab, hadits)
 *              has been translated and cached in D1
 *  · Total   — the LOWER of the two, because a perfect menu over untranslated
 *              articles is still a mixed-language page
 */

function Bar({ pct, tone }: { pct: number; tone: "ui" | "content" }) {
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="w-11 shrink-0 text-right text-[10px] tabular-nums text-text-secondary">
        {pct}%
      </span>
      <span className="w-12 shrink-0 text-[10px] uppercase text-text-secondary">
        {tone === "ui" ? "UI" : "Konten"}
      </span>
    </div>
  );
}

export function LanguagesTab() {
  // The switches live in the database, not in the code — turning a language on
  // is the owner's call and takes effect without a deploy.
  const [enabled, setEnabled] = useState<Record<string, boolean> | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<{ locales: { code: string; enabled: boolean }[] }>("/admin/locales")
      .then((r) => {
        const map: Record<string, boolean> = {};
        for (const l of r.locales) map[l.code] = l.enabled;
        setEnabled(map);
      })
      .catch(() => setError("Gagal memuat status bahasa."));
  }, []);

  useEffect(load, [load]);

  async function toggle(code: string, next: boolean) {
    setSaving(code);
    setError(null);
    try {
      await api.post("/admin/locales", { code, enabled: next });
      setEnabled((e) => ({ ...(e ?? {}), [code]: next }));
    } catch {
      setError(`Gagal mengubah ${code}.`);
    } finally {
      setSaving(null);
    }
  }

  const rows = ALL_LOCALES.map((l) => ({
    ...l,
    own: Boolean(LOCALE_SITE[l.code]),
    isDefault: l.code === DEFAULT_LOCALE,
    on: l.code === DEFAULT_LOCALE || Boolean(enabled?.[l.code]),
    r: localeReadiness(l.code),
  })).sort((a, b) => Number(b.on) - Number(a.on) || b.r.overall - a.r.overall);

  const liveCount = rows.filter((r) => r.on || r.own).length;

  return (
    <section className="space-y-4">
      <div>
        <p className="font-heading text-base">🈯 Kesiapan &amp; Saklar Bahasa</p>
        <p className="mt-1 text-xs text-text-secondary">
          {liveCount} dari {rows.length} bahasa aktif di ulyah.com. Bahasa yang dimatikan <b>dicoret dan tidak bisa
          diklik</b> di pemilih bahasa, dan URL-nya dialihkan ke Bahasa Indonesia — pengunjung tidak akan mendarat di
          halaman setengah bahasa A setengah bahasa B. Persentasenya <b>diukur, bukan ditaksir</b>: UI dari string kamus
          yang masih berbahasa Inggris, Konten dari berapa banyak tulisan situs yang sudah diterjemahkan dan tersimpan di
          D1. Keputusan menyalakannya tetap di tangan Anda — sistem tidak pernah menyalakan sendiri.
        </p>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      <div className="grid gap-2 desktop:grid-cols-2">
        {rows.map((l) => {
          const live = l.on || l.own;
          return (
            <div
              key={l.code}
              className={`rounded-xl border p-3 ${
                live ? "border-emerald-500/40 bg-emerald-500/4" : "border-(--color-border) bg-(--color-card)"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-sm">
                  <span dir={l.dir} className={live ? "" : "line-through opacity-60"}>
                    {l.label}
                  </span>
                  <span className="ml-1.5 text-[10px] uppercase text-text-secondary">{l.code}</span>
                  {l.r.overall >= 100 && !live && (
                    <span className="ml-1.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      siap dinyalakan
                    </span>
                  )}
                </p>

                {l.isDefault ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    BAHASA SITUS
                  </span>
                ) : l.own ? (
                  <span
                    className="shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400"
                    title="Punya situs sendiri — pemilih bahasa mengarahkan ke sana, tidak menerjemahkan di tempat"
                  >
                    ↗ {LOCALE_SITE[l.code]!.replace("https://", "")}
                  </span>
                ) : (
                  <button
                    onClick={() => toggle(l.code, !l.on)}
                    disabled={saving === l.code || enabled === null}
                    aria-pressed={l.on}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-40 ${
                      l.on ? "bg-emerald-500" : "bg-black/20 dark:bg-white/20"
                    }`}
                    title={l.on ? "Matikan bahasa ini" : "Nyalakan bahasa ini"}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        l.on ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <Bar pct={l.r.dict} tone="ui" />
                <Bar pct={l.r.content} tone="content" />
              </div>

              {l.r.missing.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[10px] text-text-secondary">
                    {l.r.missing.length} teks UI masih berbahasa Inggris
                  </summary>
                  <ul className="mt-1 space-y-0.5">
                    {l.r.missing.map((m, i) => (
                      <li key={i} className="truncate text-[10px] text-text-secondary">
                        · {m}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] leading-relaxed text-text-secondary">
        Bahasa dengan <b>situs sendiri</b> (1fr.fr, tilawa.de, dawa.es, xad.es) tidak punya saklar: memilihnya berarti
        pindah ke situs itu, bukan menerjemahkan ulyah.com. Angka Konten mereka tetap ditampilkan apa adanya supaya
        terlihat mana yang masih perlu di-warm. Angka UI diperbarui saat <code>pnpm gen:locale-readiness</code> berjalan;
        angka Konten diukur ulang otomatis setiap kali workflow warm selesai.
      </p>
    </section>
  );
}
