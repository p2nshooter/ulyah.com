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
}
const LABELS: Record<string, Labels> = {
  id: { all: "Semua", hajj: "Haji", umrah: "Umroh", duration: "Durasi", departure: "Keberangkatan", from: "Disewakan", contact: "Hubungi kami", empty: "Belum ada paket yang tersedia saat ini." },
  en: { all: "All", hajj: "Hajj", umrah: "Umrah", duration: "Duration", departure: "Departure", from: "Slot for rent", contact: "Contact us", empty: "No packages are available right now." },
  ar: { all: "الكل", hajj: "الحج", umrah: "العمرة", duration: "المدة", departure: "المغادرة", from: "متاح للإيجار", contact: "تواصل معنا", empty: "لا توجد باقات متاحة حالياً." },
  fr: { all: "Tout", hajj: "Hajj", umrah: "Omra", duration: "Durée", departure: "Départ", from: "Emplacement à louer", contact: "Contactez-nous", empty: "Aucun forfait n'est disponible pour le moment." },
  de: { all: "Alle", hajj: "Hadsch", umrah: "Umrah", duration: "Dauer", departure: "Abflug", from: "Platz zu vermieten", contact: "Kontaktieren Sie uns", empty: "Derzeit sind keine Pakete verfügbar." },
  es: { all: "Todo", hajj: "Hach", umrah: "Umra", duration: "Duración", departure: "Salida", from: "Espacio en alquiler", contact: "Contáctanos", empty: "No hay paquetes disponibles por ahora." },
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

  if (packages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-border)] px-6 py-16 text-center text-[var(--color-text-secondary)]">
        {t.empty}
      </div>
    );
  }

  return (
    <div>
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
