"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export function AccountTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await api.post("/admin/auth/change-credentials", {
        currentPassword,
        newEmail: newEmail || undefined,
        newPassword: newPassword || undefined,
      });
      setMessage("Credentials updated. Please log in again.");
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
      <p className="text-sm font-medium">Change admin credentials</p>
      <input required type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
      <input type="email" placeholder="New email (optional)" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
      <input type="password" minLength={10} placeholder="New password (optional, min 10 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm" />
      {message && <p className="text-xs text-[var(--color-text-secondary)]">{message}</p>}
      <button disabled={busy} className="w-full rounded bg-primary px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-accent dark:text-primary">
        {busy ? "..." : "Update"}
      </button>
    </form>
  );
}
