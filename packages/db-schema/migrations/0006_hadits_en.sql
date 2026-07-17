-- Migration number: 0006    2026-07-08
-- Hadith become bilingual (Arabic already present) so the AI-free engine can
-- compile narratable hadith articles that switch language with the site,
-- mirroring how `translation` works for the Qur'an.

ALTER TABLE hadits ADD COLUMN text_en TEXT;
