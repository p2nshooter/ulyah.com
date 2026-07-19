"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";
import { MiniBarChart } from "./MiniBarChart";

interface TenantStat {
  tenant: string;
  visitors: { today: number; week: number; month: number; allTime: number };
  installs: number;
  uninstalls: number;
  /** Distinct devices whose LAST event is an install — "truly installed
   * right now", immune to install→uninstall→reinstall double counting. */
  activeDevices: number;
  daily: { bucket: string; n: number }[];
  topPages: { path: string; n: number }[];
  topCountries: { country: string; n: number }[];
}

const META: Record<string, { name: string; site: string; icon: string }> = {
  ulyah: { name: "ULYAH.COM", site: "ulyah.com", icon: "🕌" },
  "1fr": { name: "One Faith France", site: "1fr.fr", icon: "🇫🇷" },
  tilawa: { name: "Tilawa", site: "tilawa.de", icon: "🇩🇪" },
  dawa: { name: "Dawa", site: "dawa.es", icon: "🇪🇸" },
};

/**
 * Per-site visitor + install analytics. One content DB serves three sites, so
 * every beacon is tagged with the tenant it came from. On ulyah.com's admin
 * this shows ALL three sites side by side (watch each site's growth); on a
 * sibling site's own admin it shows only that site. Numbers start at 0 for a
 * freshly-launched site — nothing is guessed.
 */
export function TenantAnalyticsPanel() {
  const [rows, setRows] = useState<TenantStat[] | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  // Live report: refetch every 60s and on demand — the owner uninstalled the
  // app and the numbers looked frozen because this fetched exactly once per
  // portal visit and never again.
  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get<{ tenants: TenantStat[] }>("/admin/tenant-analytics")
        .then((r) => {
          if (!alive) return;
          setRows(r.tenants);
          setRefreshedAt(new Date());
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!rows) return null;

  // ulyah admin sees everyone; a sibling admin sees only itself.
  const visible = TENANT.id === "ulyah" ? rows : rows.filter((r) => r.tenant === TENANT.id);
  const isMulti = visible.length > 1;

  return (
    <section>
      <p className="mb-2 font-heading text-base">
        {isMulti ? "🌐 Pengunjung per Situs (ulyah.com · 1fr.fr · tilawa.de · dawa.es)" : "🌐 Pengunjung Situs Ini"}
        {refreshedAt && (
          <span className="ml-2 align-middle text-[10px] font-normal text-[var(--color-text-secondary)]">
            diperbarui {refreshedAt.toLocaleTimeString()} · auto-refresh 60 dtk
          </span>
        )}
      </p>
      <div className={`grid gap-3 ${isMulti ? "desktop:grid-cols-3" : ""}`}>
        {visible.map((r) => {
          const m = META[r.tenant] ?? { name: r.tenant, site: r.tenant, icon: "🌍" };
          const chart = r.daily.map((b) => ({ label: b.bucket.slice(5), value: b.n }));
          const net = r.installs - r.uninstalls;
          return (
            <div key={r.tenant} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <div className="flex items-center justify-between">
                <p className="font-heading text-sm">
                  <span className="mr-1">{m.icon}</span>
                  {m.name}
                </p>
                <span className="text-[11px] text-[var(--color-text-secondary)]">{m.site}</span>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  ["Hari ini", r.visitors.today],
                  ["7 hari", r.visitors.week],
                  ["30 hari", r.visitors.month],
                  ["Total", r.visitors.allTime],
                ].map(([label, val]) => (
                  <div key={label as string} className="rounded-lg bg-black/[0.03] py-2 dark:bg-white/[0.03]">
                    <p className="font-heading text-lg text-accent">{val as number}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">{label as string}</p>
                  </div>
                ))}
              </div>

              {chart.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">30 hari terakhir</p>
                  <MiniBarChart data={chart} />
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span>📲 Install: <b className="text-accent">{r.installs}</b></span>
                <span>🗑️ Uninstall*: <b>{r.uninstalls}</b></span>
                <span>
                  📱 Perangkat aktif: <b className="text-accent">{r.activeDevices > 0 ? r.activeDevices : net > 0 ? net : 0}</b>
                </span>
              </div>

              {r.topPages.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">Halaman terpopuler</p>
                  <ul className="space-y-0.5 text-[11px]">
                    {r.topPages.slice(0, 5).map((p) => (
                      <li key={p.path} className="flex justify-between gap-2">
                        <span className="truncate text-[var(--color-text-secondary)]">{p.path}</span>
                        <span className="shrink-0 tabular-nums">{p.n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-[var(--color-text-secondary)]">
        * Uninstall bersifat perkiraan — web tidak punya event resmi &quot;uninstall&quot;; dihitung saat perangkat yang
        sebelumnya memasang aplikasi terdeteksi tidak lagi memasangnya. &quot;Perangkat aktif&quot; = jumlah perangkat unik
        yang event TERAKHIR-nya install (satu HP yang install → uninstall → install lagi tetap dihitung 1 perangkat,
        dengan riwayat 2 install + 1 uninstall).
      </p>
    </section>
  );
}
