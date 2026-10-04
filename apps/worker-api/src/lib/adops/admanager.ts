/**
 * Google Ad Manager API v1 (REST), only the calls the plan needs
 * (docs/ADMANAGER-BLUEPRINT.md §4). Shapes follow the official protos in
 * googleapis/google/ads/admanager/v1 (JSON names are the camelCase of the
 * proto fields; enums travel as their names; int64 travels as a string).
 */
import type { DesiredAdUnit, ActualAdUnit } from "./plan.js";

const BASE = "https://admanager.googleapis.com/v1";

export class AdManagerError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export interface AdManagerClient {
  networkCode: string;
  call<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T>;
}

export function adManagerClient(token: string, networkCode: string, fetchImpl: typeof fetch = fetch): AdManagerClient {
  return {
    networkCode,
    async call<T>(method: "GET" | "POST" | "PATCH", path: string, body?: unknown): Promise<T> {
      const res = await fetchImpl(`${BASE}/${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      if (!res.ok) throw new AdManagerError(`Ad Manager API ${method} ${path} → ${res.status}: ${text.slice(0, 400)}`, res.status);
      return (text ? JSON.parse(text) : {}) as T;
    },
  };
}

export interface NetworkInfo {
  name: string;
  displayName?: string;
  networkCode: string;
  currencyCode?: string;
  timeZone?: string;
  effectiveRootAdUnit?: string;
}

export async function getNetwork(c: AdManagerClient): Promise<NetworkInfo> {
  return c.call<NetworkInfo>("GET", `networks/${c.networkCode}`);
}

interface ApiAdUnit {
  name: string;
  adUnitCode?: string;
  status?: string;
  displayName?: string;
}

/** Every ad unit of the network, all pages. */
export async function listAdUnits(c: AdManagerClient): Promise<ActualAdUnit[]> {
  const out: ActualAdUnit[] = [];
  let pageToken = "";
  for (let page = 0; page < 50; page++) {
    const q = new URLSearchParams({ pageSize: "1000" });
    if (pageToken) q.set("pageToken", pageToken);
    const j = await c.call<{ adUnits?: ApiAdUnit[]; nextPageToken?: string }>("GET", `networks/${c.networkCode}/adUnits?${q}`);
    for (const u of j.adUnits ?? []) {
      if (u.adUnitCode) out.push({ name: u.name, code: u.adUnitCode, status: u.status ?? "STATUS_UNSPECIFIED" });
    }
    pageToken = j.nextPageToken ?? "";
    if (!pageToken) break;
  }
  return out;
}

/** The JSON body of one AdUnit to create. `parentName` is a resource name. */
export function adUnitBody(d: DesiredAdUnit, parentName: string): Record<string, unknown> {
  return {
    parentAdUnit: parentName,
    displayName: d.displayName,
    adUnitCode: d.code,
    description: d.position ? `ulyah AdOps · ${d.site} · ${d.position}` : `ulyah AdOps · ${d.site}`,
    appliedTargetWindow: "BLANK",
    adUnitSizes: d.sizes.map((s) => ({
      size: { width: s.width, height: s.height, sizeType: s.sizeType },
      environmentType: "BROWSER",
    })),
  };
}

export async function batchCreateAdUnits(c: AdManagerClient, units: { desired: DesiredAdUnit; parentName: string }[]): Promise<ActualAdUnit[]> {
  if (units.length === 0) return [];
  const parent = `networks/${c.networkCode}`;
  const j = await c.call<{ adUnits?: ApiAdUnit[] }>("POST", `${parent}/adUnits:batchCreate`, {
    requests: units.map((u) => ({ parent, adUnit: adUnitBody(u.desired, u.parentName) })),
  });
  return (j.adUnits ?? []).map((u) => ({ name: u.name, code: u.adUnitCode ?? "", status: u.status ?? "ACTIVE" }));
}

export async function batchSetActive(c: AdManagerClient, names: string[], active: boolean): Promise<void> {
  if (names.length === 0) return;
  await c.call("POST", `networks/${c.networkCode}/adUnits:${active ? "batchActivate" : "batchDeactivate"}`, { names });
}

// ── Reports ────────────────────────────────────────────────────────────────

/** One row of the daily report: per ad unit code × country × date. */
export interface ReportRow {
  date: string; // YYYY-MM-DD
  adUnitCode: string;
  country: string;
  requests: number;
  impressions: number;
  clicks: number;
  revenue: number; // network currency units (USD when currencyCode is USD)
}

export const REPORT_DIMENSIONS = ["DATE", "AD_UNIT_CODE", "COUNTRY_CODE"] as const;
export const REPORT_METRICS = ["AD_REQUESTS", "IMPRESSIONS", "CLICKS", "REVENUE"] as const;

/** Report definition: yesterday's numbers, in USD, per ad unit and country. */
export function reportBody(relative: "YESTERDAY" | "LAST_7_DAYS" | "LAST_30_DAYS" = "YESTERDAY"): Record<string, unknown> {
  return {
    displayName: `ulyah AdOps · ${relative}`,
    reportDefinition: {
      dimensions: [...REPORT_DIMENSIONS],
      metrics: [...REPORT_METRICS],
      dateRange: { relative },
      reportType: "HISTORICAL",
      currencyCode: "USD",
    },
  };
}

interface ApiValue {
  intValue?: string;
  doubleValue?: number;
  stringValue?: string;
}

/**
 * Read a report value. MONEY metrics may come as `doubleValue` (currency
 * units) or as `intValue` (micros, one million per unit); both are handled.
 * A DATE comes as an int like 20261003 or a string; both become YYYY-MM-DD.
 */
export function readValue(v: ApiValue | undefined, kind: "int" | "money" | "string" | "date"): string | number {
  if (!v) return kind === "string" || kind === "date" ? "" : 0;
  if (kind === "string") return v.stringValue ?? (v.intValue ?? "");
  if (kind === "date") {
    const raw = String(v.stringValue ?? v.intValue ?? "");
    const digits = raw.replace(/\D/g, "");
    return digits.length === 8 ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}` : raw;
  }
  if (v.doubleValue !== undefined) return Number(v.doubleValue);
  if (v.intValue !== undefined) return kind === "money" ? Number(v.intValue) / 1_000_000 : Number(v.intValue);
  return 0;
}

export function parseRows(rows: { dimensionValues?: ApiValue[]; metricValueGroups?: { primaryValues?: ApiValue[] }[] }[]): ReportRow[] {
  return rows.map((r) => {
    const d = r.dimensionValues ?? [];
    const m = r.metricValueGroups?.[0]?.primaryValues ?? [];
    return {
      date: String(readValue(d[0], "date")),
      adUnitCode: String(readValue(d[1], "string")),
      country: String(readValue(d[2], "string")).toUpperCase(),
      requests: Number(readValue(m[0], "int")),
      impressions: Number(readValue(m[1], "int")),
      clicks: Number(readValue(m[2], "int")),
      revenue: Number(readValue(m[3], "money")),
    };
  });
}

/**
 * Create (or reuse) the AdOps report, run it, wait for it, read every row.
 * `reportName` is stored by the runner so the same report is reused daily.
 */
export async function runDailyReport(
  c: AdManagerClient,
  reportName: string | null,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))
): Promise<{ reportName: string; rows: ReportRow[] }> {
  let name = reportName;
  if (!name) {
    const created = await c.call<{ name: string }>("POST", `networks/${c.networkCode}/reports`, reportBody("YESTERDAY"));
    name = created.name;
  }
  let op = await c.call<{ name: string; done?: boolean; response?: { reportResult?: string }; error?: { message?: string } }>("POST", `${name}:run`, {});
  for (let i = 0; i < 20 && !op.done; i++) {
    await sleep(3000);
    op = await c.call("GET", op.name);
  }
  if (!op.done) throw new Error("Laporan Ad Manager belum selesai setelah 60 detik; dicoba lagi di tick berikutnya.");
  if (op.error) throw new Error(`Laporan Ad Manager gagal: ${op.error.message ?? "tanpa pesan"}`);
  const result = op.response?.reportResult;
  if (!result) throw new Error("Laporan Ad Manager selesai tanpa hasil.");

  const rows: ReportRow[] = [];
  let pageToken = "";
  for (let page = 0; page < 50; page++) {
    const q = new URLSearchParams({ pageSize: "10000" });
    if (pageToken) q.set("pageToken", pageToken);
    const j = await c.call<{ rows?: Parameters<typeof parseRows>[0]; nextPageToken?: string }>("GET", `${result}:fetchRows?${q}`);
    rows.push(...parseRows(j.rows ?? []));
    pageToken = j.nextPageToken ?? "";
    if (!pageToken) break;
  }
  return { reportName: name, rows };
}
