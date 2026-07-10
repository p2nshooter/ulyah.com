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

const MAP: Record<string, PortalLabels> = { en: EN, id: ID };

export function portalLabels(locale: string): PortalLabels {
  return MAP[locale] ?? EN;
}
