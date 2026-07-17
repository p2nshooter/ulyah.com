-- Reciter country of origin, surfaced in the reciter picker so listeners can
-- see the geographic range represented (arsitektur doc §6 wants "berbagai
-- negara"). Backfills the 4 existing rows and adds a much larger roster
-- pulled from EveryAyah.com's actual catalogue — the largest freely
-- redistributable per-ayah archive, which in practice skews Gulf/Egypt/Iran
-- since that is where structured, licensed recitation archives exist.

ALTER TABLE qori ADD COLUMN country TEXT;

UPDATE qori SET country = 'Kuwait' WHERE id = 1;
UPDATE qori SET country = 'Saudi Arabia' WHERE id = 2;
UPDATE qori SET country = 'Saudi Arabia' WHERE id = 3;
UPDATE qori SET country = 'Egypt' WHERE id = 4;

INSERT INTO qori (name, audio_base_path, country) VALUES
  ('Abdul Basit Abdul Samad (Murattal)', 'audio/qori/abdulbasit-murattal', 'Egypt'),
  ('Abdul Basit Abdul Samad (Mujawwad)', 'audio/qori/abdulbasit-mujawwad', 'Egypt'),
  ('Muhammad Siddiq Al-Minshawi', 'audio/qori/minshawi', 'Egypt'),
  ('Mohammad Al-Tablawi', 'audio/qori/tablawi', 'Egypt'),
  ('Muhammad Jibreel', 'audio/qori/jibreel', 'Egypt'),
  ('Ali Al-Hudhaify', 'audio/qori/hudhaify', 'Saudi Arabia'),
  ('Maher Al Muaiqly', 'audio/qori/muaiqly', 'Saudi Arabia'),
  ('Ahmed Al-Ajmy', 'audio/qori/ajmy', 'Saudi Arabia'),
  ('Abu Bakr Al-Shatri', 'audio/qori/shatri', 'Saudi Arabia'),
  ('Hani Ar-Rifai', 'audio/qori/rifai', 'Saudi Arabia'),
  ('Nasser Al Qatami', 'audio/qori/qatami', 'Saudi Arabia'),
  ('Yasser Al-Dosari', 'audio/qori/dosari', 'Saudi Arabia'),
  ('Ibrahim Al-Akhdar', 'audio/qori/akhdar', 'Saudi Arabia'),
  ('Ayman Sowaid', 'audio/qori/sowaid', 'Saudi Arabia'),
  ('Muhsin Al-Qasim', 'audio/qori/qasim', 'Saudi Arabia'),
  ('Salah Bukhatir', 'audio/qori/bukhatir', 'United Arab Emirates'),
  ('Fares Abbad', 'audio/qori/abbad', 'Jordan'),
  ('Karim Mansoori', 'audio/qori/mansoori', 'Iran');
