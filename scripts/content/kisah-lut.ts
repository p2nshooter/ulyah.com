/**
 * "Kisah Nabi Lut AS" — a complete, fully-grounded series on the prophet sent
 * to the people who invented a great immorality, drawn from Al-A'raf (7:80-84),
 * Hud (11:77-83), Asy-Syu'ara (26:160-175), An-Naml (27:54-58) and Al-Qamar
 * (54:33-39): Lut's warning against the transgression, his people's rejection
 * and threat to expel him, the coming of the angel-guests, the command to
 * depart by night, the overturning of the town and the rain of stones, and the
 * salvation of Lut and his family except his wife.
 *
 * Conservative like the other series: each episode paraphrases specific ayat
 * and cites them, with no hadith, no scholarly opinion, and no invented detail
 * beyond what the ayat state (docs/CONTENT-POLICY.md). ai_generated=0,
 * status='published'.
 */

export interface LutEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_LUT_SERIES: LutEpisode[] = [
  {
    slug: "kisah-lut-01-peringatan-terhadap-kemungkaran",
    surahId: 7,
    ayahStart: 80,
    ayahEnd: 81,
    id: {
      title: "Episode 1: Nabi Lut Memperingatkan Kaumnya",
      body: `Nabi Lut adalah kerabat Nabi Ibrahim yang diutus kepada penduduk sebuah negeri yang melakukan kemungkaran yang belum pernah dilakukan umat mana pun sebelum mereka. Allah berfirman, "Dan (Kami juga telah mengutus) Lut, ketika dia berkata kepada kaumnya, ‘Mengapa kamu melakukan perbuatan keji, yang belum pernah dilakukan oleh seorang pun sebelum kamu (di dunia ini)?’" (QS. Al-A'raf: 80).

Lut lalu menjelaskan dengan tegas bentuk penyimpangan mereka, "Sungguh, kamu telah melampiaskan syahwatmu kepada sesama laki-laki, bukan kepada perempuan. Kamu benar-benar kaum yang melampaui batas" (QS. Al-A'raf: 81).

Dalam Surah Asy-Syu'ara, Lut menyerukan takwa dengan lembut sebagaimana para nabi lain, "Maka bertakwalah kepada Allah dan taatlah kepadaku. Dan aku tidak meminta imbalan kepadamu atas ajakan itu; imbalanku hanyalah dari Tuhan seluruh alam" (QS. Asy-Syu'ara: 163-164).

Hikmah: seorang nabi tidak berdiam diri melihat kemungkaran yang merusak fitrah manusia. Ia memperingatkan dengan jelas, bukan karena benci kepada kaumnya, melainkan karena kasih sayang agar mereka selamat dari akibat perbuatan mereka sendiri.`,
    },
    en: {
      title: "Episode 1: Prophet Lut Warns His People",
      body: `Prophet Lut was a kinsman of Prophet Ibrahim, sent to the people of a town who committed an immorality no nation before them had ever done. Allah said, "And [We had sent] Lot, when he said to his people, 'Do you commit such immorality as no one has preceded you with from among the worlds?'" (Qur'an 7:80).

Lut then made plain the nature of their deviation, "Indeed, you approach men with desire, instead of women. Rather, you are a transgressing people" (7:81).

In Surah Asy-Syu'ara, Lut called them to God-consciousness gently, as the other prophets did, "So fear Allah and obey me. And I do not ask you for it any payment; my payment is only from the Lord of the worlds" (26:163-164).

Reflection: a prophet does not stay silent before an evil that corrupts the very nature of humankind. He warns clearly — not out of hatred for his people, but out of compassion, that they might be saved from the consequences of their own deeds.`,
    },
  },
  {
    slug: "kisah-lut-02-penolakan-dan-ancaman-pengusiran",
    surahId: 27,
    ayahStart: 54,
    ayahEnd: 56,
    id: {
      title: "Episode 2: Penolakan dan Ancaman Mengusir Lut",
      body: `Alih-alih sadar, kaum Lut menjawab peringatan dengan kesombongan dan ancaman. Allah berfirman, "Dan (ingatlah kisah) Lut, ketika dia berkata kepada kaumnya, ‘Mengapa kamu mengerjakan perbuatan keji, padahal kamu melihat (kekejiannya)? Mengapa kamu mendatangi laki-laki untuk (memenuhi) syahwat(mu), bukan (mendatangi) perempuan? Sungguh, kamu adalah kaum yang tidak mengetahui (akibat perbuatanmu)’" (QS. An-Naml: 54-55).

Jawaban mereka bukanlah tobat, melainkan keinginan mengusir orang-orang yang menjaga kesucian diri. "Maka jawaban kaumnya tidak lain hanya mengatakan, ‘Usirlah Lut beserta keluarganya dari negerimu; sesungguhnya mereka adalah orang-orang yang (menganggap dirinya) suci’" (QS. An-Naml: 56).

Hal yang sama disebutkan dalam Surah Al-A'raf, "Dan jawaban kaumnya tidak lain hanya berkata, ‘Usirlah mereka (Lut dan pengikutnya) dari negerimu ini; sesungguhnya mereka adalah orang yang menyucikan diri’" (QS. Al-A'raf: 82).

Hikmah: ketika hati telah rusak, kebaikan justru dianggap kesalahan dan kesucian dianggap aib. Mereka ingin mengusir orang-orang baik agar bebas dalam keburukan — sebuah tanda betapa jauh mereka telah tersesat.`,
    },
    en: {
      title: "Episode 2: Rejection and the Threat to Expel Lut",
      body: `Rather than come to their senses, the people of Lut answered the warning with arrogance and threats. Allah said, "And [mention] Lot, when he said to his people, 'Do you commit immorality while you are seeing? Do you indeed approach men with desire instead of women? Rather, you are a people behaving ignorantly'" (Qur'an 27:54-55).

Their answer was not repentance, but a desire to expel those who kept themselves pure. "But the answer of his people was not except that they said, 'Expel the family of Lot from your city. Indeed, they are people who keep themselves pure'" (27:56).

The same is mentioned in Surah Al-A'raf, "But the answer of his people was only that they said, 'Evict them from your city! Indeed, they are men who keep themselves pure'" (7:82).

Reflection: when the heart is corrupted, goodness itself is seen as a fault and purity as a disgrace. They wished to drive out the good people so they could be free in their evil — a sign of how far astray they had gone.`,
    },
  },
  {
    slug: "kisah-lut-03-kedatangan-para-tamu",
    surahId: 11,
    ayahStart: 77,
    ayahEnd: 79,
    id: {
      title: "Episode 3: Kedatangan Para Tamu dan Kegelisahan Lut",
      body: `Allah mengutus para malaikat dalam wujud tamu-tamu menuju negeri Lut, sesudah mereka menemui Ibrahim. Kedatangan mereka membuat Lut cemas, karena ia tahu keburukan kaumnya. Allah berfirman, "Dan ketika para utusan Kami (para malaikat) datang kepada Lut, dia merasa bersedih hati karena (kedatangan) mereka, dan merasa tidak mempunyai kekuatan untuk melindungi mereka, dan dia berkata, ‘Ini hari yang sangat sulit’" (QS. Hud: 77).

Benar saja, kaumnya berdatangan dengan tergesa-gesa hendak berbuat keji kepada para tamu itu. Lut berusaha melindungi tamunya dan menyeru mereka kepada jalan yang suci, "Dan kaumnya segera datang kepadanya. Dan sejak dahulu mereka selalu melakukan perbuatan keji. Lut berkata, ‘Wahai kaumku! Inilah putri-putri (negeri)ku, mereka lebih suci bagimu (jika menikah). Maka bertakwalah kepada Allah dan janganlah kamu mencemarkan (nama)ku terhadap tamuku ini. Tidak adakah di antaramu seorang yang berakal sehat?’" (QS. Hud: 78).

Namun mereka menolak nasihat itu dengan angkuh, dan Lut pun merasakan betapa berat bebannya, "Lut berkata, ‘Sekiranya aku mempunyai kekuatan (untuk menolakmu) atau aku dapat berlindung kepada keluarga yang kuat (tentu aku lakukan)’" (QS. Hud: 80).

Hikmah: seorang yang saleh merasakan beban berat ketika kemungkaran merajalela di sekitarnya. Kepedihan Lut menunjukkan hati yang hidup — hati yang tidak pernah terbiasa dengan dosa, meski hidup di tengah kaum yang tenggelam di dalamnya.`,
    },
    en: {
      title: "Episode 3: The Coming of the Guests and Lut's Distress",
      body: `Allah sent the angels in the form of guests toward the town of Lut, after they had visited Ibrahim. Their arrival made Lut anxious, for he knew the evil of his people. Allah said, "And when Our messengers, [the angels], came to Lot, he was anguished for them and felt for them great discomfort and said, 'This is a trying day'" (Qur'an 11:77).

Indeed, his people came hastening to him, intending evil against the guests. Lut tried to protect his guests and called them to a pure path, "And his people came hastening to him, and before this they had been doing evil deeds. He said, 'O my people, these are my daughters; they are purer for you (in marriage). So fear Allah and do not disgrace me concerning my guests. Is there not among you a man of reason?'" (11:78).

But they refused his counsel arrogantly, and Lut felt the weight of his burden, "He said, 'If only I had against you some power or could take refuge in a strong support'" (11:80).

Reflection: a righteous person feels a heavy burden when evil runs rampant around him. Lut's grief shows a living heart — one never comfortable with sin, though he lived amid a people drowning in it.`,
    },
  },
  {
    slug: "kisah-lut-04-malaikat-menyingkap-jati-diri",
    surahId: 11,
    ayahStart: 81,
    ayahEnd: 81,
    id: {
      title: "Episode 4: Para Malaikat Menyingkap Jati Diri",
      body: `Di saat Lut berada dalam puncak kegelisahan, para tamu itu menyingkap jati diri mereka yang sebenarnya. Mereka adalah malaikat yang diutus untuk menyelamatkan Lut dan menurunkan azab. Allah berfirman, "Mereka (para malaikat) berkata, ‘Wahai Lut! Sesungguhnya kami adalah para utusan Tuhanmu, mereka tidak akan dapat mengganggu kamu’" (QS. Hud: 81).

Para malaikat lalu memberi perintah agar Lut membawa keluarganya pergi pada malam hari, dengan satu pengecualian yang menyakitkan. "‘Maka pergilah bersama keluargamu pada akhir malam dan janganlah ada seorang pun di antara kamu yang menoleh ke belakang, kecuali istrimu. Sesungguhnya dia akan ditimpa (azab) yang menimpa mereka. Sesungguhnya saat terjadinya azab bagi mereka itu pada waktu subuh. Bukankah subuh itu sudah dekat?’" (QS. Hud: 81).

Dalam Surah Al-Qamar, Allah menyebutkan bahwa mata kaum itu dibutakan ketika mereka bersikeras mengganggu para tamu, "Dan sungguh, mereka telah membujuknya (agar menyerahkan) tamunya (kepada mereka), lalu Kami butakan mata mereka; maka rasakanlah azab-Ku dan peringatan-peringatan-Ku" (QS. Al-Qamar: 37).

Hikmah: pertolongan Allah datang tepat pada saat hamba-Nya merasa paling lemah. Lut yang tadinya berharap punya kekuatan untuk melindungi tamunya, ternyata tamu-tamu itulah yang datang untuk melindunginya — sebuah pengingat bahwa penolong sejati hanyalah Allah.`,
    },
    en: {
      title: "Episode 4: The Angels Reveal Themselves",
      body: `At the peak of Lut's distress, the guests revealed their true identity. They were angels sent to save Lut and to bring down the punishment. Allah said, "The angels said, 'O Lot, indeed we are messengers of your Lord; [the mob] will never reach you'" (Qur'an 11:81).

The angels then commanded Lut to take his family away by night, with one painful exception. "'So set out with your family during a portion of the night and let not any among you look back — except your wife; indeed, she will be struck by that which strikes them. Indeed, their appointment is [for] the morning. Is not the morning near?'" (11:81).

In Surah Al-Qamar, Allah mentions that the people's eyes were obliterated when they insisted on harming the guests, "And they had demanded from him his guests, but We obliterated their eyes, [saying], 'Taste My punishment and warning'" (54:37).

Reflection: Allah's help arrives at the very moment His servant feels weakest. Lut, who had wished for strength to protect his guests, found that it was those guests who had come to protect him — a reminder that the true Helper is Allah alone.`,
    },
  },
  {
    slug: "kisah-lut-05-negeri-yang-dijungkirbalikkan",
    surahId: 11,
    ayahStart: 82,
    ayahEnd: 83,
    id: {
      title: "Episode 5: Negeri yang Dijungkirbalikkan",
      body: `Ketika waktu subuh tiba, datanglah azab yang menghancurkan seluruh negeri itu dengan cara yang belum pernah terjadi. Allah berfirman, "Maka ketika keputusan Kami datang, Kami menjungkirbalikkannya (negeri kaum Lut), dan Kami hujani mereka dengan batu dari tanah yang terbakar secara bertubi-tubi, yang diberi tanda dari Tuhanmu. Dan siksaan itu tiadalah jauh dari orang yang zalim" (QS. Hud: 82-83).

Negeri yang tadinya berdiri kokoh dijungkirbalikkan — bagian atasnya menjadi bawah — lalu ditimpakan hujan batu. Dalam Surah Al-Qamar, Allah berfirman, "Sesungguhnya Kami kirimkan kepada mereka badai yang membawa batu-batu (yang menimpa mereka), kecuali keluarga Lut. Kami selamatkan mereka sebelum fajar menyingsing" (QS. Al-Qamar: 34).

Dalam Surah Al-A'raf, Allah menutup dengan pelajaran, "Dan Kami hujani mereka dengan hujan (batu). Maka perhatikanlah bagaimana kesudahan orang yang berbuat dosa itu" (QS. Al-A'raf: 84).

Hikmah: dosa yang dibiarkan tumbuh subur hingga menjadi kebanggaan sebuah kaum akan mengundang azab yang setimpal. Negeri kaum Lut menjadi bukti sejarah yang Allah tinggalkan sebagai peringatan bagi setiap generasi sesudahnya.`,
    },
    en: {
      title: "Episode 5: The Town Turned Upside Down",
      body: `When the dawn came, the punishment descended and destroyed the whole town in a way never seen before. Allah said, "So when Our command came, We made its highest part its lowest and rained upon them stones of layered hard clay, one after another, marked from your Lord. And it is not far from the wrongdoers" (Qur'an 11:82-83).

The town that had once stood firm was overturned — its top made its bottom — then pelted with a rain of stones. In Surah Al-Qamar, Allah said, "Indeed, We sent upon them a storm of stones, except the family of Lot — We saved them before dawn" (54:34).

In Surah Al-A'raf, Allah closes with a lesson, "And We rained upon them a rain [of stones]. Then see how was the end of the criminals" (7:84).

Reflection: a sin left to flourish until it becomes a people's pride invites a fitting punishment. The town of Lut's people became a historical proof that Allah left behind as a warning for every generation after them.`,
    },
  },
  {
    slug: "kisah-lut-06-keselamatan-lut-kecuali-istrinya",
    surahId: 27,
    ayahStart: 57,
    ayahEnd: 58,
    id: {
      title: "Episode 6: Keselamatan Lut kecuali Istrinya",
      body: `Di tengah kehancuran itu, Allah menyelamatkan Nabi Lut beserta keluarga yang beriman, kecuali istrinya yang berpihak kepada kaumnya. Allah berfirman, "Maka Kami selamatkan dia beserta keluarganya, kecuali istrinya. Kami telah menentukan dia termasuk orang-orang yang tertinggal (dibinasakan). Dan Kami hujani mereka dengan hujan (batu). Maka betapa buruk hujan yang menimpa orang-orang yang telah diberi peringatan itu" (QS. An-Naml: 57-58).

Istri Lut adalah pelajaran yang mendalam: kedekatan nasab dengan seorang nabi tidak menjamin keselamatan tanpa keimanan. Allah menjadikannya perumpamaan dalam Surah At-Tahrim, "Allah membuat istri Nuh dan istri Lut sebagai perumpamaan bagi orang-orang kafir. Keduanya berada di bawah pengawasan dua orang hamba yang saleh di antara hamba-hamba Kami, lalu keduanya berkhianat kepada kedua (suami)nya, maka kedua (suami)nya itu tidak dapat membela mereka sedikit pun dari (siksa) Allah" (QS. At-Tahrim: 10).

Dalam Surah Al-A'raf disebutkan, "Kemudian Kami selamatkan dia dan pengikut-pengikutnya, kecuali istrinya; dia termasuk orang-orang yang tertinggal" (QS. Al-A'raf: 83).

Hikmah: keselamatan di sisi Allah ditentukan oleh iman dan amal, bukan oleh hubungan darah atau pernikahan. Istri Lut binasa bukan karena ia bukan istri nabi, melainkan karena hatinya berpihak kepada keburukan kaumnya.`,
    },
    en: {
      title: "Episode 6: The Salvation of Lut Except His Wife",
      body: `Amid that destruction, Allah saved Prophet Lut and his believing family, except his wife who sided with his people. Allah said, "So We saved him and his family, except for his wife; We destined her to be of those who remained behind. And We rained upon them a rain [of stones]; and evil was the rain of those who were warned" (Qur'an 27:57-58).

Lut's wife is a profound lesson: closeness of kinship to a prophet does not guarantee salvation without faith. Allah made her a parable in Surah At-Tahrim, "Allah presents an example of those who disbelieved: the wife of Noah and the wife of Lot. They were under two of Our righteous servants but betrayed them, so those two availed them nothing against Allah" (66:10).

In Surah Al-A'raf it is mentioned, "So We saved him and his family, except for his wife; she was of those who remained behind" (7:83).

Reflection: salvation with Allah is determined by faith and deeds, not by ties of blood or marriage. Lut's wife perished not because she was not a prophet's wife, but because her heart sided with the evil of her people.`,
    },
  },
];
