import { ALL_LOCALES, LOCALE_SITE, DEFAULT_LOCALE, localeReadiness } from "@ulyah/shared/i18n";

/**
 * Where each language stands — a report, not a control panel.
 *
 * The switches are gone, and that is the point. Turning a language on here used
 * to mean rendering ulyah.com in it by machine translation, and the owner ended
 * that: "stop auto translate di ulyah.com, cukup ulyah.com menggunakan bahasa
 * Indonesia dan ekosistem situs yg lain menggunakan bahasa extensi situsnya
 * masing-masing." The hub is Indonesian; the four ecosystem languages are their
 * own sites. Nothing in between is served, so there is nothing here to switch.
 *
 * The measurement stays, because it is worth knowing how far a language got
 * (scripts/generate-locale-readiness.ts):
 *  · UI      — dictionary strings that are genuinely in this language
 *  · Konten  — how much of the site's own writing (tafsir, kisah, kitab, hadits)
 *              was translated and cached in D1
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
  const rows = ALL_LOCALES.map((l) => ({
    ...l,
    own: Boolean(LOCALE_SITE[l.code]),
    isDefault: l.code === DEFAULT_LOCALE,
    // Live means: somebody is actually served this language. The site's own
    // language, and the four that have a site of their own. Nothing else.
    on: l.code === DEFAULT_LOCALE || Boolean(LOCALE_SITE[l.code]),
    r: localeReadiness(l.code),
  })).sort((a, b) => Number(b.on) - Number(a.on) || b.r.overall - a.r.overall);

  const liveCount = rows.filter((r) => r.on).length;

  return (
    <section className="space-y-4">
      <div>
        <p className="font-heading text-base">🈯 Kesiapan Bahasa</p>
        <p className="mt-1 text-xs text-text-secondary">
          <b>Terjemahan mesin di ulyah.com dimatikan.</b> ulyah.com berbahasa Indonesia, dan {liveCount - 1} bahasa
          ekosistem punya situsnya sendiri — memilihnya berarti pindah ke situs itu, bukan menerjemahkan halaman ini.
          Bahasa lain tidak lagi disajikan: URL-nya dialihkan ke Bahasa Indonesia dan tidak muncul di pemilih bahasa,
          jadi tidak ada lagi halaman setengah bahasa A setengah bahasa B. Persentase di bawah <b>diukur, bukan
          ditaksir</b> (UI dari string kamus yang masih berbahasa Inggris, Konten dari tulisan situs yang sempat
          diterjemahkan dan tersimpan di D1) dan disimpan sebagai catatan sejauh mana tiap bahasa pernah sampai.
        </p>
      </div>

      <div className="grid gap-2 desktop:grid-cols-2">
        {rows.map((l) => {
          const live = l.on;
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
                  <span
                    className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-text-secondary dark:bg-white/10"
                    title="Tidak disajikan — ulyah.com tidak menerjemahkan halamannya dengan mesin"
                  >
                    tidak disajikan
                  </span>
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
        Bahasa dengan <b>situs sendiri</b> (1fr.fr, tilawa.de, dawa.es, xad.es) dikerjakan di situsnya masing-masing,
        memakai bahasa induk ekstensi domainnya. Bahasa selebihnya berhenti di angka terakhirnya — kalau suatu saat mau
        dihidupkan lagi, jalannya lewat terjemahan manusia, bukan mesin. Angka UI diperbarui saat{" "}
        <code>pnpm gen:locale-readiness</code> berjalan.
      </p>
    </section>
  );
}
