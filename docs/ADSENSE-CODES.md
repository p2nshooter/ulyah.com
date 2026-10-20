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
> 7. **12 Okt 2026:** „Lie.skin, bikin jg ads.txt dan tag meta“ + `google.com, pub-4548005919629272, DIRECT, f08c47fec0942fa0` →
>    **lie.skin → ca-pub-4548005919629272** (sebelumnya 5693981744147503; repo Lie: `src/lib/site.ts` untuk loader dan
>    tag meta, `public/ads.txt`; Lie PR #7).
> 8. **13 Okt 2026 (urgent):** „Tolong ubah cuplikan kode adsense, ads.txt dan tag meta profity.in dengan kode ini“ +
>    `google.com, pub-5944786950535069, DIRECT, f08c47fec0942fa0` → **profity.in → ca-pub-5944786950535069**
>    (sebelumnya 5693981744147503; repo profity.in: `src/app/layout.tsx` untuk loader, tag meta dan metadata,
>    `public/ads.txt`; profity.in PR #9, redeploy lewat `deploy-partner-sites.yml`).
> 9. **14 Okt 2026 (urgent):** „Tolong ganti ke 5 situs ini dengan kode adsense ini dan buatkan cuplikan adsense dan tag
>    metanya" + `google.com, pub-6908951782430508, DIRECT, f08c47fec0942fa0` → **axto.io, xaa.es, rough.es, ulyah.com dan
>    1fr.fr → ca-pub-6908951782430508** (sebelumnya 5693981744147503). ulyah.com + 1fr.fr: `apps/web/src/lib/ad-config.ts`;
>    rough.es: `site.json` + `ADSENSE.txt`; axto.io: repo guardian-ai; xaa.es: repo xaa. tilawa.de tetap di akun utama.
> 10. **17–19 Okt 2026 (urgent, "dahulukan seluruh perubahan adsense"):** „Tolong ganti kode adsense domain2 ini, dan buatkan
>    cuplikan adsense, ads.txt & tag meta nya“ → **zuvik.de → ca-pub-4613976964728693, zufiq.de → 9338499658056112,
>    tilawa.de → 6908951782430508, zavik.de → 5254913739159445, byoy.de → 1768325549147657, qkb.es → 6284085719914185,
>    qarf.de → 4304267428455702, xko.es → 4906992051458194, zevok.de → 6560360898389273, qurm.de → 8212039662308316**.
>    Disusul: **oldco.in → ca-pub-2493615451319531** (urutan pesan: 9666205248809954 → 6293576511807510 →
>    2493615451319531, yang terakhir berlaku; **20 Okt diganti lagi ke ca-pub-6293576511807510**), **lie.skin →
>    ca-pub-9666205248809954**, **axto.dev → ca-pub-6381187608934514** (urutan pesan: 8212039662308316 → 6284085719914185 →
>    6381187608934514, yang terakhir berlaku), **pab.lat → ca-pub-7250589269548267** (sempat 1768325549147657), dan dua
>    situs baru **saved.lat → ca-pub-4548005919629272** (sempat 9433622530024776) dan **crone.skin →
>    ca-pub-9433622530024776**. Semua kode di bawah adalah yang terakhir diberikan pemilik.
> byodd.de, qulen.de dan zolun.de tetap dengan akun sendiri (6 Okt). Tabel di bawah adalah
> keadaan terbaru; `scripts/site-audit.mjs` memeriksa domain live dengan angka yang sama.

| Domain | Publisher | Tempat kodenya |
|---|---|---|
| ulyah.com | ca-pub-6908951782430508 | ulyah.com · apps/web (tenant ulyah) — apps/web/src/lib/ad-config.ts + route /ads.txt — diubah pemilik 14 Okt (sebelumnya 5693981744147503) |
| axto.io | ca-pub-6908951782430508 | guardian-ai · dashboard/lib/site.ts + dashboard/public/ads.txt — diubah pemilik 14 Okt (sebelumnya 5693981744147503) |
| xaa.es | ca-pub-6908951782430508 | xaa · site.ts + public/ads.txt — diubah pemilik 14 Okt (sebelumnya 5693981744147503) |
| 1fr.fr | ca-pub-6908951782430508 | ulyah.com · apps/web (tenant 1fr) — diubah pemilik 14 Okt (sebelumnya 5693981744147503) |
| axto.us | ca-pub-2990015102981265 | axto.us · sites/axto.us (site.json + ADSENSE.txt) — diubah pemilik 10 Okt |
| axto.dev | ca-pub-6381187608934514 | axtodev · src/lib/site.ts + public/ads.txt — diubah pemilik 19 Okt (sebelumnya ca-pub-2493615451319531) |
| jai.lat | ca-pub-6019445914743449 | Jai · site.ts + public/ads.txt — diubah pemilik 10 Okt |
| lie.skin | ca-pub-9666205248809954 | Lie · src/lib/site.ts + public/ads.txt — diubah pemilik 19 Okt (sebelumnya ca-pub-4548005919629272) |
| oldco.in | ca-pub-6293576511807510 | oldco.in · layout + public/ads.txt — diubah pemilik 20 Okt, kode terbaru (19 Okt: 2493615451319531; sebelumnya 6293576511807510, awalnya ca-pub-5693981744147503) |
| profity.in | ca-pub-5944786950535069 | profity.in · layout + public/ads.txt — diubah pemilik 13 Okt (sebelumnya 5693981744147503) |
| dawo.es | ca-pub-7349356139063654 | ulyah.com · sites/dawo.es (site.json + ADSENSE.txt) — diubah pemilik 11 Okt (sebelumnya 5693981744147503) |
| qkb.es | ca-pub-6284085719914185 | ulyah.com · sites/qkb.es (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| byodd.de | ca-pub-2228462932360966 | ulyah.com · sites/byodd.de (site.json + ADSENSE.txt) — akun sendiri sejak 6 Okt (pemilik, urgent) |
| xko.es | ca-pub-4906992051458194 | ulyah.com · sites/xko.es (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| byoxy.de | ca-pub-5693981744147503 | ulyah.com · sites/byoxy.de (site.json + ADSENSE.txt) |
| byoy.de | ca-pub-1768325549147657 | ulyah.com · sites/byoy.de (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| qarf.de | ca-pub-4304267428455702 | ulyah.com · sites/qarf.de (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| qulen.de | ca-pub-7516944260248026 | ulyah.com · sites/qulen.de (site.json + ADSENSE.txt) — akun sendiri sejak 6 Okt (pemilik, urgent) |
| qurm.de | ca-pub-8212039662308316 | ulyah.com · sites/qurm.de (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| rubiy.de | ca-pub-2990015102981265 | ulyah.com · sites/rubiy.de (site.json + ADSENSE.txt) — diubah pemilik 10 Okt |
| zavik.de | ca-pub-5254913739159445 | ulyah.com · sites/zavik.de (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| zevok.de | ca-pub-6560360898389273 | ulyah.com · sites/zevok.de (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| zolun.de | ca-pub-6016479123891586 | ulyah.com · sites/zolun.de (site.json + ADSENSE.txt) — akun sendiri; diganti pemilik 11 Okt (sebelumnya 4548005919629272) |
| zufiq.de | ca-pub-9338499658056112 | ulyah.com · sites/zufiq.de (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| zuvik.de | ca-pub-4613976964728693 | ulyah.com · sites/zuvik.de (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
| dai.lat | ca-pub-8469557036744946 | ulyah.com · sites/dai.lat (site.json + ADSENSE.txt) — situs baru 10 Okt (draft sampai 40 artikel) |
| pab.lat | ca-pub-7250589269548267 | ulyah.com · sites/pab.lat (site.json + ADSENSE.txt) — diubah pemilik 19 Okt (sebelumnya ca-pub-6146217038829045) |
| rough.lat | ca-pub-5944786950535069 | ulyah.com · sites/rough.lat (site.json + ADSENSE.txt) — situs baru 10 Okt (draft sampai 40 artikel) |
| rough.es | ca-pub-6908951782430508 | ulyah.com · sites/rough.es (site.json + ADSENSE.txt) — diubah pemilik 14 Okt (sebelumnya 5693981744147503) |
| saved.lat | ca-pub-4548005919629272 | ulyah.com · sites/saved.lat (site.json + ADSENSE.txt) — situs baru 19 Okt (sempat 9433622530024776) |
| crone.skin | ca-pub-9433622530024776 | ulyah.com · sites/crone.skin (site.json + ADSENSE.txt) — situs baru 19 Okt |
| dawa.es | ca-pub-6371903555702163 | ulyah.com · apps/web (tenant dawa) — **bukan milik pemilik lagi, JANGAN DISENTUH** |
| tilawa.de | ca-pub-6908951782430508 | ulyah.com · apps/web (tenant tilawa) — apps/web/src/lib/ad-config.ts + route /ads.txt — diubah pemilik 19 Okt (sebelumnya ca-pub-5693981744147503) |
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-2493615451319531). Riwayat: Kode dari pemilik, 12 Okt 2026 (sebelumnya ca-pub-6381187608934514, 10 Okt 2026).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6381187608934514"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://axto.dev/ads.txt)

```
google.com, pub-6381187608934514, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6381187608934514">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-4548005919629272). Riwayat: Kode dari pemilik, 12 Okt 2026 (sebelumnya ca-pub-9666205248809954).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9666205248809954"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://lie.skin/ads.txt)

```
google.com, pub-9666205248809954, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-9666205248809954">
```

## oldco.in

Kode terbaru dari pemilik, 20 Okt 2026 (19 Okt: ca-pub-2493615451319531; sebelumnya ca-pub-6293576511807510; awalnya
ca-pub-5693981744147503).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6293576511807510"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://oldco.in/ads.txt)

```
google.com, pub-6293576511807510, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6293576511807510">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6284085719914185"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qkb.es/ads.txt)

```
google.com, pub-6284085719914185, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6284085719914185">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4906992051458194"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://xko.es/ads.txt)

```
google.com, pub-4906992051458194, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-4906992051458194">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503). Riwayat: Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1768325549147657"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://byoy.de/ads.txt)

```
google.com, pub-1768325549147657, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-1768325549147657">
```

## qarf.de

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503). Riwayat: Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4304267428455702"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qarf.de/ads.txt)

```
google.com, pub-4304267428455702, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-4304267428455702">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503). Riwayat: Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8212039662308316"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qurm.de/ads.txt)

```
google.com, pub-8212039662308316, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8212039662308316">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503). Riwayat: Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5254913739159445"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zavik.de/ads.txt)

```
google.com, pub-5254913739159445, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-5254913739159445">
```

## zevok.de

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503). Riwayat: Kode dari pemilik, 10 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6560360898389273"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zevok.de/ads.txt)

```
google.com, pub-6560360898389273, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6560360898389273">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503). Riwayat: Kode dari pemilik, 10 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9338499658056112"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zufiq.de/ads.txt)

```
google.com, pub-9338499658056112, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-9338499658056112">
```

## zuvik.de

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503). Riwayat: Satu akun dengan sembilan domain lain di daftar 4 Okt (byoy.de … zuvik.de).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4613976964728693"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://zuvik.de/ads.txt)

```
google.com, pub-4613976964728693, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-4613976964728693">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-6146217038829045). Riwayat: Situs baru, kode dari pemilik 10 Okt 2026. Dibangun di `sites/pab.lat` (draft: online dengan noindex + tag AdSense sampai 40 artikel).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7250589269548267"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://pab.lat/ads.txt)

```
google.com, pub-7250589269548267, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-7250589269548267">
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

## saved.lat

Situs baru, kode dari pemilik 19 Okt 2026 (pengganti ca-pub-9433622530024776 yang diberikan sehari sebelumnya).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4548005919629272"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://saved.lat/ads.txt)

```
google.com, pub-4548005919629272, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-4548005919629272">
```

## crone.skin

Situs baru, kode dari pemilik 18 Okt 2026.

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9433622530024776"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://crone.skin/ads.txt)

```
google.com, pub-9433622530024776, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-9433622530024776">
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

Kode dari pemilik, 19 Okt 2026 (sebelumnya ca-pub-5693981744147503).

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6908951782430508"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://tilawa.de/ads.txt)

```
google.com, pub-6908951782430508, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6908951782430508">
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
