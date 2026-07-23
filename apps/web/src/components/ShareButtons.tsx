"use client";

import { useState } from "react";
import { TENANT } from "@/lib/tenant";

/**
 * Social share row — lets visitors help spread the syiar by sharing the site.
 * Uses plain share-intent URLs (no third-party SDK, no tracking), plus the
 * native Web Share sheet on mobile and a copy-link fallback.
 */
const NETWORKS: { key: string; label: string; icon: string; href: (u: string, t: string) => string }[] = [
  { key: "whatsapp", label: "WhatsApp", icon: "🟢", href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}` },
  { key: "telegram", label: "Telegram", icon: "✈️", href: (u, t) => `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
  { key: "facebook", label: "Facebook", icon: "📘", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
  { key: "x", label: "X", icon: "𝕏", href: (u, t) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}` },
];

export function ShareButtons({
  url,
  title,
  copyLabel = "Salin tautan",
  copiedLabel = "Tersalin!",
  compact = false,
}: {
  url?: string;
  title: string;
  copyLabel?: string;
  copiedLabel?: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : TENANT.siteUrl);

  async function copy() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
        return;
      }
    } catch {
      /* user cancelled — fall through to clipboard */
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "justify-center"}`}>
      {NETWORKS.map((n) => (
        <a
          key={n.key}
          href={n.href(shareUrl, title)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${n.label}`}
          className="grid h-9 w-9 place-items-center rounded-full border border-accent/30 text-sm transition hover:border-accent hover:bg-accent/10"
        >
          <span aria-hidden>{n.icon}</span>
        </a>
      ))}
      <button
        onClick={copy}
        className="rounded-full border border-accent/30 px-3 py-1.5 text-xs transition hover:border-accent hover:bg-accent/10"
      >
        {copied ? `✓ ${copiedLabel}` : `🔗 ${copyLabel}`}
      </button>
    </div>
  );
}
