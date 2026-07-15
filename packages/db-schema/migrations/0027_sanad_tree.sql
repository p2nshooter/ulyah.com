-- Migration number: 0027    2026-07-15
-- Sanad (isnad chain) tree — narrator-by-narrator structure for hadith
-- authentication chains, per the admin portal's own backlog requirement
-- (BacklogTab.tsx: "Pohon Sanad", "Perawi", "Biografi Perawi" — all
-- previously "todo", explicitly noting these fields did not exist yet and
-- "jangan dikarang, harus dari sumber bersanad nyata" — must come from a
-- real chained source, never fabricated).
--
-- Chains are NOT invented: they are extracted from the isnad text already
-- present (and already licensed, Unlicense/public domain via
-- fawazahmed0/hadith-api) inside hadits.text_ar for collections whose
-- Arabic text spells out the full chain — see
-- scripts/extract-sanad-chains.ts. Every extracted chain starts as
-- 'pending_review': a heuristic Arabic-text parser can mis-segment a name,
-- and misrepresenting a hadith's authentication chain is a real scholarly
-- accuracy concern, so nothing reaches the public tree without an admin
-- (or a hand-verified seed) confirming it first.

CREATE TABLE perawi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT NOT NULL,               -- as extracted/entered, tashkeel-stripped for consistent matching
  name_normalized TEXT NOT NULL UNIQUE,-- dedupe key (trimmed, single-spaced)
  bio_id TEXT,                         -- Indonesian biography — filled in later by admin/worker, nullable
  bio_en TEXT,
  generation TEXT,                     -- tabaqah (generation: sahabat, tabi'in, tabi' tabi'in, ...), nullable
  reliability_grade TEXT,              -- jarh wa ta'dil grade (thiqah, saduq, da'if, ...), nullable
  death_year_hijri INTEGER,
  auto_created INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_perawi_normalized ON perawi(name_normalized);

CREATE TABLE sanad_chain (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hadits_id INTEGER NOT NULL REFERENCES hadits(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'published', 'rejected')),
  extraction_method TEXT NOT NULL DEFAULT 'heuristic' CHECK (extraction_method IN ('heuristic', 'manual_verified')),
  reviewed_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (hadits_id)
);
CREATE INDEX idx_sanad_chain_status ON sanad_chain(status);

CREATE TABLE sanad_link (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sanad_chain_id INTEGER NOT NULL REFERENCES sanad_chain(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,           -- 0 = narrator closest to the compiler (e.g. Bukhari's own teacher), increasing toward the Prophet ﷺ
  perawi_id INTEGER NOT NULL REFERENCES perawi(id) ON DELETE CASCADE
);
CREATE INDEX idx_sanad_link_chain ON sanad_link(sanad_chain_id, position);
