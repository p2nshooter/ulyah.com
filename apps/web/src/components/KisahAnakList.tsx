"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { KidsFilmPlayer } from "@/components/kids/KidsFilmPlayer";
import type { KidsVariant } from "@/components/kids/KidsCharacter";

interface EpisodeSummary {
  id: number;
  slug: string;
  episode_order: number;
  title_id: string;
  title_en: string | null;
  moral_id: string | null;
  moral_en: string | null;
  motif: string;
  /** Localized by the API per ?lang — title/moral in the SITE locale. */
  title?: string;
  moral?: string | null;
}
interface EpisodeDetail extends EpisodeSummary {
  body_id: string;
  body_en: string | null;
  age_range: string;
  body?: string;
}

// Each episode stars one of the two generic child characters (see
// KidsCharacter.tsx — never a depiction of any prophet, companion, or named
// figure). Alternating per episode keeps the series varied.
function episodeVariant(order: number): KidsVariant {
  return order % 2 === 0 ? "girl" : "boy";
}

const MOTIF_EMOJI: Record<string, string> = {
  star: "⭐",
  moon: "🌙",
  lantern: "🏮",
  mosque: "🕌",
  pattern: "✨",
};

interface KidsLabels {
  play: string;
  pause: string;
  replay: string;
  sceneOf: (c: number, t: number) => string;
  moralTitle: string;
  readText: string;
  hideText: string;
}

// English labels, reused as the base type and the fallback for any locale
// without a native entry (never Indonesian).
const EN_LABELS: KidsLabels = {
  play: "Play film",
  pause: "Pause",
  replay: "Replay",
  sceneOf: (c, t) => `Scene ${c} of ${t}`,
  moralTitle: "Lesson",
  readText: "📖 Read the story text",
  hideText: "Hide text",
};

export function KisahAnakList({ locale, episodes }: { locale: string; episodes: EpisodeSummary[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<EpisodeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [showText, setShowText] = useState(false);
  const isId = locale === "id";

  // UI chrome is fully native per locale (fr/de never fall back to English).
  // Story content itself only exists in id/en in the database, so the text
  // fields below fall back to English for other locales.
  const LABELS: Record<string, KidsLabels> = {
    id: {
      play: "Putar film", pause: "Jeda", replay: "Ulangi",
      sceneOf: (c, t) => `Adegan ${c} dari ${t}`,
      moralTitle: "Hikmah", readText: "📖 Baca teks cerita", hideText: "Sembunyikan teks",
    },
    en: EN_LABELS,
    fr: {
      play: "Lire le film", pause: "Pause", replay: "Revoir",
      sceneOf: (c, t) => `Scène ${c} sur ${t}`,
      moralTitle: "Leçon", readText: "📖 Lire le texte de l'histoire", hideText: "Masquer le texte",
    },
    de: {
      play: "Film abspielen", pause: "Pause", replay: "Wiederholen",
      sceneOf: (c, t) => `Szene ${c} von ${t}`,
      moralTitle: "Lehre", readText: "📖 Geschichtentext lesen", hideText: "Text ausblenden",
    },
    ar: {
      play: "شغّل الفيلم", pause: "إيقاف مؤقت", replay: "إعادة",
      sceneOf: (c, t) => `المشهد ${c} من ${t}`,
      moralTitle: "العبرة", readText: "📖 اقرأ نص القصة", hideText: "إخفاء النص",
    },
    es: {
      play: "Reproducir película", pause: "Pausa", replay: "Repetir",
      sceneOf: (c, t) => `Escena ${c} de ${t}`,
      moralTitle: "Lección", readText: "📖 Leer el texto del cuento", hideText: "Ocultar el texto",
    },
    ru: {
      play: "Смотреть фильм", pause: "Пауза", replay: "Повтор",
      sceneOf: (c, t) => `Сцена ${c} из ${t}`,
      moralTitle: "Урок", readText: "📖 Читать текст истории", hideText: "Скрыть текст",
    },
    zh: {
      play: "播放影片", pause: "暂停", replay: "重播",
      sceneOf: (c, t) => `第 ${c} / ${t} 场`,
      moralTitle: "寓意", readText: "📖 阅读故事文本", hideText: "隐藏文本",
    },
    ja: {
      play: "映画を再生", pause: "一時停止", replay: "リプレイ",
      sceneOf: (c, t) => `シーン ${c} / ${t}`,
      moralTitle: "教訓", readText: "📖 物語のテキストを読む", hideText: "テキストを隠す",
    },
  };
  const labels = LABELS[locale] ?? EN_LABELS;

  async function open(slug: string) {
    if (openSlug === slug) {
      setOpenSlug(null);
      setDetail(null);
      return;
    }
    setOpenSlug(slug);
    setShowText(false);
    setLoading(true);
    try {
      const r = await api.get<{ episode: EpisodeDetail }>(`/content/kisah-anak/${slug}?lang=${locale}`);
      setDetail(r.episode);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reveal-stagger space-y-4">
      {episodes.map((ep) => {
        const isOpen = openSlug === ep.slug;
        return (
          <div
            key={ep.slug}
            className="card-premium overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]"
          >
            <button onClick={() => open(ep.slug)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 text-lg">
                {MOTIF_EMOJI[ep.motif] ?? "✨"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-base">
                  {ep.episode_order}. {ep.title ?? (isId ? ep.title_id : ep.title_en ?? ep.title_id)}
                </span>
                {(ep.moral ?? ep.moral_id) && (
                  <span className="block truncate text-xs text-[var(--color-text-secondary)]">
                    {ep.moral ?? (isId ? ep.moral_id : ep.moral_en)}
                  </span>
                )}
              </span>
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
                {isOpen ? "✕" : "▶"}
              </span>
            </button>

            {isOpen && (
              <div className="space-y-4 border-t border-[var(--color-border)] p-4">
                {loading && <p className="text-sm text-[var(--color-text-secondary)]">…</p>}
                {detail && detail.slug === ep.slug && (
                  <>
                    <KidsFilmPlayer
                      title={detail.title ?? (isId ? detail.title_id : detail.title_en ?? detail.title_id)}
                      body={detail.body ?? (isId ? detail.body_id : detail.body_en ?? detail.body_id)}
                      moral={detail.moral ?? (isId ? detail.moral_id : detail.moral_en ?? detail.moral_id)}
                      variant={episodeVariant(detail.episode_order)}
                      lang={locale}
                      labels={labels}
                    />
                    <button
                      onClick={() => setShowText((v) => !v)}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      {showText ? labels.hideText : labels.readText}
                    </button>
                    {showText && (
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-primary)]">
                        {detail.body ?? (isId ? detail.body_id : detail.body_en ?? detail.body_id)}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
