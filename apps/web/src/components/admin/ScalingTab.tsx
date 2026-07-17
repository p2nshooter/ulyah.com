"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ScalingData {
  contentCoverage: { total_ayah: number; ayah_with_story: number; tafsir_count: number; tafsir_gap: number };
  keyPoolLoad: { provider: string; scope: string; status: string; n: number; avg_latency: number | null }[];
  queueDepth: { status: string; n: number }[];
}

interface Settings {
  autoThrottleEnabled: boolean;
  monthlyBudgetUsd: number;
  preferFreeProviders: boolean;
  targetJobsPerTick: number;
  cfWorkerAiEnabled?: boolean;
}

export function ScalingTab() {
  const [data, setData] = useState<ScalingData | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<ScalingData>("/admin/scaling").then(setData);
    api.get<{ settings: Settings }>("/admin/scaling/settings").then((r) => setSettings(r.settings));
  }, []);

  async function save() {
    if (!settings) return;
    await api.post("/admin/scaling/settings", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const coveragePct = data ? Math.round((data.contentCoverage.ayah_with_story / Math.max(1, data.contentCoverage.total_ayah)) * 100) : 0;

  return (
    <div className="space-y-6">
      {data && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-sm font-medium">Content coverage (kisah per ayat)</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div className="h-full bg-accent" style={{ width: `${coveragePct}%` }} />
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {data.contentCoverage.ayah_with_story} / {data.contentCoverage.total_ayah} ayat ({coveragePct}%) — tafsir gap: {data.contentCoverage.tafsir_gap}
          </p>
        </div>
      )}

      {data && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <p className="text-sm font-medium">Key pool load</p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
              {data.keyPoolLoad.map((r, i) => (
                <li key={i}>{r.provider} ({r.scope}) — {r.status}: {r.n} key(s){r.avg_latency ? `, ${Math.round(r.avg_latency)}ms avg` : ""}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <p className="text-sm font-medium">Generation queue</p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
              {data.queueDepth.map((r, i) => (
                <li key={i}>{r.status}: {r.n}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {settings && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <p className="text-sm font-medium">Smart scaling settings</p>
          <div className="mt-3 space-y-3 text-xs">
            <label className="flex items-center justify-between">
              Auto-throttle when budget is tight
              <input type="checkbox" checked={settings.autoThrottleEnabled} onChange={(e) => setSettings({ ...settings, autoThrottleEnabled: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between">
              Prefer free providers first
              <input type="checkbox" checked={settings.preferFreeProviders} onChange={(e) => setSettings({ ...settings, preferFreeProviders: e.target.checked })} />
            </label>
            <label className="flex items-center justify-between">
              Monthly budget ceiling (USD)
              <input type="number" min={0} value={settings.monthlyBudgetUsd} onChange={(e) => setSettings({ ...settings, monthlyBudgetUsd: Number(e.target.value) })} className="w-24 rounded border border-[var(--color-border)] bg-transparent px-2 py-1" />
            </label>
            <label className="flex items-center justify-between">
              Target new jobs per scaling tick
              <input type="number" min={0} max={50} value={settings.targetJobsPerTick} onChange={(e) => setSettings({ ...settings, targetJobsPerTick: Number(e.target.value) })} className="w-24 rounded border border-[var(--color-border)] bg-transparent px-2 py-1" />
            </label>
          </div>

          {/* Paid fallback — off by default. Donated NVIDIA/OpenRouter keys +
              the free browser voice are used first; this only turns on the
              billable Cloudflare Workers AI when the owner opts in. */}
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="font-medium">☁️ Cloudflare Worker AI (berbayar)</span>
                <span className="mt-0.5 block text-[11px] text-[var(--color-text-secondary)]">
                  Default OFF. Nyalakan hanya jika ingin memakai AI berbayar Cloudflare sebagai cadangan terakhir —
                  key NVIDIA/OpenRouter gratis & suara browser dipakai lebih dulu.
                </span>
              </span>
              <input
                type="checkbox"
                checked={settings.cfWorkerAiEnabled ?? false}
                onChange={(e) => setSettings({ ...settings, cfWorkerAiEnabled: e.target.checked })}
              />
            </label>
          </div>
          <button onClick={save} className="mt-3 rounded bg-primary px-3 py-1.5 text-xs text-white dark:bg-accent dark:text-primary">
            {saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
