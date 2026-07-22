import { Hono } from "hono";
import type { Context } from "hono";
import type { Env } from "../env.js";
import { checkRateLimit } from "../lib/rate-limit.js";

export const analyticsRoute = new Hono<{ Bindings: Env }>();

/** Which sibling site the request came from — derived from the Origin (or
 * Referer) header, never trusted from the body. One content DB, four sites:
 * 1fr.fr, tilawa.de and dawa.es each count themselves; ulyah is the default. */
export function tenantFromReq(c: { req: { header: (n: string) => string | undefined } }): string {
  const src = c.req.header("origin") || c.req.header("referer") || "";
  if (src.includes("1fr.fr")) return "1fr";
  if (src.includes("tilawa.de")) return "tilawa";
  if (src.includes("dawa.es")) return "dawa";
  if (src.includes("xad.es")) return "xad";
  return "ulyah";
}

// POST /analytics/pageview — lightweight, public beacon fired once per page
// load (see AnalyticsBeacon.tsx). Country comes from Cloudflare's own edge
// header, never trusts client input, so it can't be spoofed by the beacon body.
analyticsRoute.post("/pageview", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `pageview:${ip}`, 60, 60); // 60/min per IP — generous for real browsing, blocks flood
  if (!rl.allowed) return c.json({ ok: false }, 429);

  const { path, locale, device } = await c.req.json<{ path?: string; locale?: string; device?: string }>().catch(() => ({}) as any);
  const country = c.req.header("cf-ipcountry")?.toUpperCase() ?? null;

  await c.env.DB.prepare("INSERT INTO analytics_pageviews (path, country, locale, tenant, device_id) VALUES (?, ?, ?, ?, ?)")
    .bind(String(path ?? "/").slice(0, 200), country, String(locale ?? "").slice(0, 5) || null, tenantFromReq(c), deviceParam(device))
    .run();

  return c.json({ ok: true });
});

// ── Real-time presence ────────────────────────────────────────────────────
// A heartbeat while the page is open (PresenceBeacon.tsx) → the admin can show,
// within ~3s, how many devices are on each ecosystem site RIGHT NOW and how
// many just left. text/plain bodies so cross-origin beacons need no preflight;
// tenant comes from the Origin, never the body.
async function readDevice(c: Context<{ Bindings: Env }>): Promise<string | undefined> {
  try {
    return (JSON.parse((await c.req.text()) || "{}") as { device?: string }).device;
  } catch {
    return undefined;
  }
}
function corsPreflight(c: Context<{ Bindings: Env }>) {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  return c.body(null, 204);
}

// POST /analytics/ping — presence heartbeat. Upsert this device's last-seen.
analyticsRoute.post("/ping", async (c) => {
  const dev = deviceParam(await readDevice(c));
  c.header("Access-Control-Allow-Origin", "*");
  if (!dev) return c.body(null, 204);
  const now = Math.floor(Date.now() / 1000);
  await c.env.DB.prepare(
    `INSERT INTO live_presence (tenant, device_id, last_seen) VALUES (?, ?, ?)
     ON CONFLICT(tenant, device_id) DO UPDATE SET last_seen = excluded.last_seen`
  )
    .bind(tenantFromReq(c), dev, now)
    .run();
  return c.body(null, 204);
});

// POST /analytics/leave — best-effort "closed" signal (pagehide/tab-hidden).
// Ages the device just past the online window so the live count drops at once
// instead of waiting for the heartbeat to lapse.
analyticsRoute.post("/leave", async (c) => {
  const dev = deviceParam(await readDevice(c));
  c.header("Access-Control-Allow-Origin", "*");
  if (!dev) return c.body(null, 204);
  const gone = Math.floor(Date.now() / 1000) - 25; // just outside the 20s "online" window
  await c.env.DB.prepare(
    `UPDATE live_presence SET last_seen = ? WHERE tenant = ? AND device_id = ? AND last_seen > ?`
  )
    .bind(gone, tenantFromReq(c), dev, gone)
    .run();
  return c.body(null, 204);
});

analyticsRoute.options("/ping", corsPreflight);
analyticsRoute.options("/leave", corsPreflight);

// POST /analytics/install — fired once when a visitor actually accepts the
// installable-PWA prompt (see InstallAppButton.tsx). Distinguishes the main
// app from the standalone Jadwal Sholat mini-app so the admin portal can
// show install counts per app, not just a single combined number.
/** Anonymous per-device id from the beacon body — random localStorage token,
 * never a fingerprint. Sanitized hard so nothing else can ride in on it. */
function deviceParam(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  return clean.length >= 8 ? clean : null;
}

analyticsRoute.post("/install", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `install:${ip}`, 10, 60);
  if (!rl.allowed) return c.json({ ok: false }, 429);

  const { app, device } = await c.req.json<{ app?: string; device?: string }>().catch(() => ({}) as any);
  const appKey = app === "sholat" || app === "radio" || app === "quran-flipbook" || app === "kitab" ? app : "main";
  const country = c.req.header("cf-ipcountry")?.toUpperCase() ?? null;

  await c.env.DB.prepare("INSERT INTO app_installs (app, country, tenant, device_id) VALUES (?, ?, ?, ?)")
    .bind(appKey, country, tenantFromReq(c), deviceParam(device))
    .run();

  return c.json({ ok: true });
});

// POST /analytics/uninstall — best-effort: the web platform has no reliable
// "uninstalled" event, so the client fires this once when a device that
// previously reported the app installed comes back NOT running standalone and
// getInstalledRelatedApps reports none (see InstallAppButton.tsx). Surfaced as
// an approximation in the admin portal.
analyticsRoute.post("/uninstall", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `uninstall:${ip}`, 10, 60);
  if (!rl.allowed) return c.json({ ok: false }, 429);

  const { app, device } = await c.req.json<{ app?: string; device?: string }>().catch(() => ({}) as any);
  const appKey = app === "sholat" || app === "radio" || app === "quran-flipbook" || app === "kitab" ? app : "main";
  const country = c.req.header("cf-ipcountry")?.toUpperCase() ?? null;

  await c.env.DB.prepare("INSERT INTO app_uninstalls (app, country, tenant, device_id) VALUES (?, ?, ?, ?)")
    .bind(appKey, country, tenantFromReq(c), deviceParam(device))
    .run();

  return c.json({ ok: true });
});

