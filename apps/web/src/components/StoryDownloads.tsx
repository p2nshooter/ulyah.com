"use client";

import { ebookDownloadUrl } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";
import { TENANT } from "@/lib/tenant";

/**
 * Download row for an article: the PDF if one exists, and a plain-text export
 * generated in the browser so every article always has at least one
 * downloadable artifact.
 *
 * There is no MP3 here any more. The audiobooks were text-to-speech files kept
 * in R2 — 91 GB of them, nine times the free tier (owner, 12 Oct 2026:
 * "turunkan R2-nya hingga di bawah 10 GB") — and they are expired by an R2
 * lifecycle rule (.github/r2-lifecycle). Every article is narrated in the
 * reader's own browser by StoryReader instead, in every language, with nothing
 * stored and nothing that can say "audio sedang diproses" forever.
 */
export function StoryDownloads({
  title,
  body,
  pdfEbookId,
  dict,
}: {
  title: string;
  body: string;
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
      {pdfEbookId && (
        <a
          href={ebookDownloadUrl(pdfEbookId)}
          className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) px-4 py-2 text-sm transition hover:border-accent"
        >
          📄 PDF
        </a>
      )}

      <button
        onClick={downloadText}
        className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) px-4 py-2 text-sm transition hover:border-accent"
      >
        📝 {dict.reader.downloadText}
      </button>
    </div>
  );
}
