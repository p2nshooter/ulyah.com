/* Uji di Chromium sungguhan: beranda & jalur (desktop/ponsel), paket latihan (kunci tertahan sampai selesai, prediksi,
 * laporan), pelajaran (cek latihan, kuis), daftar → tagihan → bukti → admin setujui. Gagal bila ada galat konsol. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = await import('playwright'); } catch { pw = require(process.env.PW_PKG || '/opt/node-tools/node_modules/playwright'); }
const { chromium, devices } = pw;
const BASE = process.env.BASE, OUT = process.env.OUT || 'e2e-out';
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const errors = [];
let step = 0;
const ok = (m) => console.log(`✓ ${++step}. ${m}`);
const fail = (m) => { throw new Error(m); };
async function ctx(opts = {}) {
  const c = await browser.newContext({ viewport: { width: 1366, height: 860 }, reducedMotion: 'reduce', acceptDownloads: true, ...opts });
  const p = await c.newPage();
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_PROXY|googlesyndication|ERR_NAME|ERR_CONNECTION|Failed to load resource/.test(m.text())) errors.push(`${p.url()} ${m.text()}`); });
  p.on('pageerror', (e) => errors.push(`${p.url()} ${e.message}`));
  return { c, p };
}

try {
  // 1. Halaman publik desktop & ponsel
  {
    const { c, p } = await ctx();
    for (const path of ['/', '/jerman', '/inggris', '/jepang', '/harga', '/latihan', '/jerman/a1']) {
      const r = await p.goto(BASE + path, { waitUntil: 'load' });
      if (r.status() !== 200) fail(`${path} → ${r.status()}`);
    }
    await p.goto(BASE + '/');
    await p.screenshot({ path: `${OUT}/beranda-desktop.png` });
    ok('halaman publik tampil (desktop)');
    await c.close();
    const m = await ctx({ ...devices['Pixel 7'] });
    await m.p.goto(BASE + '/');
    const overflow = await m.p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) fail(`beranda ponsel melebar ${overflow}px`);
    await m.p.screenshot({ path: `${OUT}/beranda-ponsel.png` });
    await m.p.click('[data-nav-toggle]');
    await m.p.waitForSelector('#nav.open');
    ok('beranda ponsel tanpa geser samping, menu terbuka');
    await m.c.close();
  }
  // 2. Paket latihan: tombol kumpulkan terkunci sampai semua terjawab, lalu hasil + kunci + prediksi + laporan
  {
    const { c, p } = await ctx();
    await p.goto(BASE + '/latihan/de-a1-p1');
    if (await p.locator('[data-submit]').isEnabled()) fail('kumpulkan aktif sebelum dijawab');
    if (await p.locator('.opt.ok').count()) fail('kunci tampil sebelum selesai');
    const qs = await p.locator('.pq').count();
    for (let i = 0; i < qs; i += 1) await p.locator('.pq').nth(i).locator('.opt').first().click();
    if (!(await p.locator('[data-submit]').isEnabled())) fail('kumpulkan tidak aktif setelah semua dijawab');
    await p.click('[data-submit]');
    await p.waitForSelector('.result .predict');
    const pred = await p.textContent('.predict b');
    if (!/\/ 100/.test(pred)) fail(`prediksi Goethe tidak ada: ${pred}`);
    if ((await p.locator('.opt.ok').count()) !== qs) fail('kunci tidak tampil untuk semua soal');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-report]')]);
    const file = `${OUT}/${dl.suggestedFilename()}`;
    await dl.saveAs(file);
    if (!fs.readFileSync(file, 'utf8').includes('Laporan latihan soal')) fail('laporan kosong');
    await p.screenshot({ path: `${OUT}/latihan-hasil.png`, fullPage: false });
    ok(`latihan: ${qs} soal, kunci tertahan sampai selesai, prediksi ${pred}, laporan terunduh`);
    await c.close();
  }
  // 3. Pelajaran gratis: latihan terbimbing diperiksa server, kuis dinilai setelah lengkap
  {
    const { c, p } = await ctx();
    await p.goto(BASE + '/belajar/de-a1-m01-l01');
    const first = p.locator('[data-ex="practice"] .exercise').first();
    await first.locator('.opt').nth(1).click();
    await first.locator('.fb').waitFor({ state: 'visible' });
    if (!(await first.evaluate((el) => el.classList.contains('ok') || el.classList.contains('bad')))) fail('umpan balik latihan tidak muncul');
    const quiz = p.locator('[data-ex="quiz"] .exercise');
    const n = await quiz.count();
    for (let i = 0; i < n; i += 1) {
      const box = quiz.nth(i);
      if (await box.locator('.opt').count()) await box.locator('.opt').first().click();
      else if (await box.locator('input').count()) await box.locator('input').first().fill('test');
      else if (await box.locator('.chip').count()) { const chips = box.locator('[data-pool] .chip'); while (await chips.count()) await chips.first().click(); }
    }
    await p.click('[data-quizsubmit]');
    await p.waitForSelector('[data-quizresult] .score');
    await p.screenshot({ path: `${OUT}/pelajaran-kuis.png` });
    ok('pelajaran: umpan balik langsung, kuis dinilai setelah semua dijawab');
    await c.close();
  }
  // 4. Daftar → tagihan → bukti → admin setujui → pelajaran berbayar terbuka
  {
    const { c, p } = await ctx();
    await p.goto(BASE + '/daftar');
    await p.fill('#name', 'Peserta Uji'); await p.fill('#email', `uji${Date.now()}@contoh.id`); await p.fill('#pw', 'rahasia-uji-1');
    await p.check('input[name=setuju]'); await p.click('button[type=submit]');
    await p.waitForURL(/\/portal/);
    await p.goto(BASE + '/portal/paket');
    await p.check('input[value=de]'); await p.check('input[value=umum]');
    if ((await p.textContent('[data-total]')).replace(/\D/g, '') !== '500000') fail('total paket salah');
    await p.click('form[data-buy] button[type=submit]');
    await p.waitForURL(/\/portal\/tagihan\//);
    if (!(await p.content()).includes('901592737762')) fail('rekening tidak tampil di tagihan');
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    await p.setInputFiles('#bukti', { name: 'bukti.png', mimeType: 'image/png', buffer: png });
    await p.click('form[enctype] button[type=submit]');
    await p.waitForURL(/ok=1/);
    await p.screenshot({ path: `${OUT}/tagihan-terkirim.png` });
    const a = await ctx();
    await a.p.goto(BASE + '/admin/masuk');
    await a.p.fill('#email', process.env.OWNER); await a.p.fill('#pw', process.env.OWNER_PASS); await a.p.click('button[type=submit]');
    await a.p.waitForURL(/\/admin$/);
    await a.p.goto(BASE + '/admin/pembayaran');
    await a.p.click('form[action$="/setujui"] button');
    await a.p.waitForURL(/ok=/);
    await a.c.close();
    await p.goto(BASE + '/belajar/de-a1-m01-l02');
    if (!(await p.locator('[data-lesson]').count())) fail('pelajaran berbayar belum terbuka setelah disetujui');
    ok('daftar → tagihan → bukti → admin setujui → pelajaran berbayar terbuka');
    await c.close();
  }
  // 5. Logo diketuk 5 kali → pintu pengelola
  {
    const { c, p } = await ctx();
    await p.goto(BASE + '/');
    for (let i = 0; i < 5; i += 1) await p.click('[data-logo]', { delay: 10 });
    await p.waitForURL(/\/admin/);
    ok('lima ketukan logo membuka pintu pengelola');
    await c.close();
  }
  if (errors.length) fail(`galat konsol:\n${errors.join('\n')}`);
  console.log('\nSemua uji ujung-ke-ujung lulus.');
} catch (err) {
  console.error(`✗ ${err.message}`);
  if (errors.length) console.error(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
