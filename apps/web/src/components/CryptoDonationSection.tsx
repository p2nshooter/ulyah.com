"use client";

import { useState } from "react";
import type { Dictionary } from "@/dictionaries";

const WALLETS = [
  { id: "btc", coin: "Bitcoin", symbol: "BTC", network: "Bitcoin", address: "1AzqohLY6XPGbabHmMhstYMPFUThoiBnya" },
  { id: "usdt-trc20", coin: "Tether USDt", symbol: "USDT", network: "TRC20 (Tron)", address: "TNo8jgJqmnUGAPUDb159cC8uhAeFDP8keW" },
  { id: "bnb-bep20", coin: "BNB", symbol: "BNB", network: "BEP20 (BNB Smart Chain)", address: "0x1bed722b27b3d2bdab3dfe06ea75b84a3a824f3d" },
  { id: "sol", coin: "Solana", symbol: "SOL", network: "Solana", address: "CUnEGFRZvMu8xieLdiM9oHXa5dzS9xJVvNnEiyXRaogD" },
  { id: "doge", coin: "Dogecoin", symbol: "DOGE", network: "Dogecoin", address: "DJUK77iDsus6URWcwNZnsqAyESUr426Df3" },
];

// wondr by BNI multicurrency accounts — a.n. Yusron Efendi
const BANK_ACCOUNTS = [
  { ccy: "IDR", number: "2090571484" },
  { ccy: "USD", number: "2090571495" },
  { ccy: "SGD", number: "2090571508" },
  { ccy: "AUD", number: "2090571519" },
  { ccy: "GBP", number: "2090571520" },
  { ccy: "CNY", number: "2090571531" },
  { ccy: "EUR", number: "2090571542" },
  { ccy: "HKD", number: "2090571553" },
  { ccy: "JPY", number: "2090571564" },
  { ccy: "MYR", number: "2090571575" },
  { ccy: "SAR", number: "2090571586" },
  { ccy: "KRW", number: "2090571597" },
  { ccy: "THB", number: "2090571609" },
];

const BANK_HOWTO: Record<string, string[]> = {
  id: [
    "Buka aplikasi bank/m-banking Anda, pilih Transfer ke Bank BNI (kode bank 009).",
    "Masukkan nomor rekening sesuai mata uang di bawah — penerima: YUSRON EFENDI.",
    "Selesaikan transfer, lalu simpan bukti transfer Anda. Semoga Allah membalas kebaikan Anda dengan berlipat ganda.",
  ],
  en: [
    "Open your banking app and choose transfer to Bank BNI, Indonesia (bank code 009 / SWIFT BNINIDJA).",
    "Enter the account number matching your currency below — beneficiary: YUSRON EFENDI.",
    "Complete the transfer and keep your receipt. May Allah reward your kindness manifold.",
  ],
};

export function CryptoDonationSection({ dict, locale }: { dict: Dictionary; locale: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [openWallet, setOpenWallet] = useState<string | null>("usdt-trc20");
  const howto = BANK_HOWTO[locale] ?? BANK_HOWTO.en!;

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  return (
    <div className="space-y-8">
      {/* Bank transfer — wondr by BNI */}
      <div className="rounded-2xl border border-accent/40 bg-[var(--color-card)] p-6 shadow-[0_2px_24px_rgba(184,137,43,0.08)]">
        <p className="font-heading text-lg">🏦 Bank Transfer — BNI (wondr multicurrency)</p>

        {/* Full bank identity — required for international / SWIFT transfers */}
        <dl className="mt-3 grid gap-x-4 gap-y-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-4 text-sm sm:grid-cols-2 dark:bg-white/[0.02]">
          <div className="flex justify-between gap-2 sm:col-span-2">
            <dt className="text-[var(--color-text-secondary)]">Bank</dt>
            <dd className="text-right font-medium">PT Bank Negara Indonesia (Persero) Tbk.</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-secondary)]">SWIFT / BIC</dt>
            <dd>
              <button
                onClick={() => copy("BNINIDJA", "swift")}
                className="font-semibold tabular-nums text-accent hover:underline"
              >
                {copied === "swift" ? dict.crypto.copied : "BNINIDJA"}
              </button>
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--color-text-secondary)]">{dict.crypto.network === "Network" ? "Bank code" : "Kode Bank"}</dt>
            <dd className="font-medium tabular-nums">009</dd>
          </div>
          <div className="flex justify-between gap-2 sm:col-span-2">
            <dt className="text-[var(--color-text-secondary)]">{dict.cert.senderName === "Name on the certificate" ? "Beneficiary" : "Penerima"}</dt>
            <dd className="text-right font-medium">YUSRON EFENDI</dd>
          </div>
        </dl>

        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-[var(--color-text-secondary)]">
          {howto.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BANK_ACCOUNTS.map((acc) => (
            <button
              key={acc.ccy}
              onClick={() => copy(acc.number, acc.ccy)}
              className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-left text-xs hover:border-accent"
            >
              <span className="font-semibold text-accent">{acc.ccy}</span>
              <span className="mt-0.5 block tabular-nums">{acc.number}</span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                {copied === acc.ccy ? dict.crypto.copied : "a.n. YUSRON EFENDI"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Direct crypto */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
        <p className="font-heading text-lg">🪙 {dict.crypto.title}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{dict.crypto.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => setOpenWallet(w.id)}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                openWallet === w.id ? "border-accent bg-accent/10 text-accent" : "border-[var(--color-border)]"
              }`}
            >
              {w.symbol}
            </button>
          ))}
        </div>
        {WALLETS.filter((w) => w.id === openWallet).map((w) => (
          <div key={w.id} className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/donate/qr-${w.id}.svg`} alt={`${w.coin} QR`} className="h-44 w-44 rounded-xl bg-white p-2" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-medium">{w.coin} ({w.symbol})</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                {dict.crypto.network}: <span className="font-semibold text-warning">{w.network}</span>
              </p>
              <code className="mt-3 block break-all rounded-lg bg-black/5 p-3 text-xs dark:bg-white/10">{w.address}</code>
              <button
                onClick={() => copy(w.address, w.id)}
                className="mt-3 rounded-full bg-primary px-4 py-2 text-xs font-medium text-white dark:bg-accent dark:text-primary"
              >
                {copied === w.id ? `✓ ${dict.crypto.copied}` : `📋 ${dict.crypto.copy}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
