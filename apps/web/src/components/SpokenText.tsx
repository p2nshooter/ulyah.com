"use client";

import { useEffect, useMemo, useRef } from "react";

interface Token {
  text: string;
  start: number;
  isWord: boolean;
}

/** Tokenize into words + the whitespace between them, keeping each token's
 * character offset so a SpeechSynthesis word-boundary charIndex maps to the
 * exact word. */
function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\s+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) tokens.push({ text: text.slice(last, m.index), start: last, isWord: true });
    tokens.push({ text: m[0], start: m.index, isWord: false });
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push({ text: text.slice(last), start: last, isWord: true });
  return tokens;
}

/**
 * Renders a text block with per-WORD reading highlight (owner: "penunjuk
 * bacaan per 1 kata, bukan kotak utuh, biar jelas sudah sampai mana"). When
 * `active` is true, the word whose character range contains `charIndex` gets a
 * highlight and is gently scrolled into view, so the marker follows the voice
 * word by word. When inactive, it renders as plain text.
 */
export function SpokenText({
  text,
  active,
  charIndex,
  className,
  dir,
}: {
  text: string;
  active: boolean;
  charIndex: number;
  className?: string;
  dir?: "rtl" | "ltr";
}) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const activeRef = useRef<HTMLSpanElement | null>(null);

  // Which word index is currently spoken.
  const activeWord = useMemo(() => {
    if (!active || charIndex < 0) return -1;
    let idx = -1;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i]!;
      if (t.isWord && t.start <= charIndex) idx = i;
      if (t.start > charIndex) break;
    }
    return idx;
  }, [tokens, active, charIndex]);

  useEffect(() => {
    if (active && activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeWord, active]);

  if (!active) return <p className={className} dir={dir}>{text}</p>;

  return (
    <p className={className} dir={dir}>
      {tokens.map((t, i) =>
        t.isWord ? (
          <span
            key={i}
            ref={i === activeWord ? activeRef : undefined}
            className={i === activeWord ? "rounded bg-accent px-0.5 text-primary shadow-sm" : undefined}
          >
            {t.text}
          </span>
        ) : (
          <span key={i}>{t.text}</span>
        )
      )}
    </p>
  );
}
