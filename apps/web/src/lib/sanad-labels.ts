// Self-contained UI strings for the Pohon Sanad (isnad chain tree) pages,
// same pattern as radio-labels.ts / mushaf-labels.ts. English is the
// fallback for locales not listed below.

export interface SanadLabels {
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  subtitle: string;
  browseTitle: string;
  viewChain: string;
  chainTitle: string;
  compilerLabel: string;
  prophetLabel: string;
  linkCount: (n: number) => string;
  narratorDetail: string;
  generation: string;
  reliabilityGrade: string;
  deathYear: string;
  bioPending: string;
  listenBio: string;
  stopListening: string;
  otherChains: string;
  otherChainsEmpty: string;
  backToList: string;
  emptyList: string;
  hadithText: string;
}

const EN: SanadLabels = {
  navLabel: "Sanad Tree",
  metaTitle: "Pohon Sanad — Hadith Narrator Chains · ULYAH.COM",
  metaDescription:
    "Explore the chain of narrators (isnad) behind authenticated hadith, extracted from the hadith texts themselves and reviewed before publishing — never fabricated.",
  title: "Pohon Sanad",
  subtitle: "The chain of narrators behind each hadith, from the Prophet ﷺ down to the compiler who recorded it.",
  browseTitle: "Browse hadith with a verified chain",
  viewChain: "View chain →",
  chainTitle: "Chain of Narration",
  compilerLabel: "Compiler",
  prophetLabel: "The Prophet ﷺ",
  linkCount: (n) => `${n} narrators`,
  narratorDetail: "Narrator",
  generation: "Generation",
  reliabilityGrade: "Reliability grade",
  deathYear: "Died (Hijri)",
  bioPending: "Biography is being completed.",
  listenBio: "🔊 Listen",
  stopListening: "⏹ Stop",
  otherChains: "Also appears in",
  otherChainsEmpty: "No other reviewed chains yet.",
  backToList: "← Back to list",
  emptyList: "No verified chains published yet — check back soon.",
  hadithText: "Hadith text",
};

const ID: SanadLabels = {
  navLabel: "Pohon Sanad",
  metaTitle: "Pohon Sanad — Rantai Perawi Hadits · ULYAH.COM",
  metaDescription:
    "Jelajahi rantai perawi (isnad) di balik hadits-hadits yang telah diverifikasi, diekstrak dari teks hadits itu sendiri dan ditinjau sebelum tayang — tidak pernah dikarang.",
  title: "Pohon Sanad",
  subtitle: "Rantai perawi di balik setiap hadits, dari Rasulullah ﷺ hingga perawi yang membukukannya.",
  browseTitle: "Jelajahi hadits dengan rantai terverifikasi",
  viewChain: "Lihat rantai →",
  chainTitle: "Rantai Periwayatan",
  compilerLabel: "Pembukuan",
  prophetLabel: "Rasulullah ﷺ",
  linkCount: (n) => `${n} perawi`,
  narratorDetail: "Perawi",
  generation: "Tabaqah (generasi)",
  reliabilityGrade: "Tingkat kepercayaan",
  deathYear: "Wafat (Hijriyah)",
  bioPending: "Biografi sedang dilengkapi.",
  listenBio: "🔊 Dengarkan",
  stopListening: "⏹ Berhenti",
  otherChains: "Juga muncul di",
  otherChainsEmpty: "Belum ada rantai lain yang tertinjau.",
  backToList: "← Kembali ke daftar",
  emptyList: "Belum ada rantai terverifikasi yang tayang — cek lagi nanti.",
  hadithText: "Teks hadits",
};

const AR: SanadLabels = {
  navLabel: "شجرة السند",
  metaTitle: "شجرة السند — سلاسل رواة الحديث · ULYAH.COM",
  metaDescription: "استكشف سلسلة رواة الحديث الصحيح، مستخرجة من نص الحديث نفسه ومراجعة قبل النشر — لا يوجد تأليف.",
  title: "شجرة السند",
  subtitle: "سلسلة الرواة وراء كل حديث، من النبي ﷺ إلى من دوّنه.",
  browseTitle: "تصفح الأحاديث ذات السند الموثّق",
  viewChain: "عرض السلسلة ←",
  chainTitle: "سلسلة الرواية",
  compilerLabel: "المُدوِّن",
  prophetLabel: "النبي ﷺ",
  linkCount: (n) => `${n} راوٍ`,
  narratorDetail: "الراوي",
  generation: "الطبقة",
  reliabilityGrade: "درجة التوثيق",
  deathYear: "الوفاة (هجري)",
  bioPending: "السيرة قيد الإكمال.",
  listenBio: "🔊 استمع",
  stopListening: "⏹ إيقاف",
  otherChains: "يظهر أيضاً في",
  otherChainsEmpty: "لا توجد سلاسل أخرى مراجعة بعد.",
  backToList: "← العودة إلى القائمة",
  emptyList: "لا توجد سلاسل موثّقة منشورة بعد — تحقق لاحقاً.",
  hadithText: "نص الحديث",
};

const MAP: Record<string, SanadLabels> = { en: EN, id: ID, ar: AR };

export function sanadLabels(locale: string): SanadLabels {
  return MAP[locale] ?? EN;
}
