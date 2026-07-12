"use client";

import { useEffect, useMemo, useState } from "react";
import { Coordinates, PrayerTimes } from "adhan";
import { api } from "@/lib/api";
import { imsakiyahLabels } from "@/lib/imsakiyah-labels";
import {
  COUNTRY_LOOKUP,
  DEFAULT_PRAYER_COUNTRY,
  type PrayerCountry,
} from "@/lib/prayer-countries";
import { toHijri, ramadanStartFor } from "@/lib/hijri";
import { AdSlot } from "@/components/AdSlot";

interface GeoResponse {
  country: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

const IMSAK_BUFFER_MIN = 10;

function hmIn(tz: string, date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Ramadan Imsakiyah — one row per day of the current-or-next Ramadan, each
 * computed the same way as PrayerTimesWidget (adhan.js against the
 * visitor's IP-detected coordinates), not a second/independent calculation.
 * Imsak itself isn't a fiqh-fixed moment the way Fajr is, so it's shown as
 * the common "10 minutes before Fajr" precaution with an explicit note —
 * never presented as the one correct answer (see CONTENT-POLICY.md).
 */
export function ImsakiyahCalendar({ locale }: { locale: string }) {
  const t = imsakiyahLabels(locale);
  const [country, setCountry] = useState<PrayerCountry>(DEFAULT_PRAYER_COUNTRY);
  const [locating, setLocating] = useState(true);
  const [cityLabel, setCityLabel] = useState<string | null>(null);
  const [now] = useState<Date>(() => new Date());

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

  const { days, alreadyStarted } = useMemo(() => {
    const start = ramadanStartFor(now);
    const coords = new Coordinates(country.lat, country.lng);
    const rows: { date: Date; hijriDay: number; imsak: Date; fajr: Date; maghrib: Date }[] = [];
    let cursor = start;
    for (let i = 0; i < 30; i++) {
      const h = toHijri(cursor);
      if (h.month !== 9) break;
      const times = new PrayerTimes(coords, cursor, country.method());
      rows.push({
        date: cursor,
        hijriDay: h.day,
        imsak: new Date(times.fajr.getTime() - IMSAK_BUFFER_MIN * 60_000),
        fajr: times.fajr,
        maghrib: times.maghrib,
      });
      cursor = addDays(cursor, 1);
    }
    return { days: rows, alreadyStarted: toHijri(now).month === 9 };
  }, [now, country]);

  return (
    <div className="space-y-4">
      <p className="text-center text-xs text-accent">
        📍 {locating ? t.locating : `${country.flag} ${cityLabel ?? country.city}`}
      </p>

      {!alreadyStarted && <p className="text-center text-xs text-[var(--color-text-secondary)]">{t.countingDown}</p>}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-black/5 text-xs">
              <th className="px-3 py-2 text-left font-medium">{t.dayLabel}</th>
              <th className="px-3 py-2 text-right font-medium">{t.imsakLabel}</th>
              <th className="px-3 py-2 text-right font-medium">{t.fajrLabel}</th>
              <th className="px-3 py-2 text-right font-medium">{t.maghribLabel}</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date.toDateString()} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-2 tabular-nums">{d.hijriDay}</td>
                <td className="px-3 py-2 text-right tabular-nums text-accent">{hmIn(country.tz, d.imsak)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{hmIn(country.tz, d.fajr)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{hmIn(country.tz, d.maghrib)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdSlot position="imsakiyah-mid" />

      <p className="text-center text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{t.disclaimer}</p>
    </div>
  );
}
