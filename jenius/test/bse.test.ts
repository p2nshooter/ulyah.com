/* Pengonversi BSE (scripts/bse/convert.mjs) dengan teks berbentuk keluaran pdftotext. Run: npm test */
import { test } from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error — modul .mjs tanpa deklarasi tipe
import { hasPermission, findAuthors, segment } from '../scripts/bse/convert.mjs';

const para = (n: number, w = 'tanaman') => Array.from({ length: n }, (_, i) => `Kalimat ke-${i + 1} tentang ${w} yang tumbuh subur di kebun sekolah kami setiap hari.`).join(' ');
/** Membungkus teks menjadi baris ±70 karakter seperti pdftotext. */
const wrap = (t: string) => t.match(/.{1,70}(\s|$)/g)!.map((s) => s.trim());

function book(): string {
  const header = 'Ilmu Pengetahuan Alam SD Kelas 4';
  const pages: string[][] = [];
  pages.push(['ILMU PENGETAHUAN ALAM', 'Untuk SD/MI Kelas IV']);
  pages.push(['Hak Cipta pada Departemen Pendidikan Nasional', 'Dilindungi Undang-undang', '', 'Penulis', 'Siti Rahmawati', 'Budi Santoso', '', 'Editor', 'Rina', '',
    'Hak Cipta Buku ini dibeli oleh Departemen Pendidikan Nasional dari Penerbit.', 'Buku teks pelajaran ini dapat diunduh (down load), digandakan, dicetak,', 'dialihmediakan, atau difotokopi oleh masyarakat.']);
  pages.push(['Kata Pengantar', ...wrap(para(3, 'pengantar'))]);
  pages.push(['Daftar Isi', 'BAB I Tumbuhan Hijau ............ 1', 'BAB II Hewan di Sekitar Kita ............ 9', 'BAB III Air ............ 15']);
  const chapter = (label: string, title: string, n: number, w: string) => {
    const first = [header, label, title, '', 'A. Bagian-Bagian Tumbuhan', ...wrap(para(6, w)), '', ...wrap(para(5, w)), String(pages.length + 1)];
    pages.push(first);
    for (let i = 0; i < n; i += 1) pages.push([header, ...wrap(para(7, w)), '', 'B. Manfaat Tumbuh-', ...wrap(para(6, w)), String(pages.length + 1)]);
  };
  chapter('BAB I', 'TUMBUHAN HIJAU', 3, 'tumbuhan');
  chapter('BAB II', 'HEWAN DI SEKITAR KITA', 2, 'hewan');
  chapter('BAB III', 'AIR', 2, 'air');
  pages.push(['DAFTAR PUSTAKA', 'Anonim. 2007. Sains untuk Anak.']);
  pages.push(['GLOSARIUM', 'akar: bagian tumbuhan']);
  return pages.map((p) => p.join('\n')).join('\f');
}

test('izin BSE: kalimat „dialihmediakan“ wajib ada di halaman hak cipta', () => {
  assert.equal(hasPermission(book()), true);
  assert.equal(hasPermission('Hak Cipta pada Kementerian Pendidikan dan Kebudayaan\nDilindungi Undang-Undang\fMilik Negara Tidak Diperdagangkan'), false);
  assert.equal(hasPermission('Hak cipta buku ini dibeli oleh Departemen Pendidikan Nasional … dapat diunduh, digandakan, dicetak'), true);
});

test('penulis dari halaman hak cipta', () => {
  assert.equal(findAuthors(book()), 'Siti Rahmawati, Budi Santoso');
});

test('bab: halaman depan & daftar isi dilewati, kepala halaman & nomor dibuang, berhenti di daftar pustaka', () => {
  const { chapters, words } = segment(book());
  assert.deepEqual(chapters.map((c: { title: string }) => c.title), ['Bab I · Tumbuhan Hijau', 'Bab II · Hewan di Sekitar Kita', 'Bab III · Air']);
  const all = JSON.stringify(chapters);
  assert.ok(!all.includes('Ilmu Pengetahuan Alam SD Kelas 4'), 'kepala halaman berulang dibuang');
  assert.ok(!all.includes('Kalimat ke-1 tentang pengantar'), 'kata pengantar dilewati');
  assert.ok(!all.includes('DAFTAR PUSTAKA') && !all.includes('Glosarium') && !all.includes('akar: bagian'), 'bagian belakang dilewati');
  assert.ok(!/"text":"\d+"/.test(all), 'nomor halaman dibuang');
  assert.ok(words > 1500, `cukup panjang (${words} kata)`);
  const b = chapters[0].blocks as { t: string; text: string }[];
  assert.equal(b[0]!.t, 'h');
  assert.equal(b[0]!.text, 'A. Bagian-Bagian Tumbuhan');
  assert.ok(b.some((x) => x.t === 'p' && x.text.startsWith('Kalimat ke-1 tentang tumbuhan')));
  assert.ok(b.every((x) => x.text.length <= 1600));
});

test('tanpa penanda bab: dibagi per ±10 halaman setelah daftar isi', () => {
  const pages = ['Hak Cipta … dialihmediakan', 'Daftar Isi', ...Array.from({ length: 23 }, () => wrap(para(8, 'kebun')).join('\n'))];
  const { chapters } = segment(pages.join('\f'));
  assert.deepEqual(chapters.map((c: { title: string }) => c.title), ['Bagian 1', 'Bagian 2', 'Bagian 3']);
});

test('penggalan kata: imbuhan digabung, pengulangan tetap memakai tanda hubung', () => {
  const pages = ['x', 'BAB I PERTAMA\nKami menanam bi-\nbit di kebun. Anak-\nanak senang sekali melihat bunga yang mekar di pagi hari yang cerah ini.\n', 'BAB II KEDUA\nTeks kedua yang cukup panjang untuk menjadi paragraf sendiri di dalam bab ini.'];
  const { chapters } = segment(pages.join('\f'));
  const t = chapters[0].blocks.map((x: { text: string }) => x.text).join(' ');
  assert.match(t, /menanam bibit di kebun/);
  assert.match(t, /Anak-anak senang/);
});

test('penulis dari baris katalog (KDT) BSE', () => {
  const kdt = (line: string) => `Hak Cipta pada Departemen Pendidikan Nasional\nPenulis\n:\nEditor\n:\n${line}\fKata Sambutan … dialihmediakan`;
  assert.equal(findAuthors(kdt('Fisika 1 : Untuk SMA/MA Kelas X / Setya Nurachmandani ; Editor\nBudi Wahyono ; Ilustrator Haryana Humardani. — Jakarta : Pusat\nPerbukuan, Departemen Pendidikan Nasional, 2009.')), 'Setya Nurachmandani');
  assert.equal(findAuthors(kdt('Cakrawala Sejarah 1 : untuk SMA / MA Kelas XI / penulis, Wardaya ;\neditor, Sugiharti ; illustrator, Mulyanto . — Jakarta : Pusat Perbukuan,')), 'Wardaya');
  assert.equal(findAuthors(kdt('A.B.I. Asyiknya Belajar IPA : SD/MI kelas I/Sholehudin, Evi Susanti;\neditor ; Hanjaeli.\n— Jakarta: Pusat Perbukuan, Departemen Pendidikan Nasional, 2007.')), 'Sholehudin, Evi Susanti');
  assert.equal(findAuthors(kdt('Madrasah Tsanawiyah Kelas VII Edisi 4/Atik Wintarti,…[et. al.].--Jakarta:\nPusat Perbukuan, Departemen Pendidikan Nasional, 2008.')), 'Atik Wintarti, dkk.');
});

test('pembuka bab tanpa kata „Bab“ (Tujuan Pembelajaran) dan „Bab“ dengan nomor di baris berikutnya', () => {
  const body = (w: string) => wrap(para(8, w)).join('\n');
  const sejarah = ['Hak cipta … dialihmediakan', 'Daftar Isi\nPengantar Ilmu Sejarah ........ 1\nTradisi Sejarah ........ 23',
    'Pengantar Ilmu Sejarah\n\n1\n\nTujuan Pembelajaran\n1. Siswa mampu menjelaskan.\n' + body('sejarah'), body('sejarah'), body('sejarah'),
    'Tradisi Sejarah Masyarakat\nIndonesia Masa Praaksara\n\n2\n\nTujuan Pembelajaran\n1. Siswa mampu mengidentifikasi.\n' + body('tradisi'), 'Peta Konsep\n' + body('tradisi'), body('tradisi'), 'Daftar Pustaka\nBuku.'];
  const a = segment(sejarah.join('\f'));
  assert.deepEqual(a.chapters.map((c: { title: string }) => c.title), ['Bab 1 · Pengantar Ilmu Sejarah', 'Bab 2 · Tradisi Sejarah Masyarakat Indonesia Masa Praaksara']);
  const fisika = ['Hak cipta … dialihmediakan', 'Bab\nIV\nDinamika Partikel\n\nTujuan Pembelajaran\n• Anda dapat menerapkan hukum Newton.\n' + body('gaya'), body('gaya'), 'Bab\nV\nUsaha dan Energi\n' + body('energi'), body('energi')];
  const b = segment(fisika.join('\f'));
  assert.deepEqual(b.chapters.map((c: { title: string }) => c.title), ['Bab IV · Dinamika Partikel', 'Bab V · Usaha dan Energi']);
});

test('tanda air terpecah & daftar isi tidak menjadi bab; mutu teks dihitung', () => {
  const body = (w: string) => wrap(para(8, w)).join('\n');
  const pages = ['Hak cipta … dialihmediakan', 'Daftar Isi\nBab I Pengukuran\nBab II Gerak', 'Bab\nI\nPengukuran\n\nda li.c om\n' + body('ukur'), 'int on .co\n' + body('ukur'), 'Bab\nII\nGerak Lurus\nka rta .go .id\n' + body('gerak'), body('gerak')];
  const r = segment(pages.join('\f'));
  assert.deepEqual(r.chapters.map((c: { title: string }) => c.title), ['Bab I · Pengukuran', 'Bab II · Gerak Lurus']);
  assert.ok(!JSON.stringify(r.chapters).includes('li.c'), 'potongan tanda air dibuang');
  assert.ok(r.quality > 0.8, `mutu ${r.quality}`);
  // Teks berjarak huruf (k e g i a t a n) — hasil PDF yang rusak.
  const spaced = 'Ukuran a d a l a h k e g i a t a n m e m b a n d i n g k a n b e s a r a n';
  const junk = segment(['x', 'Bab I Satu\n' + Array.from({ length: 60 }, () => spaced).join('\n'), 'Bab II Dua\n' + Array.from({ length: 60 }, () => spaced).join('\n')].join('\f'));
  assert.ok(junk.quality < 0.55, `teks rusak bermutu rendah (${junk.quality})`);
});

test('buku tanpa „Bab“: „Pelajaran 1“ sebagai pembuka bab; ekor „— Cet.1“ dibuang dari penulis', () => {
  const body = (w: string) => wrap(para(8, w)).join('\n');
  const pages = ['Hak cipta … dialihmediakan', 'Pelajaran 1\nPeristiwa\n\n' + body('berita'), body('berita'), 'Pelajaran 2\nKegemaran\n\n' + body('hobi'), body('hobi')];
  assert.deepEqual(segment(pages.join('\f')).chapters.map((c: { title: string }) => c.title), ['Bab 1 · Peristiwa', 'Bab 2 · Kegemaran']);
  const kdt = 'Hak Cipta\nBahasa Indonesia, Bahasa Bangsaku : untuk Kelas VIII / Sarwiji Suwandi dan Sutarmo.— Cet.1 — Jakarta : Pusat Perbukuan, Departemen Pendidikan Nasional, 2008.';
  assert.equal(findAuthors(kdt), 'Sarwiji Suwandi dan Sutarmo');
});

test('jenjang & kelas dari PDF lebih dipercaya daripada indeks sumber', async () => {
  // @ts-expect-error — modul .mjs
  const { findLevel } = await import('../scripts/bse/convert.mjs');
  assert.deepEqual(findLevel('Hak Cipta\nIlmu Pengetahuan Alam 4\nUntuk SD/MI Kelas IV\nPenulis'), { level: 'sd', grade: 4 });
  assert.deepEqual(findLevel('Cakrawala Sejarah 1 : untuk SMA / MA Kelas X / penulis'), { level: 'sma', grade: 10 });
  assert.deepEqual(findLevel('Cerdas Belajar IPA untuk SMP/MTs Kelas VII'), { level: 'smp', grade: 7 });
  assert.deepEqual(findLevel('BUDIDAYA IKAN JILID 3 untuk SMK\nDirektorat Pembinaan Sekolah Menengah Kejuruan', 'Budidaya Ikan Jilid 3 Kelas 1 SD'), { level: 'smk', grade: 12 });
  assert.deepEqual(findLevel('Matematika untuk SMP Kelas 2'), { level: 'smp', grade: 8 }, 'urutan lama kelas 1–3');
  assert.equal(findLevel('tanpa keterangan jenjang'), null);
});
