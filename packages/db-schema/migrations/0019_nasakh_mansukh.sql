-- Nasakh & Mansukh — the classical science of abrogating (nasikh) and
-- abrogated (mansukh) verses. A tidy, voice-ready catalogue: each entry pairs
-- the abrogated ruling with the abrogating one, the verses involved, the type
-- of naskh, and a short explanation. Curated from well-known works of 'Ulum
-- al-Qur'an (e.g. An-Nahhas, Ibn al-Jawzi, As-Suyuthi in Al-Itqan).
--
-- Loaded once via the deploy workflow from seed/nasakh_mansukh.sql.

CREATE TABLE nasakh_mansukh (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_order INTEGER NOT NULL,
  title_id TEXT NOT NULL,               -- topic, e.g. "Perubahan Kiblat"
  naskh_type TEXT NOT NULL,             -- hukm | tilawah | hukm_tilawah (jenis naskh)
  mansukh_ref TEXT,                     -- e.g. "QS. Al-Baqarah: 115" (yang dihapus)
  mansukh_ar TEXT,
  mansukh_id TEXT,                      -- terjemah ayat/hukum yang dinasakh
  nasikh_ref TEXT,                      -- e.g. "QS. Al-Baqarah: 144" (penghapus)
  nasikh_ar TEXT,
  nasikh_id TEXT,                       -- terjemah ayat/hukum penghapus
  explanation_id TEXT,                  -- penjelasan ringkas
  source TEXT,                          -- rujukan ulama
  UNIQUE (entry_order)
);
