// Self-contained privacy policy content, same pattern as prayer-labels.ts —
// a real legal document should not be run through on-demand machine
// translation. Indonesian (the site's primary audience) and English are
// hand-written in full; other locales fall back to the English version.

export interface PrivacySection {
  heading: string;
  body: string[];
}

export interface PrivacyLabels {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
}

const EN: PrivacyLabels = {
  title: "Privacy Policy",
  lastUpdated: "Last updated: July 10, 2026",
  intro:
    "ULYAH.COM (\"we\", \"the site\") is a free, non-profit Islamic audio and knowledge platform. This page explains what little information we collect and how it is used. There are no ads and no advertising cookies on this site.",
  sections: [
    {
      heading: "No advertising, no ad cookies",
      body: [
        "This site carries no ads — not from Google AdSense, not from Adsterra, not from any other ad network. Nothing on this site sets an advertising or tracking cookie, and no data is ever shared with an ad network for any purpose.",
      ],
    },
    {
      heading: "Information we collect",
      body: [
        "A locale preference cookie (which language you're browsing in) — that's it, unless you choose to submit a donation and want a keepsake certificate for it (see below).",
        "Donating itself requires no account and no registration — we take no data from you at all to accept a donation. Only if you want a personalised keepsake certificate for your donation do we ask for the name/email to put on it, purely to generate and send that certificate.",
        "Anonymous pageview analytics: the page path, your two-letter country (from Cloudflare's edge network), and your UI language. No IP address, name, or other identifier is stored alongside this.",
        "If you install ULYAH.COM or the Jadwal Sholat app to your home screen, we record that an install happened and which app, plus your country — no device identifier is stored.",
      ],
    },
    {
      heading: "Payments",
      body: [
        "Donations are processed directly by PayPal and NOWPayments. We never see or store your card number, bank details, or wallet private keys — only the donation amount and, only if you asked for a keepsake certificate, the name you chose to submit for it.",
      ],
    },
    {
      heading: "How we share data",
      body: [
        "We do not sell personal data, and we do not share it with any advertising network — this site has none. Data is shared only with the payment processors above, solely to complete a donation you initiate.",
      ],
    },
    {
      heading: "Children's privacy",
      body: [
        "This site is intended for a general audience and does not knowingly collect personal data from children beyond the anonymous analytics described above.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        "We may update this page as the site evolves. The \"Last updated\" date at the top will always reflect the latest version.",
      ],
    },
    {
      heading: "Contact",
      body: [
        "Questions about this policy or your data can be sent to salam@ulyah.com.",
      ],
    },
  ],
};

const ID: PrivacyLabels = {
  title: "Kebijakan Privasi",
  lastUpdated: "Terakhir diperbarui: 10 Juli 2026",
  intro:
    "ULYAH.COM (\"kami\", \"situs ini\") adalah platform audio dan ilmu Islam yang gratis dan nirlaba. Halaman ini menjelaskan data (yang sangat sedikit) yang kami kumpulkan dan bagaimana data itu digunakan. Situs ini tidak memuat iklan maupun cookie iklan sama sekali.",
  sections: [
    {
      heading: "Tanpa iklan, tanpa cookie iklan",
      body: [
        "Situs ini tidak memuat iklan apa pun — bukan Google AdSense, bukan Adsterra, bukan jaringan iklan lainnya. Tidak ada bagian dari situs ini yang memasang cookie iklan/pelacakan, dan tidak ada data yang pernah dibagikan ke jaringan iklan untuk tujuan apa pun.",
      ],
    },
    {
      heading: "Data yang kami kumpulkan",
      body: [
        "Cookie preferensi bahasa (bahasa tampilan yang Anda pilih) — itu saja, kecuali Anda memilih berdonasi dan ingin mendapat sertifikat kenang-kenangan (lihat di bawah).",
        "Berdonasi sendiri tidak memerlukan akun atau pendaftaran apa pun — kami tidak mengambil data apa pun dari Anda untuk menerima donasi. Hanya jika Anda ingin sertifikat kenang-kenangan yang dipersonalisasi untuk donasi Anda, kami meminta nama/email untuk dicantumkan di sertifikat itu, semata untuk membuat dan mengirimkannya.",
        "Analitik kunjungan anonim: jalur halaman, kode negara dua-huruf (dari jaringan edge Cloudflare), dan bahasa tampilan Anda. Tidak ada alamat IP, nama, atau identitas lain yang disimpan bersamanya.",
        "Jika Anda memasang aplikasi ULYAH.COM atau Jadwal Sholat ke layar utama HP, kami mencatat bahwa pemasangan terjadi dan aplikasi mana, beserta negara Anda — tanpa menyimpan identitas perangkat.",
      ],
    },
    {
      heading: "Pembayaran",
      body: [
        "Donasi diproses langsung oleh PayPal dan NOWPayments. Kami tidak pernah melihat atau menyimpan nomor kartu, data rekening bank, atau kunci privat dompet kripto Anda — hanya jumlah donasi dan, hanya jika Anda meminta sertifikat kenang-kenangan, nama yang Anda pilih untuk dicantumkan di sertifikat tersebut.",
      ],
    },
    {
      heading: "Bagaimana kami membagikan data",
      body: [
        "Kami tidak menjual data pribadi, dan tidak membagikannya ke jaringan iklan mana pun — situs ini tidak memilikinya. Data hanya dibagikan dengan prosesor pembayaran di atas, semata untuk menyelesaikan donasi yang Anda mulai.",
      ],
    },
    {
      heading: "Privasi anak",
      body: [
        "Situs ini ditujukan untuk khalayak umum dan tidak secara sengaja mengumpulkan data pribadi dari anak-anak di luar analitik anonim yang dijelaskan di atas.",
      ],
    },
    {
      heading: "Perubahan kebijakan",
      body: [
        "Kami dapat memperbarui halaman ini seiring perkembangan situs. Tanggal \"Terakhir diperbarui\" di bagian atas akan selalu mencerminkan versi terbaru.",
      ],
    },
    {
      heading: "Kontak",
      body: [
        "Pertanyaan tentang kebijakan ini atau data Anda dapat dikirim ke salam@ulyah.com.",
      ],
    },
  ],
};

const MAP: Record<string, PrivacyLabels> = { en: EN, id: ID };

export function privacyLabels(locale: string): PrivacyLabels {
  return MAP[locale] ?? EN;
}
