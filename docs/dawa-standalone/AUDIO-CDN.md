# Audio dawa.es — semuanya dari CDN, tidak ada yang perlu diunduh

**Ringkasnya:** backup ini **tidak berisi satu file audio pun**, dan memang tidak
perlu. Semua bacaan Al-Qur'an (murottal) diputar **langsung dari CDN milik para
qari**. Server dawa.es tidak menyimpan, tidak mengunduh, dan tidak menyajikan
byte audio murottal. Biaya penyimpanan: nol.

Kebijakan pemilik yang berlaku: *"hilangin audio2 alquran murottal ganti dengan
cdn"* dan *"maximalin aja dawa.es dr cdn"*.

---

## 1. Dari mana audio diputar

Kode penentunya: `dawa-es/apps/web/src/lib/qori-cdn.ts`.

| Jenis sumber | Kode `cdn` | Rumus URL | Butuh API? |
|---|---|---|---|
| alquran.cloud / Islamic Network | `aqc` | `https://api.alquran.cloud/v1/surah/{surah}/{edisi}` → field `audio` tiap ayat, **dipaksa ke 128 kbps**: `https://cdn.islamic.network/quran/audio/128/{edisi}/{nomorAyatGlobal}.mp3` | Ya, satu JSON kecil per surah (di-cache di `localStorage`) |
| everyayah.com | `ey` | `https://everyayah.com/data/{folder}/{SSS}{AAA}.mp3` (SSS = nomor surah 3 digit, AAA = nomor ayat 3 digit; contoh Al-Fatihah:1 = `001001.mp3`) | Tidak, murni rumus |
| quranicaudio.com | `surah` | satu file per surah, contoh `https://download.quranicaudio.com/quran/muammar_za/{SSS}.mp3` | Tidak |

**Cadangan (backstop):** `https://api.dawa.es/audio/qori2/{folder}/{SSS}{AAA}.mp3`
tidak menyajikan audio — ia **menjawab 302 redirect** ke file CDN yang sama
(`dawa-es/apps/worker-api/src/routes/audio.ts` + `lib/murottal-sources.js`).
Gunanya: kalau API alquran.cloud lambat, pemutar tetap bisa bunyi karena
redirect ini murni rumus.

CI menjaga aturan ini: `scripts/check-murottal-cdn.ts` menjalankan route audio
dengan binding penyimpanan yang **meledak kalau disentuh** — kalau suatu saat ada
kode yang mencoba menyajikan audio dari R2, CI merah.

## 2. Daftar lengkap 32 qari

Qari default: **Mishary Rashid Al-Afasy** (`ar.alafasy`).

Radio dawa.es memutar **seluruh 17 suara alquran.cloud** secara bergiliran
(mulai dari urutan ke-11, `TENANT_RADIO_START.dawa = 11` di `qori-cdn.ts`).
Karena dawa.es sekarang situs tunggal, angka mulai itu boleh diubah bebas.

| # | Qari | Negara | Kunci | Sumber (URL) |
|---|---|---|---|---|
| 1 | Abdurrahman As-Sudais | Arab Saudi | `ar.abdurrahmaansudais` | `cdn.islamic.network/quran/audio/128/ar.abdurrahmaansudais/{n}.mp3` |
| 2 | Maher Al-Muaiqly | Arab Saudi | `ar.mahermuaiqly` | `cdn.islamic.network/quran/audio/128/ar.mahermuaiqly/{n}.mp3` |
| 3 | Saud Al-Shuraim | Arab Saudi | `ar.saoodshuraym` | `cdn.islamic.network/quran/audio/128/ar.saoodshuraym/{n}.mp3` |
| 4 | Ali Al-Hudhaify | Arab Saudi | `ar.hudhaify` | `cdn.islamic.network/quran/audio/128/ar.hudhaify/{n}.mp3` |
| 5 | Muhammad Ayyub | Arab Saudi | `ar.muhammadayyoub` | `cdn.islamic.network/quran/audio/128/ar.muhammadayyoub/{n}.mp3` |
| 6 | Abu Bakr Al-Shatri | Arab Saudi | `ar.shaatree` | `cdn.islamic.network/quran/audio/128/ar.shaatree/{n}.mp3` |
| 7 | Abdullah Basfar | Arab Saudi | `ar.abdullahbasfar` | `cdn.islamic.network/quran/audio/128/ar.abdullahbasfar/{n}.mp3` |
| 8 | Hani Ar-Rifai | Arab Saudi | `ar.hanirifai` | `cdn.islamic.network/quran/audio/128/ar.hanirifai/{n}.mp3` |
| 9 | Yasser Ad-Dussary | Arab Saudi | `ey.dussary` | `everyayah.com/data/Yasser_Ad-Dussary_128kbps/{SSS}{AAA}.mp3` |
| 10 | Abdullah Al-Matroud | Arab Saudi | `ey.matroud` | `everyayah.com/data/Abdullah_Matroud_128kbps/{SSS}{AAA}.mp3` |
| 11 | Mishary Rashid Al-Afasy | Kuwait | `ar.alafasy` | `cdn.islamic.network/quran/audio/128/ar.alafasy/{n}.mp3` |
| 12 | Ahmed Al-Ajami | Kuwait | `ar.ahmedajamy` | `cdn.islamic.network/quran/audio/128/ar.ahmedajamy/{n}.mp3` |
| 13 | Abdul Basit Abd us-Samad | Mesir | `ar.abdulbasitmurattal` | `cdn.islamic.network/quran/audio/128/ar.abdulbasitmurattal/{n}.mp3` |
| 14 | Mahmoud Khalil Al-Husary | Mesir | `ar.husary` | `cdn.islamic.network/quran/audio/128/ar.husary/{n}.mp3` |
| 15 | Al-Husary (Mujawwad) | Mesir | `ar.husarymujawwad` | `cdn.islamic.network/quran/audio/128/ar.husarymujawwad/{n}.mp3` |
| 16 | Mohamed Siddiq Al-Minshawi | Mesir | `ar.minshawi` | `cdn.islamic.network/quran/audio/128/ar.minshawi/{n}.mp3` |
| 17 | Al-Minshawi (Mujawwad) | Mesir | `ar.minshawimujawwad` | `cdn.islamic.network/quran/audio/128/ar.minshawimujawwad/{n}.mp3` |
| 18 | Muhammad Jibreel | Mesir | `ar.muhammadjibreel` | `cdn.islamic.network/quran/audio/128/ar.muhammadjibreel/{n}.mp3` |
| 19 | Muhammad Al-Tablawi | Mesir | `ey.tablawi` | `everyayah.com/data/Mohammad_al_Tablawi_128kbps/{SSS}{AAA}.mp3` |
| 20 | Ayman Suwayd | Libya | `ar.aymansuwayd` | `cdn.islamic.network/quran/audio/128/ar.aymanswoaid/{n}.mp3` |
| 21 | Nasser Al-Qatami | Qatar | `ey.qatami` | `everyayah.com/data/Nasser_Alqatami_128kbps/{SSS}{AAA}.mp3` |
| 22 | Khalifa Al-Tunaiji | Emirat Arab | `ey.tunaiji` | `everyayah.com/data/khalefa_al_tunaiji_64kbps/{SSS}{AAA}.mp3` |
| 23 | Salah Bukhatir | Emirat Arab | `ey.bukhatir` | `everyayah.com/data/Salaah_AbdulRahman_Bukhatir_128kbps/{SSS}{AAA}.mp3` |
| 24 | Al-Minshawi & Anak-anak | Mesir | `ey.minshawi_children` | `everyayah.com/data/Minshawy_Children_128kbps/{SSS}{AAA}.mp3` |
| 25 | Abdullah Awad Al-Juhany | Arab Saudi | `ey.juhany` | `everyayah.com/data/Abdullaah_3awwaad_Al-Juhaynee_128kbps/{SSS}{AAA}.mp3` |
| 26 | Saad Al-Ghamdi | Arab Saudi | `ey.ghamdi` | `everyayah.com/data/Ghamadi_40kbps/{SSS}{AAA}.mp3` |
| 27 | Ali Jaber | Arab Saudi | `ey.alijaber` | `everyayah.com/data/Ali_Jaber_64kbps/{SSS}{AAA}.mp3` |
| 28 | Ibrahim Al-Akhdar | Arab Saudi | `ey.akhdar` | `everyayah.com/data/Ibrahim_Akhdar_32kbps/{SSS}{AAA}.mp3` |
| 29 | Mahmoud Ali Al-Banna | Mesir | `ey.banna` | `everyayah.com/data/mahmoud_ali_al_banna_32kbps/{SSS}{AAA}.mp3` |
| 30 | Fares Abbad | Yaman | `ey.faresabbad` | `everyayah.com/data/Fares_Abbad_64kbps/{SSS}{AAA}.mp3` |
| 31 | Karim Mansouri | Aljazair | `ey.mansouri` | `everyayah.com/data/Karim_Mansoori_40kbps/{SSS}{AAA}.mp3` |
| 32 | H. Muammar ZA | Indonesia | `id.muammar` | `download.quranicaudio.com/quran/muammar_za/{SSS}.mp3` (per surah) |

`{n}` = nomor ayat global 1–6236 (Al-Fatihah:1 = 1, Al-Baqarah:1 = 8, …).

**Menambah qari:** tambahkan satu baris di `RECITERS` (`qori-cdn.ts`). Untuk
alquran.cloud cukup nama edisinya (daftar lengkap:
`https://api.alquran.cloud/v1/edition?format=audio`). Untuk everyayah cukup nama
folder (daftar: `https://everyayah.com/recitations_ayat.html`). Kalau ingin juga
punya backstop redirect, daftarkan foldernya di
`apps/worker-api/src/lib/murottal-sources.ts`.

## 3. Audio lain (bukan murottal) — dan di mana tempatnya

| Audio | Asal | Tempat | Perlu dipindah? |
|---|---|---|---|
| Narasi kisah/artikel (audiobook) | dibuat oleh workflow **Generate Audiobooks** (`scripts/generate-audiobooks.ts`, TTS gratis tanpa API key) | R2 `dawa-media`, kunci `audio/story/{id}.mp3`, dicatat di `stories.audio_r2_key` | Tidak wajib. Bisa dibuat ulang kapan saja dengan workflow itu. |
| Suara Al-Qur'an Kids | diunggah admin | R2 `kids-audio/…`, dicatat di tabel `kids_audio` | Opsional — salin dari R2 lama (PANDUAN §8.4) |
| Narasi TTS on-demand | Workers AI (binding `AI`) / kunci TTS di Key Pool | tidak disimpan permanen | Tidak |
| Suara pembaca di peramban (Web Speech) | `lib/speech.ts` di perangkat pengunjung | tidak ada | Tidak |

## 4. Mirror R2 (tidak disarankan)

Workflow **"Import murottal to R2"** (`import-murottal.yml`,
`scripts/import-murottal.mjs`) masih ada untuk hari ketika mirror sendiri
benar-benar dibutuhkan (mis. CDN qari mati). Ia **menolak jalan** tanpa input
`confirm=download`, butuh secret `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY`,
dan satu qari = 6.236 file. Pada paket gratis Cloudflare, jangan.

Workflow **"R2 storage — inventory and purge"** (`purge-murottal-r2.yml`)
menghapus sisa murottal lama dari R2. Di dawa-media yang baru, tidak ada yang
perlu dihapus.
