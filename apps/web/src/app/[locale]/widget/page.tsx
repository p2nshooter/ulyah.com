import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";
import { localePath } from "@/lib/paths";

interface WidgetCard {
  emoji: string;
  title: Record<string, string>;
  desc: Record<string, string>;
  href: string;
}

// Each widget's name/description in every supported UI language. Missing
// locales fall back to English (never Indonesian) via `pick()`.
const WIDGETS: WidgetCard[] = [
  {
    emoji: "📖",
    title: { id: "Al-Qur'an Flipbook", en: "Qur'an Flipbook", fr: "Coran feuilletable", de: "Koran-Blätterbuch", ar: "مصحف قابل للتقليب", es: "Corán hojeable", zh: "可翻页《古兰经》", ru: "Перелистываемый Коран" },
    desc: {
      id: "Mushaf yang bisa dibalik halamannya seperti buku asli, langsung di browser.",
      en: "A page-turning Mushaf you can read right in the browser.",
      es: "Un Mushaf de páginas que puedes leer directamente en el navegador.",
      zh: "可像真书一样翻页的《古兰经》，直接在浏览器中阅读。",
      ru: "Мусхаф с перелистыванием страниц — читайте прямо в браузере.",
      fr: "Un Moushaf que l'on feuillette comme un vrai livre, directement dans le navigateur.",
      de: "Ein Mushaf zum Blättern wie ein echtes Buch, direkt im Browser.",
      ar: "مصحف تُقلَّب صفحاته كالكتاب الحقيقي، مباشرةً في المتصفح.",
    },
    href: "quran-flipbook",
  },
  {
    emoji: "📻",
    title: { id: "Radio Qur'an Dunia", en: "World Qur'an Radio", fr: "Radio Coran du monde", de: "Weltweites Koran-Radio", ar: "إذاعة القرآن العالمية", es: "Radio Corán Mundial", zh: "世界《古兰经》电台", ru: "Всемирное радио Корана" },
    desc: {
      id: "Al-Qur'an dibacakan tanpa henti 24 jam oleh para qori dunia.",
      en: "The Qur'an recited nonstop, 24 hours a day, by reciters from around the world.",
      es: "El Corán recitado sin parar, 24 horas al día, por recitadores de todo el mundo.",
      zh: "《古兰经》全天候不间断诵读，由世界各地的诵读者呈现。",
      ru: "Коран, читаемый круглосуточно чтецами со всего мира.",
      fr: "Le Coran récité sans interruption, 24 h/24, par des récitants du monde entier.",
      de: "Der Koran rund um die Uhr rezitiert, von Rezitatoren aus aller Welt.",
      ar: "القرآن يُتلى دون توقف على مدار الساعة بأصوات قرّاء من العالم.",
    },
    href: "radio",
  },
  {
    emoji: "🕌",
    title: { id: "Jadwal Sholat & Radio", en: "Prayer Times & Radio", fr: "Horaires de prière & Radio", de: "Gebetszeiten & Radio", ar: "مواقيت الصلاة والإذاعة", es: "Horarios de oración y Radio", zh: "礼拜时间与电台", ru: "Время намаза и радио" },
    desc: {
      id: "Jadwal sholat sesuai lokasi Anda, plus Radio Qori Dunia yang selalu hidup.",
      en: "Prayer times for your location, plus the always-on World Qur'an Radio.",
      es: "Los horarios de oración según tu ubicación, además de la Radio Corán Mundial siempre activa.",
      zh: "根据您所在位置的礼拜时间，外加始终在线的世界《古兰经》电台。",
      ru: "Время намаза для вашего местоположения и всегда работающее Всемирное радио Корана.",
      fr: "Les horaires de prière selon votre position, plus la Radio Coran du monde toujours active.",
      de: "Gebetszeiten für Ihren Standort, dazu das immer aktive Weltweite Koran-Radio.",
      ar: "مواقيت الصلاة حسب موقعك، مع إذاعة القرآن العالمية الدائمة.",
    },
    href: "jadwal-sholat",
  },
  {
    emoji: "🧒",
    title: { id: "Kisah Anak Muslim", en: "Muslim Kids' Stories", fr: "Histoires pour enfants musulmans", de: "Geschichten für muslimische Kinder", ar: "قصص الأطفال المسلمين", es: "Historias para niños musulmanes", zh: "穆斯林儿童故事", ru: "Истории для мусульманских детей" },
    desc: {
      id: "Kisah pendek berurutan untuk anak, aman ditonton, tanpa gambar yang dilarang.",
      en: "Short, sequential stories for children — safe to watch, no prohibited imagery.",
      es: "Historias cortas y secuenciales para niños — seguras de ver, sin imágenes prohibidas.",
      zh: "为儿童准备的连续短篇故事 — 观看安全，无违禁画面。",
      ru: "Короткие последовательные истории для детей — безопасны для просмотра, без запретных изображений.",
      fr: "De courtes histoires suivies pour enfants — à regarder en toute sécurité, sans image interdite.",
      de: "Kurze, aufeinanderfolgende Geschichten für Kinder — unbedenklich, ohne verbotene Bilder.",
      ar: "قصص قصيرة متتابعة للأطفال — آمنة للمشاهدة، دون صور محظورة.",
    },
    href: "anak",
  },
];

function pick(m: Record<string, string>, locale: string): string {
  return m[locale] ?? m.en ?? "";
}

// Page chrome in every supported UI language. `{site}` = tenant brand.
const L: Record<string, { heading: (s: string) => string; intro: string; open: string; metaTitle: (s: string) => string; metaDesc: (s: string) => string }> = {
  id: {
    heading: (s) => `Widget Store ${s}`,
    intro: "Setiap widget bisa dipasang mandiri ke layar utama HP Anda — seperti aplikasi sendiri, terpisah dari yang lain.",
    open: "Buka & pasang",
    metaTitle: (s) => `Widget Store — ${s}`,
    metaDesc: (s) => `Semua widget ${s} yang bisa dipasang mandiri di layar utama HP Anda — Qur'an, Radio, Jadwal Sholat, dan lainnya.`,
  },
  en: {
    heading: (s) => `${s} Widget Store`,
    intro: "Every widget installs independently to your home screen — like its own app, separate from the rest.",
    open: "Open & install",
    metaTitle: (s) => `Widget Store — ${s}`,
    metaDesc: (s) => `Every installable ${s} widget in one place — Qur'an, Radio, Prayer Times, and more.`,
  },
  es: {
    heading: (s) => `Tienda de widgets ${s}`,
    intro: "Cada widget se instala de forma independiente en tu pantalla de inicio — como su propia app, separada de las demás.",
    open: "Abrir e instalar",
    metaTitle: (s) => `Tienda de widgets — ${s}`,
    metaDesc: (s) => `Todos los widgets instalables de ${s} en un solo lugar — Corán, Radio, horarios de oración y más.`,
  },
  zh: {
    heading: (s) => `${s} 小组件商店`,
    intro: "每个小组件都可独立安装到您的主屏幕 — 如同一个独立的应用，彼此分开。",
    open: "打开并安装",
    metaTitle: (s) => `小组件商店 — ${s}`,
    metaDesc: (s) => `${s} 所有可安装的小组件汇于一处 — 《古兰经》、电台、礼拜时间等。`,
  },
  ru: {
    heading: (s) => `Магазин виджетов ${s}`,
    intro: "Каждый виджет устанавливается отдельно на главный экран — как собственное приложение, отдельно от остальных.",
    open: "Открыть и установить",
    metaTitle: (s) => `Магазин виджетов — ${s}`,
    metaDesc: (s) => `Все устанавливаемые виджеты ${s} в одном месте — Коран, радио, время намаза и другое.`,
  },
  fr: {
    heading: (s) => `Boutique de widgets ${s}`,
    intro: "Chaque widget s'installe indépendamment sur votre écran d'accueil — comme sa propre application, séparée des autres.",
    open: "Ouvrir et installer",
    metaTitle: (s) => `Boutique de widgets — ${s}`,
    metaDesc: (s) => `Tous les widgets installables de ${s} au même endroit — Coran, Radio, horaires de prière et plus encore.`,
  },
  de: {
    heading: (s) => `${s} Widget-Store`,
    intro: "Jedes Widget wird eigenständig auf Ihrem Startbildschirm installiert — wie eine eigene App, getrennt von den anderen.",
    open: "Öffnen & installieren",
    metaTitle: (s) => `Widget-Store — ${s}`,
    metaDesc: (s) => `Alle installierbaren ${s}-Widgets an einem Ort — Koran, Radio, Gebetszeiten und mehr.`,
  },
  ar: {
    heading: (s) => `متجر أدوات ${s}`,
    intro: "كل أداة تُثبَّت بشكل مستقل على شاشتك الرئيسية — كتطبيق خاص بها، منفصل عن البقية.",
    open: "افتح وثبّت",
    metaTitle: (s) => `متجر الأدوات — ${s}`,
    metaDesc: (s) => `كل أدوات ${s} القابلة للتثبيت في مكان واحد — القرآن، الإذاعة، مواقيت الصلاة، والمزيد.`,
  },
};

function labels(locale: string) {
  return L[locale] ?? L.en!;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);
  return { title: t.metaTitle(TENANT.siteName), description: t.metaDesc(TENANT.siteName), alternates: { canonical: localePath(locale, `/widget`) } };
}

export default async function WidgetHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);

  return (
    <div className="relative overflow-hidden px-4 py-14 sm:px-6">
      {/* Soft decorative geometric Islamic pattern glow — no figurative imagery */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(184,137,43,0.9), transparent 45%), radial-gradient(circle at 85% 30%, rgba(11,61,46,0.9), transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-4xl">🕌 ✨ 🕋</p>
          <h1 className="mt-3 font-heading text-3xl sm:text-4xl">{t.heading(TENANT.siteName)}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-text-secondary)]">{t.intro}</p>
        </div>

        <div className="mt-6">
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {WIDGETS.map((w, i) => (
            <Link
              key={w.href}
              href={`/${locale}/${w.href}`}
              className="group relative overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-[var(--panel-bg)] to-[var(--panel-bg2)] p-6 text-[var(--panel-fg)] shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-accent/10 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100"
              />
              <span className="text-4xl transition duration-300 group-hover:scale-110">{w.emoji}</span>
              <p className="mt-3 font-heading text-lg">{pick(w.title, locale)}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--panel-fg)]/70">{pick(w.desc, locale)}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent">
                {t.open}
                <span className="transition group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
        </div>
      </div>
    </div>
  );
}
