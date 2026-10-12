"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";
import { PRESENCE_HEARTBEAT_MS, PRESENCE_ONLINE_WINDOW_S } from "@ulyah/shared/presence";

/**
 * Real-time presence bar — how many devices are on each ecosystem site RIGHT
 * NOW, and how many just left ("closed"). Fed by the presence heartbeat
 * (/analytics/ping, every PRESENCE_HEARTBEAT_MS) with a PRESENCE_ONLINE_WINDOW_S
 * "online" window (packages/shared/src/presence.ts). REAL devices, not page
 * views.
 *
 * Polled every 15s, and not at all while this tab is hidden: the query is
 * cheap (an indexed range over a table pruned to ten minutes), but every poll
 * is a Worker request, and the account's free plan has 100,000 of those a day
 * for every site together. A 2s poll was 43,200 a day from one open tab.
 */
interface LiveRow {
  tenant: string;
  online: number;
  /** SUBSET of `online`: devices with the Qur'an playing. A listener who has
   *  switched to another app is still one person online, counted once here. */
  listening?: number;
  closed: number;
}
const META: Record<string, { name: string; icon: string }> = {
  ulyah: { name: "ulyah.com", icon: "🕌" },
  "1fr": { name: "1fr.fr", icon: "🇫🇷" },
  tilawa: { name: "tilawa.de", icon: "🇩🇪" },
  xad: { name: "xad.es", icon: "🌌" },
};
const POLL_MS = 15_000;

export function LivePresenceBar() {
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [at, setAt] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.visibilityState === "hidden") return;
      return api
        .get<{ tenants: LiveRow[]; at: number }>("/admin/live-presence")
        .then((r) => {
          if (!alive) return;
          setRows(r.tenants ?? []);
          setAt(Date.now());
          setFailed(false);
        })
        .catch(() => alive && setFailed(true));
    };
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

  // ulyah admin sees the WHOLE ecosystem (always every site, even at 0, so
  // the total is unambiguous); a sibling admin sees only its own site.
  const ECOSYSTEM = ["ulyah", "1fr", "tilawa", "xad"];
  const scope = TENANT.id === "ulyah" ? ECOSYSTEM : [TENANT.id];
  const byTenant = new Map(rows.map((r) => [r.tenant, r]));
  const cards: LiveRow[] = scope.map((t) => byTenant.get(t) ?? { tenant: t, online: 0, listening: 0, closed: 0 });
  const onlineTotal = cards.reduce((s, r) => s + r.online, 0);
  const closedTotal = cards.reduce((s, r) => s + r.closed, 0);
  const listeningTotal = cards.reduce((s, r) => s + (r.listening ?? 0), 0);
  const secondsAgo = at ? Math.max(0, Math.round((nowTick - at) / 1000)) : null;

  return (
    <section className="rounded-xl border border-emerald-500/25 bg-emerald-500/4 p-4">
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
        <span className="text-[10px] font-normal text-text-secondary">
          diperbarui {secondsAgo === null ? "…" : `${secondsAgo} dtk lalu`} · auto tiap {POLL_MS / 1000} dtk
        </span>
      </p>

      <div className="flex flex-wrap gap-4 text-sm">
        <span>
          🟢 Online sekarang: <b className="text-lg text-emerald-500">{onlineTotal}</b> perangkat
        </span>
        <span>
          🎧 Sedang mendengarkan: <b className="text-lg text-sky-500">{listeningTotal}</b> perangkat
        </span>
        <span>
          🚪 Baru menutup (closed): <b className="text-lg text-accent">{closedTotal}</b> perangkat
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 desktop:grid-cols-5">
        {cards.map((r) => {
          const m = META[r.tenant] ?? { name: r.tenant, icon: "🌍" };
          return (
            <div key={r.tenant} className="rounded-lg border border-(--color-border) bg-(--color-card) px-3 py-2">
              <p className="truncate text-[11px] text-text-secondary">
                {m.icon} {m.name}
              </p>
              <p className="mt-0.5 text-sm">
                <span className={`font-heading ${r.online > 0 ? "text-emerald-500" : "text-text-secondary"}`}>{r.online}</span>
                <span className="text-[10px] text-text-secondary"> online</span>
                {(r.listening ?? 0) > 0 && (
                  <span className="ml-2 text-[10px] text-sky-500">· {r.listening} 🎧</span>
                )}
                {r.closed > 0 && (
                  <span className="ml-2 text-[10px] text-text-secondary">· {r.closed} baru keluar</span>
                )}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-text-secondary">
        Perangkat NYATA (bukan page view), dari heartbeat tiap {PRESENCE_HEARTBEAT_MS / 1000} detik. &quot;Online&quot; = aktif
        ≤{PRESENCE_ONLINE_WINDOW_S} detik terakhir; &quot;closed&quot; = sempat aktif lalu menutup/pindah tab dalam 2 menit terakhir.
        🎧 = bagian dari &quot;online&quot; yang sedang memutar Qur&apos;an. Pendengar TETAP terhitung online walau pindah ke
        aplikasi lain atau layar dimatikan, selama browsernya masih terbuka dan audionya jalan — detaknya menumpang jam
        audio, yang tidak ikut dibekukan HP seperti timer biasa. Yang menutup tab langsung hilang (sinyal &quot;leave&quot;).
      </p>
    </section>
  );
}
