# Blueprint Pengajuan AdSense — Seluruh Ekosistem

Dokumen induk untuk semua situs yang diajukan ke AdSense. **Setiap permintaan
baru dicatat di sini dulu**, lalu statusnya diperbarui setelah diuji.
Kontrol pusatnya ada di repo `ulyah.com`; situs yang punya repo sendiri tetap
dicatat di sini.

Terakhir diperbarui: 6 Oktober 2026 (Fase 7: 27 situs mewah menyeluruh, setiap artikel ≥1.500 kata, setiap situs ≥40 artikel; merge & deploy dikerjakan sendiri).

Arti tanda: ✅ selesai dan lulus uji · 🟡 selesai, butuh tindakan manual atau
belum diuji penuh · 🔄 sedang dikerjakan · ❌ belum dikerjakan · ⏸️ ditunda

---

## 1. Aturan tetap (wajib, semua situs)

1. **Satu situs, satu bahasa, sesuai ekstensi domain**: `.es` dan `.lat` →
   Spanyol, `.fr` → Prancis, `.in` → Hindi + Inggris (bilingual yang sudah
   ada), `.com` (ulyah) → Indonesia, `.io` `.us` `.dev` `.skin` → Inggris.
   **Pengecualian (keputusan pemilik 4 Okt):** jai.lat tetap **Inggris** dengan
   72 artikel tulisan tangannya, ditambah desk **"En español"** berisi 10 artikel
   Spanyol (`lang="es"` per halaman).
2. **AdSense saja.** Tidak ada Adsterra, popunder, social bar, atau jaringan
   iklan lain di situs mana pun. Setiap situs memuat persis tiga hal dari
   **satu akun yang sama, `ca-pub-5693981744147503`** (sejak 4 Okt 2026,
   "jadi 1 akun saja"): script `adsbygoogle.js?client=…` di `<head>`, meta
   `google-adsense-account`, dan `/ads.txt`. Tidak ada pengaturan iklan yang
   bisa mematikannya.
3. **Tidak ada slot iklan manual di situs mana pun — Auto ads saja.**
   Pemilik, 4 Okt 2026: "Hapus aja dan bersihkan slot AdSense nya di website
   manapun karena sy bikin otomatis (ingat kecuali dawa.es), cukup cuplikan
   AdSense, ads.txt & tag meta" dan "27 situs ini masih pengajuan, bahkan baru
   input ulang kode AdSense nya". Jadi tidak ada `<ins class="adsbygoogle">`,
   `data-ad-slot` atau `adsbygoogle.push` di kode mana pun. Setelah sebuah
   situs di-ACC, Auto ads dinyalakan dari dasbor AdSense (Iklan → Menurut
   situs) tanpa mengubah kode. Dijaga otomatis: `scripts/check-ads.ts` (CI
   apps/web + situs statis), `sites/_engine/check.mjs` (setiap halaman hasil
   build), dan `scripts/site-audit.mjs` (HTML server situs yang live).
   **Pengecualian satu-satunya: dawa.es** (pemilik, 12 Okt: "Adslot manual
   jika itu milik adsense biarkan, dan biarkan otomatis"). Build tenant dawa
   membawa dua unit akun aslinya (banner 4702981509, flex 1209764526,
   ca-pub-6371903555702163) lewat `AdSlot` + `PageAds`, ditambah Auto ads.
   Gerbangnya `SHOWS_AD_UNITS = TENANT.id === "dawa" && AD_CLIENT_ID ===
   ORIGINAL_ACCOUNT`; `check-ads.ts` menghitungnya per tenant (empat situs
   pemilik harus `false`) dan menolak markup unit di file lain. Unit tidak
   pernah tampil di halaman yang dilarang kebijakan AdSense: masuk/daftar/akun,
   donasi, admin, halaman anak (`/ninos`, `/peliculas-infantiles`), 404,
   kiblat, mushaf (`apps/web/src/lib/ad-pages.ts`). Unit tidak disisipkan di
   atas bagian yang sedang dibaca, label "Publicidad" selalu tampil (juga untuk
   iklan yang terisi terlambat), dan tidak ada penghitung klik.
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
11. **dawa.es bukan milik pemilik lagi dan sudah DILEPAS** (lihat §10). Kode
    AdSense, ads.txt, meta, isi, traffic, Ad Manager: dawa.es dikecualikan
    dari SEMUA perubahan dan dari semua sistem otomatis, dan tidak lagi
    tersambung ke ekosistem ulyah.com.
12. **Ad Manager + AI otomatis** mengikuti `docs/ADMANAGER-BLUEPRINT.md`:
    hanya bekerja di situs yang sudah di-approve AdSense, aturan tetap
    (deterministik), semua laporan tampil di admin ulyah.com.
13. **Tanpa agent: semua perbaikan dikerjakan manual.** Setiap perbaikan kode,
    penulisan dan perpanjangan artikel, audit, dan pengecekan dikerjakan
    langsung oleh Claude di sesi kerja itu sendiri, langkah demi langkah.
    Tidak boleh memakai agent AI untuk perbaikan atau penulisan: tidak ada
    subagent (Agent/Task), sesi Claude paralel, maupun bot penulis otomatis.
    Workflow CI (build, cek, deploy) tetap dipakai karena hanya memeriksa dan
    memasang, bukan memperbaiki atau menulis. Pemilik, 12 Okt 2026: „Jgn
    pernah perbaikan menggunakan agent, kerjakan manual aja, catat di
    blueprint agar tidak menggunakan agent“ (sebelumnya juga: „jgn gunakan
    agent, anda saja yg menulis“).
14. **Perubahan kode AdSense selalu didahulukan sampai live.** Setiap perintah
    mengubah kode AdSense (situs mana pun, repo mana pun) dikerjakan lebih dulu
    dari pekerjaan lain dan tidak berhenti di PR: ads.txt, tag meta dan cuplikan
    loader diubah, PR di-merge setelah CI hijau, deploy selesai, lalu audit live
    (`site-audit.yml`) harus menunjukkan domain itu **OK** dengan kode barunya.
    Laporan ke pemilik selalu memuat cuplikan adsense, tag meta dan baris
    ads.txt-nya. Pemilik, 28 Okt 2026: „Ingat, selalu dahulukan sampe live dulu
    kode adsense, ads.txt, cuplikan adsense dan tag meta“ (dan „selalu buatkan
    cuplikan adsense dan tag metanya“; sebelumnya 13 Okt: „Utamakan jalankan
    perintah ubah kode adsense dulu“).

---

## 2. Peta situs (hasil cek repo + browser, 4 Okt 2026)

Kolom "Live" berisi hasil audit Chromium sungguhan dari GitHub Actions
(`.github/workflows/site-audit.yml`), karena container kerja tidak bisa
membuka domain-domain ini. Kolom akun adalah keadaan 4 Okt; kode yang berlaku
sekarang untuk setiap domain ada di `docs/ADSENSE-CODES.md` (§13.1 untuk
perubahan 17–20 Okt).

| Domain | Akun AdSense (satu akun) | Repo / lokasi kode | Worker | Bahasa | Live sekarang |
|---|---|---|---|---|---|
| ulyah.com | ca-pub-5693981744147503 | `ulyah.com` · apps/web (tenant `ulyah`) | ulyah-web | id | 200 · akun lama 6371… · tanpa Adsterra |
| 1fr.fr | ca-pub-5693981744147503 | `ulyah.com` · apps/web (tenant `1fr`) | onefaith-web | fr | 200 |
| tilawa.de | ca-pub-5693981744147503 | `ulyah.com` · apps/web (tenant `tilawa`) | tilawa-web | de | 200 |
| axto.io | ca-pub-5693981744147503 | `guardian-ai` · `dashboard/` (Cloudflare Pages) | axto-dashboard | en | 200 · akun lama 6371… · **ads.txt 404** |
| xaa.es | ca-pub-5693981744147503 | `xaa` (studio web + portal klien) | xaa-es | en → **es** | 200 · akun lama 6371… · home tanpa artikel |
| axto.us | ca-pub-5693981744147503 | `axto.us` (perpustakaan cerita anak + blog) | axto-us | en | 200 · akun lama 6371… |
| axto.dev | ca-pub-2493615451319531 | `axtodev` | axto-dev | en | akun sendiri sejak 12 Okt 2026 (sebelumnya 5693981744147503) |
| jai.lat | ca-pub-5693981744147503 | `jai` | jai-lat | en → **es** | 200 · **Adsterra aktif** · 77 artikel (Inggris) |
| lie.skin | ca-pub-4548005919629272 | `Lie` | lie-skin | en | akun sendiri sejak 12 Okt 2026 (sebelumnya 5693981744147503) |
| oldco.in | ca-pub-6293576511807510 | `oldco.in` | oldco-in | hi + en | 200 · **Adsterra aktif** · judul mesin dobel |
| profity.in | ca-pub-2493615451319531 | `profity.in` | profity-in | hi + en | 200 · **Adsterra aktif** · judul mesin dobel |
| dawo.es | ca-pub-5693981744147503 | **baru** → `ulyah.com/sites/dawo.es` | dawo-es | es | **belum ada** (DNS tidak resolve) |
| qkb.es | ca-pub-5693981744147503 | **baru** → `ulyah.com/sites/qkb.es` | qkb-es | es | **belum ada** (DNS tidak resolve) |
| byodd.de | ca-pub-5693981744147503 | **baru** → `ulyah.com/sites/byodd.de` | byodd-de | de | belum ada |
| xko.es | ca-pub-5693981744147503 | **baru** → `ulyah.com/sites/xko.es` | xko-es | es | belum ada |
| byoxy.de | ca-pub-6146217038829045 | **baru** → `ulyah.com/sites/byoxy.de` | byoxy-de | de | belum ada |

> **Koreksi pemilik (4 Okt):** situsnya **byodd.de**, bukan byodd.es. Kode
> 2228462932360966 milik byodd.de. **byodd.es tidak dibuat.** Meta tag
> `google-adsense-account`, script loader dan ads.txt dibuat otomatis oleh
> engine dari kolom `adsense` di `site.json`. Pemilik cukup memberi nomor pub.

**4 Okt 2026, satu akun:** semua domain di tabel ini, ditambah **xad.es**,
memakai `ca-pub-5693981744147503` (xad.es pindah lagi ke akunnya sendiri,
`ca-pub-5517446616694631`, pada 11 Okt — lihat `docs/ADSENSE-CODES.md`). **dawa.es tetap 6371903555702163 dan tidak
disentuh**, karena bukan milik pemilik lagi. Sebelumnya: xad.es 2493…, 1fr.fr 5944…,
ulyah.com/tilawa.de/axto.io/xaa.es 8991…, dan akun per situs lainnya. Semuanya
sudah diganti; lihat `docs/ADSENSE-CODES.md`.

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

### Aturan niche SEO (permintaan pemilik 4 Okt: "niche kuat & banyak, bukan sampah")

1. **Satu situs = satu niche evergreen yang dicari orang setiap bulan**, dalam
   bahasa domainnya. Tidak ada artikel di luar niche.
2. **Kluster topik:** 5–6 kategori; tiap kategori punya 1 artikel pilar
   (panduan lengkap) dan 5–8 artikel turunan yang saling menautkan.
3. **Satu artikel = satu maksud pencarian** (cara membuat X, X vs Y, kesalahan
   X, berapa/kapan/berapa lama X). Judul memuat kata kunci utama secara alami.
4. **Tidak ada konten sampah:** tidak ada judul kembar, tidak ada artikel
   tipis (minimal 1.200 kata, rata-rata ≥1.400), tidak ada parafrase mesin,
   fakta dicek, keselamatan/kesehatan/keuangan ditulis hati-hati (YMYL), tanpa
   janji palsu.
5. **Ruang tumbuh:** setiap niche dipilih supaya bisa berkembang ke ratusan
   artikel tanpa keluar topik.

| Situs | Kluster (kategori) | Contoh kata kunci kuat |
|---|---|---|
| dawo.es | correr · pádel · fútbol · fuerza y movilidad · descanso y nutrición · ocio activo | plan para correr 5 km, cómo elegir pala de pádel |
| qkb.es | quesos caseros · kéfir y fermentados · masa madre y pan · bollería · conservas · técnica | cómo hacer queso fresco, masa madre desde cero, roscón casero |
| xko.es | factura de la luz · potencia y tarifas · autoconsumo solar · aislamiento · climatización · electrodomésticos | cómo bajar la factura de la luz, qué potencia contratar, placas solares cuánto ahorro |
| byodd.de | Werkzeug · Wand & Boden · Holz · Bad & Küche · Dekoration · Reparaturen | Wand streichen Anleitung, Laminat verlegen, Dübel richtig setzen |
| byoxy.de | Zimmerpflanzen · Pflege · Schädlinge · Balkon · Kräuter · Vermehrung | Monstera Pflege, Trauermücken loswerden, Kräuter auf dem Balkon |

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
| byodd.de | Zedernhalle mit Marmorbögen | marmer gading, kayu cedar, zamrud | Marcellus / Source Sans 3 | Item menu naik menjadi lengkung mihrab; pola ubin berputar pelan |
| xko.es | Sala del sol de ámbar | ámbar, kobalt, perak | Spectral / Outfit | Percikan arus berlari di kabel emas bawah menu; bohlam menyala saat hover |
| byoxy.de | Hängende Gärten | giok, lumut, emas | Gloock / Instrument Sans | Daun membuka di bawah item menu; embun berkilau saat hover |
| jai.lat | Tesoro de la reina de Saba | hitam lak, daun emas | Bodoni Moda / Karla | Sapuan daun emas melintasi menu; kilau koin |
| axto.io | Crystal throne room | obsidian, kristal, cahaya prisma | Syne / Inter Tight | Facet kristal memecah cahaya pelangi saat hover |
| xaa.es | — *(dikecualikan)* | **tetap biru bisnis** (putih, biru, slate) | Plus Jakarta Sans / Inter | — · Pemilik 4 Okt: "warna xaa.es ga nyambung, xaa.es tetep bisnis app" |
| axto.us | Lapis library of cedar | lapis lazuli, cedar, emas | Cinzel / Nunito | Menu berupa punggung buku yang miring dan terbuka |
| axto.dev | Brass observatory | biru tengah malam, kuningan | Fraunces / JetBrains Mono | Cincin astrolab berputar; garis rasi bintang saat hover |
| lie.skin | Pearl basins & rosewater | mutiara iridesen, merah muda, perak | DM Serif Display / Figtree | Riak cincin air dari titik sentuh |
| oldco.in | Royal Mint (Taksal) | merah marun, emas tua | Yatra One + Tiro Devanagari / Mukta | Gerigi pinggir koin berputar; lengkung jharokha |
| profity.in | Emerald treasury hall | zamrud, biru merak, emas | Rozha One + Martel / Hind | Tab emas berbalik seperti buku besar |
| 1fr.fr | Galerie des glaces andalouse | biru malam, cermin, emas | (lapisan tenant di apps/web) | Kilau cermin menyapu tab lengkung Moor |
| ulyah.com | Pelataran marmer & kaligrafi emas | marmer gading, zamrud, emas | (lapisan tenant di apps/web) | Garis emas tergores seperti tinta kaligrafi |
| zuvik.de | Hof der Granatäpfel (halaman rumah delima) | merah delima, safran, pasir | Young Serif / Mulish | Menu berupa jendela rumah yang menyala; biji delima jatuh saat perayaan juara |
| zavik.de | Löwenstufen (enam anak tangga takhta gading) | ungu malam, amber, gading, batu bulan | Libre Caslon Display / Work Sans | Menu berupa anak tangga; sepasang mata kucing membuka dengan kedipan pelan; jejak kaki merah-emas saat perayaan juara |
| rubiy.de | Die königliche Speisekammer (1 Raj 4:22) | merah bit, tembaga, madu, sage, krem | Prata / Lexend | Menu = toples; tutup berputar & isi warna musim naik dari bawah; ristra paprika-lemon Spanyol |
| byoy.de | Kebun anggur Baal-Hamon (Kid 8:11) | hijau anggur, ungu anggur, terakota, gading kapur | Alegreya / Alegreya Sans | Sulur anggur tumbuh & daun membuka di bawah menu; untaian tomat merah-kuning |
| qurm.de | Menara di Libanon (Kid 7:5) | granit, hijau aras, aprikot fajar, salju | Zilla Slab / IBM Plex Sans | Menu = papan penunjuk jalur yang miring + profil ketinggian tergambar; bendera puncak Spanyol |
| qarf.de | Karavan rempah Ratu Saba (1 Raj 10:10) | espreso, kapulaga, saffron, porselen, nila | Gilda Display / Jost | Menu = gelas teh terisi amber + uap naik; biji kopi merah-kuning |
| zufiq.de | Rumah tanpa bunyi palu (1 Raj 6:7) | batu kapur, tinta, zaitun, emas lembut | EB Garamond / Red Hat Text | Garis cahaya emas tergambar pelan di atas ubin batu; pita merah-emas pelan |
| zevok.de | Laut tembaga (1 Raj 7:23) | perunggu, aqua, linen, navy | Petrona / Urbanist | Air naik bergelombang + gelembung di menu; gelembung sabun merah-kuning |
| zolun.de | Kapal-kapal Tarsis (1 Raj 10:22) | laut dalam, pasir, koral senja, kuningan | Old Standard TT / Sora | Jarum kompas berayun + rute titik tergambar; panji sinyal kapal Spanyol |
| qulen.de | Hati yang mendengar (1 Raj 3:9) | teal malam, perkamen, tinta vermilion, emas | Crimson Pro / Atkinson Hyperlegible | Tab buku catatan + garis tinta tulisan tangan + bintang emas; pesawat kertas merah-kuning |
| rough.es | Taller del lapidario (1 Raj 5:17, batu pahat mahal) | hijau hutan gelap, gading, arang, emas sampanye | Bodoni Moda / Figtree | Garis faset permata tergambar di bawah menu; kristal kasar berubah jadi permata potong; konfeti faset rubi-emas |
| rough.lat | Delima Yakhin & Boas (1 Raj 7:18–20) | gading terang, zamrud, perunggu, emas, merah garnet | Cinzel / Hanken Grotesk | Lima biji delima muncul berurutan di bawah menu; dua pilar perunggu bermahkota delima; konfeti biji delima merah-kuning |
| dai.lat | Rumah Hutan Libanon (1 Raj 7:2, tiang aras) | putih kapur, kayu aras, terakota, zaitun, kuningan | Fraunces / Inter Tight | Barisan tiang aras naik di belakang menu; kolonade dengan sinar matahari bergerak; konfeti ubin azulejo |
| pab.lat | Tadmor di padang gurun (1 Raj 9:18) | indigo malam, pasir, pirus, koral senja, hijau palem | DM Serif Display / Albert Sans | Cap paspor berputar masuk saat hover; oasis Palmyra dengan matahari terbit; konfeti cap paspor merah-emas |

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
  qkb.es/  …  byodd.de/   struktur sama, isi dan tema berbeda total
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
Isi artikel ada di `src/content/`. Situs yang memakai D1 (xaa `xaa-portal`,
axto.io `axto-db`) dibackup dengan `wrangler d1 export`.

- **axto.us** (4 Okt) kini situs statis dengan engine yang sama
  (`sites/_engine` + `sites/axto.us` di repo axto.us). Tidak ada database
  lagi: clone repo = backup lengkap. Aplikasi Next lama tersimpan di riwayat
  git (commit `285db80`); D1 `axto_db` dan KV lama dibiarkan di akun
  Cloudflare, tidak dihapus.

### Aturan backup (permintaan pemilik 4 Okt)

"Semua website harus mudah dibackup beserta databasenya; kalau dijual
tinggal dikeluarkan." Berlaku untuk semua situs **kecuali ulyah.com, xaa.es
dan axto.io** (milik pribadi, dikerjakan belakangan).

- Situs statis (`sites/<domain>`, axto.us): isinya sudah berupa file;
  `node sites/_engine/export.mjs <domain>` membuat satu arsip siap jual.
- Situs repo sendiri yang memakai D1/KV: tambahkan workflow backup
  (`wrangler d1 export` → artifact) dan dokumen serah terima. 🔄 tugas
  berikutnya setelah situs-situs baru.

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
| 2.3 | qkb.es: tema tembaga, 40 artikel, halaman wajib, animasi Spanyol | ✅ lulus check (40 artikel, rata-rata 1.408 kata, 8 halaman) |
| 2.4 | byodd.de (akun 2228…, Jerman): tema cedar-marmer, 40 artikel, halaman wajib (Impressum dll.), animasi Spanyol | ✅ lulus check (40 anleitungen, 9 halaman, tema "Zedernhalle", pita Zollstock Spanyol). Impressum masih tanpa nama & alamat asli pemilik |
| 2.5 | Domain: zona dawo.es / qkb.es / xko.es / byodd.de / byoxy.de di akun Cloudflare | 🟡 tindakan pemilik |
| 2.6 | xko.es (akun 6560…): tema ámbar, 40 artikel | ✅ PR #292, live |
| 2.7 | ~~byodd.es~~ dibatalkan: domain yang benar byodd.de (2.4) | ➖ |
| 2.8 | byoxy.de (akun 6701…, Jerman): tema taman gantung, 40 artikel | ✅ lulus check (40 Ratgeber, 9 halaman termasuk Pflanzensicherheit, tema "Hängende Gärten", pita Blumenkasten Spanyol, rata-rata 1.195 kata). Impressum masih tanpa nama & alamat asli pemilik |

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
| 4.4 | axto.us: hapus isi yang tidak layak AdSense, perkuat blog orang tua & guru | ✅ dirombak total jadi situs statis bahasa Inggris: 40 panduan membaca (rata-rata 1.420 kata), tema "perpustakaan lapis", axto.us PR #26 |
| 4.5 | Semua situs: halaman wajib lengkap (§1.5) | ✅ apps/web PR #289, repo partner, axto.us #26 (Impressum tilawa.de menunggu data pemilik) |

### Catatan panjang artikel bahasa Jerman

Kata Jerman lebih panjang, jadi isi yang sama memakai sekitar 10–15 % lebih
sedikit kata dibanding bahasa Inggris. `check.mjs` karena itu memakai batas
× 0,85 untuk situs `de`: minimal 1.020 kata per artikel dan rata-rata 1.190.
Spanyol dan Inggris tetap memakai 1.200 / 1.400.

### Fase 6: 10 domain .de baru (4 Okt) — DIKERJAKAN NANTI

Permintaan pemilik: "Yg 10 terbaru nanti aja, kerjain yg lain dulu."

- Domain: byoy.de, qarf.de, qulen.de, qurm.de, rubiy.de, zavik.de, zevok.de,
  zolun.de, zufiq.de, zuvik.de. Belum terhubung ke Cloudflare → deploy dulu
  sebagai Worker (`*.workers.dev`); domain terpasang otomatis begitu
  zonanya ada.
- **Satu akun AdSense untuk kesepuluhnya: ca-pub-5693981744147503** (kode
  lengkap di `docs/ADSENSE-CODES.md`).
- **Dua bahasa: Jerman (utama, di `/`) dan Inggris (di `/en/`)**, dengan
  hreflang di setiap halaman. Engine perlu mode dua bahasa (`editions`).
- Niche beragam, **bukan selalu teknologi**:
  - cerita rumah tangga fiktif di domain yang kepanjangannya cocok dengan
    bahasa Jerman;
  - cerita fiktif pelajar yang membangkitkan semangat;
  - sisanya niche evergreen berbahasa Jerman dengan SEO kuat.
- ~~Target 1.000 artikel~~ → **Koreksi pemilik 4 Okt: "Yg 10 situs terakhir 40 artikel aja, buat persyaratan adsense"** — cukup 40 artikel per situs.
- Setiap situs: tema istana unik, animasi Spanyol 2026 dan semua halaman
  wajib DE/EN.
- **Impressum** (§ 5 DDG) butuh nama dan alamat asli pemilik. Tidak boleh
  dikarang; minta ke pemilik sebelum domain dipasang.

Status per situs:

- **zuvik.de ✅ selesai (4 Okt):** 40 cerita keluarga ditulis tangan
  (rata-rata ±1.300 kata, terpendek 1.079), 6 kategori, 8 halaman wajib,
  tema "Hof der Granatäpfel", animasi Spanyol 2026. Edisi Jerman dulu;
  edisi Inggris (`/en/`) menyusul setelah kesepuluh situs punya 40 artikel
  Jerman. Impressum belum berisi nama/alamat asli (menunggu data pemilik).
- **zavik.de ✅ selesai (5 Okt):** panduan kucing, 40 artikel tulisan tangan
  (rata-rata ±1.300 kata), 6 tema, 9 halaman wajib + "Notfall & Tierarzt",
  tema "Löwenstufen".
- **Impressum (keputusan pemilik 5 Okt):** "pake p2nshooter" — penerbit di
  Impressum/Über uns = **p2nshooter** + email situs, sama seperti ulyah.com
  dan xaa.es (hanya merek + email). Tidak memakai orang/alamat palsu.
  Catatan risiko: hukum Jerman (§ 5 DDG) idealnya meminta nama & alamat asli.
- **5 Okt (malam) — permintaan pemilik: "Cari sudah sampai mana progres website baru untuk pengajuan AdSense .de … lanjutkan kalau belum selesai, kalau sudah selesai langsung deploy, perhatikan cuplikan AdSense, ads.txt dan tag metanya. Khususnya yang masih kuning"** (status AdSense *Membutuhkan peninjauan*: zavik, rubiy, byoy, qurm, qarf, zufiq, zevok, zolun, qulen).
  Progres saat dicek: zavik.de ✅ live di domainnya (ads.txt 5693… benar) — tinggal *Verifikasi → Minta peninjauan* di AdSense. Agen paralel sebelumnya berhenti karena batas sesi; hasilnya ada di branch `claude/rubiy-de` (24 artikel), `claude/qurm-de` (18), `claude/byoy-de` (11), `claude/qarf-de` (9), lengkap dengan tema + halaman wajib. zufiq, zevok, zolun, qulen belum dimulai.
  Rencana: gabungkan keempat branch, tulis sisa artikel (40 per situs, tulisan tangan, ≥1.020 kata), bangun 4 situs baru dengan tema §4 masing-masing, lulus `check.mjs` (loader + meta + ads.txt `ca-pub-5693981744147503`, Auto ads saja), uji browser desktop + mobile, lalu merge ke main → `deploy-sites.yml` mendeploy dan memasang domain.
- **5 Okt — permintaan pemilik: "Kerjakan secara bersamaan sisa web … tetep unik, tidak ada duplikat, tetep mewah"** → 8 situs dikerjakan paralel (satu agen per situs), masing-masing konsep, palet, font, animasi menu dan motif Spanyol sendiri (lihat tabel §4). Topik dijaga tidak tumpang tindih: byoy = kebun luar ruang (byoxy = tanaman hias/balkon/kräuter), zolun = liburan tanpa panduan jalur (qurm = hiking), zufiq ≠ zevok (ketenangan vs. bersih-bersih), qulen = cerita belajar (zuvik = cerita keluarga).

Usulan niche (belum final):

| Domain | Kepanjangan / kesan | Niche |
|---|---|---|
| zuvik.de | **ZU**hause, **VI**el **K**inderlachen | Cerita rumah tangga fiktif (keluarga, Alltag) |
| qulen.de | **QU**elle des **LE**r**N**ens | Cerita fiktif pelajar yang memotivasi + tips belajar |
| byoy.de | „bio“ | Kebun organik, balkon, kompos |
| qarf.de | — | Kopi & teh (Zubereitung, Bohnen) |
| qurm.de | „Turm“ / pemandangan | Wandern & jalur gunung di Jerman |
| rubiy.de | „Rübe“ | Masakan musiman (saisonal kochen) |
| zavik.de | — | Kucing (Katzen-Ratgeber) |
| zevok.de | — | Tips rumah tangga: bersih-bersih, noda, cucian |
| zolun.de | „Sonne“ | Liburan di Jerman (Nord-/Ostsee, Städtereisen) |
| zufiq.de | „zufrieden“ | Hidup tenang: kebiasaan, keteraturan, minimalisme |

### Fase 7: 27 situs — mewah menyeluruh, ≥1.500 kata, ≥40 artikel (6 Okt)

Permintaan pemilik (6 Okt, kata per kata):

1. "27 web, CSS-nya bikin yang mewah semua websitenya, kaya istana raja Nabi Sulaiman, mewahnya menyeluruh bukan index-nya aja, font, style, posisi dll mewah semua"
2. "Kerjain semuanya merge & PR, saya kasih izin semua"
3. "Min 1500 kata ya, merge & PR dari sisi Anda, saya berikan izin seluruh aksesnya"
4. "Tambahin semua yang kurang dari 1500 kata, dan yang kurang dari 40 artikel"
5. "Sudah saya merge manual tapi masih belum tampil, tolong Anda saja yang mengerjakan seluruhnya sampai selesai, jangan ada campur tangan saya"

27 situs = 17 situs di audit live (ulyah.com, 1fr.fr, tilawa.de, axto.io, xaa.es,
axto.us, axto.dev, jai.lat, lie.skin, oldco.in, profity.in, dawo.es, qkb.es,
xko.es, byodd.de, byoxy.de, xad.es) + 10 domain .de Fase 6 (byoy, qarf, qulen,
qurm, rubiy, zavik, zevok, zolun, zufiq, zuvik). dawa.es tetap tidak disentuh.

Aturan baru:

- **Setiap artikel ≥1.500 kata** (semua bahasa; untuk situs dwibahasa hi+en,
  versi Inggris juga ≥1.500). Penambahan berupa bagian baru yang benar-benar
  berguna (contoh, langkah, tabel, kesalahan umum, FAQ), bukan pengisi; tetap
  tanpa angka, harga, kutipan, atau studi karangan; tidak menyalin artikel lain.
  `check.mjs` dinaikkan ke 1.500 per artikel setelah semua situs lulus.
- **Setiap situs ≥40 artikel** (zufiq, zevok, zolun, qulen 40 masing-masing;
  xad.es dari 12 → 40; blog axto.io diperpanjang).
- **Mewah menyeluruh:** bukan hanya beranda — halaman artikel, kategori,
  halaman wajib (Impressum dsb.), 404, header, footer, tabel, kutipan, daftar
  isi, tombol, formulir; font berkelas, jarak & posisi rapi, ornamen istana
  §4, animasi halus + `prefers-reduced-motion`. xaa.es tetap gaya bisnis biru
  (keputusan 4 Okt) dan jai.lat tetap desain Saba (keputusan 4 Okt), keduanya
  dipoles tanpa diganti.
- **Merge & deploy oleh Claude** (izin pemilik 6 Okt): PR per repo, CI hijau,
  merge, cek deploy + domain.

Temuan 6 Okt: PR #304 sudah di-merge pemilik (04:15 UTC); `deploy-sites.yml`
sukses dan memasang domain (log: "Attached qarf.de → qarf-de", juga www) untuk
byoy, qarf, qurm, rubiy, zavik, zuvik, byodd, byoxy, dawo, qkb, xko. Smoke test
lama hanya memeriksa alamat workers.dev → sekarang juga memeriksa domain asli.
Status kuning di AdSense hanya berubah setelah *Verifikasi → Minta peninjauan*
di akun AdSense (di luar jangkauan Claude).

| # | Pekerjaan | Status |
|---|---|---|
| 7.1 | Statis ulyah.com/sites (11 situs) + axto.us: ±450 artikel ditambah ke ≥1.500 kata | 🔄 |
| 7.2 | zufiq, zevok, zolun, qulen: 40 artikel ≥1.500 kata + halaman wajib + tema (PRIORITAS pemilik 6 Okt; zufiq = ca-pub-6146217038829045, zevok = ca-pub-5944786950535069) | 🔄 |
| 7.3 | oldco.in & profity.in (hi+en, 116 artikel), jai.lat (8 artikel es), axto.io (40 posting blog), xad.es (+28 artikel) | 🔄 |
| 7.4 | Audit & perombakan desain mewah semua halaman, 27 situs (desktop + mobile, tanpa error konsol) | 🔄 |
| 7.5 | `check.mjs` minimal 1.500 kata; smoke test domain asli; audit live 27 situs | 🔄 |
| 7.6 | PR + merge semua repo, deploy terverifikasi | 🔄 |

### Fase 5: setelah AdSense selesai (permintaan pemilik)

| # | Pekerjaan | Status |
|---|---|---|
| 5.1 | Kompres database sampai di bawah 7 GB | ⏸️ |
| 5.2 | Perbaiki "seluruh kitab tidak muncul" di ulyah.com | 🟡 PR #303 (kitab dari file statis; cek live setelah deploy) |

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
| 6 Okt (urgent) | "Ganti kode AdSense rubiy.de" ke ca-pub-2493615451319531 (cuplikan + ads.txt dari pemilik), "tolong buatin tag meta-nya", selesaikan sampai PR & merge | ✅ site.json + ADSENSE.txt (tag meta `<meta name="google-adsense-account" content="ca-pub-2493615451319531">`), ADSENSE-CODES.md, audit live; check.mjs: 57 halaman membawa meta + loader, ads.txt benar |
| 6 Okt (urgent) | "Ganti semua kode AdSense domain di bawah ini termasuk meta tag-nya, jangan otomatis, lihat domain .de yang sudah diotorisasi, termasuk domain yang belum dibuatkan website" — zufiq.de 6146217038829045, zevok.de 5944786950535069, byodd.de 2228462932360966, qulen.de 7516944260248026, dawo.es 6019445914743449, zolun.de 4548005919629272, axto.dev 8469557036744946; dan "situs masih banyak yang belum diotorisasi, mungkin ads.txt-nya belum masuk" | ✅ kode diganti (site.json + ADSENSE.txt; axto.dev: lib/site.ts + public/ads.txt); penempatan sama persis dengan byoxy.de yang sudah diotorisasi (meta + loader di `<head>`, ads.txt di root); situs draft kini ikut online (noindex) supaya domainnya langsung punya cuplikan, meta & ads.txt; job diagnosis ads.txt (http/https/www, user-agent Google, setelan zona Cloudflare) |
| 6 Okt | "Fokus kerjain web yang belum selesai; zufiq.de pakai ca-pub-6146217038829045, zevok.de pakai ca-pub-5944786950535069" (cuplikan, ads.txt, tag meta dari pemilik) | ✅ site.json + ADSENSE.txt kedua situs, ADSENSE-CODES.md, audit live; prioritas: zufiq, zevok, zolun, qulen dulu, baru penambahan artikel situs lain |
| 6 Okt | "27 web, CSS mewah semua kaya istana Nabi Sulaiman, menyeluruh bukan index-nya aja, font, style, posisi" | 🔄 Fase 7 (7.4) |
| 6 Okt | "Min 1500 kata; tambahin semua yang kurang dari 1500 kata dan yang kurang dari 40 artikel" | 🔄 Fase 7 (7.1–7.3, 7.5) |
| 6 Okt | "Kerjain semuanya, merge & PR dari sisi Anda, saya kasih izin semua … jangan ada campur tangan saya" | 🔄 Fase 7 (7.6) |
| 6 Okt | "Sudah saya merge manual tapi masih belum tampil" | 🔄 deploy main sukses + domain terpasang; smoke test domain asli ditambahkan; minta peninjauan AdSense tetap dari akun pemilik |
| 27 Sep | Ganti kode AdSense semua situs di file; buat situs yang belum ada; niche sesuai kepanjangan; ≥40 artikel panjang; menu & halaman wajib; bahasa sesuai ekstensi; folder rapi & mudah dibackup/dijual; worker langsung online | 🔄 |
| 27 Sep | Hapus semua slot Adsterra di mana pun | 🔄 |
| 27 Sep | CSS super mewah, menu penuh animasi, tidak sama dengan situs lain, konsep di blueprint | 🔄 (§4) |
| 27 Sep | axto.us jadi situs pengajuan AdSense, hapus isi yang tidak layak | ❌ |
| 27 Sep | Semua situs: animasi Spanyol juara Piala Dunia 2026 + CSS mewah ala istana Nabi Sulaiman | 🔄 (§4, §5) |
| 3 Okt | File AdSense terbaru: ulyah.com, axto.io, xaa.es ikut (akun 8991…) | 🔄 |
| 3 Okt | axto.io & xaa.es: kalau artikel kurang, jelaskan semua menu tiap aplikasi | ❌ |
| 3 Okt | axto.io ada di repo guardian-ai; cek repo yang benar dan cocokkan dengan isi di browser | ✅ §2 |
| 4 Okt | Perbaiki deploy yang gagal (axto.us: kuota D1; xaa.es: Google Fonts) | ✅ |
| 4 Okt | Buat juga xko.es, byodd.de, byoxy.de (belum ada kode AdSense, untuk persiapan) | ✅ ketiganya lulus check (§7 2.4, 2.6, 2.8) |
| 4 Okt | Semua situs harus mendekati 100% diterima; ubah bahasa kalau perlu | 🔄 Fase 4 |
| 4 Okt | Koreksi: byodd.de (bukan byodd.es) memakai 2228…; kode baru xko.es 6560…, byoxy.de 6701…; meta tag dibuat otomatis | ✅ dicatat §2 |
| 4 Okt | Setiap situs punya niche SEO yang kuat dan luas, bukan konten sampah | 🔄 §3 aturan niche |
| 4 Okt | tilawa.de & 1fr.fr: kode AdSense, ads.txt, meta tag sama dengan xaa.es (8991…, satu akun) | ✅ apps/web ad-config |
| 4 Okt | 1fr.fr dikembalikan ke kode semula 5944786950535069 (script, ads.txt, meta) | ✅ |
| 4 Okt | axto.io masih belum bisa diverifikasi AdSense | ✅ penyebab: loader hanya disisipkan JS (next/script afterInteractive); kini di HTML server (guardian-ai PR #62); audit memeriksa HTML mentah |
| 4 Okt | axto.us: tambah artikel, hapus/ubah konten & desain bila perlu | 🔄 |
| 4 Okt | Banyak situs belum punya animasi Spanyol juara 2026 | 🔄 apps/web semua tenant + 8 repo partner (pita gaya istana masing-masing) |
| 4 Okt | xaa.es isinya studio web, bukan karoseri | ✅ dikonfirmasi; quantum tidak lagi memakai xaa.es |
| 4 Okt | Semua situs punya about, contact, privacy, cookies, terms, disclaimer, editorial policy | ✅ §7 4.5 |
| 4 Okt | axto.us belum ada pengguna: rombak total | ✅ axto.us PR #26 |
| 4 Okt | Urutan: axto.io belakangan; fokus axto.us dan situs yang belum dibuat/kurang; lalu ulyah.com (hemat D1, maksimalkan R2) | 🔄 |
| 4 Okt | Semua situs mudah dibackup beserta database, siap dijual (kecuali ulyah.com, xaa.es, axto.io) | 🔄 §6 aturan backup |
| 4 Okt | 10 domain .de baru (akun 5693…), Worker dulu, dua bahasa DE+EN, 1.000 artikel, cerita rumah tangga & pelajar fiktif | ⏸️ §7 Fase 6, dikerjakan nanti |
| 4 Okt | Favicon/logo setiap situs harus unik | ✅ 11 favicon baru (bentuk & warna sendiri), PR di semua repo |
| 4 Okt | Isi DNS TXT verifikasi Search Console (qarf, qulen, qurm, zavik, zevok, zuvik) | ✅ PR #291, workflow dns-records.yml menambahkan 6 TXT |
| 4 Okt | 10 situs terakhir cukup 40 artikel per situs untuk syarat AdSense | ✅ dicatat Fase 6 |
| 5 Okt | "Ga perlu tanggal putus dawa.es, nanti di putus manual" | ✅ dicatat §10 |
| 5 Okt | "Kerjakan secara bersamaan sisa web … tetep unik, tidak ada duplikat, tetep mewah" | 🔄 8 situs .de paralel (§4, Fase 6) |
| 5 Okt | "Sekalian kerjakan ekosistem ulyah.com, axto.io banyak aplikasi yg hilang, xaa.es banyak yg blm dibuat" | 🔄 §11 — audit + PR per repo (ulyah.com, guardian-ai, xaa) |
| 5 Okt | "Cari progres web .de pengajuan AdSense, lanjutkan, kalau selesai langsung deploy; perhatikan cuplikan AdSense, ads.txt & tag meta — khususnya yang masih kuning" | 🔄 Fase 6: 8 situs (rubiy, byoy, qurm, qarf, zufiq, zevok, zolun, qulen) |
| 5 Okt | "Ini untuk persyaratan AdSense, pastikan mendekati 100% approve, CSS mewah, artikel tidak duplikat dan kualitas tinggi, penuhi persyaratan AdSense" | 🔄 gerbang tambahan sebelum deploy: cek duplikat lintas situs (kemiripan isi + judul), audit ala peninjau AdSense per situs, uji browser desktop + mobile |
| 5 Okt | "Database CF masih tinggi, sy pengen seluruhnya di bawah 10 GB biar tetep free dan hemat D1" | 🔄 §11 — target total penyimpanan Cloudflare < 10 GB |
| 4 Okt | "Fokus konten kualitas tinggi untuk AdSense, dengan CSS mewah … agar mendekati 100% approve" | 🔄 zuvik.de selesai (40 cerita tulisan tangan); 9 situs .de berikutnya menyusul |
| 4 Okt | Satu akun saja: semua situs (screenshot AdSense + xad.es + xaa.es) pakai ca-pub-5693981744147503; dawa.es JANGAN disentuh (bukan milik lagi) | ✅ audit live 4 Okt: 17 situs OK 5693…, dawa.es tetap 6371… |
| 4 Okt | Blueprint Ad Manager + pusat AI ulyah.com: otomatis penuh, aturan tetap, hanya situs yang sudah di-approve, laporan di admin, traffic semua situs kecuali dawa.es | 🔄 `docs/ADMANAGER-BLUEPRINT.md` |
| 4 Okt | Favicon di Search Console masih bola dunia | 🔄 penyebab: domain belum tersambung ke Worker / belum di-crawl ulang; favicon.ico + PNG ditambahkan |
| nanti | Kompres database < 7 GB; perbaiki kitab tidak muncul | ⏸️ |
| 4 Okt | Lepas semua yang terhubung dengan dawa.es, biarkan mandiri, WAJIB dicatat | ✅ §10 (CORS + cache Spanyol: pemilik memutus manual sendiri, 5 Okt) |
| 4 Okt | Hapus & bersihkan slot AdSense di semua situs (kecuali dawa.es); cukup cuplikan, ads.txt, tag meta — 27 situs masih pengajuan | ✅ aturan 3; apps/web, situs statis & repo partner; dijaga CI + audit live |
| 4 Okt | jai.lat: pertahankan 77 artikel Inggris; 10 artikel Spanyol tetap tampil sebagai tambahan | ✅ Jai #6: desk "En español", 5 artikel mesin dihapus (301) |
| 4 Okt | Semua CSS yang belum sesuai blueprint §4 dirombak | ✅ jai.lat (Saba), lie.skin (mutiara), axto.dev (observatorium) live; pemilik: "biarkan seperti skrg" |
| 4 Okt | xaa.es tetap aplikasi bisnis, warna istana tidak cocok | ✅ xaa.es dikecualikan dari §4; tetap biru |
| 4 Okt | Artikel mesin kembar/tipis (aturan 4) | ✅ dihapus + 301: lie.skin 16, axto.dev 43 (judul kembar; 33 yang sudah diperpanjang tetap), xaa.es 76, oldco.in 23, profity.in 16 |
| 4 Okt | Logo "AXTO.dev.dev" | ✅ jadi "AXTO.dev" (axtodev #15) |
| 10 Okt | Kode AdSense baru: axto.us + rubiy.de → ca-pub-2990015102981265; axto.dev, dawo.es, zevok.de, zufiq.de kembali ke ca-pub-5693981744147503; domain baru jai.lat/dai.lat/pab.lat/rough.lat/rough.es dengan akun masing-masing; TXT Search Console rough.es | ✅ `docs/ADSENSE-CODES.md` (tabel terbaru), sites/*, axtodev, axto.us, jai; TXT lewat `dns-records.yml` |
| 11 Okt | xad.es pindah ke akun sendiri: ca-pub-5517446616694631 („xad.es kode adsense nya ganti dengan ini, buatin jg ads.txt dan tag metanya“) | ✅ `apps/web/src/lib/ad-config.ts` (loader + meta + /ads.txt dari satu konstanta), `scripts/check-ads.ts`, `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` |
| 11 Okt | zolun.de ganti akun: ca-pub-6016479123891586 („ini jg ubah buatin jg ads.txt dan tag metanya zolun.de“; sebelumnya 4548005919629272) | ✅ `sites/zolun.de/site.json` + `ADSENSE.txt` (loader, meta, ads.txt dari engine), `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` |
| 11 Okt | dawo.es ganti akun: ca-pub-7349356139063654 („ini juga ganti, buatkan jg ads.txt dan tag meta nya dawo.es“; sebelumnya 5693981744147503; dawa.es tidak disentuh) | ✅ `sites/dawo.es/site.json` + `ADSENSE.txt`, `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` |
| 12 Okt | axto.dev ganti akun: ca-pub-2493615451319531 („axto.dev ganti adsense nya dengan ini, dan buatkan jg ads.txt dan tag meta nya“; sebelumnya 5693981744147503) | ✅ axtodev PR #18 (`src/lib/site.ts` untuk loader + meta, `public/ads.txt`), redeploy lewat `deploy-partner-sites.yml`, `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` |
| 12 Okt | lie.skin ganti akun: ca-pub-4548005919629272 („Lie.skin, bikin jg ads.txt dan tag meta“; sebelumnya 5693981744147503) | ✅ Lie PR #7 (`src/lib/site.ts` untuk loader + meta, `public/ads.txt`), redeploy lewat `deploy-partner-sites.yml`, `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` |
| 12 Okt | Kontrol artikel portal (ulyah.com, 1fr.fr, tilawa.de, xad.es): sampel per sitemap lewat `content-audit.yml` | ✅ temuan + perbaikan PR `claude/portal-seo-fixes`: /syukur (404 di 1fr/tilawa/xad) dan /nasakh (isi hanya Indonesia) keluar dari sitemap + hreflang situs lain (`ROUTE_LOCALES`), /nasakh noindex + pemberitahuan bahasa di fr/de/en; halaman rak & karya kitab punya title/description/canonical sendiri (sebelumnya deskripsi generik di ±5.000 halaman); judul sesi Tadabbur/Hadits dibuat dari templat per bahasa, bukan terjemahan mesin ("Der Koran ist der Koran, der 1322."). Error 1102 hanya muncul saat render pertama (cache dingin, Workers Free 10 ms CPU), audit ulang semua 200 |
| 12 Okt | "Cek CF, turunin database web islami ekosistem ulyah.com, dawa.es, 1fr.fr, tilawa.de, xad.es biar di bawah 10gb, tp kitab2 tetep maximal sesuai bahasanya, translate sesuai bahasanya, dan ulyah.com hanya berbahasa Indonesia; manfaatkan CDN untuk audio Al-Qur'an; pastikan mendekati 100% approve AdSense" | 🔄 §12 |
| 12 Okt | "Catat ini, turunkan R2-nya hingga di bawah 10 GB, pastikan seluruh website dan fitur berfungsi 100%, khususnya portal admin ulyah.com sebagai central, pastikan mendekati 100% approve AdSense" (tangkapan layar R2: total 121,63 GB — ulyah-media 6,19 rb objek 91,06 GB, ulyah-next-cache 510,43 rb objek 30,57 GB) | 🔄 §12 |
| 12 Okt | "Anda sudah sy berikan akses CF, buka saja dan lihat langsung ke dalam, jgn meraba. Perbaiki logo headernya biar mewah, indah elegan, bukan tumpang tindih begitu. Yg dawa.es juga perbaiki, walaupun udah milik orang, biar g error dan biar nanti mudah d backup" | 🔄 §12.5, §10.1 |
| 12 Okt | "Tolong jgn pernah jelasin selain make bhs Indonesia, biar sy tau sudah sampai mana progressnya" | ✅ aturan tetap: semua laporan progres ke pemilik dalam bahasa Indonesia |
| 12 Okt | "Jgn pernah perbaikan menggunakan agent, kerjakan manual aja, catat di blueprint agar tidak menggunakan agent" | ✅ aturan tetap §1 no. 13: perbaikan, artikel, dan audit dikerjakan manual tanpa agent AI |
| 12 Okt | "Adslot manual jika itu milik adsense biarkan, dan biarkan otomatis, yg penting pastikan tidak melanggar adsense secara keseluruhan" (jawaban atas pertanyaan rebuild dawa.es) | 🔄 §10.1: slot manual AdSense dawa.es (akun 6371…) dipertahankan + Auto ads; audit kepatuhan AdSense seluruh ekosistem |
| 13 Okt | "Jgn pernah ngerjain menggunakan agent, anda sendiri yg mengerjakan. Semua artikel yg kurang dr 1500 kata tambahkan, lanjutkan pekerjaan yg sudah ada" | 🔄 aturan tetap (lihat §1 no. 13): semua pekerjaan dikerjakan langsung, tanpa agen/workflow. Inventaris (penghitung engine): 261 artikel situs statis < 1.500 kata (byodd.de 30, byoxy.de 40, byoy.de 40, qurm.de 40, rubiy.de 39, zavik.de 38, axto.us 34) + jai.lat 8, oldco.in 62, profity.in 54 (Hindi/Inggris); ditambah dengan tangan, lalu batas minimum engine dinaikkan ke 1.500 untuk semua bahasa |
| 13 Okt | "Tambhain 5 artikel di masing2 situs, pastikan artikel berkualitas tinggi karena untuk pengjuan adaense" | 🔄 lima artikel baru per situs, masing-masing 1.500+ kata, ditulis tangan, orisinal dan akurat (tanpa hasil pertandingan 2026 di xaa.es, tanpa saran medis di artikel kesehatan): ✅ oldco.in #9, profity.in #8, Jai #12, Lie #9, axtodev #20; xaa #11 dan axto.us #30 siap merge; berikutnya 19 situs `sites/*`, lalu portal (ulyah.com, 1fr.fr, tilawa.de, xad.es, dawa.es) |
| 13 Okt | "Selesain semua sampe bersih d github, PR & merge anda saja yg ngerjain" | 🔄 aturan tetap: Claude membuat PR dan me-merge sendiri setelah pemeriksaan lokal dan CI lulus; target akhir tidak ada PR terbuka di semua repo (termasuk PR lama: rubiy #338, dependabot #323, oldco.in #1 diperiksa dulu) |
| 13 Okt | "Tolong ubah cuplikan kode adsense, ads.txt dan tag meta profity.in dengan kode ini google.com, pub-5944786950535069, DIRECT, f08c47fec0942fa0. Utamakan jalankan perintah ubah kode adsense dulu jika ada perubahan, krn itu urgent" | ✅ profity.in PR #9 (`src/app/layout.tsx` loader + meta + metadata, `public/ads.txt`), redeploy lewat `deploy-partner-sites.yml`, `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md`. Aturan tetap: setiap perubahan kode AdSense dikerjakan lebih dulu dari pekerjaan lain |
| 14 Okt | "Tolong ganti ke 5 situs ini dengan kode adsense ini dan buatkan cuplikan adsense dan tag metanya: google.com, pub-6908951782430508, DIRECT, f08c47fec0942fa0" (tangkapan layar AdSense: axto.io, xaa.es, rough.es, ulyah.com, 1fr.fr — "Membutuhkan peninjauan") | ✅ kode: ulyah.com + 1fr.fr (`apps/web/src/lib/ad-config.ts`, `scripts/check-ads.ts`), rough.es (`sites/rough.es/site.json` + `ADSENSE.txt`), axto.io (repo guardian-ai `dashboard/lib/site.ts` + `public/ads.txt`), xaa.es (repo xaa `src/lib/site.ts` + `public/ads.txt`); `scripts/site-audit.mjs` dan `docs/ADSENSE-CODES.md` diperbarui. tilawa.de, xad.es dan situs lain tidak berubah; dawa.es tetap tidak disentuh |
| 17 Okt (urgent) | "Tolong ganti kode adsense domain2 ini, dan buatkan cuplikan adsense, ads.txt & tag meta nya": zuvik.de 4613976964728693, zufiq.de 9338499658056112, tilawa.de 6908951782430508, zavik.de 5254913739159445, byoy.de 1768325549147657, qkb.es 6284085719914185, qarf.de 4304267428455702, xko.es 4906992051458194, zevok.de 6560360898389273, qurm.de 8212039662308316, axto.dev 8212039662308316 | ✅ `sites/*/site.json` + `ADSENSE.txt` (10 situs, `check.mjs` ALL OK), tilawa.de di `apps/web/src/lib/ad-config.ts` + `scripts/check-ads.ts` (ALL OK), `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md`. axto.dev: lihat kode terakhir di bawah |
| 17 Okt | "Tolong masukin ke DNS xkb.es ini buat SEO console google, google-site-verification=_VK4…SjE" | ❌ dibatalkan pemilik 19 Okt: „Maaf xkb.es itu g ada… Delete aja dan jgn d kerjakan". Entri dihapus dari `.github/dns/google-site-verification.json`; tidak pernah ada record yang dibuat (zona xkb.es tidak ada di Cloudflare — log `dns-records.yml` 19 Okt) |
| 17 Okt | Search Console "Halaman alternatif dengan tag kanonis yang tepat" (byoxy.de, dai.lat, hampir semua situs) dan "Diblokir oleh robots.txt / Diindeks meski diblokir oleh robots.txt" (dai.lat): "perbaiki seluruh situs yg memiliki domain kecuali dawa.es jgn d kerjakan, itu milik orang lain" | 🔄 §13.2 |
| 17 Okt (urgent) | "Kerjakan yg paling urgent dulu ganti kode adsense… pastikan SEO kuat, trafik tinggi dan generik": oldco.in 9666205248809954 lalu diganti 6293576511807510, lie.skin 9666205248809954, axto.dev 6284085719914185, pab.lat 1768325549147657 — "Ingat dahulukan seluruh perubahan adsense, dan buatkan ads.txt dan tag meta" | ✅ kode terakhir berlaku: oldco.in 6293576511807510 (repo oldco.in), lie.skin 9666205248809954 (repo Lie); pab.lat dan axto.dev diganti lagi (baris berikut) |
| 18 Okt (urgent) | "Ubah adsense axto.dev dengan kode ini 6381187608934514; pab.lat ubah dengan ini 7250589269548267" | ✅ axto.dev (repo axtodev `src/lib/site.ts` + `public/ads.txt`), pab.lat (`sites/pab.lat`) |
| 18 Okt | "Bikin web dan SEO nya jg web baru ini, pastikan berkualitas tinggi karena untuk pengajuan adsense: saved.lat & crone.skin, kode adsense 9433622530024776, buatin jg cuplikan ads dan tag meta. Web baru minimal 40 artikel kualitas tinggi dan minimal 1500 kata semua menggunakan bhs inggris" | ✅ §13.3 — saved.lat dan crone.skin masing-masing 40 artikel ≥1.500 kata, ALL OK, bisa diindeks (pengecualian aturan 1: pemilik minta keduanya berbahasa Inggris, termasuk saved.lat yang .lat) |
| 18 Okt | xaa.es: menu khusus menjual lepas xaa.es ($10 juta, seperti /acquire di axto.io), bahasa profesional dan elegan; pembayaran 100% live, diubah dari portal admin | 🔄 §13.4 |
| 18 Okt | Promosikan axto.io dan xaa.es di setiap situs dengan menu khusus premium, bahasa masing-masing situs, kalimat berbeda per situs (tidak copy paste), termasuk dawa.es dan script backup dawa.es | 🔄 §13.5 |
| 18 Okt | Pelajari axto.io & xaa.es, blueprint apa saja yang belum dibuat (app Docker Windows/Linux yang belum ada atau masih standar; template xaa.es yang belum ada), tandai selesai/belum/sedang; tangkapan layar animasi setiap menu & dashboard setiap template; link demo untuk klien xaa.es; semua pembayaran live bukan sandbox; nomor HP axto.io & xaa.es jadi +6285691234561 (kirim bukti transaksi manual) | 🔄 §13.6 (dicatat juga di `guardian-ai/docs/REQUESTS.md` dan blueprint repo xaa) |
| 19 Okt (urgent) | "ubah kode adsense saved.lat dengan ini, buatkan cuplikan adsens, ads.txt & tag metanya: google.com, pub-4548005919629272, DIRECT, f08c47fec0942fa0" | ✅ saved.lat → ca-pub-4548005919629272 (`docs/ADSENSE-CODES.md`, `scripts/site-audit.mjs`; dipasang di `sites/saved.lat` saat situsnya dibuat). crone.skin tetap 9433622530024776 |
| 19 Okt (urgent) | "Ubah kode adsense oldco.in dengan kode ini google.com, pub-2493615451319531, DIRECT, f08c47fec0942fa0" | ✅ repo oldco.in: tag meta (head + metadata Next), loader Auto ads dan `public/ads.txt` → ca-pub-2493615451319531 (PR oldco.in #11, dideploy `deploy-partner-sites.yml`); `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` diperbarui |
| 19 Okt | "Yg kode AdSensenya sama dengan byoxy.de itu domain apa?" | ✅ dijawab: ca-pub-5693981744147503 (akun lama "1 akun", `OWNER_ADSENSE_PUB`) sekarang hanya dipakai byoxy.de; semua domain lain sudah punya kode sendiri. Catatan: profity.in = rough.lat (5944786950535069); axto.io = xaa.es = ulyah.com = 1fr.fr = tilawa.de = rough.es (6908951782430508) — semua sesuai perintah pemilik |
| 19 Okt | "xkb.es masih belum bisa … Maaf xkb.es itu g ada... Delete aja dan jgn d kerjakan" | ✅ entri xkb.es dihapus (baris 17 Okt di atas) |
| 19 Okt | xaa.es/acquire: "Prefer a stake to the whole? A joint offering for AXTO and XAA…" — "Maksudnya masing2 web nyari investornya, bukan gabungan" | ✅ §13.4: xaa.es punya halaman investor sendiri (`/invest`, hanya xaa.es); axto.io `/invest` hanya untuk AXTO; tidak ada lagi penawaran gabungan |
| 19 Okt | "Selesaikan seluruh tugas sampai bersih, tidak merge+PR manual, semua anda kerjakan" | 🔄 Claude membuat PR, menunggu CI hijau, lalu merge sendiri di setiap repo; dideploy otomatis |
| 20 Okt (urgent) | "ubah kode adsense oldco.in google.com, pub-6293576511807510, DIRECT, f08c47fec0942fa0 — Bikin ads.txt , cuplikan adaense dan tag meta nya" | ✅ repo oldco.in PR #13: `public/ads.txt`, tag meta `google-adsense-account` (head + metadata Next) dan loader Auto ads → ca-pub-6293576511807510 (menggantikan 2493615451319531); diuji `next build` + `next start`; `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md`, `docs/ADSENSE-SEMUA-DOMAIN.txt` diperbarui |
| 20 Okt (urgent) | "Ubah kode adsense termasuk ads.txt, tag meta dan cuplikan adsense nya — profity.in google.com, pub-2493615451319531 … byoxy.de google.com, pub-6146217038829045 … rough.es google.com, pub-4504974645924459, DIRECT, f08c47fec0942fa0" | ✅ profity.in (repo profity.in: `public/ads.txt`, tag meta di head + metadata Next, loader) → ca-pub-2493615451319531 (sebelumnya 5944786950535069); byoxy.de (`sites/byoxy.de` site.json + ADSENSE.txt) → ca-pub-6146217038829045 (sebelumnya 5693981744147503); rough.es (`sites/rough.es`) → ca-pub-4504974645924459 (sebelumnya 6908951782430508). `check.mjs` lulus untuk kedua situs (ads.txt, tag meta + loader di setiap halaman); `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md`, `docs/ADSENSE-SEMUA-DOMAIN.txt` diperbarui |
| 20 Okt | "Ubah kode adsense tilawa.de & 1fr.fr google.com, pub-7345352440829958, DIRECT, f08c47fec0942fa0", disusul "1fr.fr make kode ini google.com, pub-5928074389292014, DIRECT, f08c47fec0942fa0" | ✅ tilawa.de → ca-pub-7345352440829958 dan 1fr.fr → ca-pub-5928074389292014 (keduanya sebelumnya 6908951782430508): `apps/web/src/lib/ad-config.ts` (loader, tag meta dan route `/ads.txt` dari satu konstanta per tenant), `scripts/check-ads.ts`, `scripts/site-audit.mjs`, `docs/ADSENSE-CODES.md` (termasuk cuplikan ulyah.com, axto.io, xaa.es yang masih menulis kode lama), `docs/ADSENSE-SEMUA-DOMAIN.txt` (30 kode) |
| 21–26 Okt (urgent) | "Untuk 5 domain ini kode adsense nya ulyah.com 1fr.fr Tilawa.de axto.io xaa.es google.com, pub-8991272269211824, DIRECT, f08c47fec0942fa0"; situs baru velnixo.de 7345352440829958, zoevian.de 5928074389292014, nexvilo.de 6908951782430508, odaily.xyz 9221781326457936, xdaily.xyz 5693981744147503, dawa.im 8991272269211824; "Hati2 jgn sampe ads.txt hilang2an" | 🔄 §14 — kode dulu sampai live, lalu situs baru, artikel, blueprint |
| 26 Okt (temuan) | Audit live setelah upgrade Next 16: 1fr.fr, tilawa.de dan xad.es tampil berbahasa Indonesia (`lang="id"`, h1 Indonesia) di bawah nama situsnya sendiri | ✅ PR #360: `packages/shared/src/i18n.ts` membaca tenant dengan `process?.env?.NEXT_PUBLIC_TENANT`, bentuk yang tidak di-inline Next 16 sehingga jatuh ke "ulyah". Diganti bentuk biasa `process.env.NEXT_PUBLIC_TENANT`; `scripts/check-env-inlining.mjs` menggagalkan CI bila bentuk itu kembali |
| 26 Okt | "dawa.im make link worker dulu, jadi langsung konek saat sy masukin dns nya. Jgn lupa karena dawa.im adalah translate dari ulyah.com make hreflang, atau cek xad.es 1fr.fr tilawa.de dll cara penulisan nya, karena masih satu ekosistem" | 🔄 §14.3b: tenant baru `dawaim` (Spanyol) di `apps/web`, Worker `dawaim-web`, zona dawa.im dibuat otomatis oleh deploy dan dawa.im + www.dawa.im ditempel ke Worker, hreflang `es` → dawa.im di seluruh ekosistem |
| 27 Okt | "Tolong perbaiki dulu seluruh SEO websitenya, perkata, link xmlsitemap dan file2 lain yg d butuhkan dll, backlink yg tidak melanggar adsense d seluruh situs, karena masih banyak masalah, setelah itu baru lanjutkan pekerjaan pembuatan auction xaa.es dan axto.io... Agar tidak lupa catat blueprint dan kembangkan blueprint nya, rapikan blueprint nya menjadi HTML yg bisa d download" | 🔄 §15 — 26 situs statis selesai (gerbang SEO di `check.mjs`); audit live semua domain aplikasi berikutnya; blueprint HTML `docs/BLUEPRINT.html` |
| 27 Okt | "Tolong kirim link2 kebijakan privasi situs .de ke file txt yg bisa di download" | ✅ dikirim: tilawa.de/datenschutz + 15 situs .de `/datenschutz/` |
| 28 Okt | "Masukin SEO ini ke dns dawa.im google-site-verification=kFlUy__OGQsmGH5lk5vcoIJurMpxHttD4n7GCf5L-sk" | ✅ nilai yang sama sudah ada di `.github/dns/google-site-verification.json` sejak 26 Okt; zona dawa.im kini ada di Cloudflare, jadi `dns-records.yml` (dijalankan manual 28 Okt 07.18 UTC) memasangnya: "dawa.im: added". Tinggal klik Verify di Search Console. Audit live (`site-audit.yml`, 28 Okt 07.16–07.19 UTC): rough.lat, saved.lat, lie.skin, dai.lat, pab.lat, crone.skin, jai.lat **OK ca-pub-2717693315276182** (tag meta + loader di HTML server dan browser + ads.txt); 39/39 domain OK |
| 28 Okt | "Tolong ubah ads.txt seluruh domain ini … google.com, pub-2717693315276182, DIRECT, f08c47fec0942fa0" (rough.lat, saved.lat, lie.skin, dai.lat, pab.lat, crone.skin, jai.lat — semua "Membutuhkan peninjauan" di AdSense), disusul "rubah semua" dengan cuplikan dan tag meta ca-pub-2717693315276182; "Pastikan sampe bersih jgn ninggalan commit, PR" | ↩️ dibatalkan 28 Okt — lihat baris berikut (kode dikembalikan) |
| 28 Okt | "Kembaliin kode adsense nya seperti sepula, semuanya termasuk ads.txt tag meta dan cuplikan adsense nya" (rough.lat, saved.lat, lie.skin, dai.lat, pab.lat, crone.skin, jai.lat — semua "Membutuhkan peninjauan" di AdSense) | 🔄 kode dikembalikan ke yang berlaku sebelum 28 Okt: rough.lat `ca-pub-5944786950535069`, saved.lat `ca-pub-4548005919629272`, dai.lat `ca-pub-8469557036744946`, pab.lat `ca-pub-7250589269548267`, crone.skin `ca-pub-9433622530024776` (repo ulyah.com, revert `8e5833b`); jai.lat `ca-pub-6019445914743449` (repo Jai) dan lie.skin `ca-pub-9666205248809954` (repo Lie). ads.txt, tag meta dan cuplikan kembali per domain; peta audit `scripts/site-audit.mjs` kembali. ✅ PR #377 di-merge 28 Okt; audit live (`site-audit.yml`, 28 Okt 12.36–12.40 UTC, setelah `deploy-sites.yml` selesai 12.26): ketujuh domain **OK** dengan kodenya masing-masing (tag meta + loader di HTML server dan browser + ads.txt); 39/39 domain OK. Permintaan tinjauan di AdSense dilakukan dari akun AdSense masing-masing |
| 28 Okt | "Ubah kode adsense https://qkb.es dan selalu buatkan cuplikan adsense dan tag metanya — google.com, pub-3121033501099075, DIRECT, f08c47fec0942fa0" | ✅ qkb.es pindah ke `ca-pub-3121033501099075` (sebelumnya `ca-pub-6284085719914185` sejak 19 Okt): `sites/qkb.es/site.json` + `ADSENSE.txt` (ads.txt, tag meta, cuplikan loader), peta audit `scripts/site-audit.mjs`, `ADSENSE-CODES.md`, `ADSENSE-SEMUA-DOMAIN.txt`; `check.mjs qkb.es` ALL OK (57 halaman membawa tag meta + loader, ads.txt satu baris itu). Aturan tetap dari pemilik: setiap perubahan kode AdSense dilaporkan bersama cuplikan adsense, tag meta dan baris ads.txt-nya (§1 no. 14). ✅ live: audit `site-audit.yml` 28 Okt 13.15–13.18 UTC — qkb.es **OK ca-pub-3121033501099075** (PR #378, deploy 13.06 UTC); 39/39 domain OK |
| 28 Okt | "Ini jg crone.skin Google.com, pub-9653574958783349, DIRECT, f08c47fec0942fa0 — Lie.skin google.com, pub-2271696914011881, DIRECT, f08c47fec0942fa0" | ✅ crone.skin pindah ke `ca-pub-9653574958783349` (sebelumnya `ca-pub-9433622530024776`; repo ulyah.com, `sites/crone.skin/site.json` + `ADSENSE.txt`, `check.mjs crone.skin` ALL OK); lie.skin pindah ke `ca-pub-2271696914011881` (sebelumnya `ca-pub-9666205248809954`; repo Lie, `src/lib/site.ts` + `public/ads.txt`). Peta audit, `ADSENSE-CODES.md` dan `ADSENSE-SEMUA-DOMAIN.txt` ikut. ✅ live: audit `site-audit.yml` 28 Okt 13.15–13.18 UTC — crone.skin **OK ca-pub-9653574958783349** (PR #378, deploy 13.02 UTC), lie.skin **OK ca-pub-2271696914011881** (Lie #19, deploy 12.55 UTC); 39/39 domain OK |
| 28 Okt | "Ingat, selalu dahulukan sampe live dulu kode adsense, ads.txt, cuplikan adsense dan tag meta" | ✅ aturan tetap §1 no. 14 (juga di `CLAUDE.md`): perubahan AdSense dikerjakan pertama sampai audit live OK, laporan selalu memuat ketiga cuplikan |
| 28 Okt | "Tolong di website muslim di homepage paling depan tulis web ini di jual, atau bikin menu husus di header jgn di footer, kasih harga $250rb... Terus kasih penjelasan apa aja yg ada di dalamnya, kitab2 nya, fitur2 nya, manfaatnya, kemudahan mendengar kitab dan alquran dari voice dll, iklan haji & umroh, sewa youtube, live channel Mekah Madinah dll... Tolong input sekalian dari portal admin ulyah.com krn semua di kontrol dari situ isi link youtube live Mekkah yg live 24 jam" — disusul "Kasih harga di posisi yg paling jelas dan nego, harga $250k dan minimal penawaran $50k" (semula diantre setelah axto.io 100%, guardian-ai REQUESTS 121) | 🔄 §17 |
| 29 Okt | "Yg belum di kerjain ini penjualan website islam, bikin yg profesional sesuai intruksi sy, dah lu catet blm d blueprint" | 🔄 §17 — dikerjakan sekarang (baru tercatat di guardian-ai REQUESTS 121; kini juga di sini) |
| 29 Okt | "1fr.fr dawa.im tilawa.de termasuk xad.es itu jg jual semua, sama kaya ulyah.com pembayaran ngikutin ulyah.com, semua terkoneksi ke ulyah.com" | 🔄 §17.3 — keempat situs mitra dijual dengan cara yang sama seperti ulyah.com, semuanya dikendalikan dari Admin → Situs dijual di ulyah.com |
| 29 Okt | "Aktifin admin panel mereka masing2, agar mandiri, kasih cara masuk admin panel nya dengan username dan password demo, mereka hanya bisa melihat2... Kembangkan dulu portal adminya untuk semuanya, agar pembeli melihat nya nyaman, dan betul2 mudah di gunakan untuk promosi haji umroh, youtube anak, dan promo youtube" | 🔄 §18 — dikerjakan lebih dulu (PR 1), lalu penjualan situs mitra §17.3 (PR 2) |
| 29 Okt | "Harga sama $250k" | ✅ dicatat — situs mitra masing-masing US$250.000 (min. US$50.000), sama dengan ulyah.com (§17.3) |
| 29 Okt | "Cek jg translate dan seluruh isi nya, apakah masih ada yg tidak konsisten, error, bug dll atau masih ada yg tidak d terjemahkan... Kerjakan semuanya setelah bikin penjualan,,, bikin yg profesional elegan indah termasuk di ulyah.com, jgn ada css yg error, dari A-Z wajib zero bug error dan miss" | ⏳ §19 — setelah portal admin (§18) dan penjualan situs mitra (§17.3): audit terjemahan dan isi kelima situs (teks yang belum diterjemahkan, tidak konsisten, error, CSS rusak) dan perbaikannya |
| 29 Okt | "Untuk saat ini make 2 jalur, bisa dari ulyah.com maupun bisa mandiri, klo nanti ada yg beli baru di putus satu per satu, agar lebih mudah d kontrol koneksikan dulu ke ulyah.com" | 🔄 §18.4 — dua jalur sekaligus: Admin ulyah.com (pemilik memilih situs) dan admin mandiri setiap situs; semua tetap terhubung ke ulyah.com; diputus satu per satu saat terjual |
| 29 Okt | "Untuk kitab tajwid anak, game anak, gunakan pwngucapanya menggunakan lidah orang Arab, agar faseh dan makhroj nya tepat, tinggal pilih pembacanya \"laki perempuan dewasa atau anak2\"" | ⏳ §20 — dicatat; dikerjakan setelah §18, §17.3 dan §19 |
| 29 Okt | "Jgn d kasih harga dulu haji umroh, kosongin harganya atau kasih keterangan i sewakan slot nya" | ✅ §18.5 — tidak ada harga di halaman Haji & Umroh (termasuk "$1/hari" sewa yang lama); kartu menulis "Slot disewakan"; editor admin tanpa kolom harga |
| 29 Okt | "Translate di masing2 situs di bikinin, biar saling berbagi link untuk translate nya" (dengan tangkapan layar menu bahasa ulyah.com) | ✅ §19.1 — menu bahasa di kelima situs, setiap bahasa membuka halaman yang sama di situs bahasanya |

---

## 10. dawa.es dilepas — mandiri (WAJIB DICATAT)

Pemilik, 4 Okt 2026: **"Lepas yg terkoneksi dengan dawa.es karena bukan milik
sy lagi, biarkan dawa.es mandiri ini wajib di catat."** dawa.es (bukan dawo.es)
bukan milik pemilik lagi.

### Yang sudah diputus di repo ulyah.com

| Sambungan lama | Sekarang |
|---|---|
| Bahasa Spanyol di pemilih bahasa ulyah.com / 1fr.fr / tilawa.de / xad.es melompat ke dawa.es (`LOCALE_SITE.es`) | Dihapus. Tidak ada lagi tautan, hreflang, atau entri sitemap yang menunjuk dawa.es |
| hreflang `es` di header `Link` semua situs ekosistem (`ALWAYS_LIVE`) | Diturunkan dari `LOCALE_SITE`, jadi `es` tidak diumumkan lagi |
| Pipeline deploy membangun + mendeploy Worker `dawa-web`, membuat zona dawa.es, membersihkan DNS-nya, dan menempelkan domainnya | Semua langkah dihapus. Worker `dawa-web` tetap menyajikan build terakhirnya tanpa disentuh |
| CI memeriksa tenant `dawa` | Dihapus dari pemeriksaan bahasa & tautan |
| Warm/terjemahan mesin ke bahasa Spanyol untuk dawa.es (warm-mt-cache, translate-content) | Berhenti: tidak ada kuota AI/D1 yang dipakai untuk dawa.es lagi |
| Traffic dawa.es masuk D1 ulyah (`/track`, `/analytics/*`) | Dijawab tapi TIDAK disimpan; data lama tidak dihitung di admin |
| Panel admin (Live, traffic per situs, analitik tenant, halaman situs, paket haji, toko Amazon, statistik iklan) | dawa.es dihapus dari semuanya |
| Ad Manager / AdOps | dawa.es tidak ada di registri `packages/shared/src/owner-sites.ts`, jadi tidak pernah diotomasi |
| Audit live (`site-audit`) | dawa.es tidak diaudit lagi |
| Portofolio xaa.es | dawa.es dihapus dari daftar |

### Yang SENGAJA belum diputus (menunggu keputusan pemilik)

Build terakhir dawa.es masih membaca isi dari `api.ulyah.com` (D1/KV/R2
ulyah). Kalau ini diputus sekarang, dawa.es langsung rusak, padahal pemilik
minta dawa.es "dibiarkan mandiri", bukan dimatikan. Jadi sampai pemilik
menentukan tanggal putus:

- CORS `api.ulyah.com` masih mengizinkan `https://dawa.es` (apps/worker-api `index.ts`);
- cache terjemahan Spanyol tetap disajikan dan tidak dipangkas (`DETACHED_SERVED_LANGS = ["es"]` di `packages/shared/src/i18n.ts`), tetapi tidak ditambah lagi;
- Worker `dawa-web` dan zona dawa.es masih ada di akun Cloudflare pemilik.

Hari putus = hapus `"es"` dari `DETACHED_SERVED_LANGS`, hapus dua origin dawa
dari CORS, lalu pemilik baru memindahkan zona dawa.es ke akun Cloudflare-nya.

### Paket serah-terima untuk pemilik baru

`scripts/export-dawa-standalone.mjs` membuat proyek dawa.es yang berdiri
sendiri (API, D1, KV, R2 sendiri: `dawa-api`, `dawa-db`, `dawa-cache`,
`dawa-media`) beserta panduannya. Main tidak lagi memuat dawa.es sebagai
tenant, jadi paket dibuat dari commit terakhir sebelum pelepasan:

```
git checkout 771e8976432c2e033c9db8137b66dd489589648f
node scripts/export-dawa-standalone.mjs --zip
```

Sudah diuji 4 Okt: 1.104 file, zip 42,7 MB (dipecah 3 bagian).

### 10.1 Perbaikan & backup dawa.es (12 Okt)

Pemilik, 12 Okt 2026: **"Yg dawa.es juga perbaiki, walaupun udah milik orang,
biar g error dan biar nanti mudah d backup."**

Dilihat langsung di Cloudflare: Worker `dawa-web` masih menyajikan build
4 Okt 21:25 UTC (commit 713e87d, kode aplikasinya identik dengan 771e897),
tenant `dawa`, akun AdSense ca-pub-6371903555702163, dengan slot iklan manual.
Probe browser nyata (`live-probe.yml`) menemukan di dawa.es:

| Temuan | Penyebab | Perbaikan |
|---|---|---|
| React error #418 di beranda | Widget sholat menulis nama sholat berikutnya, jam & tanggal dari waktu render server; halaman di-cache berjam-jam, browser menghitung ulang → teks beda | Nilai yang bergantung jam ditahan sampai halaman aktif (`PrayerTimesWidget`) |
| Header: logo × piala × menu tumpang tindih | Satu baris untuk logo, ornamen dan menu | Header dua baris (§12.5); menu Spanyol muat satu baris dari 1025 px |
| `/gratitud` 404 di "Sobre nosotros" | Tautan /syukur dipasang untuk bahasa yang tidak punya halamannya | Tautan hanya muncul bila rutenya ada (`routeLocales`) |
| "Pasang Aplikasi" (Indonesia) di HTML server | Tombol install mulai dari "id" lalu ganti setelah dimuat | Bahasa diambil dari URL halaman |
| Jadwal sholat default Jakarta | Default negara satu untuk semua situs | Default per situs: Madrid / Paris / Berlin / Jakarta |
| 500 `/content/live-streams`, `/analytics/pageview` saat kuota D1 habis | Query D1 tanpa penanganan gagal | API menjawab daftar kosong / 204 |

**Backup otomatis:** `.github/workflows/dawa-site.yml`, job `backup` — paket
proyek mandiri dari 771e897 (`export-dawa-standalone.mjs --zip`) + skrip Worker
yang sedang live diunduh dari API Cloudflare, disimpan sebagai artifact (90
hari) dan GitHub Release `dawa-es-backup-<tanggal>` (permanen). Jalan sendiri
saat file ini masuk main, dan kapan saja lewat "Run workflow".

**Rebuild (perlu konfirmasi pemilik):** job `rebuild` hanya jalan dengan input
`rebuild = rebuild-dawa`, setelah backup sukses. Ia membangun tenant dawa dari
kode terbaru dan men-deploy ke Worker `dawa-web` yang sama (domain, zona, akun
AdSense 6371…, ads.txt dan tag meta tidak berubah). **Satu hal ikut berubah:**
slot iklan manual build lama tidak ada di kode sekarang (dihapus di semua situs
sejak 4 Okt, aturan 3); iklan di dawa.es lalu bergantung pada Auto ads akun
6371…. Karena 4 Okt pemilik meminta slot dawa.es dikecualikan, rebuild ini
menunggu kata "rebuild dawa" dari pemilik.

**Keputusan pemilik (12 Okt):** "Adslot manual jika itu milik adsense biarkan,
dan biarkan otomatis, yg penting pastikan tidak melanggar adsense secara
keseluruhan." Jadi rebuild dawa.es WAJIB membawa slot manual AdSense-nya (unit
banner 4702981509 dan flex 1209764526, akun 6371…) persis seperti build live,
Auto ads tetap menyala, dan tidak ada slot manual di situs lain. Rebuild belum
dijalankan sebelum itu terpenuhi.

**Dikerjakan (13 Okt):** `AdSlot`/`PageAds` dipulihkan dari build live (713e87d)
ke kode utama, khusus tenant dawa (aturan 3). Perbaikan kebijakan sekaligus:
tidak ada unit di halaman tanpa konten penerbit/halaman tugas/halaman anak/404,
unit tidak menggeser teks yang sedang dibaca, label selalu terlihat, penghitung
klik (`ad-stats.ts`, beacon `/track/ads`) tidak dikembalikan. Rebuild
(`dawa-site.yml`, rebuild = rebuild-dawa) menolak build yang tidak membawa
kedua unit dan gerbangnya.

**Tindakan di akun AdSense ca-pub-6371903555702163 (pemegang akun):** Auto ads
tetap aktif dengan beban iklan sedang; pengecualian halaman Auto ads untuk
`/es/admin`, halaman masuk/akun, `/ninos`, `/peliculas-infantiles`; pesan
"Peraturan Eropa" (CMP bersertifikat) di Privasi & pesan harus dipublikasikan.

---

## 11. Ekosistem & penyimpanan Cloudflare < 10 GB (permintaan pemilik 5 Okt)

Pemilik, 5 Okt 2026: **"Database CF juga masih tinggi, sy pengen seluruhnya di
bawah 10 GB biar tetep free dan hemat D1, catet blueprint ini."**

### Aturan tetap

1. **Total penyimpanan Cloudflare (semua D1 + R2) < 10 GB.** Setiap PR yang
   menambah data besar wajib menyebut dampaknya terhadap angka ini.
2. **Hemat D1:** baca/tulis seminimal mungkin. Data statis (teks kitab, audio,
   terjemahan jadi) disajikan sebagai file statis/cache, bukan dibaca dari D1
   per permintaan. Query tanpa indeks dan scan tabel penuh dilarang.
3. **Tidak ada data milik pemilik yang dihapus tanpa izin tertulis.** Yang boleh
   dibersihkan tanpa izin hanya data turunan yang bisa dibuat ulang (cache
   terjemahan mesin, log lama, duplikat persis). Semua yang lain: usulan dulu,
   backup (`wrangler d1 export`) dulu, baru eksekusi setelah pemilik setuju.
4. **Kunci API pemilik (ai_key_pool / admin_settings) tidak pernah dihapus.**
5. dawa.es tetap tidak disentuh.

### Pekerjaan (5 Okt, dikerjakan paralel)

| Bagian | Repo | Isi | Status |
|---|---|---|---|
| 11.1 Audit penyimpanan D1/R2 + rencana < 10 GB | ulyah.com, guardian-ai | ukuran per database/tabel, apa yang bisa dipindah/dipadatkan/dibuang, migrasi aman | 🔄 |
| 11.2 Ekosistem ulyah.com | ulyah.com | kitab hilang/tidak konsisten, audio hilang, tautan & halaman rusak | 🔄 kitab: 🟡 PR #303 |
| 11.3 axto.io: aplikasi yang hilang | guardian-ai | bandingkan daftar aplikasi (7 cloud + 10 self-hosted) dengan yang hidup; pulihkan | 🔄 |
| 11.4 xaa.es: bagian yang belum dibuat | xaa | menu/fitur/halaman yang masih kosong atau placeholder; tetap biru bisnis | 🔄 |

### 11.2 Kitab hilang: akar masalah & perbaikan (PR #303)

Data kitab di D1 tidak terhapus. Halaman kitab membaca D1 per render. Saat
kuota baca harian D1 habis (7500), API menjawab 500, halaman merender rak
kosong, dan cache R2 menyimpannya sehari. Deploy saat kuota habis bahkan
memprerender rak kosong ke dalam rilis. Sejak PR #303, katalog (4.969 karya)
dan kitab pesantren (32 kitab) dibangun dari file seed yang sama menjadi JSON
statis (`scripts/build-kitab-static.ts`, `apps/web/public/kitab-data`).
Hasilnya: 0 baca D1 untuk index, rak, dan beranda, serta +0 byte D1/R2.

---

## 12. Diet Cloudflare: D1 tidak habis tiap hari, R2 < 10 GB, kitab tetap penuh (permintaan pemilik 12 Okt)

Pemilik, 12 Okt 2026:

1. **"Cek CF, turunin database web islami ekosistem ulyah.com, dawa.es, 1fr.fr,
   tilawa.de, xad.es biar di bawah 10gb, tp kitab2 tetep maximal sesuai
   bahasanya, translate sesuai bahasanya, dan ulyah.com hanya berbahasa
   Indonesia; manfaatkan CDN untuk audio Al-Qur'an … pastikan juga mendekati
   100% approve AdSense."**
2. **"Catat ini, turunkan R2-nya hingga di bawah 10 GB, pastikan seluruh website
   dan fitur berfungsi 100%, khususnya portal admin ulyah.com sebagai central,
   pastikan mendekati 100% approve AdSense."** (tangkapan layar R2: 121,63 GB)

### 12.1 Hasil cek Cloudflare (12 Okt, 07:20 UTC)

| Sumber daya | Angka | Batas yang berlaku | Artinya |
|---|---|---|---|
| D1 `ulyah-db` | 457 MB | **500 MB per database** (Workers Free) | 91% penuh. "10 GB" adalah batas plan berbayar; di plan gratis batasnya 500 MB |
| Kuota baca D1 | **habis pukul 07:20 UTC** | 5 juta baris/hari | sejak 1 Sep 2026 semua query D1 gagal (kode 7500) sampai 00:00 UTC — semua situs ekosistem, termasuk login admin |
| R2 total | **121,63 GB** | 10 GB gratis | ulyah-media 91,06 GB (6,19 rb objek), ulyah-next-cache 30,57 GB (510,43 rb objek) |

### 12.2 Akar masalah (diukur, bukan ditebak)

**Kuota baca D1:**

- **Pemeliharaan malam** sendiri membaca ±2 juta baris (40% kuota harian): setiap
  pengecekan `mt_cache` memakai `LIKE 'mt:ar-__:%'`, yang di SQLite tidak bisa
  memakai indeks, jadi memindai seluruh 246.820 baris — dan itu diulang 8 kali
  hanya untuk mencetak "0" (log run #87: 260.008 + 246.820 + 493.640 + …).
- **Portal admin, tab Analitik**: selama terbuka, ±25 query yang memindai seluruh
  `analytics_pageviews` / `site_pageviews` diulang tiap 2–12 detik
  (`/admin/live-presence` 2 dtk, `/admin/site-analytics` 3 dtk,
  `/admin/tenant-analytics` 12 dtk, `/admin/analytics` 30 dtk). Satu jam tab
  terbuka cukup untuk menghabiskan 5 juta baris.
- **Detak "presence" pengunjung tiap 3 detik**: 20 request Worker + 20 tulis D1
  per menit per pengunjung (batas gratis: 100 rb request & 100 rb tulis/hari).
- **API halaman publik**: `/quran/hadits-of-day` menghitung seluruh tabel hadits
  (`COUNT(*)` + `OFFSET` acak) di setiap cache miss; `/quran/search` memindai
  ayat, hadits dan cerita dengan `LIKE '%q%'`.
- **Churn terjemahan kitab**: pemangkasan malam `mt:ar-*` (dibuat untuk matn
  hadits) ikut menghapus terjemahan judul/deskripsi kitab, padahal itu memang
  boleh diterjemahkan (`scripts/check-no-arabic-mt.mjs`). Akibatnya ±3.300 baris
  ditulis dan dihapus setiap hari, dan halaman kitab kembali berbahasa Arab.

**R2:**

- **ulyah-media 91 GB = audiobook TTS** (`audio/story/<id>.mp3`, ±26 MB per file,
  96 kbps), dibuat otomatis setiap hari oleh `generate-audiobooks.yml` untuk
  ribuan sesi yang disusun mesin ("Tadabbur Al-Qur'an — Sesi 1819 …"). Data
  turunan: bisa dibuat ulang dari teksnya, dan situs sudah punya pembaca suara
  di browser (`StoryReader`) yang bekerja tanpa penyimpanan.
- **ulyah-next-cache 30,6 GB = cache halaman OpenNext** yang tidak pernah
  dihapus. Kuncinya `inc-<situs>/<buildId>/<hash>.cache`; setiap deploy (509
  deploy sejauh ini) memulai buildId baru, jadi cache build lama tertinggal
  selamanya.

### 12.2b Bukti dari Cloudflare (`wrangler d1 insights`, 24 jam s/d 12 Okt 07:44 UTC)

25 query teratas membaca **7,3 juta baris** (kuota 5 juta/hari):

| Baris dibaca | Panggilan | Query | Perbaikan |
|---|---|---|---|
| 2.468.200 | 10 | cek pemeliharaan `mt_cache LIKE 'mt:ar-__:%'` | rentang kunci |
| 990.018 | 1.970 | halaman kisah (fallback `slug` tanpa `lang` memakai indeks `status`) | `+st.status` → indeks `(slug, lang)` |
| 987.280 | 4 | hitung sisa di skrip prune (`LIKE`) | rentang kunci |
| 559.953 | 41 | hadits hari ini `ORDER BY id OFFSET n` | `MIN/MAX` + `id >= ?` |
| 500.630 | 19 | daftar koleksi hadits + `COUNT` per koleksi | hitungan di KV seminggu |
| 428.688 | 37 | judul kitab pesantren `pes_i18n WHERE lang=?` (SCAN) | `CROSS JOIN` lewat primary key |
| 390.101 | 97 | `COUNT(*) FROM hadits WHERE collection=?` | hitungan di KV |
| 153.968 | 210 | hadits hari ini `COUNT(*)` | dihapus |

R2 (wrangler r2 bucket info): ulyah-media 6.194 objek / 91,1 GB, ulyah-next-cache
516.527 objek / 31,1 GB; keduanya hanya punya aturan bawaan "abort multipart 7 hari".

### 12.3 Aturan tetap (tambahan §11)

1. **R2 total < 10 GB**, dijaga otomatis oleh *lifecycle rule* R2 yang dipasang
   setiap deploy (`.github/workflows/deploy.yml`):
   - `ulyah-next-cache`: entri cache halaman kedaluwarsa setelah 2 hari (halaman
     populer diperbarui sendiri saat revalidasi, jadi tetap hangat);
   - `ulyah-media`: `audio/story/`, `audio/qori/`, `audio/qori2/` kedaluwarsa
     setelah 1 hari. Prefix lain (kitab, PDF, audio anak, unggahan admin,
     tumpahan teks) **tidak disentuh**.
2. **Tidak ada audio murottal di R2.** Murottal diputar dari CDN qari
   (`apps/web/src/lib/qori-cdn.ts`); `/audio/qori2/…` hanya redirect.
3. **Tidak ada audiobook MP3 di R2.** "Dengarkan" memakai suara perangkat
   pembaca (Web Speech) — 0 byte, semua bahasa. Generator MP3 tidak terjadwal
   lagi dan menolak berjalan tanpa konfirmasi manual.
4. **Kitab diterjemahkan sekali, disimpan statis.** Judul, deskripsi dan daftar
   isi 4.969 karya diterjemahkan ke bahasa tiap situs (id → ulyah.com, en →
   xad.es, fr → 1fr.fr, de → tilawa.de) oleh
   `scripts/translate-kitab-catalogue.mjs` ke `scripts/data/kitab-i18n/`, lalu
   dilipat ke file statis kitab situs itu saat build. 0 baris D1, 0 baca D1.
   ulyah.com tetap hanya berbahasa Indonesia.
5. **Tidak ada query pemindaian penuh di jalur yang dipanggil berulang**
   (halaman publik, polling admin, cron 15 menit, pemeliharaan malam). Kunci
   `mt_cache` dicari dengan rentang (`k >= 'mt:ar-' AND k < 'mt:ar.'`), bukan
   `LIKE`.
6. **Statistik admin dihitung paling sering sekali per beberapa menit** dan
   disimpan di cache edge; angka "online sekarang" tetap langsung dari tabel
   presence yang kecil.

### 12.4 Pekerjaan

| # | Pekerjaan | Status |
|---|---|---|
| 12.1 | Catat permintaan + hasil cek CF di blueprint | ✅ |
| 12.2 | Pemeliharaan malam: query rentang, hapus pindaian ganda; laporan `wrangler d1 insights` + ukuran R2 tiap malam | ✅ |
| 12.3 | Admin: cache statistik berat (5–10 menit), polling 15 dtk/30 dtk/60 dtk/2 mnt & berhenti saat tab tersembunyi | ✅ |
| 12.4 | Presence 3 dtk → 30 dtk (juga 6 situs mitra: axto.dev, lie.skin, jai.lat, oldco.in, profity.in, xaa.es); rate-limit beacon tanpa KV; API publik tanpa pemindaian penuh | ✅ |
| 12.5 | Kitab: terjemahan statis id/en/fr/de (judul, deskripsi, daftar isi) — skrip + build + halaman | ✅ kode · ✅ data (id 4.969/4.960/55.661 · en 4.969/4.969/55.858 · fr 4.957/4.963/55.821 · de 4.969/4.969/55.790 judul/deskripsi/bab) |
| 12.6 | R2: lifecycle rule ulyah-next-cache + ulyah-media; generator audiobook berhenti; UI pakai suara perangkat | ✅ terpasang oleh deploy #510 (4 aturan ulyah-media, 1 aturan ulyah-next-cache); Cloudflare menghapus dalam ±24 jam |
| 12.7 | D1: indeks ganda `analytics_pageviews` dibuang, ukur tabel setelah kuota reset | ⏸️ setelah 00:00 UTC |
| 12.8 | Uji (typecheck, CI, browser), PR, merge, deploy, verifikasi live | ✅ PR #330 → deploy #510 hijau · 🔄 putaran 2 |
| 12.9 | Header mewah tanpa tumpang tindih (semua situs, 360–1920 px) | 🔄 §12.5 |
| 12.10 | dawa.es: perbaiki error + backup mudah | 🔄 §10.1 |
| 12.11 | Murottal CDN: bitrate yang benar per qari (diukur) | 🔄 §12.5 |

### 12.5 Dilihat langsung (12 Okt): header, murottal CDN, error halaman

Probe browser nyata di runner GitHub (`.github/workflows/live-probe.yml`,
`scripts/live-probe.mjs`), desktop 1366 px + ponsel 390 px, beranda + 15
tautan per situs:

- **Header tumpang tindih di semua situs** (logo × piala × buku surah × menu).
  Header baru dua baris: baris 1 = logo + ornamen (piala, buku surah) yang
  diukur dengan container query dan disembunyikan bertahap bila ruang sempit +
  tombol; baris 2 = menu di tengah dengan garis emas tipis. Menu mengecil
  bertahap (< 1408 px tanpa ikon grup, < 1280 px tanpa panah) sehingga menu
  terpanjang (Spanyol) tetap satu baris dari 1025 px; `flex-wrap` sebagai
  pengaman. Diukur lokal 360–1920 px: 0 tumpang tindih, 0 overflow.
- **Murottal**: pemutar memaksa semua qari alquran.cloud ke 128 kbps, padahal
  Sudais, Hani Ar-Rifai, Abdul Basit dan Basfar hanya ada 192 kbps — suara
  mereka gagal (ERR_BLOCKED_BY_ORB). `scripts/probe-murottal-cdn.mjs` mengukur
  bitrate yang benar-benar ada; hasilnya di `packages/shared/src/murottal-cdn.ts`
  dipakai pemutar web dan redirect `/audio/qori2/`. Audio per-surah radio hanya
  diminta untuk 3 qari yang memang punya. Folder everyayah Al-Tablawi dan
  Minshawi & anak-anak 404 → folder yang benar `Mohammad_al_Tablaway_128kbps`
  dan `Minshawy_Teacher_128kbps` (diukur oleh probe yang sama).
- **Error 500 saat kuota D1 habis**: `/content/live-streams` dan
  `/analytics/pageview` kini menjawab tanpa error.
- **404 `/gratitude`, `/dankbarkeit`, `/gratitud`** di halaman Tentang situs
  saudara: tautan /syukur hanya untuk bahasa yang punya halamannya.

---

## 13. Permintaan 17–19 Okt 2026 (dikerjakan berurutan, AdSense dulu)

Urutan kerja mengikuti perintah pemilik: **"dahulukan seluruh perubahan adsense"**,
lalu SEO Search Console, situs baru, xaa.es dijual, promosi axto.io & xaa.es,
dan blueprint axto.io/xaa.es. Semua dikerjakan manual (aturan 13).

### 13.1 Kode AdSense (✅ kode di repo; live setelah merge + deploy)

| Domain | Kode baru | Tempat |
|---|---|---|
| zuvik.de, zufiq.de, zavik.de, byoy.de, qkb.es, qarf.de, xko.es, zevok.de, qurm.de, pab.lat | lihat `docs/ADSENSE-CODES.md` | `sites/<domain>/site.json` + `ADSENSE.txt` |
| tilawa.de | ca-pub-7345352440829958 | `apps/web/src/lib/ad-config.ts` (20 Okt; 19 Okt: 6908951782430508) |
| 1fr.fr | ca-pub-5928074389292014 | `apps/web/src/lib/ad-config.ts` (20 Okt; sebelumnya 6908951782430508) |
| axto.dev | ca-pub-6381187608934514 | repo axtodev |
| oldco.in | ca-pub-6293576511807510 | repo oldco.in (20 Okt, kode terbaru; 19 Okt: 2493615451319531, sebelumnya 6293576511807510) |
| profity.in | ca-pub-2493615451319531 | repo profity.in (20 Okt; sebelumnya 5944786950535069) |
| byoxy.de | ca-pub-6146217038829045 | `sites/byoxy.de` (20 Okt; sebelumnya 5693981744147503) |
| rough.es | ca-pub-4504974645924459 | `sites/rough.es` (20 Okt; sebelumnya 6908951782430508) |
| lie.skin | ca-pub-9666205248809954 | repo Lie |
| saved.lat | ca-pub-4548005919629272 | `sites/saved.lat` (situs baru) |
| crone.skin | ca-pub-9433622530024776 | `sites/crone.skin` (situs baru) |

### 13.2 Search Console: kanonis alternatif & robots.txt (🔄)

- "Halaman alternatif dengan tag kanonis yang tepat" hanya informasi: Google
  menemukan URL varian (parameter `?…`, `/index.html`, garis miring di akhir,
  versi bahasa lain) yang menunjuk kanonis ke halaman lain. Perbaikannya:
  sitemap dan tautan internal hanya memuat URL kanonis persis, varian
  `/index.html` & garis miring diarahkan 301, tidak ada parameter pelacak di
  tautan internal.
- "Diblokir oleh robots.txt" / "Diindeks meski diblokir": halaman yang
  ditautkan tetapi diblokir `Disallow`. Halaman yang memang tidak boleh
  diindeks memakai `noindex` (bukan `Disallow`), supaya Google bisa membaca
  tanda itu; `robots.txt` hanya memblokir yang benar-benar tidak boleh
  dirayapi.
- **Akar masalah yang ditemukan (19 Okt):** `deploy-sites.yml` (dan deploy portal)
  memasang `example.com` **dan** `www.example.com` ke Worker yang sama, jadi
  setiap halaman punya kembaran di `www.` (dan di `http://` kalau zona tidak
  memaksa HTTPS) yang kanonisnya menunjuk ke `https://example.com`. Itulah yang
  dilaporkan Search Console sebagai "halaman alternatif". Perbaikan:
  `.github/workflows/canonical-hosts.yml` menyalakan *Always Use HTTPS* dan
  menambah satu Redirect Rule 301 `www → apex` di setiap zona pemilik (situs
  `sites/*`, portal, repo partner), lalu mencetak robots.txt, redirect dan
  kanonis yang dilihat Googlebot di setiap varian host. Jalan otomatis saat
  merge, tiap Senin, dan manual. Kalau token Cloudflare belum punya izin
  *Zone Settings: Edit* + *Single Redirect: Edit*, run memberi peringatan.
- robots.txt situs statis sudah `Allow: /`. Laporan "Diblokir oleh robots.txt"
  di dai.lat berasal dari URL sebelum situsnya ada (halaman parkir) atau dari
  host varian; laporan robots di `canonical-hosts.yml` menunjukkan host mana
  yang memblokir. Setelah itu klik **Validasi perbaikan** di Search Console.
- Semua situs pemilik; **dawa.es tidak dikerjakan** (milik orang lain).

### 13.3 Situs baru saved.lat & crone.skin (✅)

Bahasa Inggris (keputusan pemilik), ≥40 artikel tulisan tangan, setiap
artikel ≥1.500 kata, halaman wajib, desain istana sendiri, SEO lengkap
(sitemap, canonical, JSON-LD). Situs tetap `"draft": true` sampai lulus
`check.mjs`.

- ✅ **saved.lat** (19 Okt): 40 artikel bahasa Inggris (total ±65.500 kata
  menurut penghitung engine, terpendek 1.521), 6 kategori × 6–7 artikel,
  7 halaman (about, contact, privacy, cookie, terms, disclaimer, editorial
  policy). `check.mjs` ALL OK → `"draft"` dicabut, situs bisa diindeks.
  Diuji di Playwright (desktop 1366 + mobile 390): tanpa error konsol, tanpa
  overflow horizontal.
- ✅ **crone.skin** (19 Okt): 40 artikel bahasa Inggris (en-GB) untuk perempuan
  50+ (total ±64.750 kata menurut penghitung engine, terpendek 1.503), 6 kategori
  (kecantikan, gaya, gerak, rumah & kebun, tujuan & relasi, perjalanan), 7 halaman
  wajib. Tanpa nasihat medis/keuangan — selalu diarahkan ke dokter atau penasihat
  independen. `check.mjs` ALL OK → `"draft"` dicabut, situs bisa diindeks. Diuji di
  Playwright (desktop 1366 + mobile 390): tanpa error konsol, tanpa overflow.

### 13.4 xaa.es dijual ($10 juta) + pembayaran live (🔄)

Menu khusus "Acquire xaa.es" seperti `/acquire` di axto.io. Kunci PayPal Live
dan NOWPayments **tidak pernah ditulis ke repo**: pemilik memasukkannya
sendiri di Admin → Payment & email (penyimpanan terenkripsi) lalu memilih
mode Live di sana.

### 13.5 Promosi axto.io & xaa.es di setiap situs (🔄 — 21 situs statis ✅)

Satu menu/bagian premium per situs, bahasa situs itu sendiri, kalimat berbeda
per situs. Bukan iklan AdSense dan bukan slot iklan: tautan editorial biasa ke
situs milik pemilik sendiri, **diberi label jujur "promosi milik sendiri"**
(Werbung in eigener Sache / publicidad propia / our own promotion) — wajib di
Jerman dan disukai peninjau AdSense.

**Cara kerja (engine `sites/_engine`)**
- `site.json` → `"promo": { "slug": "…", "label": "✦ …" }`. Engine menambahkan
  satu item menu paling depan di `site.menu`, jadi setiap tema menampilkannya di
  header dan footer dengan gayanya sendiri; `<head>` memberi item itu huruf tebal
  dan kilau emas pelan (mati di `prefers-reduced-motion`). Tidak ada `::before`/
  `::after` yang ditimpa, jadi dekorasi tema tetap utuh.
- Halamannya `content/pages/<slug>.md` — ditulis khusus untuk situs itu, dikaitkan
  dengan topiknya (renovasi, tanaman, kopi, sekolah, kucing, kebersihan, liburan,
  olahraga, keju & roti, permata, energi, perempuan 50+, hemat), masuk sitemap.
- Fakta yang dipakai hanya yang benar: AXTO = AI Studio, Legal AI, Clipper, Privacy
  Vault, Compliance, Security Analyst, Prompt Library; kunci AI milik sendiri; Mode
  Lokal; produk self-hosted Linux/Windows; antarmuka 10 bahasa (**belum ada bahasa
  Spanyol** — halaman berbahasa Spanyol menyebutkannya terus terang). XAA = studio
  web Eropa: landing page, situs perusahaan, toko online, marketplace, SaaS, portal;
  bayar per tahap (PayPal, transfer, USDT); template; situs EN/ES/ID.
- `check.mjs` menjaga: halaman ≥300 kata, menautkan axto.io dan xaa.es, label
  diawali ✦, dan **tidak menyalin situs lain** (bagian 6 kata yang sama dengan
  halaman promosi situs mana pun ≤10 %).

**Status:** ✅ 21 situs statis (12 DE, 7 ES, 2 EN) — check.mjs ALL OK, Playwright
desktop + mobile tanpa error. ✅ Aplikasi ulyah.com (apps/web): halaman `/ekosistem`
dengan teks sendiri per situs — ulyah.com (`/ekosistem`, Indonesia), xad.es
(`/ecosystem`), 1fr.fr (`/ecosysteme`), tilawa.de (`/oekosystem`), dawa.es
(`/ecosistema`) — item menu "✦" berkilau emas di header, tautan di footer, slug
per bahasa, sitemap; teks di `apps/web/src/lib/ecosystem-copy/<situs>.ts`. Prinsip
khusus situs Islami: AI hanya merapikan/merangkum/menerjemahkan, pertanyaan hukum
agama ke ulama — tidak pernah ke mesin. ✅ dawa.es + skrip backup: workflow
`dawa-site.yml` kini menjalankan `scripts/export-dawa-standalone.mjs` dari main
dengan `--root` ke commit sumber dawa.es, sehingga halaman `/ecosistema`, menu,
footer, slug dan sitemap ikut masuk ke backup (diuji: proyek mandiri hasil
ekspor lolos typecheck dan halaman tampil). 🔄 Berikutnya: situs mitra di repo
lain (axto.us, Lie, profity.in, axtodev, Jai, oldco.in).

| Situs | Halaman | Menu |
|---|---|---|
| byodd.de | /digitale-werkbank/ | ✦ Digitale Werkbank |
| byoxy.de | /gruene-helfer-digital/ | ✦ Grüne Helfer digital |
| byoy.de | /hofladen-und-ki/ | ✦ Vom Beet ins Netz |
| qarf.de | /fuer-roestereien/ | ✦ Für Röstereien |
| qulen.de | /lernen-mit-ki/ | ✦ Lernen mit KI |
| qurm.de | /touren-digital/ | ✦ Touren digital |
| rubiy.de | /kueche-und-technik/ | ✦ Küche & Technik |
| zavik.de | /fuer-tierprofis/ | ✦ Für Tierprofis |
| zevok.de | /reinigungsbetriebe/ | ✦ Sauber organisiert |
| zolun.de | /fuer-gastgeber/ | ✦ Für Gastgeber |
| zufiq.de | /digital-aufgeraeumt/ | ✦ Digital aufgeräumt |
| zuvik.de | /familie-und-technik/ | ✦ Familie & Technik |
| dai.lat | /herramientas-para-proyectos/ | ✦ Herramientas para su proyecto |
| dawo.es | /deporte-y-tecnologia/ | ✦ Deporte y tecnología |
| pab.lat | /para-viajeros-y-agencias/ | ✦ Viajeros y agencias |
| qkb.es | /para-obradores/ | ✦ Para obradores |
| rough.es | /para-joyeros-y-gemologos/ | ✦ Para joyeros |
| rough.lat | /su-taller-en-linea/ | ✦ Su taller, en línea |
| xko.es | /ahorro-inteligente/ | ✦ Ahorro inteligente |
| crone.skin | /digital-companions/ | ✦ Digital companions |
| saved.lat | /smart-tools/ | ✦ Smart tools |

### 13.6 axto.io & xaa.es: yang belum dibuat (🔄)

Dicatat di `guardian-ai/docs/REQUESTS.md` + `docs/AXTO-APPS-BLUEPRINT.md` dan di
blueprint repo xaa; nomor HP konfirmasi transfer manual: +6285691234561.

---

## 14. Permintaan 21–26 Okt 2026 (urutan dari pemilik)

Pemilik: **"Seluruh pengerjaan perintah2 baru dahulukan pengerjaan ubah atau input kode adsense dulu sampai live
lanjut pembuatan website baru"**, lalu artikel, lalu blueprint, dan baru aplikasi (axto.io, xaa.es, ulyah.com)
**setelah diizinkan**: "jgn pernah mengerjakan aplikasi sebelum di perintahkan atau anda harus minta izin dulu jika
pengerjaan artikel sudah 100% selesai".

### 14.1 Kode AdSense (prioritas 1, sampai live)

| Domain | Kode baru | Sebelumnya | Tempat |
|---|---|---|---|
| ulyah.com | ca-pub-8991272269211824 | 6908951782430508 | `apps/web/src/lib/ad-config.ts` (tenant ulyah) |
| 1fr.fr | ca-pub-8991272269211824 | 5928074389292014 | `apps/web/src/lib/ad-config.ts` (tenant 1fr) |
| tilawa.de | ca-pub-8991272269211824 | 7345352440829958 | `apps/web/src/lib/ad-config.ts` (tenant tilawa) |
| axto.io | ca-pub-8991272269211824 | 6908951782430508 | repo guardian-ai |
| xaa.es | ca-pub-8991272269211824 | 6908951782430508 | repo xaa |
| velnixo.de (baru) | ca-pub-7345352440829958 | — | `sites/velnixo.de` |
| zoevian.de (baru) | ca-pub-5928074389292014 | — | `sites/zoevian.de` |
| nexvilo.de (baru) | ca-pub-6908951782430508 | — | `sites/nexvilo.de` |
| odaily.xyz (baru) | ca-pub-9221781326457936 | (sempat diberi 8991272269211824) | `sites/odaily.xyz` |
| xdaily.xyz (baru) | ca-pub-5693981744147503 | (sempat diberi 8991272269211824) | `sites/xdaily.xyz` |
| dawa.im (baru, anggota Spanyol ekosistem) | ca-pub-8991272269211824 | — | `apps/web/src/lib/ad-config.ts` (tenant dawaim, §14.3b) |

Aturan tambahan: **"Hati2 jgn sampe ads.txt hilang2an"** — setiap situs memuat ads.txt, tag meta
`google-adsense-account` dan cuplikan loader di HTML server (bukan ditambahkan JavaScript), dari SATU konstanta per
situs, dan `check-ads.ts` / `sites/_engine/check.mjs` / `scripts/site-audit.mjs` menggagalkan CI jika salah satunya
hilang atau berbeda.

### 14.2 Kode lain (DNS Cloudflare)

- Search Console: pemilik, "Untuk kode SEO tidak usah di kerjakan, karena sudah di input" — hanya dicek
  (zoevian.de, velnixo.de, nexvilo.de, odaily.xyz, xdaily.xyz, dawa.im).
- Sedo self-verification TXT `8750bf0e1361e14b0df9824b3c487b017e2a1ed6` di odaily.xyz, zoevian.de, xdaily.xyz,
  nexvilo.de, velnixo.de, crone.skin, saved.lat.
- axto.io: rekaman Spacemail (TXT verifikasi, MX mx1/mx2.spacemail.com, SRV `_autodiscover._tcp`, SPF
  `v=spf1 include:spf.spacemail.com ~all`, DKIM `spacemail._domainkey`). "Kerjakan yg berhasil saja" bila sebagian
  sudah dimasukkan pemilik.
- Favicon/logo yang belum muncul di Search Console dan robots.txt yang tidak boleh memblokir apa pun yang perlu
  dirayapi.

### 14.3 Situs baru (prioritas 2)

velnixo.de, zoevian.de, nexvilo.de, odaily.xyz, xdaily.xyz: berkualitas tinggi, unik, SEO sangat kuat, untuk
pengajuan AdSense — **45 artikel per situs, masing-masing ≥ 1.500 kata**, unik dan bermanfaat; sitemap.xml,
robots.txt, kanonis, JSON-LD, tautan internal; ads.txt + meta + loader; promosi axto.io, xaa.es dan ulyah.com dengan
logo (§14.5). dawa.im: salinan dawa.es dengan semua "dawa.es" diganti "dawa.im" (domain belum dikoneksikan) dan logo
baru dari pemilik (merah/emas, "dawa .im — Conocimiento Islámico para todos"). dawa.es sendiri tetap tidak disentuh.

#### 14.3a Rancangan lima situs baru (dicatat sebelum dibangun)

Aturan §1 dan §3 berlaku: satu bahasa sesuai domain (.de → Jerman; .xyz tidak ada di daftar, jadi Inggris seperti
.io/.us/.dev/.skin), satu niche evergreen yang dicari tiap bulan dan tidak bertabrakan dengan situs lain di bahasa yang
sama, 6 kategori (1 artikel pilar + turunan yang saling menautkan), **45 artikel ≥ 1.500 kata** ditulis tangan, tema
"Istana Nabi Sulaiman" dengan CSS sendiri yang berbeda total, animasi Spanyol juara 2026 dengan gaya sendiri, dan
semua halaman wajib (Tentang, Kontak, Privasi, Cookie, Syarat, Disclaimer, Kebijakan redaksi, Impressum untuk .de).

| Situs | Bahasa | Kepanjangan | Niche | Kategori |
|---|---|---|---|---|
| velnixo.de | Jerman | **Vel**o · **N**atur · **I**nfrastruktur · **X**-Strecken · **O**rdnung | Radfahren im Alltag: Fahrrad & E-Bike kaufen, warten, sicher fahren, Touren | Kaufberatung · Wartung & Reparatur · E-Bike · Sicher unterwegs · Touren & Reisen · Ausrüstung |
| zoevian.de | Jerman | **Zoe** (Leben) + **avi**an (Vögel) | Vögel beobachten und schützen: Gartenvögel, Füttern, Nistkästen, Vogelarten, Ziervögel artgerecht | Gartenvögel · Füttern & Tränken · Nistkästen & Lebensraum · Vogelarten erkennen · Beobachten & Fotografieren · Ziervögel |
| nexvilo.de | Jerman | **Nex**t + **vi**rtuell + **lo**kal | Digital-Alltag verständlich: Smartphone, Computer, Internet-Sicherheit, Smart Home, KI im Alltag | Smartphone · Computer & Windows · Sicher im Netz · Smart Home · KI im Alltag · Digitales Leben (Ältere, Familie) |
| odaily.xyz | Inggris | **O**ur **Daily** table | Everyday home cooking: techniques, meal planning, baking basics, kitchen science | Kitchen Basics · Weeknight Cooking · Meal Prep & Planning · Baking · Kitchen Science · Pantry & Storage |
| xdaily.xyz | Inggris | e**X**plained **Daily** | Science and how things work, for curious adults: space, Earth, the body (non-medical), physics, technology | Space · Planet Earth · How Things Work · The Human Body (how it works, no advice) · Physics & Chemistry · Big Ideas |

Kode AdSense masing-masing di `docs/ADSENSE-CODES.md` (§14.1). Selama artikelnya belum 40, situs diberi `"draft": true`
(tidak dideploy); setelah 45 artikel lulus `check.mjs`, draft dicabut dan situs live dengan ads.txt, tag meta dan
loader. Search Console sudah terverifikasi lewat DNS (dicek 25 Okt), Sedo TXT terpasang (26 Okt).

| Situs | Status (26 Okt) |
|---|---|
| velnixo.de | ✅ 45 artikel (70.618 kata, terpendek 1.503), `check.mjs` ALL OK, draft dicabut → live; masuk daftar `site-audit.yml` |
| zoevian.de | ✅ 45 artikel (69.468 kata, terpendek 1.500), `check.mjs` ALL OK, draft dicabut → live (ads.txt + meta + loader ca-pub-5928074389292014); tema „Zedernhof“; masuk daftar `site-audit.yml` |
| nexvilo.de | ✅ 45 artikel (71.929 kata, terpendek 1.500), `check.mjs` ALL OK, draft dicabut → live (ads.txt + meta + loader ca-pub-6908951782430508); tema „Die Wege der Ameise“ (Spr 6:6–8); 6 kategori (Smartphone, Computer & Windows, Sicher im Netz, Smart Home, KI im Alltag, Digitales Leben); masuk daftar `site-audit.yml` |
| odaily.xyz | ✅ 45 artikel (75.433 kata, terpendek 1.505), `check.mjs` ALL OK, draft dicabut → live (ads.txt + meta + loader ca-pub-9221781326457936); Inggris (en-US), tema „The lamp that does not go out“ (Ams 31:15, 18); 6 kategori (Kitchen Basics, Weeknight Cooking, Meal Prep & Planning, Baking, Kitchen Science, Pantry & Storage) dengan satuan US + metrik dan suhu aman USDA; masuk daftar `site-audit.yml` |
| xdaily.xyz | ✅ 45 artikel (72.867 kata, terpendek 1.507), `check.mjs` ALL OK, draft dicabut → live (ads.txt + meta + loader ca-pub-5693981744147503); Inggris (en-US), tema „The circuits“ (Pkh 1:5–7); 6 kategori (Space, Planet Earth, How Things Work, The Human Body, Physics & Chemistry, Big Ideas); artikel tubuh manusia memuat catatan „bukan nasihat medis“; masuk daftar `site-audit.yml` |

**dawa.im** (Spanyol): salinan dawa.es. dawa.es hidup di `apps/web` (tenant `dawa`) bersama paket mandiri
`docs/dawa-standalone`; salinannya dibuat sebagai tenant/paket sendiri dengan semua "dawa.es" → "dawa.im", logo baru
dari pemilik (kotak & bulat, merah/emas, "dawa .im — Conocimiento Islámico para todos"), AdSense
ca-pub-8991272269211824 (Auto ads saja, tanpa unit manual dawa.es), dan TXT Search Console yang menunggu zona dawa.im
tersambung ke Cloudflare. dawa.es sendiri tetap tidak disentuh.

**dawa.im, temuan 26 Okt:** Worker `dawaim-web` sudah ter-deploy (dawaim-web.axto.workers.dev), tetapi zona dawa.im
belum ada di akun Cloudflare dan token API tidak punya izin membuat zona (`com.cloudflare.api.account.zone.create`).
Langkah pemilik: Cloudflare → Add a domain → dawa.im (Free) → pasang 2 nameserver yang ditampilkan di registrar. Setelah
zona aktif, `dawa-im-connect.yml` (tiap jam) menempelkan dawa.im + www.dawa.im ke Worker tanpa langkah lain.

#### 14.3b dawa.im = anggota Spanyol ekosistem ulyah.com (pemilik, 26 Okt)

Pemilik: „dawa.im make link worker dulu, jadi langsung konek saat sy masukin dns nya. Jgn lupa karena dawa.im adalah
translate dari ulyah.com make hreflang, atau cek xad.es 1fr.fr tilawa.de dll cara penulisan nya, karena masih satu
ekosistem.“

Jadi dawa.im bukan situs statis di `sites/`, melainkan anggota keempat yang memakai satu basis kode dan satu isi dengan
ulyah.com, persis seperti xad.es (Inggris), 1fr.fr (Prancis) dan tilawa.de (Jerman):

| Bagian | Isi |
|---|---|
| Tenant | `dawaim` di `apps/web/src/lib/tenant.ts` (siteUrl `https://dawa.im`, nama „Dawa“, slogan „Conocimiento Islámico para todos“, logo kotak & bulat merah/emas dari pemilik di `public/brand/dawaim/`). Tenant lama `dawa` (dawa.es) tetap ada dan tidak disentuh, supaya `dawa-site.yml` tetap membangun dawa.es apa adanya. |
| Bahasa | Hanya Spanyol (`TENANT_LOCALES.dawaim = es`). |
| hreflang | `LOCALE_SITE.es = https://dawa.im`: setiap halaman ulyah.com, xad.es, 1fr.fr, tilawa.de dan dawa.im menautkan versi Spanyolnya ke dawa.im (sitemap `xhtml:link` + `<link rel="alternate">`), dan pemilih bahasa di situs lain melompat ke dawa.im. Tidak ada lagi tautan ke dawa.es. |
| Worker | `dawaim-web` (OpenNext, cache `inc-dawaim`). Deploy membuat zona dawa.im di akun Cloudflare bila belum ada (dicetak nameserver-nya di ringkasan job), membersihkan rekaman bawaan yang menghalangi, lalu menempelkan dawa.im dan www.dawa.im sebagai custom domain Worker. Begitu pemilik memasang nameserver di registrar, domain langsung tersambung tanpa langkah lain. |
| AdSense | ca-pub-8991272269211824, Auto ads saja (tanpa unit manual), ads.txt + tag meta + loader dari `ad-config.ts`; dicek `check-ads.ts` dan `site-audit`. |
| API | CORS `api.ulyah.com` mengizinkan `https://dawa.im` dan `https://www.dawa.im`; traffic dicatat sebagai `dawaim`. |
| Terjemahan | Spanyol kembali masuk `ECOSYSTEM_LANGS`; pemanas terjemahan (`warm-mt-cache`) menulis ke shard R2, bukan D1. `translate-content.yml` (menulis D1) tidak diberi bahasa Spanyol. |
| Traffic & toko | dawa.im masuk registri `owner-sites.ts` (`dawaim`), panel admin (Live, traffic per situs) dan rak Amazon `amazon.es`. Tidak ada tabel, migrasi atau query D1 baru: dawa.im memakai modul yang sama dengan situs saudaranya dan ikut pindah ke R2 bersama modul itu (`docs/R2-DATA-BLUEPRINT.md` §5). |
| Pemeriksaan | `check-ads.ts`, `check-adops.ts`, `check-mt-targets.ts`, `check-locale-detect` dan `check-internal-links` (CI: kelima situs), `check-canonical-urls` (hreflang timbal balik), `check-radio-separation.ts` (radio dawa.im tidak pernah memutar suara yang sama dengan situs lain). |
| Menyambung domain | `deploy.yml` membuat zona + menempel domain pada setiap deploy; `dawa-im-connect.yml` mengecek tiap jam, jadi begitu nameserver dipasang, dawa.im langsung tersambung tanpa commit baru. |
| Search Console | TXT `google-site-verification` dawa.im sudah ada di `.github/dns/google-site-verification.json`; `dns-records.yml` memasangnya begitu zona ada. |

### 14.4 Artikel (prioritas 3)

Minimal 45 artikel berkualitas di setiap situs **kecuali situs muslim** (artikelnya sudah melimpah), termasuk
axto.io dan xaa.es; artikel yang belum sempurna disempurnakan.

### 14.5 Promosi axto.io, xaa.es, ulyah.com (backlink, sesuai kebijakan AdSense)

Di setiap situs yang punya domain: satu bagian promosi yang menjelaskan setiap aplikasi dan manfaat axto.io, xaa.es
dan ulyah.com, dengan logo ketiganya di posisi yang tepat, elegan dan profesional. Aturan AdSense: tautan biasa
berlabel jelas (bukan teks tersembunyi, bukan tombol yang meniru iklan, tidak di dekat unit iklan, tidak
mengarahkan klik iklan), isi yang jujur, dan halaman tetap didominasi isi asli situs.

#### 14.5a Standar blok promosi (semua situs berdomain, kecuali dawa.es)

- **Tempat:** (1) satu halaman promosi per situs (`promo` di `site.json`, misalnya "Digital companions"), dan
  (2) satu pita "Dari penerbit yang sama" di footer setiap halaman. Tidak pernah di dalam isi artikel, tidak di dekat
  iklan Auto ads, tidak di atas lipatan pertama.
- **Isi:** tiga kartu dengan logo resmi masing-masing (SVG/PNG kecil, `width`/`height` tetap, `alt` jelas):
  **axto.io** (ruang kerja AI privat: AI Studio, Clipper, Privacy Vault, Mode Lokal, aplikasi self-hosted),
  **xaa.es** (studio web: situs, toko, portal, template), **ulyah.com** (portal ilmu Islam: Al-Qur'an, hadits, kitab,
  kisah). Setiap kartu: 2–3 kalimat manfaat yang benar, ditulis ulang per situs dan per bahasa (bukan salinan), tautan
  biasa berlabel jelas dengan UTM `utm_source=<domain>&utm_medium=referral&utm_campaign=ecosystem`.
- **Kebijakan AdSense:** diberi label jujur ("proyek milik penerbit yang sama"), tanpa teks/tautan tersembunyi, tanpa
  tombol yang meniru iklan, tanpa ajakan mengeklik iklan, dan halaman tetap didominasi isi asli situs. Di situs
  non-muslim, ulyah.com diperkenalkan dengan sopan sebagai portal ilmu, tanpa dakwah memaksa.
- **SEO:** tautan `rel` biasa (bukan `nofollow` untuk situs sendiri, tetapi juga tidak ditukar-tukarkan secara
  berlebihan), teks jangkar deskriptif dan bervariasi, halaman promosi masuk sitemap.

### 14.6 Blueprint (prioritas 4)

Satu berkas HTML besar sebagai panduan yang selalu dibaca pertama kali; blueprint yang sudah disalin ke sana dihapus.
Isinya: standar pengajuan AdSense (CSS super premium, SEO, sitemap.xml, kata kunci & tautan, peletakan kode AdSense
yang konsisten, artikel unik bermanfaat), rencana SEO global, catatan token Cloudflare & R2 (12,53 GB; axto-data
4,19 rb objek; kemungkinan xaa.es satu akun CF dengan axto.io — dibahas dulu), lelang lisensi axto.io tiap 2 minggu
(berakhir Jumat, mulai 25 % harga normal), koin AXTO lokal (100 jt, $1, hanya transaksi), status ulyah.com/axto.io/
xaa.es (selesai, belum, sedang dikerjakan, "siap produksi 100%"), rencana riset. Situs yang ditandai terjual tidak
disentuh.

### 14.7 Nanti, hanya dengan izin pemilik

Penawaran investor (hingga 30 %) di axto.io dan xaa.es disembunyikan secara default di index dan portal member,
dengan tombol tampil/sembunyi di portal admin; perbaikan menyeluruh axto.io; riset dan pengembangan aplikasi.

---

## 15. SEO seluruh situs (pemilik, 27 Okt 2026)

Pemilik: **"Tolong perbaiki dulu seluruh SEO websitenya, perkata, link xmlsitemap dan file2 lain yg d butuhkan dll,
backlink yg tidak melanggar adsense d seluruh situs, karena masih banyak masalah, setelah itu baru lanjutkan pekerjaan
pembuatan auction xaa.es dan axto.io"**. Urutan kerja: SEO dulu (semua situs), lalu lelang xaa.es dan axto.io.

### 15.1 Temuan audit 26 situs statis (`sites/`, hasil build, 27 Okt)

| Temuan | Jumlah | Penyebab |
|---|---|---|
| `<title>` lebih dari 60 karakter (Google memotongnya) | 1.102 halaman | judul artikel panjang + " · NAMA SITUS" ditempel di belakang |
| meta description lebih dari 160 karakter | 1.019 halaman | ringkasan frontmatter boleh 200 karakter dan dipakai apa adanya |
| kata kunci URL tidak ada di judul/H1 | 9 halaman nyata (36 lainnya salah baca ä/ü/ö auditor) | judul memakai sinonim, misalnya `/smartphone-speicher-freigeben/` → "Handyspeicher voll" |
| og:image berupa SVG | 26 situs | Facebook, X, LinkedIn, WhatsApp tidak menampilkan SVG |
| JSON-LD Article tanpa `image` | 22 situs | Google menyarankan gambar di setiap Article |
| tidak ada web manifest, apple-touch-icon, favicon.ico | 26 situs | ikon di Android/iPhone/Bing dan hasil pencarian |
| tidak ada `llms.txt` dan `/.well-known/security.txt` | 26 situs | ringkasan untuk mesin pencari AI; kontak keamanan (RFC 9116) |
| header HSTS dan X-Frame-Options | 26 situs | dinilai di audit live (keamanan) |
| tautan ke situs sendiri | 1 halaman per situs (halaman ekosistem), 3–5 tautan berlabel merek | sudah aman; tidak ada jaringan tautan antar-situs statis |

Sitemap, robots.txt (baris Sitemap), canonical, satu H1, ads.txt, 404 dan feed sudah benar di semua situs.

### 15.2 Perbaikan di engine (berlaku otomatis untuk semua situs, sekarang dan nanti)

- **Judul per kata kunci.** Setiap judul artikel menaruh kata kuncinya di depan ("Heizkörper entlüften: Wann es …"),
  jadi `<title>` = judul lengkap bila muat 60 karakter; bila tidak, dipotong di jeda kalimat terakhir yang muat
  (`:` `?` `!` `–` `—`, lalu koma), ditambah " · NAMA" bila masih muat. Tidak ada dua halaman dengan judul sama
  (bila potongan sudah dipakai, dipilih potongan berikutnya). H1, og:title dan isi tetap judul lengkap. `seoTitle:`
  di frontmatter untuk judul khusus (dipakai di 9 artikel yang kata kuncinya berbeda dari URL).
- **Description ≤ 160** dipotong di akhir kalimat (bukan di tengah kata); og:description tetap lengkap.
- **Gambar bagikan** `og.png` 1200×630 (dengan `og:image:width/height/alt`), juga untuk `image` di JSON-LD Article.
- **Ikon**: `favicon.ico` 48 px, `apple-touch-icon.png` 180 px, `icon-192.png`, `icon-512.png` (dibuat dari
  `favicon.svg` dengan `sites/_engine/icons.mjs`), `site.webmanifest`, logo Organization = `icon-512.png`.
- **`llms.txt`** (llmstxt.org): nama, ringkasan, bahasa, semua artikel per kategori dengan ringkasannya, halaman wajib.
- **`/.well-known/security.txt`**: kontak redaksi situs (yang sudah tercantum di halaman Kontak), kedaluwarsa 360
  hari dan diperbarui setiap deploy.
- **Header**: `Strict-Transport-Security: max-age=31536000` (tanpa includeSubDomains, supaya subdomain e-mail tidak
  terpaksa HTTPS) dan `X-Frame-Options: SAMEORIGIN` (iklan AdSense tetap tampil; yang dicegah hanya situs lain
  membingkai situs kita).

### 15.3 Gerbang SEO (wajib lulus sebelum deploy)

`sites/_engine/seo.mjs` membaca hasil build seperti mesin pencari dan dipanggil `check.mjs`; deploy berhenti bila ada
yang gagal: judul 10–60 dan unik, description ≤ 160 dan unik, canonical = URL halaman sendiri, tepat satu H1,
Open Graph + Twitter card, JSON-LD valid, tidak ada noindex di situs live, `<img>` dengan alt (dan width/height),
sitemap = semua halaman (tanpa dobel, tanpa host lain, lastmod valid), robots.txt dengan Sitemap, ads.txt, 404,
feed + `<link rel=alternate>`, favicon, manifest, apple-touch-icon, llms.txt, security.txt, dan tautan ke situs
sendiri (tidak tersembunyi, tidak kosong, tidak di dalam isi artikel kecuali halaman ekosistem, paling banyak
segelintir per halaman). Hasil 27 Okt: **26 dari 26 situs ALL OK, 0 gagal**; satu catatan (zavik.de
`/katzenwissen/krankheitsanzeichen-erkennen/`, judul "Ist meine Katze krank?" memang kata kunci yang dicari orang).

### 15.4 Backlink yang tidak melanggar AdSense (aturan tetap)

Kebijakan Google (link spam) melarang jaringan tautan buatan, tukar tautan berlebihan, tautan tersembunyi, dan teks
jangkar penuh kata kunci; AdSense menolak situs yang tampak dibuat untuk tautan atau iklan. Jadi:

1. Setiap situs menautkan proyek pemilik **hanya** dari halaman ekosistemnya sendiri (`promo` di `site.json`) dan
   menu/footer yang menuju halaman itu: 3–5 tautan, teks jangkar = nama merek (AXTO, XAA, ulyah.com), label jujur
   "dari penerbit yang sama", UTM untuk menghitung kunjungan, tanpa `nofollow` (situs sendiri, bukan iklan).
2. **Tidak ada** tautan footer massal antar-26 situs, tidak ada blogroll, tidak ada tautan di dalam isi artikel ke
   situs sendiri, tidak ada tukar tautan, tidak ada tautan berbayar. `seo.mjs` menggagalkan tautan kosong/tersembunyi
   dan memberi peringatan bila ada tautan ke situs sendiri di isi artikel atau lebih dari 8 di halaman ekosistem.
3. Backlink dari luar dicari dengan cara yang diizinkan: isi yang layak dikutip (panduan, tabel, data), profil resmi
   di media sosial dan direktori yang relevan, Search Console + Bing Webmaster untuk setiap domain. Tidak membeli
   tautan, tidak memakai PBN.

### 15.5 Situs aplikasi dan repo mitra (audit live, berikutnya)

Situs aplikasi tidak dibangun oleh engine ini: axto.io (guardian-ai), xaa.es (xaa), ulyah.com/xad.es/1fr.fr/tilawa.de/
dawa.im (`apps/web`), axto.us, axto.dev, jai.lat, lie.skin, oldco.in, profity.in. Pemeriksaan live dijalankan dari
GitHub Actions (`xaa/scripts/seo-audit.mjs`, `seo-audit.yml`; sandbox tidak bisa menjangkau situs live) untuk semua
domain sekaligus, termasuk 26 situs statis, lalu temuannya diperbaiki per repo dengan standar yang sama (§15.2–15.4).
dawa.es dan situs yang sudah terjual tidak disentuh.

| Langkah | Status |
|---|---|
| 26 situs statis: engine + gerbang + 9 judul khusus | ✅ 27 Okt (PR ulyah.com) |
| Daftar domain audit live diperluas ke 38 domain; Search Console dicek lewat TXT DNS; judul ≤ 60 / description ≤ 160 di halaman sampel; security.txt, manifest, apple-touch-icon, og:image raster | ✅ 27 Okt (xaa PR #26) |
| Audit live semua domain (`seo-audit.yml`) | 🔄 dijalankan setelah 26 situs ter-deploy |
| Perbaikan temuan di setiap repo aplikasi | ⏳ |
| Blueprint HTML yang bisa diunduh (`docs/BLUEPRINT.html`) | ✅ 27 Okt |

## 16. Unit iklan in-article + multiplex (pemilik, 27 Okt 2026) — ⏸ DITAHAN

Perintah: "Tolong masukin kode iklan ini di setiap website yg punya pub sama, di setiap halaman 4 iklan, 2 iklan 2
iklan, pastikan tidak mengganggu artikel" — unit **Iklan artikel** (`data-ad-layout="in-article"`,
`data-ad-format="fluid"`, slot `2546519628`) dan **Iklan multiplex horizontal** (`data-ad-format="autorelaxed"`, slot
`5109103787`), penerbit `ca-pub-8991272269211824`. Lalu: **"Kode iklan jgn d kerjain dulu"** → tidak ada yang dipasang
sampai pemilik melepasnya (guardian-ai `docs/REQUESTS.md` 109).

Rencana bila dilepas (dicatat agar tidak lupa, belum dibangun):

| Hal | Rencana |
|---|---|
| Situs | penerbit yang sama: ulyah.com, 1fr.fr, tilawa.de, dawa.im (`apps/web`, `ad-config.ts`), axto.io (guardian-ai), xaa.es (xaa) |
| Jumlah | 4 unit per halaman: 2 in-article + 2 multiplex; halaman tanpa isi (login, checkout, portal member, admin, 404, halaman hukum) tidak diberi iklan |
| Letak in-article | di antara paragraf, setelah ± 30 % dan ± 70 % isi, tidak pernah di dalam ayat, hadis, kode, tabel, daftar langkah atau formulir; tidak di atas judul |
| Letak multiplex | setelah isi (sebelum artikel terkait) dan di atas footer |
| Pemuat | satu `adsbygoogle.js?client=…` per halaman (bukan per unit), dimuat setelah persetujuan cookie/TCF di negara yang mewajibkan |
| Jarak & tata letak | ruang dicadangkan (min-height) agar CLS tidak naik; label "Iklan/Anzeige/Publicité/Anuncio/Advertisement"; tidak menempel tombol |
| Larangan | tidak ada iklan di halaman tanpa isi utama, tidak ada tulisan "klik iklan", tidak ada iklan di dalam elemen yang bisa disentuh tak sengaja |
| Uji | hitung `ins.adsbygoogle` per jenis halaman = 4, satu skrip pemuat, CLS di Lighthouse tidak memburuk, `ads.txt` tetap ada |

## 17. ulyah.com dijual (pemilik, 28–29 Okt 2026)

Perintah pemilik (tabel log di atas, 28 dan 29 Okt): situs muslim **ulyah.com** dijual, ditulis di **paling depan
beranda** dan lewat **menu khusus di header (bukan footer)**, harga **US$250.000 bisa nego**, **penawaran minimum
US$50.000**, harga di posisi paling jelas, penjelasan lengkap isi situs, dan tautan **YouTube live Mekkah 24 jam** diatur
dari **portal admin ulyah.com**. Sejak 29 Okt situs mitra (1fr.fr, tilawa.de, xad.es, dawa.im) juga dijual dengan cara
yang sama dan dari portal yang sama (§17.3).

### 17.1 Yang dibangun

| Bagian | Isi |
|---|---|
| Beranda | Pita penjualan di paling atas (sebelum hero): "ULYAH.COM dijual", **US$250.000 · bisa nego**, **penawaran minimum US$50.000**, tombol ke halaman penjualan |
| Header | Menu khusus berwarna emas "🏷️ Dijual" di baris menu utama (desktop dan menu HP), bukan di footer |
| Halaman `/acquisition` (ulyah.com) | Kartu harga paling depan; isi situs dengan angka nyata (Al-Qur'an 604 halaman mushaf bertajwid, terjemahan & tafsir, hadits, perpustakaan kitab, kitab pesantren, sanad, kisah, anak, audiobook, radio qori, suara untuk kitab dan Al-Qur'an, jadwal sholat, kiblat, kalender hijriyah, imsakiyah, zakat, waris, tanya AI, 29 bahasa, PWA); sumber pendapatan (AdSense, iklan paket haji & umroh, sewa slot live YouTube, donasi, toko afiliasi, widget); **live Mekkah 24 jam** tertanam; apa yang diterima pembeli; langkah serah terima; formulir penawaran; FAQ; JSON-LD |
| Formulir penawaran | Nama, e-mail, WhatsApp, negara, perusahaan, nilai tawaran (**ditolak di bawah minimum**), pesan; tersimpan di **R2** (satu dokumen per tawaran, tulis sekali), batas laju per IP |
| Admin → **Situs dijual** | Tampil/sembunyi (bawaan **tampil**), harga, minimum, bisa nego, kontak WhatsApp & e-mail, **tautan YouTube live Mekkah 24 jam** (kosong = kanal Masjidil Haram di tab Live streams), daftar tawaran dengan status (baru, dihubungi, negosiasi, ditolak, diterima) dan catatan; setiap perubahan masuk log audit |
| Penyimpanan | Hanya **R2** (`MEDIA_R2`): `k/site-sale.json` (pengaturan, compare-and-swap), `c/sale-offers/<id>.json` (tawaran, create-once) — tidak ada tabel atau query D1 baru |

### 17.2 Status

| Butir | Status |
|---|---|
| Dicatat di blueprint | ✅ 29 Okt |
| Kode, tes, PR #380, merge | ✅ 29 Okt (CI hijau, `16bb0710`) |
| Deploy, cek live | ✅ 29 Okt — deploy 558; live probe dan `admin-live-check.yml`: ulyah.com/acquisition 200 dengan US$250.000 |

### 17.3 Situs mitra juga dijual, semua lewat ulyah.com (pemilik, 29 Okt 2026)

Perintah pemilik: „1fr.fr dawa.im tilawa.de termasuk xad.es itu jg jual semua, sama kaya ulyah.com pembayaran ngikutin
ulyah.com, semua terkoneksi ke ulyah.com".

| Bagian | Isi |
|---|---|
| Setiap situs | Pita penjualan di paling atas beranda, menu emas di header, halaman `/acquisition` lengkap dengan harga di posisi paling jelas, formulir penawaran, live Makkah, FAQ — **dalam bahasa situs itu** (1fr.fr Prancis, tilawa.de Jerman, dawa.im Spanyol, xad.es Inggris) |
| Harga bawaan | Pemilik 29 Okt: „Harga sama $250k" — **setiap situs US$250.000, bisa nego, penawaran minimum US$50.000**, sama dengan ulyah.com (harga lama US$30.000 dari 27 Okt diganti). Semua bisa diubah per situs di Admin |
| Pembayaran dan kontak | Mengikuti ulyah.com: WhatsApp dan e-mail pemilik dari pengaturan ulyah.com, langkah pembelian dan cara bayar yang sama; semua tawaran masuk ke Admin → Situs dijual di ulyah.com dengan nama situsnya |
| Admin ulyah.com → Situs dijual | Satu tabel untuk lima situs: tampil/sembunyi, harga, minimum, bisa nego per situs; tawaran bisa disaring per situs |
| Saling terhubung | Setiap halaman penjualan menampilkan situs lain yang juga dijual, dengan harganya dan tautannya |
| Demo portal admin | Halaman penjualan setiap situs menampilkan cara masuk portal admin situs itu: alamat `/admin`, username dan password demo (hanya-lihat, §18) |
| Penyimpanan | Hanya R2: `k/site-sale.json` (ulyah.com) dan `k/site-sale/<situs>.json` (situs mitra), tawaran di `c/sale-offers/` dengan kolom `site` |
| Dibangun | `GET /sale?site=`, `GET /sale/network`, `POST /sale/offers` dengan `site`; teks penjualan per bahasa (`lib/sale-copy.ts`: id, fr, de, es, en); `SiteSale` menggantikan `UlyahSale`; menu "🏷️ Site à vendre / Zu verkaufen / Sitio en venta / For sale"; Admin → Situs Dijual: lima kartu harga, kontak bersama, saring tawaran per situs |

| Butir | Status |
|---|---|
| Dicatat di blueprint | ✅ 29 Okt |
| Kode dan tes (`scripts/check-site-sale.ts` 10/10) | ✅ 29 Okt |
| Uji browser lokal kelima situs (desktop + HP) | ✅ 29 Okt — ulyah.com 23/23, 1fr.fr 20/20, tilawa.de 20/20, dawa.im 20/20, xad.es 15/20 (5 "gagal" karena harga xad.es baru saja diubah ke US$275.000 dari Admin ulyah.com dalam tes yang sama — membuktikan kendali dari ulyah.com sampai ke pita, menu dan halaman xad.es); portal admin ulyah.com 30/30, 1fr.fr 15/15 |
| PR #382, deploy 560 | ✅ 29 Okt (`0ceac5b8`) |
| Cek live (`admin-live-check.yml`, run 2) | ✅ 29 Okt — `/acquisition` 200 di kelima situs: ulyah.com US$250.000, 1fr.fr 250 000 $ US, tilawa.de 250.000 US$, dawa.im 250.000 US$, xad.es US$250,000; login demo dan portal admin setiap situs lulus |

## 18. Portal admin setiap situs: mandiri, demo hanya-lihat, mudah untuk promosi (pemilik, 29 Okt 2026)

Perintah pemilik: „Aktifin admin panel mereka masing2, agar mandiri, kasih cara masuk admin panel nya dengan username dan
password demo, mereka hanya bisa melihat2... Kembangkan dulu portal adminya untuk semuanya, agar pembeli melihat nya
nyaman, dan betul2 mudah di gunakan untuk promosi haji umroh, youtube anak, dan promo youtube".

### 18.1 Temuan

- Login admin di domain situs mitra (1fr.fr/admin dan lainnya) **tidak bisa bertahan**: cookie sesi admin dipasang
  `SameSite=Strict` di `api.ulyah.com`, jadi browser tidak pernah mengirimnya dari 1fr.fr, tilawa.de, dawa.im atau xad.es.
- Akun demo hanya ada untuk 1fr.fr dan tilawa.de (di D1, password tidak tercatat), dan akun demo bisa **membaca semua**
  menu admin — termasuk donasi, klien, log audit dan kunci AI. Tidak aman untuk dibagikan ke calon pembeli.
- Live YouTube dan kanal YouTube anak adalah **satu daftar bersama** untuk semua situs (D1): admin situs mitra tidak bisa
  mengatur promosinya sendiri.

### 18.2 Yang dibangun

| Bagian | Isi |
|---|---|
| Alamat API admin sendiri | `api.1fr.fr`, `api.tilawa.de`, `api.dawa.im`, `api.xad.es` dipasang ke Worker API yang sama; panggilan `/admin/*` dari setiap situs memakai alamat situsnya sendiri, jadi cookie sesi berlaku dan login bertahan |
| Login demo setiap situs | `demo@<domain>` dengan password acak yang dibuat sekali dan disimpan di **R2** (`k/admin-demo/<situs>.json`); pemilik bisa membuat password baru atau mematikan demo dari Admin ulyah.com; tampil di halaman penjualan situs itu |
| Demo hanya-lihat dan aman | Akun demo hanya bisa **membuka** menu promosi dan isi situs (Haji & Umroh, YouTube anak, promo YouTube, halaman situs); data pribadi, keuangan, kunci dan log selalu ditolak di server |
| Tampilan admin baru | Kepala portal bermerek situs (logo, nama, domain), menu dikelompokkan, beranda **Promosi** dengan tiga kartu besar — 🕋 Haji & Umroh, 🧒 YouTube Anak, 📺 Promo YouTube — beserta jumlah isi dan langkah singkat; teks portal dalam bahasa situs |
| Promosi mandiri per situs | Slot promo YouTube dan kanal YouTube anak setiap situs disimpan di **R2** (`k/promo/<situs>/youtube.json`, `k/promo/<situs>/kids.json`); halaman /live dan halaman anak di situs itu memakai daftarnya sendiri. Paket Haji & Umroh sudah per situs |

### 18.3 Status

| Butir | Status |
|---|---|
| Dicatat di blueprint | ✅ 29 Okt |
| Kode dan tes | ✅ 29 Okt — `scripts/check-admin-portal.ts` (CI) 4/4; uji browser lokal ulyah.com 30/30 dan 1fr.fr 15/15 (pemilik, admin situs, demo; desktop dan HP; tanpa error) |
| PR #381 (CodeQL hijau setelah 2 temuan diperbaiki), merge | ✅ 29 Okt (`5fc12b69`) |
| Deploy (run 559) dan alamat API admin tiap situs | ✅ 29 Okt — `api.1fr.fr`, `api.tilawa.de`, `api.dawa.im`, `api.xad.es` terpasang dan menjawab |
| Cek live di browser (`admin-live-check.yml`) | ✅ 29 Okt — kelima situs: login demo di domain situs sendiri, beranda Promosi dalam bahasa situs, tanpa menu pribadi, API menolak donasi dan kunci (403) |

### 18.5 Haji & Umroh tanpa harga (pemilik, 29 Okt 2026)

Perintah pemilik: „Jgn d kasih harga dulu haji umroh, kosongin harganya atau kasih keterangan i sewakan slot nya".

- Halaman Haji & Umroh di kelima situs tidak menampilkan harga apa pun. Harga paket memang tidak pernah tampil, tetapi
  label kartu dan ajakan sewa masih menulis harga sewa ("Disewakan · $1/hari", "hanya $1 per hari"). Kini kartu menulis
  **"Slot disewakan"** (dalam bahasa situs) dan ajakan sewa mengundang biro perjalanan menghubungi untuk ketentuannya.
- Deskripsi halaman dan meta (9 bahasa) tidak lagi menjanjikan "harga transparan".
- Editor admin tidak punya kolom harga; menyimpan sebuah paket mengosongkan harganya.

### 18.4 Dua jalur kendali, terhubung ke ulyah.com (pemilik, 29 Okt 2026)

Perintah pemilik: „Untuk saat ini make 2 jalur, bisa dari ulyah.com maupun bisa mandiri, klo nanti ada yg beli baru di
putus satu per satu, agar lebih mudah d kontrol koneksikan dulu ke ulyah.com".

- **Jalur 1 — dari ulyah.com:** pemilik masuk ke ulyah.com/admin, memilih situs (ulyah.com, 1fr.fr, tilawa.de, dawa.im,
  xad.es) di setiap halaman promosi, lalu mengubah paket Haji & Umroh, promo YouTube dan YouTube anak situs itu.
- **Jalur 2 — mandiri:** admin situs itu sendiri masuk ke `<domain>/admin` dan hanya mengatur situsnya.
- Keduanya menulis ke data yang sama (API dan R2 ulyah.com), jadi perubahan dari jalur mana pun langsung tampil.
- **Saat sebuah situs terjual**, situs itu diputus sendiri: data promosinya disalin ke akun pembeli, akun admin dan demo
  situs itu dimatikan di sini, dan alamat API admin-nya dilepas — situs lain tidak tersentuh.

## 19. Audit terjemahan dan isi semua situs, nol bug (pemilik, 29 Okt 2026)

Perintah pemilik: „Cek jg translate dan seluruh isi nya, apakah masih ada yg tidak konsisten, error, bug dll atau masih ada
yg tidak d terjemahkan... Kerjakan semuanya setelah bikin penjualan,,, bikin yg profesional elegan indah termasuk di
ulyah.com, jgn ada css yg error, dari A-Z wajib zero bug error dan miss".

Urutan: setelah §18 (portal admin) dan §17.3 (penjualan situs mitra) tayang. Cakupan: ulyah.com, 1fr.fr, tilawa.de,
dawa.im, xad.es — setiap halaman di menu dan sitemap, desktop dan HP: teks yang masih bahasa lain, istilah yang tidak
konsisten antarhalaman, kesalahan JavaScript, permintaan gagal, CSS yang rusak (tumpang tindih, meluber, kontras),
lalu diperbaiki dan diuji ulang sampai bersih.

Alat: `scripts/site-quality-audit.mjs` (dijalankan `site-quality-audit.yml` di runner GitHub, karena sandbox tidak bisa
membuka domain produksi) membaca `/sitemap.txt` setiap situs, membuka semua halaman tingkat atas (desktop dan HP) dan
sampel halaman dalam per bagian, lalu mencatat status, error JavaScript, permintaan gagal (termasuk prefetch Next.js
`?_rsc=`), gulir ke samping di HP dan kata dalam bahasa yang salah beserta kalimatnya. Laporan lengkap disimpan sebagai
artefak `audit-report.json`.

### 19.1 Menu bahasa di setiap situs (pemilik, 29 Okt 2026)

Perintah pemilik: „Translate di masing2 situs di bikinin, biar saling berbagi link untuk translate nya".

- Sebelumnya hanya ulyah.com yang punya menu 🌐; situs mitra tidak, karena setiap situs mitra hanya memuat bahasanya
  sendiri dan daftar menu dibangun dari situ.
- Kini kelima situs punya menu yang sama: Bahasa Indonesia → ulyah.com, English → xad.es, Deutsch → tilawa.de,
  Français → 1fr.fr, Español → dawa.im (tanpa bahasa situs itu sendiri). Setiap pilihan membuka **halaman yang sama**
  dalam bahasa itu, dengan alamat yang benar di situs tujuan (mis. 1fr.fr/direct → xad.es/live, dawa.im/en-vivo,
  ulyah.com/live) — pasangan yang sama dengan hreflang; halaman yang tidak ada di bahasa itu (mis. /syukur) membuka
  beranda situs tujuan.

Temuan awal (live probe 29 Okt, sebelum audit penuh):
- Prefetch Next.js ke halaman tanpa awalan bahasa menjawab **404** (`/quran?_rsc=`, `/hadits?_rsc=`, `/acquisition?_rsc=`,
  `/kitab-pesantren?_rsc=`) — navigasi tetap jalan karena browser jatuh ke muat ulang penuh, tetapi lebih lambat dan
  meninggalkan error di konsol.
- `/kisah/tokoh/idris?_rsc=` menjawab **500**.
- Beranda dan `/kitab` tidak pernah "diam" di jaringan karena audio murottal terus memuat — perlu dicek apakah audio
  diputar otomatis tanpa diminta.

| Butir | Status |
|---|---|
| Dicatat di blueprint | ✅ 29 Okt |
| Alat audit | ✅ 29 Okt |
| Audit penuh, perbaikan, tes, PR, deploy, cek ulang | 🔄 |

## 20. Pengucapan Arab asli untuk tajwid anak dan game anak (pemilik, 29 Okt 2026)

Perintah pemilik: „Untuk kitab tajwid anak, game anak, gunakan pwngucapanya menggunakan lidah orang Arab, agar faseh dan
makhroj nya tepat, tinggal pilih pembacanya \"laki perempuan dewasa atau anak2\"".

- Semua suara Arab di bagian anak (tajwid anak, huruf hijaiyah, Iqro, game anak) diucapkan oleh **penutur Arab asli** —
  fasih, makhraj tepat — bukan suara mesin berlogat lain.
- Pengunjung memilih pembacanya: **laki-laki dewasa, perempuan dewasa, atau anak-anak**; pilihan diingat di perangkat.
- Sumber suara harus benar-benar penutur Arab (rekaman qari/guru, atau suara sintetis Arab asli yang diperiksa
  makhrajnya); tidak ada klaim yang tidak benar tentang siapa pembacanya.
- Langkah pertama saat dikerjakan: daftar semua tempat suara Arab di bagian anak, cek sumber suaranya sekarang, lalu
  pilih sumber untuk tiga pilihan pembaca.

| Butir | Status |
|---|---|
| Dicatat di blueprint | ✅ 29 Okt |
| Inventaris suara, pilihan pembaca, tes, PR, deploy | ⏳ setelah §18, §17.3 dan §19 |
