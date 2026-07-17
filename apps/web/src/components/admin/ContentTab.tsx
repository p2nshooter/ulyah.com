"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ReviewItem {
  id: number;
  title: string;
  body: string;
  confidence_score: number | null;
  ai_generated: number;
  created_at: string;
}

interface EngineStatus {
  engineEnabled: boolean;
  compiledArticles: number;
  aiArticles: number;
  recent: { title: string; lang: string; created_at: string }[];
}

function EnginePanel() {
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api.get<EngineStatus>("/admin/engine/status").then(setStatus).catch(() => {});
  }
  useEffect(load, []);

  async function toggle() {
    if (!status) return;
    setBusy(true);
    try {
      await api.post("/admin/engine/toggle", { enabled: !status.engineEnabled });
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-accent/40 bg-[var(--color-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-heading text-base">⚙️ Auto Content Engine</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Compiles sourced Tadabbur articles from the DB every 15 min — runs with or without AI keys, and only
            stops here.
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={busy || !status}
          className={`rounded-full px-4 py-2 text-xs font-medium text-white disabled:opacity-60 ${
            status?.engineEnabled ? "bg-danger" : "bg-success"
          }`}
        >
          {status?.engineEnabled ? "⏸ Stop engine" : "▶ Start engine"}
        </button>
      </div>
      {status && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs">
          <span>
            Status:{" "}
            <span className={status.engineEnabled ? "text-success" : "text-danger"}>
              {status.engineEnabled ? "running" : "stopped"}
            </span>
          </span>
          <span>Compiled (no-AI): <b>{status.compiledArticles}</b></span>
          <span>AI articles: <b>{status.aiArticles}</b></span>
        </div>
      )}
      {status && status.recent.length > 0 && (
        <ul className="mt-2 space-y-1 text-[11px] text-[var(--color-text-secondary)]">
          {status.recent.map((r, i) => (
            <li key={i}>
              · {r.title} <span className="uppercase">[{r.lang}]</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface LibraryStats {
  kitab: { total: number; byCategory: { slug: string; name_id: string; name_ar: string; n: number }[] };
  installs: { total: number; byApp: { app: string; n: number }[]; daily: { bucket: string; app: string; n: number }[] };
}

function LibraryStatsPanel() {
  const [stats, setStats] = useState<LibraryStats | null>(null);

  useEffect(() => {
    api.get<LibraryStats>("/admin/library-stats").then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  const mainInstalls = stats.installs.byApp.find((a) => a.app === "main")?.n ?? 0;
  const sholatInstalls = stats.installs.byApp.find((a) => a.app === "sholat")?.n ?? 0;
  const radioInstalls = stats.installs.byApp.find((a) => a.app === "radio")?.n ?? 0;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-base">📚 Perpustakaan Kitab & Pemasangan Aplikasi</p>

      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <span>Total kitab: <b>{stats.kitab.total.toLocaleString("id")}</b></span>
        <span>Total install: <b>{stats.installs.total.toLocaleString("id")}</b></span>
        <span>App ULYAH.COM: <b>{mainInstalls.toLocaleString("id")}</b></span>
        <span>App Jadwal Sholat: <b>{sholatInstalls.toLocaleString("id")}</b></span>
        <span>App Radio Qur'an: <b>{radioInstalls.toLocaleString("id")}</b></span>
      </div>

      <p className="mt-4 text-xs font-semibold text-[var(--color-text-secondary)]">Kitab per kategori</p>
      <div className="mt-2 max-h-64 overflow-y-auto">
        <table className="w-full text-left text-[11px]">
          <tbody>
            {stats.kitab.byCategory.map((c) => (
              <tr key={c.slug} className="border-t border-[var(--color-border)]">
                <td className="py-1 pr-2">{c.name_id}</td>
                <td className="py-1 text-right font-medium">{c.n.toLocaleString("id")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ContentTab() {
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [scheduleCount, setScheduleCount] = useState(5);

  function load() {
    api.get<{ queue: ReviewItem[] }>("/admin/content/review-queue").then((r) => setQueue(r.queue));
  }
  useEffect(load, []);

  async function approve(id: number) {
    await api.post(`/admin/content/approve/${id}`);
    load();
  }
  async function reject(id: number) {
    await api.post(`/admin/content/reject/${id}`);
    load();
  }
  async function scheduleBatch() {
    await api.post("/admin/content/schedule-batch", { count: scheduleCount });
    load();
  }

  return (
    <div className="space-y-4">
      <EnginePanel />
      <LibraryStatsPanel />
      <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <input
          type="number"
          min={1}
          max={50}
          value={scheduleCount}
          onChange={(e) => setScheduleCount(Number(e.target.value))}
          className="w-20 rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs"
        />
        <button onClick={scheduleBatch} className="rounded bg-primary px-3 py-1.5 text-xs text-white dark:bg-accent dark:text-primary">
          Schedule new kisah drafts
        </button>
        <span className="text-xs text-[var(--color-text-secondary)]">Zero-hand pipeline picks ayat without a story yet, queues generation_jobs.</span>
      </div>

      {queue.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">No content pending review.</p>}
      {queue.map((item) => (
        <div key={item.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-base">{item.title}</p>
            <span className="text-xs text-[var(--color-text-secondary)]">confidence: {item.confidence_score ?? "—"}</span>
          </div>
          <p className="mt-2 max-h-32 overflow-y-auto text-xs text-[var(--color-text-secondary)]">{item.body}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => approve(item.id)} className="rounded bg-success px-3 py-1 text-xs text-white">Approve</button>
            <button onClick={() => reject(item.id)} className="rounded bg-danger px-3 py-1 text-xs text-white">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
