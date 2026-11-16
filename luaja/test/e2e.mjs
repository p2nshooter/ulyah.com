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
  // 4b. Pengelola: tambah metode bayar Wise, buka gerbang otomatis (desktop + ponsel), hapus dengan konfirmasi
  {
    const a = await ctx();
    await a.p.goto(BASE + '/admin/masuk');
    await a.p.fill('#email', process.env.OWNER); await a.p.fill('#pw', process.env.OWNER_PASS); await a.p.click('button[type=submit]');
    await a.p.waitForURL(/\/admin$/);
    await a.p.goto(BASE + '/admin/rekening/baru?jenis=wise');
    await a.p.check('input[name=cur_USD]');
    await a.p.fill('input[name=account]', 'bayar@wise.test');
    await a.p.click('form[action$="/simpan"] button[type=submit]');
    await a.p.waitForURL(/\/admin\/rekening\?ok=/);
    if (!(await a.p.content()).includes('bayar@wise.test')) fail('metode Wise tidak tersimpan');
    for (const g of ['stripe', 'xendit', 'midtrans']) {
      await a.p.goto(BASE + `/admin/gerbang/${g}`);
      if (!(await a.p.locator('input[name=test_secret]').count())) fail(`halaman gerbang ${g} tidak lengkap`);
    }
    await a.p.setViewportSize({ width: 360, height: 780 });
    await a.p.goto(BASE + '/admin/rekening');
    if (await a.p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) fail('admin metode bayar bergeser ke samping di ponsel');
    await a.p.screenshot({ path: `${OUT}/admin-metode-bayar-ponsel.png`, fullPage: true });
    a.p.once('dialog', (d) => d.accept());
    const row = a.p.locator('tr', { hasText: 'bayar@wise.test' });
    await row.locator('form[data-confirm] button').click();
    await a.p.waitForURL(/ok=/);
    if ((await a.p.content()).includes('bayar@wise.test')) fail('metode tidak terhapus');
    await a.p.goto(BASE + '/portal');
    if (!(await a.p.content()).includes('Mode pengelola')) fail('portal pengelola tanpa akses penuh');
    ok('pengelola: tambah/hapus metode bayar, halaman Stripe/Xendit/Midtrans, portal member akses penuh');
    await a.c.close();
  }
  // 4c. Tiga bahasa: pemilih bahasa, halaman Inggris & Jepang (desktop + ponsel), teks klien ikut bahasa
  {
    const { c, p } = await ctx();
    await p.goto(BASE + '/');
    await p.click('.site-head .lang-switch a[lang="en"]');
    await p.waitForURL(/\/en\/$/);
    if ((await p.getAttribute('html', 'lang')) !== 'en') fail('pemilih bahasa: halaman tidak berbahasa Inggris');
    await p.goto(BASE + '/harga');
    await p.waitForURL(/\/en\/harga$/);
    if (!(await p.content()).includes('US$')) fail('harga Inggris tidak dalam USD');
    await p.goto(BASE + '/en/latihan/de-a1-p1');
    if (!(await p.textContent('[data-left]')).includes('unanswered')) fail('teks latihan tidak berbahasa Inggris');
    await p.click('.site-head .lang-switch a[lang="ja"]');
    await p.waitForURL(/\/ja\/latihan\/de-a1-p1$/);
    await p.waitForSelector('[data-questions] .pq');
    if (!(await p.textContent('[data-left]')).includes('未解答')) fail('teks latihan tidak berbahasa Jepang');
    await p.goto(BASE + '/ja/belajar/ja-n5-m01-l01');
    if (!(await p.textContent('[data-toggle-tr]')).includes('訳を隠す')) fail('tombol pelajaran tidak berbahasa Jepang');
    await p.setViewportSize({ width: 360, height: 780 });
    for (const path of ['/ja/', '/en/', '/ja/harga', '/en/jepang']) {
      await p.goto(BASE + path);
      if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) fail(`${path}: bergeser ke samping di ponsel`);
    }
    await p.goto(BASE + '/ja/');
    await p.screenshot({ path: `${OUT}/beranda-ja-ponsel.png`, fullPage: true });
    await p.setViewportSize({ width: 1280, height: 860 });
    await p.goto(BASE + '/en/');
    await p.screenshot({ path: `${OUT}/beranda-en-desktop.png` });
    await p.click('.site-head .lang-switch a[lang="id"]');
    await p.waitForURL((u) => new URL(u).pathname === '/');
    ok('tiga bahasa: pemilih ID/EN/日本語 konsisten, harga & teks klien ikut bahasa, ponsel tanpa geser samping');
    await c.close();
  }
  // 4d. Pustaka: rak, halaman buku (sampul + daftar isi), pembaca — tamu: pratinjau lalu terkunci; pengelola: penuh + latihan
  {
    const { c, p } = await ctx();
    for (const path of ['/pustaka', '/pustaka?bahasa=en', '/pustaka?bahasa=ja', '/pustaka/de-gg-a1']) {
      const r = await p.goto(BASE + path, { waitUntil: 'load' });
      if (r.status() !== 200) fail(`${path} → ${r.status()}`);
    }
    if (!(await p.locator('.toc li').count())) fail('daftar isi buku kosong');
    for (const lv of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
      await p.goto(BASE + `/jerman/${lv}`);
      if (!(await p.locator('.level-hub .bk-card').count())) fail(`jenjang Jerman ${lv} tanpa buku`);
    }
    await p.screenshot({ path: `${OUT}/pustaka-buku.png` });
    await p.goto(BASE + '/baca/en-tatoeba-1-1');
    await p.waitForSelector('.rd-page .sen');
    await p.click('[data-hide-tr]');
    if (!(await p.evaluate(() => document.body.classList.contains('rd-hide-tr')))) fail('uji diri tidak menyembunyikan arti');
    await p.click('.rd-page .sen .w');
    await p.waitForSelector('[data-pop]:not([hidden])');
    await p.keyboard.press('Escape');
    await p.screenshot({ path: `${OUT}/pembaca-kalimat.png` });
    await p.goto(BASE + '/baca/de-gg-a1?h=4');
    await p.waitForSelector('.rd-locked');
    ok('pustaka: rak, sampul & daftar isi, pembaca kalimat (uji diri, ketuk kata), halaman ke-4 terkunci untuk tamu');
    await c.close();
    const a = await ctx();
    await a.p.goto(BASE + '/admin/masuk');
    await a.p.fill('#email', process.env.OWNER); await a.p.fill('#pw', process.env.OWNER_PASS); await a.p.click('button[type=submit]');
    await a.p.waitForURL(/\/admin$/);
    await a.p.goto(BASE + '/baca/de-gg-a1');
    await a.p.waitForSelector('.rd-page .rd-pt');
    const exPage = await a.p.evaluate(async () => { const j = await (await fetch('/p/b/de-gg-a1.json')).json(); return j.locked ? -1 : j.pages.findIndex((x) => x.b.some((b) => b.k === 'mc')); });
    if (exPage < 0) fail('pengelola tidak menerima buku penuh');
    await a.p.goto(BASE + `/baca/de-gg-a1?h=${exPage + 1}`);
    await a.p.waitForSelector('.mc-opt');
    await a.p.locator('.mc-opt').first().click();
    await a.p.waitForSelector('.mc-opt.ok');
    if (!(await a.p.locator('.rd-score').textContent()).match(/1/)) fail('skor latihan halaman tidak bertambah');
    await a.p.click('[data-next]');
    await a.p.waitForFunction((n) => new URL(location.href).searchParams.get('h') === String(n + 2), exPage);
    await a.p.goto(BASE + '/baca/ja-kanji-n5');
    await a.p.waitForSelector('.kj .kj-char');
    await a.p.goto(BASE + '/baca/ja-aozora-628');
    await a.p.waitForSelector('.rd-page ruby rt');
    await a.p.goto(BASE + '/baca/de-dib-wortschatz-a1');
    await a.p.waitForSelector('.voc-list li');
    await a.p.click('.voc-head .btn');
    await a.p.waitForSelector('dialog.fc[open] .fc-card');
    await a.p.click('dialog.fc[open] .fc-x');
    await a.c.close();
    const m = await ctx({ ...devices['Pixel 7'] });
    await m.p.goto(BASE + '/baca/en-tatoeba-1-1');
    await m.p.waitForSelector('.rd-page .sen');
    const over = await m.p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 2) fail(`pembaca ponsel melebar ${over}px`);
    await m.p.screenshot({ path: `${OUT}/pembaca-ponsel.png` });
    await m.c.close();
    ok('pustaka: pengelola membaca penuh, pilihan ganda dinilai langsung, kartu hafalan, pembaca ponsel tanpa geser samping');
  }
  // 4e. Pasang aplikasi: tanda muncul saat peramban menawarkan pemasangan, hilang setelah terpasang, muncul lagi bila dihapus
  {
    const m = await ctx({ ...devices['Pixel 7'] });
    await m.p.goto(BASE + '/');
    if (await m.p.locator('[data-install-banner]').isVisible()) fail('spanduk pasang tampil sebelum peramban menawarkan');
    const offer = () => m.p.evaluate(() => { const ev = new Event('beforeinstallprompt', { cancelable: true }); ev.prompt = () => Promise.resolve(); ev.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(ev); });
    await offer();
    await m.p.waitForSelector('[data-install-banner]:not([hidden])');
    await m.p.screenshot({ path: `${OUT}/pasang-ponsel.png` });
    await m.p.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
    await m.p.waitForSelector('[data-install-banner][hidden]', { state: 'attached' });
    if ((await m.p.evaluate(() => localStorage.getItem('lj_installed'))) !== '1') fail('status terpasang tidak tersimpan');
    await offer(); // aplikasi dihapus dari HP → peramban menawarkan lagi
    await m.p.waitForSelector('[data-install-banner]:not([hidden])');
    if ((await m.p.evaluate(() => localStorage.getItem('lj_installed'))) !== null) fail('status terpasang tidak dibersihkan setelah dihapus');
    await m.c.close();
    ok('pasang aplikasi: tanda muncul saat bisa dipasang, hilang setelah terpasang, muncul lagi setelah dihapus');
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
