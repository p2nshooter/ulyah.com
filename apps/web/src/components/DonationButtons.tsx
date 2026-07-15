"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";

const AMOUNTS = [5, 10, 25, 50];
const NOWPAYMENTS_DONATION_URL = "https://nowpayments.io/donation?api_key=588fda75-68c4-4ed4-88fa-0e23fe06daa3";
const PAYPAL_ME_URL = "https://paypal.me/yusronefendi";

export function DonationButtons({ dict }: { dict: Dictionary }) {
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  async function donateWithPaypal() {
    setError(null);
    setBusy(true);
    try {
      const res = await api.post<{ approveUrl: string }>("/donate/paypal/create", {
        amount: String(effectiveAmount),
        currency: "USD",
      });
      window.location.href = res.approveUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium">{dict.donation.chooseAmount}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => {
                setAmount(a);
                setCustomAmount("");
              }}
              className={`rounded-full border px-4 py-2 text-sm ${
                amount === a && !customAmount ? "border-accent bg-accent/10 text-accent" : "border-[var(--color-border)]"
              }`}
            >
              ${a}
            </button>
          ))}
          <input
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder={dict.donation.customAmount}
            className="w-32 rounded-full border border-[var(--color-border)] bg-transparent px-3 py-2 text-center text-sm"
          />
        </div>
      </div>

      <button
        onClick={donateWithPaypal}
        disabled={busy || effectiveAmount <= 0}
        className="w-full rounded-xl bg-[#0070ba] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "..." : dict.donation.payWithPaypal}
      </button>

      {error && <p className="text-xs text-danger">{error}</p>}

      {/* Compact secondary rails — a one-tap PayPal.me link and the small
          NOWPayments crypto button — replacing the oversized embedded widget
          so this block stays light enough to drop into any app widget later. */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <a
          href={PAYPAL_ME_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#0070ba]/40 px-4 py-2 text-xs font-medium text-[#0070ba] transition hover:bg-[#0070ba]/10 dark:text-[#4aa3e0]"
        >
          <span aria-hidden>⚡</span> PayPal.me
        </a>
        <a href={NOWPAYMENTS_DONATION_URL} target="_blank" rel="noreferrer noopener" aria-label="Donasi crypto via NOWPayments">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://nowpayments.io/images/embeds/donation-button-white.svg"
            alt="Cryptocurrency & Bitcoin donation button by NOWPayments"
            className="h-10"
          />
        </a>
      </div>
    </div>
  );
}
