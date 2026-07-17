// Self-contained donor-portal welcome copy, same pattern as thanks-labels.ts.
// The short greeting is written to sound natural when spoken aloud by the
// browser's voice engine on first entry — full sentences, no symbols.
// English is the fallback for locales not listed.

export interface PortalLabels {
  welcomeTitle: string;
  welcomeShort: string;
  linkThanks: string;
  linkVirtues: string;
  donateSectionTitle: string;
  donateSectionSubtitle: string;
}

const EN: PortalLabels = {
  welcomeTitle: "Welcome, Friend of the Syiar",
  welcomeShort:
    "Peace be upon you, and welcome to ULYAH.COM. Thank you for walking alongside us in carrying the light of the Qur'an to those who are still searching for it — may every moment you spend here be written as a good deed in your favor.",
  linkThanks: "Read the full acknowledgments →",
  linkVirtues: "See the promised reward for supporting the syiar ↓",
  donateSectionTitle: "Continue Sharing Goodness",
  donateSectionSubtitle:
    "Whenever you're ready to give again, every path is open to you here — no need to leave your dashboard.",
};

const ID: PortalLabels = {
  welcomeTitle: "Selamat Datang, Sahabat Syiar",
  welcomeShort:
    "Assalamu'alaikum, dan selamat datang di ULYAH.COM. Terima kasih telah berjalan bersama kami membawa cahaya Al-Qur'an kepada mereka yang masih mencarinya — semoga setiap saat yang Anda habiskan di sini tercatat sebagai kebaikan di sisi-Nya.",
  linkThanks: "Baca ucapan terima kasih selengkapnya →",
  linkVirtues: "Lihat janji pahala membantu syiar agama ↓",
  donateSectionTitle: "Lanjutkan Berbagi Kebaikan",
  donateSectionSubtitle:
    "Kapan pun Anda siap memberi lagi, semua jalan terbuka di sini — tanpa perlu meninggalkan dasbor Anda.",
};

const FR: PortalLabels = {
  welcomeTitle: "Bienvenue, ami de la cause",
  welcomeShort:
    "Que la paix soit sur vous, et bienvenue. Merci de cheminer à nos côtés pour porter la lumière du Coran vers ceux qui la cherchent encore — que chaque instant passé ici soit inscrit en votre faveur comme une bonne action.",
  linkThanks: "Lire les remerciements complets →",
  linkVirtues: "Voir la récompense promise pour le soutien à la cause ↓",
  donateSectionTitle: "Continuer à partager le bien",
  donateSectionSubtitle:
    "Dès que vous êtes prêt à donner de nouveau, toutes les voies vous sont ouvertes ici — sans quitter votre tableau de bord.",
};

const DE: PortalLabels = {
  welcomeTitle: "Willkommen, Freund der guten Sache",
  welcomeShort:
    "Friede sei mit Ihnen und willkommen. Danke, dass Sie an unserer Seite gehen, um das Licht des Korans zu jenen zu tragen, die es noch suchen — möge jeder Moment, den Sie hier verbringen, Ihnen als gute Tat angerechnet werden.",
  linkThanks: "Die vollständige Danksagung lesen →",
  linkVirtues: "Den versprochenen Lohn für die Unterstützung sehen ↓",
  donateSectionTitle: "Weiter Gutes teilen",
  donateSectionSubtitle:
    "Wann immer Sie bereit sind, erneut zu geben, stehen Ihnen hier alle Wege offen — ohne Ihr Dashboard zu verlassen.",
};

const MAP: Record<string, PortalLabels> = { en: EN, id: ID, fr: FR, de: DE };

export function portalLabels(locale: string): PortalLabels {
  return MAP[locale] ?? EN;
}
