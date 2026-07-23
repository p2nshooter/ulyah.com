import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { localePath } from "@/lib/paths";
import { coverFor } from "@/lib/book-cover";
import { kitabLabels } from "@/lib/kitab-labels";

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
  zh: {
    title: "古典伊斯兰典籍",
    metaTitle: "古典伊斯兰典籍 — 数字图书馆",
    metaDesc:
      "按学科分类的古典伊斯兰典籍：教法、信仰、品德、阿拉伯语法。附作者、逐章阿拉伯原文、译文与注释。",
    subtitle: (n) =>
      n > 0
        ? `古典典籍数字图书馆 — 按学科分类，附作者与章节。共 ${n} 部。`
        : "古典典籍数字图书馆 — 按学科分类，附作者与章节。",
    loadError: "无法加载藏书 — 请重新加载本页面。",
    chapters: "章",
    died: "卒于",
    footnote:
      "文本引自古典著作。译文与注释力求简明，方便学子与普通读者阅读。",
  },
  ar: {
    title: "النصوص الإسلامية الكلاسيكية",
    metaTitle: "النصوص الإسلامية الكلاسيكية — مكتبة رقمية",
    metaDesc:
      "نصوص إسلامية كلاسيكية مرتبة حسب المجال: الفقه والعقيدة والأخلاق والنحو والصرف. كاملة باسم المؤلف والنص العربي بابًا بابًا والترجمة والشرح.",
    subtitle: (n) =>
      n > 0
        ? `مكتبة رقمية للنصوص الكلاسيكية — مرتبة حسب المجال، مع المؤلفين والأبواب. ${n} كتابًا.`
        : "مكتبة رقمية للنصوص الكلاسيكية — مرتبة حسب المجال، مع المؤلفين والأبواب.",
    loadError: "تعذّر تحميل المجموعة — يرجى إعادة تحميل الصفحة.",
    chapters: "أبواب",
    died: "ت.",
    footnote:
      "النصوص مقتبسة من المؤلفات الكلاسيكية. الترجمة والشرح موجزان لتيسيرهما على الطلاب والقراء عامة.",
  },
  ru: {
    title: "Классические исламские тексты",
    metaTitle: "Классические исламские тексты — цифровая библиотека",
    metaDesc:
      "Классические исламские тексты по разделам: фикх, вероучение, нравственность, арабская грамматика. С автором, арабским текстом глава за главой, переводом и комментарием.",
    subtitle: (n) =>
      n > 0
        ? `Цифровая библиотека классических текстов — по разделам, с авторами и главами. Книг: ${n}.`
        : "Цифровая библиотека классических текстов — по разделам, с авторами и главами.",
    loadError: "Не удалось загрузить коллекцию — обновите эту страницу.",
    chapters: "главы",
    died: "ум.",
    footnote:
      "Тексты цитируются из классических трудов. Перевод и комментарии даны кратко для студентов и читателей.",
  },
  ja: {
    title: "古典イスラーム文献",
    metaTitle: "古典イスラーム文献 — デジタル図書館",
    metaDesc:
      "分野別に整理された古典イスラーム文献：フィクフ、信条、徳性、アラビア語文法。著者名、章ごとのアラビア語原文、翻訳、解説付き。",
    subtitle: (n) =>
      n > 0
        ? `古典文献のデジタル図書館 — 分野別、著者と章付き。${n} 冊。`
        : "古典文献のデジタル図書館 — 分野別、著者と章付き。",
    loadError: "コレクションを読み込めませんでした — このページを再読み込みしてください。",
    chapters: "章",
    died: "没",
    footnote:
      "本文は古典的著作から引用しています。翻訳と解説は、学生や一般の読者のために簡潔にまとめてあります。",
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
  const listenLabel = kitabLabels(locale).listen; // reuse the library's localized "Listen"

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
        const cv = coverFor(cat.slug); // one binding colour per shelf
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

            {/* Each kitab is a bound volume on this shelf — a jewel-tone cover
                with a gold-foiled Arabic title, a spine, and a "dengarkan" cue
                (the matn can be read AND narrated). */}
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 desktop:grid-cols-4">
              {inCat.map((k) => (
                <Link
                  key={k.slug}
                  href={`/${locale}/kitab-pesantren/${k.slug}`}
                  aria-label={k.title_id}
                  style={{ background: cv.cover }}
                  className="group relative flex min-h-[210px] flex-col overflow-hidden rounded-r-lg rounded-l-sm p-4 pl-6 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.5)] ring-1 ring-black/20 transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_-10px_rgba(0,0,0,0.6)]"
                >
                  <span aria-hidden style={{ background: cv.spine }} className="absolute inset-y-0 left-0 w-3" />
                  <span aria-hidden style={{ background: cv.foil }} className="absolute inset-y-0 left-3 w-px opacity-40" />
                  <span
                    aria-hidden
                    style={{ borderColor: cv.foil }}
                    className="pointer-events-none absolute inset-2 left-5 rounded-sm border opacity-15"
                  />

                  <div className="relative">
                    <p dir="rtl" style={{ color: cv.foil }} className="font-arabic text-lg leading-tight">
                      {k.title_ar}
                    </p>
                    <p style={{ color: cv.ink }} className="mt-1 font-heading text-sm leading-snug">
                      {k.title_id}
                    </p>
                    {k.author && (
                      <p style={{ color: cv.ink }} className="mt-1.5 text-[11px] opacity-80">
                        ✍️ {k.author}
                        {k.author_death_year ? ` (${t.died} ${k.author_death_year})` : ""}
                      </p>
                    )}
                  </div>

                  <div className="relative mt-auto flex items-center justify-between gap-2 pt-3">
                    <span style={{ color: cv.foil }} className="text-xs font-medium tabular-nums opacity-90">
                      {k.bab_count} {t.chapters}
                    </span>
                    <span
                      style={{ color: cv.ink, borderColor: cv.foil }}
                      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] opacity-80 transition group-hover:opacity-100"
                    >
                      <span aria-hidden>🔊</span>
                      {listenLabel}
                    </span>
                  </div>
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
