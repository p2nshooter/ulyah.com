import { Hono } from "hono";
import type { Env } from "../env.js";
import { checkRateLimit } from "../lib/rate-limit.js";

export const analyticsRoute = new Hono<{ Bindings: Env }>();

// POST /analytics/pageview — lightweight, public beacon fired once per page
// load (see AnalyticsBeacon.tsx). Country comes from Cloudflare's own edge
// header, never trusts client input, so it can't be spoofed by the beacon body.
analyticsRoute.post("/pageview", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `pageview:${ip}`, 60, 60); // 60/min per IP — generous for real browsing, blocks flood
  if (!rl.allowed) return c.json({ ok: false }, 429);

  const { path, locale } = await c.req.json<{ path?: string; locale?: string }>().catch(() => ({}) as any);
  const country = c.req.header("cf-ipcountry")?.toUpperCase() ?? null;

  await c.env.DB.prepare("INSERT INTO analytics_pageviews (path, country, locale) VALUES (?, ?, ?)")
    .bind(String(path ?? "/").slice(0, 200), country, String(locale ?? "").slice(0, 5) || null)
    .run();

  return c.json({ ok: true });
});

// POST /analytics/install — fired once when a visitor actually accepts the
// installable-PWA prompt (see InstallAppButton.tsx). Distinguishes the main
// app from the standalone Jadwal Sholat mini-app so the admin portal can
// show install counts per app, not just a single combined number.
analyticsRoute.post("/install", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `install:${ip}`, 10, 60);
  if (!rl.allowed) return c.json({ ok: false }, 429);

  const { app } = await c.req.json<{ app?: string }>().catch(() => ({}) as any);
  const appKey = app === "sholat" || app === "radio" ? app : "main";
  const country = c.req.header("cf-ipcountry")?.toUpperCase() ?? null;

  await c.env.DB.prepare("INSERT INTO app_installs (app, country) VALUES (?, ?)").bind(appKey, country).run();

  return c.json({ ok: true });
});
