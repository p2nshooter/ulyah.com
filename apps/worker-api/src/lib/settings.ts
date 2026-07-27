import { encryptApiKey, decryptApiKey } from "@ulyah/shared/crypto";
import type { Env } from "../env.js";

/** Which panel a credential belongs under in the admin portal. */
export type SettingGroup = "payment" | "affiliate";

/**
 * The AliExpress fields are BUILT but not shown yet.
 *
 * Owner: "siapin dulu posisinya biar tepat, tp di hide dulu semua, siapin aja
 * dulu". The app is still under review, so there is nothing to paste in and a
 * visible-but-empty panel is just three boxes nobody can fill. Everything is
 * in place behind this one switch: the keys, the encryption, the group, the
 * heading and its position in the panel.
 *
 * Flip this to `true` the day the key and secret are issued, and the panel
 * appears. Nothing else needs changing, and no deploy of the web app is
 * needed to then enter the values.
 */
export const ALIEXPRESS_READY = false;

interface SettingDef {
  key: string;
  label: string;
  /**
   * Masked in the admin UI and typed into a password field.
   *
   * NOT the same thing as encrypted — EVERY value here is encrypted at rest
   * with AES-256-GCM before it reaches the database, whatever this says.
   * This only decides whether the value is legible on screen to whoever is
   * already logged into the admin.
   */
  secret: boolean;
  group: SettingGroup;
  /** Kept out of the admin listing — still storable, just not offered yet. */
  hidden?: boolean;
  envFallback: (env: Env) => string | undefined;
}

// The set of runtime credentials the admin portal can manage. Adding one
// here immediately makes it CRUD-able — the DB row (if present) always wins
// over the env fallback, so an admin can rotate a key without touching
// GitHub Secrets or redeploying.
export const MANAGED_SETTINGS: SettingDef[] = [
  { key: "PAYPAL_MODE", label: "PayPal Mode (sandbox/live)", secret: false, group: "payment", envFallback: (e) => e.PAYPAL_MODE },
  { key: "PAYPAL_CLIENT_ID_LIVE", label: "PayPal Client ID (Live)", secret: false, group: "payment", envFallback: (e) => e.PAYPAL_CLIENT_ID_LIVE },
  { key: "PAYPAL_CLIENT_SECRET_LIVE", label: "PayPal Client Secret (Live)", secret: true, group: "payment", envFallback: (e) => e.PAYPAL_CLIENT_SECRET_LIVE },
  { key: "PAYPAL_CLIENT_ID_SANDBOX", label: "PayPal Client ID (Sandbox)", secret: false, group: "payment", envFallback: (e) => e.PAYPAL_CLIENT_ID_SANDBOX },
  { key: "PAYPAL_CLIENT_SECRET_SANDBOX", label: "PayPal Client Secret (Sandbox)", secret: true, group: "payment", envFallback: (e) => e.PAYPAL_CLIENT_SECRET_SANDBOX },
  { key: "PAYPAL_WEBHOOK_ID", label: "PayPal Webhook ID", secret: false, group: "payment", envFallback: (e) => e.PAYPAL_WEBHOOK_ID },
  { key: "NOWPAYMENTS_API_KEY", label: "NOWPayments API Key", secret: true, group: "payment", envFallback: (e) => e.NOWPAYMENTS_API_KEY },
  { key: "NOWPAYMENTS_IPN_SECRET", label: "NOWPayments IPN Secret", secret: true, group: "payment", envFallback: (e) => e.NOWPAYMENTS_IPN_SECRET },

  // AliExpress affiliate. Listed here BEFORE anything reads them, on purpose:
  // the app is still under review, and this is what "prepare it so I can fill
  // it in from the portal later" means in code. A setting in this list is
  // CRUD-able immediately — encrypted into admin_settings, masked in the UI,
  // no deploy — so when the key and secret are finally issued they can be
  // pasted in and are live at once.
  //
  // All three are masked, the tracking id included ("di encrypt, termasuk id
  // nya"). The key and the tracking id do travel in plain sight inside an
  // affiliate URL, so masking them protects nothing from the outside — but it
  // costs nothing either, and it keeps them off the screen in a panel that
  // may be open on a shared display. Encryption at rest was never in
  // question: setSetting encrypts every value regardless of this flag.
  { key: "ALIEXPRESS_APP_KEY", label: "AliExpress App Key", secret: true, group: "affiliate", hidden: !ALIEXPRESS_READY, envFallback: (e) => e.ALIEXPRESS_APP_KEY },
  { key: "ALIEXPRESS_APP_SECRET", label: "AliExpress App Secret", secret: true, group: "affiliate", hidden: !ALIEXPRESS_READY, envFallback: (e) => e.ALIEXPRESS_APP_SECRET },
  { key: "ALIEXPRESS_TRACKING_ID", label: "AliExpress Tracking ID", secret: true, group: "affiliate", hidden: !ALIEXPRESS_READY, envFallback: (e) => e.ALIEXPRESS_TRACKING_ID },
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
  group: SettingGroup;
  source: "database" | "env" | "unset";
  preview: string | null;
}

/**
 * Status of every VISIBLE managed setting, for the admin UI.
 *
 * Hidden entries are dropped here rather than in the browser, so a credential
 * that is not being offered yet is not sitting in a JSON response waiting to
 * be read — an admin panel is exactly the page worth being strict about.
 * They stay writable through setSetting; only the offer is withheld.
 */
export async function listSettingsStatus(env: Env): Promise<SettingStatus[]> {
  const { results } = await env.DB.prepare("SELECT key FROM admin_settings").all<{ key: string }>();
  const dbKeys = new Set(results.map((r) => r.key));

  return Promise.all(
    MANAGED_SETTINGS.filter((d) => !d.hidden).map(async (def): Promise<SettingStatus> => {
      const inDb = dbKeys.has(def.key);
      const value = inDb ? await getSetting(env, def.key) : (def.envFallback(env) ?? null);
      const source: SettingStatus["source"] = inDb ? "database" : value ? "env" : "unset";
      const preview = value ? (def.secret ? maskValue(value) : value) : null;
      return { key: def.key, label: def.label, secret: def.secret, group: def.group, source, preview };
    })
  );
}
