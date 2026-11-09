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
