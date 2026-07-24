// Plays the real recorded Al-Qur'an Kids audio (served from R2 at
// /audio/kids/<code>). A unit can be one slot (a hijaiyah letter) or a short
// sequence (an Iqro syllable composed of base sounds); this plays them in order.
// Callers decide real-vs-fallback up front from the "which slots are filled"
// set, so there is never a failed request on the happy path.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

export const kidsAudioUrl = (code: string): string => `${API_BASE}/audio/kids/${encodeURIComponent(code)}`;

/** True only if every code in the unit has a real recording. */
export function hasRealAudio(codes: string[], filled: Set<string>): boolean {
  return codes.length > 0 && codes.every((c) => filled.has(c));
}

/**
 * Play the given codes in sequence. Returns the Audio element so a caller can
 * stop it; calls onDone when finished, or onFail (→ caller can fall back to
 * TTS) if a clip won't play.
 */
export function playKidsSequence(codes: string[], onFail?: () => void): HTMLAudioElement | null {
  if (typeof Audio === "undefined" || codes.length === 0) {
    onFail?.();
    return null;
  }
  const audio = new Audio();
  let i = 0;
  const next = () => {
    if (i >= codes.length) return;
    audio.src = kidsAudioUrl(codes[i++]!);
    audio.play().catch(() => onFail?.());
  };
  audio.addEventListener("ended", next);
  audio.addEventListener("error", () => onFail?.());
  next();
  return audio;
}
