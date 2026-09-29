# Dawa — dawa.es

**El Portal Islámico en Español.** Al-Qur'an lengkap (114 surah, 6.236 ayat)
dengan terjemahan Spanyol, tafsir, asbabun nuzul dan hadits dalam satu halaman
per ayat; radio murottal dari CDN para qari; kisah para nabi dan tokoh; kitab;
jadwal salat; kiblat; kalkulator zakat & waris; Al-Qur'an Kids; portal admin
tersembunyi (klik logo 5×).

Proyek ini **mandiri** — dipisahkan dari ekosistem ulyah.com. Panduan lengkap:
[docs/PANDUAN-SETUP-DAWA-ES.md](./docs/PANDUAN-SETUP-DAWA-ES.md).

## Susunan

```
apps/
  web/          Next.js 15 — situs publik + portal admin (worker dawa-web → dawa.es)
  worker-api/   Hono di Cloudflare Workers — REST API + Durable Object + cron (dawa-api → api.dawa.es)
packages/
  shared/       tipe, kripto (AES-GCM, PBKDF2, TOTP), registri bahasa, rute
  ai-engine/    pipeline konten AI
  key-pool/     validasi & penilaian kunci AI/GPU donasi
  db-schema/    migrasi D1 + seed (Qur'an, hadits, kisah, kitab, pesantren, …)
scripts/        generator seed, pemeriksa CI, perawatan D1, penerjemah
.github/workflows/  deploy.yml (deploy otomatis saat push ke main), ci.yml, perawatan
```

## Cloudflare

| Sumber daya | Nama | Binding |
|---|---|---|
| Worker web | `dawa-web` | — (`dawa.es`, `www.dawa.es`) |
| Worker API | `dawa-api` | — (`api.dawa.es`) |
| D1 | `dawa-db` | `DB` |
| KV | `dawa-cache` | `CACHE_KV` |
| R2 media | `dawa-media` | `MEDIA_R2` |
| R2 cache halaman | `dawa-next-cache` | `NEXT_INC_CACHE_R2_BUCKET` |
| Durable Object | `KeyPoolCoordinator` | `KEY_POOL` |
| Workers AI | — | `AI` |

## Pengembangan

```bash
corepack enable
pnpm install
pnpm dev:api      # wrangler dev → http://localhost:8787
pnpm dev:web      # next dev → http://localhost:3000
```

Database lokal lengkap: `../database/restore-d1.sh --local` (dari folder backup),
lalu set `NEXT_PUBLIC_API_URL=http://localhost:8787` di
`apps/web/.env.development.local`.

## Deploy

Push ke `main`. Secret yang wajib dan izin API token: lihat panduan §5–§6.

## Iklan, audio, bahasa

- Iklan: Google AdSense saja, konstanta di `apps/web/src/lib/ad-config.ts`.
- Audio murottal: langsung dari CDN qari, tidak disimpan (`apps/web/src/lib/qori-cdn.ts`).
- Bahasa: hanya Spanyol. Al-Qur'an dan matan hadits tidak pernah diterjemahkan mesin.

Nama paket `@ulyah/*` hanyalah namespace workspace warisan — bukan koneksi ke ulyah.com.
