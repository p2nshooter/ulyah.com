import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { HajjUmrahHub } from "@/components/HajjUmrahHub";
import { TENANT } from "@/lib/tenant";
import { localePath } from "@/lib/paths";

// Native per-locale copy — every site renders its own language (fr/de), never
// an English/Indonesian fallback. `{site}` becomes the tenant brand.
// `metaTitle` deliberately carries NO brand suffix — the locale layout's title
// template already appends " — <brand>", so adding it here doubled it.
const L: Record<
  string,
  { heading: string; desc: string; metaTitle: string; metaDesc: (s: string) => string }
> = {
  id: {
    heading: "Haji & Umroh",
    desc: "Paket haji dan umroh pilihan — bimbingan terpercaya, harga transparan, langsung hubungi penyelenggara.",
    metaTitle: "Haji & Umroh — Paket & Bimbingan",
    metaDesc: (s) => `Paket haji dan umroh pilihan di ${s}: durasi, harga, dan keberangkatan yang jelas.`,
  },
  en: {
    heading: "Hajj & Umrah",
    desc: "Curated Hajj and Umrah packages — trusted guidance, transparent pricing, contact the organiser directly.",
    metaTitle: "Hajj & Umrah — Packages & Guidance",
    metaDesc: (s) => `Curated Hajj and Umrah packages on ${s}: clear duration, pricing and departures.`,
  },
  ar: {
    heading: "الحج والعمرة",
    desc: "باقات مختارة للحج والعمرة — إرشاد موثوق وأسعار واضحة، تواصل مباشرة مع المنظّم.",
    metaTitle: "الحج والعمرة — الباقات والإرشاد",
    metaDesc: (s) => `باقات مختارة للحج والعمرة على ${s}: مدة وأسعار ومواعيد مغادرة واضحة.`,
  },
  fr: {
    heading: "Hajj & Omra",
    desc: "Forfaits Hajj et Omra sélectionnés — accompagnement de confiance, prix transparents, contactez directement l'organisateur.",
    metaTitle: "Hajj & Omra — Forfaits & accompagnement",
    metaDesc: (s) => `Forfaits Hajj et Omra sélectionnés sur ${s} : durée, prix et départs clairs.`,
  },
  de: {
    heading: "Hadsch & Umrah",
    desc: "Ausgewählte Hadsch- und Umrah-Pakete — vertrauensvolle Begleitung, transparente Preise, direkt beim Veranstalter anfragen.",
    metaTitle: "Hadsch & Umrah — Pakete & Begleitung",
    metaDesc: (s) => `Ausgewählte Hadsch- und Umrah-Pakete auf ${s}: klare Dauer, Preise und Abflüge.`,
  },
  es: {
    heading: "Hajj y Umrah",
    desc: "Paquetes seleccionados de Hajj y Umrah — orientación de confianza, precios transparentes, contacta directamente con el organizador.",
    metaTitle: "Hajj y Umrah — Paquetes y orientación",
    metaDesc: (s) => `Paquetes seleccionados de Hajj y Umrah en ${s}: duración, precios y salidas claras.`,
  },
  ru: {
    heading: "Хадж и умра",
    desc: "Отобранные пакеты хаджа и умры — надёжное сопровождение, прозрачные цены, свяжитесь напрямую с организатором.",
    metaTitle: "Хадж и умра — пакеты и сопровождение",
    metaDesc: (s) => `Отобранные пакеты хаджа и умры на ${s}: понятная длительность, цены и даты вылета.`,
  },
  zh: {
    heading: "朝觐与副朝",
    desc: "精选的朝觐与副朝套餐——值得信赖的指导、透明的价格，直接联系组织方。",
    metaTitle: "朝觐与副朝 — 套餐与指导",
    metaDesc: (s) => `${s} 上精选的朝觐与副朝套餐：清晰的行程时长、价格与出发日期。`,
  },
  ja: {
    heading: "ハッジとウムラ",
    desc: "厳選されたハッジ・ウムラのパッケージ——信頼できる案内、透明な価格、主催者に直接お問い合わせください。",
    metaTitle: "ハッジとウムラ — パッケージと案内",
    metaDesc: (s) => `${s} の厳選されたハッジ・ウムラのパッケージ：明確な期間・価格・出発日。`,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = L[locale] ?? L.en!;
  return {
    title: t.metaTitle,
    description: t.metaDesc(TENANT.siteName),
    alternates: { canonical: localePath(locale, `/haji-umroh`) },
  };
}

export default async function HajjUmrahPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = L[locale] ?? L.en!;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-3 text-5xl">🕋</div>
        <h1 className="font-heading text-3xl sm:text-4xl">{t.heading}</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">{t.desc}</p>
      </header>
      <HajjUmrahHub locale={locale} />
    </div>
  );
}
