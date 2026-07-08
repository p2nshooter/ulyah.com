"use client";

import { useEffect, useRef, useState } from "react";
import { speak, splitSentences, speechAvailable, type NarrationHandle } from "@/lib/speech";
import type { Dictionary } from "@/dictionaries";

/**
 * Narrated reading experience for kisah/hikmah: the story is spoken sentence
 * by sentence with the current sentence highlighted and kept in view —
 * listeners can follow along for hours-long sessions. Uses the device's own
 * soft neural voices (no API key needed); if story audio exists in R2 later,
 * the player bar takes precedence.
 */
export function StoryReader({ body, lang, dict }: { body: string; lang: string; dict: Dictionary }) {
  const sentences = splitSentences(body);
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const handleRef = useRef<NarrationHandle | null>(null);
  const stopRef = useRef(false);

  async function playFrom(start: number) {
    stopRef.current = false;
    setPlaying(true);
    for (let i = start; i < sentences.length; i++) {
      if (stopRef.current) break;
      setActive(i);
      document.getElementById(`sent-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      const h = speak(sentences[i]!, lang);
      handleRef.current = h;
      await h.done;
    }
    if (!stopRef.current) setActive(-1);
    setPlaying(false);
  }

  function stop() {
    stopRef.current = true;
    handleRef.current?.cancel();
    setPlaying(false);
  }

  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {speechAvailable() && (
        <button
          onClick={() => (playing ? stop() : playFrom(active >= 0 ? active : 0))}
          className="mb-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-accent dark:text-primary"
        >
          {playing ? "⏸ " : "▶ "}
          {dict.reader.storyLabel} 🔊
        </button>
      )}
      <div className="space-y-1 text-[16px] leading-[1.9] text-[var(--color-text-primary)]">
        {sentences.map((s, i) => (
          <span
            key={i}
            id={`sent-${i}`}
            onClick={() => {
              stop();
              playFrom(i);
            }}
            className={`cursor-pointer rounded px-0.5 transition-colors duration-300 ${
              i === active ? "bg-accent/25 text-[var(--color-text-primary)] shadow-[inset_0_-2px_0_#B8892B]" : ""
            }`}
          >
            {s}{" "}
          </span>
        ))}
      </div>
    </div>
  );
}
