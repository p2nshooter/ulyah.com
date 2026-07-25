"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HIJAIYAH } from "@/lib/hijaiyah";
import { TIER_RULES, type Tier } from "@/lib/kids-progress";
import type { KidsGamesLabels } from "@/lib/kids-games-labels";

/**
 * "Tangkap Huruf Terbang" — letters drift across the sky and the child taps the
 * one that was called for. This trains the skill the owner asked for: not just
 * knowing a letter but SPOTTING it quickly among lookalikes.
 *
 * The drift is pure CSS (see styles/components/kids.css) so nothing runs per
 * frame in JS; the component only holds a per-round timer. Higher tiers send
 * more letters, faster, and pick decoys that look like the target (ب/ت/ث,
 * ج/ح/خ …) rather than random ones — that is what makes "very hard" hard.
 */

/** Letters that are told apart only by their dots or a small tail. */
const LOOKALIKES: string[][] = [
  ["ب", "ت", "ث", "ن", "ي"],
  ["ج", "ح", "خ"],
  ["د", "ذ"],
  ["ر", "ز"],
  ["س", "ش"],
  ["ص", "ض"],
  ["ط", "ظ"],
  ["ع", "غ"],
  ["ف", "ق"],
  ["ك", "ل"],
  ["و", "ة"],
];

/** Seconds a letter takes to cross, per tier — the difficulty dial. */
const CROSS_SECONDS: Record<Tier, number> = { 0: 11, 1: 9, 2: 7.5, 3: 6, 4: 4.5 };

interface Flyer {
  key: number;
  ar: string;
  name: string;
  top: number;
  delay: number;
  arc: number;
  caught: boolean;
}

const shuffle = <T,>(a: T[]): T[] => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j]!, x[i]!];
  }
  return x;
};

export function FlyGame({
  t,
  tier,
  onFinish,
}: {
  t: KidsGamesLabels;
  tier: Tier;
  onFinish: (score: number, passed: boolean) => void;
}) {
  const rules = TIER_RULES[tier];
  const cross = CROSS_SECONDS[tier];

  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(rules.lives);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<null | "pass" | "fail">(null);
  const [flash, setFlash] = useState<"ok" | "no" | null>(null);
  const settled = useRef(false);

  // The target for this round, plus the decoys flying alongside it. Decoys are
  // drawn from the target's lookalike family first so the eye has to work.
  const { target, flyers } = useMemo(() => {
    const pickTarget = HIJAIYAH[Math.floor(Math.random() * HIJAIYAH.length)]!;
    const family = LOOKALIKES.find((f) => f.includes(pickTarget.ar)) ?? [];
    const near = HIJAIYAH.filter((h) => h.ar !== pickTarget.ar && family.includes(h.ar));
    const far = HIJAIYAH.filter((h) => h.ar !== pickTarget.ar && !family.includes(h.ar));
    const decoys = [...shuffle(near), ...shuffle(far)].slice(0, rules.choices);
    const all = shuffle([pickTarget, ...decoys]);
    return {
      target: pickTarget,
      flyers: all.map((h, i) => ({
        key: i,
        ar: h.ar,
        name: h.name,
        top: 6 + (i * 76) / Math.max(1, all.length),
        delay: Math.random() * (cross * 0.45),
        arc: (i % 2 === 0 ? 1 : -1) * (8 + Math.random() * 18),
        caught: false,
      })) as Flyer[],
    };
  }, [round, rules.choices, cross]);

  const [caught, setCaught] = useState<number[]>([]);

  const finish = useCallback(
    (final: number, passed: boolean) => {
      if (settled.current) return;
      settled.current = true;
      setDone(passed ? "pass" : "fail");
      onFinish(final, passed);
    },
    [onFinish]
  );

  const nextRound = useCallback(
    (delta: number, hit: boolean) => {
      setFlash(hit ? "ok" : "no");
      window.setTimeout(() => setFlash(null), 500);
      const nextScore = score + delta;
      setScore(nextScore);
      const nextLives = hit ? lives : lives - 1;
      if (!hit) setLives(nextLives);
      if (nextLives <= 0) {
        finish(nextScore, false);
        return;
      }
      if (round + 1 >= rules.rounds) {
        finish(nextScore, true);
        return;
      }
      setCaught([]);
      setRound((r) => r + 1);
    },
    [score, lives, round, rules.rounds, finish]
  );

  // A round ends on its own once the last letter has flown off screen.
  useEffect(() => {
    if (done) return;
    const slowest = Math.max(...flyers.map((f) => f.delay)) + cross;
    const id = window.setTimeout(() => nextRound(0, false), slowest * 1000 + 200);
    return () => window.clearTimeout(id);
    // nextRound is intentionally not a dep: it changes every render and the
    // timer must be armed once per round.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, done, flyers, cross]);

  function tap(f: Flyer) {
    if (done || caught.includes(f.key)) return;
    setCaught((c) => [...c, f.key]);
    if (f.ar === target.ar) nextRound((tier + 1) * 10, true);
    else nextRound(0, false);
  }

  if (done) {
    return (
      <div className="rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-5xl">{done === "pass" ? "🏆" : "💪"}</p>
        <p className="mt-2 font-heading text-lg font-bold text-slate-800 dark:text-amber-100">
          {done === "pass" ? t.passed : t.failed}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t.finalScore}: {score}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
          {t.round} {round + 1}/{rules.rounds}
        </span>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
          ❤️ {lives}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {t.score}: {score}
        </span>
      </div>

      <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">{t.catchThis}</p>
      <p className="font-heading text-base font-extrabold text-emerald-700 dark:text-emerald-300">
        <span className="font-arabic text-3xl align-middle">{target.ar}</span>
        <span className="ml-2 align-middle">{target.name}</span>
      </p>

      <div className="relative mt-3 h-56 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-50 dark:from-slate-700 dark:to-slate-900">
        {flyers.map((f) => (
          <div
            key={`${round}-${f.key}`}
            className="kids-fly-track"
            style={
              {
                top: `${f.top}%`,
                animationDuration: `${cross}s`,
                animationDelay: `${f.delay}s`,
                "--fly-arc": `${f.arc}px`,
              } as React.CSSProperties
            }
          >
            <button
              onClick={() => tap(f)}
              aria-label={f.name}
              className={`font-arabic grid h-12 w-12 place-items-center rounded-full bg-white/90 text-3xl text-emerald-800 shadow-md dark:bg-slate-800/90 dark:text-emerald-200 ${
                caught.includes(f.key) ? "kids-fly-pop" : "kids-fly-letter"
              }`}
            >
              {f.ar}
            </button>
          </div>
        ))}
        {flash && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center text-5xl">
            {flash === "ok" ? "✅" : "💨"}
          </span>
        )}
      </div>
      {flash === "no" && <p className="mt-2 text-sm font-bold text-rose-500">{t.missed}</p>}
    </div>
  );
}
