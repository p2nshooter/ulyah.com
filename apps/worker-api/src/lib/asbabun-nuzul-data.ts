// Curated asbabun nuzul (occasions of revelation), keyed "surah_ayah".
// Sourced from the classical works of Al-Wahidi and As-Suyuthi via the
// reference implementation the site owner provided. A `null` entry means the
// dataset explicitly records no specific occasion for that ayah (many ayat
// are ibtida'i — revealed without a triggering event), which is a real
// scholarly fact, not a gap.
export const ASBAB_DATA: Record<string, string | null> = {
  // Al-Baqarah
  "2_1": null,
  "2_115": "Diriwayatkan oleh Ibnu Abbas r.a., ayat ini turun berkenaan dengan sekelompok sahabat yang shalat menghadap arah yang salah dalam perjalanan malam yang gelap, lalu diberitahu bahwa ke mana pun mereka menghadap, di sanalah wajah Allah.",
  "2_177": "Ayat ini turun sebagai jawaban atas pertanyaan orang-orang tentang hakikat kebajikan yang sesungguhnya, setelah ada perdebatan tentang arah kiblat shalat.",
  "2_256": "Diriwayatkan oleh Abu Dawud dari Ibnu Abbas: ayat ini turun berkenaan dengan seorang Anshar yang memiliki dua anak yang telah masuk agama Nasrani sebelum Islam datang, lalu ia ingin memaksanya masuk Islam.",
  "2_285": "Diriwayatkan bahwa ayat ini dan beberapa ayat setelahnya turun pada malam Isra' Mi'raj, sebagai penghormatan Allah kepada Nabi Muhammad ﷺ.",
  "2_286": "Diriwayatkan dari Abu Hurairah r.a. bahwa ketika turun ayat 284 tentang apa yang tersimpan dalam hati, para sahabat sangat khawatir. Maka turunlah ayat ini sebagai keringanan bahwa Allah tidak membebani seseorang melainkan sesuai kesanggupannya.",
  // Ali Imran
  "3_7": "Diriwayatkan bahwa delegasi Najran bertanya tentang ayat-ayat mutasyabihat untuk mematahkan argumen Islam. Ayat ini turun menanggapi mereka.",
  "3_61": "Ayat ini turun berkenaan dengan pertemuan Nabi ﷺ dengan delegasi Nasrani Najran yang berdebat tentang kedudukan Nabi Isa a.s. Nabi mengajak mereka bermubahalah (saling melaknat), namun mereka menolak.",
  "3_110": "Ayat ini turun berkenaan dengan pernyataan orang-orang Yahudi bahwa merekalah umat terbaik. Allah membantah hal itu.",
  "3_159": "Diriwayatkan turun setelah peristiwa Perang Uhud, sebagai penghiburan dan pujian Allah kepada Nabi ﷺ atas kelembutannya kepada para sahabat meski mereka melanggar strategi perang.",
  // An-Nisa
  "4_1": null,
  "4_3": "Ayat ini turun pasca Perang Uhud yang merenggut banyak syuhada sehingga banyak anak yatim perempuan. Para wali merasa sah menikahi mereka namun tidak berlaku adil dalam mahar.",
  "4_11": "Diriwayatkan oleh Abu Dawud: Jabir bin Abdullah sakit keras dan Nabi ﷺ datang menjenguknya. Jabir bertanya tentang warisan bagi anak-anak perempuannya. Maka turunlah ayat-ayat faraid ini.",
  "4_43": "Diriwayatkan oleh Ali bin Abi Thalib: ayat ini turun berkenaan dengan seorang sahabat yang shalat dalam keadaan masih terpengaruh khamr sehingga bacaannya kacau.",
  "4_128": "Diriwayatkan bahwa ayat ini turun berkenaan dengan Saudah binti Zam'ah yang khawatir diceraikan Nabi ﷺ, lalu ia menawarkan gilirannya kepada Aisyah r.a. demi tetap bersama beliau.",
  // Al-Maidah
  "5_3": "Bagian '…pada hari ini telah Aku sempurnakan…' turun pada hari Jumat saat wukuf di Arafah, Haji Wada', tahun ke-10 Hijriyah.",
  "5_51": "Diriwayatkan bahwa Ubadah bin Shamit melepaskan semua ikatan dengan sekutu Yahudinya setelah Perang Badar, sementara Abdullah bin Ubay masih mempertahankannya. Ayat ini turun menegaskan larangan menjadikan mereka pemimpin.",
  "5_67": "Ayat ini turun pada peristiwa Ghadir Khum, memerintahkan Nabi ﷺ menyampaikan sesuatu yang telah diwahyukan kepadanya tanpa rasa takut.",
  "5_90": "Diriwayatkan oleh Ibnu Abbas dan Umar r.a.: ayat tentang pengharaman khamr secara total ini turun setelah serangkaian ayat yang bertahap, dipicu oleh kejadian pertengkaran di antara kaum Anshar akibat khamr.",
  // Al-An'am
  "6_1": null,
  // Al-A'raf
  "7_26": null,
  // Al-Anfal
  "8_1": "Ayat ini turun berkenaan dengan perselisihan para sahabat tentang pembagian ghanimah (harta rampasan) setelah Perang Badar.",
  "8_5": "Berkenaan dengan keluarnya Nabi ﷺ menuju Badar, padahal sebagian sahabat tidak suka karena persiapan yang belum matang.",
  "8_67": "Turun setelah Perang Badar berkenaan dengan pengambilan tebusan dari para tawanan perang. Nabi menanyakan pendapat para sahabat, dan Abu Bakar menyarankan tebusan, sementara Umar menyarankan dibunuh. Ayat ini menegur pilihan tebusan.",
  // At-Taubah
  "9_40": "Berkenaan dengan peristiwa hijrah Nabi ﷺ bersama Abu Bakar r.a. ketika bersembunyi di Gua Tsur. Abu Bakar bersedih, lalu Nabi menghiburnya dengan berkata 'Jangan bersedih, sesungguhnya Allah bersama kita.'",
  "9_113": "Diriwayatkan berkenaan dengan permohonan Nabi ﷺ untuk memintakan ampun bagi ibunya (menurut satu riwayat) atau paman beliau Abu Thalib. Ayat ini melarang hal tersebut bagi orang musyrik.",
  // Yunus
  "10_94": null,
  // Yusuf
  "12_1": null,
  // Ibrahim
  "14_1": null,
  // Al-Hijr
  "15_94": "Turun memerintahkan Nabi ﷺ untuk berdakwah secara terang-terangan setelah sebelumnya berdakwah sembunyi-sembunyi selama tiga tahun.",
  // An-Nahl
  "16_101": "Diriwayatkan berkenaan dengan orang-orang musyrik yang mencemooh ayat-ayat Al-Qur'an yang me-nasakh (menggantikan) ayat sebelumnya.",
  "16_126": "Turun berkenaan dengan peristiwa Uhud saat Hamzah r.a. gugur dan dimutilasi. Nabi ﷺ bersumpah akan membalas 70 kali lipat. Ayat ini memerintahkan untuk sabar.",
  // Al-Isra
  "17_1": "Berkenaan dengan peristiwa Isra' Mi'raj yang dialami Nabi ﷺ dari Masjidil Haram ke Masjidil Aqsha.",
  "17_23": null,
  "17_85": "Diriwayatkan bahwa orang-orang Quraisy atau Yahudi bertanya kepada Nabi ﷺ tentang ruh. Ayat ini turun sebagai jawaban bahwa ilmu tentang ruh hanya ada pada Allah.",
  // Al-Kahfi
  "18_1": null,
  "18_83": "Turun karena orang-orang Quraisy (atas saran Yahudi Madinah) bertanya kepada Nabi ﷺ tentang Dzulqarnain untuk menguji kenabiannya.",
  // Maryam
  "19_1": null,
  // Thaha
  "20_1": null,
  "20_130": "Diriwayatkan bahwa Nabi ﷺ merasa sedih dan tertekan akibat ejekan kaum musyrikin. Ayat ini turun sebagai penghiburan.",
  // Al-Anbiya
  "21_1": null,
  // Al-Hajj
  "22_5": null,
  "22_39": "Ini adalah ayat pertama yang mengizinkan kaum muslimin berperang, turun setelah kaum muslimin hijrah ke Madinah dan terus-menerus dizalimi.",
  // Al-Mu'minun
  "23_1": null,
  // An-Nur
  "24_1": null,
  "24_11": "Berkenaan dengan peristiwa 'Haditsul Ifki' (fitnah keji) yang ditujukan kepada Aisyah r.a. dalam Perang Bani Musthaliq. Sekelompok orang munafik menyebarkan tuduhan keji, dan ayat ini membela kesucian beliau.",
  "24_31": null,
  // Al-Furqan
  "25_1": null,
  "25_27": null,
  // Asy-Syu'ara
  "26_214": "Berkenaan dengan perintah Allah kepada Nabi ﷺ untuk berdakwah kepada keluarga terdekatnya. Beliau mengumpulkan Bani Hasyim dan menyeru mereka.",
  // An-Naml
  "27_1": null,
  // Al-Qashash
  "28_56": "Turun berkenaan dengan kematian Abu Thalib, paman Nabi ﷺ. Nabi sangat ingin pamannya yang selalu melindunginya itu masuk Islam, namun Allah menegaskan bahwa hidayah adalah hak prerogatif-Nya.",
  // Al-Ankabut
  "29_1": null,
  "29_10": "Berkenaan dengan sekelompok orang yang mengaku beriman namun ketika menghadapi ujian berpaling dari Islam.",
  // Al-Ahzab
  "33_1": null,
  "33_37": "Berkenaan dengan pernikahan Nabi ﷺ dengan Zainab binti Jahsy r.a. setelah diceraikan oleh Zaid bin Haritsah r.a., untuk membatalkan tradisi jahiliyah tentang anak angkat.",
  "33_53": "Berkenaan dengan adab bertamu ke rumah Nabi ﷺ. Para sahabat terlalu lama duduk dan berbincang setelah makan di acara pernikahan, sehingga menyusahkan Nabi.",
  // Saba
  "34_1": null,
  // Fatir
  "35_1": null,
  // Yasin
  "36_1": null,
  // Ash-Shaffat
  "37_1": null,
  // Shad
  "38_1": "Diriwayatkan bahwa pemuka-pemuka Quraisy seperti Abu Jahal, Walid bin Mughirah, dan lainnya mengunjungi Abu Thalib yang sedang sakit untuk meminta beliau menghentikan dakwah Nabi. Ayat ini turun menanggapi kesombongan mereka.",
  // Az-Zumar
  "39_1": null,
  // Ghafir
  "40_1": null,
  // Fussilat
  "41_1": null,
  // Asy-Syura
  "42_1": null,
  // Az-Zukhruf
  "43_1": null,
  // Ad-Dukhan
  "44_10": "Diriwayatkan berkenaan dengan do'a Nabi ﷺ agar kaum Quraisy ditimpa kelaparan seperti yang pernah menimpa kaum Nabi Yusuf a.s., karena mereka terus-menerus menentang dakwah.",
  // Al-Jatsiyah
  "45_1": null,
  // Al-Ahqaf
  "46_1": null,
  // Muhammad
  "47_1": null,
  // Al-Fath
  "48_1": "Turun berkenaan dengan peristiwa Perjanjian Hudaibiyah (tahun ke-6 H), yang oleh sebagian sahabat dianggap sebagai kekalahan namun Allah menyebutnya sebagai kemenangan yang nyata.",
  "48_18": "Berkenaan dengan Bai'atur Ridwan (Perjanjian setia di bawah pohon) yang terjadi di Hudaibiyah. Para sahabat yang berjumlah sekitar 1.400 orang berbaiat kepada Nabi ﷺ untuk tidak melarikan diri.",
  // Al-Hujurat
  "49_1": "Diriwayatkan berkenaan dengan utusan Bani Tamim yang datang menemui Nabi ﷺ dan berteriak-teriak dari luar kamar beliau dengan tidak sopan.",
  "49_6": "Turun berkenaan dengan Walid bin Uqbah yang diutus Nabi mengumpulkan zakat dari Bani Musthaliq. Di tengah jalan ia berbalik karena takut (atau salah informasi), lalu melaporkan bahwa mereka murtad. Ayat ini memerintahkan untuk tabayyun (klarifikasi).",
  "49_11": null,
  "49_12": null,
  "49_13": "Diriwayatkan bahwa ayat ini turun berkenaan dengan peristiwa penaklukan Makkah, ketika Bilal r.a. naik ke atas Ka'bah untuk mengumandangkan adzan, dan beberapa orang mencemoohnya karena statusnya sebagai mantan budak. Allah menegaskan bahwa kemuliaan hanya diukur dengan ketakwaan.",
  // Qaf
  "50_1": null,
  // Adz-Dzariyat
  "51_1": null,
  // Ath-Thur
  "52_1": null,
  // An-Najm
  "53_1": "Diriwayatkan bahwa surah ini turun berkenaan dengan tuduhan kaum musyrikin bahwa Nabi ﷺ menyampaikan sesuatu dari dirinya sendiri, bukan wahyu dari Allah.",
  "53_19": "Berkenaan dengan tuduhan kaum musyrikin yang menyembah Lata, Uzza, dan Manat sebagai 'putri-putri Allah' dan perantara kepada-Nya.",
  // Al-Qamar
  "54_1": "Berkenaan dengan peristiwa terbelahnya bulan (syaqqu al-qamar) yang disaksikan oleh banyak sahabat sebagai mukjizat Nabi ﷺ atas permintaan kaum Quraisy.",
  // Ar-Rahman
  "55_1": null,
  // Al-Waqi'ah
  "56_1": null,
  // Al-Hadid
  "57_1": null,
  // Al-Mujadilah
  "58_1": "Turun berkenaan dengan Khaulah binti Tsa'labah yang mengadu kepada Nabi ﷺ tentang suaminya Aus bin Shamit yang men-zihar dirinya (menyamakan istri dengan punggung ibu). Nabi awalnya tidak punya jawaban sampai turun ayat ini.",
  // Al-Hasyr
  "59_1": "Berkenaan dengan pengusiran Bani Nadhir dari Madinah setelah mereka berkhianat dan berencana membunuh Nabi ﷺ.",
  // Al-Mumtahanah
  "60_1": "Berkenaan dengan Hathib bin Abi Balta'ah yang mengirim surat kepada orang-orang Makkah memberitahu rencana penaklukan Makkah, demi melindungi keluarganya yang masih di sana.",
  // Ash-Shaff
  "61_1": null,
  // Al-Jumu'ah
  "62_9": null,
  "62_11": "Berkenaan dengan kedatangan kafilah dagang dari Syam di tengah khutbah Jumat. Para sahabat berhamburan keluar untuk menyambutnya, hanya sedikit yang tetap di masjid.",
  // Al-Munafiqun
  "63_1": "Berkenaan dengan Abdullah bin Ubay bin Salul, pemimpin kaum munafik, yang berkata bahwa jika kembali ke Madinah, orang yang mulia (dirinya) pasti akan mengusir orang yang hina (Nabi ﷺ).",
  // At-Taghabun
  "64_14": "Diriwayatkan berkenaan dengan sekelompok sahabat yang ingin hijrah ke Madinah namun dihalangi istri dan anak-anak mereka. Setelah hijrah, mereka melihat sahabat lain telah maju dalam ilmu agama. Mereka ingin menghukum istri dan anak mereka.",
  // Ath-Thalaq
  "65_1": "Diriwayatkan bahwa Abdullah bin Umar r.a. menceraikan istrinya dalam keadaan haid. Nabi memerintahkan untuk merujuknya dan menunggu masa suci. Ayat ini menetapkan tata cara talak yang benar.",
  // At-Tahrim
  "66_1": "Diriwayatkan berkenaan dengan Nabi ﷺ yang mengharamkan madu (menurut satu riwayat) atau Maria al-Qibthiyah (menurut riwayat lain) demi menyenangkan sebagian istrinya. Ayat ini menegur Nabi.",
  // Al-Mulk
  "67_1": null,
  // Al-Qalam
  "68_1": "Berkenaan dengan tuduhan kaum Quraisy bahwa Nabi ﷺ adalah orang gila. Allah bersumpah dengan pena dan apa yang ditulis bahwa Nabi tidak gila.",
  "68_10": "Berkenaan dengan Walid bin Mughirah atau Al-Akhnas bin Syariq, tokoh Quraisy yang bermuka dua — bersikap baik di depan Nabi tapi menjelek-jelekkan Islam di belakang.",
  // Al-Haqqah
  "69_1": null,
  // Al-Ma'arij
  "70_1": "Diriwayatkan berkenaan dengan An-Nadhr bin Al-Harits yang meminta agar azab segera didatangkan jika Al-Qur'an memang benar dari Allah.",
  // Nuh
  "71_1": null,
  // Al-Jin
  "72_1": "Berkenaan dengan sekelompok jin yang mendengarkan bacaan Al-Qur'an Nabi ﷺ dalam perjalanan ke Thaif, lalu memeluk Islam dan kembali berdakwah kepada kaumnya.",
  // Al-Muzzammil
  "73_1": "Berkenaan dengan Nabi ﷺ yang setelah menerima wahyu pertama sangat terguncang dan meminta Khadijah menyelimutinya. Allah memerintahkan beliau bangun malam untuk shalat dan mempersiapkan diri.",
  // Al-Muddatstsir
  "74_1": "Berkenaan dengan pernyataan Walid bin Mughirah tentang Al-Qur'an: ia mengakui dalam hatinya bahwa Al-Qur'an bukan sihir atau syair, namun secara terbuka mengatakan sebaliknya.",
  // Al-Qiyamah
  "75_1": null,
  "75_16": "Berkenaan dengan Nabi ﷺ yang tergesa-gesa menggerakkan lisannya saat menerima wahyu karena khawatir lupa. Allah menenangkan beliau.",
  // Al-Insan
  "76_1": null,
  // Al-Mursalat
  "77_1": null,
  // An-Naba
  "78_1": "Berkenaan dengan perdebatan orang-orang musyrik tentang hari kebangkitan yang diberitakan Nabi ﷺ.",
  // An-Nazi'at
  "79_1": null,
  // Abasa
  "80_1": "Berkenaan dengan Ibnu Ummi Maktum, seorang buta yang datang kepada Nabi ﷺ untuk belajar agama, sementara Nabi sedang berbincang dengan pembesar Quraisy. Nabi berpaling darinya, lalu turunlah ayat ini sebagai teguran.",
  // At-Takwir
  "81_1": null,
  // Al-Infithar
  "82_1": null,
  // Al-Muthaffifin
  "83_1": "Diriwayatkan dari Ibnu Abbas: ketika Nabi tiba di Madinah, penduduknya terkenal berlaku curang dalam timbangan. Maka turunlah ayat ini.",
  // Al-Insyiqaq
  "84_1": null,
  // Al-Buruj
  "85_1": "Berkenaan dengan Ashabul Ukhdud, orang-orang yang membuat parit berisi api dan membakar kaum beriman yang menolak murtad.",
  // Ath-Thariq
  "86_1": null,
  // Al-A'la
  "87_1": null,
  // Al-Ghasyiyah
  "88_1": null,
  // Al-Fajr
  "89_1": null,
  // Al-Balad
  "90_1": null,
  // Asy-Syams
  "91_1": null,
  // Al-Lail
  "92_1": null,
  "92_5": "Diriwayatkan berkenaan dengan Abu Bakar r.a. yang memerdekakan Bilal bin Rabah r.a. dan beberapa budak muslim lainnya yang disiksa.",
  // Adh-Dhuha
  "93_1": "Wahyu terhenti beberapa waktu setelah awal kenabian. Orang-orang musyrik mengejek: 'Tuhanmu telah meninggalkanmu dan membencimu.' Surah ini turun sebagai bantahan dan penghiburan bagi Nabi.",
  // Al-Insyirah
  "94_1": "Diriwayatkan berkenaan dengan berita gembira tentang ketinggian derajat Nabi ﷺ di dunia dan akhirat, sebagai kelanjutan dari surah Adh-Dhuha.",
  // At-Tin
  "95_1": null,
  // Al-Alaq
  "96_1": "Ini adalah wahyu pertama yang diterima Nabi Muhammad ﷺ di Gua Hira pada malam 17 Ramadhan. Malaikat Jibril mendatangi Nabi dan menyuruhnya membaca.",
  "96_9": "Berkenaan dengan Abu Jahal yang melarang Nabi ﷺ shalat di dekat Ka'bah.",
  // Al-Qadr
  "97_1": null,
  // Al-Bayyinah
  "98_1": null,
  // Az-Zalzalah
  "99_1": null,
  // Al-Adiyat
  "100_1": null,
  // Al-Qari'ah
  "101_1": null,
  // At-Takatsur
  "102_1": "Diriwayatkan berkenaan dengan persaingan antara dua klan Anshar (Bani Haritsah dan Bani Al-Harits) yang saling membanggakan jumlah anggota klan mereka, sampai-sampai menghitung pula yang sudah meninggal.",
  // Al-Ashr
  "103_1": null,
  // Al-Humazah
  "104_1": "Diriwayatkan berkenaan dengan Akhnas bin Syariq atau Umayyah bin Khalaf, tokoh Quraisy yang suka mencela dan menghina Nabi ﷺ.",
  // Al-Fil
  "105_1": null,
  // Quraisy
  "106_1": null,
  // Al-Ma'un
  "107_1": "Diriwayatkan berkenaan dengan Abu Sufyan bin Harb atau Al-'Ash bin Wail, tokoh Quraisy kaya yang menolak membantu anak yatim dan tidak shalat, namun berpura-pura saleh.",
  // Al-Kautsar
  "108_1": "Berkenaan dengan Al-'Ash bin Wail atau Abu Jahl yang mengolok-olok Nabi ﷺ sebagai 'abtar' (orang yang terputus keturunannya) setelah putra beliau, Qasim dan Abdullah, wafat.",
  // Al-Kafirun
  "109_1": "Berkenaan dengan tawaran kompromi pemuka Quraisy kepada Nabi: 'Sembahlah tuhan kami setahun, kami akan menyembah tuhanmu setahun.' Surah ini turun menolak tegas kompromi akidah.",
  // An-Nashr
  "110_1": "Berkenaan dengan penaklukan Makkah (Fathul Makkah) yang menjadi puncak kemenangan Islam, sekaligus isyarat bahwa ajal Nabi ﷺ sudah dekat.",
  // Al-Masad
  "111_1": "Berkenaan dengan Abu Lahab, paman Nabi ﷺ, dan istrinya Ummu Jamil yang sangat memusuhi Islam. Ketika Nabi berseru di Bukit Shafa memanggil kaumnya, Abu Lahab berkata: 'Celakalah kamu! Untuk inikah kamu mengumpulkan kami?'",
  // Al-Ikhlas
  "112_1": "Diriwayatkan berkenaan dengan orang-orang musyrik atau Ahli Kitab yang bertanya: 'Ceritakan kepada kami tentang Tuhanmu, terbuat dari apa Ia?' Surah ini turun sebagai jawaban.",
  // Al-Falaq
  "113_1": "Diriwayatkan bahwa surah ini turun berkenaan dengan sihir yang dilakukan Lubaid bin Al-A'sham terhadap Nabi ﷺ, bersama surah An-Nas.",
  // An-Nas
  "114_1": "Turun bersamaan dengan Al-Falaq, berkenaan dengan sihir Lubaid bin Al-A'sham. Kedua surah ini disebut Al-Mu'awwidzatain (dua pelindung).",
  // Al-Fatihah
  "1_1": "Al-Fatihah adalah surah pertama dan paling utama dalam Al-Qur'an. Diriwayatkan dalam Shahih Bukhari bahwa surah ini turun di Makkah dan merupakan yang pertama kali diturunkan secara lengkap. Surah ini disebut Ummu Al-Qur'an (Induk Al-Qur'an) dan Sab'ul Matsani (Tujuh yang diulang-ulang). Tidak ada sebab turun yang khusus karena ia adalah wahyu ibtida'i (inisiatif Allah tanpa sebab kejadian tertentu).",
  "1_2": null, "1_3": null, "1_4": null, "1_5": null, "1_6": null, "1_7": null,
};
