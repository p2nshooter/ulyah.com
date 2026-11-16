/**
 * Halaman publik: beranda, hub jalur bahasa (Jerman/Inggris/Jepang), coba gratis, 404 — dalam bahasa antarmuka
 * Indonesia, Inggris atau Jepang (terjemahan manual). Isi beranda dinamis dari pengaturan situs (SiteContent).
 * Setiap klaim di sini harus benar untuk produk hari ini; materi yang belum terbit disebut „terbit bertahap“.
 */
import { html, raw, type Raw } from '../lib/html.ts';
import { COURSE_META, COURSES, money, unitPrices, type Course, type Currency, type Pricing, type SiteContent } from '../data/model.ts';
import { t, tri, type Lang, type Tri } from '../lib/i18n.ts';
import { LESSONS } from '../course/index.ts';
import { SETS, totalQuestions } from '../practice/index.ts';
import { icon } from './layout.ts';
import { scene, autoMood, isDark, MOODS, MOOD_ICON, type Mood } from './scene.ts';
import { figure, POSE_FOR } from './figure.ts';

export const FREE_LESSON: Record<Course, string> = { de: 'de-a1-m01-l01', en: 'en-beginner-m01-l01', ja: 'ja-n5-m01-l01' };
/** Mata uang yang ditampilkan di halaman publik menurut bahasa antarmuka. */
export const CUR_FOR: Record<Lang, Currency> = { id: 'IDR', en: 'USD', ja: 'JPY' };

/** Salinan per jalur (publik), tiga bahasa. Sorotan hanya menyebut yang memang ada; sisanya „dalam kurikulum“. */
export const COURSE_COPY: Record<Course, { h1: Tri; lead: Tri; who: Tri; highlights: { icon: string; title: Tri; text: Tri }[]; exams: string }> = {
  de: {
    h1: { id: 'Bahasa Jerman dari A1 sampai C2', en: 'German from A1 to C2', ja: 'A1からC2までのドイツ語' },
    lead: {
      id: 'Untuk kuliah di Jerman, Ausbildung, kerja sebagai perawat atau insinyur, atau pengembangan diri. Enam jenjang CEFR yang diterbitkan bertahap; setiap pelajaran sepuluh langkah dengan penjelasan Indonesia dan audio berlogat Jerman.',
      en: 'For university in Germany, Ausbildung, work as a nurse or engineer, or personal growth. Six CEFR levels published in stages; every lesson has ten steps with German-accent audio.',
      ja: 'ドイツでの大学進学、職業訓練（Ausbildung）、看護師やエンジニアとしての就労、自己成長のために。CEFR 6レベルを段階的に公開。各レッスンはドイツ語アクセントの音声付き10ステップ。',
    },
    who: {
      id: 'Calon mahasiswa, peserta Ausbildung, tenaga kesehatan, pekerja profesional, dan siapa pun yang mulai dari nol.',
      en: 'Future students, Ausbildung applicants, healthcare workers, professionals, and anyone starting from zero.',
      ja: '留学予定者、職業訓練の志望者、医療従事者、社会人、そしてゼロから始めるすべての方。',
    },
    highlights: [
      { icon: 'tangga', title: { id: 'Artikel & konjugasi sampai otomatis', en: 'Articles & conjugation until automatic', ja: '冠詞と動詞の活用を自然に' }, text: { id: 'der/die/das berwarna di setiap kosakata, konjugasi Präsens dan seri penguatan artikel serta konjugasi dengan umpan balik langsung.', en: 'Colour-coded der/die/das on every word, present-tense conjugation, and reinforcement series for articles and conjugation with instant feedback.', ja: 'すべての単語にder/die/dasを色分け表示。現在形の活用と、冠詞・活用の強化シリーズで即座にフィードバック。' } },
      { icon: 'suara', title: { id: 'Lafal ch · ä · ö · ü dengan audio berlogat Jerman', en: 'ch · ä · ö · ü with German-accent audio', ja: 'ch・ä・ö・üをドイツ語アクセントの音声で' }, text: { id: 'Setiap kalimat dibacakan berlogat Jerman dan dapat diperlambat; tirukan lalu periksa ucapanmu dengan pengenal suara peramban.', en: 'Every sentence is read with a German accent and can be slowed down; repeat it and check yourself with the browser speech recogniser.', ja: 'すべての文をドイツ語アクセントで読み上げ、速度も落とせます。真似して、ブラウザの音声認識で確認しましょう。' } },
      { icon: 'ujian', title: { id: 'Latihan format Goethe-Zertifikat', en: 'Goethe-Zertifikat-format practice', ja: 'Goethe-Zertifikat形式の練習' }, text: { id: 'Paket simulasi A1–B1 (Lesen dan struktur) dengan kunci, pembahasan dan prediksi nilai 0–100; jenjang berikutnya terbit bertahap.', en: 'A1–B1 mock sets (reading and structure) with keys, explanations and a predicted 0–100 score; further levels follow in stages.', ja: 'A1〜B1の模擬セット（読解・文法）を解答・解説・0〜100の予想スコア付きで。以降のレベルは順次公開。' } },
      { icon: 'dunia', title: { id: 'Dialog kehidupan nyata', en: 'Real-life dialogues', ja: '実生活の会話' }, text: { id: 'Dimulai dari kelas bahasa dan perkenalan; kurikulum berlanjut ke kantor imigrasi, kampus, rumah sakit, pasar dan wawancara kerja.', en: 'Starting with the language class and introductions; the curriculum continues to the immigration office, campus, hospital, market and job interviews.', ja: '語学クラスと自己紹介から始まり、カリキュラムは入国管理局、大学、病院、市場、就職面接へと続きます。' } },
    ],
    exams: 'Goethe-Zertifikat A1–C2 · telc · TestDaF · ÖSD',
  },
  en: {
    h1: { id: 'Bahasa Inggris dari Beginner sampai Proficiency', en: 'English from Beginner to Proficiency', ja: 'BeginnerからProficiencyまでの英語' },
    lead: {
      id: 'Tujuh jenjang berurutan yang diterbitkan bertahap, plus latihan TOEFL ITP dan IELTS Academic di dalam paket yang sama. Tata bahasa yang masuk akal, percakapan sehari-hari dan audio berlogat British.',
      en: 'Seven ordered levels published in stages, plus TOEFL ITP and IELTS Academic practice in the same plan. Grammar that makes sense, everyday conversation and British-accent audio.',
      ja: '段階的に公開される7つのレベルと、同じプランに含まれるTOEFL ITP・IELTS Academicの練習。納得できる文法、日常会話、イギリス英語アクセントの音声。',
    },
    who: {
      id: 'Pelajar, mahasiswa, pencari beasiswa, pekerja yang butuh bahasa Inggris profesional, dan pemula total.',
      en: 'School and university students, scholarship applicants, professionals who need workplace English, and complete beginners.',
      ja: '中高生・大学生、奨学金志望者、仕事で英語が必要な社会人、まったくの初心者。',
    },
    highlights: [
      { icon: 'tangga', title: { id: 'Tata bahasa yang masuk akal', en: 'Grammar that makes sense', ja: '納得できる文法' }, text: { id: 'to be, kata tanya, angka dan kepemilikan dijelaskan dari cara pikir penutur Indonesia — lengkap dengan jebakan yang paling sering salah.', en: 'to be, question words, numbers and possession explained from an Indonesian speaker\'s point of view — with the most common traps.', ja: 'be動詞、疑問詞、数、所有をインドネシア語話者の視点から解説。間違えやすい点も網羅。' } },
      { icon: 'suara', title: { id: 'Dengar & tirukan per kalimat', en: 'Listen & repeat sentence by sentence', ja: '1文ずつ聞いて真似る' }, text: { id: 'Setiap dialog dibacakan berlogat British, dapat diperlambat dan diulang per kalimat, dengan dikte dan latihan ucapan.', en: 'Every dialogue is read in a British accent, can be slowed down and repeated line by line, with dictation and speaking practice.', ja: '会話はイギリス英語アクセントで読み上げ、速度調整や1文ずつの繰り返しが可能。ディクテーションと発話練習付き。' } },
      { icon: 'ujian', title: { id: 'Latihan TOEFL ITP & IELTS termasuk', en: 'TOEFL ITP & IELTS practice included', ja: 'TOEFL ITP・IELTSの練習込み' }, text: { id: 'Paket Structure & Written Expression dan Reading TOEFL ITP serta IELTS Academic Reading, lengkap dengan prediksi skor; bagian lain menyusul bertahap.', en: 'TOEFL ITP Structure & Written Expression and Reading sets plus IELTS Academic Reading, with predicted scores; further sections follow in stages.', ja: 'TOEFL ITPの文法・読解とIELTS Academic Readingのセットを予想スコア付きで。その他のセクションは順次公開。' } },
      { icon: 'kartu', title: { id: 'Cambridge A1–A2', en: 'Cambridge A1–A2', ja: 'Cambridge A1〜A2' }, text: { id: 'Paket simulasi format Cambridge untuk jenjang Beginner dan Elementary, dengan kunci dan pembahasan.', en: 'Cambridge-format mock sets for the Beginner and Elementary levels, with keys and explanations.', ja: 'Beginner・Elementary向けのCambridge形式模擬セット（解答・解説付き）。' } },
    ],
    exams: 'TOEFL ITP · IELTS Academic · Cambridge A1–C2',
  },
  ja: {
    h1: { id: 'Bahasa Jepang dari N5 sampai N1', en: 'Japanese from N5 to N1', ja: 'N5からN1までの日本語' },
    lead: {
      id: 'Hiragana, katakana dan kanji bertahap, percakapan sehari-hari sampai bentuk sopan. Lima jenjang JLPT yang diterbitkan bertahap, dengan penjelasan Indonesia dan audio berlogat Jepang.',
      en: 'Hiragana, katakana and kanji step by step, everyday conversation through to polite forms. Five JLPT levels published in stages, with Japanese-accent audio.',
      ja: 'ひらがな・カタカナ・漢字を段階的に、日常会話から丁寧な表現まで。JLPT 5レベルを段階的に公開し、日本語アクセントの音声付き。',
    },
    who: {
      id: 'Peminat budaya Jepang, calon peserta magang (ginou jisshuusei), tokutei ginou, mahasiswa, dan pemula total.',
      en: 'Fans of Japanese culture, future technical interns (ginou jisshuusei), specified-skilled workers (tokutei ginou), students and complete beginners.',
      ja: '日本文化に関心のある方、技能実習・特定技能の志望者、学生、まったくの初心者。',
    },
    highlights: [
      { icon: 'tangga', title: { id: 'Kana dengan seri penguatan', en: 'Kana with reinforcement series', ja: '強化シリーズでかなを定着' }, text: { id: 'Seri latihan hiragana, katakana dan kanji N5 dengan kunci dan pembahasan; setiap kalimat pelajaran ditulis dengan kana.', en: 'Hiragana, katakana and N5 kanji practice series with keys and explanations; every lesson sentence is shown with kana.', ja: 'ひらがな・カタカナ・N5漢字の練習シリーズ（解答・解説付き）。レッスンのすべての文にかなを表示。' } },
      { icon: 'buku', title: { id: 'Kanji bertahap', en: 'Kanji step by step', ja: '段階的な漢字学習' }, text: { id: 'Dari kanji N5 menuju ±2.000 kanji N1 sesuai kurikulum: bacaan on/kun, contoh kalimat dan pengulangan.', en: 'From N5 kanji towards ≈2,000 N1 kanji along the curriculum: on/kun readings, example sentences and review.', ja: 'カリキュラムに沿ってN5漢字からN1の約2,000字へ。音読み・訓読み、例文、復習。' } },
      { icon: 'suara', title: { id: 'Sopan vs santai, dengan audio', en: 'Polite vs casual, with audio', ja: '丁寧形と普通形を音声で' }, text: { id: 'Audio berlogat Jepang di setiap baris; bentuk sopan dan santai dibedakan jelas sejak pelajaran pertama.', en: 'Japanese-accent audio on every line; polite and casual forms are clearly distinguished from the first lesson.', ja: 'すべての行に日本語アクセントの音声。最初のレッスンから丁寧形と普通形を明確に区別。' } },
      { icon: 'ujian', title: { id: 'Latihan format JLPT', en: 'JLPT-format practice', ja: 'JLPT形式の練習' }, text: { id: 'Paket N5–N4 untuk 文字・語彙, 文法 dan 読解 dengan prediksi skor 0–120; jenjang berikutnya terbit bertahap.', en: 'N5–N4 sets for 文字・語彙, 文法 and 読解 with a predicted 0–120 score; further levels follow in stages.', ja: 'N5〜N4の文字・語彙、文法、読解セット（0〜120の予想スコア付き）。以降のレベルは順次公開。' } },
    ],
    exams: 'JLPT N5–N1 · JFT-Basic · NAT-TEST',
  },
};

const flagPill = (c: Course) => html`<span class="pill pill-flag"><i class="flag-${c}"></i>${COURSE_META[c].native}</span>`;

function moodBar(L: Lang, current: Mood): Raw {
  return html`<nav class="mood-bar" aria-label="${t(L, 'mood.label')}">${MOODS.map((m) => html`<a href="?mood=${m}" rel="nofollow" ${m === current ? raw('aria-current="true"') : ''} title="${t(L, `mood.${m}`)}" aria-label="${t(L, `mood.${m}`)}">${raw(MOOD_ICON[m])}</a>`)}</nav>`;
}

export function priceCards(p: Pricing, L: Lang, o: { compact?: boolean } = {}): Raw {
  const cur = CUR_FOR[L], u = unitPrices(p.tiers.umum, cur), yr = t(L, 'common.yr');
  const save = u.one * 3 - u.three;
  const perks1 = (['price.perk1.1', 'price.perk1.2', 'price.perk1.3', 'price.perk1.4', 'price.perk1.5'] as const).map((k) => t(L, k));
  const perks3 = [t(L, 'price.perk3.1'), t(L, 'price.perk3.2'), t(L, 'price.perk3.3'), ...(save > 0 ? [t(L, 'price.perk3.save', { v: money(save, cur) })] : []), t(L, 'price.perk3.5')];
  const pel = unitPrices(p.tiers.pelajar, cur), jua = unitPrices(p.tiers.juara, cur);
  return html`<div class="pricing">
  <div class="price reveal"><h3>${t(L, 'price.one')}</h3><div><div class="amount">${money(u.one, cur)}</div><div class="per">${t(L, 'price.one.per')}</div></div><ul>${perks1.map((x) => html`<li>${x}</li>`)}</ul><a class="btn btn-ghost" href="/daftar?paket=1">${t(L, 'price.choose1')}</a></div>
  <div class="price featured reveal" data-delay="1"><span class="tag">${t(L, 'price.tag')}</span><h3>${t(L, 'price.three')}</h3><div><div class="amount">${money(u.three, cur)}</div><div class="per">${t(L, 'price.three.per')}</div></div><ul>${perks3.map((x) => html`<li>${x}</li>`)}</ul><a class="btn btn-gold" href="/daftar?paket=3">${t(L, 'price.choose3')}</a></div>
  </div>
  ${o.compact ? '' : html`<div class="promo-strip" style="margin-top:18px">
    ${p.tiers.pelajar.enabled ? html`<div class="promo reveal"><span class="icon-tile">${icon('sekolah')}</span><div><b>${t(L, 'price.student')}</b><p>${t(L, 'price.student.text', { one: money(pel.one, cur), three: money(pel.three, cur), yr })}</p></div></div>` : ''}
    ${p.tiers.juara.enabled ? html`<div class="promo reveal" data-delay="1"><span class="icon-tile">${icon('piala')}</span><div><b>${t(L, 'price.champ')}</b><p>${t(L, 'price.champ.text', { one: money(jua.one, cur), three: money(jua.three, cur), yr })}</p></div></div>` : ''}
  </div>`}`;
}

function courseCard(c: Course, p: Pricing, i: number, L: Lang): Raw {
  const m = COURSE_META[c], mood = autoMood(c), copy = COURSE_COPY[c], cur = CUR_FOR[L];
  return html`<a class="card course-card lift reveal" data-delay="${i}" href="/${m.slug}">
  <div class="thumb">${raw(scene(c, mood, { w: 1600, h: 900, id: `thumb-${c}`, seed: 11 + i }))}<div class="fig">${raw(figure(POSE_FOR[c], { mood, small: true }))}</div></div>
  <div class="body"><h3>${flagPill(c)} ${m.names[L]}</h3><div class="levels">${m.levels.map((l) => html`<span>${l.name}</span>`)}</div><p class="muted" style="margin:0;font-size:var(--fs-1)">${tri(L, copy.lead).split(/(?<=[.。])\s*/)[0]}</p>
  <div class="cta"><span class="pill pill-gold">${money(unitPrices(p.tiers.umum, cur).one, cur)}${t(L, 'common.yr')}</span><span class="btn btn-ghost btn-sm">${t(L, 'home.card.view')} ${icon('panah')}</span></div></div></a>`;
}

export function homePage(o: { site: SiteContent; pricing: Pricing; mood: Mood; lang: Lang }): Raw {
  const s = o.site, h = s.hero, L = o.lang;
  const levels = COURSES.reduce((n, c) => n + COURSE_META[c].levels.length, 0);
  const stepKeys = ['home.steps.1', 'home.steps.2', 'home.steps.3', 'home.steps.4', 'home.steps.5', 'home.steps.6', 'home.steps.7', 'home.steps.8', 'home.steps.9', 'home.steps.10'] as const;
  return html`
<section class="hero ${isDark(o.mood) ? '' : 'light'}" data-hero>
  <div class="scene">${raw(scene('id', o.mood, { id: 'hero' }))}</div>
  ${moodBar(L, o.mood)}
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">${h.kicker}</p>
      <h1>${h.title} <em class="italic">${h.em}</em></h1>
      <p class="greeting" aria-live="off">${s.greetings.map((g) => html`<span lang="${g.lang}" title="${g.tr?.[L] ?? ''}">${g.text}</span>`)}</p>
      <p class="lead">${h.lead}</p>
      <div class="hero-actions"><a class="btn btn-gold btn-lg" href="/coba">${icon('main')} ${h.cta}</a><a class="btn btn-white btn-lg" href="/harga">${h.cta2}</a></div>
      <div class="hero-note"><span>${icon('cek')} ${t(L, 'home.note.explain')}</span><span>${icon('cek')} ${t(L, 'home.note.audio')}</span><span>${icon('cek')} ${t(L, 'home.note.year')}</span><span>${icon('cek')} ${t(L, 'home.note.free')}</span></div>
    </div>
    <div class="hero-figure" data-figure="sapa">${raw(figure('sapa', { mood: o.mood }))}</div>
  </div>
</section>

<section class="section-tight"><div class="wrap"><div class="ribbon reveal">
  <div class="stat"><b>3</b><span>${t(L, 'home.stat.langs', { n: levels })}</span></div><div class="stat"><b>${LESSONS.length}</b><span>${t(L, 'home.stat.lessons')}</span></div><div class="stat"><b>${totalQuestions().toLocaleString(L === 'id' ? 'id-ID' : 'en-US')}</b><span>${t(L, 'home.stat.questions')}</span></div><div class="stat"><b>10</b><span>${t(L, 'home.stat.steps')}</span></div><div class="stat"><b>${t(L, 'home.stat.yearVal')}</b><span>${t(L, 'home.stat.year')}</span></div>
</div></div></section>

<section class="section" id="jalur"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${t(L, 'home.paths.eyebrow')}</p><h2>${t(L, 'home.paths.title')}</h2><p class="lead">${t(L, 'home.paths.lead')}</p></div>
  <div class="grid g3" style="margin-top:28px">${COURSES.map((c, i) => courseCard(c, o.pricing, i, L))}</div>
</div></section>

<section class="section" style="background:var(--paper-2)"><div class="wrap">
  <div class="grid g2" style="align-items:center">
    <div class="reveal"><p class="eyebrow">${t(L, 'home.steps.eyebrow')}</p><h2>${t(L, 'home.steps.title')}</h2>
      <ol class="goals" style="counter-reset:none">${stepKeys.map((k) => html`<li>${t(L, k)}</li>`)}</ol>
      <div class="row" style="margin-top:18px"><a class="btn btn-ghost" href="/coba">${t(L, 'home.steps.cta')} ${icon('panah')}</a></div></div>
    <div class="reveal" data-delay="1" style="display:flex;justify-content:center"><div style="width:min(100%,520px)">${raw(figure('belajar', { mood: 'siang' }))}</div></div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${t(L, 'home.why.eyebrow')}</p><h2>${s.why.title}</h2></div>
  <div class="grid g3" style="margin-top:28px">${s.why.items.map((it, i) => html`<div class="card lift feature reveal" data-delay="${i % 4}"><span class="icon-tile">${icon(it.icon)}</span><h3>${it.title}</h3><p>${it.text}</p></div>`)}</div>
</div></section>

<section class="section" id="harga" style="background:linear-gradient(180deg,var(--paper-2),transparent)"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${t(L, 'home.price.eyebrow')}</p><h2>${t(L, 'home.price.title')}</h2><p class="lead">${t(L, 'home.price.lead')}</p></div>
  <div style="margin-top:28px">${priceCards(o.pricing, L)}</div>
  <p class="center" style="margin-top:18px"><a class="btn btn-ghost" href="/harga">${t(L, 'home.price.cta')} ${icon('panah')}</a></p>
</div></section>

<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${s.steps.title}</p><h2>${t(L, 'home.start.title')}</h2></div>
  <div class="steps" style="margin-top:28px">${s.steps.items.map((st, i) => html`<div class="step reveal" data-delay="${i}"><h3>${st.title}</h3><p style="margin:0;color:var(--ink-2)">${st.text}</p></div>`)}</div>
</div></section>

<section class="section" style="background:var(--paper-2)"><div class="wrap-narrow">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${t(L, 'home.faq.eyebrow')}</p><h2>${t(L, 'home.faq.title')}</h2></div>
  <div class="faq reveal" style="margin-top:24px">${s.faq.map((f) => html`<details><summary>${f.q}</summary><div>${f.a}</div></details>`)}</div>
</div></section>

<section class="section"><div class="wrap"><div class="cta-band reveal"><div><h2>${t(L, 'home.cta.title')}</h2><p>${t(L, 'home.cta.text')}</p><div class="row" style="margin-top:18px"><a class="btn btn-gold btn-lg" href="/coba">${t(L, 'home.cta.try')}</a><a class="btn btn-white btn-lg" href="/daftar">${t(L, 'home.cta.account')}</a></div></div>${raw(figure('baca', { cls: 'fig' }))}</div></div></section>`;
}

export function coursePage(o: { site: SiteContent; pricing: Pricing; course: Course; mood: Mood; lang: Lang }): Raw {
  const c = o.course, m = COURSE_META[c], copy = COURSE_COPY[c], p = o.pricing, L = o.lang, cur = CUR_FOR[L];
  const u = unitPrices(p.tiers.umum, cur);
  const name = m.names[L], first = m.levels[0]!.name, last = m.levels[m.levels.length - 1]!.name;
  const lessons = LESSONS.filter((l) => l.course === c).length, sets = SETS.filter((s) => s.course === c);
  return html`
<section class="hero ${isDark(o.mood) ? '' : 'light'}" data-hero>
  <div class="scene">${raw(scene(c, o.mood, { id: 'hero' }))}</div>
  ${moodBar(L, o.mood)}
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <p class="eyebrow">${t(L, 'course.eyebrow', { name, native: m.native })}</p>
      <h1>${tri(L, copy.h1)}</h1>
      <p class="lead">${tri(L, copy.lead)}</p>
      <div class="hero-actions"><a class="btn btn-gold btn-lg" href="/belajar/${FREE_LESSON[c]}">${icon('main')} ${t(L, 'course.tryFree', { level: first })}</a><a class="btn btn-white btn-lg" href="/harga">${money(u.one, cur)}${t(L, 'common.yr')}</a></div>
      <div class="hero-note"><span>${icon('cek')} ${t(L, 'course.levels', { n: m.levels.length })}</span><span>${icon('cek')} ${t(L, 'common.lessons', { n: lessons })}</span><span>${icon('cek')} ${t(L, 'common.packs', { n: sets.length })} · ${t(L, 'common.questions', { n: sets.reduce((n, s) => n + s.questions.length, 0) })}</span><span>${icon('cek')} ${t(L, 'course.audio', { locale: m.locale })}</span></div>
    </div>
    <div class="hero-figure" data-figure="${POSE_FOR[c]}">${raw(figure(POSE_FOR[c], { mood: o.mood }))}</div>
  </div>
</section>

<section class="section" id="jenjang"><div class="wrap">
  <div class="reveal"><p class="eyebrow">${t(L, 'course.levels.eyebrow')}</p><h2>${t(L, 'course.levels.title', { a: first, b: last })}</h2><p class="lead">${t(L, 'course.levels.lead')}</p></div>
  <div class="ladder reveal" style="margin-top:22px">${m.levels.map((l, i) => html`<a href="/${m.slug}/${l.id}" class="${i === 0 ? 'free' : ''}">${i > 0 ? icon('gembok', 'lock') : ''}<b>${l.name}</b><span>${tri(L, l.sub)}</span><small class="muted">${tri(L, l.hours)}</small></a>`)}</div>
</div></section>

<section class="section" style="background:var(--paper-2)"><div class="wrap">
  <div class="grid g2" style="align-items:start">
    <div class="reveal"><p class="eyebrow">${t(L, 'course.who.eyebrow')}</p><h2>${t(L, 'course.who.title', { name })}</h2><p class="lead">${tri(L, copy.who)}</p><p class="notice">${t(L, 'course.exams')} <strong>${copy.exams}</strong></p>${L === 'id' ? '' : html`<p class="notice" style="margin-top:12px">${t(L, 'content.idNotice')}</p>`}</div>
    <div class="grid" style="gap:14px">${copy.highlights.map((hgl, i) => html`<div class="card lift feature reveal" data-delay="${i}"><span class="icon-tile">${icon(hgl.icon)}</span><h3>${tri(L, hgl.title)}</h3><p>${tri(L, hgl.text)}</p></div>`)}</div>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${t(L, 'course.price.eyebrow')}</p><h2>${t(L, 'course.price.title', { name, v: money(u.one, cur) })}</h2><p class="lead">${t(L, 'course.price.lead', { v: money(u.three, cur) })}</p></div>
  <div style="margin-top:28px">${priceCards(p, L)}</div>
</div></section>

<section class="section"><div class="wrap"><div class="cta-band reveal"><div><h2>${t(L, 'course.cta.title', { level: first })}</h2><p>${t(L, 'course.cta.text')}</p><div class="row" style="margin-top:18px"><a class="btn btn-gold btn-lg" href="/belajar/${FREE_LESSON[c]}">${t(L, 'course.cta.btn')}</a></div></div>${raw(figure('baca', { cls: 'fig' }))}</div></div></section>`;
}

export function cobaPage(o: { lang: Lang }): Raw {
  const L = o.lang;
  return html`<section class="section"><div class="wrap">
  <div class="center reveal"><p class="eyebrow" style="justify-content:center">${t(L, 'coba.eyebrow')}</p><h1 style="font-size:var(--fs-6)">${t(L, 'coba.title')}</h1><p class="lead">${t(L, 'coba.lead')}</p>${L === 'id' ? '' : html`<p class="notice" style="max-width:720px;margin:14px auto 0">${t(L, 'content.idNotice')}</p>`}</div>
  <div class="grid g3" style="margin-top:28px">${COURSES.map((c, i) => { const m = COURSE_META[c]; return html`<a class="card lift reveal" data-delay="${i}" href="/belajar/${FREE_LESSON[c]}" style="text-decoration:none;color:inherit;overflow:hidden;padding:0"><div style="aspect-ratio:16/9;position:relative">${raw(scene(c, autoMood(c), { id: `coba-${c}`, seed: 21 + i }))}</div><div style="padding:20px"><h3>${flagPill(c)} ${t(L, 'coba.card', { level: m.levels[0]!.name })}</h3><p class="muted" style="margin:0">${m.names[L]} · ${tri(L, m.levels[0]!.sub)}</p><p style="margin:12px 0 0"><span class="btn btn-gold btn-sm">${t(L, 'common.start')} ${icon('panah')}</span></p></div></a>`; })}</div>
</div></section>`;
}

export function notFoundPage(L: Lang = 'id'): Raw {
  return html`<section class="section"><div class="wrap-narrow center"><p class="eyebrow" style="justify-content:center">404</p><h1 style="font-size:var(--fs-6)">${t(L, 'nf.title')}</h1><p class="lead">${t(L, 'nf.lead')}</p><div class="row" style="justify-content:center;margin-top:18px"><a class="btn btn-gold" href="/">${t(L, 'crumb.home')}</a>${COURSES.map((c) => html`<a class="btn btn-ghost" href="/${COURSE_META[c].slug}">${COURSE_META[c].names[L]}</a>`)}</div></div></section>`;
}
