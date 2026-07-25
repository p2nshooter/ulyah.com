"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_SITE, DEFAULT_LOCALE, isValidLocale } from "@ulyah/shared/i18n";

const LOCALE_COOKIE = "ulyah_locale";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  /**
   * Switching language is a whole-document change (lang, dir, fonts, every
   * string), so it is a real navigation — not a client-side router.push.
   *
   * Two bugs lived here and between them they trapped visitors on whatever
   * language they tried once ("pindah bahasa ke Indonesia susah banget, nggak
   * balik-balik"):
   *
   *  1. The path was rebuilt with `split("/").slice(2)`, which assumes the URL
   *     always starts with a locale prefix. The site's OWN language is served
   *     at BARE urls (ulyah.com/quran, no /id), so from a bare page this threw
   *     away the first real segment — /quran became just /<code>.
   *  2. Only the URL changed. The sticky `ulyah_locale` cookie still said the
   *     old language, so any later bare URL was redirected straight back to it.
   *     Picking Indonesian led to /id → 301 to / → cookie still "th" → /th.
   *
   * So: write the cookie here (the visitor's explicit choice always wins), and
   * send the site's own language to the BARE path rather than /<default>.
   */
  function switchTo(code: string) {
    const segments = pathname.split("/");
    const rest = isValidLocale(segments[1] ?? "") ? "/" + segments.slice(2).join("/") : pathname;
    const clean = rest === "/" || rest === "" ? "" : rest.replace(/\/$/, "");
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const target = code === DEFAULT_LOCALE ? clean || "/" : `/${code}${clean}`;
    setOpen(false);
    window.location.assign(target);
  }

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]!;

  // A single-language site (each sibling ships ONLY its native language —
  // fr / de / es) has nothing to switch to; hiding the control entirely reads
  // better than a dropdown with one entry.
  if (LOCALES.length < 2) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1 whitespace-nowrap rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs"
      >
        <span aria-hidden>🌐</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-80 w-48 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-xl">
          {LOCALES.map((l) => {
            const isCurrent = l.code === locale;
            const site = LOCALE_SITE[l.code];
            // A language with its own ecosystem domain jumps to that site
            // instead of switching in place (the sites cross-promote). The
            // little ↗ hints it opens the sibling domain.
            if (site && !isCurrent) {
              return (
                <a
                  key={l.code}
                  href={site}
                  dir={l.dir}
                  className="block w-full px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-black/5"
                >
                  {l.label} <span aria-hidden className="opacity-50">↗</span>
                </a>
              );
            }
            return (
              <button
                key={l.code}
                onClick={() => (isCurrent ? setOpen(false) : switchTo(l.code))}
                dir={l.dir}
                aria-current={isCurrent}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-black/5 ${
                  isCurrent ? "font-semibold text-accent" : "text-[var(--color-text-primary)]"
                }`}
              >
                {l.label}
                {isCurrent ? " ✓" : ""}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
