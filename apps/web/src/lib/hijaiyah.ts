// The 28 hijaiyah letters — the Arabic alphabet, canonical and fixed.
//   ar     — the letter glyph
//   name   — its Latin (transliterated) name, shown under the letter
//   arName — its Arabic name, spoken with an Arabic voice on tap (so the
//            pronunciation is with an Arabic tongue, not a local accent)
export interface Hijaiyah {
  ar: string;
  name: string;
  arName: string;
}

export const HIJAIYAH: Hijaiyah[] = [
  { ar: "ا", name: "Alif", arName: "أَلِف" },
  { ar: "ب", name: "Ba", arName: "بَاء" },
  { ar: "ت", name: "Ta", arName: "تَاء" },
  { ar: "ث", name: "Tsa", arName: "ثَاء" },
  { ar: "ج", name: "Jim", arName: "جِيم" },
  { ar: "ح", name: "Ha", arName: "حَاء" },
  { ar: "خ", name: "Kha", arName: "خَاء" },
  { ar: "د", name: "Dal", arName: "دَال" },
  { ar: "ذ", name: "Dzal", arName: "ذَال" },
  { ar: "ر", name: "Ra", arName: "رَاء" },
  { ar: "ز", name: "Zai", arName: "زَاي" },
  { ar: "س", name: "Sin", arName: "سِين" },
  { ar: "ش", name: "Syin", arName: "شِين" },
  { ar: "ص", name: "Shad", arName: "صَاد" },
  { ar: "ض", name: "Dhad", arName: "ضَاد" },
  { ar: "ط", name: "Tha", arName: "طَاء" },
  { ar: "ظ", name: "Zha", arName: "ظَاء" },
  { ar: "ع", name: "'Ain", arName: "عَيْن" },
  { ar: "غ", name: "Ghain", arName: "غَيْن" },
  { ar: "ف", name: "Fa", arName: "فَاء" },
  { ar: "ق", name: "Qaf", arName: "قَاف" },
  { ar: "ك", name: "Kaf", arName: "كَاف" },
  { ar: "ل", name: "Lam", arName: "لَام" },
  { ar: "م", name: "Mim", arName: "مِيم" },
  { ar: "ن", name: "Nun", arName: "نُون" },
  { ar: "ه", name: "Ha'", arName: "هَاء" },
  { ar: "و", name: "Waw", arName: "وَاو" },
  { ar: "ي", name: "Ya", arName: "يَاء" },
];
