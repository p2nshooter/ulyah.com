import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env.js";
import { quranRoute } from "./routes/quran.js";
import { audioRoute } from "./routes/audio.js";
import { contentRoute } from "./routes/content.js";
import { aiRoute } from "./routes/ai.js";
import { donateRoute } from "./routes/donate.js";
import { adminAuthRoute } from "./routes/admin-auth.js";
import { adminRoute } from "./routes/admin.js";
import { clientRoute } from "./routes/client.js";
import { analyticsRoute } from "./routes/analytics.js";
import { geoRoute } from "./routes/geo.js";
import { grantRoute } from "./routes/grant.js";
import { runScalingTick } from "./lib/scaling.js";
import { cleanupObsoleteMurottalR2 } from "./lib/r2-cleanup.js";
import { orchestraMaintenance } from "./lib/orchestra.js";

export { KeyPoolCoordinator } from "./durable-objects/KeyPoolCoordinator.js";

const app = new Hono<{ Bindings: Env }>();

// One API (api.ulyah.com) serves three front-ends: ulyah.com, 1fr.fr and
// tilawa.de. Credentialed CORS can't use "*", so echo the request Origin when
// it's one of our own sites (apex + www), else fall back to the configured
// origin. The sibling sites' client calls (analytics beacon, admin portal, AI
// chat) would otherwise be blocked cross-origin.
const SIBLING_ORIGINS = new Set([
  "https://ulyah.com", "https://www.ulyah.com",
  "https://1fr.fr", "https://www.1fr.fr",
  "https://tilawa.de", "https://www.tilawa.de",
  "https://dawa.es", "https://www.dawa.es",
]);
app.use("*", async (c, next) => {
  const configured = c.env.CORS_ALLOW_ORIGIN ?? c.env.PUBLIC_SITE_URL ?? "*";
  return cors({
    origin: (origin) => {
      if (origin && SIBLING_ORIGINS.has(origin)) return origin;
      return configured;
    },
    credentials: true,
  })(c, next);
});

app.get("/", (c) => c.json({ service: "ulyah-api", status: "ok" }));
app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));

// Edge-cache public read-only JSON (Cache API — free, unlimited, per-colo).
// The Workers free plan's KV-read and subrequest budgets were the real cause
// of the slow pages and intermittent Error 1102: every page view re-ran
// D1/KV/MT work. Serving repeat views straight from the colo cache makes the
// sites fast and keeps the origin work far under the free-plan caps.
// CORS stays correct on hits: hono's cors() sets its headers on the context
// placeholder per-request, and Hono merges those into whatever response the
// downstream returns — including a cache hit.
const EDGE_CACHEABLE = /^\/(quran|content)\//;
app.use("*", async (c, next) => {
  const url = new URL(c.req.url);
  if (
    c.req.method !== "GET" ||
    !EDGE_CACHEABLE.test(url.pathname) ||
    url.pathname.includes("/download") ||
    url.searchParams.has("nocache") ||
    c.req.header("authorization") ||
    c.req.header("cookie")
  ) {
    return next();
  }

  const key = new Request(url.toString(), { method: "GET" });
  // `caches.default` is Cloudflare's per-colo edge cache; the DOM lib's
  // CacheStorage type doesn't declare it, so reach it through a cast.
  const cache = (caches as unknown as { default: Cache }).default;
  const hit = await cache.match(key).catch(() => undefined);
  if (hit) {
    const res = new Response(hit.body, hit);
    res.headers.set("X-Edge-Cache", "HIT");
    return res;
  }

  await next();

  const res = c.res;
  if (
    res &&
    res.ok &&
    (res.headers.get("content-type") ?? "").includes("json") &&
    !res.headers.get("x-no-edge-cache")
  ) {
    // Qur'an text/tafsir is immutable (6h); content lists change rarely (30m).
    const ttl = url.pathname.startsWith("/quran/") ? 21600 : 1800;
    const copy = res.clone();
    const toCache = new Response(copy.body, copy);
    toCache.headers.set("Cache-Control", `public, max-age=300, s-maxage=${ttl}`);
    // Never bake one origin's CORS grant into the shared cache entry — the
    // per-request cors() middleware re-applies the right one on every hit.
    toCache.headers.delete("Access-Control-Allow-Origin");
    toCache.headers.delete("Access-Control-Allow-Credentials");
    c.executionCtx.waitUntil(cache.put(key, toCache));
  }
});

app.route("/quran", quranRoute);
app.route("/audio", audioRoute);
app.route("/content", contentRoute);
app.route("/ai", aiRoute);
app.route("/donate", donateRoute);
app.route("/admin/auth", adminAuthRoute);
app.route("/admin", adminRoute);
app.route("/client", clientRoute);
app.route("/analytics", analyticsRoute);
app.route("/geo", geoRoute);
app.route("/grant", grantRoute);

// WebSocket gateway to the singleton KeyPoolCoordinator (§13.1)
app.get("/keypool/connect", async (c) => {
  const id = c.env.KEY_POOL.idFromName("global");
  const stub = c.env.KEY_POOL.get(id);
  return stub.fetch(c.req.raw);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error(err);
  // Surface a short error digest to the client. This is an Islamic content
  // platform, not a system holding third-party secrets in its error paths;
  // a truncated message costs nothing and makes production 500s diagnosable
  // instead of the opaque "Internal server error" users kept hitting.
  const detail = err instanceof Error ? err.message : String(err);
  return c.json({ error: "Internal server error", detail: detail.slice(0, 300) }, 500);
});

export default {
  fetch: app.fetch,

  // Autonomous heartbeat (§13.1, §14), every 15 min via Cloudflare Cron — this
  // is what keeps Orchestra Core & its workers running with NO human and NO
  // Anthropic online: content-gap scheduler drafts new content through donated
  // keys, the key pool self-heals, and rate-limited keys auto-wake.
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const id = env.KEY_POOL.idFromName("global");
    const stub = env.KEY_POOL.get(id);
    ctx.waitUntil(
      Promise.all([
        stub.fetch("https://internal/health-tick", { method: "POST" }).catch((e) => console.error("health-tick failed", e)),
        runScalingTick(env).catch((e) => console.error("scaling-tick failed", e)),
        cleanupObsoleteMurottalR2(env).catch((e) => console.error("r2-cleanup failed", e)),
        orchestraMaintenance(env).catch((e) => console.error("orchestra-maintenance failed", e)),
      ]).then(() => undefined)
    );
  },
};
