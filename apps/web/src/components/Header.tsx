"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { AdminTrigger } from "@/components/AdminTrigger";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTheme } from "@/components/ThemeProvider";

export function Header({ locale, dict }: { locale: string; dict: Dictionary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  const links: [string, string][] = [
    [dict.nav.home, `/${locale}`],
    [dict.nav.quran, `/${locale}/quran`],
    [dict.nav.audiobook, `/${locale}/audiobook`],
    [dict.nav.kitab, `/${locale}/kitab`],
    [dict.nav.kisah, `/${locale}/kisah`],
    [dict.nav.dailyContent, `/${locale}/harian`],
    [dict.nav.about, `/${locale}/tentang`],
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-accent/15 bg-[var(--color-bg)]/85 shadow-[var(--shadow-sm)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <AdminTrigger locale={locale}>
            <span className="flex items-center gap-2.5">
              <Image src="/icon.png" alt="" width={34} height={34} className="rounded-[8px] shadow-[var(--shadow-gold)]" priority />
              <span className="leading-none">
                <span className="block font-heading text-2xl text-primary dark:text-[var(--color-accent)]">
                  ulyah<span className="text-accent">.</span>
                </span>
                <span dir="rtl" className="font-arabic block text-[13px] leading-none text-accent/80">
                  علية
                </span>
              </span>
            </span>
          </AdminTrigger>
        </div>

        <nav className="hidden items-center gap-6 desktop:flex">
          {links.map(([label, href]) => {
            const active = href === `/${locale}` ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative py-1 text-sm transition ${
                  active ? "font-medium text-accent" : "text-[var(--color-text-secondary)] hover:text-accent"
                }`}
              >
                {label}
                {active && (
                  <span aria-hidden className="absolute -bottom-[13px] left-0 right-0 h-0.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/cari`}
            aria-label={dict.nav.searchPlaceholder}
            className="hidden rounded-full border border-[var(--color-border)] p-2 tablet:block"
          >
            🔍
          </Link>
          <button
            onClick={toggle}
            aria-label="toggle theme"
            className="hidden rounded-full border border-[var(--color-border)] p-2 tablet:block"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <LanguageSwitcher locale={locale} />
          <Link
            href={`/${locale}/donasi`}
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-white desktop:inline-block"
          >
            {dict.nav.donate}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
            className="rounded-full border border-[var(--color-border)] p-2 desktop:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-[var(--color-border)] px-4 py-3 desktop:hidden">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded px-2 py-2 text-sm hover:bg-black/5"
            >
              {label}
            </Link>
          ))}
          <Link
            href={`/${locale}/donasi`}
            onClick={() => setMenuOpen(false)}
            className="mt-2 rounded-full bg-accent px-4 py-2 text-center text-sm font-medium text-white"
          >
            {dict.nav.donate}
          </Link>
        </nav>
      )}
    </header>
  );
}
