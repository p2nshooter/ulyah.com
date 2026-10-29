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
import { useSaleTerms } from "@/components/sale/useSaleTerms";
import { IS_SALE_SITE, usdShort } from "@/lib/site-sale";
import { usePageOverrides } from "@/lib/site-pages";
import { WorldCup2026, WorldCup2026Stripe } from "@/components/WorldCup2026";
import { EcoTopLine, UlyahWordmark } from "@/components/EcosystemDecor";
import { SurahFlipbook, BOOK_TENANTS } from "@/components/SurahFlipbook";
import { localizedRoute } from "@ulyah/shared/routes";
import { routePath } from "@/lib/paths";

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
  const hasBook = BOOK_TENANTS.has(TENANT.id);
  // ulyah.com for sale: the dedicated menu shows the price and disappears when the
  // owner hides the sale in Admin → Situs dijual (docs/ADSENSE-BLUEPRINT.md §17).
  const sale = useSaleTerms();
  const direct = nav.direct.filter((it) => !(IS_SALE_SITE && it.path === "/acquisition" && !sale.visible));
  const saleLabel = (label: string) => (IS_SALE_SITE ? `${label} · ${usdShort(sale.priceUsd)}` : label);

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

  // Compare against the LOCALIZED path — on a sibling site the address bar
  // shows /gebetszeiten, so matching the Indonesian /jadwal-sholat would leave
  // the menu item looking inactive on its own page.
  const isActive = (path: string) => {
    if (path === "") return pathname === `/${locale}`;
    const here = `/${locale}${localizedRoute(path, locale)}`;
    return pathname?.startsWith(here);
  };
  const groupActive = (key: string) =>
    nav.groups.find((g) => g.key === key)?.items.some((it) => isActive(it.path)) ?? false;

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-30 border-b border-accent/15 bg-(--color-bg)/85 shadow-(--ul-shadow-sm) backdrop-blur-md"
    >
      <WorldCup2026Stripe />
      <EcoTopLine />
      {/* Row 1 — the brand and the controls.
          The brand lockup (logo + wordmark) never shrinks and nothing may sit
          on it. The ornaments beside it (Spain 2026 festoon, surah book) live
          in a container that measures the room it is given and drops them one
          by one — the festoon first, the Qur'an last — instead of letting them
          slide under the wordmark or the menu (owner, 12 Oct 2026: "perbaiki
          logo headernya biar mewah, indah, elegan, bukan tumpang tindih"). */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        <div className="flex shrink-0 items-center">
          <AdminTrigger locale={locale}>
            <span className="flex items-center gap-2.5">
              <Image src={TENANT.logoIcon} alt="" width={34} height={34} className="rounded-[8px] shadow-(--ul-shadow-gold)" priority />
              {TENANT.id === "ulyah" ? (
                <UlyahWordmark />
              ) : TENANT.wordmark && TENANT.wordmarkGold ? (
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
                <span className="font-heading text-base font-semibold leading-tight tracking-wide text-text-primary sm:text-lg">
                  {TENANT.siteName}
                </span>
              )}
            </span>
          </AdminTrigger>
        </div>

        <div className="hdr-ornaments @container flex min-w-0 flex-1 items-center">
          <div className="flex items-center gap-3">
            <span aria-hidden className={`hdr-rule block ${hasBook ? "@max-[90px]:hidden" : "@max-[120px]:hidden"}`} />
            <span className={`inline-flex shrink-0 ${hasBook ? "@max-[205px]:hidden" : "@max-[120px]:hidden"}`}>
              <WorldCup2026 />
            </span>
            {/* Forever-turning open book showing all 114 surah in turn. */}
            {hasBook && (
              <span className="inline-flex shrink-0 @max-[90px]:hidden">
                <SurahFlipbook />
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Real search box, not a buried icon — owner request, and it's
              what visitors expect from a reference site. */}
          <form action={routePath(locale, `/cari`)} className="hidden items-center tablet:flex">
            <div className="flex items-center gap-1.5 rounded-full border border-(--color-border) bg-black/3 py-1 pl-3 pr-1 transition focus-within:border-accent dark:bg-white/5">
              <span aria-hidden className="text-sm opacity-70">🔍</span>
              <input
                type="search"
                name="q"
                placeholder={dict.nav.searchPlaceholder}
                className="w-28 bg-transparent text-xs outline-hidden placeholder:text-text-secondary focus:w-44 transition-all"
              />
            </div>
          </form>
          {/* Small tablets get the icon; on a phone the search box opens the
              menu instead, so the brand row keeps room for the surah book. */}
          <Link
            href={routePath(locale, `/cari`)}
            aria-label={dict.nav.searchPlaceholder}
            className="hidden rounded-full border border-(--color-border) p-2 sm:block tablet:hidden"
          >
            🔍
          </Link>
          <button
            onClick={toggle}
            aria-label="toggle theme"
            className="hidden rounded-full border border-(--color-border) p-2 tablet:block"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <InstallAppButton />
          <LanguageSwitcher locale={locale} />
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="menu"
            className="rounded-full border border-(--color-border) p-2 desktop:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Row 2 (desktop) — the menu on a line of its own, centred under a gold
          hairline. On one row with the brand it needed ~1,600px and got
          1,232: the labels wrapped to three lines and the brand ornaments ran
          under "Beranda" and "Al-Qur'an". */}
      <nav className="hdr-nav hidden desktop:block">
        {/* Spanish, French and German labels are a third longer than Indonesian:
            the row tightens in two steps (below 1408 px: smaller type, no group
            icons; below 1280 px: no dropdown arrows either), so the longest
            menu, Spanish, still fits one line at 1025 px. flex-wrap is the last
            guard: a link drops to a second line rather than being cut off. */}
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-center gap-x-0.5 gap-y-1 px-3 py-1.5 xl:px-4 min-[88rem]:px-6">
          <Link
            href={`/${locale}`}
            className={`whitespace-nowrap rounded-full px-2 py-1.5 text-xs transition xl:px-2.5 xl:text-[13px] min-[88rem]:px-3.5 min-[88rem]:text-sm ${
              pathname === `/${locale}` ? "bg-accent/15 font-medium text-accent" : "text-text-secondary hover:text-accent"
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
                  className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 text-xs transition xl:px-2.5 xl:text-[13px] min-[88rem]:px-3.5 min-[88rem]:text-sm ${
                    active || open ? "bg-accent/15 font-medium text-accent" : "text-text-secondary hover:text-accent"
                  }`}
                >
                  <span aria-hidden className="hidden text-xs min-[88rem]:inline">{g.icon}</span>
                  {g.label}
                  <span aria-hidden className={`hidden text-[9px] transition-transform xl:inline ${open ? "rotate-180" : ""}`}>▼</span>
                </button>
                {open && (
                  <div className="absolute left-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-accent/25 bg-(--color-card) py-2 shadow-(--ul-shadow-gold-lg)">
                    {g.items.map((it) => (
                      <Link
                        key={it.path}
                        href={`/${locale}${localizedRoute(it.path, locale)}`}
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

          {direct.map((it) => (
            <Link
              key={it.path}
              href={`/${locale}${localizedRoute(it.path, locale)}`}
              data-testid={it.path === "/acquisition" ? "nav-sale" : undefined}
              className={`whitespace-nowrap rounded-full px-2 py-1.5 text-xs transition xl:px-2.5 xl:text-[13px] min-[88rem]:px-3.5 min-[88rem]:text-sm ${
                IS_SALE_SITE && it.path === "/acquisition"
                  ? "border border-accent bg-accent font-semibold text-primary shadow-(--ul-shadow-gold) hover:brightness-110"
                  : isActive(it.path) ? "bg-accent/15 font-medium text-accent" : it.path === "/ekosistem" ? "eco-promo font-semibold text-accent" : "text-text-secondary hover:text-accent"
              }`}
            >
              {it.path === "/acquisition" ? saleLabel(it.label) : it.label}
            </Link>
          ))}
        </div>

      </nav>

      {/* Mobile: accordion of the same groups */}
      {menuOpen && (
        <nav className="max-h-[75vh] overflow-y-auto border-t border-(--color-border) px-4 py-3 desktop:hidden">
          <form action={routePath(locale, `/cari`)} className="mb-2 sm:hidden">
            <div className="flex items-center gap-2 rounded-full border border-(--color-border) bg-black/3 px-3 py-2 focus-within:border-accent dark:bg-white/5">
              <span aria-hidden className="text-sm opacity-70">🔍</span>
              <input
                type="search"
                name="q"
                placeholder={dict.nav.searchPlaceholder}
                className="w-full bg-transparent text-sm outline-hidden placeholder:text-text-secondary"
              />
            </div>
          </form>
          <Link
            href={`/${locale}`}
            onClick={() => setMenuOpen(false)}
            className="block rounded-sm px-2 py-2.5 text-sm font-medium hover:bg-black/5"
          >
            🏠 {nav.home}
          </Link>
          {nav.groups.map((g) => {
            const open = openGroup === g.key;
            return (
              <div key={g.key} className="border-t border-(--color-border)/60">
                <button
                  onClick={() => setOpenGroup(open ? null : g.key)}
                  className="flex w-full items-center justify-between rounded-sm px-2 py-2.5 text-sm font-medium hover:bg-black/5"
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
                        href={`/${locale}${localizedRoute(it.path, locale)}`}
                        onClick={() => setMenuOpen(false)}
                        className={`block rounded px-2 py-2 text-sm hover:bg-black/5 ${
                          isActive(it.path) ? "font-medium text-accent" : "text-text-secondary"
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
          {direct.map((it) => (
            <Link
              key={it.path}
              href={`/${locale}${localizedRoute(it.path, locale)}`}
              onClick={() => setMenuOpen(false)}
              className="block border-t border-(--color-border)/60 rounded-sm px-2 py-2.5 text-sm font-medium hover:bg-black/5"
            >
              {IS_SALE_SITE && it.path === "/acquisition" ? (
                <span className="inline-flex rounded-full bg-accent px-3 py-1 font-semibold text-primary">{saleLabel(it.label)}</span>
              ) : it.path === "/ekosistem" ? <span className="eco-promo text-accent">{it.label}</span> : <>{it.path === "/widget" ? "🧩" : "ℹ️"} {it.label}</>}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
