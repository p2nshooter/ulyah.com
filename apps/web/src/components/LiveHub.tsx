"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";

interface StreamRow {
  id: number;
  platform: "youtube" | "tiktok" | "facebook";
  slot: number;
  title: string | null;
  url: string | null;
  is_live: number;
}

// Streaming-via-ulyah contact, shown on every offline card — explicit owner
// request, including the name and number.
const CONTACT_NAME = "Yusron Efendi";
const CONTACT_PHONE = "+62 856-9123-4561";
const CONTACT_TEL = "+6285691234561";

const PLATFORM_META: Record<StreamRow["platform"], { label: string; icon: string }> = {
  youtube: { label: "YouTube", icon: "▶️" },
  tiktok: { label: "TikTok", icon: "🎵" },
  facebook: { label: "Facebook", icon: "📘" },
};

// YouTube slots 1 & 2 never go dark: when the owner isn't broadcasting on
// them, they fall back to the OFFICIAL Saudi Broadcasting Authority 24/7
// lives — Masjid al-Haram (KSA Qur'an TV, UCos52azQNBgW63_9uDJoPDA) and
// Masjid an-Nabawi (Sunnah TV, UCROKYPep-UuODNwyipe6JMw) — like a TV that is
// always on. Channel-based embeds (`live_stream?channel=`) always resolve to
// whatever that channel is currently streaming, so this needs no manual
// updating when the stream session changes. Muted by default (autoplay
// policy + owner request) — visitors turn the sound on themselves.
const HOLY_FALLBACK: Record<number, { channelId: string; titleId: string; titleEn: string; icon: string }> = {
  1: { channelId: "UCos52azQNBgW63_9uDJoPDA", titleId: "Masjidil Haram — Makkah", titleEn: "Masjid al-Haram — Makkah", icon: "🕋" },
  2: { channelId: "UCROKYPep-UuODNwyipe6JMw", titleId: "Masjid Nabawi — Madinah", titleEn: "Masjid an-Nabawi — Madinah", icon: "🕌" },
};

function fallbackEmbedUrl(channelId: string): string {
  return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1`;
}

/**
 * Build the on-site embed URL for a pasted stream link. YouTube goes through
 * youtube-nocookie (privacy-enhanced, matches the site's no-tracking
 * stance); Facebook through its official video plugin. TikTok offers no
 * iframe embed for lives — those render as an elegant link-out card instead
 * (stated plainly rather than faking it).
 */
function toEmbedUrl(platform: StreamRow["platform"], raw: string): string | null {
  try {
    const url = new URL(raw);
    if (platform === "youtube") {
      // watch?v=ID | youtu.be/ID | /live/ID | /embed/ID | /channel/UC…(/live)
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      const parts = url.pathname.split("/").filter(Boolean);
      if (url.hostname === "youtu.be" && parts[0]) return `https://www.youtube-nocookie.com/embed/${parts[0]}`;
      const liveIdx = parts.indexOf("live");
      if (liveIdx >= 0 && parts[liveIdx + 1]) return `https://www.youtube-nocookie.com/embed/${parts[liveIdx + 1]}`;
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return `https://www.youtube-nocookie.com/embed/${parts[embedIdx + 1]}`;
      const chIdx = parts.indexOf("channel");
      if (chIdx >= 0 && parts[chIdx + 1])
        return `https://www.youtube-nocookie.com/embed/live_stream?channel=${parts[chIdx + 1]}`;
      return null;
    }
    if (platform === "facebook") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(raw)}&show_text=false`;
    }
    return null; // tiktok: link-out card
  } catch {
    return null;
  }
}

function OfflineCard({ platform, isId }: { platform: StreamRow["platform"]; isId: boolean }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-[#0B3D2E] to-[#06251b] p-6 text-center text-[#f4efe3]">
      <Image src="/brand/wordmark-ar-gold.png" alt="ULYAH.COM" width={150} height={42} className="h-9 w-auto opacity-90" />
      <p className="text-xs uppercase tracking-[0.25em] text-accent">ulyah.com</p>
      <p className="mt-1 text-sm text-[#f4efe3]/75">
        {isId
          ? `Siaran ${PLATFORM_META[platform].label} sedang offline.`
          : `The ${PLATFORM_META[platform].label} stream is currently offline.`}
      </p>
      <div className="mt-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs leading-relaxed">
        <p className="font-medium text-accent">
          {isId ? "Ingin siaran langsung melalui ulyah.com?" : "Want to stream live via ulyah.com?"}
        </p>
        <p className="mt-1">
          {CONTACT_NAME} ·{" "}
          <a href={`tel:${CONTACT_TEL}`} className="font-semibold text-accent hover:underline">
            {CONTACT_PHONE}
          </a>
        </p>
      </div>
    </div>
  );
}

export function LiveHub({ locale }: { locale: string }) {
  const isId = locale !== "en" && locale !== "ar"; // default to Indonesian copy
  const [streams, setStreams] = useState<StreamRow[]>([]);
  const [maximized, setMaximized] = useState<StreamRow | null>(null);

  useEffect(() => {
    api
      .get<{ streams: StreamRow[] }>("/content/live-streams")
      .then((r) => setStreams(r.streams))
      .catch(() => setStreams([]));
  }, []);

  // Escape closes the maximized view, same as the ✕ button.
  useEffect(() => {
    if (!maximized) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMaximized(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximized]);

  // Fallback applies whenever the owner isn't broadcasting on that slot.
  const holyFallbackFor = (s: StreamRow) =>
    s.platform === "youtube" && (!s.is_live || !s.url) ? HOLY_FALLBACK[s.slot] : undefined;

  function renderPlayer(s: StreamRow, inMax = false) {
    const fb = holyFallbackFor(s);
    if (fb) {
      return (
        <iframe
          src={fallbackEmbedUrl(fb.channelId)}
          title={isId ? fb.titleId : fb.titleEn}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className={inMax ? "h-full w-full" : "aspect-video w-full rounded-2xl"}
        />
      );
    }
    const embed = s.is_live && s.url ? toEmbedUrl(s.platform, s.url) : null;
    if (!s.is_live || !s.url) return <OfflineCard platform={s.platform} isId={isId} />;
    if (embed) {
      return (
        <iframe
          src={embed}
          title={s.title ?? `${PLATFORM_META[s.platform].label} live`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className={inMax ? "h-full w-full" : "aspect-video w-full rounded-2xl"}
        />
      );
    }
    // Live but not embeddable (TikTok): elegant link-out, stated honestly.
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-[#0B3D2E] to-[#06251b] p-6 text-center text-[#f4efe3]">
        <span className="text-4xl">{PLATFORM_META[s.platform].icon}</span>
        <p className="text-sm">
          {isId
            ? `${PLATFORM_META[s.platform].label} tidak mengizinkan pemutaran live di situs lain.`
            : `${PLATFORM_META[s.platform].label} does not allow live playback on other sites.`}
        </p>
        <a
          href={s.url}
          target="_blank"
          rel="noopener"
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-primary shadow-lg"
        >
          {isId ? "Tonton live" : "Watch live"} ↗
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="reveal-stagger grid gap-5 sm:grid-cols-2">
        {streams.map((s) => {
          const fb = holyFallbackFor(s);
          const hasEmbed = !!fb || (!!s.is_live && !!s.url && !!toEmbedUrl(s.platform, s.url));
          return (
            <div key={s.id} className="card-premium overflow-hidden p-3">
              <div className="mb-2 flex items-center justify-between gap-2 px-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span aria-hidden>{fb ? fb.icon : PLATFORM_META[s.platform].icon}</span>
                  {fb
                    ? isId
                      ? fb.titleId
                      : fb.titleEn
                    : s.title || `${PLATFORM_META[s.platform].label} ${s.platform === "youtube" ? s.slot : ""}`}
                  {fb ? (
                    <span className="flex items-center gap-1 rounded-full bg-red-600/15 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> 24 {isId ? "JAM" : "HRS"}
                    </span>
                  ) : s.is_live ? (
                    <span className="flex items-center gap-1 rounded-full bg-red-600/15 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
                    </span>
                  ) : (
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)] dark:bg-white/10">
                      OFFLINE
                    </span>
                  )}
                </p>
                {hasEmbed && (
                  <button
                    onClick={() => setMaximized(s)}
                    className="rounded-full border border-accent/40 px-3 py-1 text-xs text-accent"
                  >
                    ⛶ {isId ? "Perbesar" : "Maximize"}
                  </button>
                )}
              </div>
              {renderPlayer(s)}
              {fb && (
                <p className="mt-2 px-1 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
                  {isId
                    ? "🔇 Suara mati secara bawaan — ketuk ikon speaker di pemutar untuk mengaktifkan. Siaran resmi Saudi Broadcasting Authority."
                    : "🔇 Muted by default — tap the speaker icon in the player to unmute. Official Saudi Broadcasting Authority stream."}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* On-site maximize — full-viewport overlay, still on ulyah.com. */}
      {maximized && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[#f4efe3]">
            <p className="truncate text-sm">
              {holyFallbackFor(maximized)
                ? `${holyFallbackFor(maximized)!.icon} ${isId ? holyFallbackFor(maximized)!.titleId : holyFallbackFor(maximized)!.titleEn}`
                : `${PLATFORM_META[maximized.platform].icon} ${maximized.title || PLATFORM_META[maximized.platform].label}`}
            </p>
            <button
              onClick={() => setMaximized(null)}
              className="rounded-full border border-white/25 px-4 py-1.5 text-sm hover:bg-white/10"
            >
              ✕ {isId ? "Tutup" : "Close"}
            </button>
          </div>
          <div className="min-h-0 flex-1">{renderPlayer(maximized, true)}</div>
        </div>
      )}
    </div>
  );
}
