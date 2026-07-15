import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { KisahAnakList } from "@/components/KisahAnakList";
import { AdSlot } from "@/components/AdSlot";

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
  const title = locale === "id" ? "Kisah Anak Muslim — ULYAH.COM" : "Muslim Kids' Stories — ULYAH.COM";
  const description =
    locale === "id"
      ? "Kisah pendek berurutan untuk anak, mengajarkan nilai-nilai Islam — aman ditonton dan didengarkan."
      : "Short, sequential stories for children teaching Islamic values — safe to watch and listen to.";
  return { title, description, alternates: { canonical: `/${locale}/anak` } };
}

export default async function KisahAnakPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;

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
        <h1 className="font-heading text-3xl">🌙 {locale === "id" ? "Kisah Anak Muslim" : "Muslim Kids' Stories"}</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {locale === "id"
            ? "Cerita pendek berurutan yang mengajarkan nilai-nilai Islam, bisa ditonton dan didengarkan langsung — tanpa gambar makhluk hidup, tanpa unduh."
            : "Short, sequential stories teaching Islamic values — watch and listen right here, no living-being imagery, no download."}
        </p>

        <div className="mt-6">
          <AdSlot minHeight={110} format="horizontal" />
        </div>

        <div className="mt-8">
          <KisahAnakList locale={locale} episodes={episodes} />
        </div>
      </div>
    </div>
  );
}
