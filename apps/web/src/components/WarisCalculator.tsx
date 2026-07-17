"use client";

import { useMemo, useState } from "react";
import { warisLabels } from "@/lib/waris-labels";
import { calculateWaris, type WarisInput } from "@/lib/waris";

function toNumber(v: string): number {
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function toInt(v: string): number {
  return Math.max(0, Math.floor(toNumber(v)));
}

function fmt(n: number): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Faraid calculator — see lib/waris.ts for the scope and the fiqh rules it
 * implements. Entirely client-side, matching the Zakat/Qibla/Hijri widgets:
 * no family or financial data ever leaves the device.
 */
export function WarisCalculator({ locale }: { locale: string }) {
  const t = warisLabels(locale);

  const [deceasedGender, setDeceasedGender] = useState<"male" | "female">("male");
  const [wivesCount, setWivesCount] = useState("0");
  const [hasHusband, setHasHusband] = useState(false);
  const [sons, setSons] = useState("0");
  const [daughters, setDaughters] = useState("0");
  const [fatherAlive, setFatherAlive] = useState(false);
  const [motherAlive, setMotherAlive] = useState(false);
  const [fullBrothers, setFullBrothers] = useState("0");
  const [fullSisters, setFullSisters] = useState("0");
  const [uterineSiblings, setUterineSiblings] = useState("0");

  const [estate, setEstate] = useState("");
  const [debt, setDebt] = useState("");
  const [funeralCost, setFuneralCost] = useState("");
  const [will, setWill] = useState("");

  const sonsN = toInt(sons);
  const daughtersN = toInt(daughters);
  const kalalah = sonsN === 0 && daughtersN === 0 && !fatherAlive;

  const input: WarisInput = useMemo(
    () => ({
      deceasedGender,
      wivesCount: toInt(wivesCount),
      hasHusband,
      sons: sonsN,
      daughters: daughtersN,
      fatherAlive,
      motherAlive,
      fullBrothers: toInt(fullBrothers),
      fullSisters: toInt(fullSisters),
      uterineSiblings: toInt(uterineSiblings),
    }),
    [deceasedGender, wivesCount, hasHusband, sonsN, daughtersN, fatherAlive, motherAlive, fullBrothers, fullSisters, uterineSiblings]
  );

  const result = useMemo(() => calculateWaris(input), [input]);

  const preDivision = Math.max(0, toNumber(estate) - toNumber(debt) - toNumber(funeralCost));
  const willCap = preDivision / 3;
  const willApplied = Math.min(toNumber(will), willCap);
  const netEstate = Math.max(0, preDivision - willApplied);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <p className="font-heading text-lg">👪 {t.title}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.deceasedGenderLabel}</span>
            <div className="mt-1 flex gap-2">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setDeceasedGender(g)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    deceasedGender === g
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  {g === "male" ? t.male : t.female}
                </button>
              ))}
            </div>
          </label>

          {deceasedGender === "male" ? (
            <label className="text-xs">
              <span className="text-[var(--color-text-secondary)]">{t.wivesCountLabel}</span>
              <input
                inputMode="numeric"
                value={wivesCount}
                onChange={(e) => setWivesCount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
              />
            </label>
          ) : (
            <label className="text-xs">
              <span className="text-[var(--color-text-secondary)]">{t.hasHusbandLabel}</span>
              <div className="mt-1 flex gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => setHasHusband(v)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      hasHusband === v
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {v ? t.yes : t.no}
                  </button>
                ))}
              </div>
            </label>
          )}

          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.sonsLabel}</span>
            <input
              inputMode="numeric"
              value={sons}
              onChange={(e) => setSons(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.daughtersLabel}</span>
            <input
              inputMode="numeric"
              value={daughters}
              onChange={(e) => setDaughters(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>

          {[
            { label: t.fatherAliveLabel, value: fatherAlive, set: setFatherAlive },
            { label: t.motherAliveLabel, value: motherAlive, set: setMotherAlive },
          ].map((f) => (
            <label key={f.label} className="text-xs">
              <span className="text-[var(--color-text-secondary)]">{f.label}</span>
              <div className="mt-1 flex gap-2">
                {[true, false].map((v) => (
                  <button
                    key={String(v)}
                    onClick={() => f.set(v)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                      f.value === v
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)]"
                    }`}
                  >
                    {v ? t.yes : t.no}
                  </button>
                ))}
              </div>
            </label>
          ))}
        </div>

        {kalalah && (
          <div className="mt-4 rounded-xl bg-black/5 p-4">
            <p className="text-[11px] text-[var(--color-text-secondary)]">{t.kalalahHint}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="text-xs">
                <span className="text-[var(--color-text-secondary)]">{t.fullBrothersLabel}</span>
                <input
                  inputMode="numeric"
                  value={fullBrothers}
                  onChange={(e) => setFullBrothers(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs">
                <span className="text-[var(--color-text-secondary)]">{t.fullSistersLabel}</span>
                <input
                  inputMode="numeric"
                  value={fullSisters}
                  onChange={(e) => setFullSisters(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs">
                <span className="text-[var(--color-text-secondary)]">{t.uterineSiblingsLabel}</span>
                <input
                  inputMode="numeric"
                  value={uterineSiblings}
                  onChange={(e) => setUterineSiblings(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
                />
              </label>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.estateLabel}</span>
            <input
              inputMode="decimal"
              value={estate}
              onChange={(e) => setEstate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.debtLabel}</span>
            <input
              inputMode="decimal"
              value={debt}
              onChange={(e) => setDebt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.funeralCostLabel}</span>
            <input
              inputMode="decimal"
              value={funeralCost}
              onChange={(e) => setFuneralCost(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="text-[var(--color-text-secondary)]">{t.willLabel}</span>
            <input
              inputMode="decimal"
              value={will}
              onChange={(e) => setWill(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            />
          </label>
        </div>
        {toNumber(will) > willCap && willCap > 0 && (
          <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">{t.willCapNote}</p>
        )}

        <div className="mt-4 flex items-center justify-between rounded-xl bg-black/5 p-4 text-sm">
          <span className="text-[var(--color-text-secondary)]">{t.netEstateLabel}</span>
          <span className="font-heading text-lg text-accent tabular-nums">{fmt(netEstate)}</span>
        </div>
      </section>


      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <p className="font-heading text-lg">{t.resultsTitle}</p>

        {result.noRecognizedHeir ? (
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{t.noRecognizedHeir}</p>
        ) : (
          <div className="mt-3 space-y-2">
            {result.heirs.map((h) => (
              <div key={h.key} className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 text-sm">
                <span>{t.heirNames[h.key] ?? h.key}</span>
                <span className="text-right">
                  <span className="text-[var(--color-text-secondary)]">{(h.fraction * 100).toFixed(2)}%</span>
                  {netEstate > 0 && (
                    <span className="ml-3 font-heading tabular-nums text-accent">{fmt(h.fraction * netEstate)}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {(result.umariyyatain || result.aul || result.radd) && (
          <div className="mt-4 space-y-1.5 rounded-xl bg-accent/10 p-3 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
            {result.umariyyatain && <p>{t.umariyyatainNote}</p>}
            {result.aul && <p>{t.aulNote}</p>}
            {result.radd && <p>{t.raddNote}</p>}
          </div>
        )}
      </section>

      <p className="text-center text-[11px] leading-relaxed text-[var(--color-text-secondary)]">{t.disclaimer}</p>
    </div>
  );
}
