"use client";

import { useEffect, useState } from "react";
import { ALL_LOCALES, LOCALE_SITE, DEFAULT_LOCALE, localeReadiness } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";

/**
 * Where each language stands, and what the translation engine is doing about it.
 *
 * Owner, 22 Nov 2026: "Bikinin engine penerjemah bahasa, cek di portal admin ulyah.com, bahasa apa aja yg blm di
 * kerjakan … biar semuanya 100% setiap bahasa" — and "Jgn ke D1, pindah ke R2". The engine
 * (scripts/mesin-terjemah.ts, docs/TRANSLATION-ENGINE.md) translates every language into R2 on its own, every
 * few hours, until each one is complete. This tab shows its measurement:
 *  · UI      — dictionary strings that are genuinely in this language (pnpm gen:locale-readiness)
 *  · Konten  — of every text in the corpus, how many have a stored translation in R2: done / total, counted
 *              by the engine, never estimated and never compared with another language
 * The live panel at the top is read from R2 on open (`mt/_state.json`); the bars fall back to the numbers
 * committed with the build when it cannot be reached.
 *
 * Serving a language in place on ulyah.com stays off (the hub is Indonesian — owner: "cukup ulyah.com
 * menggunakan bahasa Indonesia"); four languages have their own site. A language the engine has brought to 100%
 * is marked as complete here, so switching it on is a decision with a finished language behind it.
 */

interface Coverage {
  done: number;
  total: number;
  rev: number;
  at: string;
}
interface EngineState {
  corpusRev: number;
  corpusSize: Record<string, number>;
  coverage: Record<string, Coverage>;
  moved?: { mtCache?: { at: string; verified: boolean; pairs: Record<string, number> }; corpus?: { at: string } };
  lastRun?: { at: string; translated: number; rejected: Record<string, number>; langs: string[]; engine: string };
}

const REJECT_LABEL: Record<string, string> = {
  placeholder: "penanda teks Arab/nama hilang atau berubah",
  "arabic-invented": "AI menulis teks Arab sendiri",
  echo: "tidak diterjemahkan (sama dengan sumber)",
  length: "terlalu pendek/panjang (terpotong/mengarang)",
  empty: "tidak ada jawaban",
};

function pctOf(c?: { done: number; total: number }): number | null {
  if (!c || !c.total) return null;
  return c.done >= c.total ? 100 : Math.floor((c.done / c.total) * 1000) / 10;
}

function Bar({ pct, label, detail }: { pct: number | null; label: string; detail?: string }) {
  const p = pct ?? 0;
  const color = pct === null ? "bg-black/20" : p >= 100 ? "bg-emerald-500" : p >= 50 ? "bg-amber-500" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, p)}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-[10px] tabular-nums text-text-secondary" title={detail}>
        {pct === null ? "belum diukur" : `${pct}%`}
      </span>
      <span className="w-12 shrink-0 text-[10px] uppercase text-text-secondary">{label}</span>
    </div>
  );
}

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");

export function LanguagesTab() {
  const [state, setState] = useState<EngineState | null>(null);
  const [live, setLive] = useState<"loading" | "ok" | "off">("loading");

  useEffect(() => {
    let alive = true;
    api
      .get<{ state: EngineState | null }>("/admin/translation-engine")
      .then((r) => {
        if (!alive) return;
        setState(r.state);
        setLive(r.state ? "ok" : "off");
      })
      .catch(() => alive && setLive("off"));
    return () => {
      alive = false;
    };
  }, []);

  const rows = ALL_LOCALES.map((l) => {
    const built = localeReadiness(l.code);
    const cov = state?.coverage[l.code];
    const content = l.code === DEFAULT_LOCALE || l.code === "ar" ? 100 : cov ? pctOf(cov) : built.content || null;
    return {
      ...l,
      own: Boolean(LOCALE_SITE[l.code]),
      isDefault: l.code === DEFAULT_LOCALE,
      on: l.code === DEFAULT_LOCALE || Boolean(LOCALE_SITE[l.code]),
      dict: built.dict,
      content,
      cov,
      missing: built.missing,
    };
  }).sort((a, b) => Number(b.on) - Number(a.on) || (a.content ?? -1) - (b.content ?? -1));

  const notDone = rows.filter((r) => !r.isDefault && r.code !== "ar" && (r.content ?? 0) < 100);
  const last = state?.lastRun;

  return (
    <section className="space-y-4">
      <div>
        <p className="font-heading text-base">🈯 Kesiapan Bahasa &amp; Mesin Penerjemah</p>
        <p className="mt-1 text-xs text-text-secondary">
          Mesin penerjemah berjalan sendiri setiap beberapa jam dan meneruskan dirinya sampai <b>setiap bahasa 100%</b>.
          Semua terjemahan disimpan di <b>R2</b> — tidak ada yang ditulis ke D1. Persentase Konten <b>dihitung</b>: dari
          seluruh tulisan situs, berapa yang sudah punya terjemahan tersimpan. Teks Arab (ayat, matan hadits, kutipan
          kitab, doa) <b>tidak pernah diterjemahkan mesin</b>: dipisahkan sebelum dikirim dan dikembalikan utuh; jawaban
          yang mengubahnya ditolak. Terjemahan Al-Qur&apos;an memakai terjemahan manusia berlisensi.
        </p>
      </div>

      <div className="rounded-xl border border-(--color-border) bg-(--color-card) p-3 text-xs">
        {live === "loading" && <p className="text-text-secondary">Membaca status mesin dari R2…</p>}
        {live === "off" && (
          <p className="text-text-secondary">
            Status mesin belum tersedia (pass pertama belum selesai, atau R2 tidak terjangkau). Angka di bawah adalah
            ukuran terakhir yang ikut build.
          </p>
        )}
        {live === "ok" && state && (
          <div className="grid gap-1 desktop:grid-cols-2">
            <p>
              <b>Korpus:</b>{" "}
              {Object.entries(state.corpusSize)
                .map(([k, v]) => `${v.toLocaleString("id-ID")} teks (${k})`)
                .join(" · ") || "—"}
            </p>
            <p>
              <b>Belum 100%:</b> {notDone.length} bahasa
            </p>
            <p>
              <b>Pass terakhir:</b> {fmt(last?.at)} — {last?.translated?.toLocaleString("id-ID") ?? 0} teks diterjemahkan
              {last?.langs?.length ? ` (${last.langs.join(", ")})` : ""} · {last?.engine ?? "—"}
            </p>
            <p>
              <b>Pindahan dari D1:</b>{" "}
              {state.moved?.mtCache
                ? `${state.moved.mtCache.verified ? "✓ terverifikasi" : "⚠ belum lengkap"} ${fmt(state.moved.mtCache.at)}`
                : "belum dijalankan"}
            </p>
            {last && Object.values(last.rejected ?? {}).some((n) => n > 0) && (
              <p className="desktop:col-span-2 text-text-secondary">
                <b>Ditolak penjaga:</b>{" "}
                {Object.entries(last.rejected)
                  .filter(([, n]) => n > 0)
                  .map(([k, n]) => `${n.toLocaleString("id-ID")} ${REJECT_LABEL[k] ?? k}`)
                  .join(" · ")}{" "}
                — dicoba lagi di pass berikutnya.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-2 desktop:grid-cols-2">
        {rows.map((l) => (
          <div
            key={l.code}
            className={`rounded-xl border p-3 ${
              l.on ? "border-emerald-500/40 bg-emerald-500/4" : "border-(--color-border) bg-(--color-card)"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-heading text-sm">
                <span dir={l.dir}>{l.label}</span>
                <span className="ml-1.5 text-[10px] uppercase text-text-secondary">{l.code}</span>
              </p>
              {l.isDefault ? (
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  BAHASA SITUS
                </span>
              ) : l.own ? (
                <span className="shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
                  ↗ {LOCALE_SITE[l.code]!.replace("https://", "")}
                </span>
              ) : (l.content ?? 0) >= 100 ? (
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ LENGKAP
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  sedang diterjemahkan
                </span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              <Bar pct={l.dict} label="UI" />
              <Bar
                pct={l.content}
                label="Konten"
                detail={l.cov ? `${l.cov.done.toLocaleString("id-ID")} / ${l.cov.total.toLocaleString("id-ID")} teks` : undefined}
              />
              {l.cov && (
                <p className="text-right text-[10px] tabular-nums text-text-secondary">
                  {l.cov.done.toLocaleString("id-ID")} / {l.cov.total.toLocaleString("id-ID")} teks · diukur {fmt(l.cov.at)}
                </p>
              )}
            </div>
            {l.missing.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[10px] text-text-secondary">
                  {l.missing.length} teks UI masih berbahasa Inggris
                </summary>
                <ul className="mt-1 space-y-0.5">
                  {l.missing.map((m, i) => (
                    <li key={i} className="truncate text-[10px] text-text-secondary">
                      · {m}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>

      <p className="text-[10px] leading-relaxed text-text-secondary">
        Bahasa dengan <b>situs sendiri</b> (1fr.fr, tilawa.de, xad.es, dawa.im) dibaca di situsnya masing-masing.
        ulyah.com sendiri tetap berbahasa Indonesia; bahasa lain yang sudah ✓ LENGKAP siap dinyalakan kapan pun
        diputuskan. Detail mesin: <code>docs/TRANSLATION-ENGINE.md</code>.
      </p>
    </section>
  );
}
