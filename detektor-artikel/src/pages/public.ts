/** Halaman publik dua bahasa (ID di akar, EN di /en). */
import { planCard, plansNote } from './plans.ts';
import { memberGuide, guideBody, type GuideValues } from './guide.ts';
import { PURGE_DAYS } from '../data/policy.ts';
import { html, raw, type Raw } from '../lib/html.ts';
import { tr, fmtNum, fmtDate, fmtScore, type Lang } from '../lib/i18n.ts';
import type { User } from '../data/users.ts';
import type { BillingSettings, EngineSettings } from '../data/settings.ts';
import { estimateTokens, rateCard, predictByMode, packagePrice, tokenPriceIdr } from '../engine/pricing.ts';
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
  guide: ['/panduan', '/en/guide'],
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

export function homePage(c: Ctx, billing: BillingSettings, eng: EngineSettings, measured: number | null, affPct: number | null, free: { pages: number; period: 'week' | 'month' } | null = null): string {
  const L = c.L;
  const faq: [string, string][] = [
    [tr(L, 'Apakah hasilnya 100% akurat?', 'Is it 100% accurate?'), tr(L, 'Tidak ada detektor AI yang jujur bisa menjanjikan 100%. AI Content Analyzer hanya memberi label bila probabilitas terkalibrasi melewati ambang yang dipilih agar salah tuduh ≤ 1%; sisanya diberi label “Tidak meyakinkan”. Angka akurasi terukur ditampilkan di halaman Akurasi.', 'No AI detector can honestly promise 100%. AI Content Analyzer only gives a label when the calibrated probability passes a threshold chosen to keep false accusations ≤ 1%; everything else is labelled “Inconclusive”. Measured accuracy is shown on the Accuracy page.')],
    [tr(L, 'Apakah teks saya disimpan?', 'Is my text stored?'), tr(L, 'Teks disimpan terenkripsi lalu dihapus otomatis (bawaan 30 hari, bisa 0 hari). Laporan dan angkanya tetap di riwayat kerja Anda. Teks tidak dipakai melatih AI.', 'Texts are stored encrypted and deleted automatically (default 30 days, can be 0). Reports and their numbers stay in your work history. Texts are not used to train AI.')],
    [tr(L, 'Bagaimana token dihitung?', 'How are tokens counted?'), tr(L, 'Setiap kali AI membaca naskah Anda, ia memakai “token masuk”; setiap kali AI menulis jawabannya, ia memakai “token keluar”. Sebelum mulai, sistem menyisihkan sejumlah token dari saldo; setelah selesai, yang dipotong hanya pemakaian nyata (tidak pernah lebih dari yang disisihkan) dan sisanya otomatis kembali. Pemeriksaan gagal tidak dipotong.', 'Whenever the AI reads your text it uses “input tokens”; whenever it writes its answer it uses “output tokens”. Before starting, the system sets some tokens aside from your balance; when done, only the real usage is deducted (never more than what was set aside) and the rest returns automatically. Failed checks are not deducted.')],
    [tr(L, 'Berapa halaman yang bisa diperiksa dengan token saya?', 'How many pages can my tokens check?'), tr(L, 'Portal menampilkan perkiraan rentang halaman untuk saldo Anda. Itu perkiraan, bukan janji: biaya nyata tergantung model AI yang terpakai (sebagian besar naskah selesai di Essential; naskah sulit naik ke Advanced/Expert), panjang naskah, dan rubrik.', 'The portal shows an estimated page range for your balance. It is an estimate, not a promise: the real cost depends on the AI models used (most texts finish at Essential; hard ones escalate to Advanced/Expert), text length and rubric.')],
    [tr(L, 'Bisa untuk bahasa Inggris?', 'Does it work for English?'), tr(L, 'Ya. Mesin mendeteksi Bahasa Indonesia dan English, dan situs ini tersedia dalam dua bahasa.', 'Yes. The engine detects Indonesian and English, and this site is available in both languages.')],
    [tr(L, 'Bagaimana kalau saya mengunggah naskah yang sama lagi?', 'What if I upload the same text again?'), tr(L, `Bagian yang pernah Anda periksa dengan mesin yang sama — seluruh berkas atau hanya sebagian halaman — tidak dikirim lagi ke AI. Hasil tersimpannya dipakai dan bagian itu dihitung ${billing.reusePct}% dari token (atau halaman Cek Gratis); bagian baru diperiksa seperti biasa. Untuk penilaian baru dari awal, pilih mesin lain atau pakai “Ajukan tinjauan”.`, `Parts you already checked with the same engine — a whole file or only some pages — are not sent to the AI again. Their stored result is reused and counts ${billing.reusePct}% of the tokens (or Free Check pages); new parts are checked as usual. For a fresh assessment, choose another engine or use “Request review”.`)],
    [tr(L, 'Bagaimana kalau hasilnya salah?', 'What if the result is wrong?'), tr(L, 'Tekan “Ajukan tinjauan” di laporan. Essential, Advanced, dan Expert menilai ulang seluruh teks tanpa melihat hasil lama (mode forensik penuh, ditagih token sesuai pemakaian). Kedua laporan tetap tersimpan.', 'Press “Request review” on the report. Essential, Advanced and Expert re-score the whole text blind to the old result (full forensic mode, charged in tokens by usage). Both reports are kept.')],
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
      <h1>${tr(L, 'Kejujuran sebuah tulisan, terbaca jernih', 'The honesty of a text, read with clarity')}<span class="grad"> — ${tr(L, 'deteksi AI dan penilaian artikel dalam satu laporan yang anggun.', 'AI detection and article grading in one elegant report.')}</span></h1>
      <p class="lead">${tr(L, 'Persen AI per kalimat, alasan yang bisa dibaca, dan nilai rubrik seperti form juri lomba. Diperiksa bertingkat oleh Essential, Advanced, sampai Expert — yang termurah dulu, yang terkuat hanya untuk bagian yang sulit.', 'AI percentage per sentence, readable reasons, and a rubric score like a competition judge’s form. Checked in tiers by Essential, Advanced and Expert — cheapest first, the strongest only for the hard parts.')}</p>
      <div class="cta-row"><a class="btn btn-primary btn-lg" href="${signup(L)}">${tr(L, 'Buat akun & mulai', 'Create an account & start')}</a><a class="btn btn-ghost btn-lg" href="${P(L, 'sample')}">${tr(L, 'Lihat contoh laporan', 'See a sample report')} →</a></div>
      <ul class="trust"><li>✓ ${tr(L, 'Bayar sesuai pemakaian', 'Pay for what you use')}</li><li>✓ ${tr(L, 'Terhenti? Pekerjaan tersimpan & bisa dilanjutkan', 'Stopped? Work is saved & can be resumed')}</li><li>✓ ${tr(L, 'Teks dienkripsi & terhapus otomatis', 'Texts encrypted & auto-deleted')}</li>${free ? html`<li>✓ ${tr(L, `Cek Gratis ${free.pages} halaman per ${free.period === 'week' ? 'minggu' : 'bulan'}`, `Free Check: ${free.pages} pages per ${free.period}`)}</li>` : ''}<li>✓ ${tr(L, 'PayPal & transfer bank', 'PayPal & bank transfer')}</li></ul>
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
      <div class="float-chip c1">Essential ✓</div><div class="float-chip c2">Advanced → ${tr(L, '2 kalimat', '2 sentences')}</div><div class="float-chip c3">${tr(L, 'Nilai', 'Score')} 86,25</div>
    </div>
  </div>
</section>

<section class="section showcase" data-showcase>
  <div class="wrap">
    <div class="section-head reveal center"><span class="eyebrow">${tr(L, 'Mengapa xscan.es', 'Why xscan.es')}</span><h2>${tr(L, 'Dibuat untuk mereka yang menjaga mutu tulisan', 'Made for those who guard the quality of writing')}</h2><p class="lead">${tr(L, 'Guru, juri, dosen, editor, panitia, dan perusahaan memercayakan keputusan penting pada bukti yang jernih. Inilah yang kami siapkan untuk Anda.', 'Teachers, judges, lecturers, editors, organisers and companies rely on clear evidence for decisions that matter. Here is what we have prepared for you.')}</p></div>
    <div class="grid g3">
      ${[
        ['✦', tr(L, 'Empat mesin, satu jalan cerdas', 'Four engines, one smart path'), tr(L, 'Essential, Advanced, Expert, hingga Elite. Smart Auto memulai dari yang paling hemat dan baru menanjak saat sebuah kalimat benar-benar meragukan — ketelitian kelas atas tanpa pemborosan.', 'Essential, Advanced, Expert and Elite. Smart Auto starts with the most economical and climbs only when a sentence is truly in doubt — top-tier care without waste.')],
        ['♛', tr(L, 'Elite untuk naskah yang menentukan', 'Elite for texts that decide'), tr(L, 'Telaah terdalam kami untuk skripsi, karya lomba utama, dan naskah redaksi yang tak boleh keliru. Terbuka penuh di paket Enterprise, Super Enterprise, dan VVIP.', 'Our deepest review for theses, winning entries and editorial texts that must not be wrong. Fully open on Enterprise, Super Enterprise and VVIP.')],
        ['🖋', tr(L, 'Laporan yang layak ditandatangani', 'A report worth signing'), tr(L, 'Persen per kalimat, alasan yang bisa dibaca, rubrik juri, kolom tanda tangan sesuai keperluan, dan QR verifikasi — siap dicetak, diunduh, dan dibuktikan keasliannya.', 'Per-sentence percentages, readable reasons, judging rubrics, signature boxes for your purpose and a verification QR — ready to print, download and prove authentic.')],
        ['♻', tr(L, `Unggah ulang, bayar ${billing.reusePct}%`, `Re-upload, pay ${billing.reusePct}%`), tr(L, 'Naskah yang pernah Anda periksa dengan mesin yang sama — seluruhnya atau sebagian halaman — tidak dinilai ulang dari nol. Hasilnya langsung tersedia dengan biaya jauh lebih ringan.', 'Text you already checked with the same engine — whole or some pages — is not assessed from scratch again. Results are ready at once, at a far lighter cost.')],
        ['🏆', tr(L, 'Sesi lomba & kelas sekaligus', 'Whole contests and classes at once'), tr(L, 'Unggah puluhan naskah, impor artikel dari URL atau sitemap, lalu terima rekap seperti form juri lengkap dengan kemiripan antarpeserta.', 'Upload dozens of entries, import articles from a URL or sitemap, and receive a recap like the judges’ form, with cross-entry similarity.')],
        ['🌍', tr(L, 'Siap untuk dunia', 'Ready for the world'), tr(L, 'Bahasa Indonesia & English, harga Rupiah atau dolar dengan kurs harian, PayPal tanpa unggah bukti, dan invoice perusahaan lengkap dengan NPWP/VAT.', 'Indonesian & English, prices in Rupiah or dollars at the daily rate, PayPal with no receipt upload, and company invoices with tax/VAT IDs.')],
        ['🔐', tr(L, 'Rahasia Anda tetap rahasia', 'Your secrets stay secret'), tr(L, 'Naskah disimpan terenkripsi dan dihapus otomatis; riwayat kerja Anda tetap tersimpan rapi selamanya. Kami tidak pernah menjual data.', 'Texts are stored encrypted and deleted automatically; your work history stays neatly kept for good. We never sell data.')],
        ['📱', tr(L, 'Di saku, kapan saja', 'In your pocket, any time'), tr(L, 'Pasang xscan.es di HP seperti aplikasi, ikuti panduan bersuara dua bahasa, dan periksa naskah di mana pun Anda berada.', 'Install xscan.es on your phone like an app, follow the two-language voice guide and check texts wherever you are.')],
        ['🎁', free ? tr(L, `Mulai tanpa biaya`, `Start for free`) : tr(L, 'Mulai dengan ringan', 'Start lightly'), free ? tr(L, `Cek Gratis ${free.pages} halaman setiap ${free.period === 'week' ? 'minggu' : 'bulan'} untuk mengenal cara kerjanya. Saat siap, pilih paket dari Starter hingga VVIP — deposit bebas nominal tanpa batas.`, `A Free Check of ${free.pages} pages every ${free.period} to get to know it. When you are ready, choose a package from Starter to VVIP — deposits of any amount, no upper limit.`) : tr(L, 'Pilih paket dari Starter hingga VVIP — deposit bebas nominal tanpa batas.', 'Choose a package from Starter to VVIP — deposits of any amount, no upper limit.')],
      ].map(([ic, t, d]) => html`<article class="feature showcase-card reveal"><span class="feature-ic">${ic}</span><h3>${t}</h3><p class="muted">${d}</p></article>`)}
    </div>
    <div class="cta-row center reveal"><a class="btn btn-primary btn-lg" href="${signup(L)}">${tr(L, 'Mulai bersama xscan.es', 'Start with xscan.es')}</a><a class="btn btn-ghost btn-lg" href="${P(L, 'price')}">${tr(L, 'Lihat paket & mesin', 'See packages & engines')} →</a></div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head reveal"><span class="eyebrow">${tr(L, 'Cara kerja', 'How it works')}</span><h2>${tr(L, 'Termurah dulu, terkuat hanya bila perlu', 'Cheapest first, strongest only when needed')}</h2></div>
    <ol class="pipeline reveal" aria-label="${tr(L, 'Tahap pemeriksaan', 'Check stages')}">
      <li><i>0</i><b>${tr(L, 'Pemindai gaya', 'Style scanner')}</b><span>${tr(L, 'Mengukur pola gaya tulisan, sisa salin-tempel, dan kemiripan — tanpa memakai AI', 'Measures writing-style patterns, paste traces and similarity — without using AI')}</span></li>
      <li><i>1</i><b>Essential</b><span>${tr(L, 'Memeriksa setiap kalimat & paragraf dengan teliti — semua naskah dimulai di sini', 'Carefully checks every sentence & paragraph — every text starts here')}</span></li>
      <li><i>2</i><b>Advanced</b><span>${tr(L, 'Hanya kalimat yang ragu, tanpa melihat jawaban Essential', 'Only doubtful sentences, blind to Essential’s answer')}</span></li>
      <li><i>3</i><b>Expert</b><span>${tr(L, 'Pemeriksa terakhir untuk yang masih diragukan', 'Final checker for what is still in doubt')}</span></li>
      <li><i>✓</i><b>${tr(L, 'Laporan', 'Report')}</b><span>${tr(L, 'Persen, alasan, rubrik, QR verifikasi, cetak', 'Percentages, reasons, rubric, verification QR, print')}</span></li>
    </ol>
    <p class="center muted reveal">${tr(L, 'Naskah yang jelas selesai di Essential (termurah); hanya bagian yang sulit yang naik — Anda membayar sesuai yang benar-benar dipakai.', 'Clear texts finish at Essential (cheapest); only the hard parts escalate — you pay for what is actually used.')} <a href="${P(L, 'how')}">${tr(L, 'Penjelasan lengkap', 'Full explanation')} →</a></p>
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
    <div class="grid g3 plans">
      ${billing.packages.map((p, k) => planCard(L, p, billing, eng, { usdFirst: L === 'en', featured: k === 2, actions: html`<a class="btn ${k === 2 ? 'btn-primary' : 'btn-ghost'} btn-sm" href="/app/token?paket=${p.key}">${tr(L, 'Pilih paket', 'Choose package')}</a>` }))}
    </div>
    ${plansNote(L, billing)}
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
  <div class="wrap center reveal"><h2>${tr(L, 'Biarkan setiap tulisan berbicara jujur', 'Let every text speak honestly')}</h2><p>${tr(L, 'Buat akun dalam satu menit, coba Cek Gratis, lalu pilih mesin yang paling sesuai — dari Essential hingga Elite. Laporan Anda tersimpan rapi dan siap dibuktikan kapan pun.', 'Create an account in a minute, try the Free Check, then choose the engine that suits you best — from Essential to Elite. Your reports stay neatly kept and ready to prove at any time.')}</p><a class="btn btn-light btn-lg" href="${signup(L)}">${tr(L, 'Buat akun', 'Create an account')}</a></div>
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
    ['4', tr(L, 'Pemeriksaan AI bertingkat', 'Tiered AI checks'), tr(L, 'Essential memeriksa setiap kalimat. Kalimat yang masih ragu diperiksa ulang oleh Advanced, dan yang tetap diragukan oleh Expert. Pemeriksa yang lebih tinggi tidak melihat jawaban sebelumnya, jadi tidak ikut-ikutan.', 'Essential checks every sentence. Doubtful sentences are re-checked by Advanced, and those still in doubt by Expert. Higher checkers never see the earlier answers, so they are not influenced.')],
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
  return frame(c, 'how', tr(L, 'Cara kerja', 'How it works'), tr(L, 'Lima cara memeriksa dan tiga tingkat AI (Essential → Advanced → Expert) untuk mendeteksi tulisan AI berbahasa Indonesia dan Inggris.', 'Five ways of checking and three AI tiers (Essential → Advanced → Expert) to detect AI writing in Indonesian and English.'), body);
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

export function pricingPage(c: Ctx, b: BillingSettings, eng: EngineSettings, measured: number | null, avail?: { haiku: boolean; sonnet: boolean; opus: boolean; fable: boolean }): string {
  const L = c.L;
  const engines: [string, string, boolean][] = [
    ['Essential', tr(L, 'paling hemat, cepat', 'the most economical, fast'), true],
    ['Advanced', tr(L, 'lebih teliti', 'more careful'), avail?.sonnet ?? true],
    ['Expert', tr(L, 'terkuat di kelasnya', 'the strongest of its class'), avail?.opus ?? true],
    ['Elite', tr(L, 'premium, telaah terdalam', 'premium, the deepest review'), avail?.fable ?? false],
  ];
  const ex = [300, 1500, 3000].map((w) => ({ w, e: estimateTokens(w, 'auto', true, b, eng) }));
  const body = html`<section class="section"><div class="wrap">
  <div class="section-head reveal center"><span class="eyebrow">${tr(L, 'Harga', 'Pricing')}</span><h1>${tr(L, 'Token berbayar — bayar sesuai pemakaian', 'Paid tokens — pay for what you use')}</h1><p class="lead">${tr(L, `1 token = Rp ${fmtNum(L, Math.ceil(tokenPriceIdr(b, eng)))}. Setiap pemeriksaan memotong token sesuai pemakaian AI yang benar-benar terjadi. Bayar dengan transfer Rupiah, Dolar AS dari luar negeri, atau dari saldo deposit.`, `1 token = Rp ${fmtNum(L, Math.ceil(tokenPriceIdr(b, eng)))}. Each check deducts tokens according to the AI usage that actually happened. Pay by Rupiah transfer, US dollars from abroad, or from a deposit balance.`)}</p></div>
  <div class="grid g3 plans">${b.packages.map((p, k) => planCard(L, p, b, eng, { usdFirst: L === 'en', featured: k === 2, ribbon: k === 2 ? tr(L, 'Untuk juri & guru', 'For judges & teachers') : undefined, avail: { haiku: true, sonnet: avail?.sonnet ?? true, opus: avail?.opus ?? true, fable: avail?.fable ?? false }, actions: html`<a class="btn ${k === 2 ? 'btn-primary' : 'btn-ghost'}" href="/app/token?paket=${p.key}">${tr(L, 'Pilih', 'Choose')}</a>` }))}</div>
  ${plansNote(L, b)}
  <section class="card reveal narrow-block" id="engine-status"><h3>${tr(L, 'Mesin AI yang tersedia', 'Available AI engines')}</h3>
    <div class="tbl-wrap"><table class="tbl"><tbody>${engines.map(([n, d, on]) => html`<tr data-engine="${n}"><td><b>${n}</b><br><small class="muted">${d}</small></td><td class="n">${on ? html`<span class="pill p-ok">${tr(L, 'Aktif', 'Active')}</span>` : html`<span class="pill p-soon">${n.includes('Elite') ? tr(L, 'Segera hadir', 'Coming soon') : tr(L, 'Sedang nonaktif', 'Switched off')}</span>`}</td></tr>`)}</tbody></table></div>
  </section>
  <section class="card reveal narrow-block"><h3>${tr(L, 'Prediksi halaman per paket & mesin AI', 'Page estimate per package & AI engine')}</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Paket', 'Package')}</th>${(['haiku', 'sonnet', 'opus', 'fable', 'auto'] as const).map((m) => html`<th class="n">${L === 'en' ? MODE_INFO[m]!.en : MODE_INFO[m]!.id}</th>`)}</tr></thead>
    <tbody>${b.packages.map((p) => html`<tr><td><b>${bi(L, p.name)}</b><br><small class="muted">${fmtNum(L, packagePrice(p, b, eng).tokens)} token</small></td>${predictByMode(packagePrice(p, b, eng).tokens, b, eng).map((x) => html`<td class="n">${fmtNum(L, x.pages.low)}–${fmtNum(L, x.pages.high)} ${tr(L, 'hal.', 'pp.')}</td>`)}</tr>`)}</tbody></table></div>
    <h3 class="mt">${tr(L, 'Perkiraan harga per halaman', 'Estimated price per page')}</h3>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Mesin AI', 'AI engine')}</th><th class="n">${tr(L, 'Token / halaman', 'Tokens / page')}</th><th class="n">${tr(L, 'Rupiah / halaman', 'Rupiah / page')}</th></tr></thead>
    <tbody>${predictByMode(0, b, eng).map((x) => html`<tr><td><b>${L === 'en' ? MODE_INFO[x.mode]!.en : MODE_INFO[x.mode]!.id}</b></td><td class="n">${fmtScore(L, x.perPage.low)}–${fmtScore(L, x.perPage.high)}</td><td class="n">Rp ${fmtNum(L, x.idrPerPage.low)}–${fmtNum(L, x.idrPerPage.high)}</td></tr>`)}</tbody></table></div>
    <p class="muted small">${tr(L, `Perkiraan, bukan janji: ±${b.wordsPerPage} kata per halaman dengan rubrik; pemakaian nyata tergantung model AI yang terpakai dan tingkat kesulitan naskah. Smart Auto biasanya paling hemat untuk hasil yang teliti.`, `An estimate, not a promise: ±${b.wordsPerPage} words per page with a rubric; real usage depends on the AI models used and the text’s difficulty. Smart Auto is usually the most economical for careful results.`)}</p>
  </section>
  <section class="card reveal narrow-block"><h3>${tr(L, 'Bagaimana token dihitung — masukan & keluaran', 'How tokens are counted — input & output')}</h3>
    <div class="grid g3">
      <div><h4>1 · ${tr(L, 'Token masuk', 'Input tokens')}</h4><p class="muted">${tr(L, 'Teks yang dibaca model: naskah Anda, instruksi penilaian, dan rubrik. Naskah ±1.000 kata Bahasa Indonesia ≈ 1.700 token.', 'Text the model reads: your document, the grading instructions and the rubric. A ±1,000-word Indonesian text ≈ 1,700 tokens.')}</p></div>
      <div><h4>2 · ${tr(L, 'Token keluar', 'Output tokens')}</h4><p class="muted">${tr(L, 'Jawaban model (nilai per kalimat, alasan, rubrik) termasuk token “berpikir”. Token keluar lebih mahal daripada token masuk.', 'The model’s answer (per-sentence scores, reasons, rubric) including “thinking” tokens. Output tokens cost more than input tokens.')}</p></div>
      <div><h4>3 · ${tr(L, 'Token platform', 'Platform tokens')}</h4><p class="muted">${tr(L, 'Σ (token masuk × tarif masuk + token keluar × tarif keluar) ÷ 1.000, dibulatkan ke atas. Rincian tiap panggilan ada di setiap laporan.', 'Σ (input tokens × input rate + output tokens × output rate) ÷ 1,000, rounded up. Every report lists each call.')}</p></div>
    </div>
    ${rateTable(L, rateCard(b, eng))}
  </section>
  <p class="muted small center reveal">* ${tr(L, `Perkiraan, bukan janji (±${b.wordsPerPage} kata per halaman). Pemakaian nyata tergantung model AI yang terpakai — Essential saja, atau naik ke Advanced/Expert untuk bagian yang sulit — serta panjang naskah dan rubrik.`, `An estimate, not a promise (±${b.wordsPerPage} words per page). Real usage depends on the AI models used — Essential only, or escalation to Advanced/Expert for hard parts — plus text length and rubric.`)}</p>
  <div class="grid g2 narrow-block">
    <div class="card reveal"><h3>${tr(L, 'Contoh perkiraan (mode otomatis + rubrik)', 'Example estimates (automatic mode + rubric)')}</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Naskah', 'Text')}</th><th class="n">${tr(L, 'Biasanya', 'Usually')}</th><th class="n">${tr(L, 'Dipesan dulu', 'Reserved first')}</th></tr></thead><tbody>${ex.map((x) => html`<tr><td>${fmtNum(L, x.w)} ${tr(L, 'kata', 'words')}</td><td class="n">${x.e.min}–${x.e.typical} token</td><td class="n">${x.e.reserve} token</td></tr>`)}</tbody></table></div></div>
    <div class="card reveal"><h3>${tr(L, 'Aturan token', 'Token rules')}</h3><ul class="clean">
      <li>✓ ${tr(L, 'Bayar dulu: token dibeli di muka, lalu otomatis berkurang setiap kali dipakai.', 'Pay first: tokens are bought up front, then decrease automatically as they are used.')}</li>
      <li>✓ ${tr(L, 'Sejumlah token disisihkan sebelum AI bekerja; sisanya kembali otomatis.', 'Some tokens are set aside before the AI works; the rest returns automatically.')}</li>
      <li>✓ ${tr(L, 'Yang dipotong hanya pemakaian nyata, tidak pernah melebihi yang disisihkan.', 'Only real usage is deducted, never more than what was set aside.')}</li>
      <li>✓ ${tr(L, 'Hanya kerja AI yang benar-benar selesai yang ditagih. Pemeriksaan yang terhenti (gangguan atau token habis) tersimpan dan bisa dilanjutkan tanpa mengulang dari awal.', 'Only AI work that actually finished is charged. A check that stops (an outage or tokens running out) is saved and can be resumed without starting over.')}</li>
      <li data-reuse-rule>♻ ${tr(L, `Naskah yang pernah Anda periksa dengan mesin yang sama — seluruhnya atau sebagian halaman — dipakai lagi hasilnya tanpa memanggil AI, dan bagian itu dihitung ${b.reusePct}% dari token. Mesin lain = penilaian baru dengan biaya normal.`, `Text you already checked with the same engine — whole or some pages — reuses its stored result without calling the AI, and that part counts ${b.reusePct}% of the tokens. Another engine = a fresh assessment at the normal price.`)}</li>
      <li>✓ ${tr(L, 'Bayar dengan transfer Rupiah, Dolar AS (dengan panduan transfer dari luar negeri), atau dari saldo deposit Rupiah. Unggah bukti transfer; token masuk setelah admin memverifikasi dana. Invoice bisa dicetak.', 'Pay by Rupiah transfer, US dollars (with a guide for transfers from abroad), or from a Rupiah deposit balance. Upload the transfer proof; tokens arrive once the admin verifies the funds. Invoices are printable.')}</li>
      <li>ⓘ ${tr(L, 'Saldo token dan saldo deposit tidak bisa diuangkan; sisa deposit selalu bisa dipakai membeli atau ditukar menjadi token.', 'Token and deposit balances cannot be cashed out; the remaining deposit can always be used to buy or convert into tokens.')}</li>
      <li>🗓 ${tr(L, `Naskah dan berkas unggahan dihapus otomatis ${PURGE_DAYS} hari setelah dibuat; riwayat kerja (tanggal, judul, hasil, nilai, token, kode verifikasi) tidak pernah dihapus.`, `Texts and uploaded files are deleted automatically ${PURGE_DAYS} days after creation; the work history (date, title, results, score, tokens, verification code) is never deleted.`)}</li></ul></div>
  </div>
</div></section>`;
  return frame(c, 'price', tr(L, 'Harga token', 'Token pricing'), tr(L, 'Token berbayar AI Content Analyzer: bayar sesuai pemakaian, sisa token kembali, pemeriksaan yang terhenti bisa dilanjutkan.', 'AI Content Analyzer paid tokens: pay for what you use, unused tokens return, stopped checks can be resumed.'), body);
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
        tr(L, `Pembersihan otomatis: teks naskah, rincian per kalimat yang memuat teks itu, dan berkas unggahan (termasuk bukti transfer) dihapus ${PURGE_DAYS} hari setelah dibuat. Riwayat kerja Anda — tanggal, judul, angka hasil, nilai, token, dan kode verifikasi — tidak pernah dihapus dan diberi penanda arsip. Invoice dan catatan saldo tetap disimpan sebagai catatan transaksi.`, `Automatic clean-up: the text, the per-sentence detail that contains it, and uploaded files (including transfer proofs) are deleted ${PURGE_DAYS} days after creation. Your work history — date, title, result figures, score, tokens and verification code — is never deleted and is marked as archived. Invoices and balance records are kept as transaction records.`),
        tr(L, 'Berkas .docx diolah di peramban Anda; hanya teksnya yang dikirim.', '.docx files are processed in your browser; only their text is sent.'),
        tr(L, 'Untuk keamanan dan program afiliasi kami menyimpan hash (bukan alamat asli) IP terakhir Anda, agar referal-diri bisa dicegah.', 'For security and the affiliate programme we store a hash (not the real address) of your last IP, so self-referrals can be prevented.'),
        tr(L, 'Teks dikirim ke penyedia model AI pihak ketiga (subprosesor, termasuk di Amerika Serikat, dengan klausul kontrak standar) hanya untuk dianalisis. Menurut ketentuan komersial penyedia, data yang dikirim lewat API tidak dipakai untuk melatih model. Kami tidak menjual data.', 'Texts are sent to third-party AI model providers (sub-processors, including in the United States, under standard contractual clauses) only to be analysed. Under the providers’ commercial terms, data sent through the API is not used to train models. We never sell data.'),
        tr(L, 'Pengendali data: xscan.es (AI Content Analyzer), dikelola dari Indonesia; kontak hello@axto.io. Dasar pemrosesan: menjalankan layanan yang Anda pesan (pemeriksaan, laporan, pembayaran), kepentingan sah (keamanan, mencegah penipuan), kewajiban hukum (invoice dan catatan keuangan), dan persetujuan Anda (notifikasi).', 'Data controller: xscan.es (AI Content Analyzer), run from Indonesia; contact hello@axto.io. Legal bases: performing the service you order (checks, reports, payments), legitimate interest (security, fraud prevention), legal obligation (invoices and financial records), and your consent (notifications).'),
        tr(L, 'Subprosesor: infrastruktur awan (penyimpanan & server terenkripsi), penyedia model AI, dan PayPal bila Anda membayar dengan PayPal (kami hanya menerima ID transaksi, e-mail pembayar, dan nominal — data kartu tidak pernah sampai ke kami). Pengiriman data ke luar negeri memakai klausul kontrak standar.', 'Sub-processors: cloud infrastructure (encrypted storage & servers), AI model providers, and PayPal when you pay with PayPal (we only receive the transaction ID, payer e-mail and amount — card data never reaches us). Transfers abroad use standard contractual clauses.'),
        tr(L, 'Pengguna di Uni Eropa/Inggris (GDPR) berhak mengakses, membetulkan, menghapus, membatasi, memindahkan, dan menolak pemrosesan, serta mengadu ke otoritas pengawas setempat. Perusahaan bisa meminta perjanjian pemrosesan data (DPA) lewat hello@axto.io.', 'Users in the EU/UK (GDPR) may access, rectify, erase, restrict, port and object to processing, and complain to their local supervisory authority. Companies can request a data processing agreement (DPA) via hello@axto.io.'),
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
        tr(L, 'Pembayaran cepat lewat PayPal (USD): token masuk otomatis setelah PayPal mengonfirmasi, tanpa unggah bukti. Harga USD = harga Rupiah ÷ kurs harian dan dibekukan di invoice. Bila pembayaran PayPal dibatalkan, dikembalikan, atau disengketakan, token dari pesanan itu ditarik kembali sebatas saldo.', 'Fast payment with PayPal (USD): tokens are added automatically once PayPal confirms, no proof upload. USD prices = Rupiah price ÷ the daily exchange rate, frozen on the invoice. If a PayPal payment is cancelled, refunded or disputed, the tokens from that order are withdrawn up to the available balance.'),
        tr(L, 'Invoice memuat profil penagihan Anda (perusahaan, NPWP/VAT/Tax ID, alamat, nomor PO). Pajak atau bea yang berlaku di negara pembeli menjadi tanggungan pembeli.', 'Invoices carry your billing profile (company, tax/VAT ID, address, PO number). Taxes or duties applicable in the buyer’s country are the buyer’s responsibility.'),
        tr(L, 'Akses mesin mengikuti paket yang pernah Anda beli: Starter (Essential & Smart Auto), Reguler (+ Advanced), Pro dan Lembaga (+ Expert & Forensic Panel), Enterprise dan Super Enterprise (semua mesin, termasuk Elite).', 'Engine access follows the packages you have bought: Starter (Essential & Smart Auto), Regular (+ Advanced), Pro and Institution (+ Expert & Forensic Panel), Enterprise and Super Enterprise (every engine, including Elite).'),
        tr(L, 'Saldo token dan saldo deposit Rupiah tidak bisa diuangkan, dikembalikan ke rekening, atau dipindahkan ke akun lain (kecuali diwajibkan hukum). Sisa deposit selalu bisa dipakai membeli paket token atau ditukar menjadi token dengan harga token yang berlaku saat itu. Komisi afiliasi diatur terpisah dan bisa dicairkan sesuai ketentuan program afiliasi.', 'Token and Rupiah deposit balances cannot be cashed out, refunded to a bank account or moved to another account (unless required by law). The remaining deposit can always be used to buy token packages or be converted into tokens at the token price in effect at that time. Affiliate commission is governed separately and can be paid out under the affiliate programme rules.'),
        tr(L, `Naskah, rincian per kalimatnya, dan berkas yang diunggah member — termasuk bukti transfer — dihapus otomatis ${PURGE_DAYS} hari setelah dibuat. Riwayat kerja (laporan dengan tanggal, judul, angka hasil, nilai, token, kode verifikasi; sesi lomba/kelas dan rekapnya) tidak pernah dihapus. Unduh atau cetak laporan bila ingin menyimpan rinciannya. Catatan transaksi (invoice, saldo, buku besar) tetap disimpan.`, `Texts, their per-sentence detail and files uploaded by members — including transfer proofs — are deleted automatically ${PURGE_DAYS} days after creation. The work history (reports with date, title, result figures, score, tokens, verification code; contest/class sessions and their recaps) is never deleted. Download or print a report to keep its detail. Transaction records (invoices, balances, ledgers) are kept.`),
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
        tr(L, 'Bila ragu, ajukan tinjauan: Essential, Advanced, dan Expert menilai ulang tanpa melihat hasil lama.', 'When in doubt, request a review: Essential, Advanced and Expert re-score blind to the old result.'),
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
      : html`<div class="flash err reveal">⚠ ${tr(L, 'Kode tidak ditemukan. Periksa kembali penulisannya (huruf besar/kecil dan angka), atau tanyakan kodenya kepada pemilik laporan.', 'Code not found. Please check how it is written (letters and digits), or ask the report owner for the code.')}</div>`
    : ''}
</div></section>`;
  return page({ L, title: tr(L, 'Verifikasi laporan', 'Verify a report'), body, user, area: 'public', noindex: true });
}

export function notFoundPage(L: Lang, user: User | null): string {
  return page({ L, title: '404', body: html`<section class="section"><div class="wrap narrow center">${raw('<div class="big404">404</div>')}<h1>${tr(L, 'Halaman tidak ditemukan', 'Page not found')}</h1><p class="muted">${tr(L, 'Tautannya mungkin salah ketik atau sudah dipindahkan.', 'The link may be mistyped or moved.')}</p><a class="btn btn-primary" href="${L === 'en' ? '/en' : '/'}">${tr(L, 'Ke beranda', 'Go home')}</a></div></section>`, user, area: 'public', noindex: true });
}



/** Panduan member A–Z dengan suara (pemilik, 8 Nov 2026). Angka dibaca dari Admin saat halaman dibuka. */
export function guidePage(c: Ctx, v: GuideValues): string {
  const L = c.L;
  const secs = memberGuide(v);
  const title = tr(L, 'Panduan lengkap pemakaian A–Z', 'The complete A–Z user guide');
  const desc = tr(L, 'Langkah demi langkah dengan bahasa sederhana dan suara: daftar, Cek Gratis, beli token, isi dan tukar deposit, unggah berkas, membaca laporan, sesi lomba, dan lainnya.', 'Step by step, in plain words and with voice: signing up, the Free Check, buying tokens, topping up and converting a deposit, uploading files, reading reports, contest sessions and more.');
  const intro = tr(L, 'Baca atau dengarkan. Tekan Dengarkan semua untuk dibacakan dari awal sampai akhir, atau tekan Dengarkan di bagian yang Anda perlukan.', 'Read it or listen to it. Press Listen to all to hear it from start to finish, or press Listen on the part you need.');
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'HowTo', name: title, description: desc, inLanguage: L,
    step: secs.map((s, n) => ({ '@type': 'HowToSection', position: n + 1, name: s.title[L === 'en' ? 1 : 0], itemListElement: s.steps.map((st, k) => ({ '@type': 'HowToStep', position: k + 1, text: st[L === 'en' ? 1 : 0] })) })),
  };
  return frame(c, 'guide', title, desc, html`<section class="section"><div class="wrap narrow"><div class="section-head reveal"><span class="eyebrow">${tr(L, 'Panduan', 'Guide')}</span><h1>${title}</h1></div>${guideBody(L, secs, intro)}</div></section>`, jsonld);
}
