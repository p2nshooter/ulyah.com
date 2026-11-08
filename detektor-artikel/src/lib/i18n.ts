/** Dua bahasa: setiap teks UI ditulis berpasangan, jadi tidak ada terjemahan yang bisa terlewat. */

export type Lang = 'id' | 'en';

export const tr = (L: Lang, id: string, en: string): string => (L === 'en' ? en : id);

export function fmtNum(L: Lang, n: number, dec = 0): string {
  return n.toLocaleString(L === 'en' ? 'en-US' : 'id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/** Angka dengan desimal seperlunya (86,25 · 75 · 7,5). */
export function fmtScore(L: Lang, n: number): string {
  return n.toLocaleString(L === 'en' ? 'en-US' : 'id-ID', { maximumFractionDigits: 2 });
}

export function fmtDate(L: Lang, ms: number, withTime = true): string {
  const d = new Date(ms);
  const opts: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric' };
  if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit' });
  const s = d.toLocaleString(L === 'en' ? 'en-GB' : 'id-ID', opts);
  return withTime ? `${s} WIB` : s;
}

export function fmtUsd(n: number): string {
  return `US$${n.toFixed(n < 1 ? 4 : 2)}`;
}

export const LABELS = {
  ai: { id: 'Kemungkinan besar ditulis AI', en: 'Likely AI-generated' },
  partly: { id: 'Sebagian ditulis atau dibantu AI', en: 'Partly AI-written or AI-assisted' },
  human: { id: 'Kemungkinan besar ditulis manusia', en: 'Likely human-written' },
  unsure: { id: 'Tidak meyakinkan — perlu tinjauan manusia', en: 'Inconclusive — needs human review' },
  short: { id: 'Teks terlalu pendek untuk diputuskan', en: 'Too short to decide' },
} as const;

export type LabelKey = keyof typeof LABELS;

export const CLASS_NAMES = {
  ai: { id: 'AI', en: 'AI' },
  mix: { id: 'Campuran', en: 'Mixed' },
  hum: { id: 'Manusia', en: 'Human' },
} as const;

export const REASONS: Record<string, { id: string; en: string; human?: boolean }> = {
  generic_claim: { id: 'klaim umum tanpa detail', en: 'generic claim without detail' },
  uniform_rhythm: { id: 'ritme kalimat seragam', en: 'uniform sentence rhythm' },
  signposting: { id: 'transisi berpola', en: 'patterned signposting' },
  hedging: { id: 'terlalu berhati-hati/umum', en: 'heavy hedging' },
  list_like_prose: { id: 'prosa seperti daftar', en: 'list-like prose' },
  no_specific_detail: { id: 'tanpa detail spesifik', en: 'no specific detail' },
  summary_echo: { id: 'mengulang rangkuman', en: 'echoes a summary' },
  ai_phrase: { id: 'frasa khas AI', en: 'typical AI phrase' },
  polished_beyond_context: { id: 'terlalu rapi untuk konteksnya', en: 'polished beyond its context' },
  tortured_phrase: { id: 'frasa aneh hasil parafrase', en: 'tortured paraphrase' },
  odd_synonym: { id: 'sinonim tidak lazim', en: 'odd synonym' },
  inserted_typos: { id: 'salah ketik yang disisipkan', en: 'inserted typos' },
  translationese: { id: 'gaya terjemahan mesin', en: 'machine-translation style' },
  personal_detail: { id: 'pengalaman pribadi spesifik', en: 'specific personal experience', human: true },
  idiosyncratic_error: { id: 'kesalahan khas manusia', en: 'idiosyncratic human error', human: true },
  local_reference: { id: 'rujukan lokal', en: 'local reference', human: true },
  uneven_rhythm: { id: 'ritme tidak rata', en: 'uneven rhythm', human: true },
};

export const REASON_KEYS = Object.keys(REASONS);

export const GENRES: { key: string; id: string; en: string }[] = [
  { key: 'general', id: 'Umum', en: 'General' },
  { key: 'essay', id: 'Esai / tugas', en: 'Essay / assignment' },
  { key: 'academic', id: 'Akademik / makalah', en: 'Academic / paper' },
  { key: 'thesis', id: 'Skripsi / tesis', en: 'Thesis' },
  { key: 'news', id: 'Berita', en: 'News' },
  { key: 'opinion', id: 'Opini', en: 'Opinion' },
  { key: 'seo', id: 'Artikel SEO / blog', en: 'SEO / blog article' },
  { key: 'story', id: 'Cerpen', en: 'Short story' },
  { key: 'scholarship', id: 'Esai beasiswa', en: 'Scholarship essay' },
  { key: 'letter', id: 'Surat / formal', en: 'Letter / formal' },
];

export const LEVELS: { key: string; id: string; en: string }[] = [
  { key: 'unknown', id: 'Tidak tahu', en: 'Unknown' },
  { key: 'primary', id: 'SD', en: 'Primary school' },
  { key: 'junior_high', id: 'SMP', en: 'Junior high' },
  { key: 'senior_high', id: 'SMA/SMK', en: 'Senior high' },
  { key: 'university', id: 'Kuliah', en: 'University' },
  { key: 'professional', id: 'Profesional', en: 'Professional' },
];

export const MODE_INFO: Record<string, { id: string; en: string; did: string; den: string }> = {
  auto: { id: 'AUTO — sistem memilih', en: 'AUTO — system chooses', did: 'Haiku dulu; kalimat yang ragu naik ke Sonnet, yang masih diperdebatkan ke Opus. Akurat & hemat — disarankan.', den: 'Haiku first; doubtful sentences go up to Sonnet, still-disputed ones to Opus. Accurate & economical — recommended.' },
  haiku: { id: 'Claude Haiku', en: 'Claude Haiku', did: 'Paling hemat & cepat. Cocok untuk penyaringan awal banyak naskah.', den: 'Cheapest & fastest. Good for first-pass screening of many texts.' },
  sonnet: { id: 'Claude Sonnet', en: 'Claude Sonnet', did: 'Lebih teliti untuk naskah akademik & lomba. Biaya menengah.', den: 'More careful for academic & contest texts. Mid cost.' },
  opus: { id: 'Claude Opus', en: 'Claude Opus', did: 'Model terkuat di kelasnya untuk naskah yang menentukan. Biaya tinggi.', den: 'The strongest of its class for texts that matter. High cost.' },
  fable: { id: 'Claude Fable 5.1 — premium', en: 'Claude Fable 5.1 — premium', did: 'Telaah paling mendalam yang kami sediakan, untuk naskah yang benar-benar memerlukan ketelitian tertinggi. Biayanya jauh di atas mesin lain, sehingga saldo token berkurang jauh lebih cepat.', den: 'The deepest review we offer, for texts that truly call for the highest care. It costs far more than the other engines, so your token balance goes down much faster.' },
  forensic: { id: 'Forensik penuh', en: 'Full forensic', did: 'Haiku, Sonnet, dan Opus menilai seluruh teks — untuk sengketa.', den: 'Haiku, Sonnet and Opus all score the whole text — for disputes.' },
};
