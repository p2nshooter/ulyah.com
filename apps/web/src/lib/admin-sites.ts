import { localizedRoute } from "@ulyah/shared/routes";

/** A site as the admin API describes it (worker-api lib/sites.ts). */
export interface AdminSite {
  id: string;
  domain: string;
  name: string;
  lang: string;
}

export function toAdminSites(raw: unknown): AdminSite[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (s): s is AdminSite =>
      !!s && typeof s === "object" && typeof (s as AdminSite).id === "string" && typeof (s as AdminSite).domain === "string" && typeof (s as AdminSite).name === "string",
  ).map((s) => ({ ...s, lang: typeof s.lang === "string" ? s.lang : "en" }));
}

/** The public address of a page on a site, in that site's own language (bare path, localized slug). */
export function sitePageUrl(site: Pick<AdminSite, "domain" | "lang">, route: string): string {
  return `https://${site.domain}${localizedRoute(route, site.lang)}`;
}
