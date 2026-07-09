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
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => switchTo(l.code)}
              dir={l.dir}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-black/5 ${l.code === locale ? "font-semibold text-accent" : ""}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
