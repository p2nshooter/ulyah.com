/**
 * Artikel jenius.es (docs/JENIUS-BLUEPRINT.md §11): untuk orang tua, guru, pelajar, dan pembaca umum — Indonesia + versi
 * Inggris yang ditulis (bukan terjemahan mesin). Isi tiap artikel di src/content/a/{key}.ts (Markdown ID & EN).
 */
import type { Lang, Pair } from '../lib/i18n.ts';
import a01 from './a/01-membacakan-nyaring.ts';
import a02 from './a/02-tahap-membaca.ts';
import a03 from './a/03-rutinitas-20-menit.ts';
import a04 from './a/04-pertanyaan-membaca.ts';
import a05 from './a/05-disleksia.ts';
import a06 from './a/06-inggris-dari-cerita.ts';
import a07 from './a/07-tantangan-kelas.ts';
import a08 from './a/08-ai-di-kelas.ts';
import a09 from './a/09-audiobook-atau-cetak.ts';
import a10 from './a/10-kosakata.ts';

export const CLUSTERS = {
  belajar: ['Belajar membaca', 'Learning to read'],
  kebiasaan: ['Kebiasaan membaca', 'Reading habits'],
  pemahaman: ['Pemahaman bacaan', 'Reading comprehension'],
  kesulitan: ['Kesulitan membaca', 'Reading difficulties'],
  bahasa: ['Dwibahasa & bahasa asing', 'Bilingual & languages'],
  guru: ['Guru & kelas', 'Teachers & classrooms'],
  ai: ['AI & pendidikan', 'AI & education'],
} as const satisfies Record<string, Pair>;
export type ClusterId = keyof typeof CLUSTERS;

export interface ArticleBody {
  id: string;
  en: string;
}

export interface ArticleMeta {
  key: string;
  slug: Pair;
  cluster: ClusterId;
  clusterName: Pair;
  title: Pair;
  description: Pair;
  /** Tanggal terbit (YYYY-MM-DD). */
  date: string;
  body: ArticleBody;
}

const A = (key: string, cluster: ClusterId, slug: Pair, title: Pair, description: Pair, date: string, body: ArticleBody): ArticleMeta => ({ key, slug, cluster, clusterName: CLUSTERS[cluster], title, description, date, body });

export const ARTICLES: ArticleMeta[] = [
  A('01', 'belajar', ['membacakan-buku-dengan-nyaring', 'reading-aloud-to-children'], ['Membacakan buku dengan nyaring: panduan lengkap untuk orang tua', 'Reading aloud to children: a complete guide for parents'], ['Mengapa membacakan buku sejak bayi begitu penting, cara memilih buku per usia, dan teknik membaca nyaring yang membuat anak ketagihan cerita.', 'Why reading aloud from infancy matters so much, how to choose books for each age, and read-aloud techniques that make children hungry for stories.'], '2026-11-09', a01),
  A('02', 'belajar', ['tahap-perkembangan-membaca-anak', 'reading-development-stages'], ['Tahap perkembangan membaca anak dari usia 3 sampai 12 tahun', 'Reading development stages from age 3 to 12'], ['Dari mengenal bunyi sampai membaca untuk belajar: tanda setiap tahap, apa yang bisa dilakukan orang tua, dan kapan perlu waspada.', 'From hearing sounds to reading to learn: the signs of each stage, what parents can do, and when to look closer.'], '2026-11-09', a02),
  A('03', 'kebiasaan', ['rutinitas-membaca-20-menit', 'the-20-minute-reading-routine'], ['Membangun kebiasaan membaca di rumah: rutinitas 20 menit', 'Building a reading habit at home: the 20-minute routine'], ['Cara membuat membaca menjadi bagian alami hari keluarga: waktu tetap, sudut baca, pilihan anak, dan mengelola layar.', 'How to make reading a natural part of the family day: a fixed time, a reading corner, children’s choice and managing screens.'], '2026-11-09', a03),
  A('04', 'pemahaman', ['pertanyaan-sebelum-saat-sesudah-membaca', 'questions-before-during-after-reading'], ['Pertanyaan sebelum, saat, dan sesudah membaca', 'Questions before, during and after reading'], ['Daftar pertanyaan praktis yang melatih anak memprediksi, memantau pemahaman, membuat inferensi, dan merangkum cerita.', 'A practical set of questions that trains children to predict, monitor understanding, infer and summarise a story.'], '2026-11-09', a04),
  A('05', 'kesulitan', ['disleksia-tanda-awal-dan-pendampingan', 'dyslexia-early-signs-and-support'], ['Disleksia: tanda awal dan cara mendampingi anak', 'Dyslexia: early signs and how to support your child'], ['Apa itu disleksia, tanda-tandanya di usia prasekolah dan SD, langkah memeriksakan anak, serta dukungan yang benar-benar membantu di rumah.', 'What dyslexia is, its signs at preschool and primary age, how to get your child assessed, and support that genuinely helps at home.'], '2026-11-09', a05),
  A('06', 'bahasa', ['belajar-bahasa-inggris-dari-cerita', 'learning-english-through-stories'], ['Belajar bahasa Inggris dari cerita: metode dengar-baca', 'Learning English through stories: the listen-and-read method'], ['Mengapa mendengar sambil membaca mempercepat belajar bahasa Inggris, dan rencana empat langkah memakai cerita bergambar dan buku bab.', 'Why listening while reading speeds up English learning, and a four-step plan using picture stories and chapter books.'], '2026-11-09', a06),
  A('07', 'guru', ['tantangan-membaca-kelas', 'class-reading-challenge'], ['Menyusun tantangan membaca kelas yang memotivasi semua anak', 'Designing a class reading challenge that motivates every child'], ['Target bersama, bukan peringkat yang mempermalukan: cara merancang, menjalankan, dan merayakan tantangan membaca di kelas.', 'Shared goals, not shaming leaderboards: how to design, run and celebrate a classroom reading challenge.'], '2026-11-09', a07),
  A('08', 'ai', ['ai-di-kelas-membantu-guru', 'ai-in-the-classroom-for-teachers'], ['AI di kelas: membantu guru tanpa menggantikan proses belajar', 'AI in the classroom: helping teachers without replacing learning'], ['Di mana AI benar-benar menghemat waktu guru, batas yang perlu dijaga, perlindungan data murid, dan cara mengajarkan murid memakai AI dengan bijak.', 'Where AI truly saves teachers time, the limits to keep, protecting student data, and how to teach students to use AI wisely.'], '2026-11-09', a08),
  A('09', 'kebiasaan', ['audiobook-atau-buku-cetak', 'audiobooks-or-print'], ['Audiobook atau buku cetak? Kapan mendengarkan membantu membaca', 'Audiobooks or print? When listening helps reading'], ['Apa kata penelitian tentang mendengarkan buku, kapan audio paling bermanfaat, dan cara menggabungkannya dengan membaca teks.', 'What research says about listening to books, when audio helps most, and how to combine it with reading the text.'], '2026-11-09', a09),
  A('10', 'pemahaman', ['memperkaya-kosakata-anak', 'building-vocabulary-through-stories'], ['Memperkaya kosakata anak lewat buku cerita', 'Building vocabulary through storybooks'], ['Mengapa buku mengenalkan kata yang jarang muncul dalam obrolan, cara memilih kata untuk diajarkan, dan permainan kosakata lima menit.', 'Why books bring words that rarely appear in conversation, how to choose words to teach, and five-minute vocabulary games.'], '2026-11-09', a10),
];

export const articleBySlug = (slug: string): { a: ArticleMeta; L: Lang } | null => {
  for (const a of ARTICLES) {
    if (a.slug[0] === slug) return { a, L: 'id' };
    if (a.slug[1] === slug) return { a, L: 'en' };
  }
  return null;
};
