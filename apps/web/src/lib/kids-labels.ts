// Self-contained UI strings for Kisah Anak (kids' animated stories), same
// pattern as sanad-labels.ts / mushaf-labels.ts. English is the fallback
// for locales not listed below.

export interface KidsLabels {
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  loading: string;
  play: string;
  pause: string;
  replay: string;
  sceneOf: (current: number, total: number) => string;
  emptyList: string;
  readStory: string;
  backToList: string;
}

const EN: KidsLabels = {
  navLabel: "Kids Stories",
  metaTitle: "Kisah Anak — Animated Islamic Stories for Kids · ULYAH.COM",
  metaDescription:
    "Gentle, beautifully animated Islamic stories for children, narrated aloud in your chosen language, each teaching a value from the Qur'an and Sunnah.",
  title: "Kisah Anak",
  subtitle: "Animated stories that teach good character, narrated aloud for little ones.",
  loading: "Loading the story…",
  play: "Play",
  pause: "Pause",
  replay: "Replay",
  sceneOf: (current, total) => `Scene ${current} of ${total}`,
  emptyList: "No stories published yet — check back soon.",
  readStory: "Watch story →",
  backToList: "← Back to stories",
};

const ID: KidsLabels = {
  navLabel: "Kisah Anak",
  metaTitle: "Kisah Anak — Kisah Islami Animasi untuk Anak · ULYAH.COM",
  metaDescription:
    "Kisah-kisah Islami beranimasi indah untuk anak-anak, dibacakan dalam bahasa pilihanmu, masing-masing mengajarkan akhlak dari Al-Qur'an dan Sunnah.",
  title: "Kisah Anak",
  subtitle: "Kisah beranimasi yang mengajarkan akhlak baik, dibacakan untuk si kecil.",
  loading: "Memuat kisah…",
  play: "Putar",
  pause: "Jeda",
  replay: "Ulangi",
  sceneOf: (current, total) => `Adegan ${current} dari ${total}`,
  emptyList: "Belum ada kisah yang tayang — cek lagi nanti.",
  readStory: "Tonton kisah →",
  backToList: "← Kembali ke daftar kisah",
};

const AR: KidsLabels = {
  navLabel: "قصص الأطفال",
  metaTitle: "قصص الأطفال — قصص إسلامية متحركة للأطفال · ULYAH.COM",
  metaDescription: "قصص إسلامية متحركة جميلة للأطفال، مروية بصوت باللغة التي تختارها، تعلّم كل واحدة منها خُلقاً من القرآن والسنة.",
  title: "قصص الأطفال",
  subtitle: "قصص متحركة تعلّم الأخلاق الحسنة، مروية للصغار.",
  loading: "جارٍ تحميل القصة…",
  play: "تشغيل",
  pause: "إيقاف مؤقت",
  replay: "إعادة",
  sceneOf: (current, total) => `المشهد ${current} من ${total}`,
  emptyList: "لا توجد قصص منشورة بعد — تحقق لاحقاً.",
  readStory: "شاهد القصة ←",
  backToList: "← العودة إلى القصص",
};

const MAP: Record<string, KidsLabels> = { en: EN, id: ID, ar: AR };

export function kidsLabels(locale: string): KidsLabels {
  return MAP[locale] ?? EN;
}
