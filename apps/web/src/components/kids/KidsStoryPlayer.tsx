"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { speak, speechAvailable, type NarrationHandle } from "@/lib/speech";
import { KidsScene } from "@/components/kids/KidsScene";
import type { KidsAction, KidsVariant } from "@/components/kids/KidsCharacter";
import { kidsLabels } from "@/lib/kids-labels";

interface Scene {
  scene_order: number;
  time_of_day: "day" | "night";
  character_variant: KidsVariant;
  character_action: KidsAction;
  caption_id: string;
  caption_en: string | null;
  duration_ms: number;
}
interface StoryResponse {
  story: { id: number; slug: string; title_id: string; title_en: string | null };
  scenes: Scene[];
}

/**
 * Plays one Kisah Anak story scene-by-scene: an animated character + scene
 * backdrop, a big friendly caption, and real narration (browser TTS — the
 * same zero-key, multi-language voice engine used everywhere else on the
 * site) that drives WHEN the story advances, so pacing is always correct
 * regardless of language or reading speed. Falls back to each scene's
 * `duration_ms` only if speech synthesis genuinely isn't available.
 */
export function KidsStoryPlayer({ slug, uiLocale }: { slug: string; uiLocale: string }) {
  const t = kidsLabels(uiLocale);
  const [data, setData] = useState<StoryResponse | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [captionLang, setCaptionLang] = useState<"id" | "en">(uiLocale === "en" ? "en" : "id");
  const handleRef = useRef<NarrationHandle | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    api
      .get<StoryResponse>(`/content/kids-stories/${slug}`)
      .then(setData)
      .catch(() => setData(null));
  }, [slug]);

  function clearPending() {
    handleRef.current?.cancel();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  function playScene(i: number) {
    if (!data) return;
    const scene = data.scenes[i];
    if (!scene) {
      setPlaying(false);
      return;
    }
    stoppedRef.current = false;
    const caption = captionLang === "id" ? scene.caption_id : scene.caption_en ?? scene.caption_id;

    const advance = () => {
      if (stoppedRef.current) return;
      setIndex((prev) => {
        const next = prev + 1;
        if (next >= data.scenes.length) {
          setPlaying(false);
          return prev;
        }
        return next;
      });
    };

    if (speechAvailable()) {
      handleRef.current = speak(caption, captionLang);
      handleRef.current.done.then(() => {
        if (!stoppedRef.current) advance();
      });
    } else {
      timeoutRef.current = setTimeout(advance, scene.duration_ms);
    }
  }

  useEffect(() => {
    if (playing) playScene(index);
    return clearPending;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, captionLang]);

  function handlePlay() {
    if (!data) return;
    setPlaying(true);
  }
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

  if (!data) return <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">{t.loading}</p>;

  const scene = data.scenes[index];
  const title = uiLocale === "en" ? data.story.title_en ?? data.story.title_id : data.story.title_id;
  const caption = scene ? (captionLang === "id" ? scene.caption_id : scene.caption_en ?? scene.caption_id) : "";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-center font-heading text-2xl sm:text-3xl">{title}</h1>

      <div className="mt-6">
        {scene && <KidsScene timeOfDay={scene.time_of_day} variant={scene.character_variant} action={scene.character_action} />}
      </div>

      {scene && (
        <div
          key={index}
          className="kids-caption-enter mt-5 rounded-2xl border border-accent/25 bg-[var(--color-card)] p-5 text-center text-lg leading-relaxed"
        >
          {caption}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {!playing ? (
          <button onClick={handlePlay} className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-primary shadow-lg">
            ▶ {t.play}
          </button>
        ) : (
          <button onClick={handlePause} className="rounded-full border border-accent/40 px-5 py-2.5 text-sm font-medium text-accent">
            ⏸ {t.pause}
          </button>
        )}
        <button onClick={handleReplay} className="rounded-full border border-accent/40 px-5 py-2.5 text-sm text-accent">
          ↻ {t.replay}
        </button>
        <div className="inline-flex rounded-full border border-accent/40 p-1">
          <button
            onClick={() => setCaptionLang("id")}
            className={`rounded-full px-3 py-1.5 text-xs ${captionLang === "id" ? "bg-accent text-primary" : "text-accent"}`}
          >
            ID
          </button>
          <button
            onClick={() => setCaptionLang("en")}
            className={`rounded-full px-3 py-1.5 text-xs ${captionLang === "en" ? "bg-accent text-primary" : "text-accent"}`}
          >
            EN
          </button>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-[var(--color-text-secondary)]">
        {t.sceneOf(index + 1, data.scenes.length)}
      </p>
    </div>
  );
}
