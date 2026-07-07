import { Hono } from "hono";
import { decryptApiKey } from "@ulyah/shared/crypto";
import { testApiKey } from "@ulyah/key-pool";
import { getProvider, AI_PROVIDERS } from "@ulyah/shared/providers";
import type { Env } from "../env.js";
import { requireAdmin } from "../lib/auth-middleware.js";
import { logAdminAction } from "../lib/audit.js";
import { ingestAndTestKey } from "../lib/keypool-db.js";

export const adminRoute = new Hono<{ Bindings: Env }>();
adminRoute.use("*", requireAdmin);

// GET /admin/dashboard — summary tiles for wireframe §23.1
adminRoute.get("/dashboard", async (c) => {
  const [keys, jobs, donations, clients] = await Promise.all([
    c.env.DB.prepare(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) AS healthy FROM ai_key_pool"
    ).first(),
    c.env.DB.prepare(
      "SELECT COUNT(*) AS queued, SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed FROM generation_jobs WHERE status IN ('queued','running','failed')"
    ).first(),
    c.env.DB.prepare(
      "SELECT COALESCE(SUM(amount),0) AS total_this_month FROM donation_logs WHERE status='confirmed' AND type != 'api_key_donation' AND created_at >= datetime('now','start of month')"
    ).first(),
    c.env.DB.prepare("SELECT COUNT(*) AS total FROM clients").first(),
  ]);
  return c.json({ keys, jobs, donations, clients });
});

// ── Key Pool Manager (§12.2, §23.2) ───────────────────────────────────────

adminRoute.get("/keys", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, provider, scope, status, quota_used, quota_limit, latency_ms, priority, donor_label, last_health_check, created_at FROM ai_key_pool ORDER BY priority, provider"
  ).all();
  return c.json({ keys: results, providers: AI_PROVIDERS });
});

adminRoute.post("/keys", async (c) => {
  const { provider, scope, rawKey, priority, donorLabel } = await c.req.json<{
    provider: string;
    scope: "text" | "tts" | "gpu" | "image";
    rawKey: string;
    priority?: number;
    donorLabel?: string;
  }>();
  if (!getProvider(provider)) return c.json({ error: "Unknown provider" }, 400);

  const result = await ingestAndTestKey(c.env, {
    provider,
    scope,
    rawKey,
    priority,
    donorLabel: donorLabel ?? "admin",
  });

  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "key_added", admin.email, c.req.header("cf-connecting-ip") ?? null, {
    provider,
    scope,
    passed: result.test.passed,
  });

  return c.json(result);
});

adminRoute.delete("/keys/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await c.env.DB.prepare("UPDATE ai_key_pool SET status = 'revoked' WHERE id = ?").bind(id).run();
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "key_revoked", admin.email, c.req.header("cf-connecting-ip") ?? null, { id });
  return c.json({ ok: true });
});

// Re-run the automated safety/optimality test on demand (admin button)
adminRoute.post("/keys/:id/retest", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await c.env.DB.prepare("SELECT provider, key_ref, key_iv FROM ai_key_pool WHERE id = ?")
    .bind(id)
    .first<{ provider: string; key_ref: string; key_iv: string }>();
  if (!row) return c.json({ error: "Key not found" }, 404);

  const rawKey = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, c.env.KEY_ENCRYPTION_SECRET);
  const test = await testApiKey(row.provider, rawKey);

  await c.env.DB.prepare(
    "UPDATE ai_key_pool SET status = ?, latency_ms = ?, last_health_check = datetime('now') WHERE id = ?"
  )
    .bind(test.passed ? (test.optimal ? "active" : "slow") : "exhausted", test.latencyMs, id)
    .run();
  await c.env.DB.prepare(
    "INSERT INTO key_validation_log (key_id, test_type, passed, latency_ms, safety_score, detail) VALUES (?, 'auth_check', ?, ?, ?, ?)"
  )
    .bind(id, test.passed ? 1 : 0, test.latencyMs, test.safetyScore, test.detail)
    .run();

  return c.json({ test });
});

// ── Content review queue (§12.2, §23.3, §23.4) ────────────────────────────

adminRoute.get("/jobs", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM generation_jobs ORDER BY created_at DESC LIMIT 100"
  ).all();
  return c.json({ jobs: results });
});

adminRoute.get("/content/review-queue", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, title, slug, body, confidence_score, ai_generated, created_at FROM stories WHERE status = 'pending_review' ORDER BY created_at"
  ).all();
  return c.json({ queue: results });
});

adminRoute.post("/content/approve/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await c.env.DB.prepare(
    "UPDATE stories SET status = 'published', published_at = datetime('now') WHERE id = ?"
  )
    .bind(id)
    .run();
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "content_approved", admin.email, c.req.header("cf-connecting-ip") ?? null, { id });
  return c.json({ ok: true });
});

adminRoute.post("/content/reject/:id", async (c) => {
  const id = Number(c.req.param("id"));
  await c.env.DB.prepare("UPDATE stories SET status = 'rejected' WHERE id = ?").bind(id).run();
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "content_rejected", admin.email, c.req.header("cf-connecting-ip") ?? null, { id });
  return c.json({ ok: true });
});

// Bulk: "Jadwalkan N Kisah Baru" button (§23.3)
adminRoute.post("/content/schedule-batch", async (c) => {
  const { count } = await c.req.json<{ count: number }>();
  const n = Math.min(Math.max(count ?? 1, 1), 50);

  const { results: gaps } = await c.env.DB.prepare(
    `SELECT a.id FROM ayah a
     LEFT JOIN stories s ON s.related_ayah_id = a.id
     WHERE s.id IS NULL
     ORDER BY RANDOM() LIMIT ?`
  )
    .bind(n)
    .all<{ id: number }>();

  const stmts = gaps.map((g) =>
    c.env.DB.prepare(
      "INSERT INTO generation_jobs (job_type, target_table, target_id, status, priority) VALUES ('story', 'stories', ?, 'queued', 5)"
    ).bind(g.id)
  );
  if (stmts.length) await c.env.DB.batch(stmts);

  return c.json({ scheduled: stmts.length });
});

// ── Audit log (§12.2, §17) ─────────────────────────────────────────────────

adminRoute.get("/audit-log", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT 200"
  ).all();
  return c.json({ log: results });
});

// ── Donations monitor ────────────────────────────────────────────────────

adminRoute.get("/donations", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM donation_logs ORDER BY created_at DESC LIMIT 200"
  ).all();
  const stats = await c.env.DB.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN type='fiat' AND status='confirmed' THEN amount ELSE 0 END),0) AS total_fiat,
       COALESCE(SUM(CASE WHEN type='crypto' AND status='confirmed' THEN amount ELSE 0 END),0) AS total_crypto,
       SUM(CASE WHEN type='api_key_donation' THEN 1 ELSE 0 END) AS total_api_key_donations
     FROM donation_logs`
  ).first();
  return c.json({ donations: results, stats });
});

// ── Clients / registered donors ──────────────────────────────────────────

adminRoute.get("/clients", async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT cl.id, cl.email, cl.name, cl.created_at, cl.last_login_at,
       (SELECT COUNT(*) FROM donation_logs d WHERE d.client_id = cl.id) AS donation_count,
       (SELECT COUNT(*) FROM ai_key_pool k WHERE k.donated_by_client_id = cl.id) AS keys_donated
     FROM clients cl ORDER BY cl.created_at DESC LIMIT 200`
  ).all();
  return c.json({ clients: results });
});

// ── Smart scaling (portal admin requirement: keep DB always growing,
//    optimal key allocation) ─────────────────────────────────────────────

adminRoute.get("/scaling", async (c) => {
  const [coverage, poolLoad, queueDepth, recentMetrics] = await Promise.all([
    c.env.DB.prepare(
      `SELECT
         (SELECT COUNT(*) FROM ayah) AS total_ayah,
         (SELECT COUNT(DISTINCT related_ayah_id) FROM stories WHERE related_ayah_id IS NOT NULL) AS ayah_with_story,
         (SELECT COUNT(*) FROM tafsir) AS tafsir_count,
         (SELECT COUNT(*) FROM ayah) - (SELECT COUNT(DISTINCT ayah_id) FROM tafsir) AS tafsir_gap`
    ).first(),
    c.env.DB.prepare(
      "SELECT provider, scope, status, COUNT(*) AS n, AVG(latency_ms) AS avg_latency FROM ai_key_pool GROUP BY provider, scope, status"
    ).all(),
    c.env.DB.prepare(
      "SELECT status, COUNT(*) AS n FROM generation_jobs GROUP BY status"
    ).all(),
    c.env.DB.prepare("SELECT * FROM scaling_metrics ORDER BY recorded_at DESC LIMIT 50").all(),
  ]);

  return c.json({
    contentCoverage: coverage,
    keyPoolLoad: poolLoad.results,
    queueDepth: queueDepth.results,
    recentMetrics: recentMetrics.results,
  });
});

adminRoute.post("/scaling/settings", async (c) => {
  const settings = await c.req.json<Record<string, unknown>>();
  await c.env.CACHE_KV.put("scaling:settings", JSON.stringify(settings));
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "scaling_settings_updated", admin.email, c.req.header("cf-connecting-ip") ?? null, settings);
  return c.json({ ok: true });
});

adminRoute.get("/scaling/settings", async (c) => {
  const raw = await c.env.CACHE_KV.get("scaling:settings");
  return c.json({
    settings: raw
      ? JSON.parse(raw)
      : { autoThrottleEnabled: true, monthlyBudgetUsd: 0, preferFreeProviders: true, targetJobsPerTick: 5 },
  });
});
