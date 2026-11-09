// Uji ujung-ke-ujung jenius.es di Chromium sungguhan (Playwright) terhadap `wrangler dev` + sumber buku tiruan.
// Jalankan lewat: bash test/run-e2e.sh
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium, devices } = createRequire(import.meta.url)('playwright');

const BASE = process.env.BASE || 'http://127.0.0.1:8787';
const OUT = process.env.OUT || 'e2e-out';
fs.mkdirSync(OUT, { recursive: true });
const ALICE = 'alices-adventures-in-wonderland';
const SLOTH = 'bd-sleepy-mr-sloth';

/** Mesin suara tiruan yang deterministik: batas kata tiap ~4 md lalu onend (Chromium headless tidak punya suara). */
function fakeSpeech() {
  const MS = 4;
  let queue = [], cur = null, timers = [];
  class U { constructor(t) { this.text = t; this.rate = 1; this.pitch = 1; this.lang = ''; this.voice = null; } }
  const synth = {
    speaking: false, pending: false, paused: false,
    getVoices() { return [{ name: 'Uji Wanita', lang: 'id-ID', localService: true, default: true }, { name: 'Test Female', lang: 'en-GB', localService: true }, { name: 'Test David Male', lang: 'en-US', localService: true }]; },
    addEventListener() {}, removeEventListener() {},
    speak(u) { queue.push(u); if (!cur) run(); },
    cancel() { timers.forEach(clearTimeout); timers = []; queue = []; cur = null; synth.speaking = false; },
    pause() {}, resume() {},
  };
  function run() {
    cur = queue.shift();
    if (!cur) { synth.speaking = false; return; }
    const u = cur;
    synth.speaking = true;
    if (u.volume !== 0 && /\S/.test(u.text)) window.__spoken.push({ text: u.text, voice: u.voice && u.voice.name, pitch: u.pitch, rate: u.rate });
    u.onstart && u.onstart({});
    const re = /\S+/g; let m, i = 0;
    while ((m = re.exec(u.text))) { const ci = m.index; timers.push(setTimeout(() => { if (cur === u && u.onboundary) u.onboundary({ name: 'word', charIndex: ci }); }, ++i * MS)); }
    timers.push(setTimeout(() => { if (cur !== u) return; cur = null; synth.speaking = false; u.onend && u.onend({}); if (!cur) run(); }, (i + 2) * MS));
  }
  window.__spoken = [];
  window.SpeechSynthesisUtterance = U;
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
}

const errors = [];
async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ ...opts, serviceWorkers: 'block' });
  await ctx.route(/googlesyndication|googleads|doubleclick/, (r) => r.abort());
  await ctx.addInitScript(fakeSpeech);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/googlesyndication|ERR_FAILED|net::ERR_BLOCKED/.test(m.text() + (m.location()?.url ?? ''))) errors.push(`${page.url()} :: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`${page.url()} :: ${e.message}`));
  return { ctx, page };
}

const results = [];
async function step(name, fn) {
  const t = Date.now();
  try { await fn(); results.push(`✓ ${name} (${Date.now() - t} ms)`); console.log(`✓ ${name}`); }
  catch (e) { results.push(`✗ ${name}: ${e.message}`); console.log(`✗ ${name}\n${e.stack}`); throw e; }
}

const browser = await chromium.launch();
try {
  // Impor oleh cron harus sudah selesai.
  await step('impor cron: buku bergambar & buku bab tersedia', async () => {
    for (const id of [SLOTH, ALICE]) {
      const r = await fetch(`${BASE}/api/book/${id}`);
      assert.equal(r.status, 200, id);
    }
  });

  const { ctx, page } = await newPage(browser, { viewport: { width: 1280, height: 860 } });

  await step('beranda: animasi muncul, banner cookie bisa ditutup dan diingat', async () => {
    await page.goto(`${BASE}/`);
    // Bagian dengan animasi muncul berada di bawah layar pertama: gulir dulu, lalu bagian itu tampil.
    await page.mouse.wheel(0, 1200);
    await page.waitForSelector('.reveal.in');
    const ck = page.locator('[data-cookie]');
    await ck.waitFor({ state: 'visible' });
    await page.click('[data-cookie-ok]');
    await ck.waitFor({ state: 'hidden' });
    await page.reload();
    await page.waitForTimeout(300);
    assert.equal(await ck.isVisible(), false);
    await page.screenshot({ path: `${OUT}/home-desktop.png` });
  });

  await step('jalur Tunas → buku bergambar → pembaca slide AUTO sampai buku selesai', async () => {
    await page.goto(`${BASE}/jalur/tunas`);
    await page.click(`a[href="/buku/${SLOTH}"]`);
    await page.waitForURL(`**/buku/${SLOTH}`);
    await page.click(`[data-resume-link="${SLOTH}"]`);
    await page.waitForSelector('[data-reader][data-ready="1"]');
    assert.ok(await page.locator('.reader-app.is-picture').count());
    const first = await page.textContent('[data-r-count]');
    assert.match(first, /Hlm 1 dari \d+/);
    await page.click('[data-r-play]');
    await page.waitForSelector('.reader-app.slides');
    await page.waitForSelector('[data-r-page] .w.on');
    await page.waitForFunction(() => /Hlm [2-9]/.test(document.querySelector('[data-r-count]').textContent), null, { timeout: 15000 });
    await page.screenshot({ path: `${OUT}/reader-slides.png` });
    await page.waitForSelector('[data-r-page] .done', { timeout: 60000 });
    assert.match(await page.textContent('[data-r-page] .done'), /Buku selesai/);
    const spoken = await page.evaluate(() => window.__spoken);
    assert.ok(spoken.length >= 2, 'beberapa halaman dibacakan');
    assert.ok(spoken.every((s) => s.pitch > 1.2), 'suara anak untuk jalur Tunas');
  });

  await step('pembaca bab: tombol, keyboard, pengaturan disimpan, posisi lanjut baca', async () => {
    await page.goto(`${BASE}/baca/${ALICE}/1`);
    await page.waitForSelector('[data-reader][data-ready="1"]');
    const total = Number((await page.textContent('[data-r-count]')).match(/dari (\d+)/)[1]);
    assert.ok(total >= 2, `bab punya beberapa halaman (${total})`);
    await page.click('[data-r-next]');
    // Lembar membalik: daun 3D muncul di atas halaman lalu hilang.
    await page.waitForSelector('.r-leaf.fwd', { state: 'attached' });
    await page.waitForTimeout(330);
    await page.screenshot({ path: `${OUT}/reader-flip.png` });
    await page.waitForFunction(() => /Hlm 2 /.test(document.querySelector('[data-r-count]').textContent));
    await page.waitForSelector('.r-leaf', { state: 'detached' });
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => /Hlm 3 /.test(document.querySelector('[data-r-count]').textContent));
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => /Hlm 2 /.test(document.querySelector('[data-r-count]').textContent));
    await page.click('[data-r-settings]');
    await page.waitForSelector('[data-r-panel]:not([hidden])');
    await page.check('[data-r-night]');
    await page.selectOption('[data-r-voice]', 'teacher-m');
    assert.ok(await page.locator('.reader-app.night').count());
    await page.keyboard.press('Escape');
    await page.waitForSelector('[data-r-panel][hidden]', { state: 'attached' });
    await page.reload();
    await page.waitForSelector('[data-reader][data-ready="1"]');
    assert.ok(await page.locator('.reader-app.night').count(), 'mode malam diingat');
    assert.match(await page.textContent('[data-r-count]'), /Hlm 2 /, 'melanjutkan dari halaman terakhir');
    await page.goto(`${BASE}/buku/${ALICE}`);
    await page.waitForFunction((id) => /Lanjutkan/.test(document.querySelector(`[data-resume-link="${id}"]`).textContent), ALICE);
    assert.match(await page.textContent(`[data-resume-hint="${ALICE}"]`), /Bab 1, halaman 2/);
  });

  await step('lanjut otomatis sampai akhir buku: bab berikutnya dibuka dan tetap diputar', async () => {
    await page.goto(`${BASE}/baca/${ALICE}/1#akhir`);
    await page.waitForSelector('[data-reader][data-ready="1"]');
    await page.click('[data-r-settings]');
    await page.selectOption('[data-r-until]', 'book');
    await page.click('[data-r-close]');
    await page.click('[data-r-play]');
    // Bab berikutnya dimuat di halaman yang sama (suara tidak terputus); alamatnya ikut berganti.
    await page.waitForFunction((id) => location.pathname === `/baca/${id}/2`, ALICE, { timeout: 30000 });
    await page.waitForSelector('.r-play.playing');
    await page.waitForSelector('[data-r-page] .w.on');
    const sp = await page.evaluate(() => window.__spoken);
    assert.equal(sp[0].voice, 'Test David Male', 'suara guru laki-laki dipilih');
    await page.click('[data-r-play]');
    assert.equal(await page.locator('.r-play.playing').count(), 0);
  });

  await step('mode baca sendiri: sorotan berjalan tanpa suara', async () => {
    await page.evaluate(() => { localStorage.setItem('jen:reader', JSON.stringify({ mode: 'silent', rate: 1.5 })); localStorage.removeItem('jen:pos:alices-adventures-in-wonderland'); });
    await page.goto(`${BASE}/baca/${ALICE}/3`);
    await page.waitForSelector('[data-reader][data-ready="1"]');
    await page.click('[data-r-play]');
    await page.waitForSelector('[data-r-page] .w.on');
    const n = await page.evaluate(() => window.__spoken.length);
    assert.equal(n, 0, 'tidak ada suara di mode baca sendiri');
    await page.click('[data-r-play]');
  });

  await step('artikel: dengarkan dengan sorot paragraf dan gulir otomatis', async () => {
    await page.goto(`${BASE}/artikel/membacakan-buku-dengan-nyaring`);
    await page.click('[data-listen-article]');
    await page.waitForSelector('[data-article-text] .speaking');
    await page.waitForFunction(() => window.__spoken.length >= 3, null, { timeout: 15000 });
    await page.click('[data-listen-article]');
    assert.equal(await page.locator('[data-article-text] .speaking').count(), 0);
  });

  await step('alat: uji kecepatan, rencana mingguan, pemilih buku, kartu kosakata', async () => {
    await page.goto(`${BASE}/alat/uji-kecepatan-baca`);
    await page.click('[data-speed-start]');
    await page.waitForTimeout(1200);
    await page.click('[data-speed-stop]');
    await page.waitForSelector('[data-speed-out]:not([hidden])');
    assert.match(await page.textContent('[data-speed-out]'), /kata per menit/);

    await page.goto(`${BASE}/alat/rencana-baca-mingguan`);
    await page.selectOption('select[name=lane]', 'tumbuh');
    await page.click('form[data-tool=plan] button[type=submit]');
    await page.waitForSelector('[data-plan-out] table');
    assert.equal(await page.locator('[data-plan-out] tbody tr').count(), 20);
    assert.ok((await page.textContent('[data-plan-out]')).includes('Alice'));

    await page.goto(`${BASE}/alat/pemilih-buku`);
    await page.fill('input[name=age]', '9');
    await page.click('form[data-tool=picker] button[type=submit]');
    await page.waitForSelector('[data-picker-out] .result');
    assert.match(await page.textContent('[data-picker-out]'), /Tumbuh/);
    assert.match(await page.textContent('[data-picker-out]'), /Alice/);

    await page.goto(`${BASE}/alat/kartu-kosakata`);
    assert.equal(await page.locator('.vocab-card').count(), 4);
    await page.fill('textarea[name=words]', 'brave = berani\nquiet = tenang');
    await page.click('form[data-tool=vocab] button[type=submit]');
    assert.equal(await page.locator('.vocab-card').count(), 2);
    await page.click('[data-vocab-say]');
    await page.waitForFunction(() => window.__spoken.length >= 4);
  });

  await step('mesin suara macet: dicoba ulang dengan suara bawaan, lalu baca sendiri dengan pemberitahuan', async () => {
    const dead = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
    await dead.route(/googlesyndication|googleads|doubleclick/, (r) => r.abort());
    // Mesin yang menerima speak() tetapi tidak pernah mulai berbicara (seperti suara jaringan yang gagal).
    await dead.addInitScript(() => {
      window.__calls = 0;
      class U { constructor(t) { this.text = t; } }
      const synth = { speaking: false, getVoices() { return [{ name: 'Mati', lang: 'en-GB', localService: false }]; }, addEventListener() {}, speak(u) { if (u.volume !== 0) window.__calls++; }, cancel() {}, pause() {}, resume() {} };
      window.SpeechSynthesisUtterance = U;
      Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
    });
    const p = await dead.newPage();
    p.on('pageerror', (e) => errors.push(`${p.url()} :: ${e.message}`));
    await p.goto(`${BASE}/baca/${ALICE}/3`);
    await p.waitForSelector('[data-reader][data-ready="1"]');
    await p.click('[data-r-play]');
    await p.waitForSelector('.r-toast', { timeout: 9000 });
    assert.match(await p.textContent('.r-toast'), /Suara tidak bisa diputar/);
    assert.equal(await p.evaluate(() => window.__calls), 2, 'satu percobaan ulang dengan suara bawaan');
    await p.waitForSelector('[data-r-page] .w.on');
    assert.ok(await p.locator('.reader-app.voice-off').count());
    await dead.close();
  });

  await step('versi Inggris: navigasi dan pembaca berbahasa Inggris', async () => {
    await page.goto(`${BASE}/en`);
    assert.equal(await page.getAttribute('html', 'lang'), 'en');
    await page.goto(`${BASE}/en/read/${SLOTH}/1`);
    await page.waitForSelector('[data-reader][data-ready="1"]');
    assert.match(await page.textContent('[data-r-count]'), /Page 1 of/);
  });
  await ctx.close();

  // Ponsel: menu, tanpa gulir samping, pembaca bisa diusap.
  const m = await newPage(browser, { ...devices['Pixel 7'] });
  await step('ponsel: menu, tanpa gulir horizontal, usap untuk ganti halaman', async () => {
    for (const p of ['/', '/jalur', `/buku/${ALICE}`, '/artikel/membacakan-buku-dengan-nyaring', '/alat/rencana-baca-mingguan', '/en/for-teachers']) {
      await m.page.goto(`${BASE}${p}`);
      const over = await m.page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(over <= 1, `${p} melebar ${over}px`);
    }
    await m.page.goto(`${BASE}/`);
    await m.page.click('[data-menu]');
    await m.page.waitForSelector('.main-nav.open');
    await m.page.screenshot({ path: `${OUT}/home-mobile-menu.png` });
    await m.page.goto(`${BASE}/baca/${ALICE}/1`);
    await m.page.waitForSelector('[data-reader][data-ready="1"]');
    const box = await m.page.locator('[data-r-page]').boundingBox();
    const y = box.y + 120;
    await m.page.touchscreen.tap(box.x + 10, y);
    await m.page.evaluate(({ x1, x2, y }) => {
      const el = document.querySelector('[data-r-page]');
      const t = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
      el.dispatchEvent(new TouchEvent('touchstart', { changedTouches: [t(x1)], bubbles: true }));
      el.dispatchEvent(new TouchEvent('touchend', { changedTouches: [t(x2)], bubbles: true }));
    }, { x1: box.x + box.width - 20, x2: box.x + 20, y });
    await m.page.waitForFunction(() => /Hlm 2 /.test(document.querySelector('[data-r-count]').textContent));
    await m.page.screenshot({ path: `${OUT}/reader-mobile.png` });
  });
  await m.ctx.close();

  await step('tanpa galat konsol', async () => { assert.deepEqual(errors, []); });
} finally {
  await browser.close();
  fs.writeFileSync(`${OUT}/results.txt`, `${results.join('\n')}\n${errors.length ? `\nGalat konsol:\n${errors.join('\n')}\n` : ''}`);
}
console.log(`\n${results.length} langkah lulus.`);
