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
import { runScalingTick } from "./lib/scaling.js";

export { KeyPoolCoordinator } from "./durable-objects/KeyPoolCoordinator.js";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  const allowOrigin = c.env.CORS_ALLOW_ORIGIN ?? c.env.PUBLIC_SITE_URL ?? "*";
  return cors({ origin: allowOrigin, credentials: true })(c, next);
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

  // Health Checker (§13.1) + zero-hand content-gap scheduler (§14), every 15 min.
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const id = env.KEY_POOL.idFromName("global");
    const stub = env.KEY_POOL.get(id);
    ctx.waitUntil(
      Promise.all([
        stub.fetch("https://internal/health-tick", { method: "POST" }).catch((e) => console.error("health-tick failed", e)),
        runScalingTick(env).catch((e) => console.error("scaling-tick failed", e)),
      ]).then(() => undefined)
    );
  },
};
