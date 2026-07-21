"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

interface ProviderDef {
  id: string;
  label: string;
  kind: "text" | "tts" | "gpu" | "image";
}

interface KeyRow {
  id: number;
  provider: string;
  scope: string;
  status: string;
  quota_used: number;
  quota_limit: number | null;
  latency_ms: number | null;
  priority: number;
  donor_label: string | null;
  last_health_check: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  active: "text-success",
  slow: "text-warning",
  pending_verification: "text-warning",
  rate_limited: "text-warning",
  exhausted: "text-warning",
  revoked: "text-danger",
  rejected: "text-danger",
};

// Plain-language status meaning shown as a legend — "active" specifically
// means the smart-scaling engine (KeyPoolCoordinator) is allowed to pick
// this key for real requests right now, not merely "saved in the database".
const STATUS_LABEL_ID: Record<string, string> = {
  active: "Aktif — dipakai smart engine",
  slow: "Aktif tapi lambat — dipakai jika tak ada yang lebih cepat",
  pending_verification: "Menunggu verifikasi otomatis",
  rate_limited: "Kena limit sementara — otomatis hidup lagi",
  exhausted: "Kuota harian habis — otomatis hidup setelah reset",
  revoked: "Dicabut oleh admin",
  rejected: "Ditolak — kredensial benar-benar invalid",
};

// Three buckets so the pool is "rapih" and — per the owner's rule — the keys
// that are only rate-limited (still alive, auto-revived) are visibly SEPARATE
// from the ones that are permanently dead (invalid/revoked credentials).
type BucketId = "healthy" | "cooling" | "dead";
const BUCKETS: { id: BucketId; title: string; note: string; statuses: string[]; accent: string }[] = [
  {
    id: "healthy",
    title: "Aktif & sehat",
    note: "Dipakai smart engine untuk request nyata sekarang.",
    statuses: ["active", "slow"],
    accent: "text-success",
  },
  {
    id: "cooling",
    title: "Cooling / kena limit",
    note: "Masih hidup — otomatis dihidupkan lagi oleh sistem (cron tiap 15 menit). Bukan key mati.",
    statuses: ["rate_limited", "exhausted", "pending_verification"],
    accent: "text-warning",
  },
  {
    id: "dead",
    title: "Mati / ditolak",
    note: "Kredensial benar-benar invalid atau dicabut. Tidak bisa hidup lagi kecuali di-retest manual.",
    statuses: ["rejected", "revoked"],
    accent: "text-danger",
  },
];

function bucketOf(status: string): BucketId {
  return (BUCKETS.find((b) => b.statuses.includes(status))?.id ?? "cooling") as BucketId;
}

export function KeyPoolTab() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [providers, setProviders] = useState<ProviderDef[]>([]);
  const [form, setForm] = useState({ provider: "", scope: "text", rawKey: "", donorLabel: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ label: string; ok: boolean; detail: string }[] | null>(null);
  const [testAllBusy, setTestAllBusy] = useState(false);
  const [testAllMsg, setTestAllMsg] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<BucketId, boolean>>({ healthy: true, cooling: true, dead: false });

  function load() {
    api.get<{ keys: KeyRow[]; providers: ProviderDef[] }>("/admin/keys").then((r) => {
      setKeys(r.keys);
      setProviders(r.providers);
      if (!form.provider && r.providers[0]) setForm((f) => ({ ...f, provider: r.providers[0]!.id, scope: r.providers[0]!.kind }));
    });
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Group rows by bucket → provider(scope), computed once per keys change so
  // rendering 600 rows stays cheap and the layout reads as a tidy summary.
  const grouped = useMemo(() => {
    const out: Record<BucketId, { total: number; byProvider: Record<string, KeyRow[]> }> = {
      healthy: { total: 0, byProvider: {} },
      cooling: { total: 0, byProvider: {} },
      dead: { total: 0, byProvider: {} },
    };
    for (const k of keys) {
      const b = bucketOf(k.status);
      const label = `${k.provider} · ${k.scope}`;
      (out[b].byProvider[label] ??= []).push(k);
      out[b].total++;
    }
    return out;
  }, [keys]);

  async function addKey(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await api.post<{ test: { detail: string } }>("/admin/keys", form);
      setMessage(res.test.detail);
      setForm((f) => ({ ...f, rawKey: "", donorLabel: "" }));
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function addBulk(e: React.FormEvent) {
    e.preventDefault();
    setBulkBusy(true);
    setBulkResults(null);
    try {
      const res = await api.post<{ results: { label: string; ok: boolean; detail: string }[] }>(
        "/admin/keys/bulk",
        { text: bulkText }
      );
      setBulkResults(res.results);
      if (res.results.every((r) => r.ok)) setBulkText("");
      load();
    } catch (err) {
      setBulkResults([{ label: "", ok: false, detail: err instanceof Error ? err.message : "Failed" }]);
    } finally {
      setBulkBusy(false);
    }
  }

  async function testAll() {
    setTestAllBusy(true);
    setTestAllMsg(null);
    try {
      const res = await api.post<{ tested: number; passed: number; failed: number }>("/admin/keys/test-all");
      setTestAllMsg(`Dites ${res.tested} key — ${res.passed} lolos, ${res.failed} gagal. Yang cuma kena limit tetap hidup.`);
      load();
    } catch (err) {
      setTestAllMsg(err instanceof Error ? err.message : "Gagal menjalankan tes.");
    } finally {
      setTestAllBusy(false);
    }
  }

  async function retest(id: number) {
    await api.post(`/admin/keys/${id}/retest`);
    load();
  }

  async function revoke(id: number) {
    await api.del(`/admin/keys/${id}`);
    load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addKey} className="grid gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:grid-cols-6">
        <select value={form.provider} onChange={(e) => {
          const p = providers.find((x) => x.id === e.target.value);
          setForm((f) => ({ ...f, provider: e.target.value, scope: p?.kind ?? f.scope }));
        }} className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs">
          {providers.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select value={form.scope} onChange={(e) => setForm((f) => ({ ...f, scope: e.target.value }))} className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs">
          <option value="text">text</option>
          <option value="tts">tts</option>
          <option value="gpu">gpu</option>
          <option value="image">image</option>
        </select>
        <input value={form.donorLabel} onChange={(e) => setForm((f) => ({ ...f, donorLabel: e.target.value }))} placeholder="Kegunaan (mis. TTS suara pengumuman)" className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs" />
        <input required type="password" value={form.rawKey} onChange={(e) => setForm((f) => ({ ...f, rawKey: e.target.value }))} placeholder="API key" className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs sm:col-span-2" />
        <button disabled={busy} className="rounded bg-primary px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-accent dark:text-primary">
          {busy ? "..." : "+ Add"}
        </button>
      </form>
      {message && <p className="text-xs text-[var(--color-text-secondary)]">{message}</p>}

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <button
          onClick={() => setBulkOpen((v) => !v)}
          className="text-xs font-medium text-accent"
        >
          {bulkOpen ? "▾" : "▸"} Bulk Add — tambah banyak key sekaligus
        </button>
        {bulkOpen && (
          <form onSubmit={addBulk} className="mt-3 space-y-2">
            <p className="text-[11px] text-[var(--color-text-secondary)]">
              <b>Tempel apa adanya</b> isi file API key Anda (format WhatsApp/catatan pun boleh) — sistem otomatis
              mengenali key <code className="rounded bg-black/10 px-1">nvapi-…</code> (NVIDIA) &{" "}
              <code className="rounded bg-black/10 px-1">sk-or-…</code> (OpenRouter) beserta labelnya. Key langsung
              aktif &amp; dienkripsi (dites otomatis di latar belakang). Format baris{" "}
              <code className="rounded bg-black/10 px-1">provider,scope,label,apiKey</code> juga tetap didukung.
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"Tempel isi file key di sini…\n\nNVIDIA_KEY_MAIN\nValue: nvapi-xxxx\n\nOPENROUTER_KEY\nsk-or-v1-yyyy"}
              rows={7}
              className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 font-mono text-xs"
            />
            <button disabled={bulkBusy || !bulkText.trim()} className="rounded bg-primary px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-accent dark:text-primary">
              {bulkBusy ? "Memproses..." : "Proses semua"}
            </button>
            {bulkResults && (
              <ul className="mt-2 space-y-1 text-[11px]">
                <li className="font-medium text-[var(--color-text-primary)]">
                  {bulkResults.filter((r) => r.ok).length} key diproses dari {bulkResults.length} terdeteksi
                </li>
                {bulkResults.map((r, i) => (
                  <li key={i} className={r.ok ? "text-success" : "text-danger"}>
                    {r.ok ? "✓" : "✗"} {r.label}: {r.detail}
                  </li>
                ))}
              </ul>
            )}
          </form>
        )}
      </div>

      {/* Summary cards — one glance: berapa hidup, berapa cuma kena limit, berapa mati. */}
      <div className="grid gap-3 sm:grid-cols-3">
        {BUCKETS.map((b) => (
          <div key={b.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div className="flex items-baseline justify-between">
              <span className={`text-sm font-semibold ${b.accent}`}>{b.title}</span>
              <span className={`text-2xl font-bold ${b.accent}`}>{grouped[b.id].total}</span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-[var(--color-text-secondary)]">{b.note}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={testAll}
          disabled={testAllBusy}
          className="rounded bg-primary px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-accent dark:text-primary"
        >
          {testAllBusy ? "Menguji semua…" : "Test semua key"}
        </button>
        {testAllMsg && <span className="text-[11px] text-[var(--color-text-secondary)]">{testAllMsg}</span>}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-black/5 px-3 py-2 text-[10px] text-[var(--color-text-secondary)]">
        {Object.entries(STATUS_LABEL_ID).map(([status, label]) => (
          <span key={status}>
            <span className={STATUS_COLOR[status] ?? ""}>●</span> {status} = {label}
          </span>
        ))}
      </div>

      {/* Grouped, collapsible buckets — each provider·scope line then its keys. */}
      {BUCKETS.map((b) => {
        const g = grouped[b.id];
        const providerLines = Object.entries(g.byProvider).sort((a, z) => z[1].length - a[1].length);
        return (
          <div key={b.id} className="rounded-xl border border-[var(--color-border)]">
            <button
              onClick={() => setOpen((o) => ({ ...o, [b.id]: !o[b.id] }))}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left"
            >
              <span className={`text-sm font-semibold ${b.accent}`}>
                {open[b.id] ? "▾" : "▸"} {b.title} <span className="text-[var(--color-text-secondary)]">({g.total})</span>
              </span>
              <span className="flex flex-wrap justify-end gap-1">
                {providerLines.slice(0, 5).map(([label, rows]) => (
                  <span key={label} className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] text-[var(--color-text-secondary)]">
                    {label.split(" · ")[0]} {rows.length}
                  </span>
                ))}
              </span>
            </button>
            {open[b.id] && (
              <div className="overflow-x-auto border-t border-[var(--color-border)]">
                {g.total === 0 ? (
                  <p className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">Tidak ada key di grup ini.</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <tbody>
                      {providerLines.map(([label, rows]) => (
                        <ProviderGroup
                          key={label}
                          label={label}
                          rows={rows}
                          onRetest={retest}
                          onRevoke={revoke}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// A provider·scope subgroup — shows the aggregate count as a header row and,
// when expanded, each individual key with retest/revoke. Keeps the 600-key
// pool navigable instead of one giant flat list.
function ProviderGroup({
  label,
  rows,
  onRetest,
  onRevoke,
}: {
  label: string;
  rows: KeyRow[];
  onRetest: (id: number) => void;
  onRevoke: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <tr className="border-t border-[var(--color-border)] bg-black/[0.03]">
        <td colSpan={5} className="px-3 py-1.5">
          <button onClick={() => setExpanded((v) => !v)} className="font-medium text-accent">
            {expanded ? "▾" : "▸"} {label} <span className="text-[var(--color-text-secondary)]">· {rows.length} key</span>
          </button>
        </td>
      </tr>
      {expanded &&
        rows.map((k) => (
          <tr key={k.id} className="border-t border-[var(--color-border)]">
            <td className="px-3 py-2 text-[var(--color-text-secondary)]">#{k.id}</td>
            <td className={`px-3 py-2 ${STATUS_COLOR[k.status] ?? ""}`} title={STATUS_LABEL_ID[k.status] ?? k.status}>
              {k.status}
            </td>
            <td className="px-3 py-2">{k.latency_ms ? `${k.latency_ms}ms` : "—"}</td>
            <td className="px-3 py-2">{k.donor_label ?? "—"}</td>
            <td className="px-3 py-2 text-right">
              <button onClick={() => onRetest(k.id)} className="mr-2 text-accent">retest</button>
              <button onClick={() => onRevoke(k.id)} className="text-danger">revoke</button>
            </td>
          </tr>
        ))}
    </>
  );
}
