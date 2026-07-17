import { sha256Hex } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";

/** Append-only audit trail for every Portal Admin action — arsitektur doc §12.2/§17. */
export async function logAdminAction(
  env: Env,
  action: string,
  actor: string,
  ip: string | null,
  detail?: Record<string, unknown>
): Promise<void> {
  const ipHash = ip ? await sha256Hex(ip) : null;
  await env.DB.prepare(
    "INSERT INTO admin_audit_log (action, actor, ip_hash, detail) VALUES (?, ?, ?, ?)"
  )
    .bind(action, actor, ipHash, detail ? JSON.stringify(detail) : null)
    .run();
}
