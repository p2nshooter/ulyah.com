"use client";

import { use as usePromise, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isValidLocale, DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { getDictionary } from "@/dictionaries";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";
import { PortalWelcome } from "@/components/PortalWelcome";
import { DonationVirtues } from "@/components/DonationVirtues";
import { DonationButtons } from "@/components/DonationButtons";
import { CryptoDonationSection } from "@/components/CryptoDonationSection";
import { ApiKeyDonationForm } from "@/components/ApiKeyDonationForm";
import { portalLabels } from "@/lib/portal-labels";

interface Proof {
  id: number;
  method: string;
  sender_name: string;
  amount: number | null;
  currency: string | null;
  status: "pending" | "approved" | "rejected";
  cert_no: string | null;
  review_note: string | null;
  created_at: string;
}

interface Donation {
  id: number;
  provider: string;
  amount: number | null;
  currency: string | null;
  type: string;
  status: string;
  created_at: string;
}

interface Me {
  email: string;
  donations: Donation[];
  keysDonated: { id: number; provider: string; status: string; created_at: string }[];
  proofs: Proof[];
}

const METHODS = ["bank", "crypto", "paypal", "nowpayments", "other"] as const;

export default function AkunPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = usePromise(params);
  const locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = getDictionary(locale);
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  // upload form
  const [method, setMethod] = useState<string>("bank");
  const [senderName, setSenderName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [transferredAt, setTransferredAt] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api
      .get<Me>("/client/me")
      .then((data) => setMe(data))
      .catch(() => router.push(`/${locale}/masuk`))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refresh();
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  async function logout() {
    await api.post("/client/logout");
    router.push(`/${locale}`);
  }

  async function submitProof(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    if (!file || !senderName.trim()) {
      setError(dict.common.error);
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("method", method);
      form.set("sender_name", senderName.trim());
      if (amount) form.set("amount", amount);
      if (currency) form.set("currency", currency);
      if (transferredAt) form.set("transferred_at", transferredAt);
      if (message) form.set("message", message);
      await api.upload("/client/proofs", form);
      setFeedback(dict.cert.submitted);
      setSenderName("");
      setAmount("");
      setMessage("");
      setFile(null);
      (document.getElementById("proof-file") as HTMLInputElement | null)?.value &&
        ((document.getElementById("proof-file") as HTMLInputElement).value = "");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="px-6 py-20 text-center text-sm">{dict.common.loading}</div>;
  if (!me) return null;

  const statusLabel: Record<Proof["status"], string> = {
    pending: dict.cert.statusPending,
    approved: dict.cert.statusApproved,
    rejected: dict.cert.statusRejected,
  };
  const statusColor: Record<Proof["status"], string> = {
    pending: "text-warning",
    approved: "text-success",
    rejected: "text-danger",
  };

  const certificates = me.proofs.filter((p) => p.status === "approved" && p.cert_no);
  const cryptoPending = me.donations.filter((d) => d.type === "crypto" && d.status === "pending");
  const cryptoConfirmed = me.donations.filter((d) => d.type === "crypto" && d.status === "confirmed");

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">{dict.auth.myDashboard}</h1>
        <button onClick={logout} className="text-sm text-danger">
          {dict.auth.logout}
        </button>
      </div>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{me.email}</p>

      {/* Welcome — spoken aloud automatically, once per session */}
      <div className="mt-6">
        <PortalWelcome locale={locale} />
      </div>

      {/* Certificate gallery — the first thing a donor sees after logging in */}
      <section className="mt-6 rounded-2xl border border-accent/40 bg-gradient-to-b from-accent/[0.06] to-transparent p-5">
        <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">🌙 {dict.cert.welcomeBack}</p>
        <h2 className="mt-4 font-heading text-lg text-primary dark:text-accent">🎗️ {dict.cert.galleryTitle}</h2>
        {certificates.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{dict.cert.noCertYet}</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {certificates.map((p) => (
              <a
                key={p.id}
                href={`/${locale}/akun/sertifikat/${p.id}`}
                className="group relative overflow-hidden rounded-xl border border-[#C9A84C]/50 bg-[#fbf7ee] p-3 text-center text-[#232323] shadow-sm transition hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-1.5 rounded-sm border border-double border-[#C9A84C]/60" />
                <p className="relative font-heading text-[10px] uppercase tracking-widest text-[#C9A84C]">{TENANT.siteName}</p>
                <p className="relative mt-2 text-xs font-semibold text-[#0B3D2E]">
                  {p.amount ? `${p.amount} ${p.currency ?? ""}` : p.method}
                </p>
                <p className="relative mt-1 text-[10px] text-[#232323]/60">{p.cert_no}</p>
                <p className="relative mt-1 text-[9px] text-[#232323]/50">
                  {new Date(p.created_at).toLocaleDateString(locale)}
                </p>
              </a>
            ))}
          </div>
        )}

        {(cryptoPending.length > 0 || cryptoConfirmed.length > 0) && (
          <div className="mt-5 border-t border-accent/20 pt-4">
            <p className="text-xs font-semibold text-accent">{dict.cert.cryptoTracking}</p>
            <div className="mt-2 space-y-1.5">
              {cryptoPending.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs">
                  <span>{d.amount ? `${d.amount} ${d.currency ?? ""}` : d.provider}</span>
                  <span className="text-warning">⏳ {dict.cert.cryptoStatusPending}</span>
                </div>
              ))}
              {cryptoConfirmed.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs">
                  <span>{d.amount ? `${d.amount} ${d.currency ?? ""}` : d.provider}</span>
                  <span className="text-success">{dict.cert.cryptoStatusConfirmed}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Reward promised for supporting the syiar — the "long version" the
          short spoken welcome above points to */}
      <div id="janji-pahala" className="mt-8 scroll-mt-20">
        <DonationVirtues dict={dict} locale={locale} />
      </div>

      {/* Donate again, without leaving the dashboard */}
      <section className="mt-8">
        <h2 className="font-heading text-lg">{portalLabels(locale).donateSectionTitle}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{portalLabels(locale).donateSectionSubtitle}</p>
        <div className="mt-4">
          <DonationButtons dict={dict} />
        </div>
        <div className="mt-6">
          <CryptoDonationSection dict={dict} locale={locale} />
        </div>
        <div className="mt-6">
          <ApiKeyDonationForm dict={dict} />
        </div>
      </section>

      {/* Sadaqah certificate — upload proof */}
      <section className="mt-8 rounded-2xl border border-accent/40 bg-[var(--color-card)] p-5 shadow-[0_2px_24px_rgba(184,137,43,0.08)]">
        <h2 className="font-heading text-lg">🎗️ {dict.cert.sectionTitle}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{dict.cert.intro}</p>

        <form onSubmit={submitProof} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{dict.cert.method}</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m === "bank" ? dict.cert.methodBank : m === "crypto" ? dict.cert.methodCrypto : m === "paypal" ? dict.cert.methodPaypal : m === "nowpayments" ? dict.cert.methodNowpayments : dict.cert.methodOther}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{dict.cert.senderName}</span>
            <input
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{dict.cert.amount}</span>
            <div className="mt-1 flex gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              />
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 6))}
                className="w-20 rounded-lg border border-[var(--color-border)] bg-transparent px-2 py-2 text-sm"
              />
            </div>
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{dict.cert.transferDate}</span>
            <input
              type="date"
              value={transferredAt}
              onChange={(e) => setTransferredAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="text-[var(--color-text-secondary)]">{dict.cert.message}</span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="text-[var(--color-text-secondary)]">{dict.cert.file}</span>
            <input
              id="proof-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-accent/10 file:px-3 file:py-1 file:text-accent"
            />
            <span className="mt-1 block text-[10px] text-[var(--color-text-secondary)]">{dict.cert.fileHint}</span>
          </label>

          {error && <p className="text-xs text-danger sm:col-span-2">{error}</p>}
          {feedback && <p className="text-xs text-success sm:col-span-2">{feedback}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-accent dark:text-primary sm:col-span-2"
          >
            {submitting ? dict.common.loading : dict.cert.submit}
          </button>
        </form>
      </section>

      {/* Sadaqah history + certificates */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-accent">{dict.cert.historyTitle}</h2>
        <div className="mt-2 space-y-2">
          {me.proofs.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">—</p>}
          {me.proofs.map((p) => (
            <div key={p.id} className="rounded-xl border border-[var(--color-border)] p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {p.sender_name} · {p.amount ? `${p.amount} ${p.currency ?? ""}` : p.method}
                </span>
                <span className={statusColor[p.status]}>{statusLabel[p.status]}</span>
              </div>
              {p.review_note && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">“{p.review_note}”</p>}
              {!p.review_note && (p.method === "paypal" || p.method === "nowpayments") && p.status === "approved" && (
                <p className="mt-1 text-xs italic text-[var(--color-text-secondary)]">{dict.cert.autoIssuedNote}</p>
              )}
              {p.status === "approved" && p.cert_no && (
                <a
                  href={`/${locale}/akun/sertifikat/${p.id}`}
                  className="mt-2 inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-primary"
                >
                  🎗️ {dict.cert.download} · {p.cert_no}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Donation history */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-accent">{dict.auth.donationHistory}</h2>
        <div className="mt-2 space-y-2">
          {me.donations.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">—</p>}
          {me.donations.map((d) => (
            <div key={d.id} className="flex justify-between rounded-lg border border-[var(--color-border)] p-3 text-sm">
              <span>
                {d.provider} · {d.type}
              </span>
              <span className={d.status === "confirmed" ? "text-success" : "text-warning"}>
                {d.amount ? `$${d.amount}` : d.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Keys donated */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-accent">{dict.auth.keysDonated}</h2>
        <div className="mt-2 space-y-2">
          {me.keysDonated.length === 0 && <p className="text-sm text-[var(--color-text-secondary)]">—</p>}
          {me.keysDonated.map((k) => (
            <div key={k.id} className="flex justify-between rounded-lg border border-[var(--color-border)] p-3 text-sm">
              <span>{k.provider}</span>
              <span className={k.status === "active" ? "text-success" : "text-warning"}>{k.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
