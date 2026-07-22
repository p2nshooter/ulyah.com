/**
 * "Kisah Nabi Salih AS" — a complete, fully-grounded series on the prophet
 * sent to Thamud, drawn from Al-A'raf (7:73-79), Hud (11:61-68), Asy-Syu'ara
 * (26:141-159), Al-Qamar (54:23-31) and Ash-Shams (91:11-15): the call to
 * tawhid, the favor of secure homes carved in the mountains, the she-camel of
 * Allah as a clear sign, the sharing of the water, the hamstringing of the
 * she-camel, the shriek/earthquake that ended Thamud, and the salvation of
 * Salih and the believers.
 *
 * Conservative like the other series: each episode paraphrases specific ayat
 * and cites them, with no hadith, no scholarly opinion, and no invented detail
 * beyond what the ayat state (docs/CONTENT-POLICY.md). ai_generated=0,
 * status='published'.
 */

export interface SalihEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_SALIH_SERIES: SalihEpisode[] = [
  {
    slug: "kisah-salih-01-kaum-tsamud-dan-seruan-salih",
    surahId: 7,
    ayahStart: 73,
    ayahEnd: 73,
    id: {
      title: "Episode 1: Kaum Tsamud dan Seruan Nabi Salih",
      body: `Setelah kaum 'Ad binasa, Allah menjadikan kaum Tsamud sebagai kaum yang berkuasa di bumi. Mereka pun diberi seorang nabi dari kalangan mereka sendiri. Allah berfirman, "Dan kepada kaum Tsamud (Kami utus) saudara mereka, Salih. Dia berkata, ‘Wahai kaumku! Sembahlah Allah! Tidak ada tuhan (sesembahan) bagimu selain Dia’" (QS. Al-A'raf: 73).

Seruan itu sama seperti yang dibawa setiap nabi sebelumnya: kembali kepada tauhid. Dalam Surah Hud, Salih mengajak mereka bertobat, "Dialah yang menciptakan kamu dari bumi (tanah) dan menjadikan kamu pemakmurnya, maka mohonlah ampunan kepada-Nya, kemudian bertobatlah kepada-Nya. Sesungguhnya Tuhanku sangat dekat (rahmat-Nya) dan memperkenankan (doa hamba-Nya)" (QS. Hud: 61).

Salih juga menegaskan ketulusannya, seperti disebut dalam Surah Asy-Syu'ara, "Aku tidak meminta imbalan kepadamu atas ajakan itu; imbalanku hanyalah dari Tuhan seluruh alam" (QS. Asy-Syu'ara: 145).

Hikmah: pintu tobat selalu terbuka, dan Allah Maha Dekat lagi Maha Mengabulkan. Setiap nabi datang bukan untuk mempersulit manusia, melainkan untuk menuntun mereka kembali kepada Tuhan yang selalu siap menerima.`,
    },
    en: {
      title: "Episode 1: The People of Thamud and Salih's Call",
      body: `After the people of 'Ad perished, Allah made Thamud a people of power on the earth. They too were given a prophet from among themselves. Allah said, "And to Thamud [We sent] their brother Salih. He said, 'O my people, worship Allah; you have no deity other than Him'" (Qur'an 7:73).

That call was the same one every prophet before him carried: return to tawhid. In Surah Hud, Salih invited them to repent, "It is He who produced you from the earth and settled you in it, so ask forgiveness of Him and then repent to Him. Indeed, my Lord is near and responsive" (11:61).

Salih also affirmed his sincerity, as mentioned in Surah Asy-Syu'ara, "And I do not ask you for it any payment; my payment is only from the Lord of the worlds" (26:145).

Reflection: the door of repentance is always open, and Allah is ever-Near, ever-Responsive. Every prophet came not to burden people, but to guide them back to the Lord who is always ready to accept them.`,
    },
  },
  {
    slug: "kisah-salih-02-nikmat-rumah-di-gunung",
    surahId: 7,
    ayahStart: 74,
    ayahEnd: 74,
    id: {
      title: "Episode 2: Nikmat Istana di Dataran dan Rumah di Gunung",
      body: `Salih mengingatkan kaumnya akan karunia besar yang membuat mereka istimewa. Allah berfirman, "Dan ingatlah ketika Dia menjadikan kamu pengganti-pengganti (yang berkuasa) setelah kaum 'Ad dan menempatkan kamu di bumi. Di tempat yang datar kamu dirikan istana-istana, dan gunung-gunung kamu pahat menjadi rumah-rumah. Maka ingatlah nikmat-nikmat Allah dan janganlah kamu membuat kerusakan di bumi" (QS. Al-A'raf: 74).

Kaum Tsamud memiliki keahlian luar biasa: mereka memahat gunung-gunung batu menjadi tempat tinggal yang kokoh. Dalam Surah Asy-Syu'ara, Salih mengingatkan pula kenikmatan lain yang mereka nikmati, "Apakah kamu akan dibiarkan (tinggal) dengan aman dalam (segala) yang ada di sini — di dalam kebun-kebun dan mata air, tanaman-tanaman, dan pohon kurma yang mayangnya lembut? Dan kamu pahat gunung-gunung menjadi rumah dengan penuh kemahiran" (QS. Asy-Syu'ara: 146-149).

Namun keahlian dan kemakmuran itu membuat sebagian mereka lupa diri. Maka Salih menutup, "Maka bertakwalah kepada Allah dan taatlah kepadaku, dan janganlah kamu menaati perintah orang-orang yang melampaui batas" (QS. Asy-Syu'ara: 150-151).

Hikmah: kepandaian dan kemakmuran adalah nikmat yang menuntut tanggung jawab. Bila disyukuri, ia menjadi keberkahan; bila membuat sombong dan berbuat kerusakan, ia berubah menjadi sebab kebinasaan.`,
    },
    en: {
      title: "Episode 2: The Favor of Palaces on the Plains and Homes in the Mountains",
      body: `Salih reminded his people of the great favor that set them apart. Allah said, "And remember when He made you successors after the 'Ad and settled you in the land — on its plains you build palaces, and you carve homes out of the mountains. So remember the favors of Allah, and do not commit abuse on the earth, spreading corruption" (Qur'an 7:74).

The people of Thamud had extraordinary skill: they carved the rock mountains into sturdy dwellings. In Surah Asy-Syu'ara, Salih reminded them of other blessings they enjoyed, "Will you be left secure in what is here — among gardens and springs, and crops and palm trees with softened fruit? And you carve out of the mountains, homes, with great skill" (26:146-149).

Yet that skill and prosperity made some of them heedless. So Salih closed, "So fear Allah and obey me, and do not obey the order of the transgressors" (26:150-151).

Reflection: skill and prosperity are blessings that demand responsibility. When met with gratitude, they become a source of grace; when they breed arrogance and corruption, they turn into a cause of ruin.`,
    },
  },
  {
    slug: "kisah-salih-03-mukjizat-unta-betina",
    surahId: 54,
    ayahStart: 27,
    ayahEnd: 28,
    id: {
      title: "Episode 3: Mukjizat Unta Betina dan Pembagian Air",
      body: `Kaum Tsamud meminta bukti, maka Allah memberi mereka sebuah tanda yang nyata: seekor unta betina yang keluar sebagai mukjizat. Salih berkata, "Inilah seekor unta betina (mukjizat) dari Allah sebagai tanda untukmu. Maka biarkanlah ia makan di bumi Allah, dan janganlah kamu mengganggunya dengan gangguan apa pun, yang menyebabkan kamu akan ditimpa azab yang pedih" (QS. Al-A'raf: 73).

Allah menjadikan unta itu sebagai ujian, dan menetapkan aturan yang adil tentang air. Allah berfirman, "Sesungguhnya Kami akan mengirimkan unta betina sebagai cobaan bagi mereka, maka tunggulah (tindakan) mereka dan bersabarlah. Dan beritahukanlah kepada mereka bahwa air itu dibagi antara mereka (dengan unta betina itu); setiap giliran minum dihadiri (oleh yang punya giliran)" (QS. Al-Qamar: 27-28).

Dalam Surah Hud, Salih memperingatkan dengan tegas, "Wahai kaumku! Inilah unta betina dari Allah sebagai tanda untukmu, sebab itu biarkanlah ia makan di bumi Allah, dan janganlah kamu mengganggunya dengan gangguan apa pun yang akan menyebabkan kamu segera ditimpa azab" (QS. Hud: 64).

Hikmah: Allah sering menguji manusia melalui perkara yang tampak sederhana — di sini, cukup dengan membiarkan seekor unta minum pada gilirannya. Ujian sejati bukan pada besar-kecilnya perintah, melainkan pada kesediaan hati untuk tunduk.`,
    },
    en: {
      title: "Episode 3: The Miracle of the She-Camel and the Sharing of the Water",
      body: `The people of Thamud asked for proof, so Allah gave them a clear sign: a she-camel that came forth as a miracle. Salih said, "This is the she-camel of Allah [sent] to you as a sign. So leave her to eat within Allah's land, and do not touch her with harm, lest there seize you a painful punishment" (Qur'an 7:73).

Allah made the camel a trial, and set a just rule for the water. Allah said, "Indeed, We are sending the she-camel as a trial for them, so watch them and be patient. And inform them that the water is shared between them; each [turn of] drink attended by turn" (54:27-28).

In Surah Hud, Salih warned firmly, "O my people, this is the she-camel of Allah — [she is] to you a sign. So let her feed upon Allah's earth, and do not touch her with harm, or you will be seized by an impending punishment" (11:64).

Reflection: Allah often tests people through something that seems simple — here, merely leaving a camel to drink on her turn. The real test is not in how great or small the command is, but in the heart's willingness to submit.`,
    },
  },
  {
    slug: "kisah-salih-04-penyembelihan-unta-dan-pembangkangan",
    surahId: 7,
    ayahStart: 77,
    ayahEnd: 77,
    id: {
      title: "Episode 4: Penyembelihan Unta dan Pembangkangan Kaum",
      body: `Kesombongan akhirnya menang atas peringatan. Orang-orang yang durhaka di antara Tsamud menyembelih unta itu, menantang azab yang dijanjikan. Allah berfirman, "Kemudian mereka sembelih unta betina itu, dan berlaku angkuh terhadap perintah Tuhannya. Mereka berkata, ‘Wahai Salih! Buktikanlah ancaman kamu kepada kami, jika benar engkau salah seorang rasul’" (QS. Al-A'raf: 77).

Perbuatan itu bukan dilakukan seluruh kaum, melainkan dipelopori oleh orang yang paling celaka di antara mereka. Allah berfirman, "Maka mereka memanggil kawannya, lalu dia menangkap (unta itu) dan memotongnya" (QS. Al-Qamar: 29). Dan dalam Surah Asy-Syams, "Ketika bangkit orang yang paling celaka di antara mereka" (QS. Asy-Syams: 12).

Menghadapi kedurhakaan itu, Salih memberi mereka tenggat sebagai kesempatan terakhir, "Maka mereka menyembelihnya, kemudian dia (Salih) berkata, ‘Bersukarialah kamu semua di rumahmu selama tiga hari. Itu adalah janji yang tidak dapat didustakan’" (QS. Hud: 65).

Hikmah: satu perbuatan dosa yang dipelopori segelintir orang bisa membinasakan seluruh kaum bila yang lain merestui atau membiarkannya. Menentang perintah Allah dengan angkuh adalah pintu menuju kehancuran, dan tenggat tiga hari itu adalah rahmat terakhir yang mereka sia-siakan.`,
    },
    en: {
      title: "Episode 4: The Slaughter of the She-Camel and the People's Defiance",
      body: `Arrogance finally won out over the warning. The wrongdoers among Thamud hamstrung and slaughtered the she-camel, challenging the promised punishment. Allah said, "So they hamstrung the she-camel and were insolent toward the command of their Lord and said, 'O Salih, bring us what you promise us, if you should be of the messengers'" (Qur'an 7:77).

The deed was not done by the whole people, but led by the most wretched among them. Allah said, "But they called their companion, and he dared and hamstrung [her]" (54:29). And in Surah Ash-Shams, "When the most wretched of them was sent forth" (91:12).

Facing that defiance, Salih gave them a term as a final chance, "But they hamstrung her, so he said, 'Enjoy yourselves in your homes for three days. That is a promise not to be denied'" (11:65).

Reflection: a single sin led by a few can destroy an entire people when the rest approve or allow it. To defy Allah's command with arrogance is a doorway to ruin — and that three-day term was the final mercy they squandered.`,
    },
  },
  {
    slug: "kisah-salih-05-azab-pekik-yang-menggelegar",
    surahId: 11,
    ayahStart: 67,
    ayahEnd: 68,
    id: {
      title: "Episode 5: Azab Pekik yang Menggelegar",
      body: `Setelah tenggat tiga hari berlalu, datanglah ketetapan Allah dengan cepat dan menyeluruh. Allah berfirman, "Dan satu suara keras yang mengguntur menimpa orang-orang yang zalim itu, lalu mereka mati bergelimpangan di rumahnya, seolah-olah mereka belum pernah tinggal di sana. Ingatlah, kaum Tsamud mengingkari Tuhan mereka. Ingatlah, binasalah kaum Tsamud" (QS. Hud: 67-68).

Dalam Surah Al-A'raf, azab itu digambarkan sebagai gempa yang mengguncang, "Lalu datanglah gempa menimpa mereka, dan mereka pun mati bergelimpangan di dalam reruntuhan rumah mereka" (QS. Al-A'raf: 78). Dan dalam Surah Al-Qamar, "Sesungguhnya Kami menimpakan atas mereka satu suara yang mengguntur, maka jadilah mereka seperti rumput-rumput kering yang dikumpulkan oleh yang punya kandang" (QS. Al-Qamar: 31).

Al-Qur'an menegaskan bahwa azab itu adil dan merata karena dosa mereka, "Maka Tuhan membinasakan mereka disebabkan dosa mereka, lalu Dia meratakan (azab itu atas) mereka" (QS. Asy-Syams: 14).

Hikmah: kekokohan rumah-rumah batu yang mereka pahat di gunung tidak mampu melindungi mereka dari satu suara azab. Tidak ada benteng yang dapat menahan ketetapan Allah bagi kaum yang menantang-Nya.`,
    },
    en: {
      title: "Episode 5: The Thundering Shriek",
      body: `After the three days passed, the decree of Allah came swiftly and completely. Allah said, "And the shriek seized those who had wronged, and they became within their homes [corpses] fallen prone, as if they had never prospered therein. Unquestionably, Thamud denied their Lord; then away with Thamud" (Qur'an 11:67-68).

In Surah Al-A'raf, the punishment is described as a shaking earthquake, "So the earthquake seized them, and they became within their home [corpses] fallen prone" (7:78). And in Surah Al-Qamar, "Indeed, We sent upon them one shout, and they became like the dry twig fragments of a pen" (54:31).

The Qur'an affirms the punishment was just and complete for their sin, "So their Lord brought down upon them destruction for their sin and made it equal [upon all of them]" (91:14).

Reflection: the sturdiness of the stone homes they carved in the mountains could not protect them from a single blast of punishment. No fortress can withstand the decree of Allah for a people who defy Him.`,
    },
  },
  {
    slug: "kisah-salih-06-keselamatan-salih-dan-orang-beriman",
    surahId: 11,
    ayahStart: 66,
    ayahEnd: 66,
    id: {
      title: "Episode 6: Keselamatan Salih dan Orang-Orang Beriman",
      body: `Sebagaimana pada setiap kisah, Allah tidak membiarkan hamba-Nya yang beriman binasa bersama orang-orang yang zalim. Allah berfirman, "Maka ketika keputusan Kami datang, Kami selamatkan Salih dan orang-orang yang beriman bersamanya dengan rahmat dari Kami, dan (Kami selamatkan) dari kehinaan pada hari itu. Sungguh, Tuhanmu, Dialah Yang Mahakuat lagi Mahaperkasa" (QS. Hud: 66).

Setelah kaumnya binasa, Salih meninggalkan mereka dengan hati yang telah menunaikan amanahnya. Allah berfirman, "Maka Salih meninggalkan mereka seraya berkata, ‘Wahai kaumku! Sungguh, aku telah menyampaikan amanat Tuhanku kepadamu dan aku telah menasihatimu, tetapi kamu tidak menyukai orang yang memberi nasihat’" (QS. Al-A'raf: 79).

Dalam Surah An-Naml, Allah menutup kisah ini dengan penegasan yang menenangkan, "Dan Kami selamatkan orang-orang yang beriman dan mereka selalu bertakwa" (QS. An-Naml: 53).

Hikmah: keselamatan sejati bukanlah pada kekuatan atau kekayaan, melainkan pada iman dan takwa. Kisah Salih menegaskan kembali janji Allah yang tak pernah berubah: orang beriman yang sabar akan selamat, dan orang zalim yang angkuh akan menuai akibat perbuatannya.`,
    },
    en: {
      title: "Episode 6: The Salvation of Salih and the Believers",
      body: `As in every story, Allah did not let His believing servants perish alongside the wrongdoers. Allah said, "So when Our command came, We saved Salih and those who believed with him, by mercy from Us, and [saved them] from the disgrace of that day. Indeed, it is your Lord who is the Powerful, the Exalted in Might" (Qur'an 11:66).

After his people were destroyed, Salih left them with a heart that had fulfilled its trust. Allah said, "And he turned away from them and said, 'O my people, I had certainly conveyed to you the message of my Lord and advised you, but you do not like advisers'" (7:79).

In Surah An-Naml, Allah closes this story with a reassuring affirmation, "And We saved those who believed and used to fear Allah" (27:53).

Reflection: true salvation lies not in strength or wealth, but in faith and God-consciousness. The story of Salih reaffirms Allah's unchanging promise: the patient believer will be saved, and the arrogant wrongdoer will reap the fruit of his own deeds.`,
    },
  },
];
