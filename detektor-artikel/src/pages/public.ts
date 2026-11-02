/** Halaman publik dua bahasa (ID di akar, EN di /en). */
import { PURGE_DAYS } from '../data/policy.ts';
import { html, raw, type Raw } from '../lib/html.ts';
import { tr, fmtNum, fmtDate, fmtScore, type Lang } from '../lib/i18n.ts';
import type { User } from '../data/users.ts';
import type { BillingSettings, EngineSettings } from '../data/settings.ts';
import { predictPages, estimateTokens, rateCard, predictByMode, packagePrice, tokenPriceIdr } from '../engine/pricing.ts';
import { rateTable } from './report.ts';
import { MODE_INFO } from '../lib/i18n.ts';
import { page, compBar, labelPill, BRAND, TAGLINE } from './ui.ts';
import { reportPages } from './report.ts';
import { SAMPLE_DETAIL, SAMPLE_SUMMARY } from './sample.ts';
import { bi } from '../engine/rubrics.ts';

export const PATHS = {
  home: ['/', '/en'],
  how: ['/cara-kerja', '/en/how-it-works'],
  acc: ['/akurasi', '/en/accuracy'],
  price: ['/harga', '/en/pricing'],
  sample: ['/contoh-laporan', '/en/sample-report'],
  privacy: ['/kebijakan-privasi', '/en/privacy'],
  terms: ['/syarat', '/en/terms'],
  ethics: ['/penggunaan-etis', '/en/ethical-use'],
} as const;
export type PageKey = keyof typeof PATHS;

interface Ctx {
  L: Lang;
  user: User | null;
  origin: string;
  noindex: boolean;
}

function frame(c: Ctx, key: PageKey, title: string, desc: string, body: Raw, jsonld?: unknown): string {
  const [idp, enp] = PATHS[key];
  const path = c.L === 'en' ? enp : idp;
  const alt = c.L === 'en' ? idp : enp;
  return page({ L: c.L, title, desc, body, user: c.user, area: 'public', path: c.origin + path, alt, canonical: c.origin + path, noindex: c.noindex, jsonld, active: key });
}

const P = (L: Lang, key: PageKey) => PATHS[key][L === 'en' ? 1 : 0];
const signup = (L: Lang) => `/daftar${L === 'en' ? '?lang=en' : ''}`;

/* ── beranda ───────────────────────────────────────────────────────────── */

export function homePage(c: Ctx, billing: BillingSettings, eng: EngineSettings, measured: number | null, affPct: number | null): string {
  const L = c.L;
  const faq: [string, string][] = [
    [tr(L, 'Apakah hasilnya 100% akurat?', 'Is it 100% accurate?'), tr(L, 'Tidak ada detektor AI yang jujur bisa menjanjikan 100%. AI Content Analyzer hanya memberi label bila probabilitas terkalibrasi melewati ambang yang dipilih agar salah tuduh ≤ 1%; sisanya diberi label “Tidak meyakinkan”. Angka akurasi terukur ditampilkan di halaman Akurasi.', 'No AI detector can honestly promise 100%. AI Content Analyzer only gives a label when the calibrated probability passes a threshold chosen to keep false accusations ≤ 1%; everything else is labelled “Inconclusive”. Measured accuracy is shown on the Accuracy page.')],
    [tr(L, 'Apakah teks saya disimpan?', 'Is my text stored?'), tr(L, 'Teks disimpan terenkripsi lalu dihapus otomatis (bawaan 30 hari, bisa 0 hari). Laporan dan angkanya tetap di riwayat kerja Anda. Teks tidak dipakai melatih AI.', 'Texts are stored encrypted and deleted automatically (default 30 days, can be 0). Reports and their numbers stay in your work history. Texts are not used to train AI.')],
    [tr(L, 'Bagaimana token dihitung?', 'How are tokens counted?'), tr(L, 'Setiap kali AI membaca naskah Anda, ia memakai “token masuk”; setiap kali AI menulis jawabannya, ia memakai “token keluar”. Sebelum mulai, sistem menyisihkan sejumlah token dari saldo; setelah selesai, yang dipotong hanya pemakaian nyata (tidak pernah lebih dari yang disisihkan) dan sisanya otomatis kembali. Pemeriksaan gagal tidak dipotong.', 'Whenever the AI reads your text it uses “input tokens”; whenever it writes its answer it uses “output tokens”. Before starting, the system sets some tokens aside from your balance; when done, only the real usage is deducted (never more than what was set aside) and the rest returns automatically. Failed checks are not deducted.')],
    [tr(L, 'Berapa halaman yang bisa diperiksa dengan token saya?', 'How many pages can my tokens check?'), tr(L, 'Portal menampilkan perkiraan rentang halaman untuk saldo Anda. Itu perkiraan, bukan janji: biaya nyata tergantung model AI yang terpakai (sebagian besar naskah selesai di Haiku; naskah sulit naik ke Sonnet/Opus), panjang naskah, dan rubrik.', 'The portal shows an estimated page range for your balance. It is an estimate, not a promise: the real cost depends on the AI models used (most texts finish at Haiku; hard ones escalate to Sonnet/Opus), text length and rubric.')],
    [tr(L, 'Bisa untuk bahasa Inggris?', 'Does it work for English?'), tr(L, 'Ya. Mesin mendeteksi Bahasa Indonesia dan English, dan situs ini tersedia dalam dua bahasa.', 'Yes. The engine detects Indonesian and English, and this site is available in both languages.')],
    [tr(L, 'Bagaimana kalau hasilnya salah?', 'What if the result is wrong?'), tr(L, 'Tekan “Ajukan tinjauan” di laporan. Haiku, Sonnet, dan Opus menilai ulang seluruh teks tanpa melihat hasil lama (mode forensik penuh, ditagih token sesuai pemakaian). Kedua laporan tetap tersimpan.', 'Press “Request review” on the report. Haiku, Sonnet and Opus re-score the whole text blind to the old result (full forensic mode, charged in tokens by usage). Both reports are kept.')],
    [tr(L, 'Bolehkah memeriksa tulisan orang lain?', "May I check someone else's writing?"), tr(L, 'Boleh bila Anda berhak — sebagai guru, juri, editor, atau dengan izin penulis. Hasil adalah bukti pendukung, bukan vonis.', 'Yes, if you are entitled — as a teacher, judge, editor, or with the author’s consent. Results are supporting evidence, not a verdict.')],
    [tr(L, 'Apa bedanya dengan cek plagiarisme?', 'How is this different from a plagiarism check?'), tr(L, 'Cek plagiarisme mencari salinan dari sumber lain. AI Content Analyzer menilai apakah gaya tulisannya buatan AI, dan dalam sesi lomba juga membandingkan kemiripan antarpeserta.', 'A plagiarism check looks for copies of other sources. AI Content Analyzer judges whether the writing style is AI-made, and in contest sessions also compares entries with each other.')],
  ];
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: BRAND, applicationCategory: 'EducationalApplication', operatingSystem: 'Web', inLanguage: ['id', 'en'], offers: billing.packages.map((p) => ({ '@type': 'Offer', name: `${p.tokens} token`, price: String(packagePrice(p, billing, eng).idr), priceCurrency: 'IDR' })), description: tr(L, 'Detektor tulisan AI dan penilai artikel untuk Bahasa Indonesia dan English.', 'AI-writing detector and article grader for Indonesian and English.') },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ];
  const body = html`
<section class="hero">
  <div class="aurora" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy reveal">
      <span class="eyebrow">${BRAND} · ${TAGLINE}</span>
      <h1>${tr(L, 'Deteksi tulisan AI dan nilai kualitas artikel', 'Detect AI writing and grade the article')}<span class="grad"> — ${tr(L, 'dalam satu laporan yang bisa dicetak.', 'in one printable report.')}</span></h1>
      <p class="lead">${tr(L, 'Persen AI per kalimat, alasan yang bisa dibaca, dan nilai rubrik seperti form juri lomba. Diperiksa bertingkat oleh Claude Haiku, Sonnet, sampai Opus — yang termurah dulu, yang terkuat hanya untuk bagian yang sulit.', 'AI percentage per sentence, readable reasons, and a rubric score like a competition judge’s form. Checked in tiers by Claude Haiku, Sonnet and Opus — cheapest first, the strongest only for the hard parts.')}</p>
      <div class="cta-row"><a class="btn btn-primary btn-lg" href="${signup(L)}">${tr(L, 'Buat akun & mulai', 'Create an account & start')}</a><a class="btn btn-ghost btn-lg" href="${P(L, 'sample')}">${tr(L, 'Lihat contoh laporan', 'See a sample report')} →</a></div>
      <ul class="trust"><li>✓ ${tr(L, 'Bayar sesuai pemakaian', 'Pay for what you use')}</li><li>✓ ${tr(L, 'Gagal = tidak ditagih', 'Failed = not charged')}</li><li>✓ ${tr(L, 'Teks dienkripsi & terhapus otomatis', 'Texts encrypted & auto-deleted')}</li></ul>
    </div>
    <div class="hero-visual reveal" aria-hidden="true">
      <img class="hero-badge" src="/assets/logo-badge-192.webp" width="132" height="132" alt="">
      <div class="scan-card">
        <div class="scan-beam"></div>
        <div class="scan-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span><b>${tr(L, 'esai-peserta-07.docx', 'entrant-07-essay.docx')}</b></div>
        <p class="scan-line s1">${tr(L, 'Minggu lalu adik saya menunjukkan pesan berantai tentang beras plastik.', 'Last week my little sister showed me a chain message about plastic rice.')}</p>
        <p class="scan-line s2 hl-ai">${tr(L, 'Di era digital yang terus berkembang ini, literasi digital memainkan peran yang sangat penting.', 'In this ever-evolving digital era, digital literacy plays a very important role.')}</p>
        <p class="scan-line s3 hl-mix">${tr(L, 'Selain itu, kemampuan memilah informasi tidak hanya membantu individu.', 'Moreover, the ability to sort information does not only help individuals.')}</p>
        <p class="scan-line s4">${tr(L, 'Survei OSIS kami menemukan 41 dari 60 siswa pernah membagikan berita tanpa membacanya.', 'Our student-council survey found 41 of 60 students had shared news without reading it.')}</p>
        <div class="scan-result">${compBar({ ai: 18, mix: 14, hum: 68 })}<div class="scan-chips"><span class="pill p-ai">AI 18%</span><span class="pill p-mix">${tr(L, 'Campuran', 'Mixed')} 14%</span><span class="pill p-hum">${tr(L, 'Manusia', 'Human')} 68%</span></div></div>
      </div>
      <div class="float-chip c1">Haiku ✓</div><div class="float-chip c2">Sonnet → ${tr(L, '2 kalimat', '2 sentences')}</div><div class="float-chip c3">${tr(L, 'Nilai', 'Score')} 86,25</div>
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Cara kerja', 'How it works')}</span><h2>${tr(L, 'Termurah dulu, terkuat hanya bila perlu', 'Cheapest first, strongest only when needed')}</h2></div>
    <ol class="pipeline reveal" aria-label="${tr(L, 'Tahap pemeriksaan', 'Check stages')}">
      <li><i>0</i><b>${tr(L, 'Worker', 'Worker')}</b><span>${tr(L, 'Mengukur pola gaya tulisan, sisa salin-tempel, dan kemiripan — tanpa memakai AI', 'Measures writing-style patterns, paste traces and similarity — without using AI')}</span></li>
      <li><i>1</i><b>Claude Haiku</b><span>${tr(L, 'Memeriksa setiap kalimat & paragraf dengan teliti — semua naskah dimulai di sini', 'Carefully checks every sentence & paragraph — every text starts here')}</span></li>
      <li><i>2</i><b>Claude Sonnet</b><span>${tr(L, 'Hanya kalimat yang ragu, tanpa melihat jawaban Haiku', 'Only doubtful sentences, blind to Haiku’s answer')}</span></li>
      <li><i>3</i><b>Claude Opus</b><span>${tr(L, 'Pemeriksa terakhir untuk yang masih diragukan', 'Final checker for what is still in doubt')}</span></li>
      <li><i>✓</i><b>${tr(L, 'Laporan', 'Report')}</b><span>${tr(L, 'Persen, alasan, rubrik, QR verifikasi, cetak', 'Percentages, reasons, rubric, verification QR, print')}</span></li>
    </ol>
    <p class="center muted reveal">${tr(L, 'Naskah yang jelas selesai di Haiku (termurah); hanya bagian yang sulit yang naik — Anda membayar sesuai yang benar-benar dipakai.', 'Clear texts finish at Haiku (cheapest); only the hard parts escalate — you pay for what is actually used.')} <a href="${P(L, 'how')}">${tr(L, 'Penjelasan lengkap', 'Full explanation')} →</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Isi laporan', 'Inside the report')}</span><h2>${tr(L, 'Semua yang dibutuhkan guru, juri, dan editor', 'Everything teachers, judges and editors need')}</h2></div>
    <div class="grid g3">
      ${[
        ['◔', tr(L, 'Persen yang dirinci', 'Detailed percentages'), tr(L, 'Porsi AI, campuran, dan manusia; peluang naskah ditulis AI; tingkat keyakinan; rincian per paragraf dan per kalimat.', 'Share of AI, mixed and human; chance the text is AI-written; confidence level; detail per paragraph and per sentence.')],
        ['✎', tr(L, 'Kalimat bertanda', 'Marked sentences'), tr(L, 'Warna dan pola garis bawah yang tetap terbaca di printer hitam-putih, lengkap dengan alasannya.', 'Colours and underline patterns that stay readable on black-and-white printers, with reasons.')],
        ['🏅', tr(L, 'Rubrik siap juri', 'Judge-ready rubrics'), tr(L, 'Form lomba menulis esai (Tema 20, Sistematika 20, Gagasan 25, Kejelasan 20, Tulisan 15) dan 9 templat lain.', 'Essay-competition form (Theme 20, Structure 20, Ideas 25, Clarity 20, Writing 15) and 9 more templates.')],
        ['Aa', tr(L, 'Kesalahan bahasa', 'Language errors'), tr(L, 'Ejaan EYD V dan tata bahasa Inggris, dihitung per 1.000 kata seperti aturan form.', 'EYD V spelling and English grammar, counted per 1,000 words as the form requires.')],
        ['⇄', tr(L, 'Kemiripan antarpeserta', 'Cross-entry similarity'), tr(L, 'Menangkap peserta yang saling menyalin atau memakai jawaban AI yang sama.', 'Catches entrants copying each other or using the same AI answer.')],
        ['▣', tr(L, 'QR verifikasi & unduhan', 'Verification QR & downloads'), tr(L, 'Cetak/PDF, HTML mandiri, atau JSON bertanda tangan — semuanya tersimpan di riwayat kerja dan bisa dicek keasliannya.', 'Print/PDF, self-contained HTML or signed JSON — all kept in your work history and verifiable.')],
      ].map(([ic, t, d]) => html`<article class="feature reveal"><span class="feature-ic">${ic}</span><h3>${t}</h3><p class="muted">${d}</p></article>`)}
    </div>
  </div>
</section>

<section class="section alt">
  <div class="wrap split">
    <div class="reveal">
      <span class="eyebrow">${tr(L, 'Mode lomba & kelas', 'Contest & class mode')}</span>
      <h2>${tr(L, 'Unggah puluhan naskah, dapat rekap seperti form juri', 'Upload dozens of entries, get a recap like the judges’ form')}</h2>
      <p class="muted">${tr(L, 'Buat sesi, unggah .docx/.txt sekaligus, lalu dapatkan Tabel Rekapitulasi Penilaian Peserta: nilai per aspek, total, persen AI, label, kemiripan, dan peringkat. Cetak atau unduh CSV.', 'Create a session, upload .docx/.txt files at once, and get the Participant Recap Table: per-aspect scores, total, AI %, label, similarity and rank. Print it or download CSV.')}</p>
      <a class="btn btn-primary" href="${signup(L)}">${tr(L, 'Mulai sesi lomba', 'Start a contest session')}</a>
    </div>
    <div class="card recap-demo reveal">
      <table class="tbl"><thead><tr><th>${tr(L, 'Peserta', 'Entrant')}</th><th class="n">${tr(L, 'Total', 'Total')}</th><th class="n">AI</th><th>${tr(L, 'Label', 'Label')}</th></tr></thead>
      <tbody>
        <tr><td>${tr(L, 'Peserta 02', 'Entrant 02')}</td><td class="n"><b>96,25</b></td><td class="n">2%</td><td>${labelPill(L, 'human')}</td></tr>
        <tr><td>${tr(L, 'Peserta 01', 'Entrant 01')}</td><td class="n"><b>86,25</b></td><td class="n">4%</td><td>${labelPill(L, 'human')}</td></tr>
        <tr><td>${tr(L, 'Peserta 05', 'Entrant 05')}</td><td class="n"><b>76,25</b></td><td class="n">31%</td><td>${labelPill(L, 'partly')}</td></tr>
        <tr><td>${tr(L, 'Peserta 04', 'Entrant 04')}</td><td class="n"><b>83,75</b></td><td class="n">88%</td><td>${labelPill(L, 'ai')}</td></tr>
      </tbody></table>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Token berbayar', 'Paid tokens')}</span><h2>${tr(L, 'Beli token, bayar sesuai pemakaian AI', 'Buy tokens, pay for actual AI use')}</h2><p class="muted">${tr(L, 'Perkiraan halaman ditampilkan sebagai rentang — tergantung model AI yang terpakai.', 'Page estimates are shown as ranges — they depend on which AI models are used.')}</p></div>
    <div class="grid g4">
      ${billing.packages.map((p) => {
        const pr = predictPages(p.tokens, billing, eng, measured);
        const pp = packagePrice(p, billing, eng);
        const usd = `US$${fmtNum(L, pp.usd, Number.isInteger(pp.usd) ? 0 : 2)}`;
        return html`<article class="plan reveal"><h3>${bi(L, p.name)}</h3><p class="price">${L === 'en' ? usd : `Rp ${fmtNum(L, pp.idr)}`}</p><p class="price-alt">${L === 'en' ? `Rp ${fmtNum(L, pp.idr)}` : usd}</p>${p.discountPct ? html`<span class="pill p-hum">${tr(L, `hemat ${p.discountPct}%`, `save ${p.discountPct}%`)}</span>` : ''}<p><b>${fmtNum(L, p.tokens)}</b> token</p><p class="predict-sm">≈ ${fmtNum(L, pr.pages.low)}–${fmtNum(L, pr.pages.high)} ${tr(L, 'halaman*', 'pages*')}</p></article>`;
      })}
    </div>
    <div class="perpage reveal">${predictByMode(0, billing, eng).map((x) => html`<div><span>${L === 'en' ? MODE_INFO[x.mode]!.en : MODE_INFO[x.mode]!.id}</span><b>Rp ${fmtNum(L, x.idrPerPage.low)}–${fmtNum(L, x.idrPerPage.high)}</b><small>${tr(L, 'per halaman*', 'per page*')}</small></div>`)}</div>
    <p class="center"><a href="${P(L, 'price')}">${tr(L, 'Cara token dihitung', 'How tokens are counted')} →</a></p>
  </div>
</section>

${affPct !== null ? html`<section class="section alt"><div class="wrap split"><div class="reveal"><span class="eyebrow">${tr(L, 'Afiliasi', 'Affiliate')}</span><h2>${tr(L, `Ajak rekan, dapat komisi ${affPct}%`, `Refer colleagues, earn ${affPct}% commission`)}</h2><p class="muted">${tr(L, `Setiap member punya tautan referal. Saat orang yang Anda ajak membeli token dan pembayarannya lunas, Anda mendapat ${affPct}% dari harganya — bisa ditukar token atau dicairkan.`, `Every member has a referral link. When someone you referred buys tokens and the payment is confirmed, you earn ${affPct}% of the price — convert it to tokens or cash it out.`)}</p><a class="btn btn-primary" href="${signup(L)}">${tr(L, 'Dapatkan tautan saya', 'Get my link')}</a></div><div class="card reveal center"><div class="big-pct">${affPct}%</div><p class="muted">${tr(L, 'dari setiap pembelian token yang lunas', 'of every confirmed token purchase')}</p></div></div></section>` : ''}

<section class="section alt">
  <div class="wrap narrow">
    <div class="section-head reveal"><span class="eyebrow">FAQ</span><h2>${tr(L, 'Pertanyaan yang sering diajukan', 'Frequently asked questions')}</h2></div>
    <div class="faq">${faq.map(([q, a]) => html`<details class="reveal"><summary>${q}</summary><p>${a}</p></details>`)}</div>
  </div>
</section>

<section class="cta-band">
  <div class="wrap center reveal"><h2>${tr(L, 'Siap memeriksa naskah pertama?', 'Ready to check your first text?')}</h2><p>${tr(L, 'Buat akun, beli token, lalu unggah naskah — laporan tersimpan di riwayat kerja Anda.', 'Create an account, buy tokens, then upload a text — reports stay in your work history.')}</p><a class="btn btn-light btn-lg" href="${signup(L)}">${tr(L, 'Buat akun', 'Create an account')}</a></div>
</section>`;
  return frame(c, 'home', tr(L, 'Detektor Tulisan AI & Penilai Artikel', 'AI Writing Detector & Article Grader'), tr(L, 'Deteksi tulisan AI untuk Bahasa Indonesia dan English: persen AI per kalimat, rubrik penilaian lomba menulis, laporan yang bisa dicetak.', 'AI-writing detection for Indonesian and English: per-sentence AI percentage, writing-competition rubrics, printable reports.'), body, jsonld);
}

/* ── cara kerja ─────────────────────────────────────────────────────────── */

export function howPage(c: Ctx): string {
  const L = c.L;
  const signals: [string, string, string][] = [
    ['1', tr(L, 'Pola gaya tulisan', 'Writing-style patterns'), tr(L, 'Tulisan manusia biasanya panjang-pendek kalimatnya tidak rata, punya pengalaman pribadi dan detail nyata. Tulisan AI cenderung rata, umum, dan penuh kata sambung yang sama. Ini diukur tanpa AI.', 'Human writing usually has uneven sentence lengths, personal experience and real detail. AI writing tends to be even, generic and full of the same linking words. This is measured without AI.')],
    ['2', tr(L, 'Sisa salin-tempel', 'Paste traces'), tr(L, 'Jejak yang tertinggal saat teks disalin dari chatbot: tanda bintang tebal, judul bertanda pagar, kalimat seperti “Tentu! Berikut…”, atau karakter tak terlihat.', 'Leftovers from copying a chatbot: bold asterisks, hash-mark headings, lines like “Sure! Here is…”, or invisible characters.')],
    ['3', tr(L, 'Uji tebak lanjutan', 'Guess-the-next-line test'), tr(L, 'AI diminta melanjutkan potongan naskah. Bila tebakannya sangat mirip dengan lanjutan aslinya, naskah itu “mudah ditebak” — ciri tulisan AI.', 'The AI is asked to continue a piece of the text. If its guess closely matches the real continuation, the text is “predictable” — a trait of AI writing.')],
    ['4', tr(L, 'Pemeriksaan AI bertingkat', 'Tiered AI checks'), tr(L, 'Claude Haiku memeriksa setiap kalimat. Kalimat yang masih ragu diperiksa ulang oleh Claude Sonnet, dan yang tetap diragukan oleh Claude Opus. Pemeriksa yang lebih tinggi tidak melihat jawaban sebelumnya, jadi tidak ikut-ikutan.', 'Claude Haiku checks every sentence. Doubtful sentences are re-checked by Claude Sonnet, and those still in doubt by Claude Opus. Higher checkers never see the earlier answers, so they are not influenced.')],
    ['5', tr(L, 'Kemiripan antarnaskah', 'Similarity between texts'), tr(L, 'Dalam satu sesi lomba atau kelas, naskah dibandingkan satu sama lain untuk menemukan yang saling menyalin.', 'Within one contest or class session, texts are compared with each other to find copying.')],
  ];
  const body = html`<section class="section"><div class="wrap narrow">
  <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Cara kerja', 'How it works')}</span><h1>${tr(L, 'Lima cara memeriksa, tiga tingkat AI, satu hasil yang jujur', 'Five ways of checking, three AI tiers, one honest result')}</h1><p class="lead">${tr(L, 'Hasil yang tepat tidak datang dari satu pemeriksa saja, tetapi dari beberapa cara memeriksa yang saling melengkapi. Bila satu cara tertipu, cara lain masih menangkapnya.', 'An accurate result does not come from one checker alone but from several ways of checking that complement each other. If one is fooled, the others still catch it.')}</p></div>
  <div class="stack">${signals.map(([k, t, d]) => html`<article class="card row-card reveal"><span class="badge-lg">${k}</span><div><h3>${t}</h3><p class="muted">${d}</p></div></article>`)}</div>
  <h2 class="reveal">${tr(L, 'Membaca persentase', 'Reading the percentages')}</h2>
  <div class="card reveal">${compBar({ ai: 4, mix: 11, hum: 85 }, true)}
    <ul class="clean">
      <li><span class="pill p-ai">AI</span> ${tr(L, 'kata dalam kalimat dengan peluang AI ≥ 80%', 'words in sentences with AI probability ≥ 80%')}</li>
      <li><span class="pill p-mix">${tr(L, 'Campuran', 'Mixed')}</span> ${tr(L, '20–80%: dibantu/diedit AI atau masih ragu', '20–80%: AI-assisted/edited or uncertain')}</li>
      <li><span class="pill p-hum">${tr(L, 'Manusia', 'Human')}</span> ${tr(L, '≤ 20%', '≤ 20%')}</li>
    </ul>
    <p class="muted">${tr(L, 'Ketiganya dibobot jumlah kata dan selalu berjumlah 100%. Kutipan panjang, judul, dan daftar pustaka dikecualikan. Label hanya diberikan bila sistem yakin; selain itu “Tidak meyakinkan — perlu tinjauan manusia”.', 'All three are word-weighted and always total 100%. Long quotes, headings and bibliographies are excluded. A label is only given when the system is confident; otherwise “Inconclusive — needs human review”.')}</p>
  </div>
  <h2 class="reveal">${tr(L, 'Batasan yang kami umumkan', 'Limits we state openly')}</h2>
  <ul class="checklist reveal">
    <li>${tr(L, 'Teks di bawah 150 kata tidak diberi label; 150–300 kata keyakinan paling tinggi “Sedang”.', 'Texts under 150 words get no label; 150–300 words at most “Medium” confidence.')}</li>
    <li>${tr(L, 'Bahasa sederhana dan salah ketik wajar tidak dianggap tanda AI.', 'Simple language and normal typos are not treated as signs of AI.')}</li>
    <li>${tr(L, 'Tulisan manusia yang dirapikan AI dilaporkan sebagai campuran, bukan kecurangan.', 'Human writing polished by AI is reported as mixed, not cheating.')}</li>
    <li>${tr(L, 'Hasil adalah bukti pendukung — keputusan tetap di tangan manusia.', 'Results are supporting evidence — decisions stay with people.')}</li>
  </ul>
</div></section>`;
  return frame(c, 'how', tr(L, 'Cara kerja', 'How it works'), tr(L, 'Lima cara memeriksa dan tiga tingkat AI (Claude Haiku → Sonnet → Opus) untuk mendeteksi tulisan AI berbahasa Indonesia dan Inggris.', 'Five ways of checking and three AI tiers (Claude Haiku → Sonnet → Opus) to detect AI writing in Indonesian and English.'), body);
}

/* ── akurasi ─────────────────────────────────────────────────────────── */

export interface PublishedAccuracy {
  at: number;
  rows: { slice: string; n: number; accuracy: number; falseAccusation: number; coverage: number }[];
}

export function accuracyPage(c: Ctx, acc: PublishedAccuracy | null): string {
  const L = c.L;
  const targets: [string, string][] = [
    [tr(L, 'Ketepatan di zona yakin', 'Accuracy in the confident zone'), '≥ 98%'],
    [tr(L, 'Salah tuduh (manusia dinilai AI)', 'False accusation (human judged AI)'), '≤ 1%'],
    [tr(L, 'Cakupan keputusan (≥ 300 kata)', 'Decision coverage (≥ 300 words)'), '≥ 85%'],
    [tr(L, 'AI yang diparafrase / humanizer', 'Paraphrased / humanized AI'), '≥ 80%'],
  ];
  const body = html`<section class="section"><div class="wrap narrow">
  <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Akurasi', 'Accuracy')}</span><h1>${tr(L, 'Angka terukur, bukan janji 100%', 'Measured numbers, not a 100% promise')}</h1><p class="lead">${tr(L, 'Tidak ada detektor AI yang jujur bisa menjanjikan 100% untuk semua teks. Yang kami janjikan: angka yang diukur pada benchmark Bahasa Indonesia dan English, label yang hanya keluar bila sistem yakin, dan salah tuduh yang sangat kecil.', 'No AI detector can honestly promise 100% on every text. What we promise: numbers measured on an Indonesian and English benchmark, labels that only appear when the system is confident, and very few false accusations.')}</p></div>
  ${acc
    ? html`<div class="card reveal"><h3>${tr(L, 'Hasil uji terakhir', 'Latest test results')} — ${fmtDate(L, acc.at, false)}</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Irisan', 'Slice')}</th><th class="n">n</th><th class="n">${tr(L, 'Ketepatan', 'Accuracy')}</th><th class="n">${tr(L, 'Salah tuduh', 'False accusation')}</th><th class="n">${tr(L, 'Cakupan', 'Coverage')}</th></tr></thead><tbody>${acc.rows.map((r) => html`<tr><td>${r.slice}</td><td class="n">${r.n}</td><td class="n">${(r.accuracy * 100).toFixed(1)}%</td><td class="n">${(r.falseAccusation * 100).toFixed(1)}%</td><td class="n">${(r.coverage * 100).toFixed(1)}%</td></tr>`)}</tbody></table></div></div>`
    : html`<div class="card reveal callout-info"><h3>${tr(L, 'Hasil uji belum diterbitkan', 'No test results published yet')}</h3><p>${tr(L, 'Mesin baru saja dipasang. Angka di halaman ini akan muncul otomatis setelah admin menjalankan benchmark dan menerbitkannya. Sampai saat itu, laporan diberi tanda “kalibrasi awal”.', 'The engine has just been installed. Numbers appear here automatically once the admin runs the benchmark and publishes it. Until then, reports carry an “initial calibration” note.')}</p></div>`}
  <h2 class="reveal">${tr(L, 'Target yang diukur', 'Targets we measure against')}</h2>
  <div class="grid g2">${targets.map(([k, v]) => html`<div class="stat reveal"><span class="stat-k">${k}</span><b class="stat-v">${v}</b></div>`)}</div>
</div></section>`;
  return frame(c, 'acc', tr(L, 'Akurasi', 'Accuracy'), tr(L, 'Akurasi terukur detektor tulisan AI AI Content Analyzer untuk Bahasa Indonesia dan English, beserta batasannya.', "AI Content Analyzer's measured AI-detection accuracy for Indonesian and English, with its limits."), body);
}

/* ── harga ─────────────────────────────────────────────────────────── */

export function pricingPage(c: Ctx, b: BillingSettings, eng: EngineSettings, measured: number | null): string {
  const L = c.L;
  const ex = [300, 1500, 3000].map((w) => ({ w, e: estimateTokens(w, 'auto', true, b, eng) }));
  const body = html`<section class="section"><div class="wrap">
  <div class="section-head reveal center"><span class="eyebrow">${tr(L, 'Harga', 'Pricing')}</span><h1>${tr(L, 'Token berbayar — bayar sesuai pemakaian', 'Paid tokens — pay for what you use')}</h1><p class="lead">${tr(L, `1 token = Rp ${fmtNum(L, Math.ceil(tokenPriceIdr(b, eng)))}. Setiap pemeriksaan memotong token sesuai pemakaian AI yang benar-benar terjadi. Bayar dengan transfer Rupiah, Dolar AS dari luar negeri, atau dari saldo deposit.`, `1 token = Rp ${fmtNum(L, Math.ceil(tokenPriceIdr(b, eng)))}. Each check deducts tokens according to the AI usage that actually happened. Pay by Rupiah transfer, US dollars from abroad, or from a deposit balance.`)}</p></div>
  <div class="grid g4 plans">${b.packages.map((p, k) => {
    const pr = predictPages(p.tokens, b, eng, measured);
    return html`<article class="plan reveal ${k === 2 ? 'featured' : ''}">${k === 2 ? html`<span class="ribbon">${tr(L, 'Untuk juri & guru', 'For judges & teachers')}</span>` : ''}<h3>${bi(L, p.name)}</h3><p class="price">${L === 'en' ? `US$${fmtNum(L, packagePrice(p, b, eng).usd, Number.isInteger(packagePrice(p, b, eng).usd) ? 0 : 2)}` : `Rp ${fmtNum(L, packagePrice(p, b, eng).idr)}`}</p><p class="price-alt">${L === 'en' ? `Rp ${fmtNum(L, packagePrice(p, b, eng).idr)}` : `US$${fmtNum(L, packagePrice(p, b, eng).usd, Number.isInteger(packagePrice(p, b, eng).usd) ? 0 : 2)}`}</p>${p.discountPct ? html`<span class="pill p-hum">${tr(L, `hemat ${p.discountPct}%`, `save ${p.discountPct}%`)}</span>` : ''}<p><b>${fmtNum(L, p.tokens)}</b> token</p><p class="predict-sm">≈ ${fmtNum(L, pr.pages.low)}–${fmtNum(L, pr.pages.high)} ${tr(L, 'halaman*', 'pages*')}</p><p class="muted">${bi(L, p.note)}</p><a class="btn ${k === 2 ? 'btn-primary' : 'btn-ghost'}" href="/app/token?paket=${p.key}">${tr(L, 'Pilih', 'Choose')}</a></article>`;
  })}</div>
  <section class="card reveal narrow-block"><h3>${tr(L, 'Prediksi halaman per paket & mesin AI', 'Page estimate per package & AI engine')}</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Paket', 'Package')}</th>${(['haiku', 'sonnet', 'opus', 'auto'] as const).map((m) => html`<th class="n">${L === 'en' ? MODE_INFO[m]!.en : MODE_INFO[m]!.id}</th>`)}</tr></thead>
    <tbody>${b.packages.map((p) => html`<tr><td><b>${bi(L, p.name)}</b><br><small class="muted">${fmtNum(L, p.tokens)} token</small></td>${predictByMode(p.tokens, b, eng).map((x) => html`<td class="n">${fmtNum(L, x.pages.low)}–${fmtNum(L, x.pages.high)} ${tr(L, 'hal.', 'pp.')}</td>`)}</tr>`)}</tbody></table></div>
    <h3 class="mt">${tr(L, 'Perkiraan harga per halaman', 'Estimated price per page')}</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Mesin AI', 'AI engine')}</th><th class="n">${tr(L, 'Token / halaman', 'Tokens / page')}</th><th class="n">${tr(L, 'Rupiah / halaman', 'Rupiah / page')}</th></tr></thead>
    <tbody>${predictByMode(0, b, eng).map((x) => html`<tr><td><b>${L === 'en' ? MODE_INFO[x.mode]!.en : MODE_INFO[x.mode]!.id}</b></td><td class="n">${fmtScore(L, x.perPage.low)}–${fmtScore(L, x.perPage.high)}</td><td class="n">Rp ${fmtNum(L, x.idrPerPage.low)}–${fmtNum(L, x.idrPerPage.high)}</td></tr>`)}</tbody></table></div>
    <p class="muted small">${tr(L, `Perkiraan, bukan janji: ±${b.wordsPerPage} kata per halaman dengan rubrik; pemakaian nyata tergantung model AI yang terpakai dan tingkat kesulitan naskah. AUTO biasanya paling hemat untuk hasil yang teliti.`, `An estimate, not a promise: ±${b.wordsPerPage} words per page with a rubric; real usage depends on the AI models used and the text’s difficulty. AUTO is usually the most economical for careful results.`)}</p>
  </section>
  <section class="card reveal narrow-block"><h3>${tr(L, 'Bagaimana token dihitung — masukan & keluaran', 'How tokens are counted — input & output')}</h3>
    <div class="grid g3">
      <div><h4>1 · ${tr(L, 'Token masuk', 'Input tokens')}</h4><p class="muted">${tr(L, 'Teks yang dibaca model: naskah Anda, instruksi penilaian, dan rubrik. Naskah ±1.000 kata Bahasa Indonesia ≈ 1.700 token.', 'Text the model reads: your document, the grading instructions and the rubric. A ±1,000-word Indonesian text ≈ 1,700 tokens.')}</p></div>
      <div><h4>2 · ${tr(L, 'Token keluar', 'Output tokens')}</h4><p class="muted">${tr(L, 'Jawaban model (nilai per kalimat, alasan, rubrik) termasuk token “berpikir”. Token keluar lebih mahal daripada token masuk.', 'The model’s answer (per-sentence scores, reasons, rubric) including “thinking” tokens. Output tokens cost more than input tokens.')}</p></div>
      <div><h4>3 · ${tr(L, 'Token platform', 'Platform tokens')}</h4><p class="muted">${tr(L, 'Σ (token masuk × tarif masuk + token keluar × tarif keluar) ÷ 1.000, dibulatkan ke atas. Rincian tiap panggilan ada di setiap laporan.', 'Σ (input tokens × input rate + output tokens × output rate) ÷ 1,000, rounded up. Every report lists each call.')}</p></div>
    </div>
    ${rateTable(L, rateCard(b, eng))}
  </section>
  <p class="muted small center reveal">* ${tr(L, `Perkiraan, bukan janji (±${b.wordsPerPage} kata per halaman). Pemakaian nyata tergantung model AI yang terpakai — Haiku saja, atau naik ke Sonnet/Opus untuk bagian yang sulit — serta panjang naskah dan rubrik.`, `An estimate, not a promise (±${b.wordsPerPage} words per page). Real usage depends on the AI models used — Haiku only, or escalation to Sonnet/Opus for hard parts — plus text length and rubric.`)}</p>
  <div class="grid g2 narrow-block">
    <div class="card reveal"><h3>${tr(L, 'Contoh perkiraan (mode otomatis + rubrik)', 'Example estimates (automatic mode + rubric)')}</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Naskah', 'Text')}</th><th class="n">${tr(L, 'Biasanya', 'Usually')}</th><th class="n">${tr(L, 'Dipesan dulu', 'Reserved first')}</th></tr></thead><tbody>${ex.map((x) => html`<tr><td>${fmtNum(L, x.w)} ${tr(L, 'kata', 'words')}</td><td class="n">${x.e.min}–${x.e.typical} token</td><td class="n">${x.e.reserve} token</td></tr>`)}</tbody></table></div></div>
    <div class="card reveal"><h3>${tr(L, 'Aturan token', 'Token rules')}</h3><ul class="clean">
      <li>✓ ${tr(L, 'Bayar dulu: token dibeli di muka, lalu otomatis berkurang setiap kali dipakai.', 'Pay first: tokens are bought up front, then decrease automatically as they are used.')}</li>
      <li>✓ ${tr(L, 'Sejumlah token disisihkan sebelum AI bekerja; sisanya kembali otomatis.', 'Some tokens are set aside before the AI works; the rest returns automatically.')}</li>
      <li>✓ ${tr(L, 'Yang dipotong hanya pemakaian nyata, tidak pernah melebihi yang disisihkan.', 'Only real usage is deducted, never more than what was set aside.')}</li>
      <li>✓ ${tr(L, 'Pemeriksaan gagal tidak ditagih.', 'Failed checks are not charged.')}</li>
      <li>✓ ${tr(L, 'Bayar dengan transfer Rupiah, Dolar AS (dengan panduan transfer dari luar negeri), atau dari saldo deposit Rupiah. Unggah bukti transfer; token masuk setelah admin memverifikasi dana. Invoice bisa dicetak.', 'Pay by Rupiah transfer, US dollars (with a guide for transfers from abroad), or from a Rupiah deposit balance. Upload the transfer proof; tokens arrive once the admin verifies the funds. Invoices are printable.')}</li>
      <li>ⓘ ${tr(L, 'Saldo token dan saldo deposit tidak bisa diuangkan; sisa deposit selalu bisa dipakai membeli atau ditukar menjadi token.', 'Token and deposit balances cannot be cashed out; the remaining deposit can always be used to buy or convert into tokens.')}</li>
      <li>🗓 ${tr(L, `Hasil kerja dan berkas unggahan dihapus otomatis ${PURGE_DAYS} hari setelah dibuat — unduh laporan yang ingin disimpan.`, `Work and uploaded files are deleted automatically ${PURGE_DAYS} days after creation — download the reports you want to keep.`)}</li></ul></div>
  </div>
</div></section>`;
  return frame(c, 'price', tr(L, 'Harga token', 'Token pricing'), tr(L, 'Token berbayar AI Content Analyzer: bayar sesuai pemakaian, sisa token kembali, pemeriksaan gagal tidak dipotong.', 'AI Content Analyzer paid tokens: pay for what you use, unused tokens return, failed checks are not deducted.'), body);
}

/* ── contoh laporan ─────────────────────────────────────────────────── */

export function samplePage(c: Ctx): string {
  const L = c.L;
  const s = { ...SAMPLE_SUMMARY, reportLang: L };
  const body = html`<section class="section"><div class="wrap">
  <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Contoh laporan (data rekaan)', 'Sample report (made-up data)')}</span><h1>${tr(L, 'Seperti inilah laporan yang dicetak member', 'This is the report a member prints')}</h1><p class="lead">${tr(L, 'Arahkan kursor (atau ketuk) kalimat di lampiran untuk melihat peluang dan alasannya. Tekan Cetak untuk melihat versi A4.', 'Hover (or tap) a sentence in the appendix to see its probability and reasons. Press Print to see the A4 version.')}</p>
  <div class="cta-row noprint"><button class="btn btn-primary" type="button" data-print>🖨 ${tr(L, 'Cetak / simpan PDF', 'Print / save PDF')}</button><a class="btn btn-ghost" href="${signup(L)}">${tr(L, 'Buat laporan sendiri', 'Make your own report')}</a></div></div>
  ${reportPages({ L, s, d: SAMPLE_DETAIL, verifyUrl: `${c.origin}/v/${s.verifyCode}`, sample: true, checker: tr(L, 'Juri 2 — panitia contoh', 'Judge 2 — sample committee') })}
</div></section>`;
  return frame(c, 'sample', tr(L, 'Contoh laporan', 'Sample report'), tr(L, 'Contoh laporan deteksi AI dan penilaian rubrik lomba menulis esai yang bisa dicetak.', 'A printable sample AI-detection and essay-competition rubric report.'), body);
}

/* ── kebijakan ──────────────────────────────────────────────────────── */

export function policyPage(c: Ctx, key: 'privacy' | 'terms' | 'ethics'): string {
  const L = c.L;
  const content: Record<typeof key, { title: string; items: string[] }> = {
    privacy: {
      title: tr(L, 'Kebijakan privasi', 'Privacy policy'),
      items: [
        tr(L, 'Kami menyimpan akun (nama, e-mail, hash sandi), saldo token, dan laporan Anda di penyimpanan awan terenkripsi milik kami.', 'We store your account (name, e-mail, password hash), credits and reports in our encrypted cloud storage.'),
        tr(L, 'Teks yang diperiksa disimpan terenkripsi (AES-256-GCM) dan dihapus otomatis sesuai masa simpan yang Anda pilih (bawaan 30 hari, bisa 0, paling lama 90 hari).', 'Checked texts are stored encrypted (AES-256-GCM) and deleted automatically per your chosen retention (default 30 days, can be 0, at most 90 days).'),
        tr(L, `Pembersihan otomatis: laporan, sesi lomba/kelas, kode verifikasinya, dan berkas unggahan (termasuk bukti transfer) dihapus ${PURGE_DAYS} hari setelah dibuat. Invoice dan catatan saldo tetap disimpan sebagai catatan transaksi.`, `Automatic clean-up: reports, contest/class sessions, their verification codes and uploaded files (including transfer proofs) are deleted ${PURGE_DAYS} days after creation. Invoices and balance records are kept as transaction records.`),
        tr(L, 'Berkas .docx diolah di peramban Anda; hanya teksnya yang dikirim.', '.docx files are processed in your browser; only their text is sent.'),
        tr(L, 'Untuk keamanan dan program afiliasi kami menyimpan hash (bukan alamat asli) IP terakhir Anda, agar referal-diri bisa dicegah.', 'For security and the affiliate programme we store a hash (not the real address) of your last IP, so self-referrals can be prevented.'),
        tr(L, 'Teks dikirim ke API Anthropic (Claude) untuk dianalisis. Sesuai ketentuan komersial Anthropic, data API tidak dipakai melatih model secara bawaan. Kami tidak menjual data.', 'Texts are sent to the Anthropic (Claude) API for analysis. Under Anthropic’s commercial terms, API data is not used to train models by default. We never sell data.'),
        tr(L, 'Hak Anda (UU No. 27/2022 tentang Pelindungan Data Pribadi): mengakses, mengekspor, membetulkan, dan menghapus data — dari Pengaturan atau lewat hello@axto.io.', 'Your rights (Indonesian Law No. 27/2022 on Personal Data Protection): access, export, correct and delete data — from Settings or via hello@axto.io.'),
      ],
    },
    terms: {
      title: tr(L, 'Syarat & ketentuan', 'Terms of service'),
      items: [
        tr(L, 'Anda hanya memeriksa naskah yang berhak Anda periksa (milik sendiri, sebagai guru/juri/editor, atau dengan izin penulis).', 'You only check texts you are entitled to check (your own, as a teacher/judge/editor, or with the author’s consent).'),
        tr(L, 'Hasil deteksi adalah perkiraan probabilistik dan bukti pendukung, bukan vonis. Jangan menjadikannya satu-satunya dasar sanksi.', 'Detection results are probabilistic estimates and supporting evidence, not a verdict. Do not use them as the sole basis for sanctions.'),
        tr(L, 'Token disisihkan sebelum pemeriksaan dan dipotong sesuai pemakaian nyata (tidak melebihi yang disisihkan); sisa kembali; pemeriksaan gagal tidak dipotong.', 'Tokens are set aside before a check and deducted by real usage (never above what was set aside); the rest returns; failed checks are not deducted.'),
        tr(L, 'Pembayaran lewat transfer bank dalam Rupiah atau Dolar AS. Token atau saldo deposit masuk setelah admin memverifikasi dana sesuai bukti transfer yang Anda unggah. Biaya transfer dan selisih kurs ditanggung pengirim.', 'Payment is by bank transfer in Rupiah or US dollars. Tokens or deposit balance are added after the admin verifies the funds against the transfer proof you upload. Transfer fees and exchange differences are borne by the sender.'),
        tr(L, 'Saldo token dan saldo deposit Rupiah tidak bisa diuangkan, dikembalikan ke rekening, atau dipindahkan ke akun lain (kecuali diwajibkan hukum). Sisa deposit selalu bisa dipakai membeli paket token atau ditukar menjadi token dengan harga token yang berlaku saat itu. Komisi afiliasi diatur terpisah dan bisa dicairkan sesuai ketentuan program afiliasi.', 'Token and Rupiah deposit balances cannot be cashed out, refunded to a bank account or moved to another account (unless required by law). The remaining deposit can always be used to buy token packages or be converted into tokens at the token price in effect at that time. Affiliate commission is governed separately and can be paid out under the affiliate programme rules.'),
        tr(L, `Semua hasil kerja (laporan, naskah, sesi lomba/kelas) dan berkas yang diunggah member — termasuk bukti transfer — dihapus otomatis ${PURGE_DAYS} hari setelah dibuat. Unduh atau cetak laporan yang ingin disimpan. Catatan transaksi (invoice, saldo, buku besar) tetap disimpan.`, `All work (reports, texts, contest/class sessions) and files uploaded by members — including transfer proofs — are deleted automatically ${PURGE_DAYS} days after creation. Download or print the reports you want to keep. Transaction records (invoices, balances, ledgers) are kept.`),
        tr(L, 'Komisi afiliasi hanya dari pembelian yang lunas oleh akun yang direferensikan; referal-diri, akun ganda, atau manipulasi lain membatalkan komisi.', 'Affiliate commission only comes from confirmed purchases by referred accounts; self-referral, duplicate accounts or other manipulation void the commission.'),
        tr(L, 'Penyalahgunaan (otomatisasi berlebihan, upaya membobol, memeriksa data tanpa hak) dapat menyebabkan akun ditangguhkan.', 'Abuse (excessive automation, intrusion attempts, checking data without entitlement) may lead to suspension.'),
      ],
    },
    ethics: {
      title: tr(L, 'Penggunaan etis', 'Ethical use'),
      items: [
        tr(L, 'Gunakan laporan sebagai awal percakapan, bukan akhir. Tanyakan proses menulis kepada penulis.', 'Use the report to start a conversation, not to end one. Ask the writer about their process.'),
        tr(L, 'Minta draf, catatan, atau riwayat versi dokumen sebagai bukti tandingan.', 'Ask for drafts, notes or document version history as counter-evidence.'),
        tr(L, 'Label “Tidak meyakinkan” berarti sistem tidak cukup yakin — jangan dibaca sebagai “AI”.', '“Inconclusive” means the system is not sure enough — never read it as “AI”.'),
        tr(L, 'Penulis non-penutur asli dan pelajar pemula menulis sederhana; itu bukan tanda AI.', 'Non-native writers and beginners write simply; that is not a sign of AI.'),
        tr(L, 'Bila ragu, ajukan tinjauan: Haiku, Sonnet, dan Opus menilai ulang tanpa melihat hasil lama.', 'When in doubt, request a review: Haiku, Sonnet and Opus re-score blind to the old result.'),
      ],
    },
  };
  const k = key === 'privacy' ? 'privacy' : key === 'terms' ? 'terms' : 'ethics';
  const ct = content[key];
  const body = html`<section class="section"><div class="wrap narrow"><div class="section-head reveal"><h1>${ct.title}</h1><p class="muted">${tr(L, 'Berlaku sejak 2 November 2026.', 'Effective 2 November 2026.')}</p></div><ol class="checklist reveal">${ct.items.map((i) => html`<li>${i}</li>`)}</ol></div></section>`;
  return frame(c, k as PageKey, ct.title, ct.items[0]!.slice(0, 150), body);
}

/* ── verifikasi ─────────────────────────────────────────────────────── */

export interface VerifyRecord {
  code: string;
  reportId: string;
  createdAt: number;
  title: string;
  comp: { ai: number; mix: number; hum: number };
  label: string;
  total: number | null;
  hash: string;
  words: number;
  revoked?: boolean;
}

export function verifyPage(L: Lang, user: User | null, code: string | null, rec: VerifyRecord | null): string {
  const body = html`<section class="section"><div class="wrap narrow">
  <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Verifikasi', 'Verification')}</span><h1>${tr(L, 'Periksa keaslian laporan cetak', 'Check a printed report is genuine')}</h1><p class="lead">${tr(L, 'Masukkan kode di kaki laporan (mis. 7Q4K-92XD) atau pindai QR-nya.', 'Enter the code in the report footer (e.g. 7Q4K-92XD) or scan its QR.')}</p></div>
  <form class="card row-form reveal" method="get" action="/verifikasi"><input type="hidden" name="lang" value="${L}"><label class="field grow"><span>${tr(L, 'Kode verifikasi', 'Verification code')}</span><input name="kode" value="${code ?? ''}" placeholder="XXXX-XXXX" autocomplete="off" required pattern="[A-Za-z0-9]{4}-?[A-Za-z0-9]{4}"></label><button class="btn btn-primary" type="submit">${tr(L, 'Periksa', 'Verify')}</button></form>
  ${code
    ? rec
      ? html`<div class="card verify-ok reveal ${rec.revoked ? 'revoked' : ''}"><h2>${rec.revoked ? `⚠ ${tr(L, 'Laporan ini telah dicabut', 'This report has been revoked')}` : `✓ ${tr(L, 'Laporan asli', 'Genuine report')}`}</h2>
        <dl class="kv"><dt>${tr(L, 'Kode', 'Code')}</dt><dd>${rec.code}</dd><dt>${tr(L, 'Tanggal', 'Date')}</dt><dd>${fmtDate(L, rec.createdAt)}</dd><dt>${tr(L, 'Judul', 'Title')}</dt><dd>${rec.title}</dd><dt>${tr(L, 'Kata dianalisis', 'Words analysed')}</dt><dd>${fmtNum(L, rec.words)}</dd><dt>SHA-256</dt><dd class="mono">${rec.hash.slice(0, 16)}…</dd><dt>${tr(L, 'Nilai rubrik', 'Rubric score')}</dt><dd>${rec.total ?? '—'}</dd></dl>
        ${compBar(rec.comp, true)}<p>AI ${rec.comp.ai}% · ${tr(L, 'Campuran', 'Mixed')} ${rec.comp.mix}% · ${tr(L, 'Manusia', 'Human')} ${rec.comp.hum}%</p></div>`
      : html`<div class="flash err reveal">⚠ ${tr(L, `Kode tidak ditemukan. Periksa kembali penulisannya — atau laporan sudah melewati masa simpan ${PURGE_DAYS} hari dan dihapus otomatis.`, `Code not found. Please check it again — or the report has passed its ${PURGE_DAYS}-day retention and was deleted automatically.`)}</div>`
    : ''}
</div></section>`;
  return page({ L, title: tr(L, 'Verifikasi laporan', 'Verify a report'), body, user, area: 'public', noindex: true });
}

export function notFoundPage(L: Lang, user: User | null): string {
  return page({ L, title: '404', body: html`<section class="section"><div class="wrap narrow center">${raw('<div class="big404">404</div>')}<h1>${tr(L, 'Halaman tidak ditemukan', 'Page not found')}</h1><p class="muted">${tr(L, 'Tautannya mungkin salah ketik atau sudah dipindahkan.', 'The link may be mistyped or moved.')}</p><a class="btn btn-primary" href="${L === 'en' ? '/en' : '/'}">${tr(L, 'Ke beranda', 'Go home')}</a></div></section>`, user, area: 'public', noindex: true });
}

