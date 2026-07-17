# Content Policy — ULYAH.COM

Non-negotiable rule (arsitektur doc §10, reinforced explicitly by the
project owner): **no religious content is ever fabricated or published
without a traceable, legitimate source.** This applies equally to content
written at build time by a human/editor and content generated at runtime by
the zero-hand AI pipeline.

## What ships pre-seeded, and why it's safe

| Content | Source | Why it's safe |
|---|---|---|
| Qur'an Arabic text + transliteration | [`quran-json`](https://github.com/risan/quran-json) v3.1.2, CC-BY-4.0 | Licensed for redistribution, verified against the standard Uthmani text. |
| Translations (id, en, ru, fr, zh, es, bn, sv, tr, ur) | Same dataset | Same license. German and Japanese have no licensed translation in this dataset yet — the UI shows an explicit "not yet available, showing English" notice rather than machine-translating scripture. |
| Tafsir/asbabun-nuzul/hadits samples (Al-Fatihah 1:1, Ayat Kursi 2:255) | Tafsir Kementerian Agama RI / Ibn Kathir (ringkas) / HR. Bukhari 2559 | Standard, widely-cited references; attributed by name in the `source` column. |
| "Kisah Nabi Yusuf AS" series (6 episodes) | Direct paraphrase of QS. Yusuf 12:4-101 (same `quran-json` text already in `ayah`/`translation`) | The Qur'an itself calls this "the best of stories" (12:3). Every paragraph cites its exact ayah range; no hadith, no scholarly opinion, and no invented dialogue beyond what those ayat state. See `scripts/content/kisah-yusuf.ts` for the full text and citations. |

## Rules for anything added later

1. **New sources** (tafsir, hadith collections, e-books) must be registered
   in `license_sources` with a real `license_type` before any content from
   them can be published — enforced by the admin review workflow
   (`ebooks.license_status` starts at `unverified`, `stories.status` starts
   at `draft`/`pending_review`).
2. **AI-generated content** (`stories.ai_generated = 1`) is grounded only in
   ayat/tafsir/hadits already present in D1 — see the prompt templates in
   `packages/ai-engine/src/prompts.ts`, which explicitly instruct the model
   not to invent new claims and to flag unsupported claims via the
   fact-check step. It always lands in `pending_review`, never
   auto-published, unless an admin explicitly enables auto-approve for a
   specific low-risk content type.
3. **Never** treat a general-purpose web scrape or an unlicensed PDF
   aggregator as a source. `license_sources` explicitly marks archive.org's
   general catalogue as `rejected` for exactly this reason.
4. **Audio**: Qur'an recitation is never replaced by TTS, regardless of
   locale — only kisah/tafsir narration in non-Arabic uses synthetic voices
   (see `packages/db-schema/migrations/0003_i18n_voices.sql`).
