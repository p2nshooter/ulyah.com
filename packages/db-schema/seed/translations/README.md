# Hand-written translations

Translations written by hand for the sibling sites, applied to `mt_cache` on
every deploy.

## Why these exist

The sites translate at runtime and cache the result. What was in the cache was
wrong in ways that a fluent-sounding translation hides:

| where | English | what was cached |
|---|---|---|
| Spanish hadith titles | `HR.` (*hadits riwayat* — "narrated by") | **"recursos humanos"** — Human Resources |
| French hadith titles | `HR.` | **"RH."** — *ressources humaines* |
| German episode title | "Episode 2: The Well of Betrayal" | "Folge 2: **The Well of Betrayal**" — half untranslated |
| German session titles | "Authentic Hadith Session 2" | "Authentische **Hadith**-Sitzung 2" — uninflected |

None of that throws an error. The page renders, the words are Spanish, and the
heading says Human Resources.

## How a translation reaches a reader

The Worker looks up `mt:<src>-<tgt>:<hash>` in `mt_cache`, where the hash is
FNV-1a over the source text **after protected terms are masked**. Derived in
`apps/worker-api/src/lib/mt.ts`; replicated in `scripts/mt-key.mjs` so
translations can be written offline.

Two things are easy to get wrong and produce silence rather than failure:

- **The source language is `en`, not `id`.** For es/de/fr the API serves the
  English row and translates from it (`content.ts`, `/content/stories/:slug`).
  A translation written under `mt:id-es:…` is never looked up.
- **Mask before hashing.** `localizeBatchProtected` masks first, so a title
  containing "Bukhari" or "no." hashes as `@@0@@ @@1@@`, not as itself.

`scripts/check-mt-key.mjs` guards both, and is in CI. Its expected keys were
read back out of the live database, not invented.

## Adding more

1. Pull the English source strings from D1.
2. Translate them.
3. Generate rows with `storyKey(text, lang)` from `scripts/mt-key.mjs`.
4. Drop the `.sql` file in this directory — the deploy applies every file here.

`ON CONFLICT DO UPDATE`, deliberately: the point is to replace a bad
translation, not to skip it because something is already there.

## Conventions

- Prophet names keep their Qur'anic form (Yusuf, Musa, Ibrahim, Nuh, Lut,
  Isma'il, Ishaq, Ya'qub, Zakariya, Yahya, Maryam, Sulaiman, Idris, Hud,
  Salih). The English source says "Noah" in one series and the Arabic form
  everywhere else; the Arabic form is used throughout rather than mirroring
  that inconsistency.
- Islamic terms are not replaced with approximations: Tawhid, Ka'bah, Ummah,
  Iblis, Fir'aun, 'Ad, Thamud, sanad, tafsir.
- Place and person names stay: Al-Aziz, Madyan, Thuwa, Saba.
- Qur'anic text is **not** translated here. The Qur'an has its own tafsir.

## What is in here

| file | rows | covers |
|---|---:|---|
| `hadith-sessions-*.sql` | 1,899 | all 633 "Authentic Hadith Session N" titles |
| `story-titles-1.sql` | 102 | 34 prophet-story episode titles |
| `story-titles-2.sql` | 400 | the 9 cited-hadith titles + prophet stories |
| `story-titles-3.sql` | 89 | the remainder |
| `kitab-categories.sql` | 114 | all 38 library category names |
| `hadith-collections.sql` | 36 | all 12 hadith collection names |
| **total** | **2,640** | |

`titles.json` is the manifest the coverage check reads — the list of story
titles the seeds are expected to cover.

Every English story title, in all three languages. Titles are the
highest-leverage strings on the site: the listing endpoint localizes titles and
nothing else, so one title appears on every index, card and search result of
all three sibling sites.

`scripts/check-translation-coverage.mjs` derives the key for each of the 830
and fails if any is absent, duplicated with conflicting text, or left with the
English lead-in. It is in CI.

### Two of these were not cache gaps

`kitab_category` and `hadits_collection` needed a code change as well as
translations, and neither would ever have been fixed by warming:

- **Category names** were served in English to every non-Indonesian language.
  `resolveCategoryLang()` returns `name_id` or `name_en` and has no third
  branch, so no lookup happened at all — the warm job had been dutifully
  caching `mt:id-es` for names nothing ever asked for.
- **Collection names** went through the *unprotected* localize path, the only
  call in `content.ts` that did. "Shahih Muslim" through an unguarded
  translator becomes "Sahih musulmán" — the adjective.

Still untranslated: the story **bodies** — roughly 17,000 paragraphs per
language, still translated on demand.
