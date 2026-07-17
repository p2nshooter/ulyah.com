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
