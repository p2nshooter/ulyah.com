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
 * The account's responsive display unit ("Horizontal"), used by every
 * placement — the shape comes from `data-ad-format`, not from having six
 * separate units. A data-ad-slot is public by nature: it ships in the HTML of
 * every page that carries the unit, exactly like the publisher id beside it.
 */
export const AD_SLOT = "4702981509";
