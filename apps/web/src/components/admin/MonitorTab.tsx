"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Feature {
  key: string;
  label: string;
  route: string;
  status: "ok" | "warn" | "error";
  count: number;
  note: string;
}

const STATUS: Record<string, { dot: string; text: string; label: string }> = {
  ok: { dot: "bg-success", text: "text-success", label: "OK" },
  warn: { dot: "bg-warning", text: "text-warning", label: "Perlu isi" },
  error: { dot: "bg-danger", text: "text-danger", label: "Error" },
};

/**
 * "Monitor" — one board showing the live health of every menu/feature on the
 * site: green when it has content, amber when it's empty / needs an action,
 * red when its query failed. Refreshes on demand so the owner can watch all
 * menus at once instead of clicking through each page.
 */
export function MonitorTab({ locale }: { locale: string }) {
  const [features, setFeatures] = useState<Feature[] | null>(null);
  const [checkedAt, setCheckedAt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const r = await api.get<{ features: Feature[]; checkedAt: string }>("/admin/health");
      setFeatures(r.features);
      setCheckedAt(r.checkedAt);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const okCount = features?.filter((f) => f.status === "ok").length ?? 0;
  const warnCount = features?.filter((f) => f.status === "warn").length ?? 0;
  const errCount = features?.filter((f) => f.status === "error").length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <div>
          <p className="font-heading text-lg">🖥️ Monitor Semua Menu</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            Status setiap fitur/menu situs dalam satu layar.
            {checkedAt ? ` Dicek: ${new Date(checkedAt).toLocaleString("id-ID")}` : ""}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary disabled:opacity-50"
        >
          {loading ? "Mengecek…" : "🔄 Cek ulang"}
        </button>
      </div>

      {error && <p className="text-sm text-danger">Gagal memuat status. Coba cek ulang.</p>}

      {features && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Summary n={okCount} label="OK" cls="text-success" />
            <Summary n={warnCount} label="Perlu isi" cls="text-warning" />
            <Summary n={errCount} label="Error" cls="text-danger" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 desktop:grid-cols-3">
            {features.map((f) => {
              const st = STATUS[f.status];
              return (
                <div
                  key={f.key}
                  className={`rounded-xl border p-4 ${
                    f.status === "error"
                      ? "border-danger/40 bg-danger/[0.05]"
                      : f.status === "warn"
                        ? "border-warning/40 bg-warning/[0.05]"
                        : "border-[var(--color-border)] bg-[var(--color-card)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{f.label}</p>
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${st?.dot ?? ""} ${f.status === "warn" || f.status === "error" ? "animate-pulse" : ""}`} />
                      <span className={`text-[11px] font-medium ${st?.text ?? ""}`}>{st?.label}</span>
                    </span>
                  </div>
                  <p className="mt-1 font-heading text-2xl tabular-nums">
                    {f.count >= 0 ? f.count.toLocaleString("id") : "—"}
                  </p>
                  {f.note && <p className="mt-0.5 text-[11px] text-[var(--color-text-secondary)]">{f.note}</p>}
                  {f.route && (
                    <a
                      href={`/${locale}${f.route}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-[11px] text-accent hover:underline"
                    >
                      Buka menu →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Summary({ n, label, cls }: { n: number; label: string; cls: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-center">
      <p className={`font-heading text-2xl ${cls}`}>{n}</p>
      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{label}</p>
    </div>
  );
}
