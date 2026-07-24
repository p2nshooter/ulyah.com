// Speak Arabic text with an ARABIC voice — never the visitor's local-language
// voice. The letters/verses on the kids pages must be pronounced with an Arabic
// tongue (owner: "penyebutannya larinya dengan lidah Arab"); only a translation
// line, when present, may use the local voice (see speakLocal).
//
// Browser Web Speech API only: no network, no tracking — appropriate for a
// child page. If the device has no Arabic voice installed we still set
// lang="ar-SA" so a lang-matching engine is chosen when available; worst case
// it stays silent rather than mispronouncing in a Latin accent.

function pickArabicVoice(): SpeechSynthesisVoice | null {
  try {
    const voices = window.speechSynthesis?.getVoices?.() ?? [];
    return voices.find((v) => /^ar\b|-SA|-EG|arabic/i.test(v.lang) || /arabic/i.test(v.name)) ?? null;
  } catch {
    return null;
  }
}

export function speakArabic(text: string): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ar-SA";
    const v = pickArabicVoice();
    if (v) u.voice = v;
    u.rate = 0.8; // slow and clear for a child learning the makhraj
    u.pitch = 1;
    synth.speak(u);
  } catch {
    /* speech unsupported — the Arabic text is still shown on screen */
  }
}

/** Speak a translation/meaning line in the visitor's own language voice. */
export function speakLocal(text: string, lang: string): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    synth.speak(u);
  } catch {
    /* no-op */
  }
}

// Some engines populate getVoices() asynchronously; nudging it once on load
// makes the first tap already have the Arabic voice ready.
export function primeVoices(): void {
  try {
    window.speechSynthesis?.getVoices();
  } catch {
    /* no-op */
  }
}
