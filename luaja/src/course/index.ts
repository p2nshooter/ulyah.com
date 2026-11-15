/**
 * Registri kurikulum: semua pelajaran yang sudah terbit, modul, dan garis besar jenjang (peta modul yang direncanakan).
 * Pelajaran baru ditambahkan di sini setelah lolos validateLesson (uji unit memeriksa semuanya).
 */
import type { Course } from '../data/model.ts';
import type { Lesson, Module } from './schema.ts';
import * as deA1M1 from './de-a1-m01.ts';
import * as enBegM1 from './en-beginner-m01.ts';
import * as jaN5M1 from './ja-n5-m01.ts';

const PACKS = [deA1M1, enBegM1, jaN5M1];

export const MODULES: Module[] = PACKS.map((p) => p.MODULE);
export const LESSONS: Lesson[] = PACKS.flatMap((p) => p.LESSONS);
const BY_CODE = new Map(LESSONS.map((l) => [l.code, l]));

export const getLesson = (code: string): Lesson | undefined => BY_CODE.get(code);
export const modulesOf = (course: Course, level: string): Module[] => MODULES.filter((m) => m.course === course && m.level === level);

/** Pelajaran sesudah/sebelum dalam urutan jalur (lintas modul). */
export function neighbours(code: string): { prev?: Lesson; next?: Lesson } {
  const l = BY_CODE.get(code);
  if (!l) return {};
  const seq = LESSONS.filter((x) => x.course === l.course).sort((a, b) => a.level.localeCompare(b.level) || a.module - b.module || a.index - b.index);
  const i = seq.findIndex((x) => x.code === code);
  return { prev: seq[i - 1], next: seq[i + 1] };
}

/** Peta modul jenjang pertama setiap jalur (judul modul berikutnya terbit bertahap). */
export const OUTLINE: Record<string, { n: number; title: string; native: string }[]> = {
  'de-a1': [
    { n: 1, title: 'Halo! Saya…', native: 'Hallo! Ich bin…' },
    { n: 2, title: 'Keluarga dan teman', native: 'Familie und Freunde' },
    { n: 3, title: 'Rumah dan tempat tinggal', native: 'Wohnen' },
    { n: 4, title: 'Makan dan minum', native: 'Essen und Trinken' },
    { n: 5, title: 'Waktu dan kegiatan sehari-hari', native: 'Mein Tag' },
    { n: 6, title: 'Belanja', native: 'Einkaufen' },
    { n: 7, title: 'Di kota', native: 'In der Stadt' },
    { n: 8, title: 'Kesehatan dan tubuh', native: 'Gesundheit' },
    { n: 9, title: 'Kerja dan belajar', native: 'Arbeit und Lernen' },
    { n: 10, title: 'Liburan dan cuaca', native: 'Urlaub und Wetter' },
  ],
  'en-beginner': [
    { n: 1, title: 'Halo! Senang bertemu', native: 'Hello! Nice to meet you' },
    { n: 2, title: 'Benda di sekitarku', native: 'Things around me' },
    { n: 3, title: 'Rutinitas harian', native: 'My daily routine' },
    { n: 4, title: 'Makanan dan minuman', native: 'Food and drink' },
    { n: 5, title: 'Rumah dan kota', native: 'Home and town' },
    { n: 6, title: 'Waktu, hari dan tanggal', native: 'Time and dates' },
    { n: 7, title: 'Belanja dan harga', native: 'Shopping' },
    { n: 8, title: 'Kemampuan: can / can\'t', native: 'What I can do' },
  ],
  'ja-n5': [
    { n: 1, title: 'Senang berkenalan', native: 'はじめまして' },
    { n: 2, title: 'Hiragana dan katakana lengkap', native: 'ひらがな・カタカナ' },
    { n: 3, title: 'Tempat dan arah', native: 'ここ・そこ・あそこ' },
    { n: 4, title: 'Waktu dan kegiatan', native: 'なんじですか' },
    { n: 5, title: 'Belanja dan harga', native: 'いくらですか' },
    { n: 6, title: 'Kata kerja ます', native: 'ます形' },
    { n: 7, title: 'Kata sifat い dan な', native: 'けいようし' },
    { n: 8, title: 'Ada dan berada: あります・います', native: 'あります・います' },
    { n: 9, title: 'Keinginan dan ajakan', native: '〜たいです・〜ましょう' },
    { n: 10, title: 'Bentuk て dan permintaan', native: 'て形' },
  ],
};
