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

const stack = JSON.parse(fs.readFileSync(new URL('../../adsense-stack.json', import.meta.url), 'utf8')) as { stack: string[]; primary: Record<string, string> };

function env(extra: Partial<Env> = {}): Env {
  return { DATA: new FakeR2() as unknown as R2Bucket, MEDIA: new FakeR2() as unknown as R2Bucket, ASSETS: {} as Fetcher, CANONICAL_HOST: 'yapida.sch.id', ...extra };
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
  for (const p of ['/', '/profil', '/lembaga', '/lembaga/mi-al-huda', '/donasi', '/kontak', '/h/kebijakan-privasi', '/h/syarat-penggunaan']) {
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
  await putSitus(store, (s) => ({ ...s, organ: [...s.organ, { organ: 'Pengurus', jabatan: 'Wakil Ketua', nama: 'Nama Uji Coba' }], donasi: { ...s.donasi, tampil: false } }));
  h = await (await get(e, '/profil')).text();
  assert.ok(h.includes('Nama Uji Coba'));
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
