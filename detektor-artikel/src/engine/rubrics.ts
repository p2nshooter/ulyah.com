/**
 * Rubrik bawaan. "lomba-esai" disalin apa adanya dari lampiran pemilik
 * (Form penilaian peserta lomba menulis, 2 Nov 2026): 5 aspek, skor 1–4, nilai = skor/4 × bobot.
 */
import type { Lang } from '../lib/i18n.ts';

export interface Bi {
  id: string;
  en: string;
}

export interface Aspect {
  key: string;
  name: Bi;
  weight: number;
  desc: Bi;
  /** Deskripsi level 4..1 (indeks 0 = skor 4). */
  levels: [Bi, Bi, Bi, Bi];
  short?: [Bi, Bi, Bi, Bi];
  /** Aspek kebahasaan: skornya dibatasi jumlah kesalahan per 1.000 kata. */
  language?: boolean;
}

export interface Rubric {
  id: string;
  name: Bi;
  aspects: Aspect[];
}

const generic = (what: Bi): [Bi, Bi, Bi, Bi] => [
  { id: `Sangat baik: ${what.id} terpenuhi sepenuhnya, konsisten, dengan bukti yang jelas.`, en: `Excellent: ${what.en} fully met, consistent, clearly evidenced.` },
  { id: `Baik: ${what.id} sebagian besar terpenuhi, ada kekurangan kecil.`, en: `Good: ${what.en} mostly met, with minor gaps.` },
  { id: `Cukup: ${what.id} terpenuhi sebagian, kekurangannya jelas terlihat.`, en: `Fair: ${what.en} partly met, with clear gaps.` },
  { id: `Kurang: ${what.id} hampir tidak terpenuhi.`, en: `Weak: ${what.en} barely met.` },
];

const LANGUAGE_LEVELS: [Bi, Bi, Bi, Bi] = [
  { id: 'Bahasa baku dan efektif; kalimat jelas; sesuai kaidah (EYD V / tata bahasa Inggris); tanda baca tepat; 0–2 kesalahan kecil per 1.000 kata; format rapi.', en: 'Standard, effective language; clear sentences; follows the rules (EYD V / English grammar); correct punctuation; 0–2 minor errors per 1,000 words; tidy format.' },
  { id: 'Cukup baku dan komunikatif; 3–5 kesalahan per 1.000 kata; format cukup rapi.', en: 'Fairly standard and communicative; 3–5 errors per 1,000 words; fairly tidy format.' },
  { id: 'Kurang efektif; 6–10 kesalahan per 1.000 kata; beberapa kalimat sulit dipahami.', en: 'Not very effective; 6–10 errors per 1,000 words; some sentences hard to follow.' },
  { id: 'Tidak baku dan sulit dipahami; lebih dari 10 kesalahan per 1.000 kata.', en: 'Non-standard and hard to follow; more than 10 errors per 1,000 words.' },
];

function asp(key: string, idName: string, enName: string, weight: number, idDesc: string, enDesc: string, language = false): Aspect {
  const desc = { id: idDesc, en: enDesc };
  return { key, name: { id: idName, en: enName }, weight, desc, levels: language ? LANGUAGE_LEVELS : generic(desc), language };
}

export const LOMBA_ESAI: Rubric = {
  id: 'lomba-esai',
  name: { id: 'Lomba Menulis Esai (form pemilik)', en: 'Essay Writing Competition (owner form)' },
  aspects: [
    {
      key: 'tema',
      name: { id: 'Kesesuaian Tema', en: 'Theme relevance' },
      weight: 20,
      desc: { id: 'Kemampuan memahami, menginterpretasikan, dan mengembangkan tema lomba ke dalam tulisan.', en: 'Ability to understand, interpret and develop the competition theme in writing.' },
      levels: [
        { id: 'Judul relevan dengan tema; pembahasan sejak pendahuluan sampai penutup konsisten membahas tema; seluruh gagasan utama berkaitan langsung dengan tema; tidak ditemukan penyimpangan pembahasan.', en: 'Title relevant to the theme; the discussion stays on theme from introduction to conclusion; every main idea relates directly to the theme; no digressions.' },
        { id: 'Judul relevan; sebagian besar pembahasan sesuai tema; terdapat 1–2 bagian yang kurang fokus, tetapi tidak mengubah arah utama tulisan.', en: 'Title relevant; most of the discussion fits the theme; 1–2 parts lose focus without changing the main direction.' },
        { id: 'Judul cukup berkaitan dengan tema; hanya sebagian pembahasan yang relevan; terdapat beberapa paragraf yang menyimpang dari fokus tema.', en: 'Title loosely related; only part of the discussion is relevant; several paragraphs stray from the theme.' },
        { id: 'Judul tidak menggambarkan tema; sebagian besar isi tidak relevan; tulisan hanya sedikit menyinggung tema lomba.', en: 'Title does not reflect the theme; most content irrelevant; barely touches the theme.' },
      ],
      short: [
        { id: 'Sangat relevan dan konsisten', en: 'Highly relevant and consistent' },
        { id: 'Relevan, sedikit kurang fokus', en: 'Relevant, slightly unfocused' },
        { id: 'Sebagian relevan', en: 'Partly relevant' },
        { id: 'Tidak relevan', en: 'Not relevant' },
      ],
    },
    {
      key: 'sistematika',
      name: { id: 'Sistematika Penulisan', en: 'Structure' },
      weight: 20,
      desc: { id: 'Kelengkapan struktur, keteraturan alur, dan keterkaitan antarbagian esai.', en: 'Completeness of structure, orderly flow and links between parts.' },
      levels: [
        { id: 'Memiliki 4 unsur lengkap: judul, pendahuluan, pembahasan, dan penutup; pendahuluan memuat latar belakang dan permasalahan; pembahasan tersusun dalam paragraf yang runtut; penutup memuat kesimpulan dan rekomendasi; terdapat hubungan logis antarbagian.', en: 'All 4 parts present: title, introduction, discussion and conclusion; introduction gives background and the problem; orderly paragraphs; conclusion with summary and recommendations; logical links between parts.' },
        { id: 'Memiliki seluruh unsur utama; pendahuluan dan pembahasan cukup jelas; penutup tersedia; terdapat sedikit kelemahan dalam urutan paragraf atau transisi antarbagian.', en: 'All main parts present; introduction and discussion fairly clear; conclusion exists; minor weaknesses in paragraph order or transitions.' },
        { id: 'Salah satu unsur utama kurang lengkap; pendahuluan kurang menjelaskan masalah; pembahasan kurang runtut; penutup hanya berupa pengulangan isi.', en: 'One main part incomplete; introduction barely explains the problem; disorderly discussion; conclusion only repeats content.' },
        { id: 'Dua atau lebih unsur utama tidak tersedia atau tidak jelas; paragraf tidak tersusun secara sistematis; tidak terdapat alur pembahasan yang dapat diikuti.', en: 'Two or more main parts missing or unclear; unsystematic paragraphs; no discussion flow to follow.' },
      ],
      short: [
        { id: 'Struktur lengkap dan runtut', en: 'Complete and orderly' },
        { id: 'Lengkap, sedikit kurang runtut', en: 'Complete, slightly out of order' },
        { id: 'Kurang lengkap', en: 'Incomplete' },
        { id: 'Tidak sistematis', en: 'Unsystematic' },
      ],
    },
    {
      key: 'gagasan',
      name: { id: 'Kedalaman Gagasan', en: 'Depth of ideas' },
      weight: 25,
      desc: { id: 'Kualitas pemikiran dan kemampuan mengembangkan ide (bobot tertinggi).', en: 'Quality of thought and ability to develop ideas (highest weight).' },
      levels: [
        { id: 'Menampilkan gagasan orisinal dan kreatif; mampu mengidentifikasi akar permasalahan; memberikan analisis mendalam; menyertakan minimal 2 contoh, fakta, atau data yang relevan; menawarkan solusi yang konkret, logis, dan dapat diterapkan.', en: 'Original, creative ideas; identifies root causes; deep analysis; at least 2 relevant examples, facts or data; concrete, logical, workable solutions.' },
        { id: 'Gagasan cukup orisinal; mampu menjelaskan permasalahan; terdapat analisis yang relevan; menyertakan minimal 1 contoh atau fakta pendukung; memberikan solusi yang cukup jelas.', en: 'Fairly original ideas; explains the problem; relevant analysis; at least 1 supporting example or fact; fairly clear solution.' },
        { id: 'Gagasan masih umum; pembahasan lebih banyak berupa deskripsi daripada analisis; contoh atau fakta kurang relevan; solusi masih bersifat umum dan belum operasional.', en: 'Generic ideas; more description than analysis; examples barely relevant; generic, non-actionable solutions.' },
        { id: 'Gagasan tidak berkembang; tidak mampu menjelaskan akar masalah; hampir tidak terdapat analisis atau contoh pendukung; tidak menawarkan solusi yang jelas.', en: 'Undeveloped ideas; cannot explain the root problem; almost no analysis or examples; no clear solution.' },
      ],
      short: [
        { id: 'Orisinal, analitis, berbukti, solutif', en: 'Original, analytical, evidenced, solution-focused' },
        { id: 'Cukup analitis dan solutif', en: 'Fairly analytical and solution-focused' },
        { id: 'Analisis terbatas', en: 'Limited analysis' },
        { id: 'Dangkal dan tidak berkembang', en: 'Shallow, undeveloped' },
      ],
    },
    {
      key: 'kejelasan',
      name: { id: 'Kejelasan Isi', en: 'Clarity of content' },
      weight: 20,
      desc: { id: 'Kemampuan menyampaikan ide secara jelas, logis, dan dapat dipertanggungjawabkan.', en: 'Ability to present ideas clearly, logically and accountably.' },
      levels: [
        { id: 'Gagasan utama mudah ditemukan; setiap argumen disertai alasan atau bukti; hubungan sebab-akibat dijelaskan secara logis; antarparagraf saling berkaitan; kesimpulan menjawab permasalahan yang dibahas.', en: 'Main idea easy to find; every argument has a reason or evidence; cause and effect explained logically; paragraphs connect; the conclusion answers the problem.' },
        { id: 'Gagasan utama cukup jelas; sebagian besar argumen memiliki alasan pendukung; alur pemikiran logis; terdapat sedikit pengulangan atau penjelasan yang kurang kuat.', en: 'Main idea fairly clear; most arguments supported; logical flow; some repetition or weaker explanations.' },
        { id: 'Gagasan utama kurang tegas; beberapa argumen tidak memiliki bukti; hubungan antarparagraf kurang kuat; terdapat pengulangan dan pernyataan yang membingungkan.', en: 'Main idea not firm; some arguments lack evidence; weak links; repetition and confusing statements.' },
        { id: 'Gagasan utama tidak jelas; argumentasi tidak didukung alasan; terdapat pertentangan antarpernyataan; isi sulit dipahami dan kesimpulan tidak sesuai pembahasan.', en: 'Main idea unclear; unsupported arguments; contradictions; hard to follow and the conclusion does not fit.' },
      ],
      short: [
        { id: 'Sangat jelas, logis, dan argumentatif', en: 'Very clear, logical, well argued' },
        { id: 'Jelas dan cukup logis', en: 'Clear and fairly logical' },
        { id: 'Kurang jelas', en: 'Unclear in places' },
        { id: 'Tidak jelas', en: 'Unclear' },
      ],
    },
    {
      key: 'bahasa',
      name: { id: 'Kualitas Tulisan', en: 'Writing quality' },
      weight: 15,
      desc: { id: 'Penggunaan bahasa yang baik dan benar serta teknik penulisan yang rapi.', en: 'Correct, good use of the language and tidy writing technique.' },
      language: true,
      levels: [
        { id: 'Menggunakan bahasa baku dan efektif; kalimat jelas dan komunikatif; sesuai kaidah EYD V; penggunaan tanda baca tepat; tidak ditemukan atau hanya terdapat 1–2 kesalahan kecil; format tulisan rapi dan konsisten.', en: 'Standard, effective language; clear, communicative sentences; follows EYD V (or English grammar); correct punctuation; no or only 1–2 minor errors; tidy, consistent format.' },
        { id: 'Bahasa cukup baku dan komunikatif; terdapat 3–5 kesalahan ejaan, tanda baca, atau tata bahasa; format tulisan cukup rapi.', en: 'Fairly standard and communicative; 3–5 spelling, punctuation or grammar errors; fairly tidy format.' },
        { id: 'Penggunaan bahasa kurang efektif; terdapat 6–10 kesalahan ejaan, tanda baca, atau tata bahasa; beberapa kalimat sulit dipahami; format kurang konsisten.', en: 'Not very effective; 6–10 spelling, punctuation or grammar errors; some sentences hard to understand; inconsistent format.' },
        { id: 'Bahasa tidak baku dan sulit dipahami; terdapat lebih dari 10 kesalahan penulisan; banyak kalimat tidak efektif; format tulisan tidak rapi.', en: 'Non-standard and hard to understand; more than 10 errors; many ineffective sentences; untidy format.' },
      ],
      short: [
        { id: 'Bahasa efektif, hampir tanpa kesalahan', en: 'Effective, almost error-free' },
        { id: 'Sedikit kesalahan', en: 'Few errors' },
        { id: 'Banyak kekurangan', en: 'Many weaknesses' },
        { id: 'Sulit dipahami', en: 'Hard to understand' },
      ],
    },
  ],
};

export const RUBRICS: Rubric[] = [
  LOMBA_ESAI,
  {
    id: 'esai-umum',
    name: { id: 'Tugas esai sekolah (umum)', en: 'School essay (general)' },
    aspects: [
      asp('isi', 'Isi', 'Content', 30, 'isi relevan, benar, dan lengkap', 'relevant, correct and complete content'),
      asp('struktur', 'Struktur', 'Structure', 20, 'pendahuluan, isi, penutup yang runtut', 'orderly introduction, body and conclusion'),
      asp('argumen', 'Argumen', 'Argument', 20, 'argumen beralasan dan berbukti', 'reasoned, evidenced arguments'),
      asp('bahasa', 'Bahasa', 'Language', 20, 'bahasa baku, efektif, dan rapi', 'standard, effective, tidy language', true),
      asp('orisinalitas', 'Orisinalitas', 'Originality', 10, 'sudut pandang dan contoh milik penulis sendiri', "the writer's own perspective and examples"),
    ],
  },
  {
    id: 'makalah',
    name: { id: 'Makalah / karya ilmiah mahasiswa', en: 'University paper' },
    aspects: [
      asp('masalah', 'Rumusan masalah', 'Problem statement', 15, 'rumusan masalah yang jelas dan terukur', 'a clear, measurable problem statement'),
      asp('pustaka', 'Kajian pustaka & sitasi', 'Literature & citations', 20, 'kajian pustaka relevan dengan sitasi yang benar', 'relevant literature with correct citations'),
      asp('analisis', 'Analisis', 'Analysis', 25, 'analisis yang tajam dan didukung data', 'sharp, data-backed analysis'),
      asp('pembahasan', 'Pembahasan', 'Discussion', 20, 'pembahasan yang menjawab rumusan masalah', 'a discussion that answers the problem'),
      asp('kesimpulan', 'Kesimpulan', 'Conclusion', 10, 'kesimpulan yang sesuai temuan', 'a conclusion that fits the findings'),
      asp('bahasa', 'Bahasa & format', 'Language & format', 10, 'bahasa akademik dan format rapi', 'academic language and tidy format', true),
    ],
  },
  {
    id: 'skripsi',
    name: { id: 'Skripsi / tesis per bab', en: 'Thesis, per chapter' },
    aspects: [
      asp('latar', 'Latar belakang', 'Background', 20, 'latar belakang yang kuat dan berbasis data', 'a strong, data-based background'),
      asp('kebaruan', 'Kebaruan', 'Novelty', 20, 'kebaruan dan posisi penelitian yang jelas', 'clear novelty and research positioning'),
      asp('konsistensi', 'Konsistensi antarbab', 'Cross-chapter consistency', 20, 'konsistensi istilah, tujuan, dan metode', 'consistent terms, aims and methods'),
      asp('sitasi', 'Sitasi', 'Citations', 20, 'sitasi lengkap, mutakhir, dan benar', 'complete, current, correct citations'),
      asp('bahasa', 'Bahasa akademik', 'Academic language', 20, 'bahasa akademik yang baku', 'standard academic language', true),
    ],
  },
  {
    id: 'berita',
    name: { id: 'Artikel berita', en: 'News article' },
    aspects: [
      asp('nilai', 'Nilai berita', 'News value', 20, 'nilai berita yang jelas', 'clear news value'),
      asp('5w1h', '5W1H', '5W1H', 25, 'unsur 5W1H lengkap', 'complete 5W1H elements'),
      asp('akurasi', 'Akurasi & sumber', 'Accuracy & sources', 25, 'fakta akurat dengan sumber yang disebut', 'accurate facts with named sources'),
      asp('piramida', 'Piramida terbalik', 'Inverted pyramid', 15, 'informasi terpenting di awal', 'most important information first'),
      asp('bahasa', 'Bahasa jurnalistik', 'Journalistic language', 15, 'bahasa jurnalistik yang lugas', 'plain journalistic language', true),
    ],
  },
  {
    id: 'opini',
    name: { id: 'Artikel opini', en: 'Opinion piece' },
    aspects: [
      asp('tesis', 'Tesis', 'Thesis', 25, 'pendapat utama yang tegas', 'a firm main position'),
      asp('argumen', 'Argumentasi', 'Argument', 25, 'argumentasi yang runtut dan meyakinkan', 'orderly, persuasive argument'),
      asp('bukti', 'Bukti', 'Evidence', 20, 'bukti dan contoh yang relevan', 'relevant evidence and examples'),
      asp('gaya', 'Gaya', 'Style', 15, 'gaya yang hidup dan khas', 'a lively, distinctive style'),
      asp('bahasa', 'Bahasa', 'Language', 15, 'bahasa yang baku dan efektif', 'standard, effective language', true),
    ],
  },
  {
    id: 'seo',
    name: { id: 'Artikel SEO / blog', en: 'SEO / blog article' },
    aspects: [
      asp('intent', 'Kesesuaian maksud pencarian', 'Search-intent fit', 25, 'menjawab maksud pembaca', "answers the reader's intent"),
      asp('manfaat', 'Kedalaman & manfaat', 'Depth & usefulness', 25, 'isi yang dalam dan benar-benar berguna', 'deep, genuinely useful content'),
      asp('struktur', 'Struktur & keterbacaan', 'Structure & readability', 20, 'subjudul, paragraf pendek, mudah dipindai', 'headings, short paragraphs, easy to scan'),
      asp('pengalaman', 'Pengalaman & sumber', 'Experience & sources', 15, 'pengalaman nyata dan sumber tepercaya', 'real experience and trustworthy sources'),
      asp('bahasa', 'Bahasa', 'Language', 15, 'bahasa yang baku dan efektif', 'standard, effective language', true),
    ],
  },
  {
    id: 'cerpen',
    name: { id: 'Cerpen', en: 'Short story' },
    aspects: [
      asp('tema', 'Tema & amanat', 'Theme & message', 20, 'tema dan amanat yang kuat', 'a strong theme and message'),
      asp('alur', 'Alur', 'Plot', 20, 'alur yang utuh dan menarik', 'a complete, engaging plot'),
      asp('tokoh', 'Tokoh', 'Characters', 20, 'tokoh yang hidup dan berkembang', 'living, developing characters'),
      asp('latar', 'Latar & suasana', 'Setting & mood', 15, 'latar dan suasana yang terasa', 'a vivid setting and mood'),
      asp('bahasa', 'Bahasa & gaya', 'Language & style', 25, 'bahasa yang indah dan tepat', 'beautiful, precise language', true),
    ],
  },
  {
    id: 'beasiswa',
    name: { id: 'Esai beasiswa / motivasi', en: 'Scholarship / motivation essay' },
    aspects: [
      asp('tujuan', 'Kejelasan tujuan', 'Clarity of goals', 25, 'tujuan yang jelas dan spesifik', 'clear, specific goals'),
      asp('bukti', 'Bukti diri', 'Evidence of self', 25, 'bukti prestasi dan pengalaman yang nyata', 'real evidence of achievement and experience'),
      asp('kesesuaian', 'Kesesuaian program', 'Programme fit', 20, 'kesesuaian dengan program yang dilamar', 'fit with the programme applied for'),
      asp('struktur', 'Struktur', 'Structure', 15, 'struktur yang runtut', 'an orderly structure'),
      asp('bahasa', 'Bahasa', 'Language', 15, 'bahasa yang baku dan efektif', 'standard, effective language', true),
    ],
  },
  {
    id: 'english-essay',
    name: { id: 'English academic essay', en: 'English academic essay' },
    aspects: [
      asp('task', 'Tanggapan tugas', 'Task response', 25, 'menjawab tugas sepenuhnya', 'fully answers the task'),
      asp('coherence', 'Koherensi & kohesi', 'Coherence & cohesion', 25, 'alur dan penghubung yang baik', 'good flow and linking'),
      asp('lexical', 'Kosakata', 'Vocabulary', 25, 'kosakata yang tepat dan beragam', 'precise, varied vocabulary'),
      asp('grammar', 'Tata bahasa', 'Grammar', 25, 'tata bahasa yang beragam dan akurat', 'varied, accurate grammar', true),
    ],
  },
];

export function getRubric(id: string | null | undefined): Rubric | null {
  if (!id) return null;
  return RUBRICS.find((r) => r.id === id) ?? null;
}

export const bi = (L: Lang, b: Bi): string => (L === 'en' ? b.en : b.id);

/* ── perhitungan nilai (blueprint J) ─────────────────────────────────── */

export function aspectValue(level: number, weight: number, scale = 4): number {
  return Math.round(((level / scale) * weight) * 100) / 100;
}

export function categoryOf(total: number): 'excellent' | 'good' | 'fair' | 'weak' {
  if (total >= 85) return 'excellent';
  if (total >= 70) return 'good';
  if (total >= 55) return 'fair';
  return 'weak';
}

export const CATEGORY: Record<ReturnType<typeof categoryOf>, Bi> = {
  excellent: { id: 'Sangat baik', en: 'Excellent' },
  good: { id: 'Baik', en: 'Good' },
  fair: { id: 'Cukup', en: 'Fair' },
  weak: { id: 'Perlu perbaikan', en: 'Needs work' },
};

/** Kesalahan per 1.000 kata → level 4..1 sesuai ambang form (1–2 / 3–5 / 6–10 / >10). */
export function languageBand(errors: number, words: number, ref = 1000): { per1k: number; level: number } {
  const per1k = words > 0 ? (errors * ref) / words : 0;
  const level = per1k <= 2.5 ? 4 : per1k <= 5.5 ? 3 : per1k <= 10.5 ? 2 : 1;
  return { per1k: Math.round(per1k * 10) / 10, level };
}

/* ── aturan EYD V sederhana (bentuk tidak baku yang umum → baku) ──────── */

const BAKU: [string, string][] = [
  ['hoax', 'hoaks'], ['praktek', 'praktik'], ['resiko', 'risiko'], ['nafas', 'napas'], ['aktifitas', 'aktivitas'], ['kreatifitas', 'kreativitas'],
  ['analisa', 'analisis'], ['sistim', 'sistem'], ['jaman', 'zaman'], ['ijin', 'izin'], ['merubah', 'mengubah'], ['apotik', 'apotek'],
  ['standarisasi', 'standardisasi'], ['efektifitas', 'efektivitas'], ['obyek', 'objek'], ['subyek', 'subjek'], ['tehnik', 'teknik'],
  ['kwalitas', 'kualitas'], ['kwantitas', 'kuantitas'], ['frekwensi', 'frekuensi'], ['silahkan', 'silakan'], ['trampil', 'terampil'],
  ['nasehat', 'nasihat'], ['himbauan', 'imbauan'], ['karir', 'karier'], ['sekedar', 'sekadar'], ['antri', 'antre'], ['cidera', 'cedera'],
  ['produktifitas', 'produktivitas'], ['sensitifitas', 'sensitivitas'], ['kharisma', 'karisma'], ['hakekat', 'hakikat'], ['ilmiyah', 'ilmiah'],
];
const DI_EXCEPT = new Set(['pekan', 'ikan', 'depan', 'bulan', 'tahun', 'tengah']);

export interface LangError {
  wrong: string;
  right: string;
  type: string;
}

export function ruleErrors(text: string): LangError[] {
  const out: LangError[] = [];
  for (const [w, r] of BAKU) {
    const re = new RegExp(`\\b${w}\\b`, 'gi');
    for (const m of text.matchAll(re)) out.push({ wrong: m[0], right: r, type: 'spelling' });
  }
  for (const m of text.matchAll(/\b([Dd]i) ([a-z]{3,}kan)\b/g)) {
    if (!DI_EXCEPT.has(m[2]!)) out.push({ wrong: m[0], right: `${m[1]}${m[2]}`, type: 'spelling' });
  }
  for (const m of text.matchAll(/\b(dll|dsb|dst)(?=[\s,;)]|$)(?!\.)/g)) out.push({ wrong: m[0], right: `${m[0]}.`, type: 'punctuation' });
  return out;
}
