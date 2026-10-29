"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { ALL_LOCALES, DEFAULT_LOCALE, ECOSYSTEM_LANGS, LOCALES, localeCanonicalUrl } from "@ulyah/shared/i18n";
import { canonicalRoute, localizedRoute, routeLocales } from "@ulyah/shared/routes";

/**
 * The language menu of every site of the ecosystem (owner, 29 Oct 2026: "Translate di masing2
 * situs di bikinin, biar saling berbagi link untuk translate nya"; docs/ADSENSE-BLUEPRINT.md §19).
 *
 * Each language is written on its own site — Indonesian on ulyah.com, English on xad.es,
 * German on tilawa.de, French on 1fr.fr, Spanish on dawa.im (LOCALE_SITE) — so the menu offers
 * the other four sites, not a translation in place (owner: "stop auto translate di ulyah.com").
 * Every entry opens THE SAME PAGE in that language, at the url its site really serves (the
 * slug in that language, no prefix), the same pairing hreflang already declares; a page that
 * does not exist in a language (routeLocales) opens that site's home page instead.
 *
 * Until 29 Oct the sibling sites showed no menu at all: each ships only its own language, and
 * the list was built from that.
 */
const label = (code: string) => ALL_LOCALES.find((l) => l.code === code)?.label ?? code.toUpperCase();

/** The route on disk for the page being read: no language prefix, the site's own slug undone. */
function currentRoute(pathname: string): string {
  const segs = pathname.split("/");
  const path = LOCALES.some((l) => l.code === segs[1]) ? "/" + segs.slice(2).join("/") : pathname;
  const clean = path.replace(/\/+$/, "") || "/";
  return canonicalRoute(clean, DEFAULT_LOCALE) ?? clean;
}

export function LanguageSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const route = currentRoute(pathname);

  const others = ECOSYSTEM_LANGS.filter((code) => code !== locale);
  if (others.length === 0) return null;

  const hrefFor = (code: string) => {
    const allowed = routeLocales(route);
    const target = allowed && !allowed.includes(code) ? "/" : route;
    const path = target === "/" ? "" : localizedRoute(target, code);
    return localeCanonicalUrl(code, path);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        className="flex items-center gap-1 whitespace-nowrap rounded-full border border-(--color-border) px-3 py-1.5 text-xs"
        data-testid="language-switcher"
      >
        <span aria-hidden>🌐</span>
        <span className="hidden sm:inline">{label(locale)}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-(--color-border) bg-(--color-card) py-1 shadow-xl" data-testid="language-menu">
          <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide text-text-secondary">{label(locale)}</p>
          {others.map((code) => {
            const href = hrefFor(code);
            const def = ALL_LOCALES.find((l) => l.code === code);
            return (
              <a
                key={code}
                href={href}
                hrefLang={code}
                lang={code}
                dir={def?.dir}
                className="flex items-center justify-between gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span>{label(code)}</span>
                <span aria-hidden className="shrink-0 text-[10px] opacity-50">{new URL(href).host} ↗</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
