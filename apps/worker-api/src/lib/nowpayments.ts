import type { Env } from "../env.js";

function toArrayBuffer(u: Uint8Array): ArrayBuffer {
  return u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;
}

export async function createNowPaymentsInvoice(
  env: Env,
  amount: number,
  currency = "usd"
): Promise<{ id: string; invoiceUrl: string }> {
  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: { "x-api-key": env.NOWPAYMENTS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: amount,
      price_currency: currency,
      order_description: "Donasi ULYAH.COM",
      success_url: `${env.PUBLIC_SITE_URL}/donasi/terima-kasih`,
      cancel_url: `${env.PUBLIC_SITE_URL}/donasi`,
      ipn_callback_url: `${env.API_BASE_URL}/donate/nowpayments/webhook`,
    }),
  });
  if (!res.ok) throw new Error(`NOWPayments invoice failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { id: string; invoice_url: string };
  return { id: json.id, invoiceUrl: json.invoice_url };
}

/** NOWPayments IPN signature: HMAC-SHA512 over the JSON body with keys sorted alphabetically. */
export async function verifyNowPaymentsIpn(env: Env, rawBody: string, signature: string | null): Promise<boolean> {
  if (!env.NOWPAYMENTS_IPN_SECRET || !signature) return false;

  const parsed = JSON.parse(rawBody);
  const sorted = JSON.stringify(sortKeys(parsed));

  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(new TextEncoder().encode(env.NOWPAYMENTS_IPN_SECRET)),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, toArrayBuffer(new TextEncoder().encode(sorted)));
  const hex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature;
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  return obj;
}
