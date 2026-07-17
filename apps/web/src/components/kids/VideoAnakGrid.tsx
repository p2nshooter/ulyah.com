"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface VideoRow {
  id: number;
  series: "doa-kisah" | "syamil-dodo" | "biografi-rasul";
  video_order: number;
  title: string;
  youtube_id: string;
  country?: string;
}
interface ChannelRow {
  id: number;
  country: string;
  title: string;
  channel_id: string;
  language: string | null;
}

const SERIES_META: Record<VideoRow["series"], { label: string; icon: string }> = {
  "doa-kisah": { label: "Seri Do'a & Kisah", icon: "🤲" },
  "syamil-dodo": { label: "Bioskop Anak Muslim — Syamil & Dodo", icon: "🎬" },
  "biografi-rasul": { label: "Biografi Rasulullah ﷺ", icon: "🕌" },
};

/**
 * The owner's 45 kids videos (youtube.com/@ulyah-com), three series.
 * Click-to-play: each card shows just the YouTube thumbnail (one <img>, no
 * iframe) until tapped — 45 eager iframes would crush the page — then swaps
 * in a privacy-enhanced youtube-nocookie player that autoplays.
 */
export function VideoAnakGrid({ locale }: { locale: string }) {
  const KIDS_L: Record<string, { worldwide: string; worldwideDesc: string; play: string; video: string; series: Record<VideoRow["series"], string> }> = {
    id: { worldwide: "Film Anak Muslim Seluruh Dunia", worldwideDesc: "Kanal resmi film anak Muslim dari berbagai negara — dikelompokkan per negara, semuanya bisa ditonton di sini.", play: "Putar", video: "video", series: { "doa-kisah": "Seri Do'a & Kisah", "syamil-dodo": "Bioskop Anak Muslim — Syamil & Dodo", "biografi-rasul": "Biografi Rasulullah ﷺ" } },
    en: { worldwide: "Muslim Kids' Films Worldwide", worldwideDesc: "Official Muslim kids' film channels from around the world — grouped by country, all watchable right here.", play: "Play", video: "videos", series: { "doa-kisah": "Du'a & Stories Series", "syamil-dodo": "Muslim Kids' Cinema — Syamil & Dodo", "biografi-rasul": "Biography of the Prophet ﷺ" } },
    fr: { worldwide: "Films pour enfants musulmans du monde entier", worldwideDesc: "Chaînes officielles de films pour enfants musulmans du monde entier — regroupées par pays, toutes visibles ici.", play: "Lire", video: "vidéos", series: { "doa-kisah": "Série Invocations & Récits", "syamil-dodo": "Cinéma pour enfants musulmans — Syamil & Dodo", "biografi-rasul": "Biographie du Prophète ﷺ" } },
    de: { worldwide: "Muslimische Kinderfilme aus aller Welt", worldwideDesc: "Offizielle Kanäle mit muslimischen Kinderfilmen aus aller Welt — nach Ländern gruppiert, alle hier ansehbar.", play: "Abspielen", video: "Videos", series: { "doa-kisah": "Reihe: Bittgebete & Geschichten", "syamil-dodo": "Muslimisches Kinderkino — Syamil & Dodo", "biografi-rasul": "Biografie des Propheten ﷺ" } },
    ar: { worldwide: "أفلام الأطفال المسلمين من العالم", worldwideDesc: "قنوات رسمية لأفلام الأطفال المسلمين من مختلف الدول — مُجمّعة حسب الدولة، ويمكن مشاهدتها كلها هنا.", play: "تشغيل", video: "فيديو", series: { "doa-kisah": "سلسلة الأدعية والقصص", "syamil-dodo": "سينما الأطفال المسلمين — شامل ودودو", "biografi-rasul": "سيرة النبي ﷺ" } },
  };
  const kl = KIDS_L[locale] ?? KIDS_L.en!;
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const [playingChannel, setPlayingChannel] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<{ videos: VideoRow[]; channels?: ChannelRow[] }>("/content/video-anak")
      .then((r) => {
        setVideos(r.videos);
        setChannels(r.channels ?? []);
      })
      .catch(() => setVideos([]));
  }, []);

  if (videos.length === 0 && channels.length === 0) return null;

  const bySeries = (["doa-kisah", "syamil-dodo", "biografi-rasul"] as const).map((s) => ({
    key: s,
    ...SERIES_META[s],
    items: videos.filter((v) => v.series === s),
  }));

  return (
    <div className="space-y-10">
      {/* World kids channels, grouped by country — official channels embedded
          via their uploads playlist (UC… → UU…), so each shows that country's
          full film library. Click-to-play, like the video cards. */}
      {channels.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-heading text-xl">
            <span aria-hidden>🌍</span> {kl.worldwide}
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">{channels.length}</span>
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
{kl.worldwideDesc}
          </p>
          <div className="reveal-stagger mt-4 grid gap-4 sm:grid-cols-2 desktop:grid-cols-3">
            {channels.map((ch) => (
              <div key={ch.id} className="card-premium overflow-hidden p-2.5">
                <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-accent">🌍 {ch.country}</p>
                {playingChannel === ch.id ? (
                  <iframe
                    // Uploads-playlist embeds are refused by the privacy player
                    // for many channels — plain youtube.com plays them reliably.
                    src={`https://www.youtube.com/embed/videoseries?list=UU${ch.channel_id.slice(2)}&autoplay=1`}
                    title={ch.title}
                    loading="lazy"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="aspect-video w-full rounded-xl"
                  />
                ) : (
                  <button
                    onClick={() => setPlayingChannel(ch.id)}
                    className="group relative grid aspect-video w-full place-items-center overflow-hidden rounded-xl bg-gradient-to-b from-[var(--panel-bg2)] to-[var(--panel-bg)]"
                    aria-label={`${kl.play}: ${ch.title}`}
                  >
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-primary shadow-xl transition group-hover:scale-110">
                      ▶
                    </span>
                  </button>
                )}
                <p className="mt-2 px-1 pb-1 text-sm font-medium leading-snug">{ch.title}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {bySeries.map(
        (s) =>
          s.items.length > 0 && (
            <section key={s.key}>
              <h2 className="flex items-center gap-2 font-heading text-xl">
                <span aria-hidden>{s.icon}</span> {kl.series[s.key]}
                <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent">{s.items.length} {kl.video}</span>
              </h2>
              <div className="reveal-stagger mt-4 grid gap-4 sm:grid-cols-2 desktop:grid-cols-3">
                {s.items.map((v) => (
                  <div key={v.id} className="card-premium overflow-hidden p-2.5">
                    {playing === v.id ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${v.youtube_id}?autoplay=1`}
                        title={v.title}
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                        className="aspect-video w-full rounded-xl"
                      />
                    ) : (
                      <button
                        onClick={() => setPlaying(v.id)}
                        className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-black"
                        aria-label={`${kl.play}: ${v.title}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/25 transition group-hover:bg-black/10">
                          <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-2xl text-primary shadow-xl">
                            ▶
                          </span>
                        </span>
                      </button>
                    )}
                    <p className="mt-2 px-1 pb-1 text-sm font-medium leading-snug">{v.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )
      )}
    </div>
  );
}
