/**
 * "Kisah Ashabul Kahfi" (the People of the Cave) — one complete,
 * fully-grounded story series drawn entirely from Surah Al-Kahf (18:9-26),
 * the single passage where this account is told.
 *
 * Every episode is a close paraphrase of specific ayat. No hadith, no
 * speculation about the youths' names or the cave's location, and no
 * invented dialogue/detail beyond what these ayat state is included,
 * matching the same conservative editorial policy as the Kisah Nabi Yusuf /
 * Musa / Dzulqarnain series (docs/CONTENT-POLICY.md). Source text:
 * quran-json (CC-BY-4.0), the same dataset already seeded into
 * `ayah`/`translation`.
 *
 * ai_generated=0 (human/editorially authored at build time), status='published'.
 */

export interface AshabulKahfiEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_ASHABUL_KAHFI_SERIES: AshabulKahfiEpisode[] = [
  {
    slug: "kisah-ashabul-kahfi-01-pemuda-beriman-berlindung",
    surahId: 18,
    ayahStart: 9,
    ayahEnd: 16,
    id: {
      title: "Pemuda-Pemuda Beriman yang Berlindung ke Gua",
      body: `Allah bertanya kepada manusia, apakah mereka mengira bahwa kisah para penghuni gua dan batu bertulis itu termasuk tanda kekuasaan-Nya yang paling menakjubkan? Padahal penciptaan langit dan bumi jauh lebih agung. Lalu Allah menceritakan kisah mereka dengan sebenarnya.

Mereka adalah pemuda-pemuda yang beriman kepada Tuhan mereka, lalu Allah menambahkan petunjuk kepada mereka dan meneguhkan hati mereka. Ketika mereka berlindung ke dalam gua, mereka berdoa, "Wahai Tuhan kami, berikanlah rahmat kepada kami dari sisi-Mu, dan sempurnakanlah bagi kami petunjuk yang lurus dalam urusan kami."

Allah meneguhkan hati mereka ketika mereka berdiri di hadapan penguasa dan kaumnya, seraya berkata, "Tuhan kami adalah Tuhan langit dan bumi. Kami sekali-kali tidak akan menyeru tuhan selain Dia. Sungguh, jika kami berbuat demikian, kami telah mengucapkan perkataan yang jauh dari kebenaran."

Mereka melihat kaum mereka menyembah tuhan-tuhan selain Allah, lalu berkata, "Mengapa mereka tidak mengemukakan alasan yang jelas atas apa yang mereka sembah? Maka siapakah yang lebih zalim daripada orang yang mengada-adakan kebohongan terhadap Allah?"

Kemudian mereka berbisik sesama mereka, "Setelah kalian meninggalkan kaum itu beserta apa yang mereka sembah selain Allah, berlindunglah ke dalam gua. Niscaya Tuhan kalian akan melimpahkan sebagian rahmat-Nya kepada kalian, dan menyediakan sesuatu yang berguna bagi urusan kalian."

Hikmah: Iman sejati kadang menuntut keberanian untuk berbeda dan meninggalkan lingkungan yang rusak demi menjaga tauhid. Para pemuda itu lebih memilih kesunyian gua bersama Allah daripada kemewahan kota bersama kesyirikan. Barang siapa meninggalkan sesuatu karena Allah, Allah akan menggantinya dengan rahmat dan jalan keluar.`,
    },
    en: {
      title: "The Believing Youths Who Took Refuge in the Cave",
      body: `God asks humankind whether they suppose that the story of the companions of the cave and the inscription was among the most wondrous of His signs — when the creation of the heavens and the earth is far greater. Then God relates their story in truth.

They were youths who believed in their Lord, so God increased them in guidance and bound firmness upon their hearts. When they retreated to the cave, they prayed, "Our Lord, grant us mercy from Yourself, and prepare for us right guidance in our affair."

God strengthened their hearts when they stood before the ruler and his people and said, "Our Lord is the Lord of the heavens and the earth. Never will we call upon any deity besides Him. If we did, we would have uttered a gross falsehood."

They saw their people worshipping deities other than God and said, "Why do they not bring a clear proof for what they worship? Who then is more unjust than one who invents a lie against God?"

Then they counselled one another, "Now that you have withdrawn from them and from what they worship besides God, take refuge in the cave. Your Lord will spread out for you of His mercy and make your affair easy."

Reflection: True faith sometimes demands the courage to be different and to leave a corrupt environment in order to preserve pure monotheism. Those youths chose the solitude of a cave with God over the comfort of the city with idolatry. Whoever gives up something for God's sake, God replaces it with mercy and a way out.`,
    },
  },
  {
    slug: "kisah-ashabul-kahfi-02-tidur-panjang-tanda-kekuasaan",
    surahId: 18,
    ayahStart: 17,
    ayahEnd: 18,
    id: {
      title: "Tidur Panjang dan Tanda-Tanda Kekuasaan Allah",
      body: `Setelah para pemuda itu masuk ke dalam gua, Allah menidurkan mereka dengan tidur yang panjang, dan menjaga mereka dengan penjagaan yang penuh keajaiban.

Allah menggambarkan keadaan gua itu: engkau akan melihat matahari ketika terbit condong dari gua mereka ke sebelah kanan, dan ketika terbenam menjauhi mereka ke sebelah kiri, sedangkan mereka berada di tempat yang lapang di dalam gua. Cahaya matahari tidak langsung membakar tubuh mereka, tetapi udara dan suasana gua tetap terjaga bagi mereka. Yang demikian itu adalah sebagian dari tanda-tanda kebesaran Allah.

Allah menegaskan bahwa barang siapa diberi petunjuk oleh-Nya, dialah yang mendapat petunjuk; dan barang siapa disesatkan-Nya, maka engkau tidak akan mendapatkan seorang penolong pun yang dapat memberinya petunjuk.

Kemudian Allah menggambarkan keadaan mereka yang menakjubkan: engkau mengira mereka terjaga, padahal mereka tidur. Allah membalik-balikkan tubuh mereka ke kanan dan ke kiri agar tubuh mereka tidak rusak dimakan tanah, sedangkan anjing mereka menjulurkan kedua kaki depannya di ambang pintu gua. Sekiranya engkau menyaksikan mereka, tentu engkau akan berpaling melarikan diri dari mereka dan hatimu akan dipenuhi rasa takut karena wibawa yang Allah tebarkan atas mereka.

Hikmah: Allah menjaga hamba-hamba yang berlindung kepada-Nya dengan cara yang tak terjangkau akal — mengatur matahari, membalik tubuh yang tertidur, hingga menebar wibawa yang melindungi. Ketika seorang hamba menyerahkan urusannya kepada Allah, penjagaan-Nya jauh lebih sempurna daripada segala usaha manusia.`,
    },
    en: {
      title: "The Long Sleep and the Signs of God's Power",
      body: `After the youths entered the cave, God placed them in a long sleep and guarded them with a wondrous protection.

God describes the cave: you would see the sun, when it rose, inclining away from their cave to the right, and when it set, passing them by to the left, while they lay in an open space within the cave. Its light did not scorch their bodies directly, yet the air and setting of the cave were kept fit for them. That was among the signs of God's greatness.

God affirms that whomever He guides is truly guided, and whomever He leaves astray — you will never find for him a protecting guide.

Then God describes their astonishing state: you would think them awake, while they were asleep. God turned their bodies to the right and to the left so that the earth would not wear their bodies away, while their dog stretched its forelegs at the entrance of the cave. Had you come upon them, you would have turned and fled from them, your heart filled with dread at the awe God had cast over them.

Reflection: God guards the servants who take refuge in Him by means the mind cannot grasp — directing the sun, turning sleeping bodies, casting an awe that shields them. When a servant entrusts his affair to God, His protection is far more complete than any human effort.`,
    },
  },
  {
    slug: "kisah-ashabul-kahfi-03-terbangun-dan-utusan-ke-kota",
    surahId: 18,
    ayahStart: 19,
    ayahEnd: 20,
    id: {
      title: "Terbangun dan Mengutus Seorang ke Kota",
      body: `Setelah tidur bertahun-tahun lamanya, Allah membangunkan para pemuda itu agar mereka saling bertanya satu sama lain. Salah seorang di antara mereka bertanya, "Sudah berapa lama kalian berada di sini?" Sebagian menjawab, "Kita berada di sini sehari atau setengah hari," sebab mereka merasa baru saja tertidur.

Namun sebagian yang lain, dengan kerendahan hati dan kesadaran akan keterbatasan ilmu manusia, berkata, "Tuhan kalian lebih mengetahui berapa lama kalian berada di sini." Mereka tidak memaksakan pendapat tentang hal yang tidak mereka ketahui, melainkan mengembalikan ilmunya kepada Allah.

Karena rasa lapar mulai terasa, mereka berkata, "Maka utuslah salah seorang di antara kalian pergi ke kota dengan membawa uang perak ini. Hendaklah ia mencari makanan yang paling baik dan halal, lalu membawakan sebagian rezeki itu untuk kalian. Dan hendaklah ia berlaku lemah lembut serta berhati-hati, dan jangan sekali-kali menceritakan keadaan kalian kepada siapa pun."

Mereka menambahkan alasannya, "Sesungguhnya jika penduduk kota mengetahui keberadaan kalian, niscaya mereka akan melempari kalian dengan batu, atau memaksa kalian kembali kepada agama mereka; dan jika demikian, kalian tidak akan beruntung selama-lamanya."

Hikmah: Adab seorang mukmin adalah mengembalikan perkara yang tidak diketahui kepada Allah ("Tuhan kalian lebih mengetahui"), bukan memperdebatkan yang tak berguna. Mereka pun tetap menempuh sebab — mencari makanan halal, berhati-hati, dan menjaga diri — sambil bertawakal. Iman tidak meniadakan ikhtiar, dan ikhtiar tidak menggantikan tawakal.`,
    },
    en: {
      title: "Awakening and Sending One to the City",
      body: `After a sleep that lasted many years, God awakened the youths so that they might question one another. One of them asked, "How long have you stayed here?" Some answered, "We have stayed a day or part of a day," for it seemed to them they had only just fallen asleep.

But others, in humility and awareness of the limits of human knowledge, said, "Your Lord knows best how long you have stayed." They did not force an opinion about what they did not know; rather, they returned that knowledge to God.

As hunger began to press upon them, they said, "So send one of you to the city with this silver coin. Let him seek out the best and most lawful food and bring you provision from it. Let him be gentle and cautious, and never tell anyone about your condition."

They gave their reason: "If the people of the city come to know of you, they will stone you or force you back to their religion; and then you would never succeed, ever."

Reflection: The manner of a believer is to return what he does not know to God ("Your Lord knows best"), not to argue over the useless. Yet they still pursued means — seeking lawful food, taking care, guarding themselves — while trusting in God. Faith does not cancel effort, and effort does not replace reliance upon God.`,
    },
  },
  {
    slug: "kisah-ashabul-kahfi-04-ditemukan-dan-hikmah-jumlah-mereka",
    surahId: 18,
    ayahStart: 21,
    ayahEnd: 26,
    id: {
      title: "Mereka Ditemukan: Bukti Kebangkitan dan Adab tentang yang Gaib",
      body: `Allah menjadikan keberadaan para pemuda itu diketahui oleh penduduk negeri, agar mereka mengerti bahwa janji Allah tentang kebangkitan itu benar, dan bahwa hari kiamat tidak diragukan lagi. Sebab, siapa yang mampu menidurkan sekelompok manusia ratusan tahun lalu membangunkannya kembali, tentu mampu membangkitkan seluruh manusia setelah mati. Lalu penduduk berselisih tentang urusan mereka; sebagian berkata, "Dirikanlah sebuah bangunan di atas gua mereka," sedangkan Allah lebih mengetahui keadaan mereka.

Kelak sebagian orang akan berkata jumlah mereka tiga orang, yang keempat anjingnya; sebagian lagi berkata lima, yang keenam anjingnya — hanya menerka-nerka yang gaib. Dan sebagian berkata tujuh, yang kedelapan anjingnya. Katakanlah, wahai Muhammad, "Tuhanku lebih mengetahui jumlah mereka; tidak ada yang mengetahuinya kecuali sedikit." Maka janganlah berbantah-bantahan tentang mereka kecuali dengan perbantahan yang ringan, dan jangan menanyakan tentang mereka kepada siapa pun.

Allah juga mengajarkan adab yang agung: janganlah engkau mengatakan tentang sesuatu, "Sesungguhnya aku akan melakukan itu besok," kecuali dengan mengucapkan, "Insya Allah." Dan ingatlah Tuhanmu jika engkau lupa.

Adapun lama mereka tinggal di gua, Allah menyebutkan bahwa mereka tinggal selama tiga ratus tahun dan ditambah sembilan tahun. Katakanlah, "Allah lebih mengetahui berapa lamanya mereka tinggal. Milik-Nya semua yang gaib di langit dan di bumi."

Hikmah: Kisah Ashabul Kahfi adalah bukti nyata kebenaran hari kebangkitan. Al-Qur'an mengajarkan kita untuk tidak sibuk dengan hal gaib yang tak berguna (seperti jumlah mereka), tetapi mengambil intinya: tauhid, tawakal, dan keyakinan akan hari akhir. Dan setiap rencana masa depan hendaknya digantungkan kepada kehendak Allah dengan ucapan "Insya Allah".`,
    },
    en: {
      title: "They Are Discovered: Proof of Resurrection and Manners about the Unseen",
      body: `God caused the youths to be discovered by the people of the land so that they would know that God's promise of resurrection is true and that the Hour is beyond doubt. For whoever can put a group of people to sleep for centuries and then awaken them is surely able to raise all humankind after death. Then the people disputed about their affair; some said, "Build a structure over their cave," while God knew their condition best.

Later, some will say they were three, the fourth their dog; others will say five, the sixth their dog — merely guessing at the unseen; and some will say seven, the eighth their dog. Say, O Muhammad, "My Lord knows best their number; none knows them but a few." So do not argue about them except with a light discussion, and do not ask anyone about them.

God also teaches a lofty manner: never say of anything, "I will surely do that tomorrow," except by adding, "If God wills." And remember your Lord if you forget.

As for how long they stayed in the cave, God states that they remained three hundred years and nine added. Say, "God knows best how long they stayed. To Him belongs all the unseen of the heavens and the earth."

Reflection: The story of the People of the Cave is a clear proof of the truth of resurrection. The Qur'an teaches us not to busy ourselves with useless unseen matters (like their number), but to take the essence: pure monotheism, reliance on God, and certainty of the Last Day. And every plan for the future should be tied to God's will with the words "If God wills."`,
    },
  },
];
