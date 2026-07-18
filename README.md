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

## Multi-tenant & multi-language

ONE codebase serves four sites, each with its own visual identity
(`src/styles/themes/`) and its own single native language:

| Domain | Worker | Language | Identity |
|---|---|---|---|
| ulyah.com | ulyah-web | Indonesian (+8 UI languages) | Modern Islamic Premium |
| 1fr.fr | onefaith-web | French only | French Editorial Luxury |
| tilawa.de | tilawa-web | German only | German Modern Tech |
| dawa.es | dawa-web | Spanish only | Spanish Warm Mediterranean |

ulyah.com keeps 9 UI languages (id/en/ru/de/fr/es/ar/zh/ja) with geo-IP +
`Accept-Language` auto-detection (Indonesian IPs always get Indonesian).
Qur'an translations exist natively in 11 languages — quran-json (CC-BY-4.0)
for id/en/ru/fr/zh/es/bn/sv/tr/ur plus German (Abu Rida via
fawazahmed0/quran-api, `scripts/generate-quran-de-seed.ts`); only Japanese
still falls back to English with a visible notice rather than
machine-translating scripture. See `packages/shared/src/i18n.ts`.
