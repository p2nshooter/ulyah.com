import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { HajjUmrahHub } from "@/components/HajjUmrahHub";
import { TENANT } from "@/lib/tenant";
import { routePath } from "@/lib/paths";
import { fillLabels } from "@/lib/fill-labels";

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
    desc: "Paket haji dan umroh dari biro perjalanan — bimbingan terpercaya, langsung hubungi penyelenggara. Slot promosi tersedia untuk disewa.",
    metaTitle: "Haji & Umroh — Paket & Bimbingan",
    metaDesc: (s) => `Paket haji dan umroh di ${s}: durasi dan keberangkatan yang jelas, langsung hubungi penyelenggara. Slot promosi untuk biro perjalanan tersedia.`,
  },
  en: {
    heading: "Hajj & Umrah",
    desc: "Hajj and Umrah packages from travel agents — trusted guidance, contact the organiser directly. Promotion slots are available to rent.",
    metaTitle: "Hajj & Umrah — Packages & Guidance",
    metaDesc: (s) => `Hajj and Umrah packages on ${s}: clear duration and departures, contact the organiser directly. Promotion slots for travel agents are available.`,
  },
  ar: {
    heading: "الحج والعمرة",
    desc: "باقات الحج والعمرة من وكالات السفر — إرشاد موثوق، تواصل مباشرة مع المنظّم. مساحات ترويجية متاحة للإيجار.",
    metaTitle: "الحج والعمرة — الباقات والإرشاد",
    metaDesc: (s) => `باقات الحج والعمرة على ${s}: مدة ومواعيد مغادرة واضحة وتواصل مباشر مع المنظّم. مساحات ترويجية متاحة لوكالات السفر.`,
  },
  fr: {
    heading: "Hajj & Omra",
    desc: "Forfaits Hajj et Omra des agences de voyage — accompagnement de confiance, contactez directement l'organisateur. Emplacements promotionnels à louer.",
    metaTitle: "Hajj & Omra — Forfaits & accompagnement",
    metaDesc: (s) => `Forfaits Hajj et Omra sur ${s} : durée et départs clairs, contact direct avec l'organisateur. Emplacements à louer pour les agences de voyage.`,
  },
  de: {
    heading: "Hadsch & Umrah",
    desc: "Hadsch- und Umrah-Pakete von Reiseveranstaltern — vertrauensvolle Begleitung, direkt beim Veranstalter anfragen. Werbeplätze zu vermieten.",
    metaTitle: "Hadsch & Umrah — Pakete & Begleitung",
    metaDesc: (s) => `Hadsch- und Umrah-Pakete auf ${s}: klare Dauer und Abflüge, direkter Kontakt zum Veranstalter. Werbeplätze für Reiseveranstalter zu vermieten.`,
  },
  es: {
    heading: "Hajj y Umrah",
    desc: "Paquetes de Hajj y Umrah de agencias de viaje — orientación de confianza, contacta directamente con el organizador. Espacios promocionales en alquiler.",
    metaTitle: "Hajj y Umrah — Paquetes y orientación",
    metaDesc: (s) => `Paquetes de Hajj y Umrah en ${s}: duración y salidas claras, contacto directo con el organizador. Espacios en alquiler para agencias de viaje.`,
  },
  ru: {
    heading: "Хадж и умра",
    desc: "Пакеты хаджа и умры от туристических агентств — надёжное сопровождение, свяжитесь напрямую с организатором. Рекламные места сдаются в аренду.",
    metaTitle: "Хадж и умра — пакеты и сопровождение",
    metaDesc: (s) => `Пакеты хаджа и умры на ${s}: понятная длительность и даты вылета, прямой контакт с организатором. Рекламные места для турагентств.`,
  },
  zh: {
    heading: "朝觐与副朝",
    desc: "旅行社的朝觐与副朝套餐——值得信赖的指导，直接联系组织方。推广位现可租用。",
    metaTitle: "朝觐与副朝 — 套餐与指导",
    metaDesc: (s) => `${s} 上的朝觐与副朝套餐：清晰的行程时长与出发日期，直接联系组织方。旅行社推广位现可租用。`,
  },
  ja: {
    heading: "ハッジとウムラ",
    desc: "旅行会社のハッジ・ウムラのパッケージ——信頼できる案内、主催者に直接お問い合わせください。広告枠をお貸しします。",
    metaTitle: "ハッジとウムラ — パッケージと案内",
    metaDesc: (s) => `${s} のハッジ・ウムラのパッケージ：明確な期間と出発日、主催者へ直接連絡。旅行会社向けの広告枠をお貸しします。`,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = L[locale] ?? fillLabels(locale, L.en!);
  return {
    title: t.metaTitle,
    description: t.metaDesc(TENANT.siteName),
    alternates: { canonical: routePath(locale, `/haji-umroh`) },
  };
}

export default async function HajjUmrahPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = L[locale] ?? fillLabels(locale, L.en!);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mb-3 text-5xl">🕋</div>
        <h1 className="font-heading text-3xl sm:text-4xl">{t.heading}</h1>
        <p className="mt-3 text-text-secondary">{t.desc}</p>
      </header>
      <HajjUmrahHub locale={locale} />
    </div>
  );
}
