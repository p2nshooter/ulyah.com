"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";

interface ProviderDef {
  id: string;
  label: string;
  kind: "text" | "tts" | "gpu" | "image";
}

export function ApiKeyDonationForm({ dict }: { dict: Dictionary }) {
  const [providers, setProviders] = useState<ProviderDef[]>([]);
  const [provider, setProvider] = useState("");
  const [scope, setScope] = useState<"text" | "tts" | "gpu" | "image">("text");
  const [rawKey, setRawKey] = useState("");
  const [label, setLabel] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ message: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ providers: ProviderDef[] }>("/donate/api-key/providers")
      .then((r) => {
        setProviders(r.providers);
        if (r.providers[0]) {
          setProvider(r.providers[0].id);
          setScope(r.providers[0].kind);
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const res = await api.post<{ message: string; status: string }>("/donate/api-key", {
        provider,
        scope,
        rawKey,
        donorLabel: label || undefined,
        donorEmail: email || undefined,
        message: message || undefined,
      });
      setResult(res);
      setRawKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
      <p className="font-heading text-lg">{dict.donation.donateApiKey}</p>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{dict.donation.donateApiKeyDesc}</p>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={provider}
            onChange={(e) => {
              const p = providers.find((x) => x.id === e.target.value);
              setProvider(e.target.value);
              if (p) setScope(p.kind);
            }}
            className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          >
            <option value="text">Text / LLM</option>
            <option value="tts">TTS</option>
            <option value="gpu">GPU</option>
            <option value="image">Image / Vision</option>
          </select>
        </div>
        <input
          required
          type="password"
          value={rawKey}
          onChange={(e) => setRawKey(e.target.value)}
          placeholder={dict.donation.formKey}
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={dict.donation.formLabel}
            className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.donation.formEmail}
            className="rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={dict.donation.formMessage}
          rows={2}
          className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {result && (
          <p className={`text-xs ${result.status === "active" ? "text-success" : "text-warning"}`}>{result.message}</p>
        )}
        <button
          type="submit"
          disabled={busy || !rawKey}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-accent dark:text-primary"
        >
          {busy ? dict.donation.testingInProgress : dict.donation.formSubmit}
        </button>
      </form>
    </div>
  );
}
