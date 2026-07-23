import { fillLabels } from "./fill-labels";
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
  installedBadge: string;
}

const EN: PwaLabels = {
  installApp: "Install App",
  iosHint: "On iPhone/iPad: tap the Share icon, then \"Add to Home Screen\".",
  manualHint: "Open your browser's menu (⋮ or ···) and choose \"Add to Home Screen\". Opened this from another app? Try opening it in Chrome or Safari first.",
  downloadSectionTitle: "📲 Download the App",
  downloadSectionSubtitle: "Free. One tap. No app store needed.",
  mainAppName: "ULYAH.COM App",
  mainAppDesc: "Qur'an, radio, hadith & kitab — always with you.",
  sholatAppName: "Jadwal Sholat App",
  sholatAppDesc: "Prayer times & live radio, always on your home screen.",
  sholatAppCta: "Open & Install →",
  alreadyInstalled: "Already installed on this device ✓",
  installedBadge: "Installed on this device",
};

const ID: PwaLabels = {
  installApp: "Pasang Aplikasi",
  iosHint: "Di iPhone/iPad: ketuk ikon Share, lalu pilih \"Add to Home Screen\".",
  manualHint: "Buka menu browser (⋮ atau ···), lalu pilih \"Add to Home Screen\". Jika dibuka dari aplikasi lain (mis. WhatsApp), coba buka dulu di Chrome/Safari.",
  downloadSectionTitle: "📲 Download Aplikasi",
  downloadSectionSubtitle: "Gratis. Sekali ketuk. Tanpa app store.",
  mainAppName: "Aplikasi ULYAH.COM",
  mainAppDesc: "Al-Qur'an, radio, hadits & kitab — selalu di genggaman.",
  sholatAppName: "Aplikasi Jadwal Sholat",
  sholatAppDesc: "Waktu sholat & radio live, selalu di layar utama HP.",
  sholatAppCta: "Buka & Pasang →",
  alreadyInstalled: "Sudah terpasang di perangkat ini ✓",
  installedBadge: "Terpasang di perangkat ini",
};

const AR: PwaLabels = {
  installApp: "تثبيت التطبيق",
  iosHint: "على آيفون/آيباد: اضغط على أيقونة المشاركة، ثم اختر \"إضافة إلى الشاشة الرئيسية\".",
  manualHint: "افتح قائمة المتصفح (⋮ أو ···) ثم اختر \"إضافة إلى الشاشة الرئيسية\". إذا فتحت هذا من تطبيق آخر (مثل واتساب)، جرّب فتحه في Chrome أو Safari أولاً.",
  downloadSectionTitle: "📲 تحميل التطبيق",
  downloadSectionSubtitle: "مجانًا. بضغطة واحدة. بدون متجر تطبيقات.",
  mainAppName: "تطبيق ULYAH.COM",
  mainAppDesc: "القرآن والراديو والحديث والكتب — دائمًا معك.",
  sholatAppName: "تطبيق مواقيت الصلاة",
  sholatAppDesc: "مواقيت الصلاة والراديو المباشر، دائمًا على شاشتك الرئيسية.",
  sholatAppCta: "افتح وثبّت ←",
  alreadyInstalled: "مثبّت بالفعل على هذا الجهاز ✓",
  installedBadge: "مثبّت على هذا الجهاز",
};

const FR: PwaLabels = {
  installApp: "Installer l'application",
  iosHint: "Sur iPhone/iPad : touchez l'icône Partager, puis « Ajouter à l'écran d'accueil ».",
  manualHint: "Ouvrez le menu du navigateur (⋮ ou ···), puis choisissez « Ajouter à l'écran d'accueil ». Ouvert depuis une autre application ? Essayez d'abord dans Chrome ou Safari.",
  downloadSectionTitle: "📲 Télécharger l'application",
  downloadSectionSubtitle: "Gratuit. En un geste. Sans app store.",
  mainAppName: "Application One Faith France",
  mainAppDesc: "Coran, radio, hadiths & livres — toujours avec vous.",
  sholatAppName: "Application Heures de prière",
  sholatAppDesc: "Heures de prière & radio en direct, toujours sur votre écran d'accueil.",
  sholatAppCta: "Ouvrir & installer →",
  alreadyInstalled: "Déjà installée sur cet appareil ✓",
  installedBadge: "Installée sur cet appareil",
};

const DE: PwaLabels = {
  installApp: "App installieren",
  iosHint: "Auf iPhone/iPad: Tippe auf das Teilen-Symbol und wähle „Zum Home-Bildschirm hinzufügen“.",
  manualHint: "Öffne das Browser-Menü (⋮ oder ···) und wähle „Zum Home-Bildschirm hinzufügen“. Aus einer anderen App geöffnet? Versuche es zuerst in Chrome oder Safari.",
  downloadSectionTitle: "📲 App herunterladen",
  downloadSectionSubtitle: "Kostenlos. Ein Tipp. Kein App Store nötig.",
  mainAppName: "Tilawa-App",
  mainAppDesc: "Koran, Radio, Hadithe & Bücher — immer dabei.",
  sholatAppName: "Gebetszeiten-App",
  sholatAppDesc: "Gebetszeiten & Live-Radio, immer auf deinem Startbildschirm.",
  sholatAppCta: "Öffnen & installieren →",
  alreadyInstalled: "Bereits auf diesem Gerät installiert ✓",
  installedBadge: "Auf diesem Gerät installiert",
};

const ES: PwaLabels = {
  installApp: "Instalar la aplicación",
  iosHint: "En iPhone/iPad: toca el icono de Compartir y elige «Añadir a pantalla de inicio».",
  manualHint: "Abre el menú del navegador (⋮ o ···) y elige «Añadir a pantalla de inicio». ¿Lo abriste desde otra app? Prueba primero en Chrome o Safari.",
  downloadSectionTitle: "📲 Descargar la aplicación",
  downloadSectionSubtitle: "Gratis. Con un toque. Sin tienda de aplicaciones.",
  mainAppName: "Aplicación Dawa",
  mainAppDesc: "Corán, radio, hadices y libros — siempre contigo.",
  sholatAppName: "Aplicación de horarios de oración",
  sholatAppDesc: "Horarios de oración y radio en directo, siempre en tu pantalla de inicio.",
  sholatAppCta: "Abrir e instalar →",
  alreadyInstalled: "Ya instalada en este dispositivo ✓",
  installedBadge: "Instalada en este dispositivo",
};

const MAP: Record<string, PwaLabels> = { en: EN, id: ID, ar: AR, fr: FR, de: DE, es: ES };

export function pwaLabels(locale: string): PwaLabels {
  return MAP[locale] ?? fillLabels(locale, EN);
}
