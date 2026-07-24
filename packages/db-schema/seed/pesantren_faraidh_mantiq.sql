-- Two more categories for the readable Kitab Pesantren library: Faraidh (the
-- science of inheritance shares) and Mantiq (logic). Honest editorial
-- introductions ("Tim Editorial ULYAH") with standard, verifiable content and,
-- for Faraidh, the Qur'anic basis cited (An-Nisa 7, 11, 12, 176). Not attributed
-- to a specific classical matn. Idempotent (INSERT OR IGNORE). See
-- docs/CONTENT-POLICY.md.
PRAGMA foreign_keys = OFF;

-- ═══════════════ FARAIDH (Ilmu Waris) ═══════════════
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order)
VALUES ('faraidh', 'Faraidh (Waris)', 'الفرائض', '📿', 12);

INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order)
VALUES ('pengantar-faraidh', 'faraidh', 'مقدمة في علم الفرائض', 'Pengantar Ilmu Faraidh', 'Tim Editorial ULYAH', NULL,
'Pengenalan ilmu waris (faraidh): rukun dan sebab waris, serta enam bagian pasti (furudh muqaddarah) beserta dasarnya dari Al-Qur''an surah An-Nisa. Disusun sebagai pengantar; setiap dalil dicantumkan.', 1);

INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('pengantar-faraidh', 1, 'Dasar dan Rukun Waris', 'أركان الإرث وأسبابه');
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('pengantar-faraidh', 2, 'Enam Bagian Pasti (Furudh)', 'الفروض المقدرة');

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 1, 'Anjuran Mempelajari Faraidh', 'فضل علم الفرائض',
'عِلْمُ الْفَرَائِضِ: مَعْرِفَةُ قِسْمَةِ التَّرِكَةِ بَيْنَ مُسْتَحِقِّيهَا بِمَا فَرَضَ اللَّهُ.',
'Ilmu Faraidh adalah mengetahui pembagian harta warisan di antara para pihak yang berhak, sesuai yang telah Allah tetapkan.',
'Allah berfirman, "Bagi laki-laki ada hak bagian dari harta peninggalan ibu-bapak dan kerabat, dan bagi perempuan ada hak bagian (pula)…" (QS. An-Nisa: 7). Faraidh adalah satu-satunya bidang yang bagiannya ditetapkan langsung dan rinci di dalam Al-Qur''an, sehingga menjaganya termasuk menjaga hukum Allah.',
'["4:7"]', NULL
FROM pesantren_bab WHERE kitab_slug='pengantar-faraidh' AND bab_order=1;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 2, 'Rukun dan Sebab Waris', 'أركان الإرث وأسبابه',
'أَرْكَانُ الْإِرْثِ ثَلَاثَةٌ: مُوَرِّثٌ، وَوَارِثٌ، وَمَوْرُوثٌ. وَأَسْبَابُهُ: النَّسَبُ، وَالنِّكَاحُ، وَالْوَلَاءُ.',
'Rukun waris ada tiga: pewaris (muwarrits), ahli waris (warits), dan harta yang diwariskan (mauruts). Sebab-sebab waris: nasab (kekerabatan), nikah (pernikahan yang sah), dan wala'' (memerdekakan budak).',
'Warisan berpindah setelah dipenuhi lebih dulu: biaya pengurusan jenazah, pelunasan utang, lalu wasiat (maksimal sepertiga), baru sisanya dibagi kepada ahli waris. Penghalang waris (mawani'') antara lain: pembunuhan terhadap pewaris, perbedaan agama, dan perbudakan.',
NULL, NULL
FROM pesantren_bab WHERE kitab_slug='pengantar-faraidh' AND bab_order=1;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 1, 'Bagian Setengah, Seperempat, Seperdelapan', 'النصف والربع والثمن',
'النِّصْفُ وَالرُّبْعُ وَالثُّمْنُ مِنَ الْفُرُوضِ الْمُقَدَّرَةِ فِي كِتَابِ اللَّهِ.',
'Setengah (1/2), seperempat (1/4), dan seperdelapan (1/8) termasuk bagian pasti yang ditetapkan dalam Kitab Allah.',
'1/2: suami bila pewaris tak punya anak; juga seorang anak perempuan tunggal. 1/4: suami bila ada anak; atau istri bila tak ada anak. 1/8: istri bila ada anak. Dasarnya, "Bagimu (suami) seperdua dari harta yang ditinggalkan istrimu jika mereka tidak mempunyai anak…" dan "…para istri memperoleh seperempat… jika kamu tidak mempunyai anak. Jika kamu mempunyai anak, para istri memperoleh seperdelapan…" (QS. An-Nisa: 12).',
'["4:12"]', NULL
FROM pesantren_bab WHERE kitab_slug='pengantar-faraidh' AND bab_order=2;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 2, 'Bagian Dua Pertiga, Sepertiga, Seperenam', 'الثلثان والثلث والسدس',
'الثُّلُثَانِ وَالثُّلُثُ وَالسُّدُسُ مِنَ الْفُرُوضِ الْمُقَدَّرَةِ.',
'Dua pertiga (2/3), sepertiga (1/3), dan seperenam (1/6) juga termasuk bagian pasti.',
'2/3: dua anak perempuan atau lebih (bila tak ada anak laki-laki). 1/3: ibu bila pewaris tak punya anak dan tak punya banyak saudara; juga dua saudara/i seibu atau lebih. 1/6: masing-masing ibu dan bapak bila pewaris punya anak. Dasarnya, "…jika anak itu semuanya perempuan lebih dari dua, bagi mereka dua pertiga… Untuk kedua orang tua, masing-masing seperenam dari harta yang ditinggalkan, jika (yang meninggal) mempunyai anak…" (QS. An-Nisa: 11).',
'["4:11","4:176"]', NULL
FROM pesantren_bab WHERE kitab_slug='pengantar-faraidh' AND bab_order=2;

-- ═══════════════ MANTIQ (Logika) ═══════════════
INSERT OR IGNORE INTO pesantren_category (slug, name_id, name_ar, icon, sort_order)
VALUES ('mantiq', 'Mantiq (Logika)', 'المنطق', '🧠', 13);

INSERT OR IGNORE INTO pesantren_kitab (slug, category_slug, title_ar, title_id, author, author_death_year, description_id, sort_order)
VALUES ('pengantar-mantiq', 'mantiq', 'مقدمة في علم المنطق', 'Pengantar Ilmu Mantiq', 'Tim Editorial ULYAH', NULL,
'Pengenalan ilmu mantiq (logika) sebagai alat penjaga pikiran dari kekeliruan: pembagian ilmu menjadi tashawwur dan tashdiq, lima kulli (kulliyat khams), dan qiyas. Disusun sebagai pengantar.', 1);

INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('pengantar-mantiq', 1, 'Pengertian dan Faedah', 'تعريف المنطق وفائدته');
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('pengantar-mantiq', 2, 'Tashawwur, Tashdiq, dan Kulliyat', 'التصور والتصديق والكليات');

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 1, 'Pengertian Mantiq', 'تعريف المنطق',
'الْمَنْطِقُ: آلَةٌ قَانُونِيَّةٌ تَعْصِمُ مُرَاعَاتُهَا الذِّهْنَ عَنِ الْخَطَإِ فِي الْفِكْرِ.',
'Mantiq adalah alat/kaidah yang, bila diperhatikan, menjaga akal dari kekeliruan dalam berpikir.',
'Mantiq berfungsi seperti timbangan (mizan) bagi akal: ia menata cara menyimpulkan agar tidak salah. Para ulama membolehkan mempelajarinya sebagai alat bantu memahami ilmu, dengan syarat berpegang pada akidah yang benar. Ia banyak diajarkan di pesantren melalui kitab seperti As-Sullam al-Munauraq.',
NULL, NULL
FROM pesantren_bab WHERE kitab_slug='pengantar-mantiq' AND bab_order=1;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 1, 'Tashawwur dan Tashdiq', 'التصور والتصديق',
'الْعِلْمُ قِسْمَانِ: تَصَوُّرٌ وَهُوَ إِدْرَاكُ الْمُفْرَدِ، وَتَصْدِيقٌ وَهُوَ إِدْرَاكُ النِّسْبَةِ.',
'Pengetahuan terbagi dua: tashawwur, yaitu memahami sesuatu secara tunggal (konsep) tanpa menghukuminya; dan tashdiq, yaitu memahami hubungan/penilaian (membenarkan atau menyalahkan).',
'Contoh tashawwur: memahami makna "matahari". Contoh tashdiq: menghukumi bahwa "matahari itu terbit". Tashawwur diperoleh melalui definisi (ta''rif), sedangkan tashdiq diperoleh melalui argumen/dalil (hujjah).',
NULL, NULL
FROM pesantren_bab WHERE kitab_slug='pengantar-mantiq' AND bab_order=2;

INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json)
SELECT id, 2, 'Lima Kulli (Kulliyat Khams)', 'الكليات الخمس',
'الْكُلِّيَّاتُ الْخَمْسُ: الْجِنْسُ، وَالنَّوْعُ، وَالْفَصْلُ، وَالْخَاصَّةُ، وَالْعَرَضُ الْعَامُّ.',
'Lima kulli itu: jins (genus), nau'' (spesies), fashl (pembeda), khashshah (ciri khusus), dan ''aradh ''amm (sifat umum).',
'Misal pada "manusia": jins-nya "hewan" (yang mencakup manusia dan lainnya), nau''-nya "manusia", fashl-nya "yang berpikir" (nathiq) yang membedakannya dari hewan lain, khashshah-nya "yang tertawa", dan ''aradh ''amm-nya "yang bernapas". Lima kulli ini dasar menyusun definisi yang tepat.',
NULL, NULL
FROM pesantren_bab WHERE kitab_slug='pengantar-mantiq' AND bab_order=2;
