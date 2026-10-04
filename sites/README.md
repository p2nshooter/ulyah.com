# sites/ — situs artikel statis (siap AdSense, siap dijual)

Setiap folder di sini adalah **satu situs lengkap** yang berdiri sendiri:

```
sites/
  _engine/            pembangun bersama (Node 22, tanpa dependensi)
    build.mjs         site.json + content/ + theme/ → dist/
    check.mjs         gerbang kesiapan AdSense (wajib lulus sebelum deploy)
    export.mjs        backup satu langkah → <domain>-backup-<tanggal>.tar.gz
    lib/markdown.mjs  pengubah Markdown → HTML
  dawo.es/
    site.json         identitas: nama, kepanjangan, bahasa, akun AdSense, menu, kategori
    ADSENSE.txt       tiga kode dari Google, ditulis manual: script, ads.txt, tag meta
    content/articles/ DATABASE artikel (Markdown + frontmatter)
    content/pages/    halaman wajib: tentang, kontak, privasi, cookie, aviso legal, …
    theme/            HTML (templates.mjs), CSS dan JS milik situs ini SAJA
    public/           favicon, gambar OG
    wrangler.jsonc    Worker statis milik situs ini
```

## Perintah

```bash
node sites/_engine/build.mjs dawo.es     # bangun ke sites/dawo.es/dist
node sites/_engine/check.mjs dawo.es     # bangun + cek syarat AdSense
node sites/_engine/export.mjs dawo.es    # backup lengkap untuk disimpan/dijual
```

## Deploy

`.github/workflows/deploy-sites.yml` membangun, mengecek, dan men-deploy setiap
situs di folder ini setiap kali ada perubahan di `sites/` yang masuk ke `main`.

- Situs langsung online di alamat `*.workers.dev`.
- Domain (misalnya dawo.es) terpasang otomatis begitu zonanya ada di akun
  Cloudflare. Selama belum, workflow memberi peringatan, tetapi situs tetap
  online.
- Tidak ada Worker script, D1 atau R2. Situs ini tidak ikut mati kalau API
  ulyah.com, kuota D1 atau R2 bermasalah.

## Menambah artikel

Buat file baru di `content/articles/` dengan nama `judul-artikel.md`:

```markdown
---
title: Judul artikel
description: Ringkasan 70–200 karakter untuk Google dan kartu artikel.
category: slug-kategori-dari-site.json
date: 2026-10-04
---
Isi artikel dalam Markdown: ## subjudul, paragraf, - daftar, | tabel |, **tebal**.
```

Gerbang `check.mjs` menolak deploy kalau:

- jumlah artikel kurang dari 40;
- ada artikel di bawah 1.200 kata, atau rata-ratanya di bawah 1.400 kata;
- ada judul yang dobel;
- ada halaman wajib yang hilang;
- akun AdSense, ads.txt, atau tag meta tidak sama dengan `ADSENSE.txt`;
- ada jaringan iklan lain;
- ada tautan internal yang rusak.

## Situs yang belum punya akun AdSense

Kosongkan atau hapus `"adsense"` di `site.json`. Situs tetap dibangun dan
online (persiapan). Begitu kode AdSense ada:

1. isi `"adsense": "ca-pub-…"` di `site.json`;
2. tulis ketiga cuplikan dari Google (script, ads.txt, tag meta) ke
   `ADSENSE.txt`. Contohnya ada di `sites/qkb.es/ADSENSE.txt`, dan daftar
   semua domain ada di `docs/ADSENSE-CODES.md`;
3. push.

`check.mjs` memastikan setiap halaman memuat tag meta dan script yang sama
persis dengan `ADSENSE.txt`, dan ads.txt berisi baris yang sama.

## Menjual sebuah situs

`node sites/_engine/export.mjs <domain>` menghasilkan satu arsip berisi engine,
folder situs, dan README cara memasangnya di akun Cloudflare pembeli. Sebelum
diserahkan, ganti `adsense` dan `trackId` di `site.json` (lihat README di dalam
arsip).

## Aturan desain

Setiap situs punya tema "Istana Nabi Sulaiman" sendiri (docs/ADSENSE-BLUEPRINT.md
§4). Tidak ada CSS bersama antar-situs: setiap `theme/` ditulis dari nol, dengan
kelas, palet, font dan animasi menunya sendiri. Animasi Spanyol juara Piala
Dunia 2026 (§5) juga dibuat ulang di setiap tema dengan gayanya masing-masing.
