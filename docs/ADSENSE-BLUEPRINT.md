# Blueprint Pengajuan AdSense — Seluruh Ekosistem

Dokumen induk untuk semua situs yang diajukan ke AdSense. **Setiap permintaan
baru dicatat di sini dulu**, lalu statusnya diperbarui setelah diuji.
Kontrol pusatnya ada di repo `ulyah.com`; situs yang punya repo sendiri tetap
dicatat di sini.

Terakhir diperbarui: 4 Oktober 2026 (fase 1 selesai, dawo.es selesai).

Arti tanda: ✅ selesai dan lulus uji · 🟡 selesai, butuh tindakan manual atau
belum diuji penuh · 🔄 sedang dikerjakan · ❌ belum dikerjakan · ⏸️ ditunda

---

## 1. Aturan tetap (wajib, semua situs)

1. **Satu situs, satu bahasa, sesuai ekstensi domain**: `.es` dan `.lat` →
   Spanyol, `.fr` → Prancis, `.in` → Hindi + Inggris (bilingual yang sudah
   ada), `.com` (ulyah) → Indonesia, `.io` `.us` `.dev` `.skin` → Inggris.
2. **AdSense saja.** Tidak ada Adsterra, popunder, social bar, atau jaringan
   iklan lain di situs mana pun. Setiap situs memuat persis tiga hal dari
   akunnya sendiri: script `adsbygoogle.js?client=…` di `<head>`, meta
   `google-adsense-account`, dan `/ads.txt`. Tidak ada pengaturan iklan yang
   bisa mematikannya.
3. **Unit iklan manual hanya untuk akun yang sudah di-ACC** (ID slot milik
   akun lain tidak akan pernah terisi). Situs yang sedang diajukan memakai
   kode verifikasi saja; setelah di-ACC, Auto ads dinyalakan dari dasbor
   AdSense tanpa mengubah kode.
4. **Artikel ditulis tangan, bukan oleh bot.** Minimal 40 artikel panjang
   (±1.500 kata ke atas) per situs. Artikel mesin yang dobel atau tipis
   dihapus. Tidak ada janji kaya cepat, tidak ada saran medis/keuangan
   personal, dan tidak ada fakta yang dikarang.
5. **Halaman wajib di setiap situs**: Beranda, kategori, Tentang, Kontak,
   Kebijakan Privasi (termasuk cookie Google/AdSense dan vendor pihak
   ketiga), Syarat & Ketentuan, Disclaimer. Situs `.es` juga wajib punya
   *Aviso legal* (LSSI) dan *Política de cookies*. Ditambah `sitemap.xml`,
   `robots.txt`, menu yang jelas, dan tidak ada tautan rusak.
6. **Desain wajib "Istana Nabi Sulaiman"**: mewah, penuh animasi indah, dan
   **CSS setiap situs berbeda total**, bukan salinan situs lain atau milik
   orang lain (lihat §4).
7. **Animasi Spanyol juara Piala Dunia 2026** di setiap situs, dengan gaya
   masing-masing (lihat §5).
8. **Rapi dan mudah dijual**: satu situs = satu folder atau satu repo yang
   berdiri sendiri, berisi script, isi, dan database-nya. Ada perintah backup
   satu langkah (lihat §6).
9. Animasi tidak boleh menutupi isi atau iklan, harus menghormati
   `prefers-reduced-motion`, dan tidak memakai gambar makhluk bernyawa
   (patung/figur).
10. Repo **sairan** tidak disentuh.

---

## 2. Peta situs (hasil cek repo + browser, 4 Okt 2026)

Kolom "Live" berisi hasil audit Chromium sungguhan dari GitHub Actions
(`.github/workflows/site-audit.yml`), karena container kerja tidak bisa
membuka domain-domain ini.

| Domain | Akun AdSense baru | Repo / lokasi kode | Worker | Bahasa | Live sekarang |
|---|---|---|---|---|---|
| ulyah.com | ca-pub-8991272269211824 | `ulyah.com` · apps/web (tenant `ulyah`) | ulyah-web | id | 200 · akun lama 6371… · tanpa Adsterra |
| 1fr.fr | ca-pub-5944786950535069 | `ulyah.com` · apps/web (tenant `1fr`) | onefaith-web | fr | 200 · akun lama 6371… |
| axto.io | ca-pub-8991272269211824 | `guardian-ai` · `dashboard/` (Cloudflare Pages) | axto-dashboard | en | 200 · akun lama 6371… · **ads.txt 404** |
| xaa.es | ca-pub-8991272269211824 | `xaa` (studio web + portal klien) | xaa-es | en → **es** | 200 · akun lama 6371… · home tanpa artikel |
| axto.us | ca-pub-6908951782430508 | `axto.us` (perpustakaan cerita anak + blog) | axto-us | en | 200 · akun lama 6371… |
| axto.dev | ca-pub-8469557036744946 | `axtodev` | axto-dev | en | 200 · **Adsterra aktif** · 158 artikel |
| jai.lat | ca-pub-4548005919629272 | `jai` | jai-lat | en → **es** | 200 · **Adsterra aktif** · 77 artikel (Inggris) |
| lie.skin | ca-pub-9666205248809954 | `lie` | lie-skin | en | 200 · **Adsterra aktif** · 88 artikel |
| oldco.in | ca-pub-6293576511807510 | `oldco.in` | oldco-in | hi + en | 200 · **Adsterra aktif** · judul mesin dobel |
| profity.in | ca-pub-6146217038829045 | `profity.in` | profity-in | hi + en | 200 · **Adsterra aktif** · judul mesin dobel |
| dawo.es | ca-pub-6019445914743449 | **baru** → `ulyah.com/sites/dawo.es` | dawo-es | es | **belum ada** (DNS tidak resolve) |
| qkb.es | ca-pub-7516944260248026 | **baru** → `ulyah.com/sites/qkb.es` | qkb-es | es | **belum ada** (DNS tidak resolve) |
| byodd.es | ca-pub-2228462932360966 | **baru** → `ulyah.com/sites/byodd.es` | byodd-es | es | **belum ada** (DNS tidak resolve) |
| xko.es | — (persiapan) | **baru** → `ulyah.com/sites/xko.es` | xko-es | es | belum ada |
| byodd.de | — (persiapan) | **baru** → `ulyah.com/sites/byodd.de` | byodd-de | de | belum ada |
| byoxy.de | — (persiapan) | **baru** → `ulyah.com/sites/byoxy.de` | byoxy-de | de | belum ada |

Tidak berubah (tidak ada di file): dawa.es dan tilawa.de tetap
6371903555702163 (sudah di-ACC), xad.es tetap 2493615451319531 (sudah live
dari branch `ccr-8cac35c6-6bbbvx`, digabung ke main lewat pekerjaan ini supaya
tidak tertimpa).

Temuan "tersembunyi" (live berbeda dari main):

- xad.es live memakai akun 2493615451319531, tetapi kodenya hanya ada di
  branch `ccr-8cac35c6-6bbbvx` yang belum di-merge. Deploy dari main akan
  mengembalikannya ke akun lama. → digabung (§7, fase 1).
- Folder `quantum/` (sistem karoseri) juga diarahkan ke xaa.es
  (`QUANTUM_DOMAIN` bawaan). Deploy quantum berikutnya akan **merebut** xaa.es
  dari studio XAA. → bawaannya dikosongkan, quantum tetap di workers.dev.
- Bot konten (`apps/worker-api/src/lib/content-bot.ts`) menulis ke 7 repo
  situs. Hasilnya di oldco.in dan profity.in berupa judul hampir kembar.
  → bot dimatikan untuk situs AdSense, artikel mesin dihapus.

---

## 3. Kepanjangan nama & niche per situs

| Situs | Kepanjangan | Niche artikel |
|---|---|---|
| dawo.es | **D**eporte, **A**ctividad, **W**ellness y **O**cio | Deporte amateur y vida activa: correr, pádel, fútbol base, fuerza, movilidad, descanso, nutrición deportiva básica |
| qkb.es | **Q**ueso, **K**éfir y **B**ollería | El obrador casero: quesos frescos, kéfir y fermentados, masa madre, panes y bollería española |
| byodd.es | **B**ricolaje **Y** **O**rden **D**el **D**omicilio | Bricolaje, reparaciones del hogar, orden y decoración práctica |
| xko.es | e**X**pertos en **K**ilovatios y **O**ptimización | Ahorro energético en casa: factura de la luz, potencia, autoconsumo, aislamiento |
| byodd.de | **B**ring **Y**our **O**wn **D**IY & **D**eko | Heimwerken, Renovieren und Wohnen auf Deutsch |
| byoxy.de | **B**ring **Y**our **OXY**gen home | Zimmerpflanzen, Balkon- und Kräutergarten auf Deutsch |
| jai.lat | **J**unta de **A**horro e **I**nversión | Finanzas personales para Latinoamérica (educativo, sin recomendaciones) |
| xaa.es | e**X**periencia · **A**utomatización · **A**rquitectura | Estudio web: guías de cada menú del portal y de los servicios |
| axto.io | **A**I e**X**pert **T**oolkit **O**nline | Guides to every menu of the 7 cloud apps and 10 self-hosted editions |
| axto.us | **A**dventures e**X**plore **TO**gether — Unlimited Stories | Reading & literacy for parents and teachers |
| axto.dev | **A**utomation, e**X**tensions, **T**ooling & **O**ps | Developer explainers |
| lie.skin | **L**ook **I**nto the **E**vidence | Evidence-first skincare, myths vs facts |
| oldco.in | **Old Co**ins of **In**dia | भारतीय मुद्राशास्त्र / Indian numismatics |
| profity.in | **Profit** + **I**nsight for **Y**ou | व्यक्तिगत वित्त / Personal finance for India |
| 1fr.fr | One Faith France | Portail islamique (yang sudah ada) |
| ulyah.com | — | Portal Islam berbahasa Indonesia (yang sudah ada) |

---

## 4. Konsep desain: Istana Nabi Sulaiman (wajib semua situs)

Sumber ilham dari Al-Qur'an, tanpa figur makhluk hidup:

- **Ṣarḥ mumarrad min qawārīr** (An-Naml 27:44): lantai kaca yang dikira air.
- **‘Ayn al-qiṭr** (Saba' 34:12): mata air tembaga yang dicairkan.
- **Maḥārīb, jifān kal-jawāb, qudūr rāsiyāt** (Saba' 34:13): ruang-ruang
  tinggi berlengkung, bejana sebesar kolam, dan periuk yang tetap di tempatnya.

Rumus mewah yang dipakai semua situs (implementasinya berbeda per situs):
material (emas, kaca, marmer, tembaga, mutiara), kedalaman cahaya (kilau yang
menyapu, bayangan lembut), ornamen geometris, tipografi serif berkelas, dan
gerak yang tenang dan halus (bukan berkedip). **Tidak ada dua situs yang
berbagi palet, font, ornamen, atau gaya animasi menu.**

| Situs | Ruang istana | Palet | Font judul / isi | Animasi menu khas |
|---|---|---|---|---|
| dawo.es | Salón de cristal sobre el agua | safir, toska, emas pucat | Cormorant Garamond / Manrope | Ubin kaca beriak; kaustik air bergerak di bawah header |
| qkb.es | Fuente de cobre fundido | tembaga, perunggu, krem roti | Playfair Display / Lora | Garis bawah tembaga cair mengalir; uap tipis naik dari menu aktif |
| byodd.es | Arcos de cedro y mármol | marmer gading, kayu cedar, zamrud | Marcellus / Source Sans 3 | Item menu naik menjadi lengkung mihrab; pola zellige berputar pelan |
| jai.lat | Tesoro de la reina de Saba | hitam lak, daun emas | Bodoni Moda / Karla | Sapuan daun emas melintasi menu; kilau koin |
| axto.io | Crystal throne room | obsidian, kristal, cahaya prisma | Syne / Inter Tight | Facet kristal memecah cahaya pelangi saat hover |
| xaa.es | Trono de marfil y oro | gading, platinum, emas | Italiana / Albert Sans | Garis cetak biru berubah menjadi emas saat disentuh |
| axto.us | Lapis library of cedar | lapis lazuli, cedar, emas | Cinzel / Nunito | Menu berupa punggung buku yang miring dan terbuka |
| axto.dev | Brass observatory | biru tengah malam, kuningan | Fraunces / JetBrains Mono | Cincin astrolab berputar; garis rasi bintang saat hover |
| lie.skin | Pearl basins & rosewater | mutiara iridesen, merah muda, perak | DM Serif Display / Figtree | Riak cincin air dari titik sentuh |
| oldco.in | Royal Mint (Taksal) | merah marun, emas tua | Yatra One + Tiro Devanagari / Mukta | Gerigi pinggir koin berputar; lengkung jharokha |
| profity.in | Emerald treasury hall | zamrud, biru merak, emas | Rozha One + Martel / Hind | Tab emas berbalik seperti buku besar |
| 1fr.fr | Galerie des glaces andalouse | biru malam, cermin, emas | (lapisan tenant di apps/web) | Kilau cermin menyapu tab lengkung Moor |
| ulyah.com | Pelataran marmer & kaligrafi emas | marmer gading, zamrud, emas | (lapisan tenant di apps/web) | Garis emas tergores seperti tinta kaligrafi |

---

## 5. Animasi Spanyol juara Piala Dunia 2026 (wajib semua situs)

- Di header: piala emas (SVG) dengan kilau, bola memantul bolak-balik di
  jalurnya, pita **merah–kuning–merah** yang berkibar, dan teks sesuai bahasa
  situs:
  - es: *España, campeona del mundo 2026*
  - en: *Spain — 2026 World Cup champions*
  - fr: *L'Espagne, championne du monde 2026*
  - id: *Spanyol juara Piala Dunia 2026*
  - hi: *स्पेन — विश्व कप 2026 विजेता*
- Sekali per sesi: hujan konfeti emas–merah selama ±2,5 detik, tidak menutupi
  isi, tidak bisa diklik, dan langsung mati dengan `prefers-reduced-motion`.
- Gaya visualnya mengikuti istana tiap situs (§4), jadi tidak ada dua yang
  sama.
- Tanpa skor, nama pemain, atau detail pertandingan, supaya tidak ada fakta
  yang dikarang.

---

## 6. Struktur folder, database & backup (siap dijual)

### Situs baru di repo ulyah.com

```
sites/
  README.md               cara build, deploy, backup, dan jual
  _engine/                generator statis tanpa dependensi (Node 22)
    build.mjs             site.json + content/*.md → dist/
    export.mjs            backup satu langkah → <domain>-backup-<tanggal>.tar.gz
  dawo.es/
    site.json             identitas: domain, bahasa, akun AdSense, menu, kategori
    content/articles/     DATABASE artikel (Markdown + frontmatter)
    content/pages/        halaman wajib (sobre-nosotros, contacto, privacidad, …)
    theme/                CSS + JS milik situs ini saja
    public/               favicon, gambar
    wrangler.jsonc        Worker statis (assets) milik situs ini
  qkb.es/  …  byodd.es/   struktur sama, isi dan tema berbeda total
```

- **Database = folder `content/`.** Tidak ada D1, jadi kuota D1 ulyah tidak
  terbebani dan backup cukup dengan menyalin folder.
- **Backup / jual**: `node sites/_engine/export.mjs dawo.es` menghasilkan satu
  arsip berisi engine, folder situs, dan README cara deploy ke akun Cloudflare
  pembeli.
- Deploy: `.github/workflows/deploy-sites.yml` membangun dan mendeploy setiap
  situs di `sites/` saat ada perubahan. Domain otomatis dipasang begitu
  zonanya ada di akun Cloudflare; sebelum itu situs tetap online di
  `*.workers.dev`.

### Situs yang punya repo sendiri

Satu repo = satu situs (jai, lie, axtodev, oldco.in, profity.in, axto.us,
xaa, guardian-ai). Repo itu sendiri adalah paket jualnya (transfer repo).
Isi artikel ada di `src/content/`. Situs yang memakai D1 (axto.us `axto_db`,
xaa `xaa-portal`, axto.io `axto-db`) dibackup dengan `wrangler d1 export`.

---

## 7. Rencana kerja & status

### Fase 1: kode AdSense, ads.txt, hapus Adsterra, bersihkan artikel mesin

| # | Pekerjaan | Status |
|---|---|---|
| 1.1 | Gabungkan branch `ccr-8cac35c6-6bbbvx` (ads.txt per situs, akun xad.es) ke main | ✅ PR #283 |
| 1.2 | apps/web: akun per tenant (ulyah 8991…, 1fr 5944…); unit manual hanya untuk akun yang sudah ACC | ✅ PR #283 (live setelah deploy berikutnya) |
| 1.3 | quantum: lepaskan xaa.es dari `QUANTUM_DOMAIN` bawaan | ✅ PR #283 |
| 1.4 | jai.lat: akun 4548…, hapus Adsterra | ✅ Jai PR #1, deploy sukses |
| 1.5 | lie.skin: akun 9666…, hapus Adsterra | ✅ Lie PR #1, deploy sukses |
| 1.6 | axto.dev: akun 8469…, hapus Adsterra | ✅ axtodev PR #10, deploy sukses |
| 1.7 | oldco.in: akun 6293…, hapus Adsterra | ✅ oldco.in PR #2, deploy sukses |
| 1.8 | profity.in: akun 6146…, hapus Adsterra | ✅ profity.in PR #1, deploy sukses |
| 1.9 | axto.us: akun 6908…, ads.txt | ✅ axto.us PR #23 + #24 (deploy tahan kuota D1) |
| 1.10 | xaa.es: akun 8991…, ads.txt, hapus Adsterra | ✅ xaa PR #1 + #2 (build tahan gangguan Google Fonts) |
| 1.11 | axto.io: akun 8991…, **buat ads.txt** | ✅ guardian-ai PR #60 (E2E hijau) |
| 1.12 | Matikan bot konten untuk semua situs AdSense | ✅ PR #283 |
| 1.12b | Hapus artikel buatan mesin (judul hampir kembar di oldco.in & profity.in) | 🟡 menunggu keputusan pemilik |
| 1.13 | Audit browser ulang: semua situs menunjuk akun yang benar, nol Adsterra | ❌ |

### Fase 2: tiga situs baru (langsung online)

| # | Pekerjaan | Status |
|---|---|---|
| 2.1 | Engine statis `sites/_engine` + workflow deploy + backup | ✅ build, check, export, deploy-sites.yml |
| 2.2 | dawo.es: tema kaca-air, 40 artikel, halaman wajib, animasi Spanyol | ✅ lulus check (40 artikel, rata-rata 1.400 kata, 8 halaman) |
| 2.3 | qkb.es: tema tembaga, 40 artikel, halaman wajib, animasi Spanyol | ❌ |
| 2.4 | byodd.es: tema cedar-marmer, 40 artikel, halaman wajib, animasi Spanyol | ❌ |
| 2.5 | Domain: zona dawo.es / qkb.es / byodd.es di akun Cloudflare | 🟡 tindakan pemilik |
| 2.6 | xko.es (persiapan, belum ada kode AdSense) | ❌ |
| 2.7 | byodd.de (persiapan, Jerman) | ❌ |
| 2.8 | byoxy.de (persiapan, Jerman) | ❌ |

### Fase 3: desain istana + animasi Spanyol di situs yang sudah ada

| # | Situs | Status |
|---|---|---|
| 3.1 | jai.lat · 3.2 lie.skin · 3.3 axto.dev | ❌ |
| 3.4 oldco.in · 3.5 profity.in | ❌ |
| 3.6 axto.us · 3.7 xaa.es · 3.8 axto.io | ❌ |
| 3.9 ulyah.com · 3.10 1fr.fr (lapisan tenant) | ❌ |

### Fase 4: kelengkapan isi

| # | Pekerjaan | Status |
|---|---|---|
| 4.1 | jai.lat jadi bahasa Spanyol: ≥40 artikel panjang | ❌ |
| 4.2 | xaa.es: bahasa Spanyol sebagai bawaan + panduan setiap menu portal | ❌ |
| 4.3 | axto.io: ≥40 panduan panjang, satu per menu aplikasi | ❌ |
| 4.4 | axto.us: hapus isi yang tidak layak AdSense, perkuat blog orang tua & guru | ❌ |
| 4.5 | Semua situs: halaman wajib lengkap (§1.5) | ❌ |

### Fase 5: setelah AdSense selesai (permintaan pemilik)

| # | Pekerjaan | Status |
|---|---|---|
| 5.1 | Kompres database sampai di bawah 7 GB | ⏸️ |
| 5.2 | Perbaiki "seluruh kitab tidak muncul" di ulyah.com | ⏸️ |

---

## 8. Catatan risiko (dibaca pemilik)

- **Banyak akun AdSense**: kebijakan Google mengizinkan satu akun per orang
  (payee). Akun-akun di file ini harus atas nama orang atau badan yang
  berbeda; kalau tidak, Google bisa menutup semuanya.
- **dawo.es ≠ dawa.es**: file menulis *Dawo.es*. dawa.es sudah di-ACC pada
  akun 6371…, jadi tidak disentuh. dawo.es dibuat sebagai situs baru.
- **Domain baru belum ada di Cloudflare** (DNS tidak resolve). Situs tetap
  online di workers.dev. Domain terpasang otomatis setelah pemilik menambahkan
  zonanya di dasbor Cloudflare dan mengarahkan nameserver-nya.
- **Persetujuan cookie Uni Eropa** (.es, .fr): nyalakan pesan GDPR di AdSense
  → *Privacidad y mensajes*. Tidak perlu kode tambahan.
- **R2 masih mati** di akun ulyah. Situs statis baru tidak membutuhkannya.
- **Kuota baca D1 harian** masih sering habis (kode 7500). Deploy penuh
  ulyah.com bisa gagal di langkah D1 pertama; deploy situs statis tidak
  terpengaruh.
- Tidak ada yang bisa menjamin ACC 100%. Yang bisa dijamin adalah semua syarat
  yang tertulis di kebijakan AdSense terpenuhi.

---

## 9. Log permintaan

| Tanggal | Permintaan | Status |
|---|---|---|
| 27 Sep | Ganti kode AdSense semua situs di file; buat situs yang belum ada; niche sesuai kepanjangan; ≥40 artikel panjang; menu & halaman wajib; bahasa sesuai ekstensi; folder rapi & mudah dibackup/dijual; worker langsung online | 🔄 |
| 27 Sep | Hapus semua slot Adsterra di mana pun | 🔄 |
| 27 Sep | CSS super mewah, menu penuh animasi, tidak sama dengan situs lain, konsep di blueprint | 🔄 (§4) |
| 27 Sep | axto.us jadi situs pengajuan AdSense, hapus isi yang tidak layak | ❌ |
| 27 Sep | Semua situs: animasi Spanyol juara Piala Dunia 2026 + CSS mewah ala istana Nabi Sulaiman | 🔄 (§4, §5) |
| 3 Okt | File AdSense terbaru: ulyah.com, axto.io, xaa.es ikut (akun 8991…) | 🔄 |
| 3 Okt | axto.io & xaa.es: kalau artikel kurang, jelaskan semua menu tiap aplikasi | ❌ |
| 3 Okt | axto.io ada di repo guardian-ai; cek repo yang benar dan cocokkan dengan isi di browser | ✅ §2 |
| 4 Okt | Perbaiki deploy yang gagal (axto.us: kuota D1; xaa.es: Google Fonts) | ✅ |
| 4 Okt | Buat juga xko.es, byodd.de, byoxy.de (belum ada kode AdSense, untuk persiapan) | 🔄 |
| 4 Okt | xaa.es isinya studio web, bukan karoseri | ✅ dikonfirmasi; quantum tidak lagi memakai xaa.es |
| nanti | Kompres database < 7 GB; perbaiki kitab tidak muncul | ⏸️ |
