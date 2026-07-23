/**
 * "Kisah Nabi Ilyas AS" — the messenger sent to a people who worshipped an idol
 * called Ba'l, calling them back to Allah alone. The Qur'an tells his story
 * mainly in As-Saffat (37:123-132) and names him among the righteous in Al-An'am
 * (6:85). The Qur'an gives the essential arc — his call, his people's denial,
 * the rescue of the sincere, and the everlasting greeting of peace upon him —
 * without a long narrative, so this series stays close to the ayat and marks any
 * traditional identification as uncertain (docs/CONTENT-POLICY.md). Each episode
 * ends with a "Sumber & Catatan / Source & Note" line. ai_generated=0,
 * status='published'.
 */

export interface IlyasEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_ILYAS_SERIES: IlyasEpisode[] = [
  {
    slug: "kisah-ilyas-01-seruan-meninggalkan-baal",
    surahId: 37,
    ayahStart: 123,
    ayahEnd: 126,
    id: {
      title: "Episode 1: Ilyas Menyeru Kaumnya Meninggalkan Berhala Ba'l",
      body: `Nabi Ilyas adalah salah seorang rasul yang diutus Allah kepada kaum yang telah tersesat menyembah berhala. Allah menegaskan kerasulannya, "Dan sungguh, Ilyas benar-benar termasuk salah seorang rasul" (QS. As-Saffat: 123).

Kaumnya menyembah sebuah berhala bernama Ba'l, meninggalkan Allah yang menciptakan mereka. Maka Ilyas datang dengan seruan yang sama seperti seluruh nabi: mengesakan Allah. Allah berfirman, "(Ingatlah) ketika dia (Ilyas) berkata kepada kaumnya, ‘Mengapa kamu tidak bertakwa? Patutkah kamu menyembah Ba'l dan kamu tinggalkan (Allah) sebaik-baik pencipta, (yaitu) Allah Tuhanmu dan Tuhan nenek moyangmu yang terdahulu?’" (QS. As-Saffat: 124-126).

Perhatikan cara Ilyas berhujjah: ia mengingatkan bahwa Allah adalah "sebaik-baik pencipta" dan "Tuhan nenek moyang yang terdahulu". Ia mengajak akal mereka berpikir — bagaimana mungkin meninggalkan Pencipta yang sebenarnya demi menyembah patung Ba'l yang tidak mencipta apa pun?

Hikmah: inti dakwah setiap nabi adalah mengembalikan manusia kepada tauhid. Ilyas mengajarkan bahwa menyembah selain Allah adalah menukar Sang Pencipta dengan sesuatu yang tak berdaya — sebuah kesesatan yang harus diluruskan dengan kelembutan sekaligus ketegasan.

Sumber & Catatan: seluruh episode ini bersandar pada Al-Qur'an, QS. As-Saffat: 123-126 (teks & terjemahan dari dataset quran-json). "Ba'l" adalah nama berhala yang disebut langsung dalam ayat. Sebagian riwayat menyebut kaum Ilyas tinggal di daerah Ba'labakk; keterangan geografis semacam ini berasal dari tradisi/tafsir, bukan bagian dari nas, sehingga tidak dijadikan kepastian.`,
    },
    en: {
      title: "Episode 1: Ilyas Calls His People to Abandon the Idol Ba'l",
      body: `Prophet Ilyas (Elijah) was one of the messengers Allah sent to a people who had gone astray worshipping an idol. Allah affirmed his messengership: "And indeed, Ilyas was from among the messengers" (Qur'an 37:123).

His people worshipped an idol named Ba'l, abandoning the Allah who created them. So Ilyas came with the same call as every prophet: to devote worship to Allah alone. Allah said, "[Mention] when he said to his people, 'Will you not fear Allah? Do you call upon Ba'l and leave the best of creators — Allah, your Lord and the Lord of your first forefathers?'" (Qur'an 37:124-126).

Notice how Ilyas argues: he reminds them that Allah is "the best of creators" and "the Lord of your first forefathers." He appeals to their reason — how could they leave the true Creator to worship a statue of Ba'l that creates nothing?

Reflection: the core of every prophet's call is to return people to tawhid. Ilyas teaches that worshipping other than Allah is trading the Creator for something powerless — a straying that must be corrected with both gentleness and firmness.

Source & Note: this entire episode rests on the Qur'an, 37:123-126 (text & translation from the quran-json dataset). "Ba'l" is the idol's name stated directly in the ayah. Some reports say Ilyas's people lived in the area of Ba'labakk; such geographic notes come from tradition/tafsir, not from the text, so they are not treated as certain.`,
    },
  },
  {
    slug: "kisah-ilyas-02-penolakan-dan-keselamatan-yang-ikhlas",
    surahId: 37,
    ayahStart: 127,
    ayahEnd: 128,
    id: {
      title: "Episode 2: Penolakan Kaum dan Keselamatan Hamba yang Ikhlas",
      body: `Sebagaimana banyak nabi sebelumnya, seruan Ilyas ditolak oleh mayoritas kaumnya. Mereka tetap berpegang pada berhala Ba'l dan mendustakan utusan Allah. Allah berfirman, "Maka mereka mendustakannya (Ilyas), karena itu mereka pasti akan diseret (ke neraka), kecuali hamba-hamba Allah yang dibersihkan (dari dosa)" (QS. As-Saffat: 127-128).

Ayat ini menyisakan secercah harapan di tengah ancaman: tidak semua binasa. "Hamba-hamba Allah yang ikhlas/dibersihkan" (al-mukhlashin) — yaitu mereka yang menerima seruan tauhid dan memurnikan ibadah hanya kepada Allah — dikecualikan dari azab. Mereka selamat karena keikhlasan mereka.

Ini menunjukkan keadilan Allah: yang mendustakan bertanggung jawab atas pilihannya, sedangkan yang beriman dengan tulus dilindungi. Dakwah seorang nabi tidak pernah sia-sia sekalipun ditolak mayoritas, karena selalu ada segelintir hati yang menerima cahaya kebenaran.

Hikmah: keselamatan sejati diraih oleh keikhlasan, bukan oleh mengikuti arus mayoritas. Ketika kebanyakan orang memilih kesesatan, seorang mukmin cukup memastikan dirinya termasuk "hamba-hamba Allah yang ikhlas".

Sumber & Catatan: dalil dari Al-Qur'an, QS. As-Saffat: 127-128. Makna "al-mukhlashin" (yang diikhlaskan/dibersihkan) mengikuti keterangan bahasa yang masyhur dalam tafsir; inti yang tegas dari ayat adalah: pendusta terancam azab, sedangkan hamba yang ikhlas selamat.`,
    },
    en: {
      title: "Episode 2: The People's Denial and the Rescue of the Sincere",
      body: `As with many prophets before him, Ilyas's call was rejected by the majority of his people. They clung to the idol Ba'l and denied Allah's messenger. Allah said, "And they denied him, so indeed, they will be brought [for punishment], except the chosen servants of Allah [who were purified]" (Qur'an 37:127-128).

This verse leaves a glimmer of hope amid the warning: not all were destroyed. "The chosen/purified servants of Allah" (al-mukhlashin) — those who accepted the call to tawhid and devoted worship to Allah alone — are excepted from the punishment. They are saved by their sincerity.

This shows Allah's justice: the deniers are answerable for their choice, while the sincere believers are protected. A prophet's da'wah is never wasted, even when rejected by the majority, because there are always a few hearts that receive the light of truth.

Reflection: true salvation is attained by sincerity, not by following the current of the majority. When most people choose misguidance, a believer need only ensure he is among "the sincere servants of Allah."

Source & Note: evidence from the Qur'an, 37:127-128. The meaning of "al-mukhlashin" (the sincere/purified) follows the well-known linguistic notes in tafsir; the clear point of the ayah is: the deniers are threatened with punishment, while the sincere servant is saved.`,
    },
  },
  {
    slug: "kisah-ilyas-03-salam-atas-ilyas",
    surahId: 37,
    ayahStart: 129,
    ayahEnd: 132,
    id: {
      title: "Episode 3: Salam Sejahtera atas Ilyas",
      body: `Al-Qur'an menutup kisah Ilyas dengan penghormatan tertinggi: salam yang diabadikan sepanjang masa. Allah berfirman, "Dan Kami abadikan untuk Ilyas (pujian) di kalangan orang-orang yang datang kemudian, ‘Salam sejahtera bagi Ilyas.’ Sungguh, demikianlah Kami memberi balasan kepada orang-orang yang berbuat baik. Sesungguhnya dia termasuk hamba-hamba Kami yang beriman" (QS. As-Saffat: 129-132).

Salam yang Allah abadikan ini menjadikan nama Ilyas dikenang harum oleh umat-umat sesudahnya. Allah menyebutnya dengan tiga pujian: "termasuk orang-orang yang berbuat baik" (al-muhsinin) dan "termasuk hamba-hamba Kami yang beriman" (al-mu'minin), setelah sebelumnya menegaskan bahwa ia benar-benar seorang rasul.

Di tempat lain, Allah menyebut Ilyas dalam barisan para nabi yang saleh, "Dan Zakariya, Yahya, Isa, dan Ilyas. Semuanya termasuk orang-orang yang saleh" (QS. Al-An'am: 85).

Hikmah: balasan bagi para muhsinin adalah nama yang harum dan salam yang abadi. Ilyas mengajarkan bahwa keteguhan menegakkan tauhid — meski ditolak kaumnya — pada akhirnya diabadikan Allah sebagai kemuliaan yang tak lekang oleh zaman.

Sumber & Catatan: dalil dari Al-Qur'an, QS. As-Saffat: 129-132 dan Al-An'am: 85. Catatan bacaan: pada ayat 130 sebagian qiraat membaca "salamun 'ala Ilyasin"; para ahli tafsir berbeda apakah "Ilyasin" bermakna Ilyas sendiri atau Ilyas beserta pengikutnya — perbedaan qiraat/tafsir ini disampaikan sebagai keterangan, bukan mengubah inti pujian atas Ilyas. Sebagian ulama juga menyebut riwayat yang mengidentikkan Ilyas dengan sosok lain; riwayat semacam itu tidak pasti dan tidak diperlukan untuk memahami ayat.`,
    },
    en: {
      title: "Episode 3: Peace Be upon Ilyas",
      body: `The Qur'an closes the story of Ilyas with the highest honor: a greeting of peace immortalized through the ages. Allah said, "And We left for him [favorable mention] among later generations: 'Peace upon Ilyas.' Indeed, We thus reward the doers of good. Indeed, he was of Our believing servants" (Qur'an 37:129-132).

This peace that Allah immortalized made the name of Ilyas remembered with honor by the nations after him. Allah describes him with three praises: "of the doers of good" (al-muhsinin) and "of Our believing servants" (al-mu'minin), after affirming that he was truly a messenger.

Elsewhere, Allah names Ilyas in the ranks of the righteous prophets: "And Zakariya and Yahya and Isa and Ilyas — all were of the righteous" (Qur'an 6:85).

Reflection: the reward of the doers of good is an honored name and an everlasting greeting of peace. Ilyas teaches that steadfastness in upholding tawhid — even when rejected by one's people — is in the end immortalized by Allah as an honor untouched by time.

Source & Note: evidence from the Qur'an, 37:129-132 and 6:85. A note on recitation: in verse 130 some recitations read "salamun 'ala Il-Yasin"; commentators differ over whether "Ilyasin" means Ilyas himself or Ilyas together with his followers — this difference of recitation/interpretation is offered as a note and does not change the core praise of Ilyas. Some scholars also mention reports identifying Ilyas with another figure; such reports are uncertain and unnecessary for understanding the ayat.`,
    },
  },
];
