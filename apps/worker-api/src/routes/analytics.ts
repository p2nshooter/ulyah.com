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
