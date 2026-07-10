"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { usePlayerStore } from "@/lib/player-store";
import { RECITERS, DEFAULT_QORI_KEY, resolveAyahAudioUrl, resolveSurahAudioUrl } from "@/lib/qori-cdn";
import { radioLabels } from "@/lib/radio-labels";
import { computeLivePosition, computeLiveBroadcast, computeKhatamIndex } from "@/lib/radio-clock";

// The default "auto" station rotates through the world-renowned reciters —
// one full khatam per voice — rather than reciting forever in a single
// voice. A visitor who explicitly picks a reciter pins that channel instead
// (see switchReciter) and stops rotating.
const ROTATION_POOL = RECITERS.filter((r) => r.featured).map((r) => r.key);

interface SurahMeta {
  id: number;
  name_transliteration: string;
  name_ar: string;
  ayah_count: number;
}

interface Position {
  reciterKey: string;
  surahId: number;
  ayahNumber: number;
}

const RECITER_STORAGE_KEY = "ulyah_radio_reciter";

/** null means "no pinned favorite yet" — the default rotating station. */
function loadReciterKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(RECITER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveReciterKey(key: string) {
  try {
    window.localStorage.setItem(RECITER_STORAGE_KEY, key);
  } catch {
    /* quota exceeded — fine, just won't remember the preference */
  }
}

/**
 * "Radio Qori Dunia" — an always-on Qur'an recitation stream for the landing
 * page, aimed at mosques who want to leave a reciter's voice running all
 * day. Loops through the entire Qur'an (Al-Fatihah -> An-Nas -> back to
 * Al-Fatihah) indefinitely until the visitor stops it or changes reciter.
 *
 * This behaves like a real broadcast, not a personal bookmark: it "keeps
 * running" even when nobody's listening, via a shared virtual clock
 * (computeLivePosition) that every visitor computes identically from the
 * current time. A fresh visitor (or a reload) always joins wherever the
 * station currently is — never restarted at Al-Fatihah ayah 1 — the same
 * way tuning into a real radio station drops you into the middle of
 * whatever's already playing. Only the reciter (channel) choice is
 * remembered across visits; the position itself is never "resumed".
 *
 * Browsers block audio-with-sound autoplay without a user gesture, so the
 * very first play always needs one tap; every subsequent ayah/surah then
 * auto-advances on its own (`ended` -> immediately load + play the next
 * one), which satisfies "runs 24 hours nonstop" in the way browsers actually
 * allow.
 */
export function RadioQoriWidget({ locale }: { locale: string }) {
  const t = radioLabels(locale);
  const audioRef = useRef<HTMLAudioElement>(null);
  const posRef = useRef<Position>({ reciterKey: loadReciterKey() ?? DEFAULT_QORI_KEY, surahId: 1, ayahNumber: 1 });
  const genRef = useRef(0);
  const joinedLiveRef = useRef(false);
  // true = follow the default rotating "auto" station; false = pinned to a
  // reciter the visitor explicitly chose (see switchReciter).
  const autoRotateRef = useRef(loadReciterKey() === null);

  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [position, setPosition] = useState<Position>(posRef.current);
  const [playing, setPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [khatamCount, setKhatamCount] = useState(0);

  useEffect(() => {
    api
      .get<{ surah: SurahMeta[] }>("/quran/surah")
      .then((r) => setSurahs(r.surah))
      .catch(() => {});
  }, []);

  // The khatam counter is a pure function of wall-clock time (see
  // radio-clock.ts) — it keeps climbing for as long as the site exists,
  // whether or not this tab (or anyone else's) is actually open. Refreshed
  // periodically purely so a tab left open visibly ticks it up in real time.
  useEffect(() => {
    if (surahs.length === 0) return;
    const update = () => setKhatamCount(computeKhatamIndex(surahs));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [surahs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const reciter = RECITERS.find((r) => r.key === position.reciterKey) ?? RECITERS.find((r) => r.key === DEFAULT_QORI_KEY)!;
  const surahMeta = surahs.find((s) => s.id === position.surahId);

  function nextPosition(p: Position): Position {
    const rc = RECITERS.find((r) => r.key === p.reciterKey) ?? reciter;
    if (rc.cdn === "surah") {
      const nextSurah = p.surahId >= 114 ? 1 : p.surahId + 1;
      return { ...p, surahId: nextSurah, ayahNumber: 1 };
    }
    const count = surahs.find((s) => s.id === p.surahId)?.ayah_count ?? 999;
    if (p.ayahNumber < count) return { ...p, ayahNumber: p.ayahNumber + 1 };
    const nextSurah = p.surahId >= 114 ? 1 : p.surahId + 1;
    return { ...p, surahId: nextSurah, ayahNumber: 1 };
  }

  async function loadAndPlay(p: Position, myGen: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const rc = RECITERS.find((r) => r.key === p.reciterKey) ?? reciter;
    const src = rc.cdn === "surah" ? resolveSurahAudioUrl(p.reciterKey, p.surahId) : await resolveAyahAudioUrl(p.reciterKey, p.surahId, p.ayahNumber);
    if (myGen !== genRef.current) return; // a newer request superseded this one
    if (!src) {
      // Nothing playable for this position — skip straight to the next one
      // rather than stalling the "24 hours nonstop" stream.
      const next = nextPosition(p);
      posRef.current = next;
      setPosition(next);
      loadAndPlay(next, myGen);
      return;
    }
    audio.src = src;
    try {
      await audio.play();
      if (myGen !== genRef.current) return;
      setPlaying(true);
      setNeedsInteraction(false);
      usePlayerStore.getState().pause(); // never two audio streams at once
    } catch {
      if (myGen !== genRef.current) return;
      setPlaying(false);
      setNeedsInteraction(true);
    }
  }

  /** Recompute "where the station is right now" and adopt it as the current
   * position — called every time playback (re)starts, never during a
   * continuous listening session. This is what makes the station behave
   * like a real broadcast rather than a personal bookmark: stopping only
   * silences this one device, and pressing play again always rejoins
   * live, wherever the station has moved on to in the meantime. */
  function joinLive(): Position {
    const pinned = loadReciterKey();
    let next: Position;
    if (pinned) {
      autoRotateRef.current = false;
      next = { reciterKey: pinned, ...computeLivePosition(surahs) };
    } else {
      autoRotateRef.current = true;
      const b = computeLiveBroadcast(surahs, ROTATION_POOL);
      next = { reciterKey: b.reciterKey, surahId: b.surahId, ayahNumber: b.ayahNumber };
    }
    posRef.current = next;
    setPosition(next);
    return next;
  }

  function start() {
    const next = joinLive();
    genRef.current += 1;
    loadAndPlay(next, genRef.current);
  }

  function stop() {
    // Only stops audio on this device — the shared broadcast clock keeps
    // advancing regardless, so a later "start" rejoins live, not here.
    genRef.current += 1;
    audioRef.current?.pause();
    setPlaying(false);
  }

  function handleEnded() {
    const prev = posRef.current;
    let next = nextPosition(prev);
    const completedKhatam = prev.surahId >= 114 && next.surahId === 1 && next.ayahNumber === 1;
    if (completedKhatam && autoRotateRef.current && ROTATION_POOL.length > 0) {
      const idx = Math.max(0, ROTATION_POOL.indexOf(prev.reciterKey));
      const nextReciter = ROTATION_POOL[(idx + 1) % ROTATION_POOL.length]!;
      next = { ...next, reciterKey: nextReciter };
    }
    posRef.current = next;
    setPosition(next);
    loadAndPlay(next, genRef.current);
  }

  function switchReciter(key: string) {
    // Switching reciter pins that channel (stops auto-rotation) and joins
    // it at the current live position — like switching to a different
    // channel of the same ongoing broadcast, not restarting from scratch.
    autoRotateRef.current = false;
    saveReciterKey(key);
    const next: Position = { reciterKey: key, ...computeLivePosition(surahs) };
    posRef.current = next;
    setPosition(next);
    setShowPicker(false);
    if (playing || !needsInteraction) {
      genRef.current += 1;
      loadAndPlay(next, genRef.current);
    }
  }

  // Once surah metadata is ready, join the live broadcast at its current
  // position (never at Al-Fatihah ayah 1) and try to autoplay — this
  // succeeds if the page load still carries a "user has interacted with the
  // site" grant from browser autoplay heuristics (common on a repeat
  // visit); otherwise the tap prompt below handles it.
  useEffect(() => {
    if (surahs.length > 0 && !joinedLiveRef.current) {
      joinedLiveRef.current = true;
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahs.length > 0]);

  const featured = RECITERS.filter((r) => r.featured);
  const others = RECITERS.filter((r) => !r.featured);

  return (
    <section className="relative rounded-3xl border border-accent/30 bg-gradient-to-br from-[#06251b] to-[#0B3D2E] p-6 text-[#f4efe3] shadow-xl sm:p-8">
      <audio ref={audioRef} onEnded={handleEnded} className="hidden" />
      {/* rounded-3xl (matching the section) instead of relying on the
          section's own overflow-hidden to clip this — overflow-hidden on
          the section also clipped the reciter picker dropdown below,
          making the lower reciters unreachable. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(184,137,43,0.7), transparent 55%)",
        }}
      />
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
            {reciter.cdn === "surah" ? ` (${t.wholeSurah})` : ` : ${position.ayahNumber}`}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="rounded-full border border-accent/40 px-4 py-2 text-xs font-medium hover:border-accent"
          >
            🎙️ {t.chooseReciter}
          </button>
          {showPicker && (
            <div className="absolute right-0 top-full z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-accent/25 bg-[#0b3d2e] p-2 shadow-2xl">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">{t.featuredGroup}</p>
              {featured.map((r) => (
                <button
                  key={r.key}
                  onClick={() => switchReciter(r.key)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-white/5 ${
                    r.key === position.reciterKey ? "bg-accent/10 text-accent" : ""
                  }`}
                >
                  <span>
                    {r.flag} {r.name} <span className="opacity-50">· {r.country}</span>
                  </span>
                  {r.key === position.reciterKey && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-red-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> {t.nowPlaying}
                    </span>
                  )}
                </button>
              ))}
              <p className="mt-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">{t.allGroup}</p>
              {others.map((r) => (
                <button
                  key={r.key}
                  onClick={() => switchReciter(r.key)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-white/5 ${
                    r.key === position.reciterKey ? "bg-accent/10 text-accent" : ""
                  }`}
                >
                  <span>
                    {r.flag} {r.name} <span className="opacity-50">· {r.country}</span>
                  </span>
                  {r.key === position.reciterKey && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-red-300">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> {t.nowPlaying}
                    </span>
                  )}
                </button>
              ))}
            </div>
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

      <p className="relative mt-4 text-center text-[10px] leading-relaxed text-[#f4efe3]/50">{t.khatamRotationNote}</p>
    </section>
  );
}
