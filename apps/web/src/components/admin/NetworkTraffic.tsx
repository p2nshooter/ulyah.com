"use client";

import { useEffect, useRef, useState } from "react";
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
interface LiveRow {
  site: string;
  hits: number;
}
interface Resp {
  days: number;
  totals: SiteTotal[];
  daily: DayRow[];
  topPages: PageRow[];
  liveNow?: LiveRow[];
  at?: number;
}

const SITE_LABEL: Record<string, string> = {
  ulyah: "ulyah.com", "1fr": "1fr.fr", tilawa: "tilawa.de", dawa: "dawa.es", xad: "xad.es",
  "axto-io": "axto.io", "axto-dev": "axto.dev", "axto-us": "axto.us",
  "profity-in": "profity.in", "oldco-in": "oldco.in",
  "xaa-es": "xaa.es", "xad-es": "xad.es (lama)", "jai-lat": "jai.lat", "lie-skin": "lie.skin",
};

// The ulyah.com ecosystem = the Islamic da'wah network that mirrors ulyah's
// content in each native language — including xad.es, the English member
// (owner: "jika xad masih di trafik yang bukan ekosistem, pindahkan ke
// ekosistem ulyah.com"). "xad-es" is the legacy beacon id from before xad.es
// joined the monorepo; it belongs to the same site, so it moves with it.
// Every OTHER owner site (the ebook store + the high-CPC article/ad sites) is
// "di luar ekosistem" and gets its own SEPARATE traffic menu so it's easy to
// monitor apart from the da'wah traffic.
export const ECOSYSTEM_SITES = new Set(["ulyah", "1fr", "tilawa", "dawa", "xad", "xad-es"]);
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
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  // Previous poll's live counts, so each site shows ▲ naik / ▼ turun the
  // moment visitors come or go — no manual refresh, ever.
  const [liveTrend, setLiveTrend] = useState<Record<string, number>>({});
  const prevLiveRef = useRef<Record<string, number>>({});

  // Live: refetch on a short interval so traffic rises AND falls in front of
  // the owner without a manual page refresh (owner: "trafik dilaporkan live,
  // ikut berjalan otomatis tanpa harus di-refresh manual").
  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get<Resp>(`/admin/site-analytics?days=${days}`)
        .then((r) => {
          if (!alive) return;
          const nextLive: Record<string, number> = {};
          for (const row of r.liveNow ?? []) nextLive[row.site] = row.hits;
          const trend: Record<string, number> = {};
          for (const site of new Set([...Object.keys(nextLive), ...Object.keys(prevLiveRef.current)])) {
            trend[site] = (nextLive[site] ?? 0) - (prevLiveRef.current[site] ?? 0);
          }
          prevLiveRef.current = nextLive;
          setLiveTrend(trend);
          setData(r);
          setRefreshedAt(new Date());
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 3000); // ~3s so "online sekarang" rises/falls in near real-time
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [days]);

  if (!data) return null;
  const inScope = (site: string) => (scope === "ecosystem" ? isEcosystemSite(site) : !isEcosystemSite(site));
  const totals = data.totals.filter((t) => inScope(t.site));
  const topPages = data.topPages.filter((p) => inScope(p.site));
  const liveNow = (data.liveNow ?? []).filter((l) => inScope(l.site));
  const liveMap: Record<string, number> = {};
  for (const l of liveNow) liveMap[l.site] = l.hits;
  const liveTotal = liveNow.reduce((s, l) => s + l.hits, 0);
  const max = Math.max(1, ...totals.map((t) => t.views));
  const grand = totals.reduce((s, t) => s + t.views, 0);
  const heading = scope === "ecosystem" ? "🌐 Trafik Jaringan (ekosistem ulyah.com)" : "🌍 Trafik Situs Luar Ekosistem";

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-heading text-base">
          {heading}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            LIVE{refreshedAt ? ` · ${refreshedAt.toLocaleTimeString()}` : ""}
          </span>
        </p>
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
        Total {grand.toLocaleString()} tampilan halaman dalam {data.days} hari terakhir ·{" "}
        <span className="font-medium text-emerald-500">{liveTotal.toLocaleString()} online sekarang</span>
        <span className="text-[var(--color-text-secondary)]"> (perangkat aktif ≤5 detik)</span>
      </p>

      {totals.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          Belum ada data — trafik muncul di sini begitu situs mulai dikunjungi.
        </p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {totals.map((t) => {
            const live = liveMap[t.site] ?? 0;
            const delta = liveTrend[t.site] ?? 0;
            return (
              <div key={t.site} className="flex items-center gap-2 text-sm">
                <span className="w-24 shrink-0 truncate">{SITE_LABEL[t.site] ?? t.site}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-black/5">
                  <div className="h-full rounded bg-accent" style={{ width: `${(t.views / max) * 100}%` }} />
                </div>
                {/* Live "online sekarang" per situs (≤5s presence), updated every
                    poll — the ▲/▼ shows visitors rising or falling vs the last tick. */}
                <span
                  className={`w-16 shrink-0 text-right text-xs tabular-nums ${
                    delta > 0 ? "text-emerald-500" : delta < 0 ? "text-rose-500" : "text-[var(--color-text-secondary)]"
                  }`}
                  title="Online sekarang — perangkat aktif ≤5 detik"
                >
                  {delta > 0 ? "▲" : delta < 0 ? "▼" : "•"} {live}
                </span>
                <span className="w-16 shrink-0 text-right tabular-nums">{t.views.toLocaleString()}</span>
              </div>
            );
          })}
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
