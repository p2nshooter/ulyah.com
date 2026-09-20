# ULYAH.COM

**"Dengarkan Islam. Pahami Maknanya. Hidupkan Dalam Hati."**

A serverless, zero-login, donation-funded Islamic audio & knowledge
platform: the full Qur'an (114 surah, 6,236 ayah) with translation, tafsir,
asbabun nuzul, and hadith in one interactive page per ayah; audiobook-style
kisah/hikmah narration; a zero-hand AI content pipeline backed by a
donated-API-key pool with automatic safety/latency testing; and a hidden
admin portal (5 clicks on the logo) for managing all of it.

Full architecture: `docs/CONTENT-POLICY.md`, `docs/SETUP.md`, and the
original planning document supplied for this build.

## Monorepo layout

```
apps/
  web/          Next.js 15 — public site + hidden admin portal (same app, gated by session)
  worker-api/   Hono on Cloudflare Workers — REST API + KeyPoolCoordinator Durable Object
packages/
  shared/       Types, crypto (AES-GCM key encryption, PBKDF2, TOTP), i18n registry, design tokens
  ai-engine/    Zero-hand content pipeline: prompts, provider adapters, orchestrator
  key-pool/     AI/GPU key scoring + automated safety/optimality testing
  db-schema/    D1 migrations + seed data (Qur'an text, translations, Kisah Nabi Yusuf series)
scripts/        Seed generators, story-PDF renderer, murottal audio importer
.github/workflows/  ci.yml (typecheck+build on every push), deploy.yml (full auto-deploy on main),
                    import-audio.yml (manual: populate real qori recitation audio)
```

## Stack

Next.js 15 + React 19 (deployed via `@opennextjs/cloudflare`) · Hono ·
Cloudflare D1/KV/R2/Durable Objects/Workers AI · PayPal + NOWPayments ·
pnpm workspaces + TypeScript throughout.

## Local development

```bash
pnpm install
pnpm db:generate-seed              # regenerate Qur'an seed SQL from quran-json
npx tsx scripts/generate-kisah-yusuf-seed.ts
npx tsx scripts/generate-kisah-yusuf-pdfs.ts

pnpm dev:api    # apps/worker-api, wrangler dev
pnpm dev:web    # apps/web, next dev
```

## Deployment

Fully automatic — see `docs/SETUP.md` for the GitHub Secrets required, then
push to `main`. No manual Cloudflare console steps beyond having the
`ulyah.com` zone active and adding those secrets.

## Multi-tenant & one language per site

ONE codebase serves five sites, each with its own visual identity
(`src/styles/themes/`) and exactly one native language — the language of its
own domain extension:

| Domain | Worker | Language | Identity |
|---|---|---|---|
| ulyah.com | ulyah-web | Indonesian only | Modern Islamic Premium |
| xad.es | xad-web | English only | — |
| 1fr.fr | onefaith-web | French only | French Editorial Luxury |
| tilawa.de | tilawa-web | German only | German Modern Tech |
| dawa.es | dawa-web | Spanish only | Spanish Warm Mediterranean |

**One language per site, in both directions.** ulyah.com is written in
Indonesian and serves Indonesian: no geo-IP or `Accept-Language` switching into
another language, no `/<code>` prefixes, no in-place translation of the hub into
anything else. The language control offers the four sibling domains and nothing
else — choosing one leaves for that site rather than translating this one.

Material that arrives in another language is still rendered into the language of
the site showing it (an English tafsir edition reaches an Indonesian reader in
Indonesian). A single gate decides: `MT_TARGET_LANGS` in
`packages/shared/src/i18n.ts` — `id`, `en`, `de`, `es`, `fr`, one per site —
enforced at the four entry points of `apps/worker-api/src/lib/mt.ts`, on the
read path as well as the write path. The twenty-four languages the hub used to
render itself in are refused, which is also what stops D1 filling up with cache
rows nothing reads. Scripture is stricter still: the Qur'an and hadith matn are
reproduced, never machine-translated.

Qur'an translations exist natively in 11 languages — quran-json (CC-BY-4.0)
for id/en/ru/fr/zh/es/bn/sv/tr/ur plus German (Abu Rida via
fawazahmed0/quran-api, `scripts/generate-quran-de-seed.ts`).

## Ads

**Google AdSense, and nothing else.** Adsterra was removed from the ecosystem
(owner: "hapus iklan adsterra di ekosistem ulyah.com, ganti dengan adsense
aja") — its component, its per-tenant inventory, its sandboxed ad frame, the
master switch and the per-site toggles are all gone.

Every site reads `GET /content/ad-config` from api.ulyah.com and the
**ulyah.com admin portal is the only place that edits it** (AdSense tab). A
site serves ads when it is `enabled` + `approved` (the owner's "Google accepted
THIS domain" tick) **and** an ad-unit id has been pasted. Missing any of the
three, the site shows nothing — and the admin now says so per site rather than
leaving every switch green and the page empty.

dawa.es is switched on by a one-time migration after its approval
(`activateDawaAdsense` in the Worker's scheduled tick; the KV flag keeps it
one-time, so turning it off in the admin sticks).

**Auto ads** is the other route, per site: tick "Auto" in the admin and turn it
on in the AdSense dashboard, and no unit id is needed at all — the loader script
already on every page is the whole integration and Google chooses the
placements. Our own units then stand down (AdSlot renders nothing, PageAds
places nothing, and the config withholds the unit ids), because two sets of
placements on one page is how a site becomes ad-heavy. The admin tab carries the
dashboard links and the steps, so finding the `data-ad-slot` is not a hunt.

With manual units, `PageAds` measures the rendered page and places what the template did not: one
unit above the content, two through the middle on real section boundaries, one
in the closing cluster — four, sized for a single network, since "ads must not
exceed content" is what a site gets measured against. Focused pages (mushaf,
qibla, sign-in, donate) are skipped, in every site's own spelling.

A unit that gets no fill collapses to nothing (`data-ad-status`), so a page
never carries a labelled empty band. Position markers are an **owner tool**:
add `?ads=preview` to any URL to see where each unit will land. Visitors never
see them.

## Storage discipline

Watched nightly by `.github/workflows/db-maintenance.yml`:

- **D1 around 5 GB, never over 10.** The run prunes machine translations that
  are wrong (`prune-mt-arabic`) or unread (`prune-mt-unserved`), spills bulk
  text to R2, and ends with `scripts/d1-ceiling.ts`: a warning past the 5 GB
  target, a red run past the 10 GB ceiling — because a full D1 stops accepting
  writes rather than slowing down, and the first symptom is the admin being
  unable to log in.
- **Murottal comes from the reciters' CDNs.** We store no recitation at all:
  the players resolve the reciter's own CDN URL
  (`apps/web/src/lib/qori-cdn.ts`), `/audio/qori2/…` redirects there instead of
  serving bytes (`apps/worker-api/src/routes/audio.ts`), and the Worker's
  scheduled tick drains the old `audio/qori/` + `audio/qori2/` libraries out of
  R2 along with the `audio_cache` rows that catalogued them. The bulk importer
  still exists for the day a mirror is worth having again, but refuses to run
  without an explicit `confirm=download`.
