"use client";

import { useEffect, useState } from "react";
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
  exhausted: "text-danger",
  revoked: "text-danger",
  rejected: "text-danger",
};

// Plain-language status meaning shown as a legend — "active" specifically
// means the smart-scaling engine (KeyPoolCoordinator) is allowed to pick
// this key for real requests right now, not merely "saved in the database".
const STATUS_LABEL_ID: Record<string, string> = {
  active: "Aktif — dipakai smart engine",
  slow: "Aktif tapi lambat — dipakai jika tak ada yang lebih cepat",
  pending_verification: "Menunggu verifikasi manual",
  rate_limited: "Kuota habis sementara — dicoba lagi nanti",
  exhausted: "Kuota habis",
  revoked: "Dicabut oleh admin",
  rejected: "Ditolak — key tidak valid saat diuji",
};

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

  function load() {
    api.get<{ keys: KeyRow[]; providers: ProviderDef[] }>("/admin/keys").then((r) => {
      setKeys(r.keys);
      setProviders(r.providers);
      if (!form.provider && r.providers[0]) setForm((f) => ({ ...f, provider: r.providers[0]!.id, scope: r.providers[0]!.kind }));
    });
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

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

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-black/5 px-3 py-2 text-[10px] text-[var(--color-text-secondary)]">
        {Object.entries(STATUS_LABEL_ID).map(([status, label]) => (
          <span key={status}>
            <span className={STATUS_COLOR[status] ?? ""}>●</span> {status} = {label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/5 text-[var(--color-text-secondary)]">
            <tr>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Latency</th>
              <th className="px-3 py-2">Kuota</th>
              <th className="px-3 py-2">Kegunaan</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-2">{k.provider} <span className="text-[var(--color-text-secondary)]">({k.scope})</span></td>
                <td className={`px-3 py-2 ${STATUS_COLOR[k.status] ?? ""}`} title={STATUS_LABEL_ID[k.status] ?? k.status}>
                  {k.status}
                </td>
                <td className="px-3 py-2">{k.latency_ms ? `${k.latency_ms}ms` : "—"}</td>
                <td className="px-3 py-2 tabular-nums">
                  {k.quota_limit ? `${k.quota_used.toLocaleString("id")}/${k.quota_limit.toLocaleString("id")}` : k.quota_used > 0 ? `${k.quota_used.toLocaleString("id")} (tanpa batas)` : "—"}
                </td>
                <td className="px-3 py-2">{k.donor_label ?? "—"}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => retest(k.id)} className="mr-2 text-accent">retest</button>
                  <button onClick={() => revoke(k.id)} className="text-danger">revoke</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
