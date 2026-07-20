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

/**
 * Network traffic — per-site pageviews for the WHOLE ecosystem, from the
 * cookieless /track beacon each site sends. One panel to watch every site's
 * traffic (owner: "semua website wajib punya analisa trafic di portal admin").
 */
export function NetworkTraffic() {
  const [data, setData] = useState<Resp | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    api.get<Resp>(`/admin/site-analytics?days=${days}`).then(setData).catch(() => {});
  }, [days]);

  if (!data) return null;
  const max = Math.max(1, ...data.totals.map((t) => t.views));
  const grand = data.totals.reduce((s, t) => s + t.views, 0);

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-base">🌐 Trafik Jaringan (semua situs)</p>
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

      {data.totals.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
          Belum ada data — trafik muncul di sini begitu situs mulai dikunjungi.
        </p>
      ) : (
        <div className="mt-3 space-y-1.5">
          {data.totals.map((t) => (
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

      {data.topPages.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Halaman teratas</p>
          <ul className="mt-1.5 space-y-1 text-xs text-[var(--color-text-secondary)]">
            {data.topPages.slice(0, 12).map((p, i) => (
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
