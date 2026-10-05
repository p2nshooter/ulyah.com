/**
 * The AdOps runner (docs/ADMANAGER-BLUEPRINT.md §0).
 *
 * Executes the fixed plan: AdSense approval gate → Ad Manager inventory →
 * yesterday's report → weekly floors and weak-position parking → AI summary.
 * It decides nothing itself: every decision comes from plan.ts and yield.ts.
 *
 * With AD_PLACEMENT = "auto" (the owner's choice: Auto ads, no manual slots)
 * the Ad Manager steps are skipped — nothing on the pages could fill a unit —
 * and the report step reads AdSense's own daily report instead.
 *
 * Modes (setting ADOPS_MODE):
 *   off     → nothing runs.
 *   dry-run → reads Google, computes everything, LOGS what it would change,
 *             changes nothing in Ad Manager. The default once credentials exist.
 *   live    → executes the changes.
 *
 * Writes to D1 are batched and small (the database is on the free plan).
 */
import type { Env } from "../../env.js";
import { getSetting } from "../settings.js";
import { automatableSites, OWNER_ADSENSE_PUB, OWNER_SITES } from "@ulyah/shared/owner-sites";
import { adManagerToken, adsenseToken, parseServiceAccount, type ServiceAccount } from "./google.js";
import { adsenseReport, listAdsenseSites, type AdsenseReportRow, type AdsenseState } from "./adsense.js";
import { adManagerClient, batchCreateAdUnits, batchSetActive, getNetwork, listAdUnits, runDailyReport, type AdManagerClient, type ReportRow } from "./admanager.js";
import { AD_PLACEMENT, AUTO_POSITION, chunk, diffAdUnits, POSITIONS, siteOfCode, type ActualAdUnit, type Position } from "./plan.js";
import { INITIAL_FLOOR, nextFloor, RETEST_AFTER_DAYS, shouldPark, tierOf, type FloorState, type SegmentMetrics, type Tier } from "./yield.js";
import { runCheckpointed } from "./checkpoint.js";

export type AdOpsMode = "off" | "dry-run" | "live";

export interface AdOpsConfig {
  mode: AdOpsMode;
  networkCode: string | null;
  serviceAccount: ServiceAccount | null;
  serviceAccountError: string | null;
  adsense: { clientId: string; clientSecret: string; refreshToken: string } | null;
}

export async function loadConfig(env: Env): Promise<AdOpsConfig> {
  const [mode, networkCode, saJson, clientId, clientSecret, refreshToken] = await Promise.all([
    getSetting(env, "ADOPS_MODE"),
    getSetting(env, "ADMANAGER_NETWORK_CODE"),
    getSetting(env, "ADMANAGER_SERVICE_ACCOUNT_JSON"),
    getSetting(env, "ADSENSE_OAUTH_CLIENT_ID"),
    getSetting(env, "ADSENSE_OAUTH_CLIENT_SECRET"),
    getSetting(env, "ADSENSE_REFRESH_TOKEN"),
  ]);
  let serviceAccount: ServiceAccount | null = null;
  let serviceAccountError: string | null = null;
  if (saJson) {
    try {
      serviceAccount = parseServiceAccount(saJson);
    } catch (e) {
      serviceAccountError = (e as Error).message;
    }
  }
  const m = (mode ?? "").trim().toLowerCase();
  return {
    // With credentials but no explicit mode, the safe default is dry-run.
    mode: m === "live" ? "live" : m === "off" ? "off" : "dry-run",
    networkCode: networkCode?.trim().replace(/\D/g, "") || null,
    serviceAccount,
    serviceAccountError,
    adsense: clientId && clientSecret && refreshToken ? { clientId, clientSecret, refreshToken } : null,
  };
}

interface Action {
  kind: string;
  site?: string | null;
  detail: string;
  ok?: boolean;
}

export interface RunReport {
  mode: AdOpsMode;
  ranAt: string;
  actions: Action[];
  approved: string[];
  errors: string[];
}

const dayStr = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => dayStr(new Date(Date.now() - n * 86400_000));

/** Every 15-minute tick: run once a day after 03:00 UTC (the previous day is final by then). */
export async function adopsTick(env: Env): Promise<void> {
  const now = new Date();
  if (now.getUTCHours() < 3) return;
  const doneKey = `adops:ran:${dayStr(now)}`;
  if (await env.CACHE_KV.get(doneKey).catch(() => "1")) return;
  const cfg = await loadConfig(env);
  if (cfg.mode === "off") return;
  if (!cfg.adsense && !cfg.serviceAccount) return; // nothing connected yet: stay silent
  const lock = "adops:lock";
  if (await env.CACHE_KV.get(lock).catch(() => "1")) return;
  await env.CACHE_KV.put(lock, "1", { expirationTtl: 900 }).catch(() => undefined);
  try {
    await runAdOps(env, cfg);
    await env.CACHE_KV.put(doneKey, "1", { expirationTtl: 2 * 86400 }).catch(() => undefined);
  } finally {
    await env.CACHE_KV.delete(lock).catch(() => undefined);
  }
}

export async function runAdOps(env: Env, cfg?: AdOpsConfig): Promise<RunReport> {
  const c = cfg ?? (await loadConfig(env));
  const mode = c.mode === "off" ? "dry-run" : c.mode; // a manual run while "off" is a dry run
  const live = mode === "live";
  const actions: Action[] = [];
  const errors: string[] = [];
  const log = (a: Action) => actions.push(a);
  const fail = (kind: string, e: unknown, site: string | null = null) => {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push(`${kind}: ${msg}`);
    log({ kind: "error", site, detail: `${kind}: ${msg}`.slice(0, 900), ok: false });
  };

  const sites = automatableSites();
  const registryIds = OWNER_SITES.map((s) => s.trackId);

  // ── 1. AdSense approval gate ──────────────────────────────────────────────
  const stateByTrack = new Map<string, AdsenseState | null>();
  let adsenseBearer: string | null = null;
  if (c.adsense) {
    try {
      const token = await adsenseToken(env, c.adsense.clientId, c.adsense.clientSecret, c.adsense.refreshToken);
      adsenseBearer = token;
      const list = await listAdsenseSites(token, OWNER_ADSENSE_PUB);
      const byDomain = new Map(list.map((s) => [s.domain, s]));
      for (const s of sites) stateByTrack.set(s.trackId, byDomain.get(s.domain)?.state ?? null);
      const ready = sites.filter((s) => stateByTrack.get(s.trackId) === "READY").length;
      log({ kind: "adsense-sync", detail: `${list.length} situs dibaca dari AdSense; ${ready} READY` });
      // Auto ads is the ONLY way ads reach the pages (no manual units), and the
      // AdSense API cannot switch it on — so an approved site with Auto ads off
      // earns nothing until the owner flips it in the AdSense dashboard. Said
      // every run until fixed.
      if (AD_PLACEMENT === "auto") {
        const off = sites.filter((s) => stateByTrack.get(s.trackId) === "READY" && byDomain.get(s.domain)?.autoAdsEnabled === false);
        if (off.length) log({ kind: "auto-ads-off", detail: `Sudah READY tapi Auto ads MATI (aktifkan di AdSense → Iklan → Menurut situs): ${off.map((s) => s.domain).join(", ")}`, ok: false });
      }
      await env.DB.batch(
        sites.map((s) => {
          const st = stateByTrack.get(s.trackId) ?? null;
          const found = byDomain.get(s.domain);
          const auto = found ? (found.autoAdsEnabled ? 1 : 0) : null;
          return env.DB.prepare(
            `INSERT INTO adops_sites (track_id, domain, adsense_state, auto_ads, adsense_checked, ready_since, updated_at)
             VALUES (?, ?, ?, ?, datetime('now'), CASE WHEN ? = 'READY' THEN datetime('now') END, datetime('now'))
             ON CONFLICT(track_id) DO UPDATE SET
               adsense_state = excluded.adsense_state,
               auto_ads = excluded.auto_ads,
               adsense_checked = excluded.adsense_checked,
               ready_since = CASE WHEN excluded.adsense_state = 'READY' THEN COALESCE(adops_sites.ready_since, datetime('now')) ELSE NULL END,
               updated_at = excluded.updated_at`
          ).bind(s.trackId, s.domain, st, auto, st);
        })
      );
    } catch (e) {
      fail("adsense-sync", e);
    }
  } else {
    log({ kind: "adsense-sync", detail: "AdSense belum dihubungkan: semua situs dianggap belum READY (aman, tidak ada yang dieksekusi)" });
  }
  const approved = sites.filter((s) => stateByTrack.get(s.trackId) === "READY");

  // ── 2. Ad Manager inventory ───────────────────────────────────────────────
  let gam: AdManagerClient | null = null;
  if (AD_PLACEMENT === "auto") {
    log({
      kind: "ad-manager",
      detail: "Mode Auto ads (keputusan pemilik: tanpa slot manual). Ad Manager tidak membuat inventory dan tidak memasang floor — halaman tidak punya tag GPT, jadi unit apa pun tidak akan pernah tayang.",
    });
  } else if (c.serviceAccount && c.networkCode) {
    try {
      gam = adManagerClient(await adManagerToken(env, c.serviceAccount), c.networkCode);
      const network = await getNetwork(gam);
      const root = network.effectiveRootAdUnit;
      if (!root) throw new Error("Network tidak punya effectiveRootAdUnit; cek akses API dan role service account.");
      let actual = await listAdUnits(gam);
      const parked = await parkedCodes(env);
      const diff = diffAdUnits(approved, registryIds, actual, parked);
      const nameByCode = new Map(actual.map((a) => [a.code, a.name]));

      // Site nodes first (their parent is the network root), then positions.
      const siteNodes = diff.create.filter((d) => d.parentCode === null);
      const slots = diff.create.filter((d) => d.parentCode !== null);
      if (siteNodes.length) {
        log({ kind: "create-adunits", detail: `${live ? "Membuat" : "AKAN membuat"} ${siteNodes.length} ad unit situs: ${siteNodes.map((d) => d.code).join(", ")}` });
        if (live) {
          for (const batch of chunk(siteNodes)) {
            const made = await batchCreateAdUnits(gam, batch.map((d) => ({ desired: d, parentName: root })));
            for (const m of made) nameByCode.set(m.code, m.name);
            actual = actual.concat(made);
          }
        }
      }
      if (slots.length) {
        log({ kind: "create-adunits", detail: `${live ? "Membuat" : "AKAN membuat"} ${slots.length} ad unit posisi untuk ${new Set(slots.map((d) => d.site)).size} situs` });
        if (live) {
          const ready = slots.filter((d) => nameByCode.has(d.parentCode!));
          for (const batch of chunk(ready)) {
            const made = await batchCreateAdUnits(gam, batch.map((d) => ({ desired: d, parentName: nameByCode.get(d.parentCode!)! })));
            actual = actual.concat(made);
          }
        }
      }
      if (diff.activate.length) {
        log({ kind: "activate", detail: `${live ? "Mengaktifkan" : "AKAN mengaktifkan"} ${diff.activate.map((a) => a.code).join(", ")}` });
        if (live) for (const b of chunk(diff.activate.map((a) => a.name))) await batchSetActive(gam, b, true);
      }
      if (diff.deactivate.length) {
        log({ kind: "deactivate", detail: `${live ? "Menonaktifkan" : "AKAN menonaktifkan"} (situs tidak READY lagi): ${diff.deactivate.map((a) => a.code).join(", ")}` });
        if (live) for (const b of chunk(diff.deactivate.map((a) => a.name))) await batchSetActive(gam, b, false);
      }
      if (live && (diff.activate.length || diff.deactivate.length)) actual = await listAdUnits(gam);
      await saveAdUnits(env, actual, registryIds);
      await env.DB.batch(
        sites.map((s) =>
          env.DB.prepare(
            `INSERT INTO adops_sites (track_id, domain, gam_status, updated_at) VALUES (?, ?, ?, datetime('now'))
             ON CONFLICT(track_id) DO UPDATE SET gam_status = excluded.gam_status, updated_at = excluded.updated_at`
          ).bind(s.trackId, s.domain, siteGamStatus(s.trackId, actual))
        )
      );
    } catch (e) {
      fail("ad-manager", e);
      gam = null;
    }
  } else if (c.serviceAccountError) {
    fail("service-account", new Error(c.serviceAccountError));
  } else {
    log({ kind: "ad-manager", detail: "Ad Manager belum dihubungkan (network code / service account kosong)" });
  }

  // ── 3. Yesterday's report ─────────────────────────────────────────────────
  if (AD_PLACEMENT === "auto" && adsenseBearer) {
    try {
      const rows = await adsenseReport(adsenseBearer, OWNER_ADSENSE_PUB);
      const saved = await saveAdsenseReport(env, rows);
      log({ kind: "report", detail: `Laporan AdSense 7 hari: ${rows.length} baris dibaca, ${saved} segmen disimpan` });
    } catch (e) {
      fail("report", e);
    }
  }
  if (gam) {
    try {
      const reportName = await env.CACHE_KV.get("adops:report-name").catch(() => null);
      const { reportName: name, rows } = await runDailyReport(gam, reportName);
      await env.CACHE_KV.put("adops:report-name", name).catch(() => undefined);
      const saved = await saveReport(env, rows, new Set(registryIds));
      log({ kind: "report", detail: `${rows.length} baris laporan dibaca, ${saved} segmen disimpan` });
    } catch (e) {
      // A stale stored report name (deleted in the UI) must not block forever.
      await env.CACHE_KV.delete("adops:report-name").catch(() => undefined);
      fail("report", e);
    }
  }

  // ── 4. Weekly: floors + weak positions ────────────────────────────────────
  const week = isoWeek(new Date());
  if (AD_PLACEMENT === "gam" && !(await env.CACHE_KV.get(`adops:weekly:${week}`).catch(() => "1"))) {
    try {
      const floorChanges = await weeklyFloors(env, approved.map((s) => s.trackId));
      log({ kind: "floors", detail: floorChanges.length ? `${floorChanges.length} floor baru siap dipasang: ${floorChanges.slice(0, 6).join("; ")}${floorChanges.length > 6 ? " …" : ""}` : "Tidak ada floor yang berubah minggu ini" });
      if (gam) {
        const parkLog = await weeklyParking(env, gam, live);
        for (const p of parkLog) log({ kind: "park", site: p.site, detail: p.detail });
      }
      if (live || !gam) await env.CACHE_KV.put(`adops:weekly:${week}`, "1", { expirationTtl: 9 * 86400 }).catch(() => undefined);
    } catch (e) {
      fail("weekly", e);
    }
  }

  // ── 5. AI summary (never decides anything) ────────────────────────────────
  try {
    const summary = await aiSummary(env, actions, approved.map((s) => s.domain));
    if (summary) log({ kind: "summary", detail: summary.slice(0, 900) });
  } catch (e) {
    fail("summary", e);
  }

  // ── Log + prune ───────────────────────────────────────────────────────────
  const ranAt = new Date().toISOString();
  await env.DB.batch([
    ...actions.map((a) =>
      env.DB.prepare("INSERT INTO adops_actions (mode, kind, site, detail, ok) VALUES (?, ?, ?, ?, ?)").bind(mode, a.kind, a.site ?? null, a.detail, a.ok === false ? 0 : 1)
    ),
    env.DB.prepare("DELETE FROM adops_actions WHERE at < datetime('now', '-90 days')"),
  ]).catch((e) => console.error("adops log failed", e));
  await env.CACHE_KV.put("adops:last-run", JSON.stringify({ mode, ranAt, errors: errors.length, actions: actions.length })).catch(() => undefined);
  return { mode, ranAt, actions, approved: approved.map((s) => s.domain), errors };
}

function siteGamStatus(trackId: string, actual: ActualAdUnit[]): "none" | "live" | "paused" {
  const mine = actual.filter((a) => a.code === trackId || a.code.startsWith(`${trackId}-`));
  if (mine.length === 0) return "none";
  return mine.some((a) => a.status === "ACTIVE" && a.code !== trackId) ? "live" : "paused";
}

async function parkedCodes(env: Env): Promise<Set<string>> {
  const { results } = await env.DB.prepare(
    `SELECT code FROM adops_adunits WHERE parked_at IS NOT NULL AND parked_at > datetime('now', ?)`
  )
    .bind(`-${RETEST_AFTER_DAYS} days`)
    .all<{ code: string }>();
  return new Set((results ?? []).map((r) => r.code));
}

async function saveAdUnits(env: Env, actual: ActualAdUnit[], registryIds: string[]): Promise<void> {
  const registry = new Set(registryIds);
  const ours = actual.filter((a) => siteOfCode(a.code, registry) !== null);
  if (!ours.length) return;
  const stmts = ours.map((a) => {
    const site = siteOfCode(a.code, registry)!;
    const position = a.code === site ? null : a.code.slice(site.length + 1);
    return env.DB.prepare(
      `INSERT INTO adops_adunits (code, site, position, name, status, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(code) DO UPDATE SET name = excluded.name, status = excluded.status, updated_at = excluded.updated_at`
    ).bind(a.code, site, position, a.name, a.status);
  });
  for (const b of chunk(stmts, 50)) await env.DB.batch(b);
}

/**
 * AdSense's own report (Auto ads mode), rolled up to site × tier per day under
 * position 'auto', then upserted. Only registry sites are kept, so a domain
 * that is not the owner's (dawa.es) can never land here. Returns segments saved.
 */
async function saveAdsenseReport(env: Env, rows: AdsenseReportRow[]): Promise<number> {
  const byDomain = new Map(OWNER_SITES.map((s) => [s.domain, s.trackId]));
  const agg = new Map<string, { day: string; site: string; tier: Tier; pv: number; req: number; imp: number; clk: number; rev: number }>();
  for (const r of rows) {
    const site = byDomain.get(r.domain);
    if (!site || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) continue;
    const tier = tierOf(r.country);
    const key = `${r.date}|${site}|${tier}`;
    const cur = agg.get(key) ?? { day: r.date, site, tier, pv: 0, req: 0, imp: 0, clk: 0, rev: 0 };
    cur.pv += r.pageViews;
    cur.req += r.adRequests;
    cur.imp += r.impressions;
    cur.clk += r.clicks;
    cur.rev += r.earnings;
    agg.set(key, cur);
  }
  const stmts = [...agg.values()].map((a) =>
    env.DB.prepare(
      `INSERT INTO adops_daily (day, site, position, tier, page_views, requests, impressions, clicks, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(day, site, position, tier) DO UPDATE SET page_views = excluded.page_views, requests = excluded.requests, impressions = excluded.impressions, clicks = excluded.clicks, revenue = excluded.revenue`
    ).bind(a.day, a.site, AUTO_POSITION, a.tier, a.pv, a.req, a.imp, a.clk, Math.round(a.rev * 10000) / 10000)
  );
  for (const b of chunk(stmts, 50)) await env.DB.batch(b);
  return stmts.length;
}

/** Roll the report up to site × position × tier per day, then upsert. Returns segments saved. */
async function saveReport(env: Env, rows: ReportRow[], registry: Set<string>): Promise<number> {
  const agg = new Map<string, { day: string; site: string; position: string; tier: Tier; m: SegmentMetrics & { clicks: number } }>();
  for (const r of rows) {
    const site = siteOfCode(r.adUnitCode, registry);
    if (!site || r.adUnitCode === site) continue;
    const position = r.adUnitCode.slice(site.length + 1);
    const tier = tierOf(r.country);
    const key = `${r.date}|${site}|${position}|${tier}`;
    const cur = agg.get(key) ?? { day: r.date, site, position, tier, m: { requests: 0, impressions: 0, revenue: 0, clicks: 0 } };
    cur.m.requests += r.requests;
    cur.m.impressions += r.impressions;
    cur.m.revenue += r.revenue;
    cur.m.clicks += r.clicks;
    agg.set(key, cur);
  }
  const stmts = [...agg.values()].map((a) =>
    env.DB.prepare(
      `INSERT INTO adops_daily (day, site, position, tier, requests, impressions, clicks, revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(day, site, position, tier) DO UPDATE SET requests = excluded.requests, impressions = excluded.impressions, clicks = excluded.clicks, revenue = excluded.revenue`
    ).bind(a.day, a.site, a.position, a.tier, a.m.requests, a.m.impressions, a.m.clicks, Math.round(a.m.revenue * 10000) / 10000)
  );
  for (const b of chunk(stmts, 50)) await env.DB.batch(b);
  return stmts.length;
}

interface SegRow {
  site: string;
  position: string;
  tier: Tier;
  requests: number;
  impressions: number;
  revenue: number;
}

async function segmentTotals(env: Env, from: string, to: string): Promise<Map<string, SegmentMetrics>> {
  const { results } = await env.DB.prepare(
    `SELECT site, position, tier, SUM(requests) AS requests, SUM(impressions) AS impressions, SUM(revenue) AS revenue
     FROM adops_daily WHERE day >= ? AND day <= ? GROUP BY site, position, tier`
  )
    .bind(from, to)
    .all<SegRow>();
  return new Map((results ?? []).map((r) => [`${r.site}|${r.position}|${r.tier}`, { requests: r.requests, impressions: r.impressions, revenue: r.revenue }]));
}

/** §6 for every segment of every approved site. Returns human-readable changes. */
async function weeklyFloors(env: Env, approvedTrackIds: string[]): Promise<string[]> {
  const now = await segmentTotals(env, daysAgo(7), daysAgo(1));
  const prev = await segmentTotals(env, daysAgo(14), daysAgo(8));
  const { results } = await env.DB.prepare("SELECT site, position, tier, floor, previous_floor, last_step FROM adops_floors").all<{
    site: string;
    position: string;
    tier: Tier;
    floor: number;
    previous_floor: number | null;
    last_step: "up" | "down" | null;
  }>();
  const states = new Map((results ?? []).map((r) => [`${r.site}|${r.position}|${r.tier}`, r]));
  const changes: string[] = [];
  const stmts: D1PreparedStatement[] = [];
  for (const site of approvedTrackIds) {
    for (const position of Object.keys(POSITIONS) as Position[]) {
      for (const tier of ["T1", "T2", "T3"] as Tier[]) {
        const key = `${site}|${position}|${tier}`;
        const st = states.get(key);
        const state: FloorState = st ? { floor: st.floor, previousFloor: st.previous_floor, lastStep: st.last_step } : { floor: INITIAL_FLOOR[tier], previousFloor: null, lastStep: null };
        const d = nextFloor(state, now.get(key) ?? { requests: 0, impressions: 0, revenue: 0 }, prev.get(key) ?? null);
        if (!st || d.changed) {
          stmts.push(
            env.DB.prepare(
              `INSERT INTO adops_floors (site, position, tier, floor, previous_floor, last_step, reason, decided_at, applied)
               VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 0)
               ON CONFLICT(site, position, tier) DO UPDATE SET floor = excluded.floor, previous_floor = excluded.previous_floor,
                 last_step = excluded.last_step, reason = excluded.reason, decided_at = excluded.decided_at, applied = 0`
            ).bind(site, position, tier, d.floor, d.previousFloor, d.lastStep, st ? d.reason : `floor awal ${tier}`)
          );
          changes.push(`${site}-${position} ${tier}: $${d.floor.toFixed(2)}`);
        }
      }
    }
  }
  for (const b of chunk(stmts, 50)) await env.DB.batch(b);
  return changes;
}

/** §7: park weak unprotected units, retest parked ones after 8 weeks. */
async function weeklyParking(env: Env, gam: AdManagerClient, live: boolean): Promise<{ site: string; detail: string }[]> {
  const out: { site: string; detail: string }[] = [];
  // Weekly RPM per unit and per site for the last 4 full weeks.
  const weeksUnit = new Map<string, { requests: number; revenue: number }[]>();
  const weeksSite = new Map<string, number[]>();
  for (let w = 0; w < 4; w++) {
    const from = daysAgo(7 * (w + 1));
    const to = daysAgo(7 * w + 1);
    const { results } = await env.DB.prepare(
      `SELECT site, position, SUM(requests) AS requests, SUM(revenue) AS revenue FROM adops_daily WHERE day >= ? AND day <= ? GROUP BY site, position`
    )
      .bind(from, to)
      .all<{ site: string; position: string; requests: number; revenue: number }>();
    const siteTot = new Map<string, { requests: number; revenue: number }>();
    for (const r of results ?? []) {
      const code = `${r.site}-${r.position}`;
      const arr = weeksUnit.get(code) ?? [];
      arr[w] = { requests: r.requests, revenue: r.revenue };
      weeksUnit.set(code, arr);
      const t = siteTot.get(r.site) ?? { requests: 0, revenue: 0 };
      t.requests += r.requests;
      t.revenue += r.revenue;
      siteTot.set(r.site, t);
    }
    for (const [site, t] of siteTot) {
      const arr = weeksSite.get(site) ?? [];
      arr[w] = t.requests > 0 ? (t.revenue / t.requests) * 1000 : 0;
      weeksSite.set(site, arr);
    }
  }
  const { results: units } = await env.DB.prepare(
    "SELECT code, site, position, name, status, parked_at FROM adops_adunits WHERE position IS NOT NULL"
  ).all<{ code: string; site: string; position: Position; name: string; status: string; parked_at: string | null }>();
  const toPark: typeof units = [];
  const toRetest: typeof units = [];
  for (const u of units ?? []) {
    if (u.parked_at) {
      if (Date.parse(`${u.parked_at.replace(" ", "T")}Z`) < Date.now() - RETEST_AFTER_DAYS * 86400_000) toRetest.push(u);
      continue;
    }
    if (u.status !== "ACTIVE") continue;
    const weeks = weeksUnit.get(u.code) ?? [];
    const siteRpm = weeksSite.get(u.site) ?? [];
    const dense = [0, 1, 2, 3].map((i) => weeks[i] ?? { requests: 0, revenue: 0 });
    const denseSite = [0, 1, 2, 3].map((i) => siteRpm[i] ?? 0);
    const verdict = shouldPark({ code: u.code, protected: POSITIONS[u.position]?.protected ?? true, weeks: weeks.length ? dense : [], siteRpm: siteRpm.length ? denseSite : [] });
    if (verdict.park) {
      toPark.push(u);
      out.push({ site: u.site, detail: `${live ? "Menonaktifkan" : "AKAN menonaktifkan"} ${u.code}: ${verdict.reason}` });
    }
  }
  for (const u of toRetest) out.push({ site: u.site, detail: `${live ? "Mengaktifkan ulang" : "AKAN mengaktifkan ulang"} ${u.code} untuk uji ulang (8 minggu)` });
  if (live) {
    for (const b of chunk(toPark.map((u) => u.name))) await batchSetActive(gam, b, false);
    for (const b of chunk(toRetest.map((u) => u.name))) await batchSetActive(gam, b, true);
    const stmts = [
      ...toPark.map((u) => env.DB.prepare("UPDATE adops_adunits SET parked_at = datetime('now'), park_reason = ?, status = 'INACTIVE' WHERE code = ?").bind("RPM < 20% rata-rata situs 4 minggu", u.code)),
      ...toRetest.map((u) => env.DB.prepare("UPDATE adops_adunits SET parked_at = NULL, park_reason = NULL, status = 'ACTIVE' WHERE code = ?").bind(u.code)),
    ];
    for (const b of chunk(stmts, 50)) if (b.length) await env.DB.batch(b);
  }
  return out;
}

/** ISO week id like 2026-W40. */
export function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((t.getTime() - y0.getTime()) / 86400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(w).padStart(2, "0")}`;
}

/** One Indonesian paragraph about yesterday, via the AI hub with checkpoints. */
async function aiSummary(env: Env, actions: Action[], approvedDomains: string[]): Promise<string | null> {
  const yesterday = daysAgo(1);
  const { results } = await env.DB.prepare(
    `SELECT site, SUM(requests) AS requests, SUM(impressions) AS impressions, SUM(clicks) AS clicks, SUM(revenue) AS revenue
     FROM adops_daily WHERE day = ? GROUP BY site ORDER BY revenue DESC`
  )
    .bind(yesterday)
    .all<{ site: string; requests: number; impressions: number; clicks: number; revenue: number }>();
  const facts = [
    `Tanggal: ${yesterday}.`,
    `Situs yang sudah di-approve AdSense: ${approvedDomains.length ? approvedDomains.join(", ") : "belum ada"}.`,
    ...(results ?? []).map((r) => `${r.site}: ${r.requests} permintaan, ${r.impressions} tayangan, ${r.clicks} klik, $${r.revenue.toFixed(2)}.`),
    ...actions.filter((a) => a.kind !== "summary").map((a) => `Aksi ${a.kind}${a.ok === false ? " (GAGAL)" : ""}: ${a.detail}`),
  ].join("\n");
  const r = await runCheckpointed(env, `summary:${yesterday}`, [
    {
      id: "ringkasan",
      capability: "summarize",
      prompt: () =>
        `Tulis SATU paragraf ringkas (maksimal 90 kata) dalam bahasa Indonesia untuk pemilik situs tentang hasil iklan kemarin. Hanya pakai fakta berikut, jangan mengarang angka, jangan memberi saran baru:\n${facts}`,
      maxTokens: 300,
    },
  ]);
  return r.ok ? r.outputs.ringkasan ?? null : null;
}
