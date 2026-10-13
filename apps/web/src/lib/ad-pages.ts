import { DEFAULT_LOCALE } from "@ulyah/shared/i18n";
import { localizedRoute } from "@ulyah/shared/routes";

/**
 * Pages that never carry a manual ad unit (dawa.es is the only site with
 * units at all — SHOWS_AD_UNITS in lib/ad-config.ts).
 *
 * AdSense's placement and valuable-inventory rules keep ads off screens that
 * have no publisher content or that serve a task rather than reading: sign-in,
 * registration, the account page, the donation flow, error pages. The kids'
 * pages (games, iqro, hijaiyah, children's films) are child-directed content,
 * where a manual unit needs child-directed treatment — simpler and safer to
 * place none. The live compass and the page-turning readers need the whole
 * screen steady. The admin portal is the owner at work: an impression there is
 * nobody's, and a click there is invalid traffic.
 *
 * Written as the routes exist on disk (Indonesian) and expanded to this
 * build's language, because usePathname() returns what the browser shows:
 * /ninos on dawa.es, not /kids.
 */
const NO_AD_ROUTES = [
  "/admin",
  "/masuk",
  "/daftar",
  "/akun",
  "/donasi",
  "/kiblat",
  "/quran/mushaf",
  "/quran-flipbook",
  "/kids",
  "/anak",
];

const NO_AD = [...new Set(NO_AD_ROUTES.flatMap((r) => [r, localizedRoute(r, DEFAULT_LOCALE)]))];

/**
 * Whether a manual unit may render on this path. Matched on whole segments,
 * so /kids-films is caught by its own entry and /akun never matches an
 * unrelated /akuntansi.
 */
export function manualAdsAllowedOn(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const p = `${pathname.replace(/\/+$/, "")}/`;
  return !NO_AD.some((r) => p.includes(`${r}/`));
}

/**
 * Error pages mark themselves with `data-no-ads` (see app/[locale]/not-found
 * .tsx): a 404 keeps the requested path in the address bar, so only the page
 * itself can say it has no content.
 */
export function pageRefusesAds(): boolean {
  return typeof document !== "undefined" && document.querySelector("[data-no-ads]") !== null;
}
