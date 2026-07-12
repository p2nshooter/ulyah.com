"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { AdminTrigger } from "@/components/AdminTrigger";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTheme } from "@/components/ThemeProvider";
import { InstallAppButton } from "@/components/InstallAppButton";
import { prayerLabels } from "@/lib/prayer-labels";

export function Header({ locale, dict }: { locale: string; dict: Dictionary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const prayerT = prayerLabels(locale);
  const navRef = useRef<HTMLElement>(null);

  // The dropdown previously only closed via its own onClick handlers (a nav
  // link, or the ☰ button again) — tapping anywhere else on the page (or
  // just navigating away some other way) left it stuck open. Close on any
  // outside tap and whenever the route actually changes, in addition to the
  // existing per-link handlers.
  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links: [string, string][] = [
    [dict.nav.home, `/${locale}`],
    [dict.nav.quran, `/${locale}/quran`],
    [dict.nav.audiobook, `/${locale}/audiobook`],
    [dict.nav.kitab, `/${locale}/kitab`],
    [dict.nav.hadits, `/${locale}/hadits`],
    [dict.nav.kisah, `/${locale}/kisah`],
    ["Amalan", `/${locale}/amalan`],
    [dict.nav.dailyContent, `/${locale}/harian`],
    [prayerT.title, `/${locale}/jadwal-sholat`],
    [dict.nav.about, `/${locale}/tentang`],
  ];

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-30 border-b border-accent/15 bg-[var(--color-bg)]/85 shadow-[var(--shadow-sm)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <AdminTrigger locale={locale}>
            <span className="flex items-center gap-2.5">
              <Image src="/icon.png" alt="" width={34} height={34} className="rounded-[8px] shadow-[var(--shadow-gold)]" priority />
              {/* Natural green+gold reads well on the light header (white bg);
                  pure-gold reads well on the dark header (deep green bg). */}
              <Image
                src="/brand/wordmark-ar.png"
                alt="Ulyah"
                width={124}
                height={34}
                className="block h-[30px] w-auto dark:hidden"
                priority
              />
              <Image
                src="/brand/wordmark-ar-gold.png"
                alt="Ulyah"
                width={124}
                height={34}
                className="hidden h-[30px] w-auto dark:block"
                priority
              />
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
          <InstallAppButton />
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
