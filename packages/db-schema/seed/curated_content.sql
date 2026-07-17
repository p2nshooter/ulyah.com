-- Curated tafsir/hadits/asbabun-nuzul sample referencing `ayah` rows — MUST
-- be applied AFTER quran_seed.sql (bulk ayah/translation data), never as
-- part of the migrations set, since `ayah` is empty until quran_seed.sql runs.
-- Covers Al-Fatihah 1:1 and Ayat Kursi 2:255 so the golden-path UI is fully
-- populated end-to-end out of the box.

INSERT INTO tafsir (ayah_id, source, text, ai_generated, status)
SELECT id, 'Tafsir Kementerian Agama RI', 'Surat Al-Fatihah dibuka dengan basmalah sebagai adab memulai setiap pekerjaan baik, memohon pertolongan dan rahmat Allah sebelum memulai bacaan Al-Qur''an.', 0, 'published'
FROM ayah WHERE surah_id = 1 AND number = 1;

INSERT INTO tafsir (ayah_id, source, text, ai_generated, status)
SELECT id, 'Tafsir Kementerian Agama RI', 'Ayat ini menjelaskan sifat Allah Yang Maha Hidup dan Maha Berdiri Sendiri dalam mengurus seluruh makhluk-Nya tanpa bantuan siapa pun.', 0, 'published'
FROM ayah WHERE surah_id = 2 AND number = 255;

INSERT INTO asbabun_nuzul (ayah_id, text, source)
SELECT id, 'Tidak ada sebab khusus turunnya ayat ini. Ini adalah penjelasan tentang sifat-sifat Allah yang Maha Agung, diturunkan sebagai bagian dari penegasan akidah tauhid dalam Surat Al-Baqarah.', 'Tafsir Ibn Kathir (ringkas)'
FROM ayah WHERE surah_id = 2 AND number = 255;

INSERT INTO hadits (id, text_ar, text_id, narrator, grade, source) VALUES
  (1, NULL, 'Allah tidak tidur dan tidak pula pantas bagi-Nya untuk tidur, Dia-lah yang merendahkan dan meninggikan timbangan (rezeki makhluk-Nya)...', 'Abu Musa Al-Asy''ari', 'shahih', 'HR. Bukhari 2559');

INSERT INTO ayah_hadits_map (ayah_id, hadits_id, relevance_note)
SELECT id, 1, 'Menguatkan sifat Al-Hayyu Al-Qayyum (Maha Hidup, Maha Berdiri Sendiri) pada Ayat Kursi.'
FROM ayah WHERE surah_id = 2 AND number = 255;

INSERT INTO stories (title, slug, lang, category_id, body, ai_generated, voice_persona_id, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT
  'Hikmah Kesabaran Nabi Ayyub AS',
  'hikmah-kesabaran-nabi-ayyub',
  'id',
  1,
  'Nabi Ayyub AS diuji dengan sakit yang berkepanjangan, kehilangan harta, dan keluarga, namun tetap bersabar dan tidak pernah berhenti bersyukur kepada Allah. Kisah ini mengajarkan bahwa kesabaran sejati adalah tetap teguh dalam ketaatan meski diuji berat, dan pertolongan Allah datang bagi hamba yang sabar dan tawakal.',
  0, 3, 'published', 'ai_original', 'published', 0.92,
  (SELECT id FROM ayah WHERE surah_id = 38 AND number = 41),
  datetime('now');
