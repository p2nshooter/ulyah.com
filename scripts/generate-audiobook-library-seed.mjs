/**
 * Generates packages/db-schema/seed/audiobook_library.sql — original,
 * hand-written Indonesian articles that FILL every Audiobook category that
 * used to sit empty behind a filter chip (fiqih pernikahan, fiqih warisan,
 * pondasi iman, hikmah harian, tafsir tematik, and the kisah tiers for
 * sahabat/tabi'in/tabi'ut-tabi'in/ulama).
 *
 * All prose below is ORIGINAL composition for ULYAH.COM (not copied from any
 * book or website). Qur'an references use surah:ayah numbering; hadith are
 * paraphrased and only cited to a collection when the hadith is among the
 * most universally known (e.g. "innamal-a'malu bin-niyyat", HR Bukhari &
 * Muslim). Biographical facts are limited to what mainstream Islamic
 * scholarship agrees on.
 *
 * Idempotent output: categories via INSERT OR IGNORE on slug; stories via
 * INSERT OR IGNORE on the UNIQUE (slug, lang) index (migration 0004).
 *
 * Run: node scripts/generate-audiobook-library-seed.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CATEGORIES = [
  { slug: "fiqih-pernikahan", name: "Fiqih Pernikahan" },
  { slug: "fiqih-warisan", name: "Fiqih Warisan" },
  { slug: "pondasi-iman", name: "Pondasi Iman" },
];

const ARTICLES = [
  // ── Fiqih Pernikahan ────────────────────────────────────────────────────
  {
    category: "fiqih-pernikahan",
    slug: "fiqih-nikah-rukun-syarat",
    title: "Rukun dan Syarat Sah Pernikahan dalam Islam",
    body: `Pernikahan dalam Islam bukan sekadar peristiwa sosial, melainkan ibadah dan perjanjian yang kokoh — Al-Qur'an menyebutnya "mitsaqan ghalizha", perjanjian yang berat (QS An-Nisa': 21). Karena itu Islam menetapkan rukun-rukun yang harus terpenuhi agar sebuah akad nikah sah.

Rukun pertama adalah adanya kedua mempelai yang halal untuk menikah — bukan mahram, dan tidak sedang dalam keadaan yang menghalangi seperti masa iddah bagi perempuan. Rukun kedua adalah wali dari pihak mempelai perempuan. Rasulullah shallallahu alaihi wa sallam menegaskan bahwa pernikahan tanpa wali tidak sah; wali adalah bentuk perlindungan dan pemuliaan bagi perempuan, bukan pengekangan. Urutan wali dimulai dari ayah, lalu kakek, saudara laki-laki, dan seterusnya menurut garis nasab.

Rukun ketiga adalah dua orang saksi yang adil. Kehadiran saksi membedakan pernikahan dari hubungan yang disembunyikan; Islam menghendaki pernikahan diumumkan, dikenal masyarakat, dan dirayakan dengan cara yang halal. Rukun keempat adalah ijab dan qabul — pernyataan penyerahan dari wali dan penerimaan dari mempelai laki-laki dalam satu majelis. Kalimatnya sederhana, tetapi maknanya besar: sejak detik itu, halal apa yang sebelumnya haram, dan lahirlah tanggung jawab nafkah, perlindungan, serta kasih sayang.

Di samping rukun, ada syarat-syarat yang menyertainya: kerelaan kedua belah pihak — Nabi shallallahu alaihi wa sallam melarang menikahkan perempuan tanpa dimintai persetujuannya; kejelasan identitas kedua mempelai; serta mahar yang menjadi hak penuh istri (QS An-Nisa': 4).

Memahami rukun dan syarat ini penting bukan hanya bagi yang hendak menikah, tetapi bagi setiap Muslim, agar tradisi keluarga kita berdiri di atas ilmu, bukan sekadar kebiasaan. Pernikahan yang dimulai dengan benar secara syariat insya Allah lebih mudah dijaga keberkahannya — karena ia dibangun sebagai ibadah kepada Allah, bukan hanya ikatan di atas kertas.`,
  },
  {
    category: "fiqih-pernikahan",
    slug: "fiqih-nikah-khitbah-mahar",
    title: "Khitbah dan Mahar: Adab Menuju Pernikahan",
    body: `Sebelum akad nikah, Islam mengenal khitbah — lamaran atau pinangan. Khitbah bukan akad; ia adalah pernyataan keinginan yang serius untuk menikahi seseorang, disampaikan kepada keluarganya secara terhormat. Karena khitbah belum menghalalkan apa pun, kedua calon tetap bukan mahram: batasan pergaulan tetap berlaku sampai akad diucapkan.

Islam memberi ruang bagi calon suami untuk melihat calon istrinya dalam batas yang wajar sebelum meminang. Ini bukan formalitas kosong — Nabi shallallahu alaihi wa sallam menganjurkannya agar pernikahan dibangun di atas kecocokan yang nyata, bukan bayangan. Pada saat yang sama, Islam melarang seorang laki-laki meminang perempuan yang sedang dalam pinangan saudaranya, demi menjaga persaudaraan sesama Muslim.

Adapun mahar, ia adalah pemberian wajib dari suami kepada istri sebagai simbol tanggung jawab dan penghormatan. Al-Qur'an menyebutnya "shaduqat" — pemberian yang tulus (QS An-Nisa': 4). Mahar sepenuhnya milik istri: bukan milik ayahnya, bukan milik keluarganya, dan suami tidak boleh mengambilnya kembali.

Islam tidak menetapkan besaran mahar. Yang dituntun justru kesederhanaan: pernikahan yang paling berkah adalah yang paling ringan maharnya, sebagaimana disebutkan dalam hadits. Mahar boleh berupa uang, benda berharga, atau bahkan sesuatu yang bukan materi — dalam riwayat yang sahih, Rasulullah pernah menikahkan seorang sahabat dengan mahar berupa hafalan Al-Qur'an yang ia ajarkan kepada istrinya.

Hikmah dari seluruh rangkaian ini terasa jelas: Islam menutup pintu main-main dalam urusan membangun keluarga. Sejak pinangan sampai mahar, semuanya dirancang untuk menumbuhkan penghormatan, kejelasan, dan tanggung jawab. Bagi yang sedang menempuh jalan menuju pernikahan, inilah bekal adabnya: luruskan niat, tempuh jalurnya dengan terhormat, sederhanakan tuntutan, dan mohon keberkahan dari Allah — karena rumah tangga yang baik dimulai jauh sebelum hari akadnya.`,
  },
  {
    category: "fiqih-pernikahan",
    slug: "fiqih-nikah-hak-kewajiban",
    title: "Hak dan Kewajiban Suami Istri",
    body: `Ketika akad nikah selesai diucapkan, lahirlah serangkaian hak dan kewajiban yang saling berbalasan antara suami dan istri. Al-Qur'an merangkum prinsipnya dengan indah: "Dan mereka (para istri) mempunyai hak yang seimbang dengan kewajibannya menurut cara yang makruf" (QS Al-Baqarah: 228).

Kewajiban utama suami adalah nafkah: menanggung kebutuhan pangan, pakaian, dan tempat tinggal keluarganya sesuai kemampuannya (QS Ath-Thalaq: 7). Nafkah bukan kemurahan hati yang boleh ditahan-tahan, melainkan kewajiban yang akan ditanya di hadapan Allah. Di samping nafkah lahir, suami wajib memperlakukan istrinya dengan makruf — lemah lembut, adil, dan sabar. Rasulullah shallallahu alaihi wa sallam bersabda bahwa sebaik-baik kalian adalah yang paling baik terhadap keluarganya, dan beliau sendiri adalah teladannya: di rumah beliau menjahit pakaiannya sendiri dan membantu pekerjaan keluarganya.

Kewajiban istri berporos pada ketaatan dalam kebaikan dan menjaga amanah rumah tangga: menjaga dirinya, harta suaminya, dan rahasia keluarganya. Ketaatan ini bukan penghambaan — ia hanya berlaku dalam hal yang tidak melanggar perintah Allah, karena tidak ada ketaatan kepada makhluk dalam bermaksiat kepada Sang Khalik.

Dan di atas semua pembagian itu ada hak bersama: mu'asyarah bil makruf — pergaulan yang baik. Saling menutupi kekurangan, sebagaimana Al-Qur'an melukiskan suami istri sebagai pakaian satu sama lain (QS Al-Baqarah: 187). Pakaian menutup aib, menghangatkan, dan memperindah — begitulah seharusnya dua insan dalam satu rumah.

Rumah tangga dalam Islam bukan arena menuntut hak semata, melainkan berlomba menunaikan kewajiban. Ketika suami sibuk menunaikan kewajibannya dan istri sibuk menunaikan kewajibannya, hak masing-masing terpenuhi tanpa perlu diminta — dan di situlah sakinah, mawaddah, dan rahmah menemukan tempat tumbuhnya.`,
  },

  // ── Fiqih Warisan ───────────────────────────────────────────────────────
  {
    category: "fiqih-warisan",
    slug: "fiqih-waris-pengantar",
    title: "Mengenal Ilmu Faraidh: Warisan yang Diatur Langsung oleh Allah",
    body: `Di antara seluruh cabang fiqih, hukum warisan menempati kedudukan yang istimewa: bagian-bagiannya ditetapkan langsung oleh Allah di dalam Al-Qur'an, terperinci sampai ke angka-angkanya. Ayat-ayat waris dalam surah An-Nisa' ayat 11, 12, dan 176 menyebut bagian anak, orang tua, pasangan, dan saudara — lalu ditutup dengan peringatan yang menggetarkan: itulah batas-batas Allah, dan siapa yang menaatinya akan dimasukkan ke dalam surga.

Ilmu tentang pembagian ini disebut ilmu faraidh, dari kata faridhah yang berarti bagian yang telah ditentukan. Para ulama menyebutnya separuh ilmu — sebagian menjelaskan karena ia menyangkut dua keadaan manusia, hidup dan mati — dan generasi sahabat sangat menekankan mempelajarinya.

Mengapa warisan begitu penting hingga Allah sendiri yang membaginya? Karena harta peninggalan adalah titik rawan: di sanalah keluarga yang rukun bisa terpecah, dan yang lemah — anak yatim, janda — paling mudah dizalimi. Dengan pembagian dari langit, tidak ada ruang bagi kekuatan, gender, atau urutan lahir untuk saling merampas. Semua tunduk pada ketetapan yang sama.

Sebelum warisan dibagi, ada urutan yang harus ditunaikan dari harta peninggalan: biaya pengurusan jenazah, pelunasan utang almarhum, lalu wasiat — maksimal sepertiga harta dan tidak boleh untuk ahli waris. Barulah sisanya dibagikan kepada para ahli waris menurut faraidh.

Di zaman ini, banyak keluarga Muslim menunda pembagian warisan bertahun-tahun, atau membaginya menurut perasaan. Padahal menunda tanpa alasan dan mengubah bagian tanpa kerelaan semua pihak adalah pintu sengketa dan dosa. Mempelajari dasar-dasar faraidh — atau setidaknya tahu kapan harus bertanya kepada yang ahli — adalah bagian dari amanah kita terhadap keluarga. ULYAH juga menyediakan Kalkulator Waris di menu utama untuk membantu menghitung bagian sesuai ketentuan syariat.`,
  },
  {
    category: "fiqih-warisan",
    slug: "fiqih-waris-ahli-waris",
    title: "Ahli Waris dan Bagian-Bagiannya",
    body: `Siapa saja yang berhak menerima warisan, dan berapa bagiannya? Ilmu faraidh menjawabnya dengan sistem yang teliti. Secara garis besar, ahli waris terbagi dua kelompok: ashhabul furudh — mereka yang bagiannya disebut langsung dalam Al-Qur'an dalam bentuk pecahan tertentu — dan ashabah, yang menerima sisa harta setelah bagian-bagian tetap ditunaikan.

Beberapa contoh bagian tetap yang disebutkan dalam surah An-Nisa': seorang istri menerima seperdelapan jika suaminya meninggalkan anak, dan seperempat jika tidak ada anak. Suami menerima seperempat jika istrinya meninggalkan anak, dan setengah jika tidak. Ibu menerima seperenam jika almarhum punya anak; ayah juga seperenam dalam keadaan yang sama, dan ia sekaligus menjadi ashabah. Satu anak perempuan tunggal mendapat setengah; dua atau lebih berbagi dua pertiga; dan jika ada anak laki-laki, mereka semua menjadi ashabah dengan ketentuan bagian laki-laki dua kali bagian perempuan.

Mengapa laki-laki mendapat dua kali lipat? Karena dalam sistem Islam, harta laki-laki bukan miliknya sendiri: ia wajib menafkahi istri, anak, bahkan kerabatnya yang membutuhkan. Sementara bagian perempuan sepenuhnya miliknya pribadi — tidak wajib ia belanjakan untuk siapa pun. Dilihat sebagai satu sistem yang utuh, pembagian ini justru memberatkan tanggung jawab laki-laki.

Perlu diingat pula ada penghalang warisan: pembunuhan terhadap pewaris menggugurkan hak waris, dan perbedaan agama antara pewaris dan ahli waris menghalangi saling mewarisi menurut jumhur ulama.

Kasus-kasus nyata sering lebih rumit dari contoh dasar — ada kakek, nenek, saudara seibu, dan berbagai kombinasi yang memerlukan perhitungan khusus. Karena itu para ulama menyusun kaidah-kaidah rinci selama berabad-abad. Untuk kebutuhan praktis, gunakan Kalkulator Waris ULYAH sebagai langkah awal, lalu kuatkan dengan bertanya kepada ustadz atau lembaga yang menguasai faraidh sebelum pembagian dilakukan.`,
  },
  {
    category: "fiqih-warisan",
    slug: "fiqih-waris-wasiat-hibah",
    title: "Wasiat, Hibah, dan Batasannya dalam Hukum Waris",
    body: `Banyak sengketa warisan bermula dari kerancuan tiga istilah: warisan, wasiat, dan hibah. Ketiganya sama-sama memindahkan harta, tetapi hukum dan waktunya berbeda — dan Islam mengatur ketiganya dengan cermat.

Hibah adalah pemberian yang dilakukan semasa hidup. Seorang ayah boleh menghibahkan hartanya kepada siapa pun ketika ia masih sehat, termasuk kepada anak-anaknya. Namun Rasulullah shallallahu alaihi wa sallam memerintahkan untuk berlaku adil di antara anak-anak dalam pemberian — dalam hadits sahih beliau menolak menjadi saksi atas pemberian seorang ayah yang mengistimewakan satu anaknya saja, dan menyebutnya sebagai ketidakadilan. Hibah yang timpang sering menjadi bara sengketa yang menyala justru setelah sang pemberi tiada.

Wasiat adalah pesan pemindahan harta yang baru berlaku setelah wafat. Di sinilah dua batasan penting berlaku. Pertama, wasiat maksimal sepertiga dari harta peninggalan — ketika sahabat Sa'ad bin Abi Waqqash ingin mewasiatkan hartanya, Nabi membatasinya sepertiga dan bersabda, "Sepertiga itu pun sudah banyak. Sesungguhnya engkau meninggalkan ahli warismu dalam keadaan kaya lebih baik daripada meninggalkan mereka miskin meminta-minta." Kedua, tidak ada wasiat untuk ahli waris: orang yang sudah mendapat bagian faraidh tidak boleh menerima tambahan lewat wasiat, kecuali seluruh ahli waris lain merelakannya.

Adapun warisan itu sendiri tidak mengenal "surat warisan" versi kehendak pribadi. Begitu seseorang wafat, bagian setiap ahli waris telah ditetapkan Allah — bukan wilayah yang bisa diatur-atur oleh almarhum semasa hidupnya.

Dari sini tampak hikmahnya: hibah memberi keleluasaan di masa hidup dengan syarat keadilan; wasiat memberi ruang kebaikan untuk pihak di luar ahli waris — kerabat jauh, anak asuh, lembaga sosial — dengan pagar sepertiga; dan faraidh menjaga hak keluarga inti dari kesewenang-wenangan. Tiga pintu yang saling melengkapi, semuanya bermuara pada satu hal: harta berpindah tanpa meninggalkan luka.`,
  },

  // ── Pondasi Iman ────────────────────────────────────────────────────────
  {
    category: "pondasi-iman",
    slug: "pondasi-iman-rukun-iman",
    title: "Enam Rukun Iman: Fondasi Aqidah Seorang Muslim",
    body: `Ketika Malaikat Jibril datang dalam rupa seorang laki-laki dan bertanya kepada Rasulullah shallallahu alaihi wa sallam tentang iman, beliau menjawab: "Iman adalah engkau beriman kepada Allah, para malaikat-Nya, kitab-kitab-Nya, para rasul-Nya, hari akhir, dan engkau beriman kepada takdir yang baik maupun yang buruk." Hadits sahih riwayat Muslim ini menjadi rumusan enam rukun iman yang dikenal setiap Muslim.

Iman kepada Allah adalah porosnya: meyakini keberadaan-Nya, keesaan-Nya dalam mencipta dan mengatur, keesaan-Nya sebagai satu-satunya yang berhak disembah, serta kesempurnaan nama-nama dan sifat-Nya. Dari pokok ini seluruh rukun lain mengalir.

Iman kepada malaikat berarti meyakini makhluk cahaya yang tidak pernah membangkang perintah Allah — di antaranya Jibril pembawa wahyu, dan para pencatat amal yang tidak pernah lalai. Kesadaran bahwa setiap kata kita dicatat adalah buah langsung dari rukun ini.

Iman kepada kitab-kitab berarti meyakini bahwa Allah menurunkan petunjuk kepada para rasul-Nya — Taurat, Zabur, Injil — dan bahwa Al-Qur'an adalah kitab penutup yang terjaga keasliannya (QS Al-Hijr: 9). Iman kepada para rasul berarti meyakini seluruh utusan Allah tanpa membeda-bedakan, dari Nuh hingga Muhammad shallallahu alaihi wa sallam sebagai penutupnya.

Iman kepada hari akhir menanamkan kesadaran bahwa hidup ini bukan akhir cerita: ada kebangkitan, perhitungan, dan pembalasan yang seadil-adilnya. Dan iman kepada takdir mengajarkan bahwa segala sesuatu berjalan dalam ilmu dan izin Allah — melahirkan ketenangan tanpa mematikan ikhtiar.

Enam rukun ini bukan daftar hafalan anak sekolah semata. Ia adalah cara pandang yang utuh terhadap hidup: dari mana kita berasal, siapa yang mengawasi kita, petunjuk mana yang kita pegang, teladan siapa yang kita ikuti, ke mana kita menuju, dan bagaimana menyikapi apa yang menimpa kita. Siapa yang menghayatinya, kokohlah bangunannya menghadapi badai apa pun.`,
  },
  {
    category: "pondasi-iman",
    slug: "pondasi-iman-syahadat",
    title: "Makna Dua Kalimat Syahadat",
    body: `Gerbang masuk Islam hanya satu kalimat: Asyhadu an laa ilaaha illallah, wa asyhadu anna Muhammadar Rasulullah — aku bersaksi tiada tuhan yang berhak disembah selain Allah, dan aku bersaksi Muhammad adalah utusan Allah. Kalimat yang ringan diucapkan, tetapi para ulama menyebutnya kalimat paling berat dalam timbangan.

Syahadat pertama, laa ilaaha illallah, tersusun dari penolakan dan penetapan. "Laa ilaaha" menolak segala sesembahan — berhala, harta, jabatan, hawa nafsu, apa pun yang diperlakukan melebihi Allah. "Illallah" menetapkan satu-satunya yang berhak atas ibadah, kecintaan tertinggi, dan ketaatan mutlak. Tauhid bukan sekadar percaya Allah itu ada — kaum musyrikin Makkah pun mengakui Allah sebagai pencipta (QS Az-Zukhruf: 87). Yang membedakan Muslim adalah memurnikan ibadah hanya untuk-Nya.

Syahadat kedua menempatkan Muhammad shallallahu alaihi wa sallam sebagai utusan yang wajib dibenarkan kabarnya, ditaati perintahnya, dijauhi larangannya, dan tidak disembah — sebab beliau hamba Allah, bukan tuhan. Konsekuensinya: beribadah hanya dengan cara yang beliau contohkan. Dua syahadat ini melahirkan dua syarat diterimanya amal: ikhlas untuk Allah semata, dan mengikuti tuntunan Rasul-Nya.

Para ulama menjelaskan bahwa laa ilaaha illallah memiliki syarat-syarat: ilmu tentang maknanya, keyakinan tanpa keraguan, penerimaan tanpa penolakan, ketundukan dalam amal, kejujuran, keikhlasan, dan kecintaan. Ini bukan untuk mempersulit, melainkan mengingatkan bahwa syahadat adalah ikrar yang hidup — bukan mantra yang diucapkan lalu ditinggalkan.

Dalam kehidupan sehari-hari, syahadat diuji pada pilihan-pilihan kecil: ketika keuntungan haram menggoda, ketika perintah Allah terasa berat, ketika tren dunia berlawanan dengan sunnah. Setiap kali kita memilih Allah dan Rasul-Nya, syahadat itu diperbarui. Rasulullah mengabarkan bahwa siapa yang akhir ucapannya laa ilaaha illallah akan masuk surga — dan cara terbaik agar ia menjadi ucapan terakhir adalah menjadikannya nafas kehidupan sehari-hari.`,
  },
  {
    category: "pondasi-iman",
    slug: "pondasi-iman-qada-qadar",
    title: "Iman kepada Qada dan Qadar: Tenang Menghadapi Takdir",
    body: `Tidak ada rukun iman yang lebih sering disalahpahami daripada iman kepada qada dan qadar. Sebagian orang mengiranya ajaran pasrah yang mematikan usaha; sebagian lagi menolaknya karena merasa hidupnya ditentukan sepihak. Keduanya keliru — dan memahami takdir dengan benar justru menghasilkan manusia yang paling tangguh.

Para ulama menjelaskan empat tingkatan iman kepada takdir. Pertama, al-ilmu: Allah mengetahui segala sesuatu sebelum terjadi. Kedua, al-kitabah: semuanya tertulis di Lauh Mahfuzh (QS Al-Hadid: 22). Ketiga, al-masyi'ah: tidak ada yang terjadi di luar kehendak-Nya. Keempat, al-khalq: Allah pencipta segala sesuatu, termasuk perbuatan hamba — sementara hamba tetap memiliki kehendak dan pilihan yang karenanya ia diberi pahala atau dosa.

Islam menolak dua kutub ekstrem: menyangka manusia terpaksa seperti wayang tanpa pilihan, dan menyangka manusia menciptakan nasibnya sendiri lepas dari Allah. Yang benar berada di tengah: kita berikhtiar dengan sungguh-sungguh karena diperintahkan, lalu menerima hasilnya dengan ridha karena itu ketetapan-Nya. Umar bin Khattab pernah ditanya ketika menghindari wilayah wabah: "Apakah engkau lari dari takdir Allah?" Beliau menjawab: "Kami lari dari takdir Allah menuju takdir Allah." Ikhtiar dan takdir tidak pernah bertentangan.

Buah iman kepada takdir adalah ketenangan yang tidak bisa dibeli. Rasulullah shallallahu alaihi wa sallam bersabda: "Sungguh menakjubkan urusan orang beriman; semua urusannya baik baginya. Jika mendapat nikmat ia bersyukur, dan itu baik baginya. Jika ditimpa kesulitan ia bersabar, dan itu baik baginya" (HR Muslim). Beliau juga berpesan: jika sesuatu menimpamu, jangan berkata "seandainya aku berbuat begini" — karena kata "seandainya" membuka pintu bisikan setan.

Rezeki yang lewat bukan salah jalan; musibah yang datang bukan tanpa hitungan. Yang menjadi tanggung jawab kita hanyalah ikhtiar dan sikap — dan pada dua hal itulah nilai kita di sisi Allah ditentukan.`,
  },

  // ── Hikmah Harian ───────────────────────────────────────────────────────
  {
    category: "hikmah-harian",
    slug: "hikmah-ikhlas-ruh-amal",
    title: "Ikhlas: Ruh Setiap Amal",
    body: `Hadits pertama yang dipilih Imam Bukhari untuk membuka kitab sahihnya, dan yang dipilih Imam Nawawi membuka Arba'in-nya, adalah sabda Rasulullah shallallahu alaihi wa sallam: "Innamal-a'malu bin-niyyat" — sesungguhnya amal-amal itu tergantung pada niatnya, dan setiap orang mendapat sesuai yang ia niatkan (HR Bukhari dan Muslim). Para ulama menyebut hadits ini sepertiga ilmu, karena hampir seluruh amal manusia berpangkal pada gerak hati.

Ikhlas artinya memurnikan tujuan: melakukan ketaatan semata karena Allah, bukan demi pujian, pengakuan, atau pencitraan. Ia tidak mensyaratkan amal itu tersembunyi — yang disyaratkan adalah hati yang tidak bergantung pada tepuk tangan. Dua orang bisa mengerjakan amal yang sama persis dengan nilai yang berbeda seperti langit dan bumi, hanya karena isi hatinya berbeda.

Lawannya adalah riya — beramal untuk dilihat manusia — yang disebut Rasulullah sebagai syirik kecil, hal yang paling beliau khawatirkan menimpa umatnya. Di era media sosial, ujian ini semakin halus: berbagi kebaikan bisa menginspirasi, tetapi juga bisa diam-diam menggeser niat. Para ulama memberi penawar sederhana — biasakan punya amal rahasia, sedekah yang tidak diketahui siapa pun, shalat malam yang tidak pernah diceritakan; itu tabungan yang murni antara engkau dan Allah.

Kabar baiknya, ikhlas melipatgandakan hal-hal kecil. Menyingkirkan duri dari jalan, senyum kepada saudara, sesuap makanan untuk keluarga — semuanya menjadi ibadah bernilai besar ketika diniatkan karena Allah. Sebaliknya, amal segunung bisa hangus tak bersisa oleh niat yang rusak.

Ikhlas adalah pekerjaan seumur hidup, bukan pencapaian sekali jadi. Sufyan Ats-Tsauri berkata bahwa tidak ada yang lebih berat beliau perangi daripada niatnya sendiri, karena ia selalu berbolak-balik. Maka mulailah setiap pagi dengan meluruskan niat, dan tutup setiap amal dengan doa agar diterima. Allah tidak menilai rupa dan harta kita — Dia menilai hati dan amal kita.`,
  },
  {
    category: "hikmah-harian",
    slug: "hikmah-sabar-syukur",
    title: "Sabar dan Syukur: Dua Sayap Seorang Mukmin",
    body: `Hidup manusia hanya berputar di antara dua keadaan: sesuatu yang ia sukai, atau sesuatu yang tidak ia sukai. Islam memberi bekal untuk keduanya — syukur untuk yang pertama, sabar untuk yang kedua. Karena itu sebagian ulama berkata: iman itu dua bagian; separuhnya sabar, separuhnya syukur.

Sabar bukan kepasrahan yang lemah. Dalam Al-Qur'an, sabar selalu tampil sebagai kekuatan aktif: sabar dalam ketaatan — tetap istiqamah walau berat; sabar menahan diri dari maksiat — kekuatan menolak yang haram; dan sabar menghadapi musibah — tidak runtuh oleh kehilangan. Allah menjanjikan kebersamaan-Nya bagi orang-orang sabar (QS Al-Baqarah: 153) dan pahala tanpa batas hitungan bagi mereka (QS Az-Zumar: 10). Dan sabar yang sejati, kata Rasulullah, adalah pada benturan pertama — reaksi sesaat ketika kabar buruk baru tiba.

Syukur pun bukan sekadar ucapan alhamdulillah. Para ulama menjelaskan syukur bekerja pada tiga tempat: hati yang mengakui semua nikmat datang dari Allah, lisan yang memuji-Nya, dan anggota badan yang menggunakan nikmat itu untuk ketaatan. Mata yang bersyukur dipakai membaca Al-Qur'an; harta yang disyukuri mengalir ke sedekah; ilmu yang disyukuri diajarkan. Allah berjanji: "Jika kalian bersyukur, pasti Aku tambah nikmat kepada kalian" (QS Ibrahim: 7).

Rasulullah shallallahu alaihi wa sallam merangkum keduanya dalam satu sabda yang menakjubkan: "Sungguh menakjubkan urusan orang beriman; semua urusannya baik baginya... jika mendapat nikmat ia bersyukur, dan jika ditimpa kesusahan ia bersabar" (HR Muslim). Tidak ada keadaan yang merugikan seorang mukmin — asal ia tahu harus memakai sayap yang mana.

Latihan praktisnya sederhana. Setiap malam, sebut tiga nikmat hari itu secara spesifik, lalu syukuri. Dan ketika kesulitan datang, tahan lisan pada menit-menit pertama, ucapkan innaa lillaahi wa innaa ilaihi raaji'uun, dan ingat bahwa tidak ada lelah, sakit, atau sedih yang menimpa seorang Muslim kecuali Allah hapuskan dosa-dosanya karenanya. Dengan dua sayap inilah seorang mukmin terbang melewati semua cuaca kehidupan.`,
  },
  {
    category: "hikmah-harian",
    slug: "hikmah-menjaga-lisan",
    title: "Menjaga Lisan di Zaman Semua Orang Bisa Bicara",
    body: `"Siapa yang beriman kepada Allah dan hari akhir, hendaklah ia berkata baik atau diam." Pesan Rasulullah shallallahu alaihi wa sallam dalam hadits sahih ini hanya sebelas kata dalam terjemahannya, tetapi jika satu umat mengamalkannya, padamlah separuh pertikaian dunia.

Lisan adalah nikmat yang paling sering lupa dijaga. Ia kecil, tidak bertulang, tetapi kata para ulama, paling banyak menjerumuskan manusia. Ketika Mu'adz bin Jabal bertanya kepada Nabi apakah manusia disiksa karena ucapannya, beliau menjawab: "Bukankah manusia diseret ke neraka di atas wajah mereka tidak lain karena hasil panen lisan mereka?" Setiap kata tercatat — "Tidak ada satu ucapan pun yang dilontarkan kecuali di sisinya ada malaikat pengawas yang selalu hadir" (QS Qaf: 18).

Di zaman ini, "lisan" tidak lagi hanya di mulut. Jari yang mengetik status, komentar, dan pesan singkat adalah lisan kedua yang jangkauannya lebih jauh dan jejaknya lebih awet. Ghibah tidak lagi berbisik di teras rumah — ia bisa dibagikan ribuan kali dalam semalam. Namimah, fitnah, celaan, dan penghinaan kini punya tombol kirim. Padahal definisi ghibah dari Rasulullah tetap berlaku: menyebut saudaramu dengan sesuatu yang ia benci — "jika itu benar ada padanya, engkau telah meng-ghibahnya; jika tidak benar, engkau telah memfitnahnya" (HR Muslim).

Islam menawarkan disiplin yang jelas. Sebelum bicara atau mengetik, timbang tiga hal: benarkah, bermanfaatkah, dan baikkah waktunya? Jika lolos ketiganya, sampaikan dengan cara terbaik. Jika ragu, diam — dan diam bukan kekalahan; Rasulullah bersabda, "Siapa yang menjamin untukku apa yang ada di antara dua rahangnya dan dua kakinya, aku jamin surga untuknya" (HR Bukhari).

Lisan yang terjaga bukan lisan yang bisu, melainkan lisan yang setiap keluarnya bernilai: kata yang jujur, nasihat yang lembut, doa yang tulus, dan dzikir yang membasahi. Mulailah hari ini: satu ghibah yang ditahan, satu komentar pedas yang tidak jadi dikirim — semuanya tercatat sebagai kebaikan di sisi Allah.`,
  },

  // ── Tafsir Tematik ──────────────────────────────────────────────────────
  {
    category: "tafsir-tematik",
    slug: "tafsir-tematik-sabar",
    title: "Ayat-Ayat Kesabaran: Bagaimana Al-Qur'an Menguatkan Jiwa",
    body: `Kata sabar dan turunannya disebut dalam Al-Qur'an lebih dari sembilan puluh kali — jauh lebih sering daripada banyak perintah lainnya. Frekuensi ini sendiri adalah tafsir: Allah tahu hamba-Nya akan sangat sering membutuhkannya.

Perhatikan bagaimana Al-Qur'an menempatkan sabar. Dalam surah Al-Baqarah ayat 45 dan 153, sabar disandingkan dengan shalat sebagai penolong: "Mintalah pertolongan dengan sabar dan shalat." Para mufassir menjelaskan keduanya adalah pasangan bekal — sabar menahan gejolak dari dalam, shalat menyambungkan kekuatan dari atas. Lalu di ayat 155-157 surah yang sama, Allah berterus terang bahwa ujian pasti datang — ketakutan, kelaparan, kekurangan harta, jiwa, dan buah-buahan — kemudian memberi kabar gembira bagi orang-orang sabar: shalawat dari Rabb mereka, rahmat, dan predikat sebagai orang yang mendapat petunjuk. Kalimat kuncinya adalah ucapan yang diajarkan: innaa lillaahi wa innaa ilaihi raaji'uun — kami milik Allah, dan kepada-Nya kami kembali. Kesadaran kepemilikan ini yang membuat kehilangan tidak menghancurkan.

Dalam surah Az-Zumar ayat 10, Allah menjanjikan sesuatu yang tidak dijanjikan pada amal lain: "Sesungguhnya orang-orang yang bersabar akan disempurnakan pahalanya tanpa batas hitungan." Sementara di surah Ali Imran ayat 200, perintahnya berlapis: bersabarlah, kuatkanlah kesabaranmu, dan tetaplah bersiap siaga — isyarat bahwa sabar itu bertingkat dan bisa dilatih naik.

Al-Qur'an juga mengajarkan sabar lewat kisah. Nabi Ayyub kehilangan harta, anak, dan kesehatannya bertahun-tahun, namun pujian Allah untuknya singkat dan padat: "Sungguh Kami dapati dia seorang yang sabar; sebaik-baik hamba" (QS Shad: 44). Nabi Ya'qub dengan "fa shabrun jamiil" — sabar yang indah, tanpa mengeluh kepada manusia (QS Yusuf: 18). Dan para rasul Ulul Azmi diperintahkan bersabar sebagaimana kesabaran menjadi mahkota mereka (QS Al-Ahqaf: 35).

Membaca ayat-ayat ini bukan untuk sekadar tahu, tetapi untuk diambil sebagai bekal: ketika ujianmu terasa berat, bukalah kembali ayat-ayat ini — karena beginilah cara Allah sendiri menguatkan jiwa hamba-Nya.`,
  },
  {
    category: "tafsir-tematik",
    slug: "tafsir-tematik-rezeki",
    title: "Rezeki dalam Al-Qur'an: Antara Ikhtiar dan Tawakal",
    body: `Kekhawatiran soal rezeki adalah kecemasan paling universal manusia — dan Al-Qur'an menjawabnya berulang-ulang dengan penegasan yang menenangkan: "Tidak ada satu makhluk melata pun di bumi melainkan Allah-lah yang menanggung rezekinya" (QS Hud: 6). Jaminan ini datang dari Dzat yang menyebut diri-Nya Ar-Razzaq — Maha Pemberi Rezeki — "Sesungguhnya Allah, Dialah Maha Pemberi rezeki yang mempunyai kekuatan lagi sangat kokoh" (QS Adz-Dzariyat: 58).

Namun jaminan itu tidak pernah dijadikan alasan berpangku tangan. Surah Al-Mulk ayat 15 memerintahkan: "Dialah yang menjadikan bumi mudah bagimu, maka berjalanlah di segala penjurunya dan makanlah dari rezeki-Nya." Berjalan — bergerak, bekerja, berdagang, menanam. Bahkan pada hari Jumat, begitu shalat selesai, perintahnya langsung: "bertebaranlah kamu di bumi dan carilah karunia Allah" (QS Al-Jumu'ah: 10). Dalam kisah Maryam, Allah mampu memberinya makan tanpa sebab, tetapi ia tetap diperintah menggoyang pangkal pohon kurma (QS Maryam: 25) — isyarat abadi bahwa sunnatullah menghendaki sebab, walau hasil sepenuhnya di tangan-Nya.

Al-Qur'an juga membuka pintu-pintu rezeki yang tidak tampak di logika dagang. Istighfar: "Mohonlah ampun kepada Rabbmu, sesungguhnya Dia Maha Pengampun, niscaya Dia menurunkan hujan lebat, memperbanyak harta dan anak-anakmu" (QS Nuh: 10-12). Takwa: "Siapa yang bertakwa kepada Allah, Dia akan mengadakan jalan keluar baginya dan memberinya rezeki dari arah yang tidak disangka-sangka" (QS Ath-Thalaq: 2-3). Syukur yang menambah nikmat (QS Ibrahim: 7), dan infak yang justru menggantikan: "Apa saja yang kamu infakkan, maka Allah akan menggantinya" (QS Saba': 39).

Yang terakhir, Al-Qur'an meluruskan ukuran. Rezeki yang dilapangkan bukan tanda kemuliaan, dan yang disempitkan bukan tanda kehinaan (QS Al-Fajr: 15-16) — keduanya ujian. Maka rumus mukmin sederhana: ikhtiar maksimal seolah semua tergantung usahamu, hati bersandar penuh seolah semua tergantung Allah — karena memang keduanya benar.`,
  },
  {
    category: "tafsir-tematik",
    slug: "tafsir-tematik-doa-nabi",
    title: "Doa-Doa Para Nabi dalam Al-Qur'an",
    body: `Salah satu hadiah terindah Al-Qur'an adalah rekaman doa para nabi — kalimat-kalimat yang pernah naik dari hati manusia-manusia terbaik pada saat-saat tersulit mereka, lalu diabadikan Allah agar kita ikut mengucapkannya.

Ada doa Nabi Adam setelah tergelincir: "Rabbanaa zhalamnaa anfusanaa..." — Ya Rabb kami, kami telah menzalimi diri kami sendiri; jika Engkau tidak mengampuni kami dan merahmati kami, pastilah kami termasuk orang-orang yang rugi (QS Al-A'raf: 23). Inilah bahasa taubat pertama dalam sejarah manusia: tanpa membela diri, tanpa menyalahkan pihak lain.

Ada doa Nabi Yunus dari tiga kegelapan — malam, lautan, dan perut ikan: "Laa ilaaha illaa anta, subhaanaka, innii kuntu minazh-zhaalimiin" (QS Al-Anbiya': 87). Tauhid, penyucian, lalu pengakuan. Ayat berikutnya menyebut janji yang berlaku umum: "Demikianlah Kami menyelamatkan orang-orang beriman" — bukan hanya Yunus.

Ada doa Nabi Ibrahim yang berpikir lintas generasi: memohon negeri yang aman, keturunan yang mendirikan shalat, dan diutusnya seorang rasul di tengah anak cucunya (QS Al-Baqarah: 126-129; QS Ibrahim: 40) — doa yang terjawab ribuan tahun kemudian dengan diutusnya Rasulullah shallallahu alaihi wa sallam. Ada doa Nabi Musa yang diucapkan dalam keadaan buron dan tak berdaya: "Rabbi innii limaa anzalta ilayya min khairin faqiir" — Ya Rabbku, sungguh aku sangat membutuhkan kebaikan apa pun yang Engkau turunkan kepadaku (QS Al-Qashash: 24). Dan doa Nabi Zakariya di usia senja memohon keturunan, yang dibuka dengan pengakuan paling jujur tentang uban dan tulang yang melemah (QS Maryam: 4).

Perhatikan polanya: doa para nabi selalu memadukan pengakuan kelemahan diri dengan keyakinan penuh pada kemurahan Allah. Tidak ada gengsi, tidak ada putus asa. Mereka berdoa pada saat sebab-sebab dunia tampak habis — dan justru di titik itu pertolongan datang.

Hafalkanlah satu saja dari doa-doa ini, dan bawalah dalam sujudmu. Kalimat yang pernah menyelamatkan seorang nabi dari perut ikan, insya Allah cukup kuat membawa hajatmu naik ke langit yang sama.`,
  },

  // ── Kisah Sahabat ───────────────────────────────────────────────────────
  {
    category: "kisah-sahabat",
    slug: "kisah-sahabat-abu-bakar-audio",
    title: "Abu Bakar Ash-Shiddiq: Iman yang Tak Pernah Ragu",
    body: `Jika iman seluruh umat ditimbang dengan iman satu orang ini, kata sebagian ulama salaf, iman Abu Bakar lebih berat. Ia bukan yang paling kaya, bukan yang paling perkasa — kelebihannya ada pada sesuatu yang tak terlihat: hati yang tidak pernah ragu.

Namanya Abdullah bin Abi Quhafah, dari suku Taim. Sebelum Islam pun ia dikenal jujur, tidak pernah menyembah berhala, dan dipercaya kaum Quraisy dalam urusan diyat dan dagang. Ketika Rasulullah shallallahu alaihi wa sallam menyampaikan Islam kepadanya, ia beriman seketika — tanpa jeda, tanpa tawar-menawar. Rasulullah pernah bersabda bahwa setiap orang yang beliau dakwahi selalu punya keraguan sesaat, kecuali Abu Bakar.

Gelarnya, Ash-Shiddiq — yang membenarkan — dikukuhkan pada peristiwa Isra Mikraj. Ketika kaum musyrikin mengira kabar perjalanan semalam ke Baitul Maqdis itu akan membuatnya murtad, jawabannya menjadi legenda: "Jika ia yang mengatakannya, sungguh ia telah benar. Aku bahkan membenarkannya dalam kabar dari langit yang datang pagi dan petang."

Hartanya habis untuk Islam: membebaskan Bilal dan budak-budak lemah yang disiksa, dan pada Perang Tabuk ia membawa seluruh hartanya. Ditanya apa yang ia sisakan untuk keluarganya, jawabnya: "Aku sisakan untuk mereka Allah dan Rasul-Nya." Ia menemani Rasulullah di gua Tsur pada malam hijrah yang genting — diabadikan Al-Qur'an sebagai "salah seorang dari dua orang ketika keduanya berada dalam gua" dengan kalimat penenang yang abadi: "Laa tahzan, innallaaha ma'anaa — jangan bersedih, sesungguhnya Allah bersama kita" (QS At-Taubah: 40).

Ketika Rasulullah wafat dan Madinah berguncang, Abu Bakar-lah yang berdiri paling kokoh: "Siapa menyembah Muhammad, sesungguhnya Muhammad telah wafat. Siapa menyembah Allah, sesungguhnya Allah Maha Hidup, tidak akan mati." Dua tahun lebih masa kekhalifahannya menjaga umat dari perpecahan, menegakkan agama menghadapi kemurtadan, dan memulai pengumpulan mushaf Al-Qur'an.

Warisannya untuk kita satu kalimat: iman itu bukan soal siapa paling banyak amalnya hari ini, tetapi siapa yang hatinya paling lurus dan yakin kepada Allah dan Rasul-Nya — lalu amal mengalir dari keyakinan itu.`,
  },
  {
    category: "kisah-sahabat",
    slug: "kisah-sahabat-umar-audio",
    title: "Umar bin Khattab: Keadilan yang Menggetarkan",
    body: `Sebelum Islam, Umar bin Khattab adalah salah satu penentangnya yang paling keras. Maka ketika Rasulullah shallallahu alaihi wa sallam berdoa, "Ya Allah, muliakan Islam dengan salah satu dari dua Umar," dan doa itu jatuh pada Umar bin Khattab — sejarah berubah arah. Sejak keislamannya, kaum Muslimin yang tadinya sembunyi-sembunyi mulai berani shalat terang-terangan di sisi Ka'bah.

Rasulullah menggelarinya Al-Faruq — pembeda antara yang benar dan yang batil. Ketajaman nuraninya diakui langsung oleh wahyu: beberapa kali pendapat Umar selaras dengan ayat yang kemudian turun, seperti tentang hijab dan tawanan Perang Badar. Rasulullah bahkan bersabda bahwa seandainya ada nabi setelah beliau, Umar-lah orangnya — sabda yang menegaskan kedudukan, bukan kenabian.

Sepuluh tahun kekhalifahannya adalah salah satu pemerintahan paling berpengaruh dalam sejarah dunia: Syam, Mesir, dan Persia terbuka; Baitul Maqdis diserahkan damai kepadanya; kalender hijriah ditetapkan; administrasi negara, baitul mal, dan pengadilan ditata. Namun yang membuat namanya menggetarkan sampai hari ini bukan luas wilayahnya — melainkan cara ia memikulnya.

Ia berpatroli malam memanggul sendiri karung gandum untuk rakyat yang kelaparan, dan menolak diwakilkan: "Apakah engkau mau memikul dosaku di hari kiamat?" Ia makan roti kasar sementara rakyatnya makan lebih baik, dan berkata pada tahun paceklik: "Bagaimana aku peduli pada rakyat jika aku tidak merasakan yang mereka rasakan?" Kalimatnya kepada para gubernur menjadi mahkota keadilan sepanjang masa: "Sejak kapan kalian memperbudak manusia, padahal ibu-ibu mereka melahirkan mereka dalam keadaan merdeka?"

Ia yang ditakuti setan, kata hadits, justru paling takut kepada Allah. "Seandainya seekor keledai terperosok di jalanan Irak," katanya, "aku takut Allah menanyaiku: mengapa tidak engkau ratakan jalannya, wahai Umar?" Ia wafat syahid ditikam saat mengimami shalat subuh, dan dimakamkan di samping dua kekasihnya: Rasulullah dan Abu Bakar.

Dari Umar kita belajar bahwa kekuasaan dalam Islam bukan kehormatan yang dinikmati, melainkan beban yang kelak ditanya — dan bahwa rasa takut kepada Allah adalah sumber keberanian paling murni di hadapan manusia.`,
  },
  {
    category: "kisah-sahabat",
    slug: "kisah-sahabat-bilal-audio",
    title: "Bilal bin Rabah: Suara Iman yang Tak Bisa Dibungkam",
    body: `Di bawah terik matahari Makkah, di atas pasir yang membakar, seorang budak berkulit hitam ditindih batu besar oleh tuannya. Ia disiksa untuk satu kesalahan: beriman kepada Allah. Umayyah bin Khalaf memaksanya kembali menyembah Lata dan Uzza, tetapi dari dada yang sesak itu hanya keluar dua kata yang mengguncang sejarah: "Ahad... Ahad..." — Yang Maha Esa, Yang Maha Esa.

Bilal bin Rabah lahir sebagai budak dari ibu bernama Hamamah. Di mata masyarakat jahiliyah, ia manusia tanpa harga. Namun Islam datang membalik semua ukuran: yang paling mulia di sisi Allah bukan yang paling bangsawan, melainkan yang paling bertakwa (QS Al-Hujurat: 13). Abu Bakar menebusnya dan memerdekakannya — dan sejak itu Bilal berdiri sejajar dengan para bangsawan Quraisy yang dulu menginjaknya.

Kemuliaannya memuncak ketika Rasulullah shallallahu alaihi wa sallam memilihnya menjadi muadzin pertama Islam. Suaranya yang dalam dan jernih memanggil manusia kepada shalat dari atas Masjid Nabawi — dan pada hari pembebasan Makkah, dari tempat yang tak terbayangkan: Bilal, bekas budak itu, naik ke ATAS Ka'bah dan mengumandangkan adzan di puncak rumah Allah, disaksikan para pembesar Quraisy yang dulu menyiksanya. Tidak ada deklarasi kesetaraan manusia yang lebih fasih daripada pemandangan itu.

Rasulullah pernah bersabda kepadanya: "Wahai Bilal, ceritakan amal yang paling engkau harapkan, karena aku mendengar suara terompahmu di surga." Jawab Bilal sederhana: ia tidak pernah berwudhu kecuali shalat sunnah setelahnya (HR Bukhari dan Muslim) — amal rahasia yang istiqamah.

Setelah Rasulullah wafat, Bilal hampir tak sanggup lagi adzan; kerinduannya terlalu berat setiap sampai pada nama Muhammad. Ia menghabiskan sisa umurnya di Syam sebagai mujahid, dan wafat di sana.

Dari Bilal kita belajar bahwa iman adalah kemerdekaan yang sesungguhnya: tubuh boleh dirantai, tetapi "Ahad" yang bersemayam di hati tidak bisa disentuh siapa pun. Dan bahwa di sisi Allah, derajat tidak diwariskan oleh darah — ia diraih oleh takwa, kesabaran, dan amal yang tulus.`,
  },

  // ── Kisah Tabi'in ───────────────────────────────────────────────────────
  {
    category: "kisah-tabiin",
    slug: "kisah-tabiin-uwais-audio",
    title: "Uwais Al-Qarni: Terkenal di Langit, Tak Dikenal di Bumi",
    body: `Ada seorang tabi'in yang tidak pernah bertemu Rasulullah shallallahu alaihi wa sallam, tetapi namanya disebut-sebut oleh beliau kepada para sahabat. Namanya Uwais bin Amir Al-Qarni, dari Yaman.

Dalam hadits sahih riwayat Muslim, Rasulullah berpesan kepada Umar bin Khattab: akan datang kepadamu seorang bernama Uwais dari Yaman bersama rombongan, dahulu ia berpenyakit kulit lalu sembuh kecuali sebesar satu dirham, ia sangat berbakti kepada ibunya — "jika ia bersumpah atas nama Allah, pasti Allah kabulkan. Maka jika engkau bisa memintanya memohonkan ampun untukmu, lakukanlah."

Renungkan keganjilan ini: Umar, khalifah yang dijamin surga, diperintahkan meminta doa kepada seorang lelaki miskin tak dikenal. Bertahun-tahun Umar mencarinya pada setiap rombongan haji dari Yaman, sampai akhirnya bertemu. Setelah meminta Uwais memohonkan ampun untuknya, Umar menawarkan bantuan dan pengaruhnya. Uwais hanya meminta satu hal: dibiarkan tetap tak dikenal, larut di tengah manusia.

Apa rahasia derajatnya? Bukan jihad yang masyhur, bukan ilmu yang diriwayatkan banyak murid. Rahasianya disebut sendiri oleh Rasulullah: baktinya kepada ibunya. Uwais menahan diri tidak berhijrah menemui Nabi yang sangat ia rindukan — karena ibunya yang tua membutuhkannya. Ia korbankan kemuliaan yang tampak demi kewajiban yang tersembunyi, dan Allah menggantinya dengan kedudukan yang diumumkan dari atas tujuh langit.

Para ulama menyebut Uwais pemimpin para tabi'in dalam kezuhudan. Hidupnya miskin, pakaiannya sederhana, kadang jadi bahan ejekan orang yang tak tahu siapa dia sebenarnya. Ia kemudian gugur — menurut banyak riwayat — di barisan kaum Muslimin pada Perang Shiffin.

Kisah Uwais adalah tamparan lembut bagi zaman yang haus pengakuan. Ada manusia-manusia yang tidak punya panggung, tidak punya pengikut, doanya tidak diliput siapa pun — tetapi jika ia bersumpah atas nama Allah, Allah kabulkan. Popularitas di bumi tidak berbanding lurus dengan kedudukan di langit. Dan pintu menuju kedudukan semacam itu ternyata dekat sekali: birrul walidain — berbakti kepada orang tua — dan keikhlasan yang tidak butuh diketahui manusia.`,
  },
  {
    category: "kisah-tabiin",
    slug: "kisah-tabiin-hasan-bashri-audio",
    title: "Hasan Al-Bashri: Lisan Hikmah dari Kota Bashrah",
    body: `Ia lahir di Madinah pada masa kekhalifahan Umar bin Khattab, dari ibu yang menjadi pelayan Ummu Salamah, istri Rasulullah shallallahu alaihi wa sallam. Konon sang Ummul Mukminin sendiri pernah mengasuh bayi itu. Ia tumbuh di lingkungan yang udaranya masih dipenuhi nafas para sahabat — dan kelak menjadi tokoh tabi'in yang paling masyhur: Al-Hasan bin Abil Hasan Al-Bashri.

Pindah ke Bashrah, ia menimba ilmu dari para sahabat besar dan menjadi rujukan kota itu dalam ilmu, fatwa, dan nasihat. Yang membuat majelisnya berbeda adalah dua hal: kefasihannya yang luar biasa, dan — lebih penting — hatinya. Kata orang-orang zamannya, jika Hasan berbicara tentang akhirat, seolah-olah ia baru melihatnya dengan mata kepala; jika ia mengingatkan tentang kematian, seolah kematian berdiri di pintu.

Nasihat-nasihatnya diwariskan turun-temurun karena menghunjam tanpa basa-basi. "Wahai anak Adam, engkau hanyalah kumpulan hari-hari; setiap satu hari pergi, pergilah sebagian dirimu." "Dunia itu tiga hari: kemarin telah pergi dengan segala isinya, esok belum tentu engkau menemuinya, maka milikmu hanyalah hari ini — beramallah di dalamnya." Tentang manusia yang terus menunda taubat ia berkata: mereka tertipu oleh kalimat 'nanti'.

Keberaniannya kepada penguasa juga tercatat. Di hadapan gubernur yang zalim, ia tetap menyampaikan kebenaran dengan hikmah — tidak menjilat, tidak pula memberontak menumpahkan darah. Ketika Umar bin Abdul Aziz menjadi khalifah dan meminta nasihatnya, Hasan menulis surat-surat yang menjadi cermin bagi setiap pemimpin: ingatkan bahwa kekuasaan adalah titipan sebentar, dan yang kekal hanya keadilan yang ditegakkan di dalamnya.

Ia wafat di Bashrah pada tahun 110 hijriah, diiringi hampir seluruh penduduk kota — sampai-sampai, kata para perawi, masjid jami tidak menyelenggarakan shalat ashar berjamaah seperti biasa karena kosongnya kota mengantar jenazahnya.

Dari Hasan Al-Bashri kita belajar bahwa nasihat yang menggerakkan bukan lahir dari kepandaian merangkai kata, melainkan dari hati yang lebih dulu mengamalkannya. Zuhud bukan membenci dunia, tetapi tidak membiarkan dunia bertahta di hati — dan itulah yang membuat kata-katanya tetap hidup tiga belas abad kemudian.`,
  },

  // ── Kisah Tabi'in Tabi'in ───────────────────────────────────────────────
  {
    category: "kisah-tabiin-tabiin",
    slug: "kisah-tabtab-sufyan-audio",
    title: "Sufyan Ats-Tsauri: Amirul Mukminin dalam Hadits",
    body: `Pada generasi ketiga umat ini — tabi'ut tabi'in, murid dari murid para sahabat — berdiri seorang ulama yang oleh para ahli hadits digelari Amirul Mukminin fil Hadits, pemimpin orang beriman dalam ilmu hadits: Sufyan bin Sa'id Ats-Tsauri, lahir di Kufah tahun 97 hijriah.

Kufah masa itu adalah samudera ilmu, dan Sufyan meminum darinya sejak belia. Hafalannya menakjubkan — ia berkata tidak pernah menghafal sesuatu lalu melupakannya. Para ulama sezamannya, termasuk Imam Malik di Madinah, mengakui keunggulannya. Ribuan hadits ia riwayatkan dengan sanad-sanad yang menjadi tulang punggung kitab-kitab hadits belakangan, dan ia juga imam dalam fiqih dengan madzhab tersendiri yang bertahan beberapa abad.

Namun kebesaran Sufyan tidak berhenti di kekuatan hafalan. Yang membuat namanya harum adalah sikapnya terhadap dunia dan kekuasaan. Ia hidup zuhud dari hasil dagang kecilnya sendiri, menolak hadiah-hadiah penguasa, dan menghindari pintu istana seperti menghindari api. Ketika khalifah hendak mengangkatnya menjadi hakim, ia menolak dan memilih berpindah-pindah kota dalam persembunyian bertahun-tahun sampai wafatnya di Bashrah tahun 161 hijriah. Baginya, mendekat pada kekuasaan berisiko menggadaikan kebenaran — dan lidah yang sudah digaji sulit berkata jujur.

Kalimat-kalimatnya menjadi permata nasihat. "Zuhud terhadap dunia itu bukan memakai pakaian kasar dan makan makanan keras, tetapi pendeknya angan-angan." "Tidak ada yang lebih berat aku perangi daripada niatku sendiri, karena ia selalu berbolak-balik." Ia juga mengingatkan para penuntut ilmu bahwa ilmu dipelajari untuk membuat takut kepada Allah — jika tidak, ia hanya menambah beban hujjah.

Dari Sufyan Ats-Tsauri kita belajar keseimbangan yang langka: puncak kepakaran dan puncak kehati-hatian dalam satu jiwa. Semakin tinggi ilmunya, semakin rendah hatinya; semakin besar namanya, semakin jauh ia dari pintu-pintu yang bisa merusak keikhlasannya. Ilmu tanpa wara' hanyalah kecerdasan; dan Sufyan menunjukkan seperti apa jadinya jika keduanya bersatu.`,
  },
  {
    category: "kisah-tabiin-tabiin",
    slug: "kisah-tabtab-ibnul-mubarak-audio",
    title: "Abdullah bin Al-Mubarak: Ulama, Saudagar, dan Mujahid",
    body: `Jika ada satu nama dari generasi tabi'ut tabi'in yang membantah anggapan bahwa kesalehan berarti menjauh dari dunia kerja, dialah Abdullah bin Al-Mubarak — ulama besar Khurasan, lahir di Marw tahun 118 hijriah, dari ayah keturunan Turk dan ibu dari Khawarizm.

Ia mengembara menuntut ilmu ke hampir seluruh negeri Islam: Haramain, Syam, Mesir, Irak, Yaman — berguru kepada tokoh-tokoh besar zamannya dan meriwayatkan puluhan ribu hadits. Karyanya, Kitab Az-Zuhd dan Kitab Al-Jihad, termasuk karya tertua di bidangnya yang sampai kepada kita. Para ulama memujinya dengan kalimat yang jarang diberikan: terkumpul padanya ilmu, fiqih, adab, keberanian, kedermawanan, dan wara' sekaligus. Sebagian menyebutnya "orang alimnya timur dan barat".

Yang unik: Ibnul Mubarak adalah saudagar sukses. Ia berdagang dengan sungguh-sungguh dan hartanya besar — tetapi arah hartanya yang membedakan. Setiap tahun ia membiayai rombongan haji, menanggung kebutuhan para ulama dan penuntut ilmu, dan melunasi utang orang-orang yang kesulitan, sering kali secara rahasia; penerimanya baru tahu setelah ia wafat. Katanya, ia berdagang justru untuk menjaga kehormatan ilmu — agar para ulama tidak perlu menengadahkan tangan ke penguasa.

Hidupnya berputar pada tiga poros: musim mengajar dan meriwayatkan hadits, musim berdagang, dan musim ribath — berjaga di perbatasan menghadapi Romawi. Dari medan itulah lahir suratnya yang masyhur kepada Al-Fudhail bin Iyadh, ahli ibadah Haramain, berisi bait yang menggetarkan: "Wahai ahli ibadah dua tanah suci, seandainya engkau melihat kami, niscaya engkau tahu bahwa engkau baru bermain-main dalam ibadah." Bukan merendahkan ibadah — tetapi mengingatkan bahwa iman punya medan-medan yang menuntut pengorbanan nyata.

Ia wafat tahun 181 hijriah di Hit, dalam perjalanan pulang dari berjaga di perbatasan.

Dari Ibnul Mubarak kita belajar bahwa dunia dan akhirat tidak harus bermusuhan: harta di tangan orang saleh menjadi sayap kebaikan, dan ilmu yang dipikul jiwa pemberani menjadi cahaya yang menjaga umat. Kuncinya satu — semua porosnya ikhlas karena Allah.`,
  },

  // ── Kisah Ulama Dunia ───────────────────────────────────────────────────
  {
    category: "kisah-ulama-dunia",
    slug: "kisah-ulama-syafii-audio",
    title: "Imam Asy-Syafi'i: Perjalanan Ilmu dari Gaza ke Mesir",
    body: `Muhammad bin Idris Asy-Syafi'i lahir di Gaza tahun 150 hijriah — tahun wafatnya Imam Abu Hanifah, seolah sejarah sedang melakukan serah terima. Ayahnya wafat saat ia kecil; ibunya yang miskin membawanya ke Makkah, tanah asal keluarganya yang bernasab sampai kepada kakek buyut Rasulullah shallallahu alaihi wa sallam.

Kemiskinannya tidak menghalangi kecemerlangannya. Ia menghafal Al-Qur'an pada usia belia, lalu menghafal kitab Al-Muwaththa' karya Imam Malik — dan pada usia yang sangat muda para guru di Makkah telah mengizinkannya berfatwa. Ia pergi ke Madinah untuk berguru langsung kepada Imam Malik, membaca Al-Muwaththa' di hadapannya dari hafalan hingga sang imam kagum. Setelah itu ia menimba fiqih ahli ra'yi dari murid-murid Abu Hanifah di Irak, terutama Muhammad bin Al-Hasan Asy-Syaibani.

Di sinilah keistimewaan Syafi'i: ia berdiri di pertemuan dua sungai besar — madrasah hadits Hijaz dan madrasah nalar Irak — lalu memadukannya. Dari perpaduan itu lahir karyanya Ar-Risalah, kitab pertama yang menyusun ushul fiqih: kaidah-kaidah baku tentang bagaimana hukum digali dari Al-Qur'an, sunnah, ijma', dan qiyas. Para ulama menyebutnya peletak dasar disiplin ilmu ini.

Tahun-tahun akhirnya ia habiskan di Mesir. Dengan kejujuran ilmiah yang mengagumkan, ia meninjau ulang fatwa-fatwa lamanya di sana — maka dikenal qaul qadim dan qaul jadid, pendapat lama dan baru. Ucapannya menjadi teladan adab berbeda pendapat sepanjang zaman: "Pendapatku benar, tapi mungkin salah; pendapat selainku salah, tapi mungkin benar." Juga wasiatnya: "Jika hadits itu sahih, maka itulah madzhabku."

Ia wafat di Mesir tahun 204 hijriah dalam usia 54 tahun, meninggalkan madzhab yang kini diikuti ratusan juta Muslim — termasuk mayoritas kaum Muslimin di Indonesia.

Dari Imam Syafi'i kita belajar bahwa kemiskinan bukan penghalang ilmu, bahwa menggabungkan dua pendekatan yang tampak bertentangan bisa melahirkan karya terbesar, dan bahwa puncak kealiman justru ditandai kerendahan hati untuk berkata: aku mungkin salah.`,
  },
  {
    category: "kisah-ulama-dunia",
    slug: "kisah-ulama-bukhari-audio",
    title: "Imam Al-Bukhari: Penjaga Sabda Nabi",
    body: `Di kota Bukhara — kini di Uzbekistan — lahir pada tahun 194 hijriah seorang anak bernama Muhammad bin Ismail. Ayahnya, seorang ulama, wafat saat ia kecil; masa kecilnya sempat diuji dengan kebutaan, dan menurut riwayat yang masyhur penglihatannya kembali setelah doa ibunya yang tak putus-putus. Anak itu kelak dikenal dunia dengan satu nama: Imam Al-Bukhari.

Bakatnya menakjubkan sejak dini: ia mulai menghafal hadits sebelum usia sepuluh tahun, dan pada usia enam belas telah hafal kitab-kitab ulama besar. Kekuatan hafalannya melegenda — dalam ujian yang masyhur di Baghdad, para ulama sengaja mengacak-acak sanad dan matan seratus hadits untuk mengujinya; ia mengembalikan semuanya ke susunan yang benar satu per satu tanpa cacat.

Ia mengembara puluhan tahun — Khurasan, Hijaz, Syam, Mesir, Irak — menemui lebih dari seribu guru dan mengumpulkan ratusan ribu riwayat. Dari lautan itu ia menyaring dengan syarat paling ketat yang pernah diterapkan: perawi harus adil, kuat hafalannya, dan benar-benar terbukti bertemu gurunya. Enam belas tahun ia menyusun Al-Jami' Ash-Shahih — dan menurut riwayat, ia tidak menuliskan satu hadits pun ke dalamnya kecuali setelah mandi dan shalat dua rakaat memohon petunjuk. Hasilnya: Shahih Al-Bukhari, kitab yang disepakati umat sebagai kitab paling sahih setelah Al-Qur'an.

Ketelitian ilmiahnya dibungkus ketakwaan pribadi. Ia sangat berhati-hati soal harta, dermawan kepada penuntut ilmu, dan menjauhi majelis penguasa. Justru karena menolak memberi pengajaran khusus di istana — ia berkata ilmu itu didatangi, bukan mendatangi — ia diusir dari kampung halamannya di akhir hayatnya. Ia wafat pada malam Idul Fitri tahun 256 hijriah di Khartank, dekat Samarkand.

Umat Islam berhutang kepadanya dengan cara yang sulit dilukiskan: jutaan Muslim setiap hari mengamalkan sunnah yang sampai kepada mereka melalui saringannya. Dari Al-Bukhari kita belajar bahwa kejujuran dan ketelitian adalah ibadah; bahwa satu karya yang digarap dengan takwa selama enam belas tahun bisa lebih berharga daripada seribu karya yang tergesa-gesa; dan bahwa doa seorang ibu mampu membuka jalan sejarah.`,
  },
  {
    category: "kisah-ulama-dunia",
    slug: "kisah-ulama-ghazali-audio",
    title: "Imam Al-Ghazali: Hujjatul Islam yang Mencari Hakikat",
    body: `Abu Hamid Muhammad Al-Ghazali lahir di Thus, Khurasan, tahun 450 hijriah, dari keluarga sederhana — ayahnya pemintal wol yang sebelum wafat menitipkan dua putranya kepada seorang sufi agar dididik. Dari titik yang bersahaja itu, anak ini menanjak hingga menjadi pemikir Muslim yang paling banyak dibicarakan sepanjang seribu tahun terakhir.

Kecemerlangannya membawanya belajar kepada Imam Al-Haramain Al-Juwaini di Naisabur, lalu menarik perhatian wazir agung Nizhamul Mulk. Pada usia tiga puluhan ia diangkat memimpin Madrasah Nizhamiyah Baghdad — universitas paling bergengsi di dunia Islam masa itu. Ratusan ulama menghadiri kuliahnya; namanya bersinar; para pembesar menghormatinya. Ia menguasai fiqih Syafi'i, ushul, ilmu kalam, dan membedah filsafat hingga menulis kritik yang menggemparkan terhadap para filsuf.

Lalu terjadi peristiwa yang membuat kisahnya abadi: di puncak kejayaan itu, ia mengalami krisis ruhani yang hebat. Ia bertanya pada dirinya sendiri — untuk siapa sebenarnya semua ilmu dan kemasyhuran ini? Ia mendapati hatinya tidak tenang, dan khawatir amalnya tercemar cinta kedudukan. Sampai-sampai lisannya kelu tak mampu mengajar. Maka ia meninggalkan Baghdad, jabatan, dan nama besarnya — mengembara bertahun-tahun dalam khumul (menyembunyikan diri) di Damaskus dan Baitul Maqdis, menyucikan hati dan menata ulang niat.

Dari pengembaraan itu lahir magnum opus-nya: Ihya' Ulumiddin — Menghidupkan Kembali Ilmu-Ilmu Agama — proyek raksasa yang menyatukan fiqih lahir dengan fiqih batin: shalat berikut kekhusyukannya, muamalah berikut kejujurannya, ilmu berikut keikhlasannya. Kitab-kitabnya yang lain, seperti Bidayatul Hidayah dan Minhajul Abidin, hingga kini dikaji di pesantren-pesantren Indonesia.

Akhir hayatnya ia kembali ke Thus, mendirikan majelis ilmu dan mendalami Shahih Al-Bukhari, hingga wafat tahun 505 hijriah.

Dari Al-Ghazali kita belajar pelajaran yang menusuk: prestasi tertinggi pun bisa kosong jika niatnya keruh — dan tidak ada kata terlambat untuk membongkar diri sendiri demi keikhlasan. Gelarnya Hujjatul Islam ia peroleh bukan hanya karena kecerdasannya, tetapi karena keberaniannya menundukkan kecerdasan itu di hadapan Allah.`,
  },
];

function esc(s) {
  return s.replace(/'/g, "''");
}

let sql = `-- AUTO-GENERATED by scripts/generate-audiobook-library-seed.mjs — edit the
-- script, not this file. Original ULYAH.COM articles that fill every
-- Audiobook category ("di isi kontennya"): fiqih pernikahan, fiqih warisan,
-- pondasi iman, hikmah harian, tafsir tematik, and the kisah tiers.
-- Idempotent: categories keyed on UNIQUE slug, stories on UNIQUE (slug, lang).

`;

for (const c of CATEGORIES) {
  sql += `INSERT OR IGNORE INTO categories (name, slug, parent_id, auto_created) VALUES ('${esc(c.name)}', '${c.slug}', NULL, 0);\n`;
}
sql += "\n";

for (const a of ARTICLES) {
  sql += `INSERT OR IGNORE INTO stories (title, slug, lang, category_id, body, ai_generated, qc_status, source_format, status, published_at)
VALUES ('${esc(a.title)}', '${a.slug}', 'id', (SELECT id FROM categories WHERE slug = '${a.category}'), '${esc(a.body)}', 0, 'published', 'html', 'published', datetime('now'));\n\n`;
}

const out = join(__dirname, "..", "packages", "db-schema", "seed", "audiobook_library.sql");
writeFileSync(out, sql, "utf8");

const words = ARTICLES.reduce((n, a) => n + a.body.split(/\s+/).length, 0);
console.log(`Wrote ${out}`);
console.log(`${ARTICLES.length} articles across ${new Set(ARTICLES.map((a) => a.category)).size} categories, ~${words} words total.`);
