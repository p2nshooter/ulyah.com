// Uji ujung-ke-ujung di peramban sungguhan (Playwright) terhadap `wrangler dev` + server Anthropic tiruan.
// Jalankan: node test/mock-anthropic.mjs 8788 & npx wrangler dev --port 8787 & node test/e2e.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import crypto from 'node:crypto';
import fs from 'node:fs';
import zlib from 'node:zlib';

/** .docx sungguhan (ZIP, isi dikompres deflate) untuk menguji ekstraksi teks di peramban. */
function makeDocx(paragraphs) {
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const body = paragraphs.map((p) => `<w:p><w:r><w:t xml:space="preserve">${esc(p).replace(/\t/g, '</w:t><w:tab/><w:t>')}</w:t></w:r></w:p>`).join('');
  const files = {
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    'word/document.xml': `<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="${W}"><w:body>${body}</w:body></w:document>`,
  };
  const locals = [], centrals = [];
  let off = 0;
  for (const [name, text] of Object.entries(files)) {
    const raw = Buffer.from(text), comp = zlib.deflateRawSync(raw), nm = Buffer.from(name), crc = zlib.crc32(raw);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(raw.length, 22); lh.writeUInt16LE(nm.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(8, 10); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(raw.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(off, 42);
    locals.push(lh, nm, comp); centrals.push(ch, nm);
    off += 30 + nm.length + comp.length;
  }
  const cd = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(2, 8); end.writeUInt16LE(2, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  return Buffer.concat([...locals, cd, end]);
}

/** PDF teks sungguhan (Helvetica, satu baris per paragraf) dengan tabel xref yang benar. */
function makePdf(lines) {
  const esc = (t) => t.replace(/[\\()]/g, (c) => '\\' + c);
  const content = 'BT /F1 12 Tf 72 760 Td 16 TL ' + lines.map((l) => `(${esc(l)}) Tj T* T*`).join(' ') + ' ET';
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let out = '%PDF-1.4\n';
  const offs = [];
  objs.forEach((o, i) => { offs.push(Buffer.byteLength(out)); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const BASE = process.env.BASE || 'http://127.0.0.1:8787';
const OUT = process.env.OUT || 'e2e-out';
fs.mkdirSync(OUT, { recursive: true });
const errors = [];
const ok = (cond, msg) => { if (!cond) throw new Error('GAGAL: ' + msg); console.log('✓', msg); };

function totp(secretB32) {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of secretB32.replace(/\s/g, '')) bits += alpha.indexOf(ch).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = crypto.createHmac('sha1', key).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1e6)).padStart(6, '0');
}

const browser = await chromium.launch();
async function ctx(opts = {}) {
  // Service worker diblokir dalam uji: permintaan yang lewat service worker tidak membawa header uji (negara, IP) dan tidak
  // melewati route() Playwright. Berkas /sw.js dan manifest tetap diuji langsung di bagian PWA.
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block', ...opts });
  // Iklan Google tidak dimuat dalam uji (tidak ada jaringan iklan di CI): loader AdSense diganti skrip kosong.
  await c.route(/googlesyndication\.com|doubleclick\.net|googleadservices\.com|adtrafficquality\.google/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  c.on('page', (p) => {
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${p.url()} :: ${m.text()}`); });
    p.on('pageerror', (e) => errors.push(`${p.url()} :: ${e.message}`));
  });
  return c;
}

// 0. Bahasa (pemilik, 7 Nov 2026): Indonesia → ID, negara lain → EN, pilihan manual tidak pernah berubah sendiri,
//    crawler tidak pernah dialihkan.
{
  const us = await ctx({ extraHTTPHeaders: { 'cf-ipcountry': 'US' }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36' });
  const q = await us.newPage();
  await q.goto(BASE + '/');
  ok(new URL(q.url()).pathname === '/en', 'pengunjung dari luar negeri: beranda bawaan bahasa Inggris');
  await q.click('a.lang-switch');
  await q.waitForURL((u) => new URL(u).pathname === '/');
  ok((await q.locator('html').getAttribute('lang')) === 'id', 'tombol bahasa: pindah ke Indonesia dan tetap di sana');
  await q.goto(BASE + '/en/pricing');
  ok(new URL(q.url()).pathname === '/harga', 'pilihan manual bertahan di halaman lain walau negaranya AS');
  await us.close();
  const idn = await ctx({ extraHTTPHeaders: { 'cf-ipcountry': 'ID' }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36' });
  const r = await idn.newPage();
  await r.goto(BASE + '/en');
  ok(new URL(r.url()).pathname === '/', 'pengunjung Indonesia tanpa pilihan: bawaan bahasa Indonesia');
  await r.click('a.lang-switch');
  await r.waitForURL((u) => new URL(u).pathname === '/en');
  await r.goto(BASE + '/cara-kerja');
  ok(new URL(r.url()).pathname === '/en/how-it-works', 'pengunjung Indonesia yang memilih English tetap English di halaman lain');
  await idn.close();
  const bot = await ctx({ extraHTTPHeaders: { 'cf-ipcountry': 'US' }, userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' });
  const b = await bot.newPage();
  const res = await b.goto(BASE + '/');
  ok(res.status() === 200 && new URL(b.url()).pathname === '/', 'Googlebot tidak pernah dialihkan bahasanya');
  await bot.close();
}

// 1. Halaman publik ID & EN
// Pasang di HP (PWA, pemilik 8 Nov 2026): manifest, service worker, spanduk paling atas yang hilang setelah terpasang.
{
  const man = await (await fetch(BASE + '/manifest.webmanifest')).json();
  ok(/xscan\.es/.test(man.name) && man.display === 'standalone' && man.icons.length >= 2, 'PWA: manifest aplikasi (nama, ikon, standalone)');
  ok((await fetch(BASE + man.icons[0].src)).ok && (await fetch(BASE + man.icons[1].src)).ok, 'PWA: ikon aplikasi tersedia');
  const sw = await fetch(BASE + '/sw.js');
  ok(sw.ok && /caches/.test(await sw.text()) && sw.headers.get('service-worker-allowed') === '/', 'PWA: service worker');
  ok((await fetch(BASE + '/offline')).ok, 'PWA: halaman luring');
  const pc = await ctx();
  const pg = await pc.newPage();
  await pg.goto(BASE + '/');
  ok((await pg.locator('link[rel=manifest]').count()) === 1 && (await pg.locator('[data-pwa-bar]').isHidden()), 'PWA: spanduk pasang tersembunyi sampai peramban menawarkan pemasangan');
  await pg.evaluate(() => { const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__prompted = true; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(e); });
  ok(await pg.locator('[data-pwa-bar]').isVisible() && await pg.locator('[data-pwa-install]').isVisible(), 'PWA: spanduk „Pasang di HP“ tampil di paling atas');
  await pg.screenshot({ path: `${OUT}/pwa-bar.png` });
  await pg.click('[data-pwa-install]');
  await pg.waitForFunction(() => window.__prompted === true && document.querySelector('[data-pwa-bar]').hidden);
  await pg.reload();
  await pg.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  ok(await pg.locator('[data-pwa-bar]').isHidden(), 'PWA: setelah dipasang, spanduk hilang');
  await pc.close();
}
const pub = await ctx();
let p = await pub.newPage();
for (const path of ['/', '/en', '/cara-kerja', '/en/how-it-works', '/harga', '/en/pricing', '/akurasi', '/contoh-laporan', '/en/sample-report', '/kebijakan-privasi', '/syarat', '/penggunaan-etis', '/verifikasi', '/ads.txt', '/robots.txt']) {
  const r = await p.goto(BASE + path);
  ok(r.status() === 200, `publik ${path} 200`);
}
{
  const r = await p.goto(BASE + '/');
  ok(!r.headers()['x-robots-tag'], 'tidak ada X-Robots-Tag yang menghambat Google');
  // 7 Nov 2026: 16 akun ditumpuk (adsense-stack.json) — satu tag meta per akun, akun utama lebih dulu; satu loader.
  const metas = await p.locator('meta[name="google-adsense-account"]').evaluateAll((els) => els.map((e) => e.getAttribute('content')));
  ok(metas.length === 21 && metas[0] === 'ca-pub-9354298681597606' && new Set(metas).size === 21 && metas.includes('ca-pub-8212039662308316'), 'AdSense: tag meta per akun (21)');
  ok((await p.locator('script[src*="adsbygoogle.js?client="]').count()) === 1, 'AdSense: tepat satu loader');
  ok((await p.locator('script[src*="adsbygoogle.js?client=ca-pub-9354298681597606"]').count()) === 1, 'AdSense: loader akun utama');
  ok((await p.locator('meta[name=robots]').count()) === 0, 'beranda bisa diindeks');
  const ads = await (await p.request.get(BASE + '/ads.txt')).text();
  const adsLines = ads.trim().split('\n');
  ok(adsLines.length === 21 && adsLines[0] === 'google.com, pub-9354298681597606, DIRECT, f08c47fec0942fa0' && adsLines.every((l) => /^google\.com, pub-\d{16}, DIRECT, f08c47fec0942fa0$/.test(l)), 'ads.txt: satu baris per akun (21)');
  const robots = await (await p.request.get(BASE + '/robots.txt')).text();
  ok(/User-agent: Googlebot\nAllow: \//.test(robots) && /User-agent: Mediapartners-Google\nAllow: \//.test(robots) && !/Disallow: \/\n/.test(robots) && /Sitemap: /.test(robots), 'robots.txt membuka semua crawler Google');
  ok((await p.request.get(BASE + '/blueprint')).status() === 404, 'blueprint internal tidak publik');
}
ok((await p.locator('#coba').count()) === 0, 'tidak ada demo di beranda');
await p.goto(BASE + '/contoh-laporan');
ok((await p.locator('.qr-svg').count()) > 0, 'contoh laporan memuat QR asli');
await p.screenshot({ path: `${OUT}/home-sample.png`, fullPage: false });
await p.goto(BASE + '/');
await p.screenshot({ path: `${OUT}/home.png`, fullPage: true });

// 2. Pemilik: masuk dengan kredensial bootstrap → 2FA → admin
const own = await ctx();
p = await own.newPage();
await p.goto(BASE + '/masuk');
await p.fill('input[name=email]', 'owner@example.com');
await p.fill('input[name=password]', 'pemilik-rahasia-123');
await p.click('button[type=submit]');
await p.waitForURL(/\/2fa\/pasang/);
const secret = (await p.textContent('#totpSecret')).trim();
await p.fill('input[name=code]', totp(secret));
await p.click('form[action="/2fa/pasang"] button[type=submit]');
await p.waitForURL(/\/admin$/);
ok(true, 'pemilik dibuat otomatis + 2FA aktif → dasbor admin');
await p.screenshot({ path: `${OUT}/admin.png`, fullPage: true });

await p.goto(BASE + '/admin/kunci-api');
await p.fill('input[name=key]', 'sk-ant-test-0123456789abcdefghij');
await p.click('form[action="/admin/kunci-api"] button[type=submit]');
await p.waitForURL(/kunci-api\?ok=/);
ok((await p.locator('.flash.ok').count()) === 1, 'kunci API diuji (models.list) & disimpan terenkripsi');

await p.goto(BASE + '/admin/harga');
ok((await p.locator('input[name=markup]').getAttribute('min')) === '5' && (await p.locator('input[name=markup]').getAttribute('max')) === '500', 'markup 5–500× (pemilik, 7 Nov 2026)');
await p.locator('input[name=markup]').fill('100');
await p.click('form[action="/admin/harga"] button[type=submit]');
await p.waitForURL(/harga\?ok=1/);
ok((await p.inputValue('input[name=markup]')) === '100', 'markup 100× tersimpan');
await p.goto(BASE + '/admin/harga');
await p.screenshot({ path: `${OUT}/admin-harga.png`, fullPage: true });

// Prediksi biaya kuota gratis per minggu di admin (pemilik, 7 Nov 2026; MASTER-BLUEPRINT §20.9).
await p.goto(BASE + '/admin/biaya');
ok((await p.locator('#kuota-gratis').count()) === 1, 'admin: kartu prediksi biaya kuota gratis per minggu tampil');
ok((await p.locator('[data-forecast="worst-week"]').innerText()).replace(/\s/g, '') === 'Rp6.022', 'bawaan 5 halaman/minggu: prediksi 100 member/minggu (terburuk) = Rp 6.022');
await p.goto(BASE + '/admin/biaya?anggota=1000');
const k1000 = (await p.locator('[data-forecast="worst-week"]').innerText()).replace(/\s/g, '');
ok(k1000 === 'Rp60.225', `prediksi 1.000 member/minggu (terburuk) = ${k1000}`);
await p.screenshot({ path: `${OUT}/admin-biaya-gratis.png`, fullPage: true });

// Kuota gratis dinamis (pemilik, 7 Nov 2026): diubah sekali di Admin → Kuota gratis, semua bagian ikut.
await p.goto(BASE + '/admin/kuota-gratis');
await p.fill('#free-form input[name=pages]', '10');
ok((await p.getAttribute('#free-form input[name=pages]', 'max')) === '20' && (await p.locator('#free-form input[type=range][data-sync-to]').count()) === 1, 'kuota gratis: penggeser 1–20 halaman (pemilik, 8 Nov 2026)');
await p.fill('#free-form input[name=maxPerCheck]', '20');
await p.click('#free-form button[type=submit]');
await p.waitForURL(/kuota-gratis\?ok=1/);
ok((await p.inputValue('#free-form input[name=maxPerCheck]')) === '10', 'kuota gratis: maks. per pemeriksaan tidak bisa melebihi kuota (20 → 10)');
await p.goto(BASE + '/admin/biaya');
ok((await p.locator('[data-forecast="worst-week"]').innerText()).replace(/\s/g, '') === 'Rp12.045', 'Biaya API ikut berubah: 10 halaman/minggu, 100 member = Rp 12.045/minggu');
await p.goto(BASE + '/admin/kuota-gratis');
await p.selectOption('#free-form select[name=period]', 'month');
await p.fill('#free-form input[name=pages]', '10');
await p.click('#free-form button[type=submit]');
await p.waitForURL(/kuota-gratis\?ok=1/);
await p.goto(BASE + '/admin/biaya');
ok((await p.locator('[data-forecast="worst-month"]').innerText()).replace(/\s/g, '') === 'Rp12.045', 'Biaya API ikut berubah: 10 halaman/bulan, 100 member = Rp 12.045/bulan');
ok(/10 halaman per bulan/.test(await p.locator('#kuota-gratis h3').innerText()), 'judul prediksi menyebut periode baru');
// Kembali ke keputusan pemilik (5 halaman per minggu, 8 Nov 2026) untuk uji berikutnya.
await p.goto(BASE + '/admin/kuota-gratis');
await p.selectOption('#free-form select[name=period]', 'week');
await p.fill('#free-form input[name=pages]', '5');
await p.fill('#free-form input[name=maxPerCheck]', '5');
await p.click('#free-form button[type=submit]');
await p.waitForURL(/kuota-gratis\?ok=1/);
await p.screenshot({ path: `${OUT}/admin-kuota-gratis.png`, fullPage: true });

// Kendali biaya (MASTER-BLUEPRINT §8–§9): router termurah yang mampu, tombol darurat, batas belanja.
await p.goto(BASE + '/admin/kendali');
ok((await p.locator('#route-table tr[data-route="t1"]').innerText()).includes('claude-haiku-5-5') && (await p.locator('#route-table tr[data-route="t3"]').innerText()).includes('claude-opus-5-5'), 'router: Haiku → Sonnet → Opus, Fable tidak dipakai');
await p.uncheck('#controls-form input[name="on_claude-sonnet-5-5"]');
await p.click('#controls-form button[type=submit]');
await p.waitForURL(/kendali\?ok=1/);
ok((await p.locator('#route-table tr[data-route="t2"]').innerText()).includes('claude-opus-5-5'), 'Sonnet dimatikan → tingkat 2 memakai termurah yang mampu (Opus), tidak turun ke Haiku');
await p.check('#controls-form input[name="on_claude-sonnet-5-5"]');
// Fable dimatikan (pemilik, 8 Nov 2026): di seluruh situs tampil „Segera hadir“, tidak bisa dipilih.
await p.uncheck('#controls-form input[name=fableEnabled]');
await p.click('#controls-form button[type=submit]');
await p.waitForURL(/kendali\?ok=1/);
await p.goto(BASE + '/app/periksa');
ok((await p.locator('[data-soon="fable"]').count()) === 1 && await p.locator('input[name=mode][value=fable]').isDisabled() && /Segera hadir/.test(await p.textContent('[data-soon="fable"]')), 'Fable mati: kartu „Segera hadir“ di formulir, tidak bisa dipilih');
await p.goto(BASE + '/harga');
ok(/Segera hadir/.test(await p.textContent('#engine-status tr[data-engine="Claude Fable 5.1"]')), 'Fable mati: halaman harga menandai „Segera hadir“');
await p.goto(BASE + '/panduan');
ok(/segera hadir/.test(await p.textContent('#g-mesin')), 'Fable mati: panduan ikut menyebut „segera hadir“');
await p.goto(BASE + '/admin/kendali');
await p.check('#controls-form input[name=fableEnabled]');
await p.check('#controls-form input[name="on_claude-sonnet-5-5"]');
await p.selectOption('#controls-form select[name=emergencyStop]', '1');
await p.fill('#controls-form input[name=stopNote]', 'Perawatan singkat.');
await p.click('#controls-form button[type=submit]');
await p.waitForURL(/kendali\?ok=1/);
ok((await p.locator('[data-stop-on]').count()) === 1, 'tombol darurat menyala: peringatan tampil di admin');
await p.goto(BASE + '/app/periksa');
await p.fill('textarea[name=text]', fs.readFileSync(new URL('./fixtures/esai.txt', import.meta.url), 'utf8'));
await p.check('input[name=agree]');
await p.click('.check-form button[type=submit]');
await p.waitForLoadState();
ok(/dihentikan sementara oleh admin\. Perawatan singkat\./.test(await p.textContent('.flash.err')), 'tombol darurat: pemeriksaan baru ditolak sebelum AI dipanggil, dengan pesan admin');
await p.goto(BASE + '/admin/kendali');
await p.selectOption('#controls-form select[name=emergencyStop]', '0');
await p.click('#controls-form button[type=submit]');
await p.waitForURL(/kendali\?ok=1/);
ok((await p.locator('[data-stop-on]').count()) === 0 && (await p.locator('#route-table tr[data-route="t2"]').innerText()).includes('claude-sonnet-5-5'), 'tombol darurat dimatikan, Sonnet aktif lagi');
await p.goto(BASE + '/admin/audit');
ok(/controls\.emergency_stop_on/.test(await p.textContent('main')) && /controls\.emergency_stop_off/.test(await p.textContent('main')), 'audit log mencatat tombol darurat nyala & mati');

// Uji mesin (pemilik tidak dipotong token)
await p.goto(BASE + '/admin/mesin');
await p.click('form[action="/admin/mesin/uji"] button');
await p.waitForURL(/\/app\/proses\//);
await p.screenshot({ path: `${OUT}/process.png` });
await p.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok((await p.locator('.paper').count()) >= 2, 'laporan uji mesin punya halaman rubrik');
ok((await p.locator('.qr-svg').count()) >= 1, 'laporan memuat QR verifikasi');
await p.screenshot({ path: `${OUT}/report.png`, fullPage: true });

// Tautan afiliasi pemilik
await p.goto(BASE + '/app/afiliasi');
const refLink = (await p.textContent('#refLink')).trim();
ok(/\/r\/[A-Z0-9]+$/.test(refLink), 'tautan afiliasi tersedia');

// 2b. Panduan A–Z bersuara (pemilik, 8 Nov 2026): member publik ID/EN, admin hanya di portal admin.
{
  const FAKE_SPEECH = () => {
    window.__spoken = [];
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: function (text) { this.text = text; this.lang = ''; this.rate = 1; } });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      speak(u) { window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice && u.voice.name }); setTimeout(() => u.onend && u.onend(), 5); },
      cancel() {}, pause() {}, resume() {}, addEventListener() {},
      getVoices() { return [{ name: 'Google Bahasa Indonesia', lang: 'id-ID' }, { name: 'Google US English', lang: 'en-US' }]; },
    } });
  };
  const gc = await ctx();
  await gc.addInitScript(FAKE_SPEECH);
  const g = await gc.newPage();
  await g.goto(BASE + '/lang?to=id&next=/panduan');
  await g.waitForURL((u) => new URL(u).pathname === '/panduan');
  const nSec = await g.locator('[data-gsec]').count();
  ok(nSec >= 18, `panduan member: ${nSec} bagian A–Z`);
  const freeTxt = await g.textContent('#g-gratis');
  ok(/5 halaman gratis per minggu/.test(freeTxt) && /700 kata/.test(freeTxt), 'panduan membaca kuota gratis dari Admin (5 halaman/minggu, 700 kata)');
  ok(/1 token = Rp \d/.test(await g.textContent('#g-token')), 'panduan menyebut harga 1 token yang berlaku');
  ok((await g.locator('#g-deposit li').count()) >= 5 && (await g.locator('#g-beli li').count()) >= 5, 'panduan isi saldo, bukti transfer, deposit dan tukar token lengkap');
  ok((await g.locator('script[type="application/ld+json"]').innerText()).includes('"HowTo"'), 'panduan: data terstruktur HowTo untuk Google');
  const parts = await g.locator('[data-gtitle], [data-gstep]').count();
  await g.click('[data-gall]');
  await g.waitForFunction((n) => window.__spoken.length >= n, parts, { timeout: 30000 });
  const spoken = await g.evaluate(() => window.__spoken);
  ok(spoken.every((x) => x.lang === 'id-ID' && x.voice === 'Google Bahasa Indonesia') && /Kenalan dulu/.test(spoken[0].text), `suara ID: ${spoken.length} potongan dibacakan berurutan dari A sampai akhir`);
  await g.waitForFunction(() => /Selesai dibacakan/.test(document.querySelector('[data-gnow]').textContent));
  await g.screenshot({ path: `${OUT}/guide-id.png` });
  await g.goto(BASE + '/lang?to=en&next=/en/guide');
  await g.waitForURL((u) => new URL(u).pathname === '/en/guide');
  await g.evaluate(() => { window.__spoken = []; });
  const one = await g.locator('#g-deposit [data-gtitle], #g-deposit [data-gstep]').count();
  ok((await g.locator('html').getAttribute('lang')) === 'en', 'panduan EN terbuka dalam bahasa Inggris');
  // Bagian deposit jauh di bawah dan masih beranimasi muncul saat digulir; tombolnya dipicu langsung agar tidak meleset.
  await g.$eval('#g-deposit [data-gplay]', (b) => b.click());
  await g.waitForFunction((n) => window.__spoken.length >= n, one, { timeout: 15000 }).catch(async (err) => {
    console.error('DIAG suara EN:', g.url(), JSON.stringify(await g.evaluate(() => ({ lang: document.documentElement.lang, now: document.querySelector('[data-gnow]')?.textContent, spoken: window.__spoken.length, sec: !!document.querySelector('#g-deposit') }))));
    throw err;
  });
  const en = await g.evaluate(() => window.__spoken);
  ok(en.length === one && en.every((x) => x.lang === 'en-US') && /deposit/i.test(en[0].text), 'suara EN: satu bagian (deposit) dibacakan dalam bahasa Inggris');
  const sm = await (await fetch(BASE + '/sitemap.xml')).text();
  ok(sm.includes('/panduan') && sm.includes('/en/guide'), 'panduan ada di sitemap');
  await gc.close();
  await p.goto(BASE + '/admin/panduan');
  const nAdm = await p.locator('[data-gsec]').count();
  ok(nAdm >= 12 && /Tombol darurat/.test(await p.textContent('#g-a-kendali')) && /5 sampai 500/.test(await p.textContent('#g-a-harga')), `panduan admin: ${nAdm} bagian (kendali biaya, markup 5–500×)`);
  ok((await p.locator('meta[name=robots][content*=noindex]').count()) === 1, 'panduan admin tidak diindeks');
  const anon = await fetch(BASE + '/admin/panduan', { redirect: 'manual' });
  ok(anon.status !== 200, `panduan admin tertutup untuk yang bukan admin (${anon.status})`);
}

// 3. Member: daftar lewat referal (IP lain), tanpa token → ditolak, beli → admin lunasi → periksa
const mem = await ctx();
// IP berbeda dari pemilik hanya untuk permintaan ke Worker (bukan ke font pihak ketiga).
await mem.route(BASE + '/**', (route) => route.continue({ headers: { ...route.request().headers(), 'cf-connecting-ip': '10.9.8.7' } }));
const m = await mem.newPage();
await m.goto(refLink.replace(/^https?:\/\/[^/]+/, BASE));
await m.goto(BASE + '/daftar');
await m.fill('input[name=name]', 'Guru Uji');
await m.fill('input[name=email]', 'guru@example.com');
await m.fill('input[name=password]', 'sandi-guru-123');
await m.check('input[name=agree]');
await m.click('form[action^="/daftar"] button[type=submit]');
await m.waitForURL(/\/app\?welcome=1/);
ok(true, 'member terdaftar');
const ESSAY = fs.readFileSync(new URL('./fixtures/esai.txt', import.meta.url), 'utf8');
await m.goto(BASE + '/app/periksa');
await m.setInputFiles('#fileInput', { name: 'esai.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: makeDocx(['Judul: Literasi & Kita', 'Paragraf satu\tdengan tab <aman>.', 'Paragraf dua.']) });
await m.waitForFunction(() => document.querySelector('textarea[name=text]').value.includes('Paragraf dua'));
const fromDocx = await m.inputValue('textarea[name=text]');
ok(fromDocx === 'Judul: Literasi & Kita\n\nParagraf satu\tdengan tab <aman>.\n\nParagraf dua.', 'unggah .docx: teks, tab, paragraf, dan karakter khusus terbaca utuh');
// Ambil dari URL (MASTER-BLUEPRINT §7): alamat jaringan internal ditolak server (SSRF), pesan tampil, teks tidak berubah.
await m.fill('[data-url-input]', 'http://127.0.0.1:8788/__calls');
await m.click('[data-url-fetch]');
await m.waitForSelector('.toast.err');
const urlErr = await m.textContent('.toast.err');
ok(/jaringan internal/.test(urlErr), `ambil URL: alamat internal ditolak (SSRF) dengan pesan jelas — "${urlErr}"`);
ok((await m.inputValue('textarea[name=text]')) === fromDocx, 'ambil URL gagal: teks naskah tidak tersentuh');
await m.fill('[data-url-input]', '');
// Unggah PDF / RTF / HTML (MASTER-BLUEPRINT §7): teks diambil di peramban, berkas tidak dikirim; berkas palsu ditolak.
const PDF_LINES = ['Literasi digital di sekolah kami makin penting setiap tahun.', 'Banyak siswa membagikan berita tanpa membaca isinya dulu.', 'Guru mengajak kami memeriksa sumber sebelum percaya.', 'Kami belajar membandingkan judul dengan isi berita.', 'Paragraf kedua dari berkas PDF.'];
await m.setInputFiles('#fileInput', { name: 'esai.pdf', mimeType: 'application/pdf', buffer: makePdf(PDF_LINES) });
await m.waitForFunction(() => document.querySelector('textarea[name=text]').value.includes('Paragraf kedua dari berkas PDF'), null, { timeout: 20000 });
ok(/^Literasi digital di sekolah kami makin penting setiap tahun\.\s+Banyak siswa[\s\S]+\s+Paragraf kedua dari berkas PDF\.$/.test(await m.inputValue('textarea[name=text]')), 'unggah .pdf: teks terbaca di peramban (pdf.js lokal, CSP ketat)');
await m.setInputFiles('#fileInput', { name: 'esai.rtf', mimeType: 'application/rtf', buffer: Buffer.from("{\\rtf1\\ansi{\\fonttbl{\\f0 Arial;}}\\f0 Judul RTF\\par Caf\\'e9 dan \\u8220?kutipan\\u8221? di sini.\\par Paragraf dua.}", 'latin1') });
await m.waitForFunction(() => document.querySelector('textarea[name=text]').value.includes('Paragraf dua.'));
ok((await m.inputValue('textarea[name=text]')) === 'Judul RTF\n\nCafé dan “kutipan” di sini.\n\nParagraf dua.', 'unggah .rtf: paragraf, aksen dan kutipan utuh');
await m.setInputFiles('#fileInput', { name: 'artikel.html', mimeType: 'text/html', buffer: Buffer.from('<html><body><nav>Menu situs</nav><article><h1>Judul HTML</h1><p>Paragraf <b>satu</b>.</p><script>alert(1)</script><p>Paragraf dua.</p></article><footer>Hak cipta</footer></body></html>') });
await m.waitForFunction(() => document.querySelector('textarea[name=text]').value.startsWith('Judul HTML'));
ok((await m.inputValue('textarea[name=text]')) === 'Judul HTML\n\nParagraf satu.\n\nParagraf dua.', 'unggah .html: isi utama saja, tanpa menu/skrip/footer');
await m.setInputFiles('#fileInput', { name: 'palsu.pdf', mimeType: 'application/pdf', buffer: Buffer.from('bukan pdf sama sekali') });
await m.waitForFunction(() => /rusak atau bukan PDF/.test(document.querySelector('.toasts')?.textContent || ''));
ok(true, 'berkas palsu (.pdf tanpa tanda %PDF) ditolak dengan pesan jelas');
await m.fill('textarea[name=text]', ESSAY);
await m.waitForTimeout(800);
ok(Number((await m.textContent('#estRes')).replace(/\D/g, '')) > 0, 'perkiraan token dari server tampil');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForLoadState();
ok((await m.locator('.flash.err').count()) === 1, 'tanpa token: pemeriksaan ditolak sebelum AI dipanggil');
await m.screenshot({ path: `${OUT}/check-form.png`, fullPage: true });

// 3a. Cek Gratis (pemilik, 7–8 Nov 2026; MASTER-BLUEPRINT §20): tanpa token, hanya Haiku, kuota halaman normal,
//     pemberitahuan bila naskah melebihi kuota, tanda air logo domain, iklan hanya di laporan gratis.
{
  const callsBefore = (await (await fetch('http://127.0.0.1:8788/__calls')).json()).length;
  await m.goto(BASE + '/app/periksa');
  ok((await m.locator('script[src*="adsbygoogle"]').count()) === 0, 'formulir periksa: tanpa loader iklan');
  ok(/sisa 5 dari 5 halaman per minggu/.test(await m.textContent('.free-mode')), 'Cek Gratis mengikuti admin: sisa 5 dari 5 halaman per minggu');
  await m.fill('textarea[name=text]', ESSAY);
  await m.check('input[name=mode][value=free]');
  await m.waitForFunction(() => document.querySelector('#estRes')?.textContent.trim() === '0', null, { timeout: 10000 });
  ok(true, 'Cek Gratis: perkiraan token 0 (yang dipakai kuota halaman)');
  await m.fill('input[name=title]', 'Esai Cek Gratis');
  await m.check('input[name=agree]');
  await m.click('.check-form button[type=submit]');
  await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
  ok((await m.locator('[data-free-report]').count()) === 1, 'laporan Cek Gratis: kotak saran Cek Lengkap');
  ok((await m.locator('.free-mark').count()) >= 1, 'laporan Cek Gratis: label CEK GRATIS di kepala laporan');
  ok((await m.locator('.report.is-free .paper .wm').count()) === (await m.locator('.report.is-free .paper').count()), 'tanda air logo domain di setiap halaman laporan');
  ok((await m.locator('.wm-print img[src="/assets/watermark.webp"]').count()) === 1, 'tanda air logo domain untuk cetak');
  ok(await m.evaluate(async () => (await fetch('/assets/watermark.webp')).ok && (await fetch('/assets/watermark-tile.webp')).ok), 'berkas logo tanda air tersedia');
  ok((await m.locator('script[src*="adsbygoogle"]').count()) === 1, 'laporan Cek Gratis: tepat satu loader AdSense');
  ok((await m.locator('a[href$="unduh.json"]').count()) === 0, 'Cek Gratis: tanpa tombol unduh data JSON');
  const fid = m.url().split('/').pop();
  ok((await m.evaluate(async (u) => (await fetch(u)).status, `/app/laporan/${fid}/unduh.json`)) === 403, 'Cek Gratis: JSON ditolak server (403)');
  await m.screenshot({ path: `${OUT}/free-report.png`, fullPage: true });
  await m.goto(`${BASE}/app/laporan/${fid}/cetak`);
  ok((await m.locator('script[src*="adsbygoogle"]').count()) === 0, 'halaman cetak: tanpa iklan');
  await m.emulateMedia({ media: 'print' });
  ok(await m.evaluate(() => getComputedStyle(document.querySelector('.wm-print')).position === 'fixed'), 'cetak: tanda air logo di setiap lembar');
  await m.pdf({ path: `${OUT}/free-report.pdf`, format: 'A4' });
  await m.emulateMedia({ media: 'screen' });
  const fcalls = (await (await fetch('http://127.0.0.1:8788/__calls')).json()).slice(callsBefore);
  ok(fcalls.length >= 1 && fcalls.every((x) => x.model === 'claude-haiku-5-5' && x.effort === 'low'), `Cek Gratis hanya memanggil Haiku termurah (${fcalls.length} panggilan, effort low)`);

  // Naskah 8 halaman normal (> maks. 5 per pemeriksaan): pemberitahuan + pilihan, bukan potongan diam-diam.
  await m.goto(BASE + '/app/periksa');
  ok(/sisa 4 dari 5/.test(await m.textContent('.free-mode')), 'kuota berkurang sesuai halaman normal: sisa 4');
  // Paragraf dibedakan dari Cek Gratis pertama (huruf awal tiap paragraf diubah kapital/kecil: jumlah halaman sama), supaya
  // uji kuota di bawah tidak terpengaruh potongan „pernah diunggah“ (§26).
  const ESSAY_B = ESSAY.trim().split(/\n\s*\n/).map((x) => (x[0] === x[0].toUpperCase() ? x[0].toLowerCase() : x[0].toUpperCase()) + x.slice(1)).join('\n\n');
  await m.fill('textarea[name=text]', Array.from({ length: 19 }, () => ESSAY_B).join('\n\n'));
  await m.check('input[name=mode][value=free]');
  await m.fill('input[name=title]', 'Naskah panjang gratis');
  await m.check('input[name=agree]');
  await m.click('.check-form button[type=submit]');
  await m.waitForSelector('[data-free-choice]');
  const note = await m.textContent('[data-free-choice]');
  ok(/Naskah ini 8 halaman/.test(note) && /Kuota gratis Anda 5 halaman per minggu/.test(note) && /sisa 4 halaman/.test(note), 'pemberitahuan: naskah 8 halaman, kuota 5/minggu, sisa 4');
  ok(/lebih panjang dari seluruh kuota gratis \(5 halaman\)/.test(note), 'pemberitahuan: naskah lebih panjang dari seluruh kuota');
  ok((await m.locator('[data-free-choice] a[href="/app/token"]').count()) === 1, 'pemberitahuan menyarankan isi saldo / Cek Lengkap');
  await m.screenshot({ path: `${OUT}/free-choice.png`, fullPage: true });
  await m.click('[data-free-choice] button[name=partial]');
  await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
  ok(/hanya 4 halaman pertama dari 8/.test(await m.textContent('[data-free-report]')), 'periksa sebagian: 4 halaman pertama dari 8, ditandai di laporan');
  await m.goto(BASE + '/app/periksa');
  ok(/sisa 0 dari 5/.test(await m.textContent('.free-mode')), 'kuota habis: sisa 0 dari 5 halaman');
  ok(await m.locator('input[name=mode][value=free]').isDisabled(), 'kuota habis: pilihan Cek Gratis nonaktif sampai reset');
}
// Bukti transfer kecil (PNG 1×1 dan PDF minimal) — jenis dicek server dari isi berkas.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const PDF = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
async function uploadProof(page, file, amount) {
  await page.setInputFiles('#unggah input[name=file]', file);
  await page.fill('#unggah input[name=sender]', 'Guru Uji');
  await page.fill('#unggah input[name=via]', 'BCA m-banking');
  await page.fill('#unggah input[name=paidOn]', '2026-11-02');
  await page.fill('#unggah input[name=amount]', String(amount));
  await page.click('#unggah button[type=submit]');
  await page.waitForURL(/ok=proof/);
}
async function adminDecide(id, act, reason) {
  await p.goto(BASE + `/admin/pesanan/${id}`);
  if (act === 'approve') { p.once('dialog', (d) => d.accept()); await p.click(`form[action="/admin/pesanan/${id}"] >> input[value=approve] >> xpath=.. >> button`); }
  else { await p.fill('input[name=reason]', reason); await p.click(`form[action="/admin/pesanan/${id}"] >> input[value=reject] >> xpath=.. >> button`); }
  await p.waitForURL(/\?ok=1/);
}

// 3a. Paket Lembaga dibayar transfer Rupiah: invoice → bukti → admin setujui → token masuk tepat sekali.
await m.goto(BASE + '/app/token');
ok((await m.locator('.notice-cash').count()) >= 1, 'pemberitahuan: saldo tidak bisa diuangkan');
await m.click('.plans .plan >> nth=3 >> button[value=IDR]');
await m.waitForURL(/\/app\/pesanan\//);
const orderId = m.url().split('/').pop();
const orderIdr = Number((await m.textContent('.invoice .inv-total')).replace(/\D/g, ''));
ok(orderIdr > 0, `harga pesanan dibekukan di invoice (Rp ${orderIdr})`);
ok((await m.textContent('.paybox')).includes('2090571484') && (await m.textContent('.paybox')).includes('YUSRON EFENDI'), 'invoice IDR: rekening BNI dari ulyah.com');
ok(/XS-\d{8}-[0-9A-Z]{6}/.test(await m.textContent('.inv-no')), 'nomor invoice tampil');
await m.screenshot({ path: `${OUT}/invoice-idr.png`, fullPage: true });
await uploadProof(m, { name: 'bukti.png', mimeType: 'image/png', buffer: PNG }, orderIdr);
ok((await m.locator('.proofs li').count()) === 1, 'bukti transfer terunggah dan tampil');
await p.goto(BASE + '/admin');
ok(/1/.test(await p.textContent('a.flash.err')), 'admin: antrean bukti transfer muncul di dasbor');
// Notifikasi admin (pemilik, 8 Nov 2026): lencana menu untuk bukti transfer yang belum dicek dan member baru.
await p.waitForSelector('[data-badge="orders"]:not([hidden])');
ok(Number(await p.textContent('[data-badge="orders"]')) >= 1 && !(await p.locator('[data-badge="members"]').isHidden()), 'notifikasi admin: lencana bukti transfer menunggu dicek + member baru');
await p.goto(BASE + '/admin/anggota');
const nb = await p.evaluate(async () => (await fetch('/api/admin/notifications')).json());
ok(nb.members === 0 && nb.orders >= 1, 'membuka menu Anggota menandai member baru sudah dilihat; bukti transfer tetap menunggu sampai dicek');
await p.goto(BASE + '/admin/pesanan');
ok((await p.locator(`a[href="/admin/pesanan/${orderId}"]`).count()) >= 1, 'admin: pesanan ada di tab Perlu diperiksa');
await p.goto(BASE + `/admin/pesanan/${orderId}`);
ok((await p.locator('.proofs img').count()) === 1, 'admin: pratinjau bukti transfer');
const proofResp = await p.evaluate(async (id) => { const r = await fetch(`/admin/pesanan/${id}/bukti/0`); return { s: r.status, t: r.headers.get('content-type') }; }, orderId);
ok(proofResp.s === 200 && proofResp.t === 'image/png', 'admin: berkas bukti dilayani (image/png)');
await adminDecide(orderId, 'approve');
// Klik ulang "setujui" (mis. tab lama): tidak pernah menambah token dua kali.
await p.evaluate(async (id) => { const fd = new FormData(); fd.set('act', 'approve'); await fetch(`/admin/pesanan/${id}`, { method: 'POST', body: fd }); }, orderId);
await m.goto(BASE + '/app/token');
ok((await m.getAttribute('.stat-hero .stat-v', 'data-count')) === '12000', 'token masuk tepat 12.000 setelah disetujui (klik ulang tidak menambah)');
await m.goto(BASE + `/app/pesanan/${orderId}`);
ok((await m.locator('.invoice .stamp').count()) === 1, 'invoice member: cap LUNAS');
await p.goto(BASE + '/app/afiliasi');
const commission = Math.floor(orderIdr * 15 / 100).toLocaleString('id-ID');
ok((await p.textContent('.grid.g4')).includes(commission), `komisi afiliasi 15% (Rp ${commission}) tercatat`);
// Orang lain tidak bisa membuka invoice / bukti member ini.
ok((await p.goto(BASE + `/app/pesanan/${orderId}/bukti/0`)).status() === 404, 'bukti member tidak bisa dibuka akun lain lewat portal member');

// 3b. Bayar USD dari luar negeri: panduan SWIFT + alternatif kiriman uang, lalu batal.
await m.goto(BASE + '/app/token');
await m.click('.plans .plan >> nth=0 >> button[value=USD]');
await m.waitForURL(/\/app\/pesanan\//);
const usdText = await m.textContent('main');
ok(/BNINIDJA/.test(usdText) && /2090571495/.test(usdText) && /OUR/.test(usdText) && /Wise/.test(usdText), 'invoice USD: SWIFT, rekening USD, biaya OUR, alternatif kiriman uang');
await m.screenshot({ path: `${OUT}/invoice-usd.png`, fullPage: true });
m.once('dialog', (d) => d.accept());
await m.click('form[action$="/batal"] button');
await m.waitForURL(/ok=cancel/);
ok(true, 'member membatalkan pesanan USD');

// 3c. Deposit Rupiah: invoice → bukti ditolak → unggah ulang → disetujui → beli paket & tukar token dari saldo.
await m.goto(BASE + '/app/token#deposit');
await m.fill('#depAmt', '1000000');
await m.click('form[action="/app/deposit/isi"] button[type=submit]');
await m.waitForURL(/\/app\/pesanan\//);
const depId = m.url().split('/').pop();
ok(/Deposit|deposit/.test(await m.textContent('.invoice')), 'invoice deposit');
await uploadProof(m, { name: 'bukti.pdf', mimeType: 'application/pdf', buffer: PDF }, 1000000);
await adminDecide(depId, 'reject', 'Dana belum masuk');
await m.goto(BASE + `/app/pesanan/${depId}`);
ok(/Dana belum masuk/.test(await m.textContent('main')), 'member melihat alasan penolakan');
await uploadProof(m, { name: 'bukti2.png', mimeType: 'image/png', buffer: PNG }, 1000000);
await adminDecide(depId, 'approve');
await m.goto(BASE + '/app/token');
ok(/1\.000\.000/.test(await m.textContent('.stat-hero >> nth=1')), 'saldo deposit Rp 1.000.000 setelah disetujui');
const tokBefore = Number(await m.getAttribute('.stat-hero .stat-v', 'data-count'));
m.once('dialog', (d) => d.accept());
await m.click('.plans .plan >> nth=0 >> form[action="/app/deposit/beli"] button');
await m.waitForURL(/ok=deposit-buy/);
const tokAfterBuy = Number(await m.getAttribute('.stat-hero .stat-v', 'data-count'));
ok(tokAfterBuy === tokBefore + 300, `beli Starter dari deposit: +300 token (${tokBefore} → ${tokAfterBuy})`);
const depLeft = Number((await m.textContent('.stat-hero >> nth=1 >> .stat-v')).replace(/\D/g, ''));
ok(depLeft > 0 && depLeft < 1000000, `deposit berkurang sesuai harga paket (sisa Rp ${depLeft})`);
const preview = Number((await m.textContent('[data-convert-out]')).replace(/\D/g, ''));
await m.click('form[action="/app/deposit/tukar"] button[type=submit]');
await m.waitForURL(/ok=deposit-convert/);
const tokAfterConv = Number(await m.getAttribute('.stat-hero .stat-v', 'data-count'));
ok(tokAfterConv === tokAfterBuy + preview && preview > 0, `tukar sisa deposit: +${preview} token sesuai pratinjau`);
await m.screenshot({ path: `${OUT}/token-deposit.png`, fullPage: true });
const memberText = await m.evaluate(() => document.body.innerText);
ok(!/markup|modal|keuntungan|×\s*kurs/i.test(memberText), 'halaman token member tidak menyebut markup/modal (rahasia perusahaan)');

await m.goto(BASE + '/app/periksa');
await m.fill('textarea[name=text]', ESSAY);
await m.fill('input[name=title]', 'Esai Literasi Digital');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok((await m.locator('.ring').count()) >= 3, 'laporan member: cincin persen');
ok((await m.locator('.usage tbody tr').count()) >= 3, 'rincian token masuk/keluar per panggilan AI tampil');
const rid = m.url().split('/').pop();
const inPage = (url) => m.evaluate(async (u) => { const r = await fetch(u); return { status: r.status, text: await r.text() }; }, url);
const html = await inPage(`/app/laporan/${rid}/unduh.html`);
ok(html.status === 200 && html.text.includes('<style>') && html.text.includes('data:image/webp'), 'unduh HTML mandiri (CSS & logo dibenamkan)');
const js = JSON.parse((await inPage(`/app/laporan/${rid}/unduh.json`)).text);
ok(js.signature.startsWith('hmac-sha256:') && js.data.report.id === rid, 'unduh JSON bertanda tangan');
await m.goto(BASE + '/app/token');
const after = Number(await m.getAttribute('.stat-hero .stat-v', 'data-count'));
ok(after < tokAfterConv && after > 0, `token dipotong sesuai biaya nyata (sisa ${after})`);
// Naskah yang pernah diunggah (MASTER-BLUEPRINT §26): member yang sama + mesin yang sama → tanpa panggilan AI, ditagih 50 %.
const MOCK = 'http://127.0.0.1:8788/__calls';
const nCalls = async () => (await (await fetch(MOCK)).json()).length;
const firstExact = Number(js.data.report.usage.exact);
const firstNonRubric = js.data.report.usage.lines.filter((l) => !l.tier.startsWith('rubric')).reduce((a, l) => a + l.tokens, 0);
let callsBefore = await nCalls();
await m.goto(BASE + '/app/periksa');
await m.fill('textarea[name=text]', ESSAY);
await m.fill('input[name=title]', 'Esai Literasi Digital (kirim ulang)');
ok((await m.locator('[data-reuse-note]').count()) === 1 && /50%/.test(await m.textContent('[data-reuse-note]')), 'formulir menyebut potongan 50% untuk naskah yang pernah diperiksa');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok((await nCalls()) === callsBefore, 'unggah ulang (member sama, mesin sama): tidak ada panggilan AI baru — biaya perusahaan 0');
ok((await m.locator('[data-reuse-own]').count()) === 1, 'laporan: pemberitahuan hasil tersimpan milik sendiri');
ok((await m.locator('[data-reuse-line]').count()) === 1 && (await m.locator('.usage tbody tr', { hasText: 'Hasil tersimpan Anda' }).count()) >= 1, 'rincian token: baris „Hasil tersimpan Anda“');
await m.goto(BASE + '/app/token');
const afterReuse = Number(await m.getAttribute('.stat-hero .stat-v', 'data-count'));
ok(after - afterReuse > 0 && Math.abs(after - afterReuse - firstExact / 2) <= 1.5, `unggah ulang ditagih ±50%: ${after - afterReuse} token (pertama ${firstExact})`);
ok((await m.locator('[data-my-stats]').count()) === 1 && !/biaya ai|laba|profit|markup/i.test(await m.textContent('[data-my-stats]')), 'portal member: riwayat pemakaian & pembayaran tanpa biaya AI/laba');
// Sebagian sama: hanya paragraf baru yang dikirim ke AI.
callsBefore = await nCalls();
await m.goto(BASE + '/app/periksa');
await m.fill('textarea[name=text]', `${ESSAY.trim()}\n\nParagraf tambahan ini baru ditulis untuk revisi kedua. Isinya menjelaskan langkah sekolah melatih murid memeriksa sumber berita setiap pekan, lalu mendiskusikannya bersama guru di kelas.`);
await m.fill('input[name=title]', 'Esai Literasi Digital (revisi)');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok((await nCalls()) > callsBefore && (await m.locator('[data-reuse-own]').count()) === 1, 'sebagian sama: paragraf baru diperiksa AI, sisanya hasil tersimpan');

// Member lain mengunggah naskah yang sama: biaya normal, tanpa panggilan AI, tanpa tanda pernah diunggah orang lain.
const mem2 = await ctx();
await mem2.route(BASE + '/**', (route) => route.continue({ headers: { ...route.request().headers(), 'cf-connecting-ip': '10.9.8.66' } }));
const m2 = await mem2.newPage();
await m2.goto(BASE + '/daftar');
await m2.fill('input[name=name]', 'Panitia Lain');
await m2.fill('input[name=email]', 'panitia@example.com');
await m2.fill('input[name=password]', 'sandi-panitia-123');
await m2.check('input[name=agree]');
await m2.click('form[action^="/daftar"] button[type=submit]');
await m2.waitForURL(/\/app\?welcome=1/);
await p.goto(BASE + '/admin/anggota?email=panitia%40example.com');
await p.fill('form[action$="/kuota"] input[name=tokens]', '500');
await p.fill('form[action$="/kuota"] input[name=note]', 'uji e2e');
await p.click('form[action$="/kuota"] button[type=submit]');
await p.waitForURL(/\?ok=1/);
callsBefore = await nCalls();
await m2.goto(BASE + '/app/periksa');
await m2.fill('textarea[name=text]', ESSAY);
await m2.fill('input[name=title]', 'Naskah peserta');
await m2.selectOption('select[name=rubric]', '');
await m2.check('input[name=agree]');
await m2.click('.check-form button[type=submit]');
await m2.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok((await nCalls()) === callsBefore, 'member lain, naskah sama, mesin sama: tanpa panggilan AI — biaya perusahaan 0');
ok((await m2.locator('[data-reuse-own]').count()) === 0 && (await m2.locator('[data-reuse-line]').count()) === 0, 'member lain: tidak ada tanda naskah pernah diunggah orang lain');
const m2rid = m2.url().split('/').pop().split('?')[0];
const js2 = JSON.parse(await m2.evaluate(async (u) => (await fetch(u)).text(), `/app/laporan/${m2rid}/unduh.json`));
ok(js2.data.report.usage.lines.every((l) => l.tier !== 'reuse-own') && Math.abs(js2.data.report.usage.exact - firstNonRubric) <= 0.6, `member lain: harga normal (${js2.data.report.usage.exact} ≈ ${firstNonRubric.toFixed(2)} token tanpa rubrik)`);
ok(!('cost' in js2.data.report) && !JSON.stringify(js2).includes('reuse'), 'unduhan JSON tanpa biaya AI dan tanpa jejak hasil tersimpan');
// Mesin lain = penilaian baru dengan biaya normal.
callsBefore = await nCalls();
await m2.goto(BASE + '/app/periksa');
await m2.fill('textarea[name=text]', ESSAY);
await m2.fill('input[name=title]', 'Naskah peserta (Haiku)');
await m2.selectOption('select[name=rubric]', '');
await m2.check('input[name=mode][value=haiku]');
await m2.check('input[name=agree]');
await m2.click('.check-form button[type=submit]');
await m2.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok((await nCalls()) > callsBefore, 'mesin berbeda: diperiksa ulang oleh AI');
// Admin: token keluar, dibayar, laba — per member dan total.
await p.goto(BASE + '/admin/keuangan');
ok((await p.locator('[data-finance-table] tr', { hasText: 'guru@example.com' }).count()) === 1 && (await p.locator('[data-finance-table] tr', { hasText: 'panitia@example.com' }).count()) === 1, 'Admin → Token & laba: baris per member');
ok(/Laba kas/.test(await p.textContent('[data-member-stats]')) && /Token dikeluarkan/.test(await p.textContent('[data-member-stats]')), 'Admin → Token & laba: total token keluar, dibayar, laba');
await p.click('[data-stats-rebuild] button');
await p.waitForURL(/keuangan\?ok=1/);
ok((await p.locator('[data-finance-table] tr', { hasText: 'guru@example.com' }).count()) === 1, 'hitung ulang rekap dari catatan: aman');
ok(/Sisa token/.test(await p.textContent('[data-finance-table] thead')) && /Saldo → token/.test(await p.textContent('[data-finance-table] thead')), 'Token & laba: kolom sisa token, top-up, saldo→token, sisa saldo');
await p.goto(BASE + '/admin/anggota?email=guru%40example.com');
ok((await p.locator('[data-member-wallet]').count()) === 1 && /Sisa token/.test(await p.textContent('[data-member-wallet]')) && /Sisa saldo deposit/.test(await p.textContent('[data-member-wallet]')), 'Admin → member: sisa token, token terpakai, sisa saldo');
ok(/isi saldo/.test(await p.textContent('[data-member-deposit]')) && /tukar ke token|beli paket dari deposit/.test(await p.textContent('[data-member-deposit]')), 'Admin → member: rincian top-up & konversi saldo ke token');
ok((await p.locator('[data-member-orders] tbody tr').count()) >= 1, 'Admin → member: tabel pesanan & pembayaran');
await p.goto(BASE + '/admin/biaya');
ok((await p.locator('[data-reuse-saved]').count()) === 1, 'Biaya API: kartu penghematan hasil tersimpan');
await p.goto(BASE + '/admin/harga');
ok((await p.locator('[data-reuse-setting] input[name=reusePct]').inputValue()) === '50', 'Admin → Harga: persen naskah pernah diunggah (bawaan 50)');
await m.goto(BASE + '/app/laporan?q=literasi');
ok((await m.locator('tbody tr').count()) >= 1, 'riwayat kerja: pencarian');
ok(/naskah s\.d\./.test(await m.textContent('tbody')), 'riwayat kerja: penanda tanggal naskah dihapus (riwayat tetap)');
const csv = await inPage('/app/laporan/ekspor.csv');
ok(csv.status === 200 && csv.text.includes('Literasi'), 'ekspor riwayat CSV');
await m.goto(`${BASE}/app/laporan/${rid}/cetak`);
await m.emulateMedia({ media: 'print' });
await m.pdf({ path: `${OUT}/report.pdf`, format: 'A4' });
await m.emulateMedia({ media: 'screen' });
ok(fs.statSync(`${OUT}/report.pdf`).size > 20000, 'cetak A4 ke PDF');

// 3b. Mesin pilihan klien: Sonnet saja
await m.goto(BASE + '/app/periksa');
await m.fill('textarea[name=text]', ESSAY);
await m.waitForFunction(() => /token/.test(document.querySelector('[data-mode-est="sonnet"]')?.textContent || ''), null, { timeout: 10000 });
ok(true, 'perkiraan token per mesin (Haiku/Sonnet/Opus/AUTO) tampil di formulir');
await m.check('input[name=mode][value=sonnet]');
await m.fill('input[name=title]', 'Esai mode Sonnet');
await m.selectOption('select[name=purpose]', 'lomba');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok(/Claude Sonnet/.test(await m.textContent('.pmeta')), 'laporan menyebut mesin Claude Sonnet');
// Keperluan laporan (pemilik, 8 Nov 2026): laporan lomba berbeda dari laporan umum.
ok(/Lembar Penilaian Naskah Lomba/.test(await m.textContent('.report .phead')) && /Peserta/.test(await m.textContent('.pmeta')) && /Lomba/.test(await m.textContent('.pmeta')), 'laporan lomba: judul, sebutan peserta, dan keperluan');
ok(/Juri/.test(await m.textContent('.report .sign')) && /Ketua panitia/.test(await m.textContent('.report .sign')), 'laporan lomba: kolom tanda tangan juri dan ketua panitia');
ok((await m.locator('[data-assist-note]').count()) === 1 && (await m.locator('.report [data-assist-note]').count()) === 0, 'pemberitahuan „membantu, tidak memutuskan“ ada di portal, di luar laporan');
ok(!/tidak memutuskan|dasar hukuman/.test(await m.textContent('.report')), 'laporan member tidak memuat kalimat „tidak memutuskan“');
const sonnetRid = m.url().split('/').pop().split('?')[0];
await m.goto(`${BASE}/app/laporan/${sonnetRid}/cetak`);
ok((await m.locator('[data-assist-note]').count()) === 0 && !/tidak memutuskan/.test(await m.textContent('body')), 'halaman cetak tanpa pemberitahuan portal');
await m.goto(BASE + '/app');
ok((await m.locator('[data-assist-note]').count()) === 1, 'dasbor: pemberitahuan alat bantu tampil');

// Claude Fable 5.1 (pemilik, 8 Nov 2026): pilihan premium, kalimat elegan, jendela „Anda yakin?“.
await m.goto(BASE + '/app/periksa');
ok((await m.locator('.mode-card.premium input[value=fable]').count()) === 1 && /lebih cepat/.test(await m.textContent('.mode-card.premium')), 'Fable 5.1 tersedia dengan keterangan biaya yang elegan');
await m.fill('textarea[name=text]', ESSAY.replace(/Literasi/g, 'Literasi media'));
await m.check('input[name=mode][value=fable]');
await m.waitForSelector('[data-fable-dialog][open]');
ok(/Anda yakin ingin memakai Claude Fable 5\.1\?/.test(await m.textContent('[data-fable-dialog]')), 'memilih Fable membuka jendela „Anda yakin?“');
await m.click('[data-fable-no]');
ok(await m.isChecked('input[name=mode][value=auto]') && (await m.inputValue('[data-fable-ok]')) === '0', '„Tidak“ mengembalikan pilihan ke AUTO');
// Tanpa konfirmasi (JS dilewati) server tetap menolak.
await m.check('input[name=mode][value=fable]');
await m.click('[data-fable-no]');
await m.evaluate(() => { const f = document.querySelector('.check-form'); f.querySelector('input[name=mode][value=fable]').checked = true; f.querySelector('input[name=agree]').checked = true; HTMLFormElement.prototype.submit.call(f); });
await m.waitForLoadState();
ok(/konfirmasi/.test(await m.textContent('.flash.err')), 'server menolak Fable tanpa konfirmasi');
await m.fill('textarea[name=text]', ESSAY.replace(/Literasi/g, 'Literasi media'));
await m.check('input[name=mode][value=auto]');
await m.check('input[name=mode][value=fable]');
await m.waitForSelector('[data-fable-dialog][open]');
await m.click('[data-fable-yes]');
ok((await m.inputValue('[data-fable-ok]')) === '1', '„Ya, saya yakin“ mengonfirmasi Fable');
await m.fill('input[name=title]', 'Esai mode Fable');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok(/Fable 5\.1/.test(await m.textContent('.pmeta')) && /Laporan Analisis Tulisan/.test(await m.textContent('.report .phead')), 'laporan Fable 5.1 (keperluan umum)');
await m.goto(BASE + '/app');
ok((await m.locator('.mode-pages tbody tr').count()) === 4, 'dasbor: prediksi halaman per mesin');

// 4. Sesi lomba: dua naskah, rekap
await m.goto(BASE + '/app/sesi');
await m.fill('input[name=name]', 'Lomba Esai Uji');
await m.click('form[action="/app/sesi"] button[type=submit]');
await m.waitForURL(/\/app\/sesi\/ses_/);
fs.writeFileSync(`${OUT}/01_Nadia_Literasi.txt`, ESSAY);
fs.writeFileSync(`${OUT}/02_Raka_Sampah Plastik.txt`, ESSAY.replace(/Literasi/g, 'Sampah plastik'));
await m.fill('[data-sitemap-url]', 'http://127.0.0.1:8787/sitemap.xml');
await m.click('[data-sitemap-run]');
await m.waitForFunction(() => /jaringan internal/.test(document.querySelector('[data-sitemap-log]')?.textContent || ''));
ok(true, 'impor sitemap: alamat internal ditolak server (SSRF), antrean tidak berubah');
await m.setInputFiles('#filesInput', [`${OUT}/01_Nadia_Literasi.txt`, `${OUT}/02_Raka_Sampah Plastik.txt`]);
await m.check('[data-agree]');
await m.click('[data-run]');
await m.waitForFunction(() => document.querySelectorAll('.recap tbody tr').length >= 2 && !document.querySelector('[data-stage-pill]'), null, { timeout: 180000 });
ok(true, 'rekap sesi lomba lengkap');
await m.screenshot({ path: `${OUT}/recap.png`, fullPage: true });

await m.goto(BASE + '/app/laporan');
ok((await m.locator('.notice-purge').count()) >= 1, 'pemberitahuan pembersihan otomatis 90 hari di riwayat kerja');

// 5. Ponsel
const mob = await ctx({ viewport: { width: 390, height: 844 }, isMobile: true });
const mp = await mob.newPage();
await mp.goto(BASE + '/');
await mp.screenshot({ path: `${OUT}/mobile-home.png`, fullPage: true });
const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
ok(!overflow, 'ponsel: tanpa gulir horizontal');

const calls = await (await fetch('http://127.0.0.1:8788/__calls')).json();
ok(calls.some((x) => x.model === 'claude-haiku-5-5' && x.effort === 'high'), 'Haiku dipanggil dengan effort high (Mode Ultra)');
ok(calls.every((x) => !/sonnet|opus/.test(x.model) || (x.fallbacks === 'default' && /server-side-fallback/.test(x.betas || ''))), 'Sonnet/Opus memakai server-side fallback');
ok(calls.filter((x) => x.model === 'claude-sonnet-5-5').length >= 3, 'mode Sonnet benar-benar memanggil Sonnet');
ok(calls.some((x) => x.model === 'claude-fable-5-1' && x.fallbacks === 'default'), 'mode Fable memanggil claude-fable-5-1 dengan fallback sisi server');
await browser.close();
// 402 (saldo kurang), 404 bukti milik akun lain, 409 pilihan kuota gratis, 403 JSON Cek Gratis dan 422 URL internal memang disengaja di atas.
const real = errors.filter((e) => !/status of 402/.test(e) && !/\/bukti\/0 :: .*status of 404/.test(e) && !/\/app\/periksa :: .*status of 409/.test(e) && !/\/app\/laporan\/rpt_\w+ :: .*status of 403/.test(e) && !/\/app\/periksa :: .*status of 422/.test(e) && !/\/app\/periksa :: .*status of 503/.test(e) && !/\/app\/sesi\/ses_\w+ :: .*status of 422/.test(e) && !/\/app\/periksa :: .*status of 400/.test(e));
if (real.length) { console.error('Galat konsol:\n' + real.join('\n')); process.exit(1); }
console.log('SEMUA LULUS');
