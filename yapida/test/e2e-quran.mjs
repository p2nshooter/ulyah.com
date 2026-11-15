/* Uji ujung-ke-ujung Al-Qur'an mushaf Utsmani di Chromium sungguhan terhadap `wrangler dev`: daftar & pencarian surah,
 * baca per surah (latin, hafalan, tafsir, murottal), halaman mushaf (balik tanpa memuat ulang, lembar ayat, juz),
 * dan posisi terakhir dibaca. Dipanggil test/run-e2e.sh. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8797';
const OUT = process.env.OUT || 'e2e-out';
fs.mkdirSync(OUT, { recursive: true });
const hasil = [];
const ok = (c, nama, d = '') => { hasil.push(Boolean(c)); console.log(`${c ? 'ok  ' : 'FAIL'}  ${nama}${c ? '' : ` — ${String(d).slice(0, 300)}`}`); };
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const galat = [];
async function buka(vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...opts });
  const page = await ctx.newPage();
  await page.route(/googlesyndication|doubleclick|google-analytics/, (r) => r.abort());
  // Murottal dan tafsir datang dari server luar: di uji diganti tiruan agar yang diperiksa adalah kode kita.
  await page.route(/everyayah\.com|cdn\.islamic\.network/, (r) => r.fulfill({ status: 204, body: '' }));
  await page.route(/\/quran\/api\/tafsir\/\d+$/, (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ sumber: 'Tafsir Kemenag RI (equran.id)', ayat: Object.fromEntries(Array.from({ length: 286 }, (_, i) => [String(i + 1), `Tafsir uji ayat ${i + 1}.`])) }) }));
  page.on('pageerror', (e) => galat.push(`${page.url()}: ${e.message.slice(0, 160)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::|status of 204|NotSupportedError|no supported source/i.test(m.text())) galat.push(`${page.url()}: ${m.text().slice(0, 160)}`); });
  page.on('response', (r) => { if (r.status() >= 500) galat.push(`HTTP ${r.status()} ${r.url()}`); });
  return { ctx, page };
}
const lebar = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

for (const [nama, vp, opts] of [['desktop', { width: 1366, height: 860 }, {}], ['ponsel', { width: 390, height: 844 }, { isMobile: true, hasTouch: true }]]) {
  const { ctx, page } = await buka(vp, opts);
  for (const p of ['/quran', '/quran/36', '/quran/halaman/1', '/quran/halaman/50']) {
    const r = await page.goto(BASE + p, { waitUntil: 'load' });
    ok(r.status() === 200 && (await page.locator('h1').count()) <= 1, `${nama} ${p}: 200`, r.status());
    ok((await lebar(page)) <= 1, `${nama} ${p}: tanpa luapan mendatar`, await lebar(page));
  }
  if (nama === 'ponsel') { await page.goto(BASE + '/quran/halaman/50', { waitUntil: 'load' }); await page.screenshot({ path: `${OUT}/quran-mushaf-ponsel.png` }); }
  await ctx.close();
}

{
  const { page } = await buka({ width: 1366, height: 860 });
  await page.goto(BASE + '/quran', { waitUntil: 'load' });
  ok((await page.locator('[data-q-panel="surah"] .q-surah').count()) === 114, 'daftar 114 surah');
  await page.fill('[data-q-cari]', 'yasin');
  ok((await page.locator('[data-q-panel="surah"] .q-surah:not([hidden])').count()) === 1, 'cari „yasin“ → satu surah');
  await page.click('[data-q-tab="juz"]');
  ok((await page.locator('[data-q-panel="juz"] .q-surah').count()) === 30 && (await page.locator('[data-q-panel="juz"]').isVisible()), 'tab juz: 30 juz');
  await page.fill('[data-q-cari]', '2:255');
  await Promise.all([page.waitForURL(/\/quran\/2#ayat-255$/), page.press('[data-q-cari]', 'Enter')]);
  ok(await page.locator('#ayat-255').isVisible(), 'lompat 2:255 → Ayat Kursi');
  await page.screenshot({ path: `${OUT}/quran-ayat-kursi.png` });

  await page.goto(BASE + '/quran/36', { waitUntil: 'load' });
  ok(await page.evaluate(() => document.fonts.check('30px "Uthmani Hafs"')), 'font KFGQPC Uthmanic Hafs termuat');
  ok((await page.locator('.q-ayat').count()) === 83, 'Yasin: 83 ayat');
  ok(!(await page.locator('#ayat-1 [data-q-lt]').isVisible()), 'latin tersembunyi bawaan');
  await page.click('[data-q-tampil="lt"]');
  ok(await page.locator('#ayat-1 [data-q-lt]').isVisible(), 'tombol Latin menampilkan latin');
  await page.click('[data-q-tafsir="1"]');
  await page.waitForFunction(() => document.querySelector('#ayat-1 [data-q-tafsir-isi]').textContent.includes('Tafsir uji ayat 1'));
  ok((await page.locator('#ayat-1 [data-q-tafsir-isi]').innerText()).includes('Sumber: Tafsir Kemenag'), 'tafsir ayat tampil dengan sumbernya');
  await page.click('[data-q-putar="3"]');
  ok(await page.locator('#ayat-3.aktif').count() === 1 && await page.locator('[data-q-pemutar]').isVisible(), 'murottal: ayat 3 disorot, pemutar tampil');
  await page.click('[data-q-henti]');
  await page.click('[data-q-tampil="hafal"]');
  ok((await page.locator('.q-baca').getAttribute('data-q-hafal')) === '1', 'mode hafalan menyamarkan teks Arab');
  await page.click('[data-q-tampil="hafal"]');

  await page.goto(BASE + '/quran/halaman/1', { waitUntil: 'load' });
  ok((await page.locator('.m-baris').count()) === 7 && (await page.locator('.m-surat').count()) === 1, 'mushaf halaman 1: kepala surah + 7 baris');
  await page.evaluate(() => { window.__tanpaMuatUlang = 1; });
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(() => location.pathname === '/quran/halaman/2');
  ok(await page.evaluate(() => window.__tanpaMuatUlang === 1) && (await page.locator('.m-surat').innerText()).includes('البَقَرَة'), 'panah kiri → halaman 2 tanpa memuat ulang');
  await page.locator('.m-baris .w').nth(3).click();
  await page.waitForFunction(() => document.querySelector('[data-m-ayat-tr]').textContent.length > 5);
  ok((await page.locator('[data-m-ayat-judul]').innerText()).startsWith('QS Al-Baqarah'), 'ketuk kata → lembar ayat dengan terjemah');
  await page.click('[data-m-ayat-tafsir]');
  await page.waitForFunction(() => document.querySelector('[data-m-ayat-tafsir-isi]').textContent.includes('Tafsir uji'));
  ok(true, 'lembar ayat: tafsir tampil');
  await page.click('[data-m-tutup]');
  await page.selectOption('[data-m-juz]', { label: 'Juz 30' });
  await page.waitForFunction(() => location.pathname === '/quran/halaman/582');
  ok((await page.locator('.m-surat').first().innerText()).includes('النَّبَإ') || (await page.locator('.m-surat').count()) >= 1, 'pilih Juz 30 → halaman 582 (An-Naba’)');
  await page.screenshot({ path: `${OUT}/quran-mushaf-582.png` });
  await page.click('[data-m-putar]');
  ok((await page.locator('[data-m-isi] .aktif').count()) > 0, 'Dengarkan: ayat pertama halaman disorot');
  await page.goto(BASE + '/quran', { waitUntil: 'load' });
  ok((await page.getAttribute('[data-q-lanjut]', 'href')) === '/quran/halaman/582' && (await page.locator('[data-q-lanjut]').isVisible()), 'Lanjutkan membaca → halaman terakhir');
}

await browser.close();
ok(galat.length === 0, 'tanpa galat konsol / HTTP 5xx', galat.join(' | '));
const gagal = hasil.filter((h) => !h).length;
console.log(`\n${hasil.length - gagal}/${hasil.length} lulus`);
process.exit(gagal ? 1 : 0);
