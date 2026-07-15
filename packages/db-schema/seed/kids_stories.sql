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

-- "Sabar Membawa Berkah" ("Patience Brings Blessings") — second Kisah Anak
-- story, girl variant: Zahra learns to wait her turn instead of snatching the
-- shared bicycle from her little brother, and finds the waiting itself
-- becomes a source of goodness. Ends with the authentic hadith on patience
-- (Sahih al-Bukhari & Muslim): "No one is given a gift better and more
-- comprehensive than patience."

INSERT OR IGNORE INTO kids_story (slug, title_id, title_en, summary_id, summary_en, cover_variant, status, sort_order)
VALUES (
  'sabar-membawa-berkah',
  'Sabar Membawa Berkah',
  'Patience Brings Blessings',
  'Kisah Zahra yang belajar menahan diri untuk menunggu giliran, dan menemukan bahwa kesabaran membawa kebahagiaan yang tak terduga.',
  'The story of Zahra, who learns to hold herself back and wait her turn, and discovers that patience brings unexpected happiness.',
  'girl',
  'published',
  2
);

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 1, 'day', 'girl', 'wave',
  'Namanya Zahra. Ia anak perempuan yang riang, dan setiap sore ia paling suka bermain sepeda kecil berwarna merah muda di halaman rumahnya bersama adiknya, Umar.',
  'Her name was Zahra. She was a cheerful girl, and every afternoon her favorite thing was riding her little pink bicycle in the yard with her younger brother, Umar.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 2, 'day', 'girl', 'point',
  'Sore itu Zahra sudah tidak sabar ingin bersepeda. Tetapi ternyata Umar sedang mengendarainya lebih dulu, berputar-putar dengan gembira di sekeliling halaman.',
  'That afternoon Zahra could hardly wait to ride. But it turned out Umar had gotten to the bicycle first, happily riding circles around the yard.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 3, 'day', 'girl', 'think',
  '"Itu kan sepedaku juga!" gerutu Zahra dalam hati. Ia hampir saja berlari dan menarik sepeda itu dari tangan Umar. Wajahnya cemberut, dan tangannya sudah terkepal.',
  '"That is my bicycle too!" Zahra grumbled inside. She almost ran over and pulled the bicycle right out of Umar''s hands. Her face scrunched into a frown, her hands balling into fists.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 4, 'day', 'girl', 'think',
  'Namun tiba-tiba Zahra teringat kata-kata ibunya, "Orang yang sabar itu dicintai Allah, Nak. Menunggu giliran dengan hati lapang jauh lebih indah daripada merebut dengan marah." Zahra menarik napas dalam-dalam.',
  'But suddenly Zahra remembered her mother''s words: "A patient person is loved by Allah, my dear. Waiting your turn with an open heart is far more beautiful than grabbing with anger." Zahra took a deep breath.',
  8500
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 5, 'day', 'girl', 'walk',
  'Zahra pun memutuskan untuk tidak marah. Ia berjalan menghampiri ibunya yang sedang menyiram bunga-bunga di taman, dan menawarkan diri untuk membantu sambil menunggu gilirannya.',
  'Zahra decided not to be angry. She walked over to her mother, who was watering the flowers in the garden, and offered to help while she waited for her turn.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 6, 'day', 'girl', 'idle',
  'Sambil menyiram bunga bersama, Zahra dan ibunya bercerita dan tertawa kecil. Tanpa disadari, hati Zahra menjadi tenang, dan rasa kesalnya perlahan menghilang begitu saja.',
  'While watering the flowers together, Zahra and her mother chatted and laughed softly. Without realizing it, Zahra''s heart grew calm, and her frustration quietly melted away.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 7, 'day', 'girl', 'wave',
  'Tak lama kemudian, Umar berhenti bersepeda dan menghampiri Zahra. "Kak Zahra, ayo giliranmu sekarang! Maaf aku lama sekali tadi," katanya sambil tersenyum malu.',
  'Not long after, Umar stopped riding and came over to Zahra. "Zahra, it''s your turn now! Sorry I took so long," he said with a shy smile.',
  7500
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 8, 'day', 'girl', 'walk',
  'Zahra pun bersepeda dengan riang, berputar-putar mengelilingi halaman. Anehnya, rasanya jauh lebih menyenangkan daripada biasanya, karena ia menunggu dengan hati yang sabar.',
  'Zahra rode joyfully, circling around the yard. Strangely, it felt far more delightful than usual, because she had waited with a patient heart.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 9, 'night', 'girl', 'idle',
  'Malam harinya, Zahra bercerita kepada ibunya tentang perasaannya sore itu. "Ternyata menunggu itu tidak seburuk yang kukira, Bu. Malah aku jadi senang bisa membantu Ibu," katanya.',
  'That night, Zahra told her mother about how she had felt that afternoon. "Waiting wasn''t as bad as I thought, Mother. I even enjoyed being able to help you," she said.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 10, 'night', 'girl', 'point',
  'Ibunya tersenyum lembut dan berkata, "Rasulullah ﷺ bersabda, ''Tidaklah seseorang diberi suatu pemberian yang lebih baik dan lebih luas daripada kesabaran.'' (HR. Bukhari & Muslim). Kesabaranmu sore ini adalah pemberian yang sangat berharga, Nak."',
  'Her mother smiled gently and said, "The Prophet ﷺ said: ''No one is given a gift better and more comprehensive than patience.'' (Bukhari & Muslim). The patience you showed this afternoon was a precious gift, my dear."',
  9500
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 11, 'night', 'girl', 'hug',
  'Ibunya memeluk Zahra erat-erat, bangga dengan kesabaran putrinya. Zahra pun tertidur malam itu dengan hati yang tenang dan penuh syukur.',
  'Her mother hugged Zahra tightly, proud of her daughter''s patience. Zahra fell asleep that night with a calm and grateful heart.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 12, 'night', 'girl', 'wave',
  'Sejak saat itu, Zahra selalu berusaha bersabar menunggu gilirannya, dan hatinya selalu terasa lebih ringan. Selamat tinggal dulu, teman-teman! Sampai jumpa di kisah berikutnya.',
  'From that day on, Zahra always tried to patiently wait her turn, and her heart always felt lighter for it. Goodbye for now, friends! See you in the next story.',
  8000
FROM kids_story WHERE slug = 'sabar-membawa-berkah';

-- "Berbagi Itu Indah" ("Sharing Is Beautiful") — third Kisah Anak story, boy
-- variant: Faiz shares his lunch with a hungry classmate and discovers the
-- meal somehow feels like more than enough for both of them. Ends with the
-- authentic hadith on sharing food (Sahih al-Bukhari & Muslim): "The food of
-- two is sufficient for three, and the food of three is sufficient for four."

INSERT OR IGNORE INTO kids_story (slug, title_id, title_en, summary_id, summary_en, cover_variant, status, sort_order)
VALUES (
  'berbagi-itu-indah',
  'Berbagi Itu Indah',
  'Sharing Is Beautiful',
  'Kisah Faiz yang berbagi bekalnya dengan teman yang kelaparan, dan belajar bahwa berbagi membuat rezeki terasa lebih berkah.',
  'The story of Faiz, who shares his lunch with a hungry friend, and learns that sharing makes a blessing feel even more abundant.',
  'boy',
  'published',
  3
);

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 1, 'day', 'boy', 'wave',
  'Namanya Faiz. Setiap pagi, ibunya menyiapkan bekal nasi dan lauk kesukaannya untuk dibawa ke sekolah. Faiz selalu menyantap bekalnya dengan gembira saat jam istirahat tiba.',
  'His name was Faiz. Every morning, his mother packed rice and his favorite side dish for him to bring to school. Faiz always enjoyed his lunch happily when recess arrived.',
  8000
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 2, 'day', 'boy', 'walk',
  'Suatu hari saat istirahat, Faiz berjalan menuju bangku favoritnya di bawah pohon. Di sana ia melihat Yusuf, teman sekelasnya, duduk sendirian tanpa membawa bekal apa pun.',
  'One day during recess, Faiz walked to his favorite bench under the tree. There he saw Yusuf, his classmate, sitting alone without any lunch of his own.',
  8000
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 3, 'day', 'boy', 'think',
  'Wajah Yusuf terlihat murung, dan perutnya terdengar berbunyi pelan menahan lapar. Faiz memperhatikan dari kejauhan, hatinya merasa iba melihat temannya seperti itu.',
  'Yusuf''s face looked downcast, and his stomach quietly grumbled with hunger. Faiz watched from a distance, his heart feeling sorry for his friend.',
  8000
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 4, 'day', 'boy', 'point',
  '"Tapi bekalku kan cuma cukup untukku sendiri," pikir Faiz sambil melihat kotak bekalnya. Ia ragu sejenak, lalu teringat nasihat gurunya di kelas mengaji minggu lalu.',
  '"But my lunch is only enough for me," Faiz thought, looking at his lunch box. He hesitated for a moment, then remembered his teacher''s advice from Qur''an class the week before.',
  8000
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 5, 'day', 'boy', 'think',
  'Gurunya pernah berkata, "Berbagi tidak akan mengurangi rezeki kita, justru Allah akan melipatgandakannya dengan cara yang tidak kita sangka." Faiz pun tersenyum dan bangkit dari duduknya.',
  'His teacher had once said, "Sharing never truly reduces our provision — Allah multiplies it in ways we cannot expect." Faiz smiled and rose from his seat.',
  8500
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 6, 'day', 'boy', 'walk',
  'Faiz membawa kotak bekalnya dan berjalan menghampiri Yusuf yang duduk sendirian. Ia duduk di samping Yusuf sambil membuka kotak bekalnya perlahan.',
  'Faiz carried his lunch box and walked over to where Yusuf sat alone. He sat down beside Yusuf and slowly opened his lunch box.',
  7500
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 7, 'day', 'boy', 'point',
  '"Yusuf, ayo makan bersamaku. Bekal ini cukup untuk berdua," kata Faiz sambil menyodorkan sebagian nasi dan lauknya. Yusuf menatapnya dengan mata berbinar, tak menyangka akan ditawari makan.',
  '"Yusuf, let''s eat together. This lunch is enough for both of us," Faiz said, offering him a portion of the rice and side dish. Yusuf looked at him with shining eyes, not expecting to be offered a meal.',
  8500
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 8, 'day', 'boy', 'hug',
  '"Terima kasih banyak, Faiz. Kau memang teman yang baik," kata Yusuf sambil memeluknya erat. Mereka berdua pun makan bersama dengan penuh kegembiraan di bawah pohon yang teduh.',
  '"Thank you so much, Faiz. You really are a good friend," Yusuf said, hugging him tightly. The two of them ate together joyfully under the shady tree.',
  8000
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 9, 'day', 'boy', 'idle',
  'Anehnya, meski bekal itu dibagi dua, perut Faiz tetap terasa kenyang, bahkan lebih puas dari biasanya. Ia tersenyum, merasakan sendiri keberkahan yang pernah diceritakan gurunya.',
  'Strangely, even though the lunch was split in two, Faiz still felt full — even more satisfied than usual. He smiled, feeling for himself the blessing his teacher had once spoken of.',
  8500
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 10, 'night', 'boy', 'think',
  'Malam itu di rumah, Faiz menceritakan kejadian tersebut kepada ayahnya. "Ayah, tadi bekalku kubagi dua, tapi rasanya seperti tetap penuh. Kenapa bisa begitu, Yah?" tanya Faiz penasaran.',
  'That night at home, Faiz told his father about what had happened. "Father, I shared my lunch with a friend today, but it still felt like plenty. Why is that, Father?" Faiz asked, curious.',
  8500
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 11, 'night', 'boy', 'point',
  'Ayahnya tersenyum dan menjawab, "Rasulullah ﷺ bersabda, ''Makanan untuk dua orang cukup untuk tiga orang, dan makanan untuk tiga orang cukup untuk empat orang.'' (HR. Bukhari & Muslim). Itulah berkah dari berbagi, Nak."',
  'His father smiled and answered, "The Prophet ﷺ said: ''The food of two is sufficient for three, and the food of three is sufficient for four.'' (Bukhari & Muslim). That is the blessing of sharing, my son."',
  9500
FROM kids_story WHERE slug = 'berbagi-itu-indah';

INSERT OR IGNORE INTO kids_story_scene (story_id, scene_order, time_of_day, character_variant, character_action, caption_id, caption_en, duration_ms)
SELECT id, 12, 'night', 'boy', 'wave',
  'Sejak hari itu, Faiz selalu senang berbagi bekalnya dengan teman-teman yang membutuhkan. Selamat tinggal dulu, teman-teman! Sampai jumpa di kisah berikutnya.',
  'From that day on, Faiz always loved sharing his lunch with friends in need. Goodbye for now, friends! See you in the next story.',
  8000
FROM kids_story WHERE slug = 'berbagi-itu-indah';
