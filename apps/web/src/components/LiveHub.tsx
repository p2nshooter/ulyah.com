"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";
import { liveLabels } from "@/lib/live-labels";

interface StreamRow {
  id: number;
  platform: "youtube";
  slot: number;
  kind: "auto" | "manual";
  region: string | null;
  title: string | null;
  url: string | null;
  is_live: number;
  /** Auto rows: the channel id parsed from url (UC…). */
  channel_id?: string | null;
  /** Auto rows: the channel's CURRENT live broadcast, resolved server-side.
   * null = not live right now / not resolvable → fall back to latest video. */
  video_id?: string | null;
  /** Auto rows, when not live: the channel's newest upload (RSS-resolved). */
  latest_video_id?: string | null;
}

// Streaming-via-ulyah contact, shown on every offline manual card — explicit
// owner request, including the name and number.
const CONTACT_NAME = "Yusron Efendi";
const CONTACT_PHONE = "+62 856-9123-4561";
const CONTACT_TEL = "+6285691234561";

/**
 * Build the on-site embed URL for a pasted YouTube link. Channel URLs embed
 * the channel's CURRENT live broadcast (that's what makes the auto world
 * section maintenance-free); video links embed that video. Everything goes
 * through youtube-nocookie (privacy-enhanced, matching the site's
 * no-tracking stance).
 */
function toEmbedUrl(raw: string, opts: { autoplayMuted?: boolean } = {}): string | null {
  const params = opts.autoplayMuted ? "&autoplay=1&mute=1" : "";
  try {
    const url = new URL(raw);
    const v = url.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}?rel=0${params}`;
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.hostname === "youtu.be" && parts[0]) return `https://www.youtube-nocookie.com/embed/${parts[0]}?rel=0${params}`;
    const liveIdx = parts.indexOf("live");
    if (liveIdx >= 0 && parts[liveIdx + 1]) return `https://www.youtube-nocookie.com/embed/${parts[liveIdx + 1]}?rel=0${params}`;
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return `https://www.youtube-nocookie.com/embed/${parts[embedIdx + 1]}?rel=0${params}`;
    const chIdx = parts.indexOf("channel");
    // Channel URL without a server-resolved live id: embed the uploads
    // playlist (UU + channel-id suffix). YouTube's live_stream?channel=
    // endpoint shows "Video unavailable" far too often to rely on.
    if (chIdx >= 0 && parts[chIdx + 1]?.startsWith("UC"))
      return `https://www.youtube.com/embed/videoseries?list=UU${parts[chIdx + 1].slice(2)}&rel=0${params}`;
    return null;
  } catch {
    return null;
  }
}

/** Preferred embed for a stream row: exact live video id when the worker
 * resolved one; else the channel's newest upload (RSS-resolved — uploads
 * PLAYLIST embeds are refused by the privacy player for many channels); the
 * playlist on plain youtube.com stays as the very last resort. */
function streamEmbedUrl(s: StreamRow, opts: { autoplayMuted?: boolean } = {}): string | null {
  const params = opts.autoplayMuted ? "&autoplay=1&mute=1" : "";
  if (s.video_id) return `https://www.youtube-nocookie.com/embed/${s.video_id}?rel=0${params}`;
  if (s.latest_video_id) return `https://www.youtube-nocookie.com/embed/${s.latest_video_id}?rel=0${params}`;
  if (s.kind === "auto" && s.channel_id)
    return `https://www.youtube.com/embed/videoseries?list=UU${s.channel_id.slice(2)}&rel=0${params}`;
  return s.url ? toEmbedUrl(s.url, opts) : null;
}

function OfflineCard({ t }: { t: ReturnType<typeof liveLabels> }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 app-hero rounded-2xl p-6 text-center">
      <Image src={TENANT.id === "ulyah" ? "/brand/wordmark-ar-gold.png" : TENANT.logoIcon} alt={TENANT.siteName} width={TENANT.id === "ulyah" ? 150 : 56} height={TENANT.id === "ulyah" ? 42 : 56} className={TENANT.id === "ulyah" ? "h-9 w-auto opacity-90" : "h-12 w-12 rounded-xl"} />
      <p className="text-xs uppercase tracking-[0.25em] text-accent">{TENANT.siteUrl.replace(/^https?:\/\//, "")}</p>
      <p className="mt-1 text-sm text-[#f4efe3]/75">{t.offlineSlot}</p>
      <div className="mt-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-xs leading-relaxed">
        <p className="font-medium text-accent">
          {t.wantStream}
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
  const t = liveLabels(locale, TENANT.siteName);
  const [streams, setStreams] = useState<StreamRow[]>([]);
  const [maximized, setMaximized] = useState<StreamRow | null>(null);

  // Load once, then re-poll every 60s so an admin CRUD (add/edit/delete/toggle
  // a stream in the ulyah portal) reaches an already-open page without a manual
  // reload. The endpoint is no longer edge-cached 30 min, so each poll returns
  // the current DB state; the YouTube live-lookup behind it stays KV-cached, so
  // polling stays cheap. (owner: konten live wajib full updated dari admin.)
  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get<{ streams: StreamRow[] }>("/content/live-streams")
        .then((r) => alive && setStreams(r.streams))
        .catch(() => alive && setStreams((prev) => prev));
    load();
    const id = window.setInterval(load, 60000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!maximized) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMaximized(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [maximized]);

  const autos = streams.filter((s) => s.kind === "auto");
  const manuals = streams.filter((s) => s.kind === "manual");

  function player(s: StreamRow, inMax = false) {
    // Auto world channels: the first two (Haram & Nabawi) autoplay muted like
    // a TV that's always on; the rest are click-to-play inside the player and
    // lazy-loaded, so a page full of world channels stays light.
    const autoplayMuted = s.kind === "auto" && (s.slot === 101 || s.slot === 102 || inMax);
    const embed = streamEmbedUrl(s, { autoplayMuted });
    if (!embed || (s.kind === "manual" && !s.is_live)) return <OfflineCard t={t} />;
    return (
      <iframe
        src={embed}
        title={s.title ?? "Live"}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={inMax ? "h-full w-full" : "aspect-video w-full rounded-2xl"}
      />
    );
  }

  function card(s: StreamRow) {
    // Auto rows are only "live" when the worker actually resolved a live
    // broadcast; otherwise they play the channel's recent videos (REKAMAN).
    const live = s.kind === "auto" ? !!s.video_id : !!s.is_live;
    const canMax = !!streamEmbedUrl(s) && (s.kind === "auto" || !!s.is_live);
    return (
      <div key={s.id} className="card-premium overflow-hidden p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <span className="truncate">
              {s.title || `YouTube ${s.slot}`}
              {s.region && <span className="ml-1.5 text-xs font-normal text-[var(--color-text-secondary)]">· {s.region}</span>}
            </span>
            {live ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-600/15 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                {s.kind === "auto" ? `LIVE · 24 ${t.hrs}` : "LIVE"}
              </span>
            ) : s.kind === "auto" ? (
              <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                ⏵ {t.replay}
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-black/10 px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)] dark:bg-white/10">
                OFFLINE
              </span>
            )}
          </p>
          {canMax && (
            <button onClick={() => setMaximized(s)} className="shrink-0 rounded-full border border-accent/40 px-3 py-1 text-xs text-accent">
              ⛶ {t.maximize}
            </button>
          )}
        </div>
        {player(s)}
        {s.kind === "auto" && (
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
            {!s.video_id && (
              <span>
                ⏸ {t.notLive}
              </span>
            )}
            {s.channel_id && (
              <a
                href={`https://www.youtube.com/channel/${s.channel_id}/live`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                ↗ {t.openYoutube}
              </a>
            )}
          </p>
        )}
        {s.kind === "auto" && (s.slot === 101 || s.slot === 102) && (
          <p className="mt-2 px-1 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
            {t.mutedDefault}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Auto: always-on world broadcasts */}
      <section>
        <h2 className="flex items-center gap-2 font-heading text-xl">
          <span aria-hidden>🕋</span> {t.autoTitle}
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">{autos.length}</span>
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {t.autoDesc}
        </p>
        <div className="reveal-stagger mt-4 grid gap-5 sm:grid-cols-2">{autos.map(card)}</div>
      </section>

      {/* Manual: the owner's six slots */}
      <section>
        <h2 className="flex items-center gap-2 font-heading text-xl">
          <span aria-hidden>🎥</span> {t.broadcastsTitle}
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">{manuals.length}</span>
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {t.broadcastsDesc}
        </p>
        <div className="reveal-stagger mt-4 grid gap-5 sm:grid-cols-2">{manuals.map(card)}</div>
      </section>

      {/* On-site maximize */}
      {maximized && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-[#f4efe3]">
            <p className="truncate text-sm">
              {maximized.title}
              {maximized.region ? ` · ${maximized.region}` : ""}
            </p>
            <button onClick={() => setMaximized(null)} className="rounded-full border border-white/25 px-4 py-1.5 text-sm hover:bg-white/10">
              ✕ {t.close}
            </button>
          </div>
          <div className="min-h-0 flex-1">{player(maximized, true)}</div>
        </div>
      )}
    </div>
  );
}
