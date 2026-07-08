-- Curated sahih hadith (idempotent — INSERT OR IGNORE by id).
-- Arabic text is the words of the Prophet ﷺ, transcribed only for the most
-- widely-memorised, well-attested hadith. The id/en renderings are the ULYAH
-- editorial team's own concise paraphrase (not a copy of any copyrighted
-- translation), each cited to its collection so readers can verify. Grades
-- follow the standard rulings of the muhaddithin.
-- The AI-free content engine compiles each of these into a narratable article.

INSERT OR IGNORE INTO hadits (id, text_ar, text_id, text_en, narrator, grade, source) VALUES
 (101, 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
  'Sesungguhnya setiap amal itu tergantung pada niatnya, dan setiap orang akan memperoleh sesuai dengan apa yang ia niatkan.',
  'Actions are but by intentions, and every person shall have only what he intended.',
  'Umar bin Al-Khattab', 'shahih', 'HR. Bukhari no. 1 & Muslim no. 1907'),

 (102, 'بُنِيَ الإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ',
  'Islam dibangun di atas lima perkara: syahadat bahwa tidak ada tuhan yang berhak disembah selain Allah dan Muhammad adalah utusan Allah, menegakkan salat, menunaikan zakat, haji ke Baitullah, dan puasa Ramadan.',
  'Islam is built upon five: the testimony that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, giving the zakat, the pilgrimage to the House, and fasting Ramadan.',
  'Abdullah bin Umar', 'shahih', 'HR. Bukhari no. 8 & Muslim no. 16'),

 (103, 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
  'Seorang muslim adalah orang yang kaum muslimin lainnya selamat dari gangguan lisan dan tangannya.',
  'The Muslim is the one from whose tongue and hand the Muslims are safe.',
  'Abdullah bin Amr', 'shahih', 'HR. Bukhari no. 10 & Muslim no. 40'),

 (104, 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
  'Barang siapa beriman kepada Allah dan hari akhir, hendaklah ia berkata yang baik atau diam.',
  'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
  'Abu Hurairah', 'shahih', 'HR. Bukhari no. 6018 & Muslim no. 47'),

 (105, 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
  'Tidak sempurna iman salah seorang dari kalian sampai ia mencintai untuk saudaranya apa yang ia cintai untuk dirinya sendiri.',
  'None of you truly believes until he loves for his brother what he loves for himself.',
  'Anas bin Malik', 'shahih', 'HR. Bukhari no. 13 & Muslim no. 45'),

 (106, 'الدِّينُ النَّصِيحَةُ',
  'Agama itu adalah nasihat (ketulusan): kepada Allah, kitab-Nya, rasul-Nya, para pemimpin kaum muslimin, dan seluruh kaum muslimin.',
  'The religion is sincerity: to Allah, to His Book, to His Messenger, to the leaders of the Muslims, and to their common folk.',
  'Tamim Ad-Dari', 'shahih', 'HR. Muslim no. 55'),

 (107, 'الطُّهُورُ شَطْرُ الإِيمَانِ',
  'Kesucian adalah sebagian dari iman.',
  'Purity is half of faith.',
  'Abu Malik Al-Asyari', 'shahih', 'HR. Muslim no. 223'),

 (108, 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
  'Senyummu di hadapan saudaramu adalah sedekah bagimu.',
  'Your smile in the face of your brother is a charity for you.',
  'Abu Dzar Al-Ghifari', 'hasan', 'HR. Tirmidzi no. 1956'),

 (109, 'لَا تَغْضَبْ',
  'Janganlah engkau marah. Beliau mengulanginya beberapa kali, seluruhnya berpesan: Janganlah engkau marah.',
  'Do not become angry. He repeated it several times, each time saying: Do not become angry.',
  'Abu Hurairah', 'shahih', 'HR. Bukhari no. 6116'),

 (110, 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
  'Amal yang paling dicintai Allah adalah yang paling konsisten (berkelanjutan) walaupun sedikit.',
  'The deeds most beloved to Allah are the most consistent ones, even if they are few.',
  'Aisyah', 'shahih', 'HR. Bukhari no. 6464 & Muslim no. 783'),

 (111, 'الْحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ',
  'Rasa malu tidak mendatangkan kecuali kebaikan.',
  'Modesty brings nothing except good.',
  'Imran bin Hushain', 'shahih', 'HR. Bukhari no. 6117 & Muslim no. 37'),

 (112, 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
  'Barang siapa menempuh suatu jalan untuk menuntut ilmu, Allah akan memudahkan baginya jalan menuju surga.',
  'Whoever travels a path seeking knowledge, Allah makes easy for him a path to Paradise.',
  'Abu Hurairah', 'shahih', 'HR. Muslim no. 2699'),

 (113, 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
  'Sebaik-baik kalian adalah orang yang mempelajari Al-Quran dan mengajarkannya.',
  'The best of you are those who learn the Qur''an and teach it.',
  'Utsman bin Affan', 'shahih', 'HR. Bukhari no. 5027'),

 (114, 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
  'Orang-orang yang penyayang akan disayangi oleh Ar-Rahman. Sayangilah yang ada di bumi, niscaya yang di langit akan menyayangi kalian.',
  'The merciful are shown mercy by the Most Merciful. Be merciful to those on earth, and the One above the heaven will be merciful to you.',
  'Abdullah bin Amr', 'shahih', 'HR. Tirmidzi no. 1924'),

 (115, 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
  'Bertakwalah kepada Allah di mana pun engkau berada, iringilah keburukan dengan kebaikan niscaya ia menghapusnya, dan pergaulilah manusia dengan akhlak yang baik.',
  'Fear Allah wherever you are, follow a bad deed with a good one to wipe it out, and treat people with good character.',
  'Abu Dzar & Muadz bin Jabal', 'hasan', 'HR. Tirmidzi no. 1987'),

 (116, 'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ',
  'Dunia adalah penjara bagi orang beriman dan surga bagi orang kafir.',
  'The world is a prison for the believer and a paradise for the disbeliever.',
  'Abu Hurairah', 'shahih', 'HR. Muslim no. 2956');
