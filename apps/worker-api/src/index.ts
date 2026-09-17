import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./env.js";
import { quranRoute } from "./routes/quran.js";
import { audioRoute } from "./routes/audio.js";
import { contentRoute, trackBeacon, trackOptions, trackPing, trackLeave } from "./routes/content.js";
import { aiRoute } from "./routes/ai.js";
import { donateRoute } from "./routes/donate.js";
import { adminAuthRoute } from "./routes/admin-auth.js";
import { adminRoute } from "./routes/admin.js";
import { clientRoute } from "./routes/client.js";
import { analyticsRoute } from "./routes/analytics.js";
import { geoRoute } from "./routes/geo.js";
import { grantRoute } from "./routes/grant.js";
import { aliexpressRoute, aliexpressAuthRoute } from "./routes/aliexpress.js";
import { runScalingTick } from "./lib/scaling.js";
import { orchestraMaintenance } from "./lib/orchestra.js";
import { contentBotTick } from "./lib/content-bot.js";

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
  // xad.es is the English member of the ecosystem. Leaving it out of this
  // set blocked EVERY credentialed API call from xad.es (including the surah
  // index the radio needs before it can start) — the "radio xad.es ga bisa"
  // report.
  "https://xad.es", "https://www.xad.es",
  // AXTO network reads the central ad config from api.ulyah.com too.
  "https://axto.io", "https://www.axto.io",
  "https://axto.dev", "https://www.axto.dev",
  "https://axto.us", "https://www.axto.us",
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
// Public pageview beacon at the BARE /track. Every ecosystem + external site
// posts here (TrafficBeacon/SiteBeacon → https://api.ulyah.com/track); the
// handler also lives under /content/track, but the beacons call the bare path,
// so without this alias every hit 404s and the admin traffic panel stays at 0.
app.post("/track", trackBeacon);
app.options("/track", trackOptions);
// External-site presence heartbeat (SiteBeacon) → same live_presence table as
// the ecosystem, so "online sekarang" is ≤5s real-time for every site alike.
app.post("/track/ping", trackPing);
app.post("/track/leave", trackLeave);
app.options("/track/ping", trackOptions);
app.options("/track/leave", trackOptions);
app.route("/ai", aiRoute);
app.route("/donate", donateRoute);
app.route("/admin/auth", adminAuthRoute);
app.route("/admin", adminRoute);
app.route("/client", clientRoute);
app.route("/analytics", analyticsRoute);
app.route("/geo", geoRoute);
app.route("/grant", grantRoute);
// One door to AliExpress for all twelve sites: the app secret and the access
// token live only here, and the sites call the cached read-only endpoints.
app.route("/aliexpress", aliexpressRoute);
app.route("/auth/aliexpress", aliexpressAuthRoute);

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

// ── Deleting the stored murottal library ─────────────────────────────────
//
// Owner: "hilangin audio2 alquran murottal ganti dengan cdn." Recitation is
// played from the reciters' own CDNs now (apps/web/src/lib/qori-cdn.ts, and
// routes/audio.ts redirects rather than serving bytes), so NOTHING reads these
// objects. They are ~17 GB of R2 the owner already called dead weight ("cuma
// jadi beban") when only the legacy half was unreachable.
//
// Both prefixes go, each with its own flag so one finishing never stops the
// other:
//   audio/qori/   the original library, pre-128 kbps, muffled;
//   audio/qori2/  the HiFi library that replaced it.
//
// NOTE the trailing slashes, and that they are why this is safe: a list on
// "audio/qori/" cannot match "audio/qori2/…", and neither can match the kids
// audio, the story narration or anything else in the bucket. A slice per tick,
// bounded, so a 15-minute heartbeat is never spent on this alone; the flag is
// written when a prefix is empty so the work stops for good rather than
// listing an empty prefix every quarter hour, forever.
const MUROTTAL_PREFIXES: { prefix: string; flag: string; what: string }[] = [
  { prefix: "audio/qori/", flag: "cleanup:r2-murottal-legacy-lowbitrate-done", what: "legacy low-bitrate" },
  { prefix: "audio/qori2/", flag: "cleanup:r2-murottal-qori2-done", what: "HiFi" },
];

async function purgeMurottalPrefix(env: Env, { prefix, flag, what }: (typeof MUROTTAL_PREFIXES)[number]): Promise<void> {
  const done = await env.CACHE_KV.get(flag).catch(() => null);
  if (done) return;
  let cursor: string | undefined;
  let deleted = 0;
  for (let page = 0; page < 20; page++) {
    const listing = await env.MEDIA_R2.list({ prefix, cursor, limit: 1000 });
    const keys = listing.objects.map((o) => o.key);
    if (keys.length > 0) {
      await env.MEDIA_R2.delete(keys);
      deleted += keys.length;
    }
    if (listing.truncated) {
      cursor = listing.cursor;
    } else {
      await env.CACHE_KV.put(flag, `1:${deleted}`).catch(() => {});
      console.log(`Murottal purge (${what}) complete — removed ${deleted} object(s) under ${prefix}.`);
      return;
    }
  }
  console.log(`Murottal purge (${what}): removed ${deleted} object(s) this tick, more remain — continuing next tick.`);
}

/**
 * The catalogue rows that pointed at those objects. `audio_cache` existed to
 * record which ayah of which qori was already in R2; with the library gone it
 * describes nothing, and it is D1 rows, which is the resource the platform
 * actually runs out of. Bounded per tick like the objects above, and it stops
 * as soon as the table is empty.
 */
async function purgeMurottalCatalogue(env: Env): Promise<void> {
  const flag = "cleanup:d1-audio-cache-done";
  const done = await env.CACHE_KV.get(flag).catch(() => null);
  if (done) return;
  const res = await env.DB.prepare(
    "DELETE FROM audio_cache WHERE rowid IN (SELECT rowid FROM audio_cache LIMIT 2000)"
  ).run();
  // D1 reports what it changed; nothing changed means the table is empty.
  if (!res.meta?.changes) {
    await env.CACHE_KV.put(flag, "1").catch(() => {});
    console.log("Murottal catalogue purge complete — audio_cache is empty.");
  }
}

async function purgeMurottalLibrary(env: Env): Promise<void> {
  for (const p of MUROTTAL_PREFIXES) {
    await purgeMurottalPrefix(env, p).catch((e) => console.error(`murottal purge ${p.prefix} failed`, e));
  }
  await purgeMurottalCatalogue(env).catch((e) => console.error("audio_cache purge failed", e));
}

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
        // Prune the live-traffic rolling window (site_hits only needs the
        // last few minutes to answer "online sekarang").
        env.DB.prepare("DELETE FROM site_hits WHERE ts < strftime('%s','now') - 1800")
          .run()
          .catch((e) => console.error("site-hits prune failed", e)),
        purgeMurottalLibrary(env).catch((e) => console.error("murottal purge failed", e)),
        orchestraMaintenance(env).catch((e) => console.error("orchestra-maintenance failed", e)),
        // Autonomous content bot: the Orchestra writes + auto-publishes one
        // article per tick to an eligible article site (inert until
        // GH_CONTENT_TOKEN is set; throttled per site).
        contentBotTick(env).catch((e) => console.error("content-bot failed", e)),
      ]).then(() => undefined)
    );
  },
};
