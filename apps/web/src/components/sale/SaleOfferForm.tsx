"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { usd } from "@/lib/site-sale";
import { fillSale, type SaleCopy } from "@/lib/sale-copy";

/**
 * The offer form of a site's sale page, in the site's language: stored by the API in R2
 * (POST /sale/offers, with the site), seen by the owner in Admin → Situs dijual on ulyah.com.
 */
export function SaleOfferForm({ site, locale, words: w, minOfferUsd, email }: { site: string; locale: string; words: SaleCopy["form"]; minOfferUsd: number; email: string }) {
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
      setErr(w.errAmount);
      return;
    }
    setBusy(true);
    try {
      const r = await api.post<{ amountUsd?: unknown }>("/sale/offers", { ...f, site, amountUsd: amount });
      setSent(typeof r?.amountUsd === "number" ? r.amountUsd : amount);
    } catch (x) {
      const code = x instanceof ApiError ? x.code : "";
      setErr(
        code === "amount" ? w.errAmount
        : code === "email" ? w.errEmail
        : code === "name" ? w.errName
        : code === "country" ? w.errCountry
        : code === "rate" ? w.errRate
        : code === "hidden" ? w.errHidden
        : fillSale(w.errOther, { email })
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent !== null) {
    return (
      <div className="rounded-2xl border border-success/40 bg-success/10 p-6 text-center" data-testid="sale-offer-sent" role="status">
        <p className="font-heading text-xl text-success">{w.sentTitle}</p>
        <p className="mt-2 text-sm text-text-secondary">{fillSale(w.sent, { amount: usd(sent, locale) })}</p>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-sm outline-hidden transition focus:border-accent";
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate data-testid="sale-offer-form">
      <label className="block text-sm font-medium">{w.name}<input className={field} value={f.name} onChange={set("name")} autoComplete="name" required maxLength={120} /></label>
      <label className="block text-sm font-medium">{w.email}<input className={field} type="email" value={f.email} onChange={set("email")} autoComplete="email" required maxLength={254} /></label>
      <label className="block text-sm font-medium">{w.whatsapp}<input className={field} type="tel" value={f.whatsapp} onChange={set("whatsapp")} autoComplete="tel" maxLength={24} /></label>
      <label className="block text-sm font-medium">{w.company}<input className={field} value={f.company} onChange={set("company")} autoComplete="organization" maxLength={160} /></label>
      <label className="block text-sm font-medium">{w.country}<input className={field} value={f.country} onChange={set("country")} autoComplete="country-name" required maxLength={80} /></label>
      <label className="block text-sm font-medium">
        {w.amount}
        <input className={field} inputMode="numeric" value={f.amountUsd} onChange={set("amountUsd")} placeholder={String(minOfferUsd)} required data-testid="sale-offer-amount" />
        <span className="mt-1 block text-xs text-text-secondary">{w.minimum} {usd(minOfferUsd, locale)}{amount ? ` · ${w.youOffer} ${usd(amount, locale)}` : ""}</span>
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        {w.message}
        <textarea className={`${field} min-h-[110px]`} value={f.message} onChange={set("message")} maxLength={3000} placeholder={w.messageHint} />
      </label>
      {/* Bots fill every field; people never see this one. */}
      <input type="text" name="website" value={f.website} onChange={set("website")} tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {err && <p className="text-sm font-medium text-danger sm:col-span-2" role="alert" data-testid="sale-offer-error">{err}</p>}
      <div className="sm:col-span-2">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60 dark:bg-accent dark:text-primary" data-testid="sale-offer-send">
          {busy ? w.sending : w.send}
        </button>
        <p className="mt-2 text-xs text-text-secondary">{w.privacy}</p>
      </div>
    </form>
  );
}
