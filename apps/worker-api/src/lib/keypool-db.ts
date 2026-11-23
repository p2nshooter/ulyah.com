import { decryptApiKey, encryptApiKey } from "@ulyah/shared/crypto";
import { pickBestKey, testApiKey } from "@ulyah/key-pool";
import { getProvider } from "@ulyah/shared/providers";
import type { AiKeyPoolEntry, KeyScope } from "@ulyah/shared/types";
import type { Env } from "../env.js";
import { createKey, getKeyRow, keyFingerprint, listKeySummaries, logValidation, setKeyState, nowIso } from "./keypool-store.js";

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
    ? test.dead
      ? "rejected" // confirmed invalid credential — permanently dead
      : "pending_verification" // transient failure at ingest — recheck later, don't kill it
    : test.optimal && test.safetyScore >= 0.7
      ? "active"
      : "pending_verification";

  // R2 only (lib/keypool-store.ts): the encrypted key is one document; the same key pasted twice is one key.
  const { id } = await createKey(env, {
    provider: input.provider,
    scope: input.scope,
    key_ref: ciphertext,
    key_iv: iv,
    status: status as never,
    priority: input.priority ?? 5,
    donor_label: input.donorLabel ?? null,
    donated_by_client_id: input.donatedByClientId ?? null,
    quota_limit: test.quotaLimit ?? null,
    quota_used: 0,
    latency_ms: test.latencyMs,
    last_health_check: nowIso(),
    key_fingerprint: await keyFingerprint(input.rawKey),
    last_test_passed: test.passed,
  });
  await logValidation(env, { key_id: id, test_type: "auth_check", passed: test.passed, latency_ms: test.latencyMs, safety_score: test.safetyScore, detail: test.detail });

  return { id, status, test };
}

/**
 * Fast, no-live-test ingest for bulk paste: encrypt + insert as `active`
 * immediately (deduped by fingerprint so re-paste is a no-op), WITHOUT the
 * per-key provider probe. Testing 10+ keys live in one request could exceed
 * the Worker's time budget and fail the whole batch, leaving nothing saved —
 * the recurring "keys don't show up" problem. The scheduled health-check /
 * the admin "retest" button verifies each key afterwards and demotes any bad
 * one. Returns 'inserted' | 'duplicate'.
 */
export async function ingestKeyNoTest(
  env: Env,
  input: { provider: string; scope: KeyScope; rawKey: string; donorLabel?: string }
): Promise<"inserted" | "duplicate"> {
  const fp = await keyFingerprint(input.rawKey);
  const { ciphertext, iv } = await encryptApiKey(input.rawKey, env.KEY_ENCRYPTION_SECRET);
  const { created } = await createKey(env, {
    provider: input.provider,
    scope: input.scope,
    key_ref: ciphertext,
    key_iv: iv,
    status: "active",
    priority: 5,
    donor_label: input.donorLabel ?? null,
    donated_by_client_id: null,
    quota_limit: null,
    quota_used: 0,
    latency_ms: 0,
    last_health_check: nowIso(),
    key_fingerprint: fp,
    last_test_passed: null,
  });
  return created ? "inserted" : "duplicate";
}

/** All active/slow keys for a scope (one R2 LIST, memoised), ranked by packages/key-pool. */
export async function selectKeyForScope(
  env: Env,
  scope: KeyScope,
  provider?: string
): Promise<{ entry: AiKeyPoolEntry; rawKey: string } | null> {
  const candidates = (await listKeySummaries(env)).filter(
    (k) => k.scope === scope && (k.status === "active" || k.status === "slow") && (!provider || k.provider === provider)
  );
  const best = pickBestKey(candidates as AiKeyPoolEntry[], scope, provider);
  if (!best) return null;
  const row = await getKeyRow(env, best.id);
  if (!row) return null;
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
    await setKeyState(env, keyId, { status: latencyMs > 4000 ? "slow" : "active", latency_ms: latencyMs, quota_delta: quotaDelta, passed: true });
  } else {
    await setKeyState(env, keyId, { status: "rate_limited" });
  }
}
