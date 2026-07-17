# @ulyah/db-schema

Cloudflare D1 schema, migrations, and seed data for ULYAH.COM.

## Layout

Migrations (schema + anything with NO dependency on `ayah` having rows —
`wrangler d1 migrations apply` runs these in order, before any seed file):

- `migrations/0001_init.sql` — full schema (surah, ayah, translation, tafsir,
  hadits, stories, categories, donations, `ai_key_pool`, `generation_jobs`,
  admin/client accounts, audit log, smart-scaling metrics).
- `migrations/0002_seed_static.sql` — qori list, voice personas, default
  categories, license-source registry. No `ayah`-referencing rows here on
  purpose — see `seed/curated_content.sql` below.
- `migrations/0003_i18n_voices.sql` — adds `lang`/`tts_voice_id` to
  `voice_persona`, seeds one warm + one formal neural voice per supported
  locale (id/en/ru/de/fr/ar/zh/ja).
- `migrations/0004_stories_lang.sql` — makes `stories` language-aware
  (`lang`, `series_key`, `episode_number`, `pdf_ebook_id`), mirroring
  `translation`.

Seed files (data that references `ayah`/`stories` rows — apply **after**
migrations, in this order):

1. `seed/quran_seed.sql` — **generated**, full 114-surah / 6,236-ayah Arabic
   text + Indonesian translation, from the CC-BY-4.0
   [`quran-json`](https://github.com/risan/quran-json) dataset.
2. `seed/quran_seed_{en,ru,fr,zh,es,bn,sv,tr,ur}.sql` — **generated**,
   translation-only, same dataset, one file per additional language.
   Regenerate both of the above with `pnpm db:generate-seed`.
3. `seed/curated_content.sql` — hand-curated tafsir/asbabun-nuzul/hadits for
   Al-Fatihah 1:1 and Ayat Kursi 2:255, so the golden-path UI is fully
   populated without waiting on the AI pipeline.
4. `seed/kisah_yusuf.sql` — **generated** from `scripts/content/kisah-yusuf.ts`,
   the complete "Kisah Nabi Yusuf AS" series (6 episodes × id/en), grounded
   verse-by-verse in QS. Yusuf 12:4-101. Regenerate with
   `npx tsx scripts/generate-kisah-yusuf-seed.ts`.
5. `seed/assets/kisah-nabi-yusuf/**/*.pdf` — **generated** real PDF files for
   every episode/language, rendered by
   `npx tsx scripts/generate-kisah-yusuf-pdfs.ts`. The deploy workflow
   uploads these to R2 at the exact `r2_key` paths `kisah_yusuf.sql`
   references, so downloads never point at a missing file.

## Applying migrations + seed

```bash
# schema + language-independent static data
wrangler d1 migrations apply ulyah-db --remote

# bulk Qur'an text/translations (idempotency: check `SELECT count(*) FROM surah` first)
wrangler d1 execute ulyah-db --remote --file=packages/db-schema/seed/quran_seed.sql
for lang in en ru fr zh es bn sv tr ur; do
  wrangler d1 execute ulyah-db --remote --file=packages/db-schema/seed/quran_seed_${lang}.sql
done

# curated tafsir/hadits + Kisah Nabi Yusuf series (depends on ayah existing)
wrangler d1 execute ulyah-db --remote --file=packages/db-schema/seed/curated_content.sql
wrangler d1 execute ulyah-db --remote --file=packages/db-schema/seed/kisah_yusuf.sql
```

`.github/workflows/deploy.yml` runs all of this automatically on every push
to `main`, skipping the bulk seed steps if `surah` is already populated.

## Licensing note (Lisensi Gate, arsitektur doc §10)

Only `quran-json` (Arabic text + translations, CC-BY-4.0) and the
Kisah Nabi Yusuf series (a direct paraphrase of QS. Yusuf, written by the
ULYAH editorial team — no third-party copyrighted text) are bundled
automatically. Any tafsir, hadits, e-book, or kisah content beyond what's
listed above must pass through the Lisensi Gate (`license_sources` table +
`license_status` column) before publishing — see `docs/CONTENT-POLICY.md`
and the admin review queue.
