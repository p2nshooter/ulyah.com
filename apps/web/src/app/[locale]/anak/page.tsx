import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { KisahAnakList } from "@/components/KisahAnakList";

interface EpisodeRow {
  id: number;
  slug: string;
  episode_order: number;
  title_id: string;
  title_en: string | null;
  moral_id: string | null;
  moral_en: string | null;
  motif: string;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const title = locale === "id" ? "Kisah Anak Muslim — Film Animasi Islami — ULYAH.COM" : "Muslim Kids' Stories — Animated Films — ULYAH.COM";
  const description =
    locale === "id"
      ? "Film animasi pendek untuk anak: karakter bergerak, dibacakan dengan suara, mengajarkan akhlak Islami — langsung tonton tanpa unduh."
      : "Short animated films for children: moving characters, narrated aloud, teaching Islamic character — watch right here, no download.";
  return { title, description, alternates: { canonical: `/${locale}/anak` } };
}

export default async function KisahAnakPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const isId = locale === "id";

  let episodes: EpisodeRow[] = [];
  try {
    const r = await api.get<{ episodes: EpisodeRow[] }>("/content/kisah-anak");
    episodes = r.episodes;
  } catch {
    episodes = [];
  }

  return (
    <div className="px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="hero-entrance text-center">
          <span aria-hidden className="float-soft inline-block text-5xl">🌙</span>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">
            {isId ? "Kisah Anak Muslim" : "Muslim Kids' Stories"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {isId
              ? "Film animasi pendek dengan karakter bergerak dan narasi suara — setiap kisah mengajarkan satu akhlak dari Al-Qur'an dan Sunnah. Langsung tonton, tanpa unduh."
              : "Short animated films with moving characters and voice narration — each story teaches one value from the Qur'an and Sunnah. Watch right here, no download."}
          </p>
        </div>

        <div className="mt-10">
          <KisahAnakList locale={locale} episodes={episodes} />
        </div>
      </div>
    </div>
  );
}
