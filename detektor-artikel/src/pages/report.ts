/** Laporan: satu markup untuk layar (interaktif) dan cetak A4 (2 halaman + lampiran). */
import { html, raw, type Raw } from '../lib/html.ts';
import { qrSvg } from '../lib/qr.ts';
import { tr, fmtNum, fmtScore, fmtDate, LABELS, REASONS, CLASS_NAMES, GENRES, LEVELS, MODE_INFO, type Lang } from '../lib/i18n.ts';
import type { ReportDetail, ReportSummary } from '../engine/cascade.ts';
import { getRubric, bi, CATEGORY } from '../engine/rubrics.ts';
import { compBar, ring, labelPill, BRAND, TAGLINE, WATERMARK } from './ui.ts';
import { LOGO_DATA_URI } from './logo-data.ts';
import { PURPOSE_INFO, pt } from '../lib/purpose.ts';
import type { Rate, ModePages } from '../engine/pricing.ts';
import { publicModelName } from '../engine/pricing.ts';

const reason = (L: Lang, code: string) => (REASONS[code] ? (L === 'en' ? REASONS[code]!.en : REASONS[code]!.id) : code);
const pct = (p: number | null) => (p === null ? '—' : `${Math.round(p * 100)}%`);
const confName = (L: Lang, lvl: string) =>
  lvl === 'high' ? tr(L, 'Tinggi', 'High') : lvl === 'medium' ? tr(L, 'Sedang', 'Medium') : tr(L, 'Rendah', 'Low');
const tierName: Record<string, string> = { haiku: 'Essential', sonnet: 'Advanced', opus: 'Expert', fable: 'Elite' };
const ERR_TYPE: Record<string, { id: string; en: string }> = {
  spelling: { id: 'Ejaan', en: 'Spelling' },
  punctuation: { id: 'Tanda baca', en: 'Punctuation' },
  grammar: { id: 'Tata bahasa', en: 'Grammar' },
  word_choice: { id: 'Pilihan kata', en: 'Word choice' },
  format: { id: 'Format', en: 'Format' },
};

export interface ReportView {
  L: Lang;
  s: ReportSummary;
  d: ReportDetail | null;
  verifyUrl: string;
  sample?: boolean;
  letterhead?: string;
  checker?: string;
}

function verdictTone(key: string): string {
  return key === 'ai' ? 'ai' : key === 'partly' ? 'mix' : key === 'human' ? 'hum' : 'unk';
}

function summarySentence(L: Lang, s: ReportSummary): string {
  const top = [...s.paragraphs].sort((a, b) => b.p - a.p)[0];
  const lbl = L === 'en' ? LABELS[s.label].en : LABELS[s.label].id;
  if (s.label === 'short') return tr(L, 'Teks terlalu pendek untuk keputusan; angka hanya gambaran awal.', 'The text is too short for a decision; the numbers are only an early indication.');
  if (top && top.p >= 0.5 && s.label !== 'ai') {
    return tr(L, `${lbl} — paragraf ${top.i + 1} paling bernada AI (${Math.round(top.p * 100)}%) dan layak dicek.`, `${lbl} — paragraph ${top.i + 1} reads most AI-like (${Math.round(top.p * 100)}%) and is worth checking.`);
  }
  return lbl;
}

export function reportPages(v: ReportView): Raw {
  const { L, s, d } = v;
  const rubric = getRubric(s.rubric?.id);
  const genre = GENRES.find((g) => g.key === s.genre);
  const level = LEVELS.find((g) => g.key === s.level);
  const tone = verdictTone(s.label);
  const pur = PURPOSE_INFO[s.purpose ?? 'umum'];
  const sign = html`<div class="sign"><div>${pt(L, pur.sign[0])}</div><div>${pt(L, pur.sign[1])}</div></div>`;
  const header = html`<div class="phead">
    <div class="pbrand">${v.letterhead ? html`<span class="lh">${v.letterhead}</span>` : ''}<img class="plogo" src="${LOGO_DATA_URI}" width="58" height="58" alt=""><div><b>${BRAND}</b><small>${pt(L, pur.docTitle)} · ${TAGLINE}</small></div></div>
    <a class="pqr" href="${v.verifyUrl}" title="${tr(L, 'Pindai untuk verifikasi', 'Scan to verify')}">${raw(qrSvg(v.verifyUrl))}<small>${s.verifyCode}</small></a>
  </div>${s.free ? html`<div class="free-mark" aria-label="${tr(L, 'Cek Gratis', 'Free Check')}"><img src="${WATERMARK.badge}" width="18" height="18" alt="">${tr(L, 'CEK GRATIS · Essential, per paragraf', 'FREE CHECK · Essential, per paragraph')}${s.free.partialOf ? ` · ${tr(L, `sebagian: ${s.free.pages} dari ${s.free.partialOf} halaman`, `partial: ${s.free.pages} of ${s.free.partialOf} pages`)}` : ''}</div>` : ''}`;
  const foot = (n: number, of: number) => html`<div class="pfoot"><span>${s.id} · ${tr(L, 'sidik teks', 'text fingerprint')} ${s.hash.slice(0, 8)}…${s.hash.slice(-4)}</span><span>${tr(L, 'Verifikasi', 'Verify')}: ${v.verifyUrl.replace(/^https?:\/\//, '')}</span><span>${tr(L, `Hal. ${n}/${of}`, `Page ${n}/${of}`)}</span></div>`;
  const pages = rubric && s.rubric ? 2 : 1;
  // Tanda air logo domain di setiap halaman laporan Cek Gratis (layar: ubin miring di bawah teks; cetak: satu logo
  // besar per lembar kertas lewat .wm-print yang position: fixed). docs/MASTER-BLUEPRINT.md §20.7.
  const wm = s.free ? html`<div class="wm" aria-hidden="true"></div>` : '';

  const excerptPar = [...s.paragraphs].sort((a, b) => b.p - a.p)[0];
  const excerpt = d && excerptPar
    ? d.sentences.filter((x) => x.par === excerptPar.i).map((x) => (x.cls === 'ai' ? html`<mark class="s-ai">${x.text}</mark> ` : x.cls === 'mix' ? html`<mark class="s-mix">${x.text}</mark> ` : html`${x.text} `))
    : null;

  const page1 = html`<article class="paper" aria-label="${tr(L, 'Laporan halaman 1', 'Report page 1')}">${wm}
  ${header}
  <dl class="pmeta">
    <dt>${tr(L, 'No. laporan', 'Report no.')}</dt><dd>${s.id}</dd><dt>${tr(L, 'Tanggal', 'Date')}</dt><dd>${fmtDate(L, s.createdAt)}${L === 'en' ? html` <small class="muted">(${new Date(s.createdAt).toISOString().slice(0, 16).replace('T', ' ')} UTC)</small>` : ''}</dd>
    ${s.org ? html`<dt>${tr(L, 'Organisasi', 'Organisation')}</dt><dd class="wide" data-report-org>${s.org}</dd>` : ''}
    <dt>${pt(L, pur.writer)}</dt><dd>${s.author || '—'}</dd><dt>${tr(L, 'Keperluan', 'Purpose')}</dt><dd>${pt(L, pur.name)}</dd><dt>${tr(L, 'Jenis', 'Genre')}</dt><dd>${genre ? (L === 'en' ? genre.en : genre.id) : s.genre} · ${level ? (L === 'en' ? level.en : level.id) : ''}</dd>
    <dt>${tr(L, 'Judul', 'Title')}</dt><dd class="wide">${s.title || '—'}</dd><dt>${tr(L, 'Bahasa', 'Language')}</dt><dd>${s.lang === 'id' ? 'Indonesia' : s.lang === 'en' ? 'English' : tr(L, 'Campuran', 'Mixed')}</dd>
    <dt>${tr(L, 'Jumlah kata', 'Word count')}</dt><dd>${fmtNum(L, s.words)} (${fmtNum(L, s.excludedWords)} ${tr(L, 'dikecualikan', 'excluded')})</dd><dt>${tr(L, 'Rubrik', 'Rubric')}</dt><dd>${rubric ? bi(L, rubric.name) : tr(L, 'Tanpa rubrik', 'No rubric')}</dd>
    ${v.checker ? html`<dt>${tr(L, 'Pemeriksa', 'Checked by')}</dt><dd>${v.checker}</dd>` : ''}<dt>${tr(L, 'Mesin', 'Engine')}</dt><dd>${MODE_INFO[s.mode] ? (L === 'en' ? MODE_INFO[s.mode]!.en : MODE_INFO[s.mode]!.id) : s.mode}</dd>
  </dl>
  <div class="verdict v-${tone}">${tone === 'hum' ? '✔' : tone === 'ai' ? '⚠' : '◐'} ${summarySentence(L, s)}</div>
  <div class="ptiles">
    ${ring(s.comp.ai, 'AI', 'ai')}${ring(s.comp.mix, tr(L, 'Campuran / dibantu AI', 'Mixed / AI-assisted'), 'mix')}${ring(s.comp.hum, tr(L, 'Manusia', 'Human'), 'hum')}
    ${s.rubric ? html`<figure class="ring tone-brand score"><div class="score-v"><b>${fmtScore(L, s.rubric.total)}</b><small>/100</small></div><span>${tr(L, 'Nilai rubrik', 'Rubric score')} · ${bi(L, CATEGORY[s.rubric.category as keyof typeof CATEGORY])}</span></figure>` : ''}
  </div>
  ${compBar(s.comp, true)}
  <p class="pfacts">${tr(L, 'Peluang naskah ditulis AI', 'Chance the text is AI-written')} <b>${Math.round(s.docP * 100)}%</b> · ${tr(L, 'Keyakinan', 'Confidence')} <b>${confName(L, s.conf.level)} (± ${s.conf.pm}%)</b> · ${tr(L, 'Jalur model', 'Model path')} <b>${s.mode === 'sonnet' ? 'Advanced 100%' : s.mode === 'opus' ? 'Expert 100%' : s.mode === 'fable' ? 'Elite 100%' : `Essential 100%${s.path.tiers.includes('sonnet') ? ` → Advanced ${s.path.t2Pct}%` : ''}${s.path.tiers.includes('opus') ? ` → Expert ${s.path.t3Pct}%` : ''}`}</b> · ${tr(L, 'Rincian pemeriksa', 'Checkers')}: ${tr(L, 'gaya tulisan', 'writing style')} ${pct(s.signals.stylo)}, ${tr(L, 'uji tebak lanjutan', 'guess-the-next-line test')} ${pct(s.signals.regen)}, ${tr(L, 'AI per kalimat', 'AI per sentence')} ${pct(s.signals.haikuA)} / ${tr(L, 'per paragraf', 'per paragraph')} ${pct(s.signals.haikuB)}${s.signals.sonnet !== null ? `, Advanced ${pct(s.signals.sonnet)}` : ''}${s.signals.opus !== null ? `, Expert ${pct(s.signals.opus)}` : ''} · ${tr(L, 'Jejak salin-tempel', 'Paste traces')} ${s.signals.traces.length} · ${tr(L, 'Parafrase mesin', 'Machine paraphrase')} ${s.flags.paraphrasePct}%${s.similarity ? ` · ${tr(L, 'Kemiripan antarpeserta tertinggi', 'Highest cross-entry similarity')} ${s.similarity.max}%${s.similarity.withTitle ? ` (${s.similarity.withTitle})` : ''}` : ''} · ${tr(L, 'Upaya manipulasi', 'Manipulation attempt')}: <b>${s.flags.injection ? tr(L, 'ADA', 'YES') : tr(L, 'tidak ada', 'none')}</b></p>
  <h5>${tr(L, 'Rincian per paragraf', 'Per-paragraph detail')}</h5>
  <table class="ptable">
    <thead><tr><th>${tr(L, 'Par.', 'Par.')}</th><th class="r">${tr(L, 'Kata', 'Words')}</th><th class="r">${tr(L, 'Peluang AI', 'AI prob.')}</th><th>Label</th><th>${tr(L, 'Alasan utama', 'Main reasons')}</th></tr></thead>
    <tbody>${s.paragraphs.map((p) => html`<tr><td>P${p.i + 1}</td><td class="r">${fmtNum(L, p.words)}</td><td class="r"><span class="minibar"><i style="--w:${Math.round(p.p * 100)}%" class="t-${p.cls}"></i></span>${Math.round(p.p * 100)}%</td><td>${L === 'en' ? CLASS_NAMES[p.cls].en : CLASS_NAMES[p.cls].id}</td><td>${p.reasons.map((r) => reason(L, r)).join(', ') || '—'}</td></tr>`)}</tbody>
  </table>
  ${excerpt ? html`<h5>${tr(L, `Kutipan teks bertanda (P${excerptPar!.i + 1})`, `Marked text excerpt (P${excerptPar!.i + 1})`)}</h5><div class="excerpt">${excerpt}</div>` : s.purged ? html`<p class="muted">${tr(L, 'Teks naskah sudah dihapus sesuai masa simpan; angka tetap tersimpan.', 'The text was deleted per its retention period; the numbers remain.')}</p>` : ''}
  ${d?.styleNote ? html`<h5>${tr(L, 'Catatan gaya', 'Style note')}</h5><p class="pnote">${d.styleNote}</p>` : ''}
  ${pages === 1 ? sign : ''}
  ${foot(1, pages)}
</article>`;

  let page2: Raw | string = '';
  if (rubric && s.rubric) {
    const det = new Map((d?.rubric?.aspects ?? []).map((a) => [a.key, a]));
    page2 = html`<article class="paper" aria-label="${tr(L, 'Laporan halaman 2', 'Report page 2')}">${wm}
  <h5 class="first">${tr(L, 'Penilaian rubrik', 'Rubric grading')} — ${bi(L, rubric.name)}</h5>
  <table class="ptable">
    <thead><tr><th>No.</th><th>${tr(L, 'Aspek', 'Aspect')}</th><th class="r">${tr(L, 'Bobot', 'Weight')}</th><th class="c">${tr(L, 'Skor', 'Score')}</th><th class="c">${tr(L, 'Perhitungan', 'Calculation')}</th><th class="r">${tr(L, 'Nilai', 'Value')}</th></tr></thead>
    <tbody>${rubric.aspects.map((a, k) => {
      const r = s.rubric!.aspects.find((x) => x.key === a.key);
      return html`<tr><td>${k + 1}</td><td>${bi(L, a.name)}</td><td class="r">${a.weight}</td><td class="c"><span class="lvl l${r?.level ?? 0}">${r?.level ?? '—'}</span></td><td class="c">${r ? `${r.level}/4 × ${a.weight}` : '—'}</td><td class="r">${r ? fmtScore(L, r.value) : '—'}</td></tr>`;
    })}</tbody>
    <tfoot><tr><th></th><th>Total</th><th class="r">100</th><th></th><th></th><th class="r">${fmtScore(L, s.rubric.total)} — ${bi(L, CATEGORY[s.rubric.category as keyof typeof CATEGORY])}</th></tr></tfoot>
  </table>
  ${d?.rubric ? html`<h5>${tr(L, 'Alasan & bukti per aspek', 'Reasons & evidence per aspect')}</h5>
  <table class="ptable">
    <thead><tr><th>${tr(L, 'Aspek', 'Aspect')}</th><th>${tr(L, 'Alasan', 'Reason')}</th><th>${tr(L, 'Bukti dari naskah', 'Evidence from the text')}</th><th>${tr(L, 'Saran', 'Tip')}</th></tr></thead>
    <tbody>${rubric.aspects.map((a, k) => {
      const x = det.get(a.key);
      return html`<tr><td>${k + 1} ${bi(L, a.name)} (${x?.level ?? '—'})<br><small class="muted">${x ? tierName[x.by] ?? x.by : ''}</small></td><td>${x?.reason ?? '—'}</td><td>${x?.evidence ? html`“${x.evidence}”${x.evidenceOk ? '' : html` <small class="warn">(${tr(L, 'kutipan tidak ditemukan persis', 'quote not found verbatim')})</small>`}` : '—'}</td><td>${x?.tip ?? '—'}</td></tr>`;
    })}</tbody>
  </table>
  <h5>${tr(L, 'Kesalahan bahasa', 'Language errors')} — ${fmtNum(L, s.rubric.langErrors)} (${fmtScore(L, s.rubric.per1k)} ${tr(L, 'per 1.000 kata', 'per 1,000 words')})</h5>
  ${d.rubric.errors.length ? html`<table class="ptable"><thead><tr><th>#</th><th>${tr(L, 'Tertulis', 'Written')}</th><th>${tr(L, 'Seharusnya', 'Should be')}</th><th>${tr(L, 'Jenis', 'Type')}</th></tr></thead><tbody>${d.rubric.errors.slice(0, 25).map((e, k) => html`<tr><td>${k + 1}</td><td>${e.wrong}</td><td>${e.right}</td><td>${ERR_TYPE[e.type] ? (L === 'en' ? ERR_TYPE[e.type]!.en : ERR_TYPE[e.type]!.id) : e.type}</td></tr>`)}</tbody></table>${d.rubric.errors.length > 25 ? html`<p class="muted">+ ${d.rubric.errors.length - 25} ${tr(L, 'lainnya di lampiran', 'more in the appendix')}</p>` : ''}` : html`<p class="muted">${tr(L, 'Tidak ditemukan kesalahan.', 'No errors found.')}</p>`}` : ''}
  <h5>${tr(L, 'Metodologi & batasan', 'Methodology & limits')}</h5>
  <p class="pnote">${tr(L, 'Naskah diperiksa dengan lima cara: pola gaya tulisan, sisa salin-tempel dari chatbot, uji apakah AI bisa menebak kalimat berikutnya, pemeriksaan AI bertingkat (Essential → Advanced → Expert), dan kemiripan dengan naskah lain. Persentase adalah perkiraan statistik.', 'The text is checked in five ways: writing-style patterns, chatbot paste traces, a test of whether AI can guess the next sentence, tiered AI checks (Essential → Advanced → Expert), and similarity with other texts. Percentages are statistical estimates.')} ${tr(L, 'Versi pemeriksa', 'Checker version')} ${s.engine.version}.</p>
  ${sign}
  ${foot(2, 2)}
</article>`;
  }

  const appendix = d
    ? html`<article class="paper appendix" aria-label="${tr(L, 'Lampiran teks bertanda', 'Marked-text appendix')}">${wm}
  <h5 class="first">${tr(L, 'Lampiran — teks lengkap bertanda per kalimat', 'Appendix — full text marked per sentence')}</h5>
  <div class="legend"><span><i class="lg-ai"></i>AI ≥ 80%</span><span><i class="lg-mix"></i>${tr(L, 'Campuran 20–80%', 'Mixed 20–80%')}</span><span><i class="lg-hum"></i>${tr(L, 'Manusia ≤ 20%', 'Human ≤ 20%')}</span><span><i class="lg-exc"></i>${tr(L, 'Dikecualikan', 'Excluded')}</span></div>
  <div class="fulltext">${d.paragraphs.map((p) => {
    const ss = d.sentences.filter((x) => x.par === p.i);
    const cls = p.kind === 'heading' ? 'ft-h' : p.kind === 'references' ? 'ft-ref' : '';
    return html`<p class="${cls}"><span class="pno">P${p.i + 1}</span>${ss.map((x) => {
      const t = x.excluded ? 'exc' : x.cls ?? 'hum';
      const tipText = x.excluded ? tr(L, 'Dikecualikan dari persen', 'Excluded from percentages') : `${tr(L, 'Peluang AI', 'AI probability')} ${pct(x.p)}${x.r.length ? ` · ${x.r.map((r) => reason(L, r)).join(', ')}` : ''}`;
      return html`<span class="snt s-${t}" tabindex="0" data-tip="${tipText}"><sup>${x.i + 1}</sup>${x.text}</span> `;
    })}</p>`;
  })}</div>
  ${foot(pages + 1, pages + 1)}
</article>`
    : '';
  const wmPrint = s.free ? html`<div class="wm-print" aria-hidden="true"><img src="${WATERMARK.full}" width="900" height="209" alt=""></div>` : '';
  return html`<div class="report${s.free ? ' is-free' : ''}">${wmPrint}${page1}${page2}${appendix}</div>`;
}

export function labelChip(L: Lang, s: ReportSummary): Raw {
  return labelPill(L, s.label);
}

const TIER_NAME: Record<string, { id: string; en: string }> = {
  't1-a': { id: 'Memeriksa per kalimat', en: 'Checking per sentence' },
  't1-b': { id: 'Memeriksa per paragraf', en: 'Checking per paragraph' },
  't1-regen': { id: 'Uji tebak lanjutan', en: 'Guess-the-next-line test' },
  rubric: { id: 'Menilai dengan rubrik', en: 'Grading with the rubric' },
  t2: { id: 'Memeriksa ulang kalimat yang ragu', en: 'Re-checking doubtful sentences' },
  t3: { id: 'Pemeriksaan terakhir', en: 'Final check' },
  rubric2: { id: 'Memeriksa ulang nilai', en: 'Double-checking the score' },
  rubric3: { id: 'Penentu nilai akhir', en: 'Deciding the final score' },
  'reuse-own': { id: 'Hasil tersimpan Anda (pernah diperiksa)', en: 'Your stored result (checked before)' },
};

const modelName = (m: string) => publicModelName(m);

/** Tabel tarif terbuka: token platform per 1.000 token AI. */
export function rateTable(L: Lang, rates: Record<string, Rate>): Raw {
  return html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Model</th><th class="n">${tr(L, 'per 1.000 token masuk', 'per 1,000 input tokens')}</th><th class="n">${tr(L, 'per 1.000 token keluar*', 'per 1,000 output tokens*')}</th><th class="n">${tr(L, 'per 1.000 token cache', 'per 1,000 cached tokens')}</th></tr></thead>
  <tbody>${Object.entries(rates).map(([m, r]) => html`<tr><td>${modelName(m)}</td><td class="n">${fmtScore(L, r.in)}</td><td class="n">${fmtScore(L, r.out)}</td><td class="n">${fmtScore(L, r.cache)}</td></tr>`)}</tbody></table></div>
  <p class="muted small">* ${tr(L, 'Token keluar termasuk token “berpikir” model (adaptive thinking) yang ditagih penyedia AI sebagai keluaran.', 'Output tokens include the model’s “thinking” tokens (adaptive thinking), which the AI provider bills as output.')}</p>`;
}

/** Rincian pemakaian token satu laporan — agar klien bisa menghitung ulang sendiri. */
export function usagePanel(L: Lang, s: ReportSummary): Raw {
  const u = s.usage;
  if (!u) return html``;
  const sum = (k: 'in' | 'out' | 'cache') => u.lines.reduce((a, l) => a + l[k], 0);
  return html`<section class="card usage noprint reveal">
  <div class="row-between"><h3>${tr(L, 'Rincian pemakaian token', 'Token usage breakdown')}</h3><span class="pill p-b">${fmtNum(L, s.tokens)} token</span></div>
  <ol class="steps-mini">
    ${u.reserved > 0
      ? raw(`<li>${tr(L, `Sebelum AI bekerja, <b>${fmtNum(L, u.reserved)}</b> token dipesan dari saldo.`, `Before the AI started, <b>${fmtNum(L, u.reserved)}</b> tokens were reserved from the balance.`)}</li>`)
      : raw(`<li>${tr(L, 'Pemeriksaan ini tidak memotong saldo (akun admin, uji mesin, atau bagian dari sesi lomba yang diselesaikan sekaligus).', 'This check did not deduct from a balance (admin account, engine test, or part of a contest session settled at once).')}</li>`)}
    ${raw(`<li>${tr(L, `Setiap panggilan AI di bawah dihitung dari token masuk (teks yang dibaca model) dan token keluar (jawaban + berpikir) memakai tarif terbuka. Total tepat: <b>${fmtScore(L, u.exact)}</b> → dibulatkan ke atas <b>${fmtNum(L, Math.ceil(u.exact))}</b>.`, `Each AI call below is counted from input tokens (text the model reads) and output tokens (answer + thinking) using the public rates. Exact total: <b>${fmtScore(L, u.exact)}</b> → rounded up to <b>${fmtNum(L, Math.ceil(u.exact))}</b>.`)}</li>`)}
    ${u.lines.some((l) => l.tier === 'reuse-own') ? raw(`<li data-reuse-line>${tr(L, `Baris <b>Hasil tersimpan Anda</b> = bagian naskah yang pernah Anda periksa dengan mesin yang sama: tidak ada panggilan AI baru, ditagih <b>${s.reuseOwn?.pct ?? 50}%</b> dari tarif. Token masuk/keluar di baris itu adalah pemakaian AI saat bagian itu pertama kali diperiksa.`, `Rows <b>Your stored result</b> = parts of the text you checked before with the same engine: no new AI call, charged <b>${s.reuseOwn?.pct ?? 50}%</b> of the rate. Their input/output tokens are the AI usage from when that part was first checked.`)}</li>`) : ''}
    ${u.reserved > 0 ? raw(`<li>${tr(L, `Ditagih <b>${fmtNum(L, u.charged)}</b> token (tidak pernah melebihi pesanan); <b>${fmtNum(L, u.refunded)}</b> token kembali ke saldo.`, `Charged <b>${fmtNum(L, u.charged)}</b> tokens (never more than the reservation); <b>${fmtNum(L, u.refunded)}</b> tokens returned to the balance.`)}</li>`) : ''}
    ${u.billedBefore ? raw(`<li data-billed-before>${tr(L, `Pemeriksaan ini sempat terhenti lalu dilanjutkan: <b>${fmtNum(L, u.billedBefore)}</b> token sudah ditagih untuk kerja sebelum terhenti (termasuk dalam total di atas). Tahap yang sudah dibayar tidak diulang.`, `This check stopped and was resumed: <b>${fmtNum(L, u.billedBefore)}</b> tokens were charged for the work before it stopped (included in the total above). Paid stages were not repeated.`)}</li>`) : ''}
  </ol>
  <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Tahap', 'Stage')}</th><th>Model</th><th class="n">${tr(L, 'Token masuk', 'Input tokens')}</th><th class="n">${tr(L, 'Token keluar', 'Output tokens')}</th><th class="n">Cache</th><th class="n">${tr(L, 'Token platform', 'Platform tokens')}</th></tr></thead>
  <tbody>${u.lines.map((l) => html`<tr><td>${TIER_NAME[l.tier] ? (L === 'en' ? TIER_NAME[l.tier]!.en : TIER_NAME[l.tier]!.id) : l.tier}</td><td>${modelName(l.model)}</td><td class="n">${fmtNum(L, l.in)}</td><td class="n">${fmtNum(L, l.out)}</td><td class="n">${fmtNum(L, l.cache)}</td><td class="n">${fmtScore(L, l.tokens)}</td></tr>`)}</tbody>
  <tfoot><tr><th colspan="2">Total</th><th class="n">${fmtNum(L, sum('in'))}</th><th class="n">${fmtNum(L, sum('out'))}</th><th class="n">${fmtNum(L, sum('cache'))}</th><th class="n">${fmtScore(L, u.exact)}</th></tr></tfoot></table></div>
  <details><summary>${tr(L, 'Tarif yang dipakai untuk laporan ini', 'Rates used for this report')}</summary>${rateTable(L, u.rates)}</details>
</section>`;
}

/** Prediksi halaman per mesin untuk saldo/paket tertentu — selalu ditandai sebagai perkiraan. */
export function modePagesTable(L: Lang, preds: ModePages[], wordsPerPage: number): Raw {
  return html`<div class="tbl-wrap"><table class="tbl mode-pages"><thead><tr><th>${tr(L, 'Mesin', 'Engine')}</th><th class="n">${tr(L, 'Token per halaman', 'Tokens per page')}</th><th class="n">${tr(L, 'Perkiraan halaman', 'Estimated pages')}</th></tr></thead>
  <tbody>${preds.map((p) => html`<tr class="${p.mode === 'auto' ? 'rec' : ''}"><td><b>${L === 'en' ? MODE_INFO[p.mode]!.en : MODE_INFO[p.mode]!.id}</b>${p.mode === 'auto' ? html` <span class="pill p-b">${tr(L, 'disarankan', 'recommended')}</span>` : ''}</td><td class="n">${fmtNum(L, p.perPage.low)}–${fmtNum(L, p.perPage.high)}</td><td class="n"><b>${fmtNum(L, p.pages.low)}–${fmtNum(L, p.pages.high)}</b></td></tr>`)}</tbody></table></div>
  <p class="muted small">${tr(L, `Perkiraan, bukan janji: ±${wordsPerPage} kata per halaman dengan rubrik. Pemakaian nyata tergantung model AI yang terpakai, panjang naskah, dan tingkat kesulitannya — rinciannya selalu tampil di setiap laporan.`, `An estimate, not a promise: ±${wordsPerPage} words per page with a rubric. Real usage depends on the AI models used, text length and difficulty — the breakdown always appears in every report.`)}</p>`;
}
