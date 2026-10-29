"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/**
 * The 24-hour Makkah live on the sale page. The link comes from Admin → Situs dijual;
 * left empty, it is the Masjidil Haram channel the owner set in Admin → Live
 * Streaming, with its current broadcast resolved by the API (GET /content/live-streams).
 * Embedded through youtube-nocookie, like the /live hub.
 */
type Row = { slot?: unknown; kind?: unknown; title?: unknown; url?: unknown; video_id?: unknown; channel_id?: unknown };

function embedFor(raw: string): string | null {
  try {
    const u = new URL(raw);
    const q = "?rel=0&autoplay=1&mute=1";
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}${q}`;
    const parts = u.pathname.split("/").filter(Boolean);
    if (u.hostname === "youtu.be" && parts[0]) return `https://www.youtube-nocookie.com/embed/${parts[0]}${q}`;
    for (const key of ["live", "embed", "shorts"]) {
      const i = parts.indexOf(key);
      if (i >= 0 && parts[i + 1]) return `https://www.youtube-nocookie.com/embed/${parts[i + 1]}${q}`;
    }
    const ch = parts.indexOf("channel");
    if (ch >= 0 && parts[ch + 1]?.startsWith("UC")) return `https://www.youtube.com/embed/videoseries?list=UU${parts[ch + 1].slice(2)}&rel=0`;
    return null;
  } catch {
    return null;
  }
}

export function MakkahLive({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(url ? embedFor(url) : null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (url) return;
    let alive = true;
    api
      .get<{ streams?: unknown }>("/content/live-streams")
      .then((r) => {
        const rows = (Array.isArray(r?.streams) ? r.streams : []) as Row[];
        const makkah =
          rows.find((s) => s.kind === "auto" && s.slot === 101) ??
          rows.find((s) => typeof s.title === "string" && /makkah|mekkah|haram/i.test(s.title));
        if (!alive || !makkah) return;
        if (typeof makkah.video_id === "string" && makkah.video_id) {
          setSrc(`https://www.youtube-nocookie.com/embed/${makkah.video_id}?rel=0&autoplay=1&mute=1`);
          setLive(true);
        } else if (typeof makkah.url === "string") {
          setSrc(embedFor(makkah.url));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);

  return (
    <div className="overflow-hidden rounded-3xl border border-accent/40 bg-black shadow-2xl" data-testid="sale-makkah-live">
      <div className="flex items-center justify-between bg-primary px-4 py-2 text-xs text-[#f4efe3]">
        <span className="font-semibold">🕋 Masjidil Haram, Makkah — 24 jam</span>
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${live || url ? "animate-pulse bg-red-500" : "bg-white/40"}`} /> LIVE
        </span>
      </div>
      <div className="relative aspect-video">
        {src ? (
          <iframe
            src={src}
            title="Live Makkah 24 jam"
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-sm text-white/70">Memuat siaran langsung…</div>
        )}
      </div>
    </div>
  );
}
