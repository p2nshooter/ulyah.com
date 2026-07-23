-- Migration number: 0046    2026-07-23
-- Move the machine-translation cache off KV and into D1.
--
-- Root cause of "the sibling sites are STILL all in Indonesian, for days":
-- every translated string (kisah names/titles/summaries, category headings,
-- hadith titles, kitab topics — 5,000+ strings across fr/de/es/en) was cached
-- in a Cloudflare KV namespace whose FREE plan caps writes at 1,000/day. That
-- cap was exhausted after ~0 useful writes, so the Worker (and the nightly
-- warm job) could never persist a translation — every string fell back to the
-- Indonesian source on 1fr.fr / dawa.es / tilawa.de / xad.es no matter how
-- often the cache was "warmed".
--
-- D1 has no such daily write cap (the app already writes to it constantly for
-- analytics), so lib/mt.ts now reads/writes translations here instead. Same
-- `mt:<src>-<tgt>:<hash>` key. The warm job and translate-content workflow
-- fill this table from a GitHub runner (whose IP, unlike the Worker's, is not
-- blocked by Google Translate).
CREATE TABLE IF NOT EXISTS mt_cache (
  k          TEXT PRIMARY KEY,           -- mt:<sourceLang>-<targetLang>:<fnv1a hash of source>
  v          TEXT NOT NULL,              -- the translated string
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
