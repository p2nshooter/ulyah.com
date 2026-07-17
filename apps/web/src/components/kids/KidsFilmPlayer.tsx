"use client";

import { useEffect, useRef, useState } from "react";
import { speak, speechAvailable, type NarrationHandle } from "@/lib/speech";
import { KidsScene } from "@/components/kids/KidsScene";
import type { KidsAction, KidsVariant } from "@/components/kids/KidsCharacter";

/**
 * Turns any Kisah Anak episode into an animated "film": the story body is
 * split into paragraphs, and each paragraph becomes one scene — an animated
 * child character (SVG + CSS, no video files) acting against a day/night
 * backdrop while the site's narration engine reads the paragraph aloud in
 * the chosen language. The narration itself paces the film (a scene lasts
 * exactly as long as its narration), so it works in every language without
 * hand-timing anything.
 *
 * The character is a deliberately generic child (see KidsCharacter.tsx) —
 * never a depiction of a prophet, companion, or any named historical figure.
 */

// Rotate through expressive actions so consecutive scenes feel alive; the
// closing scene always waves goodbye.
const ACTION_CYCLE: KidsAction[] = ["wave", "walk", "think", "point", "jump", "hug", "idle"];

function sceneAction(index: number, total: number): KidsAction {
  if (index === total - 1) return "wave";
  return ACTION_CYCLE[index % ACTION_CYCLE.length]!;
}

// The last third of a story plays at night — a gentle visual arc from day
// to bedtime that suits read-aloud stories for children.
function sceneTime(index: number, total: number): "day" | "night" {
  return index >= Math.ceil((total * 2) / 3) ? "night" : "day";
}

export function KidsFilmPlayer({
  title,
  body,
  moral,
  variant,
  lang,
  labels,
}: {
  title: string;
  body: string;
  moral: string | null;
  /** Which child character stars in this story. */
  variant: KidsVariant;
  /** BCP-47-ish language for narration + captions (site locale). */
  lang: string;
  labels: { play: string; pause: string; replay: string; sceneOf: (c: number, t: number) => string; moralTitle: string };
}) {
  const scenes = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const handleRef = useRef<NarrationHandle | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  function clearPending() {
    handleRef.current?.cancel();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  useEffect(() => {
    if (!playing) return;
    const caption = scenes[index];
    if (!caption) {
      setPlaying(false);
      return;
    }
    stoppedRef.current = false;

    const advance = () => {
      if (stoppedRef.current) return;
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= scenes.length) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    };

    if (speechAvailable()) {
      handleRef.current = speak(caption, lang);
      handleRef.current.done.then(() => {
        if (!stoppedRef.current) advance();
      });
    } else {
      // No speech synthesis — pace by reading length instead (~140 wpm).
      const ms = Math.max(4000, (caption.split(/\s+/).length / 140) * 60_000);
      timeoutRef.current = setTimeout(advance, ms);
    }
    return clearPending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing]);

  function handlePause() {
    stoppedRef.current = true;
    clearPending();
    setPlaying(false);
  }
  function handleReplay() {
    stoppedRef.current = true;
    clearPending();
    setIndex(0);
    setPlaying(true);
  }

  const scene = scenes[index] ?? "";
  const atEnd = !playing && index === scenes.length - 1;

  return (
    <div>
      <KidsScene timeOfDay={sceneTime(index, scenes.length)} variant={variant} action={sceneAction(index, scenes.length)} />

      <div
        key={index}
        className="kids-caption-enter mt-4 rounded-2xl border border-accent/25 bg-[var(--color-card)] p-4 text-center text-[15px] leading-relaxed"
      >
        {scene}
      </div>

      {atEnd && moral && (
        <p className="kids-caption-enter mt-3 rounded-xl border border-accent/30 bg-accent/5 p-3 text-center text-sm font-medium text-accent">
          💡 {labels.moralTitle}: {moral}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {!playing ? (
          <button
            onClick={() => setPlaying(true)}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg transition hover:brightness-110"
          >
            ▶ {labels.play}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="rounded-full border border-accent/40 px-5 py-2.5 text-sm font-medium text-accent"
          >
            ⏸ {labels.pause}
          </button>
        )}
        <button onClick={handleReplay} className="rounded-full border border-accent/40 px-5 py-2.5 text-sm text-accent">
          ↻ {labels.replay}
        </button>
      </div>

      <p className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
        {labels.sceneOf(index + 1, scenes.length)} · <span className="sr-only">{title}</span>
      </p>
    </div>
  );
}
