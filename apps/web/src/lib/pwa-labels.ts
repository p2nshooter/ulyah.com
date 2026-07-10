// Self-contained UI strings for the header's install-app button, same
// pattern as radio-labels.ts. English is the fallback for locales not listed.

export interface PwaLabels {
  installApp: string;
  iosHint: string;
}

const EN: PwaLabels = {
  installApp: "Install App",
  iosHint: "On iPhone/iPad: tap the Share icon, then \"Add to Home Screen\".",
};

const ID: PwaLabels = {
  installApp: "Pasang Aplikasi",
  iosHint: "Di iPhone/iPad: ketuk ikon Share, lalu pilih \"Add to Home Screen\".",
};

const AR: PwaLabels = {
  installApp: "تثبيت التطبيق",
  iosHint: "على آيفون/آيباد: اضغط على أيقونة المشاركة، ثم اختر \"إضافة إلى الشاشة الرئيسية\".",
};

const MAP: Record<string, PwaLabels> = { en: EN, id: ID, ar: AR };

export function pwaLabels(locale: string): PwaLabels {
  return MAP[locale] ?? EN;
}
