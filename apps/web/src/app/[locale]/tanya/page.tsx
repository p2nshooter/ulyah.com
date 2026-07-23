import type { Metadata } from "next";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { AiChat } from "@/components/AiChat";
import { TENANT } from "@/lib/tenant";
import { aiChatLabels } from "@/lib/ai-chat-labels";
import { localePath } from "@/lib/paths";

// Native per-locale page chrome — siblings render their own language (fr/de),
// never Indonesian/English fallback. `{site}` = tenant brand.
const L: Record<string, { subtitle: (s: string) => string; metaTitle: (s: string) => string; metaDesc: (s: string) => string }> = {
  id: {
    subtitle: (s) => `Dijawab oleh worker Orchestra Core berbasis database ${s} — dengan dalil & rujukan, tanpa mengarang.`,
    metaTitle: (s) => `Tanya AI Islami — ${s}`,
    metaDesc: (s) => `Tanya jawab Islami berbasis Al-Qur'an & hadits dari database ${s}, dengan rujukan.`,
  },
  en: {
    subtitle: (s) => `Answered by the Orchestra Core worker, grounded in the ${s} database — with evidence and references, never fabricated.`,
    metaTitle: (s) => `Ask the Islamic AI — ${s}`,
    metaDesc: (s) => `Islamic Q&A grounded in the Qur'an & hadith from the ${s} database, with references.`,
  },
  fr: {
    subtitle: (s) => `Répondu par le worker Orchestra Core, fondé sur la base de données ${s} — avec preuves et références, sans invention.`,
    metaTitle: (s) => `Interroger l'IA islamique — ${s}`,
    metaDesc: (s) => `Questions-réponses islamiques fondées sur le Coran et le hadith depuis la base de données ${s}, avec références.`,
  },
  de: {
    subtitle: (s) => `Beantwortet vom Orchestra-Core-Worker, gestützt auf die ${s}-Datenbank — mit Belegen und Quellen, nichts erfunden.`,
    metaTitle: (s) => `Die islamische KI fragen — ${s}`,
    metaDesc: (s) => `Islamische Fragen & Antworten, gestützt auf Koran & Hadith aus der ${s}-Datenbank, mit Quellen.`,
  },
  ar: {
    subtitle: (s) => `يجيب عليها عامل Orchestra Core استنادًا إلى قاعدة بيانات ${s} — بالأدلة والمراجع، دون تأليف.`,
    metaTitle: (s) => `اسأل الذكاء الاصطناعي الإسلامي — ${s}`,
    metaDesc: (s) => `أسئلة وأجوبة إسلامية مبنية على القرآن والحديث من قاعدة بيانات ${s}، مع المراجع.`,
  },
  es: {
    subtitle: (s) => `Respondido por el worker Orchestra Core, basado en la base de datos de ${s} — con evidencias y referencias, sin inventar.`,
    metaTitle: (s) => `Pregunta a la IA islámica — ${s}`,
    metaDesc: (s) => `Preguntas y respuestas islámicas basadas en el Corán y el hadiz de la base de datos de ${s}, con referencias.`,
  },
  ru: {
    subtitle: (s) => `Отвечает воркер Orchestra Core на основе базы данных ${s} — с доказательствами и ссылками, без вымысла.`,
    metaTitle: (s) => `Спросить исламский ИИ — ${s}`,
    metaDesc: (s) => `Исламские вопросы и ответы на основе Корана и хадисов из базы данных ${s}, со ссылками.`,
  },
  zh: {
    subtitle: (s) => `由 Orchestra Core 工作程序基于 ${s} 数据库作答——附证据与出处，绝不杜撰。`,
    metaTitle: (s) => `向伊斯兰 AI 提问 — ${s}`,
    metaDesc: (s) => `基于《古兰经》与圣训、来自 ${s} 数据库的伊斯兰问答，附出处。`,
  },
  ja: {
    subtitle: (s) => `Orchestra Core ワーカーが ${s} のデータベースに基づいて回答——証拠と出典つき、捏造なし。`,
    metaTitle: (s) => `イスラームAIに質問 — ${s}`,
    metaDesc: (s) => `クルアーンとハディースに基づく、${s} のデータベースからのイスラームQ&A。出典つき。`,
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
    alternates: { canonical: localePath(locale, `/tanya`) },
  };
}

export default async function TanyaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const t = labels(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-center font-heading text-3xl">💬 {aiChatLabels(locale).title}</h1>
      <p className="mt-2 text-center text-sm text-[var(--color-text-secondary)]">{t.subtitle(TENANT.siteName)}</p>
      <div className="mt-8">
        <AiChat locale={locale} />
      </div>
    </div>
  );
}
