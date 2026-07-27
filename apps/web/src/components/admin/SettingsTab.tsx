"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SettingStatus {
  key: string;
  label: string;
  secret: boolean;
  /** Which heading this credential sits under. The Worker decides the set —
   *  a group with nothing in it simply does not render, which is how the
   *  AliExpress block stays out of sight until its keys are issued. */
  group: "payment" | "affiliate";
  source: "database" | "env" | "unset";
  preview: string | null;
}

// Order of the panels, and the words above each. Affiliate sits AFTER payment
// because payment is what someone opening this page is usually here to fix.
const GROUPS: { id: SettingStatus["group"]; title: string; blurb: string }[] = [
  {
    id: "payment",
    title: "Pembayaran & donasi",
    blurb: "Kredensial PayPal dan NOWPayments yang dipakai halaman donasi.",
  },
  {
    id: "affiliate",
    title: "Afiliasi AliExpress",
    blurb:
      "App Key, App Secret dan Tracking ID dari AliExpress Open Platform. Ketiganya disimpan terenkripsi, termasuk Tracking ID.",
  },
];

const SOURCE_LABEL: Record<SettingStatus["source"], string> = {
  database: "Tersimpan (terenkripsi)",
  env: "Dari GitHub Secret",
  unset: "Belum diatur",
};
const SOURCE_COLOR: Record<SettingStatus["source"], string> = {
  database: "text-accent",
  env: "text-[var(--color-text-secondary)]",
  unset: "text-danger",
};

export function SettingsTab() {
  const [settings, setSettings] = useState<SettingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    setLoading(true);
    api
      .get<{ settings: SettingStatus[] }>("/admin/settings")
      .then((r) => setSettings(r.settings))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function save(key: string) {
    const value = drafts[key]?.trim();
    if (!value) return;
    setBusyKey(key);
    setMessage(null);
    try {
      await api.put(`/admin/settings/${key}`, { value });
      setDrafts((d) => ({ ...d, [key]: "" }));
      setMessage(`${key} disimpan (terenkripsi).`);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusyKey(null);
    }
  }

  async function revert(key: string) {
    setBusyKey(key);
    setMessage(null);
    try {
      await api.del(`/admin/settings/${key}`);
      setMessage(`${key} dikembalikan ke GitHub Secret.`);
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal");
    } finally {
      setBusyKey(null);
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-text-secondary)]">Memuat…</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--color-text-secondary)]">
        Kredensial di sini disimpan terenkripsi (AES-256-GCM) di database, bukan teks polos. Mengisi nilai di sini
        langsung menggantikan GitHub Secret dengan nama yang sama — tanpa perlu deploy ulang.
      </p>
      {message && <p className="text-xs text-accent">{message}</p>}

      {GROUPS.map((g) => {
        const rows = settings.filter((s) => s.group === g.id);
        // An empty group renders nothing at all — no heading, no empty box.
        if (rows.length === 0) return null;
        return (
          <section key={g.id} className="space-y-2">
            <div className="pt-2">
              <h3 className="text-sm font-semibold">{g.title}</h3>
              <p className="text-[11px] text-[var(--color-text-secondary)]">{g.blurb}</p>
            </div>
            {rows.map((s) => (
          <div key={s.key} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-[11px] text-[var(--color-text-secondary)]">{s.key}</p>
              </div>
              <span className={`text-[11px] font-medium ${SOURCE_COLOR[s.source]}`}>{SOURCE_LABEL[s.source]}</span>
            </div>
            {s.preview && (
              <p className="mt-2 rounded bg-black/5 px-2 py-1 font-mono text-xs dark:bg-white/5">{s.preview}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                type={s.secret ? "password" : "text"}
                placeholder={`Nilai baru untuk ${s.key}`}
                value={drafts[s.key] ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                className="min-w-0 flex-1 rounded border border-[var(--color-border)] bg-transparent px-3 py-1.5 text-xs"
              />
              <button
                disabled={busyKey === s.key || !drafts[s.key]?.trim()}
                onClick={() => save(s.key)}
                className="rounded bg-primary px-3 py-1.5 text-xs text-white disabled:opacity-40 dark:bg-accent dark:text-primary"
              >
                Simpan
              </button>
              {s.source === "database" && (
                <button
                  disabled={busyKey === s.key}
                  onClick={() => revert(s.key)}
                  className="rounded border border-[var(--color-border)] px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Kembalikan ke env
                </button>
              )}
            </div>
          </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
