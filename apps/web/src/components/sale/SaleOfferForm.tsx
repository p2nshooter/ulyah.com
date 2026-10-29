"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { usd } from "@/lib/site-sale";

/** The offer form of the sale page: stored by the API in R2 (POST /sale/offers); the owner sees it in Admin → Situs dijual. */
export function SaleOfferForm({ minOfferUsd, email }: { minOfferUsd: number; email: string }) {
  const [f, setF] = useState({ name: "", email: "", whatsapp: "", company: "", country: "", amountUsd: "", message: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<number | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  const amount = Number(f.amountUsd.replace(/[^\d]/g, "")) || 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (amount < minOfferUsd) {
      setErr(`Penawaran minimum ${usd(minOfferUsd)}.`);
      return;
    }
    setBusy(true);
    try {
      const r = await api.post<{ amountUsd?: unknown }>("/sale/offers", { ...f, amountUsd: amount });
      setSent(typeof r?.amountUsd === "number" ? r.amountUsd : amount);
    } catch (x) {
      const code = x instanceof ApiError ? x.code : "";
      setErr(
        code === "amount" ? `Penawaran minimum ${usd(minOfferUsd)}.`
        : code === "email" ? "Mohon isi alamat e-mail yang benar."
        : code === "name" ? "Mohon isi nama Anda."
        : code === "country" ? "Mohon isi negara Anda."
        : code === "rate" ? "Terlalu banyak percobaan — silakan coba lagi nanti."
        : code === "hidden" ? "Situs ini sedang tidak ditawarkan."
        : `Penawaran belum terkirim. Silakan coba lagi, atau kirim lewat e-mail ke ${email}.`
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent !== null) {
    return (
      <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center" data-testid="sale-offer-sent" role="status">
        <p className="font-heading text-xl text-success">✓ Penawaran Anda sudah kami terima</p>
        <p className="mt-2 text-sm text-text-secondary">
          Penawaran {usd(sent)} untuk ULYAH.COM tercatat. Pemilik akan menghubungi Anda lewat e-mail atau WhatsApp untuk langkah berikutnya.
        </p>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm outline-hidden transition focus:border-accent";
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate data-testid="sale-offer-form">
      <label className="block text-sm font-medium">Nama lengkap<input className={field} value={f.name} onChange={set("name")} autoComplete="name" required maxLength={120} /></label>
      <label className="block text-sm font-medium">E-mail<input className={field} type="email" value={f.email} onChange={set("email")} autoComplete="email" required maxLength={254} /></label>
      <label className="block text-sm font-medium">WhatsApp (opsional)<input className={field} type="tel" value={f.whatsapp} onChange={set("whatsapp")} autoComplete="tel" maxLength={24} /></label>
      <label className="block text-sm font-medium">Perusahaan / lembaga (opsional)<input className={field} value={f.company} onChange={set("company")} autoComplete="organization" maxLength={160} /></label>
      <label className="block text-sm font-medium">Negara<input className={field} value={f.country} onChange={set("country")} autoComplete="country-name" required maxLength={80} /></label>
      <label className="block text-sm font-medium">
        Nilai penawaran (US$)
        <input className={field} inputMode="numeric" value={f.amountUsd} onChange={set("amountUsd")} placeholder={String(minOfferUsd)} required data-testid="sale-offer-amount" />
        <span className="mt-1 block text-xs text-text-secondary">Minimum {usd(minOfferUsd)}{amount ? ` · Anda menawar ${usd(amount)}` : ""}</span>
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        Pesan (opsional)
        <textarea className={`${field} min-h-[110px]`} value={f.message} onChange={set("message")} maxLength={3000} placeholder="Rencana Anda untuk ULYAH.COM, cara pembayaran yang diinginkan, pertanyaan…" />
      </label>
      {/* Bots fill every field; people never see this one. */}
      <input type="text" name="website" value={f.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {err && <p className="text-sm font-medium text-danger sm:col-span-2" role="alert" data-testid="sale-offer-error">{err}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60 dark:bg-accent dark:text-primary" data-testid="sale-offer-send">
          {busy ? "Mengirim…" : "Kirim penawaran"}
        </button>
        <p className="mt-2 text-xs text-text-secondary">Data Anda hanya dipakai untuk menindaklanjuti penawaran ini.</p>
      </div>
    </form>
  );
}
