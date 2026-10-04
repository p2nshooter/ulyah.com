# Kode AdSense semua situs (ditulis manual)

Sumber kebenaran untuk kode AdSense setiap domain. Isinya ketiga cuplikan
persis seperti yang diberikan Google: script loader, baris ads.txt, dan tag
meta. Tag meta ditulis lengkap untuk setiap domain, termasuk yang tidak
ikut ditempel pemilik.

Situs di `sites/` juga punya salinan di `sites/<domain>/ADSENSE.txt`.
`sites/_engine/check.mjs` menolak deploy kalau hasil build berbeda satu
karakter saja dari file itu. Situs lain diperiksa di browser oleh
`.github/workflows/site-audit.yml`.

| Domain | Publisher | Tempat kodenya |
|---|---|---|
| ulyah.com | ca-pub-8991272269211824 | ulyah.com · apps/web (tenant ulyah) — apps/web/src/lib/ad-config.ts + route /ads.txt |
| axto.io | ca-pub-8991272269211824 | guardian-ai · dashboard/lib/site.ts + dashboard/public/ads.txt |
| xaa.es | ca-pub-8991272269211824 | xaa · site.ts + public/ads.txt |
| 1fr.fr | ca-pub-8991272269211824 | ulyah.com · apps/web (tenant 1fr) |
| axto.us | ca-pub-6908951782430508 | axto.us · site.ts + public/ads.txt |
| axto.dev | ca-pub-8469557036744946 | axtodev · site.ts + public/ads.txt |
| jai.lat | ca-pub-4548005919629272 | Jai · site.ts + public/ads.txt |
| lie.skin | ca-pub-9666205248809954 | Lie · site.ts + public/ads.txt |
| oldco.in | ca-pub-6293576511807510 | oldco.in · layout + public/ads.txt |
| profity.in | ca-pub-6146217038829045 | profity.in · layout + public/ads.txt |
| dawo.es | ca-pub-6019445914743449 | ulyah.com · sites/dawo.es (site.json + ADSENSE.txt) |
| qkb.es | ca-pub-7516944260248026 | ulyah.com · sites/qkb.es (site.json + ADSENSE.txt) |
| byodd.de | ca-pub-2228462932360966 | ulyah.com · sites/byodd.de (site.json + ADSENSE.txt) |
| xko.es | ca-pub-6560360898389273 | ulyah.com · sites/xko.es (site.json + ADSENSE.txt) |
| byoxy.de | ca-pub-6701063918838796 | ulyah.com · sites/byoxy.de (site.json + ADSENSE.txt) |
| dawa.es | ca-pub-6371903555702163 | ulyah.com · apps/web (tenant dawa) — sudah di-ACC, tidak diubah |
| tilawa.de | ca-pub-8991272269211824 | ulyah.com · apps/web (tenant tilawa) — 4 Okt: akun xaa.es |
| xad.es | ca-pub-2493615451319531 | ulyah.com · apps/web (tenant xad) — tidak diubah |

## ulyah.com

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8991272269211824"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://ulyah.com/ads.txt)

```
google.com, pub-8991272269211824, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8991272269211824">
```

## axto.io

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8991272269211824"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://axto.io/ads.txt)

```
google.com, pub-8991272269211824, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8991272269211824">
```

## xaa.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8991272269211824"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://xaa.es/ads.txt)

```
google.com, pub-8991272269211824, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8991272269211824">
```

## 1fr.fr

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8991272269211824"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://1fr.fr/ads.txt)

```
google.com, pub-8991272269211824, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8991272269211824">
```

## axto.us

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6908951782430508"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://axto.us/ads.txt)

```
google.com, pub-6908951782430508, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6908951782430508">
```

## axto.dev

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8469557036744946"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://axto.dev/ads.txt)

```
google.com, pub-8469557036744946, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8469557036744946">
```

## jai.lat

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4548005919629272"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://jai.lat/ads.txt)

```
google.com, pub-4548005919629272, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-4548005919629272">
```

## lie.skin

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
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6146217038829045"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://profity.in/ads.txt)

```
google.com, pub-6146217038829045, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6146217038829045">
```

## dawo.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6019445914743449"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://dawo.es/ads.txt)

```
google.com, pub-6019445914743449, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6019445914743449">
```

## qkb.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7516944260248026"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://qkb.es/ads.txt)

```
google.com, pub-7516944260248026, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-7516944260248026">
```

## byodd.de

Cuplikan adsense

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
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6560360898389273"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://xko.es/ads.txt)

```
google.com, pub-6560360898389273, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6560360898389273">
```

## byoxy.de

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6701063918838796"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://byoxy.de/ads.txt)

```
google.com, pub-6701063918838796, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-6701063918838796">
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
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8991272269211824"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://tilawa.de/ads.txt)

```
google.com, pub-8991272269211824, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-8991272269211824">
```

## xad.es

Cuplikan adsense

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2493615451319531"
     crossorigin="anonymous"></script>
```

Cuplikan ads.txt (https://xad.es/ads.txt)

```
google.com, pub-2493615451319531, DIRECT, f08c47fec0942fa0
```

Tag meta

```html
<meta name="google-adsense-account" content="ca-pub-2493615451319531">
```
