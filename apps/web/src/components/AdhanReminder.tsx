"use client";

import { useEffect, useRef, useState } from "react";
import { Coordinates, PrayerTimes } from "adhan";
import { api } from "@/lib/api";
import { prayerLabels } from "@/lib/prayer-labels";
import { COUNTRY_LOOKUP, DEFAULT_PRAYER_COUNTRY, type PrayerCountry } from "@/lib/prayer-countries";
import { useAdhanStore } from "@/lib/adhan-reminder-store";
import { useRadioStore } from "@/lib/radio-store";

type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
const PRAYERS: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

// The site's home country decides the fallback coordinates before geo resolves.
const TENANT_DEFAULT: Record<string, string> = { ulyah: "ID", "1fr": "FR", tilawa: "DE", dawa: "ES" };

// Short localized chrome — the reminder banner text and the toggle tooltip.
const L: Record<string, { time: (p: string) => string; on: string; off: string; enable: string; disable: string }> = {
  id: {
    time: (p) => `Waktu ${p} telah tiba — mari tunaikan sholat`,
    on: "Pengingat adzan: AKTIF",
    off: "Pengingat adzan: MATI",
    enable: "Nyalakan pengingat adzan",
    disable: "Matikan pengingat adzan",
  },
  en: {
    time: (p) => `It's time for ${p} — let's pray`,
    on: "Adhan reminder: ON",
    off: "Adhan reminder: OFF",
    enable: "Turn on adhan reminder",
    disable: "Turn off adhan reminder",
  },
  fr: {
    time: (p) => `C'est l'heure de ${p} — prions`,
    on: "Rappel d'adhan : ACTIVÉ",
    off: "Rappel d'adhan : DÉSACTIVÉ",
    enable: "Activer le rappel d'adhan",
    disable: "Désactiver le rappel d'adhan",
  },
  de: {
    time: (p) => `Es ist Zeit für ${p} — lasst uns beten`,
    on: "Adhan-Erinnerung: AN",
    off: "Adhan-Erinnerung: AUS",
    enable: "Adhan-Erinnerung einschalten",
    disable: "Adhan-Erinnerung ausschalten",
  },
  es: {
    time: (p) => `Es la hora del ${p} — oremos`,
    on: "Recordatorio de adán: ACTIVO",
    off: "Recordatorio de adán: APAGADO",
    enable: "Activar recordatorio de adán",
    disable: "Desactivar recordatorio de adán",
  },
  ar: {
    time: (p) => `حان وقت ${p} — هيا إلى الصلاة`,
    on: "تنبيه الأذان: مُفعّل",
    off: "تنبيه الأذان: مُطفأ",
    enable: "تشغيل تنبيه الأذان",
    disable: "إيقاف تنبيه الأذان",
  },
};
function labels(locale: string) {
  return L[locale] ?? L.en!;
}

// Public adhan recording (plays directly in the visitor's browser — no CORS
// needed for an <audio> element). If it can't load, a soft synthesized chime
// plays instead, so the reminder is never silent.
const ADHAN_URL = "https://www.islamcan.com/audio/adhan/azan2.mp3";

function playChime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    // Three gentle descending tones — a calm "call to attention", not a jingle.
    [880, 660, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.7;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });
    setTimeout(() => ctx.close().catch(() => {}), 2600);
  } catch {
    /* Web Audio unavailable — the on-screen banner is still shown */
  }
}

/**
 * Global adhan reminder. Mounted once in the locale layout (like the radio
 * player). Resolves the visitor's coordinates, computes today's prayer times
 * with the same `adhan` engine the Jadwal Sholat widget uses, and at each
 * prayer time (Fajr→Isha) plays the adhan and shows a brief banner — but only
 * while the visitor has it enabled (default on, OFF is remembered forever).
 */
export function AdhanReminder({ locale }: { locale: string }) {
  const enabled = useAdhanStore((s) => s.enabled);
  const hydrate = useAdhanStore((s) => s.hydrate);
  const setEnabled = useAdhanStore((s) => s.setEnabled);
  const t = labels(locale);
  const pt = prayerLabels(locale);

  const [country, setCountry] = useState<PrayerCountry>(
    () => COUNTRY_LOOKUP[TENANT_DEFAULT[process.env.NEXT_PUBLIC_TENANT ?? "ulyah"] ?? "ID"] ?? DEFAULT_PRAYER_COUNTRY
  );
  const [firedBanner, setFiredBanner] = useState<{ key: PrayerKey; at: number } | null>(null);
  const firedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => hydrate(), [hydrate]);

  // Resolve real coordinates once (best-effort — falls back to the tenant's
  // home country until it does).
  useEffect(() => {
    api
      .get<{ country: string | null; latitude: number | null; longitude: number | null; timezone: string | null }>(
        "/geo/me"
      )
      .then((g) => {
        const base = g.country ? COUNTRY_LOOKUP[g.country] : undefined;
        if (g.latitude && g.longitude) {
          setCountry((c) => ({
            ...(base ?? c),
            lat: g.latitude!,
            lng: g.longitude!,
            tz: g.timezone ?? base?.tz ?? c.tz,
          }));
        } else if (base) {
          setCountry(base);
        }
      })
      .catch(() => {});
  }, []);

  // Prayer name in the visitor's language.
  const prayerName = (k: PrayerKey) => (pt as unknown as Record<string, string>)[k] ?? k;

  function fire(key: PrayerKey) {
    // Never sound over the radio — stop it first (mutual exclusion), same rule
    // the rest of the audio system follows.
    try {
      if (useRadioStore.getState().playing) useRadioStore.getState().stop();
    } catch {
      /* non-fatal */
    }
    // Try the real adhan; fall back to the synthesized chime on any failure.
    try {
      const a = new Audio(ADHAN_URL);
      a.volume = 0.9;
      audioRef.current = a;
      a.play().catch(() => playChime());
      a.onerror = () => playChime();
    } catch {
      playChime();
    }
    // OS-level notification when the visitor has granted it (works even when
    // the tab is backgrounded).
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🕌 " + prayerName(key), { body: t.time(prayerName(key)), silent: false });
      }
    } catch {
      /* notifications unavailable */
    }
    setFiredBanner({ key, at: Date.now() });
    setTimeout(() => setFiredBanner((b) => (b && b.key === key ? null : b)), 60_000);
  }

  // The reminder loop: every 20s, check whether a prayer time was crossed
  // since the last check and hasn't fired yet today. A per-day-per-prayer key
  // guarantees each prayer fires exactly once, even across background/resume.
  useEffect(() => {
    if (enabled !== true) return;
    // Ask for notification permission once, right after the visitor keeps it on.
    try {
      if ("Notification" in window && Notification.permission === "default") {
        void Notification.requestPermission().catch(() => {});
      }
    } catch {
      /* ignore */
    }

    const coords = new Coordinates(country.lat, country.lng);
    const check = () => {
      const now = new Date();
      const dayStr = now.toDateString();
      const times = new PrayerTimes(coords, now, country.method());
      for (const key of PRAYERS) {
        const time = times.timeForPrayer(key);
        if (!time) continue;
        const fireKey = `${dayStr}:${key}`;
        // Fire within a 90-second window after the prayer moment (checks run
        // every 20s), and only once per prayer per day.
        const delta = now.getTime() - time.getTime();
        if (delta >= 0 && delta < 90_000 && !firedRef.current.has(fireKey)) {
          firedRef.current.add(fireKey);
          fire(key);
        }
      }
      // Keep the fired-set from growing without bound across days.
      if (firedRef.current.size > 40) firedRef.current = new Set();
    };
    check();
    const id = setInterval(check, 20_000);
    const onVis = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, country.lat, country.lng, country.tz]);

  // Nothing renders until hydrated (keeps SSR/CSR markup identical).
  if (enabled === null) return null;

  return (
    <>
      {firedBanner && (
        <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-4">
          <div className="flex items-center gap-3 rounded-full border border-accent/40 bg-[color-mix(in_srgb,var(--color-primary)_92%,transparent)] px-5 py-2.5 text-sm font-medium text-[#f4efe3] shadow-2xl backdrop-blur">
            <span className="text-lg" aria-hidden>🕌</span>
            <span>{t.time(prayerName(firedBanner.key))}</span>
            <button
              onClick={() => {
                audioRef.current?.pause();
                setFiredBanner(null);
              }}
              className="rounded-full border border-[#f4efe3]/30 px-2 py-0.5 text-xs hover:bg-white/10"
              aria-label="✕"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Always-visible ON/OFF for the adhan reminder, mirrored opposite the
          radio button so both live-audio controls are reachable from any page.
          Default ON; once OFF it stays OFF across reloads and app open/close. */}
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        aria-label={enabled ? t.on : t.off}
        title={enabled ? t.disable : t.enable}
        className="fixed bottom-16 left-4 z-40 flex items-center gap-1.5 rounded-full border border-accent/40 bg-[color-mix(in_srgb,var(--color-primary)_90%,transparent)] px-3 py-2 text-xs font-medium text-[#f4efe3] shadow-lg backdrop-blur transition hover:border-accent hover:bg-[var(--color-primary)]"
      >
        <span aria-hidden>🕌</span>
        {enabled ? (
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
