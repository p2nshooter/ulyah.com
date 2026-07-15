"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { NarrateButton } from "@/components/NarrateButton";
import { AdSlot } from "@/components/AdSlot";

interface EpisodeSummary {
  id: number;
  slug: string;
  episode_order: number;
  title_id: string;
  title_en: string | null;
  moral_id: string | null;
  moral_en: string | null;
  motif: string;
}
interface EpisodeDetail extends EpisodeSummary {
  body_id: string;
  body_en: string | null;
  age_range: string;
}

// Decorative, non-figurative Islamic motifs only — no depiction of any
// living being anywhere in this widget, per the request to avoid imagery
// that Islamic teaching holds impermissible. Pure CSS animation.
const MOTIF_EMOJI: Record<string, string> = {
  star: "⭐",
  moon: "🌙",
  lantern: "🏮",
  mosque: "🕌",
  pattern: "✨",
};

function MotifAnimation({ motif }: { motif: string }) {
  return (
    <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#06251b] to-[#0B3D2E]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(184,137,43,0.8) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          animation: "kisah-anak-drift 12s linear infinite",
        }}
      />
      <span className="animate-bounce text-6xl" style={{ animationDuration: "2.4s" }}>
        {MOTIF_EMOJI[motif] ?? "✨"}
      </span>
      <style>{`
        @keyframes kisah-anak-drift {
          from { background-position: 0 0; }
          to { background-position: 60px 60px; }
        }
      `}</style>
    </div>
  );
}

export function KisahAnakList({ locale, episodes }: { locale: string; episodes: EpisodeSummary[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<EpisodeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const isId = locale === "id";

  async function open(slug: string) {
    if (openSlug === slug) {
      setOpenSlug(null);
      setDetail(null);
      return;
    }
    setOpenSlug(slug);
    setLoading(true);
    try {
      const r = await api.get<{ episode: EpisodeDetail }>(`/content/kisah-anak/${slug}`);
      setDetail(r.episode);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {episodes.map((ep) => {
        const isOpen = openSlug === ep.slug;
        return (
          <div key={ep.slug} className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <button onClick={() => open(ep.slug)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent/40 text-xs font-medium text-accent">
                {ep.episode_order}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-base">{isId ? ep.title_id : ep.title_en ?? ep.title_id}</span>
                {ep.moral_id && <span className="block truncate text-xs text-[var(--color-text-secondary)]">{isId ? ep.moral_id : ep.moral_en}</span>}
              </span>
              <span className="text-accent">{isOpen ? "▲" : "▼"}</span>
            </button>

            {isOpen && (
              <div className="space-y-4 border-t border-[var(--color-border)] p-4">
                <MotifAnimation motif={ep.motif} />
                {loading && <p className="text-sm text-[var(--color-text-secondary)]">…</p>}
                {detail && detail.slug === ep.slug && (
                  <>
                    <NarrateButton
                      paragraphs={[isId ? detail.body_id : detail.body_en ?? detail.body_id]}
                      listenLabel={isId ? "Dengarkan cerita" : "Listen to the story"}
                      stopLabel={isId ? "Hentikan" : "Stop"}
                      lang={locale}
                    />
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                      {isId ? detail.body_id : detail.body_en ?? detail.body_id}
                    </p>
                    {detail.moral_id && (
                      <p className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm font-medium text-accent">
                        💡 {isId ? detail.moral_id : detail.moral_en}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <AdSlot minHeight={110} format="rectangle" />
    </div>
  );
}
