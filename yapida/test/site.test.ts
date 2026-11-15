/* yapida.sch.id di dalam proses (R2 tiruan): AdSense tumpuk, SEO, halaman dinamis dari R2, isi awal, Markdown aman.
 * Jalankan: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FakeR2 } from './fake-r2.ts';
import worker, { GOOGLE_CRAWLERS } from '../src/index.ts';
import { ADSENSE_ACCOUNTS, ADSENSE_CLIENT, ADS_TXT, DOMAIN } from '../src/lib/adsense.ts';
import { Store, metaStr } from '../src/lib/store.ts';
import { ensureSeed, getSitus, getUnit, listUnits, putSitus, putUnit } from '../src/data/site.ts';
import { SEED_UNITS } from '../src/seed.ts';
import { renderMarkdown } from '../src/lib/markdown.ts';
import { slugify, tanggal, ringkas, arab } from '../src/lib/text.ts';
import type { Env } from '../src/env.ts';
import { SDM, VIDEO, KABAR } from '../src/data/defs.ts';
import { ambil, bacaBidang, daftar, hapus, simpan } from '../src/data/koleksi.ts';
import { bolehKelolaAkun, bolehUnit, cocokPin, createUser, hashPin, lamaKunci, listUsers, masuk, peranYangBolehDiberi, pinAcak, pinLemah, MAKS_SALAH, type User } from '../src/data/users.ts';
import { acak, dariPosisi } from '../src/lib/pinpad.ts';
import { kenaliVideo } from '../src/lib/video.ts';
import { uraiUmpan } from '../src/data/yt.ts';
import { ANGKA } from '../src/lib/angka.ts';
import { unggah, kenali } from '../src/data/media.ts';

const stack = JSON.parse(fs.readFileSync(new URL('../../adsense-stack.json', import.meta.url), 'utf8')) as { stack: string[]; primary: Record<string, string> };

/** Aset statis dibaca langsung dari folder public/ (seperti binding ASSETS di Worker). */
const PUB = new URL('../public/', import.meta.url).pathname;
const ASSETS = {
  fetch: async (req: Request) => {
    const f = PUB + new URL(req.url).pathname.replace(/^\/+/, '');
    if (f.includes('..')) return new Response('tidak ada', { status: 404 });
    try { return new Response(fs.readFileSync(f)); } catch { return new Response('tidak ada', { status: 404 }); }
  },
} as unknown as Fetcher;

function env(extra: Partial<Env> = {}): Env {
  return { DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS, CANONICAL_HOST: 'yapida.sch.id', SESSION_SECRET: 'rahasia-uji-0123456789abcdef', ...extra };
}
const get = (e: Env, path: string, host = 'yapida.sch.id') => worker.fetch(new Request(`https://${host}${path}`) as never, e, {} as ExecutionContext);

test('AdSense: akun utama dan tumpukan persis adsense-stack.json', () => {
  assert.equal(ADSENSE_CLIENT, stack.primary[DOMAIN]);
  assert.ok(stack.stack.includes(ADSENSE_CLIENT), 'akun utama adalah salah satu akun tumpukan');
  assert.deepEqual([...ADSENSE_ACCOUNTS], [...new Set([stack.primary[DOMAIN]!, ...stack.stack])]);
  assert.equal(ADS_TXT.trim().split('\n').length, ADSENSE_ACCOUNTS.length);
  assert.equal(ADS_TXT.split('\n')[0], `google.com, ${ADSENSE_CLIENT.replace('ca-', '')}, DIRECT, f08c47fec0942fa0`);
});

test('setiap halaman publik: satu tag meta per akun, tepat satu loader (akun utama), tanpa unit manual', async () => {
  const e = env();
  for (const p of ['/', '/profil', '/lembaga', '/lembaga/mi-al-huda', '/donasi', '/kontak', '/h/kebijakan-privasi', '/h/syarat-penggunaan', '/ibadah', '/jadwal-sholat', '/kiblat', '/kalender-hijriah', '/radio-quran']) {
    const r = await get(e, p);
    assert.equal(r.status, 200, p);
    const h = await r.text();
    for (const a of ADSENSE_ACCOUNTS) assert.ok(h.includes(`<meta name="google-adsense-account" content="${a}">`), `${p}: meta ${a}`);
    assert.equal((h.match(/adsbygoogle\.js\?client=/g) ?? []).length, 1, `${p}: satu loader`);
    assert.ok(h.includes(`adsbygoogle.js?client=${ADSENSE_CLIENT}`), `${p}: loader akun utama`);
    assert.ok(!/<ins\b[^>]*adsbygoogle|data-ad-slot=/.test(h), `${p}: tanpa unit manual`);
    assert.equal((h.match(/<h1[\s>]/g) ?? []).length, 1, `${p}: tepat satu h1`);
    assert.ok(h.includes(`<link rel="canonical" href="https://yapida.sch.id${p}">`), `${p}: canonical`);
    const title = h.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    assert.ok(title.length >= 20 && title.length <= 75, `${p}: panjang judul ${title.length}`);
    const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    assert.ok(desc.length >= 50 && desc.length <= 230, `${p}: panjang deskripsi ${desc.length}`);
    for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]!);
    assert.ok(!h.includes('undefined') && !h.includes('[object Object]'), `${p}: tidak ada nilai bocor`);
  }
});

test('ads.txt, robots.txt, sitemap, manifest, service worker', async () => {
  const e = env();
  assert.equal(await (await get(e, '/ads.txt')).text(), ADS_TXT);
  const robots = await (await get(e, '/robots.txt')).text();
  for (const g of GOOGLE_CRAWLERS) assert.ok(robots.includes(`User-agent: ${g}\nAllow: /`), g);
  assert.ok(robots.includes('Sitemap: https://yapida.sch.id/sitemap.xml'));
  assert.ok(!/User-agent: \*\nDisallow: \/\n/.test(robots));
  const sm = await (await get(e, '/sitemap.xml')).text();
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  assert.equal(new Set(locs).size, locs.length);
  for (const u of SEED_UNITS) assert.ok(locs.includes(`https://yapida.sch.id/lembaga/${u.slug}`), u.slug);
  for (const l of locs) assert.equal((await get(e, new URL(l).pathname)).status, 200, l);
  const man = (await (await get(e, '/manifest.webmanifest')).json()) as { display: string; icons: { sizes: string; purpose?: string }[]; start_url: string };
  assert.equal(man.display, 'standalone');
  assert.ok(man.icons.some((i) => i.sizes === '512x512' && i.purpose === 'maskable') && man.icons.some((i) => i.sizes === '192x192'));
  const sw = await get(e, '/sw.js');
  assert.match(sw.headers.get('content-type') ?? '', /javascript/);
  assert.ok((await sw.text()).includes("addEventListener('fetch'"));
});

test('workers.dev: noindex tanpa domain kanonik; dialihkan 301 setelah domain terpasang', async () => {
  const tanpa = await get(env({ CANONICAL_HOST: '' }), '/', 'yapida-sch-id.axto.workers.dev');
  assert.equal(tanpa.status, 200);
  assert.equal(tanpa.headers.get('x-robots-tag'), 'noindex');
  assert.ok((await tanpa.text()).includes('<meta name="robots" content="noindex">'));
  const dengan = await get(env(), '/lembaga?x=1', 'yapida-sch-id.axto.workers.dev');
  assert.equal(dengan.status, 301);
  assert.equal(dengan.headers.get('location'), 'https://yapida.sch.id/lembaga?x=1');
  assert.equal((await get(env(), '/', 'www.yapida.sch.id')).status, 301);
  assert.equal((await get(env(), '/api/health', 'yapida-sch-id.axto.workers.dev')).status, 200);
});

test('halaman tak dikenal 404 tanpa loader iklan; lembaga nonaktif tidak tayang', async () => {
  const e = env();
  const r = await get(e, '/lembaga/tidak-ada');
  assert.equal(r.status, 404);
  const h = await r.text();
  assert.ok(!h.includes('adsbygoogle.js'));
  assert.ok(h.includes('noindex'));
  assert.equal((await get(e, '/api/tidak-ada')).status, 404);
  const store = new Store(e.DATA as never);
  const u = (await getUnit(store, 'al-huda-mart'))!;
  await putUnit(store, { ...u, aktif: false });
  assert.equal((await get(e, '/lembaga/al-huda-mart')).status, 404);
  assert.ok(!(await listUnits(store)).some((x) => x.slug === 'al-huda-mart'));
  assert.ok((await listUnits(store, true)).some((x) => x.slug === 'al-huda-mart'));
});

test('isi awal: 15 lembaga dalam 5 bidang, ditulis sekali, suntingan portal tidak pernah ditimpa', async () => {
  const b = new FakeR2();
  const store = new Store(b);
  assert.equal(await ensureSeed(store), true);
  assert.equal(await ensureSeed(store), false);
  const units = await listUnits(store);
  assert.equal(units.length, 15);
  assert.deepEqual([...new Set(units.map((u) => u.kelompok))], ['ibadah', 'formal', 'nonformal', 'ekonomi', 'sosial']);
  assert.deepEqual(units.map((u) => u.urut), [...units.map((u) => u.urut)].sort((x, y) => x - y));
  await putSitus(store, (s) => ({ ...s, slogan: 'Diubah pengurus' }));
  const mi = (await getUnit(store, 'mi-al-huda'))!;
  await putUnit(store, { ...mi, ringkas: 'Diubah admin MI' });
  b.m.delete('k/seed.json'); // seolah versi isi awal naik
  assert.equal(await ensureSeed(store), true);
  assert.equal((await getSitus(store)).slogan, 'Diubah pengurus');
  assert.equal((await getUnit(store, 'mi-al-huda'))!.ringkas, 'Diubah admin MI');
});

test('data pribadi dari dokumen tidak ikut: tanpa NIK, tanpa nomor telepon pribadi', async () => {
  const e = env();
  for (const p of ['/', '/profil', '/lembaga/mi-al-huda', '/donasi', '/kontak']) {
    const h = await (await get(e, p)).text();
    assert.ok(!/\b(3216|6306)\d{12}\b/.test(h), `${p}: NIK`);
    assert.ok(!/\b08\d{8,11}\b/.test(h), `${p}: nomor telepon`);
  }
  const src = fs.readFileSync(new URL('../src/seed.ts', import.meta.url), 'utf8');
  assert.ok(!/\b(3216|6306)\d{12}\b/.test(src) && !/\b08\d{8,11}\b/.test(src));
});

test('profil memuat legalitas dan organ dari pengaturan situs (dinamis)', async () => {
  const e = env();
  const store = new Store(e.DATA as never);
  let h = await (await get(e, '/profil')).text();
  for (const t of ['AHU-0033503.AH.01.04.Tahun 2015', '24 Desember 2015', 'Hj. Latifah', 'Fadli Robbi, S.Ag.', 'Pembina', 'Pengawas']) assert.ok(h.includes(t), t);
  await simpan(store, SDM, { unit: 'yayasan', status: 'tayang', judul: 'Nama Uji Coba', d: { golongan: 'pengurus', jabatan: 'Wakil Ketua', urut: 24 }, penulis: 'uji', penulisNama: 'uji' });
  await putSitus(store, (s) => ({ ...s, donasi: { ...s.donasi, tampil: false } }));
  h = await (await get(e, '/profil')).text();
  assert.ok(h.includes('Nama Uji Coba') && h.includes('Wakil Ketua'), 'orang baru di koleksi SDM tampil di organ yayasan');
  assert.equal((await get(e, '/donasi')).status, 404);
  assert.ok(!(await (await get(e, '/sitemap.xml')).text()).includes('/donasi'));
});

test('Markdown: HTML di-escape, tautan berbahaya dibuang, Arab diberi lang/dir', () => {
  const h = renderMarkdown('## Judul <script>alert(1)</script>\n\nTeks **tebal** [x](javascript:alert(1)) [ok](https://contoh.id) <img src=x onerror=1>\n\nبِسْمِ ٱللَّٰهِ\n\n::en Read in the name of your Lord\n\n- satu\n- dua الهدى');
  assert.ok(!h.includes('<script>') && !h.includes('<img src=x'));
  assert.ok(!h.includes('javascript:'));
  assert.ok(h.includes('<a href="https://contoh.id" target="_blank" rel="noopener nofollow">ok</a>'));
  assert.ok(h.includes('<p class="arab" lang="ar" dir="rtl">'));
  assert.ok(h.includes('<p lang="en">Read in the name'));
  assert.ok(h.includes('<span class="arab-in" lang="ar" dir="rtl">الهدى</span>'));
  assert.ok(h.includes('<strong>tebal</strong>') && h.includes('<ul><li>satu</li>'));
});

test('alat teks dan metadata indeks', () => {
  assert.equal(slugify('Masjid Jami’ Al Huda — 2027!'), 'masjid-jami-al-huda-2027');
  assert.equal(tanggal('2015-12-24'), '24 Desember 2015');
  assert.equal(tanggal(Date.UTC(2026, 10, 14, 20, 0)), '15 November 2026'); // 20.00 UTC = 03.00 WIB esok harinya
  assert.ok(ringkas('kata '.repeat(100), 50).length <= 50);
  assert.equal(arab('الهدى'), true);
  assert.equal(arab('Al Huda'), false);
  const m = metaStr({ nama: 'Masjid Jami’ الهدى' });
  assert.ok(/^[\x20-\x7e]+$/.test(m));
  assert.equal(JSON.parse(m).nama, 'Masjid Jami’ الهدى');
});

test('aplikasi ibadah: titik lokasi dari pengaturan situs, aset hitung dimuat, data surah 114 dengan 6236 ayat', async () => {
  const e = env();
  const store = new Store(e.DATA as never);
  let h = await (await get(e, '/jadwal-sholat')).text();
  assert.ok(h.includes('data-lat="-6.13"') && h.includes('data-lng="107.17"') && h.includes('Sukakarya, Kabupaten Bekasi'));
  assert.ok(h.includes('/assets/vendor/adhan.min.js') && h.includes('/assets/ibadah.js') && h.includes('/assets/ibadah.css'));
  await putSitus(store, (s) => ({ ...s, lokasi: { lat: -6.2, lng: 107.05, nama: 'Titik uji' } }));
  h = await (await get(e, '/kiblat')).text();
  assert.ok(h.includes('data-lat="-6.2"') && h.includes('Titik uji'));
  assert.ok((await (await get(e, '/')).text()).includes('data-ramadhan'), 'beranda memuat hitung mundur Ramadhan');
  assert.equal((await get(e, '/')).headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=(self)');
  const surat = JSON.parse(fs.readFileSync(new URL('../public/assets/data/surat.json', import.meta.url), 'utf8')) as { n: number; ayat: number; latin: string; ar: string }[];
  assert.equal(surat.length, 114);
  assert.equal(surat.reduce((a, b) => a + b.ayat, 0), 6236);
  assert.deepEqual([surat[0]!.latin, surat[0]!.ayat, surat[113]!.n, surat[113]!.ayat], ['Al-Fatihah', 7, 114, 6]);
  const radio = await (await get(e, '/radio-quran')).text();
  // Radio LIVE (§5c): tanpa pilihan surah/qari — hanya nyala/mati per perangkat; posisi siaran dari /api/radio.
  assert.ok(radio.includes('data-radio-live') && radio.includes('data-rl-nyala') && radio.includes('data-rl-khatam'));
  assert.ok(!radio.includes('<select'), 'tanpa pilihan qari/surah');
});

test('PIN: hash ber-pepper, PIN acak tidak lemah, kunci setelah 5 kali salah, lalu bertahap', async () => {
  const store = new Store(new FakeR2());
  const h = await hashPin('40917', 'lada');
  assert.ok(h.startsWith('pin1$') && !h.includes('40917'));
  assert.equal(await cocokPin('40917', h, 'lada'), true);
  assert.equal(await cocokPin('40917', h, 'lada-lain'), false, 'pepper berbeda → tidak cocok');
  assert.equal(await cocokPin('40918', h, 'lada'), false);
  for (const p of ['00000', '12345', '98765', '55555', '34567']) assert.equal(pinLemah(p), true, p);
  for (let i = 0; i < 200; i++) { const p = pinAcak(); assert.match(p, /^\d{5}$/); assert.equal(pinLemah(p), false); }
  const u = await createUser(store, { nama: 'Admin MI Al Huda', peran: 'lembaga', units: ['mi-al-huda'], pin: '40917', pepper: 'lada' });
  await assert.rejects(createUser(store, { nama: 'admin mi al huda', peran: 'lembaga', units: ['mi-al-huda'], pin: '11223', pepper: 'lada' }), /sudah dipakai/);
  const t0 = Date.UTC(2026, 10, 15, 3);
  for (let i = 1; i < MAKS_SALAH; i++) {
    const r = await masuk(store, u.id, '00001', 'lada', t0);
    assert.deepEqual(r, { ok: false, alasan: 'salah', sisa: MAKS_SALAH - i });
  }
  const kunci = await masuk(store, u.id, '00001', 'lada', t0);
  assert.equal(kunci.ok, false);
  assert.equal(!kunci.ok && kunci.alasan, 'terkunci');
  assert.equal((await masuk(store, u.id, '40917', 'lada', t0 + 60_000)).ok, false, 'PIN benar pun ditolak selama terkunci');
  assert.equal((await masuk(store, u.id, '40917', 'lada', t0 + lamaKunci(0) + 1)).ok, true, 'setelah 15 menit PIN benar diterima');
  assert.equal(lamaKunci(1), 30 * 60_000);
  assert.equal(lamaKunci(10), 24 * 3600_000, 'paling lama 24 jam');
  assert.equal((await listUsers(store)).length, 1);
});

test('papan PIN: urutan acak selalu permutasi 0–9, posisi dipetakan ke angka', () => {
  const lihat = new Set<string>();
  for (let i = 0; i < 50; i++) { const p = acak(); assert.equal(new Set(p).size, 10); assert.deepEqual([...p].sort(), '0123456789'.split('')); lihat.add(p.join('')); }
  assert.ok(lihat.size > 45, 'urutan berbeda-beda');
  const perm = '7302915486'.split('');
  assert.equal(dariPosisi(perm, '01234'), '73029');
  assert.equal(dariPosisi(perm, '9999'), null);
  assert.equal(dariPosisi(perm, '1234a'), null);
  assert.equal(Object.keys(ANGKA).length, 10);
  assert.equal(new Set(Object.values(ANGKA).map((g) => g.d)).size, 10, 'setiap angka berbentuk unik');
});

test('hak akses: super mengelola semua, kepala hanya kontributor lembaganya, admin lembaga hanya lembaganya', () => {
  const su = { id: 'a', peran: 'super', units: [] } as unknown as User;
  const ketua = { id: 'b', peran: 'ketua', units: [] } as unknown as User;
  const kepalaMi = { id: 'c', peran: 'kepala', units: ['mi-al-huda'] } as unknown as User;
  const adminMi = { id: 'd', peran: 'lembaga', units: ['mi-al-huda'] } as unknown as User;
  const kontribMi = { id: 'e', peran: 'kontributor', units: ['mi-al-huda'] } as unknown as User;
  const kontribRa = { id: 'f', peran: 'kontributor', units: ['ra-al-huda'] } as unknown as User;
  assert.equal(bolehKelolaAkun(su, ketua), true);
  assert.equal(bolehKelolaAkun(ketua, su), false);
  assert.equal(bolehKelolaAkun(su, su), false, 'tidak mengelola dirinya sendiri dari daftar akun');
  assert.equal(bolehKelolaAkun(kepalaMi, kontribMi), true);
  assert.equal(bolehKelolaAkun(kepalaMi, kontribRa), false);
  assert.equal(bolehKelolaAkun(kepalaMi, adminMi), false);
  assert.equal(bolehKelolaAkun(adminMi, kontribMi), false);
  assert.deepEqual(peranYangBolehDiberi(kepalaMi), ['kontributor']);
  assert.ok(!peranYangBolehDiberi(ketua).includes('super') && !peranYangBolehDiberi(ketua).includes('ketua'));
  assert.equal(bolehUnit(adminMi, 'mi-al-huda'), true);
  assert.equal(bolehUnit(adminMi, 'ra-al-huda'), false);
  assert.equal(bolehUnit(adminMi, 'yayasan'), false);
  assert.equal(bolehUnit(ketua, 'yayasan'), true);
});

test('koleksi: simpan, indeks tayang, ganti status, slug tetap, hapus bersih', async () => {
  const b = new FakeR2();
  const store = new Store(b);
  const { d, galat } = bacaBidang(KABAR, { kategori: 'kegiatan', ringkasan: 'Ringkas.', isi: 'Isi **tebal**.' });
  assert.deepEqual(galat, {});
  const dok = await simpan(store, KABAR, { unit: 'mi-al-huda', status: 'draf', judul: 'Wisuda Tahfidz 2027', tanggal: '2027-06-01', d, penulis: 'u', penulisNama: 'U' });
  assert.equal(dok.slug, 'wisuda-tahfidz-2027');
  assert.equal((await daftar(store, 'kabar', { tayang: true })).length, 0, 'draf tidak tampil publik');
  const t = await simpan(store, KABAR, { id: dok.id, unit: 'mi-al-huda', status: 'tayang', judul: 'Judul Diganti', tanggal: '2027-06-01', d, penulis: 'u', penulisNama: 'U' });
  assert.equal(t.slug, 'wisuda-tahfidz-2027', 'slug tidak berubah saat judul diganti');
  assert.equal(t.html.isi, '<p>Isi <strong>tebal</strong>.</p>');
  const pub = await daftar(store, 'kabar', { tayang: true });
  assert.equal(pub.length, 1);
  assert.equal(pub[0]!.j, 'Judul Diganti');
  assert.equal((await daftar(store, 'kabar', {})).length, 1, 'satu entri indeks per dokumen');
  const dua = await simpan(store, KABAR, { unit: 'ra-al-huda', status: 'tayang', judul: 'Wisuda Tahfidz 2027', d, penulis: 'u', penulisNama: 'U' });
  assert.equal(dua.slug, 'wisuda-tahfidz-2027-2', 'slug kembar diberi nomor');
  assert.equal((await daftar(store, 'kabar', { tayang: true, unit: 'ra-al-huda' })).length, 1);
  await hapus(store, KABAR, dok.id);
  assert.equal(await ambil(store, 'kabar', dok.id), null);
  assert.ok(![...b.m.keys()].some((k) => k.includes(dok.id)), 'tidak ada sisa kunci dokumen yang dihapus');
  const v = bacaBidang(VIDEO, { url: 'javascript:alert(1)', jenis: 'video' });
  assert.ok(v.galat.url, 'tautan video berbahaya ditolak');
  const sdm = bacaBidang(SDM, { golongan: 'raja', jabatan: '' });
  assert.ok(sdm.galat.golongan && sdm.galat.jabatan);
});

test('video: YouTube, Facebook, TikTok dikenali; tautan lain ditolak; umpan kanal YouTube terurai', () => {
  const yt = kenaliVideo('https://youtu.be/dQw4w9WgXcQ?t=3')!;
  assert.equal(yt.layanan, 'youtube');
  assert.equal(yt.embed, 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0');
  assert.equal(kenaliVideo('https://www.youtube.com/live/dQw4w9WgXcQ?si=x')!.layanan, 'youtube');
  assert.equal(kenaliVideo('https://www.youtube.com/shorts/dQw4w9WgXcQ')!.tegak, true);
  assert.equal(kenaliVideo('https://www.facebook.com/yapida/videos/1234567890/')!.layanan, 'facebook');
  assert.ok(kenaliVideo('https://www.tiktok.com/@yapida/video/7300000000000000000')!.embed.endsWith('/embed/v2/7300000000000000000'));
  assert.equal(kenaliVideo('https://contoh.id/video.mp4'), null);
  assert.equal(kenaliVideo('javascript:alert(1)'), null);
  const xml = '<feed><entry><yt:videoId>dQw4w9WgXcQ</yt:videoId><title>Kajian &amp; Doa</title><published>2026-11-10T01:00:00+00:00</published></entry></feed>';
  assert.deepEqual(uraiUmpan(xml), [{ id: 'dQw4w9WgXcQ', judul: 'Kajian & Doa', terbit: '2026-11-10' }]);
});

test('unggah berkas: jenis dari isi berkas, versi kecil, batas jenis', async () => {
  const e = env();
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]).buffer;
  const pdf = new TextEncoder().encode('%PDF-1.7 isi').buffer;
  assert.equal(kenali(jpg), 'jpg');
  assert.equal(kenali(pdf), 'pdf');
  assert.equal(kenali(new TextEncoder().encode('<svg onload=x>').buffer), null);
  const h = await unggah(e, jpg, jpg, { oleh: 'u', unit: 'mi-al-huda' }, Date.UTC(2026, 10, 15));
  assert.match(h.f, /^2026\/11\/[0-9a-z]{20}\.jpg$/);
  assert.equal(h.k, h.f.replace('.jpg', '_k.jpg'));
  await assert.rejects(unggah(e, pdf, null, { oleh: 'u', unit: 'x', hanya: 'gambar' }), /hanya boleh foto/);
  await assert.rejects(unggah(e, new TextEncoder().encode('MZ...').buffer, null, { oleh: 'u', unit: 'x' }), /tidak didukung/);
  const r = await get(e, `/f/${h.f}`);
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.equal((await get(e, '/f/2026/11/..%2F..%2Fk%2Fsitus.json')).status, 404);
});

test('portal: tanpa sesi dialihkan ke /masuk; POST dari situs lain ditolak; halaman masuk noindex', async () => {
  const e = env();
  const r = await get(e, '/portal');
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/masuk');
  const lintas = await worker.fetch(new Request('https://yapida.sch.id/masuk', { method: 'POST', headers: { origin: 'https://jahat.example', 'content-type': 'application/x-www-form-urlencoded' }, body: 'u=x&k=00000' }) as never, e, {} as ExecutionContext);
  assert.equal(lintas.status, 403);
  const m = await get(e, '/masuk');
  assert.equal(m.status, 200);
  assert.match(m.headers.get('x-robots-tag') ?? '', /noindex/);
  const h = await m.text();
  assert.ok(h.includes('Pemasangan pertama') && !h.includes('adsbygoogle'), 'pemasangan pertama, tanpa iklan');
  assert.ok(!/>\s*[0-9]\s*<\/button>/.test(h), 'angka papan PIN tidak ada sebagai teks');
  assert.match(m.headers.get('set-cookie') ?? '', /__Host-ypk=.*HttpOnly.*SameSite=Strict/i);
  assert.ok((await (await get(e, '/robots.txt')).text()).includes('Disallow: /masuk'));
});

test('PPDB: formulir hanya diterima saat gelombang dibuka; pesan kontak tersimpan untuk lembaganya', async () => {
  const e = env();
  const store = new Store(e.DATA as never);
  await get(e, '/');
  const { PPDB } = await import('../src/data/defs.ts');
  const kini = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  const buka = await simpan(store, PPDB, { unit: 'mi-al-huda', status: 'tayang', judul: 'PPDB MI Al Huda 2027/2028', d: { tahun: '2027/2028', buka: kini, tutup: '2099-01-01', formulir: true, ringkasan: 'Kelas 1.' }, penulis: 'u', penulisNama: 'U' });
  const tutup = await simpan(store, PPDB, { unit: 'ra-al-huda', status: 'tayang', judul: 'PPDB RA Al Huda 2026/2027', d: { tahun: '2026/2027', buka: '2026-01-01', tutup: '2026-02-01', formulir: true, ringkasan: 'Lama.' }, penulis: 'u', penulisNama: 'U' });
  const kirim = (slug: string, body: string) => worker.fetch(new Request(`https://yapida.sch.id/ppdb/${slug}`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body }) as never, e, {} as ExecutionContext);
  const isian = 'nama=Ahmad+Fauzan&d_kelamin=L&d_tempatLahir=Bekasi&d_tanggalLahir=2021-03-14&d_wali=Bapak+Uji&d_telepon=081200000000&d_alamat=Sukakarya';
  assert.equal((await kirim(tutup.slug, isian)).status, 400, 'gelombang yang ditutup menolak pendaftaran');
  assert.equal((await kirim(buka.slug, 'nama=A&d_kelamin=L')).status, 400, 'isian kurang ditolak');
  const ok = await kirim(buka.slug, isian);
  assert.equal(ok.status, 201);
  assert.ok((await ok.text()).includes('Pendaftaran terkirim'));
  const daf = await daftar(store, 'pendaftar', {});
  assert.equal(daf.length, 1);
  assert.equal(daf[0]!.u, 'mi-al-huda');
  assert.equal(daf[0]!.x?.tahap, 'baru');
  assert.equal((await daftar(store, 'pendaftar', { tayang: true })).length, 0, 'data pendaftar tidak pernah masuk indeks publik');
  const pesan = await worker.fetch(new Request('https://yapida.sch.id/kontak', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'nama=Warga&kontak=0812&unit=mi-al-huda&isi=Halo' }) as never, e, {} as ExecutionContext);
  assert.equal(pesan.status, 303);
  const ps = await daftar(store, 'pesan', {});
  assert.equal(ps.length, 1);
  assert.equal(ps[0]!.u, 'mi-al-huda');
});
