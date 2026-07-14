import { Hono, type Context } from "hono";
import { decryptApiKey } from "@ulyah/shared/crypto";
import { testApiKey } from "@ulyah/key-pool";
import { getProvider, AI_PROVIDERS } from "@ulyah/shared/providers";
import type { Env } from "../env.js";
import { requireAdmin } from "../lib/auth-middleware.js";
import { logAdminAction } from "../lib/audit.js";
import { ingestAndTestKey, ingestKeyNoTest } from "../lib/keypool-db.js";
import { MANAGED_SETTINGS, listSettingsStatus, setSetting, deleteSetting } from "../lib/settings.js";
import { MANAGED_MEDIA, listMediaStatus } from "../lib/media.js";
import { safeKvPut } from "../lib/kv-safe.js";

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

// Bulk key import — lets an admin paste a whole batch of donated/found keys
// (e.g. a stash of NVIDIA NIM keys) in one authenticated submission instead
// of the single "+ Add" form N times. Each line is
// "provider,scope,label,rawKey" (label may contain spaces but not commas).
// Reuses the exact same ingestAndTestKey pipeline per line — same
// encryption, same automated safety/latency test, same active/pending/
// rejected classification — just looped, with per-line results returned so
// a typo in one line doesn't silently swallow the rest.
adminRoute.post("/keys/bulk", async (c) => {
  const { text } = await c.req.json<{ text: string }>();
  const admin = c.get("admin" as never) as { email: string };
  const results: { label: string; ok: boolean; detail: string }[] = [];

  // Two accepted inputs, tried per source:
  //  1) strict CSV lines: provider,scope,label,apiKey
  //  2) ANY messy blob (WhatsApp/notes export) — we just scan for provider key
  //     tokens (nvapi-… → nvidia, sk-or-… → openrouter) and use the nearest
  //     UPPER_SNAKE label. This is why pasting the raw key file now works.
  const seen = new Set<string>();

  // Pass 1: strict CSV lines (kept for backward compatibility / other providers).
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length < 4) continue;
    const [provider, scope, label, ...rest] = parts;
    const rawKey = rest.join(",");
    if (!provider || !scope || !label || !rawKey) continue;
    if (!getProvider(provider) || !["text", "tts", "gpu", "image"].includes(scope)) continue;
    if (seen.has(rawKey)) continue;
    seen.add(rawKey);
    try {
      const status = await ingestKeyNoTest(c.env, {
        provider,
        scope: scope as "text" | "tts" | "gpu" | "image",
        rawKey,
        donorLabel: label,
      });
      results.push({ label, ok: true, detail: status === "duplicate" ? "sudah ada" : "ditambahkan (active)" });
    } catch (err) {
      results.push({ label, ok: false, detail: err instanceof Error ? err.message : "Gagal" });
    }
  }

  // Pass 2: token scan of the whole blob (handles the raw pasted key file).
  const TOKEN_RE = /(nvapi-[A-Za-z0-9_-]{20,}|sk-or-v1-[A-Za-z0-9]{20,})/g;
  const lines = text.split(/\r?\n/);
  let lastLabel: string | null = null;
  const isClean = (s: string) => /^[A-Z][A-Z0-9_]{3,}$/.test(s);
  const tokenLabel = new Map<string, string | null>();
  const order: string[] = [];
  for (const line of lines) {
    const toks = line.match(TOKEN_RE);
    if (toks) {
      for (const t of toks) {
        if (!tokenLabel.has(t)) order.push(t);
        const prev = tokenLabel.get(t);
        if (!prev || (lastLabel && isClean(lastLabel) && !isClean(prev))) tokenLabel.set(t, lastLabel);
      }
    } else {
      const cleaned = line.trim().replace(/^Value:\s*/i, "").replace(/[:：].*$/, "").trim();
      if (cleaned && cleaned.length <= 48 && !/[{}();=]/.test(cleaned)) lastLabel = cleaned;
    }
  }
  for (const tok of order) {
    if (seen.has(tok)) continue;
    seen.add(tok);
    const provider = tok.startsWith("nvapi-") ? "nvidia" : "openrouter";
    if (!getProvider(provider)) continue;
    const label = tokenLabel.get(tok) || `${provider} key`;
    try {
      const status = await ingestKeyNoTest(c.env, { provider, scope: "text", rawKey: tok, donorLabel: label });
      results.push({ label, ok: true, detail: status === "duplicate" ? "sudah ada" : "ditambahkan (active)" });
    } catch (err) {
      results.push({ label, ok: false, detail: err instanceof Error ? err.message : "Gagal" });
    }
  }

  await logAdminAction(c.env, "key_bulk_added", admin.email, c.req.header("cf-connecting-ip") ?? null, {
    total: results.length,
    ok: results.filter((r) => r.ok).length,
  });

  return c.json({ results });
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

// Test EVERY key in the pool on demand, so the admin can confirm all donated
// keys actually work — not just some ("pastiin semua api key bekerja semua").
// Tested in small parallel batches (fast read-only probes) and each key's
// status is updated live. Optional ?provider= filter, capped per call.
adminRoute.post("/keys/test-all", async (c) => {
  const provider = c.req.query("provider");
  const { results } = await c.env.DB.prepare(
    `SELECT id, provider, key_ref, key_iv FROM ai_key_pool
     WHERE status != 'revoked'${provider ? " AND provider = ?" : ""}
     ORDER BY last_health_check ASC LIMIT 120`
  )
    .bind(...(provider ? [provider] : []))
    .all<{ id: number; provider: string; key_ref: string; key_iv: string }>();

  const out: { id: number; provider: string; passed: boolean; latencyMs: number; detail: string }[] = [];
  const BATCH = 10;
  for (let i = 0; i < results.length; i += BATCH) {
    const batch = results.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      batch.map(async (row) => {
        const rawKey = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, c.env.KEY_ENCRYPTION_SECRET);
        const test = await testApiKey(row.provider, rawKey);
        const status = test.passed ? (test.optimal ? "active" : "slow") : "rejected";
        await c.env.DB.prepare(
          "UPDATE ai_key_pool SET status = ?, latency_ms = ?, last_health_check = datetime('now') WHERE id = ?"
        )
          .bind(status, test.latencyMs, row.id)
          .run();
        return { id: row.id, provider: row.provider, passed: test.passed, latencyMs: test.latencyMs, detail: test.detail };
      })
    );
    for (const s of settled) {
      if (s.status === "fulfilled") out.push(s.value);
      else out.push({ id: -1, provider: "?", passed: false, latencyMs: 0, detail: String(s.reason).slice(0, 200) });
    }
  }

  const passed = out.filter((r) => r.passed).length;
  const byProvider: Record<string, { ok: number; fail: number }> = {};
  for (const r of out) {
    const b = (byProvider[r.provider] ??= { ok: 0, fail: 0 });
    if (r.passed) b.ok++;
    else b.fail++;
  }
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "keys_test_all", admin.email, c.req.header("cf-connecting-ip") ?? null, {
    tested: out.length,
    passed,
  });
  return c.json({ tested: out.length, passed, failed: out.length - passed, byProvider, results: out });
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

// ── Kitab library breakdown + app install counts (central visibility) ────

adminRoute.get("/library-stats", async (c) => {
  // Normalise the many raw hadith grade strings into buckets in SQL — mirrors
  // apps/web/src/lib/hadith-grade.ts so the admin counts match the badges.
  const gradeCase = `CASE
      WHEN lower(coalesce(grade,'')) LIKE '%maudhu%' OR lower(coalesce(grade,'')) LIKE '%maudu%' OR lower(coalesce(grade,'')) LIKE '%mawdu%' OR lower(coalesce(grade,'')) LIKE '%palsu%' OR lower(coalesce(grade,'')) LIKE '%munkar%' THEN 'maudhu'
      WHEN lower(coalesce(grade,'')) LIKE '%mutawatir%' THEN 'mutawatir'
      WHEN lower(coalesce(grade,'')) LIKE '%dhaif%' OR lower(coalesce(grade,'')) LIKE '%dhoif%' OR lower(coalesce(grade,'')) LIKE '%daif%' OR lower(coalesce(grade,'')) LIKE '%dalif%' OR lower(coalesce(grade,'')) LIKE '%lemah%' THEN 'dhaif'
      WHEN lower(coalesce(grade,'')) LIKE '%shahih%' OR lower(coalesce(grade,'')) LIKE '%sahih%' OR lower(coalesce(grade,'')) LIKE '%sohih%' THEN 'shahih'
      WHEN lower(coalesce(grade,'')) LIKE '%hasan%' THEN 'hasan'
      ELSE 'lain' END`;

  const [
    kitabTotal,
    kitabByCategory,
    installTotal,
    installByApp,
    installRecent,
    haditsTotal,
    haditsByGrade,
    haditsCollections,
    pesantren,
    amalanByGroup,
    nasakh,
    stories,
    ebooks,
    tafsirCount,
  ] = await Promise.all([
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM kitab_book").first<{ n: number }>(),
    c.env.DB.prepare(
      `SELECT cat.slug, cat.name_id, cat.name_ar, COUNT(b.id) AS n
       FROM kitab_category cat LEFT JOIN kitab_book b ON b.category_slug = cat.slug
       GROUP BY cat.slug ORDER BY n DESC`
    ).all(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM app_installs").first<{ n: number }>(),
    c.env.DB.prepare("SELECT app, COUNT(*) AS n FROM app_installs GROUP BY app").all(),
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m-%d', created_at) AS bucket, app, COUNT(*) AS n FROM app_installs
       WHERE created_at >= datetime('now','-30 days') GROUP BY bucket, app ORDER BY bucket`
    ).all(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM hadits").first<{ n: number }>(),
    c.env.DB.prepare(`SELECT ${gradeCase} AS bucket, COUNT(*) AS n FROM hadits GROUP BY bucket`).all(),
    c.env.DB.prepare(
      "SELECT slug, name_id, author, (SELECT COUNT(*) FROM hadits h WHERE h.collection = hc.slug) AS n FROM hadits_collection hc ORDER BY sort_order"
    ).all(),
    c.env.DB.prepare(
      `SELECT (SELECT COUNT(*) FROM pesantren_kitab) AS kitab,
              (SELECT COUNT(*) FROM pesantren_bab) AS bab,
              (SELECT COUNT(*) FROM pesantren_matn) AS matan`
    ).first(),
    c.env.DB.prepare("SELECT grp, COUNT(*) AS n FROM amalan_category c JOIN amalan_item i ON i.category_slug = c.slug GROUP BY grp").all(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM nasakh_mansukh").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM stories WHERE status = 'published'").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM ebooks").first<{ n: number }>(),
    c.env.DB.prepare("SELECT COUNT(*) AS n FROM tafsir").first<{ n: number }>(),
  ]);

  return c.json({
    kitab: { total: kitabTotal?.n ?? 0, byCategory: kitabByCategory.results },
    hadits: {
      total: haditsTotal?.n ?? 0,
      byGrade: haditsByGrade.results,
      collections: haditsCollections.results,
    },
    pesantren: pesantren ?? { kitab: 0, bab: 0, matan: 0 },
    amalan: amalanByGroup.results,
    nasakh: nasakh?.n ?? 0,
    stories: stories?.n ?? 0,
    ebooks: ebooks?.n ?? 0,
    tafsir: tafsirCount?.n ?? 0,
    installs: {
      total: installTotal?.n ?? 0,
      byApp: installByApp.results,
      daily: installRecent.results,
    },
  });
});

// ── Monitor: one-glance health of every menu/feature on the site ──────────
// Each feature reports ok/warn/error from a cheap COUNT (or config check), so
// the owner can watch all menus at once and spot anything empty or broken.
adminRoute.get("/health", async (c) => {
  const count = async (sql: string): Promise<number> => {
    try {
      const r = await c.env.DB.prepare(sql).first<{ n: number }>();
      return r?.n ?? 0;
    } catch {
      return -1; // -1 = query failed (table missing / error)
    }
  };

  const [
    surah,
    ayah,
    translation,
    hadits,
    haditsColl,
    kitab,
    pesantren,
    amalan,
    nasakh,
    stories,
    ebooks,
    tafsir,
    activeKeys,
    totalKeys,
    installs,
  ] = await Promise.all([
    count("SELECT COUNT(*) n FROM surah"),
    count("SELECT COUNT(*) n FROM ayah"),
    count("SELECT COUNT(*) n FROM translation"),
    count("SELECT COUNT(*) n FROM hadits"),
    count("SELECT COUNT(*) n FROM hadits_collection"),
    count("SELECT COUNT(*) n FROM kitab_book"),
    count("SELECT COUNT(*) n FROM pesantren_kitab"),
    count("SELECT COUNT(*) n FROM amalan_item"),
    count("SELECT COUNT(*) n FROM nasakh_mansukh"),
    count("SELECT COUNT(*) n FROM stories WHERE status='published'"),
    count("SELECT COUNT(*) n FROM ebooks"),
    count("SELECT COUNT(*) n FROM tafsir"),
    count("SELECT COUNT(*) n FROM ai_key_pool WHERE status IN ('active','slow')"),
    count("SELECT COUNT(*) n FROM ai_key_pool"),
    count("SELECT COUNT(*) n FROM app_installs"),
  ]);

  let adsenseSlot = "";
  try {
    const raw = await c.env.CACHE_KV.get("adsense:config");
    if (raw) adsenseSlot = JSON.parse(raw).slotId ?? "";
  } catch {
    /* ignore */
  }

  // status: 'ok' | 'warn' | 'error'. error = query failed; warn = empty/needs
  // action; ok = has content.
  const s = (n: number, warnIfZero = true): "ok" | "warn" | "error" =>
    n < 0 ? "error" : n === 0 && warnIfZero ? "warn" : "ok";

  const features = [
    { key: "quran", label: "Al-Qur'an", route: "/quran", status: s(ayah), count: ayah, note: `${surah} surah · ${translation} terjemah` },
    { key: "hadits", label: "Hadits", route: "/hadits", status: s(hadits), count: hadits, note: `${haditsColl} koleksi` },
    { key: "tafsir", label: "Tafsir", route: "/quran", status: tafsir < 0 ? "error" : "ok", count: tafsir, note: "on-demand + cache (spa5k/Kemenag)" },
    { key: "kitab", label: "Kitab (katalog)", route: "/kitab", status: s(kitab), count: kitab, note: "katalog Syamela" },
    { key: "pesantren", label: "Kitab Pesantren", route: "/kitab-pesantren", status: s(pesantren), count: pesantren, note: "kitab bisa dibaca" },
    { key: "amalan", label: "Amalan Harian", route: "/amalan", status: s(amalan), count: amalan, note: "doa/dzikir/thibb" },
    { key: "nasakh", label: "Nasakh & Mansukh", route: "/nasakh", status: s(nasakh), count: nasakh, note: "" },
    { key: "kisah", label: "Kisah", route: "/kisah", status: s(stories), count: stories, note: "kisah terbit" },
    { key: "ebooks", label: "E-book / PDF", route: "/audiobook", status: s(ebooks), count: ebooks, note: "" },
    { key: "radio", label: "Radio Qori", route: "/jadwal-sholat", status: s(surah), count: surah, note: "streaming dari CDN qori" },
    { key: "jadwal", label: "Jadwal Sholat", route: "/jadwal-sholat", status: "ok", count: 0, note: "hitung dari lokasi (adhan)" },
    { key: "keys", label: "Smart Engine (Key Pool)", route: "", status: activeKeys < 0 ? "error" : activeKeys === 0 ? "warn" : "ok", count: activeKeys, note: `${activeKeys}/${totalKeys} key aktif` },
    { key: "adsense", label: "AdSense", route: "", status: adsenseSlot ? "ok" : "warn", count: 0, note: adsenseSlot ? `ID iklan terpasang (…${adsenseSlot.slice(-4)})` : "belum ada ID iklan (isi di tab AdSense)" },
    { key: "installs", label: "Install App", route: "", status: "ok", count: installs, note: "total pemasangan PWA" },
  ];

  return c.json({ features, checkedAt: new Date().toISOString() });
});

// ── AdSense: one-time ad-unit id + first-party impression/click analytics ──

// GET /admin/adsense-config — current ad-unit id + estimated eCPM.
adminRoute.get("/adsense-config", async (c) => {
  const raw = await c.env.CACHE_KV.get("adsense:config");
  const cfg = raw ? JSON.parse(raw) : {};
  return c.json({
    slotId: cfg.slotId ?? "",
    enabled: cfg.enabled !== false,
    ecpmUsd: typeof cfg.ecpmUsd === "number" ? cfg.ecpmUsd : 1.0,
    previewMode: cfg.previewMode === true,
    clientId: "ca-pub-6371903555702163",
  });
});

// POST /admin/adsense-config — set the single ad-unit id used site-wide + the
// estimated eCPM (USD per 1000 impressions) used for the earnings estimate.
adminRoute.post("/adsense-config", async (c) => {
  const body = await c.req.json<{ slotId?: string; enabled?: boolean; ecpmUsd?: number; previewMode?: boolean }>();
  const slotId = String(body.slotId ?? "").trim().replace(/[^0-9]/g, "").slice(0, 20);
  const ecpmUsd = Number.isFinite(body.ecpmUsd) ? Math.max(0, Number(body.ecpmUsd)) : 1.0;
  const cfg = { slotId, enabled: body.enabled !== false, ecpmUsd, previewMode: body.previewMode === true };
  await safeKvPut(c.env, "adsense:config", JSON.stringify(cfg));
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "adsense_config_updated", admin.email, c.req.header("cf-connecting-ip") ?? null, {
    slotId: slotId ? `…${slotId.slice(-4)}` : "(cleared)",
    ecpmUsd,
  });
  return c.json({ ok: true, ...cfg });
});

// GET /admin/adsense-stats — first-party impression/click counts + an earnings
// ESTIMATE (impressions ÷ 1000 × eCPM). Real revenue lives in the Google
// AdSense dashboard; this is an in-house approximation, by page + country.
adminRoute.get("/adsense-stats", async (c) => {
  const raw = await c.env.CACHE_KV.get("adsense:config");
  const ecpmUsd = raw && typeof JSON.parse(raw).ecpmUsd === "number" ? JSON.parse(raw).ecpmUsd : 1.0;

  const [totals, byCountry, byPage, last30] = await Promise.all([
    c.env.DB.prepare(
      `SELECT
         SUM(CASE WHEN event_type='impression' THEN 1 ELSE 0 END) AS impressions,
         SUM(CASE WHEN event_type='click' THEN 1 ELSE 0 END) AS clicks
       FROM ad_events`
    ).first<{ impressions: number; clicks: number }>(),
    c.env.DB.prepare(
      `SELECT coalesce(country,'??') AS country,
              SUM(CASE WHEN event_type='impression' THEN 1 ELSE 0 END) AS impressions,
              SUM(CASE WHEN event_type='click' THEN 1 ELSE 0 END) AS clicks
       FROM ad_events GROUP BY country ORDER BY impressions DESC LIMIT 30`
    ).all(),
    c.env.DB.prepare(
      `SELECT page, SUM(CASE WHEN event_type='impression' THEN 1 ELSE 0 END) AS impressions,
              SUM(CASE WHEN event_type='click' THEN 1 ELSE 0 END) AS clicks
       FROM ad_events GROUP BY page ORDER BY impressions DESC LIMIT 20`
    ).all(),
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m-%d', created_at) AS day,
              SUM(CASE WHEN event_type='impression' THEN 1 ELSE 0 END) AS impressions,
              SUM(CASE WHEN event_type='click' THEN 1 ELSE 0 END) AS clicks
       FROM ad_events WHERE created_at >= datetime('now','-30 days') GROUP BY day ORDER BY day`
    ).all(),
  ]);

  const impressions = totals?.impressions ?? 0;
  const clicks = totals?.clicks ?? 0;
  return c.json({
    impressions,
    clicks,
    ctr: impressions > 0 ? clicks / impressions : 0,
    ecpmUsd,
    estimatedEarningsUsd: (impressions / 1000) * ecpmUsd,
    byCountry: byCountry.results,
    byPage: byPage.results,
    daily: last30.results,
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
  await safeKvPut(c.env, "scaling:settings", JSON.stringify(settings));
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
    // Cloudflare Workers AI is billable — OFF by default. Donated NVIDIA/
    // OpenRouter keys + the free browser voice are used first; this is only a
    // last-resort paid fallback the owner opts into.
    cfWorkerAiEnabled: false,
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
  await safeKvPut(c.env, "scaling:settings", JSON.stringify(settings));
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

// Registered for BOTH PUT and POST: the admin Media uploader posts multipart
// via api.upload() (which is a POST), so a PUT-only route silently 404'd and
// the photo never saved ("foto yg diupload g muncul"). Same handler for both.
const uploadMedia = async (c: Context<{ Bindings: Env }>) => {
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
};
adminRoute.put("/media/:key", uploadMedia);
adminRoute.post("/media/:key", uploadMedia);

adminRoute.delete("/media/:key", async (c) => {
  const key = c.req.param("key");
  await c.env.DB.prepare("DELETE FROM site_media WHERE key = ?").bind(key).run();
  const admin = c.get("admin" as never) as { email: string };
  await logAdminAction(c.env, "media_removed", admin.email, c.req.header("cf-connecting-ip") ?? null, { key });
  return c.json({ ok: true });
});
