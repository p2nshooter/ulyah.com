"use client";

import { useMemo, useState } from "react";
import { toHijri, HIJRI_MONTH_NAMES_ID, HIJRI_MONTH_NAMES_EN } from "@/lib/hijri";
import { hijriCalendarLabels } from "@/lib/hijri-calendar-labels";
import { AdSlot } from "@/components/AdSlot";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Month-grid Hijri/Gregorian calendar — reuses the existing toHijri()
 * conversion (Intl's built-in islamic-umalqura calendar, already relied on
 * for the Ramadan countdown in PrayerTimesWidget) rather than a second
 * from-scratch algorithm. Navigates by Gregorian month since that's the
 * familiar grid shape; each cell shows both systems' day numbers.
 */
export function HijriCalendar({ locale }: { locale: string }) {
  const t = hijriCalendarLabels(locale);
  const monthNames = locale === "id" ? HIJRI_MONTH_NAMES_ID : HIJRI_MONTH_NAMES_EN;
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11

  const gregorianLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    return Array.from({ length: totalCells }, (_, i) => {
      const dayNum = i - startOffset + 1;
      const date = new Date(viewYear, viewMonth, dayNum);
      const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      return { date, inMonth, hijri: toHijri(date) };
    });
  }, [viewYear, viewMonth]);

  // Which Hijri month(s)/year this Gregorian month spans — usually one, but
  // a Gregorian month can straddle two Hijri months near its edges.
  const hijriHeader = useMemo(() => {
    const spans = new Set(cells.filter((c) => c.inMonth).map((c) => `${c.hijri.month}-${c.hijri.year}`));
    return [...spans].map((key) => {
      const [m, y] = key.split("-").map(Number);
      return `${monthNames[m! - 1]} ${y}H`;
    });
  }, [cells, monthNames]);

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => shiftMonth(-1)} className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:border-accent">
          {t.prev}
        </button>
        <div className="text-center">
          <p className="font-heading text-lg">{gregorianLabel}</p>
          <p className="text-xs text-accent">{hijriHeader.join(" – ")}</p>
        </div>
        <button onClick={() => shiftMonth(1)} className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:border-accent">
          {t.next}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[var(--color-text-secondary)]">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          const isToday = sameDay(c.date, today);
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg border p-1 text-center ${
                isToday
                  ? "border-accent bg-accent/15"
                  : c.inMonth
                    ? "border-[var(--color-border)] bg-[var(--color-card)]"
                    : "border-transparent opacity-30"
              }`}
              title={isToday ? t.todayLabel : undefined}
            >
              <p className="text-xs font-medium">{c.date.getDate()}</p>
              <p className="text-[9px] text-[var(--color-text-secondary)]">{c.hijri.day}</p>
            </div>
          );
        })}
      </div>

      <AdSlot position="hijri-bottom" />

      <p className="text-center text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{t.disclaimer}</p>
    </div>
  );
}
