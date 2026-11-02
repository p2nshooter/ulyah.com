/** Laporan contoh (data rekaan) — sama dengan contoh di blueprint bagian K. */
import type { ReportDetail, ReportSummary } from '../engine/cascade.ts';

const P = [
  'Minggu lalu adik saya yang masih kelas 8 menunjukkan pesan berantai tentang beras plastik. Ia percaya karena pesannya diteruskan oleh tiga grup keluarga sekaligus. Saya baru sadar, kami sering menganggap sesuatu benar hanya karena banyak orang membagikannya.',
  'Di sekolah kami, hampir semua murid punya ponsel sendiri. Survei kecil OSIS pada Agustus 2026 menemukan 41 dari 60 siswa pernah membagikan berita tanpa membuka tautannya. Angka itu membuat saya kaget, karena kami juga yang paling sering mengejek orang tua soal hoaks.',
  'Masalahnya bukan kurang pintar, tetapi kurang kebiasaan. Memeriksa sumber butuh waktu satu menit, sedangkan menekan tombol bagikan hanya satu detik. Kalau kebiasaan memeriksa tidak dilatih, kecepatan akan selalu menang.',
  'Di era digital yang terus berkembang ini, literasi digital memainkan peran yang sangat penting dalam kehidupan generasi muda. Selain itu, kemampuan memilah informasi tidak hanya membantu individu, tetapi juga berkontribusi pada terciptanya masyarakat yang lebih kritis. Waktu kelas kami membuat mading tentang hoaks banjir di Bekasi, ternyata separuh teman saya pernah ikut menyebarkannya.',
  'Karena itu saya mengusulkan piket cek fakta bergilir di setiap kelas setiap Senin. Dua siswa memilih satu kabar yang ramai di grup, lalu memeriksanya lewat situs cek fakta dan berita resmi. Hasilnya ditempel di mading dan dibagikan ke grup kelas.',
  'Benteng pertama melawan hoaks adalah kebiasaan memeriksa sumber. Kalau kebiasaan itu tumbuh di kelas, ia akan terbawa ke rumah, ke grup keluarga, dan ke adik-adik kita.',
];

const split = (p: string) => p.match(/[^.!?]+[.!?]+/g)!.map((x) => x.trim());

const sentences: ReportDetail['sentences'] = [];
P.forEach((p, par) => {
  split(p).forEach((t) => {
    const i = sentences.length;
    let pr = 0.05 + ((i * 37) % 9) / 100;
    let cls: 'ai' | 'mix' | 'hum' = 'hum';
    let r: string[] = ['personal_detail'];
    if (par === 3 && t.startsWith('Di era')) { pr = 0.86; cls = 'ai'; r = ['generic_claim', 'ai_phrase', 'uniform_rhythm']; }
    else if (par === 3 && t.startsWith('Selain')) { pr = 0.71; cls = 'mix'; r = ['signposting', 'no_specific_detail']; }
    else if (par === 1) r = ['local_reference'];
    else if (par === 2) r = ['uneven_rhythm'];
    sentences.push({ i, par, text: t, p: pr, cls, r, excluded: false });
  });
});

export const SAMPLE_DETAIL: ReportDetail = {
  paragraphs: P.map((text, i) => ({ i, kind: 'body', text })),
  sentences,
  styleNote: 'Sebagian besar naskah memuat pengalaman nyata, data sekolah, dan ritme yang tidak seragam; paragraf 4 dibuka dengan kalimat umum yang khas tulisan AI.',
  rubric: {
    aspects: [
      { key: 'tema', level: 4, reason: 'Judul dan semua paragraf membahas literasi digital melawan hoaks; tidak ada penyimpangan.', evidence: 'Benteng pertama melawan hoaks adalah kebiasaan memeriksa sumber.', evidenceOk: true, tip: 'Pertahankan fokus ini pada bagian penutup.', by: 'haiku' },
      { key: 'sistematika', level: 3, reason: 'Unsur lengkap; transisi dari paragraf 3 ke 4 kurang halus.', evidence: 'Di era digital yang terus berkembang ini, literasi digital memainkan peran', evidenceOk: true, tip: 'Hubungkan data di paragraf 2 dengan usulan di paragraf 5.', by: 'sonnet' },
      { key: 'gagasan', level: 4, reason: 'Akar masalah (kebiasaan, bukan kecerdasan) diurai; ada data dan contoh; solusi konkret.', evidence: 'saya mengusulkan piket cek fakta bergilir di setiap kelas setiap Senin', evidenceOk: true, tip: 'Tambahkan cara mengukur keberhasilan piket.', by: 'haiku' },
      { key: 'kejelasan', level: 3, reason: 'Argumen didukung bukti; paragraf 4 mengulang gagasan pendahuluan.', evidence: 'Memeriksa sumber butuh waktu satu menit', evidenceOk: true, tip: 'Ganti kalimat umum di paragraf 4 dengan contoh nyata.', by: 'haiku' },
      { key: 'bahasa', level: 3, reason: 'Bahasa komunikatif; 5 kesalahan (4,0 per 1.000 kata).', evidence: 'Hasilnya ditempel di mading dan dibagikan ke grup kelas.', evidenceOk: true, tip: 'Periksa imbuhan di- dan koma setelah ungkapan penghubung.', by: 'haiku' },
    ],
    errors: [
      { wrong: 'di jelaskan', right: 'dijelaskan', type: 'spelling' },
      { wrong: 'hoax', right: 'hoaks', type: 'spelling' },
      { wrong: 'dll', right: 'dll.', type: 'punctuation' },
      { wrong: 'Akan tetapi mereka', right: 'Akan tetapi, mereka', type: 'punctuation' },
      { wrong: 'para siswa-siswa', right: 'para siswa', type: 'grammar' },
    ],
  },
};

export const SAMPLE_SUMMARY: ReportSummary = {
  id: 'rpt_CONTOH000000000001',
  checkId: 'chk_CONTOH',
  uid: 'contoh',
  createdAt: Date.UTC(2026, 10, 2, 7, 5),
  title: 'Literasi Digital sebagai Benteng Generasi Muda dari Hoaks',
  author: 'Peserta 01 (contoh)',
  genre: 'essay',
  level: 'senior_high',
  lang: 'id',
  reportLang: 'id',
  mode: 'auto',
  words: 1248,
  analyzedWords: 1184,
  excludedWords: 64,
  hash: '9f2c4b7de1a0c3f5b6a9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2918273a71e',
  comp: { ai: 4, mix: 11, hum: 85 },
  docP: 0.08,
  conf: { level: 'high', pm: 4 },
  label: 'human',
  signals: { stylo: 0.18, regen: 0.11, haikuA: 0.09, haikuB: 0.12, sonnet: 0.52, opus: null, traces: [] },
  path: { t2Pct: 14, t3Pct: 0, tiers: ['haiku', 'sonnet'] },
  paragraphs: [
    { i: 0, words: 182, p: 0.03, cls: 'hum', reasons: ['personal_detail', 'uneven_rhythm'] },
    { i: 1, words: 214, p: 0.06, cls: 'hum', reasons: ['local_reference'] },
    { i: 2, words: 236, p: 0.09, cls: 'hum', reasons: [] },
    { i: 3, words: 176, p: 0.58, cls: 'mix', reasons: ['generic_claim', 'signposting', 'uniform_rhythm'] },
    { i: 4, words: 228, p: 0.07, cls: 'hum', reasons: ['personal_detail'] },
    { i: 5, words: 148, p: 0.11, cls: 'hum', reasons: [] },
  ],
  flags: { injection: false, paraphrasePct: 0, invisible: 0 },
  similarity: { max: 6, withTitle: 'Peserta 07' },
  rubric: {
    id: 'lomba-esai',
    total: 86.25,
    category: 'excellent',
    aspects: [
      { key: 'tema', level: 4, value: 20, weight: 20 },
      { key: 'sistematika', level: 3, value: 15, weight: 20 },
      { key: 'gagasan', level: 4, value: 25, weight: 25 },
      { key: 'kejelasan', level: 3, value: 15, weight: 20 },
      { key: 'bahasa', level: 3, value: 11.25, weight: 15 },
    ],
    langErrors: 5,
    per1k: 4,
    verifiedBy: ['haiku', 'sonnet'],
  },
  verifyCode: '7Q4K-92XD',
  engine: { version: '1.0', calibration: 'awal-1', prompt: 'v1' },
  cost: 0.012,
  tokens: 58,
  samePrior: 0,
};
