"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HIJAIYAH } from "@/lib/hijaiyah";

/**
 * Four small Qur'an-learning games for Al-Qur'an Kids.
 *
 * Deliberately featherweight, because these ship to every visitor of a site
 * that must stay fast: NO game engine, NO canvas, NO images, NO new
 * dependencies and no network calls. Everything is derived from the hijaiyah
 * table already bundled for the letter pages, drawn with text + CSS, and the
 * sound uses the browser's own speech synthesis (nothing to download). The
 * whole feature is one client component behind its own route, so it is code-
 * split and costs the rest of the site nothing.
 */

type GameId = "tebak-huruf" | "cari-huruf" | "pasangan" | "urutan";

const L = {
  id: {
    title: "Game Belajar Qur'an",
    subtitle: "Belajar huruf hijaiyah sambil bermain 🌟",
    games: {
      "tebak-huruf": { name: "Tebak Huruf", desc: "Lihat hurufnya, pilih namanya", icon: "🔤" },
      "cari-huruf": { name: "Cari Huruf", desc: "Dengar namanya, pilih hurufnya", icon: "👂" },
      pasangan: { name: "Kartu Pasangan", desc: "Cocokkan huruf dengan namanya", icon: "🃏" },
      urutan: { name: "Urutkan Huruf", desc: "Susun sesuai urutan hijaiyah", icon: "🔢" },
    },
    score: "Skor",
    streak: "Beruntun",
    best: "Terbaik",
    correct: "Benar! 🎉",
    wrong: "Coba lagi ya 💪",
    play: "Main",
    again: "Main lagi",
    back: "← Pilih game lain",
    listen: "🔊 Dengarkan",
    done: "Hebat! Selesai 🏆",
    moves: "Langkah",
    next: "Lanjut →",
    hint: "Ketuk kartu untuk membukanya",
    order: "Ketuk huruf sesuai urutan",
  },
  en: {
    title: "Qur'an Learning Games",
    subtitle: "Learn the hijaiyah letters by playing 🌟",
    games: {
      "tebak-huruf": { name: "Guess the Letter", desc: "See the letter, pick its name", icon: "🔤" },
      "cari-huruf": { name: "Find the Letter", desc: "Hear the name, pick the letter", icon: "👂" },
      pasangan: { name: "Matching Cards", desc: "Match each letter to its name", icon: "🃏" },
      urutan: { name: "Put in Order", desc: "Arrange them in hijaiyah order", icon: "🔢" },
    },
    score: "Score",
    streak: "Streak",
    best: "Best",
    correct: "Correct! 🎉",
    wrong: "Try again 💪",
    play: "Play",
    again: "Play again",
    back: "← Choose another game",
    listen: "🔊 Listen",
    done: "Great! Finished 🏆",
    moves: "Moves",
    next: "Next →",
    hint: "Tap a card to flip it",
    order: "Tap the letters in order",
  },
};

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
  const t = locale === "id" ? L.id : L.en;
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
          {(Object.keys(t.games) as GameId[]).map((id) => (
            <button
              key={id}
              onClick={() => setGame(id)}
              className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-sky-200 text-2xl dark:from-amber-500/30 dark:to-sky-500/30">
                {t.games[id].icon}
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-base font-bold text-slate-800 dark:text-amber-100">{t.games[id].name}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{t.games[id].desc}</span>
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
        {t.back}
      </button>
      {game === "tebak-huruf" && <QuizGame t={t} mode="letter" onScore={saveBest} />}
      {game === "cari-huruf" && <QuizGame t={t} mode="name" onScore={saveBest} />}
      {game === "pasangan" && <MatchGame t={t} />}
      {game === "urutan" && <OrderGame t={t} />}
    </div>
  );
}

type T = typeof L.id;

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
          {feedback === "ok" ? t.correct : t.wrong}
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
          <p className="text-lg font-extrabold text-emerald-600">{t.done}</p>
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
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.order}</p>

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
          <p className="text-lg font-extrabold text-emerald-600">{t.done}</p>
          <button onClick={() => setSeed((s) => s + 1)} className="mt-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-bold text-white">
            {t.again}
          </button>
        </div>
      )}
    </div>
  );
}
