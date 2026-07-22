"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";

/**
 * Real-time presence bar — how many devices are on each ecosystem site RIGHT
 * NOW, and how many just left ("closed"). Fed by the presence heartbeat
 * (/analytics/ping) and polled every 3 seconds, so the count moves within ~3s
 * (owner: "hitungan maksimal 3 detik langsung live berapa yg online dan yg
 * sudah closed"). These are REAL devices, not page views.
 */
interface LiveRow {
  tenant: string;
  online: number;
  closed: number;
}
const META: Record<string, { name: string; icon: string }> = {
  ulyah: { name: "ulyah.com", icon: "🕌" },
  "1fr": { name: "1fr.fr", icon: "🇫🇷" },
  tilawa: { name: "tilawa.de", icon: "🇩🇪" },
  dawa: { name: "dawa.es", icon: "🇪🇸" },
  xad: { name: "xad.es", icon: "🌌" },
};
const POLL_MS = 3000; // ≤3s freshness, as requested

export function LivePresenceBar() {
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [at, setAt] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const load = () =>
      api
        .get<{ tenants: LiveRow[]; at: number }>("/admin/live-presence")
        .then((r) => {
          if (!alive) return;
          setRows(r.tenants ?? []);
          setAt(Date.now());
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));
    load();
    const t = setInterval(load, POLL_MS);
    const tick = setInterval(() => alive && setNowTick(Date.now()), 1000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      clearInterval(t);
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // ulyah admin sees the WHOLE ecosystem (always all five sites, even at 0, so
  // the total is unambiguous); a sibling admin sees only its own site.
  const ECOSYSTEM = ["ulyah", "1fr", "tilawa", "dawa", "xad"];
  const scope = TENANT.id === "ulyah" ? ECOSYSTEM : [TENANT.id];
  const byTenant = new Map(rows.map((r) => [r.tenant, r]));
  const cards: LiveRow[] = scope.map((t) => byTenant.get(t) ?? { tenant: t, online: 0, closed: 0 });
  const onlineTotal = cards.reduce((s, r) => s + r.online, 0);
  const closedTotal = cards.reduce((s, r) => s + r.closed, 0);
  const secondsAgo = at ? Math.max(0, Math.round((nowTick - at) / 1000)) : null;

  return (
    <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.04] p-4">
      <p className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-heading text-base">
        ⚡ Live sekarang
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            failed ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-500"
          }`}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${failed ? "bg-red-500" : "animate-pulse bg-emerald-500"}`} />
          {failed ? "terputus — mencoba lagi…" : "LIVE"}
        </span>
        <span className="text-[10px] font-normal text-[var(--color-text-secondary)]">
          diperbarui {secondsAgo === null ? "…" : `${secondsAgo} dtk lalu`} · auto tiap 3 dtk
        </span>
      </p>

      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          🟢 Online sekarang: <b className="text-lg text-emerald-500">{onlineTotal}</b> perangkat
        </span>
        <span>
          🚪 Baru menutup (closed): <b className="text-lg text-accent">{closedTotal}</b> perangkat
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 desktop:grid-cols-5">
        {cards.map((r) => {
          const m = META[r.tenant] ?? { name: r.tenant, icon: "🌍" };
          return (
            <div key={r.tenant} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2">
              <p className="truncate text-[11px] text-[var(--color-text-secondary)]">
                {m.icon} {m.name}
              </p>
              <p className="mt-0.5 text-sm">
                <span className={`font-heading ${r.online > 0 ? "text-emerald-500" : "text-[var(--color-text-secondary)]"}`}>{r.online}</span>
                <span className="text-[10px] text-[var(--color-text-secondary)]"> online</span>
                {r.closed > 0 && (
                  <span className="ml-2 text-[10px] text-[var(--color-text-secondary)]">· {r.closed} baru keluar</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-[var(--color-text-secondary)]">
        Perangkat NYATA (bukan page view), dari heartbeat tiap 5 detik. &quot;Online&quot; = aktif ≤20 detik terakhir;
        &quot;closed&quot; = sempat aktif lalu menutup/pindah tab dalam 5 menit terakhir.
      </p>
    </section>
  );
}
