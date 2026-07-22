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
  /** Devices whose LAST event is an uninstall — DECREASES when the same
   * device installs again. */
  uninstalledDevices: number;
  /** Distinct devices with a presence heartbeat in the last 5s — the SAME
   * live "online now" source as the ⚡ Live bar (no longer shown here). */
  activeNow: number;
  /** DISTINCT devices that actually browsed this site per window. Until device
   * tracking has run longer than a window, the shorter windows equal the longer
   * ones (every tagged device so far falls inside all of them). */
  devices24h?: number;
  devices7d?: number;
  devices30d?: number;
  devices365d?: number;
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
const REFRESH_MS = 12_000; // fast enough to feel live, gentle on the API

export function TenantAnalyticsPanel() {
  const [rows, setRows] = useState<TenantStat[] | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [failed, setFailed] = useState(false);
  // Ticks every second so the "updated Xs ago" counter visibly moves even
  // between fetches — the owner's "harus di-refresh manual baru kelihatan"
  // was partly the frozen timestamp making a working 30s refresh look dead.
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Live report: refetch on an interval AND whenever the tab regains focus,
  // so numbers climb on their own — no manual reload. A silently-failing fetch
  // now surfaces (the timestamp used to freeze with no hint why).
  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get<{ tenants: TenantStat[] }>("/admin/tenant-analytics")
        .then((r) => {
          if (!alive) return;
          setRows(r.tenants);
          setRefreshedAt(new Date());
          setFailed(false);
        })
        .catch(() => {
          if (alive) setFailed(true);
        });
    load();
    const t = setInterval(load, REFRESH_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    const tick = setInterval(() => alive && setNowTick(Date.now()), 1000);
    return () => {
      alive = false;
      clearInterval(t);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (!rows) return null;

  const secondsAgo = refreshedAt ? Math.max(0, Math.round((nowTick - refreshedAt.getTime()) / 1000)) : null;

  // ulyah admin sees everyone; a sibling admin sees only itself.
  const visible = TENANT.id === "ulyah" ? rows : rows.filter((r) => r.tenant === TENANT.id);
  const isMulti = visible.length > 1;

  return (
    <section>
      <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-base">
        {isMulti ? "🌐 Pengunjung per Situs (ulyah.com · 1fr.fr · tilawa.de · dawa.es)" : "🌐 Pengunjung Situs Ini"}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            failed ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-500"
          }`}
          title="Data live dari beacon perangkat"
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${failed ? "bg-red-500" : "animate-pulse bg-emerald-500"}`} />
          {failed ? "koneksi terputus — mencoba lagi…" : "LIVE"}
        </span>
        <span className="align-middle text-[10px] font-normal text-[var(--color-text-secondary)]">
          statistik historis · diperbarui {secondsAgo === null ? "…" : `${secondsAgo} dtk lalu`} · auto tiap 12 dtk (untuk
          &quot;online sekarang&quot; real-time lihat bar ⚡ Live di atas)
        </span>
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

              {/* Real unique visiting devices — ordered short → long window. */}
              <div className="mt-3">
                <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">
                  📲 Perangkat unik (pengunjung nyata)
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["24 jam", r.devices24h ?? 0],
                    ["7 hari", r.devices7d ?? 0],
                    ["30 hari", r.devices30d ?? 0],
                    ["1 tahun", r.devices365d ?? 0],
                  ].map(([label, val]) => (
                    <div key={label as string} className="rounded-lg bg-black/[0.03] py-2 dark:bg-white/[0.03]">
                      <p className="font-heading text-base text-accent">{val as number}</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">{label as string}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span>
                  📱 App terpasang (perangkat): <b className="text-accent">{r.activeDevices > 0 ? r.activeDevices : net > 0 ? net : 0}</b>
                </span>
                <span>
                  🗑️ Uninstall (perangkat)*: <b>{r.uninstalledDevices}</b>
                </span>
                <span className="text-[var(--color-text-secondary)]">
                  riwayat: {r.installs}× install · {r.uninstalls}× uninstall
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
        Semua angka nyata dari beacon perangkat — tidak ada estimasi. &quot;Online sekarang&quot; (di bar ⚡ Live) = perangkat
        aktif ≤5 detik terakhir — kondisi detik ini. &quot;App terpasang&quot; = perangkat unik yang event terakhirnya install. &quot;Uninstall (perangkat)&quot; =
        perangkat yang event terakhirnya uninstall — otomatis BERKURANG saat perangkat yang sama install lagi. Baris
        &quot;riwayat&quot; adalah jumlah kejadian mentah. * Deteksi uninstall bersifat best-effort (web tidak punya event
        resmi uninstall); terdeteksi saat perangkat itu kembali membuka situs. Angka &quot;perangkat unik&quot; 24 jam/7 hari/30
        hari/1 tahun bisa SAMA di awal karena pelacakan per-perangkat baru mulai — setiap perangkat masih masuk ke semua
        jendela; nilainya melebar sendiri seiring waktu berjalan.
      </p>
    </section>
  );
}
