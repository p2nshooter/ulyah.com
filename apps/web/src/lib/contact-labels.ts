// Self-contained contact-page content, same pattern as thanks-labels.ts —
// Indonesian and English hand-written in full; other locales fall back to
// English.

export interface ContactLabels {
  navLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  emailLabel: string;
  dedication: string;
  responseNote: string;
  otherLinksLabel: string;
}

const EN: ContactLabels = {
  navLabel: "Contact Us",
  title: "Contact Us",
  subtitle: "We'd love to hear from you.",
  intro:
    "A question, some feedback, a correction to suggest, or just a word of greeting — send it to our official email below. For donation matters, visit the Donation page; for questions about your data, see our Privacy Policy.",
  emailLabel: "Official email",
  dedication:
    "Every message that reaches us is received with an open heart. This inbox is not merely an inbox — it is part of our effort to faithfully carry the trust of conveying knowledge. We dedicate this space to anyone who wishes to ask, to correct us, to suggest good, or simply to say hello, for every word you send becomes part of the improvement we continue to strive for, God willing.",
  responseNote: "We read every message that arrives, though a reply may take some time — thank you for your patience.",
  otherLinksLabel: "You may also be looking for",
};

const ID: ContactLabels = {
  navLabel: "Kontak Kami",
  title: "Kontak Kami",
  subtitle: "Kami senang mendengar dari Anda.",
  intro:
    "Ada pertanyaan, masukan, koreksi atas konten, atau sekadar ingin menyapa? Kirimkan ke email resmi kami di bawah ini. Untuk urusan donasi, kunjungi halaman Donasi; untuk pertanyaan seputar data pribadi Anda, lihat Kebijakan Privasi kami.",
  emailLabel: "Email resmi",
  dedication:
    "Setiap pesan yang singgah di sini kami terima dengan hati terbuka. Kotak pesan ini bukan sekadar kotak masuk — ia bagian dari ikhtiar kami menjaga amanah menyampaikan ilmu. Kami dedikasikan ruang ini untuk siapa pun yang ingin bertanya, mengoreksi kami, mengusulkan kebaikan, atau sekadar menyapa, sebab setiap kata yang Anda kirimkan menjadi bagian dari perbaikan yang terus kami perjuangkan, insyaAllah.",
  responseNote: "Kami membaca setiap pesan yang masuk, meski balasan mungkin membutuhkan waktu — mohon kesabarannya.",
  otherLinksLabel: "Mungkin Anda juga mencari",
};

const MAP: Record<string, ContactLabels> = { en: EN, id: ID };

export function contactLabels(locale: string): ContactLabels {
  return MAP[locale] ?? EN;
}
