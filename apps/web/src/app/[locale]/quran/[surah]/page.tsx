import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getCached } from "@/lib/api";
import { routePath } from "@/lib/paths";
import { absUrl, breadcrumbs, jsonLdProps } from "@/lib/structured-data";

/**
 * One page per surah, readable by people and by search engines, in every site's language (owner, 22 Nov 2026:
 * "Perbanyak dan Perkuat SEO nya multi bahasa nya").
 *
 * Before this, the whole Qur'an lived behind one client-rendered reader at /quran: 114 surahs × five sites, and not
 * one of them had an address a search engine could index. Each surah now has its own server-rendered page —
 * /quran/36 on ulyah.com, /coran/36 on 1fr.fr, /koran/36 on tilawa.de, /quran/36 on xad.es, /coran/36 on dawa.im —
 * with the Arabic, the trusted translation of that site's language and its credit (never a machine translation:
 * lib/quran-r2.ts in the API), BreadcrumbList + Chapter structured data, hreflang between the five sites (middleware),
 * links to the previous and next surah and to every other surah, and a way into the interactive reader at each ayah.
 * Cached a day: scripture does not change, and crawlers must not cost API requests.
 */
export const revalidate = 86400;

interface SurahMeta {
  id: number;
  name_ar: string;
  name_id: string;
  name_transliteration: string;
  revelation_place: "meccan" | "medinan";
  ayah_count: number;
}
interface Ayah {
  number: number;
  text_ar: string;
  translation: string | null;
  translation_footnotes?: string | null;
}
interface SurahResponse {
  surah: SurahMeta;
  ayat: Ayah[];
  translationSource?: { credit?: string; url?: string } | null;
}

const L: Record<string, { quran: string; surah: string; ayat: string; meccan: string; medinan: string; read: string; listen: string; prev: string; next: string; all: string; suffix: string; desc: string }> = {
  id: { quran: "Al-Qur'an", surah: "Surah", ayat: "ayat", meccan: "Makkiyah", medinan: "Madaniyah", read: "Baca & dengarkan per ayat", listen: "Dengarkan", prev: "Surah sebelumnya", next: "Surah berikutnya", all: "Semua surah", suffix: "Teks Arab, terjemah & murottal", desc: "teks Arab lengkap, terjemah Kementerian Agama RI, tafsir dan murottal per ayat." },
  en: { quran: "Quran", surah: "Surah", ayat: "verses", meccan: "Meccan", medinan: "Medinan", read: "Read & listen verse by verse", listen: "Listen", prev: "Previous surah", next: "Next surah", all: "All surahs", suffix: "Arabic, translation & recitation", desc: "the full Arabic text, Saheeh International translation, tafsir and recitation verse by verse." },
  fr: { quran: "Coran", surah: "Sourate", ayat: "versets", meccan: "mecquoise", medinan: "médinoise", read: "Lire et écouter verset par verset", listen: "Écouter", prev: "Sourate précédente", next: "Sourate suivante", all: "Toutes les sourates", suffix: "arabe, traduction et récitation", desc: "le texte arabe intégral, la traduction des sens, le tafsir et la récitation verset par verset." },
  de: { quran: "Koran", surah: "Sure", ayat: "Verse", meccan: "mekkanisch", medinan: "medinensisch", read: "Vers für Vers lesen und hören", listen: "Anhören", prev: "Vorherige Sure", next: "Nächste Sure", all: "Alle Suren", suffix: "Arabisch, Übersetzung & Rezitation", desc: "der vollständige arabische Text, die Übersetzung der Bedeutungen, Tafsir und Rezitation Vers für Vers." },
  es: { quran: "Corán", surah: "Sura", ayat: "aleyas", meccan: "mecana", medinan: "medinense", read: "Leer y escuchar aleya por aleya", listen: "Escuchar", prev: "Sura anterior", next: "Sura siguiente", all: "Todas las suras", suffix: "árabe, traducción y recitación", desc: "el texto árabe completo, la traducción del significado, el tafsir y la recitación aleya por aleya." },
  ar: { quran: "القرآن الكريم", surah: "سورة", ayat: "آية", meccan: "مكية", medinan: "مدنية", read: "اقرأ واستمع آية آية", listen: "استمع", prev: "السورة السابقة", next: "السورة التالية", all: "جميع السور", suffix: "النص والتلاوة", desc: "النص الكامل والتفسير والتلاوة آية آية." },
};
const labels = (locale: string) => L[locale] ?? L.en!;

function surahId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 114 ? n : null;
}

async function load(id: number, locale: string): Promise<SurahResponse | null> {
  try {
    const r = await getCached<SurahResponse>(`/quran/surah/${id}?lang=${locale}`, 86400);
    if (!r?.surah || !Array.isArray(r.ayat) || r.ayat.length === 0) return null;
    // A surah row without its names (an older API answer) is completed from the surah list — a title never reads
    // "undefined".
    if (typeof r.surah.name_transliteration !== "string" || typeof r.surah.name_ar !== "string") {
      const meta = (await allSurahs()).find((x) => x.id === id);
      if (!meta) return null;
      r.surah = { ...meta, ...Object.fromEntries(Object.entries(r.surah).filter(([, v]) => v !== undefined && v !== null)) } as SurahMeta;
      if (typeof r.surah.name_transliteration !== "string") return null;
    }
    if (!Number.isFinite(r.surah.ayah_count)) r.surah.ayah_count = r.ayat.length;
    return r;
  } catch {
    return null;
  }
}

async function allSurahs(): Promise<SurahMeta[]> {
  try {
    const r = await getCached<{ surah?: SurahMeta[] }>("/quran/surah", 86400);
    return Array.isArray(r?.surah) ? r.surah : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; surah: string }> }): Promise<Metadata> {
  const { locale: raw, surah } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const id = surahId(surah);
  if (!id) return {};
  const data = await load(id, locale);
  if (!data) return {};
  const t = labels(locale);
  const s = data.surah;
  const first = data.ayat[0]?.translation?.replace(/\s+/g, " ").trim() ?? "";
  return {
    title: `${t.surah} ${s.name_transliteration} (${s.name_ar}) — ${s.ayah_count} ${t.ayat} · ${t.suffix}`,
    description: `${t.surah} ${s.name_transliteration} (${s.id}): ${t.desc}${first ? ` ${first.slice(0, 120)}${first.length > 120 ? "…" : ""}` : ""}`,
    alternates: { canonical: routePath(locale, `/quran/${id}`) },
  };
}

export default async function SurahPage({ params }: { params: Promise<{ locale: string; surah: string }> }) {
  const { locale: raw, surah } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const id = surahId(surah);
  if (!id) notFound();
  const [data, list] = await Promise.all([load(id, locale), allSurahs()]);
  if (!data) notFound();
  const t = labels(locale);
  const s = data.surah;
  const credit = typeof data.translationSource?.credit === "string" ? data.translationSource.credit : null;
  const prev = id > 1 ? list.find((x) => x.id === id - 1) : undefined;
  const next = id < 114 ? list.find((x) => x.id === id + 1) : undefined;
  const reader = (a: number) => `${routePath(locale, "/quran")}?s=${id}&a=${a}`;

  const ld = [
    breadcrumbs(locale, [
      { name: t.quran, route: "/quran" },
      { name: `${t.surah} ${s.name_transliteration}`, route: `/quran/${id}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Chapter",
      name: `${t.surah} ${s.name_transliteration} (${s.name_ar})`,
      position: id,
      url: absUrl(locale, `/quran/${id}`),
      inLanguage: locale === "ar" ? ["ar"] : ["ar", locale],
      isPartOf: { "@type": "Book", name: "القرآن الكريم — Al-Qur'an Al-Karim", inLanguage: "ar" },
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {ld.map((x, i) => (
        <script key={i} {...jsonLdProps(x)} />
      ))}
      <nav className="text-sm">
        <Link href={routePath(locale, "/quran")} className="text-accent hover:underline">
          ← {t.quran}
        </Link>
      </nav>

      <header className="mt-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          {t.surah} {id}
        </p>
        <h1 className="mt-2 font-heading text-3xl sm:text-4xl">{s.name_transliteration}</h1>
        <p dir="rtl" lang="ar" className="font-arabic mt-1 text-3xl text-text-primary">
          {s.name_ar}
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          {s.ayah_count} {t.ayat} · {s.revelation_place === "meccan" ? t.meccan : t.medinan}
        </p>
        <a href={reader(1)} className="btn btn-accent mt-5">
          🔊 {t.read}
        </a>
      </header>

      <ol className="mt-10 space-y-6">
        {data.ayat.map((a) => (
          <li key={a.number} id={`ayat-${a.number}`} className="card-premium-static scroll-mt-24 p-5">
            <p dir="rtl" lang="ar" className="font-arabic text-right text-2xl leading-[2.3] sm:text-3xl">
              {a.text_ar} <span className="text-accent">﴿{a.number.toLocaleString("ar-EG")}﴾</span>
            </p>
            {a.translation ? (
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-text-secondary">
                <span className="mr-1 font-semibold text-accent">{a.number}.</span>
                {a.translation}
              </p>
            ) : null}
            {a.translation_footnotes ? (
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-text-secondary/80">{a.translation_footnotes}</p>
            ) : null}
            <a href={reader(a.number)} className="btn btn-sm btn-ghost mt-2 text-accent">
              ▶ {t.listen} {id}:{a.number}
            </a>
          </li>
        ))}
      </ol>
      {credit ? <p className="mt-6 text-center text-[11px] text-text-secondary/80">{credit}</p> : null}

      <nav className="mt-10 flex flex-wrap items-center justify-between gap-3">
        {prev ? (
          <Link href={routePath(locale, `/quran/${prev.id}`)} className="btn btn-outline" rel="prev">
            ← {t.prev}: {prev.name_transliteration}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={routePath(locale, `/quran/${next.id}`)} className="btn btn-outline" rel="next">
            {t.next}: {next.name_transliteration} →
          </Link>
        ) : null}
      </nav>

      {list.length === 114 ? (
        <section className="mt-12">
          <h2 className="font-heading text-lg">{t.all}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-1.5 text-sm sm:grid-cols-3">
            {list.map((x) => (
              <li key={x.id}>
                <Link
                  href={routePath(locale, `/quran/${x.id}`)}
                  aria-current={x.id === id ? "page" : undefined}
                  className={`block rounded-lg px-2 py-1 hover:bg-accent/10 ${x.id === id ? "font-semibold text-accent" : ""}`}
                >
                  {x.id}. {x.name_transliteration}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
