import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { KisahAnakList } from "@/components/KisahAnakList";
import { VideoAnakGrid } from "@/components/kids/VideoAnakGrid";
import { TENANT } from "@/lib/tenant";
import { localePath } from "@/lib/paths";

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

// Native per-locale copy — siblings render their own language (fr/de), never
// an English/Indonesian fallback. `{site}` becomes the tenant brand.
const L: Record<string, { heading: string; intro: string; interactive: string; metaTitle: (s: string) => string; metaDesc: string }> = {
  id: {
    heading: "Kisah Anak Muslim",
    intro:
      "Film animasi pendek dengan karakter bergerak dan narasi suara — setiap kisah mengajarkan satu akhlak dari Al-Qur'an dan Sunnah. Langsung tonton, tanpa unduh.",
    interactive: "Kisah Interaktif Beranimasi",
    metaTitle: (s) => `Kisah Anak Muslim — Film Animasi Islami — ${s}`,
    metaDesc:
      "Film animasi pendek untuk anak: karakter bergerak, dibacakan dengan suara, mengajarkan akhlak Islami — langsung tonton tanpa unduh.",
  },
  en: {
    heading: "Muslim Kids' Stories",
    intro:
      "Short animated films with moving characters and voice narration — each story teaches one value from the Qur'an and Sunnah. Watch right here, no download.",
    interactive: "Interactive Animated Stories",
    metaTitle: (s) => `Muslim Kids' Stories — Animated Films — ${s}`,
    metaDesc:
      "Short animated films for children: moving characters, narrated aloud, teaching Islamic character — watch right here, no download.",
  },
  es: {
    heading: "Historias para niños musulmanes",
    intro:
      "Cortometrajes animados con personajes en movimiento y narración de voz: cada historia enseña un valor del Corán y la Sunna. Míralos aquí mismo, sin descargas.",
    interactive: "Historias animadas interactivas",
    metaTitle: (s) => `Historias para niños musulmanes — Películas animadas — ${s}`,
    metaDesc:
      "Cortometrajes animados para niños: personajes en movimiento, narrados en voz alta, que enseñan el carácter islámico — míralos aquí mismo, sin descargas.",
  },
  zh: {
    heading: "穆斯林儿童故事",
    intro:
      "带有动态角色和语音旁白的短篇动画 — 每个故事讲述一则出自《古兰经》与圣行的美德。即刻观看，无需下载。",
    interactive: "互动动画故事",
    metaTitle: (s) => `穆斯林儿童故事 — 动画影片 — ${s}`,
    metaDesc:
      "为儿童制作的短篇动画：动态角色、语音朗读、传授伊斯兰美德 — 即刻观看，无需下载。",
  },
  fr: {
    heading: "Histoires pour enfants musulmans",
    intro:
      "Courts films d'animation avec des personnages animés et une narration vocale — chaque histoire enseigne une valeur du Coran et de la Sunna. À regarder ici même, sans téléchargement.",
    interactive: "Histoires animées interactives",
    metaTitle: (s) => `Histoires pour enfants musulmans — Films d'animation — ${s}`,
    metaDesc:
      "Courts films d'animation pour enfants : personnages animés, narration vocale, enseignant le bon caractère islamique — à regarder ici même, sans téléchargement.",
  },
  de: {
    heading: "Geschichten für muslimische Kinder",
    intro:
      "Kurze Animationsfilme mit bewegten Figuren und Sprachausgabe — jede Geschichte vermittelt einen Wert aus Koran und Sunna. Direkt hier ansehen, ohne Download.",
    interactive: "Interaktive Animationsgeschichten",
    metaTitle: (s) => `Geschichten für muslimische Kinder — Animationsfilme — ${s}`,
    metaDesc:
      "Kurze Animationsfilme für Kinder: bewegte Figuren, gesprochene Erzählung, die islamischen guten Charakter vermitteln — direkt hier ansehen, ohne Download.",
  },
  ar: {
    heading: "قصص الأطفال المسلمين",
    intro:
      "أفلام رسوم متحركة قصيرة بشخصيات متحركة وسرد صوتي — كل قصة تعلّم خُلقًا من القرآن والسنة. تُشاهد هنا مباشرةً دون تنزيل.",
    interactive: "قصص متحركة تفاعلية",
    metaTitle: (s) => `قصص الأطفال المسلمين — أفلام رسوم متحركة — ${s}`,
    metaDesc:
      "أفلام رسوم متحركة قصيرة للأطفال: شخصيات متحركة، سرد صوتي، تعلّم الأخلاق الإسلامية — تُشاهد هنا مباشرةً دون تنزيل.",
  },
  ru: {
    heading: "Истории для мусульманских детей",
    intro:
      "Короткие анимационные фильмы с движущимися персонажами и озвучкой — каждая история учит одной добродетели из Корана и Сунны. Смотрите прямо здесь, без загрузки.",
    interactive: "Интерактивные анимационные истории",
    metaTitle: (s) => `Истории для мусульманских детей — Мультфильмы — ${s}`,
    metaDesc:
      "Короткие мультфильмы для детей: движущиеся персонажи, озвучка, воспитание исламского нрава — смотрите прямо здесь, без загрузки.",
  },
};

function labels(locale: string) {
  return L[locale] ?? L.en!;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);
  return { title: t.metaTitle(TENANT.siteName), description: t.metaDesc, alternates: { canonical: localePath(locale, `/anak`) } };
}

export default async function KisahAnakPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);

  let episodes: EpisodeRow[] = [];
  try {
    const r = await api.get<{ episodes: EpisodeRow[] }>(`/content/kisah-anak?lang=${locale}`);
    episodes = r.episodes;
  } catch {
    episodes = [];
  }

  return (
    <div className="px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="hero-entrance text-center">
          <span aria-hidden className="float-soft inline-block text-5xl">🌙</span>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">{t.heading}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t.intro}
          </p>
        </div>

        {/* The owner's 45 kids videos from youtube.com/@ulyah-com — three
            series, click-to-play (see VideoAnakGrid). */}
        <div className="mt-10">
          <VideoAnakGrid locale={locale} />
        </div>

        <div className="mt-12">
          <h2 className="flex items-center gap-2 font-heading text-xl">
            <span aria-hidden>📖</span> {t.interactive}
          </h2>
          <div className="mt-4">
            <KisahAnakList locale={locale} episodes={episodes} />
          </div>
        </div>
      </div>
    </div>
  );
}
