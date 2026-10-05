export interface Env {
  // Bindings
  DB: D1Database;
  CACHE_KV: KVNamespace;
  /**
   * OPTIONAL, and typed that way on purpose. Cloudflare refuses to upload a
   * Worker bound to R2 while R2 is not enabled on the account — and it was
   * switched off after 2026-08-18, which is why no deploy succeeded for five
   * weeks: every fix sat on main behind "R2 binding error … Please enable R2"
   * (code 10136). The deploy now leaves the binding out when R2 is unavailable,
   * so everything here must work without it; the compiler holds every use to
   * that.
   */
  MEDIA_R2?: R2Bucket;
  AI: Ai;
  KEY_POOL: DurableObjectNamespace;

  // Public vars (wrangler.toml [vars])
  PUBLIC_SITE_URL: string;
  API_BASE_URL: string;

  // Secrets — `wrangler secret put <NAME>`, populated by CI from GitHub Secrets.
  // See docs/SETUP.md for the full expected list.
  KEY_ENCRYPTION_SECRET: string; // base64, 32 bytes — encrypts donated AI/GPU keys
  ADMIN_SESSION_SECRET: string; // random string, signs admin session tokens

  ADMIN_BOOTSTRAP_EMAIL: string; // alghoniy2026@gmail.com
  ADMIN_BOOTSTRAP_PASSWORD: string; // used once to seed admin_users, then ignored

  PAYPAL_MODE: string; // "sandbox" | "live"
  PAYPAL_CLIENT_ID_SANDBOX?: string;
  PAYPAL_CLIENT_SECRET_SANDBOX?: string;
  PAYPAL_CLIENT_ID_LIVE?: string;
  PAYPAL_CLIENT_SECRET_LIVE?: string;
  PAYPAL_WEBHOOK_ID?: string;

  NOWPAYMENTS_API_KEY: string;
  NOWPAYMENTS_IPN_SECRET?: string;

  // AliExpress affiliate (open platform). All three are OPTIONAL and all three
  // are unset today: the app is still under review, and the key and secret are
  // only issued once it passes. Nothing reads them yet — they exist so the
  // credentials have somewhere to land the moment they arrive, entered through
  // the admin portal rather than committed anywhere.
  //
  // The tracking id is NOT the app key. The key identifies the application, the
  // tracking id identifies the traffic; a link built without it still works and
  // still sends the visitor to AliExpress, but the sale is attributed to nobody
  // and earns nothing — the same trap as a US Amazon tag on amazon.de.
  ALIEXPRESS_APP_KEY?: string;
  ALIEXPRESS_APP_SECRET?: string;
  ALIEXPRESS_TRACKING_ID?: string;

  // Outreach email (Grant & Fundraising Worker). RESEND_API_KEY is the
  // serverless-friendly sender that works with a DNS-verified domain; the
  // "From" defaults to salam@ulyah.com. If unset, drafting still works and
  // sending reports clearly that email isn't configured yet.
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;

  CORS_ALLOW_ORIGIN?: string;

  // Autonomous content bot (see lib/content-bot.ts). A GitHub token with
  // contents:write on the article repos lets the Orchestra generate an article
  // and commit it (= auto-publish via each repo's Cloudflare deploy). OPTIONAL:
  // when unset the bot is a complete no-op, so the worker is always safe.
  GH_CONTENT_TOKEN?: string;

  // AdOps (docs/ADMANAGER-BLUEPRINT.md). All OPTIONAL and normally entered in
  // the admin portal (encrypted in admin_settings); these env names are only
  // the fallback. Without them the AdOps runner reports "belum dihubungkan"
  // and does nothing.
  ADOPS_MODE?: string; // off | dry-run | live
  ADMANAGER_NETWORK_CODE?: string;
  ADMANAGER_SERVICE_ACCOUNT_JSON?: string;
  ADSENSE_OAUTH_CLIENT_ID?: string;
  ADSENSE_OAUTH_CLIENT_SECRET?: string;
  ADSENSE_REFRESH_TOKEN?: string;
}
