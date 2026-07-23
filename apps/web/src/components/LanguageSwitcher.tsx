"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LOCALES, LOCALE_SITE } from "@ulyah/shared/i18n";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(code: string) {
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${code}${rest ? `/${rest}` : ""}`);
    setOpen(false);
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
