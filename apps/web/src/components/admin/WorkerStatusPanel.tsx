"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface WorkerRow {
  key: string;
  label: string;
  lastRunAt: string;
  ok: boolean;
  detail: string;
  durationMs: number;
  isLive: boolean;
}

function relativeTime(iso: string): string {
  if (!iso) return "belum pernah";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))} detik lalu`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} menit lalu`;
  return `${Math.round(ms / 3_600_000)} jam lalu`;
}

/**
 * A live status bar per background worker — separate from the single
 * combined "engine on/off" toggle elsewhere in the portal. Each row reads
 * straight from that worker's own heartbeat (written every scheduled() tick,
 * see lib/worker-heartbeat.ts), so a worker that's actually still ticking
 * shows a pulsing green dot, and one that's gone quiet (crashed, or the cron
 * itself stopped firing) goes gray/red on its own — no single kill switch can
 * hide a problem in just one of them.
 */
export function WorkerStatusPanel() {
  const [workers, setWorkers] = useState<WorkerRow[] | null>(null);
  const [err, setErr] = useState(false);

  function load() {
    api
      .get<{ workers: WorkerRow[] }>("/admin/worker-status")
      .then((d) => setWorkers(d.workers))
      .catch(() => setErr(true));
  }

  useEffect(() => {
    load();
    // Polls rather than opening a socket — the cron ticks once a minute, so
    // refreshing every 30s is plenty to feel live without hammering the API.
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-sm">🟢 Status Worker Langsung (tiap worker terpisah)</p>
      <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
        Titik hijau berkedip = worker ini benar-benar baru saja jalan (cron tiap 1 menit). Abu-abu/merah = sudah lama
        tidak lapor — cek log.
      </p>
      {err && <p className="mt-2 text-xs text-danger">Gagal memuat status worker.</p>}
      {workers && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {workers.map((w) => (
            <div
              key={w.key}
              className={`rounded-lg border p-3 ${
                w.isLive
                  ? "border-success/30 bg-success/5"
                  : w.lastRunAt
                    ? "border-warning/30 bg-warning/5"
                    : "border-[var(--color-border)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium">{w.label}</p>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      w.isLive ? "animate-pulse bg-success" : w.ok === false && w.lastRunAt ? "bg-danger" : "bg-[var(--color-text-secondary)]/40"
                    }`}
                  />
                  <span className="text-[10px] text-[var(--color-text-secondary)]">
                    {w.isLive ? "berjalan" : "diam"}
                  </span>
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[var(--color-text-secondary)]">
                {relativeTime(w.lastRunAt)}
                {w.lastRunAt && ` · ${w.durationMs}ms`}
              </p>
              {w.detail && <p className="mt-0.5 truncate text-[10px] text-[var(--color-text-secondary)]/70">{w.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
