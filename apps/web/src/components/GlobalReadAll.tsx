"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { speak, splitSentences, speechAvailable, type NarrationHandle } from "@/lib/speech";
import { useRadioStore } from "@/lib/radio-store";

type Mode = "all" | "translation" | "arabic";

// Localized control labels — every site shows its own language.
const L: Record<string, { all: string; translation: string; arabic: string; stop: string; reading: string; menu: string; next: string }> = {
  id: { all: "Baca semua", translation: "Baca terjemahan", arabic: "Baca Arab", stop: "Berhenti", reading: "Membacakan…", menu: "🔊 Baca", next: "Lanjut halaman berikutnya…" },
  en: { all: "Read all", translation: "Read translation", arabic: "Read Arabic", stop: "Stop", reading: "Reading…", menu: "🔊 Read", next: "Continuing to the next page…" },
  fr: { all: "Tout lire", translation: "Lire la traduction", arabic: "Lire l'arabe", stop: "Arrêter", reading: "Lecture…", menu: "🔊 Lire", next: "Passage à la page suivante…" },
  de: { all: "Alles vorlesen", translation: "Übersetzung vorlesen", arabic: "Arabisch vorlesen", stop: "Stopp", reading: "Vorlesen…", menu: "🔊 Vorlesen", next: "Weiter zur nächsten Seite…" },
  es: { all: "Leer todo", translation: "Leer traducción", arabic: "Leer árabe", stop: "Detener", reading: "Leyendo…", menu: "🔊 Leer", next: "Pasando a la página siguiente…" },
  ar: { all: "اقرأ الكل", translation: "اقرأ الترجمة", arabic: "اقرأ العربية", stop: "إيقاف", reading: "جارٍ القراءة…", menu: "🔊 اقرأ", next: "الانتقال إلى الصفحة التالية…" },
};
function labels(locale: string) {
  return L[locale] ?? L.en!;
}

const RESUME_KEY = "ulyah_readall_mode";
const READ_SELECTOR = "h1,h2,h3,h4,p,li,blockquote,dd,dt,figcaption";
const arabicRatio = (t: string) => {
  const ar = (t.match(/[؀-ۿ]/g) ?? []).length;
  const nonSpace = t.replace(/\s/g, "").length || 1;
  return ar / nonSpace;
};

/**
 * A single, site-wide "Baca Semua / Baca Terjemahan / Baca Arab" control that
 * appears on EVERY menu (owner: "di semua menu tidak ada satupun tombol baca
 * semua"). It reads the whole current page aloud in document order —
 * highlighting each block as it is spoken, scrolling to keep it in view — then,
 * if the page exposes a "next" link (`[data-read-next]` or `<a rel="next">`),
 * it auto-advances and keeps reading through the next page, and the next, until
 * the whole menu is finished or the visitor presses stop. "Baca Arab" reads
 * only the Arabic blocks, "Baca Terjemahan" only the non-Arabic ones.
 *
 * Pages that ship their OWN richer reader (kitab, kisah) mark their root with
 * `data-native-reader`; this global control hides itself there to avoid two
 * competing readers.
 */
export function GlobalReadAll({ locale }: { locale: string }) {
  const t = labels(locale);
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reading, setReading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [available, setAvailable] = useState(false);
  const [hasNative, setHasNative] = useState(false);
  const readingRef = useRef(false);
  const handleRef = useRef<NarrationHandle | null>(null);
  const activeElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setAvailable(speechAvailable());
  }, []);

  // Re-check for a native reader on every navigation (client-side route change).
  useEffect(() => {
    setHasNative(!!document.querySelector("[data-native-reader]"));
    // Stop any in-flight reading when the route changes unless we're mid auto-advance.
    return () => {
      /* handled by unmount cleanup below */
    };
  }, [pathname]);

  function clearHighlight() {
    if (activeElRef.current) {
      activeElRef.current.style.removeProperty("box-shadow");
      activeElRef.current.style.removeProperty("border-radius");
      activeElRef.current.style.removeProperty("background-color");
      activeElRef.current = null;
    }
  }
  function highlight(el: HTMLElement) {
    clearHighlight();
    el.style.borderRadius = "0.5rem";
    el.style.boxShadow = "0 0 0 3px var(--color-accent, #c9a24a)";
    el.style.backgroundColor = "color-mix(in srgb, var(--color-accent, #c9a24a) 12%, transparent)";
    activeElRef.current = el;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /** Collect the page's readable "leaf" text blocks, in document order. */
  function collectBlocks(mode: Mode): { el: HTMLElement; text: string; lang: string }[] {
    const scope = document.querySelector("main") ?? document.body;
    const out: { el: HTMLElement; text: string; lang: string }[] = [];
    const seen = new Set<HTMLElement>();
    scope.querySelectorAll<HTMLElement>(READ_SELECTOR).forEach((el) => {
      // Only leaf text blocks — skip a container that holds other readable
      // blocks, so nothing is read twice.
      if (el.querySelector(READ_SELECTOR)) return;
      if (el.closest("[data-noread]") || el.closest("nav,footer,aside,header,button,select,textarea,input")) return;
      // Skip anything not actually visible (collapsed menus, hidden tabs).
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text.length < 2 || /^[\d\s.,:/·—–-]+$/.test(text)) return;
      if (seen.has(el)) return;
      seen.add(el);
      const isAr = arabicRatio(text) > 0.35;
      if (mode === "arabic" && !isAr) return;
      if (mode === "translation" && isAr) return;
      out.push({ el, text, lang: isAr ? "ar" : locale });
    });
    return out;
  }

  function findNextHref(): string | null {
    const explicit = document.querySelector<HTMLAnchorElement>("[data-read-next]");
    if (explicit?.getAttribute("href")) return explicit.getAttribute("href");
    const rel = document.querySelector<HTMLAnchorElement>('a[rel="next"]');
    if (rel?.getAttribute("href")) return rel.getAttribute("href");
    return null;
  }

  async function start(mode: Mode) {
    if (readingRef.current) return;
    setOpen(false);
    const blocks = collectBlocks(mode);
    if (blocks.length === 0) return;
    // Never overlap the radio.
    try {
      if (useRadioStore.getState().playing) useRadioStore.getState().stop();
    } catch {
      /* non-fatal */
    }
    readingRef.current = true;
    setReading(true);
    setAdvancing(false);
    try {
      window.sessionStorage.setItem(RESUME_KEY, mode);
    } catch {
      /* private mode */
    }

    for (const b of blocks) {
      if (!readingRef.current) break;
      highlight(b.el);
      for (const sentence of splitSentences(b.text)) {
        if (!readingRef.current) break;
        const h = speak(sentence, b.lang, { rate: 0.95 });
        handleRef.current = h;
        await h.done;
      }
    }
    clearHighlight();
    if (!readingRef.current) return;

    // Whole page read — auto-advance to the next page/book if one is declared.
    const next = findNextHref();
    if (next) {
      setAdvancing(true);
      router.push(next);
      return; // resume effect on the next page keeps the mode going
    }
    stop();
  }

  function stop() {
    readingRef.current = false;
    handleRef.current?.cancel();
    clearHighlight();
    setReading(false);
    setAdvancing(false);
    try {
      window.sessionStorage.removeItem(RESUME_KEY);
    } catch {
      /* non-fatal */
    }
  }

  // Cancel narration if the component unmounts (full page leave) without an
  // active auto-advance.
  useEffect(() => {
    return () => {
      handleRef.current?.cancel();
    };
  }, []);

  // Auto-resume after an auto-advance navigation: if a mode is stored, keep
  // reading the new page without a click.
  useEffect(() => {
    if (hasNative) return;
    let mode: string | null = null;
    try {
      mode = window.sessionStorage.getItem(RESUME_KEY);
    } catch {
      /* ignore */
    }
    if (!mode) return;
    const timer = setTimeout(() => void start(mode as Mode), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hasNative]);

  if (!available || hasNative) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      {reading ? (
        <button
          onClick={stop}
          className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-2xl"
        >
          ⏹ {t.stop}
          <span className="hidden text-xs font-normal opacity-90 sm:inline">· {advancing ? t.next : t.reading}</span>
        </button>
      ) : open ? (
        <div className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-[color-mix(in_srgb,var(--color-primary)_92%,transparent)] p-1.5 shadow-2xl backdrop-blur">
          <button onClick={() => void start("all")} className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-primary">
            {t.all}
          </button>
          <button onClick={() => void start("translation")} className="rounded-full px-3 py-1.5 text-xs font-medium text-[#f4efe3] hover:bg-white/10">
            {t.translation}
          </button>
          <button onClick={() => void start("arabic")} className="rounded-full px-3 py-1.5 text-xs font-medium text-[#f4efe3] hover:bg-white/10">
            {t.arabic}
          </button>
          <button onClick={() => setOpen(false)} aria-label="close" className="rounded-full px-2 py-1.5 text-xs text-[#f4efe3]/60 hover:bg-white/10">
            ✕
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-accent/40 bg-[color-mix(in_srgb,var(--color-primary)_90%,transparent)] px-4 py-2 text-xs font-medium text-[#f4efe3] shadow-lg backdrop-blur transition hover:border-accent"
        >
          {t.menu}
        </button>
      )}
    </div>
  );
}
