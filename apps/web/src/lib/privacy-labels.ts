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
    "ULYAH.COM (\"we\", \"the site\") is a free, non-profit Islamic audio and knowledge platform. This page explains what information we collect, how it is used, and the choices you have — including around the third-party advertising that helps keep the site free.",
  sections: [
    {
      heading: "Information we collect",
      body: [
        "A locale preference cookie (which language you're browsing in) and, only if you register as a donor, a session cookie that keeps you signed in — this session cookie is a signed token and stores no personal data itself.",
        "If you register a donor account: your email, name, and country (detected from your connection, not asked directly) — used only to issue donation certificates and manage your account.",
        "Anonymous pageview analytics: the page path, your two-letter country (from Cloudflare's edge network), and your UI language. No IP address, name, or other identifier is stored alongside this.",
        "If you install ULYAH.COM or the Jadwal Sholat app to your home screen, we record that an install happened and which app, plus your country — no device identifier is stored.",
      ],
    },
    {
      heading: "Cookies and advertising",
      body: [
        "This site is supported by Google AdSense and Ezoic, which may use cookies and similar technologies to serve ads based on your visits to this and other websites, and to measure ad performance.",
        "Google's use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the Internet. You can opt out of personalized advertising by visiting Google's Ad Settings (adssettings.google.com). Users in the EEA, UK, and Switzerland can also manage consent choices for Google's ad partners.",
        "Learn more about how Google uses information from sites that use its services at policies.google.com/technologies/partner-sites.",
        "Ezoic's use of cookies and data is described in Ezoic's own privacy policy at ezoic.com/privacy-policy.",
        "You can control or delete cookies at any time through your browser settings. Blocking cookies may affect ad personalization but will not prevent you from reading or listening to any content on this site.",
      ],
    },
    {
      heading: "Payments",
      body: [
        "Donations are processed directly by PayPal and NOWPayments. We never see or store your card number, bank details, or wallet private keys — only the donation amount and, for approved proofs, the sender name you choose to submit for your certificate.",
      ],
    },
    {
      heading: "How we share data",
      body: [
        "We do not sell personal data. Data is shared only with the payment processors above (to complete a donation you initiate) and with the advertising networks described above (to serve and measure ads) — never for any other purpose.",
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
        "Questions about this policy or your data can be raised through the donor registration/contact flow on this site.",
      ],
    },
  ],
};

const ID: PrivacyLabels = {
  title: "Kebijakan Privasi",
  lastUpdated: "Terakhir diperbarui: 10 Juli 2026",
  intro:
    "ULYAH.COM (\"kami\", \"situs ini\") adalah platform audio dan ilmu Islam yang gratis dan nirlaba. Halaman ini menjelaskan data apa saja yang kami kumpulkan, bagaimana data itu digunakan, dan pilihan yang Anda miliki — termasuk terkait iklan pihak ketiga yang membantu situs ini tetap gratis.",
  sections: [
    {
      heading: "Data yang kami kumpulkan",
      body: [
        "Cookie preferensi bahasa (bahasa tampilan yang Anda pilih), dan — hanya jika Anda mendaftar sebagai donatur — cookie sesi login. Cookie sesi ini berupa token bertanda tangan digital dan tidak menyimpan data pribadi di dalamnya.",
        "Jika Anda mendaftar akun donatur: email, nama, dan negara (dideteksi dari koneksi Anda, bukan ditanyakan langsung) — digunakan hanya untuk menerbitkan sertifikat donasi dan mengelola akun Anda.",
        "Analitik kunjungan anonim: jalur halaman, kode negara dua-huruf (dari jaringan edge Cloudflare), dan bahasa tampilan Anda. Tidak ada alamat IP, nama, atau identitas lain yang disimpan bersamanya.",
        "Jika Anda memasang aplikasi ULYAH.COM atau Jadwal Sholat ke layar utama HP, kami mencatat bahwa pemasangan terjadi dan aplikasi mana, beserta negara Anda — tanpa menyimpan identitas perangkat.",
      ],
    },
    {
      heading: "Cookie dan iklan",
      body: [
        "Situs ini didukung oleh Google AdSense dan Ezoic, yang dapat menggunakan cookie dan teknologi serupa untuk menayangkan iklan berdasarkan kunjungan Anda ke situs ini maupun situs lain, serta mengukur performa iklan.",
        "Penggunaan cookie periklanan oleh Google memungkinkan Google dan mitranya menayangkan iklan berdasarkan kunjungan Anda ke situs ini dan/atau situs lain di Internet. Anda dapat menonaktifkan iklan yang dipersonalisasi melalui Pengaturan Iklan Google (adssettings.google.com).",
        "Pelajari lebih lanjut bagaimana Google menggunakan informasi dari situs yang menggunakan layanannya di policies.google.com/technologies/partner-sites.",
        "Penggunaan cookie dan data oleh Ezoic dijelaskan dalam kebijakan privasi Ezoic sendiri di ezoic.com/privacy-policy.",
        "Anda dapat mengatur atau menghapus cookie kapan saja melalui pengaturan browser. Memblokir cookie dapat memengaruhi personalisasi iklan, tetapi tidak akan menghalangi Anda membaca atau mendengarkan konten apa pun di situs ini.",
      ],
    },
    {
      heading: "Pembayaran",
      body: [
        "Donasi diproses langsung oleh PayPal dan NOWPayments. Kami tidak pernah melihat atau menyimpan nomor kartu, data rekening bank, atau kunci privat dompet kripto Anda — hanya jumlah donasi dan, untuk bukti transfer yang disetujui, nama pengirim yang Anda pilih untuk dicantumkan pada sertifikat.",
      ],
    },
    {
      heading: "Bagaimana kami membagikan data",
      body: [
        "Kami tidak menjual data pribadi. Data hanya dibagikan dengan prosesor pembayaran di atas (untuk menyelesaikan donasi yang Anda mulai) dan dengan jaringan periklanan yang disebutkan di atas (untuk menayangkan dan mengukur iklan) — tidak untuk tujuan lain.",
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
        "Pertanyaan tentang kebijakan ini atau data Anda dapat disampaikan melalui alur pendaftaran/kontak donatur di situs ini.",
      ],
    },
  ],
};

const MAP: Record<string, PrivacyLabels> = { en: EN, id: ID };

export function privacyLabels(locale: string): PrivacyLabels {
  return MAP[locale] ?? EN;
}
