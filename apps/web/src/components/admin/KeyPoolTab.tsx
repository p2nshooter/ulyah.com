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

export function KeyPoolTab() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [providers, setProviders] = useState<ProviderDef[]>([]);
  const [form, setForm] = useState({ provider: "", scope: "text", rawKey: "", donorLabel: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      <form onSubmit={addKey} className="grid gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:grid-cols-5">
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
        <input required type="password" value={form.rawKey} onChange={(e) => setForm((f) => ({ ...f, rawKey: e.target.value }))} placeholder="API key" className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1.5 text-xs sm:col-span-2" />
        <button disabled={busy} className="rounded bg-primary px-3 py-1.5 text-xs text-white disabled:opacity-50 dark:bg-accent dark:text-primary">
          {busy ? "..." : "+ Add"}
        </button>
      </form>
      {message && <p className="text-xs text-[var(--color-text-secondary)]">{message}</p>}

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-black/5 text-[var(--color-text-secondary)]">
            <tr>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Latency</th>
              <th className="px-3 py-2">Donor</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-2">{k.provider} <span className="text-[var(--color-text-secondary)]">({k.scope})</span></td>
                <td className={`px-3 py-2 ${STATUS_COLOR[k.status] ?? ""}`}>{k.status}</td>
                <td className="px-3 py-2">{k.latency_ms ? `${k.latency_ms}ms` : "—"}</td>
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
