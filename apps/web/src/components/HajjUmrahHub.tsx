"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";

interface HajjPackage {
  id: number;
  kind: "hajj" | "umrah";
  title: string;
  provider: string | null;
  description: string | null;
  price: string | null;
  duration: string | null;
  departure: string | null;
  image_url: string | null;
  badge: string | null;
  features: string[];
  contact_url: string | null;
}

// Self-contained UI labels — the page chrome renders in each site's native
// language (the package text itself is entered by the admin in that language).
interface Labels {
  all: string;
  hajj: string;
  umrah: string;
  duration: string;
  departure: string;
  from: string;
  contact: string;
  empty: string;
  rentTitle: string;
  rentBody: string;
  rentCta: string;
}
// $1/day rental of this Hajj & Umrah page — elegant, courteous, inviting copy
// per site language (owner: "kasih harga sewa halaman haji & umroh $1/hari,
// bahasa elegan sopan tapi mengundang, bahasa masing-masing negara").
const LABELS: Record<string, Labels> = {
  id: {
    all: "Semua", hajj: "Haji", umrah: "Umroh", duration: "Durasi", departure: "Keberangkatan",
    from: "Disewakan · $1/hari", contact: "Hubungi kami", empty: "Belum ada paket yang tersedia saat ini.",
    rentTitle: "Ruang terhormat untuk mitra travel Haji & Umroh",
    rentBody: "Tampilkan layanan Haji & Umroh Anda di halaman ini kepada pengunjung yang nyata dan bersungguh-sungguh. Sewa dengan ringan hati — hanya $1 per hari. Sebuah kehormatan bagi kami untuk menyambut Anda.",
    rentCta: "Sewa halaman ini — salam@ulyah.com",
  },
  en: {
    all: "All", hajj: "Hajj", umrah: "Umrah", duration: "Duration", departure: "Departure",
    from: "For rent · $1/day", contact: "Contact us", empty: "No packages are available right now.",
    rentTitle: "A distinguished space for Hajj & Umrah partners",
    rentBody: "Present your Hajj & Umrah services on this page to real, devoted visitors. Rent it with ease — just $1 per day. It would be our honour to welcome you.",
    rentCta: "Rent this page — salam@ulyah.com",
  },
  zh: {
    all: "全部", hajj: "朝觐", umrah: "副朝", duration: "行程天数", departure: "出发",
    from: "招租 · 每日 $1", contact: "联系我们", empty: "目前暂无套餐。",
    rentTitle: "为朝觐与副朝合作伙伴预留的尊贵位置",
    rentBody: "在此页面向真实、虔诚的访客展示您的朝觐与副朝服务。轻松租用 — 每日仅需 $1。我们很荣幸欢迎您。",
    rentCta: "租用此页面 — salam@ulyah.com",
  },
  ar: {
    all: "الكل", hajj: "الحج", umrah: "العمرة", duration: "المدة", departure: "المغادرة",
    from: "متاح للإيجار · دولار/يوم", contact: "تواصل معنا", empty: "لا توجد باقات متاحة حالياً.",
    rentTitle: "مساحة مميّزة لشركاء الحج والعمرة",
    rentBody: "اعرض خدمات الحج والعمرة على هذه الصفحة أمام زوّار حقيقيين ومهتمّين. الإيجار ميسور — دولار واحد فقط في اليوم. يشرّفنا أن نرحّب بكم.",
    rentCta: "استأجر هذه الصفحة — salam@ulyah.com",
  },
  fr: {
    all: "Tout", hajj: "Hajj", umrah: "Omra", duration: "Durée", departure: "Départ",
    from: "À louer · 1 $/jour", contact: "Contactez-nous", empty: "Aucun forfait n'est disponible pour le moment.",
    rentTitle: "Un espace distingué pour les partenaires du Hajj et de l'Omra",
    rentBody: "Présentez vos services de Hajj et d'Omra sur cette page, devant un public réel et dévoué. Louez-le en toute simplicité — seulement 1 $ par jour. Ce serait un honneur de vous accueillir.",
    rentCta: "Louer cette page — salam@ulyah.com",
  },
  de: {
    all: "Alle", hajj: "Hadsch", umrah: "Umrah", duration: "Dauer", departure: "Abflug",
    from: "Zu vermieten · 1 $/Tag", contact: "Kontaktieren Sie uns", empty: "Derzeit sind keine Pakete verfügbar.",
    rentTitle: "Ein erlesener Platz für Hadsch- und Umrah-Partner",
    rentBody: "Präsentieren Sie Ihre Hadsch- und Umrah-Angebote auf dieser Seite vor einem echten, andächtigen Publikum. Mieten Sie ihn ganz unbeschwert — nur 1 $ pro Tag. Es wäre uns eine Ehre, Sie willkommen zu heißen.",
    rentCta: "Diese Seite mieten — salam@ulyah.com",
  },
  es: {
    all: "Todo", hajj: "Hach", umrah: "Umra", duration: "Duración", departure: "Salida",
    from: "En alquiler · 1 $/día", contact: "Contáctanos", empty: "No hay paquetes disponibles por ahora.",
    rentTitle: "Un espacio distinguido para socios de Hach y Umra",
    rentBody: "Presente sus servicios de Hach y Umra en esta página ante visitantes reales y devotos. Alquílela con toda comodidad — solo 1 $ al día. Sería un honor darle la bienvenida.",
    rentCta: "Alquilar esta página — salam@ulyah.com",
  },
};

export function HajjUmrahHub({ locale }: { locale: string }) {
  const t = LABELS[locale] ?? LABELS.en!;
  const [packages, setPackages] = useState<HajjPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hajj" | "umrah">("all");

  useEffect(() => {
    api
      .get<{ packages: HajjPackage[] }>(`/content/hajj-packages?tenant=${TENANT.id}`)
      .then((r) => setPackages(Array.isArray(r?.packages) ? r.packages : []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  const hasHajj = useMemo(() => packages.some((p) => p.kind === "hajj"), [packages]);
  const hasUmrah = useMemo(() => packages.some((p) => p.kind === "umrah"), [packages]);
  const shown = useMemo(
    () => (filter === "all" ? packages : packages.filter((p) => p.kind === filter)),
    [packages, filter]
  );

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40" />
        ))}
      </div>
    );
  }

  // Elegant, courteous rental invitation — shown whether or not any package
  // is listed, so the $1/day offer to Hajj & Umrah partners is always present.
  const rentInvite = (
    <div className="mb-8 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 p-6 text-center sm:p-8">
      <p className="text-3xl">🕋</p>
      <h2 className="mt-2 font-heading text-xl sm:text-2xl">{t.rentTitle}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">{t.rentBody}</p>
      <a
        href="mailto:salam@ulyah.com"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-110"
      >
        ✉️ {t.rentCta}
      </a>
    </div>
  );

  if (packages.length === 0) {
    return (
      <div>
        {rentInvite}
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-16 text-center text-[var(--color-text-secondary)]">
          {t.empty}
        </div>
      </div>
    );
  }

  return (
    <div>
      {rentInvite}
      {hasHajj && hasUmrah && (
        <div className="mb-8 flex flex-wrap gap-2">
          {(["all", "umrah", "hajj"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === k
                  ? "bg-accent text-white shadow"
                  : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-accent"
              }`}
            >
              {k === "all" ? t.all : k === "hajj" ? t.hajj : t.umrah}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <article
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/80 to-accent/60">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl opacity-90">🕋</div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                {p.kind === "hajj" ? t.hajj : t.umrah}
              </span>
              {p.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                  {p.badge}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-heading text-lg leading-snug">{p.title}</h3>
              {p.provider && <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{p.provider}</p>}
              {p.description && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{p.description}</p>}

              {p.features.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 text-accent">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">
                {p.duration && (
                  <div>
                    <dt className="opacity-70">{t.duration}</dt>
                    <dd className="font-medium text-[var(--color-text)]">{p.duration}</dd>
                  </div>
                )}
                {p.departure && (
                  <div>
                    <dt className="opacity-70">{t.departure}</dt>
                    <dd className="font-medium text-[var(--color-text)]">{p.departure}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex items-end justify-between gap-3">
                {/* NO price claims on the public page (owner: "jangan pernah
                    memasukkan harga, jangan ada claim harga — tulis aja
                    disewakan"): the slot is offered for rent instead. */}
                <div>
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                    {t.from}
                  </span>
                </div>
                {p.contact_url && (
                  <a
                    href={p.contact_url}
                    target={p.contact_url.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow transition hover:brightness-110"
                  >
                    {t.contact}
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
