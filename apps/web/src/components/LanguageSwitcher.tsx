"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_SITE, DEFAULT_LOCALE, isValidLocale, isLocaleReady, localeReadiness } from "@ulyah/shared/i18n";

const LOCALE_COOKIE = "ulyah_locale";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  // Which languages the owner has switched on, from the admin portal. null =
  // not answered yet, in which case the built-in gate decides — that fallback
  // is the restrictive one, so a slow or failed request can never briefly
  // re-expose a language that is still being finished.
  const [enabled, setEnabled] = useState<string[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/content/locales`)
      .then((r) => r.json() as Promise<{ enabled?: string[]; ok?: boolean }>)
      .then((j) => {
        if (alive && j.ok && Array.isArray(j.enabled)) setEnabled(j.enabled);
      })
      .catch(() => {
        /* keep the built-in gate */
      });
    return () => {
      alive = false;
    };
  }, []);

  /** A language with its own site is always reachable — choosing it leaves for
   *  that domain rather than translating anything here. */
  const offered = (code: string) =>
    Boolean(LOCALE_SITE[code]) || (enabled ? enabled.includes(code) : isLocaleReady(code));

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

  // Languages that can actually be reached from here. On ulyah.com that is ONLY
  // the four sibling sites — the in-place language switching is off (owner:
  // "non-aktifin dulu tombol bahasa di ulyah.com, fokus bahasa Indonesia aja").
  // Choosing one of these leaves for that site; nothing is translated in place.
  const reachable = LOCALES.filter((l) => l.code !== locale && offered(l.code));

  // Nothing to switch to — a sibling site ships one language, and ulyah.com now
  // offers only outbound links. Hiding the control entirely reads better than a
  // dropdown of struck-through entries the visitor can never use.
  if (reachable.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="flex items-center gap-1 whitespace-nowrap rounded-full border border-(--color-border) px-3 py-1.5 text-xs"
      >
        <span aria-hidden>🌐</span>
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-card) py-1 shadow-xl">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-text-secondary">
            {current.label}
          </p>
          {reachable.map((l) => {
            const site = LOCALE_SITE[l.code];
            // A language with its own site is an outbound link (the ↗ says so
            // before the click). One the owner switched on here is translated
            // in place, like Indonesian.
            if (site) {
              return (
                <a
                  key={l.code}
                  href={site}
                  dir={l.dir}
                  className="flex items-center justify-between gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-black/5"
                >
                  <span>{l.label}</span>
                  <span aria-hidden className="shrink-0 text-[10px] opacity-50">
                    {site.replace("https://", "")} ↗
                  </span>
                </a>
              );
            }
            return (
              <button
                key={l.code}
                onClick={() => switchTo(l.code)}
                dir={l.dir}
                className="block w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-black/5"
              >
                {l.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
