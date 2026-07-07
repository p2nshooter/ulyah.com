import { decryptApiKey, encryptApiKey } from "@ulyah/shared/crypto";
import { pickBestKey, testApiKey } from "@ulyah/key-pool";
import { getProvider } from "@ulyah/shared/providers";
import type { AiKeyPoolEntry, KeyScope } from "@ulyah/shared/types";
import type { Env } from "../env.js";

export interface IngestKeyInput {
  provider: string;
  scope: KeyScope;
  rawKey: string;
  priority?: number;
  donorLabel?: string;
  donatedByClientId?: number | null;
}

/**
 * Shared "donate an API key / GPU credential" pipeline used by both the
 * admin Key Pool form and the public /donate/api-key endpoint: encrypt ->
 * automatically test for validity + safety + latency -> store the result ->
 * only mark it `active` (usable by the coordinator) when the automated test
 * passed AND looked safe/optimal. Anything borderline lands in
 * `pending_verification` for a human admin to review — never silently
 * dropped, always visible on the central admin portal.
 */
export async function ingestAndTestKey(env: Env, input: IngestKeyInput) {
  if (!getProvider(input.provider)) {
    throw new Error(`Unknown provider "${input.provider}"`);
  }

  const test = await testApiKey(input.provider, input.rawKey);
  const { ciphertext, iv } = await encryptApiKey(input.rawKey, env.KEY_ENCRYPTION_SECRET);

  const status = !test.passed
    ? "rejected"
    : test.optimal && test.safetyScore >= 0.7
      ? "active"
      : "pending_verification";

  const row = await env.DB.prepare(
    `INSERT INTO ai_key_pool (provider, scope, key_ref, key_iv, status, priority, donor_label, donated_by_client_id, quota_limit, quota_used, latency_ms, last_health_check)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, datetime('now')) RETURNING id`
  )
    .bind(
      input.provider,
      input.scope,
      ciphertext,
      iv,
      status,
      input.priority ?? 5,
      input.donorLabel ?? null,
      input.donatedByClientId ?? null,
      test.quotaLimit ?? null,
      test.latencyMs
    )
    .first<{ id: number }>();

  await env.DB.prepare(
    "INSERT INTO key_validation_log (key_id, test_type, passed, latency_ms, safety_score, detail) VALUES (?, 'auth_check', ?, ?, ?, ?)"
  )
    .bind(row!.id, test.passed ? 1 : 0, test.latencyMs, test.safetyScore, test.detail)
    .run();

  return { id: row!.id, status, test };
}

/** Loads all active/slow keys for a scope and asks packages/key-pool to rank them. */
export async function selectKeyForScope(
  env: Env,
  scope: KeyScope,
  provider?: string
): Promise<{ entry: AiKeyPoolEntry; rawKey: string } | null> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM ai_key_pool WHERE scope = ? AND status IN ('active','slow')" +
      (provider ? " AND provider = ?" : "")
  )
    .bind(...(provider ? [scope, provider] : [scope]))
    .all<AiKeyPoolEntry & { key_ref: string; key_iv: string }>();

  const candidates = results as unknown as AiKeyPoolEntry[];
  const best = pickBestKey(candidates, scope, provider);
  if (!best) return null;

  const row = results.find((r) => (r as unknown as AiKeyPoolEntry).id === best.id) as unknown as {
    key_ref: string;
    key_iv: string;
  };
  const rawKey = await decryptApiKey({ ciphertext: row.key_ref, iv: row.key_iv }, env.KEY_ENCRYPTION_SECRET);
  return { entry: best, rawKey };
}

export async function recordKeyUsage(
  env: Env,
  keyId: number,
  latencyMs: number,
  success: boolean,
  quotaDelta = 1
): Promise<void> {
  if (success) {
    await env.DB.prepare(
      "UPDATE ai_key_pool SET latency_ms = ?, quota_used = quota_used + ?, status = CASE WHEN ? > 4000 THEN 'slow' ELSE 'active' END, last_health_check = datetime('now') WHERE id = ?"
    )
      .bind(latencyMs, quotaDelta, latencyMs, keyId)
      .run();
  } else {
    await env.DB.prepare(
      "UPDATE ai_key_pool SET status = 'rate_limited', last_health_check = datetime('now') WHERE id = ?"
    )
      .bind(keyId)
      .run();
  }
}
