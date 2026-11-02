// Uji ujung-ke-ujung di peramban sungguhan (Playwright) terhadap `wrangler dev` + server Anthropic tiruan.
// Jalankan: node test/mock-anthropic.mjs 8788 & npx wrangler dev --port 8787 & node test/e2e.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import crypto from 'node:crypto';
import fs from 'node:fs';

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
  const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  // Iklan Google tidak dimuat dalam uji (tidak ada jaringan iklan di CI): loader AdSense diganti skrip kosong.
  await c.route(/googlesyndication\.com|doubleclick\.net|googleadservices\.com|adtrafficquality\.google/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  c.on('page', (p) => {
    p.on('console', (m) => { if (m.type() === 'error') errors.push(`${p.url()} :: ${m.text()}`); });
    p.on('pageerror', (e) => errors.push(`${p.url()} :: ${e.message}`));
  });
  return c;
}

// 1. Halaman publik ID & EN
const pub = await ctx();
let p = await pub.newPage();
for (const path of ['/', '/en', '/cara-kerja', '/en/how-it-works', '/harga', '/en/pricing', '/akurasi', '/contoh-laporan', '/en/sample-report', '/kebijakan-privasi', '/syarat', '/penggunaan-etis', '/verifikasi', '/ads.txt', '/robots.txt']) {
  const r = await p.goto(BASE + path);
  ok(r.status() === 200, `publik ${path} 200`);
}
{
  const r = await p.goto(BASE + '/');
  ok(!r.headers()['x-robots-tag'], 'tidak ada X-Robots-Tag yang menghambat Google');
  ok((await p.locator('meta[name="google-adsense-account"]').getAttribute('content')) === 'ca-pub-9354298681597606', 'AdSense: tag meta');
  ok((await p.locator('script[src*="adsbygoogle.js?client=ca-pub-9354298681597606"]').count()) === 1, 'AdSense: loader');
  ok((await p.locator('meta[name=robots]').count()) === 0, 'beranda bisa diindeks');
  const ads = await (await p.request.get(BASE + '/ads.txt')).text();
  ok(ads.trim() === 'google.com, pub-9354298681597606, DIRECT, f08c47fec0942fa0', 'ads.txt persis');
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
await p.locator('input[name=markup]').fill('100');
await p.click('form[action="/admin/harga"] button[type=submit]');
await p.waitForURL(/harga\?ok=1/);
ok((await p.inputValue('input[name=markup]')) === '100', 'markup 100× tersimpan');
await p.goto(BASE + '/admin/harga');
await p.screenshot({ path: `${OUT}/admin-harga.png`, fullPage: true });

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
await m.fill('textarea[name=text]', ESSAY);
await m.waitForTimeout(800);
ok(Number((await m.textContent('#estRes')).replace(/\D/g, '')) > 0, 'perkiraan token dari server tampil');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForLoadState();
ok((await m.locator('.flash.err').count()) === 1, 'tanpa token: pemeriksaan ditolak sebelum AI dipanggil');
await m.screenshot({ path: `${OUT}/check-form.png`, fullPage: true });
await m.goto(BASE + '/app/token');
await m.click('form[action="/app/token/pesan"] >> nth=3 >> button');
await m.waitForURL(/\/app\/pesanan\//);
const orderId = m.url().split('/').pop();
const orderIdr = Number((await m.textContent('.invoice .kv dd b')).replace(/\D/g, ''));
ok(orderIdr > 0, `harga pesanan dibekukan di invoice (Rp ${orderIdr})`);
await p.goto(BASE + '/admin/pesanan');
p.once('dialog', (d) => d.accept());
await p.click(`form[action="/admin/pesanan/${orderId}"] button[value=credit]`);
await p.waitForURL(/pesanan\?ok=1/);
await m.goto(BASE + '/app/token');
ok((await m.getAttribute('.stat-hero .stat-v', 'data-count')) === '12000', 'token masuk tepat 12.000 setelah lunas');
await p.goto(BASE + '/app/afiliasi');
const commission = Math.floor(orderIdr * 15 / 100).toLocaleString('id-ID');
ok((await p.textContent('.grid.g4')).includes(commission), `komisi afiliasi 15% (Rp ${commission}) tercatat`);

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
ok(after < 12000 && after > 0, `token dipotong sesuai biaya nyata (sisa ${after})`);
await m.goto(BASE + '/app/laporan?q=literasi');
ok((await m.locator('tbody tr').count()) >= 1, 'riwayat kerja: pencarian');
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
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForURL(/\/app\/laporan\/rpt_/, { timeout: 120000 });
ok(/Claude Sonnet/.test(await m.textContent('.pmeta')), 'laporan menyebut mesin Claude Sonnet');
await m.goto(BASE + '/app');
ok((await m.locator('.mode-pages tbody tr').count()) === 4, 'dasbor: prediksi halaman per mesin');

// 4. Sesi lomba: dua naskah, rekap
await m.goto(BASE + '/app/sesi');
await m.fill('input[name=name]', 'Lomba Esai Uji');
await m.click('form[action="/app/sesi"] button[type=submit]');
await m.waitForURL(/\/app\/sesi\/ses_/);
fs.writeFileSync(`${OUT}/01_Nadia_Literasi.txt`, ESSAY);
fs.writeFileSync(`${OUT}/02_Raka_Sampah Plastik.txt`, ESSAY.replace(/Literasi/g, 'Sampah plastik'));
await m.setInputFiles('#filesInput', [`${OUT}/01_Nadia_Literasi.txt`, `${OUT}/02_Raka_Sampah Plastik.txt`]);
await m.check('[data-agree]');
await m.click('[data-run]');
await m.waitForFunction(() => document.querySelectorAll('.recap tbody tr').length >= 2 && !document.querySelector('[data-stage-pill]'), null, { timeout: 180000 });
ok(true, 'rekap sesi lomba lengkap');
await m.screenshot({ path: `${OUT}/recap.png`, fullPage: true });

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
await browser.close();
const real = errors.filter((e) => !/status of 402/.test(e));
if (real.length) { console.error('Galat konsol:\n' + real.join('\n')); process.exit(1); }
console.log('SEMUA LULUS');
