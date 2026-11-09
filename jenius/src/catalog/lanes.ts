/**
 * Jalur Baca (docs/JENIUS-BLUEPRINT.md §0.25): delapan jalur bernama pengganti daftar jenjang yang kaku. Jenjang pemilik
 * (TK … Profesor, profesional, umum, bahasa asing) tetap tercatat di balik setiap jalur supaya rekomendasi kelas tepat.
 */
export type LaneId = 'tunas' | 'tumbuh' | 'jelajah' | 'kampus' | 'cendekia' | 'profesi' | 'santai' | 'lintas';
export type Pair = readonly [string, string];

export interface Lane {
  id: LaneId;
  slug: Pair; // [id, en] untuk URL
  icon: string;
  name: Pair;
  who: Pair;
  levels: Pair;
  blurb: Pair;
  /** Warna jalur (sampul, penanda). */
  color: string;
  /** Kata per halaman di pembaca. */
  wordsPerPage: number;
  /** Suara bawaan: anak, guru perempuan, guru laki-laki, narator. */
  voice: 'child' | 'teacher-f' | 'teacher-m' | 'narrator';
  /** Halaman untuk anak: tanpa iklan sama sekali (§1 no. 5). */
  kids: boolean;
}

export const LANES: readonly Lane[] = [
  {
    id: 'tunas', slug: ['tunas', 'sprout'], icon: '🌱', name: ['Tunas', 'Sprout'], color: '#2fb36b', wordsPerPage: 60, voice: 'child', kids: true,
    who: ['Anak yang mulai membaca', 'Children starting to read'], levels: ['TK · SD kelas 1–2', 'Kindergarten · Grades 1–2'],
    blurb: ['Buku bergambar dengan kalimat pendek. Setiap halaman dibacakan, lalu berganti sendiri.', 'Picture books with short sentences. Every page is read aloud, then turns by itself.'],
  },
  {
    id: 'tumbuh', slug: ['tumbuh', 'grow'], icon: '🌿', name: ['Tumbuh', 'Grow'], color: '#16a3a0', wordsPerPage: 140, voice: 'teacher-f', kids: true,
    who: ['Pembaca muda', 'Young readers'], levels: ['SD kelas 3–6', 'Grades 3–6'],
    blurb: ['Cerita bab pendek, dongeng, dan petualangan klasik untuk dibaca sendiri atau didengarkan.', 'Short chapter stories, fairy tales and classic adventures to read alone or listen to.'],
  },
  {
    id: 'jelajah', slug: ['jelajah', 'explore'], icon: '🔥', name: ['Jelajah', 'Explore'], color: '#ff7a00', wordsPerPage: 220, voice: 'narrator', kids: true,
    who: ['Remaja', 'Teenagers'], levels: ['SMP · SMA', 'Middle & high school'],
    blurb: ['Petualangan, misteri, dan fiksi ilmiah klasik yang membuat betah membaca sampai bab terakhir.', 'Classic adventure, mystery and science fiction that keep you reading to the last chapter.'],
  },
  {
    id: 'kampus', slug: ['kampus', 'campus'], icon: '🎓', name: ['Kampus', 'Campus'], color: '#0b4fd8', wordsPerPage: 280, voice: 'narrator', kids: false,
    who: ['Mahasiswa', 'University students'], levels: ['Mahasiswa · S1', 'Undergraduate'],
    blurb: ['Sastra dunia yang dibahas di kelas sastra dan bahasa — dibaca dan didengarkan bab demi bab.', 'World literature studied in literature and language courses — read and heard chapter by chapter.'],
  },
  {
    id: 'cendekia', slug: ['cendekia', 'scholar'], icon: '🔬', name: ['Cendekia', 'Scholar'], color: '#5a3fd6', wordsPerPage: 300, voice: 'teacher-m', kids: false,
    who: ['Peneliti dan pemikir', 'Researchers and thinkers'], levels: ['S2 · S3/Dr · Profesor', 'Master’s · PhD · Professor'],
    blurb: ['Filsafat, sejarah, dan ilmu klasik dari sumber aslinya — bacaan dasar para peneliti.', 'Classic philosophy, history and science from the original sources — core reading for researchers.'],
  },
  {
    id: 'profesi', slug: ['profesi', 'career'], icon: '💼', name: ['Profesi', 'Career'], color: '#0a1b4d', wordsPerPage: 260, voice: 'teacher-m', kids: false,
    who: ['Pekerja dan wirausaha', 'Professionals and founders'], levels: ['Profesional', 'Professional'],
    blurb: ['Bisnis, kepemimpinan, dan pengembangan diri klasik — enak didengarkan di perjalanan.', 'Classic business, leadership and self-development — easy to listen to on the go.'],
  },
  {
    id: 'santai', slug: ['santai', 'leisure'], icon: '☕', name: ['Santai', 'Leisure'], color: '#c2410c', wordsPerPage: 260, voice: 'narrator', kids: false,
    who: ['Semua orang', 'Everyone'], levels: ['Umum', 'General readers'],
    blurb: ['Novel, cerita pendek, dan puisi untuk menemani waktu senggang.', 'Novels, short stories and poems for your free time.'],
  },
  {
    id: 'lintas', slug: ['lintas-bahasa', 'languages'], icon: '🌍', name: ['Lintas Bahasa', 'Across Languages'], color: '#0096fb', wordsPerPage: 120, voice: 'teacher-f', kids: true,
    who: ['Pelajar bahasa asing', 'Language learners'], levels: ['Semua jenjang · bahasa asing', 'All levels · foreign languages'],
    blurb: ['Belajar bahasa Inggris dari cerita sederhana: dengarkan per kalimat, ulangi, perlambat.', 'Learn English from simple stories: listen sentence by sentence, repeat, slow down.'],
  },
] as const;

export const laneById = (id: string): Lane | undefined => LANES.find((l) => l.id === id);
export const laneBySlug = (slug: string): Lane | undefined => LANES.find((l) => l.slug[0] === slug || l.slug[1] === slug);

/** Rak tema (lintas jalur). */
export const SHELVES = {
  petualangan: ['Petualangan', 'Adventure'],
  sains: ['Sains & Alam', 'Science & Nature'],
  sejarah: ['Sejarah & Tokoh', 'History & People'],
  budaya: ['Budaya & Dongeng', 'Culture & Tales'],
  bahasa: ['Bahasa', 'Language'],
  teknologi: ['Teknologi', 'Technology'],
  seni: ['Seni & Puisi', 'Arts & Poetry'],
  diri: ['Diri & Karier', 'Self & Career'],
  misteri: ['Misteri', 'Mystery'],
  filsafat: ['Filsafat & Pemikiran', 'Philosophy & Ideas'],
  keluarga: ['Keluarga & Persahabatan', 'Family & Friendship'],
} as const satisfies Record<string, Pair>;
export type ShelfId = keyof typeof SHELVES;
