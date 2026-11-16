/* Uji ujung-ke-ujung dokumen lembaga (kop, sertifikat & piagam, kwitansi, surat, sertifikat massal, Prestasi publik) di
 * Chromium terhadap `wrangler dev`. Dijalankan sesudah e2e-portal.mjs (memakai akun Super Admin dengan PIN 24680). */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8797';
const OUT = process.env.OUT || 'e2e-out';
fs.mkdirSync(OUT, { recursive: true });
const hasil = [];
const ok = (c, nama, d = '') => { hasil.push(Boolean(c)); console.log(`${c ? 'ok  ' : 'FAIL'}  ${nama}${c ? '' : ` — ${String(d).slice(0, 300)}`}`); };
const galat = [];
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const sidik = JSON.parse(fs.readFileSync(new URL('./angka-sidik.json', import.meta.url), 'utf8'));

async function buka(vp = { width: 1366, height: 900 }, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...opts });
  const page = await ctx.newPage();
  await page.route(/googlesyndication|doubleclick|mp3quran|youtube|ytimg/, (r) => r.abort());
  page.on('pageerror', (e) => galat.push(`${page.url()}: ${e.message.slice(0, 160)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::|ERR_BLOCKED|40[0-9]/.test(m.text())) galat.push(`${page.url()}: ${m.text().slice(0, 160)}`); });
  page.on('response', (r) => { if (r.status() >= 500) galat.push(`HTTP ${r.status()} ${r.url()}`); });
  return { ctx, page };
}
async function masuk(page) {
  await page.goto(BASE + '/masuk');
  await page.selectOption('[data-pin-akun]', { label: 'Super Admin' });
  const peta = new Map((await page.$$eval('[data-pos]', (bs, sd) => bs.map((b) => [b.getAttribute('data-pos'), sd[(b.querySelector('path')?.getAttribute('d') ?? '').slice(0, 40)]]), sidik)).map(([pos, a]) => [a, pos]));
  for (const a of '24680') await page.click(`[data-pos="${peta.get(a)}"]`);
  await page.waitForURL(/\/portal/);
}
const isiBingkai = async (page) => (await page.frameLocator('[data-pratinjau-bingkai]').locator('body').innerHTML()).slice(0, 20000);

{
  const { ctx, page } = await buka();
  await masuk(page);
  ok(await page.locator('nav a[href="/portal/k/penghargaan"]').isVisible(), 'menu Dokumen & cetak: Sertifikat & piagam');
  for (const k of ['kwitansi', 'surat', 'kop']) ok(await page.locator(`nav a[href="/portal/k/${k}"]`).count() === 1, `menu ${k}`);

  // Kop surat MI (kop utama) — dipakai otomatis oleh dokumen MI.
  await page.goto(BASE + '/portal/k/kop/baru?unit=mi-al-huda');
  ok((await page.inputValue('[name="judul"]')).includes('AL HUDA'), 'kop: nama lembaga terisi otomatis');
  await page.fill('[name="d_arab"]', 'مدرسة الهدى الابتدائية');
  await page.selectOption('[name="d_gaya"]', 'islami');
  await page.waitForFunction(() => { const f = document.querySelector('[data-pratinjau-bingkai]'); return f && f.contentDocument && f.contentDocument.body && f.contentDocument.body.innerHTML.includes('مدرسة الهدى'); }, null, { timeout: 8000 });
  ok(true, 'kop: pratinjau langsung berubah saat mengetik');
  await page.click('button:has-text("Simpan")');
  await page.waitForURL(/\/portal\/k\/kop\/kop_/);
  ok(true, 'kop disimpan');

  // Sertifikat: pilih desain → pratinjau; simpan → nomor otomatis → cetak.
  await page.goto(BASE + '/portal/k/penghargaan/baru?unit=mi-al-huda');
  await page.fill('[name="judul"]', 'Ananda Uji Prestasi');
  await page.fill('[name="d_capaian"]', 'Juz 30 (An-Naba’ – An-Nas)');
  await page.fill('[name="d_predikat"]', 'Mumtaz');
  await page.fill('[name="d_nisn"]', '0099887766');
  await page.click('.p-desain-butir.d-malam');
  await page.waitForFunction(() => { const f = document.querySelector('[data-pratinjau-bingkai]'); return f && f.contentDocument && f.contentDocument.body && f.contentDocument.querySelector('.sert.d-malam') && f.contentDocument.body.innerHTML.includes('Ananda Uji Prestasi'); }, null, { timeout: 8000 });
  ok(true, 'sertifikat: pratinjau mengikuti desain dan nama');
  ok((await isiBingkai(page)).includes('مدرسة الهدى'), 'sertifikat memakai kop utama lembaga (nama Arab)');
  await page.screenshot({ path: `${OUT}/dokumen-form-sertifikat.png` });
  await page.click('button:has-text("Simpan")');
  await page.waitForURL(/\/portal\/k\/penghargaan\/peng_/);
  ok(/\/THF\/MI\//.test(await page.inputValue('[name="d_nomor"]')), 'nomor sertifikat otomatis', await page.inputValue('[name="d_nomor"]'));
  const [cetak] = await Promise.all([ctx.waitForEvent('page'), page.click('[data-cetak-dok]')]);
  await cetak.waitForLoadState('load');
  ok(await cetak.locator('.sert.d-malam .sert-nama').innerText() === 'Ananda Uji Prestasi', 'halaman cetak sertifikat');
  ok(await cetak.locator('[data-cetak]').isVisible(), 'tombol Cetak / simpan PDF');
  await cetak.close();

  // Kwitansi + surat.
  await page.goto(BASE + '/portal/k/kwitansi/baru?unit=mi-al-huda');
  await page.fill('[name="judul"]', 'Wali Murid Uji');
  await page.fill('[name="d_jumlah"]', '250000');
  await page.waitForFunction(() => { const f = document.querySelector('[data-pratinjau-bingkai]'); return f && f.contentDocument && f.contentDocument.body && f.contentDocument.body.innerHTML.includes('dua ratus lima puluh ribu rupiah'); }, null, { timeout: 8000 });
  ok(true, 'kwitansi: terbilang otomatis di pratinjau');
  await page.click('button:has-text("Simpan")');
  await page.waitForURL(/\/portal\/k\/kwitansi\/kwit_/);
  ok(/^KW\/MI\/\d{4}\/\d{4}$/.test(await page.inputValue('[name="d_nomor"]')), 'nomor kwitansi otomatis');
  await page.goto(BASE + '/portal/k/kwitansi');
  ok(await page.locator('td a:has-text("Cetak")').count() >= 1, 'daftar kwitansi punya tombol Cetak');

  // Massal.
  await page.goto(BASE + '/portal/penghargaan/massal');
  await page.selectOption('[name="unit"]', 'mi-al-huda');
  await page.click('.p-desain-butir.d-zamrud');
  await page.fill('[name="kegiatan"]', 'Wisuda Tahfidz ke-5');
  await page.fill('[name="daftar"]', 'Santri Massal Satu ; Juz 30 ; Mumtaz ; Kelas 6A\nSantri Massal Dua ; Juz 29 ; Jayyid Jiddan ; Kelas 6B');
  await page.click('button:has-text("Buat semua sertifikat")');
  await page.waitForURL(/\/portal\/cetak-banyak\/penghargaan/);
  ok(await page.locator('.lembar.sert').count() === 2, 'sertifikat massal: dua lembar siap cetak');
  await page.screenshot({ path: `${OUT}/dokumen-massal.png` });
  await ctx.close();
}

// Publik: menu Prestasi, beranda, halaman lembaga; NISN tidak pernah tampil.
for (const [nama, vp, opts] of [['desktop', { width: 1366, height: 900 }, {}], ['ponsel', { width: 390, height: 844 }, { isMobile: true, hasTouch: true }]]) {
  const { ctx, page } = await buka(vp, opts);
  await page.goto(BASE + '/prestasi');
  ok(await page.locator('.kartu-prestasi', { hasText: 'Ananda Uji Prestasi' }).count() === 1, `${nama}: /prestasi menampilkan penerima`);
  ok(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) <= 1, `${nama}: /prestasi tanpa luapan mendatar`);
  const h = await page.content();
  ok(!h.includes('0099887766'), `${nama}: NISN tidak tampil di publik`);
  await page.click('.kartu-prestasi:has-text("Ananda Uji Prestasi")');
  await page.waitForURL(/\/prestasi\/ananda-uji-prestasi$/);
  await page.frameLocator('.prestasi-sert').locator('.sert-nama').waitFor();
  ok(true, `${nama}: detail prestasi menampilkan sertifikatnya`);
  if (nama === 'ponsel') await page.screenshot({ path: `${OUT}/prestasi-ponsel.png`, fullPage: false });
  await page.goto(BASE + '/');
  ok(await page.locator('.pita-prestasi .kartu-prestasi').count() >= 1, `${nama}: beranda memajang prestasi`);
  await ctx.close();
}

await browser.close();
ok(galat.length === 0, 'tanpa galat konsol / HTTP 5xx', galat.join(' | '));
const gagal = hasil.filter((x) => !x).length;
console.log(`\n${hasil.length - gagal}/${hasil.length} lulus`);
process.exit(gagal ? 1 : 0);
