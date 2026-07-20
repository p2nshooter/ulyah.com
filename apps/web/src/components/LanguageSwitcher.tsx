"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LOCALES } from "@ulyah/shared/i18n";

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
            // In-page language switching is temporarily out of service — the
            // owner asked for the broken entries to be visibly struck through
            // and unclickable until it works again ("untuk sementara tandai
            // dulu dengan di coret dan non aktifkan"). Only the language the
            // page is already in stays active.
            if (!isCurrent) {
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
                onClick={() => switchTo(l.code)}
                dir={l.dir}
                className="block w-full px-3 py-2 text-left text-sm font-semibold text-accent hover:bg-black/5"
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
