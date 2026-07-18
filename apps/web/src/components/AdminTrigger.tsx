"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TENANT } from "@/lib/tenant";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { api } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";

const CLICK_THRESHOLD = 5;
const WINDOW_MS = 4000;

/**
 * Wraps the header logo. No visible "Login"/"Admin" link exists anywhere in
 * the public UI (arsitektur doc §12.1/§12.3) — 5 rapid clicks (within 3s) on
 * this element is the only way the auth modal ever enters the DOM.
 */
export function AdminTrigger({ children, locale }: { children: React.ReactNode; locale: string }) {
  const clicksRef = useRef<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    const now = Date.now();
    clicksRef.current = [...clicksRef.current, now].filter((t) => now - t <= WINDOW_MS);
    if (clicksRef.current.length >= CLICK_THRESHOLD) {
      // The 5th rapid tap opens the hidden admin login instead of navigating
      // home — every tap before that behaves like an ordinary logo-to-home
      // link, so the secret trigger never gets in the way of normal use.
      e.preventDefault();
      clicksRef.current = [];
      setShowModal(true);
    }
  }

  return (
    <>
      <Link
        href={`/${locale}`}
        onClick={handleClick}
        aria-label="ulyah — beranda"
        className="select-none"
        style={{ touchAction: "manipulation" }}
      >
        {children}
      </Link>
      {showModal && (
        <AdminAuthModal
          locale={locale}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            // Close the modal BEFORE navigating — otherwise this trigger lives
            // in the Header (on every page, including /admin), so the modal
            // stayed open on top of the dashboard after login ("form login g
            // ke close padahal sudah masuk").
            setShowModal(false);
            router.push(`/${locale}/admin`);
          }}
        />
      )}
    </>
  );
}

type Step = "credentials" | "totp" | "totp-setup";

/**
 * Also reused directly by /admin for an unauthenticated visit (no separate
 * "how do I even log in" dead end) — the route itself still isn't linked
 * anywhere in the public nav, so this stays effectively hidden from casual
 * visitors while still being reachable for whoever already knows the URL.
 */
export function AdminAuthModal({
  locale,
  onClose,
  onSuccess,
  standalone = false,
}: {
  locale: string;
  onClose?: () => void;
  onSuccess: () => void;
  standalone?: boolean;
}) {
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [otpauthUrl, setOtpauthUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Render the otpauth:// URL to a scannable QR image entirely in the
  // browser — the TOTP secret never leaves the device to any QR service.
  useEffect(() => {
    if (!otpauthUrl) return;
    QRCode.toDataURL(otpauthUrl, { width: 240, margin: 1, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [otpauthUrl]);

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{
        ok?: boolean;
        needsTotpSetup?: boolean;
        needsTotpCode?: boolean;
        pendingToken: string;
        otpauthUrl?: string;
        secret?: string;
      }>("/admin/auth/login", { email, password });
      // Sibling admins and demo accounts have no second factor — the server
      // sets the session cookie on login and returns { ok: true } directly.
      if (res.ok && !res.pendingToken) {
        onSuccess();
        return;
      }
      setPendingToken(res.pendingToken);
      if (res.needsTotpSetup) {
        setOtpauthUrl(res.otpauthUrl ?? "");
        setSecret(res.secret ?? "");
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
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal={!standalone}
      className={
        standalone
          ? "flex min-h-[70vh] items-center justify-center p-4"
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      }
    >
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-card)] p-6 shadow-2xl">
        <div className="mb-4 flex justify-center">
          <Image
            src={TENANT.id === "ulyah" ? "/brand/ulyah-logo-light.webp" : TENANT.logoIcon}
            alt="Ulyah"
            width={96}
            height={96}
            className="block h-16 w-16 rounded-full shadow-md dark:hidden"
          />
          <Image
            src={TENANT.id === "ulyah" ? "/brand/ulyah-logo-dark.webp" : TENANT.logoIcon}
            alt="Ulyah"
            width={96}
            height={96}
            className="hidden h-16 w-16 rounded-full shadow-md dark:block"
          />
        </div>
        {step === "credentials" && (
          <form onSubmit={submitCredentials} className="space-y-4">
            <h2 className="font-heading text-center text-lg">Portal Admin</h2>
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
              {onClose ? (
                <button type="button" onClick={onClose} className="text-sm text-[var(--color-text-secondary)]">
                  Cancel
                </button>
              ) : (
                <Link href={`/${locale}`} className="text-sm text-[var(--color-text-secondary)]">
                  Cancel
                </Link>
              )}
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
              <div className="space-y-3 text-xs text-[var(--color-text-secondary)]">
                <p>Pindai QR ini dengan Google Authenticator / Authy / 2FAS, lalu masukkan kode 6 digit:</p>
                {qrDataUrl && (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="QR code 2FA"
                      width={200}
                      height={200}
                      className="rounded-lg bg-white p-2"
                    />
                  </div>
                )}
                {/* Same phone (no second device to scan with)? Tapping opens the
                    installed authenticator app pre-filled via the otpauth:// URI. */}
                <a
                  href={otpauthUrl}
                  className="block rounded-lg border border-accent/40 py-2 text-center font-medium text-accent hover:bg-accent/5"
                >
                  📲 Buka langsung di aplikasi 2FA
                </a>
                <a
                  href={qrDataUrl || undefined}
                  download="ulyah-admin-2fa-qr.png"
                  className="block text-center text-[var(--color-text-secondary)] underline"
                >
                  ⬇ Unduh gambar QR
                </a>
                {secret && (
                  <div className="rounded-lg bg-black/5 p-2">
                    <p className="mb-1 text-[10px] uppercase tracking-wide">Atau masukkan kunci manual:</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="break-all text-[11px]">{secret}</code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(secret).then(() => {
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          });
                        }}
                        className="shrink-0 rounded border border-[var(--color-border)] px-2 py-1 text-[10px]"
                      >
                        {copied ? "✓ Tersalin" : "Salin"}
                      </button>
                    </div>
                  </div>
                )}
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
              {onClose ? (
                <button type="button" onClick={onClose} className="text-sm text-[var(--color-text-secondary)]">
                  Cancel
                </button>
              ) : (
                <Link href={`/${locale}`} className="text-sm text-[var(--color-text-secondary)]">
                  Cancel
                </Link>
              )}
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
