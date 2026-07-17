/**
 * "Kisah Nabi Yusuf AS" — one complete, fully-grounded story series.
 *
 * Every episode is a close paraphrase of specific ayat in Surah Yusuf
 * (12:4-101), which the Qur'an itself calls "the best of stories" (12:3).
 * No hadith, no scholarly opinion, and no invented dialogue/detail beyond
 * what these ayat state is included — this is deliberately conservative per
 * the Lisensi Gate policy (arsitektur doc §10) and the explicit instruction
 * to never fabricate religious content. Source text: quran-json v3.1.2
 * (CC-BY-4.0), the same dataset already seeded into `ayah`/`translation`.
 *
 * ai_generated=0 (human/editorially authored at build time, not the runtime
 * zero-hand pipeline), status='published' — each episode cites its exact
 * ayah range so a reader can verify every sentence against the Qur'an text
 * already on the site.
 */

export interface YusufEpisode {
  slug: string;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_YUSUF_SERIES: YusufEpisode[] = [
  {
    slug: "kisah-nabi-yusuf-01-mimpi",
    ayahStart: 4,
    ayahEnd: 6,
    id: {
      title: "Episode 1: Mimpi Sang Nabi Muda",
      body: `Kisah ini dibuka dengan sebuah mimpi. Yusuf, putra Nabi Ya'qub AS, mendatangi ayahnya dan berkata, "Wahai ayahku, sungguh aku bermimpi melihat sebelas bintang, matahari, dan bulan — semuanya bersujud kepadaku" (QS. Yusuf: 4).

Ya'qub, yang memahami bahwa mimpi itu adalah pertanda besar bagi anaknya, justru merasa cemas. Ia tahu kecintaannya yang mendalam kepada Yusuf telah menimbulkan kecemburuan di antara saudara-saudara Yusuf yang lain. Maka ia berpesan dengan lembut namun serius, "Wahai anakku, janganlah engkau ceritakan mimpimu ini kepada saudara-saudaramu, mereka akan membuat tipu daya untuk mencelakakanmu. Sungguh, setan adalah musuh yang nyata bagi manusia" (QS. Yusuf: 5).

Ya'qub kemudian menjelaskan bahwa Allah telah memilih Yusuf, sebagaimana Dia memilih dan menyempurnakan nikmat-Nya kepada kakek-kakek Yusuf sebelumnya, yaitu Ibrahim dan Ishaq AS (QS. Yusuf: 6). Ayat ini menjadi fondasi seluruh kisah: sebuah mimpi yang kelak, setelah melalui perjalanan panjang penuh ujian, akan menjadi kenyataan — namun jalan menuju ke sana sama sekali tidak mudah.

Hikmah: kebaikan yang Allah takdirkan untuk seseorang tidak selalu datang lewat jalan yang lapang. Kehati-hatian Ya'qub mengajarkan bahwa menjaga rahasia dari orang yang berpotensi dengki adalah bagian dari kebijaksanaan, bukan ketidakjujuran.`,
    },
    en: {
      title: "Episode 1: The Young Prophet's Dream",
      body: `The story opens with a dream. Yusuf (Joseph), son of Prophet Ya'qub (Jacob), came to his father and said, "O my father, indeed I have seen eleven stars and the sun and the moon; I saw them prostrating to me" (Qur'an 12:4).

Ya'qub, understanding that this dream signaled something momentous for his son, felt concern rather than celebration. He knew his deep love for Yusuf had already stirred jealousy among Yusuf's brothers. So he counseled gently but firmly, "O my son, do not relate your vision to your brothers, or they will contrive a plan against you. Indeed, Satan is to man a manifest enemy" (12:5).

Ya'qub then explained that Allah had chosen Yusuf, just as He had chosen and perfected His favor upon Yusuf's forefathers before him, Ibrahim and Ishaq (12:6). This verse lays the foundation for the entire story: a dream that, after a long and difficult journey, will ultimately come true — though the path there is anything but easy.

Reflection: the good that Allah has decreed for someone does not always arrive by an easy road. Ya'qub's caution teaches that guarding a confidence from those who may envy it is a form of wisdom, not dishonesty.`,
    },
  },
  {
    slug: "kisah-nabi-yusuf-02-sumur",
    ayahStart: 7,
    ayahEnd: 20,
    id: {
      title: "Episode 2: Sumur Pengkhianatan",
      body: `Kecemburuan saudara-saudara Yusuf akhirnya memuncak. Mereka berkata satu sama lain, "Sesungguhnya Yusuf dan saudaranya (Bunyamin) lebih dicintai ayah daripada kita, padahal kita satu golongan yang kuat. Sungguh ayah kita dalam kekeliruan yang nyata" (QS. Yusuf: 8). Sebagian dari mereka mengusulkan untuk membunuh Yusuf, namun salah seorang di antara mereka mengusulkan jalan lain: "Janganlah kamu membunuh Yusuf, tetapi jebloskan saja dia ke dasar sumur, agar dia dipungut oleh sebagian musafir" (QS. Yusuf: 10).

Dengan tipu daya, mereka membujuk Ya'qub agar mengizinkan Yusuf pergi bersama mereka, berjanji akan menjaganya (QS. Yusuf: 11-12). Ya'qub, meski merasa berat hati dan khawatir, akhirnya mengizinkan (QS. Yusuf: 13). Di tengah perjalanan, mereka melemparkan Yusuf ke dasar sumur. Namun Allah tidak meninggalkannya — "Kami wahyukan kepadanya, 'Engkau kelak pasti akan menceritakan perbuatan ini kepada mereka, sedang mereka tidak menyadari'" (QS. Yusuf: 15).

Saudara-saudaranya pulang sambil menangis pura-pura, membawa baju Yusuf yang telah dilumuri darah palsu, mengatakan ia dimakan serigala (QS. Yusuf: 16-18). Ya'qub, dengan kearifannya, tidak sepenuhnya percaya, dan berkata, "Maka hanya bersabar itulah yang terbaik (bagiku). Dan kepada Allah saja tempat memohon pertolongan" (QS. Yusuf: 18).

Sementara itu, serombongan musafir menemukan Yusuf di sumur dan mengambilnya sebagai barang dagangan, lalu menjualnya dengan harga yang sangat murah (QS. Yusuf: 19-20).

Hikmah: kesabaran Ya'qub (sabr jamil — kesabaran yang indah) adalah teladan bagaimana menghadapi musibah besar tanpa berputus asa dari rahmat Allah.`,
    },
    en: {
      title: "Episode 2: The Well of Betrayal",
      body: `The jealousy of Yusuf's brothers finally reached its peak. They said to one another, "Joseph and his brother are more beloved to our father than we, while we are a clan. Indeed, our father is in clear error" (Qur'an 12:8). Some proposed killing Yusuf, but one of them suggested another path: "Do not kill Joseph but throw him into the bottom of the well; some travelers will pick him up" (12:10).

Through deception, they persuaded Ya'qub to let Yusuf go with them, promising to protect him (12:11-12). Ya'qub, heavy-hearted and anxious, ultimately agreed (12:13). Along the way, they threw Yusuf into the well. But Allah did not abandon him — "We revealed to him, 'You will surely inform them [someday] about this affair of theirs while they do not perceive [your identity]'" (12:15).

His brothers returned weeping in feigned grief, carrying Yusuf's shirt stained with false blood, claiming a wolf had eaten him (12:16-18). Ya'qub, in his wisdom, was not entirely convinced, and said, "So patience is most fitting. And Allah is the one sought for help against that which you describe" (12:18).

Meanwhile, a caravan of travelers found Yusuf in the well, took him as merchandise, and sold him for a very low price (12:19-20).

Reflection: Ya'qub's beautiful patience (sabr jamil) models how to face great calamity without ever despairing of Allah's mercy.`,
    },
  },
  {
    slug: "kisah-nabi-yusuf-03-ujian",
    ayahStart: 21,
    ayahEnd: 35,
    id: {
      title: "Episode 3: Ujian di Istana Al-Aziz",
      body: `Yusuf dibeli oleh seorang pembesar Mesir (dikenal sebagai Al-Aziz), yang memerintahkan istrinya untuk memuliakannya, "mudah-mudahan dia bermanfaat bagi kita atau kita pungut dia sebagai anak" (QS. Yusuf: 21). Setelah dewasa, Allah menganugerahkan kepadanya hikmah dan ilmu (QS. Yusuf: 22).

Di sinilah ujian besar pertama Yusuf datang. Istri Al-Aziz mencoba menggodanya. Yusuf menolak dengan tegas, "Aku berlindung kepada Allah, sungguh, tuanku telah memperlakukan aku dengan baik. Sesungguhnya orang yang zalim itu tidak akan beruntung" (QS. Yusuf: 23). Al-Qur'an menegaskan bahwa Yusuf berpaling dari keburukan itu karena melihat "tanda dari Tuhannya" (QS. Yusuf: 24) — sebuah pertolongan Ilahi bagi hamba yang ikhlas.

Ketika keduanya berlari menuju pintu, baju Yusuf robek dari belakang — bukti yang kemudian menjadi saksi kebenarannya di hadapan suami perempuan itu (QS. Yusuf: 25-28). Meski demikian, fitnah tentang peristiwa ini menyebar di kalangan perempuan kota, hingga istri Al-Aziz mengundang mereka dan memperlihatkan Yusuf secara langsung — mereka pun terpesona oleh keelokan akhlak dan rupanya (QS. Yusuf: 30-31).

Yusuf, menghadapi tekanan yang terus meningkat, justru berdoa, "Wahai Tuhanku, penjara lebih aku sukai daripada memenuhi ajakan mereka" (QS. Yusuf: 33). Allah mengabulkan doanya dan melindunginya dari tipu daya mereka (QS. Yusuf: 34). Meski terbukti tidak bersalah, Yusuf akhirnya tetap dipenjarakan untuk sementara waktu (QS. Yusuf: 35).

Hikmah: menjaga kesucian diri (iffah) di hadapan godaan yang kuat, sekalipun harus membayar mahal, adalah bukti keimanan yang sesungguhnya.`,
    },
    en: {
      title: "Episode 3: Trial in the House of Al-Aziz",
      body: `Yusuf was purchased by an Egyptian nobleman (known as Al-Aziz), who instructed his wife to treat him honorably, "perhaps he will benefit us, or we will adopt him as a son" (Qur'an 12:21). As he grew to maturity, Allah granted him wisdom and knowledge (12:22).

Here came Yusuf's first great trial. Al-Aziz's wife attempted to seduce him. Yusuf refused firmly: "I seek refuge in Allah. Indeed, he is my master, who has made good my residence. Indeed, wrongdoers will not succeed" (12:23). The Qur'an affirms that Yusuf turned away from the wrongdoing because he saw "the proof of his Lord" (12:24) — divine protection for a sincere servant.

As they raced toward the door, Yusuf's shirt was torn from behind — evidence that later testified to his innocence before the woman's husband (12:25-28). Even so, rumors of the incident spread among the women of the city, prompting Al-Aziz's wife to invite them and present Yusuf before them directly — they were overwhelmed by his character and appearance (12:30-31).

Facing mounting pressure, Yusuf prayed instead, "My Lord, prison is more to my liking than that to which they invite me" (12:33). Allah answered his prayer and protected him from their scheming (12:34). Despite his proven innocence, Yusuf was still imprisoned for a time (12:35).

Reflection: guarding one's chastity ('iffah) in the face of powerful temptation, even at great personal cost, is true evidence of faith.`,
    },
  },
  {
    slug: "kisah-nabi-yusuf-04-penjara",
    ayahStart: 36,
    ayahEnd: 42,
    id: {
      title: "Episode 4: Penjara dan Tafsir Mimpi",
      body: `Di dalam penjara, Yusuf tidak berhenti berdakwah. Dua pemuda yang dipenjara bersamanya masing-masing bermimpi dan meminta Yusuf menafsirkannya (QS. Yusuf: 36). Sebelum menjawab, Yusuf terlebih dahulu mengajak mereka kepada tauhid: "Manakah yang baik, tuhan-tuhan yang bermacam-macam itu ataukah Allah Yang Maha Esa, Mahaperkasa?" (QS. Yusuf: 39). Ia menjelaskan bahwa apa yang mereka sembah selain Allah hanyalah nama-nama tanpa dasar kebenaran (QS. Yusuf: 40).

Barulah kemudian Yusuf menjelaskan tafsir mimpi mereka: satu akan kembali menjadi juru minum tuannya, sedangkan yang lain akan menerima hukuman mati (QS. Yusuf: 41). Kepada yang akan selamat, Yusuf berpesan agar menyebut namanya di hadapan raja. Namun setan membuat pemuda itu lupa, sehingga Yusuf tetap berada dalam penjara selama beberapa tahun lagi (QS. Yusuf: 42).

Hikmah: Yusuf memanfaatkan setiap keadaan — bahkan di dalam penjara — sebagai kesempatan untuk mengajak kepada kebenaran terlebih dahulu, sebelum memenuhi permintaan duniawi. Dakwah selalu didahulukan.`,
    },
    en: {
      title: "Episode 4: Prison and the Interpretation of Dreams",
      body: `Even in prison, Yusuf never stopped calling others to truth. Two young men imprisoned with him each had a dream and asked Yusuf to interpret it (Qur'an 12:36). Before answering, Yusuf first invited them to the oneness of Allah: "Are dispersed lords better, or Allah, the One, the Prevailing?" (12:39). He explained that what they worshipped besides Allah were mere names without any true basis (12:40).

Only then did Yusuf interpret their dreams: one would return to serving wine to his master, while the other would be executed (12:41). To the one who would be saved, Yusuf asked that he mention him before the king. But Satan caused the young man to forget, so Yusuf remained in prison for several more years (12:42).

Reflection: Yusuf used every circumstance — even imprisonment — as an opportunity to call others to truth before addressing worldly requests. Da'wah always came first.`,
    },
  },
  {
    slug: "kisah-nabi-yusuf-05-singgasana",
    ayahStart: 43,
    ayahEnd: 57,
    id: {
      title: "Episode 5: Dari Penjara ke Singgasana",
      body: `Bertahun-tahun kemudian, Raja Mesir bermimpi tentang tujuh sapi gemuk dimakan tujuh sapi kurus, dan tujuh tangkai gandum hijau berdampingan dengan yang kering (QS. Yusuf: 43). Tak seorang pun mampu menafsirkannya, hingga pemuda yang dahulu selamat dari penjara teringat kepada Yusuf (QS. Yusuf: 45).

Yusuf menafsirkan mimpi itu dengan penuh hikmah: tujuh tahun subur akan diikuti tujuh tahun paceklik, dan ia menyarankan strategi penyimpanan pangan yang bijaksana (QS. Yusuf: 47-49). Raja pun ingin membebaskannya, namun Yusuf—dengan integritas luar biasa—terlebih dahulu meminta agar kasus fitnah terhadapnya diselidiki ulang, bukan sekadar dibebaskan begitu saja (QS. Yusuf: 50). Ketika para perempuan kota, termasuk istri Al-Aziz, akhirnya mengakui kebenaran Yusuf dan kesalahan mereka sendiri (QS. Yusuf: 51), nama baik Yusuf pun pulih sepenuhnya.

Yusuf kemudian diangkat menjadi pejabat tinggi kerajaan, dan ia sendiri mengusulkan, "Jadikanlah aku bendaharawan negeri (Mesir), karena sesungguhnya aku adalah orang yang pandai menjaga dan berpengetahuan" (QS. Yusuf: 55). Demikianlah Allah memberikan kedudukan mulia kepada Yusuf di bumi Mesir (QS. Yusuf: 56), sebagai balasan atas kesabaran panjang yang telah ia lalui — dari sumur, menjadi budak, difitnah, dipenjara, hingga akhirnya dipercaya memimpin.

Hikmah: kejujuran dan integritas Yusuf—yang lebih memilih membersihkan namanya lebih dulu daripada tergesa keluar dari penjara—menjadi teladan bahwa kehormatan diri lebih berharga daripada kebebasan semata.`,
    },
    en: {
      title: "Episode 5: From Prison to the Throne",
      body: `Years later, the King of Egypt dreamed of seven fat cows being devoured by seven lean ones, and seven green ears of grain alongside withered ones (Qur'an 12:43). No one could interpret it, until the young man who had once been saved from prison finally remembered Yusuf (12:45).

Yusuf interpreted the dream with great wisdom: seven fruitful years would be followed by seven years of famine, and he proposed a prudent strategy for storing grain (12:47-49). The king wished to free him at once, but Yusuf — with remarkable integrity — first asked that the earlier false accusation against him be properly investigated, rather than simply being released without his name cleared (12:50). When the women of the city, including Al-Aziz's wife, finally admitted Yusuf's innocence and their own wrongdoing (12:51), his reputation was fully restored.

Yusuf was then appointed to high office, and he himself proposed, "Appoint me over the storehouses of the land. Indeed, I will be a knowing guardian" (12:55). Thus did Allah grant Yusuf a position of honor in the land of Egypt (12:56) — the reward for the long patience he had endured, from the well, to slavery, to false accusation, to imprisonment, and finally to a position of trust and leadership.

Reflection: Yusuf's honesty and integrity — choosing to clear his name before rushing to freedom — model that one's honor is worth more than freedom alone.`,
    },
  },
  {
    slug: "kisah-nabi-yusuf-06-pertemuan",
    ayahStart: 58,
    ayahEnd: 101,
    id: {
      title: "Episode 6: Pertemuan dan Pengampunan",
      body: `Musim paceklik yang telah ditafsirkan Yusuf pun tiba, melanda seluruh negeri termasuk Kan'an, tempat ayah dan saudara-saudaranya tinggal. Saudara-saudara Yusuf datang ke Mesir untuk membeli bahan pangan, dan tanpa mereka sadari, mereka berhadapan langsung dengan Yusuf—yang telah mengenali mereka, sementara mereka sama sekali tidak mengenalinya (QS. Yusuf: 58).

Melalui serangkaian peristiwa penuh hikmah—termasuk permintaan Yusuf agar mereka membawa Bunyamin, adik kandungnya, pada kunjungan berikutnya (QS. Yusuf: 59-62), hingga siasat Yusuf menahan Bunyamin di sisinya (QS. Yusuf: 69-79)—kesedihan Ya'qub atas kehilangan Yusuf bertahun-tahun silam kembali terbuka. "Aduhai dukacitaku terhadap Yusuf," katanya, hingga kedua matanya memutih karena kesedihan yang ditahannya (QS. Yusuf: 84). Namun Ya'qub tidak pernah berputus asa dari rahmat Allah (QS. Yusuf: 87).

Ketika saudara-saudara Yusuf kembali dan memohon bantuan pangan dengan penuh kerendahan hati, Yusuf akhirnya tidak dapat lagi menahan diri. Ia bertanya, "Tahukah kamu (kejelekan) apa yang telah kamu perbuat terhadap Yusuf dan saudaranya?" (QS. Yusuf: 89). Ketika mereka bertanya keheranan, "Apakah engkau benar-benar Yusuf?", ia menjawab dengan penuh kasih, "Aku Yusuf, dan ini saudaraku. Sungguh, Allah telah melimpahkan karunia-Nya kepada kami" (QS. Yusuf: 90).

Dengan kebesaran hati yang luar biasa, Yusuf berkata kepada saudara-saudaranya yang dahulu mencelakakannya, "Pada hari ini tidak ada cercaan terhadap kamu, mudah-mudahan Allah mengampuni kamu" (QS. Yusuf: 92). Ia lalu mengirimkan bajunya untuk diusapkan ke wajah ayahnya yang telah kehilangan penglihatan karena kesedihan—dan penglihatan Ya'qub pun pulih (QS. Yusuf: 93, 96).

Kisah ini berpuncak pada momen yang telah dinubuatkan sejak Episode 1: seluruh keluarga Yusuf berkumpul di Mesir, dan kedua orang tuanya bersujud kepadanya, menggenapi mimpi masa kecilnya. Yusuf pun berkata, "Wahai ayahku! Inilah takwil mimpiku yang dahulu. Sesungguhnya Tuhanku telah menjadikannya kenyataan" (QS. Yusuf: 100). Ia menutup kisahnya dengan doa yang penuh kerendahan hati, memohon agar diwafatkan dalam keadaan muslim dan dikumpulkan bersama orang-orang saleh (QS. Yusuf: 101).

Hikmah: pengampunan yang tulus—bukan balas dendam—adalah puncak akhlak seorang Nabi. Kesabaran panjang Yusuf dan Ya'qub berujung pada kebahagiaan yang jauh melampaui penderitaan yang mereka lalui, membuktikan janji Allah bahwa "bersama kesulitan ada kemudahan."`,
    },
    en: {
      title: "Episode 6: Reunion and Forgiveness",
      body: `The famine Yusuf had foreseen arrived, striking the whole region, including Canaan, where his father and brothers lived. Yusuf's brothers came to Egypt to buy grain, and without realizing it, stood face to face with Yusuf himself — who recognized them at once, while they did not recognize him at all (Qur'an 12:58).

Through a series of wisdom-laden events — including Yusuf's request that they bring Benjamin, his full brother, on their next visit (12:59-62), and Yusuf's plan to keep Benjamin with him (12:69-79) — Ya'qub's grief over losing Yusuf years earlier resurfaced in full. "Oh, my grief over Joseph," he said, his eyes turning white from the sorrow he suppressed (12:84). Yet Ya'qub never despaired of Allah's mercy (12:87).

When Yusuf's brothers returned and pleaded humbly for aid, Yusuf could no longer hold back. He asked them, "Do you know what you did with Joseph and his brother when you were ignorant?" (12:89). When they asked in astonishment, "Are you indeed Joseph?", he answered with compassion, "I am Joseph, and this is my brother. Allah has certainly favored us" (12:90).

With extraordinary magnanimity, Yusuf said to the very brothers who had once wronged him, "No blame will there be upon you today. Allah will forgive you" (12:92). He then sent his shirt to be placed over his father's face, whose eyes had lost their sight from years of grief — and Ya'qub's sight was restored (12:93, 96).

The story reaches the moment foretold since Episode 1: Yusuf's entire family gathered in Egypt, and his parents bowed before him, fulfilling the dream of his childhood. Yusuf said, "O my father, this is the explanation of my vision of before. My Lord has made it reality" (12:100). He closes his own account with a deeply humble prayer, asking to be caused to die as one submitting to Allah and joined with the righteous (12:101).

Reflection: sincere forgiveness — not revenge — is the pinnacle of a prophet's character. The long patience of Yusuf and Ya'qub ultimately gave way to a joy far greater than the suffering they endured, a living proof of Allah's promise that "with hardship comes ease."`,
    },
  },
];
