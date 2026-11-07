# jenius.es — Blueprint

**Perpustakaan baca anak dengan suara pembaca, asisten guru AI, dan kelas pintar**

Disusun 7 November 2026. Perintah pemilik (dengan dua tangkapan layar konsep: *3. Digital Literacy & Reading AI*,
*4. AI Teacher Assistant*, *5. Smart Classroom*):

> „Untuk situs jenius.es buatkan website ini, ambil e-book dari sumber terbuka manapun yg mengizinkan bukunya di serap,
> cari dr github sber terbuka manapun, voice nya suara yg relevan, seperti pembaca nya anak2, anak perempuan kecil, suara
> guru yg bijak baik perempuan dan laki dll, pokoknya kembangin dulu dalam bentuk blueprint, jika memang memerlukan input
> api key sediakan di portal super admin untuk inputnya, dan berikan rekomendasi AI apa yg d gunakan, contoh haiku,
> sonnet, opus dll, tp dengan logika gunakan yg paling murah tp tetep optimal... Bikin blueprintnya dulu setelah selesai
> mengerjakan kode adsense“

Status: **blueprint** (belum dibangun). Urutan: kode AdSense semua situs live (`docs/ADSENSE-BLUEPRINT.md` §23) →
blueprint ini → persetujuan pemilik atas keputusan di §15 → dibangun fase demi fase (§14).

Tangkapan layar hanya menampilkan butir 3–5 dan ekor butir 2 („Laporan perkembangan siswa. Informasi untuk murid“);
butir 1 tidak terlihat. Butir 2 ditafsirkan sebagai portal sekolah/orang tua (laporan perkembangan + informasi untuk
murid) dan masuk ke §6.4; bila maksud pemilik lain, cukup dikoreksi di sini.

---

## 1. Aturan tetap

| No | Aturan |
|---|---|
| 1 | **Penyimpanan R2 saja, tidak pernah D1** — desain R2 Store (`docs/R2-DATA-BLUEPRINT.md` §3). |
| 2 | **R2 harus kecil.** Pemilik menargetkan R2 situs islami di bawah 5 GB (7 Nov 2026) dan pernah mencapai 121 GB karena audiobook (§12 blueprint AdSense). jenius.es punya **anggaran penyimpanan sendiri** (§8.5) dan tidak pernah membuat audio massal tanpa batas. |
| 3 | **Hanya buku berlisensi terbuka yang mengizinkan pemakaian komersial dan turunan** (CC0, domain publik, CC BY, CC BY-SA). **Lisensi NC (non-komersial) tidak dipakai**, karena situs memuat iklan AdSense. Lisensi dicatat per buku; atribusi tampil di setiap buku. |
| 4 | **Data anak minimal.** Akun anak dibuat dan dikelola orang tua/guru, tanpa e-mail anak, tanpa foto, tanpa obrolan bebas yang disimpan lama. Persetujuan orang tua sesuai GDPR + LOPDGDD (Spanyol: di bawah 14 tahun). |
| 5 | **Tidak ada iklan di halaman anak.** AdSense hanya di halaman untuk orang dewasa (artikel untuk orang tua dan guru, beranda, panduan). Pembaca buku, kuis, dan dasbor anak bebas iklan; halaman yang ditujukan kepada anak tidak memuat loader. |
| 6 | **Suara sintetis disebut sintetis.** Tidak ada klaim bahwa pembacanya anak sungguhan; tidak ada kloning suara orang nyata (apalagi anak) tanpa izin tertulis. |
| 7 | **AI aman untuk anak:** jawaban hanya dari isi buku, kalimat pendek, tanpa tautan keluar, tanpa meminta data pribadi; percakapan disaring dan dibatasi. |
| 8 | **Kunci API hanya di portal super admin**, terenkripsi, tidak pernah ke browser. |
| 9 | **Artikel ditulis, bukan terjemahan mesin** (pemilik 7 Nov 2026); 70 artikel + versi Inggris (§11). |
| 10 | Tidak menyalin cerita atau artikel dari axto.us (situs cerita anak berbahasa Inggris dalam ekosistem): niche dibedakan (§2), tautan antar-situs hanya yang relevan. |

---

## 2. Posisi dan bahasa

- **jenius.es = perpustakaan baca interaktif berbahasa Spanyol** (domain .es, aturan ekosistem „satu situs, bahasa
  sesuai ekstensi“) **dengan versi Inggris** untuk semua halaman dan artikel (perintah pemilik 7 Nov). Buku tersedia dalam
  bahasa aslinya (Spanyol, Inggris; bahasa lain bila lisensinya ada).
- Pengguna: anak 4–12 tahun (membaca), orang tua, guru SD/TK, sekolah.
- Pembeda dari axto.us: axto.us adalah blog literasi + cerita berbahasa Inggris; jenius.es adalah aplikasi baca
  bersuara + asisten guru + kelas, berbahasa Spanyol.
- Kepanjangan usulan: **J**uegos, **E**scucha, **N**arración, **I**nteligencia, **U**nidos para **S**aber
  (permainan, mendengarkan, narasi, kecerdasan, belajar bersama) — bisa diganti pemilik.

---

## 3. Fitur (dari tangkapan layar pemilik)

### 3.1 Digital Literacy & Reading AI — perpustakaan digital interaktif

- **Ribuan bacaan edukatif:** katalog dengan saringan usia, tingkat baca (1–6), bahasa, tema, durasi, ilustrasi.
- **Buku dengan narasi suara:** pilih pembaca (§8), kecepatan 0,75×/1×/1,25×, *read-along* — kata yang sedang dibaca
  disorot; ketuk kata untuk mendengar kata itu saja.
- **AI untuk memahami isi bacaan:** tombol „Tanya tentang buku ini“ — pertanyaan anak dijawab hanya dari isi buku,
  dengan kalimat sesuai usia; bila jawabannya tidak ada di buku, AI mengatakannya.
- **Kuis setelah membaca:** 3–6 soal per buku (pilihan ganda, urutkan cerita, kosakata), dibuat sekali per buku dan
  diperiksa (§7.3), bukan dibuat ulang setiap anak membuka.
- **Poin dan penghargaan membaca:** poin per buku selesai dan kuis, lencana, *streak* harian, rak buku pribadi.
- Aksesibilitas: font ramah disleksia (opsi), ukuran huruf, kontras tinggi, mode malam, tanpa animasi bila
  `prefers-reduced-motion`.

### 3.2 AI Teacher Assistant — asisten digital untuk guru

- **Membuat modul ajar** dari buku pilihan + tujuan pembelajaran + jenjang.
- **Menyusun materi pembelajaran:** ringkasan, kosakata, kegiatan sebelum/selama/sesudah membaca, lembar kerja cetak.
- **Membuat soal dan rubrik** (pilihan ganda, isian, uraian, rubrik membaca nyaring/pemahaman).
- **Membantu analisis hasil ujian:** dari nilai kelas (CSV/isian) → butir yang sulit, siswa yang perlu bantuan, saran
  tindak lanjut. Hanya statistik dan saran; keputusan tetap pada guru.
- **Menyusun laporan pembelajaran:** laporan per siswa/kelas dari data baca dan kuis di platform.
- Semua keluaran bisa disunting guru, disimpan, dicetak, dibagikan ke kelas.

### 3.3 Smart Classroom — belajar jadi permainan

- Kelas dengan kode gabung (tanpa e-mail anak), guru menugaskan buku/rak.
- **Tantangan baca kelas** (seperti „Mrs. Johnson's Reading Challenge — TOTAL 2,180 of 5,000“ di tangkapan layar):
  target poin/menit/buku bersama, papan kemajuan kelas (tanpa peringkat publik yang mempermalukan anak; papan individu
  hanya terlihat oleh guru).
- Misi mingguan, lencana kelas, perayaan saat target tercapai.

### 3.4 Portal orang tua dan sekolah (butir 2)

- **Laporan perkembangan siswa:** buku dibaca, menit membaca, tingkat baca, hasil kuis, kosakata baru.
- **Informasi untuk murid/orang tua:** pengumuman guru, tugas baca, jadwal tantangan.
- Ekspor PDF laporan bulanan.

---

## 4. Sumber e-book terbuka

Hanya sumber yang lisensinya mengizinkan penyalinan, penyuaraan (karya turunan) dan pemakaian di situs beriklan.
**Lisensi dicek per buku saat impor**, karena satu platform bisa memuat lisensi berbeda.

| Sumber | Isi | Lisensi umum (dicek per buku) | Cara ambil | Catatan |
|---|---|---|---|---|
| **StoryWeaver** (Pratham Books) | ribuan cerita bergambar anak, ratusan bahasa termasuk Spanyol dan Inggris | sebagian besar CC BY 4.0 | unduhan per buku (ePub/PDF) dari situsnya | atribusi penulis, ilustrator, penerjemah, StoryWeaver |
| **Book Dash** | buku bergambar anak, Inggris dan bahasa Afrika Selatan | CC BY 4.0 | berkas sumber dan ePub dipublikasikan di GitHub (`bookdash`) | cocok untuk impor otomatis |
| **African Storybook** | cerita bergambar, Inggris dan banyak bahasa Afrika | CC BY 4.0 (sebagian NC — dibuang) | unduhan per buku | |
| **Let's Read** (The Asia Foundation) | cerita bergambar Asia, ada Spanyol untuk sebagian judul | per buku (CC BY 4.0 atau NC) | unduhan per buku | hanya yang CC BY/CC BY-SA |
| **Global Digital Library** | koleksi gabungan buku anak berlisensi terbuka | per buku | API/unduhan bila masih tersedia | status layanan dicek saat impor |
| **Project Gutenberg** | klasik domain publik (dongeng, fabel: Aesop, Grimm, Andersen, Perrault; teks Spanyol domain publik) | domain publik (AS) | ePub/teks | hapus merek „Project Gutenberg“ dari teks bila disajikan bukan sebagai eBook PG; cek domain publik untuk Spanyol (penulis wafat > 80 tahun untuk wafat sebelum 1987) |
| **Wikisource (es/en)** | teks domain publik (cuentos, fábulas, poesía) | domain publik | API MediaWiki | |
| **Wikibooks — Wikijunior** | buku nonfiksi anak | CC BY-SA 4.0 | API MediaWiki | turunan (audio) ikut CC BY-SA |

**Pipeline impor** (Worker + antrean, satu buku per pekerjaan):
1. Ambil metadata + berkas → 2. baca lisensi; tolak NC/ND/tidak jelas → 3. ekstrak teks per halaman dan gambar → 4.
kompres gambar (WebP ≤1600 px) → 5. klasifikasi usia/tingkat/tema (Haiku, batch) → 6. **antrean persetujuan admin**
(pratinjau, lisensi, atribusi, kepantasan untuk anak) → 7. terbit. Tidak ada buku yang tayang tanpa persetujuan.
Setiap buku menyimpan: judul, penulis, ilustrator, penerjemah, sumber URL, lisensi, tanggal impor, perubahan yang dibuat.

---

## 5. Arsitektur

- **Cloudflare Workers** (situs + API), **R2** (`jenius-data` dokumen JSON, `jenius-media` gambar/audio, `jenius-backups`
  35 hari), **KV** hanya cache dan rate limit, **Queues** untuk impor dan pembuatan audio, **Cron** untuk pembersihan.
- Desain R2 Store: satu dokumen per objek, `createOnce` untuk nilai unik (e-mail guru, kode kelas), CAS untuk progres
  dan poin (tanpa kunci panas: poin kelas dijumlah dari dokumen per siswa per hari, bukan satu dokumen yang ditulis
  setiap detik).
- Pembaca buku sebagai halaman statis + JavaScript ringan (bisa dibaca offline sebagai PWA untuk buku yang sudah dibuka).

---

## 6. Peran dan portal

| Peran | Portal |
|---|---|
| **Super Admin** | semua; **kunci API** (Anthropic, penyedia suara bila dipakai) dengan tombol Uji; pilihan model per tugas dan batas belanja; suara; antrean persetujuan buku; artikel; AdSense; audit |
| Admin konten | persetujuan buku, kuis, artikel, moderasi |
| Guru | kelas, tugas baca, tantangan, asisten guru AI, laporan |
| Orang tua | profil anak, persetujuan, laporan, batas waktu layar |
| Anak (profil) | rak, pembaca, kuis, lencana; tanpa e-mail, masuk lewat kode kelas/PIN gambar |
| Tamu | katalog dan buku contoh, artikel |

---

## 7. AI: model termurah yang tetap optimal

### 7.1 Model (harga Anthropic per 1 juta token, diverifikasi 7 Nov 2026; diatur dan diuji di portal super admin)

| Model | ID | Input / Output | Dipakai untuk |
|---|---|---|---|
| Haiku 5.5 | `claude-haiku-5-5` | US$0,10 / US$0,50 | **bawaan untuk hampir semua tugas anak**: tanya-jawab isi buku, klasifikasi tingkat baca, menyederhanakan kalimat, kosakata |
| Sonnet 5.5 | `claude-sonnet-5-5` | US$2 / US$10 | asisten guru (modul ajar, materi, soal + rubrik, analisis nilai, laporan); pembuatan kuis sekali per buku |
| Opus 5.5 | `claude-opus-5-5` | US$4 / US$20 | hanya atas permintaan guru: rencana pembelajaran satu semester dari banyak buku |
| Fable 5.1 | `claude-fable-5-1` | US$10 / US$50 | **tidak dipakai**: lebih mahal dari Opus dan mensyaratkan retensi data 30 hari di Anthropic — tidak cocok untuk data anak |

### 7.2 Logika pemilihan

1. Setiap tugas punya **model minimum** di tabel atas; router memilih yang **termurah di antara model yang memenuhi**
   dan aktif, menurut harga yang tersimpan di admin (bukan urutan tetap).
2. **Buat sekali, simpan, pakai berkali-kali:** kuis, ringkasan, kosakata dan tingkat baca dibuat **sekali per buku**
   lewat Batch API (diskon 50 %), disimpan di R2, lalu disajikan tanpa biaya AI. Biaya per buku menjadi sekali bayar.
3. **Tanya-jawab anak:** Haiku dengan teks buku sebagai konteks yang di-*cache* (prompt caching) — banyak anak bertanya
   tentang buku yang sama, jadi konteks yang sama dibaca dari cache.
4. **Eskalasi hanya bila perlu:** jawaban gagal validasi (mis. keluar dari isi buku, terlalu panjang untuk usia) → coba
   ulang sekali dengan Sonnet; bila tetap gagal, jawab „Aku tidak menemukan jawabannya di buku ini.“
5. **Batas belanja:** per hari, per guru, per kelas; *emergency stop* bila batas tercapai; semua pemakaian dicatat.
6. Effort rendah (`low`) untuk tanya-jawab anak, `medium` untuk materi guru.

### 7.3 Keamanan isi untuk anak

- Prompt sistem tetap: hanya dari isi buku, bahasa sesuai usia, tanpa tautan, tanpa meminta data pribadi, menolak topik di
  luar buku dengan ramah.
- Saringan masukan (kata kasar, data pribadi seperti alamat/telepon) sebelum ke model; saringan keluaran sebelum tampil.
- Kuis dan materi buatan AI **diperiksa admin/guru** sebelum dipakai anak (status draf → disetujui).
- Percakapan anak tidak disimpan lebih dari 24 jam; yang disimpan hanya statistik (jumlah pertanyaan per buku).

---

## 8. Suara pembaca

### 8.1 Pembaca yang diminta pemilik

| Pembaca | Bahasa | Kegunaan |
|---|---|---|
| Anak perempuan kecil („niña“) | es, en | cerita usia 4–7 |
| Anak laki-laki („niño“) | es, en | cerita usia 4–7 |
| Guru perempuan yang bijak („maestra“) | es, en | narasi utama, nonfiksi |
| Guru laki-laki yang bijak („maestro“) | es, en | narasi utama, fabel |
| Kakek/nenek pendongeng (opsional) | es | dongeng klasik |

### 8.2 Tiga jalur suara (dari yang paling murah)

| Jalur | Biaya | Penyimpanan | Mutu | Kapan |
|---|---|---|---|---|
| **A. Suara perangkat** (Web Speech API di browser) | 0 | 0 byte | tergantung perangkat; pilihan suara terbatas, umumnya tanpa suara anak | cadangan selalu tersedia; sama seperti narasi artikel di ulyah.com |
| **B. TTS open-source, dibuat sekali, disimpan** | 0 (CPU GitHub Actions/runner sendiri) | ±1 MB per 5 menit (Opus 24 kbps mono) | baik | **jalur utama** untuk buku yang sudah disetujui |
| **C. TTS cloud berbayar** | per karakter | sama dengan B | sangat baik, ada suara anak resmi | hanya untuk buku unggulan, bila pemilik menyalakan dan mengisi kuncinya di portal |

Jalur B — mesin yang lisensinya mengizinkan pemakaian komersial:
- **Kokoro-82M** (Apache-2.0): suara alami, mendukung Spanyol dan Inggris, berjalan di CPU.
- **Piper** (MIT, sudah dipakai di repo ini): sangat cepat, banyak suara Spanyol (es_ES, es_MX) dan Inggris; mutu sedikit
  di bawah Kokoro.
- Mesin dengan lisensi non-komersial (mis. Coqui XTTS di bawah CPML) **tidak dipakai**.
- Suara „anak“ di jalur B: pilih suara bernada tinggi yang lisensinya terbuka dan beri label „voz sintética infantil“;
  bila tidak ada yang layak untuk sebuah bahasa, pembaca anak memakai jalur C atau ditiadakan untuk bahasa itu —
  **tidak** memaksakan dengan mengubah pitch suara dewasa secara kasar.

Jalur C — penyedia dengan suara anak resmi untuk penggunaan komersial (kunci diisi di portal super admin, dicek syarat
lisensinya sebelum dinyalakan): Microsoft Azure Speech (ada suara anak neural), Amazon Polly (ada suara anak), Google
Cloud TTS. Pilihannya keputusan pemilik (§15).

### 8.3 Read-along (sorot kata)

Jalur B/C menghasilkan *timestamp* per kata (Kokoro/Piper: dari fonem; Azure/Polly: *word boundary/speech marks*),
disimpan sebagai JSON kecil di samping audio. Jalur A memakai event `boundary` dari Web Speech.

### 8.4 Kapan audio dibuat

- **Saat buku disetujui** hanya untuk **dua suara bawaan** (satu dewasa, satu anak) di bahasa buku itu.
- Suara lain dibuat **saat pertama kali diminta** (antrean), lalu disimpan — dan **dihapus bila 90 hari tidak diputar**
  (aturan siklus hidup R2), kecuali buku unggulan.

### 8.5 Anggaran penyimpanan R2 jenius.es

| Isi | Hitungan | Target |
|---|---|---|
| Gambar buku (WebP) | ±0,5 MB × 12 halaman × 1.000 buku | ±6 GB → **dipangkas: 1.200 px, kualitas 70 → ±2,5 GB** |
| Audio | 1 MB × 2 suara × 1.000 buku | ±2 GB |
| Data JSON | kecil | < 0,2 GB |

Dengan target R2 ekosistem yang ketat, peluncuran dibatasi **200 buku pilihan** (±1 GB total), lalu tumbuh bertahap
setelah pemilik menyetujui anggaran. Alternatif tanpa biaya penyimpanan: gambar dari sumber aslinya tidak disalin
(hotlink tidak dipakai — tidak sopan dan rapuh), jadi anggaran ini nyata dan dicatat di admin (penghitung GB per jenis).

---

## 9. Data di R2

`books/{id}` (metadata, lisensi, atribusi, tingkat) · `books/{id}/pages/{n}` · media `img/{book}/{n}.webp`,
`audio/{book}/{voice}.opus` + `.words.json` · `quiz/{book}` · `classes/{id}` · `classes/{id}/students/{sid}` ·
`progress/{sid}/{yyyy-mm-dd}` (per hari, bukan kunci panas) · `teachers/{id}` · `parents/{id}` · `consents/{sid}` ·
`ai_usage/{yyyy-mm}/` append-only · `audit/` append-only · `k/settings.json` (model, harga, batas, suara) ·
`k/secrets.enc` (kunci API terenkripsi dengan master key di secret Worker).

---

## 10. Privasi dan kepatuhan

- Persetujuan orang tua sebelum profil anak aktif; orang tua bisa melihat, mengekspor, dan menghapus data anak.
- Tidak ada pelacakan iklan di halaman anak (rule 5). Halaman dewasa memakai banner persetujuan cookie (CMP bersertifikat
  Google untuk EEA/UK, syarat AdSense di Eropa).
- Halaman wajib: Aviso legal (LSSI), Política de privacidad (dengan bagian anak), Política de cookies, Términos,
  Accesibilidad, Licencias y atribuciones (daftar semua buku dan lisensinya), Contacto.

---

## 11. Situs publik dan AdSense

- Kode AdSense sudah disiapkan: akun utama **ca-pub-6146217038829045** + 16 akun ditumpuk (`adsense-stack.json`),
  dipasang saat situs dibuat. Verifikasi Sedo sudah ada di DNS (7 Nov 2026).
- **Iklan hanya di halaman dewasa** (§1 no. 5): beranda, artikel, panduan, halaman guru publik.
- **70 artikel** untuk orang tua dan guru, Spanyol + versi Inggris yang ditulis (bukan terjemahan mesin), ≥1.500 kata,
  sumber resmi (UNESCO, Ministerio de Educación y FP, OECD PISA, Instituto Cervantes, RAE untuk ejaan), terbit bertahap.

Kluster (10 artikel per kluster):
1. **Aprender a leer** — conciencia fonológica, método silábico vs global, leer en voz alta, etapas de lectura por edad.
2. **Hábito lector en casa** — rutinas, cuentos antes de dormir, bibliotecas en casa, pantallas y lectura.
3. **Comprensión lectora** — preguntas antes/durante/después, vocabulario, inferencias, resumir.
4. **Dificultades de lectura** — dislexia (señales, apoyos), TDAH y lectura, cuándo consultar a un especialista.
5. **Bilingüismo y lectura** — leer en español e inglés, familias bilingües, segundo idioma.
6. **Docentes y aula** — planes lectores, lectura en voz alta en clase, retos lectores, evaluación de la lectura.
7. **IA y educación con criterio** — cómo usar IA en el aula, privacidad de los niños, enseñar a leer con IA sin depender de ella.

Alat gratis untuk orang tua/guru (kriteria „alat yang autentik“): penghitung kata per menit (lectura en voz alta),
generator rencana baca mingguan, pemilih buku menurut usia dan tingkat, kartu kosakata cetak.

---

## 12. Tautan antar-situs (tanpa melanggar kebijakan)

Hanya tautan yang relevan untuk pembaca, dengan teks jangkar yang menyebut topik situs tujuan: axto.us (literasi anak
berbahasa Inggris), xscan.es (penilaian tulisan untuk guru), situs muslim ulyah.com/dawa.im hanya dari halaman yang
relevan (mis. cerita anak islami) — tidak ada pertukaran tautan massal, tidak ada blok tautan di kaki setiap halaman.

---

## 13. Uji

Unit (lisensi ditolak bila NC, router model, batas belanja, poin/streak tanpa kunci panas) · e2e (guru membuat kelas →
anak masuk dengan kode → membaca dengan suara → kuis → poin → laporan orang tua) di desktop dan ponsel · keamanan (anak
tidak bisa melihat kelas lain, kunci API tidak pernah di respons) · aksesibilitas (pembaca layar, kontras) · audit live
AdSense (`site-audit.yml`: halaman dewasa punya loader, halaman anak tidak).

---

## 14. Tahapan

| Fase | Isi | Selesai bila |
|---|---|---|
| J0 | Situs dasar + halaman wajib + AdSense 16 akun + 10 artikel pertama ES/EN + alat | `site-audit` OK, halaman wajib lengkap |
| J1 | Pipeline impor + persetujuan + 200 buku + pembaca + suara jalur A | 200 buku tayang dengan atribusi benar |
| J2 | Suara jalur B (Kokoro/Piper) + read-along + anggaran R2 | audio 2 suara untuk 200 buku, R2 jenius ≤ 1,5 GB |
| J3 | Akun guru/orang tua/anak, kelas, persetujuan orang tua | e2e kelas lulus |
| J4 | Kuis (sekali per buku, Batch) + poin, lencana, tantangan kelas | |
| J5 | Asisten guru AI (Sonnet) + tanya-jawab anak (Haiku) + portal super admin kunci API & batas | biaya per tugas tercatat; batas belanja diuji |
| J6 | Laporan perkembangan, portal orang tua, ekspor PDF | |
| J7 | 70 artikel lengkap, jalur C (bila disetujui), uji beban dan keamanan | |

---

## 15. Keputusan pemilik

1. **Bahasa:** Spanyol + Inggris (usulan) — atau tambah Indonesia.
2. **Anggaran R2 jenius.es:** 1,5 GB untuk peluncuran (usulan), naik setelah disetujui.
3. **Suara jalur C** (berbayar, ada suara anak resmi): tidak dulu (usulan) / Azure / Polly / Google.
4. **Model:** Haiku untuk anak, Sonnet untuk guru, Opus atas permintaan, Fable tidak dipakai (usulan).
5. **Biaya untuk guru/sekolah:** gratis untuk membaca; asisten guru AI berbayar (kredit) atau gratis dengan batas harian.
6. **Kepanjangan nama** jenius.es (§2).
