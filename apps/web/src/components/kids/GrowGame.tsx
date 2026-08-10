"use client";

import { useEffect, useMemo, useState } from "react";
import { GROW_TIERS, type GrowItem } from "@/lib/kids-tumbuh";
import { TIER_RULES, type Tier } from "@/lib/kids-progress";
import type { KidsGamesLabels } from "@/lib/kids-games-labels";

/**
 * "Tumbuh Huruf" — assemble the pieces in order and watch a single letter grow
 * into a syllable, a word, and finally a whole phrase. Difficulty is the tier:
 * higher tiers give longer items, fewer lives and more decoy pieces.
 */
export function GrowGame({
  t,
  tier,
  locale,
  onFinish,
}: {
  t: KidsGamesLabels;
  tier: Tier;
  locale: string;
  onFinish: (score: number, passed: boolean) => void;
}) {
  const rules = TIER_RULES[tier];
  const pool = GROW_TIERS[tier]!;

  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(rules.lives);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [done, setDone] = useState<null | "pass" | "fail">(null);
  const [shake, setShake] = useState(false);

  const item: GrowItem = useMemo(() => pool[round % pool.length]!, [pool, round]);

  // The pieces to tap: the real ones, shuffled, plus decoys drawn from other
  // items at this tier so a higher tier really is harder to read.
  const tray = useMemo(() => {
    const decoyCount = Math.max(0, rules.choices - item.parts.length);
    const others = pool
      .filter((x) => x.whole !== item.whole)
      .flatMap((x) => x.parts)
      .filter((x) => !item.parts.includes(x));
    const decoys = others.sort(() => Math.random() - 0.5).slice(0, decoyCount);
    return [...item.parts, ...decoys].sort(() => Math.random() - 0.5);
  }, [item, pool, rules.choices]);

  useEffect(() => {
    setPlaced([]);
  }, [item]);

  function tap(piece: string) {
    if (done) return;
    const nextIdx = placed.length;
    if (item.parts[nextIdx] === piece) {
      const nowPlaced = [...placed, piece];
      setPlaced(nowPlaced);
      if (nowPlaced.length === item.parts.length) {
        const s = score + (tier + 1) * 10;
        setScore(s);
        window.setTimeout(() => {
          if (round + 1 >= rules.rounds) {
            setDone("pass");
            onFinish(s, true);
          } else {
            setRound((r) => r + 1);
          }
        }, 850);
      }
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
      const left = lives - 1;
      setLives(left);
      if (left <= 0) {
        setDone("fail");
        onFinish(score, false);
      }
    }
  }

  const complete = placed.length === item.parts.length;

  if (done) {
    return (
      <div className="rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
        <p className="text-5xl">{done === "pass" ? "🏆" : "💪"}</p>
        <p className="mt-2 font-heading text-lg font-bold text-slate-800 dark:text-amber-100">
          {done === "pass" ? t.passed : t.failed}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t.score}: {score}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
          {t.round} {round + 1}/{rules.rounds}
        </span>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
          ❤️ {t.lives}: {lives}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {t.score}: {score}
        </span>
      </div>

      {/* The growing line */}
      <div
        dir="rtl"
        className={`mt-5 flex min-h-24 flex-wrap items-center justify-center gap-1 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10 ${shake ? "animate-pulse" : ""}`}
      >
        {placed.length === 0 ? (
          <span className="text-xs text-slate-400">…</span>
        ) : (
          placed.map((p, i) => (
            <span key={i} className="font-arabic text-4xl text-emerald-700 dark:text-emerald-200">
              {p}
            </span>
          ))
        )}
      </div>

      {complete && (
        <div className="mt-3">
          <p className="font-arabic text-3xl text-emerald-700 dark:text-emerald-200" dir="rtl">
            {item.whole}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{item.latin}</p>
          {item.meaning && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.meaning}: {locale === "id" ? item.meaning.id : item.meaning.en}
            </p>
          )}
        </div>
      )}

      {!complete && (
        <>
          <p className="mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">{t.tapInOrder}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2" dir="rtl">
            {tray.map((piece, i) => (
              <button
                key={`${piece}-${i}`}
                onClick={() => tap(piece)}
                disabled={placed.includes(piece)}
                className="font-arabic rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2 text-3xl text-slate-700 transition hover:border-emerald-400 disabled:opacity-30 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              >
                {piece}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
