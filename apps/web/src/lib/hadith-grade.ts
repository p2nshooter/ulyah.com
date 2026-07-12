// Normalises the many raw grade strings in the hadith data (shahih, sahih,
// "hasan shahih", lemah, dhaif, daif, dalif, palsu, maudhu, mutawatir, …)
// into a small set of buckets, each with an Indonesian label and a colour, so
// the reader can show an honest, at-a-glance authenticity badge. Deliberately
// keeps EVERYTHING — including weak/fabricated narrations — but always clearly
// labelled, so readers are never misled.

export type GradeBucket = "mutawatir" | "shahih" | "hasan" | "dhaif" | "maudhu" | "lain";

export interface GradeInfo {
  bucket: GradeBucket;
  label: string; // Indonesian display label
  /** tailwind classes for a small pill badge */
  className: string;
  /** short plain-language meaning for a tooltip / legend */
  meaning: string;
}

const BUCKETS: Record<GradeBucket, Omit<GradeInfo, "bucket">> = {
  mutawatir: {
    label: "Mutawatir",
    className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    meaning: "Diriwayatkan oleh banyak perawi di tiap tingkatan hingga mustahil sepakat berdusta — kepastian tertinggi.",
  },
  shahih: {
    label: "Shahih",
    className: "border-green-500/40 bg-green-500/15 text-green-600 dark:text-green-300",
    meaning: "Sanad bersambung dengan perawi adil lagi kuat hafalannya, tanpa cacat — sahih.",
  },
  hasan: {
    label: "Hasan",
    className: "border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300",
    meaning: "Seperti shahih namun hafalan sebagian perawinya sedikit di bawahnya — tetap bisa diamalkan.",
  },
  dhaif: {
    label: "Lemah (Dhaif)",
    className: "border-orange-500/40 bg-orange-500/15 text-orange-600 dark:text-orange-300",
    meaning: "Ada kelemahan pada sanad/perawi. Tidak dijadikan dalil hukum; disebutkan agar diketahui.",
  },
  maudhu: {
    label: "Palsu (Maudhu')",
    className: "border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-300",
    meaning: "Dusta yang dinisbatkan kepada Nabi ﷺ. HARAM diamalkan/disebarkan sebagai hadits — dicantumkan sebagai peringatan.",
  },
  lain: {
    label: "Perlu Ditinjau",
    className: "border-[var(--color-border)] bg-black/5 text-[var(--color-text-secondary)]",
    meaning: "Derajat belum terverifikasi.",
  },
};

/** Bucket a raw grade string. Order matters: check maudhu/mutawatir before the
 * looser shahih/hasan/dhaif keyword matches. */
export function gradeBucket(raw: string | null | undefined): GradeBucket {
  if (!raw) return "lain";
  const g = raw.toLowerCase();
  if (/(maudhu|maudu|mawdu|palsu|munkar|batil)/.test(g)) return "maudhu";
  if (/mutawatir/.test(g)) return "mutawatir";
  if (/(dhaif|dhoif|da'?if|dalif|lemah|dla'?if|dho'?if)/.test(g)) return "dhaif";
  if (/(shahih|sahih|sohih|صحيح)/.test(g)) return "shahih";
  if (/(hasan|حسن)/.test(g)) return "hasan";
  return "lain";
}

export function gradeInfo(raw: string | null | undefined): GradeInfo {
  const bucket = gradeBucket(raw);
  return { bucket, ...BUCKETS[bucket] };
}

/** The full legend, in strength order, for a badge key / admin stats. */
export const GRADE_ORDER: GradeBucket[] = ["mutawatir", "shahih", "hasan", "dhaif", "maudhu", "lain"];

export function gradeLabel(bucket: GradeBucket): string {
  return BUCKETS[bucket].label;
}
