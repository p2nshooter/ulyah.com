/**
 * Every site the owner runs, in one list (docs/ADMANAGER-BLUEPRINT.md §2).
 *
 * This is the registry the AdOps runner automates, the admin labels traffic
 * with, and the audit checks against. Adding a site is adding one line here.
 *
 * dawa.es is deliberately NOT in this list. Owner, 2026-10-04: "yg jgn di
 * sentuh adalah dawa.es karena bukan milik sy lagi" and "semua situs di
 * kendalikan, terbaca traffiknya di admin ulyah.com kecuali dawa.es". Its
 * tenant keeps running in apps/web exactly as it was; nothing here reads,
 * reports or automates it. `EXCLUDED_TRACK_IDS` names it so the admin can
 * filter its beacon rows out instead of showing them as an unknown site.
 */

/** The one AdSense account every owner site declares since 2026-10-04. */
export const OWNER_ADSENSE_PUB = "pub-5693981744147503";
export const OWNER_ADSENSE_CLIENT = `ca-${OWNER_ADSENSE_PUB}`;

export interface OwnerSite {
  /** Bare domain, as AdSense lists it. */
  domain: string;
  /**
   * The id the site's traffic beacon sends (`site` in /track, or the tenant id
   * for the apps/web sites). Also the Ad Manager ad unit code of the site.
   */
  trackId: string;
  /** Content language(s). */
  lang: string;
  /** Where its code lives. */
  repo: string;
  /** false = planned but not built yet (Fase 6). Not automated until built. */
  built: boolean;
}

export const OWNER_SITES: readonly OwnerSite[] = [
  { domain: "ulyah.com", trackId: "ulyah", lang: "id", repo: "ulyah.com · apps/web", built: true },
  { domain: "1fr.fr", trackId: "1fr", lang: "fr", repo: "ulyah.com · apps/web", built: true },
  { domain: "tilawa.de", trackId: "tilawa", lang: "de", repo: "ulyah.com · apps/web", built: true },
  { domain: "xad.es", trackId: "xad", lang: "en", repo: "ulyah.com · apps/web", built: true },
  { domain: "axto.io", trackId: "axto-io", lang: "en", repo: "guardian-ai", built: true },
  { domain: "xaa.es", trackId: "xaa-es", lang: "es", repo: "xaa", built: true },
  { domain: "axto.us", trackId: "axto-us", lang: "en", repo: "axto.us", built: true },
  { domain: "axto.dev", trackId: "axto-dev", lang: "en", repo: "axtodev", built: true },
  { domain: "jai.lat", trackId: "jai-lat", lang: "es", repo: "jai", built: true },
  { domain: "lie.skin", trackId: "lie-skin", lang: "en", repo: "lie", built: true },
  { domain: "oldco.in", trackId: "oldco-in", lang: "hi+en", repo: "oldco.in", built: true },
  { domain: "profity.in", trackId: "profity-in", lang: "hi+en", repo: "profity.in", built: true },
  { domain: "dawo.es", trackId: "dawo-es", lang: "es", repo: "ulyah.com · sites/dawo.es", built: true },
  { domain: "qkb.es", trackId: "qkb-es", lang: "es", repo: "ulyah.com · sites/qkb.es", built: true },
  { domain: "xko.es", trackId: "xko-es", lang: "es", repo: "ulyah.com · sites/xko.es", built: true },
  { domain: "byodd.de", trackId: "byodd-de", lang: "de", repo: "ulyah.com · sites/byodd.de", built: true },
  { domain: "byoxy.de", trackId: "byoxy-de", lang: "de", repo: "ulyah.com · sites/byoxy.de", built: true },
  // Fase 6: ten German + English sites, not built yet.
  ...["byoy", "qarf", "qulen", "qurm", "rubiy", "zavik", "zevok", "zolun", "zufiq", "zuvik"].map(
    (name): OwnerSite => ({ domain: `${name}.de`, trackId: `${name}-de`, lang: "de+en", repo: `ulyah.com · sites/${name}.de`, built: false })
  ),
];

/** Beacon ids that must never be shown or automated (dawa.es). */
export const EXCLUDED_TRACK_IDS: ReadonlySet<string> = new Set(["dawa"]);

/** Legacy beacon ids that belong to a registry site under another id. */
const TRACK_ID_ALIASES: Record<string, string> = { "xad-es": "xad" };

const byTrackId = new Map(OWNER_SITES.map((s) => [s.trackId, s]));
const byDomain = new Map(OWNER_SITES.map((s) => [s.domain, s]));

export function siteByTrackId(id: string): OwnerSite | undefined {
  return byTrackId.get(TRACK_ID_ALIASES[id] ?? id);
}

export function siteByDomain(domain: string): OwnerSite | undefined {
  return byDomain.get(domain.toLowerCase().replace(/^www\./, ""));
}

/** The sites the AdOps runner may act on: built ones only. */
export function automatableSites(): OwnerSite[] {
  return OWNER_SITES.filter((s) => s.built);
}
