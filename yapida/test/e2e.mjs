/* Uji ujung-ke-ujung yapida.sch.id di Chromium sungguhan terhadap `wrangler dev` (R2 lokal): desktop + ponsel,
 * tanpa galat konsol, tanpa luapan mendatar, interaksi (saring lembaga, linimasa, tema, tasbih, menu laci) bekerja.
 *   bash test/run-e2e.sh */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8797';
const OUT = process.env.OUT || 'e2e-out';
fs.mkdirSync(OUT, { recursive: true });
const hasil = [];
const ok = (c, nama, d = '') => { hasil.push({ ok: Boolean(c), nama, d: String(d).slice(0, 200) }); console.log(`${c ? 'ok  ' : 'FAIL'}  ${nama}${c ? '' : ` — ${d}`}`); };

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const galat = [];
async function buka(vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...opts });
  const page = await ctx.newPage();
  // Iklan tidak dimuat di uji: yang diperiksa adalah kode kita, bukan jaringan Google.
  await page.route(/googlesyndication|doubleclick|google-analytics/, (r) => r.abort());
  page.on('pageerror', (e) => galat.push(`${page.url()}: ${e.message.slice(0, 140)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) galat.push(`${page.url()}: ${m.text().slice(0, 140)}`); });
  page.on('response', (r) => { if (r.status() >= 500) galat.push(`HTTP ${r.status()} ${r.url()}`); });
  return { ctx, page };
}
const lebar = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const HALAMAN = ['/', '/profil', '/lembaga', '/lembaga/mi-al-huda', '/lembaga/upz-al-huda', '/donasi', '/kontak', '/h/kebijakan-privasi', '/ibadah', '/jadwal-sholat', '/kiblat', '/kalender-hijriah', '/radio-quran'];

/* ── desktop ── */
{
  const { ctx, page } = await buka({ width: 1366, height: 860 });
  for (const p of HALAMAN) {
    const r = await page.goto(BASE + p, { waitUntil: 'load' });
    ok(r.status() === 200 && (await page.locator('h1').count()) === 1, `desktop ${p}: 200 dan satu h1`, r.status());
    ok((await lebar(page)) <= 1, `desktop ${p}: tanpa luapan mendatar`, await lebar(page));
  }
  await page.goto(BASE + '/', { waitUntil: 'load' });
  ok((await page.locator('.kartu-unit').count()) === 15, 'beranda: 15 kartu lembaga');
  await page.click('[data-saring-nilai="formal"]');
  ok((await page.locator('.kartu-unit:visible').count()) === 4, 'saring "Pendidikan Formal" → 4 lembaga', await page.locator('.kartu-unit:visible').count());
  await page.click('[data-saring-nilai="semua"]');
  ok((await page.locator('.kartu-unit:visible').count()) === 15, 'saring "Semua" → 15 lembaga');
  await page.click('[data-linimasa-tbl="2"]');
  ok(await page.locator('[data-linimasa-panel="2"]').isVisible() && !(await page.locator('[data-linimasa-panel="0"]').isVisible()), 'linimasa: memilih 1993 menampilkan panelnya');
  ok(/\d{4} H/.test(await page.locator('[data-hijri]').innerText()), 'tanggal hijriah tampil', await page.locator('[data-hijri]').innerText());
  await page.click('[data-tema-ganti]');
  ok((await page.getAttribute('html', 'data-tema')) === 'malam', 'tema malam aktif');
  await page.reload({ waitUntil: 'load' });
  ok((await page.getAttribute('html', 'data-tema')) === 'malam', 'tema malam diingat setelah muat ulang');
  await page.screenshot({ path: `${OUT}/beranda-malam.png` });
  await page.click('[data-tema-ganti]');
  await page.hover('.menu-induk:has(> a[href="/lembaga"]) > a');
  ok(await page.locator('.menu-induk:has(> a[href="/lembaga"]) [data-mega]').isVisible(), 'menu Lembaga membuka daftar 15 lembaga');
  await page.locator('.menu-induk:has(> a[href="/lembaga"]) [data-mega] a', { hasText: 'MTs Al Huda' }).click();
  ok(page.url().endsWith('/lembaga/mts-al-huda'), 'tautan mega menu menuju profil lembaga');
  const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return Boolean(r.active); });
  ok(sw, 'service worker aktif (syarat pasang aplikasi)');
  const man = await page.evaluate(async () => (await (await fetch(document.querySelector('link[rel="manifest"]').href)).json()).display);
  ok(man === 'standalone', 'manifest PWA terbaca dari halaman');
  await page.goto(BASE + '/donasi');
  ok((await page.locator('.rekening-kartu').count()) >= 1, 'donasi: kartu rekening tampil');
  await page.screenshot({ path: `${OUT}/beranda.png`, fullPage: false });
  await ctx.close();
}

/* ── ponsel ── */
{
  const { ctx, page } = await buka({ width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  for (const p of HALAMAN) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    ok((await lebar(page)) <= 1, `ponsel ${p}: tanpa luapan mendatar`, await lebar(page));
  }
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.click('[data-menu-buka]');
  await page.waitForTimeout(500);
  ok(await page.locator('.menu a', { hasText: 'Profil' }).first().isVisible(), 'ponsel: laci menu terbuka');
  await page.locator('.menu .mega-kol a', { hasText: 'BMT Al Huda' }).click();
  ok(page.url().endsWith('/lembaga/bmt-al-huda'), 'ponsel: tautan lembaga di laci bekerja');
  await page.click('[data-tasbih-buka]');
  for (let i = 0; i < 33; i += 1) await page.click('[data-tasbih-ketuk]');
  ok((await page.locator('[data-tasbih-putaran]').innerText()).includes('1') && (await page.locator('[data-tasbih-latin]').innerText()).startsWith('Alhamdulillah'), 'tasbih: 33 ketukan → putaran 1, lanjut tahmid', await page.locator('[data-tasbih-latin]').innerText());
  await page.screenshot({ path: `${OUT}/tasbih.png` });
  await page.keyboard.press('Escape');
  ok(!(await page.locator('[data-tasbih]').isVisible()), 'tasbih tertutup dengan Escape');
  // Spanduk pasang: muncul saat peramban menawarkan pemasangan, hilang setelah terpasang, muncul lagi bila ditawarkan ulang.
  const kirim = (nama) => page.evaluate((n) => { const e = new Event(n); e.prompt = () => {}; e.userChoice = Promise.resolve({ outcome: 'dismissed' }); window.dispatchEvent(e); }, nama);
  await kirim('beforeinstallprompt');
  ok(await page.locator('.pasang').isVisible(), 'spanduk "Pasang aplikasi" muncul saat belum terpasang');
  await page.screenshot({ path: `${OUT}/pasang.png` });
  await kirim('appinstalled');
  ok((await page.locator('.pasang').count()) === 0, 'spanduk hilang setelah aplikasi terpasang');
  await kirim('beforeinstallprompt');
  ok(await page.locator('.pasang').isVisible(), 'spanduk muncul lagi setelah aplikasi dihapus (ditawarkan ulang)');
  await ctx.close();
}

/* ── aplikasi ibadah (jam perangkat diset ke WIB, tanggal tetap supaya hasil hitung bisa diperiksa) ── */
{
  const { ctx, page } = await buka({ width: 1366, height: 900 }, { timezoneId: 'Asia/Jakarta' });
  await page.clock.install({ time: new Date('2026-11-16T03:00:00Z') });   // Senin 16 Nov 2026, 10.00 WIB
  await page.goto(BASE + '/jadwal-sholat', { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelectorAll('[data-sholat-daftar] li').length === 7);
  const jam = await page.locator('[data-sholat-daftar] li strong').allInnerTexts();
  const menit = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
  // Sukakarya, pertengahan November: Subuh ±04.04, Dzuhur ±11.39, Ashar ±15.00, Maghrib ±17.50, Isya ±19.04 (kriteria Kemenag).
  const dekat = (i, hhmm, tol = 6) => Math.abs(menit(jam[i]) - menit(hhmm)) <= tol;
  ok(jam.length === 7 && dekat(1, '04.04') && dekat(3, '11.39') && dekat(4, '15.00') && dekat(5, '17.50') && dekat(6, '19.04'), 'jadwal sholat Sukakarya masuk akal untuk 16 Nov', jam.join(' '));
  ok(menit(jam[1]) - menit(jam[0]) === 10, 'Imsak 10 menit sebelum Subuh', jam.slice(0, 2).join(' '));
  ok((await page.locator('[data-sholat-nama]').innerText()) === 'Dzuhur', 'pukul 10.00: sholat berikutnya Dzuhur', await page.locator('[data-sholat-nama]').innerText());
  ok(/1 jam [34]\d menit lagi/.test(await page.locator('[data-sholat-sisa]').innerText()), 'hitung mundur ke adzan berjalan', await page.locator('[data-sholat-sisa]').innerText());
  ok((await page.locator('[data-sholat-tabel] tbody tr').count()) === 30, 'tabel 30 hari terisi');
  ok((await page.getAttribute('[data-langit-hari]', 'data-fase')) === 'siang', 'langit: fase siang pada pukul 10.00');
  await page.screenshot({ path: `${OUT}/jadwal-sholat.png` });

  await page.goto(BASE + '/kiblat', { waitUntil: 'load' });
  const derajat = Number((await page.locator('[data-kiblat-derajat]').innerText()).replace('°', '').replace(',', '.'));
  ok(Math.abs(derajat - 295.1) < 0.6, 'kiblat dari Sukakarya ±295°', derajat);
  ok(/7\.9\d\d km/.test(await page.locator('[data-kiblat-jarak]').innerText()), 'jarak ke Ka’bah ±7.9xx km', await page.locator('[data-kiblat-jarak]').innerText());
  await page.screenshot({ path: `${OUT}/kiblat.png` });

  await page.goto(BASE + '/kalender-hijriah', { waitUntil: 'load' });
  ok((await page.locator('[data-kal-judul]').innerText()) === 'Jumadil Akhir 1448 H', 'kalender: 16 Nov 2026 jatuh di Jumadil Akhir 1448 H', await page.locator('[data-kal-judul]').innerText());
  const sel = await page.locator('.kal-sel[data-ket]').count();
  ok(sel === 29 || sel === 30, 'bulan hijriah 29 atau 30 hari', sel);
  ok((await page.locator('.kal-kini b').innerText()) === '6' && (await page.locator('[data-kal-detail]').innerText()).includes('Puasa sunnah Senin'), 'hari ini 6 Jumadil Akhir, Senin = puasa sunnah', await page.locator('[data-kal-detail]').innerText());
  await page.click('[data-kal-maju]');
  ok((await page.locator('[data-kal-judul]').innerText()) === 'Rajab 1448 H', 'bulan berikutnya: Rajab');
  ok(await page.locator('.kal-besar em', { hasText: 'Isra Mi’raj' }).count() === 1, 'Isra Mi’raj ditandai pada 27 Rajab');
  await page.click('[data-kal-mundur]'); await page.click('[data-kal-mundur]');
  ok((await page.locator('[data-kal-judul]').innerText()) === 'Jumadil Awal 1448 H', 'mundur dua kali: Jumadil Awal');
  const hari = Number(await page.locator('[data-ramadhan-hari]').first().innerText());
  ok(hari >= 80 && hari <= 86, 'hitung mundur Ramadhan 1448 H ±84 hari dari 16 Nov 2026', hari);
  ok((await page.locator('[data-kal-besar] li').count()) === 6, 'enam hari besar terdekat tercantum');
  await page.screenshot({ path: `${OUT}/kalender.png` });

  await page.goto(BASE + '/radio-quran', { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelectorAll('[data-radio-daftar] li').length === 114);
  await page.fill('[data-radio-cari]', 'kahf');
  ok((await page.locator('[data-radio-daftar] li:visible').count()) === 1, 'cari surah "kahf" → satu hasil');
  await page.route(/cdn\.islamic\.network/, (r) => r.abort());
  const permintaan = page.waitForRequest(/cdn\.islamic\.network\/quran\/audio-surah\/128\/ar\.alafasy\/18\.mp3/);
  await page.locator('[data-radio-daftar] li:visible').click();
  await permintaan;
  ok((await page.locator('[data-radio-judul]').innerText()) === '18. Al-Kahf', 'memilih surah memuat murottalnya dari CDN qari', await page.locator('[data-radio-judul]').innerText());
  await page.screenshot({ path: `${OUT}/radio.png` });

  await page.goto(BASE + '/ibadah', { waitUntil: 'load' });
  await page.waitForFunction(() => (document.querySelector('[data-hidup="sholat"]')?.textContent ?? '') !== '');
  ok((await page.locator('[data-hidup="sholat"]').innerText()).startsWith('Dzuhur') && (await page.locator('[data-hidup="kiblat"]').innerText()).includes('295') && (await page.locator('[data-hidup="hijri"]').innerText()) === '6 Jumadil Akhir 1448 H', 'pusat aplikasi menampilkan nilai langsung', await page.locator('[data-hidup="sholat"]').innerText());
  await ctx.close();
}

/* ── tanpa JavaScript: isi tetap terbaca ── */
{
  const { ctx, page } = await buka({ width: 390, height: 844 }, { javaScriptEnabled: false });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  ok(await page.locator('.kartu-unit').first().isVisible(), 'tanpa JavaScript: kartu lembaga tetap terlihat');
  await ctx.close();
}

await browser.close();
ok(galat.length === 0, 'tanpa galat konsol / HTTP 5xx', galat.join(' | '));
const gagal = hasil.filter((h) => !h.ok);
console.log(`\n${hasil.length - gagal.length}/${hasil.length} lulus`);
process.exit(gagal.length ? 1 : 0);
