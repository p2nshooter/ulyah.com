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
const HALAMAN = ['/', '/profil', '/lembaga', '/lembaga/mi-al-huda', '/lembaga/upz-al-huda', '/donasi', '/kontak', '/h/kebijakan-privasi'];

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
  await page.hover('.menu-induk > a');
  ok(await page.locator('[data-mega]').isVisible(), 'menu Lembaga membuka daftar 15 lembaga');
  await page.locator('[data-mega] a', { hasText: 'MTs Al Huda' }).click();
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
