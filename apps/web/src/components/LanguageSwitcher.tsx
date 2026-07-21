"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LOCALES, isLocaleReady } from "@ulyah/shared/i18n";

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
            // Languages are opened ONE AT A TIME as each is verified fully
            // translated (owner: "buka coretan satu-persatu"). A language that
            // is neither the current one nor marked ready stays struck through
            // and unclickable; ready ones switch normally. See READY_LOCALE_CODES.
            if (!isCurrent && !isLocaleReady(l.code)) {
              return (
                <span
                  key={l.code}
                  dir={l.dir}
                  aria-disabled
                  className="block w-full cursor-not-allowed px-3 py-2 text-left text-sm text-[var(--color-text-secondary)] line-through opacity-50"
                >
                  {l.label}
                </span>
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
