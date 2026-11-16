/**
 * Halaman informasi: harga & promo, tentang, kontak, privasi, syarat, sumber & lisensi — tiga bahasa (terjemahan manual).
 * Teks dapat ditimpa admin lewat site.pages (`<slug>` untuk Indonesia, `<slug>.en`, `<slug>.ja`).
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { sources } from '../library/index.ts';
import { renderMarkdown } from '../lib/markdown.ts';
import { COURSE_META, COURSES, money, unitPrices, type Pricing, type SiteContent, type Tier } from '../data/model.ts';
import { t, type Lang } from '../lib/i18n.ts';
import { icon, breadcrumbs } from './layout.ts';
import { CUR_FOR } from './public.ts';

const TIER_NAME: Record<Tier, Record<Lang, string>> = {
  umum: { id: 'Umum', en: 'Standard', ja: '一般' },
  pelajar: { id: 'Promo pelajar', en: 'Student offer', ja: '学生割引' },
  juara: { id: 'Promo juara kelas', en: 'Class-champion offer', ja: '学年上位者割引' },
};
const TIER_NOTE: Record<Tier, Record<Lang, string>> = {
  umum: { id: 'Untuk semua orang.', en: 'For everyone.', ja: 'どなたでも。' },
  pelajar: { id: 'Pelajar sampai kelas 12 / 3 SMK sederajat, dengan surat keterangan pelajar terbaru.', en: 'Students up to grade 12 / final year of secondary school, with a current student certificate.', ja: '高校3年生までの学生（最新の在学証明書が必要）。' },
  juara: { id: 'Juara 1, 2 atau 3 di kelas, dengan bukti juara kelas tahun berjalan saat mendaftar.', en: 'Ranked 1st, 2nd or 3rd in class, with this year\'s proof when registering.', ja: 'クラス1〜3位（申込時に今年度の証明が必要）。' },
};
const TIER_REQ: Record<Tier, Record<Lang, string>> = {
  umum: { id: '—', en: '—', ja: '—' },
  pelajar: { id: 'Surat keterangan pelajar terbaru', en: 'Current student certificate', ja: '最新の在学証明書' },
  juara: { id: 'Bukti juara kelas tahun ini', en: 'This year\'s class-ranking proof', ja: '今年度の順位の証明' },
};
/** Label kategori: teks admin untuk Indonesia, terjemahan tetap untuk Inggris/Jepang. */
export const tierLabel = (p: Pricing, tier: Tier, L: Lang) => (L === 'id' ? p.tiers[tier]?.label ?? tier : TIER_NAME[tier]?.[L] ?? tier);
export const tierNote = (p: Pricing, tier: Tier, L: Lang) => (L === 'id' ? p.tiers[tier]?.note ?? '' : TIER_NOTE[tier]?.[L] ?? '');
export const tierReq = (p: Pricing, tier: Tier, L: Lang) => (L === 'id' ? p.tiers[tier]?.requires ?? null : p.tiers[tier]?.requires ? TIER_REQ[tier][L] : null);

export function pricingPage(o: { site: SiteContent; pricing: Pricing; lang: Lang }): Raw {
  const L = o.lang, p = o.pricing, cur = CUR_FOR[L], tiers = (Object.keys(p.tiers) as Tier[]).filter((x) => p.tiers[x].enabled);
  const other = (['IDR', 'USD', 'JPY'] as const).filter((c) => c !== cur);
  return html`<section class="section"><div class="wrap">
  ${breadcrumbs([[t(L, 'pricing.eyebrow'), '/harga']], L)}
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${t(L, 'pricing.eyebrow')}</p><h1 style="font-size:var(--fs-6)">${t(L, 'pricing.title')}</h1><p class="lead">${t(L, 'pricing.lead')}</p></div>
  <div class="table-wrap reveal" style="margin-top:28px"><table class="table compare"><tr><th>${t(L, 'pricing.th.cat')}</th><th>${t(L, 'pricing.th.1')}</th><th>${t(L, 'pricing.th.2')}</th><th>${t(L, 'pricing.th.3')}</th><th>${t(L, 'pricing.th.req')}</th></tr>
    ${tiers.map((x) => { const u = unitPrices(p.tiers[x], cur); return html`<tr><td><b>${tierLabel(p, x, L)}</b><br><small class="muted">${tierNote(p, x, L)}</small></td><td class="num">${money(u.one, cur)}<br><small class="muted">${other.map((c) => money(unitPrices(p.tiers[x], c).one, c)).join(' · ')}</small></td><td class="num">${money(u.one * 2, cur)}</td><td class="num">${money(u.three, cur)}<br><small class="muted">${other.map((c) => money(unitPrices(p.tiers[x], c).three, c)).join(' · ')}</small></td><td>${tierReq(p, x, L) ?? '—'}</td></tr>`; })}
  </table></div>
  <div class="grid g3" style="margin-top:28px">
    <div class="card feature reveal"><span class="icon-tile">${icon('kartu')}</span><h3>${t(L, 'pricing.included')}</h3><ul class="goals"><li>${t(L, 'pricing.inc.1')}</li><li>${t(L, 'pricing.inc.2')}</li><li>${t(L, 'pricing.inc.3')}</li><li>${t(L, 'pricing.inc.4', { d: p.days })}</li></ul></div>
    <div class="card feature reveal" data-delay="1"><span class="icon-tile">${icon('sekolah')}</span><h3>${t(L, 'price.student')}</h3><p>${t(L, 'pricing.student.text')}</p></div>
    <div class="card feature reveal" data-delay="2"><span class="icon-tile">${icon('piala')}</span><h3>${t(L, 'price.champ')}</h3><p>${t(L, 'pricing.champ.text')}</p></div>
  </div>
  <div class="card reveal" style="margin-top:28px"><h2 style="font-size:var(--fs-4);margin-top:0">${t(L, 'pricing.how')}</h2><ol class="recap"><li>${t(L, 'pricing.how.1')}</li><li>${t(L, 'pricing.how.2')}</li><li>${t(L, 'pricing.how.3')}</li><li>${t(L, 'pricing.how.4')}</li></ol>
    <div class="row" style="margin-top:16px"><a class="btn btn-gold btn-lg" href="/daftar?paket=1">${t(L, 'pricing.start')}</a><a class="btn btn-ghost btn-lg" href="/coba">${t(L, 'pricing.tryFirst')}</a></div></div>
  <div class="grid g3" style="margin-top:28px">${COURSES.map((k) => html`<a class="card lift" href="/${COURSE_META[k].slug}" style="text-decoration:none;color:inherit"><h3 style="margin:0">${COURSE_META[k].names[L]}</h3><p class="muted small" style="margin:6px 0 0">${COURSE_META[k].levels.map((l) => l.name).join(' · ')}${k === 'en' ? ' · TOEFL · IELTS' : ''}</p></a>`)}</div>
</div></section>`;
}

type PageText = { title: string; desc: string; body: string };
/** Teks bawaan halaman wajib per bahasa; e-mail kontak diambil dari pengaturan situs. */
function defaults(site: SiteContent): Record<string, Record<Lang, PageText>> {
  const mail = site.contact.email, n = site.name;
  return {
    tentang: {
      id: { title: `Tentang ${n}`, desc: `${n} — Learning Universal for Achievement, Journey & Advancement: platform belajar bahasa Jerman, Inggris dan Jepang untuk penutur Indonesia.`, body: `**${n}** — *Learning Universal for Achievement, Journey & Advancement* — adalah platform belajar bahasa Jerman, Inggris dan Jepang yang dirancang untuk penutur Indonesia.\n\n## Cara kami mengajar\n\nSetiap jalur tersusun runtut: jenjang → modul → pelajaran → sepuluh langkah. Penjelasan ditulis dalam bahasa Indonesia, setiap kalimat dapat didengar melalui mesin suara perangkat dengan logat Jerman, Inggris atau Jepang, dan pelajaran berikutnya terbuka setelah kuis pelajaran sebelumnya mencapai 80 %. Modul dan jenjang diterbitkan bertahap.\n\n## Latihan yang terukur\n\nBank latihan soal mengikuti format ujian resmi — Goethe-Zertifikat, Cambridge, TOEFL ITP, IELTS dan JLPT. Setiap paket dilengkapi kunci jawaban, pembahasan dan prediksi nilai, sehingga peserta tahu sejauh mana kesiapannya.\n\n## Untuk siapa\n\nPelajar dan mahasiswa, calon peserta Ausbildung dan magang ke Jepang, pencari beasiswa, tenaga kesehatan dan profesional — siapa pun yang ingin menguasai bahasa asing dengan cara yang rapi.` },
      en: { title: `About ${n}`, desc: `${n} — Learning Universal for Achievement, Journey & Advancement: a platform for learning German, English and Japanese.`, body: `**${n}** — *Learning Universal for Achievement, Journey & Advancement* — is a platform for learning German, English and Japanese, designed first for Indonesian speakers.\n\n## How we teach\n\nEvery path is ordered: level → module → lesson → ten steps. Every sentence can be heard through your device's speech engine with a German, English or Japanese accent, and the next lesson opens once the previous quiz reaches 80 %. Modules and levels are published in stages.\n\n## Language of explanations\n\nLesson explanations, translations and answer discussions are currently written in Indonesian. The interface, portal, pricing and payments are available in English and Japanese; English and Japanese explanations are being prepared.\n\n## Measurable practice\n\nThe practice bank follows the official exam formats — Goethe-Zertifikat, Cambridge, TOEFL ITP, IELTS and JLPT. Every set has an answer key, explanations and a predicted score.` },
      ja: { title: `${n}について`, desc: `${n} — Learning Universal for Achievement, Journey & Advancement：ドイツ語・英語・日本語の学習プラットフォーム。`, body: `**${n}** — *Learning Universal for Achievement, Journey & Advancement* — は、主にインドネシア語話者向けに設計されたドイツ語・英語・日本語の学習プラットフォームです。\n\n## 教え方\n\n各コースは「レベル → モジュール → レッスン → 10ステップ」の順に構成されています。すべての文は端末の音声エンジンがドイツ語・英語・日本語のアクセントで読み上げ、前のレッスンのクイズで80％以上を取ると次のレッスンが開きます。モジュールとレベルは段階的に公開されます。\n\n## 解説の言語\n\nレッスンの解説・訳・答えの説明は現在インドネシア語で書かれています。表示、ポータル、料金、支払いは英語と日本語に対応しており、英語・日本語の解説は準備中です。\n\n## 測れる練習\n\n模擬問題はGoethe-Zertifikat、Cambridge、TOEFL ITP、IELTS、JLPTの公式形式に沿っています。各セットに解答・解説・予想スコアが付きます。` },
    },
    kontak: {
      id: { title: 'Kontak', desc: `Hubungi tim ${n} untuk pertanyaan seputar kursus, pembayaran dan kerja sama.`, body: `Kami senang membantu.\n\n- **E-mail:** [${mail}](mailto:${mail})\n- **Jam layanan:** Senin–Sabtu, 08.00–20.00 WIB\n\nUntuk pertanyaan pembayaran, sertakan nomor tagihan (contoh: LJ-2026-000123) agar kami dapat membantu lebih cepat.` },
      en: { title: 'Contact', desc: `Contact the ${n} team about courses, payments and partnerships.`, body: `We are happy to help.\n\n- **E-mail:** [${mail}](mailto:${mail})\n- **Service hours:** Monday–Saturday, 08:00–20:00 Western Indonesia Time (UTC+7)\n\nFor payment questions, include your invoice number (for example LJ-2026-000123) so we can help faster.` },
      ja: { title: 'お問い合わせ', desc: `講座、支払い、提携に関する${n}へのお問い合わせ。`, body: `お気軽にご連絡ください。\n\n- **メール:** [${mail}](mailto:${mail})\n- **対応時間:** 月〜土 8:00〜20:00（インドネシア西部時間・UTC+7）\n\nお支払いに関するお問い合わせには、請求番号（例: LJ-2026-000123）を記載してください。` },
    },
    privasi: {
      id: { title: 'Kebijakan privasi', desc: `Bagaimana ${n} mengumpulkan, memakai dan melindungi data peserta.`, body: `Kebijakan ini menjelaskan data yang kami kumpulkan saat Anda memakai situs ini.\n\n## Data yang kami simpan\n\n- **Akun:** nama, e-mail dan kata sandi dalam bentuk *hash* (kata sandi asli tidak pernah disimpan), serta pilihan bahasa antarmuka.\n- **Belajar:** kemajuan pelajaran, hasil kuis dan riwayat latihan soal.\n- **Pembayaran:** tagihan, bukti transfer dan dokumen promo yang Anda unggah — disimpan privat dan hanya dapat dibuka tim verifikasi.\n\n## Pembayaran online\n\nPembayaran otomatis diproses oleh penyedia pembayaran yang Anda pilih (misalnya PayPal, Stripe, Xendit atau Midtrans). Data kartu dan rekening Anda dimasukkan langsung di halaman penyedia tersebut; kami hanya menerima status pembayaran, nominal dan nomor referensi.\n\n## Bahasa dan lokasi\n\nUntuk memilih bahasa awal situs, kami membaca kode negara dari jaringan (misalnya Indonesia → bahasa Indonesia, Jepang → bahasa Jepang). Kode itu tidak disimpan; pilihan bahasa Anda disimpan dalam cookie dan akun.\n\n## Iklan\n\nHalaman publik dapat menampilkan iklan Google AdSense. Google dapat memakai cookie untuk menayangkan iklan berdasarkan kunjungan Anda; Anda dapat mengatur preferensi di [Setelan Iklan Google](https://adssettings.google.com). Portal member, halaman pelajaran berbayar, latihan dan pembayaran tidak menampilkan iklan.\n\n## Hak Anda\n\nAnda dapat meminta salinan atau penghapusan data akun melalui [${mail}](mailto:${mail}).` },
      en: { title: 'Privacy policy', desc: `How ${n} collects, uses and protects learners' data.`, body: `This policy explains the data we collect when you use this site.\n\n## Data we store\n\n- **Account:** name, e-mail and a *hashed* password (the actual password is never stored), plus your interface language.\n- **Learning:** lesson progress, quiz results and practice history.\n- **Payments:** invoices, transfer proofs and offer documents you upload — stored privately and visible only to the verification team.\n\n## Online payments\n\nInstant payments are processed by the provider you choose (for example PayPal, Stripe, Xendit or Midtrans). Your card or account details are entered directly on that provider's page; we only receive the payment status, amount and reference number.\n\n## Language and location\n\nTo choose the site's starting language we read the country code supplied by the network (for example Indonesia → Indonesian, Japan → Japanese). It is not stored; your language choice is kept in a cookie and in your account.\n\n## Advertising\n\nPublic pages may show Google AdSense ads. Google may use cookies to serve ads based on your visits; you can manage this in [Google Ad Settings](https://adssettings.google.com). The member portal, paid lessons, practice sets and payment pages show no ads.\n\n## Your rights\n\nYou can request a copy or deletion of your account data via [${mail}](mailto:${mail}).` },
      ja: { title: 'プライバシーポリシー', desc: `${n}による受講者データの収集・利用・保護について。`, body: `本ポリシーは、本サイトのご利用時に収集するデータについて説明します。\n\n## 保存するデータ\n\n- **アカウント:** 氏名、メールアドレス、*ハッシュ化*されたパスワード（実際のパスワードは保存しません）、表示言語。\n- **学習:** レッスンの進捗、クイズの結果、練習履歴。\n- **支払い:** 請求書、アップロードされた振込証明や割引証明書類 — 非公開で保管し、確認担当者のみが閲覧できます。\n\n## オンライン決済\n\n自動決済は、お客様が選んだ決済事業者（PayPal、Stripe、Xendit、Midtransなど）が処理します。カードや口座の情報はその事業者のページで直接入力され、当方が受け取るのは支払い状況・金額・参照番号のみです。\n\n## 言語と地域\n\n初期表示言語を選ぶために、ネットワークから提供される国コードを読み取ります（例: インドネシア → インドネシア語、日本 → 日本語）。国コードは保存せず、選んだ言語はCookieとアカウントに保存されます。\n\n## 広告\n\n公開ページにはGoogle AdSenseの広告が表示される場合があります。Googleは訪問に基づく広告配信にCookieを使用することがあり、[Google広告設定](https://adssettings.google.com)で管理できます。会員ポータル、有料レッスン、模擬問題、支払いページには広告は表示されません。\n\n## お客様の権利\n\nアカウントデータの写しや削除は [${mail}](mailto:${mail}) までご依頼ください。` },
    },
    syarat: {
      id: { title: 'Syarat & ketentuan', desc: `Syarat penggunaan layanan dan langganan ${n}.`, body: `Dengan memakai situs ini, Anda menyetujui ketentuan berikut.\n\n## Langganan\n\n- Langganan berlaku per bahasa (atau paket tiga bahasa) selama masa aktif yang tertera di tagihan, dihitung sejak pembayaran terkonfirmasi.\n- Langganan mencakup materi bahasa tersebut yang tersedia dan yang terbit selama masa aktif; materi diterbitkan bertahap.\n- Harga khusus pelajar dan juara kelas memerlukan dokumen yang sah dan terbaru; dokumen yang tidak sesuai dapat ditolak.\n- Akun bersifat pribadi dan tidak boleh dipakai bersama.\n\n## Materi\n\nMateri hanya untuk penggunaan pribadi dan dipelajari di dalam platform; materi tidak disediakan untuk diunduh. Yang dapat diunduh adalah laporan latihan milik peserta sendiri dan invoice/kuitansi.\n\n## Prediksi nilai\n\nPrediksi nilai pada latihan adalah perkiraan berdasarkan hasil latihan dan bukan skor resmi lembaga penguji.\n\n## Pembayaran & pengembalian dana\n\nPembayaran dapat dilakukan dalam IDR, USD atau JPY melalui cara bayar yang tampil di tagihan. Pembayaran yang telah terkonfirmasi tidak dapat dikembalikan, kecuali terjadi kesalahan dari pihak kami.` },
      en: { title: 'Terms & conditions', desc: `Terms of use for ${n} services and subscriptions.`, body: `By using this site you agree to the following terms.\n\n## Subscriptions\n\n- A subscription covers one language (or the three-language plan) for the period shown on the invoice, starting from the confirmed payment.\n- It includes that language's material available now and published during the subscription; material is published in stages.\n- Student and class-champion prices require valid, current documents; unsuitable documents may be rejected.\n- Accounts are personal and may not be shared.\n\n## Material\n\nMaterial is for personal use and is studied inside the platform; it is not offered for download. You may download your own practice reports and invoices/receipts.\n\n## Predicted scores\n\nPredicted scores are estimates based on practice results, not official scores from any examination body.\n\n## Payments & refunds\n\nPayments can be made in IDR, USD or JPY using the methods shown on the invoice. Confirmed payments are non-refundable, except in the case of an error on our side.` },
      ja: { title: '利用規約', desc: `${n}のサービスと受講プランの利用条件。`, body: `本サイトを利用することで、以下の条件に同意したものとみなされます。\n\n## 受講プラン\n\n- 受講プランは1言語（または3言語プラン）について、請求書に記載の期間、支払い確認時から有効です。\n- その言語の公開済み教材と期間中に公開される教材が含まれます。教材は段階的に公開されます。\n- 学生割引・学年上位者割引には有効な最新書類が必要です。不適切な書類は却下される場合があります。\n- アカウントは個人用で、共有はできません。\n\n## 教材\n\n教材は個人利用のためのもので、プラットフォーム内で学習します。ダウンロードは提供しません。ご自身の練習レポートと請求書・領収書はダウンロードできます。\n\n## 予想スコア\n\n予想スコアは練習結果に基づく推定であり、試験実施団体の公式スコアではありません。\n\n## 支払いと返金\n\n請求書に表示される方法で、IDR・USD・JPYで支払えます。確認済みの支払いは、当方の誤りによる場合を除き返金できません。` },
    },
    kredit: {
      id: { title: 'Sumber & lisensi', desc: `Sumber materi, lisensi dan atribusi di ${n}.`, body: `## Materi orisinal\n\nSeluruh pelajaran, dialog, penjelasan tata bahasa dan bank latihan soal disusun oleh tim ${n}. Soal latihan mengikuti deskripsi format ujian resmi dan bukan salinan soal ujian lembaga mana pun.\n\n## Suara\n\nAudio dibuat oleh mesin suara (Web Speech) di perangkat Anda; kualitasnya bergantung pada suara yang terpasang.\n\n## Nama ujian\n\nGoethe-Zertifikat (Goethe-Institut), Cambridge English (Cambridge University Press & Assessment), TOEFL® (ETS), IELTS™ (British Council, IDP, Cambridge) dan JLPT (Japan Foundation & JEES) adalah merek milik pemiliknya masing-masing. ${n} tidak berafiliasi dengan lembaga tersebut.\n\n## Huruf\n\nFraunces dan Plus Jakarta Sans — SIL Open Font License 1.1.` },
      en: { title: 'Sources & licences', desc: `Sources, licences and attributions at ${n}.`, body: `## Original material\n\nAll lessons, dialogues, grammar explanations and practice questions are written by the ${n} team. Practice questions follow the published descriptions of official exam formats and are not copies of any examination paper.\n\n## Audio\n\nAudio is produced by the speech engine (Web Speech) on your device; quality depends on the voices installed.\n\n## Exam names\n\nGoethe-Zertifikat (Goethe-Institut), Cambridge English (Cambridge University Press & Assessment), TOEFL® (ETS), IELTS™ (British Council, IDP, Cambridge) and JLPT (Japan Foundation & JEES) are trademarks of their respective owners. ${n} is not affiliated with these organisations.\n\n## Fonts\n\nFraunces and Plus Jakarta Sans — SIL Open Font License 1.1.` },
      ja: { title: '出典とライセンス', desc: `${n}の教材の出典・ライセンス・帰属表示。`, body: `## オリジナル教材\n\nレッスン、会話、文法解説、模擬問題はすべて${n}チームが作成しています。模擬問題は公式試験の公開形式に沿ったもので、いかなる試験問題の複製でもありません。\n\n## 音声\n\n音声はお使いの端末の音声エンジン（Web Speech）が生成します。品質はインストールされている音声に依存します。\n\n## 試験名\n\nGoethe-Zertifikat（Goethe-Institut）、Cambridge English（Cambridge University Press & Assessment）、TOEFL®（ETS）、IELTS™（British Council、IDP、Cambridge）、JLPT（国際交流基金・日本国際教育支援協会）は各所有者の商標です。${n}はこれらの団体と提携していません。\n\n## フォント\n\nFraunces、Plus Jakarta Sans — SIL Open Font License 1.1。` },
    },
  };
}

export const INFO_SLUGS = ['tentang', 'kontak', 'privasi', 'syarat', 'kredit'];

export function infoPage(site: SiteContent, slug: string, L: Lang = 'id'): { title: string; desc: string; body: Raw } | null {
  const base = defaults(site)[slug]?.[L];
  const over = site.pages[L === 'id' ? slug : `${slug}.${L}`];
  if (!over && !base) return null;
  const title = over?.title ?? base!.title;
  const md = over?.body ?? base!.body;
  return {
    title, desc: base?.desc ?? title,
    body: html`<section class="section"><div class="wrap-narrow">${breadcrumbs([[title, `/${slug}`]], L)}<h1 style="font-size:var(--fs-6)">${title}</h1><div class="article">${raw(renderMarkdown(md))}</div>${slug === 'kredit' ? libraryCredits(L) : ''}${over?.updated ? html`<p class="small muted">${t(L, 'common.update', { d: over.updated })}</p>` : ''}</div></section>`,
  };
}

/** Daftar sumber pustaka (dihitung dari katalog impor) — atribusi wajib CC BY / CC BY-SA. */
function libraryCredits(L: Lang): Raw {
  return html`<div class="article"><h2>${t(L, 'credit.library')}</h2><p>${t(L, 'credit.libraryText')}</p><ul>${sources().map((s) => html`<li><a href="${s.url}" rel="noopener" target="_blank">${s.source}</a> — <a href="${s.licenceUrl}" rel="noopener license" target="_blank">${s.licence}</a> · ${t(L, 'lib.stat.books')}: ${s.books}</li>`)}</ul>
  <h2>${t(L, 'kamus.source')}</h2><p>${t(L, 'kamus.sourceText')}</p><ul>${KAMUS_SOURCES.map(([name, url, lic]) => html`<li><a href="${url}" rel="noopener" target="_blank">${name}</a> — ${lic}</li>`)}</ul></div>`;
}

/** Sumber Kamus LUAJA (sama dengan scripts/kamus/build.py; atribusi wajib CC BY-SA & lisensi WordNet). */
const KAMUS_SOURCES: [string, string, string][] = [
  ['Wiktionary (English, Deutsch, 日本語, Bahasa Indonesia) via kaikki.org / wiktextract', 'https://kaikki.org/', 'CC BY-SA 4.0'],
  ['Princeton WordNet 3.0', 'https://wordnet.princeton.edu/', 'WordNet 3.0 License'],
  ['Wordnet Bahasa (Francis Bond et al.)', 'https://wn-msa.sourceforge.net/', 'MIT'],
  ['Japanese WordNet (NICT)', 'https://bond-lab.github.io/wnja/', 'Japanese WordNet License'],
  ['JLPT vocabulary lists (Jonathan Waller) via open-anki-jlpt-decks', 'https://github.com/jamsinclair/open-anki-jlpt-decks', 'CC BY'],
  ['FrequencyWords (Hermit Dave)', 'https://github.com/hermitdave/FrequencyWords', 'CC BY-SA 4.0'],
];
