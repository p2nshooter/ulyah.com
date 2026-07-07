"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Dictionary } from "@/dictionaries";

const AMOUNTS = [5, 10, 25, 50];
const NOWPAYMENTS_API_KEY = "588fda75-68c4-4ed4-88fa-0e23fe06daa3";

export function DonationButtons({ dict }: { dict: Dictionary }) {
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [showCrypto, setShowCrypto] = useState(false);
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

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={donateWithPaypal}
          disabled={busy || effectiveAmount <= 0}
          className="rounded-xl bg-[#0070ba] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "..." : dict.donation.payWithPaypal}
        </button>
        <button
          onClick={() => setShowCrypto((v) => !v)}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white dark:bg-accent dark:text-primary"
        >
          {dict.donation.payWithCrypto}
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {showCrypto && (
        <div className="flex justify-center overflow-hidden rounded-xl border border-[var(--color-border)]">
          <iframe
            src={`https://nowpayments.io/embeds/donation-widget?api_key=${NOWPAYMENTS_API_KEY}`}
            width="346"
            height="623"
            frameBorder="0"
            scrolling="no"
            style={{ overflowY: "hidden", maxWidth: "100%" }}
            title="NOWPayments donation widget"
          >
            Can&apos;t load widget
          </iframe>
        </div>
      )}
    </div>
  );
}
