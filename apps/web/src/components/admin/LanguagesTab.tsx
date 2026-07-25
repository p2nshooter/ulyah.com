"use client";

import { ALL_LOCALES, LOCALE_SITE, DEFAULT_LOCALE, isLocaleReady, localeReadiness } from "@ulyah/shared/i18n";

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
      <span className="w-11 shrink-0 text-right text-[10px] tabular-nums text-[var(--color-text-secondary)]">
        {pct}%
      </span>
      <span className="w-12 shrink-0 text-[10px] uppercase text-[var(--color-text-secondary)]">
        {tone === "ui" ? "UI" : "Konten"}
      </span>
    </div>
  );
}

export function LanguagesTab() {
  const rows = ALL_LOCALES.map((l) => ({
    ...l,
    ready: isLocaleReady(l.code),
    own: Boolean(LOCALE_SITE[l.code]),
    r: localeReadiness(l.code),
  })).sort((a, b) => Number(b.ready) - Number(a.ready) || b.r.overall - a.r.overall);

  const live = rows.filter((r) => r.ready).length;

  return (
    <section className="space-y-4">
      <div>
        <p className="font-heading text-base">🈯 Kesiapan Bahasa</p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {live} dari {rows.length} bahasa aktif. Bahasa yang belum 100% <b>dicoret dan tidak bisa diklik</b> di pemilih
          bahasa — pengunjung tidak akan mendarat di halaman yang setengah bahasa A setengah bahasa B. Persentase di bawah
          ini diukur, bukan ditaksir: UI dihitung dari string kamus yang masih berbahasa Inggris, Konten dari berapa banyak
          tulisan situs yang sudah diterjemahkan dan tersimpan di D1.
        </p>
      </div>

      <div className="grid gap-2 desktop:grid-cols-2">
        {rows.map((l) => (
          <div
            key={l.code}
            className={`rounded-xl border p-3 ${
              l.ready
                ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                : "border-[var(--color-border)] bg-[var(--color-card)]"
            }`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-heading text-sm">
                <span dir={l.dir} className={l.ready ? "" : "line-through opacity-60"}>
                  {l.label}
                </span>
                <span className="ml-1.5 text-[10px] uppercase text-[var(--color-text-secondary)]">{l.code}</span>
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  l.ready ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-black/[0.06] text-[var(--color-text-secondary)] dark:bg-white/[0.08]"
                }`}
              >
                {l.code === DEFAULT_LOCALE
                  ? "BAHASA SITUS"
                  : l.own
                    ? `SITUS SENDIRI · ${LOCALE_SITE[l.code]!.replace("https://", "")}`
                    : l.ready
                      ? "AKTIF"
                      : `${l.r.overall}% — DIKUNCI`}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <Bar pct={l.r.dict} tone="ui" />
              <Bar pct={l.r.content} tone="content" />
            </div>

            {l.r.missing.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[10px] text-[var(--color-text-secondary)]">
                  {l.r.missing.length} teks UI masih berbahasa Inggris
                </summary>
                <ul className="mt-1 space-y-0.5">
                  {l.r.missing.map((m, i) => (
                    <li key={i} className="truncate text-[10px] text-[var(--color-text-secondary)]">
                      · {m}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
        Bahasa dengan <b>situs sendiri</b> (1fr.fr, tilawa.de, dawa.es, xad.es) tetap bisa diklik karena pemilih bahasa
        mengirim pengunjung ke situs itu, bukan menerjemahkan di tempat — situs tersebut hanya punya satu bahasa dan sudah
        utuh sebagai situs. Angka Konten mereka tetap ditampilkan apa adanya supaya terlihat mana yang masih perlu
        di-warm. Untuk membuka bahasa baru: selesaikan terjemahannya, jalankan <code>pnpm gen:ui-i18n</code> lalu{" "}
        <code>pnpm gen:locale-readiness</code>, dan bahasa itu terbuka sendiri begitu mencapai 100%.
      </p>
    </section>
  );
}
