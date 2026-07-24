-- Balaghah (Arabic rhetoric) added to the readable Kitab Pesantren library.
-- An HONEST editorial introduction to the three sciences of balaghah — ma'ani,
-- bayan, badi' — with standard definitions and REAL Qur'anic examples (each
-- ayah cited). Authored as "Tim Editorial ULYAH" (a summary/introduction), NOT
-- falsely attributed to a specific classical matn. See docs/CONTENT-POLICY.md.
-- Idempotent (INSERT OR IGNORE); safe to re-run.
PRAGMA foreign_keys = OFF;

INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order)
VALUES ('balaghah', 'Balaghah', 'البلاغة', '✒️', 11);

INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order)
VALUES ('pengantar-balaghah', 'balaghah', 'مقدمة في علم البلاغة', 'Pengantar Ilmu Balaghah', 'Tim Editorial ULYAH', NULL,
'Pengenalan tiga cabang ilmu balaghah — Ma''ani, Bayan, dan Badi'' — dengan definisi ringkas dan contoh nyata dari Al-Qur''an. Disusun sebagai pengantar; setiap contoh ayat dicantumkan sumbernya.', 1);

-- ── Bab 1: Ilmu Ma'ani ──────────────────────────────────────────────
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar)
VALUES ('pengantar-balaghah', 1, 'Ilmu Ma''ani', 'علم المعاني');

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 1, 'Pengertian Ilmu Ma''ani', 'تعريف علم المعاني',
'عِلْمُ الْمَعَانِي: عِلْمٌ يُعْرَفُ بِهِ أَحْوَالُ اللَّفْظِ الْعَرَبِيِّ الَّتِي بِهَا يُطَابِقُ مُقْتَضَى الْحَالِ.',
'Ilmu Ma''ani adalah ilmu untuk mengetahui keadaan-keadaan lafal Arab yang dengannya suatu ucapan sesuai dengan tuntutan keadaan (muqtadha al-hal).',
'Balaghah adalah kesesuaian ucapan yang fasih dengan keadaan pendengar. Ilmu Ma''ani menjaga agar kalimat tepat sasaran: kapan memakai kalimat berita (khabar) dan kapan memakai kalimat tuntutan (insya''), kapan diringkas (ijaz) dan kapan diperluas (ithnab). Inilah cabang pertama dari tiga cabang balaghah.',
NULL, NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 1;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 2, 'Kalam Khabar dan Insya''', 'الخبر والإنشاء',
'الْكَلَامُ قِسْمَانِ: خَبَرٌ يَحْتَمِلُ الصِّدْقَ وَالْكَذِبَ، وَإِنْشَاءٌ لَا يَحْتَمِلُهُمَا كَالْأَمْرِ وَالنَّهْيِ وَالِاسْتِفْهَامِ.',
'Kalam terbagi dua: khabar (berita) yang bisa benar atau dusta, dan insya'' (tuntutan) yang tidak bisa dinilai benar/dusta, seperti perintah, larangan, dan pertanyaan.',
'Contoh khabar dalam Al-Qur''an: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ" (sungguh beruntung orang-orang beriman) — QS. Al-Mu''minun: 1, sebuah berita yang pasti benar karena dari Allah. Contoh insya'': "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ" (perintah bertakwa) — QS. Ali Imran: 102. Memahami keduanya membantu menempatkan kalimat sesuai maksud.',
'["23:1","3:102"]', NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 1;

-- ── Bab 2: Ilmu Bayan ───────────────────────────────────────────────
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar)
VALUES ('pengantar-balaghah', 2, 'Ilmu Bayan', 'علم البيان');

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 1, 'Tasybih (Perumpamaan)', 'التشبيه',
'التَّشْبِيهُ: بَيَانُ أَنَّ شَيْئًا شَارَكَ غَيْرَهُ فِي صِفَةٍ بِأَدَاةٍ كَالْكَافِ.',
'Tasybih adalah menerangkan bahwa sesuatu menyerupai yang lain dalam suatu sifat, dengan alat penyerupa seperti huruf "kaf" (seperti).',
'Contoh dalam Al-Qur''an: "مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا" — perumpamaan orang munafik seperti orang yang menyalakan api (QS. Al-Baqarah: 17). Empat rukun tasybih: musyabbah (yang diserupakan), musyabbah bih (yang diserupai), adat (alat), dan wajh syabah (sisi keserupaan).',
'["2:17"]', NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 2;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 2, 'Isti''arah (Majaz)', 'الاستعارة',
'الِاسْتِعَارَةُ: تَشْبِيهٌ حُذِفَ أَحَدُ طَرَفَيْهِ، وَهِيَ مَجَازٌ لُغَوِيٌّ عَلَاقَتُهُ الْمُشَابَهَةُ.',
'Isti''arah adalah tasybih yang salah satu ujungnya dibuang; ia termasuk majaz lughawi yang hubungannya adalah keserupaan.',
'Contoh: "وَاشْتَعَلَ الرَّأْسُ شَيْبًا" — dan kepala pun menyala oleh uban (QS. Maryam: 4). Uban yang memutih dan menyebar dipinjamkan kata "menyala" (isyti''al) dari api, karena keserupaan dalam penyebaran dan kecemerlangan. Ini keindahan majaz yang membuat makna lebih hidup.',
'["19:4"]', NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 2;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 3, 'Kinayah (Sindiran)', 'الكناية',
'الْكِنَايَةُ: لَفْظٌ أُرِيدَ بِهِ لَازِمُ مَعْنَاهُ مَعَ جَوَازِ إِرَادَةِ الْمَعْنَى الْأَصْلِيِّ.',
'Kinayah adalah lafal yang dimaksudkan makna kelaziman (yang tersirat)-nya, sambil tetap mungkin dimaksudkan makna aslinya.',
'Contoh: "وَلَا تَجْعَلْ يَدَكَ مَغْلُولَةً إِلَىٰ عُنُقِكَ وَلَا تَبْسُطْهَا كُلَّ الْبَسْطِ" (QS. Al-Isra'': 29). "Tangan terbelenggu ke leher" adalah kinayah dari kikir, dan "membentangkannya selebar-lebarnya" kinayah dari boros — sindiran halus agar seimbang dalam berinfak.',
'["17:29"]', NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 2;

-- ── Bab 3: Ilmu Badi' ───────────────────────────────────────────────
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar)
VALUES ('pengantar-balaghah', 3, 'Ilmu Badi''', 'علم البديع');

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 1, 'Thibaq (Perpaduan Berlawanan)', 'الطباق',
'الطِّبَاقُ: الْجَمْعُ بَيْنَ الشَّيْءِ وَضِدِّهِ فِي الْكَلَامِ، وَهُوَ مِنَ الْمُحَسِّنَاتِ الْمَعْنَوِيَّةِ.',
'Thibaq adalah memadukan sesuatu dengan lawannya dalam satu ucapan; ia termasuk perhiasan makna (muhassinat ma''nawiyyah).',
'Contoh: "وَأَنَّهُ هُوَ أَضْحَكَ وَأَبْكَىٰ" — dan Dialah yang menjadikan tertawa dan menangis (QS. An-Najm: 43). Memadukan "tertawa" dan "menangis" menegaskan kesempurnaan kuasa Allah atas dua hal yang berlawanan.',
'["53:43"]', NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 3;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 2, 'Jinas (Kesamaan Bunyi)', 'الجناس',
'الْجِنَاسُ: تَشَابُهُ لَفْظَيْنِ فِي النُّطْقِ مَعَ اخْتِلَافِ الْمَعْنَى، وَهُوَ مِنَ الْمُحَسِّنَاتِ اللَّفْظِيَّةِ.',
'Jinas adalah kemiripan dua lafal dalam pengucapan tetapi berbeda maknanya; ia termasuk perhiasan lafal (muhassinat lafzhiyyah).',
'Contoh: "وَيَوْمَ تَقُومُ السَّاعَةُ يُقْسِمُ الْمُجْرِمُونَ مَا لَبِثُوا غَيْرَ سَاعَةٍ" (QS. Ar-Rum: 55). Kata "as-sa''ah" pertama bermakna hari kiamat, dan "sa''ah" kedua bermakna sesaat — sama bunyinya, beda maknanya.',
'["30:55"]', NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 3;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 3, 'Muqabalah (Penyandingan)', 'المقابلة',
'الْمُقَابَلَةُ: أَنْ يُؤْتَى بِمَعْنَيَيْنِ أَوْ أَكْثَرَ ثُمَّ بِمَا يُقَابِلُهَا عَلَى التَّرْتِيبِ.',
'Muqabalah adalah mendatangkan dua makna atau lebih, lalu mendatangkan lawan-lawannya secara berurutan.',
'Contoh: "فَلْيَضْحَكُوا قَلِيلًا وَلْيَبْكُوا كَثِيرًا" — maka biarlah mereka tertawa sedikit dan menangis banyak (QS. At-Taubah: 82). "Tertawa–sedikit" disandingkan dengan lawannya "menangis–banyak" secara berurutan, menegaskan balasan atas perbuatan mereka.',
'["9:82"]', NULL
FROM pesantren_bab WHERE kitab_slug = 'pengantar-balaghah' AND bab_order = 3;
