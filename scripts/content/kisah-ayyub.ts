/**
 * "Kisah Nabi Ayyub AS" — a complete, fully-grounded series drawn from the two
 * places the Qur'an tells his story: Al-Anbiya (21:83-84) and Sad (38:41-44).
 * Ayyub is the Qur'an's foremost example of patience through severe affliction:
 * a servant who called upon his Lord with perfect adab, whose distress was
 * lifted, whose family was restored, and whom Allah praised as "an excellent
 * servant, ever turning back [to Him]." Concise but complete — ayat-cited, no
 * hadith/Isra'iliyyat added (docs/CONTENT-POLICY.md). ai_generated=0,
 * status='published'.
 */

export interface AyyubEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_AYYUB_SERIES: AyyubEpisode[] = [
  {
    slug: "kisah-ayyub-01-ujian-dan-kesabaran",
    surahId: 38,
    ayahStart: 41,
    ayahEnd: 41,
    id: {
      title: "Episode 1: Ujian Berat dan Kesabaran Ayyub",
      body: `Nabi Ayyub adalah teladan utama kesabaran dalam Al-Qur'an. Ia diuji dengan penderitaan yang berat — penyakit yang menahun, kehilangan harta, dan kehilangan keluarga — namun ia tetap teguh dalam keimanan. Allah berfirman, "Dan ingatlah akan hamba Kami Ayyub ketika dia menyeru Tuhannya, ‘Sesungguhnya aku diganggu setan dengan kepayahan dan siksaan’" (QS. Sad: 41).

Yang luar biasa dari Ayyub adalah bahwa dalam pengaduannya kepada Allah, tidak ada sepatah kata pun keluhan yang menunjukkan ketidakrelaan atas takdir. Ia mengadu tentang penderitaannya, tetapi hatinya tetap tunduk dan berbaik sangka kepada Tuhannya.

Kesabaran Ayyub bukanlah kesabaran orang yang tak merasakan sakit, melainkan kesabaran orang yang merasakan sakit sepenuhnya namun tetap memilih tunduk kepada Allah. Inilah yang membuat namanya diabadikan sebagai lambang kesabaran hingga akhir zaman.

Hikmah: ujian tidak menandakan Allah membenci hamba-Nya; sering kali justru menjadi jalan mengangkat derajatnya. Ayyub mengajarkan bahwa boleh saja seorang hamba merasakan sakit dan mengadu kepada Allah, selama hatinya tetap ridha terhadap ketetapan-Nya.`,
    },
    en: {
      title: "Episode 1: A Severe Trial and the Patience of Ayyub",
      body: `Prophet Ayyub (Job) is the Qur'an's foremost example of patience. He was tested with heavy suffering — a prolonged illness, the loss of wealth, and the loss of family — yet he remained firm in faith. Allah said, "And remember Our servant Ayyub, when he called to his Lord, 'Indeed, Satan has touched me with hardship and torment'" (Qur'an 38:41).

What is remarkable about Ayyub is that in his complaint to Allah, there was not a single word showing displeasure with his fate. He complained of his suffering, yet his heart remained submissive and full of good expectation of his Lord.

Ayyub's patience was not that of one who feels no pain, but that of one who feels the pain fully and still chooses to submit to Allah. This is what made his name immortalized as a symbol of patience until the end of time.

Reflection: a trial does not mean Allah hates His servant; often it is a way of raising his rank. Ayyub teaches that a servant may feel pain and complain to Allah, so long as his heart remains content with His decree.`,
    },
  },
  {
    slug: "kisah-ayyub-02-doa-yang-penuh-adab",
    surahId: 21,
    ayahStart: 83,
    ayahEnd: 83,
    id: {
      title: "Episode 2: Doa yang Penuh Adab",
      body: `Setelah bertahun-tahun bersabar, Ayyub menengadahkan doa kepada Allah. Namun perhatikanlah betapa indah dan penuh adab doanya. Allah berfirman, "Dan (ingatlah kisah) Ayyub, ketika dia berdoa kepada Tuhannya, ‘(Ya Tuhanku,) sesungguhnya aku telah ditimpa penyakit, padahal Engkau Tuhan Yang Maha Penyayang dari semua yang penyayang’" (QS. Al-Anbiya: 83).

Dalam doa itu, Ayyub tidak secara langsung meminta agar penyakitnya diangkat. Ia hanya menyebutkan keadaan dirinya — "aku telah ditimpa penyakit" — lalu menyandarkan sepenuhnya kepada sifat Allah — "Engkau Tuhan Yang Maha Penyayang." Ia menyerahkan hasilnya kepada kebijaksanaan dan kasih sayang Allah, tanpa memaksakan permintaan.

Inilah puncak adab dalam berdoa: menyampaikan keadaan diri dengan rendah hati, lalu bertawakal penuh kepada rahmat Allah, yakin bahwa Dia lebih tahu apa yang terbaik.

Hikmah: doa yang paling mulia bukanlah yang paling banyak menuntut, melainkan yang paling penuh adab dan tawakal. Ayyub mengajarkan bahwa cukuplah kita mengadukan keadaan kepada Allah, sebab Dia Maha Mengetahui kebutuhan kita bahkan sebelum kita meminta.`,
    },
    en: {
      title: "Episode 2: A Prayer Full of Courtesy",
      body: `After years of patience, Ayyub raised a prayer to Allah. Yet notice how beautiful and full of courtesy his prayer was. Allah said, "And [mention] Ayyub, when he called to his Lord, '(O my Lord,) indeed, adversity has touched me, and You are the Most Merciful of the merciful'" (Qur'an 21:83).

In that prayer, Ayyub did not directly ask for his illness to be lifted. He merely mentioned his condition — "adversity has touched me" — then leaned entirely upon Allah's attribute — "You are the Most Merciful of the merciful." He left the outcome to Allah's wisdom and mercy, without pressing his request.

This is the height of courtesy in supplication: to state one's condition humbly, then rely wholly upon Allah's mercy, certain that He knows best what is good.

Reflection: the noblest prayer is not the one that demands the most, but the one most full of courtesy and reliance. Ayyub teaches that it is enough to lay our condition before Allah, for He knows our needs even before we ask.`,
    },
  },
  {
    slug: "kisah-ayyub-03-kesembuhan-dan-mata-air",
    surahId: 38,
    ayahStart: 42,
    ayahEnd: 43,
    id: {
      title: "Episode 3: Kesembuhan dan Mata Air yang Menyejukkan",
      body: `Allah menjawab doa Ayyub dengan pertolongan yang nyata. Dia memerintahkan Ayyub untuk menghentakkan kakinya ke tanah, lalu memancarlah mata air yang menjadi sarana kesembuhannya. Allah berfirman, "(Allah berfirman,) ‘Hentakkanlah kakimu (ke tanah). Inilah air yang sejuk untuk mandi dan untuk minum’" (QS. Sad: 42).

Dengan air itu, penderitaan Ayyub yang telah menahun akhirnya diangkat. Allah menegaskan dalam Surah Al-Anbiya, "Maka Kami kabulkan (doa)nya, lalu Kami lenyapkan penyakit yang ada padanya, dan Kami kembalikan keluarganya kepadanya, dan (Kami lipat gandakan jumlah mereka) sebagai suatu rahmat dari Kami, dan untuk menjadi peringatan bagi semua yang menyembah Allah" (QS. Al-Anbiya: 84).

Allah bukan hanya menyembuhkan Ayyub, tetapi juga mengembalikan keluarganya bahkan melipatgandakannya. Kesabaran yang panjang itu berbuah rahmat yang berlipat.

Hikmah: setelah kesulitan pasti ada kemudahan. Pertolongan Allah datang di waktu yang Dia tetapkan, sering kali melalui sarana yang sederhana — cukup dengan sepancar mata air. Yang penting bagi seorang hamba adalah bertahan dalam kesabaran hingga rahmat itu tiba.`,
    },
    en: {
      title: "Episode 3: Healing and a Cooling Spring",
      body: `Allah answered Ayyub's prayer with a clear relief. He commanded Ayyub to strike the ground with his foot, and a spring gushed forth that became the means of his healing. Allah said, "[Allah said], 'Strike [the ground] with your foot; this is a cool bath and drink'" (Qur'an 38:42).

With that water, Ayyub's long-standing suffering was finally lifted. Allah affirmed in Surah Al-Anbiya, "So We responded to him and removed what afflicted him of adversity. And We gave him [back] his family and the like thereof with them, as mercy from Us and a reminder for the worshippers [of Allah]" (21:84).

Allah did not merely heal Ayyub, but also restored his family and even multiplied them. That long patience bore fruit in doubled mercy.

Reflection: after hardship there is surely ease. Allah's relief comes at the time He appoints, often through a simple means — merely a gushing spring. What matters for a servant is to endure in patience until that mercy arrives.`,
    },
  },
  {
    slug: "kisah-ayyub-04-hamba-yang-sebaik-baiknya",
    surahId: 38,
    ayahStart: 44,
    ayahEnd: 44,
    id: {
      title: "Episode 4: Sebaik-Baik Hamba yang Selalu Kembali kepada Allah",
      body: `Al-Qur'an menutup kisah Ayyub dengan pujian yang paling tinggi bagi seorang hamba. Allah berfirman, "Dan ambillah seikat (rumput) dengan tanganmu, lalu pukullah dengan itu dan janganlah engkau melanggar sumpah. Sesungguhnya Kami mendapatinya (Ayyub) seorang yang sabar. Dialah sebaik-baik hamba. Sesungguhnya dia sangat taat (kepada Allah)" (QS. Sad: 44).

Ayat ini memuji Ayyub dengan tiga sifat sekaligus: "seorang yang sabar" (shabir), "sebaik-baik hamba" (ni'mal 'abd), dan "sangat taat, selalu kembali kepada Allah" (awwab). Ketiganya adalah buah dari ujian panjang yang ia lalui dengan keteguhan.

Perintah tentang seikat rumput itu menunjukkan kelembutan Allah: Ayyub pernah bersumpah dalam suatu urusan, dan Allah memberinya jalan keluar yang ringan agar sumpahnya tetap tertunaikan tanpa melampaui batas — sebuah bukti bahwa Allah tidak menghendaki kesulitan bagi hamba-Nya yang taat.

Hikmah: puncak dari kesabaran adalah meraih rida dan pujian Allah. Ayyub mengajarkan bahwa penderitaan yang dihadapi dengan kesabaran dan ketaatan tidak akan pernah sia-sia — ia justru mengangkat seorang hamba menjadi "sebaik-baik hamba" di sisi Tuhannya.`,
    },
    en: {
      title: "Episode 4: An Excellent Servant, Ever Turning Back to Allah",
      body: `The Qur'an closes the story of Ayyub with the highest praise for a servant. Allah said, "And [We said], 'Take in your hand a bunch [of grass] and strike with it, and do not break your oath.' Indeed, We found him patient, an excellent servant. Indeed, he was one repeatedly turning back [to Allah]" (Qur'an 38:44).

This verse praises Ayyub with three qualities at once: "patient" (sabir), "an excellent servant" (ni'mal 'abd), and "ever turning back to Allah" (awwab). All three were the fruit of the long trial he passed through with steadfastness.

The command about the bunch of grass shows Allah's gentleness: Ayyub had made an oath in a certain matter, and Allah gave him a light way out so his oath could be fulfilled without transgression — a proof that Allah desires no hardship for His obedient servant.

Reflection: the summit of patience is to attain Allah's pleasure and praise. Ayyub teaches that suffering met with patience and obedience is never wasted — rather, it raises a servant to become "an excellent servant" before his Lord.`,
    },
  },
];
