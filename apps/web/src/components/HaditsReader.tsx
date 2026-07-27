"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { speak, speechAvailable, type NarrationHandle } from "@/lib/speech";
import type { HaditsLabels } from "@/lib/hadits-labels";
import { gradeInfo } from "@/lib/hadith-grade";
import LeafPager from "@/components/LeafPager";

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
      // The leaf pager turns the page to this hadith and scrolls it into view.
      setActive(i);
      const h = hadits[i]!;
      for (const [text, l] of [
        [h.text_ar, "ar"],
        [h.text_id, lang],
      ] as const) {
        if (stopRef.current || !text) continue;
        const handle = speak(text, l, { rate: l === "ar" ? 0.85 : 0.95, owner: "hadits" });
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

      {/* Leaves, not a scroll: a hadith book is a book. The leaf follows the
          reciter, so the page turns itself as playback moves down the page and
          on to the next leaf. */}
      <LeafPager
        items={hadits}
        activeId={active >= 0 ? (hadits[active]?.id ?? null) : null}
        activePart="ar"
        labels={{
          leafOf: (n, total) => `${labels.page} ${n} ${labels.of} ${total}`,
          prev: `‹ ${labels.prev}`,
          next: `${labels.next} ›`,
          // No heading over the terjemah here: it sits under its own rule and
          // the hadith labels carry no word for it, and inventing one would
          // put English on the sibling sites.
          translation: "",
        }}
        cost={(h) => h.text_ar.length + h.text_id.length}
        hasTranslation={(h) => !!h.text_id?.trim()}
        onSelect={(h) => {
          const i = hadits.findIndex((x) => x.id === h.id);
          if (i < 0) return;
          stop();
          playFrom(i);
        }}
        renderMatn={(h) => (
          <>
            <span className="mb-2 flex items-center justify-between gap-3 text-xs" dir="ltr">
              <span className="font-semibold text-accent">
                {labels.hadithNo} {h.hadith_number.toLocaleString(lang)}
              </span>
              <span className="opacity-70">{h.source}</span>
            </span>
            {h.text_ar}
          </>
        )}
        renderTranslation={(h) => h.text_id}
        renderFooter={(h) =>
          h.narrator || h.grade ? (
            <div className="flex flex-wrap items-center gap-2 text-xs opacity-80">
              {h.narrator ? (
                <span>
                  {labels.narrator}: {h.narrator}
                </span>
              ) : null}
              {h.grade
                ? (() => {
                    const g = gradeInfo(h.grade);
                    return (
                      <span
                        title={`${g.meaning}${h.grade && g.label.toLowerCase() !== h.grade.toLowerCase() ? ` (sumber: ${h.grade})` : ""}`}
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${g.className}`}
                      >
                        {g.label}
                      </span>
                    );
                  })()
                : null}
            </div>
          ) : null
        }
      />

      {translatedNote && (
        <p className="mt-6 text-center text-xs italic text-[var(--color-text-secondary)]">{labels.translatedNote}</p>
      )}
    </div>
  );
}
