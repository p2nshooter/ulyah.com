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
  // blocks sound), so the radio "otomatis jalan" — but ONLY if the visitor has
  // never explicitly turned it off. A persisted OFF (localStorage, see
  // radio-store) is honoured across reloads: once stopped it stays silent on
  // every page until the visitor presses play again ("klo sudah di off jgn
  // hidup sampai di on").
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (surahs.length === 0) return;
    autoStartedRef.current = true;
    const st = useRadioStore.getState();
    if (!st.playing && !st.userDisabled) st.start();
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

  // Recover from mobile OSes silently killing background audio during a long
  // screen-lock/sleep — "radio quran sering mati sendiri klo sleep lama".
  // Without this, the store still believes `playing: true` but the real
  // <audio> element sits paused with no code path ever noticing, so the
  // broadcast just stays dead until the visitor manually stops/starts it.
  // Two complementary checks: an immediate one when the tab regains
  // visibility/focus (the common case — screen unlock, switching back), and a
  // slow periodic watchdog (some mobile browsers report the page as still
  // "visible" even while the screen is off, so visibilitychange alone isn't
  // reliable). Re-running start() — not just audio.play() — is deliberate:
  // this is framed as a *live* broadcast synced to the wall clock, so coming
  // back after a long gap should rejoin wherever the broadcast is *now*,
  // exactly like pressing play again after a manual stop, rather than
  // resuming a possibly hours-stale ayah.
  useEffect(() => {
    const resyncIfDead = () => {
      const audio = audioRef.current;
      if (!audio || !useRadioStore.getState().playing) return;
      if (audio.paused) useRadioStore.getState().start();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") resyncIfDead();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", resyncIfDead);
    window.addEventListener("pageshow", resyncIfDead);
    const watchdog = setInterval(resyncIfDead, 20_000);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", resyncIfDead);
      window.removeEventListener("pageshow", resyncIfDead);
      clearInterval(watchdog);
    };
  }, []);

  // Media Session metadata + playback state — tells the OS/browser this is a
  // legitimate ongoing media session (lock-screen/notification controls, and
  // on Android/Chrome specifically, one of the signals that make background
  // audio less likely to be suspended at all during screen-lock).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const rc = RECITERS.find((r) => r.key === position.reciterKey);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Radio Qori Dunia",
      artist: rc?.name ?? "ULYAH.COM",
      album: "ULYAH.COM",
      artwork: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    });
    navigator.mediaSession.setActionHandler("play", () => {
      if (!useRadioStore.getState().playing) useRadioStore.getState().start();
    });
    navigator.mediaSession.setActionHandler("pause", () => useRadioStore.getState().stop());
    navigator.mediaSession.setActionHandler("nexttrack", () => useRadioStore.getState().advance());
  }, [position.reciterKey]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={() => useRadioStore.getState().advance()}
        className="hidden"
        aria-hidden
      />
      {/* Always-visible ON/OFF for the radio, on every page — so the visitor
          can silence (or resume) the broadcast from anywhere, and the state is
          remembered across navigation and reloads. Deliberately icon-only to
          stay language-neutral across all 8 locales. */}
      <button
        type="button"
        onClick={() => (playing ? useRadioStore.getState().stop() : useRadioStore.getState().start())}
        aria-label={playing ? "Radio Qur'an: OFF" : "Radio Qur'an: ON"}
        title={playing ? "Matikan Radio Qur'an" : "Nyalakan Radio Qur'an"}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border border-accent/40 bg-[#0B3D2E]/90 px-3 py-2 text-xs font-medium text-[#f4efe3] shadow-lg backdrop-blur transition hover:border-accent hover:bg-[#0B3D2E]"
      >
        <span aria-hidden>📻</span>
        {playing ? (
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="tabular-nums">ON</span>
          </span>
        ) : (
          <span className="text-[#f4efe3]/70">OFF</span>
        )}
      </button>
    </>
  );
}
