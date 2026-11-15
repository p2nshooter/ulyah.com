/* Uji ujung-ke-ujung portal yapida.sch.id: pemasangan pertama dengan kode, papan PIN acak bergambar, ketuk logo 5×,
 * akun per lembaga, hak akses per peran, isi (kabar + foto, album, video, PPDB), formulir pendaftaran dan kontak.
 * Dijalankan oleh test/run-e2e.sh setelah e2e.mjs, terhadap wrangler dev yang sama.
 * Kode pemasangan uji: UJI00-UJI00-UJI00-UJI00 (hash-nya di .dev.vars buatan run-e2e.sh; kode produksi berbeda). */
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

async function buka(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  const page = await ctx.newPage();
  await page.route(/googlesyndication|doubleclick|i\.ytimg\.com|youtube/, (r) => r.abort());
  page.on('pageerror', (e) => galat.push(`${page.url()}: ${e.message.slice(0, 140)}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|net::|40[0-9]|429/.test(m.text())) galat.push(`${page.url()}: ${m.text().slice(0, 140)}`); });
  page.on('response', (r) => { if (r.status() >= 500) galat.push(`HTTP ${r.status()} ${r.url()}`); });
  return { ctx, page };
}

/** Membaca angka pada tombol papan PIN dari gambar SVG-nya: setiap angka punya bentuk path yang unik (ANGKA di src/lib/angka.ts). */
async function petaTombol(page) {
  const sidik = JSON.parse(fs.readFileSync(new URL('./angka-sidik.json', import.meta.url), 'utf8'));
  return page.$$eval('[data-pos]', (bs, sd) => bs.map((b) => { const d = b.querySelector('path')?.getAttribute('d') ?? ''; return [b.getAttribute('data-pos'), sd[d.slice(0, 40)]]; }), sidik);
}
async function ketukPin(page, pin) {
  const peta = new Map((await petaTombol(page)).map(([pos, angka]) => [angka, pos]));
  for (const a of pin) await page.click(`[data-pos="${peta.get(a)}"]`);
}

/* ── 1. pintu: ketuk logo 5× membuka /masuk; sekali ketuk tetap ke beranda ── */
{
  const { ctx, page } = await buka();
  await page.goto(BASE + '/profil');
  ok((await page.locator('a[href="/portal"]').count()) === 0, 'tidak ada tombol Portal/Login di kepala situs');
  await page.click('[data-logo-ketuk]');
  await page.waitForURL(BASE + '/');
  ok(page.url() === BASE + '/', 'sekali ketuk logo → beranda');
  for (let i = 0; i < 5; i++) await page.click('[data-logo-ketuk]', { delay: 30 });
  await page.waitForURL(/\/masuk$/);
  ok(/\/masuk$/.test(page.url()), 'lima ketukan logo → halaman masuk');
  await ctx.close();
}

/* ── 2. pemasangan pertama ── */
let papanAcak = [];
{
  const { ctx, page } = await buka();
  await page.goto(BASE + '/masuk');
  ok(await page.locator('h1', { hasText: 'Pemasangan pertama' }).isVisible(), 'belum ada akun → halaman pemasangan pertama');
  ok((await page.locator('.pin-tbl[data-pos]').count()) === 10 && (await page.locator('.pin-kisi').innerText()).replace(/[⌫✕\s]/g, '') === '', 'papan PIN: 10 tombol angka, tanpa angka sebagai teks');
  papanAcak.push((await petaTombol(page)).map((x) => x[1]).join(''));
  await page.fill('[name="kode"]', 'SALAH-SALAH-SALAH-SALAH');
  await ketukPin(page, '24680'); await ketukPin(page, '24680');
  await page.waitForLoadState('load');
  ok((await page.locator('.p-kilat-galat').innerText()).includes('Kode pemasangan salah'), 'kode pemasangan salah ditolak');
  papanAcak.push((await petaTombol(page)).map((x) => x[1]).join(''));
  await page.fill('[name="kode"]', 'uji00-uji00-uji00-uji00');
  await page.fill('[name="nama"]', 'Super Admin');
  await ketukPin(page, '24680');
  ok((await page.locator('[data-pin-judul]').innerText()) === 'Ulangi PIN', 'setelah 5 angka: diminta mengulang PIN');
  await ketukPin(page, '24680');
  await page.waitForURL(/\/portal$/);
  ok(await page.locator('h1', { hasText: 'Dasbor' }).isVisible(), 'super admin dibuat dan langsung masuk ke dasbor');
  await page.screenshot({ path: `${OUT}/portal-dasbor.png` });

  // akun semua lembaga, PIN acak tampil sekali
  await page.goto(BASE + '/portal/pengguna');
  page.once('dialog', (dl) => dl.accept());
  await page.click('text=Buat akun semua lembaga');
  await page.waitForLoadState('load');
  const baris = await page.$$eval('.p-pin-baru tbody tr', (rs) => rs.map((r) => [r.cells[0].innerText.trim(), r.cells[2].innerText.trim()]));
  ok(baris.length === 17 && baris.every(([, p]) => /^\d{5}$/.test(p)), 'akun Ketua, Admin Yayasan, dan 15 admin lembaga dibuat dengan PIN 5 angka', baris.length);
  fs.writeFileSync(`${OUT}/pin-uji.json`, JSON.stringify(baris));
  await page.screenshot({ path: `${OUT}/portal-pin-baru.png` });

  // super admin: tambah kabar yayasan + album galeri dengan foto
  const foto = new URL('../public/assets/og.png', import.meta.url).pathname;
  await page.goto(BASE + '/portal/k/galeri/baru');
  await page.fill('[name="judul"]', 'Peringatan Maulid Nabi 1448 H');
  await page.selectOption('[name="unit"]', 'masjid-jami-al-huda');
  await page.setInputFiles('[data-galeri] input[type="file"]', [foto, foto]);
  await page.waitForFunction(() => document.querySelectorAll('.p-galeri-butir').length === 2, null, { timeout: 20000 });
  await page.fill('.p-galeri-butir input', 'Jamaah memenuhi masjid');
  await page.fill('[name="d_tempat"]', 'Masjid Jami’ Al Huda');
  await page.click('button:has-text("Simpan")');
  await page.waitForURL(/\/portal\/k\/galeri\/gale_/);
  ok((await page.locator('.p-kilat-ok').innerText()).includes('Tersimpan'), 'album galeri dengan 2 foto tersimpan (foto dikecilkan di perangkat)');
  await page.goto(BASE + '/portal/k/video/baru');
  await page.fill('[name="judul"]', 'Kajian Subuh Ahad');
  await page.fill('[name="d_url"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  await page.selectOption('[name="unit"]', 'yayasan');
  await page.click('button:has-text("Simpan")');
  await page.waitForURL(/\/portal\/k\/video\/vide_/);
  ok(true, 'video YouTube tersimpan');
  await page.goto(BASE + '/portal/situs');
  await page.check('[name="liveAktif"]');
  await page.fill('[name="liveUrl"]', 'https://www.youtube.com/live/dQw4w9WgXcQ');
  await page.fill('[name="liveJudul"]', 'Pengajian Akbar Malam Ini');
  await page.click('button:has-text("Simpan pengaturan")');
  await page.waitForURL(/ok=simpan/);
  ok(true, 'pengaturan situs: siaran langsung dinyalakan');
  await ctx.close();
}
ok(papanAcak.length === 2 && papanAcak[0] !== papanAcak[1], 'letak angka berubah setiap kali papan muncul', papanAcak.join(' vs '));

/* ── 3. admin lembaga: masuk dari daftar akun, wajib ganti PIN, hanya lembaganya ── */
{
  const pins = Object.fromEntries(JSON.parse(fs.readFileSync(`${OUT}/pin-uji.json`, 'utf8')));
  const { ctx, page } = await buka({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(BASE + '/masuk');
  const opsi = await page.$$eval('[data-pin-akun] option', (os) => os.map((o) => o.textContent));
  ok(opsi.includes('Admin MI Al Huda') && opsi.includes('Super Admin'), 'daftar akun berisi akun yayasan dan per lembaga');
  await page.selectOption('[data-pin-akun]', { label: 'Admin MI Al Huda' });
  const salah = pins['Admin MI Al Huda'] === '13579' ? '97531' : '13579';
  await ketukPin(page, salah);
  await page.waitForLoadState('load');
  ok((await page.locator('.p-kilat-galat').innerText()).includes('PIN salah'), 'PIN salah ditolak dan sisa percobaan disebutkan');
  ok((await page.locator('[data-pin-akun]').inputValue()) !== '', 'akun tetap terpilih setelah PIN salah');
  await page.screenshot({ path: `${OUT}/masuk-ponsel.png` });
  await ketukPin(page, pins['Admin MI Al Huda']);
  await page.waitForURL(/\/portal\/akun$/);
  ok(true, 'PIN sementara benar → wajib membuat PIN sendiri');
  await ketukPin(page, '11111'); await ketukPin(page, '11111');
  await page.waitForURL(/g=lemah/);
  ok(true, 'PIN lemah (11111) ditolak');
  await ketukPin(page, '40917'); await ketukPin(page, '40917');
  await page.waitForURL(/\/portal\?ok=pin/);
  ok(true, 'PIN baru tersimpan');
  await page.goto(BASE + '/portal/lembaga/ra-al-huda');
  ok((await page.locator('h1').innerText()) === 'Tidak diizinkan', 'admin MI tidak bisa menyunting profil RA');
  await page.goto(BASE + '/portal/situs');
  ok((await page.locator('h1').innerText()) === 'Tidak diizinkan', 'admin lembaga tidak bisa membuka pengaturan situs');
  await page.goto(BASE + '/portal/k/kabar/baru');
  const unitOpsi = await page.$$eval('[name="unit"] option', (os) => os.map((o) => o.value));
  ok(unitOpsi.length === 1 && unitOpsi[0] === 'mi-al-huda', 'formulir kabar hanya menawarkan lembaganya sendiri', unitOpsi.join(','));
  await page.fill('[name="judul"]', 'Santri MI Al Huda Juara Tahfidz Kecamatan');
  await page.selectOption('[name="d_kategori"]', 'prestasi');
  await page.fill('[name="d_ringkasan"]', 'Tiga santri kelas 5 meraih juara tahfidz juz 30 tingkat Kecamatan Sukakarya.');
  await page.fill('[name="d_isi"]', '## Juara tahfidz\n\nAlhamdulillah, tiga santri kelas 5 meraih juara.\n\n::ar إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ\n\n- Juara 1\n- Juara 2');
  await page.click('button:has-text("Simpan")');
  await page.waitForURL(/\/portal\/k\/kabar\/kaba_/);
  ok(true, 'admin MI menulis kabar');
  // PPDB 2027/2028 untuk MI, dibuka hari ini
  const kini = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
  await page.goto(BASE + '/portal/k/ppdb/baru');
  await page.fill('[name="judul"]', 'PPDB MI Al Huda 2027/2028');
  await page.fill('[name="d_tahun"]', '2027/2028');
  await page.fill('[name="d_buka"]', kini);
  await page.fill('[name="d_tutup"]', '2027-07-15');
  await page.fill('[name="d_kuota"]', '56');
  await page.fill('[name="d_ringkasan"]', 'Pendaftaran murid baru kelas 1 MI Al Huda tahun ajaran 2027/2028.');
  await page.fill('[name="d_syarat"]', 'Usia minimal 6 tahun pada Juli 2027\nFotokopi akta kelahiran\nFotokopi kartu keluarga');
  await page.fill('[name="d_alur"]', 'Isi formulir di situs\nVerifikasi berkas di sekretariat\nPengumuman');
  await page.click('button:has-text("Simpan")');
  await page.waitForURL(/\/portal\/k\/ppdb\/ppdb_/);
  ok(true, 'admin MI membuka PPDB 2027/2028');
  await ctx.close();
}

/* ── 4. publik: kabar, galeri + lightbox, video + pita LIVE, PPDB + formulir, struktur, kontak ── */
{
  const { ctx, page } = await buka();
  await page.goto(BASE + '/');
  ok(await page.locator('.pita-live').isVisible(), 'pita LIVE tampil di seluruh situs');
  ok(await page.locator('.kartu-isi', { hasText: 'Juara Tahfidz' }).isVisible() && await page.locator('.kartu-ppdb', { hasText: '2027/2028' }).first().isVisible(), 'beranda menampilkan kabar terbaru dan PPDB yang dibuka');
  await page.goto(BASE + '/kabar');
  await page.click('text=Santri MI Al Huda Juara Tahfidz Kecamatan');
  ok(await page.locator('.prosa p.arab[lang="ar"]').isVisible(), 'baris ::ar tampil sebagai teks Arab (lang="ar") di kabar');
  ok(await page.locator('[data-dengar-putar]').isVisible(), 'kabar punya tombol Dengarkan');
  await page.goto(BASE + '/galeri');
  await page.click('.kartu-album');
  await page.click('.foto-butir >> nth=0');
  ok(await page.locator('.lightbox').isVisible() && (await page.locator('.lb-hitung').innerText()) === '1 / 2', 'galeri: foto terbuka besar, 1 dari 2');
  await page.keyboard.press('ArrowRight');
  ok((await page.locator('.lb-hitung').innerText()) === '2 / 2', 'galeri: panah kanan ke foto berikutnya');
  await page.keyboard.press('Escape');
  await page.goto(BASE + '/video');
  ok((await page.locator('.live-utama .pemutar').count()) === 1 && (await page.locator('.kartu-video').count()) >= 1, 'halaman video: siaran langsung + video kegiatan');
  await page.click('.live-utama .pemutar-putar');
  ok((await page.locator('.live-utama iframe[src*="youtube-nocookie.com/embed/dQw4w9WgXcQ"]').count()) === 1, 'pemutar YouTube baru dimuat setelah ditekan');
  await page.goto(BASE + '/lembaga/mi-al-huda');
  ok(await page.locator('#struktur .kartu-orang', { hasText: 'Fadli Robbi' }).isVisible(), 'halaman MI menampilkan struktur (kepala madrasah)');
  ok(await page.locator('.bagian-ppdb .kartu-ppdb').isVisible(), 'halaman MI menampilkan PPDB yang dibuka');
  await page.goto(BASE + '/ppdb');
  await page.click('.kartu-ppdb >> nth=0');
  await page.fill('[name="nama"]', 'Ahmad Fauzan');
  await page.selectOption('[name="d_kelamin"]', 'L');
  await page.fill('[name="d_tempatLahir"]', 'Bekasi');
  await page.fill('[name="d_tanggalLahir"]', '2021-03-14');
  await page.fill('[name="d_wali"]', 'Bapak Uji');
  await page.fill('[name="d_telepon"]', '0812 0000 0000');
  await page.fill('[name="d_alamat"]', 'Kp. Kuda-kuda, Sukakarya');
  await page.click('button:has-text("Kirim pendaftaran")');
  await page.waitForLoadState('load');
  ok((await page.locator('.terkirim').innerText()).includes('Pendaftaran terkirim'), 'calon murid mendaftar lewat formulir PPDB');
  await page.screenshot({ path: `${OUT}/ppdb-terkirim.png`, fullPage: false });
  await page.goto(BASE + '/struktur');
  ok((await page.locator('.kartu-orang').count()) >= 14 && await page.locator('.kartu-orang', { hasText: 'H. Moh. Hilwani' }).isVisible(), 'struktur: pendiri, pembina, pengurus, pengawas, dan kepala MI');
  await page.goto(BASE + '/profil/pendiri');
  ok((await page.locator('.kartu-orang').count()) === 6, 'halaman pendiri: 6 pendiri');
  await page.goto(BASE + '/kontak');
  await page.fill('#tulis [name="nama"]', 'Warga Uji');
  await page.fill('#tulis [name="kontak"]', '0812 1111 2222');
  await page.selectOption('#tulis [name="unit"]', 'mi-al-huda');
  await page.fill('#tulis [name="isi"]', 'Assalamu’alaikum, kapan pendaftaran gelombang kedua?');
  await page.click('button:has-text("Kirim pesan")');
  await page.waitForURL(/pesan=terkirim/);
  ok((await page.locator('#tulis .p-kilat-ok').count()) === 1, 'pesan kontak terkirim');
  await ctx.close();
}

/* ── 5. admin MI melihat pendaftar dan pesan untuk lembaganya ── */
{
  const { ctx, page } = await buka();
  await page.goto(BASE + '/masuk');
  await page.selectOption('[data-pin-akun]', { label: 'Admin MI Al Huda' });
  await ketukPin(page, '40917');
  await page.waitForURL(/\/portal$/);
  ok((await page.locator('.p-sorot', { hasText: 'pendaftar PPDB baru' }).count()) === 1 && (await page.locator('.p-sorot', { hasText: 'pesan masuk' }).count()) === 1, 'dasbor admin MI: 1 pendaftar baru dan 1 pesan');
  await page.goto(BASE + '/portal/k/pendaftar');
  ok(await page.locator('td', { hasText: 'Ahmad Fauzan' }).isVisible(), 'pendaftar tampil di portal lembaganya');
  const [unduh] = await Promise.all([page.waitForEvent('download'), page.click('text=Unduh CSV')]);
  const csv = fs.readFileSync(await unduh.path(), 'utf8');
  ok(csv.includes('Ahmad Fauzan') && csv.includes('Bapak Uji'), 'pendaftar bisa diunduh sebagai CSV');
  await page.screenshot({ path: `${OUT}/portal-pendaftar.png` });
  await ctx.close();
}

await browser.close();
ok(galat.length === 0, 'tanpa galat konsol / HTTP 5xx', galat.join(' | '));
const gagal = hasil.filter((x) => !x).length;
console.log(`\n${hasil.length - gagal}/${hasil.length} lulus`);
process.exit(gagal ? 1 : 0);
