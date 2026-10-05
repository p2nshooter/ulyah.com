/**
 * AdSense Management API v2: the approval gate (docs/ADMANAGER-BLUEPRINT.md §3).
 *
 * GET https://adsense.googleapis.com/v2/accounts/{pub}/sites → each site's
 * `state`: READY (may show ads) or REQUIRES_REVIEW / GETTING_READY /
 * NEEDS_ATTENTION. Only READY sites go further.
 */

export type AdsenseState = "READY" | "GETTING_READY" | "REQUIRES_REVIEW" | "NEEDS_ATTENTION" | "STATE_UNSPECIFIED";

export interface AdsenseSite {
  domain: string;
  state: AdsenseState;
  autoAdsEnabled: boolean;
}

export async function listAdsenseSites(token: string, pub: string, fetchImpl: typeof fetch = fetch): Promise<AdsenseSite[]> {
  const out: AdsenseSite[] = [];
  let pageToken = "";
  for (let page = 0; page < 20; page++) {
    const url = new URL(`https://adsense.googleapis.com/v2/accounts/${pub}/sites`);
    url.searchParams.set("pageSize", "100");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const res = await fetchImpl(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();
    if (!res.ok) throw new Error(`AdSense API ${res.status}: ${text.slice(0, 300)}`);
    const j = JSON.parse(text) as { sites?: { domain?: string; state?: string; autoAdsEnabled?: boolean }[]; nextPageToken?: string };
    for (const s of j.sites ?? []) {
      if (!s.domain) continue;
      out.push({
        domain: s.domain.toLowerCase().replace(/^www\./, ""),
        state: (s.state as AdsenseState) ?? "STATE_UNSPECIFIED",
        autoAdsEnabled: s.autoAdsEnabled === true,
      });
    }
    pageToken = j.nextPageToken ?? "";
    if (!pageToken) break;
  }
  return out;
}

/**
 * The daily AdSense report (Auto ads mode — there are no Ad Manager units to
 * report on). GET accounts/{pub}/reports:generate, last 7 days so a missed day
 * heals itself on the next run (rows are upserts). Same scope as the sites
 * list: adsense.readonly.
 */
export interface AdsenseReportRow {
  date: string;
  domain: string;
  country: string;
  pageViews: number;
  adRequests: number;
  impressions: number;
  clicks: number;
  earnings: number;
}

export const ADSENSE_REPORT_DIMENSIONS = ["DATE", "DOMAIN_NAME", "COUNTRY_CODE"] as const;
export const ADSENSE_REPORT_METRICS = ["PAGE_VIEWS", "AD_REQUESTS", "IMPRESSIONS", "CLICKS", "ESTIMATED_EARNINGS"] as const;

export function adsenseReportUrl(pub: string): string {
  const url = new URL(`https://adsense.googleapis.com/v2/accounts/${pub}/reports:generate`);
  url.searchParams.set("dateRange", "LAST_7_DAYS");
  for (const d of ADSENSE_REPORT_DIMENSIONS) url.searchParams.append("dimensions", d);
  for (const m of ADSENSE_REPORT_METRICS) url.searchParams.append("metrics", m);
  url.searchParams.set("currencyCode", "USD");
  return url.toString();
}

/** Map the response by header NAME, never by position, so a reordered response cannot shift a column. */
export function parseAdsenseReport(j: { headers?: { name?: string }[]; rows?: { cells?: { value?: string }[] }[] }): AdsenseReportRow[] {
  const idx = new Map((j.headers ?? []).map((h, i) => [h.name ?? "", i]));
  const need = [...ADSENSE_REPORT_DIMENSIONS, ...ADSENSE_REPORT_METRICS];
  const missing = need.filter((n) => !idx.has(n));
  if ((j.rows ?? []).length && missing.length) throw new Error(`AdSense report tanpa kolom: ${missing.join(", ")}`);
  const cell = (r: { cells?: { value?: string }[] }, name: string) => r.cells?.[idx.get(name) ?? -1]?.value ?? "";
  const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  return (j.rows ?? []).map((r) => ({
    date: cell(r, "DATE"),
    domain: cell(r, "DOMAIN_NAME").toLowerCase().replace(/^www\./, ""),
    country: cell(r, "COUNTRY_CODE").toUpperCase(),
    pageViews: num(cell(r, "PAGE_VIEWS")),
    adRequests: num(cell(r, "AD_REQUESTS")),
    impressions: num(cell(r, "IMPRESSIONS")),
    clicks: num(cell(r, "CLICKS")),
    earnings: num(cell(r, "ESTIMATED_EARNINGS")),
  }));
}

export async function adsenseReport(token: string, pub: string, fetchImpl: typeof fetch = fetch): Promise<AdsenseReportRow[]> {
  const res = await fetchImpl(adsenseReportUrl(pub), { headers: { Authorization: `Bearer ${token}` } });
  const text = await res.text();
  if (!res.ok) throw new Error(`AdSense report ${res.status}: ${text.slice(0, 300)}`);
  return parseAdsenseReport(JSON.parse(text));
}
