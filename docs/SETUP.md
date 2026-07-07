# SETUP — GitHub Secrets & Cloudflare Requirements

ULYAH.COM deploys itself: every push to `main` runs
`.github/workflows/deploy.yml`, which provisions the Cloudflare D1 database,
KV namespace, and R2 bucket if they don't exist yet, migrates + seeds the
database, pushes Worker secrets, and deploys both the API worker
(`api.ulyah.com`) and the web worker (`ulyah.com`). Nothing below needs to be
run manually except adding the GitHub Secrets themselves.

## 1. Cloudflare account prerequisites

- **`ulyah.com` must already be an active Cloudflare zone** (nameservers
  pointed at Cloudflare). The deploy workflow attaches Worker routes to this
  zone (`api.ulyah.com/*`, `ulyah.com/*`, `www.ulyah.com/*`) — if the zone
  isn't active yet, `wrangler deploy` fails with a clear "Could not find
  zone" error and the site falls back to no custom domain until this is
  fixed.
- **Workers AI must be enabled** on the account (used for the always-on
  TTS fallback for English/Chinese narration — no extra credential needed
  beyond the account being enabled for it).

## 2. GitHub Secrets — exact names expected

Add these under **Settings → Secrets and variables → Actions → Repository
secrets**. If any of these already exist under a different name, either
rename them to match or tell me the actual names and I'll update the
workflow to match instead.

### Cloudflare (required)

| Secret | What it is |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API token with **Account → Workers Scripts: Edit, D1: Edit, Workers KV Storage: Edit, Workers R2 Storage: Edit** permissions, scoped to this account. Create at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens). |
| `CLOUDFLARE_ACCOUNT_ID` | Found on the right sidebar of any zone overview page in the Cloudflare dashboard. |

That's it for Cloudflare — the D1 database (`ulyah-db`), KV namespace
(`ulyah-cache`), and R2 bucket (`ulyah-media`) are created automatically by
the workflow on first run using the token above. You do **not** need to
pre-create them or find their IDs.

### App secrets (required)

| Secret | What it is |
|---|---|
| `KEY_ENCRYPTION_SECRET` | Base64-encoded 32 random bytes, encrypts every donated AI/GPU API key at rest (AES-256-GCM). Generate with `openssl rand -base64 32`. |
| `ADMIN_SESSION_SECRET` | Any long random string (e.g. `openssl rand -hex 32`), used to key admin session tokens. |
| `ADMIN_BOOTSTRAP_EMAIL` | `alghoniy2026@gmail.com` — used **once** to create the first row in `admin_users` on first login. After that, the database is the source of truth; change the email/password anytime from Portal Admin → Account (never hardcoded). |
| `ADMIN_BOOTSTRAP_PASSWORD` | `ulyahM1980` — same one-time bootstrap behavior as above. |

### PayPal (required for donations)

| Secret | What it is |
|---|---|
| `PAYPAL_MODE` | `sandbox` or `live`. |
| `PAYPAL_CLIENT_ID_SANDBOX` / `PAYPAL_CLIENT_SECRET_SANDBOX` | From the sandbox app at [developer.paypal.com/dashboard/applications](https://developer.paypal.com/dashboard/applications). |
| `PAYPAL_CLIENT_ID_LIVE` / `PAYPAL_CLIENT_SECRET_LIVE` | From the live app, same dashboard. |
| `PAYPAL_WEBHOOK_ID` | Create a webhook in the PayPal dashboard pointing to `https://api.ulyah.com/donate/paypal/webhook`, subscribed to `PAYMENT.CAPTURE.COMPLETED` and `PAYMENT.CAPTURE.DENIED`. Copy the generated Webhook ID here. |

### NOWPayments (required for crypto donations)

| Secret | What it is |
|---|---|
| `NOWPAYMENTS_API_KEY` | From your NOWPayments dashboard → API keys. Note: the donation-widget key already embedded in the donation page (`588fda75-68c4-4ed4-88fa-0e23fe06daa3`, from your original snippet) is a **public** widget key — this secret is a separate **private** API key used server-side to create custom-amount invoices via `/donate/nowpayments/create`. If you only ever use the embedded widget, this can be left blank and that one endpoint simply won't be used. |
| `NOWPAYMENTS_IPN_SECRET` | NOWPayments dashboard → Settings → IPN secret key. Used to verify webhook signatures at `https://api.ulyah.com/donate/nowpayments/webhook` — set that URL as your IPN callback in the dashboard. |

### Optional

| Secret | What it is |
|---|---|
| `CORS_ALLOW_ORIGIN` | Defaults to `https://ulyah.com` if unset. |

## 3. Donating AI/GPU API keys (including the NVIDIA keys you shared in chat)

The 4 `nvapi-...` keys you pasted directly in the conversation were
**deliberately not committed to the repository** — committing a raw secret
to git history is permanent and hard to undo, even after "removing" it
later. Instead:

1. Once the site is live, click the logo 5× in the header → log in with the
   admin credentials above → **Key Pool** tab.
2. Add each key with provider `NVIDIA NIM (build.nvidia.com)`, scope `text`
   (or `gpu` for the Maxine one). Each key is automatically tested for
   validity/safety/latency before it's marked active — exactly the
   "otomatis di test dulu apakah aman dan optimal" flow you asked for — and
   stored AES-256-GCM encrypted in D1, never in code.
3. The same flow is available publicly (without admin login) at
   `/donasi` → "Donasi API Key AI & GPU", for future contributors.

## 4. What happens automatically vs. what still needs a manual step

**Fully automatic on every push to `main`:**
D1/KV/R2 provisioning, schema migrations, Qur'an text + 10-language
translation seed, Kisah Nabi Yusuf series + PDFs, Worker secrets, both
Worker deploys, health-check smoke test.

**Needs a one-time manual trigger** (real audio files are large and this
sandbox's build environment has no general internet access to fetch them
from everyayah.com — see `scripts/import-murottal-audio.ts`):
run the **"Import Murottal Audio"** workflow from the Actions tab, pick a
qori and surah range. Until this runs, ayah pages show text +
translation but murottal playback for that qori/surah returns 404.

**Needs a one-time manual trigger:**
TTS narration for the Kisah Nabi Yusuf series and any other kisah requires
an active `tts`-scope AI key (donate one via the Key Pool, e.g. ElevenLabs
or Azure) — once active, use the admin Content tab to generate audio for a
story. Cloudflare Workers AI covers English/Chinese narration automatically
with no extra key.
