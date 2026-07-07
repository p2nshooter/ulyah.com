import type { Env } from "../env.js";

function paypalBase(env: Env): string {
  return env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function credentials(env: Env): { clientId: string; secret: string } {
  const live = env.PAYPAL_MODE === "live";
  const clientId = live ? env.PAYPAL_CLIENT_ID_LIVE : env.PAYPAL_CLIENT_ID_SANDBOX;
  const secret = live ? env.PAYPAL_CLIENT_SECRET_LIVE : env.PAYPAL_CLIENT_SECRET_SANDBOX;
  if (!clientId || !secret) {
    throw new Error(`PayPal ${env.PAYPAL_MODE} credentials not configured — see docs/SETUP.md`);
  }
  return { clientId, secret };
}

async function getAccessToken(env: Env): Promise<string> {
  const { clientId, secret } = credentials(env);
  const res = await fetch(`${paypalBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export async function createPaypalOrder(
  env: Env,
  amount: string,
  currency = "USD"
): Promise<{ id: string; approveUrl: string }> {
  const token = await getAccessToken(env);
  const res = await fetch(`${paypalBase(env)}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: currency, value: amount }, description: "Donasi ULYAH.COM" }],
      application_context: {
        brand_name: "ULYAH.COM",
        shipping_preference: "NO_SHIPPING",
        return_url: `${env.PUBLIC_SITE_URL}/donasi/terima-kasih`,
        cancel_url: `${env.PUBLIC_SITE_URL}/donasi`,
      },
    }),
  });
  if (!res.ok) throw new Error(`PayPal create order failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id: string; links: { rel: string; href: string }[] };
  const approveUrl = json.links.find((l) => l.rel === "approve")?.href ?? "";
  return { id: json.id, approveUrl };
}

export async function capturePaypalOrder(env: Env, orderId: string): Promise<{ status: string; amount?: string; currency?: string }> {
  const token = await getAccessToken(env);
  const res = await fetch(`${paypalBase(env)}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const json = (await res.json()) as any;
  if (!res.ok) throw new Error(`PayPal capture failed: ${res.status} ${JSON.stringify(json)}`);
  const capture = json.purchase_units?.[0]?.payments?.captures?.[0];
  return { status: json.status, amount: capture?.amount?.value, currency: capture?.amount?.currency_code };
}

/** Verifies an incoming webhook against PayPal's verify-webhook-signature API. */
export async function verifyPaypalWebhook(
  env: Env,
  headers: Headers,
  body: string
): Promise<boolean> {
  if (!env.PAYPAL_WEBHOOK_ID) return false;
  const token = await getAccessToken(env);
  const res = await fetch(`${paypalBase(env)}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_time: headers.get("paypal-transmission-time"),
      cert_url: headers.get("paypal-cert-url"),
      auth_algo: headers.get("paypal-auth-algo"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      webhook_id: env.PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { verification_status: string };
  return json.verification_status === "SUCCESS";
}
