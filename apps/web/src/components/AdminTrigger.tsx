"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";

const CLICK_THRESHOLD = 5;
const WINDOW_MS = 3000;

/**
 * Wraps the header logo. No visible "Login"/"Admin" link exists anywhere in
 * the public UI (arsitektur doc §12.1/§12.3) — 5 rapid clicks (within 3s) on
 * this element is the only way the auth modal ever enters the DOM.
 */
export function AdminTrigger({ children, locale }: { children: React.ReactNode; locale: string }) {
  const clicksRef = useRef<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  function handleClick() {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current, now].filter((t) => now - t <= WINDOW_MS);
    if (clicksRef.current.length >= CLICK_THRESHOLD) {
      clicksRef.current = [];
      setShowModal(true);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} aria-label="ulyah" className="border-0 bg-transparent p-0">
        {children}
      </button>
      {showModal && <AdminAuthModal locale={locale} onClose={() => setShowModal(false)} />}
    </>
  );
}

type Step = "credentials" | "totp" | "totp-setup";

function AdminAuthModal({ locale, onClose }: { locale: string; onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{
        needsTotpSetup?: boolean;
        needsTotpCode?: boolean;
        pendingToken: string;
        otpauthUrl?: string;
      }>("/admin/auth/login", { email, password });
      setPendingToken(res.pendingToken);
      if (res.needsTotpSetup) {
        setOtpauthUrl(res.otpauthUrl ?? "");
        setStep("totp-setup");
      } else {
        setStep("totp");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitTotp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.post("/admin/auth/totp", { pendingToken, code });
      router.push(`/${locale}/admin`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-card)] p-6 shadow-2xl">
        {step === "credentials" && (
          <form onSubmit={submitCredentials} className="space-y-4">
            <h2 className="font-heading text-lg">Portal Admin</h2>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="text-sm text-[var(--color-text-secondary)]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy ? "..." : "Continue"}
              </button>
            </div>
          </form>
        )}

        {(step === "totp" || step === "totp-setup") && (
          <form onSubmit={submitTotp} className="space-y-4">
            <h2 className="font-heading text-lg">Two-Step Verification</h2>
            {step === "totp-setup" && otpauthUrl && (
              <div className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                <p>Scan this with Google Authenticator / Authy, then enter the 6-digit code:</p>
                <code className="block break-all rounded bg-black/5 p-2">{otpauthUrl}</code>
              </div>
            )}
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2 text-center text-lg tracking-widest"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="text-sm text-[var(--color-text-secondary)]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy ? "..." : "Verify"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
