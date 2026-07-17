import type { Env } from "../env.js";

/**
 * Auto-issues a sadaqah certificate for a confirmed PayPal/NOWPayments
 * donation from a logged-in donor — no admin review needed, since the
 * payment processor's own confirmation IS the proof (unlike bank transfer,
 * where a human still has to check a receipt). Idempotent: a unique index on
 * donation_log_id means a capture callback and a webhook racing for the same
 * payment can never issue two certificates for it.
 */
export async function issueAutoCertificate(
  env: Env,
  params: {
    donationLogId: number;
    clientId: number;
    method: "paypal" | "nowpayments";
    senderName: string;
    amount: number | null;
    currency: string | null;
  }
): Promise<void> {
  const existing = await env.DB.prepare("SELECT id FROM donation_proofs WHERE donation_log_id = ?")
    .bind(params.donationLogId)
    .first<{ id: number }>();
  if (existing) return;

  let id: number;
  try {
    const res = await env.DB.prepare(
      `INSERT INTO donation_proofs (client_id, method, sender_name, amount, currency, status, donation_log_id, reviewed_at)
       VALUES (?, ?, ?, ?, ?, 'approved', ?, datetime('now'))`
    )
      .bind(params.clientId, params.method, params.senderName, params.amount, params.currency, params.donationLogId)
      .run();
    id = Number(res.meta?.last_row_id);
  } catch (e) {
    // Unique index on donation_log_id — a concurrent request already issued it.
    console.error("issueAutoCertificate: insert failed (likely a race, safe to ignore):", e);
    return;
  }
  if (!id) return;

  // Same format as the admin-approved manual flow (routes/admin.ts proofs/:id/decide).
  const certNo = `ULYAH-${new Date().getFullYear()}-${String(id).padStart(6, "0")}`;
  await env.DB.prepare("UPDATE donation_proofs SET cert_no = ? WHERE id = ?").bind(certNo, id).run();
}

/** Resolves the client's session (if any) into { id, displayName } for attributing a donation. */
export async function resolveDonorClient(
  env: Env,
  clientId: number
): Promise<{ id: number; displayName: string } | null> {
  const row = await env.DB.prepare("SELECT id, name, email FROM clients WHERE id = ?")
    .bind(clientId)
    .first<{ id: number; name: string | null; email: string }>();
  if (!row) return null;
  return { id: row.id, displayName: row.name?.trim() || row.email };
}
