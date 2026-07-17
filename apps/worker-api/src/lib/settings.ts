import { encryptApiKey, decryptApiKey } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";

interface SettingDef {
  key: string;
  label: string;
  secret: boolean; // masked in the admin UI / API responses
  envFallback: (env: Env) => string | undefined;
}

// The set of runtime credentials the admin portal can manage. Adding one
// here immediately makes it CRUD-able — the DB row (if present) always wins
// over the env fallback, so an admin can rotate a key without touching
// GitHub Secrets or redeploying.
export const MANAGED_SETTINGS: SettingDef[] = [
  { key: "PAYPAL_MODE", label: "PayPal Mode (sandbox/live)", secret: false, envFallback: (e) => e.PAYPAL_MODE },
  { key: "PAYPAL_CLIENT_ID_LIVE", label: "PayPal Client ID (Live)", secret: false, envFallback: (e) => e.PAYPAL_CLIENT_ID_LIVE },
  { key: "PAYPAL_CLIENT_SECRET_LIVE", label: "PayPal Client Secret (Live)", secret: true, envFallback: (e) => e.PAYPAL_CLIENT_SECRET_LIVE },
  { key: "PAYPAL_CLIENT_ID_SANDBOX", label: "PayPal Client ID (Sandbox)", secret: false, envFallback: (e) => e.PAYPAL_CLIENT_ID_SANDBOX },
  { key: "PAYPAL_CLIENT_SECRET_SANDBOX", label: "PayPal Client Secret (Sandbox)", secret: true, envFallback: (e) => e.PAYPAL_CLIENT_SECRET_SANDBOX },
  { key: "PAYPAL_WEBHOOK_ID", label: "PayPal Webhook ID", secret: false, envFallback: (e) => e.PAYPAL_WEBHOOK_ID },
  { key: "NOWPAYMENTS_API_KEY", label: "NOWPayments API Key", secret: true, envFallback: (e) => e.NOWPAYMENTS_API_KEY },
  { key: "NOWPAYMENTS_IPN_SECRET", label: "NOWPayments IPN Secret", secret: true, envFallback: (e) => e.NOWPAYMENTS_IPN_SECRET },
];

const managedByKey = new Map(MANAGED_SETTINGS.map((d) => [d.key, d]));

function maskValue(v: string): string {
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 4)}${"•".repeat(Math.min(v.length - 8, 12))}${v.slice(-4)}`;
}

/** Resolve one setting's real value: DB (decrypted) if present, else the env/secret fallback. */
export async function getSetting(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare("SELECT ciphertext, iv FROM admin_settings WHERE key = ?")
    .bind(key)
    .first<{ ciphertext: string; iv: string }>();
  if (row) {
    try {
      return await decryptApiKey({ ciphertext: row.ciphertext, iv: row.iv }, env.KEY_ENCRYPTION_SECRET);
    } catch (e) {
      console.error(`settings: failed to decrypt ${key}, falling back to env:`, e);
    }
  }
  const def = managedByKey.get(key);
  return def?.envFallback(env) ?? null;
}

export async function setSetting(env: Env, key: string, value: string, updatedBy: string): Promise<void> {
  if (!managedByKey.has(key)) throw new Error(`Unknown setting key: ${key}`);
  const { ciphertext, iv } = await encryptApiKey(value, env.KEY_ENCRYPTION_SECRET);
  await env.DB.prepare(
    `INSERT INTO admin_settings (key, ciphertext, iv, updated_at, updated_by) VALUES (?, ?, ?, datetime('now'), ?)
     ON CONFLICT(key) DO UPDATE SET ciphertext = excluded.ciphertext, iv = excluded.iv, updated_at = excluded.updated_at, updated_by = excluded.updated_by`
  )
    .bind(key, ciphertext, iv, updatedBy)
    .run();
}

/** Deletes the DB override — the setting reverts to its env/GitHub-Secret fallback. */
export async function deleteSetting(env: Env, key: string): Promise<void> {
  await env.DB.prepare("DELETE FROM admin_settings WHERE key = ?").bind(key).run();
}

export interface SettingStatus {
  key: string;
  label: string;
  secret: boolean;
  source: "database" | "env" | "unset";
  preview: string | null;
}

/** Status of every managed setting for the admin UI — secrets are masked, never returned in full. */
export async function listSettingsStatus(env: Env): Promise<SettingStatus[]> {
  const { results } = await env.DB.prepare("SELECT key FROM admin_settings").all<{ key: string }>();
  const dbKeys = new Set(results.map((r) => r.key));

  return Promise.all(
    MANAGED_SETTINGS.map(async (def): Promise<SettingStatus> => {
      const inDb = dbKeys.has(def.key);
      const value = inDb ? await getSetting(env, def.key) : (def.envFallback(env) ?? null);
      const source: SettingStatus["source"] = inDb ? "database" : value ? "env" : "unset";
      const preview = value ? (def.secret ? maskValue(value) : value) : null;
      return { key: def.key, label: def.label, secret: def.secret, source, preview };
    })
  );
}
