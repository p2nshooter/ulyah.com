-- Kisah Anak Muslim — short, sequential children's stories, watch/listen-only
-- (narrated via the existing browser TTS, no download). Deliberately text +
-- decorative geometric/Islamic-motif animation only — no AI-generated
-- imagery of any living being (Prophets, Companions, animals, people),
-- which Islamic teaching holds as impermissible to depict. Safe imagery
-- means: crescents, stars, mosque silhouettes without faces, lanterns,
-- geometric/arabesque patterns.

CREATE TABLE kisah_anak (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  episode_order INTEGER NOT NULL,
  title_id TEXT NOT NULL,
  title_en TEXT,
  body_id TEXT NOT NULL,
  body_en TEXT,
  moral_id TEXT,          -- one-line hikmah/pelajaran for the closing screen
  moral_en TEXT,
  motif TEXT NOT NULL DEFAULT 'star' CHECK (motif IN ('star', 'moon', 'lantern', 'mosque', 'pattern')),
  age_range TEXT NOT NULL DEFAULT '4-9'
);
