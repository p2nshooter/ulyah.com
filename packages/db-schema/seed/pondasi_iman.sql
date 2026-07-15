-- Fills the previously-empty "Pondasi Iman" category with the six pillars
-- of faith (Rukun Iman) — foundational aqidah content agreed upon across
-- the entire Muslim world, grounded directly in the Qur'an. Same pattern as
-- kisah_sahabat.sql: no PDF assets yet (pdf_ebook_id left NULL), audio/text
-- reading works regardless.
--
-- The "Pondasi Iman" category itself was auto-created by the AI content
-- engine at some point (not part of the static migrations), so its exact
-- slug on the live database is unknown here. Every category_id lookup below
-- therefore matches by NORMALIZED NAME (case/punctuation-insensitive), not
-- by slug — and the leading INSERT only creates a fresh category row if no
-- such name exists yet at all, so this can never recreate the duplicate-
-- category bug fixed in migration 0025.

INSERT INTO categories (name, slug, auto_created)
SELECT 'Pondasi Iman', 'pondasi-iman', 0
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman'
);

-- ══ Episode 1: Iman kepada Allah ═════════════════════════════════════════

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Rukun Iman 1: Iman kepada Allah', 'pondasi-iman-01-iman-kepada-allah', 'id', 'pondasi-iman-rukun', 1,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'Rukun iman yang pertama dan paling mendasar adalah meyakini keesaan Allah — bahwa hanya Dia satu-satunya yang berhak disembah, tanpa sekutu dalam rububiyah-Nya (sebagai Pencipta dan Pemelihara alam), uluhiyah-Nya (sebagai satu-satunya yang berhak diibadahi), maupun asma dan sifat-Nya (nama-nama dan sifat-sifat-Nya yang sempurna). Allah berfirman, "Katakanlah: Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu pun yang setara dengan Dia." (QS. Al-Ikhlas: 1-4)

Tauhid bukan sekadar pengakuan lisan, melainkan keyakinan yang meresap dalam hati dan tercermin dalam setiap tindakan: seorang yang bertauhid tidak menggantungkan harapan, rasa takut, maupun ibadahnya kepada selain Allah — baik itu berhala, kekuatan gaib, harta, jabatan, atau makhluk apa pun.

Hikmah: Meyakini keesaan Allah membebaskan hati manusia dari perbudakan kepada sesama makhluk. Seorang mukmin yang bertauhid dengan benar akan menjalani hidup dengan ketenangan, karena ia hanya bergantung kepada Dzat yang Maha Kuasa atas segala sesuatu, bukan kepada sesuatu yang terbatas dan fana.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 112 AND number = 1), datetime('now');

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Pillar of Faith 1: Belief in Allah', 'pondasi-iman-01-iman-kepada-allah', 'en', 'pondasi-iman-rukun', 1,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'The first and most fundamental pillar of faith is affirming the oneness of Allah — that He alone deserves worship, without partner in His rububiyyah (as Creator and Sustainer of all things), His uluhiyyah (as the only one deserving worship), or His names and attributes, all of which are perfect. Allah says: "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent." (QS. Al-Ikhlas 112:1-4)

Tawhid is not merely a verbal declaration but a conviction that permeates the heart and shows in every action: a person who truly holds tawhid does not place their hope, fear, or worship in anything other than Allah — not idols, not supernatural powers, not wealth, not status, nor any created being.

Reflection: Believing in Allah''s oneness frees the human heart from servitude to fellow creation. A believer with correct tawhid lives with tranquility, because they depend only on the One who has power over all things, not on something limited and temporary.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 112 AND number = 1), datetime('now');

-- ══ Episode 2: Iman kepada Malaikat ══════════════════════════════════════

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Rukun Iman 2: Iman kepada Malaikat', 'pondasi-iman-02-iman-kepada-malaikat', 'id', 'pondasi-iman-rukun', 2,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'Rukun iman kedua adalah meyakini keberadaan para malaikat — makhluk gaib yang diciptakan Allah dari cahaya, senantiasa taat sempurna kepada-Nya tanpa pernah membangkang. Allah berfirman, "Rasul telah beriman kepada apa yang diturunkan kepadanya dari Tuhannya, demikian pula orang-orang yang beriman. Semuanya beriman kepada Allah, malaikat-malaikat-Nya, kitab-kitab-Nya, dan rasul-rasul-Nya." (QS. Al-Baqarah: 285)

Di antara malaikat yang disebutkan namanya dalam Al-Qur''an dan hadits adalah Jibril (penyampai wahyu), Mikail (pengatur rezeki dan hujan), Israfil (peniup sangkakala), serta malaikat pencatat amal yang senantiasa menyertai setiap manusia siang dan malam.

Hikmah: Mengimani malaikat menumbuhkan rasa muraqabah — kesadaran bahwa setiap perbuatan, sekecil apa pun, senantiasa diawasi dan dicatat. Kesadaran ini mendorong seorang mukmin untuk senantiasa menjaga adab, baik dalam kesendirian maupun keramaian, karena tidak ada satu momen pun yang luput dari pengawasan Allah melalui para malaikat-Nya.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 2 AND number = 285), datetime('now');

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Pillar of Faith 2: Belief in the Angels', 'pondasi-iman-02-iman-kepada-malaikat', 'en', 'pondasi-iman-rukun', 2,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'The second pillar of faith is believing in the existence of the angels — unseen beings created by Allah from light, perfectly obedient to Him and never disobedient. Allah says: "The Messenger has believed in what was revealed to him from his Lord, and so have the believers. All of them have believed in Allah, His angels, His books, and His messengers." (QS. Al-Baqarah 2:285)

Among the angels named in the Qur''an and hadith are Gabriel (the bearer of revelation), Michael (in charge of provision and rain), Israfil (who will blow the trumpet), and the recording angels who accompany every human being day and night.

Reflection: Believing in the angels cultivates muraqabah — the awareness that every action, however small, is constantly observed and recorded. This awareness leads a believer to maintain good conduct both in private and in public, for no moment ever escapes Allah''s watch through His angels.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 2 AND number = 285), datetime('now');

-- ══ Episode 3: Iman kepada Kitab-kitab Allah ═════════════════════════════

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Rukun Iman 3: Iman kepada Kitab-kitab Allah', 'pondasi-iman-03-iman-kepada-kitab', 'id', 'pondasi-iman-rukun', 3,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'Rukun iman ketiga adalah meyakini bahwa Allah telah menurunkan kitab-kitab suci kepada para rasul-Nya sebagai petunjuk bagi umat manusia, di antaranya Taurat kepada Nabi Musa, Zabur kepada Nabi Daud, Injil kepada Nabi Isa, dan Al-Qur''an kepada Nabi Muhammad ﷺ sebagai penyempurna dan penjaga kemurnian ajaran-ajaran sebelumnya. Allah berfirman, "Sesungguhnya Kami telah menurunkan Kitab (Al-Qur''an) kepadamu dengan membawa kebenaran, membenarkan kitab-kitab sebelumnya, dan menjadi batu ujian (penguji kebenaran) bagi kitab-kitab yang lain itu." (QS. Al-Ma''idah: 48)

Berbeda dengan kitab-kitab sebelumnya yang telah mengalami perubahan seiring waktu, Al-Qur''an dijaga langsung oleh Allah dari segala bentuk penyimpangan, sebagaimana firman-Nya, "Sesungguhnya Kami-lah yang menurunkan Al-Qur''an, dan sesungguhnya Kami benar-benar akan menjaganya." (QS. Al-Hijr: 9)

Hikmah: Mengimani kitab-kitab Allah mengajarkan bahwa petunjuk-Nya bersifat berkesinambungan sepanjang sejarah manusia, dan Al-Qur''an adalah nikmat besar karena keasliannya terjaga sempurna hingga kini — menjadi pedoman hidup yang tidak akan pernah lekang oleh perubahan zaman.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 15 AND number = 9), datetime('now');

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Pillar of Faith 3: Belief in the Revealed Books', 'pondasi-iman-03-iman-kepada-kitab', 'en', 'pondasi-iman-rukun', 3,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'The third pillar of faith is believing that Allah sent down scriptures to His messengers as guidance for humanity, among them the Torah to Moses, the Psalms to David, the Gospel to Jesus, and the Qur''an to Muhammad ﷺ as the final one, confirming and safeguarding the purity of what came before. Allah says: "And We have revealed to you the Book in truth, confirming what preceded it of the Scripture and as a criterion over it." (QS. Al-Ma''idah 5:48)

Unlike the earlier scriptures, which underwent alteration over time, the Qur''an is directly preserved by Allah from any distortion, as He says: "Indeed, it is We who sent down the Qur''an, and indeed, We will be its guardian." (QS. Al-Hijr 15:9)

Reflection: Believing in Allah''s revealed books teaches that His guidance has been continuous throughout human history, and the Qur''an is an immense blessing because its authenticity remains perfectly preserved to this day — a life guide that will never be worn away by the passage of time.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 15 AND number = 9), datetime('now');

-- ══ Episode 4: Iman kepada Rasul-rasul ═══════════════════════════════════

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Rukun Iman 4: Iman kepada Para Rasul', 'pondasi-iman-04-iman-kepada-rasul', 'id', 'pondasi-iman-rukun', 4,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'Rukun iman keempat adalah meyakini bahwa Allah mengutus para rasul kepada setiap umat sepanjang sejarah untuk membimbing manusia kepada tauhid dan jalan yang lurus, tanpa membeda-bedakan di antara mereka dalam hal keimanan kepada risalah masing-masing. Allah berfirman, "Sesungguhnya Kami telah mengutus rasul-rasul Kami dengan membawa bukti-bukti yang nyata, dan Kami turunkan bersama mereka Al-Kitab dan neraca (keadilan) agar manusia dapat melaksanakan keadilan." (QS. Al-Hadid: 25)

Muhammad ﷺ adalah penutup para rasul (khatamun nabiyyin), diutus untuk seluruh umat manusia hingga akhir zaman, membawa risalah yang menyempurnakan seluruh ajaran para nabi sebelumnya.

Hikmah: Mengimani seluruh rasul tanpa membeda-bedakan mengajarkan bahwa misi mereka satu: menyerukan tauhid dan akhlak mulia. Ini juga menanamkan rasa hormat terhadap seluruh sejarah kenabian sebagai satu rangkaian bimbingan Allah yang berkesinambungan bagi umat manusia.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  NULL, datetime('now');

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Pillar of Faith 4: Belief in the Messengers', 'pondasi-iman-04-iman-kepada-rasul', 'en', 'pondasi-iman-rukun', 4,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'The fourth pillar of faith is believing that Allah sent messengers to every nation throughout history to guide humanity toward tawhid and the straight path, without distinguishing between them in believing in each one''s mission. Allah says: "We have already sent Our messengers with clear evidences and sent down with them the Scripture and the balance that the people may maintain justice." (QS. Al-Hadid 57:25)

Muhammad ﷺ is the seal of the messengers (khatam an-nabiyyin), sent to all of humanity until the end of time, bringing a message that perfects the teachings of every prophet before him.

Reflection: Believing in all the messengers without distinction teaches that their mission was one: calling to tawhid and noble character. It also instils respect for the entire history of prophethood as one continuous chain of Allah''s guidance for humankind.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  NULL, datetime('now');

-- ══ Episode 5: Iman kepada Hari Akhir ════════════════════════════════════

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Rukun Iman 5: Iman kepada Hari Akhir', 'pondasi-iman-05-iman-kepada-hari-akhir', 'id', 'pondasi-iman-rukun', 5,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'Rukun iman kelima adalah meyakini akan datangnya Hari Kiamat, hari kebangkitan seluruh manusia untuk mempertanggungjawabkan setiap perbuatan mereka di dunia. Allah berfirman, "Maka barang siapa mengerjakan kebaikan seberat dzarrah pun, niscaya dia akan melihat (balasan)nya. Dan barang siapa mengerjakan kejahatan seberat dzarrah pun, niscaya dia akan melihat (balasan)nya pula." (QS. Az-Zalzalah: 7-8)

Keyakinan ini mencakup pula pertanyaan di alam kubur, timbangan amal (mizan), jembatan (shirat), serta balasan akhir berupa surga bagi yang beriman dan beramal saleh atau neraka bagi yang mengingkari.

Hikmah: Mengimani Hari Akhir menjadi pengingat bahwa kehidupan dunia bersifat sementara dan setiap perbuatan memiliki konsekuensi kekal. Kesadaran ini mendorong seseorang untuk senantiasa introspeksi diri dan berhati-hati dalam setiap tindakan, karena tidak ada satu kebaikan maupun keburukan pun yang akan luput dari perhitungan Allah.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 99 AND number = 7), datetime('now');

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Pillar of Faith 5: Belief in the Last Day', 'pondasi-iman-05-iman-kepada-hari-akhir', 'en', 'pondasi-iman-rukun', 5,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'The fifth pillar of faith is believing in the coming of the Day of Judgment, the day all humanity will be resurrected to answer for every deed done in this world. Allah says: "So whoever does an atom''s weight of good will see it, and whoever does an atom''s weight of evil will see it." (QS. Az-Zalzalah 99:7-8)

This belief also encompasses the questioning in the grave, the scale of deeds (mizan), the bridge (sirat), and the final recompense — Paradise for those who believed and did righteous deeds, or the Fire for those who denied.

Reflection: Believing in the Last Day serves as a reminder that worldly life is temporary and every deed carries an eternal consequence. This awareness leads a person to constant self-reflection and caution in every action, since no good or evil, however small, will ever escape Allah''s reckoning.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 99 AND number = 7), datetime('now');

-- ══ Episode 6: Iman kepada Qada dan Qadar ════════════════════════════════

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Rukun Iman 6: Iman kepada Qada dan Qadar', 'pondasi-iman-06-iman-kepada-qada-qadar', 'id', 'pondasi-iman-rukun', 6,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'Rukun iman keenam adalah meyakini qada dan qadar — ketetapan Allah, baik maupun buruk menurut pandangan manusia, sepenuhnya berada dalam ilmu dan kehendak-Nya. Allah berfirman, "Sesungguhnya Kami menciptakan segala sesuatu menurut ukuran (takdir)." (QS. Al-Qamar: 49)

Keyakinan ini bukan berarti manusia pasrah tanpa usaha; sebaliknya, Islam mengajarkan agar manusia berikhtiar sungguh-sungguh, sembari menyerahkan hasil akhirnya kepada Allah. Rasulullah ﷺ bersabda, "Bersemangatlah untuk meraih apa yang bermanfaat bagimu, mintalah pertolongan kepada Allah, dan janganlah engkau merasa lemah (putus asa)." (HR. Muslim)

Hikmah: Mengimani takdir dengan benar melahirkan ketenangan jiwa — seseorang tidak akan larut dalam kesombongan saat meraih keberhasilan, maupun berputus asa saat menghadapi kegagalan, karena semuanya telah tertulis dalam ilmu Allah yang Maha Bijaksana. Keyakinan ini justru menjadi pendorong untuk terus berikhtiar dengan sebaik-baiknya.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 54 AND number = 49), datetime('now');

INSERT INTO stories (title, slug, lang, series_key, episode_number, category_id, body, ai_generated, qc_status, source_format, status, confidence_score, related_ayah_id, published_at)
SELECT 'Pillar of Faith 6: Belief in Divine Decree (Qadar)', 'pondasi-iman-06-iman-kepada-qada-qadar', 'en', 'pondasi-iman-rukun', 6,
  (SELECT id FROM categories WHERE replace(replace(replace(lower(name), '''', ''), '-', ''), ' ', '') = 'pondasiiman' LIMIT 1),
  'The sixth pillar of faith is believing in qada and qadar — that Allah''s decree, whether it appears good or bad from a human perspective, rests entirely within His knowledge and will. Allah says: "Indeed, all things We created with predestination." (QS. Al-Qamar 54:49)

This belief does not mean a person should surrender without effort; on the contrary, Islam teaches that one must strive earnestly while leaving the outcome to Allah. The Prophet ﷺ said, "Be eager for what benefits you, seek help from Allah, and do not be overcome by helplessness." (Sahih Muslim)

Reflection: Correctly believing in divine decree brings peace of mind — a person will not be swept into arrogance upon success, nor fall into despair upon failure, since everything is already written within the knowledge of the All-Wise. This belief, rather, becomes the very drive to keep striving to the very best of one''s ability.', 0, 'qc_pending', 'ai_original', 'published', 1.0,
  (SELECT id FROM ayah WHERE surah_id = 54 AND number = 49), datetime('now');
