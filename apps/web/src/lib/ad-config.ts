/**
 * The AdSense account of each site — and that is all AdSense is in this code.
 *
 * NO MANUAL AD UNITS. Owner, 4 Oct 2026: "Hapus aja dan bersihkan slot AdSense
 * nya di website manapun karena sy bikin otomatis (ingat kecuali dawa.es),
 * cukup cuplikan AdSense, ads.txt & tag meta" — every site is still under
 * review ("27 situs ini masih pengajuan"). A page carries the loader snippet
 * and the google-adsense-account meta tag (layout), and /ads.txt; once a site
 * is approved, Auto ads in the AdSense dashboard place the ads. There is no
 * <ins class="adsbygoogle">, no data-ad-slot and no adsbygoogle.push anywhere —
 * scripts/check-ads.ts fails the build if one comes back.
 *
 * THERE IS NO AD CONFIGURATION EITHER. Owner: "langsung online aja AdSense
 * dan apus settingan AdSense di dawa.es dan ekosistem ulyah.com, pokoknya
 * ketika ads di pasang langsung online." Nothing is fetched, nothing is
 * toggled, and no switch in an admin panel stands between the loader and the
 * page.
 *
 * What that replaces was a central row in D1, mirrored to KV, read by every
 * site on every page load through a CORS request, gated on three booleans per
 * site. Every one of those was a way for the ads to be silently off — and each
 * one actually happened: a wildcard CORS header made the response unreadable,
 * so every site read "switched off" for weeks; before that, an empty unit-id
 * box meant enabled, approved, all green, and nothing rendered. The whole
 * apparatus existed to answer a question the code can answer by itself.
 *
 * The account below differs per site as a BUILD-TIME fact (TENANT is
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
 * On 2026-10-04 the owner consolidated every site onto ONE account ("sy mau
 * focus jadi 1 akun saja"): ulyah.com, 1fr.fr, tilawa.de and xad.es now all
 * declare ca-pub-5693981744147503. dawa.es is not the owner's any more and is
 * left exactly as it was. docs/ADSENSE-CODES.md lists every domain.
 */
const ORIGINAL_ACCOUNT = "ca-pub-6371903555702163";
const AD_CLIENT_BY_TENANT: Record<string, string> = {
  ulyah: "ca-pub-5693981744147503",
  "1fr": "ca-pub-5693981744147503",
  tilawa: "ca-pub-5693981744147503",
  dawa: ORIGINAL_ACCOUNT,
  xad: "ca-pub-5693981744147503",
};

/**
 * The publisher account of THIS build. The loader script and the
 * google-adsense-account meta tag in the layout, and /ads.txt all
 * read this one constant, so they can never name different accounts.
 * (dawa.es keeps its own original account; it is detached and no longer built
 * from this repo — docs/ADSENSE-BLUEPRINT.md §10.)
 */
export const AD_CLIENT_ID = AD_CLIENT_BY_TENANT[TENANT.id] ?? ORIGINAL_ACCOUNT;
