/** Halaman publik: beranda, hub jalur bahasa (Jerman/Inggris/Jepang), coba gratis, 404. Isi dinamis dari pengaturan situs (SiteContent). */
import { html, raw, type Raw } from '../lib/html.ts';
import { COURSE_META, COURSES, type Course, type Pricing, type SiteContent } from '../data/model.ts';
import { rp } from '../lib/i18n.ts';
import { icon } from './layout.ts';
import { scene, autoMood, isDark, MOODS, MOOD_ICON, MOOD_LABEL, type Mood, type Country } from './scene.ts';
import { figure, POSE_FOR } from './figure.ts';

const FREE_LESSON: Record<Course, string> = { de: 'de-a1-m01-l01', en: 'en-beginner-m01-l01', ja: 'ja-n5-m01-l01' };

/** Salinan per jalur (publik). */
export const COURSE_COPY: Record<Course, { h1: string; lead: string; who: string; highlights: { icon: string; title: string; text: string }[]; exams: string; place: string }> = {
  de: {
    h1: 'Bahasa Jerman dari A1 sampai C2',
    lead: 'Untuk kuliah di Jerman, Ausbildung, kerja sebagai perawat atau insinyur, atau untuk pengembangan diri. Enam jenjang CEFR, setiap pelajaran sepuluh langkah dengan penjelasan Indonesia dan suara penutur asli.',
    who: 'Calon mahasiswa, peserta Ausbildung, tenaga kesehatan, pekerja profesional, dan siapa pun yang mulai dari nol.',
    highlights: [
      { icon: 'tangga', title: 'Konjugasi & kasus sampai otomatis', text: 'Nominativ, Akkusativ, Dativ, Genitiv dilatih berulang dengan umpan balik langsung — bukan dihafal tabelnya saja.' },
      { icon: 'suara', title: 'Lafal ch · ü · ö · r dengan suara asli', text: 'Setiap kalimat dibacakan berlogat Jerman; rekam suaramu dan bandingkan.' },
      { icon: 'ujian', title: 'Siap Goethe-Zertifikat & TestDaF', text: 'Format ujian A1–C2 dikenalkan sejak awal: Hören, Lesen, Schreiben, Sprechen.' },
      { icon: 'dunia', title: 'Dialog kehidupan nyata', text: 'Kursus bahasa, kantor imigrasi, kampus, rumah sakit, pasar, wawancara kerja.' },
    ],
    exams: 'Goethe-Zertifikat A1–C2 · telc · TestDaF · ÖSD',
    place: 'Berlin',
  },
  en: {
    h1: 'Bahasa Inggris dari Beginner sampai Proficiency',
    lead: 'Tujuh jenjang berurutan plus persiapan TOEFL dan IELTS di dalam paket yang sama. Tata bahasa yang masuk akal, percakapan sehari-hari, bahasa Inggris kerja, dan logat British maupun American.',
    who: 'Pelajar, mahasiswa, pencari beasiswa, pekerja yang butuh bahasa Inggris profesional, dan pemula total.',
    highlights: [
      { icon: 'tangga', title: 'Tata bahasa yang masuk akal', text: 'Tenses, articles, prepositions dijelaskan dari cara pikir penutur Indonesia — lengkap dengan jebakan yang paling sering salah.' },
      { icon: 'suara', title: 'Listening & speaking British + American', text: 'Pilih logat suara; setiap dialog bisa diperlambat dan diulang per kalimat.' },
      { icon: 'ujian', title: 'TOEFL iBT & IELTS termasuk', text: 'Strategi per bagian (Reading, Listening, Speaking, Writing), latihan berjangka waktu, simulasi penuh.' },
      { icon: 'kartu', title: 'Bahasa Inggris kerja', text: 'Email, rapat, presentasi, wawancara, negosiasi — dengan frasa siap pakai.' },
    ],
    exams: 'TOEFL iBT · IELTS Academic & General · Cambridge B1–C2',
    place: 'London',
  },
  ja: {
    h1: 'Bahasa Jepang dari N5 sampai N1',
    lead: 'Hiragana dan katakana selesai di pekan pertama, kanji bertahap dengan cerita, percakapan sehari-hari sampai keigo. Lima jenjang JLPT dengan penjelasan Indonesia dan suara penutur asli.',
    who: 'Peminat budaya Jepang, calon peserta magang (ginou jisshuusei), tokutei ginou, mahasiswa, dan pemula total.',
    highlights: [
      { icon: 'tangga', title: 'Kana tuntas di pekan pertama', text: 'Hiragana & katakana dengan goresan animasi, latihan tulis, dan dikte.' },
      { icon: 'buku', title: 'Kanji bertahap dengan cerita', text: 'Dari 100 kanji N5 sampai 2.000 kanji N1 — radikal, bacaan on/kun, contoh kalimat, ulang berjarak.' },
      { icon: 'suara', title: 'Pitch accent & keigo', text: 'Suara penutur asli di setiap baris; bentuk sopan, biasa, dan hormat dibedakan jelas.' },
      { icon: 'ujian', title: 'Siap JLPT N5–N1', text: 'Format 文字・語彙, 文法, 読解, 聴解 dilatih dengan simulasi berjangka waktu.' },
    ],
    exams: 'JLPT N5–N1 · JFT-Basic · NAT-TEST',
    place: 'Tokyo',
  },
};

const flagPill = (c: Course) => html`<span class="pill pill-flag"><i class="flag-${c}"></i>${COURSE_META[c].native}</span>`;

function moodBar(country: Country, current: Mood): Raw {
  return html`<div class="mood-bar" data-mood-bar data-country="${country}" role="group" aria-label="Suasana">${MOODS.map((m) => html`<button type="button" data-mood="${m}" aria-pressed="${m === current}" title="${MOOD_LABEL[m]}" aria-label="${MOOD_LABEL[m]}">${raw(MOOD_ICON[m])}</button>`)}</div>`;
}

function priceCards(p: Pricing, o: { compact?: boolean } = {}): Raw {
  const u = p.tiers.umum;
  const perks1 = ['Seluruh jenjang satu bahasa', 'Seluruh paket latihan soal bahasa tersebut', 'Kosakata, latihan, kuis, sertifikat modul', 'Audio penutur asli & terjemahan Indonesia', 'Akses 1 tahun, semua perangkat'];
  const perks3 = ['Jerman + Inggris + Jepang', 'Termasuk persiapan TOEFL & IELTS', 'Laporan & prediksi nilai setiap latihan', 'Lebih hemat Rp200.000 dibanding paket satuan', 'Akses 1 tahun, semua perangkat'];
  return html`<div class="pricing">
  <div class="price reveal"><h3>1 Bahasa</h3><div><div class="amount"><sup>Rp</sup>${(u.one).toLocaleString('id-ID')}</div><div class="per">per tahun · pilih Jerman, Inggris, atau Jepang</div></div><ul>${perks1.map((x) => html`<li>${x}</li>`)}</ul><a class="btn btn-ghost" href="/daftar?paket=1">Pilih 1 bahasa</a></div>
  <div class="price featured reveal" data-delay="1"><span class="tag">TERLARIS</span><h3>3 Bahasa</h3><div><div class="amount"><sup>Rp</sup>${(u.three).toLocaleString('id-ID')}</div><div class="per">per tahun · ketiga bahasa sekaligus</div></div><ul>${perks3.map((x) => html`<li>${x}</li>`)}</ul><a class="btn btn-gold" href="/daftar?paket=3">Pilih 3 bahasa</a></div>
  </div>
  ${o.compact ? '' : html`<div class="promo-strip" style="margin-top:18px">
    ${p.tiers.pelajar.enabled ? html`<div class="promo reveal"><span class="icon-tile">${icon('sekolah')}</span><div><b>Promo pelajar</b><p>Sampai kelas 12 / 3 SMK sederajat: <strong>${rp(p.tiers.pelajar.one)}</strong>/thn per bahasa · <strong>${rp(p.tiers.pelajar.three)}</strong>/thn 3 bahasa. Lampirkan surat keterangan pelajar terbaru.</p></div></div>` : ''}
    ${p.tiers.juara.enabled ? html`<div class="promo reveal" data-delay="1"><span class="icon-tile">${icon('piala')}</span><div><b>Promo juara kelas</b><p>Juara 1, 2 atau 3: <strong>${rp(p.tiers.juara.one)}</strong>/thn per bahasa · <strong>${rp(p.tiers.juara.three)}</strong>/thn 3 bahasa. Lampirkan bukti juara kelas tahun ini saat mendaftar.</p></div></div>` : ''}
  </div>`}`;
}

function courseCard(c: Course, p: Pricing, i: number): Raw {
  const m = COURSE_META[c], mood = autoMood(c), copy = COURSE_COPY[c];
  return html`<a class="card course-card lift reveal" data-delay="${i}" href="/${m.slug}">
  <div class="thumb">${raw(scene(c, mood, { w: 1600, h: 900, id: `thumb-${c}`, seed: 11 + i }))}<div class="fig">${raw(figure(POSE_FOR[c], { mood, small: true }))}</div></div>
  <div class="body"><h3>${flagPill(c)} ${m.name}</h3><div class="levels">${m.levels.map((l) => html`<span>${l.name}</span>`)}</div><p class="muted" style="margin:0;font-size:var(--fs-1)">${copy.lead.split('. ')[0]}.</p>
  <div class="cta"><span class="pill pill-gold">${rp(p.tiers.umum.one)}/thn</span><span class="btn btn-ghost btn-sm">Lihat jalur ${icon('panah')}</span></div></div></a>`;
}

export function homePage(o: { site: SiteContent; pricing: Pricing; mood: Mood }): Raw {
  const s = o.site, h = s.hero;
  return html`
<section class="hero ${isDark(o.mood) ? '' : 'light'}" data-hero>
  <div class="scene">${raw(scene('id', o.mood, { id: 'hero' }))}</div>
  ${moodBar('id', o.mood)}
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">${h.kicker}</p>
      <h1>${h.title} <em class="italic">${h.em}</em></h1>
      <p class="greeting" aria-live="off">${s.greetings.map((g) => html`<span lang="${g.lang}" title="${g.id}">${g.text}</span>`)}</p>
      <p class="lead">${h.lead}</p>
      <div class="hero-actions"><a class="btn btn-gold btn-lg" href="/coba">${icon('main')} ${h.cta}</a><a class="btn btn-white btn-lg" href="/harga">${h.cta2}</a></div>
      <div class="hero-note"><span>${icon('cek')} Penjelasan Indonesia</span><span>${icon('cek')} Suara penutur asli</span><span>${icon('cek')} Akses 1 tahun</span><span>${icon('cek')} Pelajaran pertama tanpa biaya</span></div>
    </div>
    <div class="hero-figure" data-figure="sapa">${raw(figure('sapa', { mood: o.mood }))}</div>
  </div>
</section>

<section class="section-tight"><div class="wrap"><div class="ribbon reveal">
  <div class="stat"><b>3</b><span>bahasa</span></div><div class="stat"><b>18</b><span>jenjang berurutan</span></div><div class="stat"><b>10</b><span>langkah tiap pelajaran</span></div><div class="stat"><b>2</b><span>ujian: TOEFL & IELTS</span></div><div class="stat"><b>1 thn</b><span>akses penuh</span></div>
</div></div></section>

<section class="section" id="jalur"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">Tiga jalur, satu cara belajar</p><h2>Pilih bahasamu</h2><p class="lead">Setiap jalur tersusun runtut dari nol hingga mahir. Pelajaran pertama setiap jenjang dapat diikuti tanpa biaya.</p></div>
  <div class="grid g3" style="margin-top:28px">${COURSES.map((c, i) => courseCard(c, o.pricing, i))}</div>
</div></section>

<section class="section" style="background:var(--paper-2)"><div class="wrap">
  <div class="grid g2" style="align-items:center">
    <div class="reveal"><p class="eyebrow">Satu pelajaran = sepuluh langkah</p><h2>Belajar seperti didampingi pengajar pribadi</h2>
      <ol class="goals" style="counter-reset:none">${['Tujuan — apa yang bisa kamu lakukan setelah ini', 'Adegan — dialog kehidupan nyata, dibacakan baris demi baris', 'Bacaan — teks pendek dengan terjemahan per kalimat', 'Kosakata — kartu dengan artikel, jamak, contoh, suara', 'Tata bahasa — penjelasan Indonesia dengan tabel & pola', 'Latihan terbimbing — umpan balik langsung, mengapa salah', 'Lafal — tirukan, rekam, bandingkan', 'Mandiri — dikte dan tulis bebas', 'Kuis — lulus ≥ 80 % membuka pelajaran berikutnya', 'Rekap — lima poin inti untuk diingat'].map((t) => html`<li>${t}</li>`)}</ol>
      <div class="row" style="margin-top:18px"><a class="btn btn-ghost" href="/coba">Ikuti satu pelajaran gratis ${icon('panah')}</a></div></div>
    <div class="reveal" data-delay="1" style="display:flex;justify-content:center"><div style="width:min(100%,520px)">${raw(figure('belajar', { mood: 'siang' }))}</div></div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">Mengapa LUAJA</p><h2>${s.why.title}</h2></div>
  <div class="grid g3" style="margin-top:28px">${s.why.items.map((it, i) => html`<div class="card lift feature reveal" data-delay="${i % 4}"><span class="icon-tile">${icon(it.icon)}</span><h3>${it.title}</h3><p>${it.text}</p></div>`)}</div>
</div></section>

<section class="section" id="harga" style="background:linear-gradient(180deg,var(--paper-2),transparent)"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">Harga sederhana</p><h2>Satu harga, satu tahun, seluruh jenjang</h2><p class="lead">Tanpa biaya tambahan per jenjang atau per modul. Pelajar dan juara kelas memperoleh harga khusus.</p></div>
  <div style="margin-top:28px">${priceCards(o.pricing)}</div>
  <p class="center" style="margin-top:18px"><a class="btn btn-ghost" href="/harga">Rincian paket & cara bayar ${icon('panah')}</a></p>
</div></section>

<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${s.steps.title}</p><h2>Mulai dalam tiga langkah</h2></div>
  <div class="steps" style="margin-top:28px">${s.steps.items.map((st, i) => html`<div class="step reveal" data-delay="${i}"><h3>${st.title}</h3><p style="margin:0;color:var(--ink-2)">${st.text}</p></div>`)}</div>
</div></section>

<section class="section" style="background:var(--paper-2)"><div class="wrap-narrow">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">Pertanyaan umum</p><h2>Yang sering ditanyakan</h2></div>
  <div class="faq reveal" style="margin-top:24px">${s.faq.map((f) => html`<details><summary>${f.q}</summary><div>${f.a}</div></details>`)}</div>
</div></section>

<section class="section"><div class="wrap"><div class="cta-band reveal"><div><h2>Mulai hari ini, tanpa biaya.</h2><p>Pelajaran pertama Jerman A1, Inggris Beginner, dan Jepang N5 terbuka untuk semua — tanpa kartu kredit, tanpa registrasi.</p><div class="row" style="margin-top:18px"><a class="btn btn-gold btn-lg" href="/coba">Coba sekarang</a><a class="btn btn-white btn-lg" href="/daftar">Buat akun</a></div></div>${raw(figure('baca', { cls: 'fig' }))}</div></div></section>`;
}

export function coursePage(o: { site: SiteContent; pricing: Pricing; course: Course; mood: Mood }): Raw {
  const c = o.course, m = COURSE_META[c], copy = COURSE_COPY[c], p = o.pricing;
  return html`
<section class="hero ${isDark(o.mood) ? '' : 'light'}" data-hero>
  <div class="scene">${raw(scene(c, o.mood, { id: 'hero' }))}</div>
  ${moodBar(c, o.mood)}
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">Jalur ${m.name} · ${m.native}</p>
      <h1>${copy.h1}</h1>
      <p class="lead">${copy.lead}</p>
      <div class="hero-actions"><a class="btn btn-gold btn-lg" href="/belajar/${FREE_LESSON[c]}">${icon('main')} Coba ${m.levels[0]!.name} gratis</a><a class="btn btn-white btn-lg" href="/harga">${rp(p.tiers.umum.one)}/tahun</a></div>
      <div class="hero-note"><span>${icon('cek')} ${m.levels.length} jenjang</span><span>${icon('cek')} Suara ${m.locale}</span><span>${icon('cek')} ${copy.exams.split(' · ')[0]}</span></div>
    </div>
    <div class="hero-figure" data-figure="${POSE_FOR[c]}">${raw(figure(POSE_FOR[c], { mood: o.mood }))}</div>
  </div>
</section>

<section class="section" id="jenjang"><div class="wrap">
  <div class="reveal"><p class="eyebrow">Jenjang</p><h2>Dari ${m.levels[0]!.name} sampai ${m.levels[m.levels.length - 1]!.name}, berurutan</h2><p class="lead">Setiap jenjang terdiri dari beberapa modul; setiap modul lima pelajaran; setiap pelajaran sepuluh langkah. Pelajaran berikutnya terbuka setelah kuis ≥ 80 %, tes modul ≥ 75 %, dan ujian jenjang ≥ 70 %.</p></div>
  <div class="ladder reveal" style="margin-top:22px">${m.levels.map((l, i) => html`<a href="/${m.slug}/${l.id}" class="${i === 0 ? 'free' : ''}">${i > 0 ? icon('gembok', 'lock') : ''}<b>${l.name}</b><span>${l.sub}</span><small class="muted">${l.hours}</small></a>`)}</div>
</div></section>

<section class="section" style="background:var(--paper-2)"><div class="wrap">
  <div class="grid g2" style="align-items:start">
    <div class="reveal"><p class="eyebrow">Untuk siapa</p><h2>${m.name} untuk tujuan nyata</h2><p class="lead">${copy.who}</p><p class="notice">Sertifikat yang dipersiapkan: <strong>${copy.exams}</strong>.</p></div>
    <div class="grid" style="gap:14px">${copy.highlights.map((hgl, i) => html`<div class="card lift feature reveal" data-delay="${i}"><span class="icon-tile">${icon(hgl.icon)}</span><h3>${hgl.title}</h3><p>${hgl.text}</p></div>`)}</div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">Harga</p><h2>${m.name}: ${rp(p.tiers.umum.one)} per tahun</h2><p class="lead">Atau ketiga bahasa sekaligus ${rp(p.tiers.umum.three)} per tahun. Harga khusus pelajar dan juara kelas berlaku.</p></div>
  <div style="margin-top:28px">${priceCards(p)}</div>
</div></section>

<section class="section"><div class="wrap"><div class="cta-band reveal"><div><h2>Ikuti ${m.levels[0]!.name} sekarang, tanpa biaya.</h2><p>Pelajaran pertama lengkap sepuluh langkah — tanpa registrasi.</p><div class="row" style="margin-top:18px"><a class="btn btn-gold btn-lg" href="/belajar/${FREE_LESSON[c]}">Mulai pelajaran 1</a></div></div>${raw(figure('baca', { cls: 'fig' }))}</div></div></section>`;
}

export function cobaPage(o: { site: SiteContent }): Raw {
  return html`<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">Tanpa biaya, tanpa registrasi</p><h1 style="font-size:var(--fs-6)">Ikuti satu pelajaran penuh</h1><p class="lead">Pelajaran pertama setiap jenjang terbuka untuk semua — sepuluh langkah lengkap dengan audio, latihan dan kuis.</p></div>
  <div class="grid g3" style="margin-top:28px">${COURSES.map((c, i) => { const m = COURSE_META[c]; return html`<a class="card lift reveal" data-delay="${i}" href="/belajar/${FREE_LESSON[c]}" style="text-decoration:none;color:inherit;overflow:hidden;padding:0"><div style="aspect-ratio:16/9;position:relative">${raw(scene(c, autoMood(c), { id: `coba-${c}`, seed: 21 + i }))}</div><div style="padding:20px"><h3>${flagPill(c)} ${m.levels[0]!.name} · Pelajaran 1</h3><p class="muted" style="margin:0">${m.name} · ${m.levels[0]!.sub}</p><p style="margin:12px 0 0"><span class="btn btn-gold btn-sm">Mulai ${icon('panah')}</span></p></div></a>`; })}</div>
</div></section>`;
}

export function notFoundPage(): Raw {
  return html`<section class="section"><div class="wrap-narrow center"><p class="eyebrow" style="justify-content:center">404</p><h1 style="font-size:var(--fs-6)">Halaman tidak ditemukan</h1><p class="lead">Mungkin tautannya berubah. Mulai lagi dari beranda atau pilih jalur bahasa.</p><div class="row" style="justify-content:center;margin-top:18px"><a class="btn btn-gold" href="/">Beranda</a>${COURSES.map((c) => html`<a class="btn btn-ghost" href="/${COURSE_META[c].slug}">${COURSE_META[c].name}</a>`)}</div></div></section>`;
}
