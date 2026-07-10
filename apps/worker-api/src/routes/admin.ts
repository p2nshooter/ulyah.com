import { Hono } from "hono";
import { decryptApiKey } from "@ulyah/shared/crypto";
import { testApiKey } from "@ulyah/key-pool";
import { getProvider, AI_PROVIDERS } from "@ulyah/shared/providers";
import type { Env } from "../env.js";
import { requireAdmin } from "../lib/auth-middleware.js";
import { logAdminAction } from "../lib/audit.js";
import { ingestAndTestKey } from "../lib/keypool-db.js";
import { MANAGED_SETTINGS, listSettingsStatus, setSetting, deleteSetting } from "../lib/settings.js";
import { MANAGED_MEDIA, listMediaStatus } from "../lib/media.js";

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

// ── Sadaqah proof review → certificate issuance ──────────────────────────

adminRoute.get("/proofs", async (c) => {
  const status = c.req.query("status") ?? "pending";
  const { results } = await c.env.DB.prepare(
    `SELECT p.*, cl.email AS client_email
     FROM donation_proofs p JOIN clients cl ON cl.id = p.client_id
     WHERE p.status = ? ORDER BY p.created_at ASC LIMIT 200`
  )
    .bind(status)
    .all();
  return c.json({ proofs: results });
});

// Stream the uploaded receipt from R2 so the admin can inspect it before
// deciding — never exposed publicly, admin session required.
adminRoute.get("/proofs/:id/file", async (c) => {
  const id = Number(c.req.param("id"));
  const row = await c.env.DB.prepare("SELECT proof_r2_key FROM donation_proofs WHERE id = ?")
    .bind(id)
    .first<{ proof_r2_key: string | null }>();
  if (!row) return c.json({ error: "not found" }, 404);
  // Auto-issued certs (PayPal/NOWPayments) have no uploaded receipt — the
  // payment processor's own confirmation was the proof, nothing to view.
  if (!row.proof_r2_key) return c.json({ error: "No file — this donation was auto-verified by the payment processor." }, 404);
  const obj = await c.env.MEDIA_R2.get(row.proof_r2_key);
  if (!obj) return c.json({ error: "file missing from storage" }, 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "private, no-store",
    },
  });
});

adminRoute.post("/proofs/:id/decide", async (c) => {
  const id = Number(c.req.param("id"));
  const { action, note } = await c.req.json<{ action: "approve" | "reject"; note?: string }>();
  if (action !== "approve" && action !== "reject") return c.json({ error: "action must be approve|reject" }, 400);

  const row = await c.env.DB.prepare("SELECT id, status FROM donation_proofs WHERE id = ?")
    .bind(id)
    .first<{ id: number; status: string }>();
  if (!row) return c.json({ error: "not found" }, 404);
  if (row.status !== "pending") return c.json({ error: `already ${row.status}` }, 409);

  const admin = c.get("admin" as never) as { id: number; email: string };
  const status = action === "approve" ? "approved" : "rejected";
  // Certificate number: stable, human-verifiable, no PII.
  const certNo = action === "approve" ? `ULYAH-${new Date().getFullYear()}-${String(id).padStart(6, "0")}` : null;

  await c.env.DB.prepare(
    `UPDATE donation_proofs
     SET status = ?, cert_no = ?, reviewed_by = ?, reviewed_at = datetime('now'), review_note = ?
     WHERE id = ?`
  )
    .bind(status, certNo, admin.id, note ?? null, id)
    .run();

  await logAdminAction(c.env, `proof_${status}`, admin.email, c.req.header("cf-connecting-ip") ?? null, {
    id,
    cert_no: certNo,
  });
  return c.json({ ok: true, status, cert_no: certNo });
});

// ── Visitor / member / certificate analytics (central visibility) ────────

adminRoute.get("/analytics", async (c) => {
  const [
    todayRow, weekRow, monthRow, yearRow, allTimeRow,
    daily, weekly, monthly, yearly, visitorCountries,
    memberTotal, memberCountries, certTotal, certCountries, certList,
  ] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM analytics_pageviews WHERE date(created_at) = date('now')").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM analytics_pageviews WHERE created_at >= datetime('now','-7 days')").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM analytics_pageviews WHERE created_at >= datetime('now','-30 days')").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM analytics_pageviews WHERE created_at >= datetime('now','-365 days')").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM analytics_pageviews").first<{ n: number }>(),
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m-%d', created_at) AS bucket, COUNT(*) AS n FROM analytics_pageviews
       WHERE created_at >= datetime('now','-30 days') GROUP BY bucket ORDER BY bucket`
    ).all(),
    c.env.DB.prepare(
      `SELECT strftime('%Y-W%W', created_at) AS bucket, COUNT(*) AS n FROM analytics_pageviews
       WHERE created_at >= datetime('now','-84 days') GROUP BY bucket ORDER BY bucket`
    ).all(),
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m', created_at) AS bucket, COUNT(*) AS n FROM analytics_pageviews
       WHERE created_at >= datetime('now','-365 days') GROUP BY bucket ORDER BY bucket`
    ).all(),
    c.env.DB.prepare(
      `SELECT strftime('%Y', created_at) AS bucket, COUNT(*) AS n FROM analytics_pageviews GROUP BY bucket ORDER BY bucket`
    ).all(),
    c.env.DB.prepare(
      `SELECT COALESCE(country,'??') AS country, COUNT(*) AS n FROM analytics_pageviews
       GROUP BY country ORDER BY n DESC LIMIT 25`
    ).all(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM clients").first<{ n: number }>(),
    c.env.DB.prepare(
      `SELECT COALESCE(country,'??') AS country, COUNT(*) AS n FROM clients GROUP BY country ORDER BY n DESC LIMIT 25`
    ).all(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM donation_proofs WHERE status = 'approved'").first<{ n: number }>(),
    c.env.DB.prepare(
      `SELECT COALESCE(cl.country,'??') AS country, COUNT(*) AS n
       FROM donation_proofs p JOIN clients cl ON cl.id = p.client_id
       WHERE p.status = 'approved' GROUP BY country ORDER BY n DESC LIMIT 25`
    ).all(),
    c.env.DB.prepare(
      `SELECT p.cert_no, p.sender_name, cl.country, p.amount, p.currency, p.reviewed_at
       FROM donation_proofs p JOIN clients cl ON cl.id = p.client_id
       WHERE p.status = 'approved' ORDER BY p.reviewed_at DESC LIMIT 100`
    ).all(),
  ]);

  return c.json({
    visitors: {
      today: todayRow?.n ?? 0,
      thisWeek: weekRow?.n ?? 0,
      thisMonth: monthRow?.n ?? 0,
      thisYear: yearRow?.n ?? 0,
      allTime: allTimeRow?.n ?? 0,
      daily: daily.results,
      weekly: weekly.results,
      monthly: monthly.results,
      yearly: yearly.results,
      countries: visitorCountries.results,
    },
    members: {
      total: memberTotal?.n ?? 0,
      countries: memberCountries.results,
    },
    certificates: {
      total: certTotal?.n ?? 0,
      countries: certCountries.results,
      recent: certList.results,
    },
  });
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
  const defaults = {
    autoThrottleEnabled: true,
    monthlyBudgetUsd: 0,
    preferFreeProviders: true,
    targetJobsPerTick: 5,
    engineEnabled: true,
    compileLangs: ["id", "en"],
  };
  return c.json({ settings: raw ? { ...defaults, ...JSON.parse(raw) } : defaults });
});

// Content-engine status: is the auto-producer on, and what has it produced?
adminRoute.get("/engine/status", async (c) => {
  const raw = await c.env.CACHE_KV.get("scaling:settings");
  const settings = raw ? JSON.parse(raw) : {};
  const [compiled, aiStories, latest] = await Promise.all([
    c.env.DB.prepare(
      "SELECT COUNT(*) AS n FROM stories WHERE ai_generated = 0 AND source_format = 'html' AND status = 'published'"
    ).first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM stories WHERE ai_generated = 1").first<{ n: number }>(),
    c.env.DB.prepare(
      "SELECT title, lang, created_at FROM stories WHERE source_format = 'html' ORDER BY created_at DESC LIMIT 5"
    ).all(),
  ]);
  return c.json({
    engineEnabled: settings.engineEnabled !== false,
    compiledArticles: compiled?.n ?? 0,
    aiArticles: aiStories?.n ?? 0,
    recent: latest.results,
  });
});

// One-click master switch for the auto-production engine (start / stop).
adminRoute.post("/engine/toggle", async (c) => {
  const { enabled } = await c.req.json<{ enabled: boolean }>();
  const raw = await c.env.CACHE_KV.get("scaling:settings");
  const settings = raw ? JSON.parse(raw) : {};
  settings.engineEnabled = Boolean(enabled);
  await c.env.CACHE_KV.put("scaling:settings", JSON.stringify(settings));
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, enabled ? "engine_started" : "engine_stopped", admin.email, c.req.header("cf-connecting-ip") ?? null, {});
  return c.json({ ok: true, engineEnabled: settings.engineEnabled });
});

// ── Runtime settings (PayPal / NOWPayments credentials, etc.) ────────────
// CRUD, AES-256-GCM encrypted at rest — see lib/settings.ts. A row here
// always overrides the GitHub Secret env var of the same name; deleting the
// row reverts to that env var, it never hard-fails.

// GET /admin/settings — status of every managed key (secrets masked)
adminRoute.get("/settings", async (c) => {
  return c.json({ settings: await listSettingsStatus(c.env) });
});

// PUT /admin/settings/:key — create/update one setting
adminRoute.put("/settings/:key", async (c) => {
  const key = c.req.param("key");
  if (!MANAGED_SETTINGS.some((s) => s.key === key)) {
    return c.json({ error: `Unknown setting key: ${key}` }, 400);
  }
  const { value } = await c.req.json<{ value?: string }>();
  if (!value || !value.trim()) return c.json({ error: "value required" }, 400);

  const admin = c.get("admin" as never) as { email: string };
  await setSetting(c.env, key, value.trim(), admin.email);
  await logAdminAction(c.env, "setting_updated", admin.email, c.req.header("cf-connecting-ip") ?? null, { key });
  return c.json({ ok: true });
});

// DELETE /admin/settings/:key — revert to the env/GitHub-Secret fallback
adminRoute.delete("/settings/:key", async (c) => {
  const key = c.req.param("key");
  if (!MANAGED_SETTINGS.some((s) => s.key === key)) {
    return c.json({ error: `Unknown setting key: ${key}` }, 400);
  }
  await deleteSetting(c.env, key);
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "setting_reverted", admin.email, c.req.header("cf-connecting-ip") ?? null, { key });
  return c.json({ ok: true });
});

// ── Site media (founder photos, etc.) — CRUD, stored in R2 ───────────────
// Public afterwards via GET /content/media/:key (see routes/content.ts).

const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

adminRoute.get("/media", async (c) => {
  return c.json({ media: await listMediaStatus(c.env) });
});

adminRoute.put("/media/:key", async (c) => {
  const key = c.req.param("key");
  if (!MANAGED_MEDIA.some((m) => m.key === key)) return c.json({ error: `Unknown media key: ${key}` }, 400);

  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return c.json({ error: "file required" }, 400);
  const ext = MEDIA_TYPES[file.type];
  if (!ext) return c.json({ error: "file must be JPG, PNG, or WEBP" }, 400);
  if (file.size > 5 * 1024 * 1024) return c.json({ error: "file too large (max 5MB)" }, 400);

  const r2Key = `media/site/${key}.${ext}`;
  await c.env.MEDIA_R2.put(r2Key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });

  const admin = c.get("admin" as never) as { email: string };
  await c.env.DB.prepare(
    `INSERT INTO site_media (key, r2_key, content_type, updated_at, updated_by) VALUES (?, ?, ?, datetime('now'), ?)
     ON CONFLICT(key) DO UPDATE SET r2_key = excluded.r2_key, content_type = excluded.content_type, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
  )
    .bind(key, r2Key, file.type, admin.email)
    .run();

  await logAdminAction(c.env, "media_updated", admin.email, c.req.header("cf-connecting-ip") ?? null, { key });
  return c.json({ ok: true });
});

adminRoute.delete("/media/:key", async (c) => {
  const key = c.req.param("key");
  await c.env.DB.prepare("DELETE FROM site_media WHERE key = ?").bind(key).run();
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "media_removed", admin.email, c.req.header("cf-connecting-ip") ?? null, { key });
  return c.json({ ok: true });
});
