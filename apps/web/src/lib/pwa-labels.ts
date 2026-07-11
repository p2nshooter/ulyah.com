// Self-contained UI strings for the header's install-app button, same
// pattern as radio-labels.ts. English is the fallback for locales not listed.

export interface PwaLabels {
  installApp: string;
  iosHint: string;
  manualHint: string;
  downloadSectionTitle: string;
  downloadSectionSubtitle: string;
  mainAppName: string;
  mainAppDesc: string;
  sholatAppName: string;
  sholatAppDesc: string;
  sholatAppCta: string;
  alreadyInstalled: string;
}

const EN: PwaLabels = {
  installApp: "Install App",
  iosHint: "On iPhone/iPad: tap the Share icon, then \"Add to Home Screen\".",
  manualHint: "Open your browser's menu (⋮ or ···) and choose \"Add to Home Screen\" or \"Install App\".",
  downloadSectionTitle: "📲 Download the App",
  downloadSectionSubtitle: "Install ULYAH.COM on your phone — free, no app store needed, one tap.",
  mainAppName: "ULYAH.COM App",
  mainAppDesc: "The full platform: live Radio Qori, Qur'an, hadith, kitab library and kisah — offline-ready home screen icon.",
  sholatAppName: "Jadwal Sholat App",
  sholatAppDesc: "A lightweight standalone reminder: prayer times locked to your location, Hijri countdown, world clocks — with the live radio still playing.",
  sholatAppCta: "Open & Install →",
  alreadyInstalled: "Already installed on this device ✓",
};

const ID: PwaLabels = {
  installApp: "Pasang Aplikasi",
  iosHint: "Di iPhone/iPad: ketuk ikon Share, lalu pilih \"Add to Home Screen\".",
  manualHint: "Buka menu browser Anda (⋮ atau ···), lalu pilih \"Add to Home Screen\" atau \"Install App\".",
  downloadSectionTitle: "📲 Download Aplikasi",
  downloadSectionSubtitle: "Pasang ULYAH.COM di HP kamu — gratis, tanpa app store, cukup satu ketukan.",
  mainAppName: "Aplikasi ULYAH.COM",
  mainAppDesc: "Platform lengkap: Radio Qori Dunia live, Al-Qur'an, hadits, perpustakaan kitab dan kisah — ikon di layar utama HP.",
  sholatAppName: "Aplikasi Jadwal Sholat",
  sholatAppDesc: "Pengingat ringan berdiri sendiri: waktu sholat sesuai lokasi kamu, hitung mundur Hijriah, jam dunia — radio live tetap jalan.",
  sholatAppCta: "Buka & Pasang →",
  alreadyInstalled: "Sudah terpasang di perangkat ini ✓",
};

const AR: PwaLabels = {
  installApp: "تثبيت التطبيق",
  iosHint: "على آيفون/آيباد: اضغط على أيقونة المشاركة، ثم اختر \"إضافة إلى الشاشة الرئيسية\".",
  manualHint: "افتح قائمة المتصفح (⋮ أو ···) ثم اختر \"إضافة إلى الشاشة الرئيسية\" أو \"تثبيت التطبيق\".",
  downloadSectionTitle: "📲 تحميل التطبيق",
  downloadSectionSubtitle: "ثبّت ULYAH.COM على هاتفك — مجانًا، بدون متجر تطبيقات، بضغطة واحدة.",
  mainAppName: "تطبيق ULYAH.COM",
  mainAppDesc: "المنصة الكاملة: راديو القرّاء المباشر، القرآن، الحديث، مكتبة الكتب والقصص — أيقونة على الشاشة الرئيسية.",
  sholatAppName: "تطبيق مواقيت الصلاة",
  sholatAppDesc: "تذكير خفيف مستقل: مواقيت الصلاة حسب موقعك، العد التنازلي الهجري، ساعات العالم — مع استمرار الراديو المباشر.",
  sholatAppCta: "افتح وثبّت ←",
  alreadyInstalled: "مثبّت بالفعل على هذا الجهاز ✓",
};

const MAP: Record<string, PwaLabels> = { en: EN, id: ID, ar: AR };

export function pwaLabels(locale: string): PwaLabels {
  return MAP[locale] ?? EN;
}
