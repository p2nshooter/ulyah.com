/**
 * "Kisah Nabi Nuh AS" — one complete story series drawn from two passages:
 * QS. Hud 11:25-49 (the narrative arc — dakwah, the ark, the flood, his son,
 * and the closing) and QS. Nuh 71:1-28 (Nuh's own recounted plea to Allah
 * about the nine hundred and fifty years he spent calling his people).
 * Ayah 11:35 is deliberately skipped between episodes 2 and 3 — it is
 * Allah's aside to the Prophet Muhammad ﷺ about the Qur'an's truthfulness,
 * not part of Nuh's own narrative, so citing it here would misattribute it.
 *
 * Every episode is a close paraphrase of specific ayat. No hadith, no
 * speculation about the ark's dimensions or the flood's geography, and no
 * invented dialogue beyond what these ayat state is included, matching the
 * same conservative editorial policy as the Kisah Nabi Yusuf / Musa /
 * Dzulqarnain / Ashabul Kahfi series (docs/CONTENT-POLICY.md). Source text:
 * quran-json (CC-BY-4.0), the same dataset already seeded into
 * `ayah`/`translation`.
 *
 * ai_generated=0 (human/editorially authored at build time), status='published'.
 */

export interface NuhEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_NUH_SERIES: NuhEpisode[] = [
  {
    slug: "kisah-nuh-01-diutus-dan-ditolak",
    surahId: 11,
    ayahStart: 25,
    ayahEnd: 31,
    id: {
      title: "Nabi Nuh Diutus dan Ditolak Kaumnya",
      body: `Allah mengutus Nabi Nuh kepada kaumnya. Ia berkata, "Sesungguhnya aku adalah pemberi peringatan yang nyata bagi kalian, agar kalian tidak menyembah selain Allah. Sungguh, aku khawatir kalian akan ditimpa azab pada hari yang pedih."

Namun para pembesar kaumnya yang kafir berkata, "Kami tidak melihatmu melainkan seorang manusia biasa seperti kami, dan kami tidak melihat orang-orang yang mengikutimu kecuali orang-orang yang hina di antara kami yang lekas percaya begitu saja. Kami pun tidak melihat kalian memiliki kelebihan apa pun atas kami; bahkan kami menduga kalian adalah para pendusta."

Nuh menjawab, "Wahai kaumku, bagaimana pendapat kalian jika aku memiliki bukti nyata dari Tuhanku, dan Dia telah memberiku rahmat dari sisi-Nya, sedangkan rahmat itu tersembunyi bagi kalian? Apakah kami akan memaksakannya kepada kalian padahal kalian membencinya?"

Ia melanjutkan, "Wahai kaumku, aku tidak meminta harta apa pun atas seruan ini. Upahku hanyalah dari Allah. Dan aku sekali-kali tidak akan mengusir orang-orang yang beriman itu, karena mereka pasti akan bertemu Tuhan mereka. Akan tetapi aku melihat kalian adalah kaum yang berbuat jahil."

Nuh berkata lagi, "Wahai kaumku, siapakah yang akan menolongku dari (azab) Allah jika aku mengusir mereka? Tidakkah kalian mengambil pelajaran? Aku tidak mengatakan kepada kalian bahwa aku memiliki perbendaharaan Allah, aku pun tidak mengetahui yang gaib, dan aku tidak mengatakan bahwa aku adalah malaikat. Aku juga tidak mengatakan kepada orang-orang yang kalian pandang hina bahwa Allah sekali-kali tidak akan memberi mereka kebaikan — Allah lebih mengetahui apa yang ada dalam diri mereka. Sungguh, jika demikian aku termasuk orang-orang yang zalim."

Hikmah: Nuh tidak menilai pengikutnya dari status sosial mereka, sebab iman bukan perkara kedudukan dunia. Ia juga menolak untuk mengusir orang-orang lemah yang beriman demi menyenangkan para pembesar yang sombong — sebuah pelajaran bahwa kebenaran tidak boleh dikorbankan demi kedudukan atau penerimaan orang banyak.`,
    },
    en: {
      title: "Noah Is Sent, and His People Reject Him",
      body: `God sent Noah to his people. He said, "Indeed, I am to you a clear warner, that you worship none but Allah. Indeed, I fear for you the punishment of a painful day."

But the eminent among those who disbelieved from his people said, "We do not see you but as a man like ourselves, and we do not see you followed except by those who are the lowest of us, at first suggestion. And we do not see in you over us any merit; rather, we think you are liars."

Noah replied, "O my people, have you considered: if I should be upon clear evidence from my Lord while He has given me mercy from Himself but it has been made unapparent to you, should we force it upon you while you are averse to it?"

He continued, "O my people, I ask not of you for it any wealth. My reward is not but from Allah. And I am not one to drive away those who have believed — indeed, they will meet their Lord. But I see that you are a people behaving ignorantly."

Noah said further, "O my people, who would protect me from Allah if I drove them away? Will you not then be reminded? I do not tell you that I have the depositories of Allah, nor do I know the unseen, nor do I say that I am an angel. Nor do I say of those your eyes look down upon that Allah will never grant them any good — Allah is most knowing of what is within their souls. Indeed, I would then be among the wrongdoers."

Reflection: Noah did not judge his followers by their social standing, for faith is never a matter of worldly rank. He also refused to drive away the weak believers merely to please the arrogant elite — a lesson that truth must never be traded away for status or popular approval.`,
    },
  },
  {
    slug: "kisah-nuh-02-tantangan-kaumnya",
    surahId: 11,
    ayahStart: 32,
    ayahEnd: 34,
    id: {
      title: "Kaumnya Menantang Datangnya Azab",
      body: `Kaum Nuh yang telah lelah mendengar seruannya berkata, "Wahai Nuh, engkau telah membantah kami, dan sudah terlalu banyak membantah kami. Maka datangkanlah kepada kami azab yang engkau ancamkan itu, jika engkau termasuk orang-orang yang benar."

Nuh menjawab dengan tenang, "Hanya Allah yang akan mendatangkannya kepada kalian jika Dia menghendaki, dan kalian sekali-kali tidak akan dapat melepaskan diri (dari azab Allah)."

Ia menambahkan, "Dan nasihatku tidak akan bermanfaat bagi kalian sekalipun aku ingin memberi nasihat kepada kalian, jika Allah hendak menyesatkan kalian. Dialah Tuhan kalian, dan hanya kepada-Nya kalian akan dikembalikan."

Hikmah: Ketika manusia menantang azab Allah dengan sombong, seorang mukmin sejati tidak membalas dengan amarah, melainkan mengembalikan segala urusan kepada kehendak Allah semata. Nuh mengajarkan bahwa hidayah adalah murni karunia Allah — betapa pun gigihnya seorang dai berdakwah, hati yang dikehendaki-Nya tersesat tidak akan tergerak oleh nasihat manusia.`,
    },
    en: {
      title: "His People Challenge Him to Bring the Punishment",
      body: `Noah's people, weary of his call, said, "O Noah, you have disputed us and been frequent in dispute of us. So bring us what you threaten us with, if you should be of the truthful."

Noah answered calmly, "Allah will only bring it to you if He wills, and you will not cause Him failure."

He added, "And my advice will not benefit you — although I wished to advise you — if Allah should intend to put you in error. He is your Lord, and to Him you will be returned."

Reflection: When people arrogantly challenge God's punishment, a true believer does not answer with anger but returns every matter to God's will alone. Noah teaches that guidance is purely God's gift — no matter how persistent a caller to truth may be, a heart God has left to stray will not be moved by human persuasion.`,
    },
  },
  {
    slug: "kisah-nuh-03-perintah-membangun-bahtera",
    surahId: 11,
    ayahStart: 36,
    ayahEnd: 41,
    id: {
      title: "Perintah Membangun Bahtera",
      body: `Allah mewahyukan kepada Nuh, "Tidak akan ada lagi di antara kaummu yang beriman selain orang yang telah beriman sebelumnya. Maka janganlah engkau bersedih hati atas apa yang selalu mereka perbuat."

Allah memerintahkan, "Buatlah kapal itu dengan pengawasan dan petunjuk wahyu Kami, dan janganlah engkau bicarakan lagi dengan-Ku tentang orang-orang yang zalim itu. Sesungguhnya mereka akan ditenggelamkan."

Nuh pun membangun kapal itu. Setiap kali segolongan pembesar dari kaumnya melewatinya, mereka mengejeknya. Nuh berkata, "Jika kalian mengejek kami, maka sesungguhnya kami pun akan mengejek kalian sebagaimana kalian mengejek kami. Kelak kalian akan mengetahui siapa yang akan ditimpa azab yang menghinakannya, dan siapa yang akan ditimpa azab yang kekal."

Hikmah: Ketaatan sejati kepada Allah kadang berarti bersabar menghadapi ejekan orang banyak sementara kita tetap mengerjakan apa yang diperintahkan-Nya, meski tampak tidak masuk akal di mata mereka (membangun kapal jauh dari air). Nuh tidak berhenti bekerja hanya karena diolok-olok — ia meneruskan perintah Allah dengan penuh keyakinan bahwa kebenaran akan terbukti pada waktunya.`,
    },
    en: {
      title: "The Command to Build the Ark",
      body: `It was revealed to Noah, "No one will believe from your people except those who have already believed, so do not be distressed by what they have been doing."

God commanded him, "And construct the ship under Our observation and Our inspiration, and do not address Me concerning those who have wronged; indeed, they are to be drowned."

So Noah built the ship. Whenever an assembly of the eminent of his people passed by him, they ridiculed him. He said, "If you ridicule us, then we will ridicule you just as you ridicule us. You are going to know who will get a punishment that will disgrace him, and upon whom will descend an enduring punishment."

Reflection: True obedience to God sometimes means patiently bearing the mockery of others while still carrying out what He has commanded, even when it appears senseless in their eyes — building a ship far from any water. Noah did not stop working merely because he was ridiculed; he carried on with God's command, fully certain the truth would prove itself in time.`,
    },
  },
  {
    slug: "kisah-nuh-04-banjir-besar-dan-anak-nuh",
    surahId: 11,
    ayahStart: 40,
    ayahEnd: 44,
    id: {
      title: "Banjir Besar dan Anak Nuh yang Enggan Naik",
      body: `Hingga ketika perintah Kami datang dan dapur (permukaan bumi) telah memancarkan air (sebagai tanda dimulainya azab), Allah berfirman, "Muatkanlah ke dalam kapal itu sepasang dari setiap jenis makhluk, juga keluargamu — kecuali orang yang telah lebih dahulu ditetapkan (akan binasa) di antara mereka — dan muatkan pula orang-orang yang beriman." Padahal tidak ada yang beriman bersamanya kecuali sedikit.

Nuh berkata, "Naiklah kalian ke dalamnya. Dengan menyebut nama Allah kapal ini berlayar dan berlabuh. Sungguh, Tuhanku Maha Pengampun, Maha Penyayang."

Kapal itu berlayar membawa mereka di tengah gelombang laksana gunung-gunung. Nuh memanggil anaknya yang berada terpisah, "Wahai anakku, naiklah bersama kami dan janganlah engkau bersama orang-orang yang kafir."

Anaknya menjawab, "Aku akan mencari perlindungan ke gunung yang dapat menghindarkan aku dari air bah." Nuh berkata, "Tidak ada yang dapat melindungi hari ini dari ketetapan Allah, kecuali orang yang dirahmati-Nya." Maka gelombang pun menjadi penghalang di antara keduanya, dan jadilah ia termasuk orang-orang yang tenggelam.

Lalu difirmankan, "Wahai bumi, telanlah airmu, dan wahai langit, berhentilah (menurunkan hujan)." Air pun surut, perkara itu telah diselesaikan, dan kapal itu berlabuh di atas gunung Judiy. Dan dikatakan, "Binasalah orang-orang yang zalim."

Hikmah: Keselamatan di sisi Allah tidak ditentukan oleh hubungan darah, melainkan oleh iman dan ketaatan. Anak Nuh memilih berlindung pada gunung — sesuatu yang tampak logis di mata manusia — namun tidak ada perlindungan sejati kecuali rahmat Allah. Inilah pelajaran besar bahwa nasab yang mulia tidak menyelamatkan seseorang tanpa iman yang benar.`,
    },
    en: {
      title: "The Great Flood, and Noah's Son Who Refused to Board",
      body: `So it was, until when Our command came and the earth's surface overflowed with water, God said, "Load upon the ship of each creature two mates and your family — except those about whom the word has preceded — and include whoever has believed." But none had believed with him, except a few.

Noah said, "Embark therein; in the name of Allah is its course and its anchorage. Indeed, my Lord is Forgiving and Merciful."

The ship sailed with them through waves like mountains, and Noah called to his son who stood apart, "O my son, come aboard with us and be not with the disbelievers."

His son replied, "I will take refuge on a mountain to protect me from the water." Noah said, "There is no protector today from the decree of Allah, except for whom He gives mercy." And the waves came between them, and he was among the drowned.

Then it was said, "O earth, swallow your water, and O sky, withhold your rain." The water subsided, the matter was accomplished, and the ship came to rest on the mountain of Judiyy. And it was said, "Away with the wrongdoing people."

Reflection: Salvation in God's sight is never determined by blood ties, but by faith and obedience. Noah's son chose refuge on a mountain — a choice that seemed reasonable by human logic — yet there is no true refuge except God's mercy. This is the great lesson that noble lineage alone cannot save anyone without genuine faith.`,
    },
  },
  {
    slug: "kisah-nuh-05-doa-nuh-dan-penyelesaian",
    surahId: 11,
    ayahStart: 45,
    ayahEnd: 49,
    id: {
      title: "Doa Nabi Nuh dan Penyelesaian Perkara",
      body: `Nuh berseru kepada Tuhannya, "Ya Tuhanku, sesungguhnya anakku termasuk keluargaku, dan sesungguhnya janji-Mu itu benar. Engkaulah hakim yang paling adil."

Allah berfirman, "Wahai Nuh, sesungguhnya ia bukanlah termasuk keluargamu (dalam ketaatan); sesungguhnya perbuatannya adalah perbuatan yang tidak baik. Maka janganlah engkau memohon kepada-Ku sesuatu yang engkau tidak mengetahui (hakikat)nya. Sesungguhnya Aku menasihatimu agar engkau tidak termasuk orang-orang yang tidak berpengetahuan."

Nuh pun segera berkata, "Ya Tuhanku, sesungguhnya aku berlindung kepada-Mu dari memohon sesuatu yang aku tidak mengetahui (hakikat)nya. Dan sekiranya Engkau tidak memberi ampun kepadaku dan tidak menaruh belas kasihan kepadaku, niscaya aku termasuk orang-orang yang rugi."

Difirmankan, "Wahai Nuh, turunlah dengan selamat sejahtera dan penuh keberkahan dari Kami atasmu dan atas umat-umat dari orang-orang yang bersamamu. Dan ada pula umat-umat yang Kami beri kesenangan sementara, kemudian mereka akan ditimpa azab yang pedih dari Kami."

Itulah sebagian dari berita-berita gaib yang Kami wahyukan kepadamu (wahai Muhammad). Engkau tidak mengetahuinya, begitu pula kaummu, sebelum ini. Maka bersabarlah; sesungguhnya kesudahan yang baik adalah bagi orang-orang yang bertakwa.

Hikmah: Bahkan seorang nabi bisa keliru dalam memahami janji Allah jika dipahami secara harfiah tanpa memperhatikan syarat keimanan. Nuh segera bertobat dan memohon ampun begitu diberi pengertian oleh Allah — sebuah teladan tentang kerendahan hati seorang nabi yang tidak mempertahankan pendapatnya sendiri di hadapan wahyu, dan segera kembali kepada kebenaran begitu ia tersingkap.`,
    },
    en: {
      title: "Noah's Prayer and the Resolution",
      body: `Noah called to his Lord and said, "My Lord, indeed my son is of my family, and indeed Your promise is true, and You are the most just of judges."

God said, "O Noah, indeed he is not of your family — indeed, his was other than righteous conduct. So do not ask Me for that about which you have no knowledge. Indeed, I advise you, lest you be among the ignorant."

Noah said at once, "My Lord, I seek refuge in You from asking that of which I have no knowledge. And unless You forgive me and have mercy upon me, I will be among the losers."

It was said, "O Noah, disembark in security from Us and blessings upon you and upon nations descending from those with you. But other nations of them We will grant enjoyment; then there will touch them from Us a painful punishment."

That is from the news of the unseen which We reveal to you, O Muhammad. You knew it not, neither you nor your people, before this. So be patient; indeed, the best outcome is for the righteous.

Reflection: Even a prophet can misunderstand God's promise if it is taken literally without regard to the condition of faith. Noah repented and sought forgiveness the instant God clarified the matter for him — a model of humility, refusing to defend his own opinion in the face of revelation, and returning to the truth the moment it was made clear.`,
    },
  },
  {
    slug: "kisah-nuh-06-seruan-siang-dan-malam",
    surahId: 71,
    ayahStart: 1,
    ayahEnd: 14,
    id: {
      title: "Seruan Nabi Nuh Siang dan Malam",
      body: `Sesungguhnya Kami telah mengutus Nuh kepada kaumnya, "Berilah peringatan kepada kaummu sebelum datang kepada mereka azab yang pedih." Nuh berkata, "Wahai kaumku, sesungguhnya aku adalah pemberi peringatan yang nyata bagi kalian, (yaitu) sembahlah Allah, bertakwalah kepada-Nya, dan taatlah kepadaku. Niscaya Allah akan mengampuni sebagian dosa-dosa kalian dan menangguhkan kalian sampai waktu yang ditentukan. Sesungguhnya ketetapan Allah apabila telah datang tidak dapat ditunda, sekiranya kalian mengetahui."

Nuh mengadu, "Ya Tuhanku, sesungguhnya aku telah menyeru kaumku siang dan malam, maka seruanku itu hanya menambah mereka lari (dari kebenaran). Dan sesungguhnya setiap kali aku menyeru mereka agar Engkau mengampuni mereka, mereka memasukkan anak jari mereka ke dalam telinganya dan menutupkan bajunya (ke wajahnya), serta mereka tetap (mengingkari) dan menyombongkan diri dengan sangat."

"Kemudian sesungguhnya aku telah menyeru mereka (dengan cara) terang-terangan, kemudian sesungguhnya aku (menyeru) lagi kepada mereka secara terang-terangan dan dengan diam-diam. Maka aku berkata (kepada mereka), 'Mohonlah ampun kepada Tuhan kalian, sesungguhnya Dia adalah Maha Pengampun, niscaya Dia akan menurunkan hujan yang lebat dari langit kepada kalian, dan membanyakkan harta dan anak-anak kalian, dan mengadakan untuk kalian kebun-kebun, dan mengadakan (pula) untuk kalian sungai-sungai.'"

Nuh melanjutkan, "Mengapa kalian tidak percaya akan kebesaran Allah? Padahal Dia sungguh telah menciptakan kalian dalam beberapa tingkatan (kejadian)."

Hikmah: Kegigihan dakwah Nuh selama bertahun-tahun — siang dan malam, terang-terangan maupun diam-diam — adalah teladan kesabaran seorang dai. Ia tidak pernah lelah mengajak kaumnya kepada ampunan Allah, meski mereka menutup telinga dan menolaknya berulang kali. Dakwah yang tulus tidak diukur dari hasil yang segera, melainkan dari ketekunan menyampaikannya.`,
    },
    en: {
      title: "Noah's Call, Day and Night",
      body: `Indeed, We sent Noah to his people, saying, "Warn your people before there comes to them a painful punishment." Noah said, "O my people, indeed I am to you a clear warner — worship Allah, fear Him, and obey me. He will forgive you your sins and delay you for a specified term. Indeed, the time set by Allah, when it comes, will not be delayed, if you only knew."

Noah pleaded, "My Lord, indeed I invited my people night and day, but my invitation increased them not except in flight. And indeed, every time I invited them that You may forgive them, they put their fingers in their ears, covered themselves with their garments, persisted, and were arrogant with great arrogance."

"Then I invited them publicly. Then I announced to them and also confided to them secretly, and said, 'Ask forgiveness of your Lord — indeed, He is ever a Perpetual Forgiver. He will send rain from the sky upon you in continuing showers, and give you increase in wealth and children, and provide for you gardens, and provide for you rivers.'"

Noah continued, "What is with you that you do not attribute to Allah due grandeur, while He has created you in stages?"

Reflection: Noah's persistence over the years — by day and night, openly and privately — models the patience of one who calls others to God. He never tired of inviting his people toward forgiveness, even as they stopped their ears and refused him again and again. Sincere da'wah is measured not by quick results, but by steadfastness in delivering it.`,
    },
  },
  {
    slug: "kisah-nuh-07-tanda-kekuasaan-dan-doa-penutup",
    surahId: 71,
    ayahStart: 15,
    ayahEnd: 28,
    id: {
      title: "Tanda-Tanda Kekuasaan Allah dan Doa Penutup Nuh",
      body: `Nuh mengajak kaumnya merenung, "Tidakkah kalian memperhatikan bagaimana Allah telah menciptakan tujuh langit bertingkat-tingkat? Dan Dia menjadikan bulan padanya sebagai cahaya, dan menjadikan matahari sebagai pelita (yang bersinar terang). Allah pula yang menumbuhkan kalian dari tanah dengan pertumbuhan yang sesungguhnya. Kemudian Dia akan mengembalikan kalian ke dalamnya (bumi) dan mengeluarkan kalian (pada hari kiamat) dengan sebenar-benarnya. Dan Allah menjadikan bumi bagi kalian sebagai hamparan, agar kalian dapat berjalan di jalan-jalannya yang luas."

Namun ketika seruan itu terus ditolak, Nuh mengadu, "Ya Tuhanku, sesungguhnya mereka telah mendurhakaiku dan mereka mengikuti orang-orang yang harta dan anak-anaknya tidak menambah kepadanya kecuali kerugian. Dan mereka melakukan tipu daya yang besar." Mereka bahkan berkata kepada sesamanya, "Jangan sekali-kali kalian meninggalkan (penyembahan) tuhan-tuhan kalian, jangan pula sekali-kali kalian meninggalkan Wadd, Suwa', Yaghuts, Ya'uq, dan Nasr."

Nuh berkata, "Dan sungguh, berhala-berhala itu telah menyesatkan banyak (manusia). Dan janganlah Engkau tambahkan bagi orang-orang zalim itu selain kesesatan." Karena dosa-dosa mereka, mereka ditenggelamkan, lalu dimasukkan ke dalam neraka, dan mereka tidak mendapati penolong-penolong bagi mereka selain Allah.

Nuh pun berdoa, "Ya Tuhanku, janganlah Engkau biarkan seorang pun di antara orang-orang kafir itu tinggal di atas bumi. Sesungguhnya jika Engkau biarkan mereka tinggal, niscaya mereka akan menyesatkan hamba-hamba-Mu, dan mereka tidak akan melahirkan selain anak yang berbuat maksiat lagi sangat kafir."

Ia menutup doanya dengan penuh kerendahan hati, "Ya Tuhanku, ampunilah aku, kedua orang tuaku, dan siapa pun yang memasuki rumahku dengan beriman, serta semua orang yang beriman, laki-laki maupun perempuan. Dan janganlah Engkau tambahkan bagi orang-orang zalim itu selain kebinasaan."

Hikmah: Di penghujung dakwahnya yang panjang, Nuh tidak menyerah kepada keputusasaan, melainkan menutupnya dengan doa yang luas — memohon ampun bukan hanya untuk dirinya, tetapi untuk orang tuanya dan seluruh orang beriman di segala zaman. Inilah teladan seorang dai sejati: hatinya senantiasa terpaut pada kebaikan bagi umat, bahkan setelah menghadapi penolakan yang begitu panjang dan berat.`,
    },
    en: {
      title: "Signs of God's Power and Noah's Closing Prayer",
      body: `Noah invited his people to reflect, "Do you not consider how Allah has created seven heavens in layers, and made the moon therein a light and made the sun a burning lamp? And Allah has caused you to grow from the earth a progressive growth. Then He will return you into it and extract you another extraction. And Allah has made for you the earth an expanse, that you may follow therein roads of passage."

But as his call kept being rejected, Noah pleaded, "My Lord, indeed they have disobeyed me and followed him whose wealth and children will not increase him except in loss. And they conspired an immense conspiracy." They even said to one another, "Never leave your gods, and never leave Wadd, Suwa', Yaghuth, Ya'uq, or Nasr."

Noah said, "And already they have misled many. And, my Lord, do not increase the wrongdoers except in error." Because of their sins they were drowned and put into the Fire, and they found not for themselves besides Allah any helpers.

Noah then prayed, "My Lord, do not leave upon the earth from among the disbelievers an inhabitant. Indeed, if You leave them, they will mislead Your servants and not beget except every wicked one and confirmed disbeliever."

He closed his prayer in deep humility, "My Lord, forgive me, my parents, and whoever enters my house a believer, and the believing men and believing women. And do not increase the wrongdoers except in destruction."

Reflection: At the end of his long da'wah, Noah did not surrender to despair but closed it with an expansive prayer — seeking forgiveness not only for himself, but for his parents and for every believer across all ages. This is the model of a true caller to God: a heart forever bound to the good of the ummah, even after facing rejection so long and so heavy.`,
    },
  },
];
