import { CalculationMethod, type CalculationParameters } from "adhan";

export interface PrayerCountry {
  code: string; // ISO 3166-1 alpha-2 (matches Cloudflare's cf.country)
  city: string;
  flag: string;
  lat: number;
  lng: number;
  tz: string; // IANA timezone
  method: () => CalculationParameters;
}

// Mecca is always first — the digital-clock row's anchor city, per the
// request that Arab Saudi/Mekkah leads the list. The four sibling-site home
// countries (Indonesia, Germany, France, Spain) are always present (owner:
// "Jam dunia minimal menampilkan Indonesia, Jerman, Prancis, Spanyol"); the
// rest is a small curated set of Muslim-majority centers. DST is automatic —
// times render through Intl with these IANA timezones, so Berlin/Paris/
// Madrid switch summer/winter time on their own.
export const CLOCK_COUNTRIES: PrayerCountry[] = [
  { code: "SA", city: "Makkah", flag: "🇸🇦", lat: 21.3891, lng: 39.8579, tz: "Asia/Riyadh", method: CalculationMethod.UmmAlQura },
  { code: "ID", city: "Jakarta", flag: "🇮🇩", lat: -6.2088, lng: 106.8456, tz: "Asia/Jakarta", method: CalculationMethod.Singapore },
  { code: "DE", city: "Berlin", flag: "🇩🇪", lat: 52.52, lng: 13.405, tz: "Europe/Berlin", method: CalculationMethod.MuslimWorldLeague },
  { code: "FR", city: "Paris", flag: "🇫🇷", lat: 48.8566, lng: 2.3522, tz: "Europe/Paris", method: CalculationMethod.MuslimWorldLeague },
  { code: "ES", city: "Madrid", flag: "🇪🇸", lat: 40.4168, lng: -3.7038, tz: "Europe/Madrid", method: CalculationMethod.MuslimWorldLeague },
  { code: "TR", city: "Istanbul", flag: "🇹🇷", lat: 41.0082, lng: 28.9784, tz: "Europe/Istanbul", method: CalculationMethod.Turkey },
  { code: "EG", city: "Cairo", flag: "🇪🇬", lat: 30.0444, lng: 31.2357, tz: "Africa/Cairo", method: CalculationMethod.Egyptian },
  { code: "AE", city: "Dubai", flag: "🇦🇪", lat: 25.2048, lng: 55.2708, tz: "Asia/Dubai", method: CalculationMethod.Dubai },
];

// Fallback + lookup table for locking a visitor's own prayer-time card to
// their detected country when Cloudflare's per-request lat/long isn't
// available — broader than the clock row so most visitors get their own
// country's coordinates instead of silently falling back to Mecca.
export const COUNTRY_LOOKUP: Record<string, PrayerCountry> = {
  // Looked up by ISO code, never by array index — the clock row above is
  // free to reorder without silently remapping countries.
  SA: CLOCK_COUNTRIES.find((c) => c.code === "SA")!,
  ID: CLOCK_COUNTRIES.find((c) => c.code === "ID")!,
  DE: CLOCK_COUNTRIES.find((c) => c.code === "DE")!,
  FR: CLOCK_COUNTRIES.find((c) => c.code === "FR")!,
  ES: CLOCK_COUNTRIES.find((c) => c.code === "ES")!,
  TR: CLOCK_COUNTRIES.find((c) => c.code === "TR")!,
  EG: CLOCK_COUNTRIES.find((c) => c.code === "EG")!,
  AE: CLOCK_COUNTRIES.find((c) => c.code === "AE")!,
  MY: { code: "MY", city: "Kuala Lumpur", flag: "🇲🇾", lat: 3.139, lng: 101.6869, tz: "Asia/Kuala_Lumpur", method: CalculationMethod.Singapore },
  PK: { code: "PK", city: "Karachi", flag: "🇵🇰", lat: 24.8607, lng: 67.0011, tz: "Asia/Karachi", method: CalculationMethod.Karachi },
  BN: { code: "BN", city: "Bandar Seri Begawan", flag: "🇧🇳", lat: 4.9031, lng: 114.9398, tz: "Asia/Brunei", method: CalculationMethod.Singapore },
  SG: { code: "SG", city: "Singapore", flag: "🇸🇬", lat: 1.3521, lng: 103.8198, tz: "Asia/Singapore", method: CalculationMethod.Singapore },
  QA: { code: "QA", city: "Doha", flag: "🇶🇦", lat: 25.2854, lng: 51.531, tz: "Asia/Qatar", method: CalculationMethod.Qatar },
  KW: { code: "KW", city: "Kuwait City", flag: "🇰🇼", lat: 29.3759, lng: 47.9774, tz: "Asia/Kuwait", method: CalculationMethod.Kuwait },
  US: { code: "US", city: "New York", flag: "🇺🇸", lat: 40.7128, lng: -74.006, tz: "America/New_York", method: CalculationMethod.NorthAmerica },
  GB: { code: "GB", city: "London", flag: "🇬🇧", lat: 51.5072, lng: -0.1276, tz: "Europe/London", method: CalculationMethod.MuslimWorldLeague },
  JP: { code: "JP", city: "Tokyo", flag: "🇯🇵", lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo", method: CalculationMethod.MuslimWorldLeague },
  RU: { code: "RU", city: "Moscow", flag: "🇷🇺", lat: 55.7558, lng: 37.6173, tz: "Europe/Moscow", method: CalculationMethod.MuslimWorldLeague },
  CN: { code: "CN", city: "Beijing", flag: "🇨🇳", lat: 39.9042, lng: 116.4074, tz: "Asia/Shanghai", method: CalculationMethod.MuslimWorldLeague },
  MA: { code: "MA", city: "Rabat", flag: "🇲🇦", lat: 34.0209, lng: -6.8417, tz: "Africa/Casablanca", method: CalculationMethod.MuslimWorldLeague },
  NG: { code: "NG", city: "Abuja", flag: "🇳🇬", lat: 9.0765, lng: 7.3986, tz: "Africa/Lagos", method: CalculationMethod.MuslimWorldLeague },
  BD: { code: "BD", city: "Dhaka", flag: "🇧🇩", lat: 23.8103, lng: 90.4125, tz: "Asia/Dhaka", method: CalculationMethod.Karachi },
  IN: { code: "IN", city: "New Delhi", flag: "🇮🇳", lat: 28.6139, lng: 77.209, tz: "Asia/Kolkata", method: CalculationMethod.Karachi },
  AU: { code: "AU", city: "Sydney", flag: "🇦🇺", lat: -33.8688, lng: 151.2093, tz: "Australia/Sydney", method: CalculationMethod.MuslimWorldLeague },
};

export const DEFAULT_PRAYER_COUNTRY: PrayerCountry = COUNTRY_LOOKUP.ID!;
