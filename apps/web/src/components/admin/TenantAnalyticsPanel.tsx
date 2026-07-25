"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";
import { MiniBarChart } from "./MiniBarChart";

interface Window4 {
  today: number;
  week: number;
  month: number;
  allTime: number;
}

interface TenantStat {
  tenant: string;
  /** Pageviews from readers we positively classified as human. */
  visitors: Window4;
  /** Crawler pageviews. Shown, not hidden — see the note under the cards. */
  bots?: Window4;
  /** Rows written before bot classification existed; never guessed at. */
  unclassified?: Window4;
  /** DISTINCT human devices over the SAME windows as `visitors`, which is what
   *  makes "3 pembaca, 11 halaman" add up instead of contradicting itself. */
  readers?: Window4;
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
  daily: { bucket: string; n: number; d?: number }[];
  topPages: { path: string; n: number; d?: number }[];
  topCountries: { country: string; n: number; d?: number }[];
  topReferers?: { host: string; n: number }[];
}

const ZERO: Window4 = { today: 0, week: 0, month: 0, allTime: 0 };

const META: Record<string, { name: string; site: string; icon: string }> = {
  ulyah: { name: "ULYAH.COM", site: "ulyah.com", icon: "🕌" },
  "1fr": { name: "One Faith France", site: "1fr.fr", icon: "🇫🇷" },
  tilawa: { name: "Tilawa", site: "tilawa.de", icon: "🇩🇪" },
  dawa: { name: "Dawa", site: "dawa.es", icon: "🇪🇸" },
  xad: { name: "XAD", site: "xad.es", icon: "🇬🇧" },
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
          const readers = r.readers ?? ZERO;
          const bots = r.bots ?? ZERO;
          const unclassified = r.unclassified ?? ZERO;
          return (
            <div key={r.tenant} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <div className="flex items-center justify-between">
                <p className="font-heading text-sm">
                  <span className="mr-1">{m.icon}</span>
                  {m.name}
                </p>
                <span className="text-[11px] text-[var(--color-text-secondary)]">{m.site}</span>
              </div>

              {/* Readers and pages read, over the SAME windows. Before this was
                  fixed the two cards used different clocks (a UTC calendar day
                  next to a rolling 24 hours), which is how the portal came to
                  show more devices than pageviews on the same day. */}
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {(
                  [
                    ["Hari ini", readers.today, r.visitors.today],
                    ["7 hari", readers.week, r.visitors.week],
                    ["30 hari", readers.month, r.visitors.month],
                    ["Total", readers.allTime, r.visitors.allTime],
                  ] as [string, number, number][]
                ).map(([label, dev, pv]) => (
                  <div key={label} className="rounded-lg bg-black/[0.03] py-2 dark:bg-white/[0.03]">
                    <p className="font-heading text-lg text-accent">{dev}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">{label}</p>
                    <p className="text-[10px] text-[var(--color-text-secondary)]">{pv} halaman</p>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-center text-[10px] text-[var(--color-text-secondary)]">
                pembaca (perangkat unik) · halaman dibaca — hari Jakarta (UTC+7)
              </p>

              {chart.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">30 hari terakhir</p>
                  <MiniBarChart data={chart} />
                </div>
              )}

              {/* The crawler split, shown rather than silently filtered — the
                  owner should be able to see WHY a number is what it is. */}
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400">
                  🧑 pembaca 30 hari: <b>{r.visitors.month}</b> halaman
                </span>
                <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[var(--color-text-secondary)] dark:bg-white/[0.06]">
                  🤖 bot 30 hari: <b>{bots.month}</b>
                </span>
                {unclassified.month > 0 && (
                  <span
                    className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600 dark:text-amber-400"
                    title="Tercatat sebelum pemilahan bot aktif — tidak ditebak belakangan"
                  >
                    ❔ belum terpilah: <b>{unclassified.month}</b>
                  </span>
                )}
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
                        <span className="shrink-0 tabular-nums">
                          {p.n}
                          {p.d ? ` · ${p.d} pembaca` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(r.topReferers?.length ?? 0) > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">Datang dari</p>
                  <ul className="space-y-0.5 text-[11px]">
                    {r.topReferers!.slice(0, 5).map((f) => (
                      <li key={f.host} className="flex justify-between gap-2">
                        <span className="truncate text-[var(--color-text-secondary)]">{f.host}</span>
                        <span className="shrink-0 tabular-nums">{f.n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-text-secondary)]">
        <b>Angka ini nyata, bukan asumsi.</b> Semuanya dihitung dari beacon perangkat yang benar-benar merender halaman.
        Dua hal yang dulu membuatnya keliru sudah diperbaiki: (1) kartu &quot;hari ini&quot; memakai hari UTC sementara kartu
        perangkat memakai 24 jam berjalan — Jakarta UTC+7, jadi pagi hari perangkat bisa terlihat LEBIH banyak daripada
        kunjungan; sekarang semua kartu memakai jendela yang sama, hari Jakarta; (2) crawler ikut terhitung sebagai
        pengunjung — sekarang dipilah di sisi server dari User-Agent dan ditampilkan terpisah (🤖), tidak disembunyikan.
        Baris ❔ adalah baris yang tercatat sebelum pemilahan itu ada — sengaja tidak ditebak belakangan. &quot;Online
        sekarang&quot; (bar ⚡ Live) = perangkat aktif ≤5 detik terakhir. &quot;App terpasang&quot; = perangkat unik yang event
        terakhirnya install; &quot;Uninstall (perangkat)&quot; BERKURANG saat perangkat yang sama install lagi. * Deteksi
        uninstall best-effort — web tidak punya event resmi uninstall.
      </p>
    </section>
  );
}
