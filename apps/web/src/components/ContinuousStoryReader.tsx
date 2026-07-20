"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { speak, speechAvailable, type NarrationHandle } from "@/lib/speech";
import { SpokenText } from "@/components/SpokenText";
import { useRadioStore } from "@/lib/radio-store";

export interface StorySection {
  section_order: number;
  heading_id: string;
  body_id: string;
  quran_refs: string | null;
}

// Localized chrome — a sibling site must never show Indonesian controls.
const L: Record<string, { readAll: string; stop: string; reading: string; nextUnit: string }> = {
  id: { readAll: "▶ Bacakan semua", stop: "⏹ Berhenti", reading: "Sedang membacakan… menggulir & berpindah otomatis sampai dihentikan.", nextUnit: "Selesai — berpindah ke kisah berikutnya…" },
  en: { readAll: "▶ Read everything", stop: "⏹ Stop", reading: "Reading aloud… auto-scrolling and advancing until stopped.", nextUnit: "Finished — moving to the next story…" },
  fr: { readAll: "▶ Tout lire", stop: "⏹ Arrêter", reading: "Lecture en cours… défilement et passage automatiques jusqu'à l'arrêt.", nextUnit: "Terminé — passage au récit suivant…" },
  de: { readAll: "▶ Alles vorlesen", stop: "⏹ Stopp", reading: "Vorlesen läuft… automatisches Scrollen und Weiterblättern bis zum Stopp.", nextUnit: "Fertig — weiter zur nächsten Geschichte…" },
  es: { readAll: "▶ Leer todo", stop: "⏹ Detener", reading: "Leyendo en voz alta… desplazamiento y avance automáticos hasta detenerse.", nextUnit: "Terminado — pasando al siguiente relato…" },
  ar: { readAll: "▶ اقرأ الكل", stop: "⏹ إيقاف", reading: "جارٍ القراءة… تمرير وانتقال تلقائي حتى الإيقاف.", nextUnit: "انتهى — الانتقال إلى القصة التالية…" },
};
function labels(locale: string) {
  return L[locale] ?? L.en!;
}

const AUTOREAD_FLAG = "ulyah_story_autoread";

/**
 * Continuous "read the whole story aloud" for a kisah profile — reads the
 * summary then every section in order, highlighting the block being read,
 * scrolling to keep it centred, and (when a `nextHref` is given) auto-advancing
 * to the NEXT kisah in the same category once this one ends. Keeps going for as
 * long as the visitor lets it — through the entire menu — until they press stop
 * (same behaviour as the kitab reader). Renders the story body itself so the
 * highlight can wrap the active block.
 */
export function ContinuousStoryReader({
  locale,
  summary,
  sections,
  nextHref,
  autoStart = false,
}: {
  locale: string;
  summary: string;
  sections: StorySection[];
  /** URL of the next kisah (already carrying ?autoread=1) — omit to stop at the end. */
  nextHref?: string;
  autoStart?: boolean;
}) {
  const router = useRouter();
  const t = labels(locale);
  const [reading, setReading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  // Which block is being read, and the char offset of the word currently
  // spoken within it (for the per-word highlight).
  const [active, setActive] = useState<{ block: string; charIndex: number } | null>(null);
  const readingRef = useRef(false);
  const handleRef = useRef<NarrationHandle | null>(null);
  const [speechOk, setSpeechOk] = useState(false);
  useEffect(() => setSpeechOk(speechAvailable()), []);

  // Ordered list of readable blocks: summary, then each section heading+body.
  const blocks = useMemo(() => {
    const list: { id: string; text: string }[] = [{ id: "summary", text: summary }];
    for (const s of sections) {
      list.push({ id: `sec-${s.section_order}-h`, text: s.heading_id });
      list.push({ id: `sec-${s.section_order}-b`, text: s.body_id });
    }
    return list.filter((b) => b.text && b.text.trim());
  }, [summary, sections]);

  // When a new block starts, bring it into view (the per-word highlight then
  // fine-scrolls within it).
  useEffect(() => {
    if (!active) return;
    document.getElementById(active.block)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active?.block]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    if (readingRef.current) return;
    try {
      if (useRadioStore.getState().playing) useRadioStore.getState().stop();
    } catch {
      /* radio store unavailable */
    }
    readingRef.current = true;
    setReading(true);
    setAdvancing(false);
    // Read each block as ONE utterance so the browser can report word
    // boundaries; the highlight follows word by word (keep-alive in speak()
    // survives Chromium's ~15s pause on long blocks).
    for (const b of blocks) {
      if (!readingRef.current) return;
      setActive({ block: b.id, charIndex: 0 });
      const h = speak(b.text, locale, {
        rate: 0.95,
        onWord: (ci) => setActive({ block: b.id, charIndex: ci }),
      });
      handleRef.current = h;
      await h.done;
    }
    // Whole story read — advance to the next one if there is a next.
    if (readingRef.current && nextHref) {
      setAdvancing(true);
      try {
        window.sessionStorage.setItem(AUTOREAD_FLAG, "1");
      } catch {
        /* private mode */
      }
      router.push(nextHref);
      return;
    }
    stop();
  }

  function stop() {
    readingRef.current = false;
    handleRef.current?.cancel();
    setActive(null);
    setReading(false);
    setAdvancing(false);
    try {
      window.sessionStorage.removeItem(AUTOREAD_FLAG);
    } catch {
      /* non-fatal */
    }
  }

  useEffect(() => {
    return () => {
      readingRef.current = false;
      handleRef.current?.cancel();
    };
  }, []);

  // Continue the marathon: arriving with autoStart (or the session flag from
  // the previous story) keeps reading with no click needed.
  useEffect(() => {
    let flag: string | null = null;
    try {
      flag = window.sessionStorage.getItem(AUTOREAD_FLAG);
    } catch {
      /* ignore */
    }
    if (!autoStart && !flag) return;
    const timer = setTimeout(() => void start(), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const charOf = (id: string) => (active?.block === id ? active.charIndex : -1);
  const isActive = (id: string) => active?.block === id;

  return (
    <div data-native-reader>
      {speechOk && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => (reading ? stop() : void start())}
            className={`rounded-full px-5 py-2.5 text-sm font-medium shadow-md transition ${
              reading ? "bg-red-600 text-white hover:brightness-110" : "bg-accent text-primary hover:brightness-105"
            }`}
          >
            {reading ? t.stop : t.readAll}
          </button>
          {reading && (
            <span className="text-xs text-accent">{advancing ? t.nextUnit : t.reading}</span>
          )}
        </div>
      )}

      <div id="summary" className="mt-6 p-2">
        <SpokenText
          text={summary}
          active={isActive("summary")}
          charIndex={charOf("summary")}
          className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-primary)]"
        />
      </div>

      {sections.length > 0 && (
        <div className="reveal-stagger mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.section_order} className="p-2">
              <h2 className="flex items-baseline gap-2.5 font-heading text-xl">
                <span className="grid h-7 w-7 shrink-0 translate-y-0.5 place-items-center rounded-full bg-accent/12 text-xs font-semibold text-accent">
                  {s.section_order}
                </span>
                <span id={`sec-${s.section_order}-h`} className="min-w-0">
                  <SpokenText
                    text={s.heading_id}
                    active={isActive(`sec-${s.section_order}-h`)}
                    charIndex={charOf(`sec-${s.section_order}-h`)}
                    className="inline"
                  />
                </span>
              </h2>
              <div id={`sec-${s.section_order}-b`}>
                <SpokenText
                  text={s.body_id}
                  active={isActive(`sec-${s.section_order}-b`)}
                  charIndex={charOf(`sec-${s.section_order}-b`)}
                  className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text-primary)]"
                />
              </div>
              {s.quran_refs && (
                <p className="mt-2.5 rounded-lg border border-accent/25 bg-accent/5 px-3 py-1.5 text-xs leading-relaxed text-accent">
                  📖 {s.quran_refs}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
