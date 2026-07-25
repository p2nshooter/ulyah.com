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

/** Character offset + length of every WORD (non-space run) in a block, in
 * order — lets a time-based estimator walk the words when the browser fires no
 * boundary events. */
function wordOffsets(text: string): { start: number; len: number }[] {
  const out: { start: number; len: number }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push({ start: m.index, len: m[0].length });
  return out;
}

/** Speak one text block. Resolves when finished or cancelled.
 * `onWord(charIndex)` fires at each spoken word so the caller can highlight the
 * exact word being read — the "penunjuk per kata" the owner asked for. Real
 * SpeechSynthesis word-boundary events are used when the browser fires them;
 * MANY browsers (notably Android Chrome and most non-Latin/Arabic voices)
 * never fire `onboundary`, so a time-based estimator walks the words instead —
 * the pointer moves word by word everywhere, not just as a block. */
export function speak(
  text: string,
  lang: string,
  opts: { rate?: number; onWord?: (charIndex: number, charLength: number) => void } = {}
): NarrationHandle {
  let cancelled = false;
  const done = (async () => {
    if (!speechAvailable() || !text.trim()) return;
    // A block longer than one utterance is spoken as consecutive pieces, so
    // callers keep passing whole paragraphs and the listener still hears every
    // word. Word offsets are shifted back onto the ORIGINAL text so a caller
    // highlighting per word stays aligned with what it rendered.
    const pieces = chunkText(text);
    let consumed = 0;
    for (const piece of pieces) {
      if (cancelled) return;
      const at = text.indexOf(piece, consumed);
      const base = at >= 0 ? at : consumed;
      consumed = base + piece.length;
      await speakPiece(piece, lang, opts, () => cancelled, base);
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

/** Speak exactly one utterance-sized piece. Resolves when it finishes, errors,
 *  or is cancelled — never hangs, and never abandons audio that is still
 *  playing. */
function speakPiece(
  text: string,
  lang: string,
  opts: { rate?: number; onWord?: (charIndex: number, charLength: number) => void },
  cancelled: () => boolean,
  charOffset: number
): Promise<void> {
  return (async () => {
    const effLang = effectiveLang(text, lang);
    const synth = window.speechSynthesis;
    // Chromium quirk: speak() issued while a cancel() is still settling is
    // silently DROPPED — no onstart, no onend, no onerror. Only cancel when
    // something is actually queued, then give the engine a beat to settle.
    if (synth.speaking || synth.pending) {
      synth.cancel();
      await new Promise((r) => setTimeout(r, 120));
    }
    if (cancelled()) return;
    const voice = await pickVoice(effLang);
    startKeepAlive();
    try {
      await new Promise<void>((resolve) => {
        let started = false;
        let settled = false;
        let nativeBoundary = false; // real onboundary events seen → trust them
        let estTimer: ReturnType<typeof setTimeout> | null = null;
        const rate = opts.rate ?? 0.95;
        const words = opts.onWord ? wordOffsets(text) : [];
        const stopEstimator = () => {
          if (estTimer) {
            clearTimeout(estTimer);
            estTimer = null;
          }
        };
        // Walk the words on a timer when the browser gives us no boundary
        // events. Per-word duration scales with word length and speaking rate.
        const startEstimator = () => {
          if (!opts.onWord || nativeBoundary || settled || cancelled() || words.length === 0) return;
          let wi = 0;
          const step = () => {
            if (settled || cancelled() || nativeBoundary || wi >= words.length) return;
            opts.onWord!(charOffset + words[wi]!.start, words[wi]!.len);
            const ms = Math.max(140, words[wi]!.len * 68 + 90) / rate;
            wi++;
            estTimer = setTimeout(step, ms);
          };
          step();
        };
        const finish = () => {
          if (settled) return;
          settled = true;
          stopEstimator();
          clearTimeout(startWatchdog);
          clearTimeout(giveUpWatchdog);
          clearTimeout(estKick);
          resolve();
        };
        const u = new SpeechSynthesisUtterance(text);
        u.lang = LANG_TAG[effLang] ?? effLang;
        if (voice) u.voice = voice;
        u.rate = rate;
        u.pitch = 1.0;
        if (opts.onWord) {
          u.onboundary = (e: SpeechSynthesisEvent) => {
            if (e.name === "word" || e.name === undefined || e.name === "") {
              nativeBoundary = true; // browser supports it — drop the estimator
              stopEstimator();
              opts.onWord!(
                charOffset + (e.charIndex ?? 0),
                (e as SpeechSynthesisEvent & { charLength?: number }).charLength ?? 0
              );
            }
          };
        }
        u.onstart = () => {
          started = true;
        };
        u.onend = finish;
        u.onerror = finish;
        if (cancelled()) return finish();
        synth.speak(u);

        const estKick = setTimeout(() => {
          if (!nativeBoundary) startEstimator();
        }, 500);

        // A swallowed utterance produces no onstart. But several engines
        // (Android Chrome, most Arabic voices) also never fire onstart while
        // speaking perfectly well — so the old version's cancel()+re-speak cut
        // the listener off mid-word and replayed from the top. THAT is the
        // jumping. Retry only when the engine confirms nothing is playing, and
        // with a fresh utterance: re-issuing a used one is unreliable.
        const startWatchdog = setTimeout(() => {
          if (started || settled || cancelled()) return;
          if (synth.speaking || synth.pending) {
            started = true; // it IS talking — let onend finish this piece
            return;
          }
          synth.resume();
          const retry = new SpeechSynthesisUtterance(text);
          retry.lang = u.lang;
          if (voice) retry.voice = voice;
          retry.rate = rate;
          retry.pitch = 1.0;
          retry.onstart = () => {
            started = true;
          };
          retry.onend = finish;
          retry.onerror = finish;
          synth.speak(retry);
        }, 2000);

        // Give up only if nothing ever started AND nothing is playing —
        // otherwise a slow engine has its audio abandoned and the reader skips
        // over text the listener never heard.
        const giveUpWatchdog = setTimeout(() => {
          if (!started && !settled && !synth.speaking && !synth.pending) finish();
        }, 6000);
      });
    } finally {
      stopKeepAlive();
    }
  })();
}

/**
 * The longest text a single utterance may carry.
 *
 * This is the fix for "dibaca setengah". Chromium stops a long utterance after
 * roughly fifteen seconds and, worse, often fires neither `onend` nor `onerror`
 * when it does — the reader's watchdog then gives up on that block and moves to
 * the next one, so the listener hears a paragraph cut off mid-sentence and the
 * rest of it silently skipped. Religious prose is exactly the worst case: kitab
 * and hadith translations run for hundreds of characters without a full stop,
 * so sentence-splitting alone left blocks far past the limit.
 */
const MAX_UTTERANCE_CHARS = 190;

/** Break a long run of text at word boundaries into utterance-sized pieces. */
function chunkText(text: string): string[] {
  const clean = text.trim();
  if (clean.length <= MAX_UTTERANCE_CHARS) return clean ? [clean] : [];
  const out: string[] = [];
  // Prefer to break after punctuation, then at a space, then — only if a single
  // "word" really is longer than the limit — mid-word rather than lose it.
  let rest = clean;
  while (rest.length > MAX_UTTERANCE_CHARS) {
    const window = rest.slice(0, MAX_UTTERANCE_CHARS + 1);
    let cut = Math.max(
      window.lastIndexOf("، "),
      window.lastIndexOf(", "),
      window.lastIndexOf("; "),
      window.lastIndexOf(": ")
    );
    if (cut > MAX_UTTERANCE_CHARS * 0.5) cut += 1;
    else cut = window.lastIndexOf(" ");
    if (cut <= 0) cut = MAX_UTTERANCE_CHARS;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out.filter((c) => c.length > 0);
}

/**
 * Split long prose into speakable pieces: sentences first, so the narration
 * still breathes naturally, then each sentence capped at an utterance-safe
 * length so nothing is ever cut off half-read.
 */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?\u061F\u3002\uFF01])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .flatMap(chunkText);
}
