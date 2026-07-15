"use client";

/**
 * "Orchestra Core" admin panel — a REAL operations dashboard, not a vision
 * board. Every section here reads live data straight from running code
 * (the capability→provider registry in worker-api/lib/orchestra.ts, the
 * actual key pool, the actual worker registry, the actual source database).
 * Nothing here is a hand-typed "planned" placeholder row — if a capability or
 * worker isn't wired up in code, it simply doesn't appear.
 */

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface HealthRow {
  provider: string;
  scope: string;
  status: string;
  keys: number;
  avg_latency_ms: number | null;
  quota_used: number | null;
}
interface ProviderStep {
  provider: string;
  scope: string;
  model?: string;
}
interface WorkerDef {
  name: string;
  label: string;
  capability: string;
  desc: string;
  inputs: string[];
}

function statusCls(s: string) {
  return s === "active"
    ? "text-success"
    : s === "rate_limited"
      ? "text-danger"
      : s === "slow"
        ? "text-warning"
        : "text-[var(--color-text-secondary)]";
}

function LiveHealth({ registry }: { registry: Record<string, ProviderStep[]> | null }) {
  const [rows, setRows] = useState<HealthRow[] | null>(null);
  const [err, setErr] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSummary, setTestSummary] = useState<string | null>(null);

  function loadHealth() {
    api
      .get<{ health: HealthRow[] }>("/ai/orchestra/health")
      .then((d) => setRows(d.health))
      .catch(() => setErr(true));
  }
  useEffect(loadHealth, []);

  async function testAll() {
    setTesting(true);
    setTestSummary(null);
    try {
      const r = await api.post<{ tested: number; passed: number; failed: number; byProvider: Record<string, { ok: number; fail: number }> }>(
        "/admin/keys/test-all",
        {}
      );
      const perProv = Object.entries(r.byProvider)
        .map(([p, v]) => `${p}: ${v.ok}✓${v.fail ? ` ${v.fail}✗` : ""}`)
        .join(" · ");
      setTestSummary(`${r.passed}/${r.tested} key aktif${r.failed ? `, ${r.failed} gagal` : ""}. ${perProv}`);
      loadHealth();
    } catch (e) {
      setTestSummary(e instanceof Error ? e.message : "Gagal menguji key");
    } finally {
      setTesting(false);
    }
  }

  const activeProviders = new Set((rows ?? []).filter((r) => r.status === "active").map((r) => r.provider));
  const totalKeys = (rows ?? []).reduce((n, r) => n + r.keys, 0);

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-sm">📡 Key Pool — status langsung</p>
        <button
          onClick={testAll}
          disabled={testing}
          className="rounded-full border border-accent/50 bg-accent/10 px-3 py-1.5 text-[11px] font-medium text-accent disabled:opacity-50"
        >
          {testing ? "Menguji semua key…" : "🔁 Test semua key"}
        </button>
      </div>
      {testSummary && <p className="mt-2 rounded-lg bg-black/5 p-2 text-[11px] text-[var(--color-text-secondary)]">{testSummary}</p>}
      {err && <p className="mt-2 text-xs text-danger">Gagal memuat status (butuh login admin).</p>}
      {!err && rows === null && <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Memuat…</p>}
      {rows !== null && rows.length === 0 && (
        <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
          Belum ada API key di pool. Tambahkan di tab Key Pool — setiap capability di bawah akan langsung memakainya.
        </p>
      )}
      {rows !== null && rows.length > 0 && (
        <>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent">{totalKeys} key total</span>
            <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-success">{activeProviders.size} provider aktif</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-[11px]">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-secondary)]">
                  <th className="px-2 py-1 font-medium">Provider</th>
                  <th className="px-2 py-1 font-medium">Scope</th>
                  <th className="px-2 py-1 font-medium">Status</th>
                  <th className="px-2 py-1 text-right font-medium">Key</th>
                  <th className="px-2 py-1 text-right font-medium">Latency</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-2 py-1">{r.provider}</td>
                    <td className="px-2 py-1 text-[var(--color-text-secondary)]">{r.scope}</td>
                    <td className={`px-2 py-1 font-medium ${statusCls(r.status)}`}>{r.status}</td>
                    <td className="px-2 py-1 text-right tabular-nums">{r.keys}</td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {r.avg_latency_ms != null ? `${Math.round(r.avg_latency_ms)}ms` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Capability chains — read straight from the code's own registry, so
          this table can never drift out of sync with what actually runs. A
          provider row is greyed out when it has no active key right now. */}
      {registry && (
        <div className="mt-5">
          <p className="text-xs font-medium text-primary dark:text-accent">🔗 Rantai Failover per Capability</p>
          <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]">
            Urutan provider yang benar-benar dicoba worker-api/lib/orchestra.ts, dari kode langsung — bukan rencana.
          </p>
          <div className="mt-2 space-y-1.5">
            {Object.entries(registry).map(([cap, steps]) => (
              <div key={cap} className="flex flex-wrap items-center gap-1.5 rounded-lg bg-black/5 px-2.5 py-1.5 text-[11px]">
                <span className="shrink-0 font-medium">{cap}</span>
                <span className="text-[var(--color-text-secondary)]">→</span>
                {steps.map((s, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className={`rounded px-1.5 py-0.5 ${activeProviders.has(s.provider) ? "bg-success/15 text-success" : "text-[var(--color-text-secondary)]/60"}`}>
                      {s.provider}
                    </span>
                    {i < steps.length - 1 && <span className="text-[var(--color-text-secondary)]/40">›</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function WorkerRegistry() {
  const [workers, setWorkers] = useState<WorkerDef[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    api
      .get<{ workers: WorkerDef[] }>("/ai/orchestra/workers")
      .then((d) => setWorkers(d.workers))
      .catch(() => setErr(true));
  }, []);

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-sm">🧩 Worker Terpasang (kode nyata, satu worker = satu tugas)</p>
      {err && <p className="mt-2 text-xs text-danger">Gagal memuat (butuh login admin).</p>}
      {!err && workers === null && <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Memuat…</p>}
      {workers !== null && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full min-w-[520px] text-xs">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-black/5">
                <th className="px-3 py-2 text-left font-medium">Worker</th>
                <th className="px-3 py-2 text-left font-medium">Tugas</th>
                <th className="px-3 py-2 text-left font-medium">Capability</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.name} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 py-2 font-medium">{w.label}</td>
                  <td className="px-3 py-2 text-[var(--color-text-secondary)]">{w.desc}</td>
                  <td className="px-3 py-2"><code className="rounded bg-black/10 px-1.5 py-0.5">{w.capability}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function SourceRegistry() {
  const [data, setData] = useState<{
    total: number;
    byStatus: { status: string; n: number }[];
    byCategory: { category: string; total: number; done: number }[];
  } | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    api
      .get<{ total: number; byStatus: { status: string; n: number }[]; byCategory: { category: string; total: number; done: number }[] }>(
        "/admin/oss-sources"
      )
      .then(setData)
      .catch(() => setErr(true));
  }, []);

  const label: Record<string, string> = { absorbed: "✅ Diserap", partial: "🟡 Sebagian", pending: "⬜ Menunggu", skip: "🚫 Dilewati" };

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="font-heading text-sm">📦 Source Registry — status serapan sumber terbuka</p>
      {err && <p className="mt-2 text-xs text-danger">Gagal memuat (butuh login admin).</p>}
      {data && (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent">
              Total: {data.total} sumber
            </span>
            {data.byStatus.map((s) => (
              <span key={s.status} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[11px]">
                {label[s.status] ?? s.status}: {s.n}
              </span>
            ))}
          </div>
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {data.byCategory.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between rounded-lg bg-black/5 px-3 py-1.5 text-[11px]">
                <span>{cat.category}</span>
                <span className="tabular-nums text-[var(--color-text-secondary)]">
                  {cat.done}/{cat.total}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function OrchestraTab() {
  const [registry, setRegistry] = useState<Record<string, ProviderStep[]> | null>(null);
  useEffect(() => {
    api
      .get<{ registry: Record<string, ProviderStep[]> }>("/ai/orchestra/health")
      .then((d) => setRegistry(d.registry))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent/40 bg-[var(--color-card)] p-4">
        <p className="font-heading text-lg">🎻 Orchestra Core</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Router AI yang benar-benar berjalan: setiap permintaan dijalankan lewat rantai provider (Gemini → Groq →
          NVIDIA → OpenRouter → HuggingFace, tergantung capability), Anthropic tidak pernah jadi satu-satunya jalan.
          Semua tabel di bawah dibaca langsung dari database key pool dan dari kode worker-api — bukan rencana yang
          ditulis tangan.
        </p>
      </div>

      <LiveHealth registry={registry} />
      <WorkerRegistry />
      <SourceRegistry />
    </div>
  );
}
