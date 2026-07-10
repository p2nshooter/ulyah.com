"use client";

import { useRouter } from "next/navigation";
import { NarrateButton } from "./NarrateButton";

/**
 * Thin client wrapper around NarrateButton for a kitab's description: when
 * narration finishes naturally (not stopped by the user) and there is a next
 * book in the same category, it navigates there automatically — one listener
 * can move through a whole category without tapping "next" each time.
 */
export function KitabDescriptionReader({
  text,
  listenLabel,
  stopLabel,
  lang,
  nextHref,
}: {
  text: string;
  listenLabel: string;
  stopLabel: string;
  lang: string;
  nextHref: string | null;
}) {
  const router = useRouter();
  return (
    <NarrateButton
      paragraphs={[text]}
      listenLabel={listenLabel}
      stopLabel={stopLabel}
      lang={lang}
      onEnd={() => {
        if (nextHref) router.push(nextHref);
      }}
    />
  );
}
