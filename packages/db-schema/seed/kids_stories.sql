-- "Jujur Itu Hebat" ("Honesty is Wonderful") — the pilot Kisah Anak story: a
-- simple, warm, character-education tale (not a sirah reenactment — no
-- prophet or companion is depicted as a cartoon character, matching the
-- widely-held view among Muslims that visually depicting them is
-- inappropriate). 11 scenes of substantial narration for a genuine ~5-minute
-- read-aloud, ending with an authentic, well-known hadith on honesty
-- (Sahih al-Bukhari & Muslim: "Indeed, truthfulness leads to righteousness,
-- and righteousness leads to Paradise").

INSERT OR IGNORE INTO kids_story (slug, title_id, title_en, summary_id, summary_en, cover_variant, status, sort_order)
VALUES (
  'jujur-itu-hebat',
  'Jujur Itu Hebat',
  'Honesty is Wonderful',
  'Kisah Aiman yang menemukan dompet berisi uang dan belajar bahwa kejujuran membawa ketenangan hati.',
  'The story of Aiman, who finds a wallet full of money and learns that honesty brings peace of heart.',
  'boy',
  'published',
  1
);

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 1, 'day', 'boy', 'wave',
  'Namanya Aiman. Ia anak yang ceria dan suka bermain di taman dekat rumahnya setiap sore. Aiman selalu diajari oleh ibunya untuk berkata jujur, apa pun yang terjadi.',
  'His name was Aiman. He was a cheerful boy who loved playing in the park near his house every afternoon. Aiman''s mother always taught him to speak the truth, no matter what happened.',
  8000
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 2, 'day', 'boy', 'walk',
  'Suatu sore, saat berjalan pulang dari taman, Aiman melihat sesuatu berkilau di antara rerumputan. Ia mendekat dan mengambilnya. Ternyata itu adalah sebuah dompet kecil berwarna cokelat.',
  'One afternoon, walking home from the park, Aiman noticed something glinting among the grass. He walked over and picked it up. It turned out to be a small brown wallet.',
  8000
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 3, 'day', 'boy', 'think',
  'Aiman membuka dompet itu perlahan. Di dalamnya ada uang yang cukup banyak untuk membeli mainan yang selama ini ia inginkan. Hatinya berdebar. "Andai ini milikku," bisik hatinya pelan.',
  'Aiman opened the wallet slowly. Inside was enough money to buy the toy he had wanted for so long. His heart raced. "If only this were mine," his heart whispered.',
  8000
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 4, 'day', 'boy', 'think',
  'Namun Aiman teringat pesan ibunya: "Barang yang bukan milik kita, walau sekecil apa pun, harus dikembalikan kepada pemiliknya. Itulah tanda orang yang beriman." Aiman terdiam sejenak, memikirkannya dalam-dalam.',
  'But Aiman remembered his mother''s words: "Anything that isn''t ours, however small, must be returned to its owner. That is the sign of a person of faith." Aiman paused, thinking deeply.',
  8500
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 5, 'day', 'boy', 'walk',
  'Aiman melihat sebuah kartu kecil di dalam dompet itu, bertuliskan nama dan alamat pemiliknya. Ia pun memutuskan untuk mengantarkan dompet itu, meskipun rumah itu cukup jauh dari tempatnya berdiri.',
  'Aiman noticed a small card inside the wallet with the owner''s name and address written on it. He decided to deliver the wallet himself, even though the house was quite far from where he stood.',
  8000
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 6, 'day', 'boy', 'walk',
  'Sesampainya di sana, seorang nenek tua membuka pintu dengan wajah cemas. "Nak, apakah kau melihat dompetku? Di dalamnya ada uang untuk membeli obat," katanya dengan suara gemetar.',
  'When he arrived, an elderly grandmother opened the door with a worried face. "Child, have you seen my wallet? It has money in it to buy medicine," she said, her voice trembling.',
  8000
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 7, 'day', 'boy', 'point',
  '"Ini dompet Nenek. Saya menemukannya di taman," kata Aiman sambil menyerahkan dompet itu dengan kedua tangan. Nenek itu terkejut, lalu matanya berkaca-kaca karena haru.',
  '"This is your wallet, Grandmother. I found it at the park," Aiman said, handing it over with both hands. The grandmother was startled, and then her eyes filled with grateful tears.',
  7500
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 8, 'day', 'boy', 'hug',
  'Nenek itu memeluk Aiman erat-erat. "Terima kasih, Nak. Allah pasti akan membalas kebaikanmu berlipat-lipat," ucapnya sambil tersenyum bahagia. Aiman pun ikut tersenyum, hatinya terasa hangat.',
  'The grandmother hugged Aiman tightly. "Thank you, child. Allah will surely reward your kindness many times over," she said with a happy smile. Aiman smiled too, his heart feeling warm.',
  8000
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 9, 'night', 'boy', 'idle',
  'Malam itu, saat berbaring di tempat tidurnya, Aiman merasakan sesuatu yang indah di dalam hatinya. Bukan mainan baru yang membuatnya bahagia, melainkan rasa jujur yang telah ia jaga.',
  'That night, lying in his bed, Aiman felt something beautiful inside his heart. It wasn''t a new toy that made him happy, but the honesty he had held on to.',
  8000
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 10, 'night', 'boy', 'point',
  'Ia pun teringat sabda Rasulullah ﷺ, "Hendaklah kalian berlaku jujur, karena kejujuran itu menunjukkan kepada kebaikan, dan kebaikan itu menunjukkan kepada surga." (HR. Bukhari & Muslim). Aiman berjanji akan selalu jujur, di mana pun dan kapan pun.',
  'He remembered the words of the Prophet ﷺ: "Truthfulness leads to righteousness, and righteousness leads to Paradise." (Bukhari & Muslim). Aiman promised himself he would always be honest, wherever and whenever.',
  9500
FROM kids_story WHERE slug = 'jujur-itu-hebat';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 11, 'night', 'boy', 'wave',
  'Dan sejak hari itu, Aiman dikenal sebagai anak yang jujur dan dipercaya oleh semua orang. Selamat tinggal dulu, teman-teman! Sampai jumpa di kisah berikutnya.',
  'And from that day on, Aiman was known as an honest boy, trusted by everyone. Goodbye for now, friends! See you in the next story.',
  7500
FROM kids_story WHERE slug = 'jujur-itu-hebat';
