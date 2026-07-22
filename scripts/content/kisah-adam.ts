/**
 * "Kisah Nabi Adam AS" — a complete, fully-grounded story series drawn from
 * Al-Baqarah (2:30-39), Al-A'raf (7:11-27), Al-Hijr (15:26-43), Sad (38:71-85)
 * and Al-Ma'idah (5:27-31): the plan of a vicegerent on earth, the teaching of
 * the names, the command to prostrate and Iblis's arrogance, life in the Garden
 * and the temptation, the fall and Adam's repentance, the counsel to the
 * children of Adam, the creation from clay and the breathing of the spirit,
 * Iblis's sworn enmity, the two sons and the first murder, and the eternal
 * promise of guidance to Adam's descendants.
 *
 * Conservative like the other series: each episode paraphrases specific ayat
 * and cites them, with no hadith, no scholarly opinion, and no invented detail
 * beyond what the ayat state (docs/CONTENT-POLICY.md). Per-episode surahId.
 * Source: quran-json v3.1.2 (CC-BY-4.0). ai_generated=0, status='published'.
 */

export interface AdamEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_ADAM_SERIES: AdamEpisode[] = [
  {
    slug: "kisah-adam-01-khalifah-di-bumi",
    surahId: 2,
    ayahStart: 30,
    ayahEnd: 30,
    id: {
      title: "Episode 1: Rencana Khalifah di Bumi",
      body: `Kisah manusia bermula dari sebuah pengumuman agung. Allah berfirman kepada para malaikat, "Sesungguhnya Aku hendak menjadikan seorang khalifah (pengganti) di bumi" (QS. Al-Baqarah: 30).

Para malaikat, dengan penuh adab dan bukan penentangan, bertanya, "Apakah Engkau hendak menjadikan di bumi orang yang akan membuat kerusakan padanya dan menumpahkan darah, padahal kami senantiasa bertasbih memuji-Mu dan menyucikan nama-Mu?" (QS. Al-Baqarah: 30). Pertanyaan ini lahir dari keinginan memahami, bukan dari keberatan atas kehendak Allah.

Maka Allah menjawab dengan firman yang menutup segala perdebatan, "Sesungguhnya Aku mengetahui apa yang tidak kamu ketahui" (QS. Al-Baqarah: 30). Ada hikmah di balik penciptaan manusia yang tidak terjangkau oleh pengetahuan para malaikat sekalipun.

Hikmah: manusia diciptakan dengan sebuah tujuan mulia — menjadi khalifah, pengemban amanah di bumi. Dan ketika ilmu kita terbatas, sikap terbaik adalah tunduk kepada Yang Maha Mengetahui.`,
    },
    en: {
      title: "Episode 1: The Plan of a Vicegerent on Earth",
      body: `The story of humankind begins with a mighty announcement. Allah said to the angels, "Indeed, I will make upon the earth a vicegerent (a successor)" (Qur'an 2:30).

The angels, with full courtesy and not in objection, asked, "Will You place upon it one who will cause corruption there and shed blood, while we glorify You with praise and sanctify Your name?" (2:30). This question arose from a desire to understand, not from any protest against Allah's will.

So Allah answered with a word that closes all debate: "Indeed, I know what you do not know" (2:30). There is a wisdom behind the creation of humankind that lay beyond even the knowledge of the angels.

Reflection: the human being was created with a noble purpose — to be a vicegerent, a bearer of trust upon the earth. And when our knowledge is limited, the best posture is submission to the All-Knowing.`,
    },
  },
  {
    slug: "kisah-adam-02-ilmu-nama-nama",
    surahId: 2,
    ayahStart: 31,
    ayahEnd: 33,
    id: {
      title: "Episode 2: Adam dan Ilmu Nama-Nama",
      body: `Untuk menunjukkan keistimewaan makhluk baru ini, Allah mengajarkan kepada Adam nama-nama (benda) seluruhnya, kemudian Dia perlihatkan kepada para malaikat, seraya berfirman, "Sebutkanlah kepada-Ku nama-nama semua benda ini, jika kamu memang benar!" (QS. Al-Baqarah: 31).

Para malaikat menjawab dengan penuh kerendahan hati, "Mahasuci Engkau, tidak ada yang kami ketahui selain apa yang telah Engkau ajarkan kepada kami. Sungguh, Engkaulah Yang Maha Mengetahui lagi Mahabijaksana" (QS. Al-Baqarah: 32). Sebuah pengakuan yang jujur akan keterbatasan diri.

Allah lalu berfirman, "Wahai Adam, beritahukanlah kepada mereka nama-nama itu." Setelah Adam menyebutkan kepada mereka nama-nama itu, Allah berfirman, "Bukankah telah Aku katakan kepadamu, bahwa Aku mengetahui rahasia langit dan bumi, dan Aku mengetahui apa yang kamu nyatakan dan apa yang kamu sembunyikan?" (QS. Al-Baqarah: 33).

Hikmah: kemuliaan manusia terletak pada ilmu. Dengan ilmulah Adam mengungguli para malaikat pada momen itu — dan dengan ilmu pula manusia mampu memikul amanah sebagai khalifah.`,
    },
    en: {
      title: "Episode 2: Adam and the Knowledge of the Names",
      body: `To show the distinction of this new creation, Allah taught Adam the names of all things, then presented them to the angels, saying, "Inform Me of the names of these, if you are truthful" (2:31).

The angels answered with full humility, "Glory be to You; we have no knowledge except what You have taught us. Indeed, You are the All-Knowing, the All-Wise" (2:32) — an honest admission of their own limits.

Allah then said, "O Adam, inform them of their names." When Adam had informed them of the names, Allah said, "Did I not tell you that I know the unseen of the heavens and the earth, and I know what you reveal and what you conceal?" (2:33).

Reflection: the nobility of the human being lies in knowledge. It was through knowledge that Adam surpassed the angels at that moment — and through knowledge that humankind is able to carry the trust of vicegerency.`,
    },
  },
  {
    slug: "kisah-adam-03-sujud-dan-kesombongan-iblis",
    surahId: 7,
    ayahStart: 11,
    ayahEnd: 18,
    id: {
      title: "Episode 3: Perintah Sujud dan Kesombongan Iblis",
      body: `Allah berfirman, "Sungguh, Kami telah menciptakan kamu (Adam), kemudian membentuk rupamu, lalu Kami berfirman kepada para malaikat, ‘Bersujudlah kamu kepada Adam’; maka mereka pun bersujud, kecuali Iblis. Ia tidak termasuk mereka yang bersujud" (QS. Al-A'raf: 11).

Allah bertanya, "Apakah yang menghalangimu untuk bersujud ketika Aku menyuruhmu?" Iblis menjawab dengan sombong, "Aku lebih baik daripadanya. Engkau menciptakan aku dari api, sedangkan dia Engkau ciptakan dari tanah" (QS. Al-A'raf: 12). Inilah dosa pertama kesombongan: merasa lebih mulia dan menolak perintah Allah dengan logikanya sendiri.

Maka Allah berfirman, "Turunlah kamu dari surga itu, karena tidak pantas bagimu menyombongkan diri di dalamnya; keluarlah, sesungguhnya kamu termasuk makhluk yang hina" (QS. Al-A'raf: 13). Iblis pun meminta penangguhan hingga hari kebangkitan, dan ia bersumpah, "Karena Engkau telah menyesatkanku, sungguh aku akan menghalangi mereka dari jalan-Mu yang lurus, kemudian aku akan mendatangi mereka dari depan, dari belakang, dari kanan, dan dari kiri mereka" (QS. Al-A'raf: 16-17).

Hikmah: kesombongan adalah pintu pertama menuju kehancuran. Iblis tidak menjadi terkutuk karena kebodohan, melainkan karena keangkuhan yang menolak tunduk kepada perintah Allah.`,
    },
    en: {
      title: "Episode 3: The Command to Prostrate and Iblis's Arrogance",
      body: `Allah said, "We created you (Adam), then shaped you, then said to the angels, 'Prostrate to Adam'; so they prostrated, except Iblis. He was not among those who prostrated" (7:11).

Allah asked, "What prevented you from prostrating when I commanded you?" Iblis answered arrogantly, "I am better than him. You created me from fire and created him from clay" (7:12). This was the first sin of pride: to feel superior and reject Allah's command through one's own reasoning.

So Allah said, "Descend from it, for it is not for you to be arrogant here; get out, indeed you are of the debased" (7:13). Iblis asked for respite until the Day of Resurrection, and he swore, "Because You have sent me astray, I will surely sit in wait for them on Your straight path; then I will come to them from before them and behind them, and from their right and their left" (7:16-17).

Reflection: arrogance is the first doorway to ruin. Iblis was not cursed for ignorance, but for the pride that refused to submit to Allah's command.`,
    },
  },
  {
    slug: "kisah-adam-04-godaan-di-surga",
    surahId: 7,
    ayahStart: 19,
    ayahEnd: 22,
    id: {
      title: "Episode 4: Kehidupan di Surga dan Bisikan Godaan",
      body: `Allah berfirman, "Wahai Adam, tinggallah engkau dan istrimu di dalam surga, maka makanlah oleh kamu berdua (buah-buahan) di mana saja yang kamu sukai, tetapi janganlah kamu berdua mendekati pohon yang satu ini, nanti kamu berdua termasuk orang-orang yang zalim" (QS. Al-A'raf: 19). Satu larangan di tengah kelapangan yang tak terhingga.

Maka setan membisikkan pikiran jahat kepada keduanya untuk menampakkan apa yang selama ini tertutup dari mereka. Setan berkata, "Tuhanmu tidak melarangmu mendekati pohon ini, melainkan agar kamu berdua tidak menjadi malaikat atau tidak menjadi orang yang kekal (di surga)" (QS. Al-A'raf: 20). Dan ia bersumpah kepada keduanya, "Sesungguhnya aku ini benar-benar termasuk penasihat bagi kamu berdua" (QS. Al-A'raf: 21).

Dengan tipu daya itu, setan menjatuhkan keduanya. Ketika keduanya telah merasakan (buah) pohon itu, tampaklah bagi mereka aurat mereka, dan mulailah mereka menutupinya dengan dedaunan surga. Tuhan lalu menyeru mereka, "Bukankah Aku telah melarang kamu berdua dari pohon itu, dan Aku katakan bahwa setan itu adalah musuh yang nyata bagi kamu berdua?" (QS. Al-A'raf: 22).

Hikmah: setan selalu menyamar sebagai penasihat yang tulus, bahkan bersumpah atas nama kebaikan. Waspadalah — sering kali godaan datang dengan bungkus nasihat dan janji manis.`,
    },
    en: {
      title: "Episode 4: Life in the Garden and the Whisper of Temptation",
      body: `Allah said, "O Adam, dwell you and your wife in the Garden, and eat from wherever you wish, but do not approach this one tree, lest you be among the wrongdoers" (7:19). A single prohibition amid a boundless abundance.

Then Satan whispered to them, to expose what had been hidden from them. Satan said, "Your Lord forbade you this tree only so that you would not become angels or become of the immortals" (7:20). And he swore to them, "Indeed, I am to you a sincere adviser" (7:21).

By that deception, Satan brought them down. When they tasted the tree, their nakedness became apparent to them, and they began to cover themselves with the leaves of the Garden. Their Lord then called to them, "Did I not forbid you that tree and tell you that Satan is a clear enemy to you?" (7:22).

Reflection: Satan always disguises himself as a sincere adviser, even swearing in the name of good. Beware — temptation often arrives wrapped in counsel and sweet promises.`,
    },
  },
  {
    slug: "kisah-adam-05-tobat-adam",
    surahId: 7,
    ayahStart: 23,
    ayahEnd: 25,
    id: {
      title: "Episode 5: Tobat Adam dan Rahmat Allah",
      body: `Inilah yang membedakan Adam dari Iblis. Ketika Iblis membela kesalahannya dengan kesombongan, Adam dan istrinya justru mengakui kesalahan mereka dengan rendah hati. Keduanya berdoa, "Ya Tuhan kami, kami telah menzalimi diri kami sendiri. Jika Engkau tidak mengampuni kami dan memberi rahmat kepada kami, niscaya kami termasuk orang-orang yang rugi" (QS. Al-A'raf: 23).

Dalam Surah Al-Baqarah disebutkan bahwa Adam menerima beberapa kalimat (petunjuk tobat) dari Tuhannya, lalu Allah menerima tobatnya. Sungguh, Allah Maha Penerima tobat lagi Maha Penyayang (QS. Al-Baqarah: 37).

Meski demikian, keduanya tetap diturunkan ke bumi untuk menjalani kehidupan sebagai khalifah. Allah berfirman, "Turunlah kamu; sebagian kamu menjadi musuh bagi sebagian yang lain. Dan bagi kamu ada tempat tinggal dan kesenangan di bumi sampai waktu yang ditentukan" (QS. Al-A'raf: 24).

Hikmah: dosa bukanlah akhir bagi orang yang mau bertobat. Perbedaan antara Adam dan Iblis bukan pada kesalahannya, melainkan pada tanggapan atas kesalahan itu — Adam mengakui dan bertobat, sedangkan Iblis membela diri dengan angkuh.`,
    },
    en: {
      title: "Episode 5: Adam's Repentance and Allah's Mercy",
      body: `Here is what set Adam apart from Iblis. Where Iblis defended his sin with pride, Adam and his wife humbly admitted their fault. They prayed, "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy upon us, we will surely be among the losers" (7:23).

In Surah Al-Baqarah it is related that Adam received words [of repentance] from his Lord, and Allah accepted his repentance. Indeed, Allah is the Accepting of repentance, the Merciful (2:37).

Even so, they were sent down to the earth to live out life as vicegerents. Allah said, "Descend, some of you as enemies to others. And for you on the earth is a dwelling place and provision for a time" (7:24).

Reflection: sin is not the end for one who is willing to repent. The difference between Adam and Iblis was not in the mistake, but in the response to it — Adam admitted it and repented, while Iblis defended himself with arrogance.`,
    },
  },
  {
    slug: "kisah-adam-06-anak-cucu-adam",
    surahId: 7,
    ayahStart: 26,
    ayahEnd: 27,
    id: {
      title: "Episode 6: Pesan untuk Anak Cucu Adam",
      body: `Setelah menuturkan kisah Adam, Allah berbicara langsung kepada seluruh keturunannya — yaitu kita semua. "Wahai anak cucu Adam! Sesungguhnya Kami telah menyediakan pakaian untuk menutupi auratmu dan untuk perhiasan bagimu. Tetapi pakaian takwa, itulah yang lebih baik. Demikianlah sebagian dari tanda-tanda kekuasaan Allah, mudah-mudahan mereka ingat" (QS. Al-A'raf: 26).

Allah lalu memperingatkan, "Wahai anak cucu Adam! Janganlah sampai kamu tertipu oleh setan sebagaimana ia telah mengeluarkan kedua orang tuamu (Adam dan Hawa) dari surga, dengan menanggalkan pakaian keduanya untuk memperlihatkan aurat keduanya" (QS. Al-A'raf: 27).

Peringatan itu ditutup dengan kalimat yang menggetarkan, "Sesungguhnya ia (setan) dan pengikut-pengikutnya dapat melihat kamu dari suatu tempat yang kamu tidak dapat melihat mereka. Sungguh, Kami telah menjadikan setan-setan itu pemimpin bagi orang-orang yang tidak beriman" (QS. Al-A'raf: 27).

Hikmah: kisah Adam bukan sekadar cerita masa lampau, melainkan cermin bagi kita. Musuh yang sama yang menggelincirkan Adam masih terus berusaha, dan pakaian terbaik seorang manusia bukanlah kain, melainkan takwa kepada Allah.`,
    },
    en: {
      title: "Episode 6: A Message to the Children of Adam",
      body: `After relating the story of Adam, Allah speaks directly to all his descendants — that is, to all of us. "O children of Adam! We have provided for you clothing to cover your nakedness and as adornment. But the clothing of God-consciousness (taqwa) — that is best. These are among the signs of Allah, that they may remember" (7:26).

Allah then warned, "O children of Adam! Do not let Satan deceive you as he drove your parents (Adam and Hawwa/Eve) out of the Garden, stripping them of their clothing to show them their nakedness" (7:27).

The warning closes with a stirring line: "Indeed, he (Satan) and his tribe see you from where you do not see them. Indeed, We have made the devils allies of those who do not believe" (7:27).

Reflection: the story of Adam is not merely a tale of the past but a mirror for us. The same enemy who caused Adam to slip is still at work, and the finest garment of a human being is not cloth but consciousness of Allah.`,
    },
  },
  {
    slug: "kisah-adam-07-penciptaan-dari-tanah",
    surahId: 15,
    ayahStart: 26,
    ayahEnd: 29,
    id: {
      title: "Episode 7: Adam Diciptakan dari Tanah dan Ditiupkan Ruh",
      body: `Sebelum kisah di surga, ada awal yang lebih mendasar: dari apa manusia pertama dibentuk. Allah berfirman, "Dan sungguh, Kami telah menciptakan manusia (Adam) dari tanah liat kering yang berasal dari lumpur hitam yang diberi bentuk" (QS. Al-Hijr: 26). Manusia yang kelak menjadi khalifah itu bermula dari materi yang paling sederhana — tanah.

Kemudian Allah menceritakan rencana-Nya kepada para malaikat, "Dan (ingatlah) ketika Tuhanmu berfirman kepada para malaikat, ‘Sungguh, Aku akan menciptakan seorang manusia dari tanah liat kering yang berasal dari lumpur hitam yang diberi bentuk. Maka apabila Aku telah menyempurnakan (kejadian)-nya, dan Aku telah meniupkan roh (ciptaan)-Ku ke dalamnya, maka tunduklah kamu kepadanya dengan bersujud’" (QS. Al-Hijr: 28-29).

Dalam Surah Sad, penegasan yang sama diulang, "(Ingatlah) ketika Tuhanmu berfirman kepada malaikat, ‘Sesungguhnya Aku akan menciptakan manusia dari tanah. Kemudian apabila telah Aku sempurnakan kejadiannya dan Aku tiupkan roh (ciptaan)-Ku kepadanya, maka tunduklah kamu dengan bersujud kepadanya’" (QS. Sad: 71-72).

Hikmah: kemuliaan manusia bukan pada bahan asalnya yang hina, melainkan pada ruh yang ditiupkan Allah ke dalam dirinya. Jasad dari tanah, tetapi ruh adalah amanah agung dari Sang Pencipta — di sanalah letak kehormatan sekaligus tanggung jawab manusia.`,
    },
    en: {
      title: "Episode 7: Adam Created from Clay and Given the Spirit",
      body: `Before the story in the Garden, there is a more fundamental beginning: from what the first human was formed. Allah said, "And We certainly created man (Adam) out of clay from an altered black mud" (Qur'an 15:26). The one who would become vicegerent began from the humblest material — earth.

Then Allah related His plan to the angels, "And [mention] when your Lord said to the angels, 'I will create a human being out of clay from an altered black mud. And when I have proportioned him and breathed into him of My [created] spirit, then fall down to him in prostration'" (15:28-29).

In Surah Sad, the same is affirmed, "[Mention] when your Lord said to the angels, 'Indeed, I am going to create a human being from clay. So when I have proportioned him and breathed into him of My spirit, then fall down to him in prostration'" (38:71-72).

Reflection: the nobility of the human being lies not in the lowly matter he came from, but in the spirit Allah breathed into him. The body is from clay, but the spirit is a mighty trust from the Creator — and there lies both a person's honor and their responsibility.`,
    },
  },
  {
    slug: "kisah-adam-08-sumpah-iblis",
    surahId: 15,
    ayahStart: 39,
    ayahEnd: 43,
    id: {
      title: "Episode 8: Sumpah Iblis dan Hamba-Hamba yang Terjaga",
      body: `Setelah menolak sujud dan menerima kutukan, Iblis tidak bertobat — ia justru menyatakan perang terhadap anak cucu Adam. Ia berkata, "Ya Tuhanku, oleh karena Engkau telah menetapkan aku sesat, aku akan menjadikan (kejahatan) terasa indah bagi mereka di bumi, dan aku akan menyesatkan mereka semuanya" (QS. Al-Hijr: 39).

Namun sumpah itu memiliki satu pengecualian yang penting, yang keluar dari mulut Iblis sendiri, "kecuali hamba-hamba-Mu yang terpilih (ikhlas) di antara mereka" (QS. Al-Hijr: 40). Dalam Surah Sad ia bersumpah, "Demi kemuliaan-Mu, aku akan menyesatkan mereka semuanya, kecuali hamba-hamba-Mu yang terpilih di antara mereka" (QS. Sad: 82-83).

Maka Allah menetapkan batas kekuasaan setan, "Ini adalah jalan yang lurus (menuju) kepada-Ku. Sesungguhnya kamu (Iblis) tidak kuasa atas hamba-hamba-Ku, kecuali mereka yang mengikutimu, yaitu orang yang sesat" (QS. Al-Hijr: 41-42).

Hikmah: musuh manusia telah bersumpah terang-terangan, tetapi ia mengakui sendiri bahwa ada benteng yang tak bisa ia tembus — yaitu hati hamba yang ikhlas kepada Allah. Keikhlasan adalah perlindungan; semakin murni niat seseorang hamba, semakin kecil celah bagi bisikan setan.`,
    },
    en: {
      title: "Episode 8: The Vow of Iblis and the Servants Who Are Protected",
      body: `After refusing to prostrate and receiving the curse, Iblis did not repent — instead he declared war on the children of Adam. He said, "My Lord, because You have put me in error, I will surely make [disobedience] attractive to them on the earth, and I will mislead them all" (Qur'an 15:39).

Yet that vow carried one crucial exception, spoken by Iblis himself, "except, among them, Your chosen (sincere) servants" (15:40). In Surah Sad he swore, "By Your might, I will surely mislead them all, except, among them, Your chosen servants" (38:82-83).

So Allah set the limit of Satan's power: "This is a path to Me [that is] straight. Indeed, over My servants there is for you no authority, except those who follow you of the deviators" (15:41-42).

Reflection: the enemy of humankind has sworn openly, yet he admits himself that there is a fortress he cannot breach — the heart of a servant sincere to Allah. Sincerity is protection; the purer a servant's intention, the smaller the opening for Satan's whisper.`,
    },
  },
  {
    slug: "kisah-adam-09-dua-putra-adam",
    surahId: 5,
    ayahStart: 27,
    ayahEnd: 29,
    id: {
      title: "Episode 9: Dua Putra Adam dan Dua Kurban",
      body: `Kehidupan di bumi pun dimulai, dan ujian berpindah kepada keturunan Adam. Allah berfirman, "Dan ceritakanlah (Muhammad) yang sebenarnya kepada mereka tentang kisah kedua putra Adam, ketika keduanya mempersembahkan kurban, maka (kurban) salah seorang dari mereka (Habil) diterima dan dari yang lain (Qabil) tidak diterima" (QS. Al-Ma'idah: 27).

Alih-alih memperbaiki diri, yang kurbannya tidak diterima justru dikuasai iri hati. Ia berkata, "Sungguh, aku pasti akan membunuhmu!" Saudaranya menjawab dengan penuh ketakwaan, "Sesungguhnya Allah hanya menerima (amal) dari orang-orang yang bertakwa" (QS. Al-Ma'idah: 27). Sebuah jawaban yang menunjukkan bahwa yang menentukan bukanlah persembahannya, melainkan hati yang mempersembahkannya.

Ia melanjutkan dengan sikap yang mengagumkan, "Sungguh, jika engkau menggerakkan tanganmu kepadaku untuk membunuhku, aku tidak akan menggerakkan tanganku kepadamu untuk membunuhmu. Aku takut kepada Allah, Tuhan seluruh alam" (QS. Al-Ma'idah: 28). Bahkan dalam ancaman, ia menolak menjadi pemulai kejahatan.

Hikmah: iri hati (hasad) adalah api yang membakar pelakunya lebih dulu. Kurban yang diterima Allah bukanlah yang paling banyak atau paling mahal, melainkan yang lahir dari ketakwaan. Dan keberanian sejati kadang justru terletak pada menahan tangan, bukan mengangkatnya.`,
    },
    en: {
      title: "Episode 9: The Two Sons of Adam and the Two Offerings",
      body: `Life on earth now began, and the test passed to Adam's descendants. Allah said, "And recite to them the story of Adam's two sons, in truth, when they both offered a sacrifice, and it was accepted from one of them (Habil/Abel) but was not accepted from the other (Qabil/Cain)" (Qur'an 5:27).

Instead of correcting himself, the one whose offering was not accepted was overtaken by envy. He said, "I will surely kill you." His brother answered with full God-consciousness, "Indeed, Allah only accepts from the righteous [who fear Him]" (5:27) — an answer showing that what counts is not the offering, but the heart that offers it.

He continued with a remarkable stance, "If you should raise your hand against me to kill me, I shall not raise my hand against you to kill you. Indeed, I fear Allah, Lord of the worlds" (5:28). Even under threat, he refused to be the one who begins evil.

Reflection: envy (hasad) is a fire that burns the one who carries it first. The offering Allah accepts is not the largest or costliest, but the one born of God-consciousness. And true courage sometimes lies precisely in holding back the hand, not raising it.`,
    },
  },
  {
    slug: "kisah-adam-10-kejahatan-pertama-dan-burung-gagak",
    surahId: 5,
    ayahStart: 30,
    ayahEnd: 31,
    id: {
      title: "Episode 10: Kejahatan Pertama di Bumi dan Burung Gagak",
      body: `Peringatan sang saudara tidak menghentikan nafsu yang telah dikuasai iri. Allah berfirman, "Maka nafsu (Qabil) mendorongnya untuk membunuh saudaranya, kemudian dia pun (benar-benar) membunuhnya, maka jadilah dia termasuk orang yang rugi" (QS. Al-Ma'idah: 30). Inilah darah pertama yang tertumpah di muka bumi — persis kekhawatiran yang dahulu ditanyakan para malaikat.

Setelah membunuh, sang pelaku kebingungan; ia tidak tahu harus berbuat apa dengan jasad saudaranya. "Kemudian Allah mengutus seekor burung gagak menggali tanah untuk memperlihatkan kepadanya bagaimana dia seharusnya menutupi mayat saudaranya" (QS. Al-Ma'idah: 31). Seekor burung menjadi guru bagi manusia dalam saat penyesalannya.

Ia pun berkata dengan getir, "Oh, celaka aku! Mengapa aku tidak mampu berbuat seperti burung gagak ini, sehingga aku dapat menguburkan mayat saudaraku ini?" Maka jadilah dia termasuk orang-orang yang menyesal (QS. Al-Ma'idah: 31). Namun penyesalan itu datang setelah nyawa telah hilang.

Hikmah: dosa besar sering bermula dari perasaan kecil yang dibiarkan tumbuh — iri yang tidak dilawan. Penyesalan setelah perbuatan tidak dapat mengembalikan yang telah hilang; karena itu, tempat terbaik untuk menghentikan kejahatan adalah pada bisikan pertamanya, bukan pada akibatnya.`,
    },
    en: {
      title: "Episode 10: The First Crime on Earth and the Crow",
      body: `The brother's warning did not stop a soul already ruled by envy. Allah said, "And his soul permitted to him the murder of his brother, so he killed him and became among the losers" (Qur'an 5:30). This was the first blood spilled upon the earth — exactly the concern the angels had once raised.

After the killing, the doer stood bewildered; he did not know what to do with his brother's body. "Then Allah sent a crow searching in the ground to show him how to hide the disgrace (the corpse) of his brother" (5:31). A bird became a teacher for man in his moment of regret.

He said bitterly, "O woe to me! Have I failed to be like this crow and so bury the body of my brother?" And he became of the regretful (5:31). Yet the regret came only after the life was already gone.

Reflection: great sin often begins as a small feeling left to grow — an envy never resisted. Regret after the deed cannot return what is lost; so the best place to stop a wrong is at its first whisper, not at its consequence.`,
    },
  },
  {
    slug: "kisah-adam-11-petunjuk-bagi-anak-cucu-adam",
    surahId: 2,
    ayahStart: 38,
    ayahEnd: 39,
    id: {
      title: "Episode 11: Janji Petunjuk yang Abadi bagi Anak Cucu Adam",
      body: `Kisah Adam ditutup bukan dengan keputusasaan, melainkan dengan sebuah janji yang berlaku hingga akhir zaman. Ketika menurunkan Adam dan keturunannya ke bumi, Allah berfirman, "Turunlah kamu semua dari surga! Kemudian jika benar-benar datang petunjuk-Ku kepadamu, maka barangsiapa mengikuti petunjuk-Ku, tidak ada rasa takut pada mereka dan mereka tidak bersedih hati" (QS. Al-Baqarah: 38).

Namun ada pula peringatan bagi yang berpaling, "Dan orang-orang yang kafir dan mendustakan ayat-ayat Kami, mereka itu penghuni neraka; mereka kekal di dalamnya" (QS. Al-Baqarah: 39). Dua jalan dibentangkan sejak hari pertama manusia di bumi: mengikuti petunjuk, atau berpaling darinya.

Janji yang sama ditegaskan dalam Surah Ta-Ha, "Maka barangsiapa mengikuti petunjuk-Ku, dia tidak akan sesat dan tidak akan celaka. Dan barangsiapa berpaling dari peringatan-Ku, maka sungguh, dia akan menjalani kehidupan yang sempit" (QS. Ta-Ha: 123-124).

Hikmah: sejak Adam diturunkan, pintu petunjuk tidak pernah ditutup. Setiap manusia adalah anak Adam yang mewarisi janji ini — bahwa siapa pun yang kembali kepada petunjuk Allah akan menemukan ketenangan, betapapun jauh ia sempat tersesat. Inilah warisan terbesar dari kisah bapak seluruh manusia.`,
    },
    en: {
      title: "Episode 11: The Eternal Promise of Guidance for Adam's Children",
      body: `The story of Adam closes not in despair, but with a promise that holds until the end of time. As He sent Adam and his descendants down to the earth, Allah said, "Go down from it, all of you. And when guidance comes to you from Me, whoever follows My guidance — there will be no fear concerning them, nor will they grieve" (Qur'an 2:38).

Yet there is also a warning for the one who turns away, "And those who disbelieve and deny Our signs — those are the companions of the Fire; they will abide therein eternally" (2:39). Two roads were laid out from humanity's very first day on earth: to follow the guidance, or to turn from it.

The same promise is affirmed in Surah Ta-Ha, "So whoever follows My guidance will neither go astray nor suffer. And whoever turns away from My remembrance — indeed, he will have a straitened life" (20:123-124).

Reflection: since Adam was sent down, the door of guidance has never been closed. Every human being is a child of Adam who inherits this promise — that whoever returns to Allah's guidance will find peace, however far they may have strayed. This is the greatest inheritance from the story of the father of all mankind.`,
    },
  },
];
