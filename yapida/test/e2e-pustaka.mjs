/* Uji ujung-ke-ujung perpustakaan digital di Chromium sungguhan terhadap `wrangler dev`: beranda & rak (buku anak per
 * bahasa), detail tanpa PDF/unduhan, pembaca (balik halaman), aktivitas ala Wordwall (kuis, kartu, pasangkan) dan adegan
 * interaktif (seret, putar, ↺ Kembalikan) — desktop dan ponsel. Dipanggil test/run-e2e.sh. */
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
async function buka(vp, opts = {}, atur) {
  const ctx = await browser.newContext({ viewport: vp, ...opts });
  if (atur) await ctx.addInitScript((a) => { try { localStorage.setItem('yp-baca-atur', JSON.stringify(a)); localStorage.setItem('yp-radio-nyala', 'false'); } catch (e) { /* */ } }, atur);
  else await ctx.addInitScript(() => { try { localStorage.setItem('yp-radio-nyala', 'false'); } catch (e) { /* */ } });
  const page = await ctx.newPage();
  await page.route(/googlesyndication|doubleclick|google-analytics|mp3quran|raw\.githubusercontent/, (r) => r.abort());
  page.on('pageerror', (e) => galat.push(`${page.url()}: ${e.message.slice(0, 160)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::|ERR_BLOCKED|status of 404/i.test(m.text())) galat.push(`${page.url()}: ${m.text().slice(0, 160)}`); });
  page.on('response', (r) => { if (r.status() >= 500) galat.push(`HTTP ${r.status()} ${r.url()}`); });
  return { ctx, page };
}
const lebar = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const tanpaPdf = async (page) => !(await page.locator('a[href$=".pdf"], a[download], iframe[src*=".pdf"], embed, object').count());

for (const [nama, vp, opts] of [['desktop', { width: 1366, height: 860 }, {}], ['ponsel', { width: 390, height: 844 }, { isMobile: true, hasTouch: true }]]) {
  const { ctx, page } = await buka(vp, opts);
  for (const p of ['/pustaka', '/pustaka/rak/ra', '/pustaka/rak/anak-en', '/pustaka/rak/anak-ar', '/pustaka/rak/hadits', '/pustaka/b/k-menanam-padi', '/pustaka/b/k-menanam-padi/1']) {
    const r = await page.goto(BASE + p, { waitUntil: 'load' });
    ok(r.status() === 200, `${nama} ${p}: 200`, r.status());
    ok((await lebar(page)) <= 1, `${nama} ${p}: tanpa luapan mendatar`, await lebar(page));
    ok(await tanpaPdf(page), `${nama} ${p}: tanpa PDF/unduhan`);
  }
  await page.goto(BASE + '/pustaka', { waitUntil: 'load' });
  await page.screenshot({ path: `${OUT}/pustaka-beranda-${nama}.png` });
  await page.goto(BASE + '/pustaka/rak/anak-en', { waitUntil: 'load' });
  await page.screenshot({ path: `${OUT}/pustaka-rak-anak-en-${nama}.png` });
  await ctx.close();
}

// Pembaca mode halaman: balik halaman dengan tombol dan papan ketik.
{
  const { page } = await buka({ width: 1366, height: 860 });
  await page.goto(BASE + '/pustaka/b/k-hadits-nawawi/1', { waitUntil: 'load' });
  await page.waitForSelector('[data-posisi]');
  await page.waitForFunction(() => /Halaman 1 \/ \d+/.test(document.querySelector('[data-posisi]').textContent));
  const awal = await page.locator('[data-posisi]').textContent();
  await page.click('.baca-panah.kanan');
  await page.waitForFunction(() => /Halaman 2 \//.test(document.querySelector('[data-posisi]').textContent));
  ok(true, `balik halaman: ${awal.trim()} → halaman 2`);
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(() => /Halaman 1 \//.test(document.querySelector('[data-posisi]').textContent));
  ok(true, 'panah kiri kembali ke halaman 1');
  await page.screenshot({ path: `${OUT}/pustaka-pembaca-desktop.png` });
}

// Buku „Ayo Menanam Padi!“: adegan padi (seret gembor ke sawah → padi tumbuh; ↺ Kembalikan), lalu aktivitas.
for (const [nama, vp, opts] of [['desktop', { width: 1366, height: 860 }, {}], ['ponsel', { width: 390, height: 844 }, { isMobile: true, hasTouch: true }]]) {
  const { ctx, page } = await buka(vp, opts, { mode: 'gulir' });
  await page.goto(BASE + '/pustaka/b/k-menanam-padi/1', { waitUntil: 'load' });
  const fig = page.locator('[data-akt="adegan"][data-adegan="padi"]').first();
  await fig.locator('svg.ad-svg').waitFor();
  await fig.scrollIntoViewIfNeeded();
  const status = fig.locator('.adegan-status');
  ok((await status.textContent()).includes('Benih'), `${nama}: adegan padi mulai dari benih`, await status.textContent());
  // Seret gembor (pojok kanan bawah) ke tengah sawah.
  const svg = fig.locator('svg.ad-svg');
  const kotak = await svg.boundingBox();
  const sx = kotak.width / 400, sy = kotak.height / 240;
  await page.mouse.move(kotak.x + 364 * sx, kotak.y + 202 * sy);
  await page.mouse.down();
  await page.mouse.move(kotak.x + 250 * sx, kotak.y + 190 * sy, { steps: 6 });
  await page.mouse.move(kotak.x + 170 * sx, kotak.y + 195 * sy, { steps: 6 });
  await page.mouse.up();
  await page.waitForFunction((el) => !el.textContent.includes('Benih'), await status.elementHandle());
  ok(/berkecambah/i.test(await status.textContent()), `${nama}: menyiram dengan gembor → padi tumbuh`, await status.textContent());
  await fig.locator('.adegan-tbl', { hasText: 'Siram' }).click();
  await page.waitForFunction((el) => /ditanam/i.test(el.textContent), await status.elementHandle());
  ok(true, `${nama}: tombol 💧 Siram menumbuhkan tahap berikutnya`);
  // Matahari bisa diseret dan diputar, lalu dikembalikan.
  const mth = fig.locator('.ad-matahari');
  const mb = await mth.boundingBox();
  await page.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2);
  await page.mouse.down();
  await page.mouse.move(mb.x - 80, mb.y + 40, { steps: 5 });
  await page.mouse.up();
  // Sinarnya berputar terus (animasi), jadi ketuk ganda di titik tengahnya, bukan menunggu „stabil“.
  const mb2 = await mth.boundingBox();
  await page.mouse.dblclick(mb2.x + mb2.width / 2, mb2.y + mb2.height / 2);
  const ubah = await mth.evaluate((el) => el.style.transform);
  ok(/translate\((?!0px, 0px)/.test(ubah) && /rotate\(45deg\)/.test(ubah), `${nama}: matahari diseret dan diputar`, ubah);
  if (nama === 'desktop') await fig.screenshot({ path: `${OUT}/pustaka-adegan-padi.png` });
  await fig.locator('[data-adegan-reset]').click();
  await page.waitForTimeout(100);
  ok((await mth.evaluate((el) => el.style.transform)).includes('translate(0px, 0px) rotate(0deg)'), `${nama}: ↺ Kembalikan → matahari ke tempat asal`);
  ok((await status.textContent()).includes('Benih'), `${nama}: ↺ Kembalikan → padi kembali ke benih`, await status.textContent());

  // Bab „Ayo Bermain!“: kuis, kartu balik, pasangkan.
  const babMain = await page.evaluate(async () => {
    const id = location.pathname.split('/')[3];
    for (let n = 1; n < 20; n += 1) { const r = await fetch(`/pustaka/api/b/${id}/${n}`); if (!r.ok) return 0; const b = await r.json(); if (b.blok.some((x) => x.t === 'kuis')) return n; }
    return 0;
  });
  ok(babMain > 0, `${nama}: ada bab permainan`, babMain);
  await page.goto(`${BASE}/pustaka/b/k-menanam-padi/${babMain}`, { waitUntil: 'load' });
  const kuis = page.locator('[data-akt="kuis"]').first();
  await kuis.locator('.akt-pil').first().waitFor();
  await kuis.scrollIntoViewIfNeeded();
  const salah = kuis.locator('.akt-pil:not([data-benar])');
  await salah.nth(0).click();
  ok(await salah.nth(0).evaluate((el) => el.classList.contains('salah')), `${nama}: kuis — jawaban salah digoyang`);
  await salah.nth(1).click();
  ok(await kuis.locator('.akt-pil[data-benar="1"]').evaluate((el) => el.classList.contains('petunjuk')), `${nama}: kuis — petunjuk setelah 2 kali salah`);
  await kuis.locator('.akt-pil[data-benar="1"]').click();
  ok(await kuis.evaluate((el) => el.classList.contains('selesai')), `${nama}: kuis — jawaban benar menyelesaikan kuis`);
  const kartu = page.locator('[data-akt="kartu"]').first();
  if (await kartu.count()) {
    await kartu.scrollIntoViewIfNeeded();
    await kartu.click();
    ok((await kartu.getAttribute('aria-pressed')) === 'true', `${nama}: kartu dibalik`);
  }
  const cocok = page.locator('[data-akt="cocok"]').first();
  if (await cocok.count()) {
    await cocok.scrollIntoViewIfNeeded();
    const n = await cocok.locator('.cocok-kotak[data-sisi="kiri"]').count();
    await cocok.locator('.cocok-kotak[data-sisi="kiri"][data-i="0"]').click();
    await cocok.locator('.cocok-kotak[data-sisi="kanan"][data-i="1"]').click();
    ok(await cocok.locator('.cocok-kotak[data-sisi="kanan"][data-i="1"]').evaluate((el) => el.classList.contains('goyang')), `${nama}: pasangkan — pasangan salah digoyang`);
    await page.waitForTimeout(500);
    for (let i = 0; i < n; i += 1) {
      await cocok.locator(`.cocok-kotak[data-sisi="kiri"][data-i="${i}"]`).click();
      await cocok.locator(`.cocok-kotak[data-sisi="kanan"][data-i="${i}"]`).click();
    }
    ok(await cocok.evaluate((el) => el.classList.contains('selesai')), `${nama}: pasangkan — semua pasangan cocok`, n);
  }
  if (nama === 'ponsel') await page.screenshot({ path: `${OUT}/pustaka-permainan-ponsel.png`, fullPage: false });
  ok((await lebar(page)) <= 1, `${nama}: bab permainan tanpa luapan mendatar`, await lebar(page));
  await ctx.close();
}

// Semua buku anak interaktif: bab kisah anak mendapat adegan + „Ayo Bermain!“ (urutkan cerita, kuis isian).
for (const [nama, vp, opts] of [['desktop', { width: 1366, height: 860 }, {}], ['ponsel', { width: 390, height: 844 }, { isMobile: true, hasTouch: true }]]) {
  const { ctx, page } = await buka(vp, opts, { mode: 'gulir' });
  await page.goto(BASE + '/pustaka/b/k-kisah-anak-muslim/8', { waitUntil: 'load' });
  ok(await page.locator('[data-akt="adegan"] svg.ad-svg').first().isVisible(), `${nama}: kisah anak dibuka dengan adegan`);
  ok((await page.locator('h3.b-h', { hasText: 'Ayo Bermain' }).count()) === 1, `${nama}: ada „Ayo Bermain!“ otomatis`);
  const urut = page.locator('[data-akt="urut"]').first();
  await urut.locator('.urut-kotak').first().waitFor();
  await urut.scrollIntoViewIfNeeded();
  const n = await urut.locator('.urut-kotak').count();
  ok(n === 4, `${nama}: urutkan cerita — 4 kejadian diacak`, n);
  // Klik salah dulu (bukan kejadian pertama) → bergoyang, tidak masuk daftar.
  const bukanPertama = urut.locator('.urut-kotak:not([data-i="0"])').first();
  await bukanPertama.click();
  ok(await bukanPertama.evaluate((el) => el.classList.contains('goyang')) && (await urut.locator('.urut-butir').count()) === 0, `${nama}: urutan salah digoyang`);
  for (let i = 0; i < n; i += 1) { await urut.locator(`.urut-kotak[data-i="${i}"]`).click(); await page.waitForTimeout(40); }
  await page.waitForFunction((el) => el.classList.contains('selesai'), await urut.elementHandle());
  ok((await urut.locator('.urut-butir').count()) === n, `${nama}: urutkan cerita selesai, ${n} kejadian bernomor`);
  if (nama === 'ponsel') await urut.screenshot({ path: `${OUT}/pustaka-urutkan-ponsel.png` });
  await urut.locator('.urut-ulang').click();
  ok((await urut.locator('.urut-kotak').count()) === n && !(await urut.evaluate((el) => el.classList.contains('selesai'))), `${nama}: ↺ Ulangi mengacak lagi`);
  const kuis = page.locator('[data-akt="kuis"]').first();
  await kuis.locator('.akt-pil[data-benar="1"]').click();
  ok(await kuis.evaluate((el) => el.classList.contains('selesai')), `${nama}: kuis isian otomatis bisa dijawab`);
  await ctx.close();
}

// Setiap adegan (12) terpasang tanpa galat, bisa disentuh, dan ↺ Kembalikan bekerja.
{
  const { page } = await buka({ width: 1366, height: 860 }, {}, { mode: 'gulir' });
  await page.goto(BASE + '/pustaka/b/k-menanam-padi/1', { waitUntil: 'load' });
  const nama = await page.evaluate(() => window.YapidaAdegan.nama);
  ok(['padi', 'hujan', 'langit', 'masjid', 'kebun', 'laut', 'gurun', 'gunung', 'rumah', 'sholat', 'huruf'].every((n) => nama.includes(n)), 'mesin adegan memuat 12 adegan', nama.join(','));
  const hasil = await page.evaluate((daftar) => daftar.map((n) => {
    const f = document.createElement('figure'); f.className = 'akt adegan'; f.setAttribute('data-akt', 'adegan'); f.setAttribute('data-adegan', n);
    f.innerHTML = '<div class="adegan-panggung" data-adegan-isi></div><figcaption><button type="button" data-adegan-reset>↺</button></figcaption>';
    document.querySelector('.baca-isi').appendChild(f); window.YapidaAdegan.pasang(f);
    const svg = f.querySelector('svg'); const benda = svg ? svg.querySelectorAll('.ad-seret').length : 0;
    f.querySelector('[data-adegan-reset]').click();
    return [n, svg ? svg.childElementCount : 0, benda];
  }), nama);
  for (const [n, anak, benda] of hasil) ok(anak > 3 && benda >= 1, `adegan ${n}: tergambar (${anak} unsur) dan ${benda} benda bisa diseret`);
  const rumah = page.locator('figure[data-adegan="rumah"]').last();
  await rumah.scrollIntoViewIfNeeded();
  await rumah.locator('.adegan-tbl', { hasText: 'Siang / Malam' }).click();
  ok((await rumah.locator('svg rect').first().getAttribute('fill')) === '#0b1d3a', 'adegan rumah: tombol Siang / Malam');
  await rumah.locator('[data-adegan-reset]').click();
  ok((await rumah.locator('svg rect').first().getAttribute('fill')) === '#bfe7ff', 'adegan rumah: ↺ Kembalikan ke siang');
  await page.locator('figure[data-adegan="gurun"]').last().screenshot({ path: `${OUT}/pustaka-adegan-gurun.png` });
}

ok(galat.length === 0, 'tanpa galat konsol/halaman/5xx', galat.join(' | '));
await browser.close();
const gagal = hasil.filter((x) => !x).length;
console.log(`\n${hasil.length - gagal}/${hasil.length} lulus`);
process.exit(gagal ? 1 : 0);
