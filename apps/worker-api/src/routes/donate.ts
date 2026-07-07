import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import type { Env } from "../env.js";
import { createPaypalOrder, capturePaypalOrder, verifyPaypalWebhook } from "../lib/paypal.js";
import { createNowPaymentsInvoice, verifyNowPaymentsIpn } from "../lib/nowpayments.js";
import { ingestAndTestKey } from "../lib/keypool-db.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import { getSession, sessionCookieName } from "../lib/session.js";
import { AI_PROVIDERS } from "@ulyah/shared/providers";

export const donateRoute = new Hono<{ Bindings: Env }>();

// ── PayPal ───────────────────────────────────────────────────────────────

donateRoute.post("/paypal/create", async (c) => {
  const { amount, currency } = await c.req.json<{ amount: string; currency?: string }>();
  if (!amount || Number(amount) <= 0) return c.json({ error: "Invalid amount" }, 400);

  const order = await createPaypalOrder(c.env, amount, currency ?? "USD");
  await c.env.DB.prepare(
    "INSERT INTO donation_logs (provider, amount, currency, type, status, provider_ref) VALUES ('paypal', ?, ?, 'fiat', 'pending', ?)"
  )
    .bind(Number(amount), currency ?? "USD", order.id)
    .run();

  return c.json({ orderId: order.id, approveUrl: order.approveUrl });
});

donateRoute.post("/paypal/capture/:orderId", async (c) => {
  const orderId = c.req.param("orderId");
  const result = await capturePaypalOrder(c.env, orderId);
  const status = result.status === "COMPLETED" ? "confirmed" : "failed";

  await c.env.DB.prepare("UPDATE donation_logs SET status = ?, amount = COALESCE(?, amount) WHERE provider_ref = ?")
    .bind(status, result.amount ? Number(result.amount) : null, orderId)
    .run();

  return c.json({ status });
});

donateRoute.post("/paypal/webhook", async (c) => {
  const rawBody = await c.req.text();
  const verified = await verifyPaypalWebhook(c.env, c.req.raw.headers, rawBody);
  if (!verified) return c.json({ error: "Signature verification failed" }, 400);

  const event = JSON.parse(rawBody) as { event_type: string; resource: { id: string; status?: string } };
  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    await c.env.DB.prepare("UPDATE donation_logs SET status = 'confirmed' WHERE provider_ref = ?")
      .bind(event.resource.id)
      .run();
  } else if (event.event_type === "PAYMENT.CAPTURE.DENIED") {
    await c.env.DB.prepare("UPDATE donation_logs SET status = 'failed' WHERE provider_ref = ?")
      .bind(event.resource.id)
      .run();
  }
  return c.json({ received: true });
});

// ── NOWPayments (crypto) ─────────────────────────────────────────────────

donateRoute.post("/nowpayments/create", async (c) => {
  const { amount, currency } = await c.req.json<{ amount: number; currency?: string }>();
  if (!amount || amount <= 0) return c.json({ error: "Invalid amount" }, 400);

  const invoice = await createNowPaymentsInvoice(c.env, amount, currency ?? "usd");
  await c.env.DB.prepare(
    "INSERT INTO donation_logs (provider, amount, currency, type, status, provider_ref) VALUES ('nowpayments', ?, ?, 'crypto', 'pending', ?)"
  )
    .bind(amount, currency ?? "usd", invoice.id)
    .run();

  return c.json({ invoiceId: invoice.id, invoiceUrl: invoice.invoiceUrl });
});

donateRoute.post("/nowpayments/webhook", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-nowpayments-sig");
  const verified = await verifyNowPaymentsIpn(c.env, rawBody, signature ?? null);
  if (!verified) return c.json({ error: "Signature verification failed" }, 400);

  const payload = JSON.parse(rawBody) as { invoice_id?: string; payment_id?: string; payment_status: string };
  const ref = payload.invoice_id ?? payload.payment_id ?? "";
  const status =
    payload.payment_status === "finished" || payload.payment_status === "confirmed"
      ? "confirmed"
      : payload.payment_status === "failed" || payload.payment_status === "expired"
        ? "failed"
        : "pending";

  await c.env.DB.prepare("UPDATE donation_logs SET status = ? WHERE provider_ref = ?").bind(status, ref).run();
  return c.json({ received: true });
});

// ── Donasi API Key AI/GPU (§15.3) ─────────────────────────────────────────
// Encrypted in transit (TLS) and at rest (AES-256-GCM), automatically
// tested for validity/safety/latency before it can ever be scheduled for
// use, and always visible on the central admin portal regardless of outcome.

donateRoute.get("/api-key/providers", (c) => c.json({ providers: AI_PROVIDERS }));

donateRoute.post("/api-key", async (c) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const rl = await checkRateLimit(c.env, `donate-key:${ip}`, 10, 60 * 60);
  if (!rl.allowed) return c.json({ error: "Rate limit exceeded" }, 429);

  const { provider, scope, rawKey, donorLabel, donorEmail, message } = await c.req.json<{
    provider: string;
    scope: "text" | "tts" | "gpu" | "image";
    rawKey: string;
    donorLabel?: string;
    donorEmail?: string;
    message?: string;
  }>();

  if (!provider || !scope || !rawKey) {
    return c.json({ error: "provider, scope, and rawKey are required" }, 400);
  }

  const clientToken = getCookie(c, sessionCookieName("client"));
  const clientSession = await getSession(c.env, clientToken);
  const clientId = clientSession?.subject === "client" ? clientSession.id : null;

  let result;
  try {
    result = await ingestAndTestKey(c.env, {
      provider,
      scope,
      rawKey,
      donorLabel: donorLabel ?? donorEmail ?? "anonymous donor",
      donatedByClientId: clientId,
    });
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : "Validation failed" }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO donation_logs (provider, type, status, donor_name, donor_email, client_id, message) VALUES ('api_key', 'api_key_donation', 'confirmed', ?, ?, ?, ?)"
  )
    .bind(donorLabel ?? null, donorEmail ?? null, clientId, message ?? null)
    .run();

  return c.json({
    accepted: true,
    keyId: result.id,
    status: result.status,
    testSummary: {
      passed: result.test.passed,
      optimal: result.test.optimal,
      safetyScore: result.test.safetyScore,
      detail: result.test.detail,
    },
    message:
      result.status === "active"
        ? "Terima kasih! Key Anda lolos uji otomatis dan langsung aktif di pool."
        : "Terima kasih! Key Anda tersimpan dan menunggu peninjauan admin sebelum aktif.",
  });
});

// ── Public transparency (§15.4) ───────────────────────────────────────────

donateRoute.get("/impact", async (c) => {
  const stats = await c.env.DB.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN type='fiat' AND status='confirmed' THEN amount ELSE 0 END),0) AS total_fiat_usd,
       COALESCE(SUM(CASE WHEN type='crypto' AND status='confirmed' THEN amount ELSE 0 END),0) AS total_crypto_usd,
       (SELECT COUNT(*) FROM ai_key_pool WHERE status = 'active') AS active_api_keys,
       (SELECT COUNT(DISTINCT donor_email) FROM donation_logs WHERE donor_email IS NOT NULL) AS unique_donors
     FROM donation_logs`
  ).first();
  return c.json({ impact: stats });
});
