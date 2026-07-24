"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

// Word-by-word nahwu & shorof under a verse, from the Quranic Arabic Corpus
// (loaded into D1 `quran_morphology`, served by /quran/morphology). Each word
// is broken into its segments with root, part-of-speech and i'rab, and can be
// read aloud in a SEPARATE voice (the browser's speech synthesis, distinct from
// the qori's recitation) — owner: "dibacakan terpisah dengan suara terpisah".

interface Seg {
  form: string;
  pos: string;
  posLabel: { id: string; ar: string; en: string };
  root: string | null;
  lemma: string | null;
  isPrefix: boolean;
  isSuffix: boolean;
  explanation: { id: string; ar: string; en: string };
}
interface Word {
  word: number;
  arabic: string;
  segments: Seg[];
}

const L = {
  id: {
    title: "Urai Kata — Nahwu & Shorof",
    show: "Tampilkan",
    hide: "Sembunyikan",
    read: "Bacakan uraian",
    stop: "Hentikan",
    root: "akar",
    prefix: "awalan",
    suffix: "akhiran",
    word: "Kata",
    none: "Belum ada data urai kata untuk ayat ini.",
    src: "Sumber",
  },
  en: {
    title: "Word-by-word — Grammar & Morphology",
    show: "Show",
    hide: "Hide",
    read: "Read aloud",
    stop: "Stop",
    root: "root",
    prefix: "prefix",
    suffix: "suffix",
    word: "Word",
    none: "No word-analysis data for this ayah yet.",
    src: "Source",
  },
};

export function NahwuShorofPanel({ surah, ayah, locale }: { surah: number; ayah: number; locale: string }) {
  const isId = locale === "id";
  const t = isId ? L.id : L.en;
  const lang = (isId ? "id" : "en") as "id" | "en";
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState<Word[] | null>(null);
  const [source, setSource] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const spokenRef = useRef(false);

  useEffect(() => {
    let alive = true;
    setWords(null);
    if (!open) return;
    api
      .get<{ words: Word[]; source: string }>(`/quran/morphology/${surah}/${ayah}`)
      .then((r) => {
        if (!alive) return;
        setWords(Array.isArray(r.words) ? r.words : []);
        setSource(r.source ?? "");
      })
      .catch(() => alive && setWords([]));
    return () => {
      alive = false;
    };
  }, [surah, ayah, open]);

  // Stop any narration when the verse changes or the panel closes.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [surah, ayah]);

  function stemOf(w: Word): Seg {
    return w.segments.find((s) => s.root) ?? w.segments.find((s) => !s.isPrefix && !s.isSuffix) ?? w.segments[0]!;
  }

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis || !words || words.length === 0) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    // Read the grammar of each word, in the reader's language, with a voice
    // that is NOT the recitation — this is the "separate voice" for the lesson.
    const parts = words.map((w, i) => {
      const st = stemOf(w);
      const bits = [st.explanation[lang]];
      return `${t.word} ${i + 1}: ${bits.join(", ")}.`;
    });
    const u = new SpeechSynthesisUtterance(parts.join(" "));
    const want = isId ? "id" : "en";
    const voices = synth.getVoices();
    const v = voices.find((vc) => vc.lang?.toLowerCase().startsWith(want)) ?? voices.find((vc) => vc.lang?.toLowerCase().startsWith("en"));
    if (v) u.voice = v;
    u.lang = v?.lang ?? (isId ? "id-ID" : "en-US");
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    spokenRef.current = true;
    setSpeaking(true);
    synth.speak(u);
  }
  function stopSpeak() {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return (
    <div className="mt-5 rounded-xl border border-[var(--color-border)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-primary dark:text-accent">
          <span aria-hidden>🔤</span>
          {t.title}
        </span>
        <span className="text-xs text-[var(--color-text-secondary)]">{open ? `▲ ${t.hide}` : `▼ ${t.show}`}</span>
      </button>

      {open && (
        <div className="border-t border-[var(--color-border)] p-4">
          {words === null ? (
            <p className="text-sm text-[var(--color-text-secondary)]">…</p>
          ) : words.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)]">{t.none}</p>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  {words.length} {t.word.toLowerCase()}
                </span>
                <button
                  onClick={speaking ? stopSpeak : speak}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    speaking ? "bg-danger/15 text-danger" : "bg-accent/15 text-accent hover:bg-accent/25"
                  }`}
                >
                  <span aria-hidden>{speaking ? "⏹" : "🔊"}</span>
                  {speaking ? t.stop : t.read}
                </button>
              </div>

              <div className="flex flex-wrap gap-2" dir="rtl">
                {words.map((w) => {
                  const st = stemOf(w);
                  return (
                    <div
                      key={w.word}
                      className="min-w-[8rem] flex-1 basis-[8rem] rounded-lg border border-[var(--color-border)] bg-black/[0.02] p-2.5 dark:bg-white/[0.03]"
                    >
                      <p className="font-arabic text-2xl leading-tight text-[var(--color-text-primary)]">{w.arabic}</p>
                      <p className="mt-1 text-[11px] font-medium text-accent" dir={isId ? "ltr" : "ltr"}>
                        {st.posLabel[lang]}
                        {st.root ? ` · ${t.root} ${st.root}` : ""}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-[var(--color-text-secondary)]" dir="ltr">
                        {st.explanation[lang]}
                      </p>
                      {/* affixes (prefixes/suffixes) that carry their own meaning */}
                      {w.segments.filter((s) => s !== st && (s.isPrefix || s.isSuffix)).length > 0 && (
                        <p className="mt-1 text-[10px] text-[var(--color-text-secondary)]/80" dir="ltr">
                          {w.segments
                            .filter((s) => s !== st && (s.isPrefix || s.isSuffix))
                            .map((s) => `${s.isPrefix ? t.prefix : t.suffix}: ${s.posLabel[lang]}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {source && (
                <p className="mt-3 text-[10px] italic text-[var(--color-text-secondary)]/70" dir="ltr">
                  {t.src}: {source}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
