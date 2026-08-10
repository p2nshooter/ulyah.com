"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HIJAIYAH } from "@/lib/hijaiyah";
import { speak as speakText } from "@/lib/speech";
import { kidsGamesLabels, type KidsGamesLabels } from "@/lib/kids-games-labels";
import { GrowGame } from "@/components/kids/GrowGame";
import { FlyGame } from "@/components/kids/FlyGame";
import { KidsCertificate } from "@/components/kids/KidsCertificate";
import {
  loadProgress,
  saveProgress,
  recordResult,
  recordOf,
  unlockedTier,
  totalStars,
  MAX_STARS,
  TIERS,
  TIER_RULES,
  type KidsProgress,
  type Tier,
} from "@/lib/kids-progress";

/**
 * Nine Qur'an-learning games for Al-Qur'an Kids, every one of them running on
 * the same five-tier ladder — very easy to very hard (owner: "bikin tingkatan
 * setiap game dari sangat mudah sampai sangat sulit"). A tier is unlocked by
 * clearing the one below it, progress is kept in the phone's own storage with
 * no account, and clearing the top tier of every core game earns a printable
 * hijaiyah certificate.
 *
 * Deliberately featherweight, because these ship to every visitor of a site
 * that must stay fast: NO game engine, NO canvas, NO images, NO new
 * dependencies and no network calls. Everything is derived from the hijaiyah
 * table already bundled for the letter pages, drawn with text + CSS, and the
 * sound uses the browser's own speech synthesis (nothing to download). The
 * whole feature is one client component behind its own route, so it is code-
 * split and costs the rest of the site nothing.
 */

type GameId =
  | "tebak-huruf"
  | "cari-huruf"
  | "pasangan"
  | "urutan"
  | "ingat"
  | "cepat"
  | "harakat"
  | "tumbuh"
  | "terbang";

/** The game menu. Icons live in code (they are not language), every word comes
 *  from the labels helper so all 28 locales are covered. */
const menu = (t: KidsGamesLabels): { id: GameId; icon: string; name: string; desc: string }[] => [
  { id: "tebak-huruf", icon: "🔤", name: t.guessName, desc: t.guessDesc },
  { id: "cari-huruf", icon: "👂", name: t.findName, desc: t.findDesc },
  { id: "pasangan", icon: "🃏", name: t.matchName, desc: t.matchDesc },
  { id: "urutan", icon: "🔢", name: t.orderName, desc: t.orderDesc },
  { id: "ingat", icon: "🧠", name: t.memoryName, desc: t.memoryDesc },
  { id: "cepat", icon: "⚡", name: t.speedName, desc: t.speedDesc },
  { id: "harakat", icon: "✍️", name: t.harakatName, desc: t.harakatDesc },
  { id: "tumbuh", icon: "🌱", name: t.growName, desc: t.growDesc },
  { id: "terbang", icon: "🕊️", name: t.flyName, desc: t.flyDesc },
];

const BEST_KEY = "ulyah:kids:games:best";
const shuffle = <T,>(a: T[]): T[] => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j]!, x[i]!];
  }
  return x;
};
const pick = <T,>(a: T[], n: number): T[] => shuffle(a).slice(0, n);

/** Speak an Arabic letter name. Routed through the shared narration engine so a
 *  game tapping letters takes the turn properly instead of colliding with a
 *  reader that happens to be running on the same page. */
function say(text: string, lang = "ar") {
  void speakText(text, lang, { rate: 0.85, owner: "kids" });
}

const EMPTY_PROGRESS: KidsProgress = { profile: { name: "", age: null }, games: {}, xp: 0, certificates: [] };

export function KidsGames({ locale }: { locale: string }) {
  const t = kidsGamesLabels(locale);
  const [game, setGame] = useState<GameId | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [best, setBest] = useState(0);
  // Starts empty so server and first client render agree, then hydrates from
  // the device on mount.
  const [progress, setProgress] = useState<KidsProgress>(EMPTY_PROGRESS);
  const progressRef = useRef(progress);

  useEffect(() => {
    const p = loadProgress();
    progressRef.current = p;
    setProgress(p);
    try {
      setBest(Number(localStorage.getItem(BEST_KEY) || 0));
    } catch {
      /* storage blocked — best score is just not remembered */
    }
  }, []);

  const saveBest = useCallback((score: number) => {
    setBest((b) => {
      if (score <= b) return b;
      try {
        localStorage.setItem(BEST_KEY, String(score));
      } catch {
        /* ignore */
      }
      return score;
    });
  }, []);

  /** A tier attempt ended: bank it, unlock the next one, remember the stars. */
  const finish = useCallback(
    (gameId: GameId, playedTier: Tier, score: number, passed: boolean) => {
      const next = recordResult(progressRef.current, gameId, playedTier, score, passed);
      progressRef.current = next;
      setProgress(next);
      saveProgress(next);
      saveBest(score);
    },
    [saveBest]
  );

  const applyProgress = useCallback((p: KidsProgress) => {
    progressRef.current = p;
    setProgress(p);
  }, []);

  // ── the menu ───────────────────────────────────────────────────────────
  if (!game) {
    const stars = totalStars(progress);
    return (
      <div>
        <div className="text-center">
          <h2 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-amber-100">{t.title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
              ⭐ {t.stars}: {stars}/{MAX_STARS}
            </span>
            {best > 0 && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
                🏆 {t.best}: {best}
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {menu(t).map((g) => {
            const rec = recordOf(progress, g.id);
            return (
              <button
                key={g.id}
                onClick={() => {
                  setGame(g.id);
                  setTier(null);
                }}
                className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-white p-4 text-left shadow-xs transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-amber-200 to-sky-200 text-2xl dark:from-amber-500/30 dark:to-sky-500/30">
                  {g.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-heading text-base font-bold text-slate-800 dark:text-amber-100">{g.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{g.desc}</span>
                  <span className="mt-0.5 block text-[11px] font-bold text-amber-600 dark:text-amber-300">
                    {"★".repeat(rec.stars)}
                    <span className="opacity-25">{"★".repeat(TIERS.length - rec.stars)}</span>
                  </span>
                </span>
                <span className="ml-auto shrink-0 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">{t.play}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-center font-heading text-lg font-bold text-slate-800 dark:text-amber-100">
            🏅 {t.certificate}
          </h3>
          <KidsCertificate t={t} locale={locale} progress={progress} setProgress={applyProgress} />
        </div>
      </div>
    );
  }

  const entry = menu(t).find((g) => g.id === game)!;

  // ── the tier picker ────────────────────────────────────────────────────
  if (tier === null) {
    const rec = recordOf(progress, game);
    const maxOpen = unlockedTier(progress, game);
    const tierName = [t.tier0, t.tier1, t.tier2, t.tier3, t.tier4];
    return (
      <div>
        <button onClick={() => setGame(null)} className="mb-3 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
          ← {t.back}
        </button>
        <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
          <p className="text-4xl">{entry.icon}</p>
          <h3 className="mt-1 font-heading text-xl font-extrabold text-slate-800 dark:text-amber-100">{entry.name}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{entry.desc}</p>
          <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t.chooseLevel}</p>
          <div className="mt-2 grid gap-2">
            {TIERS.map((tr) => {
              const locked = tr > maxOpen;
              const cleared = rec.cleared >= tr;
              return (
                <button
                  key={tr}
                  disabled={locked}
                  onClick={() => setTier(tr)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                    locked
                      ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-900"
                      : "border-emerald-200 bg-emerald-50 hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-700"
                  }`}
                >
                  <span className="text-lg">{locked ? "🔒" : cleared ? "⭐" : "▶"}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800 dark:text-amber-100">{tierName[tr]}</span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                      {locked
                        ? t.locked
                        : `${t.round} ${TIER_RULES[tr].rounds} · ❤️ ${TIER_RULES[tr].lives}${cleared ? ` · ${t.cleared}` : ""}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {rec.best > 0 && (
            <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              {t.best}: {rec.best}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── play ───────────────────────────────────────────────────────────────
  const onFinish = (score: number, passed: boolean) => finish(game, tier, score, passed);
  const replay = (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <button
        onClick={() => setTier(null)}
        className="rounded-full border-2 border-emerald-300 px-5 py-2 text-sm font-bold text-emerald-700 dark:border-slate-600 dark:text-emerald-300"
      >
        {t.chooseLevel}
      </button>
      <button onClick={() => setGame(null)} className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white">
        {t.back}
      </button>
    </div>
  );

  return (
    <div>
      <button onClick={() => setTier(null)} className="mb-3 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
        ← {entry.name}
      </button>
      {game === "tebak-huruf" && <QuizGame key={`q-${tier}`} t={t} tier={tier} mode="letter" onFinish={onFinish} />}
      {game === "cari-huruf" && <QuizGame key={`n-${tier}`} t={t} tier={tier} mode="name" onFinish={onFinish} />}
      {game === "pasangan" && <MatchGame key={`m-${tier}`} t={t} tier={tier} onFinish={onFinish} />}
      {game === "urutan" && <OrderGame key={`o-${tier}`} t={t} tier={tier} onFinish={onFinish} />}
      {game === "ingat" && <MemoryGame key={`i-${tier}`} t={t} tier={tier} onFinish={onFinish} />}
      {game === "cepat" && <SpeedGame key={`s-${tier}`} t={t} tier={tier} onFinish={onFinish} />}
      {game === "harakat" && <HarakatGame key={`h-${tier}`} t={t} tier={tier} onFinish={onFinish} />}
      {game === "tumbuh" && <GrowGame key={`g-${tier}`} t={t} tier={tier} locale={locale} onFinish={onFinish} />}
      {game === "terbang" && <FlyGame key={`f-${tier}`} t={t} tier={tier} onFinish={onFinish} />}
      {replay}
    </div>
  );
}

type T = KidsGamesLabels;

/** Shared scoreboard strip so every game reads the same at a glance. */
function Board({ t, round, rounds, lives, score }: { t: T; round: number; rounds: number; lives: number; score: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
      <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
        {t.round} {Math.min(round + 1, rounds)}/{rounds}
      </span>
      <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">❤️ {lives}</span>
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
        {t.score}: {score}
      </span>
    </div>
  );
}

function Verdict({ t, passed, score }: { t: T; passed: boolean; score: number }) {
  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <p className="text-5xl">{passed ? "🏆" : "💪"}</p>
      <p className="mt-2 font-heading text-lg font-bold text-slate-800 dark:text-amber-100">{passed ? t.passed : t.failed}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {t.finalScore}: {score}
      </p>
    </div>
  );
}

/**
 * A tiny state machine every game shares: count rounds, spend lives, and settle
 * exactly once. Without the `settled` guard a game that loses its last life on
 * the final round would report its result twice and double-count the stars.
 */
function useRun(rounds: number, lives: number, onFinish: (score: number, passed: boolean) => void) {
  const [round, setRound] = useState(0);
  const [livesLeft, setLivesLeft] = useState(lives);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<null | boolean>(null);
  const settled = useRef(false);

  const step = useCallback(
    (gained: number, ok: boolean) => {
      if (settled.current) return;
      const nextScore = score + gained;
      const nextLives = ok ? livesLeft : livesLeft - 1;
      setScore(nextScore);
      if (!ok) setLivesLeft(nextLives);
      if (nextLives <= 0) {
        settled.current = true;
        setDone(false);
        onFinish(nextScore, false);
        return;
      }
      if (round + 1 >= rounds) {
        settled.current = true;
        setDone(true);
        onFinish(nextScore, true);
        return;
      }
      setRound((r) => r + 1);
    },
    [score, livesLeft, round, rounds, onFinish]
  );

  return { round, livesLeft, score, done, step };
}

/** Multiple-choice: show a letter → pick its name, or hear a name → pick the letter. */
function QuizGame({
  t,
  tier,
  mode,
  onFinish,
}: {
  t: T;
  tier: Tier;
  mode: "letter" | "name";
  onFinish: (score: number, passed: boolean) => void;
}) {
  const rules = TIER_RULES[tier];
  const { round, livesLeft, score, done, step } = useRun(rules.rounds, rules.lives, onFinish);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);

  const q = useMemo(() => {
    const answer = HIJAIYAH[Math.floor(Math.random() * HIJAIYAH.length)]!;
    const others = pick(
      HIJAIYAH.filter((h) => h.name !== answer.name),
      Math.max(1, rules.choices - 1)
    );
    return { answer, options: shuffle([answer, ...others]) };
  }, [round, rules.choices]);

  useEffect(() => {
    if (mode === "name") say(q.answer.arName);
  }, [q, mode]);

  function choose(name: string) {
    if (feedback || done !== null) return;
    const ok = name === q.answer.name;
    setFeedback(ok ? "ok" : "no");
    if (ok) say(q.answer.arName);
    window.setTimeout(() => {
      setFeedback(null);
      step(ok ? (tier + 1) * 10 : 0, ok);
    }, 800);
  }

  if (done !== null) return <Verdict t={t} passed={done} score={score} />;

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <Board t={t} round={round} rounds={rules.rounds} lives={livesLeft} score={score} />

      <div className="mt-5 grid min-h-28 place-items-center">
        {mode === "letter" ? (
          <span className="font-arabic text-7xl leading-none text-emerald-700 dark:text-emerald-300">{q.answer.ar}</span>
        ) : (
          <button
            onClick={() => say(q.answer.arName)}
            className="rounded-2xl bg-sky-500 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:brightness-110"
          >
            {t.listen}
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {q.options.map((o) => (
          <button
            key={o.name}
            onClick={() => choose(o.name)}
            className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            {mode === "letter" ? o.name : <span className="font-arabic text-3xl">{o.ar}</span>}
          </button>
        ))}
      </div>

      {feedback && (
        <p className={`mt-4 text-lg font-extrabold ${feedback === "ok" ? "text-emerald-600" : "text-rose-500"}`}>
          {feedback === "ok" ? `${t.correct} 🎉` : `${t.wrong} 💪`}
        </p>
      )}
    </div>
  );
}

/** How many pairs / letters a tier puts on the board. */
const SPREAD: Record<Tier, number> = { 0: 3, 1: 4, 2: 5, 3: 6, 4: 8 };

/** Memory pairs: flip cards, match each Arabic letter with its Latin name. */
function MatchGame({ t, tier, onFinish }: { t: T; tier: Tier; onFinish: (score: number, passed: boolean) => void }) {
  const rules = TIER_RULES[tier];
  const size = SPREAD[tier];
  // A wrong pair costs a life; the tier is cleared by finding every pair before
  // the lives run out. More pairs AND fewer lives as the tier climbs.
  const budget = rules.lives + size;

  const cards = useMemo(() => {
    const chosen = pick(HIJAIYAH, size);
    return shuffle([
      ...chosen.map((h, i) => ({ id: `a${i}`, pair: i, face: h.ar, arabic: true })),
      ...chosen.map((h, i) => ({ id: `b${i}`, pair: i, face: h.name, arabic: false })),
    ]);
  }, [size]);

  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState<null | boolean>(null);
  const settled = useRef(false);

  const settle = useCallback(
    (passed: boolean, score: number) => {
      if (settled.current) return;
      settled.current = true;
      setDone(passed);
      onFinish(score, passed);
    },
    [onFinish]
  );

  useEffect(() => {
    if (open.length !== 2 || done !== null) return;
    const [i, j] = open as [number, number];
    if (cards[i]!.pair === cards[j]!.pair) {
      const nextFound = [...found, cards[i]!.pair];
      setFound(nextFound);
      setOpen([]);
      if (nextFound.length === size) settle(true, nextFound.length * (tier + 1) * 10);
    } else {
      const nextMisses = misses + 1;
      setMisses(nextMisses);
      const timer = setTimeout(() => setOpen([]), 800);
      if (nextMisses >= budget) settle(false, found.length * (tier + 1) * 10);
      return () => clearTimeout(timer);
    }
  }, [open, cards, done, found, misses, size, budget, tier, settle]);

  if (done !== null) return <Verdict t={t} passed={done} score={found.length * (tier + 1) * 10} />;

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
          ❤️ {budget - misses}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {found.length}/{size}
        </span>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{t.hint}</p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {cards.map((c, i) => {
          const shown = open.includes(i) || found.includes(c.pair);
          return (
            <button
              key={c.id}
              onClick={() => !shown && open.length < 2 && setOpen((o) => [...o, i])}
              className={`grid h-16 place-items-center rounded-xl border-2 text-lg font-bold transition ${
                shown
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100"
                  : "border-slate-200 bg-linear-to-br from-sky-200 to-amber-200 text-transparent dark:border-slate-600 dark:from-slate-600 dark:to-slate-700"
              }`}
            >
              {shown ? <span className={c.arabic ? "font-arabic text-3xl" : "text-sm"}>{c.face}</span> : "؟"}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Tap the shuffled letters back into their hijaiyah order. */
function OrderGame({ t, tier, onFinish }: { t: T; tier: Tier; onFinish: (score: number, passed: boolean) => void }) {
  const rules = TIER_RULES[tier];
  const size = SPREAD[tier];
  const rounds = Math.max(2, Math.round(rules.rounds / 3));
  const { round, livesLeft, score, done, step } = useRun(rounds, rules.lives, onFinish);

  const target = useMemo(() => {
    const start = Math.floor(Math.random() * (HIJAIYAH.length - size));
    return HIJAIYAH.slice(start, start + size);
  }, [round, size]);

  const [pool, setPool] = useState(() => shuffle(target));
  const [placed, setPlaced] = useState<typeof target>([]);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    setPool(shuffle(target));
    setPlaced([]);
  }, [target]);

  function tap(letter: (typeof target)[number]) {
    if (done !== null) return;
    const nextIdx = placed.length;
    if (letter.name === target[nextIdx]!.name) {
      const nextPlaced = [...placed, letter];
      setPlaced(nextPlaced);
      setPool((p) => p.filter((x) => x.name !== letter.name));
      say(letter.arName);
      if (nextPlaced.length === target.length) window.setTimeout(() => step(size * (tier + 1) * 5, true), 500);
    } else {
      setWrong(true);
      window.setTimeout(() => setWrong(false), 600);
      step(0, false);
    }
  }

  if (done !== null) return <Verdict t={t} passed={done} score={score} />;

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <Board t={t} round={round} rounds={rounds} lives={livesLeft} score={score} />
      <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">{t.orderHint}</p>

      <div className="mt-3 flex min-h-18 flex-wrap items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10" dir="rtl">
        {placed.map((h) => (
          <span key={h.name} className="font-arabic rounded-lg bg-white px-3 py-1 text-3xl text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-200">
            {h.ar}
          </span>
        ))}
        {placed.length === 0 && <span className="text-xs text-slate-400">…</span>}
      </div>

      <div className={`mt-4 flex flex-wrap justify-center gap-2 ${wrong ? "animate-pulse" : ""}`} dir="rtl">
        {pool.map((h) => (
          <button
            key={h.name}
            onClick={() => tap(h)}
            className="font-arabic rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-2 text-3xl text-slate-700 transition hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {h.ar}
          </button>
        ))}
      </div>
      {wrong && <p className="mt-3 font-bold text-rose-500">{t.wrong}</p>}
    </div>
  );
}

/** Remember the letters: a sequence flashes, the child repeats it. The
 *  sequence grows by one each round, and the tier sets how long it must get. */
function MemoryGame({ t, tier, onFinish }: { t: T; tier: Tier; onFinish: (score: number, passed: boolean) => void }) {
  const rules = TIER_RULES[tier];
  const rounds = Math.max(3, Math.round(rules.rounds / 2));
  const { round, livesLeft, score, done, step } = useRun(rounds, rules.lives, onFinish);

  const board = useMemo(() => pick(HIJAIYAH, 4 + tier), [tier]);
  const [seq, setSeq] = useState<number[]>([]);
  const [shownAt, setShownAt] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "show" | "input">("idle");
  const [stepIdx, setStepIdx] = useState(0);

  // Round n shows a sequence of n + 2 letters, so it lengthens as you go.
  function begin() {
    setSeq(Array.from({ length: round + 2 }, () => Math.floor(Math.random() * board.length)));
    setStepIdx(0);
    setPhase("show");
  }

  // Flash the sequence, one letter at a time, then hand over to the child.
  useEffect(() => {
    if (phase !== "show" || seq.length === 0) return;
    let i = 0;
    setShownAt(seq[0]!);
    const gap = Math.max(380, 760 - tier * 90); // faster at higher tiers
    const id = window.setInterval(() => {
      i++;
      if (i >= seq.length) {
        window.clearInterval(id);
        setShownAt(-1);
        setPhase("input");
        return;
      }
      setShownAt(-1);
      window.setTimeout(() => setShownAt(seq[i]!), 140);
    }, gap);
    return () => window.clearInterval(id);
  }, [phase, seq, tier]);

  function tap(i: number) {
    if (phase !== "input" || done !== null) return;
    if (seq[stepIdx] === i) {
      say(board[i]!.arName);
      if (stepIdx + 1 === seq.length) {
        setPhase("idle");
        setSeq([]);
        step(seq.length * (tier + 1) * 5, true);
      } else {
        setStepIdx((p) => p + 1);
      }
    } else {
      setPhase("idle");
      setSeq([]);
      step(0, false);
    }
  }

  if (done !== null) return <Verdict t={t} passed={done} score={score} />;

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <Board t={t} round={round} rounds={rounds} lives={livesLeft} score={score} />

      <p className="mt-3 h-5 text-sm font-bold text-slate-600 dark:text-slate-300">
        {phase === "show" ? t.watch : phase === "input" ? t.yourTurn : ""}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {board.map((h, i) => (
          <button
            key={h.name}
            onClick={() => tap(i)}
            className={`font-arabic grid h-20 place-items-center rounded-2xl border-2 text-4xl transition ${
              shownAt === i
                ? "scale-105 border-amber-400 bg-amber-200 text-amber-900"
                : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            }`}
          >
            {h.ar}
          </button>
        ))}
      </div>

      {phase === "idle" && (
        <button onClick={begin} className="mt-4 rounded-full bg-emerald-500 px-6 py-2 text-sm font-bold text-white">
          {t.start}
        </button>
      )}
    </div>
  );
}

/** Quick & correct: beat the target score before the clock runs out. */
const SPEED_SECONDS: Record<Tier, number> = { 0: 45, 1: 40, 2: 35, 3: 30, 4: 25 };
const SPEED_TARGET: Record<Tier, number> = { 0: 30, 1: 50, 2: 75, 3: 100, 4: 130 };

function SpeedGame({ t, tier, onFinish }: { t: T; tier: Tier; onFinish: (score: number, passed: boolean) => void }) {
  const rules = TIER_RULES[tier];
  const seconds = SPEED_SECONDS[tier];
  const target = SPEED_TARGET[tier];

  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(seconds);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState<null | boolean>(null);
  const settled = useRef(false);

  const q = useMemo(() => {
    const answer = HIJAIYAH[Math.floor(Math.random() * HIJAIYAH.length)]!;
    const others = pick(
      HIJAIYAH.filter((h) => h.name !== answer.name),
      Math.max(1, rules.choices - 1)
    );
    return { answer, options: shuffle([answer, ...others]) };
  }, [round, rules.choices]);

  useEffect(() => {
    if (!running || done !== null) return;
    if (left <= 0) {
      setRunning(false);
      if (!settled.current) {
        settled.current = true;
        const passed = score >= target;
        setDone(passed);
        onFinish(score, passed);
      }
      return;
    }
    const id = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(id);
  }, [running, left, score, target, done, onFinish]);

  function choose(name: string) {
    if (!running) return;
    if (name === q.answer.name) setScore((s) => s + 5);
    else setScore((s) => Math.max(0, s - 2)); // a wrong tap costs, so guessing doesn't pay
    setRound((r) => r + 1);
  }

  if (done !== null) return <Verdict t={t} passed={done} score={score} />;

  if (!running) {
    return (
      <div className="rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
        <p className="text-5xl">⚡</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.speedDesc}</p>
        <p className="mt-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
          {t.goal}: {target} · ⏱ {seconds}s
        </p>
        <button onClick={() => setRunning(true)} className="mt-4 rounded-full bg-emerald-500 px-8 py-3 text-base font-bold text-white">
          {t.start}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
        <span className={`rounded-full px-3 py-1 ${left <= 5 ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"}`}>
          ⏱ {t.timeLeft}: {left}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {t.score}: {score}/{target}
        </span>
      </div>
      <div className="mt-5 grid min-h-24 place-items-center">
        <span className="font-arabic text-7xl leading-none text-emerald-700 dark:text-emerald-300">{q.answer.ar}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {q.options.map((o) => (
          <button
            key={o.name}
            onClick={() => choose(o.name)}
            className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 transition hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Guess the harakat. The mark pool widens with the tier — the three short
 * vowels first, then sukun and tasydid, then the three tanwin — so "very hard"
 * covers everything a child meets in Iqro 4-6, not just a/i/u.
 */
function HarakatGame({ t, tier, onFinish }: { t: T; tier: Tier; onFinish: (score: number, passed: boolean) => void }) {
  const rules = TIER_RULES[tier];
  const { round, livesLeft, score, done, step } = useRun(rules.rounds, rules.lives, onFinish);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);

  const MARKS = useMemo(() => {
    const base = [
      { mark: "َ", label: t.fathah },
      { mark: "ِ", label: t.kasrah },
      { mark: "ُ", label: t.dhammah },
    ];
    if (tier >= 1) base.push({ mark: "ْ", label: t.sukun });
    if (tier >= 2) base.push({ mark: "ّ", label: t.tasydid });
    if (tier >= 3) base.push({ mark: "ً", label: t.tanwinFathah }, { mark: "ٍ", label: t.tanwinKasrah });
    if (tier >= 4) base.push({ mark: "ٌ", label: t.tanwinDhammah });
    return base;
  }, [t, tier]);

  const q = useMemo(() => {
    // Alif carries no harakat of its own in these drills — skip it.
    const letters = HIJAIYAH.filter((h) => h.ar !== "ا");
    const letter = letters[Math.floor(Math.random() * letters.length)]!;
    const m = MARKS[Math.floor(Math.random() * MARKS.length)]!;
    const wrong = pick(
      MARKS.filter((x) => x.label !== m.label),
      Math.max(1, rules.choices - 1)
    );
    return { letter, m, options: shuffle([m, ...wrong]) };
  }, [round, MARKS, rules.choices]);

  function choose(label: string) {
    if (feedback || done !== null) return;
    const ok = label === q.m.label;
    setFeedback(ok ? "ok" : "no");
    window.setTimeout(() => {
      setFeedback(null);
      step(ok ? (tier + 1) * 10 : 0, ok);
    }, 750);
  }

  if (done !== null) return <Verdict t={t} passed={done} score={score} />;

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-xs dark:border-slate-700 dark:bg-slate-800">
      <Board t={t} round={round} rounds={rules.rounds} lives={livesLeft} score={score} />
      <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">{t.whichHarakat}</p>
      <div className="mt-3 grid min-h-28 place-items-center">
        <span className="font-arabic text-7xl leading-none text-emerald-700 dark:text-emerald-300">{q.letter.ar + q.m.mark}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {q.options.map((m) => (
          <button
            key={m.label}
            onClick={() => choose(m.label)}
            className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            {m.label}
          </button>
        ))}
      </div>
      {feedback && (
        <p className={`mt-3 text-lg font-extrabold ${feedback === "ok" ? "text-emerald-600" : "text-rose-500"}`}>
          {feedback === "ok" ? `${t.correct} 🎉` : `${t.wrong} 💪`}
        </p>
      )}
    </div>
  );
}
