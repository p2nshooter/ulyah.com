/**
 * Keperluan laporan (pemilik, 8 Nov 2026: „penggunaan aplikasi ini pasti dari seluruh budak profesional, guru, panitia,
 * organisasi, media dll bukan hanya untuk lomba … apakah sudah d bedakan report hasil nya, baik umum maupun untuk
 * perlombaan“). Satu daftar untuk formulir, laporan, dan cetak. docs/MASTER-BLUEPRINT.md §24.
 */
import type { Lang } from './i18n.ts';

export type Purpose = 'umum' | 'pendidikan' | 'lomba' | 'media' | 'organisasi';
export const PURPOSES: Purpose[] = ['umum', 'pendidikan', 'lomba', 'media', 'organisasi'];
export const isPurpose = (x: unknown): x is Purpose => typeof x === 'string' && (PURPOSES as string[]).includes(x);

type T = { id: string; en: string };
export interface PurposeInfo {
  name: T;
  /** Untuk siapa, di formulir. */
  hint: T;
  /** Judul dokumen di kepala laporan. */
  docTitle: T;
  /** Sebutan penulis di laporan. */
  writer: T;
  /** Kotak tanda tangan. */
  sign: [T, T];
}

export const PURPOSE_INFO: Record<Purpose, PurposeInfo> = {
  umum: {
    name: { id: 'Umum', en: 'General' },
    hint: { id: 'Untuk siapa saja yang ingin menelaah sebuah tulisan.', en: 'For anyone who wants to review a piece of writing.' },
    docTitle: { id: 'Laporan Analisis Tulisan', en: 'Writing Analysis Report' },
    writer: { id: 'Penulis', en: 'Writer' },
    sign: [{ id: 'Pemeriksa', en: 'Reviewer' }, { id: 'Mengetahui', en: 'Acknowledged' }],
  },
  pendidikan: {
    name: { id: 'Pendidikan (guru, dosen, sekolah)', en: 'Education (teachers, lecturers, schools)' },
    hint: { id: 'Untuk menelaah tugas, esai, atau karya ilmiah peserta didik.', en: 'For reviewing students’ assignments, essays or academic work.' },
    docTitle: { id: 'Laporan Telaah Tugas Peserta Didik', en: 'Student Work Review Report' },
    writer: { id: 'Peserta didik', en: 'Student' },
    sign: [{ id: 'Guru / dosen pengampu', en: 'Teacher / lecturer' }, { id: 'Mengetahui', en: 'Acknowledged' }],
  },
  lomba: {
    name: { id: 'Lomba / perlombaan', en: 'Contest / competition' },
    hint: { id: 'Untuk panitia dan dewan juri; pilih rubrik agar ada nilai per aspek.', en: 'For organisers and judges; choose a rubric to get scores per aspect.' },
    docTitle: { id: 'Lembar Penilaian Naskah Lomba', en: 'Contest Entry Assessment Sheet' },
    writer: { id: 'Peserta', en: 'Entrant' },
    sign: [{ id: 'Juri', en: 'Judge' }, { id: 'Ketua panitia', en: 'Head of the organising committee' }],
  },
  media: {
    name: { id: 'Media & redaksi', en: 'Media & newsroom' },
    hint: { id: 'Untuk editor dan redaksi yang menelaah naskah sebelum terbit.', en: 'For editors and newsrooms reviewing copy before publication.' },
    docTitle: { id: 'Laporan Telaah Naskah Redaksi', en: 'Editorial Manuscript Review' },
    writer: { id: 'Penulis / kontributor', en: 'Writer / contributor' },
    sign: [{ id: 'Editor', en: 'Editor' }, { id: 'Pemimpin redaksi', en: 'Editor-in-chief' }],
  },
  organisasi: {
    name: { id: 'Organisasi & instansi', en: 'Organisations & institutions' },
    hint: { id: 'Untuk lembaga, perusahaan, dan instansi yang menelaah dokumen.', en: 'For institutions, companies and agencies reviewing documents.' },
    docTitle: { id: 'Laporan Telaah Dokumen', en: 'Document Review Report' },
    writer: { id: 'Penyusun', en: 'Author' },
    sign: [{ id: 'Penelaah', en: 'Reviewer' }, { id: 'Mengetahui', en: 'Acknowledged' }],
  },
};

export const pt = (L: Lang, x: T) => (L === 'en' ? x.en : x.id);
