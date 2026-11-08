/**
 * Panduan pemakaian A–Z dengan suara (pemilik, 8 Nov 2026: „Buatkan panduan penggunaan xscan dan ascan secara detail
 * dengan bahasa yg paling mudah d mengerti pengguna, gunakan voice juga … sampai ke pengisian saldo, konversi saldo,
 * penggunaan token, upload file dll … 2 bahasa Indonesia dan inggris termasuk voice nya“ dan „Termasuk panduan untuk
 * admin“).
 *
 * - Panduan member: halaman publik /panduan dan /en/guide (juga bacaan yang berguna bagi calon pengguna).
 * - Panduan admin: /admin/panduan, hanya untuk admin (berisi markup, biaya, dan kendali — rahasia perusahaan).
 * - Suara: pembaca suara bawaan peramban (Web Speech API), ID atau EN mengikuti bahasa halaman. Tanpa biaya server.
 * - Angka (kuota gratis, ukuran halaman, harga 1 token, komisi afiliasi) dibaca dari Admin saat halaman dibuka, jadi
 *   panduan selalu sama dengan aturan yang berlaku.
 */
import { html, type Raw } from '../lib/html.ts';
import { tr, fmtNum, type Lang } from '../lib/i18n.ts';

type Pair = readonly [string, string];
export interface GuideSection {
  id: string;
  icon: string;
  title: Pair;
  steps: Pair[];
  tip?: Pair;
}

export interface GuideValues {
  freeOn: boolean;
  freePages: number;
  freePeriod: 'week' | 'month';
  wordsPerPage: number;
  maxPerCheck: number;
  tokenIdr: number;
  affPct: number | null;
  purgeDays: number;
  /** Nama zona waktu reset kuota untuk dibacakan, mis. ["WIB (Jakarta)", "Western Indonesia Time (Jakarta)"]. */
  tz: Pair;
  /** Mesin aktif saat ini (Admin → Kendali biaya). */
  engines: { sonnet: boolean; opus: boolean; fable: boolean };
  /** Paket token saat ini: nama, token, diskon, harga Rupiah. */
  packages: { name: Pair; tokens: number; discountPct: number; idr: number }[];
}

export function memberGuide(v: GuideValues): GuideSection[] {
  const per: Pair = v.freePeriod === 'week' ? ['minggu', 'week'] : ['bulan', 'month'];
  const reset: Pair = v.freePeriod === 'week' ? ['setiap Senin pukul 00.00', 'every Monday at 00:00'] : ['setiap tanggal 1 pukul 00.00', 'on the 1st of every month at 00:00'];
  const rp = (n: number, L: 0 | 1) => (L ? `Rp ${n.toLocaleString('en-US')}` : `Rp ${n.toLocaleString('id-ID')}`);
  const sections: GuideSection[] = [
    {
      id: 'kenalan', icon: '👋', title: ['Kenalan dulu: apa yang bisa dilakukan situs ini', 'Start here: what this site does'],
      steps: [
        ['Situs ini memeriksa sebuah tulisan, lalu memberi tahu bagian mana yang kemungkinan ditulis AI, bagian mana yang campuran, dan bagian mana yang ditulis manusia.', 'This site checks a piece of writing and tells you which parts were probably written by AI, which parts are mixed, and which parts were written by a person.'],
        ['Selain itu, tulisan bisa dinilai dengan rubrik, misalnya rubrik lomba esai, lengkap dengan alasan dan bukti dari naskah.', 'It can also grade the writing with a rubric, for example an essay-contest rubric, with reasons and evidence quoted from the text.'],
        ['Hasilnya berupa laporan rapi yang bisa dicetak, diunduh, dan dicek keasliannya lewat kode atau QR.', 'You get a neat report that you can print, download, and verify with a code or a QR.'],
        ['Ingat: hasil ini adalah bukti pendukung, bukan vonis. Selalu beri penulis kesempatan menjelaskan.', 'Remember: the result is supporting evidence, not a verdict. Always give the writer a chance to explain.'],
      ],
    },
    {
      id: 'daftar', icon: '📝', title: ['Daftar dan masuk', 'Sign up and log in'],
      steps: [
        ['Tekan tombol Daftar di kanan atas.', 'Press Sign up at the top right.'],
        ['Isi nama, alamat e-mail, dan sandi minimal 8 karakter. Centang persetujuan, lalu tekan Daftar.', 'Enter your name, e-mail address and a password of at least 8 characters. Tick the agreement, then press Sign up.'],
        ['Setelah berhasil, Anda langsung masuk ke Dasbor.', 'Once done, you land straight in your Dashboard.'],
        ['Lain kali, tekan Masuk lalu isi e-mail dan sandi. Lupa sandi? Pakai tautan Lupa sandi di halaman Masuk.', 'Next time, press Log in and enter your e-mail and password. Forgot it? Use the Forgot password link on the log-in page.'],
      ],
      tip: ['Pakai e-mail tetap. Akun dengan e-mail sekali pakai tidak mendapat kuota gratis.', 'Use a permanent e-mail address. Accounts with a throwaway address get no free quota.'],
    },
    {
      id: 'dasbor', icon: '🧭', title: ['Mengenal Dasbor dan menu', 'Your Dashboard and the menu'],
      steps: [
        ['Dasbor menampilkan saldo token, perkiraan berapa halaman yang bisa diperiksa per mesin, dan laporan terbaru Anda.', 'The Dashboard shows your token balance, roughly how many pages you can check with each engine, and your latest reports.'],
        ['Menu di kiri: Periksa baru, Laporan, Sesi lomba atau kelas, Token dan deposit, Invoice, Afiliasi, dan Pengaturan.', 'The menu on the left: New check, Reports, Contest or class sessions, Tokens and deposit, Invoices, Affiliate, and Settings.'],
        ['Di ponsel, menu dibuka dengan tombol tiga garis di kiri atas.', 'On a phone, open the menu with the three-line button at the top left.'],
      ],
    },
    {
      id: 'pasang', icon: '📱', title: ['Pasang di HP seperti aplikasi', 'Install it on your phone like an app'],
      steps: [
        ['Buka situs ini di HP. Bila peramban menawarkannya, muncul spanduk Pasang di paling atas layar.', 'Open this site on your phone. When the browser offers it, an Install banner appears at the very top.'],
        ['Tekan Pasang. Ikon aplikasi masuk ke layar utama dan terbuka penuh tanpa bilah alamat.', 'Press Install. The app icon lands on your home screen and opens full screen, without the address bar.'],
        ['Di iPhone atau iPad, ketuk tombol Bagikan lalu pilih Tambahkan ke Layar Utama.', 'On an iPhone or iPad, tap the Share button and choose Add to Home Screen.'],
        ['Setelah terpasang, spanduk itu tidak muncul lagi. Anda juga bisa menutupnya; spanduk baru muncul lagi seminggu kemudian.', 'Once installed, the banner stops appearing. You can also close it; it comes back a week later.'],
        ['Data Anda tetap di server, bukan di HP: laporan dan saldo aman walau aplikasi dihapus.', 'Your data stays on the server, not on the phone: reports and balance are safe even if you remove the app.'],
      ],
    },
    {
      id: 'gratis', icon: '🎁', title: ['Cek Gratis', 'The Free Check'],
      steps: v.freeOn
        ? [
            [`Setiap akun mendapat ${v.freePages} halaman gratis per ${per[0]}. Kuota baru diberikan ${reset[0]}, ${v.tz[0]}.`, `Every account gets ${v.freePages} free pages per ${per[1]}. The quota renews ${reset[1]}, ${v.tz[1]}.`],
            [`Satu halaman dihitung dari isi teks, setara kertas Legal: paling banyak ${fmtNum('id', v.wordsPerPage)} kata. Jadi yang dihitung isinya, bukan jumlah halaman berkasnya.`, `A page is measured from the text itself, like a sheet of Legal paper: at most ${fmtNum('en', v.wordsPerPage)} words. So the content is counted, not the number of pages in your file.`],
            [`Satu pemeriksaan gratis paling banyak ${v.maxPerCheck} halaman.`, `One free check covers at most ${v.maxPerCheck} pages.`],
            ['Di formulir Periksa baru, pilih Cek Gratis. Perkiraan token menjadi nol karena yang dipakai adalah kuota halaman.', 'On the New check form, choose the Free Check. The token estimate shows zero because pages from your quota are used instead.'],
            ['Kalau naskah lebih panjang dari sisa kuota, Anda akan diberi tahu dan bisa memilih: periksa beberapa halaman pertama secara gratis, periksa semuanya dengan Cek Lengkap memakai token, isi saldo, atau tunggu kuota baru.', 'If the text is longer than the quota you have left, you are told so and can choose: check the first pages for free, check all of it with a Full Check using tokens, top up, or wait for the new quota.'],
            ['Cek Gratis memakai mesin hemat yang menilai per paragraf. Laporannya memuat tanda air logo situs dan iklan.', 'The Free Check uses the economy engine and judges per paragraph. Its report carries the site logo as a watermark and shows ads.'],
          ]
        : [['Cek Gratis sedang tidak tersedia. Silakan pakai Cek Lengkap dengan token.', 'The Free Check is not available right now. Please use the Full Check with tokens.']],
      tip: ['Naskah yang sama dengan pengaturan yang sama dalam 7 hari tidak memakai kuota lagi: laporan lama langsung ditampilkan.', 'The same text with the same settings within 7 days does not use your quota again: the earlier report is shown at once.'],
    },
    {
      id: 'token', icon: '🪙', title: ['Apa itu token', 'What tokens are'],
      steps: [
        [`Token adalah saldo untuk Cek Lengkap. Saat ini 1 token = ${rp(v.tokenIdr, 0)}.`, `Tokens are the balance for a Full Check. Right now 1 token = ${rp(v.tokenIdr, 1)}.`],
        ['Sebelum memeriksa, sistem memesan dulu sejumlah token sebagai batas atas. Setelah selesai, yang dipotong hanya pemakaian nyata dan sisanya otomatis kembali ke saldo.', 'Before a check starts, the system reserves some tokens as an upper limit. When it finishes, only the real usage is charged and the rest returns to your balance automatically.'],
        ['Kalau pemeriksaan gagal, seluruh token yang dipesan kembali utuh.', 'If a check fails, every reserved token comes back in full.'],
        ['Token tidak bisa diuangkan atau dipindahkan ke akun lain. Token hanya untuk memeriksa naskah di situs ini.', 'Tokens cannot be cashed out or moved to another account. They are only for checking texts on this site.'],
      ],
    },
    {
      id: 'beli', icon: '🛒', title: ['Membeli paket token dengan transfer Rupiah', 'Buying a token package by Rupiah transfer'],
      steps: [
        ['Buka menu Token dan deposit, lalu pilih paket yang Anda inginkan.', 'Open Tokens and deposit, then choose the package you want.'],
        [`Paket saat ini: ${v.packages.map((p) => `${p.name[0]} ${fmtNum('id', p.tokens)} token ${rp(p.idr, 0)}${p.discountPct ? ` (hemat ${p.discountPct}%)` : ''}`).join('; ')}.`, `Packages right now: ${v.packages.map((p) => `${p.name[1]} ${fmtNum('en', p.tokens)} tokens ${rp(p.idr, 1)}${p.discountPct ? ` (save ${p.discountPct}%)` : ''}`).join('; ')}.`],
        ['Invoice dibuat. Di invoice tertera nomor invoice, jumlah yang harus dibayar, dan rekening tujuan.', 'An invoice is created. It shows the invoice number, the amount to pay, and the bank account to pay into.'],
        ['Transfer dari m-banking, internet banking, atau ATM bank apa pun, persis sesuai jumlah di invoice.', 'Transfer from mobile banking, internet banking or any bank ATM, exactly the amount on the invoice.'],
        ['Simpan bukti transfer, bisa tangkapan layar atau PDF, lalu unggah di halaman invoice yang sama.', 'Keep the transfer receipt, a screenshot or a PDF, and upload it on the same invoice page.'],
        ['Admin mencocokkan bukti dengan mutasi rekening. Begitu disetujui, token langsung masuk ke saldo Anda dan invoice diberi cap LUNAS.', 'The admin matches the receipt with the bank statement. Once approved, the tokens are added to your balance and the invoice is stamped PAID.'],
        ['Kalau ditolak, alasannya tampil di invoice. Anda bisa mengunggah bukti yang benar. Pesanan yang belum dibayar juga bisa dibatalkan sendiri.', 'If it is rejected, the reason appears on the invoice and you can upload the right receipt. You can also cancel an order you have not paid.'],
      ],
      tip: ['Semua invoice Anda ada di menu Invoice, lengkap dengan statusnya.', 'All your invoices are under Invoices, with their status.'],
    },
    {
      id: 'luar-negeri', icon: '🌍', title: ['Membayar dari luar negeri (USD)', 'Paying from abroad (USD)'],
      steps: [
        ['Pilih mata uang USD saat memesan. Invoice akan menampilkan dua cara bayar.', 'Choose USD when you order. The invoice shows two ways to pay.'],
        ['Cara pertama: transfer bank internasional SWIFT ke rekening USD yang tertera. Pilih biaya transfer OUR agar dana tiba utuh.', 'First way: an international SWIFT transfer to the USD account shown. Choose the OUR charge option so the full amount arrives.'],
        ['Cara kedua: layanan kiriman uang ke rekening Rupiah yang tertera.', 'Second way: a money-transfer service to the Rupiah account shown.'],
        ['Unggah bukti transfer atau dokumen MT103 di halaman invoice. Token masuk setelah dana yang tiba sesuai tagihan.', 'Upload the receipt or the MT103 document on the invoice page. Tokens are added once the funds that arrive match the invoice.'],
      ],
    },
    {
      id: 'deposit', icon: '🏦', title: ['Isi saldo deposit dan konversi ke token', 'Topping up a deposit and converting it into tokens'],
      steps: [
        ['Deposit adalah saldo Rupiah yang Anda isi sekali dan dipakai berkali-kali.', 'A deposit is a Rupiah balance you top up once and use many times.'],
        ['Di menu Token dan deposit, isi nominal deposit. Invoice dibuat. Transfer, lalu unggah buktinya seperti membeli paket.', 'Under Tokens and deposit, enter the deposit amount. An invoice is created. Transfer, then upload the receipt just like buying a package.'],
        ['Setelah disetujui admin, saldo deposit Anda bertambah.', 'Once the admin approves it, your deposit balance goes up.'],
        ['Cara pertama memakai deposit: beli paket token dari saldo deposit. Token langsung masuk tanpa transfer lagi.', 'First way to use it: buy a token package from the deposit. The tokens arrive at once, with no new transfer.'],
        [`Cara kedua: tukar sebagian atau seluruh saldo deposit menjadi token. Ketik nominalnya, lihat pratinjau jumlah token, lalu tekan Tukar. Saat ini 1 token = ${rp(v.tokenIdr, 0)}.`, `Second way: convert part or all of the deposit into tokens. Type the amount, check the preview of how many tokens you get, then press Convert. Right now 1 token = ${rp(v.tokenIdr, 1)}.`],
        ['Riwayat deposit, yaitu isi saldo, beli paket, dan tukar, bisa dibuka di bagian bawah halaman yang sama.', 'The deposit history, top-ups, packages and conversions, is at the bottom of the same page.'],
      ],
      tip: ['Saldo deposit tidak bisa diuangkan, tetapi selalu bisa dipakai untuk membeli atau ditukar menjadi token.', 'A deposit cannot be cashed out, but it can always be used to buy tokens or be converted into them.'],
    },
    {
      id: 'masukkan', icon: '📄', title: ['Memasukkan naskah: tempel, unggah berkas, atau ambil dari URL', 'Adding a text: paste, upload a file, or fetch from a URL'],
      steps: [
        ['Buka Periksa baru. Ada tiga cara memasukkan naskah.', 'Open New check. There are three ways to add your text.'],
        ['Cara pertama: tempel teks langsung ke kotak teks.', 'First way: paste the text straight into the text box.'],
        ['Cara kedua: unggah berkas Word .docx, PDF, RTF, HTML, atau teks biasa .txt, paling besar 20 MB. Teks dibaca langsung di peramban Anda dan berkasnya tidak dikirim ke server.', 'Second way: upload a Word .docx, a PDF, an RTF, an HTML page, or a plain .txt file, up to 20 MB. The text is read inside your browser and the file itself is never sent to our server.'],
        ['PDF hasil pindaian atau gambar tidak berisi teks, jadi tidak bisa dibaca. PDF yang dikunci sandi harus dibuka kuncinya dulu.', 'A scanned PDF or an image holds no text, so it cannot be read. A password-protected PDF must be unlocked first.'],
        ['Cara ketiga: tempel alamat artikel di kolom Ambil dari URL artikel, lalu tekan Ambil. Hanya halaman publik yang bisa diambil, dan aturan robots situs tersebut dihormati. Mengambil teks tidak memotong token.', 'Third way: paste an article address into Fetch from an article URL and press Fetch. Only public pages can be fetched, and that site’s robots rules are respected. Fetching the text costs no tokens.'],
      ],
      tip: ['Hasil paling akurat bila naskah utuh, minimal sekitar 300 kata. Di bawah 150 kata tidak diberi label.', 'Results are most accurate with the whole text, about 300 words or more. Below 150 words no label is given.'],
    },
    {
      id: 'keterangan', icon: '🏷', title: ['Mengisi keterangan dan memilih rubrik', 'Filling in the details and choosing a rubric'],
      steps: [
        ['Isi judul dan nama penulis. Keduanya muncul di laporan.', 'Enter the title and the writer’s name. Both appear on the report.'],
        ['Pilih jenis tulisan dan jenjang penulis, misalnya SMP atau mahasiswa. Tulisan pelajar yang sederhana tidak akan dianggap AI hanya karena sederhana.', 'Choose the kind of text and the writer’s level, for example junior high or university. Simple student writing is not marked as AI just because it is simple.'],
        ['Pilih bahasa laporan: Indonesia atau English.', 'Choose the report language: Indonesian or English.'],
        ['Pilih keperluan laporan: Umum, Pendidikan, Lomba, Media dan redaksi, atau Organisasi. Judul laporan, sebutan penulis, dan kolom tanda tangan menyesuaikan, misalnya laporan lomba memakai kolom Juri dan Ketua panitia.', 'Choose what the report is for: General, Education, Contest, Media and newsroom, or Organisation. The report title, how the writer is named and the signature boxes follow it; a contest report, for instance, has boxes for the Judge and the head of the organising committee.'],
        ['Kalau perlu penilaian, pilih rubrik, misalnya lomba esai. Tanpa rubrik, yang diperiksa hanya asal tulisan: AI atau manusia.', 'If you need grading, choose a rubric, such as an essay contest. With no rubric, only the origin of the writing is checked: AI or human.'],
        ['Daftar pustaka dan kutipan panjang otomatis dikecualikan dari persentase.', 'Reference lists and long quotations are left out of the percentages automatically.'],
      ],
    },
    {
      id: 'mesin', icon: '⚙', title: ['Memilih mesin dan melihat perkiraan biaya', 'Choosing an engine and checking the cost estimate'],
      steps: [
        ['AUTO adalah pilihan yang disarankan: mesin hemat memeriksa dulu, lalu mesin yang lebih kuat hanya memeriksa ulang kalimat yang meragukan.', 'AUTO is the recommended choice: the economy engine checks first, and stronger engines re-check only the doubtful sentences.'],
        ['Anda juga bisa memilih satu mesin saja: Haiku yang paling hemat, Sonnet yang lebih teliti, atau Opus yang paling mendalam.', 'You can also pick a single engine: Haiku, the most economical; Sonnet, more thorough; or Opus, the deepest.'],
        v.engines.fable
          ? ['Ada pula Claude Fable 5.1, pilihan premium untuk naskah yang benar-benar menentukan. Biayanya jauh di atas mesin lain sehingga saldo token berkurang jauh lebih cepat. Sebelum dipakai, Anda diminta memastikan pilihan itu lewat jendela Anda yakin.', 'There is also Claude Fable 5.1, the premium choice for texts that truly matter. It costs far more than the other engines, so your token balance goes down much faster. Before it is used, you are asked to confirm the choice in an Are you sure window.']
          : ['Claude Fable 5.1, pilihan premium, segera hadir. Kartunya sudah tampil di formulir dengan tanda Segera hadir dan belum bisa dipilih.', 'Claude Fable 5.1, the premium choice, is coming soon. Its card already shows on the form marked Coming soon and cannot be chosen yet.'],
        ...((!v.engines.sonnet || !v.engines.opus) ? [['Mesin yang sedang dinonaktifkan admin tampil dengan tanda Sedang nonaktif dan tidak bisa dipilih. AUTO tetap berjalan dengan mesin yang aktif.', 'An engine the admin has switched off shows as Switched off and cannot be chosen. AUTO keeps working with the active engines.'] as Pair] : []),
        ['Kotak perkiraan menunjukkan jumlah kata, perkiraan pemakaian token, token yang dipesan, dan saldo Anda.', 'The estimate box shows the word count, the expected token use, the tokens to be reserved, and your balance.'],
        ['Kalau saldo kurang, kotak itu menyebut berapa kekurangannya dan memberi tautan untuk isi saldo.', 'If your balance is too low, the box shows how much is missing and gives you a link to top up.'],
      ],
    },
    {
      id: 'proses', icon: '⏳', title: ['Mengirim dan menunggu proses', 'Sending the text and waiting'],
      steps: [
        ['Centang pernyataan bahwa Anda berhak memeriksa naskah ini, lalu tekan tombol Periksa.', 'Tick the statement that you are entitled to check this text, then press Check.'],
        ['Layar proses menampilkan setiap tahap pemeriksaan. Biasanya selesai dalam satu sampai beberapa menit.', 'The progress screen shows every stage. It usually takes one to a few minutes.'],
        ['Tab boleh ditutup. Pemeriksaan tetap berjalan di server dan hasilnya ada di menu Laporan.', 'You may close the tab. The check keeps running on the server and the result appears under Reports.'],
        ['Kalau terjadi gangguan, sistem mencoba lagi. Kalau tetap gagal, token atau kuota yang dipesan kembali utuh.', 'If something goes wrong, the system retries. If it still fails, the reserved tokens or quota come back in full.'],
      ],
    },
    {
      id: 'laporan', icon: '📊', title: ['Membaca laporan', 'Reading the report'],
      steps: [
        ['Tiga cincin menunjukkan porsi AI, campuran, dan manusia. Jumlahnya selalu 100 persen.', 'Three rings show the share of AI, mixed and human writing. Together they always make 100 percent.'],
        ['Label AI atau Manusia hanya diberikan bila sistem cukup yakin. Selain itu tertulis Tidak meyakinkan, yang artinya perlu ditinjau manusia.', 'An AI or Human label is only given when the system is confident enough. Otherwise it says Inconclusive, meaning a person should review it.'],
        ['Tabel per paragraf menunjukkan paragraf mana yang paling bernada AI beserta alasan utamanya.', 'The paragraph table shows which paragraphs read most like AI, with the main reason.'],
        ['Di lampiran, setiap kalimat diberi warna. Arahkan kursor atau ketuk kalimat untuk melihat peluang AI dan alasannya.', 'In the appendix every sentence is coloured. Hover over or tap a sentence to see its AI probability and the reasons.'],
        ['Kalau memakai rubrik, ada tabel nilai per aspek, alasan, kutipan bukti dari naskah, saran, dan daftar kesalahan bahasa.', 'With a rubric, you also get a score per aspect, the reasons, quoted evidence from the text, tips, and a list of language errors.'],
        ['Rincian token menunjukkan berapa token masuk dan keluar di setiap panggilan mesin.', 'The token breakdown shows the tokens in and out for every engine call.'],
      ],
    },
    {
      id: 'unduh', icon: '⬇', title: ['Mengunduh, mencetak, dan memverifikasi laporan', 'Downloading, printing and verifying a report'],
      steps: [
        ['Unduh HTML: satu berkas mandiri yang bisa dibuka tanpa internet.', 'Download HTML: one self-contained file that opens without the internet.'],
        ['Unduh data JSON: data lengkap dengan segel digital. Kalau isinya diubah sedikit saja, segelnya tidak cocok lagi.', 'Download JSON data: the complete data with a digital seal. Change anything at all and the seal no longer matches.'],
        ['Halaman cetak: tekan Cetak atau simpan PDF untuk laporan A4 yang rapi.', 'Print page: press Print or save as PDF for a neat A4 report.'],
        ['Setiap laporan punya kode verifikasi dan QR. Siapa pun bisa memindai QR atau membuka halaman Verifikasi untuk memastikan laporan itu asli.', 'Every report has a verification code and a QR. Anyone can scan the QR or open the Verify page to confirm the report is genuine.'],
      ],
      tip: ['Laporan dan naskah dihapus otomatis sesuai masa simpan. Unduh atau cetak laporan yang ingin Anda simpan.', 'Reports and texts are deleted automatically after the retention period. Download or print the reports you want to keep.'],
    },
    {
      id: 'tinjauan', icon: '⚖', title: ['Merasa hasilnya keliru? Ajukan tinjauan', 'Think the result is wrong? Request a review'],
      steps: [
        ['Buka laporannya, lalu tekan Ajukan tinjauan.', 'Open the report and press Request review.'],
        ['Tiga mesin, yaitu Haiku, Sonnet, dan Opus, menilai ulang seluruh teks tanpa melihat hasil sebelumnya.', 'Three engines, Haiku, Sonnet and Opus, re-assess the whole text without seeing the earlier result.'],
        ['Tinjauan ditagih token seperti pemeriksaan biasa dan hanya bisa diajukan sekali untuk setiap laporan.', 'A review is charged in tokens like a normal check and can be requested once per report.'],
      ],
    },
    {
      id: 'sesi', icon: '🏆', title: ['Sesi lomba atau kelas: memeriksa banyak naskah sekaligus', 'Contest or class sessions: many texts at once'],
      steps: [
        ['Buka Sesi lomba atau kelas, beri nama sesi, lalu tekan Buat.', 'Open Contest or class sessions, name the session, then press Create.'],
        ['Pilih atau seret banyak berkas sekaligus. Beri nama berkas seperti 01_Nadia Putri_Literasi Digital agar nomor, nama, dan judul terisi otomatis.', 'Choose or drag many files at once. Name them like 01_Nadia Putri_Digital Literacy so the number, name and title fill in by themselves.'],
        ['Untuk memeriksa artikel sebuah situs, tempel alamat sitemap-nya di kolom Impor dari sitemap. Paling banyak 50 artikel sekali impor.', 'To check the articles of a website, paste its sitemap address into Import from a sitemap. Up to 50 articles per import.'],
        ['Periksa daftar antrean, perbaiki nama atau judul bila perlu, pilih mesin, centang pernyataan, lalu tekan Jalankan.', 'Review the queue, fix names or titles if needed, choose an engine, tick the statement, then press Run.'],
        ['Rekap sesi menampilkan semua hasil, peringkat nilai, dan kemiripan antar-naskah. Rekap bisa dicetak atau diunduh sebagai CSV.', 'The session recap shows every result, the score ranking and the similarity between texts. It can be printed or downloaded as CSV.'],
      ],
    },
    {
      id: 'riwayat', icon: '🗂', title: ['Riwayat kerja dan catatan', 'Work history and notes'],
      steps: [
        ['Menu Laporan berisi semua hasil Anda. Gunakan kotak cari untuk menemukan judul atau penulis.', 'Reports holds all your results. Use the search box to find a title or a writer.'],
        ['Riwayat bisa diekspor ke CSV untuk dibuka di Excel atau Google Sheets.', 'The history can be exported to CSV and opened in Excel or Google Sheets.'],
        ['Di setiap laporan ada kotak Catatan kerja, misalnya sudah dikonfirmasi ke penulis.', 'Every report has a Work note box, for example confirmed with the writer.'],
        [`Hasil kerja dan berkas dihapus otomatis ${v.purgeDays} hari setelah dibuat. Invoice dan catatan saldo tetap disimpan.`, `Work results and files are deleted automatically ${v.purgeDays} days after they were made. Invoices and balance records are kept.`],
      ],
    },
  ];
  if (v.affPct !== null) {
    sections.push({
      id: 'afiliasi', icon: '🤝', title: ['Afiliasi: ajak teman, dapat komisi', 'Affiliate: invite friends, earn a commission'],
      steps: [
        ['Buka menu Afiliasi dan salin tautan referal Anda.', 'Open Affiliate and copy your referral link.'],
        ['Bagikan tautan itu. Orang yang mendaftar lewat tautan Anda tercatat sebagai referal Anda.', 'Share it. People who sign up through your link are recorded as your referrals.'],
        [`Setiap kali referal membeli token dan pembayarannya lunas, Anda mendapat komisi ${v.affPct} persen dari harganya.`, `Every time a referral buys tokens and the payment is confirmed, you earn ${v.affPct} percent of the price.`],
        ['Komisi bisa ditukar menjadi token atau dicairkan sesuai ketentuan program afiliasi.', 'The commission can be turned into tokens or paid out under the affiliate programme rules.'],
      ],
    });
  }
  sections.push(
    {
      id: 'pengaturan', icon: '🔧', title: ['Pengaturan akun dan keamanan', 'Account settings and security'],
      steps: [
        ['Di Pengaturan, Anda bisa mengubah nama dan bahasa portal. Bahasa yang Anda pilih tetap dipakai di semua halaman sampai Anda mengubahnya sendiri.', 'In Settings you can change your name and the portal language. The language you choose stays on every page until you change it yourself.'],
        ['Masa simpan teks bisa dipersingkat, termasuk dihapus segera setelah laporan jadi.', 'You can shorten how long texts are kept, even deleting them as soon as the report is ready.'],
        ['Ganti sandi kapan saja. Mengganti sandi mengeluarkan akun Anda dari semua perangkat lain.', 'Change your password any time. Changing it logs your account out of every other device.'],
        ['Aktifkan verifikasi dua langkah agar akun lebih aman: setelah sandi, Anda memasukkan kode dari aplikasi autentikator.', 'Turn on two-step verification for extra safety: after your password, you enter a code from an authenticator app.'],
      ],
    },
    {
      id: 'privasi', icon: '🔒', title: ['Privasi dan keamanan data', 'Privacy and data safety'],
      steps: [
        ['Naskah disimpan terenkripsi dan dihapus otomatis sesuai masa simpan.', 'Texts are stored encrypted and deleted automatically after the retention period.'],
        ['Berkas yang Anda unggah dibaca di peramban Anda sendiri. Yang dikirim hanya teksnya.', 'Files you upload are read in your own browser. Only the text is sent.'],
        ['Data Anda tidak dijual dan tidak dipakai untuk melatih AI.', 'Your data is not sold and not used to train AI.'],
      ],
    },
    {
      id: 'masalah', icon: '🛟', title: ['Kalau ada masalah', 'When something goes wrong'],
      steps: [
        ['Token belum masuk setelah transfer? Buka Invoice dan pastikan bukti transfer sudah terunggah. Statusnya akan berubah setelah admin memeriksa.', 'Tokens not in yet after paying? Open Invoices and make sure the receipt is uploaded. The status changes once the admin has checked it.'],
        ['Muncul pesan saldo kurang? Isi saldo, tukar deposit, pilih mesin yang lebih hemat, atau pakai Cek Gratis.', 'A low-balance message? Top up, convert your deposit, choose a cheaper engine, or use the Free Check.'],
        ['PDF tidak terbaca? Kemungkinan PDF itu hasil pindaian. Tempel teksnya atau unggah versi Word.', 'A PDF cannot be read? It is probably a scan. Paste the text or upload a Word version.'],
        ['URL ditolak? Hanya halaman publik yang boleh diambil. Halaman yang perlu login atau dilarang robots situsnya tidak bisa diambil.', 'A URL is refused? Only public pages can be fetched. Pages behind a login or blocked by the site’s robots rules cannot be fetched.'],
        ['Muncul pesan layanan dihentikan sementara? Admin sedang melakukan perawatan. Saldo Anda aman. Coba lagi nanti.', 'A message that the service is paused? The admin is doing maintenance. Your balance is safe. Try again later.'],
        ['Masih bingung? Hubungi kami lewat e-mail atau WhatsApp di bagian bawah halaman.', 'Still stuck? Contact us by e-mail or WhatsApp at the bottom of the page.'],
      ],
    },
  );
  return sections;
}

export function adminGuide(): GuideSection[] {
  return [
    {
      id: 'a-prinsip', icon: '🧭', title: ['Prinsip kerja portal admin', 'How the admin portal works'],
      steps: [
        ['Hampir semuanya berjalan sendiri: pemeriksaan, pemotongan dan pengembalian token, komisi afiliasi, pembersihan data, dan cadangan harian.', 'Almost everything runs by itself: checks, charging and refunding tokens, affiliate commissions, data clean-up and daily backups.'],
        ['Tugas admin: memasang kunci API, menyetujui bukti transfer, mengatur harga dan kuota, serta memantau biaya.', 'The admin’s jobs: install the API key, approve transfer receipts, set prices and quotas, and watch costs.'],
        ['Setiap perubahan pengaturan tercatat di Audit, lengkap dengan nilai sebelum dan sesudahnya.', 'Every settings change is recorded under Audit, with the value before and after.'],
        ['Jangan pernah membagikan isi portal admin, kunci API, atau angka markup kepada siapa pun. Itu rahasia perusahaan.', 'Never share the admin portal contents, the API key or the markup figures with anyone. They are company secrets.'],
      ],
    },
    {
      id: 'a-notif', icon: '🔔', title: ['Notifikasi di menu admin', 'Notifications in the admin menu'],
      steps: [
        ['Angka merah di samping menu menunjukkan hal yang perlu perhatian. Diperbarui sendiri setiap menit.', 'A red number next to a menu shows what needs attention. It refreshes by itself every minute.'],
        ['Pesanan dan bukti TF: jumlah bukti transfer yang menunggu dicek. Angkanya baru hilang setelah pesanan disetujui atau ditolak.', 'Orders and receipts: the number of transfer receipts waiting to be checked. It only clears once an order is approved or rejected.'],
        ['Anggota, Laporan, dan Afiliasi: jumlah yang baru sejak menu itu terakhir Anda buka. Membuka menu itu mengembalikan angkanya ke nol.', 'Members, Reports and Affiliate: how many are new since you last opened that menu. Opening the menu sets it back to zero.'],
        ['Tekan Aktifkan notifikasi di bawah menu agar perangkat juga menampilkan pemberitahuan selama portal terbuka.', 'Press Turn on notifications under the menu so your device also shows a notice while the portal is open.'],
      ],
    },
    {
      id: 'a-kunci', icon: '🔑', title: ['Kunci API Claude', 'The Claude API key'],
      steps: [
        ['Buka Kunci API Claude, tempel kuncinya, lalu simpan. Sistem langsung menguji kunci itu.', 'Open Claude API key, paste the key and save. The system tests it straight away.'],
        ['Kunci disimpan terenkripsi dan tidak pernah ditampilkan lagi. Untuk mengganti, cukup simpan kunci baru.', 'The key is stored encrypted and never shown again. To change it, simply save a new key.'],
      ],
    },
    {
      id: 'a-mesin', icon: '⚙', title: ['Mesin dan ambang', 'Engine and thresholds'],
      steps: [
        ['Nilai bawaan sudah bekerja. Ubah hanya bila hasil benchmark menyarankan.', 'The defaults already work. Change them only when the benchmark results suggest it.'],
        ['Di sini diatur model per tingkat, tingkat ketelitian, ambang label AI dan manusia, harga model, kurs, masa simpan teks, dan batas biaya harian.', 'Here you set the model per tier, the effort, the AI and human label thresholds, model prices, the exchange rate, text retention and the daily cost cap.'],
        ['Tombol Uji mesin menjalankan satu pemeriksaan contoh tanpa memotong token, untuk memastikan semuanya bekerja.', 'The Test engine button runs one sample check without charging tokens, to confirm everything works.'],
      ],
    },
    {
      id: 'a-kendali', icon: '🛡', title: ['Kendali biaya: router, tombol darurat, batas belanja', 'Cost controls: router, emergency stop, spending limits'],
      steps: [
        ['Router otomatis memilih mesin termurah yang mampu di setiap tingkat, menurut harga yang tersimpan. Mode manual memakai pilihan di Mesin dan ambang.', 'The automatic router picks the cheapest capable engine for each tier, by the stored prices. Manual mode uses the choice under Engine and thresholds.'],
        ['Model bisa dimatikan. Model yang mati tidak pernah dipanggil; tingkatnya pindah ke model termurah yang masih mampu. Tabel di bawah formulir menunjukkan mesin yang dipakai sekarang dan alasannya.', 'Models can be switched off. A switched-off model is never called; its tier moves to the cheapest model that can still do the job. The table below the form shows the engines in use now and why.'],
        ['Fable 5.1 punya dua izin terpisah. Pertama, member boleh memilihnya sendiri, nyala bawaan, selalu lewat jendela konfirmasi. Kedua, router boleh memakainya sebagai pengganti bila Sonnet atau Opus dimatikan, mati bawaan karena biayanya tertinggi.', 'Fable 5.1 has two separate permissions. First, members may choose it themselves, on by default and always through a confirmation window. Second, the router may use it as a stand-in when Sonnet or Opus are off, off by default because it costs the most.'],
        ['Tombol darurat menghentikan semua panggilan AI seketika. Pemeriksaan baru ditolak dengan pesan Anda, dan yang sedang berjalan berhenti dengan seluruh token dan kuota dikembalikan.', 'The emergency stop halts every AI call at once. New checks are refused with your message, and running ones stop with all their tokens and quota returned.'],
        ['Batas belanja: maksimal token per pemeriksaan dan per member per hari. Isi nol berarti tanpa batas.', 'Spending limits: the most tokens per check and per member per day. Zero means no limit.'],
      ],
    },
    {
      id: 'a-harga', icon: '％', title: ['Harga dan token', 'Pricing and tokens'],
      steps: [
        ['Harga jual sama dengan modal dikali markup. Markup boleh 5 sampai 500 kali.', 'The selling price is cost times markup. The markup may be 5 to 500 times.'],
        ['Simpan markup baru, maka semua harga di situs dan portal ikut berubah otomatis.', 'Save a new markup and every price on the site and portal follows automatically.'],
        ['Paket token dan diskonnya diatur di halaman yang sama. Penjaga tidak-rugi memastikan token yang dipesan selalu menutup biaya terburuk.', 'Token packages and their discounts are set on the same page. A no-loss guard makes sure reserved tokens always cover the worst-case cost.'],
      ],
    },
    {
      id: 'a-gratis', icon: '🎁', title: ['Kuota gratis member', 'Members’ free quota'],
      steps: [
        ['Atur nyala atau mati, jumlah halaman gratis, periode per minggu atau per bulan, ukuran satu halaman, maksimal halaman per pemeriksaan, anggaran gratis harian, dan zona waktu reset.', 'Set it on or off, the number of free pages, a weekly or monthly period, the size of one page, the most pages per check, the daily free budget and the reset time zone.'],
        ['Satu kali simpan, semua bagian ikut berubah: formulir member, pemberitahuan, laporan, panduan ini, dan prediksi biaya.', 'Save once and everything follows: the member form, the notices, the reports, this guide and the cost forecast.'],
        ['Kartu prediksi menunjukkan perkiraan biaya kuota gratis per minggu dan per bulan untuk jumlah member yang Anda masukkan.', 'The forecast card shows the expected weekly and monthly cost of the free quota for the number of members you enter.'],
      ],
    },
    {
      id: 'a-pesanan', icon: '🧾', title: ['Pesanan dan bukti transfer', 'Orders and transfer receipts'],
      steps: [
        ['Buka Pesanan dan bukti TF. Tab Perlu diperiksa berisi pesanan yang sudah mengunggah bukti.', 'Open Orders and receipts. The To review tab lists orders with an uploaded receipt.'],
        ['Buka bukti transfer, lalu cocokkan dengan mutasi rekening: nominal, tanggal, dan nama pengirim.', 'Open the receipt and match it with the bank statement: amount, date and sender.'],
        ['Tekan Setujui bila cocok. Token atau saldo deposit masuk ke member, dan komisi afiliasi tercatat, tepat satu kali walau tombol ditekan berulang.', 'Press Approve when it matches. The tokens or deposit go to the member and the affiliate commission is recorded, exactly once even if the button is pressed again.'],
        ['Tekan Tolak dan tulis alasannya bila tidak cocok. Member melihat alasan itu di invoice dan bisa mengunggah ulang.', 'Press Reject and write the reason when it does not match. The member sees the reason on the invoice and can upload again.'],
      ],
    },
    {
      id: 'a-rekening', icon: '🏦', title: ['Rekening dan cara bayar', 'Accounts and payment details'],
      steps: [
        ['Isi rekening Rupiah, rekening USD, dan data SWIFT di sini.', 'Enter the Rupiah account, the USD account and the SWIFT details here.'],
        ['Data rekening hanya ditampilkan kepada pembeli yang sudah masuk, di invoice-nya. Tidak pernah tampil di halaman publik.', 'Account details are only shown to signed-in buyers, on their own invoice. Never on a public page.'],
      ],
    },
    {
      id: 'a-anggota', icon: '👥', title: ['Anggota', 'Members'],
      steps: [
        ['Cari member berdasarkan nama atau e-mail, lalu buka profilnya.', 'Search members by name or e-mail and open their profile.'],
        ['Dari sini admin bisa menyesuaikan saldo token atau deposit dengan catatan alasan, dan melihat riwayatnya.', 'From here the admin can adjust a token or deposit balance with a reason, and see the history.'],
        ['Setiap tindakan pada member tercatat di Audit.', 'Every action on a member is recorded under Audit.'],
      ],
    },
    {
      id: 'a-afiliasi', icon: '🤝', title: ['Afiliasi', 'Affiliate'],
      steps: [
        ['Atur persentase komisi dan nyalakan atau sembunyikan program afiliasi.', 'Set the commission percentage and show or hide the affiliate programme.'],
        ['Komisi dihitung otomatis saat pesanan disetujui, tepat satu kali per pesanan. Permintaan pencairan diproses di halaman ini.', 'Commission is calculated automatically when an order is approved, exactly once per order. Payout requests are handled on this page.'],
      ],
    },
    {
      id: 'a-pantau', icon: '📈', title: ['Laporan, biaya API, dan benchmark', 'Reports, API cost and the benchmark'],
      steps: [
        ['Laporan: daftar metadata semua laporan. Isi naskah hanya dibuka bila benar-benar perlu, dan pembukaannya tercatat di Audit.', 'Reports: the metadata of every report. A text is only opened when truly needed, and that is recorded under Audit.'],
        ['Biaya API: biaya nyata dari setiap panggilan mesin, per hari, beserta prediksi biaya kuota gratis.', 'API cost: the real cost of every engine call, per day, with the free-quota forecast.'],
        ['Benchmark akurasi: jalankan pemeriksaan pada teks yang labelnya sudah diketahui untuk mengukur ketepatan secara jujur, lalu terbitkan hasilnya ke halaman Akurasi.', 'Accuracy benchmark: run checks on texts with known labels to measure accuracy honestly, then publish the result on the Accuracy page.'],
      ],
    },
    {
      id: 'a-audit', icon: '⌁', title: ['Audit dan cadangan', 'Audit and backups'],
      steps: [
        ['Audit mencatat siapa mengubah apa dan kapan, termasuk tombol darurat dinyalakan atau dimatikan.', 'Audit records who changed what and when, including when the emergency stop was turned on or off.'],
        ['Cadangan dibuat otomatis setiap hari ke tempat penyimpanan terpisah dan disimpan 35 hari. Cadangan manual juga bisa dijalankan dari halaman ini.', 'A backup is made automatically every day to separate storage and kept for 35 days. A manual backup can also be run from this page.'],
      ],
    },
  ];
}

/* ── tampilan + pemutar suara ──────────────────────────────────────────── */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function guideBody(L: Lang, sections: GuideSection[], intro: string): Raw {
  const i = L === 'en' ? 1 : 0;
  return html`<div class="guide-wrap" data-voice-guide data-lang="${L}">
  <section class="guide-hero reveal">
    <p class="lead">${intro}</p>
    <div class="guide-bar" data-gbar role="group" aria-label="${tr(L, 'Pemutar suara panduan', 'Guide voice player')}">
      <button class="btn btn-primary" type="button" data-gall>🔊 ${tr(L, 'Dengarkan semua', 'Listen to all')}</button>
      <button class="btn btn-ghost" type="button" data-gpause disabled>⏸ ${tr(L, 'Jeda', 'Pause')}</button>
      <button class="btn btn-ghost" type="button" data-gstop disabled>⏹ ${tr(L, 'Berhenti', 'Stop')}</button>
      <label class="guide-rate"><span>${tr(L, 'Kecepatan', 'Speed')}</span><select data-grate><option value="0.85">0,85×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option><option value="1.3">1,3×</option></select></label>
      <span class="guide-now muted" data-gnow aria-live="polite"></span>
    </div>
    <p class="muted small" data-gnovoice hidden>${tr(L, 'Peramban ini tidak punya pembaca suara. Coba Chrome, Edge, atau Safari terbaru.', 'This browser has no speech voice. Try a recent Chrome, Edge or Safari.')}</p>
    <p class="muted small" data-gnolang hidden>${tr(L, 'Suara Bahasa Indonesia belum terpasang di perangkat ini, jadi dibacakan dengan suara bawaan. Pasang suara Indonesia di pengaturan bahasa perangkat agar pelafalannya pas.', 'No English voice is installed on this device, so the default voice is used. Install an English voice in your device language settings for the best pronunciation.')}</p>
  </section>
  <nav class="guide-toc reveal" aria-label="${tr(L, 'Daftar isi panduan', 'Guide contents')}">
    ${sections.map((s, n) => html`<a href="#g-${s.id}"><b>${LETTERS[n] ?? String(n + 1)}</b>${s.title[i]}</a>`)}
  </nav>
  ${sections.map((s, n) => html`<article class="guide-sec reveal" id="g-${s.id}" data-gsec>
    <header class="guide-sec-head"><span class="guide-letter" aria-hidden="true">${LETTERS[n] ?? String(n + 1)}</span><h2 data-gtitle><span aria-hidden="true">${s.icon}</span> ${s.title[i]}</h2><button class="btn btn-ghost btn-sm" type="button" data-gplay>🔊 ${tr(L, 'Dengarkan', 'Listen')}</button></header>
    <ol class="guide-steps">${s.steps.map((st) => html`<li data-gstep>${st[i]}</li>`)}</ol>
    ${s.tip ? html`<p class="guide-tip" data-gstep>💡 ${s.tip[i]}</p>` : ''}
  </article>`)}
</div>`;
}
