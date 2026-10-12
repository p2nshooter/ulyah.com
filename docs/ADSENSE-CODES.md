# Kode AdSense semua situs (ditulis manual)

Sumber kebenaran untuk kode AdSense setiap domain. Isinya ketiga cuplikan
persis seperti yang diberikan Google: script loader, baris ads.txt, dan tag
meta. Tag meta ditulis lengkap untuk setiap domain, termasuk yang tidak
ikut ditempel pemilik.

Situs di `sites/` juga punya salinan di `sites/<domain>/ADSENSE.txt`.
`sites/_engine/check.mjs` menolak deploy kalau hasil build berbeda satu
karakter saja dari file itu. Situs lain diperiksa di browser oleh
`.github/workflows/site-audit.yml`.

> **4 Okt 2026, SATU AKUN UNTUK SEMUA.** Pemilik: "sy mau focus jadi 1 akun
> saja… Ubah seluruh website ini kode AdSense, ads.txt & tag meta nya" dan
> "xad.es & xaa.es … samain … yg jgn di sentuh adalah dawa.es karena bukan
> milik sy lagi". Mulai hari ini **semua situs pemilik memakai
> `ca-pub-5693981744147503`**. Satu-satunya pengecualian adalah **dawa.es**:
> bukan milik pemilik lagi, jadi kodenya dibiarkan apa adanya dan tidak boleh
> disentuh oleh perubahan apa pun.

> **10 Okt 2026, pembagian akun baru dari pemilik.** Pesan pemilik (berurutan):
> 1. „axto.dev, axto.us, rubiy.de, dawo.es, zevok.de, zufiq.de … kode adsense nya
>    ca-pub-2990015102981265“, lalu koreksi: „Maaf di rubah… Untuk 4 website ini, kode
>    adsense nya make ini ca-pub-5693981744147503: axto.dev, dawo.es, zevok.de, zufiq.de“.
>    Jadi **axto.us dan rubiy.de → ca-pub-2990015102981265**; axto.dev, dawo.es, zevok.de,
>    zufiq.de kembali ke akun utama.
> 2. Domain baru: **jai.lat → ca-pub-6019445914743449, dai.lat → ca-pub-8469557036744946,
>    pab.lat → ca-pub-6146217038829045, rough.lat → ca-pub-5944786950535069,
>    rough.es → ca-pub-5693981744147503**.
> 3. **11 Okt 2026:** „xad.es kode adsense nya ganti dengan ini, buatin jg ads.txt dan tag
>    metanya“ → **xad.es → ca-pub-5517446616694631** (loader, ads.txt dan tag meta dari satu
>    konstanta di `apps/web/src/lib/ad-config.ts`).
> 4. **11 Okt 2026:** „ini jg ubah buatin jg ads.txt dan tag metanya zolun.de“ → **zolun.de →
>    ca-pub-6016479123891586** (sebelumnya 4548005919629272; `site.json` + `ADSENSE.txt`).
> 5. **11 Okt 2026:** „ini juga ganti, buatkan jg ads.txt dan tag meta nya dawo.es“ → **dawo.es →
>    ca-pub-7349356139063654** (sebelumnya 5693981744147503; `site.json` + `ADSENSE.txt`). Bukan dawa.es:
>    dawa.es tetap tidak disentuh.
> 6. **12 Okt 2026:** „axto.dev ganti adsense nya dengan ini, dan buatkan jg ads.txt dan tag meta nya“ →
>    **axto.dev → ca-pub-2493615451319531** (sebelumnya 5693981744147503; repo axtodev: `src/lib/site.ts`
>    untuk loader dan tag meta, `public/ads.txt`; axtodev PR #18).
> byodd.de, qulen.de dan zolun.de tetap dengan akun sendiri (6 Okt). Tabel di bawah adalah
> keadaan terbaru; `scripts/site-audit.mjs` memeriksa domain live dengan angka yang sama.

| Domain | Publisher | Tempat kodenya |
|---|---|---|
| ulyah.com | ca-pub-5693981744147503 | ulyah.com · apps/web (tenant ulyah) — apps/web/src/lib/ad-config.ts + route /ads.txt |
| axto.io | ca-pub-5693981744147503 | guardian-ai · dashboard/lib/site.ts + dashboard/public/ads.txt |
| xaa.es | ca-pub-5693981744147503 | xaa · site.ts + public/ads.txt |
| 1fr.fr | ca-pub-5693981744147503 | ulyah.com · apps/web (tenant 1fr) |
| axto.us | ca-pub-2990015102981265 | axto.us · sites/axto.us (site.json + ADSENSE.txt) — diubah pemilik 10 Okt |
| axto.dev | ca-pub-2493615451319531 | axtodev · site.ts + public/ads.txt — diubah pemilik 12 Okt (sebelumnya 5693981744147503) |
| jai.lat | ca-pub-6019445914743449 | Jai · site.ts + public/ads.txt — diubah pemilik 10 Okt |
| lie.skin | ca-pub-5693981744147503 | Lie · site.ts + public/ads.txt |
| oldco.in | ca-pub-5693981744147503 | oldco.in · layout + public/ads.txt |
| profity.in | ca-pub-5693981744147503 | profity.in · layout + public/ads.txt |
| dawo.es | ca-pub-7349356139063654 | ulyah.com · sites/dawo.es (site.json + ADSENSE.txt) — diubah pemilik 11 Okt (sebelumnya 5693981744147503) |
| qkb.es | ca-pub-5693981744147503 | ulyah.com · sites/qkb.es (site.json + ADSENSE.txt) |
| byodd.de | ca-pub-2228462932360966 | ulyah.com · sites/byodd.de (site.json + ADSENSE.txt) — akun sendiri sejak 6 Okt (pemilik, urgent) |
| xko.es | ca-pub-5693981744147503 | ulyah.com · sites/xko.es (site.json + ADSENSE.txt) |
| byoxy.de | ca-pub-5693981744147503 | ulyah.com · sites/byoxy.de (site.json + ADSENSE.txt) |
| byoy.de | ca-pub-5693981744147503 | ulyah.com · sites/byoy.de (site.json + ADSENSE.txt) — 10 domain baru, dikerjakan nanti |
| qarf.de | ca-pub-5693981744147503 | ulyah.com · sites/qarf.de (site.json + ADSENSE.txt) — 10 domain baru, dikerjakan nanti |
| qulen.de | ca-pub-7516944260248026 | ulyah.com · sites/qulen.de (site.json + ADSENSE.txt) — akun sendiri sejak 6 Okt (pemilik, urgent) |
| qurm.de | ca-pub-5693981744147503 | ulyah.com · sites/qurm.de (site.json + ADSENSE.txt) — 10 domain baru, dikerjakan nanti |
| rubiy.de | ca-pub-2990015102981265 | ulyah.com · sites/rubiy.de (site.json + ADSENSE.txt) — diubah pemilik 10 Okt |
| zavik.de | ca-pub-5693981744147503 | ulyah.com · sites/zavik.de (site.json + ADSENSE.txt) — 10 domain baru, dikerjakan nanti |
| zevok.de | ca-pub-5693981744147503 | ulyah.com · sites/zevok.de (site.json + ADSENSE.txt) — diubah pemilik 10 Okt |
| zolun.de | ca-pub-6016479123891586 | ulyah.com · sites/zolun.de (site.json + ADSENSE.txt) — akun sendiri; diganti pemilik 11 Okt (sebelumnya 4548005919629272) |
| zufiq.de | ca-pub-5693981744147503 | ulyah.com · sites/zufiq.de (site.json + ADSENSE.txt) — diubah pemilik 10 Okt |
| zuvik.de | ca-pub-5693981744147503 | ulyah.com · sites/zuvik.de (site.json + ADSENSE.txt) — 10 domain baru, dikerjakan nanti |
| dai.lat | ca-pub-8469557036744946 | ulyah.com · sites/dai.lat (site.json + ADSENSE.txt) — situs baru 10 Okt (draft sampai 40 artikel) |
| pab.lat | ca-pub-6146217038829045 | ulyah.com · sites/pab.lat (site.json + ADSENSE.txt) — situs baru 10 Okt (draft sampai 40 artikel) |
| rough.lat | ca-pub-5944786950535069 | ulyah.com · sites/rough.lat (site.json + ADSENSE.txt) — situs baru 10 Okt (draft sampai 40 artikel) |
| rough.es | ca-pub-5693981744147503 | ulyah.com · sites/rough.es (site.json + ADSENSE.txt) — situs baru 10 Okt (draft sampai 40 artikel) |
| dawa.es | ca-pub-6371903555702163 | ulyah.com · apps/web (tenant dawa) — **bukan milik pemilik lagi, JANGAN DISENTUH** |
| tilawa.de | ca-pub-5693981744147503 | ulyah.com · apps/web (tenant tilawa) |
| xad.es | ca-pub-5517446616694631 | ulyah.com · apps/web (tenant xad) — diubah pemilik 11 Okt |

## ulyah.com

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://ulyah.com/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## axto.io

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://axto.io/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## xaa.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://xaa.es/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## 1fr.fr

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://1fr.fr/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## axto.us

Kode dari pemilik, 10 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2990015102981265"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://axto.us/ads.txt)

```
google.com, pub-2990015102981265, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-2990015102981265">
```

## axto.dev

Kode dari pemilik, 12 Okt 2026 (sebelumnya ca-pub-5693981744147503, 10 Okt 2026).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2493615451319531"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://axto.dev/ads.txt)

```
google.com, pub-2493615451319531, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-2493615451319531">
```

## jai.lat

Kode dari pemilik, 10 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6019445914743449"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://jai.lat/ads.txt)

```
google.com, pub-6019445914743449, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6019445914743449">
```

## lie.skin

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://lie.skin/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## oldco.in

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://oldco.in/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## profity.in

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://profity.in/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## dawo.es

Kode dari pemilik, 11 Okt 2026 (sebelumnya ca-pub-7349356139063654).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7349356139063654"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://dawo.es/ads.txt)

```
google.com, pub-7349356139063654, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-7349356139063654">
```

## qkb.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qkb.es/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## byodd.de

Akun sendiri, kode dari pemilik 6 Okt 2026 (urgent: "ganti semua kode AdSense … termasuk meta tag").

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2228462932360966"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://byodd.de/ads.txt)

```
google.com, pub-2228462932360966, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-2228462932360966">
```

## xko.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://xko.es/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## byoxy.de

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://byoxy.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## byoy.de

Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://byoy.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## qarf.de

Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qarf.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## qulen.de

Akun sendiri, kode dari pemilik 6 Okt 2026 (urgent: "ganti semua kode AdSense … termasuk meta tag").

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7516944260248026"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qulen.de/ads.txt)

```
google.com, pub-7516944260248026, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-7516944260248026">
```

## qurm.de

Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qurm.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## rubiy.de

Kode dari pemilik, 10 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2990015102981265"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://rubiy.de/ads.txt)

```
google.com, pub-2990015102981265, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-2990015102981265">
```

## zavik.de

Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zavik.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## zevok.de

Kode dari pemilik, 10 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zevok.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## zolun.de

Akun sendiri, kode dari pemilik 6 Okt 2026 (urgent: "ganti semua kode AdSense … termasuk meta tag").

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6016479123891586"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zolun.de/ads.txt)

```
google.com, pub-6016479123891586, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6016479123891586">
```

## zufiq.de

Kode dari pemilik, 10 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zufiq.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## zuvik.de

Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zuvik.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## dai.lat

Situs baru, kode dari pemilik 10 Okt 2026. Dibangun di `sites/dai.lat` (draft: online dengan noindex + tag AdSense sampai 40 artikel).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8469557036744946"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://dai.lat/ads.txt)

```
google.com, pub-8469557036744946, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8469557036744946">
```

## pab.lat

Situs baru, kode dari pemilik 10 Okt 2026. Dibangun di `sites/pab.lat` (draft: online dengan noindex + tag AdSense sampai 40 artikel).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6146217038829045"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://pab.lat/ads.txt)

```
google.com, pub-6146217038829045, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6146217038829045">
```

## rough.lat

Situs baru, kode dari pemilik 10 Okt 2026. Dibangun di `sites/rough.lat` (draft: online dengan noindex + tag AdSense sampai 40 artikel).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5944786950535069"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://rough.lat/ads.txt)

```
google.com, pub-5944786950535069, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5944786950535069">
```

## rough.es

Situs baru, kode dari pemilik 10 Okt 2026. Dibangun di `sites/rough.es` (draft: online dengan noindex + tag AdSense sampai 40 artikel).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://rough.es/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## dawa.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6371903555702163"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://dawa.es/ads.txt)

```
google.com, pub-6371903555702163, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6371903555702163">
```

## tilawa.de

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5693981744147503"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://tilawa.de/ads.txt)

```
google.com, pub-5693981744147503, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5693981744147503">
```

## xad.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5517446616694631"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://xad.es/ads.txt)

```
google.com, pub-5517446616694631, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5517446616694631">
```
