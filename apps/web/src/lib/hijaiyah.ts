// The 28 hijaiyah letters — the Arabic alphabet, canonical and fixed. `name`
// is the letter's spoken name (used for the tap-to-hear narration); it is the
// same in every language, so no translation is needed.
export interface Hijaiyah {
  ar: string;
  name: string;
}

export const HIJAIYAH: Hijaiyah[] = [
  { ar: "ا", name: "Alif" },
  { ar: "ب", name: "Ba" },
  { ar: "ت", name: "Ta" },
  { ar: "ث", name: "Tsa" },
  { ar: "ج", name: "Jim" },
  { ar: "ح", name: "Ha" },
  { ar: "خ", name: "Kha" },
  { ar: "د", name: "Dal" },
  { ar: "ذ", name: "Dzal" },
  { ar: "ر", name: "Ra" },
  { ar: "ز", name: "Zai" },
  { ar: "س", name: "Sin" },
  { ar: "ش", name: "Syin" },
  { ar: "ص", name: "Shad" },
  { ar: "ض", name: "Dhad" },
  { ar: "ط", name: "Tha" },
  { ar: "ظ", name: "Zha" },
  { ar: "ع", name: "'Ain" },
  { ar: "غ", name: "Ghain" },
  { ar: "ف", name: "Fa" },
  { ar: "ق", name: "Qaf" },
  { ar: "ك", name: "Kaf" },
  { ar: "ل", name: "Lam" },
  { ar: "م", name: "Mim" },
  { ar: "ن", name: "Nun" },
  { ar: "ه", name: "Ha'" },
  { ar: "و", name: "Waw" },
  { ar: "ي", name: "Ya" },
];
