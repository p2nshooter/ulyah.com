"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ProofRow {
  id: number;
  client_email: string;
  method: string;
  sender_name: string;
  amount: number | null;
  currency: string | null;
  transferred_at: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  cert_no: string | null;
  created_at: string;
}

export function ProofsTab() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [busy, setBusy] = useState<number | null>(null);

  function load(s: typeof status) {
    api.get<{ proofs: ProofRow[] }>(`/admin/proofs?status=${s}`).then((r) => setProofs(r.proofs)).catch(() => {});
  }

  useEffect(() => {
    load(status);
  }, [status]);

  async function decide(id: number, action: "approve" | "reject") {
    const note = action === "reject" ? window.prompt("Reason (optional):") ?? undefined : undefined;
    setBusy(id);
    try {
      await api.post(`/admin/proofs/${id}/decide`, { action, note });
      load(status);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-3 py-1.5 text-xs capitalize ${
              status === s ? "bg-accent text-white" : "border border-[var(--color-border)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {proofs.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">No {status} proofs.</p>}

      <div className="space-y-3">
        {proofs.map((p) => (
          <div key={p.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{p.sender_name}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {p.client_email} · {p.method}
                  {p.amount ? ` · ${p.amount} ${p.currency ?? ""}` : ""}
                  {p.transferred_at ? ` · ${p.transferred_at}` : ""}
                </p>
                {p.message && <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">“{p.message}”</p>}
                {p.cert_no && <p className="mt-1 text-xs text-success">Certificate: {p.cert_no}</p>}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${api.base}/admin/proofs/${p.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs hover:border-accent"
                >
                  View proof
                </a>
                {p.status === "pending" && (
                  <>
                    <button
                      onClick={() => decide(p.id, "approve")}
                      disabled={busy === p.id}
                      className="rounded-full bg-success px-3 py-1.5 text-xs text-white disabled:opacity-60"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => decide(p.id, "reject")}
                      disabled={busy === p.id}
                      className="rounded-full bg-danger px-3 py-1.5 text-xs text-white disabled:opacity-60"
                    >
                      ✕ Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
