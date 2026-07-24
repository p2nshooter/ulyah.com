-- Real recorded audio for Al-Qur'an Kids (hijaiyah letters + Iqro base
-- syllables). Each row is one filled audio "slot"; presence of a row means that
-- slot has real audio in R2 (the players use it and fall back to TTS only when
-- a slot is empty). Managed from the admin "Al-Qur'an Kids" console — uploaded
-- as a file or recorded straight from the microphone.
CREATE TABLE IF NOT EXISTS kids_audio (
  code TEXT PRIMARY KEY,          -- e.g. h-1 (hijaiyah letter 1), s-1-a (letter 1 + fathah)
  r2_key TEXT NOT NULL,           -- object key in MEDIA_R2
  content_type TEXT NOT NULL,     -- audio/mpeg, audio/webm, audio/mp4, …
  source TEXT,                    -- 'upload' | 'record' | 'import' | 'wikimedia'
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);
