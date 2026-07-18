"use client";

import Link from "next/link";
import Image from "next/image";
import { TENANT } from "@/lib/tenant";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/dictionaries";
import { AdminTrigger } from "@/components/AdminTrigger";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTheme } from "@/components/ThemeProvider";
import { InstallAppButton } from "@/components/InstallAppButton";
import { navLabels, applyPageOverrides } from "@/lib/nav-labels";
import { usePageOverrides } from "@/lib/site-pages";

/**
 * Grouped navigation. The old header was a flat run of 13 links that
 * overflowed on anything smaller than a wide desktop and mixed unrelated
 * things side by side; the structure now comes from lib/nav-labels.ts
 * (shared with the footer) as four themed groups + two direct links.
 * Desktop: click a group to open its dropdown (click-outside and
 * route-change both close it). Mobile: the burger opens an accordion of the
 * same groups.
 */
export function Header({ locale, dict }: { locale: string; dict: Dictionary }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const overrides = usePageOverrides();
  const nav = applyPageOverrides(
    navLabels(locale),
    new Set(overrides.hidden),
    new Map(Object.entries(overrides.labels))
  );
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown + mobile menu on any outside tap and on route change.
  useEffect(() => {
    if (!menuOpen && !openGroup) return;
    function onOutside(e: MouseEvent | TouchEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [menuOpen, openGroup]);

  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  const isActive = (path: string) =>
    path === "" ? pathname === `/${locale}` : pathname?.startsWith(`/${locale}${path}`);
  const groupActive = (key: string) =>
    nav.groups.find((g) => g.key === key)?.items.some((it) => isActive(it.path)) ?? false;

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-30 border-b border-accent/15 bg-[var(--color-bg)]/85 shadow-[var(--shadow-sm)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <AdminTrigger locale={locale}>
            <span className="flex items-center gap-2.5">
              <Image src={TENANT.logoIcon} alt="" width={34} height={34} className="rounded-[8px] shadow-[var(--shadow-gold)]" priority />
              {TENANT.wordmark && TENANT.wordmarkGold ? (
                <>
                  {/* Natural green+gold reads well on the light header (white bg);
                      pure-gold reads well on the dark header (deep green bg). */}
                  <Image
                    src={TENANT.wordmark}
                    alt={TENANT.siteName}
                    width={124}
                    height={34}
                    className="block h-[30px] w-auto dark:hidden"
                    priority
                  />
                  <Image
                    src={TENANT.wordmarkGold}
                    alt={TENANT.siteName}
                    width={124}
                    height={34}
                    className="hidden h-[30px] w-auto dark:block"
                    priority
                  />
                </>
              ) : (
                <span className="font-heading text-lg font-semibold leading-none tracking-wide text-[var(--color-text-primary)]">
                  {TENANT.siteName}
                </span>
              )}
            </span>
          </AdminTrigger>
        </div>

        {/* Desktop: grouped dropdowns */}
        <nav className="hidden items-center gap-1 desktop:flex">
          <Link
            href={`/${locale}`}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              pathname === `/${locale}` ? "bg-accent/15 font-medium text-accent" : "text-[var(--color-text-secondary)] hover:text-accent"
            }`}
          >
            {nav.home}
          </Link>

          {nav.groups.map((g) => {
            const open = openGroup === g.key;
            const active = groupActive(g.key);
            return (
              <div key={g.key} className="relative">
                <button
                  onClick={() => setOpenGroup(open ? null : g.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition ${
                    active || open ? "bg-accent/15 font-medium text-accent" : "text-[var(--color-text-secondary)] hover:text-accent"
                  }`}
                >
                  <span aria-hidden className="text-xs">{g.icon}</span>
                  {g.label}
                  <span aria-hidden className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
                </button>
                {open && (
                  <div className="absolute left-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-accent/25 bg-[var(--color-card)] py-2 shadow-[var(--shadow-gold-lg)]">
                    {g.items.map((it) => (
                      <Link
                        key={it.path}
                        href={`/${locale}${it.path}`}
                        onClick={() => setOpenGroup(null)}
                        className={`block px-4 py-2.5 text-sm transition hover:bg-accent/10 hover:text-accent ${
                          isActive(it.path) ? "font-medium text-accent" : ""
                        }`}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {nav.direct.map((it) => (
            <Link
              key={it.path}
              href={`/${locale}${it.path}`}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                isActive(it.path) ? "bg-accent/15 font-medium text-accent" : "text-[var(--color-text-secondary)] hover:text-accent"
              }`}
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Real search box, not a buried icon — owner request, and it's
              what visitors expect from a reference site. */}
          <form action={`/${locale}/cari`} className="hidden items-center tablet:flex">
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-black/[0.03] py-1 pl-3 pr-1 transition focus-within:border-accent dark:bg-white/5">
              <span aria-hidden className="text-sm opacity-70">🔍</span>
              <input
                type="search"
                name="q"
                placeholder={dict.nav.searchPlaceholder}
                className="w-28 bg-transparent text-xs outline-none placeholder:text-[var(--color-text-secondary)] focus:w-44 transition-all"
              />
            </div>
          </form>
          <Link
            href={`/${locale}/cari`}
            aria-label={dict.nav.searchPlaceholder}
            className="rounded-full border border-[var(--color-border)] p-2 tablet:hidden"
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
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
            className="rounded-full border border-[var(--color-border)] p-2 desktop:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile: accordion of the same groups */}
      {menuOpen && (
        <nav className="max-h-[75vh] overflow-y-auto border-t border-[var(--color-border)] px-4 py-3 desktop:hidden">
          <Link
            href={`/${locale}`}
            onClick={() => setMenuOpen(false)}
            className="block rounded px-2 py-2.5 text-sm font-medium hover:bg-black/5"
          >
            🏠 {nav.home}
          </Link>
          {nav.groups.map((g) => {
            const open = openGroup === g.key;
            return (
              <div key={g.key} className="border-t border-[var(--color-border)]/60">
                <button
                  onClick={() => setOpenGroup(open ? null : g.key)}
                  className="flex w-full items-center justify-between rounded px-2 py-2.5 text-sm font-medium hover:bg-black/5"
                >
                  <span>
                    {g.icon} {g.label}
                  </span>
                  <span aria-hidden className={`text-[10px] text-accent transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
                </button>
                {open && (
                  <div className="mb-2 space-y-0.5 pl-4">
                    {g.items.map((it) => (
                      <Link
                        key={it.path}
                        href={`/${locale}${it.path}`}
                        onClick={() => setMenuOpen(false)}
                        className={`block rounded px-2 py-2 text-sm hover:bg-black/5 ${
                          isActive(it.path) ? "font-medium text-accent" : "text-[var(--color-text-secondary)]"
                        }`}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {nav.direct.map((it) => (
            <Link
              key={it.path}
              href={`/${locale}${it.path}`}
              onClick={() => setMenuOpen(false)}
              className="block border-t border-[var(--color-border)]/60 rounded px-2 py-2.5 text-sm font-medium hover:bg-black/5"
            >
              {it.path === "/widget" ? "🧩" : "ℹ️"} {it.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
