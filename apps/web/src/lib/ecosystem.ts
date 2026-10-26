/**
 * The ecosystem page — /ekosistem (ulyah.com), /ecosystem (xad.es),
 * /ecosysteme (1fr.fr), /oekosystem (tilawa.de), /ecosistema (dawa.es, dawa.im).
 *
 * Owner, 18 Oct 2026: "Promosikan website axto.io dan xaa.es dengan bahasa
 * masing2 situs dengan menu husus yg premium … gunakan kalimat yang berbeda di
 * setiap situs agar tidak terkesan copy paste agar tidak melanggar kebijakan
 * adsense termasuk dawa.es dan masukan juga di script backup dawa.es".
 *
 * One copy per site, written for that site in its own language — never a
 * translation of another site's text. Each is labelled openly as the
 * publisher's own promotion, says only what AXTO and XAA really do (AXTO's
 * interface has ten languages, Spanish not yet among them; XAA's site is in
 * English, Spanish and Indonesian), and keeps religious rulings with scholars:
 * an AI tool organises and translates, it never gives a fatwa.
 *
 * Each site's copy lives in its own file under ecosystem-copy/, so the dawa.es
 * backup (scripts/export-dawa-standalone.mjs) carries dawa.ts, the types and
 * the page into the standalone project and the promotion survives a restore
 * without rebuilding.
 */
import type { TenantId } from "./tenant";
import type { EcoCopy } from "./ecosystem-copy/types";
import { ULYAH } from "./ecosystem-copy/ulyah";
import { XAD } from "./ecosystem-copy/xad";
import { ONEFAITH } from "./ecosystem-copy/onefaith";
import { TILAWA } from "./ecosystem-copy/tilawa";
import { DAWA } from "./ecosystem-copy/dawa";
import { DAWAIM } from "./ecosystem-copy/dawaim";

export type { EcoCopy, EcoSection } from "./ecosystem-copy/types";

export const ECOSYSTEM: Partial<Record<TenantId, Record<string, EcoCopy>>> = {
  ulyah: ULYAH,
  xad: XAD,
  "1fr": ONEFAITH,
  tilawa: TILAWA,
  dawa: DAWA,
  dawaim: DAWAIM,
};

/** The copy for this site and language, or null where the page does not exist. */
export function ecosystemCopy(tenant: TenantId, locale: string): EcoCopy | null {
  return ECOSYSTEM[tenant]?.[locale] ?? null;
}

/** Outbound link with the site it came from, so the visit is attributable. */
export function ecoLink(base: "https://axto.io" | "https://xaa.es", siteUrl: string): string {
  const source = siteUrl.replace(/^https?:\/\//, "");
  return `${base}/?utm_source=${encodeURIComponent(source)}&utm_medium=referral&utm_campaign=ecosystem`;
}
