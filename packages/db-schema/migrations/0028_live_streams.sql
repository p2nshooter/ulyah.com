-- Live streaming hub (/live): fixed slots the owner fills from the admin
-- portal — five YouTube slots plus one TikTok and one Facebook. Streams are
-- watched ON ulyah.com (embedded players), never redirected off-site; a slot
-- with no live stream shows the branded offline card with the streaming
-- contact person instead.

CREATE TABLE live_stream (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok', 'facebook')),
  slot INTEGER NOT NULL,
  title TEXT,
  url TEXT,
  is_live INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (platform, slot)
);

INSERT INTO live_stream (platform, slot) VALUES
  ('youtube', 1),
  ('youtube', 2),
  ('youtube', 3),
  ('youtube', 4),
  ('youtube', 5),
  ('tiktok', 1),
  ('facebook', 1);
