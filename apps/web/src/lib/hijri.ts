/**
 * Hijri calendar math, entirely via the JS engine's built-in ICU data
 * (Intl.DateTimeFormat with the "islamic-umalqura" calendar — the Umm
 * al-Qura calendar used officially by Saudi Arabia) — no external API, no
 * library, no key. Every modern browser ships this.
 *
 * Ramadan 1 AH and Nuzulul Qur'an (17 Ramadan, per Indonesian tradition)
 * countdowns are derived from it: since consecutive calendar days always
 * map 1:1 across systems, once we know a Hijri day's Gregorian date, any
 * other day within the same Hijri month is just a fixed day offset away —
 * no need for a lookup table beyond what Intl already provides.
 */

const HIJRI_FORMATTER = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

export interface HijriDate {
  day: number;
  month: number; // 1-12 (9 = Ramadan)
  year: number;
}

export function toHijri(date: Date): HijriDate {
  const parts = HIJRI_FORMATTER.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { day: get("day"), month: get("month"), year: get("year") };
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** The Gregorian date of day 1 of the Hijri month `date` currently falls
 * within — found by subtracting (day - 1) days, safe because within one
 * Hijri month, days advance 1:1 with the Gregorian calendar. */
function currentHijriMonthStart(date: Date): Date {
  const h = toHijri(date);
  return addDays(date, -(h.day - 1));
}

/** Next occurrence of "Ramadan 1" on/after `from` — searches forward day by
 * day (a Hijri year is at most ~355 days, so this is at most a few hundred
 * cheap Intl calls, run once per widget mount). */
function nextRamadanStart(from: Date): Date {
  let cursor = new Date(from);
  for (let i = 0; i < 400; i++) {
    const h = toHijri(cursor);
    if (h.month === 9 && h.day === 1) return cursor;
    cursor = addDays(cursor, 1);
  }
  return from; // unreachable in practice
}

export type RamadanPhase =
  | { phase: "before-nuzul"; ramadanStart: Date; nuzululQuran: Date }
  | { phase: "after-nuzul"; ramadanStart: Date; nuzululQuran: Date }
  | { phase: "counting-down"; nextRamadan: Date };

/** The single source of truth for the widget's countdown card: are we
 * inside Ramadan right now (and if so, before or after 17 Ramadan / Nuzulul
 * Qur'an), or counting down to the next one? */
export function ramadanPhase(now: Date): RamadanPhase {
  const h = toHijri(now);
  if (h.month === 9) {
    const ramadanStart = currentHijriMonthStart(now);
    const nuzululQuran = addDays(ramadanStart, 16); // 17 Ramadan = start + 16 days
    return { phase: now < nuzululQuran ? "before-nuzul" : "after-nuzul", ramadanStart, nuzululQuran };
  }
  return { phase: "counting-down", nextRamadan: nextRamadanStart(now) };
}

export function formatCountdown(target: Date, now: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  const seconds = Math.floor((diffMs % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export const HIJRI_MONTH_NAMES_ID = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir",
  "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

export const HIJRI_MONTH_NAMES_EN = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Awwal", "Jumada al-Thani",
  "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah",
];
