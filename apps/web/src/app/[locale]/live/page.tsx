import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { LiveHub } from "@/components/LiveHub";
import { TENANT } from "@/lib/tenant";
import { localePath } from "@/lib/paths";

// Native per-locale copy — siblings render their own language (fr/de), never
// an English or Indonesian fallback. `{site}` becomes the tenant brand.
const L: Record<string, { title: string; heading: string; desc: string; metaTitle: (s: string) => string; metaDesc: (s: string) => string }> = {
  id: {
    title: "Live Streaming",
    heading: "Live Streaming",
    desc: "Siaran langsung kajian dan tilawah — ditonton langsung di sini, tanpa berpindah situs.",
    metaTitle: (s) => `Live Streaming — Tonton di ${s}`,
    metaDesc: (s) => `Siaran langsung Islami dari seluruh dunia — ditonton langsung di ${s}.`,
  },
  en: {
    title: "Live Streaming",
    heading: "Live Streaming",
    desc: "Live lectures and recitation — watched right here, without leaving the site.",
    metaTitle: (s) => `Live Streaming — Watch on ${s}`,
    metaDesc: (s) => `Live Islamic broadcasts from around the world — watched right here on ${s}.`,
  },
  fr: {
    title: "Diffusion en direct",
    heading: "Diffusion en direct",
    desc: "Cours et récitations en direct — à regarder ici même, sans quitter le site.",
    metaTitle: (s) => `Direct — À regarder sur ${s}`,
    metaDesc: (s) => `Diffusions islamiques en direct du monde entier — à regarder ici même sur ${s}.`,
  },
  de: {
    title: "Live-Übertragung",
    heading: "Live-Übertragung",
    desc: "Vorträge und Rezitationen live — direkt hier ansehen, ohne die Seite zu verlassen.",
    metaTitle: (s) => `Live — Ansehen auf ${s}`,
    metaDesc: (s) => `Islamische Live-Übertragungen aus aller Welt — direkt hier auf ${s} ansehen.`,
  },
  ar: {
    title: "بث مباشر",
    heading: "بث مباشر",
    desc: "دروس وتلاوات مباشرة — تُشاهد هنا مباشرةً دون مغادرة الموقع.",
    metaTitle: (s) => `بث مباشر — شاهد على ${s}`,
    metaDesc: (s) => `بثوث إسلامية مباشرة من أنحاء العالم — تُشاهد هنا مباشرةً على ${s}.`,
  },
  es: {
    title: "Transmisión en directo",
    heading: "Transmisión en directo",
    desc: "Clases y recitaciones en directo — se ven aquí mismo, sin salir del sitio.",
    metaTitle: (s) => `En directo — Míralo en ${s}`,
    metaDesc: (s) => `Transmisiones islámicas en directo de todo el mundo — se ven aquí mismo en ${s}.`,
  },
  ru: {
    title: "Прямая трансляция",
    heading: "Прямая трансляция",
    desc: "Лекции и чтения в прямом эфире — смотрите прямо здесь, не покидая сайт.",
    metaTitle: (s) => `Прямой эфир — смотрите на ${s}`,
    metaDesc: (s) => `Исламские прямые трансляции со всего мира — смотрите прямо здесь на ${s}.`,
  },
  zh: {
    title: "直播",
    heading: "直播",
    desc: "讲座与诵读直播——就在此处观看，无需离开网站。",
    metaTitle: (s) => `直播 — 在 ${s} 观看`,
    metaDesc: (s) => `来自世界各地的伊斯兰直播——就在 ${s} 此处观看。`,
  },
  ja: {
    title: "ライブ配信",
    heading: "ライブ配信",
    desc: "講義や朗誦のライブ配信——サイトを離れずにここで視聴できます。",
    metaTitle: (s) => `ライブ配信 — ${s} で視聴`,
    metaDesc: (s) => `世界中からのイスラームのライブ配信——${s} のここで視聴できます。`,
  },
};

function labels(locale: string) {
  return L[locale] ?? L.en!;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);
  return {
    title: t.metaTitle(TENANT.siteName),
    description: t.metaDesc(TENANT.siteName),
    alternates: { canonical: localePath(locale, `/live`) },
  };
}

export default async function LivePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);

  return (
    <div className="px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="hero-entrance text-center">
          <span aria-hidden className="float-soft inline-block text-5xl">📡</span>
          <h1 className="mt-2 font-heading text-3xl sm:text-4xl">{t.heading}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t.desc}
          </p>
        </div>

        <div className="mt-10">
          <LiveHub locale={locale} />
        </div>
      </div>
    </div>
  );
}
