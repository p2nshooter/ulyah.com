"use client";

import { usePlayerStore } from "@/lib/player-store";

export function StoryPlayButton({ storyId, title, label }: { storyId: number; title: string; label: string }) {
  const playStory = usePlayerStore((s) => s.playStory);

  return (
    <button
      onClick={() => playStory(storyId, title)}
      className="rounded-full bg-primary px-4 py-2 text-sm text-white dark:bg-accent dark:text-primary"
    >
      {label}
    </button>
  );
}
