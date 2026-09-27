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
 */

/** The publisher account. Also what the loader script in the layout carries. */
export const AD_CLIENT_ID = "ca-pub-6371903555702163";

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
