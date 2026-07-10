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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
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

  const nextKey = times.nextPrayer(now) as PrayerKey | "none";
  const hijri = toHijri(now);
  const monthNames = locale === "id" ? HIJRI_MONTH_NAMES_ID : HIJRI_MONTH_NAMES_EN;
  const gregorian = new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "id" ? "id-ID" : "en-US", {
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
            <p className="font-heading text-2xl leading-none text-accent tabular-nums">{hmIn(country.tz, now)}</p>
            <p className="mt-1 text-[10px] text-[#f4efe3]/70">{gregorian}</p>
            <p className="mt-0.5 text-[10px] text-[#f4efe3]/70">
              {hijri.day} {monthNames[hijri.month - 1]} {hijri.year} H
            </p>
          </div>
        </div>

        {/* Prayer time tiles */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {PRAYER_ORDER.map((key) => {
            const d = times.timeForPrayer(key);
            const active = key === nextKey;
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
                <p className="mt-0.5 font-heading text-sm tabular-nums">{timeIn(c.tz, now)}</p>
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
