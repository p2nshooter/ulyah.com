/**
 * Localized strings for the Live streaming hub (LiveHub). Each sibling site
 * shows its OWN native language (owner rule: .fr full French, .de full German,
 * never Indonesian/English fallback). `{site}` is filled with the tenant's own
 * brand name. Missing locales fall back to English, never Indonesian.
 */
export interface LiveLabels {
  offlineSlot: string;
  wantStream: string;
  hrs: string; // unit after "24"
  replay: string;
  maximize: string;
  notLive: string;
  openYoutube: string;
  mutedDefault: string;
  autoTitle: string;
  autoDesc: string;
  broadcastsTitle: string;
  broadcastsDesc: string;
  close: string;
}

const L: Record<string, (site: string) => LiveLabels> = {
  id: (site) => ({
    offlineSlot: "Slot siaran ini sedang offline.",
    wantStream: `Slot live streaming ini disewakan — pengunjung real dan ramai. Dana sewa dipergunakan untuk keberlangsungan ${site}. Hubungi salam@ulyah.com`,
    hrs: "JAM",
    replay: "REKAMAN",
    maximize: "Perbesar",
    notLive: "Sedang tidak siaran langsung — memutar video terbaru channel.",
    openYoutube: "Buka di YouTube",
    mutedDefault: "🔇 Suara mati bawaan — ketuk ikon speaker di pemutar untuk mengaktifkan.",
    autoTitle: "Live Otomatis 24 Jam — Dunia Islam",
    autoDesc:
      "Siaran resmi yang selalu mengudara — Makkah, Madinah, dan kanal Islami dunia. Mengikuti siaran langsung kanalnya secara otomatis.",
    broadcastsTitle: `Siaran ${site}`,
    broadcastsDesc: `Kajian dan siaran yang diisi langsung oleh pengelola ${site}.`,
    close: "Tutup",
  }),
  en: (site) => ({
    offlineSlot: "This stream slot is currently offline.",
    wantStream: `This live-stream slot is for rent — real, active visitors. Rental proceeds keep ${site} running. Contact salam@ulyah.com`,
    hrs: "HRS",
    replay: "REPLAY",
    maximize: "Maximize",
    notLive: "Not live right now — playing the channel's latest videos.",
    openYoutube: "Open on YouTube",
    mutedDefault: "🔇 Muted by default — tap the speaker icon in the player to unmute.",
    autoTitle: "Always-On 24h — Islamic World",
    autoDesc:
      "Official always-on broadcasts — Makkah, Madinah, and Islamic channels worldwide. Follows each channel's current live automatically.",
    broadcastsTitle: `${site} Broadcasts`,
    broadcastsDesc: `Lectures and broadcasts curated directly by the ${site} team.`,
    close: "Close",
  }),
  fr: (site) => ({
    offlineSlot: "Ce créneau de diffusion est actuellement hors ligne.",
    wantStream: `Ce créneau de diffusion en direct est à louer — visiteurs réels et nombreux. Les revenus de location font vivre ${site}. Contact : salam@ulyah.com`,
    hrs: "H",
    replay: "REDIFFUSION",
    maximize: "Agrandir",
    notLive: "Pas de direct pour le moment — lecture des dernières vidéos de la chaîne.",
    openYoutube: "Ouvrir sur YouTube",
    mutedDefault: "🔇 Son coupé par défaut — touchez l'icône du haut-parleur dans le lecteur pour l'activer.",
    autoTitle: "Direct 24h/24 — Monde islamique",
    autoDesc:
      "Diffusions officielles toujours en ligne — La Mecque, Médine et les chaînes islamiques du monde entier. Suit automatiquement le direct de chaque chaîne.",
    broadcastsTitle: `Diffusions ${site}`,
    broadcastsDesc: `Cours et diffusions proposés directement par l'équipe de ${site}.`,
    close: "Fermer",
  }),
  de: (site) => ({
    offlineSlot: "Dieser Übertragungskanal ist derzeit offline.",
    wantStream: `Dieser Livestream-Platz ist zu vermieten — echte, aktive Besucher. Die Mieteinnahmen erhalten ${site}. Kontakt: salam@ulyah.com`,
    hrs: "STD",
    replay: "AUFZEICHNUNG",
    maximize: "Vergrößern",
    notLive: "Derzeit keine Live-Übertragung — es werden die neuesten Videos des Kanals abgespielt.",
    openYoutube: "Auf YouTube öffnen",
    mutedDefault: "🔇 Standardmäßig stummgeschaltet — tippen Sie im Player auf das Lautsprechersymbol, um den Ton einzuschalten.",
    autoTitle: "Rund um die Uhr live — Islamische Welt",
    autoDesc:
      "Offizielle Dauerübertragungen — Mekka, Medina und islamische Kanäle weltweit. Folgt automatisch dem aktuellen Livestream jedes Kanals.",
    broadcastsTitle: `${site}-Übertragungen`,
    broadcastsDesc: `Vorträge und Übertragungen, direkt vom ${site}-Team kuratiert.`,
    close: "Schließen",
  }),
  es: (site) => ({
    offlineSlot: "Este canal de emisión está actualmente desconectado.",
    wantStream: `Este espacio de emisión en directo se alquila — visitantes reales y activos. El alquiler mantiene ${site} en marcha. Contacto: salam@ulyah.com`,
    hrs: "H",
    replay: "GRABACIÓN",
    maximize: "Ampliar",
    notLive: "Ahora no hay directo — se reproducen los últimos vídeos del canal.",
    openYoutube: "Abrir en YouTube",
    mutedDefault: "🔇 Silenciado por defecto — toca el icono del altavoz en el reproductor para activar el sonido.",
    autoTitle: "En directo 24 h — Mundo islámico",
    autoDesc:
      "Emisiones oficiales siempre en línea — La Meca, Medina y canales islámicos de todo el mundo. Sigue automáticamente el directo actual de cada canal.",
    broadcastsTitle: `Emisiones de ${site}`,
    broadcastsDesc: `Clases y emisiones seleccionadas directamente por el equipo de ${site}.`,
    close: "Cerrar",
  }),
  ar: (site) => ({
    offlineSlot: "قناة البث هذه غير متصلة حاليًا.",
    wantStream: `مساحة البث هذه متاحة للإيجار — زوار حقيقيون ونشطون. عائد الإيجار يُبقي ${site} مستمرًا. تواصل: salam@ulyah.com`,
    hrs: "ساعة",
    replay: "تسجيل",
    maximize: "تكبير",
    notLive: "لا يوجد بث مباشر الآن — يتم تشغيل أحدث مقاطع القناة.",
    openYoutube: "افتح على يوتيوب",
    mutedDefault: "🔇 الصوت مكتوم افتراضيًا — اضغط على أيقونة السماعة في المشغّل لتشغيله.",
    autoTitle: "بث مباشر 24 ساعة — العالم الإسلامي",
    autoDesc:
      "بثوث رسمية دائمة — مكة والمدينة وقنوات إسلامية من أنحاء العالم. تتابع البث المباشر الحالي لكل قناة تلقائيًا.",
    broadcastsTitle: `بثوث ${site}`,
    broadcastsDesc: `دروس وبثوث يقدمها فريق ${site} مباشرةً.`,
    close: "إغلاق",
  }),
};

export function liveLabels(locale: string, site: string): LiveLabels {
  return (L[locale] ?? L.en!)(site);
}
