"use client";

import { useState } from "react";
import { LOCALES, LOCALE_SITE } from "@ulyah/shared/i18n";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);

  /**
   * Which languages are on offer — the four ecosystem sites, and nothing else.
   *
   * This used to ask the API which languages the owner had switched on, and
   * anything on that list was rendered here IN PLACE, machine-translated. That
   * is over: ulyah.com is written in Indonesian and each sibling site is
   * written in its domain's language (owner: "stop auto translate di
   * ulyah.com"). So the offer is a fixed, outbound one — no fetch, no loading
   * state, and no window in which a half-translated language flickers into the
   * menu.
   */
  const offered = (code: string) => Boolean(LOCALE_SITE[code]);

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
            // Every entry is an outbound link now — the ↗ says so before the
            // click, and the destination is a site written in that language
            // rather than a translation of this one.
            const site = LOCALE_SITE[l.code]!;
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
          })}
        </div>
      )}
    </div>
  );
}
