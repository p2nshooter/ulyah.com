"use client";

import { useEffect, useRef } from "react";
import { RECITERS, resolveAyahAudioUrl, resolveSurahAudioUrl } from "@/lib/qori-cdn";
import { computeKhatamIndex } from "@/lib/radio-clock";
import { usePlayerStore } from "@/lib/player-store";
import { useRadioStore, ensureSurahsLoaded } from "@/lib/radio-store";

/**
 * The one place the Radio Qori <audio> element lives — mounted ONCE in the
 * root locale layout, so it is never unmounted by in-app navigation and the
 * broadcast keeps playing across pages until the visitor stops it manually
 * ("ga boleh mati walaupun pindah halaman kecuali dimatikan manual"). It owns
 * no UI of its own (the visible controls live in RadioQoriWidget, a thin view
 * over the same store); it only performs the playback side-effects the store
 * decides on. Autoplay-with-sound is blocked without a gesture, so the very
 * first play starts muted with a one-tap unmute prompt — same behaviour as
 * before, just lifted out of the page component.
 */
export function GlobalRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const autoStartedRef = useRef(false);

  const surahs = useRadioStore((s) => s.surahs);
  const position = useRadioStore((s) => s.position);
  const playing = useRadioStore((s) => s.playing);
  const muted = useRadioStore((s) => s.muted);
  const gen = useRadioStore((s) => s.gen);

  // Load the surah index once, app-wide.
  useEffect(() => {
    ensureSurahsLoaded();
  }, []);

  // Auto-start the broadcast once per fresh page load (muted if the browser
  // blocks sound), so the radio "otomatis jalan". A manual stop is respected:
  // we only ever auto-start a single time, never re-start after a stop.
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (surahs.length === 0) return;
    autoStartedRef.current = true;
    if (!useRadioStore.getState().playing) useRadioStore.getState().start();
  }, [surahs.length]);

  // Keep the wall-clock khatam counter ticking while anything is mounted.
  useEffect(() => {
    if (surahs.length === 0) return;
    const update = () => useRadioStore.getState().setKhatamCount(computeKhatamIndex(surahs));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [surahs.length]);

  // Main playback side-effect: whenever the store says we should be playing
  // (or the position/generation changed), resolve the CDN url and play it —
  // unmuted first, falling back to muted autoplay if the browser blocks it.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!playing) {
      audio.pause();
      return;
    }
    let cancelled = false;
    (async () => {
      const rc = RECITERS.find((r) => r.key === position.reciterKey);
      const src =
        rc?.cdn === "surah"
          ? resolveSurahAudioUrl(position.reciterKey, position.surahId)
          : await resolveAyahAudioUrl(position.reciterKey, position.surahId, position.ayahNumber);
      if (cancelled) return;
      if (!src) {
        // Nothing playable here — skip straight to the next position.
        useRadioStore.getState().advance();
        return;
      }
      audio.src = src;
      audio.muted = false;
      try {
        await audio.play();
        if (cancelled) return;
        useRadioStore.getState().setPlaybackState({ playing: true, needsInteraction: false, muted: false });
        usePlayerStore.getState().pause(); // never two audio streams at once
        return;
      } catch {
        /* unmuted blocked — try muted */
      }
      if (cancelled) return;
      audio.muted = true;
      try {
        await audio.play();
        if (cancelled) return;
        useRadioStore.getState().setPlaybackState({ needsInteraction: false, muted: true });
        usePlayerStore.getState().pause();
      } catch {
        if (cancelled) return;
        useRadioStore.getState().setPlaybackState({ playing: false, needsInteraction: true, muted: false });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, gen, position.reciterKey, position.surahId, position.ayahNumber]);

  // React to an unmute intent from the controls without reloading playback.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!muted && playing) {
      audio.muted = false;
      if (audio.paused) audio.play().catch(() => {});
    }
  }, [muted, playing]);

  return (
    <audio
      ref={audioRef}
      onEnded={() => useRadioStore.getState().advance()}
      className="hidden"
      aria-hidden
    />
  );
}
