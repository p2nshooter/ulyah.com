"use client";

import { api, ebookDownloadUrl } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";
import { TENANT } from "@/lib/tenant";

/**
 * Download row for an article: the audiobook MP3 (once the narration has been
 * synthesised), the PDF if one exists, and a plain-text export generated in the
 * browser so every article always has at least one downloadable artifact. The
 * article stays listenable in-browser via StoryReader regardless.
 */
export function StoryDownloads({
  storyId,
  title,
  body,
  audioAvailable,
  pdfEbookId,
  dict,
}: {
  storyId: number;
  title: string;
  body: string;
  audioAvailable: boolean;
  pdfEbookId: number | null;
  dict: Dictionary;
}) {
  function downloadText() {
    const blob = new Blob([`${title}\n\n${body}\n\n— ${TENANT.siteName}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^\p{L}\p{N} _-]/gu, "").slice(0, 80) || "artikel"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {audioAvailable ? (
        <a
          href={`${api.base}/content/stories/${storyId}/audio?download=1`}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-primary transition hover:brightness-105"
        >
          🎧 {dict.reader.downloadAudiobook}
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-text-secondary)]">
          ⏳ {dict.reader.audioProcessing}
        </span>
      )}

      {pdfEbookId && (
        <a
          href={ebookDownloadUrl(pdfEbookId)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm transition hover:border-accent"
        >
          📄 PDF
        </a>
      )}

      <button
        onClick={downloadText}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm transition hover:border-accent"
      >
        📝 {dict.reader.downloadText}
      </button>
    </div>
  );
}
