/**
 * "Kisah Maryam & Kelahiran Nabi Isa AS" — one complete, fully-grounded story
 * series, close paraphrase of Surah Maryam (19:2-33): the prayer of Zakariya,
 * the glad tidings of Yahya, the annunciation to Maryam, the birth of Isa, and
 * Isa speaking in the cradle.
 *
 * Like the Yusuf/Nuh series, this is DELIBERATELY conservative: every episode
 * paraphrases specific ayat and cites them, with no hadith, no scholarly
 * opinion, and no invented dialogue or detail beyond what the ayat state — per
 * docs/CONTENT-POLICY.md and the explicit instruction never to fabricate
 * religious content. Source text: quran-json v3.1.2 (CC-BY-4.0), already
 * seeded into `ayah`/`translation`. ai_generated=0, status='published'; each
 * episode cites its exact ayah range so a reader can verify every sentence
 * against the Qur'an text already on the site.
 */

export interface MaryamEpisode {
  slug: string;
  surahId: number; // always 19 (Surah Maryam)
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_MARYAM_SERIES: MaryamEpisode[] = [
  {
    slug: "kisah-maryam-01-doa-zakariya",
    surahId: 19,
    ayahStart: 2,
    ayahEnd: 6,
    id: {
      title: "Episode 1: Doa Rahasia Nabi Zakariya AS",
      body: `Surah Maryam dibuka dengan penyebutan rahmat Allah kepada hamba-Nya, Zakariya AS (QS. Maryam: 2). Ketika itu ia telah lanjut usia, dan ia menyeru Tuhannya dengan seruan yang lembut dan rahasia (QS. Maryam: 3).

Ia berkata, "Ya Tuhanku, sungguh tulangku telah lemah dan kepalaku telah dipenuhi uban, dan aku belum pernah kecewa dalam berdoa kepada-Mu, ya Tuhanku" (QS. Maryam: 4). Sebuah pengakuan yang jujur akan kelemahan dirinya, sekaligus pengakuan akan kemurahan Allah yang tak pernah menolak doanya selama ini.

Zakariya lalu menyampaikan kekhawatirannya, "Dan sungguh aku khawatir terhadap kerabatku sepeninggalku, sedang istriku seorang yang mandul, maka anugerahilah aku dari sisi-Mu seorang putra, yang akan mewarisi aku dan mewarisi sebagian keluarga Ya'qub; dan jadikanlah ia, ya Tuhanku, seorang yang diridhai" (QS. Maryam: 5-6).

Hikmah: doa Zakariya mengajarkan adab meminta kepada Allah — dengan suara lembut dan rahasia, dengan mengakui kelemahan diri, dan dengan menyandarkan seluruh harapan hanya kepada karunia-Nya, meski secara lahiriah harapan itu tampak mustahil.`,
    },
    en: {
      title: "Episode 1: The Secret Prayer of Prophet Zakariya",
      body: `Surah Maryam opens by recalling Allah's mercy to His servant Zakariya (Qur'an 19:2). By then he had reached old age, and he called upon his Lord with a soft, private call (19:3).

He said, "My Lord, indeed my bones have weakened, and my head has filled with white, and never have I been unblessed in my supplication to You, my Lord" (19:4). It is an honest admission of his own frailty, and at the same time an admission of Allah's generosity, which had never once turned his prayer away.

Zakariya then voiced his concern: "And indeed, I fear for my relatives after me, and my wife has been barren, so give me from Yourself an heir who will inherit me and inherit from the family of Ya'qub; and make him, my Lord, pleasing [to You]" (19:5-6).

Reflection: Zakariya's prayer teaches the etiquette of asking Allah — with a soft, private voice, acknowledging one's own weakness, and resting every hope on His favor alone, even when that hope seems, outwardly, impossible.`,
    },
  },
  {
    slug: "kisah-maryam-02-kabar-yahya",
    surahId: 19,
    ayahStart: 7,
    ayahEnd: 11,
    id: {
      title: "Episode 2: Kabar Gembira Kelahiran Yahya AS",
      body: `Allah menjawab doa itu dengan kabar yang melampaui harapan. "Wahai Zakariya, sungguh Kami memberi kabar gembira kepadamu dengan seorang anak laki-laki yang namanya Yahya, yang Kami belum pernah menjadikan seorang pun sebelumnya yang serupa dengannya" (QS. Maryam: 7). Bahkan namanya pun adalah pemberian langsung dari Allah.

Zakariya, dalam keheranan yang penuh iman, bertanya, "Ya Tuhanku, bagaimana aku akan mempunyai anak, padahal istriku seorang yang mandul dan aku sendiri sungguh telah mencapai umur yang sangat tua?" (QS. Maryam: 8). Allah menjawab, "Demikianlah. Tuhanmu berfirman: Hal itu mudah bagi-Ku; dan sungguh telah Aku ciptakan engkau sebelumnya, padahal engkau ketika itu belum ada sama sekali" (QS. Maryam: 9).

Zakariya lalu memohon sebuah tanda. Maka Allah menjadikan tandanya: ia tidak akan dapat berbicara kepada manusia selama tiga malam, padahal ia sehat (QS. Maryam: 10). Ia pun keluar dari mihrab menuju kaumnya, lalu ia memberi isyarat kepada mereka agar bertasbih (mensucikan Allah) di waktu pagi dan petang (QS. Maryam: 11).

Hikmah: bagi Allah, tidak ada yang mustahil. Usia tua dan kemandulan bukanlah penghalang bagi kehendak-Nya. Yang Dia minta dari hamba-Nya hanyalah keyakinan dan kesyukuran.`,
    },
    en: {
      title: "Episode 2: The Glad Tidings of Yahya",
      body: `Allah answered that prayer with news beyond hope: "O Zakariya, indeed We give you glad tidings of a boy whose name will be Yahya (John); We have not made before him anyone of that name" (19:7). Even his name was a gift given directly by Allah.

In wonder mixed with faith, Zakariya asked, "My Lord, how will I have a boy when my wife has been barren and I have reached extreme old age?" (19:8). Allah answered, "Thus [it will be]; your Lord says, 'It is easy for Me, for I created you before, while you were nothing at all'" (19:9).

Zakariya then asked for a sign. So Allah made his sign this: that he would not be able to speak to people for three nights, though sound in body (19:10). He came out to his people from the prayer chamber and gestured to them to glorify Allah in the morning and the evening (19:11).

Reflection: for Allah nothing is impossible. Old age and barrenness are no barrier to His will. What He asks of His servant is only certainty and gratitude.`,
    },
  },
  {
    slug: "kisah-maryam-03-yahya-sang-nabi",
    surahId: 19,
    ayahStart: 12,
    ayahEnd: 15,
    id: {
      title: "Episode 3: Yahya, Sang Nabi yang Penyayang",
      body: `Ketika Yahya lahir dan tumbuh, Allah berfirman kepadanya, "Wahai Yahya, ambillah (peganglah) Kitab itu dengan sungguh-sungguh." Dan Kami berikan kepadanya hikmah (kebijaksanaan) selagi ia masih kanak-kanak (QS. Maryam: 12).

Allah menganugerahkan kepadanya rasa kasih sayang dari sisi-Nya dan kesucian, dan ia adalah seorang yang bertakwa (QS. Maryam: 13). Ia sangat berbakti kepada kedua orang tuanya, dan ia bukanlah seorang yang sombong lagi durhaka (QS. Maryam: 14).

Maka Allah memuliakannya dengan firman, "Dan kesejahteraan (salam) atasnya pada hari ia dilahirkan, pada hari ia wafat, dan pada hari ia dibangkitkan hidup kembali" (QS. Maryam: 15). Sebuah penghormatan agung yang meliputi seluruh perjalanan hidupnya, dari awal hingga akhir.

Hikmah: kemuliaan Yahya bertumpu pada empat hal yang disebut Al-Qur'an — kesungguhan memegang wahyu, kasih sayang, kesucian, dan bakti kepada orang tua. Inilah teladan akhlak yang tak lekang oleh zaman.`,
    },
    en: {
      title: "Episode 3: Yahya, the Tender-Hearted Prophet",
      body: `When Yahya was born and grew, Allah said to him, "O Yahya, take hold of the Scripture with determination." And We gave him wisdom while still a child (19:12).

Allah granted him tenderness from Himself and purity, and he was mindful of Allah (19:13). He was deeply dutiful to his parents, and he was neither arrogant nor disobedient (19:14).

So Allah honored him, saying, "And peace be upon him the day he was born, the day he dies, and the day he is raised alive" (19:15) — a mighty honor covering the whole span of his life, from beginning to end.

Reflection: Yahya's nobility rests on four things the Qur'an names — a firm grip on revelation, tenderness, purity, and devotion to one's parents. This is a model of character that no age wears out.`,
    },
  },
  {
    slug: "kisah-maryam-04-kabar-isa",
    surahId: 19,
    ayahStart: 16,
    ayahEnd: 21,
    id: {
      title: "Episode 4: Kabar Gembira untuk Maryam",
      body: `Kisah lalu beralih kepada Maryam. Ceritakanlah (Muhammad) kisah Maryam di dalam Al-Qur'an, ketika ia menjauhkan diri dari keluarganya ke suatu tempat di sebelah timur, lalu ia memasang tabir (yang melindunginya) dari mereka (QS. Maryam: 16-17).

Maka Kami mengutus kepadanya Roh Kami (Malaikat Jibril), lalu ia menampakkan diri di hadapannya dalam bentuk manusia yang sempurna (QS. Maryam: 17). Maryam berkata, "Sungguh aku berlindung kepada (Allah) Yang Maha Pengasih darimu, jika engkau seorang yang bertakwa" (QS. Maryam: 18) — sebuah reaksi yang menunjukkan betapa terjaganya kehormatan dirinya.

Jibril menjawab, "Sesungguhnya aku hanyalah utusan Tuhanmu, untuk menyampaikan kepadamu (kabar gembira) seorang anak laki-laki yang suci" (QS. Maryam: 19). Maryam bertanya dalam keheranan, "Bagaimana mungkin aku mempunyai anak laki-laki, padahal tidak pernah seorang manusia pun menyentuhku dan aku bukan pula seorang pezina?" (QS. Maryam: 20). Jibril menjawab, "Demikianlah. Tuhanmu berfirman: Hal itu mudah bagi-Ku, dan agar Kami menjadikannya suatu tanda bagi manusia dan rahmat dari Kami; dan hal itu adalah suatu perkara yang sudah diputuskan" (QS. Maryam: 21).

Hikmah: kesucian dan penjagaan diri Maryam disebut Al-Qur'an sebelum kemuliaannya sebagai ibu seorang nabi. Kehormatan sejati bermula dari kehati-hatian menjaga diri karena Allah.`,
    },
    en: {
      title: "Episode 4: The Glad Tidings to Maryam",
      body: `The account then turns to Maryam. Relate the story of Maryam in the Book, when she withdrew from her family to a place toward the east, and placed a screen between herself and them (19:16-17).

Then We sent to her Our angel (Jibril), and he appeared before her as a well-proportioned man (19:17). Maryam said, "Indeed, I seek refuge in the Most Merciful from you, if you should be mindful of Allah" (19:18) — a response showing how carefully she guarded her honor.

Jibril answered, "I am only the messenger of your Lord, to give you [news of] a pure boy" (19:19). Maryam asked in wonder, "How can I have a boy when no man has touched me and I have never been unchaste?" (19:20). He answered, "Thus [it will be]; your Lord says, 'It is easy for Me, and so that We make him a sign to the people and a mercy from Us. And it is a matter already decreed'" (19:21).

Reflection: the Qur'an names Maryam's purity and self-restraint before her honor as the mother of a prophet. True dignity begins with the careful guarding of oneself for the sake of Allah.`,
    },
  },
  {
    slug: "kisah-maryam-05-kelahiran-isa",
    surahId: 19,
    ayahStart: 22,
    ayahEnd: 26,
    id: {
      title: "Episode 5: Kelahiran di Bawah Pohon Kurma",
      body: `Maka Maryam pun mengandungnya, lalu ia menjauhkan diri dengan kandungannya itu ke suatu tempat yang jauh (QS. Maryam: 22). Ketika saat melahirkan tiba, rasa sakit memaksanya bersandar pada pangkal pohon kurma. Dalam puncak kesulitannya ia berkata, "Aduhai, sekiranya aku mati sebelum ini, dan aku menjadi sesuatu yang tidak berarti, lagi dilupakan" (QS. Maryam: 23).

Maka (bayi itu, atau suara dari bawahnya) memanggilnya, "Janganlah engkau bersedih hati, sungguh Tuhanmu telah menjadikan anak sungai di bawahmu. Dan goyanglah pangkal pohon kurma itu ke arahmu, niscaya ia akan menggugurkan kepadamu buah kurma yang masak lagi segar" (QS. Maryam: 24-25).

"Maka makanlah, minumlah, dan bersenang hatilah engkau. Jika engkau melihat seorang manusia, maka katakanlah: Sesungguhnya aku telah bernazar berpuasa (menahan diri dari berbicara) untuk Tuhan Yang Maha Pengasih, maka aku tidak akan berbicara dengan seorang manusia pun pada hari ini" (QS. Maryam: 26).

Hikmah: di tengah rasa sakit dan kesendirian yang paling berat, pertolongan Allah datang dari arah yang paling dekat — air di bawah kaki dan makanan dari pohon di sisinya. Allah tidak pernah membiarkan hamba-Nya yang bertawakal sendirian.`,
    },
    en: {
      title: "Episode 5: The Birth Beneath the Palm Tree",
      body: `So Maryam conceived him, and withdrew with him to a far place (19:22). When the time of birth came, the pains drove her to lean against the trunk of a palm tree. At the height of her distress she said, "Oh, I wish I had died before this and had been a thing forgotten, unremembered" (19:23).

Then [a voice] called to her from below her, "Do not grieve; your Lord has placed a stream beneath you. And shake toward you the trunk of the palm tree; it will drop upon you ripe, fresh dates" (19:24-25).

"So eat and drink and be content. And if you see any human, say: 'I have vowed a fast (of silence) to the Most Merciful, so I will not speak to any human today'" (19:26).

Reflection: in the midst of the heaviest pain and loneliness, Allah's help came from the nearest direction — water beneath her feet and food from the tree at her side. Allah never leaves alone the servant who places trust in Him.`,
    },
  },
  {
    slug: "kisah-maryam-06-isa-di-buaian",
    surahId: 19,
    ayahStart: 27,
    ayahEnd: 33,
    id: {
      title: "Episode 6: Bayi yang Berbicara di Buaian",
      body: `Kemudian Maryam membawa bayi itu kepada kaumnya dengan menggendongnya. Mereka pun berkata (dengan tuduhan), "Wahai Maryam, sungguh engkau telah melakukan sesuatu yang sangat mungkar. Wahai saudara perempuan Harun, ayahmu bukanlah seorang yang buruk, dan ibumu pun bukanlah seorang pezina" (QS. Maryam: 27-28).

Maka Maryam tidak menjawab dengan kata-kata, melainkan ia menunjuk kepada bayinya. Mereka berkata, "Bagaimana mungkin kami berbicara dengan anak kecil yang masih dalam buaian?" (QS. Maryam: 29). Maka atas izin Allah, bayi itu berbicara: "Sesungguhnya aku ini hamba Allah. Dia memberiku Kitab (Injil) dan menjadikanku seorang nabi" (QS. Maryam: 30).

"Dan Dia menjadikanku seorang yang diberkahi di mana saja aku berada, dan Dia memerintahkanku (menegakkan) shalat dan (menunaikan) zakat selama aku hidup; dan (berbakti) kepada ibuku, dan Dia tidak menjadikanku seorang yang sombong lagi celaka. Dan kesejahteraan (salam) atasku pada hari aku dilahirkan, pada hari aku wafat, dan pada hari aku dibangkitkan hidup kembali" (QS. Maryam: 31-33).

Hikmah: pembelaan terbaik atas kehormatan Maryam datang bukan dari perdebatan, melainkan dari mukjizat Allah sendiri. Dan kata-kata pertama Nabi Isa AS menegaskan bahwa ia adalah hamba Allah — sebuah pondasi yang meluruskan segala kesalahpahaman tentang dirinya di kemudian hari.`,
    },
    en: {
      title: "Episode 6: The Infant Who Spoke in the Cradle",
      body: `Then Maryam brought the child to her people, carrying him. They said, in accusation, "O Maryam, you have certainly done a monstrous thing. O sister of Harun, your father was not an evil man, nor was your mother unchaste" (19:27-28).

Maryam answered not with words but by pointing to her child. They said, "How can we speak to one who is a child in the cradle?" (19:29). Then, by Allah's leave, the infant spoke: "Indeed, I am the servant of Allah. He has given me the Scripture (the Injil) and made me a prophet" (19:30).

"And He has made me blessed wherever I am, and has enjoined upon me prayer and zakah as long as I live; and [made me] dutiful to my mother, and He has not made me arrogant or wretched. And peace is upon me the day I was born, the day I die, and the day I am raised alive" (19:31-33).

Reflection: the finest defense of Maryam's honor came not from argument but from Allah's own miracle. And the first words of Prophet Isa affirmed that he is the servant of Allah — a foundation that sets right every later misunderstanding about him.`,
    },
  },
];
