"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HIJAIYAH } from "@/lib/hijaiyah";
import { kidsGamesLabels, type KidsGamesLabels } from "@/lib/kids-games-labels";

/**
 * Seven small Qur'an-learning games for Al-Qur'an Kids, including a leveled
 * memory game whose sequence grows as the child succeeds.
 *
 * Deliberately featherweight, because these ship to every visitor of a site
 * that must stay fast: NO game engine, NO canvas, NO images, NO new
 * dependencies and no network calls. Everything is derived from the hijaiyah
 * table already bundled for the letter pages, drawn with text + CSS, and the
 * sound uses the browser's own speech synthesis (nothing to download). The
 * whole feature is one client component behind its own route, so it is code-
 * split and costs the rest of the site nothing.
 */

type GameId = "tebak-huruf" | "cari-huruf" | "pasangan" | "urutan" | "ingat" | "cepat" | "harakat";

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

/** Speak an Arabic letter name with the browser's own voice (no download). */
function say(text: string, lang = "ar") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = synth.getVoices().find((vc) => vc.lang?.toLowerCase().startsWith(lang));
  if (v) u.voice = v;
  u.lang = v?.lang ?? "ar-SA";
  u.rate = 0.85;
  synth.speak(u);
}

export function KidsGames({ locale }: { locale: string }) {
  const t = kidsGamesLabels(locale);
  const [game, setGame] = useState<GameId | null>(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
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

  if (!game) {
    return (
      <div>
        <div className="text-center">
          <h2 className="font-heading text-2xl font-extrabold text-slate-800 dark:text-amber-100">{t.title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.subtitle}</p>
          {best > 0 && (
            <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
              🏆 {t.best}: {best}
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {menu(t).map((g) => (
            <button
              key={g.id}
              onClick={() => setGame(g.id)}
              className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-sky-200 text-2xl dark:from-amber-500/30 dark:to-sky-500/30">
                {g.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-base font-bold text-slate-800 dark:text-amber-100">{g.name}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{g.desc}</span>
              </span>
              <span className="ml-auto shrink-0 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">{t.play}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setGame(null)} className="mb-3 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
        ← {t.back}
      </button>
      {game === "tebak-huruf" && <QuizGame t={t} mode="letter" onScore={saveBest} />}
      {game === "cari-huruf" && <QuizGame t={t} mode="name" onScore={saveBest} />}
      {game === "pasangan" && <MatchGame t={t} />}
      {game === "urutan" && <OrderGame t={t} />}
      {game === "ingat" && <MemoryGame t={t} onScore={saveBest} />}
      {game === "cepat" && <SpeedGame t={t} onScore={saveBest} />}
      {game === "harakat" && <HarakatGame t={t} onScore={saveBest} />}
    </div>
  );
}

type T = KidsGamesLabels;

/** Multiple-choice: show a letter → pick its name, or hear a name → pick the letter. */
function QuizGame({ t, mode, onScore }: { t: T; mode: "letter" | "name"; onScore: (n: number) => void }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);

  const q = useMemo(() => {
    const answer = HIJAIYAH[Math.floor(Math.random() * HIJAIYAH.length)]!;
    const others = pick(
      HIJAIYAH.filter((h) => h.name !== answer.name),
      3
    );
    return { answer, options: shuffle([answer, ...others]) };
  }, [round]);

  useEffect(() => {
    if (mode === "name") say(q.answer.arName);
  }, [q, mode]);

  function choose(name: string) {
    if (feedback) return;
    if (name === q.answer.name) {
      const s = score + 10;
      setScore(s);
      setStreak((k) => k + 1);
      setFeedback("ok");
      onScore(s);
      say(q.answer.arName);
    } else {
      setStreak(0);
      setFeedback("no");
    }
    setTimeout(() => {
      setFeedback(null);
      setRound((r) => r + 1);
    }, 900);
  }

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-center gap-4 text-xs font-bold">
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {t.score}: {score}
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
          🔥 {t.streak}: {streak}
        </span>
      </div>

      <div className="mt-5 grid min-h-[7rem] place-items-center">
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

/** Memory pairs: flip cards, match each Arabic letter with its Latin name. */
function MatchGame({ t }: { t: T }) {
  const [seed, setSeed] = useState(0);
  const cards = useMemo(() => {
    const six = pick(HIJAIYAH, 6);
    return shuffle([
      ...six.map((h, i) => ({ id: `a${i}`, pair: i, face: h.ar, arabic: true })),
      ...six.map((h, i) => ({ id: `b${i}`, pair: i, face: h.name, arabic: false })),
    ]);
  }, [seed]);

  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    if (open.length !== 2) return;
    const [i, j] = open as [number, number];
    setMoves((m) => m + 1);
    if (cards[i]!.pair === cards[j]!.pair) {
      setFound((f) => [...f, cards[i]!.pair]);
      setOpen([]);
    } else {
      const timer = setTimeout(() => setOpen([]), 800);
      return () => clearTimeout(timer);
    }
  }, [open, cards]);

  const complete = found.length === 6;

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {t.moves}: {moves} · {t.hint}
      </p>
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
                  : "border-slate-200 bg-gradient-to-br from-sky-200 to-amber-200 text-transparent dark:border-slate-600 dark:from-slate-600 dark:to-slate-700"
              }`}
            >
              {shown ? <span className={c.arabic ? "font-arabic text-3xl" : "text-sm"}>{c.face}</span> : "؟"}
            </button>
          );
        })}
      </div>
      {complete && (
        <div className="mt-4">
          <p className="text-lg font-extrabold text-emerald-600">{t.done} 🏆</p>
          <button
            onClick={() => {
              setSeed((s) => s + 1);
              setFound([]);
              setOpen([]);
              setMoves(0);
            }}
            className="mt-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white"
          >
            {t.again}
          </button>
        </div>
      )}
    </div>
  );
}

/** Tap five shuffled letters back into their hijaiyah order. */
function OrderGame({ t }: { t: T }) {
  const [seed, setSeed] = useState(0);
  const target = useMemo(() => {
    const start = Math.floor(Math.random() * (HIJAIYAH.length - 5));
    return HIJAIYAH.slice(start, start + 5);
  }, [seed]);
  const [pool, setPool] = useState(() => shuffle(target));
  const [placed, setPlaced] = useState<typeof target>([]);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    setPool(shuffle(target));
    setPlaced([]);
  }, [target]);

  function tap(letter: (typeof target)[number]) {
    const nextIdx = placed.length;
    if (letter.name === target[nextIdx]!.name) {
      setPlaced((p) => [...p, letter]);
      setPool((p) => p.filter((x) => x.name !== letter.name));
      say(letter.arName);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 600);
    }
  }
  const complete = placed.length === target.length;

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.orderHint}</p>

      <div className="mt-4 flex min-h-[4.5rem] flex-wrap items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10" dir="rtl">
        {placed.map((h) => (
          <span key={h.name} className="font-arabic rounded-lg bg-white px-3 py-1 text-3xl text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-200">
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
      {complete && (
        <div className="mt-4">
          <p className="text-lg font-extrabold text-emerald-600">{t.done} 🏆</p>
          <button onClick={() => setSeed((s) => s + 1)} className="mt-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white">
            {t.again}
          </button>
        </div>
      )}
    </div>
  );
}

/** Remember the letters: a sequence flashes, the child repeats it. The
 *  sequence grows by one every level, so difficulty climbs on its own. */
function MemoryGame({ t, onScore }: { t: T; onScore: (n: number) => void }) {
  const [level, setLevel] = useState(1);
  const [seq, setSeq] = useState<number[]>([]);
  const [shownAt, setShownAt] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "wrong">("idle");
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  // Six letters on the board; the sequence is drawn from them.
  const board = useMemo(() => pick(HIJAIYAH, 6), [level]);

  function begin(lv = level) {
    const s = Array.from({ length: lv + 1 }, () => Math.floor(Math.random() * board.length));
    setSeq(s);
    setStep(0);
    setPhase("show");
  }

  // Flash the sequence, one letter at a time, then hand over to the child.
  useEffect(() => {
    if (phase !== "show" || seq.length === 0) return;
    let i = 0;
    setShownAt(seq[0]!);
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
    }, 700);
    return () => window.clearInterval(id);
  }, [phase, seq]);

  function tap(i: number) {
    if (phase !== "input") return;
    if (seq[step] === i) {
      say(board[i]!.arName);
      if (step + 1 === seq.length) {
        const s = score + level * 10;
        setScore(s);
        onScore(s);
        setLevel((l) => l + 1);
        setPhase("idle");
      } else {
        setStep((p) => p + 1);
      }
    } else {
      setPhase("wrong");
    }
  }

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-center gap-3 text-xs font-bold">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
          {t.level} {level}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {t.score}: {score}
        </span>
      </div>

      <p className="mt-3 h-5 text-sm font-bold text-slate-600 dark:text-slate-300">
        {phase === "show" ? t.watch : phase === "input" ? t.yourTurn : phase === "wrong" ? `${t.wrong} 💪` : ""}
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

      {(phase === "idle" || phase === "wrong") && (
        <button
          onClick={() => {
            if (phase === "wrong") {
              setLevel(1);
              setScore(0);
              begin(1);
            } else begin();
          }}
          className="mt-4 rounded-full bg-emerald-500 px-6 py-2 text-sm font-bold text-white"
        >
          {phase === "wrong" ? t.again : t.start}
        </button>
      )}
    </div>
  );
}

/** Quick & correct: 30 seconds, as many letters as possible. */
function SpeedGame({ t, onScore }: { t: T; onScore: (n: number) => void }) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);

  const q = useMemo(() => {
    const answer = HIJAIYAH[Math.floor(Math.random() * HIJAIYAH.length)]!;
    const others = pick(HIJAIYAH.filter((h) => h.name !== answer.name), 3);
    return { answer, options: shuffle([answer, ...others]) };
  }, [round]);

  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      setRunning(false);
      onScore(score);
      return;
    }
    const id = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(id);
  }, [running, left, score, onScore]);

  function choose(name: string) {
    if (!running) return;
    if (name === q.answer.name) setScore((s) => s + 5);
    setRound((r) => r + 1);
  }

  if (!running && left === 30) {
    return (
      <div className="rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-5xl">⚡</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.speedDesc}</p>
        <button onClick={() => setRunning(true)} className="mt-4 rounded-full bg-emerald-500 px-8 py-3 text-base font-bold text-white">
          {t.start}
        </button>
      </div>
    );
  }

  if (!running) {
    return (
      <div className="rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <p className="text-5xl">🏆</p>
        <p className="mt-2 font-heading text-lg font-bold text-slate-800 dark:text-amber-100">
          {t.finalScore}: {score}
        </p>
        <button
          onClick={() => {
            setScore(0);
            setLeft(30);
            setRound((r) => r + 1);
            setRunning(true);
          }}
          className="mt-4 rounded-full bg-emerald-500 px-6 py-2 text-sm font-bold text-white"
        >
          {t.again}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-center gap-3 text-xs font-bold">
        <span className={`rounded-full px-3 py-1 ${left <= 5 ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-200"}`}>
          ⏱ {t.timeLeft}: {left}
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
          {t.score}: {score}
        </span>
      </div>
      <div className="mt-5 grid min-h-[6rem] place-items-center">
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

/** Guess the harakat: a letter is shown carrying one vowel mark. */
function HarakatGame({ t, onScore }: { t: T; onScore: (n: number) => void }) {
  const MARKS = useMemo(
    () => [
      { mark: "َ", label: t.fathah },
      { mark: "ِ", label: t.kasrah },
      { mark: "ُ", label: t.dhammah },
      { mark: "ْ", label: t.sukun },
    ],
    [t]
  );
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);

  const q = useMemo(() => {
    const letter = HIJAIYAH[Math.floor(Math.random() * HIJAIYAH.length)]!;
    const m = MARKS[Math.floor(Math.random() * MARKS.length)]!;
    return { letter, m };
  }, [round, MARKS]);

  function choose(label: string) {
    if (feedback) return;
    if (label === q.m.label) {
      const s = score + 10;
      setScore(s);
      onScore(s);
      setFeedback("ok");
    } else setFeedback("no");
    setTimeout(() => {
      setFeedback(null);
      setRound((r) => r + 1);
    }, 800);
  }

  return (
    <div className="rounded-3xl border-2 border-amber-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200">
        {t.score}: {score}
      </span>
      <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">{t.whichHarakat}</p>
      <div className="mt-3 grid min-h-[7rem] place-items-center">
        <span className="font-arabic text-7xl leading-none text-emerald-700 dark:text-emerald-300">
          {q.letter.ar + q.m.mark}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {MARKS.map((m) => (
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
