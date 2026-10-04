/**
 * The AdSense account, and the unit every placement renders.
 *
 * THERE IS NO AD CONFIGURATION ANY MORE. Owner: "langsung online aja AdSense
 * dan apus settingan AdSense di dawa.es dan ekosistem ulyah.com, pokoknya
 * ketika ads di pasang langsung online." So an ad slot in the code IS a live
 * ad: nothing is fetched, nothing is toggled, and no switch in an admin panel
 * stands between a placement and the page.
 *
 * What that replaces was a central row in D1, mirrored to KV, read by every
 * site on every page load through a CORS request, gated on three booleans per
 * site. Every one of those was a way for the ads to be silently off — and each
 * one actually happened: a wildcard CORS header made the response unreadable,
 * so every site read "switched off" for weeks; before that, an empty unit-id
 * box meant enabled, approved, all green, and nothing rendered. The whole
 * apparatus existed to answer a question the code can answer by itself.
 *
 * Practical consequence of going straight live, said plainly: an AdSense unit
 * only fills on a domain Google has accepted. On a site still awaiting review
 * the markup is there and simply does not fill — AdSlot watches for that and
 * collapses the space, so the page looks exactly as it would with no ad. It is
 * not an error, and nothing needs switching on when approval arrives.
 *
 * The two constants below that differ per site are BUILD-TIME facts (TENANT is
 * fixed when the site is built), not settings: nothing is fetched and nothing
 * can be silently off.
 */
import { TENANT } from "./tenant";

/**
 * The publisher account each site belongs to.
 *
 * dawa.es stays on the ecosystem's original account, which Google has
 * approved. The others were each moved to another account and are verified
 * afresh: xad.es on 2026-09-29 ("ubah semua verifikasi adsense nya dengan kode
 * ini"), ulyah.com and 1fr.fr from the owner's AdSense file of 2026-10-03
 * (1fr.fr briefly moved to the xaa.es account on 2026-10-04 and was put back
 * the same day: "1fr.fr kembaliin ke semula"), and tilawa.de on 2026-10-04
 * onto the same account as xaa.es ("sama dengan xaa.es karena 1 akun").
 * docs/ADSENSE-CODES.md lists every domain.
 */
const ORIGINAL_ACCOUNT = "ca-pub-6371903555702163";
const AD_CLIENT_BY_TENANT: Record<string, string> = {
  ulyah: "ca-pub-8991272269211824",
  "1fr": "ca-pub-5944786950535069",
  tilawa: "ca-pub-8991272269211824",
  dawa: ORIGINAL_ACCOUNT,
  xad: "ca-pub-2493615451319531",
};

/**
 * The publisher account of THIS build. The loader script and the
 * google-adsense-account meta tag in the layout, the units, and /ads.txt all
 * read this one constant, so they can never name different accounts.
 */
export const AD_CLIENT_ID = AD_CLIENT_BY_TENANT[TENANT.id] ?? ORIGINAL_ACCOUNT;

/**
 * Whether this site renders ad units at all.
 *
 * Only on the original account. The unit ids below belong to it, so they can
 * never fill on another account — and a site under review needs the loader
 * script, the meta tag and ads.txt, not units. Once Google approves a site on
 * its own account, Auto ads in that account's dashboard place the ads; nothing
 * in this file has to change.
 */
export const SHOWS_AD_UNITS = AD_CLIENT_ID === ORIGINAL_ACCOUNT;

/**
 * The account's two display units, and which positions each one serves.
 *
 * Owner: "design ulang posisi nya, dasar nya dr data ad slot dari dawa.es dan
 * yg baru ini xad.es." An ad unit belongs to the publisher ACCOUNT, not to a
 * domain — both run on every site the account has had approved, and neither
 * fills on a site that has not. So the two units are not "dawa's" and "xad's";
 * they are two KINDS of position, and splitting the page between them is what
 * makes AdSense's own per-unit report say which kind earns:
 *
 *   banner  4702981509  "Horizontal" (created for dawa.es)
 *                       the lead unit at the first pause, and the closing one —
 *                       wide, short, across the page.
 *   flex    1209764526  "bebas" (created for xad.es), format auto
 *                       the units inside the reading column and the margin
 *                       rail, where Google is given room to pick the shape.
 *
 * A data-ad-slot is public by nature: it ships in the HTML of every page that
 * carries the unit, exactly like the publisher id beside it.
 */
export const AD_UNITS = {
  banner: "4702981509",
  flex: "1209764526",
} as const;

export type AdUnitKind = keyof typeof AD_UNITS;

/** Which unit a placement uses. Positions, not pages, decide it. */
export function unitForPlacement(placement: string): AdUnitKind {
  return placement === "list" || placement === "footer" ? "banner" : "flex";
}
