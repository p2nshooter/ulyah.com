/**
 * The words of the sale of each site (docs/ADSENSE-BLUEPRINT.md §17, §17.3), in the site's
 * own language: ulyah.com Indonesian, 1fr.fr French, tilawa.de German, dawa.im Spanish,
 * xad.es English. The same parts on every site — the home-page band, the price card, what
 * the site holds, the income it carries, what the buyer receives, the steps, the demo
 * login, the offer form, the questions and the other sites on sale.
 *
 * Every claim is something the site really has (the platform is shared; the kitab count is
 * read from the library). No traffic or income figure is claimed, and no Hajj & Umrah price
 * (owner, 29 Oct 2026: "Jgn d kasih harga dulu haji umroh").
 */

export interface SaleCtx {
  /** The site's brand ("ULYAH.COM", "One Faith France", …) and domain. */
  name: string;
  domain: string;
  /** Prices already written the site's way (usd()). */
  price: string;
  min: string;
  negotiable: boolean;
  kitabTotal: number;
  kitabCats: number;
  iqroLevels: number;
}

type Item = [string, string];

export interface SaleCopy {
  band: { eyebrow: string; strong: string; rest: string; nego: string; minimum: string; cta: string; aria: string };
  eyebrow: string;
  h1: string;
  lead: string;
  ctaOffer: string;
  ctaWa: string;
  waText: string;
  priceLabel: string;
  nego: string;
  minLabel: string;
  emailLabel: string;
  numbers: Item[];
  liveTitle: string;
  liveText: string;
  liveLink: string;
  /** The Makkah live player's caption, loading text and frame title. */
  liveBox: { label: string; loading: string; frame: string };
  insideTitle: string;
  inside: { icon: string; title: string; items: Item[] }[];
  incomeTitle: string;
  income: [string, string, string][];
  benefitLabel: string;
  benefitText: string;
  receiveTitle: string;
  receive: string[];
  stepsTitle: string;
  steps: Item[];
  demo: { title: string; text: string; open: string; address: string; user: string; pass: string };
  offerTitle: string;
  offerLead: string;
  offerDirect: string;
  faqTitle: string;
  faq: Item[];
  network: { title: string; lead: string; view: string; nego: string; minimum: string };
  form: {
    name: string; email: string; whatsapp: string; company: string; country: string; amount: string; message: string; messageHint: string;
    minimum: string; youOffer: string; send: string; sending: string; privacy: string;
    sentTitle: string; sent: string;
    errAmount: string; errEmail: string; errName: string; errCountry: string; errRate: string; errHidden: string; errOther: string;
  };
  meta: { title: string; hiddenTitle: string; description: string; ldName: string; ldDescription: string };
}

const nf = (n: number, locale: string) => n.toLocaleString(locale);
const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => v[k] ?? m);

/* ─────────────────────────── Indonesian (ulyah.com) ─────────────────────────── */

function id(c: SaleCtx): SaleCopy {
  const kitab = c.kitabTotal ? nf(c.kitabTotal, "id-ID") : "";
  return {
    band: {
      eyebrow: "🏷️ Kesempatan akuisisi",
      strong: `${c.name} dijual`,
      rest: " — platform Islam digital lengkap, siap dilanjutkan pemilik baru.",
      nego: "Bisa nego · ",
      minimum: "penawaran minimum",
      cta: "Lihat detail & ajukan penawaran →",
      aria: `${c.name} dijual`,
    },
    eyebrow: `🏷️ Kesempatan akuisisi · ${c.name}`,
    h1: `${c.name} dijual — platform Islam digital yang sudah berjalan, siap Anda lanjutkan.`,
    lead:
      "Al-Qur'an lengkap yang bisa didengar beserta tafsir dan hadits, perpustakaan kitab klasik, kisah, pendidikan anak, ibadah harian, live Makkah–Madinah 24 jam, dan portal admin yang mengendalikan semuanya. Dialihkan utuh kepada pemilik baru: domain, platform, konten dan seluruh saluran pendapatannya.",
    ctaOffer: "Ajukan penawaran →",
    ctaWa: "WhatsApp pemilik",
    waText: `Assalamu'alaikum, saya tertarik membeli ${c.name} (${c.price}).`,
    priceLabel: "Harga",
    nego: "Bisa nego",
    minLabel: "Penawaran minimum",
    emailLabel: "E-mail",
    numbers: [
      ["114", "surah, 6.236 ayat"],
      ["604", "halaman mushaf bertajwid warna"],
      [kitab || "Ribuan", c.kitabCats ? `kitab klasik dalam ${nf(c.kitabCats, "id-ID")} bidang ilmu` : "kitab klasik"],
      ["20+", "qari pilihan untuk murottal"],
      ["24 jam", "live Makkah & Madinah"],
      ["0", "login untuk pengunjung"],
    ],
    liveTitle: "Live Makkah & Madinah, 24 jam",
    liveText:
      "Siaran langsung Masjidil Haram dan Masjid Nabawi tayang sepanjang hari, ditambah kanal Islam dari berbagai negara. Tautannya diatur dari portal admin, tanpa menyentuh kode. Halaman Live juga punya enam slot milik pemilik untuk kajian dan siaran sendiri, atau disewakan.",
    liveLink: "Buka halaman Live →",
    liveBox: { label: "🕋 Masjidil Haram, Makkah — 24 jam", loading: "Memuat siaran langsung…", frame: "Live Makkah 24 jam" },
    insideTitle: "Apa saja yang ada di dalamnya",
    inside: [
      { icon: "📖", title: "Al-Qur'an yang bisa didengar dan dipahami", items: [
        ["Mushaf Utsmani 604 halaman", "Bertajwid warna, bisa dibaca seperti mushaf cetak."],
        ["Satu halaman per ayat", "Terjemahan, tafsir, asbabun nuzul, nasakh-mansukh dan hadits pendukung dalam satu tampilan."],
        ["Murottal 20+ qari", "Radio Al-Qur'an yang berjalan terus dan flipbook surah."],
      ] },
      { icon: "🎧", title: "Mendengar kitab dan Al-Qur'an dengan suara", items: [
        ["Tiga cara mendengar Al-Qur'an", "\"Baca Semua\" (Arab + arti + tafsir dibacakan), \"Arab saja\" (murottal imam) dan \"Arti saja\"."],
        ["Kitab, kisah dan amalan dibacakan", "Tombol dengarkan di kitab pesantren, deskripsi kitab, kisah, konten harian dan amalan."],
        ["Audiobook Islami", "Kisah dan hikmah dalam format audio yang bisa diunduh."],
      ] },
      { icon: "📚", title: "Perpustakaan kitab dan hadits", items: [
        [kitab ? `${kitab} kitab klasik` : "Perpustakaan kitab klasik", "Tafsir, hadits, fiqih, akidah, nahwu, balaghah, tasawuf dan bidang lain, dijelajahi per bidang."],
        ["Kitab pesantren", "Matan berbahasa Arab dengan panel nahwu-sharaf untuk belajar membaca kitab kuning."],
        ["Koleksi hadits dan pohon sanad", "Hadits per kitab dengan derajatnya, dan penjelajah sanad perawi."],
      ] },
      { icon: "🧒", title: "Kisah dan pendidikan anak", items: [
        ["Kisah para nabi dan tokoh", "Kisah bersambung dengan rujukan ayat dan hadits."],
        ["Al-Qur'an Kids", `Huruf hijaiyah, Iqro ${c.iqroLevels} jilid bersuara, hafalan Juz 'Amma dan film Islami untuk anak.`],
        ["Cerita anak", "Kisah teladan pendek yang dibacakan."],
      ] },
      { icon: "🕌", title: "Ibadah sehari-hari", items: [
        ["Jadwal sholat & pengingat adzan", "Untuk kota di seluruh dunia, plus kompas arah kiblat."],
        ["Kalender hijriyah & imsakiyah", "Kalender bulan hijriyah dan jadwal imsakiyah Ramadhan."],
        ["Kalkulator zakat & waris", "Hitungan zakat dan pembagian warisan (faraid)."],
      ] },
      { icon: "📡", title: "Live, AI dan aplikasi", items: [
        ["Live Makkah & Madinah 24 jam", "Ditambah kanal Islam dunia (Indonesia, Turki, Pakistan, Inggris, Malaysia …) di halaman Live."],
        ["Tanya AI Islami", "Asisten tanya-jawab Islami berbasis AI, langsung di situs."],
        ["Aplikasi di HP", "Bisa dipasang ke layar utama (PWA) dan dibuka lebih cepat."],
      ] },
    ],
    incomeTitle: "Saluran pendapatan yang siap jalan",
    income: [
      ["💵", "Iklan Google AdSense", "Kode iklan sudah terpasang di seluruh halaman situs."],
      ["🕋", "Slot promosi Haji & Umroh", "Halaman Haji & Umroh dikelola dari portal admin: paket biro perjalanan (keberangkatan, fasilitas, kontak) dipasang sebagai slot promosi yang disewakan."],
      ["🎥", "Sewa slot live YouTube", `Enam slot live di halaman Live untuk kajian, masjid dan channel yang ingin tayang di ${c.name}; setiap slot kosong sudah menampilkan kontak untuk menyewa.`],
      ["🤲", "Donasi", "Halaman donasi dengan PayPal, kripto dan transfer bank, plus sertifikat terima kasih untuk donatur."],
    ],
    benefitLabel: "Manfaatnya bagi pemilik baru:",
    benefitText: "platform dakwah yang bisa langsung dipakai siapa saja tanpa login dan tanpa biaya, konten yang sudah tersusun rapi, dan saluran pendapatan yang tinggal dikembangkan — tanpa membangun dari nol.",
    receiveTitle: "Yang Anda terima",
    receive: [
      `Domain ${c.domain}`,
      "Kode sumber lengkap: situs (Next.js) dan API (Cloudflare Workers)",
      "Seluruh konten: Al-Qur'an, terjemahan & tafsir, kitab, hadits, kisah, audio dan konten anak",
      "Portal admin yang mengendalikan semua halaman, live, slot Haji & Umroh, promo YouTube dan donasi",
      `Merek ${c.name} dan alamat e-mail salam@${c.domain}`,
      "Infrastruktur serverless yang ringan biaya, siap dipindahkan ke akun Cloudflare Anda",
    ],
    stepsTitle: "Langkah pembelian",
    steps: [
      ["Ajukan penawaran", `Lewat formulir di halaman ini, WhatsApp atau e-mail. Penawaran minimum ${c.min}.`],
      ["Bicara dengan pemilik", "Tanya jawab, NDA, dan login demo portal admin agar Anda melihat semuanya sebelum membeli."],
      ["Sepakati harga & perjanjian", `Harga ${c.price}${c.negotiable ? " bisa dinegosiasikan" : ""}; syarat serah terima dituangkan dalam perjanjian jual beli.`],
      ["Pembayaran", "Transfer bank, escrow pihak ketiga atau kripto, sesuai kesepakatan."],
      ["Serah terima", "Domain, kode, data dan akses dipindahkan kepada Anda."],
    ],
    demo: {
      title: "Lihat portal admin sendiri",
      text: "Masuk ke portal admin dengan login demo: paket Haji & Umroh, promo YouTube di halaman Live, kanal YouTube anak dan halaman situs — persis seperti yang akan Anda kelola. Demo hanya-lihat; tidak ada yang bisa diubah.",
      open: "Buka portal admin ↗",
      address: "Alamat",
      user: "Username",
      pass: "Password",
    },
    offerTitle: "Ajukan penawaran",
    offerLead: `Harga ${c.price}${c.negotiable ? ", bisa nego" : ""}. Penawaran minimum ${c.min}. Pemilik membalas lewat e-mail atau WhatsApp.`,
    offerDirect: "Atau langsung:",
    faqTitle: "Tanya jawab",
    faq: [
      ["Apakah harganya bisa dinego?", `${c.negotiable ? "Ya. " : ""}Harga yang diminta ${c.price}${c.negotiable ? " dan bisa dinegosiasikan" : ""}. Penawaran di bawah ${c.min} tidak kami proses.`],
      ["Apakah situs saudara ikut terjual?", "Tidak otomatis. Setiap situs dijual terpisah dengan harganya sendiri — daftarnya ada di bawah. Penawaran untuk beberapa situs sekaligus bisa dibicarakan."],
      ["Bisakah saya melihat isi portal admin?", "Bisa, sekarang juga: masuk dengan login demo di bagian \"Lihat portal admin sendiri\". Demo hanya-lihat — semua halaman promosi terlihat, tidak ada yang bisa diubah."],
      ["Bagaimana dengan data trafik dan pendapatan?", "Data trafik dan pendapatan dapat ditunjukkan kepada calon pembeli yang serius setelah NDA."],
      ["Siapa yang mengatur live Makkah setelah pembelian?", "Anda. Tautan live Makkah 24 jam dan semua kanal live diatur dari portal admin."],
      ["Bagaimana cara pembayarannya?", "Transfer bank, escrow pihak ketiga atau kripto, sesuai kesepakatan dalam perjanjian jual beli."],
    ],
    network: { title: "Situs lain yang juga dijual", lead: "Setiap situs dijual terpisah, dengan portal admin dan demo sendiri.", view: "Lihat penawaran ↗", nego: "bisa nego", minimum: "min." },
    form: {
      name: "Nama lengkap", email: "E-mail", whatsapp: "WhatsApp (opsional)", company: "Perusahaan / lembaga (opsional)", country: "Negara",
      amount: "Nilai penawaran (US$)", message: "Pesan (opsional)", messageHint: `Rencana Anda untuk ${c.name}, cara pembayaran yang diinginkan, pertanyaan…`,
      minimum: "Minimum", youOffer: "Anda menawar", send: "Kirim penawaran", sending: "Mengirim…", privacy: "Data Anda hanya dipakai untuk menindaklanjuti penawaran ini.",
      sentTitle: "✓ Penawaran Anda sudah kami terima", sent: `Penawaran {amount} untuk ${c.name} tercatat. Pemilik akan menghubungi Anda lewat e-mail atau WhatsApp untuk langkah berikutnya.`,
      errAmount: `Penawaran minimum ${c.min}.`, errEmail: "Mohon isi alamat e-mail yang benar.", errName: "Mohon isi nama Anda.", errCountry: "Mohon isi negara Anda.",
      errRate: "Terlalu banyak percobaan — silakan coba lagi nanti.", errHidden: "Situs ini sedang tidak ditawarkan.", errOther: "Penawaran belum terkirim. Silakan coba lagi, atau kirim lewat e-mail ke {email}.",
    },
    meta: {
      title: `${c.name} dijual — ${c.price}${c.negotiable ? ", bisa nego" : ""}`,
      hiddenTitle: "Halaman tidak ditemukan",
      description: `Akuisisi ${c.name}: Al-Qur'an dengan suara, tafsir & hadits, perpustakaan kitab klasik, live Makkah–Madinah 24 jam dan portal admin. Harga ${c.price}${c.negotiable ? " bisa nego" : ""}, penawaran minimum ${c.min}.`,
      ldName: `${c.name} — platform Islam digital (domain, kode sumber, konten)`,
      ldDescription: "Al-Qur'an dengan suara, tafsir & hadits, perpustakaan kitab klasik, live Makkah–Madinah 24 jam dan portal admin, dijual utuh.",
    },
  };
}

/* ─────────────── The sibling sites: one text per language, with the site's name ─────────────── */

interface Lang {
  locale: string;
  band: SaleCopy["band"];
  eyebrow: string; h1: string; lead: string; ctaOffer: string; ctaWa: string; waText: string;
  priceLabel: string; nego: string; minLabel: string; emailLabel: string;
  numbers: (kitab: string, cats: string) => Item[];
  liveTitle: string; liveText: string; liveLink: string; liveBox: SaleCopy["liveBox"];
  insideTitle: string; inside: (kitab: string) => SaleCopy["inside"];
  incomeTitle: string; income: SaleCopy["income"];
  benefitLabel: string; benefitText: string;
  receiveTitle: string; receive: string[];
  stepsTitle: string; steps: Item[];
  demo: SaleCopy["demo"];
  offerTitle: string; offerLead: string; offerLeadNego: string; offerDirect: string;
  faqTitle: string; faq: Item[]; faqNegoYes: string; faqNegoNo: string; faqNegoQ: string;
  network: SaleCopy["network"];
  form: SaleCopy["form"];
  meta: { title: string; titleNego: string; hiddenTitle: string; description: string; ldName: string; ldDescription: string };
}

const EN: Lang = {
  locale: "en-US",
  band: { eyebrow: "🏷️ Acquisition opportunity", strong: "{name} is for sale", rest: " — a complete Islamic platform, ready for its next owner.", nego: "Negotiable · ", minimum: "minimum offer", cta: "See the details & make an offer →", aria: "{name} is for sale" },
  eyebrow: "🏷️ Acquisition opportunity · {name}",
  h1: "{name} is for sale — a running Islamic platform, ready for you to carry on.",
  lead: "The complete Qur'an you can listen to, with tafsir and hadith, a library of classical kitab, stories, children's learning, daily worship tools, the 24-hour Makkah–Madinah live and an admin portal that runs it all. Handed over whole to its new owner: domain, platform, content and every income channel.",
  ctaOffer: "Make an offer →", ctaWa: "WhatsApp the owner", waText: "Assalamu alaikum, I am interested in buying {name} ({price}).",
  priceLabel: "Price", nego: "Negotiable", minLabel: "Minimum offer", emailLabel: "E-mail",
  numbers: (kitab, cats) => [["114", "surahs, 6,236 verses"], ["604", "pages of colour-coded Mushaf"], [kitab || "Thousands", cats ? `classical kitab in ${cats} fields` : "classical kitab"], ["20+", "reciters to listen to"], ["24 h", "Makkah & Madinah live"], ["0", "logins for visitors"]],
  liveTitle: "Makkah & Madinah live, 24 hours",
  liveText: "The live broadcasts of Masjid al-Haram and Masjid an-Nabawi play all day, alongside Islamic channels from many countries. The links are set in the admin portal, without touching code. The Live page also has six slots of its own for your lectures and broadcasts — or to rent out.",
  liveLink: "Open the Live page →",
  liveBox: { label: "🕋 Masjid al-Haram, Makkah — 24 hours", loading: "Loading the live broadcast…", frame: "Makkah live, 24 hours" },
  insideTitle: "What is inside",
  inside: (kitab) => [
    { icon: "📖", title: "A Qur'an to listen to and understand", items: [["The 604-page Uthmani Mushaf", "Colour-coded tajwid, read like a printed Mushaf."], ["One page per verse", "Translation, tafsir, reasons of revelation, abrogation and supporting hadith in one view."], ["20+ reciters", "A Qur'an radio that never stops, and a surah flipbook."]] },
    { icon: "🎧", title: "Kitab and Qur'an read aloud", items: [["Three ways to listen to the Qur'an", "\"Read all\" (Arabic + meaning + tafsir), \"Arabic only\" (the imam's recitation) and \"Meaning only\"."], ["Kitab, stories and daily practices read aloud", "A listen button on the classical texts, kitab descriptions, stories and daily content."], ["Islamic audiobooks", "Stories and wisdom in downloadable audio."]] },
    { icon: "📚", title: "A library of kitab and hadith", items: [[kitab ? `${kitab} classical kitab` : "A classical kitab library", "Tafsir, hadith, fiqh, creed, grammar, rhetoric, spirituality and more, browsed by field."], ["Classical study texts", "Arabic texts with a grammar panel for learning to read classical Arabic."], ["Hadith collections and the sanad tree", "Hadith by collection with their grading, and an explorer of narrator chains."]] },
    { icon: "🧒", title: "Stories and children's learning", items: [["Stories of the prophets", "Serialised stories with references to the verses and hadith."], ["Al-Qur'an Kids", "The Arabic letters, progressive reading with sound, Juz 'Amma memorisation and Islamic films for children."], ["Short stories read aloud", "Short stories of good example for children."]] },
    { icon: "🕌", title: "Daily worship", items: [["Prayer times & adhan reminders", "For cities worldwide, with a qibla compass."], ["Hijri calendar & Ramadan timetable", "The Hijri month calendar and the Ramadan imsakiyah."], ["Zakat & inheritance calculators", "Zakat and the shares of inheritance (fara'id)."]] },
    { icon: "📡", title: "Live, AI and app", items: [["Makkah & Madinah live, 24 hours", "Plus Islamic channels worldwide on the Live page."], ["Ask AI", "An AI question-and-answer assistant on Islam, right on the site."], ["A phone app", "Installs to the home screen (PWA) and opens faster."]] },
  ],
  incomeTitle: "Income channels ready to run",
  income: [
    ["💵", "Google AdSense", "The ad code is already on every page of the site."],
    ["🕋", "Hajj & Umrah promotion slots", "The Hajj & Umrah page is managed from the admin portal: travel agents' packages (departure, what is included, contact) are shown as promotion slots for rent."],
    ["🎥", "YouTube live slots for rent", "Six live slots on the Live page for lectures, mosques and channels that want to be shown on {name}; every empty slot already shows how to rent it."],
    ["🤲", "Donations", "A donation page with PayPal, crypto and bank transfer, and thank-you certificates for donors."],
  ],
  benefitLabel: "For the new owner:", benefitText: "a da'wah platform anyone can use at once — no login, no fee — content already in order, and income channels ready to grow, without building from zero.",
  receiveTitle: "What you receive",
  receive: ["The {domain} domain", "A standalone copy of the platform with this site's content, installed on your own Cloudflare account", "The admin portal that runs every page, the live streams, the Hajj & Umrah slots, the YouTube promos and the donations", "The {name} brand and the salam@{domain} address", "Light, serverless infrastructure with low running costs", "30 days of help after the handover"],
  stepsTitle: "How to buy",
  steps: [["Make an offer", "With the form on this page, WhatsApp or e-mail. Minimum offer {min}."], ["Talk to the owner", "Questions, an NDA, and the demo login to the admin portal, so you see everything before you buy."], ["Agree the price and the contract", "Asking price {price}{negoClause}; the handover terms are set out in a sale agreement."], ["Payment", "Bank transfer, a third-party escrow or crypto, as agreed."], ["Handover", "Domain, code, data and access are transferred to you."]],
  demo: { title: "See the admin portal for yourself", text: "Sign in to the admin portal with the demo login: the Hajj & Umrah packages, the YouTube promos on the Live page, the kids' YouTube channels and the site's pages — exactly what you will manage. The demo is view-only; nothing can be changed.", open: "Open the admin portal ↗", address: "Address", user: "Username", pass: "Password" },
  offerTitle: "Make an offer", offerLead: "Asking price {price}. Minimum offer {min}. The owner replies by e-mail or WhatsApp.", offerLeadNego: "Asking price {price}, negotiable. Minimum offer {min}. The owner replies by e-mail or WhatsApp.", offerDirect: "Or directly:",
  faqTitle: "Questions",
  faqNegoQ: "Is the price negotiable?", faqNegoYes: "Yes. The asking price is {price} and it is negotiable. Offers below {min} are not considered.", faqNegoNo: "The asking price is {price}. Offers below {min} are not considered.",
  faq: [
    ["Are the other sites included?", "Not automatically. Each site is sold on its own, at its own price — the list is below. An offer for several sites together is welcome."],
    ["Can I see the admin portal?", "Yes, right now: sign in with the demo login under \"See the admin portal for yourself\". The demo is view-only — every promotion page is visible, nothing can be changed."],
    ["What about traffic and income figures?", "Traffic and income figures are shown to serious buyers after an NDA."],
    ["How does the handover work?", "You receive a standalone copy of the platform with this site's content, installed on your own Cloudflare account; the domain moves to you and the e-mail and ad accounts become yours. We help for 30 days."],
    ["How is payment made?", "Bank transfer, a third-party escrow or crypto, as set out in the sale agreement."],
  ],
  network: { title: "Also for sale", lead: "Each site is sold on its own, with its own admin portal and demo.", view: "See the offer ↗", nego: "negotiable", minimum: "min." },
  form: {
    name: "Full name", email: "E-mail", whatsapp: "WhatsApp (optional)", company: "Company / organisation (optional)", country: "Country",
    amount: "Your offer (US$)", message: "Message (optional)", messageHint: "Your plans for {name}, how you would like to pay, any questions…",
    minimum: "Minimum", youOffer: "you offer", send: "Send the offer", sending: "Sending…", privacy: "Your details are used only to follow up this offer.",
    sentTitle: "✓ We have received your offer", sent: "Your offer of {amount} for {name} is recorded. The owner will contact you by e-mail or WhatsApp about the next steps.",
    errAmount: "The minimum offer is {min}.", errEmail: "Please enter a valid e-mail address.", errName: "Please enter your name.", errCountry: "Please enter your country.",
    errRate: "Too many attempts — please try again later.", errHidden: "This site is not offered for sale at the moment.", errOther: "The offer was not sent. Please try again, or e-mail it to {email}.",
  },
  meta: { title: "{name} is for sale — {price}", titleNego: "{name} is for sale — {price}, negotiable", hiddenTitle: "Page not found", description: "Acquire {name}: the Qur'an with audio, tafsir & hadith, a classical kitab library, the 24-hour Makkah–Madinah live and an admin portal. Asking price {price}, minimum offer {min}.", ldName: "{name} — an Islamic platform (domain, platform, content)", ldDescription: "The Qur'an with audio, tafsir & hadith, a classical kitab library, the 24-hour Makkah–Madinah live and an admin portal, sold whole." },
};

const FR: Lang = {
  locale: "fr-FR",
  band: { eyebrow: "🏷️ Opportunité d'acquisition", strong: "{name} est à vendre", rest: " — un portail islamique complet, prêt pour son prochain propriétaire.", nego: "Négociable · ", minimum: "offre minimale", cta: "Voir les détails et faire une offre →", aria: "{name} est à vendre" },
  eyebrow: "🏷️ Opportunité d'acquisition · {name}",
  h1: "{name} est à vendre — un portail islamique en activité, prêt à être repris.",
  lead: "Le Coran complet à écouter, avec tafsir et hadiths, une bibliothèque de kitab classiques, des récits, l'apprentissage des enfants, les outils du culte quotidien, le direct de La Mecque et de Médine 24 h/24 et un portail d'administration qui pilote l'ensemble. Cédé en entier à son nouveau propriétaire : domaine, plateforme, contenu et toutes les sources de revenus.",
  ctaOffer: "Faire une offre →", ctaWa: "WhatsApp du propriétaire", waText: "Assalamou alaykoum, je suis intéressé(e) par l'achat de {name} ({price}).",
  priceLabel: "Prix", nego: "Négociable", minLabel: "Offre minimale", emailLabel: "E-mail",
  numbers: (kitab, cats) => [["114", "sourates, 6 236 versets"], ["604", "pages de Mushaf au tajwid coloré"], [kitab || "Des milliers", cats ? `kitab classiques dans ${cats} disciplines` : "kitab classiques"], ["20+", "récitateurs à écouter"], ["24 h/24", "direct de La Mecque et Médine"], ["0", "connexion pour les visiteurs"]],
  liveTitle: "La Mecque et Médine en direct, 24 h/24",
  liveText: "Les directs de la mosquée al-Haram et de la mosquée du Prophète sont diffusés toute la journée, avec des chaînes islamiques de nombreux pays. Les liens se règlent dans le portail d'administration, sans toucher au code. La page Direct compte aussi six emplacements propres, pour vos conférences et diffusions — ou à louer.",
  liveLink: "Ouvrir la page Direct →",
  liveBox: { label: "🕋 Mosquée al-Haram, La Mecque — 24 h/24", loading: "Chargement du direct…", frame: "La Mecque en direct, 24 h/24" },
  insideTitle: "Ce que contient le portail",
  inside: (kitab) => [
    { icon: "📖", title: "Un Coran à écouter et à comprendre", items: [["Le Mushaf uthmani de 604 pages", "Tajwid en couleurs, lu comme un Mushaf imprimé."], ["Une page par verset", "Traduction, tafsir, circonstances de la révélation, abrogation et hadiths liés, réunis."], ["20+ récitateurs", "Une radio coranique en continu et un Coran feuilletable."]] },
    { icon: "🎧", title: "Kitab et Coran lus à voix haute", items: [["Trois façons d'écouter le Coran", "« Tout lire » (arabe + sens + tafsir), « Arabe seul » (la récitation de l'imam) et « Sens seul »."], ["Kitab, récits et pratiques lus", "Un bouton d'écoute sur les textes classiques, les fiches de kitab, les récits et le contenu du jour."], ["Livres audio islamiques", "Récits et sagesses en audio téléchargeable."]] },
    { icon: "📚", title: "Une bibliothèque de kitab et de hadiths", items: [[kitab ? `${kitab} kitab classiques` : "Une bibliothèque de kitab classiques", "Tafsir, hadith, fiqh, croyance, grammaire, rhétorique, spiritualité et plus, par discipline."], ["Textes d'étude classiques", "Textes arabes avec un panneau de grammaire pour apprendre à lire l'arabe classique."], ["Recueils de hadiths et arbre du sanad", "Les hadiths par recueil avec leur degré, et un explorateur des chaînes de transmission."]] },
    { icon: "🧒", title: "Récits et apprentissage des enfants", items: [["Récits des prophètes", "Des récits en épisodes avec les versets et hadiths de référence."], ["Al-Qur'an Kids", "Les lettres arabes, une lecture progressive sonorisée, la mémorisation de Juz 'Amma et des films islamiques pour enfants."], ["Petites histoires lues", "De courtes histoires édifiantes pour les enfants."]] },
    { icon: "🕌", title: "Le culte au quotidien", items: [["Horaires de prière et rappels de l'adhan", "Pour les villes du monde entier, avec une boussole de la qibla."], ["Calendrier hégirien et imsakiya", "Le calendrier des mois hégiriens et l'imsakiya du Ramadan."], ["Calculateurs de zakât et d'héritage", "La zakât et les parts d'héritage (farâ'id)."]] },
    { icon: "📡", title: "Direct, IA et application", items: [["La Mecque et Médine en direct, 24 h/24", "Et des chaînes islamiques du monde entier sur la page Direct."], ["Demander à l'IA", "Un assistant de questions-réponses sur l'islam, directement sur le site."], ["Une application mobile", "S'installe sur l'écran d'accueil (PWA) et s'ouvre plus vite."]] },
  ],
  incomeTitle: "Des revenus prêts à fonctionner",
  income: [
    ["💵", "Google AdSense", "Le code publicitaire est déjà présent sur toutes les pages du site."],
    ["🕋", "Emplacements Hajj & Omra", "La page Hajj & Omra se gère depuis le portail d'administration : les forfaits des agences de voyage (départ, prestations, contact) y sont présentés comme emplacements promotionnels à louer."],
    ["🎥", "Emplacements YouTube à louer", "Six emplacements en direct sur la page Direct pour les conférences, mosquées et chaînes qui souhaitent être diffusées sur {name} ; chaque emplacement libre indique déjà comment le louer."],
    ["🤲", "Dons", "Une page de dons avec PayPal, crypto et virement bancaire, et des certificats de remerciement pour les donateurs."],
  ],
  benefitLabel: "Pour le nouveau propriétaire :", benefitText: "un portail de da'wa utilisable par tous immédiatement — sans connexion, sans frais —, un contenu déjà organisé et des revenus prêts à se développer, sans partir de zéro.",
  receiveTitle: "Ce que vous recevez",
  receive: ["Le domaine {domain}", "Une copie autonome de la plateforme avec le contenu de ce site, installée sur votre propre compte Cloudflare", "Le portail d'administration qui pilote chaque page, les directs, les emplacements Hajj & Omra, les promos YouTube et les dons", "La marque {name} et l'adresse salam@{domain}", "Une infrastructure serverless légère et peu coûteuse", "30 jours d'accompagnement après la cession"],
  stepsTitle: "Comment acheter",
  steps: [["Faire une offre", "Avec le formulaire de cette page, WhatsApp ou e-mail. Offre minimale {min}."], ["Échanger avec le propriétaire", "Questions, accord de confidentialité et accès démo au portail d'administration, pour tout voir avant d'acheter."], ["Convenir du prix et du contrat", "Prix demandé {price}{negoClause} ; les conditions de cession figurent dans un contrat de vente."], ["Paiement", "Virement bancaire, séquestre tiers ou crypto, selon l'accord."], ["Cession", "Domaine, code, données et accès vous sont transférés."]],
  demo: { title: "Voyez le portail d'administration par vous-même", text: "Connectez-vous au portail d'administration avec l'accès démo : forfaits Hajj & Omra, promos YouTube de la page Direct, chaînes YouTube pour enfants et pages du site — exactement ce que vous gérerez. La démo est en lecture seule ; rien ne peut être modifié.", open: "Ouvrir le portail d'administration ↗", address: "Adresse", user: "Identifiant", pass: "Mot de passe" },
  offerTitle: "Faire une offre", offerLead: "Prix demandé {price}. Offre minimale {min}. Le propriétaire répond par e-mail ou WhatsApp.", offerLeadNego: "Prix demandé {price}, négociable. Offre minimale {min}. Le propriétaire répond par e-mail ou WhatsApp.", offerDirect: "Ou directement :",
  faqTitle: "Questions fréquentes",
  faqNegoQ: "Le prix est-il négociable ?", faqNegoYes: "Oui. Le prix demandé est de {price} et il est négociable. Les offres inférieures à {min} ne sont pas étudiées.", faqNegoNo: "Le prix demandé est de {price}. Les offres inférieures à {min} ne sont pas étudiées.",
  faq: [
    ["Les autres sites sont-ils inclus ?", "Pas automatiquement. Chaque site est vendu séparément, à son propre prix — la liste figure ci-dessous. Une offre pour plusieurs sites ensemble est la bienvenue."],
    ["Puis-je voir le portail d'administration ?", "Oui, dès maintenant : connectez-vous avec l'accès démo de la section « Voyez le portail d'administration par vous-même ». La démo est en lecture seule — toutes les pages de promotion sont visibles, rien ne peut être modifié."],
    ["Et les chiffres d'audience et de revenus ?", "Les chiffres d'audience et de revenus sont communiqués aux acheteurs sérieux après un accord de confidentialité."],
    ["Comment se passe la cession ?", "Vous recevez une copie autonome de la plateforme avec le contenu de ce site, installée sur votre propre compte Cloudflare ; le domaine vous est transféré et les comptes e-mail et publicitaires deviennent les vôtres. Nous vous accompagnons pendant 30 jours."],
    ["Comment se fait le paiement ?", "Par virement bancaire, séquestre tiers ou crypto, comme prévu dans le contrat de vente."],
  ],
  network: { title: "Également à vendre", lead: "Chaque site est vendu séparément, avec son propre portail d'administration et sa démo.", view: "Voir l'offre ↗", nego: "négociable", minimum: "min." },
  form: {
    name: "Nom complet", email: "E-mail", whatsapp: "WhatsApp (facultatif)", company: "Société / organisation (facultatif)", country: "Pays",
    amount: "Votre offre (US$)", message: "Message (facultatif)", messageHint: "Vos projets pour {name}, le mode de paiement souhaité, vos questions…",
    minimum: "Minimum", youOffer: "vous proposez", send: "Envoyer l'offre", sending: "Envoi…", privacy: "Vos données servent uniquement au suivi de cette offre.",
    sentTitle: "✓ Nous avons bien reçu votre offre", sent: "Votre offre de {amount} pour {name} est enregistrée. Le propriétaire vous contactera par e-mail ou WhatsApp pour la suite.",
    errAmount: "L'offre minimale est de {min}.", errEmail: "Veuillez saisir une adresse e-mail valide.", errName: "Veuillez saisir votre nom.", errCountry: "Veuillez indiquer votre pays.",
    errRate: "Trop de tentatives — veuillez réessayer plus tard.", errHidden: "Ce site n'est pas proposé à la vente pour le moment.", errOther: "L'offre n'a pas été envoyée. Veuillez réessayer ou l'envoyer par e-mail à {email}.",
  },
  meta: { title: "{name} est à vendre — {price}", titleNego: "{name} est à vendre — {price}, négociable", hiddenTitle: "Page introuvable", description: "Acquérir {name} : le Coran en audio, tafsir et hadiths, une bibliothèque de kitab classiques, le direct de La Mecque et Médine 24 h/24 et un portail d'administration. Prix demandé {price}, offre minimale {min}.", ldName: "{name} — portail islamique (domaine, plateforme, contenu)", ldDescription: "Le Coran en audio, tafsir et hadiths, une bibliothèque de kitab classiques, le direct de La Mecque et Médine 24 h/24 et un portail d'administration, cédés en entier." },
};

const DE: Lang = {
  locale: "de-DE",
  band: { eyebrow: "🏷️ Übernahmegelegenheit", strong: "{name} steht zum Verkauf", rest: " — ein vollständiges islamisches Portal, bereit für seinen nächsten Eigentümer.", nego: "Verhandelbar · ", minimum: "Mindestgebot", cta: "Details ansehen & Angebot machen →", aria: "{name} steht zum Verkauf" },
  eyebrow: "🏷️ Übernahmegelegenheit · {name}",
  h1: "{name} steht zum Verkauf — ein laufendes islamisches Portal, bereit zur Übernahme.",
  lead: "Der vollständige Koran zum Anhören, mit Tafsir und Hadithen, eine Bibliothek klassischer Kitab, Geschichten, Lernen für Kinder, Werkzeuge für den täglichen Gottesdienst, der 24-Stunden-Livestream aus Mekka und Medina und ein Admin-Portal, das alles steuert. Vollständig an den neuen Eigentümer übergeben: Domain, Plattform, Inhalte und alle Einnahmequellen.",
  ctaOffer: "Angebot machen →", ctaWa: "WhatsApp an den Eigentümer", waText: "Assalamu alaikum, ich interessiere mich für den Kauf von {name} ({price}).",
  priceLabel: "Preis", nego: "Verhandelbar", minLabel: "Mindestgebot", emailLabel: "E-Mail",
  numbers: (kitab, cats) => [["114", "Suren, 6.236 Verse"], ["604", "Mushaf-Seiten mit farbigem Tadschwid"], [kitab || "Tausende", cats ? `klassische Kitab in ${cats} Fachgebieten` : "klassische Kitab"], ["20+", "Rezitatoren zum Anhören"], ["24 Std.", "Mekka & Medina live"], ["0", "Anmeldungen für Besucher"]],
  liveTitle: "Mekka & Medina live, rund um die Uhr",
  liveText: "Die Liveübertragungen aus der Heiligen Moschee und der Prophetenmoschee laufen den ganzen Tag, dazu islamische Kanäle aus vielen Ländern. Die Links werden im Admin-Portal gesetzt, ohne Code anzufassen. Die Live-Seite hat außerdem sechs eigene Plätze für Ihre Vorträge und Übertragungen — oder zum Vermieten.",
  liveLink: "Live-Seite öffnen →",
  liveBox: { label: "🕋 Heilige Moschee, Mekka — rund um die Uhr", loading: "Liveübertragung wird geladen…", frame: "Mekka live, rund um die Uhr" },
  insideTitle: "Was das Portal enthält",
  inside: (kitab) => [
    { icon: "📖", title: "Ein Koran zum Hören und Verstehen", items: [["Der uthmanische Mushaf mit 604 Seiten", "Farbiger Tadschwid, zu lesen wie ein gedruckter Mushaf."], ["Eine Seite pro Vers", "Übersetzung, Tafsir, Offenbarungsanlässe, Abrogation und zugehörige Hadithe auf einen Blick."], ["20+ Rezitatoren", "Ein Koran-Radio ohne Pause und ein blätterbarer Koran."]] },
    { icon: "🎧", title: "Kitab und Koran zum Vorlesen", items: [["Drei Arten, den Koran zu hören", "„Alles vorlesen“ (Arabisch + Bedeutung + Tafsir), „Nur Arabisch“ (die Rezitation des Imams) und „Nur Bedeutung“."], ["Kitab, Geschichten und Praktiken vorgelesen", "Ein Anhören-Knopf an klassischen Texten, Kitab-Beschreibungen, Geschichten und Tagesinhalten."], ["Islamische Hörbücher", "Geschichten und Weisheiten als herunterladbares Audio."]] },
    { icon: "📚", title: "Eine Bibliothek aus Kitab und Hadithen", items: [[kitab ? `${kitab} klassische Kitab` : "Eine Bibliothek klassischer Kitab", "Tafsir, Hadith, Fiqh, Glaubenslehre, Grammatik, Rhetorik, Spiritualität und mehr, nach Fachgebiet."], ["Klassische Lehrtexte", "Arabische Texte mit einem Grammatik-Panel, um klassisches Arabisch lesen zu lernen."], ["Hadithsammlungen und Sanad-Baum", "Hadithe nach Sammlung mit ihrer Einstufung und ein Explorer der Überlieferungsketten."]] },
    { icon: "🧒", title: "Geschichten und Lernen für Kinder", items: [["Geschichten der Propheten", "Fortlaufende Geschichten mit Verweisen auf Verse und Hadithe."], ["Al-Qur'an Kids", "Die arabischen Buchstaben, schrittweises Lesen mit Ton, das Auswendiglernen von Juz 'Amma und islamische Filme für Kinder."], ["Kurze Geschichten zum Vorlesen", "Kurze vorbildhafte Geschichten für Kinder."]] },
    { icon: "🕌", title: "Gottesdienst im Alltag", items: [["Gebetszeiten & Adhan-Erinnerungen", "Für Städte weltweit, mit Qibla-Kompass."], ["Hidschri-Kalender & Imsakiya", "Der Kalender der islamischen Monate und die Ramadan-Imsakiya."], ["Zakat- & Erbrechner", "Die Zakat und die Erbanteile (Fara'id)."]] },
    { icon: "📡", title: "Live, KI und App", items: [["Mekka & Medina live, rund um die Uhr", "Dazu islamische Kanäle aus aller Welt auf der Live-Seite."], ["KI fragen", "Ein KI-Assistent für Fragen zum Islam, direkt auf der Website."], ["Eine App fürs Handy", "Lässt sich auf dem Startbildschirm installieren (PWA) und öffnet schneller."]] },
  ],
  incomeTitle: "Einnahmequellen, startklar",
  income: [
    ["💵", "Google AdSense", "Der Anzeigencode ist bereits auf jeder Seite der Website eingebunden."],
    ["🕋", "Hadsch- & Umra-Werbeplätze", "Die Seite Hadsch & Umra wird im Admin-Portal gepflegt: Pakete von Reiseveranstaltern (Abreise, Leistungen, Kontakt) erscheinen als Werbeplätze zur Miete."],
    ["🎥", "YouTube-Liveplätze zur Miete", "Sechs Liveplätze auf der Live-Seite für Vorträge, Moscheen und Kanäle, die auf {name} gezeigt werden möchten; jeder freie Platz zeigt bereits, wie man ihn mietet."],
    ["🤲", "Spenden", "Eine Spendenseite mit PayPal, Krypto und Banküberweisung sowie Dankesurkunden für Spender."],
  ],
  benefitLabel: "Für den neuen Eigentümer:", benefitText: "ein Da'wa-Portal, das jeder sofort nutzen kann — ohne Anmeldung, ohne Gebühr —, geordnete Inhalte und Einnahmequellen, die nur noch wachsen müssen, ohne bei null anzufangen.",
  receiveTitle: "Was Sie erhalten",
  receive: ["Die Domain {domain}", "Eine eigenständige Kopie der Plattform mit den Inhalten dieser Website, installiert in Ihrem eigenen Cloudflare-Konto", "Das Admin-Portal, das jede Seite, die Livestreams, die Hadsch- & Umra-Plätze, die YouTube-Werbung und die Spenden steuert", "Die Marke {name} und die Adresse salam@{domain}", "Schlanke, serverlose Infrastruktur mit niedrigen Betriebskosten", "30 Tage Unterstützung nach der Übergabe"],
  stepsTitle: "So kaufen Sie",
  steps: [["Angebot machen", "Über das Formular auf dieser Seite, per WhatsApp oder E-Mail. Mindestgebot {min}."], ["Mit dem Eigentümer sprechen", "Fragen, eine Geheimhaltungsvereinbarung und der Demo-Zugang zum Admin-Portal, damit Sie vor dem Kauf alles sehen."], ["Preis und Vertrag vereinbaren", "Angebotspreis {price}{negoClause}; die Übergabebedingungen stehen im Kaufvertrag."], ["Zahlung", "Banküberweisung, Treuhanddienst oder Krypto, wie vereinbart."], ["Übergabe", "Domain, Code, Daten und Zugänge gehen auf Sie über."]],
  demo: { title: "Sehen Sie sich das Admin-Portal selbst an", text: "Melden Sie sich mit dem Demo-Zugang im Admin-Portal an: Hadsch- & Umra-Pakete, YouTube-Werbung auf der Live-Seite, YouTube-Kanäle für Kinder und die Seiten der Website — genau das, was Sie verwalten werden. Die Demo ist nur zum Ansehen; nichts lässt sich ändern.", open: "Admin-Portal öffnen ↗", address: "Adresse", user: "Benutzername", pass: "Passwort" },
  offerTitle: "Angebot machen", offerLead: "Angebotspreis {price}. Mindestgebot {min}. Der Eigentümer antwortet per E-Mail oder WhatsApp.", offerLeadNego: "Angebotspreis {price}, verhandelbar. Mindestgebot {min}. Der Eigentümer antwortet per E-Mail oder WhatsApp.", offerDirect: "Oder direkt:",
  faqTitle: "Häufige Fragen",
  faqNegoQ: "Ist der Preis verhandelbar?", faqNegoYes: "Ja. Der Angebotspreis beträgt {price} und ist verhandelbar. Angebote unter {min} werden nicht berücksichtigt.", faqNegoNo: "Der Angebotspreis beträgt {price}. Angebote unter {min} werden nicht berücksichtigt.",
  faq: [
    ["Sind die anderen Websites inbegriffen?", "Nicht automatisch. Jede Website wird einzeln verkauft, zu ihrem eigenen Preis — die Liste steht unten. Ein Angebot für mehrere Websites zusammen ist willkommen."],
    ["Kann ich das Admin-Portal sehen?", "Ja, sofort: Melden Sie sich mit dem Demo-Zugang unter „Sehen Sie sich das Admin-Portal selbst an“ an. Die Demo ist nur zum Ansehen — alle Werbeseiten sind sichtbar, nichts lässt sich ändern."],
    ["Wie steht es um Besucher- und Einnahmezahlen?", "Besucher- und Einnahmezahlen erhalten ernsthafte Kaufinteressenten nach einer Geheimhaltungsvereinbarung."],
    ["Wie läuft die Übergabe ab?", "Sie erhalten eine eigenständige Kopie der Plattform mit den Inhalten dieser Website, installiert in Ihrem eigenen Cloudflare-Konto; die Domain geht auf Sie über, und die E-Mail- und Werbekonten werden Ihre. Wir unterstützen Sie 30 Tage lang."],
    ["Wie wird bezahlt?", "Per Banküberweisung, Treuhanddienst oder Krypto, wie im Kaufvertrag festgelegt."],
  ],
  network: { title: "Ebenfalls zu verkaufen", lead: "Jede Website wird einzeln verkauft, mit eigenem Admin-Portal und eigener Demo.", view: "Angebot ansehen ↗", nego: "verhandelbar", minimum: "min." },
  form: {
    name: "Vollständiger Name", email: "E-Mail", whatsapp: "WhatsApp (optional)", company: "Firma / Organisation (optional)", country: "Land",
    amount: "Ihr Angebot (US$)", message: "Nachricht (optional)", messageHint: "Ihre Pläne für {name}, die gewünschte Zahlungsweise, Ihre Fragen…",
    minimum: "Mindestens", youOffer: "Sie bieten", send: "Angebot senden", sending: "Wird gesendet…", privacy: "Ihre Angaben dienen nur der Bearbeitung dieses Angebots.",
    sentTitle: "✓ Ihr Angebot ist eingegangen", sent: "Ihr Angebot über {amount} für {name} ist erfasst. Der Eigentümer meldet sich per E-Mail oder WhatsApp mit den nächsten Schritten.",
    errAmount: "Das Mindestgebot beträgt {min}.", errEmail: "Bitte geben Sie eine gültige E-Mail-Adresse an.", errName: "Bitte geben Sie Ihren Namen an.", errCountry: "Bitte geben Sie Ihr Land an.",
    errRate: "Zu viele Versuche — bitte später erneut versuchen.", errHidden: "Diese Website wird derzeit nicht zum Verkauf angeboten.", errOther: "Das Angebot wurde nicht gesendet. Bitte erneut versuchen oder per E-Mail an {email} schicken.",
  },
  meta: { title: "{name} steht zum Verkauf — {price}", titleNego: "{name} steht zum Verkauf — {price}, verhandelbar", hiddenTitle: "Seite nicht gefunden", description: "{name} übernehmen: der Koran mit Audio, Tafsir & Hadithe, eine Bibliothek klassischer Kitab, der 24-Stunden-Livestream aus Mekka und Medina und ein Admin-Portal. Angebotspreis {price}, Mindestgebot {min}.", ldName: "{name} — islamisches Portal (Domain, Plattform, Inhalte)", ldDescription: "Der Koran mit Audio, Tafsir & Hadithe, eine Bibliothek klassischer Kitab, der 24-Stunden-Livestream aus Mekka und Medina und ein Admin-Portal, vollständig verkauft." },
};

const ES: Lang = {
  locale: "es-ES",
  band: { eyebrow: "🏷️ Oportunidad de adquisición", strong: "{name} está en venta", rest: " — un portal islámico completo, listo para su próximo propietario.", nego: "Negociable · ", minimum: "oferta mínima", cta: "Ver los detalles y hacer una oferta →", aria: "{name} está en venta" },
  eyebrow: "🏷️ Oportunidad de adquisición · {name}",
  h1: "{name} está en venta — un portal islámico en marcha, listo para que usted lo continúe.",
  lead: "El Corán completo para escuchar, con tafsir y hadices, una biblioteca de kitab clásicos, historias, aprendizaje infantil, herramientas para el culto diario, la emisión en directo de La Meca y Medina las 24 horas y un portal de administración que lo gestiona todo. Se entrega completo a su nuevo propietario: dominio, plataforma, contenido y todas sus fuentes de ingresos.",
  ctaOffer: "Hacer una oferta →", ctaWa: "WhatsApp del propietario", waText: "Assalamu alaikum, me interesa comprar {name} ({price}).",
  priceLabel: "Precio", nego: "Negociable", minLabel: "Oferta mínima", emailLabel: "Correo",
  numbers: (kitab, cats) => [["114", "suras, 6.236 aleyas"], ["604", "páginas de Mushaf con tajwid en color"], [kitab || "Miles", cats ? `kitab clásicos en ${cats} disciplinas` : "kitab clásicos"], ["20+", "recitadores para escuchar"], ["24 h", "La Meca y Medina en directo"], ["0", "inicios de sesión para visitantes"]],
  liveTitle: "La Meca y Medina en directo, 24 horas",
  liveText: "Las emisiones en directo de la Mezquita Sagrada y de la Mezquita del Profeta se transmiten todo el día, junto con canales islámicos de muchos países. Los enlaces se configuran en el portal de administración, sin tocar código. La página En directo tiene además seis espacios propios para sus charlas y emisiones, o para alquilar.",
  liveLink: "Abrir la página En directo →",
  liveBox: { label: "🕋 Mezquita Sagrada, La Meca — 24 horas", loading: "Cargando la emisión en directo…", frame: "La Meca en directo, 24 horas" },
  insideTitle: "Qué contiene el portal",
  inside: (kitab) => [
    { icon: "📖", title: "Un Corán para escuchar y comprender", items: [["El Mushaf uthmani de 604 páginas", "Tajwid en colores, para leer como un Mushaf impreso."], ["Una página por aleya", "Traducción, tafsir, circunstancias de la revelación, abrogación y hadices relacionados, juntos."], ["Más de 20 recitadores", "Una radio coránica continua y un Corán para hojear."]] },
    { icon: "🎧", title: "Kitab y Corán leídos en voz alta", items: [["Tres formas de escuchar el Corán", "«Leer todo» (árabe + significado + tafsir), «Solo árabe» (la recitación del imán) y «Solo significado»."], ["Kitab, historias y prácticas leídas", "Un botón para escuchar en los textos clásicos, las fichas de kitab, las historias y el contenido del día."], ["Audiolibros islámicos", "Historias y sabiduría en audio descargable."]] },
    { icon: "📚", title: "Una biblioteca de kitab y hadices", items: [[kitab ? `${kitab} kitab clásicos` : "Una biblioteca de kitab clásicos", "Tafsir, hadiz, fiqh, credo, gramática, retórica, espiritualidad y más, por disciplina."], ["Textos clásicos de estudio", "Textos árabes con un panel de gramática para aprender a leer el árabe clásico."], ["Colecciones de hadices y árbol del sanad", "Los hadices por colección con su grado, y un explorador de las cadenas de transmisión."]] },
    { icon: "🧒", title: "Historias y aprendizaje infantil", items: [["Historias de los profetas", "Historias por capítulos con las aleyas y hadices de referencia."], ["Al-Qur'an Kids", "Las letras árabes, una lectura progresiva con sonido, la memorización de Juz 'Amma y películas islámicas para niños."], ["Cuentos leídos", "Cuentos breves y ejemplares para niños."]] },
    { icon: "🕌", title: "El culto de cada día", items: [["Horarios de oración y avisos del adhan", "Para ciudades de todo el mundo, con brújula de la qibla."], ["Calendario de la Hégira e imsakiya", "El calendario de los meses de la Hégira y la imsakiya del Ramadán."], ["Calculadoras de zakat y herencia", "El zakat y las partes de la herencia (fara'id)."]] },
    { icon: "📡", title: "Directo, IA y aplicación", items: [["La Meca y Medina en directo, 24 horas", "Y canales islámicos de todo el mundo en la página En directo."], ["Preguntar a la IA", "Un asistente de preguntas y respuestas sobre el islam, en el propio sitio."], ["Una aplicación móvil", "Se instala en la pantalla de inicio (PWA) y se abre más rápido."]] },
  ],
  incomeTitle: "Fuentes de ingresos listas para funcionar",
  income: [
    ["💵", "Google AdSense", "El código de anuncios ya está en todas las páginas del sitio."],
    ["🕋", "Espacios de Hach y Umra", "La página de Hach y Umra se gestiona desde el portal de administración: los paquetes de las agencias de viaje (salida, servicios, contacto) se muestran como espacios promocionales en alquiler."],
    ["🎥", "Espacios de YouTube en alquiler", "Seis espacios en directo en la página En directo para charlas, mezquitas y canales que quieran aparecer en {name}; cada espacio libre ya indica cómo alquilarlo."],
    ["🤲", "Donaciones", "Una página de donaciones con PayPal, cripto y transferencia bancaria, y certificados de agradecimiento para los donantes."],
  ],
  benefitLabel: "Para el nuevo propietario:", benefitText: "un portal de da'wa que cualquiera puede usar al instante — sin registro, sin coste —, un contenido ya ordenado e ingresos listos para crecer, sin empezar de cero.",
  receiveTitle: "Qué recibe",
  receive: ["El dominio {domain}", "Una copia independiente de la plataforma con el contenido de este sitio, instalada en su propia cuenta de Cloudflare", "El portal de administración que gestiona cada página, las emisiones en directo, los espacios de Hach y Umra, las promos de YouTube y las donaciones", "La marca {name} y la dirección salam@{domain}", "Infraestructura serverless ligera y de bajo coste", "30 días de acompañamiento tras la entrega"],
  stepsTitle: "Cómo comprar",
  steps: [["Hacer una oferta", "Con el formulario de esta página, WhatsApp o correo. Oferta mínima {min}."], ["Hablar con el propietario", "Preguntas, un acuerdo de confidencialidad y el acceso demo al portal de administración, para verlo todo antes de comprar."], ["Acordar el precio y el contrato", "Precio solicitado {price}{negoClause}; las condiciones de la entrega constan en un contrato de compraventa."], ["Pago", "Transferencia bancaria, depósito de garantía con un tercero o cripto, según lo acordado."], ["Entrega", "Dominio, código, datos y accesos pasan a usted."]],
  demo: { title: "Vea el portal de administración usted mismo", text: "Entre en el portal de administración con el acceso demo: paquetes de Hach y Umra, promos de YouTube en la página En directo, canales de YouTube infantiles y las páginas del sitio — exactamente lo que usted gestionará. La demo es de solo lectura; no se puede cambiar nada.", open: "Abrir el portal de administración ↗", address: "Dirección", user: "Usuario", pass: "Contraseña" },
  offerTitle: "Hacer una oferta", offerLead: "Precio solicitado {price}. Oferta mínima {min}. El propietario responde por correo o WhatsApp.", offerLeadNego: "Precio solicitado {price}, negociable. Oferta mínima {min}. El propietario responde por correo o WhatsApp.", offerDirect: "O directamente:",
  faqTitle: "Preguntas frecuentes",
  faqNegoQ: "¿El precio es negociable?", faqNegoYes: "Sí. El precio solicitado es {price} y es negociable. No se consideran ofertas inferiores a {min}.", faqNegoNo: "El precio solicitado es {price}. No se consideran ofertas inferiores a {min}.",
  faq: [
    ["¿Se incluyen los otros sitios?", "No automáticamente. Cada sitio se vende por separado, a su propio precio — la lista está abajo. Una oferta por varios sitios juntos es bienvenida."],
    ["¿Puedo ver el portal de administración?", "Sí, ahora mismo: entre con el acceso demo de la sección «Vea el portal de administración usted mismo». La demo es de solo lectura — todas las páginas de promoción están a la vista, no se puede cambiar nada."],
    ["¿Y las cifras de tráfico e ingresos?", "Las cifras de tráfico e ingresos se muestran a compradores serios tras un acuerdo de confidencialidad."],
    ["¿Cómo es la entrega?", "Recibe una copia independiente de la plataforma con el contenido de este sitio, instalada en su propia cuenta de Cloudflare; el dominio pasa a usted y las cuentas de correo y de anuncios pasan a ser suyas. Le acompañamos durante 30 días."],
    ["¿Cómo se paga?", "Por transferencia bancaria, depósito de garantía con un tercero o cripto, según el contrato de compraventa."],
  ],
  network: { title: "También en venta", lead: "Cada sitio se vende por separado, con su propio portal de administración y su demo.", view: "Ver la oferta ↗", nego: "negociable", minimum: "mín." },
  form: {
    name: "Nombre completo", email: "Correo", whatsapp: "WhatsApp (opcional)", company: "Empresa / organización (opcional)", country: "País",
    amount: "Su oferta (US$)", message: "Mensaje (opcional)", messageHint: "Sus planes para {name}, la forma de pago que prefiere, sus preguntas…",
    minimum: "Mínimo", youOffer: "usted ofrece", send: "Enviar la oferta", sending: "Enviando…", privacy: "Sus datos solo se usan para dar seguimiento a esta oferta.",
    sentTitle: "✓ Hemos recibido su oferta", sent: "Su oferta de {amount} por {name} ha quedado registrada. El propietario se pondrá en contacto por correo o WhatsApp con los siguientes pasos.",
    errAmount: "La oferta mínima es {min}.", errEmail: "Indique un correo electrónico válido.", errName: "Indique su nombre.", errCountry: "Indique su país.",
    errRate: "Demasiados intentos — inténtelo más tarde.", errHidden: "Este sitio no está en venta en este momento.", errOther: "La oferta no se ha enviado. Inténtelo de nuevo o envíela por correo a {email}.",
  },
  meta: { title: "{name} está en venta — {price}", titleNego: "{name} está en venta — {price}, negociable", hiddenTitle: "Página no encontrada", description: "Adquiera {name}: el Corán con audio, tafsir y hadices, una biblioteca de kitab clásicos, La Meca y Medina en directo las 24 horas y un portal de administración. Precio solicitado {price}, oferta mínima {min}.", ldName: "{name} — portal islámico (dominio, plataforma, contenido)", ldDescription: "El Corán con audio, tafsir y hadices, una biblioteca de kitab clásicos, La Meca y Medina en directo las 24 horas y un portal de administración, vendidos completos." },
};

const LANGS: Record<string, Lang> = { en: EN, fr: FR, de: DE, es: ES };

function sibling(L: Lang, c: SaleCtx): SaleCopy {
  const v = { name: c.name, domain: c.domain, price: c.price, min: c.min };
  const f = (s: string) => fill(s, v);
  const kitab = c.kitabTotal ? nf(c.kitabTotal, L.locale) : "";
  const cats = c.kitabCats ? nf(c.kitabCats, L.locale) : "";
  const negoClause = c.negotiable ? (L === FR ? ", négociable" : L === DE ? ", verhandelbar" : L === ES ? ", negociable" : ", negotiable") : "";
  return {
    band: { ...L.band, strong: f(L.band.strong), aria: f(L.band.aria) },
    eyebrow: f(L.eyebrow), h1: f(L.h1), lead: L.lead, ctaOffer: L.ctaOffer, ctaWa: L.ctaWa, waText: f(L.waText),
    priceLabel: L.priceLabel, nego: L.nego, minLabel: L.minLabel, emailLabel: L.emailLabel,
    numbers: L.numbers(kitab, cats),
    liveTitle: L.liveTitle, liveText: L.liveText, liveLink: L.liveLink, liveBox: L.liveBox,
    insideTitle: L.insideTitle, inside: L.inside(kitab),
    incomeTitle: L.incomeTitle, income: L.income.map(([i, t, d]) => [i, t, f(d)]),
    benefitLabel: L.benefitLabel, benefitText: L.benefitText,
    receiveTitle: L.receiveTitle, receive: L.receive.map(f),
    stepsTitle: L.stepsTitle, steps: L.steps.map(([t, d]) => [t, fill(d, { ...v, negoClause })]),
    demo: L.demo,
    offerTitle: L.offerTitle, offerLead: f(c.negotiable ? L.offerLeadNego : L.offerLead), offerDirect: L.offerDirect,
    faqTitle: L.faqTitle, faq: [[L.faqNegoQ, f(c.negotiable ? L.faqNegoYes : L.faqNegoNo)], ...L.faq],
    network: L.network,
    form: { ...L.form, messageHint: f(L.form.messageHint), sent: fill(L.form.sent, { name: c.name }), errAmount: f(L.form.errAmount) },
    meta: { title: f(c.negotiable ? L.meta.titleNego : L.meta.title), hiddenTitle: L.meta.hiddenTitle, description: f(L.meta.description), ldName: f(L.meta.ldName), ldDescription: L.meta.ldDescription },
  };
}

/** The sale words for a site in a language; Indonesian is ulyah.com's, English the fallback. */
export function saleCopy(locale: string, c: SaleCtx): SaleCopy {
  if (locale === "id") return id(c);
  return sibling(LANGS[locale] ?? EN, c);
}

/** Fill the {amount} / {email} placeholders the form fills at the moment it needs them. */
export const fillSale = fill;
