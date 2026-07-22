"use client";

import { useState } from "react";
import { RECITERS, DEFAULT_QORI_KEY } from "@/lib/qori-cdn";
import { radioLabels } from "@/lib/radio-labels";
import { useRadioStore, RADIO_ROTATION_KEYS } from "@/lib/radio-store";

/**
 * "Radio Qori Dunia" — the visible controls for the always-on Qur'an
 * recitation stream. This is now a THIN VIEW over the shared radio store:
 * the actual <audio> element and playback engine live in <GlobalRadioPlayer>
 * (mounted once in the root layout), so the broadcast keeps playing across
 * page navigation and only a manual stop halts it. This component just
 * reflects the store's state and calls its actions, so it can appear on any
 * page (or none) without ever owning or interrupting playback.
 *
 * Behaviour preserved from before: a shared virtual broadcast clock (every
 * visitor joins wherever the station currently is, never restarted at
 * Al-Fatihah 1), instant muted-autoplay with one-tap unmute, per-reciter
 * khatam rotation on a fixed station, and a live khatam counter.
 *
 * The reciter is deliberately NOT choosable here — "imam nya jgn bisa d
 * klik, biarkan saja berjalan berurutan" (the imam must not be clickable,
 * just let it run in sequence). The lineup below is an informational
 * read-only list of who is in the rotation and whose voice is on right now,
 * never a picker. (Choosing a qori is still available where it makes sense —
 * the Al-Qur'an Interaktif reader — this is specifically the shared live
 * broadcast, which by definition isn't any one listener's to redirect.)
 */
export function RadioQoriWidget({ locale }: { locale: string }) {
  const t = radioLabels(locale);
  const [showLineup, setShowLineup] = useState(false);

  const surahs = useRadioStore((s) => s.surahs);
  const position = useRadioStore((s) => s.position);
  const playing = useRadioStore((s) => s.playing);
  const needsInteraction = useRadioStore((s) => s.needsInteraction);
  const muted = useRadioStore((s) => s.muted);
  const khatamCount = useRadioStore((s) => s.khatamCount);
  const start = useRadioStore((s) => s.start);
  const stop = useRadioStore((s) => s.stop);
  const unmuteIntent = useRadioStore((s) => s.unmuteIntent);

  // Defensive: the store should always hold arrays/objects, but never let a
  // bad value here take the whole page down with an uncaught .find on undefined.
  const pos = position ?? { reciterKey: DEFAULT_QORI_KEY, surahId: 1, ayahNumber: 1 };
  const reciter =
    RECITERS.find((r) => r.key === pos.reciterKey) ?? RECITERS.find((r) => r.key === DEFAULT_QORI_KEY)!;
  const surahMeta = (surahs ?? []).find((s) => s.id === pos.surahId);

  // Show the ACTUAL rotation, in its playing order — not every featured
  // reciter. The radio only rotates the aqc/128kbps voices (same proven
  // R2-first path ulyah.com plays), so the lineup must match what the
  // station will really broadcast.
  const featured = RADIO_ROTATION_KEYS.map((k) => RECITERS.find((r) => r.key === k)).filter(
    (r): r is (typeof RECITERS)[number] => !!r
  );

  return (
    <section className="app-hero relative overflow-hidden rounded-3xl border border-accent/30 p-6 shadow-xl sm:p-8">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {playing && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-red-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> {t.liveBadge}
              </span>
            )}
            <h2 className="font-heading text-xl sm:text-2xl">📻 {t.title}</h2>
          </div>
          <p className="mt-1 text-xs text-[#f4efe3]/70 sm:text-sm">{t.subtitle}</p>
        </div>
        <div className="rounded-2xl border border-accent/30 bg-white/5 px-4 py-2 text-right">
          <p className="font-heading text-2xl leading-none text-accent tabular-nums">{khatamCount}×</p>
          <p className="mt-1 text-[10px] text-[#f4efe3]/70">
            {t.khatamCompleted} · {t.khatamInProgress}
            {khatamCount + 1}
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={playing ? stop : start}
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-accent text-2xl text-primary shadow-lg transition hover:brightness-110"
          aria-label={playing ? t.pause : t.play}
        >
          {playing ? "⏸" : "▶"}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {reciter.flag} {reciter.name}
            <span className="ml-1.5 text-xs opacity-60">· {reciter.country}</span>
          </p>
          <p className="mt-0.5 truncate text-xs text-[#f4efe3]/70">
            {t.nowPlaying}: {surahMeta?.name_transliteration ?? "…"}
            {reciter.cdn === "surah" ? ` (${t.wholeSurah})` : ` : ${pos.ayahNumber}`}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLineup((v) => !v)}
            aria-expanded={showLineup}
            className="rounded-full border border-accent/40 px-4 py-2 text-xs font-medium hover:border-accent"
          >
            {t.reciterLineup}
          </button>
          {showLineup && (
            // Rendered as a FIXED overlay, not an absolute dropdown: the card
            // section has overflow-hidden (needed for its rounded ornament
            // background), which clipped the old dropdown so the lineup
            // appeared squashed "inside" the card (owner: "harusnya ketika
            // diklik muncul di depan, bukan terlihat ada di dalam").
            <>
              <button
                aria-label="close"
                onClick={() => setShowLineup(false)}
                className="fixed inset-0 z-40 cursor-default bg-black/40"
              />
              <div className="fixed left-1/2 top-1/2 z-50 max-h-[70vh] w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-accent/25 bg-[var(--color-primary)] p-2 shadow-2xl">
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">{t.featuredGroup}</p>
                  <button onClick={() => setShowLineup(false)} aria-label="close" className="p-1 text-xs opacity-70 hover:opacity-100">
                    ✕
                  </button>
                </div>
                {featured.map((r) => (
                  <div
                    key={r.key}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs ${
                      r.key === pos.reciterKey ? "bg-accent/10 text-accent" : ""
                    }`}
                  >
                    <span>
                      {r.flag} {r.name} <span className="opacity-50">· {r.country}</span>
                    </span>
                    {r.key === pos.reciterKey && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-red-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> {t.nowPlaying}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {needsInteraction && !playing && (
        <button
          onClick={start}
          className="relative mt-5 w-full rounded-xl border border-dashed border-accent/50 py-3 text-center text-xs font-medium text-accent hover:bg-white/5"
        >
          ▶ {t.clickToStart}
        </button>
      )}

      {playing && muted && (
        <button
          onClick={unmuteIntent}
          className="relative mt-5 flex w-full animate-pulse items-center justify-center gap-2 rounded-xl border border-accent bg-accent/10 py-3 text-center text-xs font-medium text-accent hover:bg-accent/20"
        >
          🔊 {t.tapToUnmute}
        </button>
      )}

      <p className="relative mt-4 text-center text-[10px] leading-relaxed text-[#f4efe3]/50">{t.khatamRotationNote}</p>
    </section>
  );
}
