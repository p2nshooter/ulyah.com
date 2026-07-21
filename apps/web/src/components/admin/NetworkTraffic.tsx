"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SiteTotal {
  site: string;
  views: number;
}
interface DayRow {
  day: string;
  views: number;
}
interface PageRow {
  site: string;
  path: string;
  views: number;
}
interface Resp {
  days: number;
  totals: SiteTotal[];
  daily: DayRow[];
  topPages: PageRow[];
}

const SITE_LABEL: Record<string, string> = {
  ulyah: "ulyah.com", "1fr": "1fr.fr", tilawa: "tilawa.de", dawa: "dawa.es",
  "axto-io": "axto.io", "axto-dev": "axto.dev", "axto-us": "axto.us",
  "profity-in": "profity.in", "oldco-in": "oldco.in",
  "xaa-es": "xaa.es", "xad-es": "xad.es", "jai-lat": "jai.lat", "lie-skin": "lie.skin",
};

// The ulyah.com ecosystem = the Islamic da'wah network that mirrors ulyah's
// content in each native language. Every OTHER owner site (the ebook store +
// the high-CPC article/ad sites) is "di luar ekosistem" and — per the owner —
// gets its own SEPARATE traffic menu so it's easy to monitor apart from the
// da'wah traffic. Any site id not listed here is treated as external.
export const ECOSYSTEM_SITES = new Set(["ulyah", "1fr", "tilawa", "dawa"]);
export function isEcosystemSite(site: string): boolean {
  return ECOSYSTEM_SITES.has(site);
}

/**
 * Network traffic — per-site pageviews from the cookieless /track beacon each
 * site sends. `scope` splits the view: "ecosystem" (default) shows only the
 * ulyah da'wah network; "external" shows only the other owner sites, rendered
 * as its own admin menu (owner: "situs di luar ekosistem ulyah.com trafiknya
 * tampilkan terpisah menunya di portal admin agar mudah dipantau").
 */
export function NetworkTraffic({ scope = "ecosystem" }: { scope?: "ecosystem" | "external" }) {
  const [data, setData] = useState<Resp | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.get<Resp>(`/admin/site-analytics?days=${days}`).then(setData).catch(() => {});
  }, [days]);

  if (!data) return null;
  const inScope = (site: string) => (scope === "ecosystem" ? isEcosystemSite(site) : !isEcosystemSite(site));
  const totals = data.totals.filter((t) => inScope(t.site));
  const topPages = data.topPages.filter((p) => inScope(p.site));
  const max = Math.max(1, ...totals.map((t) => t.views));
  const grand = totals.reduce((s, t) => s + t.views, 0);
  const heading = scope === "ecosystem" ? "🌐 Trafik Jaringan (ekosistem ulyah.com)" : "🌍 Trafik Situs Luar Ekosistem";

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-base">{heading}</p>
        <div className="flex gap-1 text-xs">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full px-3 py-1 ${days === d ? "bg-accent text-white" : "border border-[var(--color-border)]"}`}
            >
              {d}h
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
        Total {grand.toLocaleString()} tampilan halaman dalam {data.days} hari terakhir.
      </p>

      {totals.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          Belum ada data — trafik muncul di sini begitu situs mulai dikunjungi.
        </p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {totals.map((t) => (
            <div key={t.site} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 truncate">{SITE_LABEL[t.site] ?? t.site}</span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-black/5">
                <div className="h-full rounded bg-accent" style={{ width: `${(t.views / max) * 100}%` }} />
              </div>
              <span className="w-16 shrink-0 text-right tabular-nums">{t.views.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {topPages.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Halaman teratas</p>
          <ul className="mt-1.5 space-y-1 text-xs text-[var(--color-text-secondary)]">
            {topPages.slice(0, 12).map((p, i) => (
              <li key={i} className="flex justify-between gap-2">
                <span className="truncate">
                  <span className="opacity-60">{SITE_LABEL[p.site] ?? p.site}</span> {p.path}
                </span>
                <span className="tabular-nums">{p.views.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
