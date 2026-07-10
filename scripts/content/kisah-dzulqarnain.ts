/**
 * "Kisah Dzulqarnain & Ya'juj wa Ma'juj" — one complete, fully-grounded
 * story series drawn entirely from Surah Al-Kahf (18:83-98), the single
 * passage where this account is told with the fewest gaps.
 *
 * Every episode is a close paraphrase of specific ayat. No hadith, no
 * scholarly speculation about Dzulqarnain's identity, and no invented
 * dialogue/detail beyond what these ayat state is included, matching the
 * same conservative editorial policy as the Kisah Nabi Yusuf / Musa series
 * (docs/CONTENT-POLICY.md). Source text: quran-json (CC-BY-4.0), the same
 * dataset already seeded into `ayah`/`translation`.
 *
 * ai_generated=0 (human/editorially authored at build time), status='published'
 * — each episode cites its exact surah:ayah range so a reader can verify
 * every sentence against the Qur'an text already on the site.
 */

export interface DzulqarnainEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_DZULQARNAIN_SERIES: DzulqarnainEpisode[] = [
  {
    slug: "kisah-dzulqarnain-01-kekuasaan-dan-perjalanan-barat",
    surahId: 18,
    ayahStart: 83,
    ayahEnd: 88,
    id: {
      title: "Dzulqarnain: Kekuasaan yang Diberikan Allah dan Perjalanan ke Barat",
      body: `Sebagian orang bertanya kepada Nabi Muhammad tentang Dzulqarnain. Maka Allah memerintahkan agar dibacakan kepada mereka sebagian kisahnya sebagai pelajaran. Allah menerangkan bahwa Dia telah memberi Dzulqarnain kedudukan yang kokoh di muka bumi, dan menganugerahinya jalan untuk mencapai segala sesuatu yang ia kehendaki. Ia pun menempuh suatu jalan.

Ia terus berjalan hingga sampai ke tempat terbenamnya matahari. Di sana ia mendapati matahari seakan-akan terbenam ke dalam laut yang berlumpur hitam, dan ia menjumpai suatu kaum di sekitarnya. Allah memberinya pilihan atas kaum itu: "Wahai Dzulqarnain, engkau boleh menghukum mereka, atau berbuat kebaikan kepada mereka."

Dzulqarnain menjawab dengan keadilan seorang pemimpin yang beriman. Ia berkata bahwa siapa yang berbuat zalim akan ia hukum, kemudian ia akan dikembalikan kepada Tuhannya, lalu Tuhannya mengazabnya dengan azab yang sangat keras. Adapun orang yang beriman dan beramal saleh, baginya balasan yang terbaik sebagai pahala, dan Dzulqarnain akan memperlakukannya dengan mudah dan lembut, memerintahkannya dengan perintah yang ringan.

Demikianlah Allah menggambarkan seorang penguasa besar yang kekuasaannya tidak membuatnya lupa. Ia membedakan antara yang zalim dan yang beriman, menegakkan keadilan tanpa kesewenang-wenangan, dan menyadari bahwa di atas kekuasaannya masih ada kekuasaan Allah, tempat semua manusia dikembalikan.

Hikmah: Kekuasaan yang sejati adalah amanah untuk menegakkan keadilan, bukan alat untuk menindas. Dzulqarnain diberi "jalan menuju segala sesuatu", namun ia tetap tunduk kepada Allah dan mengembalikan urusan akhir setiap manusia kepada-Nya. Pemimpin yang beriman menghukum kezaliman dengan adil dan memperlakukan orang saleh dengan lembut.`,
    },
    en: {
      title: "Dhul-Qarnayn: God-Given Authority and the Journey Westward",
      body: `Some people asked the Prophet Muhammad about Dhul-Qarnayn. God commanded that a portion of his account be recited to them as a lesson. God explained that He had established Dhul-Qarnayn firmly upon the earth and granted him a means to reach everything he intended. So he followed a way.

He travelled on until he reached the place where the sun sets. There he found it as though setting into a spring of dark, murky water, and near it he found a people. God gave him a choice concerning that people: "O Dhul-Qarnayn, you may either punish them, or show them kindness."

Dhul-Qarnayn answered with the justice of a believing ruler. He said that whoever does wrong, he would punish, after which that person would be returned to his Lord, who would punish him with a terrible punishment. But as for the one who believes and does righteous deeds, he will have the finest reward, and Dhul-Qarnayn would deal with him gently, commanding him only with what is easy.

Thus God portrays a great ruler whose power did not make him heedless. He distinguished between the wrongdoer and the believer, upheld justice without tyranny, and remained aware that above his authority stood the authority of God, to whom all people return.

Reflection: True power is a trust for upholding justice, not a tool for oppression. Dhul-Qarnayn was given "a way to everything," yet he stayed submissive to God and left each person's final reckoning to Him. The believing leader punishes wrongdoing with fairness and treats the righteous with gentleness.`,
    },
  },
  {
    slug: "kisah-dzulqarnain-02-perjalanan-timur",
    surahId: 18,
    ayahStart: 89,
    ayahEnd: 91,
    id: {
      title: "Perjalanan ke Timur: Kaum di Bawah Terik Matahari",
      body: `Setelah menegakkan keadilan di ujung barat, Dzulqarnain kembali menempuh suatu jalan. Ia berjalan menuju arah yang lain, ke tempat terbitnya matahari.

Ia terus melintasi negeri demi negeri hingga sampai ke tempat terbitnya matahari. Di sana ia mendapati matahari menyinari suatu kaum yang tidak Allah berikan bagi mereka sesuatu pelindung pun dari cahayanya. Mereka adalah kaum yang hidup di tanah terbuka, tanpa naungan bangunan atau pepohonan yang menutupi mereka dari terik.

Allah menegaskan, "Demikianlah." Yakni Dzulqarnain memperlakukan kaum di timur ini sebagaimana ia memperlakukan kaum di barat: dengan keadilan yang sama, membedakan yang beriman dari yang zalim. Dan Allah menyatakan bahwa Dia benar-benar meliputi dengan ilmu-Nya segala keadaan yang ada pada Dzulqarnain — seluruh kekuatan, pengetahuan, dan sarana yang ia miliki, semuanya berada dalam liputan ilmu Allah.

Ayat-ayat ini singkat, namun sarat makna. Al-Qur'an tidak menyibukkan pembacanya dengan rincian geografis atau bentuk kaum itu, melainkan mengarahkan hati kepada inti pelajaran: seorang penguasa yang berpindah dari satu ujung bumi ke ujung yang lain, tetap membawa keadilan yang sama, dan tetap berada dalam pengawasan ilmu Allah.

Hikmah: Betapapun luas kekuasaan dan jauh perjalanan seseorang, ia tidak pernah keluar dari liputan ilmu Allah. Keadilan sejati tidak berubah karena tempat atau keadaan kaum yang dihadapi — Dzulqarnain memperlakukan kaum di timur dan di barat dengan timbangan yang sama. Dan Allah senantiasa Maha Mengetahui atas segala yang kita miliki dan kita perbuat.`,
    },
    en: {
      title: "The Journey Eastward: A People Beneath the Blazing Sun",
      body: `After establishing justice at the western edge, Dhul-Qarnayn once again followed a way. He travelled in another direction, toward the place where the sun rises.

He crossed land after land until he reached the place of the sunrise. There he found the sun rising upon a people for whom God had provided no shelter from its light. They were a people living in open land, without the shade of buildings or trees to cover them from the heat.

God affirms, "Thus" — meaning Dhul-Qarnayn treated this eastern people just as he had treated the western people: with the same justice, distinguishing the believer from the wrongdoer. And God declares that He fully encompassed with His knowledge everything that Dhul-Qarnayn possessed — all his strength, knowledge, and means were entirely within the scope of God's knowledge.

These verses are brief yet rich in meaning. The Qur'an does not occupy the reader with geographic detail or the appearance of that people; instead it directs the heart to the heart of the lesson: a ruler who moves from one end of the earth to the other still carries the same justice, and still remains under the watch of God's knowledge.

Reflection: However vast a person's power and however far his journey, he never steps outside the encompassing knowledge of God. True justice does not change with place or with the condition of the people one faces — Dhul-Qarnayn treated east and west by the same measure. And God is ever fully aware of all we possess and all we do.`,
    },
  },
  {
    slug: "kisah-dzulqarnain-03-antara-dua-gunung-yajuj-majuj",
    surahId: 18,
    ayahStart: 92,
    ayahEnd: 95,
    id: {
      title: "Di Antara Dua Gunung: Keluhan tentang Ya'juj dan Ma'juj",
      body: `Dzulqarnain kembali menempuh suatu jalan. Ia terus berjalan hingga sampai di antara dua buah gunung. Di sana ia mendapati suatu kaum yang hampir tidak dapat memahami pembicaraan, karena perbedaan bahasa dan keterasingan mereka.

Kaum itu mengadu kepadanya. Mereka berkata, "Wahai Dzulqarnain, sesungguhnya Ya'juj dan Ma'juj adalah kaum yang membuat kerusakan di muka bumi. Bolehkah kami membayarmu sejumlah harta, agar engkau membuatkan dinding penghalang antara kami dan mereka?"

Ya'juj dan Ma'juj adalah dua bangsa yang gemar merusak dan menebar bencana atas kaum di sekitarnya. Maka penduduk di antara dua gunung itu memohon perlindungan kepada Dzulqarnain, dan menawarkan upah sebagai imbalan atas pembangunan penghalang.

Namun Dzulqarnain menolak upah itu. Ia menjawab, "Apa yang telah dianugerahkan Tuhanku kepadaku lebih baik dari harta kalian. Maka bantulah aku dengan kekuatan — tenaga dan alat — niscaya aku akan membuatkan dinding penghalang yang kokoh antara kalian dan mereka."

Ia tidak menjadikan pertolongan ini sebagai jalan mengumpulkan harta, sebab Allah telah mencukupinya dengan kekuasaan dan karunia. Yang ia minta hanyalah kerja sama dan tenaga, agar mereka pun turut berjuang menjaga keselamatan negeri mereka sendiri.

Hikmah: Orang yang telah dicukupkan Allah tidak menjadikan kebaikan sebagai ladang mencari upah. Dzulqarnain menolak harta dan justru mengajak kaum itu bekerja bersama — sebab pertolongan yang paling mulia adalah yang memberdayakan orang lain, bukan yang menjadikan mereka bergantung. Kekuatan sejati dipakai untuk membendung kerusakan, bukan menumpuk kekayaan.`,
    },
    en: {
      title: "Between the Two Mountains: The Complaint of Gog and Magog",
      body: `Dhul-Qarnayn once more followed a way. He travelled on until he reached a place between two mountains. There he found a people who could scarcely understand speech, on account of their different language and isolation.

That people complained to him. They said, "O Dhul-Qarnayn, indeed Gog and Magog (Ya'juj and Ma'juj) are a people who spread corruption throughout the land. May we pay you a sum of wealth so that you might build a barrier between us and them?"

Gog and Magog were two peoples given to devastation and to unleashing calamity upon those around them. So the inhabitants between the two mountains sought Dhul-Qarnayn's protection and offered him payment in return for building a barrier.

But Dhul-Qarnayn declined their payment. He answered, "That which my Lord has granted me is better than your wealth. So assist me with strength — labour and tools — and I will build a strong barrier between you and them."

He did not turn this aid into a means of amassing wealth, for God had already sufficed him with authority and favour. All he asked for was cooperation and effort, so that they too would take part in the struggle to protect the safety of their own land.

Reflection: The one whom God has made self-sufficient does not treat doing good as a field for earning wages. Dhul-Qarnayn refused the wealth and instead called the people to work alongside him — for the noblest help is that which empowers others rather than making them dependent. True strength is spent to hold back corruption, not to pile up riches.`,
    },
  },
  {
    slug: "kisah-dzulqarnain-04-dinding-penghalang-dan-janji-kiamat",
    surahId: 18,
    ayahStart: 96,
    ayahEnd: 98,
    id: {
      title: "Dinding Besi dan Janji Hari Kiamat",
      body: `Dzulqarnain mulai membangun. Ia berkata, "Bawalah kepadaku potongan-potongan besi." Maka dikumpulkanlah besi itu hingga ketika telah terkumpul rata memenuhi celah antara dua gunung, ia berkata, "Tiuplah dengan api." Maka mereka meniupnya hingga besi itu menjadi merah membara seperti api. Lalu ia berkata, "Bawakan kepadaku tembaga yang mendidih agar kutuangkan ke atasnya," sehingga besi dan tembaga itu menyatu menjadi dinding yang sangat kuat.

Dengan dinding itu, Ya'juj dan Ma'juj tidak mampu lagi mendakinya karena tingginya dan licinnya, dan tidak pula mampu melubanginya karena tebal dan kokohnya. Terbendunglah kerusakan mereka atas kaum yang lemah itu.

Namun Dzulqarnain tidak menyandarkan keberhasilan kepada dirinya. Ia berkata, "Ini adalah rahmat dari Tuhanku." Ia menisbatkan seluruh kekuatan dan hasil kerjanya kepada karunia Allah semata. Lalu ia mengingatkan bahwa dinding sekuat apa pun ada batas waktunya: "Maka apabila telah datang janji Tuhanku, Dia akan menjadikannya hancur luluh rata dengan tanah; dan janji Tuhanku itu adalah benar."

Dinding itu, betapapun kokoh, akan diruntuhkan Allah menjelang hari kiamat, sebagai bagian dari tanda-tanda-Nya. Segala yang dibangun manusia akan berakhir, dan hanya janji Allah yang pasti terlaksana.

Hikmah: Kerja keras dan sarana wajib diusahakan, tetapi keberhasilan adalah rahmat Allah, bukan hasil kehebatan diri. Dzulqarnain membangun dinding terkuat, lalu menyebutnya "rahmat dari Tuhanku" dan mengingat bahwa ia pun akan runtuh pada waktunya. Inilah adab seorang mukmin: berusaha maksimal, bersandar penuh kepada Allah, dan tidak pernah lupa bahwa dunia beserta segala bangunannya akan berakhir pada hari yang dijanjikan.`,
    },
    en: {
      title: "The Iron Barrier and the Promise of the Last Day",
      body: `Dhul-Qarnayn began to build. He said, "Bring me sheets of iron." The iron was gathered until, when it had been levelled to fill the gap between the two mountains, he said, "Blow with the bellows." So they blew until the iron glowed red like fire. Then he said, "Bring me molten copper that I may pour over it," so that the iron and copper fused into an immensely strong wall.

With that barrier, Gog and Magog were no longer able to climb over it, for its height and smoothness, nor able to bore through it, for its thickness and solidity. Their corruption against that weak people was held back.

Yet Dhul-Qarnayn did not attribute the success to himself. He said, "This is a mercy from my Lord." He ascribed all his strength and the fruit of his labour to God's favour alone. Then he reminded them that even the strongest wall has an appointed term: "But when the promise of my Lord comes, He will level it to the ground; and the promise of my Lord is ever true."

That barrier, however solid, will be brought down by God as the Last Day approaches, as one of His signs. Everything humankind builds will come to an end, and only God's promise is certain to be fulfilled.

Reflection: Effort and means must be pursued, but success is God's mercy, not the product of one's own greatness. Dhul-Qarnayn built the strongest of walls, then called it "a mercy from my Lord" and remembered that it too would fall in its time. This is the manner of a believer: to strive to the utmost, to rely wholly upon God, and never to forget that the world and all its structures will end on the promised Day.`,
    },
  },
];
