"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { fill, type AdminWords } from "@/lib/admin-i18n";
import { sitePageUrl, type AdminSite } from "@/lib/admin-sites";
import { DemoAccessCard } from "./DemoAccessCard";

/**
 * The admin portal's home: the three promotions a site earns from (owner, 29 Oct 2026:
 * "betul2 mudah di gunakan untuk promosi haji umroh, youtube anak, dan promo youtube";
 * docs/ADSENSE-BLUEPRINT.md §18) — each with what is live now, one button to manage it
 * and one to see it on the site — then the three steps, and for the ulyah owner the
 * demo logins handed to prospective buyers.
 */
type Target = "hajj" | "youtube" | "kids";

interface Counts { hajj: number | null; youtube: number | null; kids: number | null }

export function PromoHub({ t, site, sites, owner, go }: { t: AdminWords; site: AdminSite; sites: AdminSite[]; owner: boolean; go: (tab: Target) => void }) {
  const [counts, setCounts] = useState<Counts>({ hajj: null, youtube: null, kids: null });

  useEffect(() => {
    let alive = true;
    setCounts({ hajj: null, youtube: null, kids: null });
    api.get<{ youtube?: { items?: unknown }; kids?: { items?: unknown } }>(`/admin/promo?site=${site.id}`)
      .then((r) => {
        if (!alive) return;
        const yt = Array.isArray(r?.youtube?.items) ? (r.youtube.items as { active?: unknown }[]) : [];
        const kids = Array.isArray(r?.kids?.items) ? (r.kids.items as { visible?: unknown }[]) : [];
        setCounts((c) => ({ ...c, youtube: yt.filter((s) => s.active === true).length, kids: kids.filter((k) => k.visible !== false).length }));
      })
      .catch(() => {});
    api.get<{ packages?: unknown }>(`/admin/hajj-packages?tenant=${site.id}`)
      .then((r) => {
        if (!alive) return;
        const rows = Array.isArray(r?.packages) ? (r.packages as { visible?: unknown }[]) : [];
        setCounts((c) => ({ ...c, hajj: rows.filter((p) => p.visible === 1 || p.visible === true).length }));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [site.id]);

  const cards: { key: Target; icon: string; title: string; text: string; count: string; route: string }[] = [
    { key: "hajj", icon: "🕋", title: t.hub.hajjTitle, text: t.hub.hajjText, count: counts.hajj === null ? "…" : fill(t.hub.hajjCount, { n: counts.hajj }), route: "/haji-umroh" },
    { key: "youtube", icon: "📺", title: t.hub.ytTitle, text: t.hub.ytText, count: counts.youtube === null ? "…" : fill(t.hub.ytCount, { n: counts.youtube }), route: "/live" },
    { key: "kids", icon: "🧒", title: t.hub.kidsTitle, text: t.hub.kidsText, count: counts.kids === null ? "…" : fill(t.hub.kidsCount, { n: counts.kids }), route: "/anak" },
  ];

  return (
    <div className="space-y-8" data-testid="admin-promo-hub">
      <div>
        <h2 className="font-heading text-2xl sm:text-3xl">{fill(t.hub.title, { site: site.name })}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{t.hub.lead}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <article key={c.key} className="card-premium-static flex flex-col rounded-3xl p-6" data-testid={`promo-card-${c.key}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/12 text-2xl" aria-hidden>{c.icon}</span>
              <span className="rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary dark:bg-white/10 dark:text-(--color-accent-light)">{c.count}</span>
            </div>
            <h3 className="mt-4 font-heading text-lg">{c.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">{c.text}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => go(c.key)} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 dark:bg-accent dark:text-primary">
                {t.hub.manage}
              </button>
              <a href={sitePageUrl(site, c.route)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">{t.viewOnSite}</a>
            </div>
          </article>
        ))}
      </div>

      <section className="rounded-3xl bg-primary px-6 py-6 text-[#f4efe3] sm:px-8">
        <h3 className="font-heading text-lg text-(--color-accent-xl)">{t.hub.howTitle}</h3>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {t.hub.how.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent font-heading font-bold text-primary">{i + 1}</span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {owner && <DemoAccessCard t={t} names={Object.fromEntries(sites.map((s) => [s.id, s.domain]))} />}
    </div>
  );
}
