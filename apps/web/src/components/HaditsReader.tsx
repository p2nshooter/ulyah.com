"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { speak, speechAvailable, type NarrationHandle } from "@/lib/speech";
import type { HaditsLabels } from "@/lib/hadits-labels";

export interface HaditsItem {
  id: number;
  hadith_number: number;
  text_ar: string;
  text_id: string;
  narrator: string | null;
  grade: string | null;
  source: string;
}

/**
 * Readable, voiced page of a hadith book. Each hadith shows its Arabic and
 * Indonesian; "Putar Semua" narrates the whole page hadith by hadith —
 * Arabic first (Arabic voice), then the Indonesian (UI-language voice) — with
 * the active hadith highlighted and scrolled into view (a live reading
 * marker), so a listener can take in a whole book without tapping each
 * entry. When `nextPageHref` is given and the page finishes naturally (not
 * stopped by the user), playback continues onto the next page automatically
 * — a whole book plays end to end. Uses the device's built-in voices (no API
 * key). Hydration-safe: the play button only appears after mount, when the
 * browser's speech support can actually be checked.
 */
export function HaditsReader({
  hadits,
  lang,
  labels,
  translatedNote,
  autoStart = false,
  nextPageHref = null,
}: {
  hadits: HaditsItem[];
  lang: string;
  labels: HaditsLabels;
  translatedNote: boolean;
  autoStart?: boolean;
  nextPageHref?: string | null;
}) {
  const router = useRouter();
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const handleRef = useRef<NarrationHandle | null>(null);
  const stopRef = useRef(false);

  useEffect(() => {
    setAvailable(speechAvailable());
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoStart && available) playFrom(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, available]);

  async function playFrom(start: number) {
    stopRef.current = false;
    setPlaying(true);
    for (let i = start; i < hadits.length; i++) {
      if (stopRef.current) break;
      setActive(i);
      document.getElementById(`hadits-${i}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      const h = hadits[i]!;
      for (const [text, l] of [
        [h.text_ar, "ar"],
        [h.text_id, lang],
      ] as const) {
        if (stopRef.current || !text) continue;
        const handle = speak(text, l, { rate: l === "ar" ? 0.85 : 0.95 });
        handleRef.current = handle;
        await handle.done;
        if (stopRef.current) break;
      }
    }
    setPlaying(false);
    setActive(-1);
    if (!stopRef.current && nextPageHref) router.push(nextPageHref);
  }

  function stop() {
    stopRef.current = true;
    handleRef.current?.cancel();
    setPlaying(false);
  }

  return (
    <div>
      {available && (
        <button
          onClick={() => (playing ? stop() : playFrom(active >= 0 ? active : 0))}
          className="mb-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-accent dark:text-primary"
        >
          {playing ? `⏸ ${labels.pause}` : `▶ ${labels.playAll}`} 🔊
        </button>
      )}

      <div className="space-y-5">
        {hadits.map((h, i) => (
          <article
            key={h.id}
            id={`hadits-${i}`}
            onClick={() => {
              stop();
              playFrom(i);
            }}
            className={`cursor-pointer rounded-2xl border p-5 transition-colors sm:p-6 ${
              i === active
                ? "border-accent bg-accent/10"
                : "border-[var(--color-border)] bg-[var(--color-card)] hover:border-accent/50"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-accent">
                {labels.hadithNo} {h.hadith_number.toLocaleString(lang)}
              </span>
              <span className="text-[11px] text-[var(--color-text-secondary)]">{h.source}</span>
            </div>
            <p dir="rtl" className="font-arabic mt-3 text-xl leading-loose text-[var(--color-text-primary)]">
              {h.text_ar}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{h.text_id}</p>
            {(h.narrator || h.grade) && (
              <p className="mt-3 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">
                {h.narrator ? `${labels.narrator}: ${h.narrator}` : ""}
                {h.narrator && h.grade ? " · " : ""}
                {h.grade ? `${labels.grade}: ${h.grade}` : ""}
              </p>
            )}
          </article>
        ))}
      </div>

      {translatedNote && (
        <p className="mt-6 text-center text-xs italic text-[var(--color-text-secondary)]">{labels.translatedNote}</p>
      )}
    </div>
  );
}
