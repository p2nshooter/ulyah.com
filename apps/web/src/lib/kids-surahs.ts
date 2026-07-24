// Which surahs Al-Qur'an Kids offers, in the order children usually learn them.
// The reader itself (KidsSurahPlayer) works for any of these using the verified
// Qur'an data + real murottal audio.

// Juz 30 (An-Naba 78 … An-Nas 114), shown shortest-first (114 → 78).
export const JUZ30: number[] = Array.from({ length: 114 - 78 + 1 }, (_, i) => 114 - i);

// Juz 29 (Al-Mulk 67 … Al-Mursalat 77), shown Al-Mulk first.
export const JUZ29: number[] = Array.from({ length: 77 - 67 + 1 }, (_, i) => 67 + i);

// The surahs families most often recite together.
export const PILIHAN: number[] = [36, 55, 56, 67, 18, 32, 44];

// Everything the kids reader is allowed to open.
export const KIDS_SURAHS: Set<number> = new Set([...JUZ30, ...JUZ29, ...PILIHAN]);
