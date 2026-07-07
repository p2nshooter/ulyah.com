-- Static reference/demo data with NO dependency on `ayah` having rows yet
-- (qori, voice personas, categories, license sources). Migrations run before
-- the bulk seed files (quran_seed.sql etc.), so anything that references
-- `ayah` via subquery must NOT live here — see
-- packages/db-schema/seed/curated_content.sql, applied after quran_seed.sql.

INSERT INTO qori (id, name, audio_base_path) VALUES
  (1, 'Mishary Rashid Alafasy', 'audio/qori/alafasy'),
  (2, 'Abdul Rahman Al-Sudais', 'audio/qori/sudais'),
  (3, 'Saad Al-Ghamdi', 'audio/qori/ghamdi'),
  (4, 'Mahmoud Khalil Al-Husary', 'audio/qori/husary');

INSERT INTO voice_persona (id, name, gender, tone_desc, tts_engine, sample_r2_key) VALUES
  (1, 'Ustadz Narator (Tafsir)', 'male', 'Berwibawa, tenang, tempo sedang-lambat', 'piper', NULL),
  (2, 'Pembaca Hadits Formal', 'male', 'Formal, jelas, jeda tegas antar hadits', 'piper', NULL),
  (3, 'Pendongeng Kisah', 'male', 'Naratif, hangat, sedikit ekspresif', 'edge-tts', NULL),
  (4, 'Suara Hikmah Lembut', 'female', 'Ramah, lembut, ritme lebih cepat', 'edge-tts', NULL);

INSERT INTO categories (id, name, slug, parent_id, auto_created) VALUES
  (1, 'Kisah Para Nabi', 'kisah-para-nabi', NULL, 0),
  (2, 'Kisah Sahabat', 'kisah-sahabat', NULL, 0),
  (3, 'Hikmah Harian', 'hikmah-harian', NULL, 0),
  (4, 'Tafsir Tematik', 'tafsir-tematik', NULL, 0);

INSERT INTO license_sources (name, url, license_type, status, notes) VALUES
  ('quran-json (risan)', 'https://github.com/risan/quran-json', 'CC-BY-4.0', 'approved', 'Teks Arab + terjemahan Indonesia + transliterasi, seluruh 114 surat.'),
  ('Quran.com API', 'https://quran.com/api', 'Open / API redistribution', 'approved', 'Cadangan untuk tafsir & audio metadata.'),
  ('Tanzil', 'https://tanzil.net', 'Tanzil Quran Text (open)', 'approved', 'Cadangan teks Arab.'),
  ('EveryAyah', 'https://everyayah.com', 'Redistribusi non-komersial diizinkan', 'approved', 'Sumber audio murottal multi-qori.'),
  ('Sunnah.com', 'https://sunnah.com', 'Open API', 'approved', 'Hadits terverifikasi dengan grading.'),
  ('archive.org (umum)', 'https://archive.org', 'Beragam / tidak jelas', 'rejected', 'TIDAK dipakai sebagai sumber otomatis — status lisensi per-item tidak jelas.');
