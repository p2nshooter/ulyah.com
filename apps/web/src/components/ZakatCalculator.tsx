"use client";

import { useMemo, useState } from "react";
import { zakatLabels } from "@/lib/zakat-labels";

const NISAB_GRAMS = { gold: 85, silver: 595 } as const;
const FITRAH_KG_PER_PERSON = 2.5;

function toNumber(v: string): number {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Zakat Maal + Zakat Fitrah calculator — entirely client-side (no API calls,
 * no data ever leaves the device), matching the reference architecture note
 * for this class of feature ("100% client-side, tanpa iklan" pattern from
 * abdessamadbettal/Falah). Currency-agnostic by design: the visitor supplies
 * the current gold/silver price and staple-food price themselves in whatever
 * currency they use, rather than this trying to fetch/guess a live price —
 * that keeps the site light and avoids ever presenting a stale/wrong market
 * price as authoritative. Both classical nisab references (gold and silver)
 * are offered side by side rather than picking one as "the" ruling — see
 * docs/CONTENT-POLICY.md: state established fiqh reference points, never
 * fabricate a single answer where scholars differ.
 */
export function ZakatCalculator({ locale }: { locale: string }) {
  const t = zakatLabels(locale);

  const [nisabBasis, setNisabBasis] = useState<"gold" | "silver">("gold");
  const [wealth, setWealth] = useState("");
  const [pricePerGram, setPricePerGram] = useState("");
  const [people, setPeople] = useState("");
  const [staplePrice, setStaplePrice] = useState("");

  const nisabValue = useMemo(
    () => toNumber(pricePerGram) * NISAB_GRAMS[nisabBasis],
    [pricePerGram, nisabBasis]
  );
  const wealthNum = toNumber(wealth);
  const meetsNisab = nisabValue > 0 && wealthNum >= nisabValue;
  const zakatMaalDue = meetsNisab ? wealthNum * 0.025 : 0;

  const fitrahTotal = toNumber(people) * FITRAH_KG_PER_PERSON * toNumber(staplePrice);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <p className="font-heading text-lg">{t.maalTitle}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.maalIntro}</p>

        <div className="mt-4 flex gap-2">
          {(["gold", "silver"] as const).map((basis) => (
            <button
              key={basis}
              onClick={() => setNisabBasis(basis)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                nisabBasis === basis
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              {basis === "gold" ? t.nisabGold : t.nisabSilver}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.pricePerGramLabel}</span>
            <input
              inputMode="decimal"
              value={pricePerGram}
              onChange={(e) => setPricePerGram(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.wealthLabel}</span>
            <input
              inputMode="decimal"
              value={wealth}
              onChange={(e) => setWealth(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl bg-black/5 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">{t.nisabValueLabel}</span>
            <span className="font-heading tabular-nums">{fmt(nisabValue)}</span>
          </div>
          {nisabValue > 0 && (
            <div className="mt-2 border-t border-[var(--color-border)] pt-2">
              {meetsNisab ? (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">{t.zakatDueLabel}</span>
                  <span className="font-heading text-lg text-accent tabular-nums">{fmt(zakatMaalDue)}</span>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-secondary)]">{t.belowNisab}</p>
              )}
            </div>
          )}
        </div>
      </section>


      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <p className="font-heading text-lg">{t.fitrahTitle}</p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t.fitrahIntro}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.peopleLabel}</span>
            <input
              inputMode="numeric"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.staplePriceLabel}</span>
            <input
              inputMode="decimal"
              value={staplePrice}
              onChange={(e) => setStaplePrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-black/5 p-4 text-sm">
          <span className="text-[var(--color-text-secondary)]">{t.fitrahTotalLabel}</span>
          <span className="font-heading text-lg text-accent tabular-nums">{fmt(fitrahTotal)}</span>
        </div>
      </section>

      <p className="text-center text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{t.disclaimer}</p>
    </div>
  );
}
