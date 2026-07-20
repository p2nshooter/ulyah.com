import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { localePath } from "@/lib/paths";

// Revalidate periodically so newly-imported kitab appear without a redeploy,
// while still serving a cached page most of the time.
export const revalidate = 300;

interface Category {
  slug: string;
  name_id: string;
  name_ar: string | null;
  icon: string | null;
  kitab_count: number;
}
interface Kitab {
  slug: string;
  category_slug: string;
  title_ar: string;
  title_id: string;
  author: string | null;
  author_death_year: string | null;
  description_id: string | null;
  bab_count: number;
}

// Every visible UI string on this page, per site language — a sibling site
// must never show Indonesian chrome (owner rule + AdSense language purity).
const L: Record<
  string,
  {
    title: string;
    metaTitle: string;
    metaDesc: string;
    subtitle: (n: number) => string;
    loadError: string;
    chapters: string;
    died: string;
    footnote: string;
  }
> = {
  id: {
    title: "Kitab Pesantren",
    metaTitle: "Kitab Pesantren — Perpustakaan Digital",
    metaDesc:
      "Kitab klasik pesantren tersusun rapi per bidang: fiqih, akidah, akhlak, nahwu-shorof. Lengkap dengan nama pengarang, bab per bab, teks Arab, terjemah, dan penjelasan.",
    subtitle: (n) =>
      n > 0
        ? `Perpustakaan digital kitab kuning — tersusun rapi per bidang, lengkap pengarang & bab. ${n} kitab.`
        : "Perpustakaan digital kitab kuning — tersusun rapi per bidang, lengkap pengarang & bab.",
    loadError: "Gagal memuat koleksi — silakan muat ulang halaman ini.",
    chapters: "bab",
    died: "w.",
    footnote:
      "Teks dikutip dari matan kitab klasik. Terjemah & penjelasan disusun ringkas untuk memudahkan santri dan pembaca umum.",
  },
  en: {
    title: "Classical Islamic Texts",
    metaTitle: "Classical Islamic Texts — Digital Library",
    metaDesc:
      "Classical Islamic texts organized by field: fiqh, creed, character, Arabic grammar. Complete with author, chapter-by-chapter Arabic text, translation, and commentary.",
    subtitle: (n) =>
      n > 0
        ? `A digital library of classical texts — organized by field, with authors & chapters. ${n} books.`
        : "A digital library of classical texts — organized by field, with authors & chapters.",
    loadError: "Could not load the collection — please reload this page.",
    chapters: "chapters",
    died: "d.",
    footnote:
      "Texts are quoted from classical works. Translations & commentary are kept concise for students and general readers.",
  },
  fr: {
    title: "Textes Islamiques Classiques",
    metaTitle: "Textes Islamiques Classiques — Bibliothèque Numérique",
    metaDesc:
      "Textes islamiques classiques organisés par domaine : fiqh, croyance, caractère, grammaire arabe. Avec auteur, texte arabe chapitre par chapitre, traduction et commentaire.",
    subtitle: (n) =>
      n > 0
        ? `Bibliothèque numérique de textes classiques — classés par domaine, avec auteurs et chapitres. ${n} livres.`
        : "Bibliothèque numérique de textes classiques — classés par domaine, avec auteurs et chapitres.",
    loadError: "Impossible de charger la collection — veuillez recharger cette page.",
    chapters: "chapitres",
    died: "m.",
    footnote:
      "Les textes sont cités d'œuvres classiques. Les traductions et commentaires restent concis pour les étudiants et le grand public.",
  },
  de: {
    title: "Klassische Islamische Werke",
    metaTitle: "Klassische Islamische Werke — Digitale Bibliothek",
    metaDesc:
      "Klassische islamische Werke nach Fachgebiet geordnet: Fiqh, Glaubenslehre, Charakter, arabische Grammatik. Mit Autor, arabischem Text Kapitel für Kapitel, Übersetzung und Erläuterung.",
    subtitle: (n) =>
      n > 0
        ? `Digitale Bibliothek klassischer Werke — nach Fachgebiet geordnet, mit Autoren & Kapiteln. ${n} Bücher.`
        : "Digitale Bibliothek klassischer Werke — nach Fachgebiet geordnet, mit Autoren & Kapiteln.",
    loadError: "Die Sammlung konnte nicht geladen werden — bitte laden Sie die Seite neu.",
    chapters: "Kapitel",
    died: "gest.",
    footnote:
      "Die Texte sind klassischen Werken entnommen. Übersetzungen & Erläuterungen sind bewusst knapp gehalten.",
  },
  es: {
    title: "Textos Islámicos Clásicos",
    metaTitle: "Textos Islámicos Clásicos — Biblioteca Digital",
    metaDesc:
      "Textos islámicos clásicos organizados por materia: fiqh, credo, carácter, gramática árabe. Con autor, texto árabe capítulo a capítulo, traducción y comentario.",
    subtitle: (n) =>
      n > 0
        ? `Biblioteca digital de textos clásicos — organizados por materia, con autores y capítulos. ${n} libros.`
        : "Biblioteca digital de textos clásicos — organizados por materia, con autores y capítulos.",
    loadError: "No se pudo cargar la colección — recargue esta página.",
    chapters: "capítulos",
    died: "m.",
    footnote:
      "Los textos se citan de obras clásicas. Las traducciones y comentarios son concisos para estudiantes y lectores.",
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
    title: t.metaTitle,
    description: t.metaDesc,
    alternates: { canonical: localePath(locale, "/kitab-pesantren") },
  };
}

export default async function KitabPesantrenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);

  let categories: Category[] = [];
  let kitab: Kitab[] = [];
  try {
    const [cRes, kRes] = await Promise.all([
      api.get<{ categories: Category[] }>(`/content/pesantren/categories?lang=${locale}`),
      api.get<{ kitab: Kitab[] }>(`/content/pesantren/kitab?lang=${locale}`),
    ]);
    categories = cRes.categories;
    kitab = kRes.kitab;
  } catch {
    categories = [];
    kitab = [];
  }

  const total = kitab.length;

  // First kitab in the library — "Baca Semua" reads this list then dives into
  // it and auto-advances through every book to the end of the menu.
  const firstKitab = categories.map((c) => kitab.find((k) => k.category_slug === c.slug)).find(Boolean);
  const firstReadHref = firstKitab ? `/${locale}/kitab-pesantren/${firstKitab.slug}?autoread=1&mode=semua` : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      {firstReadHref && (
        <a data-read-next href={firstReadHref} className="hidden" aria-hidden>
          next
        </a>
      )}
      <PageHero icon="🏫" title={t.title} subtitle={t.subtitle(total)} />

      <div className="mt-6">
      </div>

      {categories.length === 0 && (
        <p className="mt-10 text-center text-sm text-[var(--color-text-secondary)]">{t.loadError}</p>
      )}

      {categories.map((cat) => {
        const inCat = kitab.filter((k) => k.category_slug === cat.slug);
        if (inCat.length === 0) return null;
        return (
          <section key={cat.slug} className="mt-12">
            <div className="flex items-baseline justify-between gap-3 border-b border-accent/20 pb-2">
              <h2 className="font-heading text-xl">
                <span className="mr-2">{cat.icon ?? "📗"}</span>
                {cat.name_id}
              </h2>
              {cat.name_ar && (
                <span dir="rtl" className="font-arabic text-sm text-[var(--color-text-secondary)]">
                  {cat.name_ar}
                </span>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 desktop:grid-cols-3">
              {inCat.map((k) => (
                <Link
                  key={k.slug}
                  href={`/${locale}/kitab-pesantren/${k.slug}`}
                  className="card-premium flex flex-col p-5"
                >
                  <p dir="rtl" className="font-arabic text-lg leading-tight text-primary dark:text-accent">
                    {k.title_ar}
                  </p>
                  <p className="mt-1 font-heading text-base">{k.title_id}</p>
                  {k.author && (
                    <p className="mt-1.5 text-xs text-[var(--color-text-secondary)]">
                      ✍️ {k.author}
                      {k.author_death_year ? ` (${t.died} ${k.author_death_year})` : ""}
                    </p>
                  )}
                  {k.description_id && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                      {k.description_id}
                    </p>
                  )}
                  <p className="mt-auto pt-3 text-xs font-medium text-accent">
                    {k.bab_count} {t.chapters} →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-12 text-center text-xs text-[var(--color-text-secondary)]">{t.footnote}</p>
    </div>
  );
}
