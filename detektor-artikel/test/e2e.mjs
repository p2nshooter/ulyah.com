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
await m.setInputFiles('#fileInput', { name: 'esai.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: makeDocx(['Judul: Literasi & Kita', 'Paragraf satu\tdengan tab <aman>.', 'Paragraf dua.']) });
await m.waitForFunction(() => document.querySelector('textarea[name=text]').value.includes('Paragraf dua'));
const fromDocx = await m.inputValue('textarea[name=text]');
ok(fromDocx === 'Judul: Literasi & Kita\n\nParagraf satu\tdengan tab <aman>.\n\nParagraf dua.', 'unggah .docx: teks, tab, paragraf, dan karakter khusus terbaca utuh');
await m.fill('textarea[name=text]', ESSAY);
await m.waitForTimeout(800);
ok(Number((await m.textContent('#estRes')).replace(/\D/g, '')) > 0, 'perkiraan token dari server tampil');
await m.check('input[name=agree]');
await m.click('.check-form button[type=submit]');
await m.waitForLoadState();
ok((await m.locator('.flash.err').count()) === 1, 'tanpa token: pemeriksaan ditolak sebelum AI dipanggil');
await m.screenshot({ path: `${OUT}/check-form.png`, fullPage: true });
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
await browser.close();
// 402 (saldo kurang) dan 404 bukti milik akun lain memang disengaja di atas.
const real = errors.filter((e) => !/status of 402/.test(e) && !/\/bukti\/0 :: .*status of 404/.test(e));
if (real.length) { console.error('Galat konsol:\n' + real.join('\n')); process.exit(1); }
console.log('SEMUA LULUS');
