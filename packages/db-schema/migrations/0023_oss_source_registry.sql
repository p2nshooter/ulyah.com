-- Open-Source Source Registry — one big DB of every GitHub repo from the
-- ULYAH_Open_Source_Reference txt files (Rev 3-6 + FINAL). The Knowledge
-- Worker iterates this over time; each row is marked absorbed/partial/
-- pending/skip so nothing is lost and nothing is mass-cloned blindly
-- (CONTENT-POLICY: 'jangan asal parse', 'kemiripan 100% jangan diserap').
CREATE TABLE IF NOT EXISTS oss_source (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  repo_url TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Fawaz Quran API','https://github.com/fawazahmed0/quran-api','api','partial','API 400+ terjemahan; paket data awal sudah dipakai');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran API by Gading','https://github.com/gadingnst/quran-api','api','pending','tafsir ID + audio Alafasy');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','QuranJSON Semarketir','https://github.com/semarketir/quranjson','data','pending','6236 ayat JSON');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran JSON Rio Astamal','https://github.com/rioastamal/quran-json','data','pending','terjemah+tafsir ID');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Al-Quran ID API','https://github.com/bachors/Al-Quran-ID-API','api','pending','audio per surah');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Data','https://github.com/rn0x/Quran-Data','data','pending','JSON/CSV/SQLite');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Companion','https://github.com/0xzer0x/quran-companion','reference','pending','desktop reader');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','QuranJSON Pengguna','https://github.com/penggguna/QuranJSON','data','pending','terjemah+tafsir+audio');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran API ID','https://github.com/renomureza/quran-api-id','api','pending','3 tafsir Kemenag/Shihab/Jalalain');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quranic Audio DL','https://github.com/fathyar/quranicaudio-dl','reference','pending','downloader murottal');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Android','https://github.com/quran/quran_android','reference','pending','arsitektur reader matang');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Flutter Tajweed','https://github.com/rovshan-b/Quran-flutter-tajweed','data','pending','data pewarnaan tajwid');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Al Quran V3','https://github.com/IsmailHosenIsmailJames/al_quran_v3','reference','pending','data & UI');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Islami App','https://github.com/wahyu9kdl/islami','data','absorbed','Aqidatul Awam terverifikasi bersih diserap');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Global Quran mobile','https://github.com/GlobalQuran/mobile-app','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Global Quran site','https://github.com/GlobalQuran/site','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Web','https://github.com/rioastamal/quran-web','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Web Quran Indonesia','https://github.com/FigoArbiansyah/web_quran','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Islamic Radio API','https://github.com/uthumany/islamic-radio-api','api','pending','URL live stream radio');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Holy Quran Radio Desktop','https://github.com/AbdelrahmanBayoumi/holy-quran-radio-desktop','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','QuranBot','https://github.com/mgv-hub/quranbot','reference','pending','bot Discord');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Tajweed App AI','https://github.com/ISSAAM11/tajweed-app','reference','pending','AI pronunciation (riset)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Pronunciation LS','https://github.com/mostafa-adel/quran-pronunciation-learning-system','reference','pending','speech-recognition tajwid');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Shafeea Platform','https://github.com/Emran025/shafeea-platform','reference','pending','tracking tahfizh');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Tikrar','https://github.com/SalafyDeveloper/tikrar','reference','pending','hafalan metode tikrar');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran.com Frontend Next','https://github.com/quran/quran.com-frontend-next','ui','pending','referensi UI/UX web Qur''an');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran.com Audio','https://github.com/quran/audio.quran.com','reference','pending','player murottal multi-qori');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran MCP Server','https://github.com/quran/quran-mcp','api','pending','MCP resmi untuk AI agent');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Foundation JS SDK','https://github.com/quran/api-js','api','pending','@quranjs/api');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Al-Qur''an','Quran Analysis Graph','https://github.com/nabeeel/quran-graph','dataset','pending','graph relasi ayat');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Fawaz Hadith API','https://github.com/fawazahmed0/hadith-api','api','absorbed','9 kitab + Arbain + Qudsi + Ahmad + Darimi diserap');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Dorar Hadith API','https://github.com/AhmedElTabarani/dorar-hadith-api','api','pending','PENTING: satu-satunya sumber grade+rawi terisi (untuk taksonomi & sanad)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Reminder Quran+Hadith+Asmaul','https://github.com/asim/reminder','api','pending','+99 Asmaul Husna');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Hadis API Indonesia','https://github.com/renomureza/hadis-api-id','api','pending','9 perawi ID');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','IslamHouse API Hub','https://github.com/IslamHouse-API/multilingual-quran-hadith-islamic-content-database-api-hub','api','pending','cek 100% kemiripan dulu');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Hadits Database','https://github.com/irsyadulibad/hadits-database','data','partial','Riyadhus Shalihin 371 diserap');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Hadits API azharimm','https://github.com/azharimm/hadits-api','api','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Hadits API superXdev','https://github.com/superXdev/hadits-api','api','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Hadith API gadingnst','https://github.com/gadingnst/hadith-api','api','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Hadith Islamware','https://github.com/ceefour/hadith-islamware','data','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Hadits','Open Hadith Data','https://github.com/mhashim6/Open-Hadith-Data','data','pending','dataset hadits terbuka');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Tafsir','Tafsir API','https://github.com/spa5k/tafsir_api','api','absorbed','118 edisi diserap + source picker');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Tafsir','Asbabun Nuzul Dataset','https://github.com/mostafaahmed97/asbab-al-nuzul-dataset','dataset','absorbed','diserap');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Tafsir','Uloom Quran','https://github.com/h9-tec/uloom-quran','data','pending','ilmu Qur''an dasar (kandidat Kids)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Maktabah','https://github.com/bismillah-100/Maktabah','data','pending','koleksi kitab');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Shamela Books DL','https://github.com/ihfazhillah/shamelaws_books_download','reference','pending','format tiap kitab beda; verifikasi manual');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Shamela (ragaeeb)','https://github.com/ragaeeb/shamela','api','pending','butuh request API key');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Shamela EPUB Exporter','https://github.com/yshalsager/shamela-epub-exporter','reference','pending','pengganti aktif shamela2epub');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Thawab','https://github.com/ojuba-org/thawab','reference','pending','engine ensiklopedia .bok');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Thawab Lite','https://github.com/ojuba-org/thawab-lite','reference','pending','baca .bok tanpa index berat');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','ElKirtasse','https://github.com/khallebal/elkirtasse','reference','pending','reader kitab C++/Qt');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','ElKirtasse Qt6','https://github.com/abdulbadii/elkirtasse-on-Qt6-Cmake','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Shamela Crawler','https://github.com/Arabicsource/shamela_crawler','reference','pending','crawler Scrapy');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Raazi BOK Extractor','https://github.com/shaybix/Raazi','reference','pending','ekstrak .bok');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Maktabah/Kitab','Shamela Library Android','https://github.com/MahmoudRH/Shamela-Library','reference','pending','5000+ buku Arab');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Kisah','Quran Stories','https://github.com/maulanashalihin/quran-stories','data','skip','kerangka interpretatif satu penulis; butuh tinjauan');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Kisah','Kisah 25 Nabi','https://github.com/AzharRivaldi/Kisah-25-Nabi','data','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Kisah','Islamic Story Android','https://github.com/elthobhy-studio/islamic-story-android','data','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Kisah','Islamic Prophets Stories','https://github.com/Saimon8420/islamic-prophets-stories','data','pending','rujukan Ibnu Katsir+hadits');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Kisah','Complete Islamic History Timeline','https://github.com/abdullah-R197/Complete-Islamic-History-Timeline','data','pending','kandidat Tarikh Islam 570-1924M');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','Awesome Islamic Apps','https://github.com/tarekeldeeb/awesome-islamic-open-source-apps','reference','pending','peta discovery');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','Awesome Islam','https://github.com/AhmedKamal/awesome-Islam','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','Islamic APIs','https://github.com/alihmada/Islamic-APIs','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','Awesome Muslims','https://github.com/choubari/Awesome-Muslims','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','Islamic Open Source Projects','https://github.com/faisal00813/IslamicOpenSourceProjects','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','Sirat-E-Mustaqeem','https://github.com/muhammadtalhasultan/Sirat-E-Mustaqeem','reference','pending','all-in-one');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','Falah','https://github.com/abdessamadbettal/Falah','reference','pending','zakat/waris/kiblat client-side');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','islam.js','https://github.com/dev-ahmadbilal/islam.js','data','pending','Qur''an+28 tafsir+azkar package');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Aplikasi Islam','IslamBot','https://github.com/galacticwarrior9/IslamBot','reference','pending','bot Discord');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Prayer Times Android','https://github.com/metinkale38/prayer-times-android','widget','partial','referensi metode waktu sholat/kiblat');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','StPageFlip','https://github.com/Nodlik/StPageFlip','widget','pending','flipbook web (Kitab Digital)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','React PageFlip','https://github.com/Nodlik/react-pageflip','widget','pending','flipbook 3D Next.js');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Page Flip Builder','https://github.com/bizz84/page_flip_builder','widget','pending','animasi Flutter');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Turnable Page','https://github.com/saeedahmed725/turnable_page','widget','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','BookBlock','https://github.com/codrops/BookBlock','widget','pending','transisi lipat halaman');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','3D Book Showcase','https://github.com/bennygenel/3D-Book-Showcase','widget','pending','rak buku 3D CSS');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Flutter Flip Card','https://github.com/cre-some/flutter_flip_card','widget','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','turn.js','https://github.com/blasten/turn.js','widget','pending','flipbook ringan legacy');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','canvas-flipbook','https://github.com/stanko/canvas-flipbook','widget','pending','flipbook Canvas mobile');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Flutter Airbnb UI','https://github.com/Roaa94/flutter_airbnb_ui','ui','pending','referensi UI halus');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','FolioReader Android','https://github.com/FolioReader/FolioReader-Android','widget','pending','reader EPUB');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','epub_viewer Flutter','https://github.com/JideGuru/epub_viewer','widget','pending','render EPUB');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','pdfrx Flutter','https://github.com/espresso3389/pdfrx','widget','pending','render PDF kitab kuning');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','HomeWidget Flutter','https://github.com/ABausG/home_widget','widget','pending','widget home screen');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','React Prayer Times','https://github.com/shofwanhidayat/react-prayer-times','widget','pending','widget web waktu sholat');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Tailwind RTL','https://github.com/20lives/tailwindcss-rtl','ui','pending','layout RTL Arab');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Islamic Dashboard UI','https://github.com/zainzafar90/islamic-dashboard','ui','pending','template admin');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Widget/UI','Vue Hijri DatePicker','https://github.com/clarkmcc/vue-hijri-datepicker','widget','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Azan MCP','https://github.com/ahmedeltaher/azan-mcp','api','pending','MCP waktu sholat untuk AI');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Al-Azan','https://github.com/meypod/al-azan','reference','pending','adhan+kiblat privacy');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Prayer Times macOS','https://github.com/tareq1988/prayer-times-macos','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Flutter Qiblah','https://github.com/medyas/flutter_qiblah','widget','partial','referensi kompas sensor (diterapkan di /kiblat)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Compass Qibla','https://github.com/derysudrajat/compass-qibla','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Qibla Compass','https://github.com/farsitel/android_packages_apps_QiblaCompass','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','HijriDate','https://github.com/dralshehri/hijridate','reference','pending','konversi Umm al-Qura');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Hijri.js','https://github.com/xsoh/Hijri.js','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Hijra','https://github.com/ojuba-org/hijra','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','SholatKu','https://github.com/Pujagaul6/sholatku-app','reference','pending','+masjid finder+tasbih');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','Masjid Finder','https://github.com/the-razib/mosque_finder','reference','pending','Google Places');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Sholat/Kiblat/Kalender','GEMA Haji/Umrah','https://github.com/TomoNx/GEMA','reference','pending','audio tour QR');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Doa/Dzikir','Adhkar-Duaa Multilingual','https://github.com/Kind-Unes/Adhkar-Duaa-Multilingual-Database','data','pending','doa/dzikir multi-bahasa');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Doa/Dzikir','Prayer Pal Tasbih Azkar','https://github.com/Ionic-Errrrs-Code/prayer-pal-tasbih-and-azkar','reference','pending','+Asmaul Husna');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Doa/Dzikir','Quran_Sunna','https://github.com/SiteQ8/Quran_Sunna','reference','pending','16 kategori azkar+ruqyah');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Doa/Dzikir','Asmaul Husna JSON','https://github.com/Sidd42144/Asmaul-Husna','data','pending','99 nama JSON siap pakai');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Zakat/Waris/Keuangan','Zakalc','https://github.com/lionbytes/zakalc','reference','absorbed','referensi arsitektur kalkulator zakat');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Zakat/Waris/Keuangan','Kira Faraid Malaysia','https://github.com/ahmadafif5321/kirafaraid','reference','pending','peta waris dwibahasa');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Zakat/Waris/Keuangan','Kira Faraid Web','https://github.com/rizauddin/kira-faraid','reference','absorbed','referensi kalkulator waris (fardhu/asobah/aul/radd)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Zakat/Waris/Keuangan','Halal Stock Scanner','https://github.com/hadi4172/halal-stock-scanner','reference','skip','prioritas rendah');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Zakat/Waris/Keuangan','Islamic Wealth Google Sheet','https://github.com/IslamicWealthManagement/Googlesheet','reference','skip','prioritas rendah');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Zakat/Waris/Keuangan','SadaqahKiosk','https://github.com/HiIAmMoot/SadaqahKiosk','reference','skip','kios donasi');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Zakat/Waris/Keuangan','Sadaqah Charity Mgmt','https://github.com/aadeelyounas/sadaqah','reference','skip','manajemen donasi');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Bahasa Arab','Quranic Arabic Corpus','https://github.com/kaisdukes/quranic-corpus','dataset','pending','morfologi tiap kata');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Bahasa Arab','Alfanous','https://github.com/Alfanous-team/alfanous','reference','pending','mesin pencari Arab Qur''an');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Bahasa Arab','QuranTree.jl','https://github.com/alstat/QuranTree.jl','reference','pending','');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Bahasa Arab','Kamus Arab-Indonesia','https://github.com/oong26/arabic_dictionary_model','data','pending','sumber Al-Munawwir (fitur Kamus)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Dataset/AI','QURAN-NLP','https://github.com/islamAndAi/QURAN-NLP','dataset','pending','dataset NLP Qur''an/hadits');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Dataset/AI','Quran Dataset','https://github.com/ModMaamari/quran-dataset','dataset','pending','per-ayat audio+gambar');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Dataset/AI','Arabic Fiqh IR System','https://github.com/ayadalache/arabic-fiqh-ir-system','reference','pending','OCR->index->cari fikih');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Dataset/AI','Islamic Data Prep','https://github.com/islamic-ai/islamic-data-prep','reference','pending','prep dataset training');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Dataset/AI','Quran QA Dataset','https://github.com/quran-qa/quran-qa-2023','dataset','pending','training Q&A Qur''an');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Dataset/AI','Haystack RAG','https://github.com/deepset-ai/haystack','reference','pending','framework chat-dengan-PDF');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Web Pesantren','Web Pesantren Quran','https://github.com/zackymh/webpesantrenquran','reference','skip','manajemen pesantren, di luar misi');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Web Pesantren','Santri Verse','https://github.com/NavanKen/Santri-Verse','reference','skip','manajemen pesantren');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Web Pesantren','SantriQ','https://github.com/akusopo1945/santriq','reference','skip','LMS pesantren');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Font Arab','Amiri','https://github.com/alif-type/amiri','font','pending','Naskh kitab kuning');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Font Arab','Scheherazade New','https://github.com/silnrsi/font-scheherazade','font','pending','teks hadits/tafsir');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Font Arab','Uthman Taha Naskh','https://github.com/GueZou/Uthman-Taha-Font','font','pending','Mushaf Madinah');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Font Arab','Quran Fonts','https://github.com/khaledhosny/quran-fonts','font','pending','harakat bertumpuk');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Nasab/Silsilah','D3 Family Tree','https://github.com/D3-FamilyTree/d3-family-tree','widget','pending','bagan silsilah (Nasab Nabi)');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('Nasab/Silsilah','D3 Hierarchy','https://github.com/d3/d3-hierarchy','widget','pending','pohon sanad bercabang');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('AR/3D','Three.js Makkah 3D','https://github.com/shariq/makkah-3d','widget','pending','simulasi tawaf');
INSERT OR IGNORE INTO oss_source (category,name,repo_url,kind,status,note) VALUES ('AR/3D','AR.js','https://github.com/AR-js-org/AR.js','widget','pending','kartu AR edukasi');
