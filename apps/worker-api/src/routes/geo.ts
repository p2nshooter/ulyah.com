import { Hono } from "hono";
import type { Env } from "../env.js";

export const geoRoute = new Hono<{ Bindings: Env }>();

/**
 * GET /geo/me — visitor location, straight from Cloudflare's own edge data
 * (request.cf), never a third-party geo-IP API or key. Powers the prayer
 * schedule widget's "lock to visitor's country" behaviour and the digital
 * world-clock row.
 */
geoRoute.get("/me", (c) => {
  const cf = c.req.raw.cf as IncomingRequestCfProperties | undefined;
  return c.json({
    country: cf?.country ?? null,
    city: cf?.city ?? null,
    region: cf?.region ?? null,
    latitude: cf?.latitude ? Number(cf.latitude) : null,
    longitude: cf?.longitude ? Number(cf.longitude) : null,
    timezone: cf?.timezone ?? null,
  });
});
