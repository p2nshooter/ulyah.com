-- Which languages ulyah.com actually offers — decided by the owner, at runtime.
--
-- Until now this was a constant in the code, so turning a language on meant a
-- commit and a deploy. Owner: "progress bahasa dipantau dari portal admin
-- ulyah.com, kalau semua sudah 100% baru nanti diaktifin, atau kasih tombol
-- aktif/non-aktif biar saya sendiri yang milih."
--
-- Readiness stays MEASURED (scripts/generate-locale-readiness.ts) and is shown
-- next to each switch, so the choice is informed — but the choice itself is the
-- owner's. A row absent from this table means "off": a language is only ever
-- served because somebody deliberately turned it on.
CREATE TABLE IF NOT EXISTS locale_settings (
  code       TEXT PRIMARY KEY,
  enabled    INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indonesian is what ulyah.com is written in, so it is on and stays on.
INSERT OR IGNORE INTO locale_settings (code, enabled) VALUES ('id', 1);
