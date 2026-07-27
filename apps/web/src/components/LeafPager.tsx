"use client";

import { useEffect, useRef, useState } from "react";
import { paginateLeaves, leafOf, LEAF_INK, type LeafItem } from "@/lib/leaf";

/**
 * A bab set as leaves of a printed kitab: the matn on the page, the terjemah
 * beneath it, and the leaf turning by itself as the reciter reaches the next
 * one — the way the mushaf turns its own page.
 *
 * The turn is not a separate mechanism. The pager follows `activeId`, which
 * the reader already sets to whatever is being narrated, so "auto next" falls
 * out of following the voice: when the voice moves to a passage that lives on
 * a later leaf, the leaf turns. Nothing has to stay in step with anything.
 */

export type LeafMode = "light" | "sepia" | "night";
export type LeafSize = "s" | "m" | "l" | "xl";

interface Labels {
  /** e.g. "Lembar 3 / 12" */
  leafOf: (n: number, total: number) => string;
  prev: string;
  next: string;
  /** Heading over the terjemah; empty to show none. */
  translation: string;
}

interface Props<T extends LeafItem> {
  items: T[];
  /** The passage being narrated, if any — the leaf follows it. */
  activeId?: number | null;
  /** Which part of the passage is being read, so only that one highlights. */
  activePart?: "ar" | "tr" | null;
  mode?: LeafMode;
  size?: LeafSize;
  labels: Labels;
  /** Renders the matn — the caller owns the live word highlighting. */
  renderMatn: (item: T, active: boolean) => React.ReactNode;
  /** Renders the terjemah, or nothing when the kitab has none for this matn. */
  renderTranslation?: (item: T, active: boolean) => React.ReactNode;
  /** Whether this passage has a terjemah at all — hadits keep it under a
   *  different column name than the kitab do. */
  hasTranslation?: (item: T) => boolean;
  /** Anything that belongs under the passage: narrator, grade, source. */
  renderFooter?: (item: T) => React.ReactNode;
  /** How much of a leaf one passage fills, when it is not `translation_id`. */
  cost?: (item: T) => number;
  /** Tapping a passage — used to start reading from it. */
  onSelect?: (item: T) => void;
  /** Told whenever the leaf changes, so the caller can remember the place. */
  onLeafChange?: (index: number, total: number) => void;
}

type FlipPhase = "idle" | "out" | "in";
type FlipDirection = "next" | "prev";

export default function LeafPager<T extends LeafItem>({
  items,
  activeId,
  activePart = null,
  mode = "light",
  size = "m",
  labels,
  renderMatn,
  renderTranslation,
  hasTranslation,
  renderFooter,
  cost,
  onSelect,
  onLeafChange,
}: Props<T>) {
  const leaves = paginateLeaves(items, LEAF_INK, cost);
  const [index, setIndex] = useState(0);
  const [flipPhase, setFlipPhase] = useState<FlipPhase>("idle");
  const [flipDirection, setFlipDirection] = useState<FlipDirection>("next");
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shown = useRef(0);

  // A new bab starts at its first leaf.
  useEffect(() => {
    setIndex(0);
    shown.current = 0;
  }, [items]);

  useEffect(() => {
    return () => {
      if (flipTimer.current) clearTimeout(flipTimer.current);
    };
  }, []);

  function turnTo(next: number) {
    if (next < 0 || next >= leaves.length || next === index || flipPhase !== "idle") return;
    setFlipDirection(next > index ? "next" : "prev");
    setFlipPhase("out");
    flipTimer.current = setTimeout(() => {
      setIndex(next);
      shown.current = next;
      setFlipPhase("in");
      onLeafChange?.(next, leaves.length);
      flipTimer.current = setTimeout(() => setFlipPhase("idle"), 460);
    }, 420);
  }

  // Follow the reciter. This is the whole of "auto next": the voice moves on,
  // the leaf it moved to becomes the leaf on screen.
  useEffect(() => {
    const want = leafOf(leaves, activeId);
    if (want >= 0 && want !== shown.current) turnTo(want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Keep the passage being recited in view as the voice works down the leaf.
  useEffect(() => {
    if (activeId == null) return;
    document
      .getElementById(`leaf-passage-${activeId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeId, index]);

  const leaf = leaves[index] ?? [];
  const flipClass =
    flipPhase === "out"
      ? flipDirection === "next"
        ? "leaf-flip-next-out"
        : "leaf-flip-prev-out"
      : flipPhase === "in"
        ? flipDirection === "next"
          ? "leaf-flip-next-in"
          : "leaf-flip-prev-in"
        : "";

  return (
    <div>
      <div className={`leaf-paper p-5 sm:p-7 ${flipClass}`} data-mode={mode}>
        {leaf.map((item) => {
          const active = activeId === item.id;
          return (
            <article
              key={item.id}
              id={`leaf-passage-${item.id}`}
              onClick={onSelect ? () => onSelect(item) : undefined}
              className={`leaf-passage ${active ? "leaf-passage-active px-2 py-1" : ""} ${onSelect ? "cursor-pointer" : ""}`}
            >
              <div dir="rtl" className="leaf-matn font-arabic" data-size={size}>
                {renderMatn(item, active && activePart === "ar")}
              </div>
              {renderTranslation && (hasTranslation ? hasTranslation(item) : item.translation_id?.trim()) ? (
                <div className="leaf-tarjamah">
                  {labels.translation ? (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">
                      {labels.translation}
                    </p>
                  ) : null}
                  <div className="text-sm leading-relaxed">
                    {renderTranslation(item, active && activePart === "tr")}
                  </div>
                </div>
              ) : null}
              {renderFooter ? <div className="mt-3">{renderFooter(item)}</div> : null}
            </article>
          );
        })}

        <div className="mt-6 flex justify-center">
          <span className="leaf-medallion text-sm">{index + 1}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => turnTo(index - 1)}
          disabled={index <= 0 || flipPhase !== "idle"}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm disabled:opacity-40"
        >
          {labels.prev}
        </button>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {labels.leafOf(index + 1, leaves.length)}
        </span>
        <button
          type="button"
          onClick={() => turnTo(index + 1)}
          disabled={index >= leaves.length - 1 || flipPhase !== "idle"}
          className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm disabled:opacity-40"
        >
          {labels.next}
        </button>
      </div>
    </div>
  );
}
