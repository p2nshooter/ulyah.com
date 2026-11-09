/**
 * Halaman wajib & informasi (docs/JENIUS-BLUEPRINT.md §10): tentang, kontak, privasi (dengan bagian anak), cookie, syarat,
 * aksesibilitas, penafian, panduan, untuk guru. Ditulis dalam Markdown ID/EN, dirender aman oleh lib/markdown.ts.
 */
import type { Lang, PageKey } from '../lib/i18n.ts';

export const CONTACT = 'halo@jenius.es';
export const UPDATED = '2026-11-09';

type Doc = { title: [string, string]; desc: [string, string]; md: [string, string] };

export const INFO: Partial<Record<PageKey, Doc>> = {
  about: {
    title: ['Tentang jenius.es', 'About jenius.es'],
    desc: ['jenius.es adalah perpustakaan baca bersuara yang gratis: buku dari sumber terbuka, dibacakan suara sintetis, untuk anak sampai profesor.', 'jenius.es is a free voiced reading library: open-source books read aloud by synthetic voices, for children up to professors.'],
    md: [
      `jenius.es lahir dari satu keyakinan sederhana: **setiap orang berhak mendengar buku yang baik dibacakan**, apa pun usianya, di mana pun ia tinggal, dan berapa pun isi dompetnya.

## Apa yang kami lakukan

Kami mengumpulkan buku dari sumber yang lisensinya mengizinkan buku itu disalin, dibacakan, dan dibagikan — karya klasik domain publik dan buku bergambar berlisensi Creative Commons — lalu menyajikannya dalam pembaca AUTO: tekan Putar sekali, suara membacakan setiap halaman, kata yang dibaca disorot, halaman berganti sendiri, dan pembacaan berlanjut sampai akhir bab atau akhir buku.

Buku disusun dalam **delapan Jalur Baca** — Tunas, Tumbuh, Jelajah, Kampus, Cendekia, Profesi, Santai, dan Lintas Bahasa — supaya anak yang baru mengenal huruf, remaja, mahasiswa, peneliti, dan pembaca umum menemukan bacaan yang pas tanpa harus menebak.

## Prinsip kami

- **Gratis untuk semua.** Membaca, mendengarkan, dan fitur kelas tidak dipungut biaya. Situs ini dibiayai iklan yang hanya tampil di halaman untuk orang dewasa.
- **Tanpa iklan di halaman anak.** Pembaca buku, jalur anak, dan halaman yang ditujukan kepada anak tidak memuat iklan.
- **Lisensi yang jujur.** Setiap buku menyebut penulis, ilustrator, penerjemah, sumber, dan lisensinya. Lisensi yang melarang pemakaian komersial atau karya turunan tidak kami pakai.
- **Suara sintetis disebut sintetis.** Suara pembaca berasal dari mesin suara di perangkat Anda. Kami tidak meniru suara orang sungguhan.
- **Data seminimal mungkin.** Posisi baca disimpan di perangkat Anda. Akun hanya dibuat bila Anda memerlukannya.

## Siapa di balik jenius.es

jenius.es dikembangkan oleh tim kecil yang juga mengelola alat pendidikan xscan.es (penilai tulisan untuk guru). Masukan, koreksi atribusi, atau usulan buku bisa dikirim ke **${CONTACT}**.`,
      `jenius.es grew out of one simple belief: **everyone deserves to hear good books read aloud**, whatever their age, wherever they live and whatever they can afford.

## What we do

We gather books from sources whose licences allow them to be copied, read aloud and shared — public-domain classics and Creative Commons picture books — and present them in the AUTO reader: press Play once, a voice reads every page, the spoken word lights up, pages turn by themselves, and reading carries on to the end of the chapter or the whole book.

Books are arranged in **eight Reading Lanes** — Sprout, Grow, Explore, Campus, Scholar, Career, Leisure and Across Languages — so a child meeting letters for the first time, a teenager, a student, a researcher and a general reader each find the right book without guessing.

## Our principles

- **Free for everyone.** Reading, listening and classroom features cost nothing. The site is funded by ads shown only on pages meant for adults.
- **No ads on children’s pages.** The book reader, children’s lanes and pages aimed at children carry no ads.
- **Honest licensing.** Every book names its author, illustrator, translator, source and licence. Licences that forbid commercial use or derivative works are never used.
- **Synthetic voices are called synthetic.** Reader voices come from the speech engine on your device. We never imitate a real person’s voice.
- **As little data as possible.** Your reading position is stored on your device. Accounts are only created when you need one.

## Who is behind jenius.es

jenius.es is built by a small team that also runs the education tool xscan.es (a writing assessor for teachers). Feedback, attribution corrections or book suggestions are welcome at **${CONTACT}**.`,
    ],
  },
  contact: {
    title: ['Kontak', 'Contact'],
    desc: ['Hubungi jenius.es untuk pertanyaan, koreksi atribusi buku, usulan buku, kerja sama sekolah, atau permintaan data pribadi.', 'Contact jenius.es with questions, book attribution corrections, book suggestions, school partnerships or personal-data requests.'],
    md: [
      `Kami senang mendengar dari Anda.

- **E-mail:** ${CONTACT}
- **Waktu balas:** biasanya dalam 2 hari kerja.

## Untuk apa saja Anda bisa menghubungi kami

- **Koreksi atribusi atau lisensi** — bila nama penulis, ilustrator, penerjemah, atau lisensi sebuah buku keliru, sebutkan judul bukunya dan kami perbaiki secepatnya.
- **Usulan buku** — sertakan tautan ke sumber dan lisensinya (domain publik, CC0, CC BY, atau CC BY-SA).
- **Sekolah dan guru** — kerja sama kelas, pelatihan singkat, atau masukan fitur.
- **Permintaan data pribadi** — melihat, menyalin, atau menghapus data akun Anda atau anak Anda (lihat Kebijakan Privasi).
- **Melaporkan masalah** — halaman yang rusak, suara yang tidak berjalan, atau isi yang tidak pantas.

Mohon jangan mengirim data pribadi anak lewat e-mail kecuali diminta untuk memproses permintaan data.`,
      `We would love to hear from you.

- **Email:** ${CONTACT}
- **Response time:** usually within 2 working days.

## What you can contact us about

- **Attribution or licence corrections** — if a book’s author, illustrator, translator or licence is wrong, tell us the title and we will fix it quickly.
- **Book suggestions** — include a link to the source and its licence (public domain, CC0, CC BY or CC BY-SA).
- **Schools and teachers** — classroom partnerships, short training or feature ideas.
- **Personal-data requests** — to see, copy or delete your or your child’s account data (see the Privacy Policy).
- **Reporting a problem** — a broken page, a voice that does not play, or unsuitable content.

Please do not send a child’s personal data by email unless we ask for it to process a data request.`,
    ],
  },
  privacy: {
    title: ['Kebijakan privasi', 'Privacy policy'],
    desc: ['Data apa yang dikumpulkan jenius.es, untuk apa, berapa lama disimpan, perlindungan khusus untuk anak, dan hak Anda.', 'What data jenius.es collects, why, how long it is kept, special protection for children, and your rights.'],
    md: [
      `Terakhir diperbarui: ${UPDATED}.

jenius.es dibuat dengan prinsip **data seminimal mungkin**. Kebijakan ini menjelaskan data yang kami proses dan hak Anda, termasuk menurut Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022) dan, bagi pengunjung dari Uni Eropa, GDPR.

## Data yang diproses

- **Tanpa akun:** posisi baca, pengaturan suara, dan ukuran huruf disimpan **di perangkat Anda** (penyimpanan lokal peramban), tidak di server kami.
- **Dengan akun:** nama tampilan, alamat e-mail, kata sandi dalam bentuk hash (tidak bisa dibaca kembali), rak buku, dan riwayat baca.
- **Kelas (guru dan murid):** nama kelas, daftar anggota, tugas, nilai, dan pesan kelas.
- **Log teknis:** alamat IP dan jenis peramban untuk keamanan dan pencegahan penyalahgunaan, disimpan singkat.

## Anak-anak

- Profil anak dibuat dan dikelola oleh **orang tua atau guru**. Anak tidak memerlukan e-mail.
- Kami tidak meminta foto, alamat, atau nomor telepon anak.
- **Halaman untuk anak tidak memuat iklan** dan tidak memakai cookie iklan.
- Pesan di kelas dimoderasi guru dan dihapus otomatis setelah 90 hari.
- Orang tua dapat melihat, mengekspor, atau menghapus data anaknya kapan saja dengan menghubungi ${CONTACT}.

## Iklan

Halaman untuk orang dewasa (beranda, artikel, alat, panduan) menampilkan iklan Google AdSense. Google dan mitranya dapat memakai cookie untuk menampilkan iklan berdasarkan kunjungan Anda ke situs ini dan situs lain. Anda dapat mengatur iklan yang dipersonalisasi di [Setelan Iklan Google](https://adssettings.google.com) dan mempelajari lebih lanjut di [Cara Google memakai data](https://policies.google.com/technologies/partner-sites).

## Penyimpanan dan keamanan

Data disimpan di infrastruktur Cloudflare (R2) dengan akses terbatas. Kunci rahasia disegel dengan enkripsi. Cadangan disimpan 35 hari.

## Hak Anda

Anda berhak meminta akses, perbaikan, penghapusan, pembatasan, dan salinan data Anda, serta menarik persetujuan. Kirim permintaan ke **${CONTACT}**; kami menanggapi dalam 30 hari.

## Perubahan

Bila kebijakan ini berubah secara penting, kami menampilkan pemberitahuan di situs.`,
      `Last updated: ${UPDATED}.

jenius.es is built on the principle of **as little data as possible**. This policy explains the data we process and your rights, including under Indonesia’s Personal Data Protection Law (Law No. 27 of 2022) and, for visitors from the European Union, the GDPR.

## Data we process

- **Without an account:** reading position, voice settings and text size are stored **on your device** (browser local storage), not on our servers.
- **With an account:** display name, email address, a hashed password (which cannot be read back), your shelf and reading history.
- **Classes (teachers and students):** class name, member list, tasks, grades and class messages.
- **Technical logs:** IP address and browser type for security and abuse prevention, kept briefly.

## Children

- Child profiles are created and managed by **parents or teachers**. Children do not need an email address.
- We never ask for a child’s photo, address or phone number.
- **Pages meant for children show no ads** and use no advertising cookies.
- Class messages are moderated by the teacher and deleted automatically after 90 days.
- Parents can see, export or delete their child’s data at any time by writing to ${CONTACT}.

## Advertising

Pages for adults (home, articles, tools, guide) show Google AdSense ads. Google and its partners may use cookies to show ads based on your visits to this and other sites. You can manage personalised ads in [Google Ad Settings](https://adssettings.google.com) and learn more about [how Google uses data](https://policies.google.com/technologies/partner-sites).

## Storage and security

Data is stored on Cloudflare infrastructure (R2) with restricted access. Secret keys are sealed with encryption. Backups are kept for 35 days.

## Your rights

You may request access, correction, deletion, restriction and a copy of your data, and withdraw consent. Send requests to **${CONTACT}**; we respond within 30 days.

## Changes

If this policy changes in an important way, we show a notice on the site.`,
    ],
  },
  cookies: {
    title: ['Kebijakan cookie', 'Cookie policy'],
    desc: ['Cookie dan penyimpanan lokal yang dipakai jenius.es: penting untuk masuk dan posisi baca, serta cookie iklan Google di halaman dewasa.', 'Cookies and local storage used by jenius.es: essential ones for sign-in and reading position, and Google ad cookies on adult pages.'],
    md: [
      `## Cookie penting

- **Sesi masuk** — menjaga Anda tetap masuk ke akun. Dihapus saat keluar atau setelah 30 hari.
- **Bahasa** — mengingat pilihan bahasa Indonesia atau Inggris.

## Penyimpanan lokal (di perangkat Anda)

Posisi baca, suara pilihan, kecepatan, ukuran huruf, dan mode malam disimpan di penyimpanan lokal peramban. Data ini tidak dikirim ke server kami.

## Cookie iklan

Halaman untuk orang dewasa menampilkan iklan **Google AdSense**. Google dapat memasang cookie untuk mengukur dan mempersonalisasi iklan. Halaman anak dan pembaca buku tidak memuat iklan. Atur iklan Google di [Setelan Iklan](https://adssettings.google.com).

## Mengelola cookie

Anda dapat menghapus atau memblokir cookie lewat pengaturan peramban. Memblokir cookie penting membuat Anda tidak bisa masuk ke akun, tetapi membaca dan mendengarkan buku tetap bisa.`,
      `## Essential cookies

- **Sign-in session** — keeps you signed in. Removed when you sign out or after 30 days.
- **Language** — remembers your choice of Indonesian or English.

## Local storage (on your device)

Reading position, chosen voice, speed, text size and night mode are kept in your browser’s local storage. This data is never sent to our servers.

## Advertising cookies

Pages for adults show **Google AdSense** ads. Google may set cookies to measure and personalise ads. Children’s pages and the book reader carry no ads. Manage Google ads in [Ad Settings](https://adssettings.google.com).

## Managing cookies

You can delete or block cookies in your browser settings. Blocking essential cookies stops you signing in, but reading and listening to books still works.`,
    ],
  },
  terms: {
    title: ['Syarat dan ketentuan', 'Terms of use'],
    desc: ['Syarat memakai jenius.es: layanan gratis, lisensi buku terbuka, akun guru dan murid, aturan kelas, serta batas tanggung jawab.', 'Terms for using jenius.es: a free service, openly licensed books, teacher and student accounts, class rules and limits of liability.'],
    md: [
      `Dengan memakai jenius.es, Anda menyetujui syarat berikut.

## Layanan

jenius.es menyediakan perpustakaan baca bersuara secara gratis. Fitur bisa berubah seiring pengembangan. Kami berusaha agar layanan selalu tersedia, tetapi tidak menjamin bebas gangguan.

## Buku dan lisensi

Buku berasal dari sumber domain publik dan berlisensi terbuka. Lisensi setiap buku tercantum di halaman bukunya dan di halaman Lisensi & atribusi. Anda boleh memakai buku sesuai lisensinya masing-masing.

## Akun

- Anda bertanggung jawab menjaga kerahasiaan kata sandi.
- Akun anak dibuat oleh orang tua atau guru, yang bertanggung jawab atas pemakaiannya.
- Kami dapat menangguhkan akun yang melanggar syarat ini.

## Aturan kelas

Guru bertanggung jawab atas kelasnya. Dilarang mengirim isi yang kasar, merendahkan, berbahaya, atau berisi data pribadi orang lain. Pesan yang dilaporkan dapat dihapus.

## Alat AI

Bila tersedia, fitur AI (misalnya membuat soal) adalah alat bantu. Hasilnya perlu diperiksa guru sebelum dipakai.

## Tanggung jawab

Isi artikel bersifat informasi umum dan bukan pengganti nasihat profesional (misalnya dokter atau psikolog). Kami tidak bertanggung jawab atas kerugian akibat pemakaian situs di luar batas yang diatur hukum.

## Hukum yang berlaku

Syarat ini tunduk pada hukum Republik Indonesia. Pertanyaan: ${CONTACT}.`,
      `By using jenius.es you agree to these terms.

## The service

jenius.es provides a free voiced reading library. Features may change as we develop. We aim to keep the service available but do not guarantee it will be uninterrupted.

## Books and licences

Books come from public-domain and openly licensed sources. Each book’s licence is shown on its book page and on the Licences & credits page. You may use books according to their own licences.

## Accounts

- You are responsible for keeping your password secret.
- Child accounts are created by a parent or teacher, who is responsible for their use.
- We may suspend accounts that break these terms.

## Class rules

Teachers are responsible for their classes. Abusive, demeaning or harmful content, or other people’s personal data, is not allowed. Reported messages may be removed.

## AI tools

Where available, AI features (for example generating questions) are aids. Teachers should check the results before use.

## Liability

Articles are general information and not a substitute for professional advice (for example a doctor or psychologist). We are not liable for losses arising from use of the site beyond the limits set by law.

## Governing law

These terms are governed by the laws of the Republic of Indonesia. Questions: ${CONTACT}.`,
    ],
  },
  accessibility: {
    title: ['Aksesibilitas', 'Accessibility'],
    desc: ['Cara jenius.es dibuat agar nyaman bagi semua pembaca: suara, ukuran huruf, huruf ramah disleksia, kontras tinggi, dan navigasi papan ketik.', 'How jenius.es is built to be comfortable for every reader: voice, text size, a dyslexia-friendly font, high contrast and keyboard navigation.'],
    md: [
      `Membaca adalah hak semua orang. Pembaca jenius.es menyediakan:

- **Suara** untuk setiap halaman, dengan sorotan kata yang sedang dibaca dan kecepatan 0,75–1,5×.
- **Ukuran huruf** yang bisa diatur, **huruf ramah disleksia**, **mode malam**, dan **kontras tinggi**.
- **Navigasi papan ketik:** spasi untuk putar/jeda, panah kiri/kanan untuk berpindah halaman.
- **Tanpa animasi** bila perangkat Anda meminta pengurangan gerak.
- Struktur judul yang rapi dan teks alternatif untuk gambar buku bergambar.

Kami menargetkan kesesuaian dengan WCAG 2.2 tingkat AA. Bila Anda menemukan hambatan, beri tahu kami di ${CONTACT} — sebutkan halaman dan perangkat yang dipakai.`,
      `Reading is everyone’s right. The jenius.es reader offers:

- **A voice** for every page, highlighting the word being read, at 0.75–1.5× speed.
- Adjustable **text size**, a **dyslexia-friendly font**, **night mode** and **high contrast**.
- **Keyboard navigation:** space to play/pause, left/right arrows to change page.
- **No animation** when your device asks for reduced motion.
- A clean heading structure and alternative text for picture-book images.

We aim to conform to WCAG 2.2 level AA. If you meet a barrier, tell us at ${CONTACT} — mention the page and the device you used.`,
    ],
  },
  disclaimer: {
    title: ['Penafian', 'Disclaimer'],
    desc: ['Batas tanggung jawab isi jenius.es: artikel informasi umum, buku sesuai sumber aslinya, suara sintetis, dan tautan keluar.', 'Limits of jenius.es content: general-information articles, books as in their original sources, synthetic voices and external links.'],
    md: [
      `- **Artikel** di jenius.es adalah informasi umum tentang membaca dan pendidikan, disusun dengan hati-hati dari sumber tepercaya, tetapi **bukan pengganti** penilaian guru, dokter anak, psikolog, atau terapis wicara.
- **Buku klasik** ditampilkan sesuai sumber aslinya dan mencerminkan zamannya; sebagian memuat pandangan yang kini dianggap usang. Orang tua dan guru dianjurkan mendampingi pembaca muda.
- **Suara pembaca** adalah suara sintetis dari perangkat Anda; pelafalan nama atau kata asing bisa kurang tepat.
- **Tautan keluar** disediakan untuk kemudahan; kami tidak bertanggung jawab atas isi situs lain.
- **Iklan** di halaman dewasa disediakan Google; kami tidak mendukung produk yang diiklankan.`,
      `- **Articles** on jenius.es are general information about reading and education, carefully prepared from trusted sources, but **not a substitute** for the judgement of a teacher, paediatrician, psychologist or speech therapist.
- **Classic books** are shown as in their original sources and reflect their time; some contain views now considered outdated. Parents and teachers are encouraged to accompany young readers.
- **Reader voices** are synthetic voices from your device; names and foreign words may be mispronounced.
- **External links** are provided for convenience; we are not responsible for other sites’ content.
- **Ads** on adult pages are provided by Google; we do not endorse advertised products.`,
    ],
  },
  guide: {
    title: ['Panduan memakai jenius.es', 'How to use jenius.es'],
    desc: ['Langkah demi langkah: memilih jalur baca, memutar buku bersuara, mengatur suara dan kecepatan, mode slide, baca tanpa internet, dan alat gratis.', 'Step by step: choosing a reading lane, playing a voiced book, setting voice and speed, slide mode, offline reading and the free tools.'],
    md: [
      `## 1. Pilih jalur baca

Buka **Jalur Baca** dan pilih jalur yang sesuai: Tunas (TK–kelas 2), Tumbuh (kelas 3–6), Jelajah (SMP–SMA), Kampus, Cendekia, Profesi, Santai, atau Lintas Bahasa untuk belajar bahasa Inggris. Di dalam jalur, saring buku menurut **rak tema**.

## 2. Putar bukunya

Di halaman buku, tekan **Dengarkan dari awal** (atau pilih bab). Di pembaca, tekan **▶ Putar** sekali. Suara membacakan halaman, kata yang dibaca disorot, dan halaman berganti sendiri.

## 3. Atur pengalaman

Tekan **Aa** untuk memilih suara (anak, guru perempuan, guru laki-laki, narator), kecepatan, **lanjut sampai akhir bab atau akhir buku**, ukuran huruf, huruf ramah disleksia, mode malam, dan kontras tinggi.

## 4. Buku bergambar = mode slide

Buku bergambar tampil layar penuh dan bergeser otomatis mengikuti suara. Cocok ditampilkan di layar kelas.

## 5. Lanjutkan kapan saja

Posisi terakhir tersimpan di perangkat. Halaman buku menampilkan **Lanjutkan dari halaman …**.

## 6. Baca tanpa internet

Pasang jenius.es di HP (tombol **Pasang** di bagian atas). Bab yang sudah dibuka bisa dibaca lagi tanpa internet.

## 7. Alat gratis

Uji kecepatan baca, rencana baca mingguan, pemilih buku, dan kartu kosakata ada di menu **Alat Gratis**.

## Pintasan papan ketik

- **Spasi** — putar/jeda
- **→ / ←** — halaman berikutnya/sebelumnya`,
      `## 1. Choose a reading lane

Open **Reading Lanes** and pick the one that fits: Sprout (pre-K–grade 2), Grow (grades 3–6), Explore (middle–high school), Campus, Scholar, Career, Leisure, or Across Languages for learning English. Inside a lane, filter books by **theme shelf**.

## 2. Play the book

On the book page, press **Listen from the start** (or pick a chapter). In the reader, press **▶ Play** once. A voice reads the page, the spoken word lights up and the page turns by itself.

## 3. Adjust the experience

Press **Aa** to choose a voice (child, female teacher, male teacher, narrator), speed, **keep going to the end of the chapter or the book**, text size, a dyslexia-friendly font, night mode and high contrast.

## 4. Picture books = slide mode

Picture books go full screen and slide on with the voice. Great on a classroom screen.

## 5. Resume any time

Your last position is saved on the device. The book page shows **Resume from page …**.

## 6. Read offline

Install jenius.es on your phone (the **Install** button at the top). Chapters you have opened can be read again without internet.

## 7. Free tools

The reading speed test, weekly reading plan, book picker and vocabulary cards are under **Free Tools**.

## Keyboard shortcuts

- **Space** — play/pause
- **→ / ←** — next/previous page`,
    ],
  },
};

export function infoDoc(k: PageKey, L: Lang): { title: string; desc: string; md: string } | null {
  const d = INFO[k];
  if (!d) return null;
  const i = L === 'en' ? 1 : 0;
  return { title: d.title[i], desc: d.desc[i], md: d.md[i] };
}
