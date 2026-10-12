/**
 * Which encodes cdn.islamic.network actually publishes, per alquran.cloud
 * edition — measured, not assumed.
 *
 * The players used to force every alquran.cloud URL onto the 128 kbps path
 * (the lower defaults sound muffled). Four editions are not published at 128
 * at all, so "upgrading" them asked for a file that does not exist: the live
 * probe of 12 Oct 2026 saw the radio's requests for Sudais and Hani Ar-Rifai
 * at /quran/audio/128/… blocked by the browser (ERR_BLOCKED_BY_ORB — the
 * answer was a 404 page, not audio), so those voices were silent. The values
 * below are what scripts/probe-murottal-cdn.mjs found on a GitHub runner the
 * same day (one ranged GET per candidate; run it again via live-probe.yml when
 * the roster changes).
 *
 * AYAH: the encode to use per ayah — 128 where it exists (the rotation's
 * standard), otherwise the best there is. Absent = not published; callers
 * fall back to their next source.
 */
export const AQC_AYAH_KBPS: Readonly<Record<string, number>> = Object.freeze({
  "ar.abdulbasitmurattal": 192,
  "ar.abdullahbasfar": 192,
  "ar.abdurrahmaansudais": 192,
  "ar.ahmedajamy": 128,
  "ar.alafasy": 128,
  "ar.aymanswoaid": 64,
  "ar.hanirifai": 192,
  "ar.hudhaify": 128,
  "ar.husary": 128,
  "ar.husarymujawwad": 128,
  "ar.mahermuaiqly": 128,
  "ar.minshawi": 128,
  "ar.minshawimujawwad": 64,
  "ar.muhammadayyoub": 128,
  "ar.muhammadjibreel": 128,
  "ar.saoodshuraym": 64,
  "ar.shaatree": 128,
  // ar.muhammadalmuhaisany: nothing at any bitrate.
});

/**
 * Whole-surah files (/quran/audio-surah/<kbps>/…), which the radio prefers
 * because they play without a gap between ayat. Only these editions have
 * them; for every other voice the radio goes straight to the per-ayah list
 * instead of asking for a file that 404s first.
 */
export const AQC_SURAH_KBPS: Readonly<Record<string, number>> = Object.freeze({
  "ar.abdulbasitmurattal": 128,
  "ar.abdullahbasfar": 128,
  "ar.alafasy": 128,
});

/** Per-ayah file for an edition at its published encode, by GLOBAL ayah
 * number (1..6236), or null when the edition publishes none. */
export function aqcAyahUrl(edition: string, globalAyah: number): string | null {
  const kbps = AQC_AYAH_KBPS[edition];
  return kbps ? `https://cdn.islamic.network/quran/audio/${kbps}/${edition}/${globalAyah}.mp3` : null;
}

/** Rewrite an alquran.cloud audio URL onto the edition's published encode. */
export function aqcBestUrl(edition: string, url: string): string {
  const kbps = AQC_AYAH_KBPS[edition];
  return kbps ? url.replace(/\/quran\/audio\/\d+\//, `/quran/audio/${kbps}/`) : url;
}
