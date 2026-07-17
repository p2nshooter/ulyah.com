"use client";

import { useEffect, useMemo, useState } from "react";
import { Coordinates, PrayerTimes } from "adhan";
import { api } from "@/lib/api";
import { prayerLabels } from "@/lib/prayer-labels";
import { nasehatList } from "@/lib/nasehat";
import { NasehatTicker } from "@/components/NasehatTicker";
import {
  CLOCK_COUNTRIES,
  COUNTRY_LOOKUP,
  DEFAULT_PRAYER_COUNTRY,
  type PrayerCountry,
} from "@/lib/prayer-countries";
import { toHijri, ramadanPhase, formatCountdown, HIJRI_MONTH_NAMES_ID, HIJRI_MONTH_NAMES_EN, type RamadanPhase } from "@/lib/hijri";

interface GeoResponse {
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

const PRAYER_ORDER = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = (typeof PRAYER_ORDER)[number];

function timeIn(tz: string, date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
}

function hmIn(tz: string, date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

/**
 * "Jadwal Sholat" — prayer times locked to the visitor's own IP-detected
 * location (never a manual country picker, unlike the Radio's reciter
 * filter), a live Hijri/Gregorian clock, a Ramadan/Nuzul al-Qur'an
 * countdown, a handful of world clocks (Makkah first), and a scrolling
 * ticker of short reminders. Meant to also work as the content of the
 * standalone installable /jadwal-sholat mini-app (see that page's own
 * manifest), so it never assumes it's the only thing on the page.
 */
export function PrayerTimesWidget({ locale }: { locale: string }) {
  const t = prayerLabels(locale);
  const [country, setCountry] = useState<PrayerCountry>(DEFAULT_PRAYER_COUNTRY);
  const [locating, setLocating] = useState(true);
  const [cityLabel, setCityLabel] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [phase, setPhase] = useState<RamadanPhase | null>(null);
  // The very first client render must show the exact same digits the server
  // rendered, or React discards and rebuilds this whole subtree (a visible
  // flash) — see the "Hydration failed" warning this used to throw. `now`'s
  // initial value is computed independently on the server and in the
  // browser, seconds apart, so the clock/countdown digits almost always
  // differ. `mounted` keeps those specific digits frozen at a placeholder
  // through hydration, then swaps to the live value on the next tick.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Tick every second, but pause entirely while the tab/app is in the
  // background — a standalone installed app can sit open for hours, and a
  // per-second re-render nobody is watching just drains battery. Resumes
  // (and snaps to the true current time) the instant it's foregrounded.
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id === null) id = setInterval(() => setNow(new Date()), 1000);
    };
    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        setNow(new Date());
        start();
      }
    };
    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    api
      .get<GeoResponse>("/geo/me")
      .then((g) => {
        const base = g.country ? COUNTRY_LOOKUP[g.country] : undefined;
        if (g.latitude && g.longitude) {
          setCountry({
            code: g.country ?? base?.code ?? DEFAULT_PRAYER_COUNTRY.code,
            city: g.city ?? base?.city ?? DEFAULT_PRAYER_COUNTRY.city,
            flag: base?.flag ?? DEFAULT_PRAYER_COUNTRY.flag,
            lat: g.latitude,
            lng: g.longitude,
            tz: g.timezone ?? base?.tz ?? DEFAULT_PRAYER_COUNTRY.tz,
            method: base?.method ?? DEFAULT_PRAYER_COUNTRY.method,
          });
          setCityLabel(g.city ?? base?.city ?? null);
        } else if (base) {
          setCountry(base);
          setCityLabel(base.city);
        }
      })
      .catch(() => {})
      .finally(() => setLocating(false));
  }, []);

  const dayKey = now.toDateString();

  useEffect(() => {
    setPhase(ramadanPhase(now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]);

  const times = useMemo(
    () => new PrayerTimes(new Coordinates(country.lat, country.lng), now, country.method()),
    // Recomputed once per day (or when the resolved location changes) — not
    // on every second-tick, which would be wasteful for identical output.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [country, dayKey]
  );

  // A continuous timeline of prayer moments spanning yesterday's Isha through
  // tomorrow's Fajr, so the "next prayer" and progress bar stay correct
  // across the midnight/after-Isha boundary (adhan's nextPrayer() returns
  // "none" after Isha — this bridges to tomorrow's Fajr instead).
  const schedule = useMemo(() => {
    const coords = new Coordinates(country.lat, country.lng);
    const dayAt = (offset: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      return new PrayerTimes(coords, d, country.method());
    };
    const yesterday = dayAt(-1);
    const tomorrow = dayAt(1);
    const entries: { key: PrayerKey; time: Date }[] = [{ key: "isha", time: yesterday.isha }];
    for (const k of PRAYER_ORDER) entries.push({ key: k, time: times.timeForPrayer(k)! });
    entries.push({ key: "fajr", time: tomorrow.fajr });
    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, dayKey, times]);

  const nowMs = now.getTime();
  let prevMoment = schedule[0]!;
  let nextMoment = schedule[schedule.length - 1]!;
  for (const e of schedule) if (e.time.getTime() <= nowMs) prevMoment = e;
  for (const e of schedule) {
    if (e.time.getTime() > nowMs) {
      nextMoment = e;
      break;
    }
  }
  const nextKey = nextMoment.key;
  const msToNext = Math.max(0, nextMoment.time.getTime() - nowMs);
  const gap = nextMoment.time.getTime() - prevMoment.time.getTime();
  const progress = gap > 0 ? Math.min(1, Math.max(0, (nowMs - prevMoment.time.getTime()) / gap)) : 0;
  const cd = {
    hours: Math.floor(msToNext / 3_600_000),
    minutes: Math.floor((msToNext % 3_600_000) / 60_000),
    seconds: Math.floor((msToNext % 60_000) / 1000),
  };
  const hijri = toHijri(now);
  const monthNames = locale === "id" ? HIJRI_MONTH_NAMES_ID : HIJRI_MONTH_NAMES_EN;
  // Use the visitor's actual language for the Gregorian date so fr/de render
  // native weekday/month names (not an English fallback).
  const intlLocale =
    ({ id: "id-ID", ar: "ar", fr: "fr-FR", de: "de-DE" } as Record<string, string>)[locale] ?? "en-US";
  const gregorian = new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: country.tz,
  }).format(now);

  const prayerLabelMap: Record<PrayerKey, string> = {
    fajr: t.fajr,
    sunrise: t.sunrise,
    dhuhr: t.dhuhr,
    asr: t.asr,
    maghrib: t.maghrib,
    isha: t.isha,
  };

  return (
    <section className="relative rounded-3xl border border-accent/30 bg-gradient-to-br from-[#06251b] to-[#0B3D2E] text-[#f4efe3] shadow-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-[0.08]"
        style={{ backgroundImage: "radial-gradient(circle at 85% 15%, rgba(184,137,43,0.7), transparent 55%)" }}
      />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl">🕌 {t.title}</h2>
            <p className="mt-1 text-xs text-[#f4efe3]/70 sm:text-sm">{t.subtitle}</p>
            <p className="mt-2 text-xs text-accent">
              📍 {locating ? t.locating : `${country.flag} ${cityLabel ?? country.city}`}
            </p>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-white/5 px-4 py-2 text-right">
            <p className="font-heading text-2xl leading-none text-accent tabular-nums">
              {mounted ? hmIn(country.tz, now) : "--:--"}
            </p>
            <p className="mt-1 text-[10px] text-[#f4efe3]/70">{gregorian}</p>
            <p className="mt-0.5 text-[10px] text-[#f4efe3]/70">
              {hijri.day} {monthNames[hijri.month - 1]} {hijri.year} H
            </p>
          </div>
        </div>

        {/* Prominent countdown to the next prayer — the single most useful
            thing a prayer widget can show: how long until the next salah. */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-accent/40 bg-accent/10">
          <div className="flex items-center justify-between px-4 pt-3">
            <p className="text-xs text-[#f4efe3]/70">
              {t.untilNext} <span className="font-heading text-accent">{prayerLabelMap[nextKey]}</span>
              {" · "}
              <span className="tabular-nums">{mounted ? hmIn(country.tz, nextMoment.time) : "--:--"}</span>
            </p>
            <p className="font-heading text-2xl tabular-nums text-accent">
              {mounted
                ? `${cd.hours > 0 ? `${String(cd.hours).padStart(2, "0")}:` : ""}${String(cd.minutes).padStart(2, "0")}:${String(cd.seconds).padStart(2, "0")}`
                : "--:--"}
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full bg-white/10">
            <div
              className="h-full rounded-r-full bg-accent transition-[width] duration-1000 ease-linear"
              style={{ width: `${mounted ? Math.round(progress * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Prayer time tiles */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PRAYER_ORDER.map((key) => {
            const d = times.timeForPrayer(key);
            const active = mounted && key === nextKey;
            return (
              <div
                key={key}
                className={`rounded-xl border px-2 py-3 text-center ${active ? "border-accent bg-accent/15" : "border-white/10 bg-white/5"}`}
              >
                <p className={`text-[10px] uppercase tracking-wide ${active ? "text-accent" : "text-[#f4efe3]/60"}`}>
                  {prayerLabelMap[key]}
                </p>
                <p className="mt-1 font-heading text-sm tabular-nums sm:text-base">{d ? hmIn(country.tz, d) : "—"}</p>
                {active && <p className="mt-0.5 text-[9px] text-accent">{t.nextPrayer}</p>}
              </div>
            );
          })}
        </div>

        {/* Ramadan / Nuzul al-Qur'an countdown */}
        {phase && (
          <div className="mt-6 rounded-2xl border border-accent/25 bg-white/5 px-4 py-3 text-center">
            {phase.phase === "after-nuzul" ? (
              <p className="text-sm">🌙 {t.nuzulPassedNote}</p>
            ) : (
              <>
                <p className="text-xs text-[#f4efe3]/70">
                  {phase.phase === "before-nuzul" ? t.countdownToNuzul : t.countdownToRamadan}
                </p>
                <Countdown
                  target={phase.phase === "before-nuzul" ? phase.nuzululQuran : phase.nextRamadan}
                  now={now}
                  t={t}
                />
              </>
            )}
          </div>
        )}

        {/* World clocks — Makkah first */}
        <div className="mt-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{t.worldClocks}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CLOCK_COUNTRIES.map((c) => (
              <div key={c.code} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
                <p className="truncate text-[10px] text-[#f4efe3]/70">
                  {c.flag} {c.city}
                </p>
                <p className="mt-0.5 font-heading text-sm tabular-nums">{mounted ? timeIn(c.tz, now) : "--:--:--"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <NasehatTicker items={nasehatList(locale)} />
    </section>
  );
}

function Countdown({ target, now, t }: { target: Date; now: Date; t: ReturnType<typeof prayerLabels> }) {
  const { days, hours, minutes, seconds } = formatCountdown(target, now);
  const cells: [number, string][] = [
    [days, t.days],
    [hours, t.hours],
    [minutes, t.minutes],
    [seconds, t.seconds],
  ];
  return (
    <div className="mt-2 flex justify-center gap-3">
      {cells.map(([value, label]) => (
        <div key={label} className="min-w-[52px]">
          <p className="font-heading text-xl tabular-nums text-accent">{String(value).padStart(2, "0")}</p>
          <p className="text-[9px] uppercase text-[#f4efe3]/60">{label}</p>
        </div>
      ))}
    </div>
  );
}
