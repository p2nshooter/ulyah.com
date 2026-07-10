"use client";

import { useEffect, useRef, useState } from "react";
import { speak, splitSentences, speechAvailable, type NarrationHandle } from "@/lib/speech";

/**
 * Reusable "listen to this passage" control. Narrates the given paragraphs
 * sentence-by-sentence in the current UI language using the always-available
 * browser voice engine (zero API keys), highlighting the active sentence via
 * an optional callback. Used on the gratitude page and the donation virtues.
 */
export function NarrateButton({
  paragraphs,
  listenLabel,
  stopLabel,
  lang,
  onSentence,
  onEnd,
  className = "",
}: {
  paragraphs: string[];
  listenLabel: string;
  stopLabel: string;
  lang: string;
  onSentence?: (index: number | null) => void;
  /** Fires when narration completes naturally (not via the Stop button) — e.g. to auto-advance to the next item. */
  onEnd?: () => void;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  // Starts false on both the server render and the client's first hydration
  // pass (matching), then flips after mount once we can actually check the
  // browser's speech API — checking `typeof window` directly during render
  // made the server always render null and the client always render the
  // button, a guaranteed hydration mismatch.
  const [available, setAvailable] = useState(false);
  const handleRef = useRef<NarrationHandle | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    setAvailable(speechAvailable());
    return () => {
      cancelledRef.current = true;
      handleRef.current?.cancel();
    };
  }, []);

  async function start() {
    if (!speechAvailable()) return;
    cancelledRef.current = false;
    setPlaying(true);
    const sentences = paragraphs.flatMap((p) => splitSentences(p));
    for (let i = 0; i < sentences.length; i++) {
      if (cancelledRef.current) break;
      onSentence?.(i);
      const h = speak(sentences[i]!, lang, { rate: 0.9 });
      handleRef.current = h;
      await h.done;
    }
    onSentence?.(null);
    setPlaying(false);
    if (!cancelledRef.current) onEnd?.();
  }

  function stop() {
    cancelledRef.current = true;
    handleRef.current?.cancel();
    onSentence?.(null);
    setPlaying(false);
  }

  if (!available) return null;

  return (
    <button
      onClick={playing ? stop : start}
      className={
        className ||
        "inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-md transition hover:brightness-105"
      }
    >
      <span aria-hidden>{playing ? "⏸" : "🔊"}</span>
      {playing ? stopLabel : listenLabel}
    </button>
  );
}
