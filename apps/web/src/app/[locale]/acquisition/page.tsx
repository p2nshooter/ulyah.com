import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { TENANT } from "@/lib/tenant";

/**
 * Acquisition page — 1fr.fr tenant only (404 on ulyah.com). Owner brief: the
 * site is openly for sale ("terang-terangan"), presented beautifully; the
 * buyer receives everything (domain, business email, streaming control,
 * separate admin + donor portals, content pipeline), free-tier AI is swapped
 * for the buyer's paid AI after acquisition, Drive source starts empty, and
 * demo read-only logins let a prospect inspect both portals. This section is
 * meant to be editable/hideable from the admin portal by the future owner
 * (visibility toggle lands with the 1fr admin settings phase).
 */

const COPY = {
  fr: {
    title: "Ce portail est à vendre — une acquisition clef en main",
    intro:
      "One Faith France (1fr.fr) est un portail islamique complet, pur et sans publicité, prêt à servir la communauté francophone. Il est proposé à l'acquisition afin que son rayonnement (syiar) continue de grandir entre les mains d'un propriétaire en France.",
    benefitsTitle: "Ce que le nouveau propriétaire reçoit",
    benefits: [
      "Le nom de domaine 1fr.fr — court, mémorable, national",
      "L'e-mail professionnel salam@1fr.fr et la pleine propriété de la marque",
      "Le contrôle total des diffusions en direct (Makkah, Madinah et chaînes du monde entier, déjà opérationnelles 24h/24)",
      "Le portail d'administration complet : chaque page est dynamique — dons, produits, Hajj & Omra, films pour enfants, tout s'édite, s'affiche ou se masque en un clic",
      "Le portail donateurs séparé, avec certificats de remerciement générés pour chaque donateur",
      "Le Coran complet (604 pages du Mushaf, tajwid coloré), des dizaines de milliers de hadiths, une bibliothèque de kitab classiques, des histoires des Prophètes — le contenu peut être inclus dans la discussion d'acquisition pour ne rien reconstruire",
      "Après l'acquisition : l'IA gratuite est retirée automatiquement et remplacée par l'IA premium du propriétaire, avec des assistants plus puissants",
    ],
    demoTitle: "Visite en toute confiance",
    demo:
      "Un accès de démonstration (lecture seule) aux deux portails — administration et donateurs — est fourni sur demande : vous voyez tout, y compris des exemples de certificats, sans pouvoir rien modifier.",
    contactTitle: "Entrer en contact",
    contact: "Pour toute proposition d'acquisition, écrivez-nous :",
    minOffer: "Offre minimale : 20 000 $ US",
    donateNote: "En attendant, chaque don maintient ce portail vivant et son œuvre continue.",
    donateCta: "Soutenir ce portail",
  },
  de: {
    title: "Dieses Portal steht zum Verkauf — eine schlüsselfertige Übernahme",
    intro:
      "Tilawa (tilawa.de) ist ein vollständiges, reines und werbefreies islamisches Portal für die deutschsprachige Gemeinschaft. Es wird zur Übernahme angeboten, damit seine Botschaft (Daʿwa) in den Händen eines Eigentümers in Deutschland weiterwächst.",
    benefitsTitle: "Was der neue Eigentümer erhält",
    benefits: [
      "Den Domainnamen tilawa.de — kurz, einprägsam, national",
      "Die geschäftliche E-Mail salam@tilawa.de und das vollständige Eigentum an der Marke",
      "Die volle Kontrolle über die Live-Übertragungen (Mekka, Medina und islamische Kanäle weltweit, bereits rund um die Uhr aktiv)",
      "Das komplette Admin-Portal: jede Seite ist dynamisch — Spenden, Produkte, Hadsch & Umra, Kinderfilme; alles lässt sich mit einem Klick bearbeiten, ein- oder ausblenden",
      "Das separate Spender-Portal mit automatisch erstellten Dankeszertifikaten für jeden Spender",
      "Den vollständigen Koran (604 Mushaf-Seiten mit farbigem Tadschwid), zehntausende Hadithe, eine klassische Kitab-Bibliothek und die Geschichten der Propheten — der Inhalt kann Teil der Übernahmegespräche sein, damit nichts neu aufgebaut werden muss",
      "Nach der Übernahme: die kostenlose KI wird automatisch entfernt und durch die Premium-KI des Eigentümers mit leistungsfähigeren Assistenten ersetzt",
    ],
    demoTitle: "Mit Vertrauen prüfen",
    demo:
      "Ein Nur-Lese-Demozugang zu beiden Portalen — Verwaltung und Spender — ist auf Anfrage verfügbar: Sie sehen alles, einschließlich Beispielzertifikaten, ohne etwas ändern zu können.",
    contactTitle: "Kontakt aufnehmen",
    contact: "Für jedes Übernahmeangebot schreiben Sie uns:",
    minOffer: "Mindestgebot: 20.000 US$",
    donateNote: "Bis dahin hält jede Spende dieses Portal am Leben und sein Wirken in Gang.",
    donateCta: "Dieses Portal unterstützen",
  },
  en: {
    title: "This portal is for sale — a turnkey acquisition",
    intro:
      "One Faith France (1fr.fr) is a complete, pure, ad-free Islamic portal ready to serve the French-speaking community. It is offered for acquisition so that its mission keeps growing in the hands of an owner in France.",
    benefitsTitle: "What the new owner receives",
    benefits: [
      "The 1fr.fr domain name — short, memorable, national",
      "The business e-mail salam@1fr.fr and full ownership of the brand",
      "Full control of the live streams (Makkah, Madinah and channels worldwide, already running 24/7)",
      "The complete admin portal: every page is dynamic — donations, products, Hajj & Umrah, kids' films; everything can be edited, shown or hidden in one click",
      "The separate donor portal, with thank-you certificates generated for every donor",
      "The complete Qur'an (604 Mushaf pages with colored tajwid), tens of thousands of hadiths, a classical kitab library, stories of the Prophets — the content can be part of the acquisition discussion so nothing is rebuilt from scratch",
      "After acquisition: the free AI is automatically removed and replaced with the owner's premium AI and more capable assistants",
    ],
    demoTitle: "Inspect with confidence",
    demo:
      "A read-only demo login for both portals — admin and donor — is available on request: you can see everything, including sample certificates, without being able to change anything.",
    contactTitle: "Get in touch",
    contact: "For any acquisition proposal, write to us:",
    minOffer: "Minimum offer: US$20,000",
    donateNote: "Meanwhile, every donation keeps this portal alive and its work going.",
    donateCta: "Support this portal",
  },
  ar: {
    title: "هذه البوابة معروضة للبيع — استحواذ جاهز بالكامل",
    intro:
      "One Faith France ‏(1fr.fr) بوابة إسلامية كاملة، نقية وخالية من الإعلانات، جاهزة لخدمة الناطقين بالفرنسية، وهي معروضة للاستحواذ ليستمر نفعها وينمو بيد مالكٍ في فرنسا.",
    benefitsTitle: "ما الذي يحصل عليه المالك الجديد",
    benefits: [
      "اسم النطاق 1fr.fr — قصير وسهل الحفظ ووطني",
      "البريد المهني salam@1fr.fr والملكية الكاملة للعلامة",
      "التحكم الكامل في البث المباشر (مكة والمدينة وقنوات من أنحاء العالم تعمل بالفعل على مدار الساعة)",
      "بوابة إدارة كاملة: كل صفحة ديناميكية — التبرعات والمنتجات والحج والعمرة وأفلام الأطفال؛ كل شيء يُحرَّر ويُعرَض أو يُخفى بنقرة واحدة",
      "بوابة مستقلة للمتبرعين مع شهادات شكر تُنشأ لكل متبرع",
      "القرآن الكريم كاملًا (٦٠٤ صفحات مصحف بتلوين التجويد) وعشرات الآلاف من الأحاديث ومكتبة كتب تراثية وقصص الأنبياء — يمكن إدراج المحتوى في مباحثات الاستحواذ حتى لا يُبنى شيء من الصفر",
      "بعد الاستحواذ: يُزال الذكاء الاصطناعي المجاني تلقائيًا ويُستبدل بذكاء اصطناعي مدفوع أقوى بمساعدين أكثر قدرة",
    ],
    demoTitle: "تفقَّد بثقة",
    demo:
      "يتاح عند الطلب دخول تجريبي (للاطلاع فقط) إلى البوابتين — الإدارة والمتبرعين — ترى كل شيء بما فيه نماذج الشهادات دون إمكانية تغيير أي شيء.",
    contactTitle: "تواصل معنا",
    contact: "لأي عرض استحواذ، راسلونا على:",
    minOffer: "الحد الأدنى للعرض: ٢٠٬٠٠٠ دولار أمريكي",
    donateNote: "وإلى ذلك الحين، كل تبرع يُبقي هذه البوابة حيّة ويُديم عملها.",
    donateCta: "ادعم هذه البوابة",
  },
} as const;

// The fr/en/ar copy was authored for One Faith France; rebrand its tokens to
// the active tenant at render time so tilawa.de (and any future sibling) shows
// its own name/domain/email in every language, not 1fr's. The `de` block is
// already Tilawa-native.
function brandize(s: string): string {
  const domain = TENANT.siteUrl.replace(/^https?:\/\//, "");
  return s
    .replace(/One Faith France/g, TENANT.siteName)
    .replace(/salam@1fr\.fr/g, TENANT.acquisitionEmail ?? `salam@${domain}`)
    .replace(/1fr\.fr/g, domain);
}

function copyFor(locale: string) {
  const base = COPY[(locale in COPY ? locale : "en") as keyof typeof COPY];
  return {
    ...base,
    title: brandize(base.title),
    intro: brandize(base.intro),
    benefits: base.benefits.map(brandize),
    demo: brandize(base.demo),
    contact: brandize(base.contact),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const c = copyFor(locale);
  return {
    title: `${c.title} — ${TENANT.siteName}`,
    description: c.intro.slice(0, 160),
    alternates: { canonical: `/${locale}/acquisition` },
  };
}

export default async function AcquisitionPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!TENANT.features.forSale) notFound();
  const { locale: raw } = await params;
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const c = copyFor(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div dir={dir} className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="hero-entrance text-center">
        {TENANT.logoBanner && (
          <Image
            src={TENANT.logoBanner}
            alt={TENANT.siteName}
            width={1200}
            height={480}
            className="mx-auto mb-8 w-full max-w-2xl rounded-2xl shadow-[var(--shadow-gold)]"
            priority
          />
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">💎 {TENANT.siteName}</p>
        <h1 className="mt-3 font-heading text-3xl sm:text-4xl">{c.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{c.intro}</p>
      </div>

      <section className="reveal-stagger mt-12">
        <h2 className="section-divider text-center font-heading text-2xl">{c.benefitsTitle}</h2>
        <ul className="mt-6 space-y-3">
          {c.benefits.map((b, i) => (
            <li key={i} className="card-premium flex items-start gap-3 p-4 text-[15px] leading-relaxed">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/12 text-sm text-accent">✦</span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <h2 className="font-heading text-xl">🔍 {c.demoTitle}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">{c.demo}</p>
      </section>

      <section className="hero-entrance mt-12 rounded-2xl bg-gradient-to-b from-[#0B3D2E] to-[#06251b] p-8 text-center text-[#f4efe3]">
        <h2 className="font-heading text-2xl text-accent">✉️ {c.contactTitle}</h2>
        <p className="mt-3 text-sm text-[#f4efe3]/80">{c.contact}</p>
        <p className="mx-auto mt-3 inline-block rounded-full border border-accent/60 bg-accent/15 px-5 py-1.5 text-sm font-semibold tracking-wide text-accent">
          {(c as { minOffer?: string }).minOffer}
        </p>
        <br />
        <a
          href={`mailto:${TENANT.acquisitionEmail}`}
          className="mt-4 inline-block rounded-full bg-accent px-8 py-3 font-heading text-lg font-semibold text-primary shadow-[var(--shadow-gold)] transition hover:scale-105"
        >
          {TENANT.acquisitionEmail}
        </a>
        <p className="mt-6 text-xs text-[#f4efe3]/60">{c.donateNote}</p>
        <Link href={`/${locale}/donasi`} className="mt-2 inline-block rounded-full border border-accent/50 px-6 py-2 text-sm text-accent transition hover:bg-accent/10">
          🤲 {c.donateCta}
        </Link>
      </section>
    </div>
  );
}
