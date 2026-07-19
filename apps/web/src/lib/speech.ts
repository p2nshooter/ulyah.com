"use client";

/**
 * Browser narration engine (Web Speech API) — the always-available voice
 * layer. Works in every modern browser with zero API keys, in every UI
 * language, so the site is never silent even before murottal audio is
 * imported or a TTS-scope AI key is donated. Voice picking prefers the
 * softest natural voice available on the device for the target language
 * (per the "suara lembut, enak didengar" requirement).
 *
 * Qur'an Arabic text is NEVER routed through this engine — recitation is
 * only ever real qori audio. This narrates translations, tafsir, and kisah.
 */

const LANG_TAG: Record<string, string> = {
  id: "id-ID", en: "en-US", ru: "ru-RU", de: "de-DE",
  fr: "fr-FR", es: "es-ES", ar: "ar-SA", zh: "zh-CN", ja: "ja-JP",
};

// Known soft/natural voice names per platform, in preference order.
const PREFERRED = [
  "Google", "Natural", "Neural", // Chrome/Edge high-quality voices
  "Damayanti", "Samantha", "Milena", "Anna", "Amelie", "Ting-Ting", "Kyoko", "Laila", // iOS/macOS
];

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices());
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
  });
  return voicesReady;
}

async function pickVoice(lang: string): Promise<SpeechSynthesisVoice | null> {
  const tag = LANG_TAG[lang] ?? lang;
  const voices = await loadVoices();
  const forLang = voices.filter((v) => v.lang.toLowerCase().startsWith(tag.slice(0, 2).toLowerCase()));
  if (!forLang.length) return null;
  for (const hint of PREFERRED) {
    const hit = forLang.find((v) => v.name.includes(hint));
    if (hit) return hit;
  }
  return forLang.find((v) => v.localService === false) ?? forLang[0]!;
}

export function speechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Chrome/Chromium silently PAUSES speech synthesis after ~15 seconds of
// continuous speaking — the single biggest reason a "read for hours" session
// dies on its own. Pinging resume() on a timer keeps a long, multi-utterance
// narration alive indefinitely. Harmless on browsers without the bug (resume
// on a non-paused engine is a no-op). Ref-counted so it runs only while
// something is actually speaking.
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;
let speakingCount = 0;
function startKeepAlive() {
  speakingCount++;
  if (keepAliveTimer !== null) return;
  keepAliveTimer = setInterval(() => {
    if (!speechAvailable()) return;
    const s = window.speechSynthesis;
    // Only nudge while it believes it's speaking; resume() undoes the phantom pause.
    if (s.speaking) s.resume();
  }, 8000);
}
function stopKeepAlive() {
  speakingCount = Math.max(0, speakingCount - 1);
  if (speakingCount === 0 && keepAliveTimer !== null) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

export interface NarrationHandle {
  cancel: () => void;
  done: Promise<void>;
}

/** Detect the script actually present in a text block and use ITS matching
 * voice, regardless of what `lang` the caller passed — a caller often only
 * knows the page's UI locale, not that a given paragraph happens to be an
 * Arabic quote embedded in it. Without this, Arabic text read on an
 * Indonesian-locale page got an Indonesian voice applied to Arabic
 * characters: garbled or silent, not "no voice" but effectively so. */
function effectiveLang(text: string, requested: string): string {
  const arabicChars = (text.match(/[؀-ۿ]/g) ?? []).length;
  if (arabicChars > text.replace(/\s/g, "").length * 0.3) return "ar";
  return requested;
}

/** Speak one text block. Resolves when finished or cancelled. */
export function speak(text: string, lang: string, opts: { rate?: number } = {}): NarrationHandle {
  let cancelled = false;
  const done = (async () => {
    if (!speechAvailable() || !text.trim()) return;
    const effLang = effectiveLang(text, lang);
    window.speechSynthesis.cancel();
    const voice = await pickVoice(effLang);
    startKeepAlive();
    try {
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = LANG_TAG[effLang] ?? effLang;
        if (voice) u.voice = voice;
        u.rate = opts.rate ?? 0.95;
        u.pitch = 1.0;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        if (cancelled) return resolve();
        window.speechSynthesis.speak(u);
      });
    } finally {
      stopKeepAlive();
    }
  })();
  return {
    cancel: () => {
      cancelled = true;
      if (speechAvailable()) window.speechSynthesis.cancel();
    },
    done,
  };
}

/** Split long prose into speakable sentences (keeps narration responsive and enables per-sentence highlight). */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?؟。！])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}
