/** Portal member: dasbor, periksa, proses, riwayat kerja, sesi lomba, token, afiliasi, pengaturan. */
import { Hono } from 'hono';
import { html, raw, jsonScript, type Raw } from '../lib/html.ts';
import { tr, fmtNum, fmtDate, fmtScore, GENRES, LEVELS, LABELS, MODE_INFO, type Lang, type LabelKey } from '../lib/i18n.ts';
import { page, pageHead, guide, flash, labelPill, compBar, empty, stat, tip } from '../pages/ui.ts';
import { reportPages, usagePanel, rateTable, modePagesTable } from '../pages/report.ts';
import { rateCard, predictByMode, packagePrice, tokenPriceIdr } from '../engine/pricing.ts';
import { portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import { RUBRICS, bi, getRubric } from '../engine/rubrics.ts';
import { getEngine, getBilling, measuredCostPer1k, type BillingSettings, type EngineSettings } from '../data/settings.ts';
import { balanceOf, ledger } from '../data/wallet.ts';
import { predictPages } from '../engine/pricing.ts';
import { createCheck, sanitizeInput, CheckInputError, batchKey, settleBatch, type Batch } from './checks.ts';
import { checkKey, reportKey, textKey, type CheckDoc, type ReportDetail, type ReportSummary } from '../engine/cascade.ts';
import { newId, unseal, verifyPassword, hashPassword, hmac } from '../lib/crypto.ts';
import { invTs } from '../lib/store.ts';
import { updateUser, isAdmin } from '../data/users.ts';
import { jaccardEstimate } from '../engine/similarity.ts';
import { audit } from '../data/audit.ts';
import { registerMemberAffiliate } from './affiliate.ts';

export const app = new Hono<HonoEnv>();

app.use('/app/*', async (c, next) => {
  if (!c.get('user')) return c.redirect(`/masuk?next=${encodeURIComponent(c.req.path)}`);
  await next();
});
app.use('/app', async (c, next) => {
  if (!c.get('user')) return c.redirect('/masuk');
  await next();
});

function shell(c: Ctx, title: string, body: Raw, active: string): string {
  return page({ L: portalLang(c), title, body, user: c.get('user'), area: 'app', active });
}

const q = (c: Ctx, k: string) => c.req.query(k) ?? null;

/* ── dasbor ─────────────────────────────────────────────────────────── */

export async function pagesLine(L: Lang, balance: number, b: BillingSettings, eng: EngineSettings, store: Ctx['var']['store']): Promise<Raw> {
  const pr = predictPages(balance, b, eng, await measuredCostPer1k(store));
  return html`<p class="predict">≈ <b>${fmtNum(L, pr.pages.low)}–${fmtNum(L, pr.pages.high)}</b> ${tr(L, 'halaman', 'pages')} <small class="muted">(${tr(L, `±${b.wordsPerPage} kata/halaman · ${pr.perPage.low}–${pr.perPage.high} token per halaman`, `±${b.wordsPerPage} words/page · ${pr.perPage.low}–${pr.perPage.high} tokens per page`)})</small> ${tip(tr(L, 'Perkiraan, bukan janji: pemakaian nyata tergantung model AI yang terpakai (Haiku saja, atau naik ke Sonnet/Opus), panjang naskah, dan rubrik.', 'An estimate, not a promise: real usage depends on which AI models are used (Haiku only, or escalation to Sonnet/Opus), text length and rubric.'))}</p>`;
}

app.get('/app', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const store = c.get('store');
  const eng = await getEngine(store);
  const billing = await getBilling(store);
  const bal = await balanceOf(store, user.id);
  const { items } = await store.list<{ title: string; ai: number; mix: number; hum: number; label: LabelKey; total: number | null; at: number; tokens?: number }>(`i/user-reports/${user.id}/`, { limit: 6 });
  const { items: batches } = await store.list(`i/user-batches/${user.id}/`, { limit: 1 });
  const { items: orders } = await store.list(`i/user-orders/${user.id}/`, { limit: 1 });
  const steps = [
    { done: bal > 0 || orders.length > 0 || items.length > 0, text: tr(L, '<b>Beli token</b> — pilih paket, bayar, token masuk ke dompet', '<b>Buy tokens</b> — pick a package, pay, tokens arrive in your wallet'), href: '/app/token' },
    { done: items.length > 0, text: tr(L, '<b>Periksa naskah pertama</b> — tempel teks atau unggah .docx', '<b>Check your first text</b> — paste it or upload a .docx'), href: '/app/periksa' },
    { done: items.length > 0, text: tr(L, '<b>Baca & unduh laporannya</b> — PDF, HTML, atau JSON bertanda tangan', '<b>Read & download the report</b> — PDF, HTML or signed JSON'), href: '/app/laporan' },
    { done: batches.length > 0, text: tr(L, '<b>Coba sesi lomba/kelas</b> — banyak naskah, satu rekap', '<b>Try a contest/class session</b> — many texts, one recap'), href: '/app/sesi' },
    { done: Boolean(user.totp), text: tr(L, '<b>Aktifkan 2FA</b> untuk keamanan akun', '<b>Turn on 2FA</b> for account security'), href: '/2fa/pasang' },
  ];
  const doneN = steps.filter((x) => x.done).length;
  const body = html`
  ${pageHead(tr(L, `Halo, ${user.name}`, `Hi, ${user.name}`), tr(L, 'Apa yang ingin diperiksa hari ini?', 'What would you like to check today?'), html`<a class="btn btn-ghost" href="/app/token">◔ ${tr(L, 'Beli token', 'Buy tokens')}</a><a class="btn btn-primary" href="/app/periksa">＋ ${tr(L, 'Periksa baru', 'New check')}</a>`)}
  ${q(c, 'welcome') ? html`<div class="flash ok reveal">🎉 ${tr(L, 'Akun siap. Beli token untuk mulai memeriksa naskah.', 'Your account is ready. Buy tokens to start checking texts.')}</div>` : ''}
  <div class="grid g3">
    <div class="stat stat-hero reveal"><span class="stat-k">${tr(L, 'Saldo token', 'Token balance')}</span><b class="stat-v" data-count="${bal}">${fmtNum(L, bal)}</b>${await pagesLine(L, bal, billing, eng, store)}</div>
    ${stat(tr(L, 'Laporan tersimpan', 'Saved reports'), String(items.length >= 6 ? '6+' : items.length), tr(L, 'riwayat kerja Anda', 'your work history'))}
    ${stat(tr(L, 'Harga token', 'Token price'), `Rp ${fmtNum(L, Math.ceil(tokenPriceIdr(billing, eng)))}`, tr(L, 'per token (tanpa diskon paket)', 'per token (before package discount)'))}
  </div>
  <section class="card reveal"><h3>${tr(L, 'Saldo Anda cukup untuk…', 'Your balance covers…')}</h3>${modePagesTable(L, predictByMode(bal, billing, eng), billing.wordsPerPage)}</section>
  <section class="card onboarding reveal">
    <div class="row-between"><h3>${tr(L, 'Mulai dari sini', 'Start here')}</h3><span class="progress-text">${doneN}/${steps.length}</span></div>
    <div class="progress"><i style="--w:${(doneN / steps.length) * 100}%"></i></div>
    <ol class="todo">${steps.map((x) => html`<li class="${x.done ? 'done' : ''}"><a href="${x.href}"><span class="tick">${x.done ? '✓' : ''}</span><span>${raw(x.text)}</span></a></li>`)}</ol>
  </section>
  <section class="reveal">
    <div class="row-between"><h2>${tr(L, 'Riwayat kerja terbaru', 'Latest work history')}</h2><a href="/app/laporan">${tr(L, 'Semua', 'All')} →</a></div>
    ${items.length
      ? html`<div class="report-list">${items.map((it) => html`<a class="report-row" href="/app/laporan/${it.id}"><div><b>${it.meta.title}</b><small class="muted">${fmtDate(L, it.meta.at)}${it.meta.tokens ? ` · ${it.meta.tokens} token` : ''}</small></div>${compBar(it.meta)}<div class="report-row-end">${labelPill(L, it.meta.label)}${it.meta.total !== null && it.meta.total !== undefined ? html`<span class="score-chip">${fmtScore(L, it.meta.total)}</span>` : ''}</div></a>`)}</div>`
      : empty('📝', tr(L, 'Belum ada laporan', 'No reports yet'), tr(L, 'Setiap pemeriksaan tersimpan di sini sebagai riwayat kerja — bisa dibuka, dicetak, dan diunduh kapan saja.', 'Every check is saved here as work history — open, print and download it any time.'), html`<a class="btn btn-primary" href="/app/periksa">${tr(L, 'Periksa sekarang', 'Check now')}</a>`)}
  </section>`;
  return c.html(shell(c, tr(L, 'Dasbor', 'Dashboard'), body, 'dash'));
});

/* ── periksa baru ───────────────────────────────────────────────────── */

function checkForm(c: Ctx, err?: string | null, v: Record<string, string> = {}): string {
  const L = portalLang(c);
  const body = html`
  ${pageHead(tr(L, 'Periksa naskah baru', 'Check a new text'), tr(L, 'Tiga langkah: masukkan teks, isi keterangan, pilih cara menilai.', 'Three steps: add the text, describe it, choose how to grade.'))}
  ${guide(L, 'check', tr(L, 'Tips agar hasil paling akurat', 'Tips for the most accurate result'), [
    tr(L, 'Masukkan <b>teks utuh</b> (≥ 300 kata ideal). Di bawah 150 kata tidak ada label.', 'Use the <b>whole text</b> (≥ 300 words is ideal). Under 150 words there is no label.'),
    tr(L, 'Pilih <b>jenjang penulis</b> — tulisan pelajar yang sederhana tidak dianggap AI.', 'Pick the <b>writer level</b> — simple student writing is not treated as AI.'),
    tr(L, '<b>Daftar pustaka dan kutipan panjang</b> otomatis dikecualikan dari persen.', '<b>Bibliographies and long quotes</b> are excluded from percentages automatically.'),
  ])}
  ${flash(L, null, err)}
  <form method="post" action="/app/periksa" class="check-form" data-check-form data-lang="${L}">
    <section class="card step reveal"><div class="step-n">1</div><div class="step-body">
      <h3>${tr(L, 'Teks naskah', 'The text')}</h3>
      <div class="dropzone" data-drop><input type="file" accept=".txt,.md,.docx" data-file hidden id="fileInput"><label for="fileInput" class="drop-label"><span class="drop-ic">⬆</span><b>${tr(L, 'Unggah .docx / .txt', 'Upload .docx / .txt')}</b><small class="muted">${tr(L, 'atau seret berkas ke sini — teks diambil di peramban, berkasnya tidak dikirim', 'or drag a file here — text is extracted in your browser, the file is not sent')}</small></label></div>
      <label class="field"><span>${tr(L, 'Atau tempel teks', 'Or paste the text')}</span><textarea name="text" rows="12" required data-wordcount="wc" data-estimate placeholder="${tr(L, 'Tempel naskah di sini…', 'Paste the text here…')}">${v.text ?? ''}</textarea></label>
      <div class="estimate" data-estimate-box aria-live="polite"><div><small class="muted">${tr(L, 'Panjang', 'Length')}</small><b><span id="wc">0</span> ${tr(L, 'kata', 'words')} · <span id="pg">0</span> ${tr(L, 'hal.', 'pages')}</b></div><div><small class="muted">${tr(L, 'Biaya nyata biasanya', 'Real cost usually')}</small><b><span id="estLo">—</span>–<span id="estTy">—</span> token</b></div><div><small class="muted">${tr(L, 'Dipesan dulu (sisa kembali)', 'Reserved first (rest returns)')}</small><b><span id="estRes">—</span> token</b></div><div><small class="muted">${tr(L, 'Saldo', 'Balance')}</small><b>${fmtNum(L, v.__balance ? Number(v.__balance) : 0)} token</b></div></div>
      <p class="muted small">${tr(L, 'Perkiraan dari server; pemakaian nyata tergantung model AI yang terpakai — sebagian besar naskah cukup diperiksa Haiku (paling hemat).', 'Estimates come from the server; real usage depends on the AI models used — most texts only need Haiku (the most economical).')}</p>
    </div></section>
    <section class="card step reveal"><div class="step-n">2</div><div class="step-body">
      <h3>${tr(L, 'Keterangan', 'Details')}</h3>
      <div class="grid g2">
        <label class="field"><span>${tr(L, 'Judul', 'Title')}</span><input name="title" value="${v.title ?? ''}" maxlength="200" data-title></label>
        <label class="field"><span>${tr(L, 'Nama penulis / peserta (opsional)', 'Author / entrant name (optional)')}</span><input name="author" value="${v.author ?? ''}" maxlength="120"></label>
        <label class="field"><span>${tr(L, 'Jenis tulisan', 'Genre')} ${tip(tr(L, 'Memilih garis dasar gaya dan rubrik yang disarankan.', 'Selects the style baseline and the suggested rubric.'))}</span><select name="genre" data-genre>${GENRES.map((g) => html`<option value="${g.key}" ${v.genre === g.key ? 'selected' : ''}>${L === 'en' ? g.en : g.id}</option>`)}</select></label>
        <label class="field"><span>${tr(L, 'Jenjang penulis', 'Writer level')} ${tip(tr(L, 'Agar bahasa sederhana tidak dihukum sebagai AI.', 'So that simple language is not penalised as AI.'))}</span><select name="level">${LEVELS.map((g) => html`<option value="${g.key}" ${v.level === g.key ? 'selected' : ''}>${L === 'en' ? g.en : g.id}</option>`)}</select></label>
      </div>
    </div></section>
    <section class="card step reveal"><div class="step-n">3</div><div class="step-body">
      <h3>${tr(L, 'Cara menilai', 'How to grade')}</h3>
      <div class="grid g2">
        <label class="field"><span>${tr(L, 'Rubrik penilaian', 'Grading rubric')}</span><select name="rubric" data-rubric><option value="">${tr(L, 'Tanpa rubrik — deteksi AI saja', 'No rubric — AI detection only')}</option>${RUBRICS.map((r) => html`<option value="${r.id}" ${(v.rubric ?? 'lomba-esai') === r.id ? 'selected' : ''}>${bi(L, r.name)}</option>`)}</select></label>
        <label class="field"><span>${tr(L, 'Bahasa laporan', 'Report language')}</span><select name="reportLang"><option value="id" ${L === 'id' ? 'selected' : ''}>Bahasa Indonesia</option><option value="en" ${L === 'en' ? 'selected' : ''}>English</option></select></label>
      </div>
      <fieldset class="modes"><legend>${tr(L, 'Mesin AI', 'AI engine')} ${tip(tr(L, 'AUTO memilih sendiri: Haiku dulu, lalu Sonnet/Opus hanya untuk kalimat yang ragu. Atau pilih satu model.', 'AUTO chooses for you: Haiku first, then Sonnet/Opus only for doubtful sentences. Or pick one model.'))}</legend>
        ${(['auto', 'haiku', 'sonnet', 'opus', 'forensic'] as const).map((m) => html`<label class="mode-card ${m === 'auto' ? 'rec' : ''}"><input type="radio" name="mode" value="${m}" ${(v.mode ?? 'auto') === m ? 'checked' : ''}><span><b>${L === 'en' ? MODE_INFO[m]!.en : MODE_INFO[m]!.id}</b><small>${L === 'en' ? MODE_INFO[m]!.den : MODE_INFO[m]!.did}</small><em class="mode-est" data-mode-est="${m}">—</em></span></label>`)}
      </fieldset>
      <label class="check"><input type="checkbox" name="agree" required> <span>${tr(L, 'Saya berhak memeriksa naskah ini (milik sendiri, sebagai guru/juri/editor, atau dengan izin penulis).', 'I am entitled to check this text (my own, as a teacher/judge/editor, or with the author’s consent).')}</span></label>
      <button class="btn btn-primary btn-lg" type="submit" data-busy="${tr(L, 'Menyiapkan…', 'Preparing…')}">${tr(L, 'Periksa sekarang', 'Check now')} →</button>
    </div></section>
  </form>`;
  return shell(c, tr(L, 'Periksa baru', 'New check'), body, 'check');
}

app.get('/app/periksa', async (c) => c.html(checkForm(c, null, { __balance: String(await balanceOf(c.get('store'), c.get('user')!.id)) })));

app.post('/app/periksa', async (c) => {
  const L = portalLang(c);
  const f = (await c.req.parseBody()) as Record<string, string>;
  const withBal = { ...f, __balance: String(await balanceOf(c.get('store'), c.get('user')!.id)) };
  if (!f.agree) return c.html(checkForm(c, tr(L, 'Centang pernyataan bahwa Anda berhak memeriksa naskah ini.', 'Tick the statement that you are entitled to check this text.'), withBal), 400);
  try {
    const doc = await createCheck(c.env, c.get('store'), c.get('user')!, sanitizeInput(f, L), L);
    return c.redirect(`/app/proses/${doc.id}`);
  } catch (err) {
    if (err instanceof CheckInputError) return c.html(checkForm(c, err.message, withBal), err.status as 400);
    throw err;
  }
});

/* ── proses (animasi tahap) ─────────────────────────────────────────── */

app.get('/app/proses/:id', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const doc = await c.get('store').get<CheckDoc>(checkKey(c.req.param('id')));
  if (!doc || (doc.uid !== user.id && !isAdmin(user))) return c.notFound();
  if (doc.stage === 'done' && doc.reportId) return c.redirect(`/app/laporan/${doc.reportId}`);
  const stages: [string, string, string][] = [
    ['prep', tr(L, 'Membaca naskah & mengukur gaya tulisan', 'Reading the text & measuring writing style'), tr(L, 'tanpa memakai AI', 'without using AI')],
    ['t1', 'Claude Haiku · Ultra', tr(L, 'memeriksa setiap kalimat & paragraf', 'checks every sentence & paragraph')],
    ['t2', 'Claude Sonnet', tr(L, 'hanya kalimat yang ragu', 'doubtful sentences only')],
    ['t3', 'Claude Opus', tr(L, 'pemeriksa terakhir bila perlu', 'final checker if needed')],
    ['fuse', tr(L, 'Menggabungkan semua hasil', 'Combining all results'), tr(L, 'menghitung persen & kesimpulan', 'computing percentages & the conclusion')],
    ['rubric2', tr(L, 'Memeriksa ulang nilai', 'Double-checking the score'), tr(L, 'Sonnet menilai ulang bila ragu', 'Sonnet re-grades when unsure')],
  ];
  const body = html`
  ${pageHead(tr(L, 'Sedang menelaah naskah', 'Examining the text'), doc.title)}
  <section class="card process reveal" data-process="${doc.id}">
    <div class="process-visual" aria-hidden="true"><div class="doc-sheet"><i></i><i></i><i></i><i></i><i></i><i></i><div class="beam"></div></div></div>
    <ol class="stages">${stages.map(([k, t, d]) => html`<li data-stage="${k}"><span class="st-dot"><i></i></span><div><b>${t}</b><small>${d}</small><em class="st-note"></em></div></li>`)}</ol>
    <p class="process-msg muted" data-msg>${tr(L, 'Halaman ini boleh ditutup — pemeriksaan tetap berlanjut dan hasilnya muncul di Laporan.', 'You may close this page — the check continues and the result appears under Reports.')}</p>
    <div class="flash err" data-err hidden></div>
  </section>
  ${jsonScript('i18n-process', {
    skipped: tr(L, 'tidak perlu — hemat', 'not needed — saved'),
    sentences: tr(L, 'kalimat', 'sentences'),
    failed: tr(L, 'Pemeriksaan gagal', 'The check failed'),
    retry: tr(L, 'API sibuk, mencoba lagi…', 'API busy, retrying…'),
    refunded: tr(L, 'Token yang dipesan sudah dikembalikan — pemeriksaan gagal tidak ditagih.', 'The reserved tokens were returned — failed checks are not charged.'),
    charged: tr(L, 'ditagih', 'charged'),
  })}`;
  return c.html(shell(c, tr(L, 'Memproses', 'Processing'), body, 'check'));
});

/* ── laporan ─────────────────────────────────────────────────────────── */

interface HistMeta {
  title: string;
  author: string;
  ai: number;
  mix: number;
  hum: number;
  label: LabelKey;
  total: number | null;
  at: number;
  lang: string;
  tokens?: number;
  batch?: string | null;
}

/** Riwayat kerja: pencarian & filter di server atas indeks (maks. 1.000 entri terbaru). */
async function history(c: Ctx, max = 1000) {
  const user = c.get('user')!;
  const qText = (c.req.query('q') ?? '').trim().toLowerCase();
  const fLabel = c.req.query('label') ?? '';
  const out: { id: string; meta: HistMeta }[] = [];
  let cursor: string | undefined;
  let scanned = 0;
  do {
    const { items, cursor: next } = await c.get('store').list<HistMeta>(`i/user-reports/${user.id}/`, { limit: 200, cursor });
    for (const it of items) {
      scanned += 1;
      if (qText && !`${it.meta.title} ${it.meta.author ?? ''}`.toLowerCase().includes(qText)) continue;
      if (fLabel && it.meta.label !== fLabel) continue;
      out.push({ id: it.id, meta: it.meta });
    }
    cursor = next;
  } while (cursor && scanned < max);
  return out;
}

app.get('/app/laporan', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const all = await history(c);
  const page_ = Math.max(1, Number(c.req.query('p') ?? 1) || 1);
  const items = all.slice((page_ - 1) * 25, page_ * 25);
  const qv = c.req.query('q') ?? '';
  const lv = c.req.query('label') ?? '';
  const { items: pending } = await c.get('store').list<{ title: string; at: number }>(`i/user-checks/${user.id}/`, { limit: 8 });
  const qs = (p: number) => `?q=${encodeURIComponent(qv)}&label=${encodeURIComponent(lv)}&p=${p}`;
  const body = html`
  ${pageHead(tr(L, 'Riwayat kerja', 'Work history'), tr(L, 'Semua laporan Anda tersimpan di sini — buka, cetak, unduh, beri catatan.', 'All your reports are kept here — open, print, download, add notes.'), html`<a class="btn btn-ghost" href="/app/laporan/ekspor.csv${qs(1)}">⬇ CSV</a><a class="btn btn-primary" href="/app/periksa">＋ ${tr(L, 'Periksa baru', 'New check')}</a>`)}
  <form class="card filters reveal" method="get">
    <label class="field grow"><span>${tr(L, 'Cari judul / penulis', 'Search title / author')}</span><input name="q" value="${qv}" placeholder="${tr(L, 'mis. literasi', 'e.g. literacy')}"></label>
    <label class="field"><span>Label</span><select name="label"><option value="">${tr(L, 'Semua', 'All')}</option>${(Object.keys(LABELS) as LabelKey[]).map((k) => html`<option value="${k}" ${lv === k ? 'selected' : ''}>${L === 'en' ? LABELS[k].en : LABELS[k].id}</option>`)}</select></label>
    <button class="btn btn-primary" type="submit">${tr(L, 'Terapkan', 'Apply')}</button>
  </form>
  ${items.length
    ? html`<div class="card reveal"><div class="tbl-wrap"><table class="tbl hover">
      <thead><tr><th>${tr(L, 'Judul', 'Title')}</th><th>${tr(L, 'Komposisi', 'Composition')}</th><th>Label</th><th class="n">${tr(L, 'Nilai', 'Score')}</th><th class="n">Token</th><th>${tr(L, 'Tanggal', 'Date')}</th></tr></thead>
      <tbody>${items.map((it) => html`<tr data-href="/app/laporan/${it.id}"><td><a href="/app/laporan/${it.id}"><b>${it.meta.title}</b></a>${it.meta.author ? html`<br><small class="muted">${it.meta.author}</small>` : ''}</td><td class="w-bar">${compBar(it.meta)}<small class="muted">AI ${it.meta.ai}% · ${tr(L, 'Campuran', 'Mixed')} ${it.meta.mix}%</small></td><td>${labelPill(L, it.meta.label)}</td><td class="n">${it.meta.total !== null && it.meta.total !== undefined ? fmtScore(L, it.meta.total) : '—'}</td><td class="n">${it.meta.tokens ?? '—'}</td><td><small>${fmtDate(L, it.meta.at)}</small></td></tr>`)}</tbody>
    </table></div>
    <div class="pager"><span class="muted">${fmtNum(L, all.length)} ${tr(L, 'laporan', 'reports')}</span>${page_ > 1 ? html`<a class="btn btn-ghost btn-sm" href="/app/laporan${qs(page_ - 1)}">← ${tr(L, 'Sebelumnya', 'Previous')}</a>` : ''}${page_ * 25 < all.length ? html`<a class="btn btn-ghost btn-sm" href="/app/laporan${qs(page_ + 1)}">${tr(L, 'Berikutnya', 'Next')} →</a>` : ''}</div></div>`
    : empty('📄', qv || lv ? tr(L, 'Tidak ada yang cocok', 'Nothing matches') : tr(L, 'Belum ada laporan', 'No reports yet'), qv || lv ? tr(L, 'Ubah kata kunci atau filter.', 'Change the keyword or filter.') : tr(L, 'Laporan muncul di sini setelah pemeriksaan selesai.', 'Reports appear here once a check finishes.'), html`<a class="btn btn-primary" href="/app/periksa">${tr(L, 'Periksa naskah', 'Check a text')}</a>`)}
  ${pending.length ? html`<details class="card reveal"><summary>${tr(L, 'Pemeriksaan terakhir (termasuk yang masih berjalan)', 'Latest checks (including running ones)')}</summary><ul class="clean">${pending.map((p) => html`<li><a href="/app/proses/${p.id}">${p.meta.title}</a> <small class="muted">${fmtDate(L, p.meta.at)}</small></li>`)}</ul></details>` : ''}`;
  return c.html(shell(c, tr(L, 'Riwayat kerja', 'Work history'), body, 'reports'));
});

app.get('/app/laporan/ekspor.csv', async (c) => {
  const L = portalLang(c);
  const all = await history(c, 5000);
  const cell = (v: unknown) => `"${String(v ?? '').replace(/^([=+\-@\t\r])/, "'$1").replace(/"/g, '""')}"`; // cegah injeksi rumus spreadsheet
  const head = [tr(L, 'Tanggal', 'Date'), tr(L, 'Judul', 'Title'), tr(L, 'Penulis', 'Author'), 'AI %', tr(L, 'Campuran %', 'Mixed %'), tr(L, 'Manusia %', 'Human %'), 'Label', tr(L, 'Nilai', 'Score'), 'Token', tr(L, 'Laporan', 'Report')];
  const rows = all.map((it) => [new Date(it.meta.at).toISOString(), it.meta.title, it.meta.author, it.meta.ai, it.meta.mix, it.meta.hum, L === 'en' ? LABELS[it.meta.label].en : LABELS[it.meta.label].id, it.meta.total ?? '', it.meta.tokens ?? '', `${new URL(c.req.url).origin}/app/laporan/${it.id}`].map(cell).join(','));
  return new Response('\ufeff' + [head.map(cell).join(','), ...rows].join('\r\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="riwayat-ai-content-analyzer.csv"' } });
});

async function loadReport(c: Ctx, id: string): Promise<{ s: ReportSummary; d: ReportDetail | null } | null> {
  const user = c.get('user')!;
  const s = await c.get('store').get<ReportSummary>(reportKey(id));
  if (!s || (s.uid !== user.id && !isAdmin(user))) return null;
  let d: ReportDetail | null = null;
  if (s.enc && c.env.MASTER_KEY) d = await unseal<ReportDetail>(c.env.MASTER_KEY, s.enc);
  return { s, d };
}

const origin = (c: Ctx) => new URL(c.req.url).origin;

app.get('/app/laporan/:id', async (c) => {
  const L = portalLang(c);
  const r = await loadReport(c, c.req.param('id'));
  if (!r) return c.notFound();
  const { s, d } = r;
  const note = await c.get('store').get<{ text: string; at: number }>(`c/report-notes/${s.id}.json`);
  const body = html`
  ${pageHead(s.title, `${fmtDate(L, s.createdAt)} · ${fmtNum(L, s.analyzedWords)} ${tr(L, 'kata dianalisis', 'words analysed')} · ${s.tokens} token`, html`<button class="btn btn-primary" type="button" data-print>🖨 ${tr(L, 'Cetak / simpan PDF', 'Print / save PDF')}</button>`)}
  <div class="download-bar noprint reveal">
    <span class="muted">${tr(L, 'Unduh & simpan:', 'Download & keep:')}</span>
    <a class="chip-btn" href="/app/laporan/${s.id}/unduh.html" download>⬇ HTML ${tip(tr(L, 'Satu berkas mandiri yang indah, bisa dibuka tanpa internet.', 'One beautiful self-contained file that opens offline.'))}</a>
    <a class="chip-btn" href="/app/laporan/${s.id}/unduh.json" download>⬇ ${tr(L, 'Data (JSON)', 'Data (JSON)')} ${tip(tr(L, 'Data lengkap untuk arsip, dengan segel digital — bila isinya diubah sedikit saja, segelnya tidak cocok lagi.', 'Complete data for your archive, with a digital seal — change anything and the seal no longer matches.'))}</a>
    <a class="chip-btn" href="/app/laporan/${s.id}/cetak" target="_blank">🖨 ${tr(L, 'Halaman cetak', 'Print page')}</a>
    <a class="chip-btn" href="/v/${s.verifyCode}" target="_blank">▣ ${tr(L, 'Verifikasi', 'Verify')} ${s.verifyCode}</a>
  </div>
  ${s.samePrior > 0 ? html`<div class="flash info reveal">ⓘ ${tr(L, `Teks yang sama persis sudah ${s.samePrior}× diperiksa akun ini sebelumnya. Semua hasil tetap tersimpan di riwayat.`, `The exact same text was checked ${s.samePrior}× before by this account. Every result stays in the history.`)}</div>` : ''}
  ${s.revoked ? html`<div class="flash err reveal">⚠ ${tr(L, 'Laporan ini dicabut admin.', 'This report was revoked by the admin.')}</div>` : ''}
  ${guide(L, 'report', tr(L, 'Cara membaca laporan ini', 'How to read this report'), [
    tr(L, '<b>Tiga cincin</b> = porsi kata AI, campuran, dan manusia (selalu 100%).', '<b>Three rings</b> = share of AI, mixed and human words (always 100%).'),
    tr(L, '<b>Label</b> hanya “AI” atau “manusia” bila sistem yakin; selain itu “Tidak meyakinkan”.', 'The <b>label</b> is only “AI” or “human” when the system is confident; otherwise “Inconclusive”.'),
    tr(L, 'Di <b>lampiran</b>, arahkan kursor/ketuk kalimat untuk melihat peluang & alasannya.', 'In the <b>appendix</b>, hover/tap a sentence to see its probability & reasons.'),
    tr(L, 'Merasa keliru? <b>Ajukan tinjauan</b> — Haiku, Sonnet, dan Opus menilai ulang seluruh teks tanpa melihat hasil ini (ditagih token seperti pemeriksaan forensik).', 'Think it is wrong? <b>Request a review</b> — Haiku, Sonnet and Opus re-score the whole text blind to this result (charged like a forensic check).'),
  ])}
  <div class="grid g2 noprint">
    <form method="post" action="/app/laporan/${s.id}/catatan" class="card form reveal"><h3>${tr(L, 'Catatan kerja', 'Work note')}</h3><textarea name="note" rows="3" maxlength="1000" placeholder="${tr(L, 'mis. sudah dikonfirmasi ke penulis, draf diterima…', 'e.g. confirmed with the author, drafts received…')}">${note?.text ?? ''}</textarea><button class="btn btn-ghost btn-sm" type="submit">${tr(L, 'Simpan catatan', 'Save note')}</button></form>
    <div class="card reveal"><h3>${tr(L, 'Tindakan', 'Actions')}</h3><div class="btn-row"><button class="btn btn-ghost" type="button" data-review="${s.id}" data-confirm="${tr(L, 'Jalankan tinjauan forensik penuh? Token dipesan dulu dan sisanya dikembalikan.', 'Run a full forensic review? Tokens are reserved first and the rest is returned.')}">⚖ ${tr(L, 'Ajukan tinjauan', 'Request review')}</button>${s.batchId ? html`<a class="btn btn-ghost" href="/app/sesi/${s.batchId}">← ${tr(L, 'Kembali ke sesi', 'Back to session')}</a>` : ''}</div></div>
  </div>
  ${usagePanel(L, s)}
  ${reportPages({ L: s.reportLang ?? L, s, d, verifyUrl: `${origin(c)}/v/${s.verifyCode}` })}`;
  return c.html(shell(c, s.title, body, 'reports'));
});

app.post('/app/laporan/:id/catatan', async (c) => {
  const r = await loadReport(c, c.req.param('id'));
  if (!r) return c.notFound();
  const text = String((await c.req.parseBody()).note ?? '').slice(0, 1000);
  await c.get('store').put(`c/report-notes/${r.s.id}.json`, { text, at: Date.now() });
  return c.redirect(`/app/laporan/${r.s.id}`);
});

/** Unduhan HTML mandiri: CSS dibenamkan, bisa dibuka tanpa internet, tetap indah & bisa dicetak. */
app.get('/app/laporan/:id/unduh.html', async (c) => {
  const L = portalLang(c);
  const r = await loadReport(c, c.req.param('id'));
  if (!r) return c.notFound();
  const css = await (await c.env.ASSETS.fetch(new URL('/assets/app.css', c.req.url))).text();
  const inner = html`${reportPages({ L: r.s.reportLang ?? L, s: r.s, d: r.d, verifyUrl: `${origin(c)}/v/${r.s.verifyCode}` })}${usagePanel(L, r.s)}`;
  const doc = `<!doctype html><html lang="${r.s.reportLang ?? L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${r.s.title.replace(/</g, '&lt;')} — AI Content Analyzer</title><style>${css}</style></head><body class="area-print standalone"><main class="page-print">${inner}</main></body></html>`;
  const name = r.s.title.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 60) || r.s.id;
  return new Response(doc, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-disposition': `attachment; filename="ai-content-analyzer-${name}.html"` } });
});

/** Unduhan JSON bertanda tangan HMAC-SHA256 (anti-pemalsuan): tanda tangan mencakup seluruh isi. */
app.get('/app/laporan/:id/unduh.json', async (c) => {
  const r = await loadReport(c, c.req.param('id'));
  if (!r) return c.notFound();
  const { enc: _enc, cost: _cost, uid: _uid, ...pub } = r.s;
  const payload = JSON.stringify({ report: pub, detail: r.d });
  const signature = await hmac(`${c.env.SESSION_SECRET ?? ''}:report-signature`, payload);
  const body = `{"format":"aca-report-v1","verify":"${origin(c)}/v/${r.s.verifyCode}","signature":"hmac-sha256:${signature}","data":${payload}}`;
  return new Response(body, { headers: { 'content-type': 'application/json; charset=utf-8', 'content-disposition': `attachment; filename="ai-content-analyzer-${r.s.id}.json"` } });
});

app.get('/app/laporan/:id/cetak', async (c) => {
  const L = portalLang(c);
  const r = await loadReport(c, c.req.param('id'));
  if (!r) return c.notFound();
  const body = html`<div class="print-bar noprint"><button class="btn btn-primary" type="button" data-print>🖨 ${tr(L, 'Cetak / simpan PDF', 'Print / save PDF')}</button><a class="btn btn-ghost" href="/app/laporan/${r.s.id}">← ${tr(L, 'Kembali', 'Back')}</a></div>${reportPages({ L: r.s.reportLang ?? L, s: r.s, d: r.d, verifyUrl: `${origin(c)}/v/${r.s.verifyCode}` })}`;
  return c.html(page({ L, title: r.s.title, body, user: c.get('user'), area: 'print' }));
});

/* ── sesi lomba / kelas ─────────────────────────────────────────────── */

app.get('/app/sesi', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const { items } = await c.get('store').list<{ name: string; category: string; at: number }>(`i/user-batches/${user.id}/`, { limit: 50 });
  const body = html`
  ${pageHead(tr(L, 'Sesi lomba / kelas', 'Contest / class sessions'), tr(L, 'Periksa banyak naskah dengan satu rubrik, lalu cetak rekapnya.', 'Check many texts with one rubric, then print the recap.'))}
  ${guide(L, 'batch', tr(L, 'Alur sesi lomba', 'How a contest session works'), [
    tr(L, 'Buat sesi: nama lomba, kategori, rubrik (bawaan: form lomba menulis esai).', 'Create a session: contest name, category, rubric (default: essay-competition form).'),
    tr(L, 'Unggah semua naskah (.docx/.txt). Nama berkas <code>01_Nama_Judul.docx</code> otomatis jadi nama & judul.', 'Upload every entry (.docx/.txt). A file name like <code>01_Name_Title.docx</code> becomes name & title.'),
    tr(L, 'Jalankan — token disisihkan sekali untuk seluruh sesi; yang dipotong hanya pemakaian nyata, sisanya kembali.', 'Run it — tokens are set aside once for the whole session; only real usage is deducted and the rest returns.'),
    tr(L, 'Buka <b>Rekap</b> untuk tabel seperti form juri, peringkat, kemiripan antarpeserta, cetak & CSV.', 'Open the <b>Recap</b> for a table like the judges’ form, ranking, cross-entry similarity, print & CSV.'),
  ])}
  <form method="post" action="/app/sesi" class="card form-grid reveal">
    <h3>${tr(L, 'Sesi baru', 'New session')}</h3>
    <label class="field"><span>${tr(L, 'Nama lomba / kelas', 'Contest / class name')}</span><input name="name" required maxlength="120" placeholder="${tr(L, 'Lomba Menulis Esai 2026', 'Essay Contest 2026')}"></label>
    <label class="field"><span>${tr(L, 'Kategori', 'Category')}</span><input name="category" maxlength="80" placeholder="${tr(L, 'SMA / Umum', 'High school / Open')}"></label>
    <label class="field"><span>${tr(L, 'Rubrik', 'Rubric')}</span><select name="rubric">${RUBRICS.map((r) => html`<option value="${r.id}">${bi(L, r.name)}</option>`)}</select></label>
    <label class="field"><span>${tr(L, 'Kebijakan AI di peringkat', 'AI policy in ranking')}</span><select name="policy"><option value="exclude">${tr(L, 'Keluarkan bila “Kemungkinan besar AI” (panitia memutuskan)', 'Drop when “Likely AI” (committee decides)')}</option><option value="flag">${tr(L, 'Tandai saja', 'Flag only')}</option></select></label>
    <label class="field"><span>${tr(L, 'Bahasa laporan', 'Report language')}</span><select name="reportLang"><option value="id">Bahasa Indonesia</option><option value="en" ${L === 'en' ? 'selected' : ''}>English</option></select></label>
    <div class="form-end"><button class="btn btn-primary" type="submit">${tr(L, 'Buat sesi', 'Create session')}</button></div>
  </form>
  ${items.length ? html`<div class="grid g3">${items.map((b) => html`<a class="card session-card reveal" href="/app/sesi/${b.id}"><span class="feature-ic">🏆</span><b>${b.meta.name}</b><small class="muted">${b.meta.category || '—'} · ${fmtDate(L, b.meta.at, false)}</small></a>`)}</div>` : ''}`;
  return c.html(shell(c, tr(L, 'Sesi', 'Sessions'), body, 'batches'));
});

app.post('/app/sesi', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const f = (await c.req.parseBody()) as Record<string, string>;
  const id = newId('ses');
  const b: Batch = {
    id,
    uid: user.id,
    name: String(f.name ?? '').slice(0, 120) || tr(L, 'Sesi tanpa nama', 'Untitled session'),
    category: String(f.category ?? '').slice(0, 80),
    rubricId: getRubric(f.rubric) ? f.rubric! : 'lomba-esai',
    policy: f.policy === 'flag' ? 'flag' : 'exclude',
    reportLang: f.reportLang === 'en' ? 'en' : 'id',
    createdAt: Date.now(),
    items: 0,
  };
  const store = c.get('store');
  await store.put(batchKey(id), b);
  await store.createOnce(`i/user-batches/${user.id}/${invTs(b.createdAt)}~${id}`, {}, { name: b.name, category: b.category, at: b.createdAt });
  return c.redirect(`/app/sesi/${id}`);
});

interface RecapRow {
  n: number;
  checkId: string;
  title: string;
  author: string;
  stage: string;
  s: ReportSummary | null;
  sim: number;
  simWith: string;
  rank: string;
}

async function recap(c: Ctx, batch: Batch): Promise<RecapRow[]> {
  const store = c.get('store');
  const { items } = await store.list<{ title: string; author: string }>(`i/batch-items/${batch.id}/`, { limit: 1000 });
  const rows: RecapRow[] = [];
  const sigs = new Map<string, number[]>();
  for (const [k, it] of items.entries()) {
    const doc = await store.get<CheckDoc>(checkKey(it.id));
    const s = doc?.reportId ? await store.get<ReportSummary>(reportKey(doc.reportId)) : null;
    const fp = await store.get<{ sig: number[] }>(`c/fp/${batch.id}/${it.id}.json`);
    if (fp) sigs.set(it.id, fp.sig);
    rows.push({ n: k + 1, checkId: it.id, title: it.meta.title, author: it.meta.author, stage: doc?.stage ?? '?', s, sim: 0, simWith: '', rank: '' });
  }
  for (const r of rows) {
    const a = sigs.get(r.checkId);
    if (!a) continue;
    for (const o of rows) {
      if (o === r) continue;
      const b = sigs.get(o.checkId);
      if (!b) continue;
      const j = Math.round(jaccardEstimate(a, b) * 100);
      if (j > r.sim) {
        r.sim = j;
        r.simWith = o.author || o.title;
      }
    }
  }
  const eligible = rows.filter((r) => r.s?.rubric && !(batch.policy === 'exclude' && r.s.label === 'ai')).sort((x, y) => y.s!.rubric!.total - x.s!.rubric!.total);
  eligible.forEach((r, k) => {
    r.rank = String(k + 1) + (r.s!.label === 'partly' || r.s!.label === 'unsure' || r.sim >= 40 ? ' ⚑' : '');
  });
  for (const r of rows) if (!r.rank && r.s?.label === 'ai' && batch.policy === 'exclude') r.rank = '—';
  return rows;
}

function recapTable(L: Lang, batch: Batch, rows: RecapRow[]): Raw {
  const rubric = getRubric(batch.rubricId);
  return html`<div class="tbl-wrap"><table class="tbl recap">
  <thead><tr><th>No.</th><th>${tr(L, 'Nama Peserta', 'Entrant')}</th><th>${tr(L, 'Judul', 'Title')}</th>${rubric?.aspects.map((a) => html`<th class="n">${bi(L, a.name)} (${a.weight})</th>`)}<th class="n">Total</th><th class="n">AI</th><th>Label</th><th class="n">${tr(L, 'Mirip', 'Similar')}</th><th class="n">${tr(L, 'Peringkat', 'Rank')}</th></tr></thead>
  <tbody>${rows.map((r) => html`<tr>
    <td>${r.n}</td><td>${r.author || '—'}</td><td>${r.s ? html`<a href="/app/laporan/${r.s.id}">${r.title}</a>` : r.title}</td>
    ${rubric?.aspects.map((a) => {
      const x = r.s?.rubric?.aspects.find((y) => y.key === a.key);
      return html`<td class="n">${x ? fmtScore(L, x.value) : '—'}</td>`;
    })}
    <td class="n"><b>${r.s?.rubric ? fmtScore(L, r.s.rubric.total) : '—'}</b></td>
    <td class="n">${r.s ? `${r.s.comp.ai}%` : '—'}</td>
    <td>${r.s ? labelPill(L, r.s.label) : html`<span class="pill p-unk" data-stage-pill="${r.checkId}">${r.stage === 'failed' ? tr(L, 'gagal', 'failed') : tr(L, 'proses…', 'processing…')}</span>`}</td>
    <td class="n">${r.sim ? html`<span title="${r.simWith}">${r.sim}%</span>` : '—'}</td>
    <td class="n">${r.rank || '—'}</td>
  </tr>`)}</tbody></table></div>`;
}

app.get('/app/sesi/:id', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const store = c.get('store');
  const batch = await store.get<Batch>(batchKey(c.req.param('id')));
  if (!batch || (batch.uid !== user.id && !isAdmin(user))) return c.notFound();
  const rows = await recap(c, batch);
  const pending = rows.filter((r) => r.stage !== 'done' && r.stage !== 'failed').map((r) => r.checkId);
  const rubric = getRubric(batch.rubricId);
  const body = html`
  ${pageHead(batch.name, `${batch.category || '—'} · ${rubric ? bi(L, rubric.name) : ''} · ${fmtNum(L, batch.items)} ${tr(L, 'naskah', 'entries')}`, html`<a class="btn btn-ghost" href="/app/sesi/${batch.id}/rekap" target="_blank">🖨 ${tr(L, 'Cetak rekap', 'Print recap')}</a><a class="btn btn-ghost" href="/app/sesi/${batch.id}/rekap.csv">⬇ CSV</a>`)}
  <section class="card reveal" data-batch="${batch.id}" data-lang="${L}">
    <h3>${tr(L, 'Tambah naskah', 'Add entries')}</h3>
    <div class="dropzone" data-drop data-multi><input type="file" accept=".txt,.md,.docx" multiple data-files hidden id="filesInput"><label for="filesInput" class="drop-label"><span class="drop-ic">⬆</span><b>${tr(L, 'Pilih atau seret banyak berkas .docx / .txt', 'Choose or drag many .docx / .txt files')}</b><small class="muted">${tr(L, 'Contoh nama berkas: 01_Nadia Putri_Literasi Digital.docx', 'Example file name: 01_Nadia Putri_Digital Literacy.docx')}</small></label></div>
    <div class="queue" data-queue hidden><table class="tbl"><thead><tr><th>${tr(L, 'Peserta', 'Entrant')}</th><th>${tr(L, 'Judul', 'Title')}</th><th class="n">${tr(L, 'Kata', 'Words')}</th><th></th></tr></thead><tbody data-queue-body></tbody></table>
      <div class="row-between"><small class="muted"><b data-queue-total>0</b> ${tr(L, 'kata', 'words')} · ${tr(L, 'token dipesan saat dijalankan, sisanya kembali', 'tokens are reserved on run, the rest returns')}</small>
      <select data-batch-mode aria-label="${tr(L, 'Mesin AI', 'AI engine')}">${(['auto', 'haiku', 'sonnet', 'opus'] as const).map((m) => html`<option value="${m}">${L === 'en' ? MODE_INFO[m]!.en : MODE_INFO[m]!.id}</option>`)}</select>
      <label class="check"><input type="checkbox" data-agree> <span>${tr(L, 'Saya berhak memeriksa naskah-naskah ini.', 'I am entitled to check these texts.')}</span></label>
      <button class="btn btn-primary" type="button" data-run>${tr(L, 'Jalankan pemeriksaan', 'Run the checks')} →</button></div></div>
    <div class="flash err" data-batch-err hidden></div>
    <div class="batch-progress" data-batch-progress hidden><div class="progress"><i data-bp style="--w:0%"></i></div><small class="muted" data-bp-text></small></div>
  </section>
  <section class="card reveal">
    <div class="row-between"><h3>${tr(L, 'Tabel rekapitulasi penilaian peserta', 'Participant recap table')}</h3><small class="muted">${batch.policy === 'exclude' ? tr(L, 'Kebijakan: naskah “Kemungkinan besar AI” dikeluarkan dari peringkat (keputusan akhir panitia). ⚑ = perlu dicek juri.', 'Policy: “Likely AI” entries are dropped from the ranking (committee decides). ⚑ = judges should check.') : tr(L, 'Kebijakan: tandai saja. ⚑ = perlu dicek juri.', 'Policy: flag only. ⚑ = judges should check.')}</small></div>
    ${rows.length ? recapTable(L, batch, rows) : empty('🏆', tr(L, 'Belum ada naskah', 'No entries yet'), tr(L, 'Unggah naskah di atas untuk memulai.', 'Upload entries above to begin.'))}
  </section>
  ${jsonScript('batch-pending', pending)}
  ${jsonScript('i18n-batch', {
    running: tr(L, 'Memeriksa', 'Checking'),
    of: tr(L, 'dari', 'of'),
    done: tr(L, 'Selesai! Memuat rekap…', 'Done! Loading the recap…'),
    remove: tr(L, 'Hapus', 'Remove'),
    agree: tr(L, 'Centang pernyataan hak memeriksa dulu.', 'Tick the entitlement statement first.'),
  })}`;
  return c.html(shell(c, batch.name, body, 'batches'));
});

app.get('/app/sesi/:id/rekap', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const batch = await c.get('store').get<Batch>(batchKey(c.req.param('id')));
  if (!batch || (batch.uid !== user.id && !isAdmin(user))) return c.notFound();
  await settleBatch(c.env, c.get('store'), batch.id);
  const rows = await recap(c, batch);
  const body = html`<div class="print-bar noprint"><button class="btn btn-primary" type="button" data-print>🖨 ${tr(L, 'Cetak', 'Print')}</button></div>
  <article class="paper landscape"><h2 class="center">${tr(L, 'Tabel Rekapitulasi Penilaian Peserta', 'Participant Assessment Recap')} — ${batch.name}${batch.category ? ` ${tr(L, 'kategori', 'category')} ${batch.category}` : ''}</h2>
  ${recapTable(L, batch, rows)}
  <p class="pnote">${tr(L, 'Nilai aspek = skor/4 × bobot. Persen AI adalah perkiraan probabilistik, bukan vonis. ⚑ = perlu dicek juri (sebagian AI, tidak meyakinkan, atau kemiripan ≥ 40%).', 'Aspect value = score/4 × weight. AI percentages are probabilistic estimates, not verdicts. ⚑ = judges should check (partly AI, inconclusive, or similarity ≥ 40%).')} ${fmtDate(L, Date.now())}</p>
  <div class="sign"><div>${tr(L, 'Juri', 'Judge')}</div><div>${tr(L, 'Ketua Panitia', 'Committee Chair')}</div></div></article>`;
  return c.html(page({ L, title: batch.name, body, user, area: 'print' }));
});

app.get('/app/sesi/:id/rekap.csv', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const batch = await c.get('store').get<Batch>(batchKey(c.req.param('id')));
  if (!batch || (batch.uid !== user.id && !isAdmin(user))) return c.notFound();
  const rubric = getRubric(batch.rubricId);
  const rows = await recap(c, batch);
  const cell = (v: unknown) => `"${String(v ?? '').replace(/^([=+\-@\t\r])/, "'$1").replace(/"/g, '""')}"`; // cegah injeksi rumus spreadsheet
  const head = ['No', tr(L, 'Nama Peserta', 'Entrant'), tr(L, 'Judul', 'Title'), ...(rubric?.aspects.map((a) => `${bi(L, a.name)} (${a.weight})`) ?? []), 'Total', 'AI %', tr(L, 'Campuran %', 'Mixed %'), 'Label', tr(L, 'Kemiripan %', 'Similarity %'), tr(L, 'Peringkat', 'Rank'), tr(L, 'Kode verifikasi', 'Verification code')];
  const lines = rows.map((r) => [r.n, r.author, r.title, ...(rubric?.aspects.map((a) => r.s?.rubric?.aspects.find((x) => x.key === a.key)?.value ?? '') ?? []), r.s?.rubric?.total ?? '', r.s?.comp.ai ?? '', r.s?.comp.mix ?? '', r.s ? (L === 'en' ? LABELS[r.s.label].en : LABELS[r.s.label].id) : r.stage, r.sim, r.rank, r.s?.verifyCode ?? ''].map(cell).join(','));
  return new Response('﻿' + [head.map(cell).join(','), ...lines].join('\r\n'), { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="rekap-${batch.id}.csv"` } });
});

/* ── token & pesanan ───────────────────────────────────────────────── */

export interface Order {
  id: string;
  uid: string;
  email: string;
  pkg: string;
  tokens: number;
  priceIdr: number;
  priceUsd: number;
  status: 'pending' | 'credited' | 'cancelled';
  createdAt: number;
  creditedAt?: number;
  by?: string;
}

app.get('/app/token', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const store = c.get('store');
  const eng = await getEngine(store);
  const billing = await getBilling(store);
  const measured = await measuredCostPer1k(store);
  const bal = await balanceOf(store, user.id);
  const led = await ledger(store, user.id, 25);
  const { items: orders } = await store.list<{ pkg: string; status: string; at: number }>(`i/user-orders/${user.id}/`, { limit: 10 });
  const pick = c.req.query('paket');
  const body = html`
  ${pageHead(tr(L, 'Token', 'Tokens'), tr(L, 'Token berkurang sesuai pemakaian AI di setiap pemeriksaan. Gagal = tidak dipotong.', 'Tokens decrease according to AI usage in each check. Failed = not deducted.'))}
  <div class="grid g2">
    <div class="stat stat-hero reveal"><span class="stat-k">${tr(L, 'Saldo token', 'Token balance')}</span><b class="stat-v" data-count="${bal}">${fmtNum(L, bal)}</b>${await pagesLine(L, bal, billing, eng, store)}</div>
    <div class="card reveal"><h3>${tr(L, 'Bagaimana token dihitung', 'How tokens are counted')}</h3><ol class="steps-mini">
      <li>${raw(tr(L, 'Sebelum AI bekerja, sejumlah token <b>disisihkan</b> dari saldo.', 'Before the AI starts, some tokens are <b>set aside</b> from your balance.'))}</li>
      <li>${raw(tr(L, 'AI memakai <b>token masuk</b> saat membaca naskah dan <b>token keluar</b> saat menulis jawaban; keduanya tercatat per langkah di laporan.', 'The AI uses <b>input tokens</b> when reading the text and <b>output tokens</b> when writing its answer; both are listed per step in the report.'))}</li>
      <li>${raw(tr(L, 'Yang <b>dipotong</b> hanya pemakaian nyata; sisanya <b>kembali</b> otomatis. Pemeriksaan gagal tidak dipotong.', 'Only real usage is <b>deducted</b>; the rest <b>returns</b> automatically. Failed checks are not deducted.'))}</li></ol></div>
  </div>
  <section class="card reveal"><h3>${tr(L, 'Prediksi halaman untuk saldo Anda', 'Page estimate for your balance')}</h3>${modePagesTable(L, predictByMode(bal, billing, eng), billing.wordsPerPage)}</section>
  <section class="card reveal"><h3>${tr(L, 'Tarif terbuka per model AI', 'Public rates per AI model')}</h3><p class="muted">${tr(L, 'Setiap laporan menampilkan token masuk & keluar tiap panggilan AI, sehingga tagihan bisa Anda hitung ulang sendiri dengan tarif ini.', 'Every report lists the input & output tokens of each AI call, so you can recompute the charge yourself with these rates.')}</p>${rateTable(L, rateCard(billing, eng))}</section>
  <h2 class="reveal">${tr(L, 'Paket token', 'Token packages')}</h2>
  <div class="grid g4 plans">${billing.packages.map((p) => {
    const pr = predictPages(p.tokens, billing, eng, measured);
    const pp = packagePrice(p, billing, eng);
    return html`<form method="post" action="/app/token/pesan" class="plan reveal ${pick === p.key ? 'featured' : ''}"><h3>${bi(L, p.name)}</h3><p class="price">${L === 'en' ? `US$${fmtNum(L, pp.usd)}` : `Rp ${fmtNum(L, pp.idr)}`}</p>${p.discountPct > 0 ? html`<p class="pill p-hum">${tr(L, `hemat ${p.discountPct}%`, `save ${p.discountPct}%`)}</p>` : ''}<p><b>${fmtNum(L, p.tokens)}</b> token</p><p class="predict-sm">≈ ${fmtNum(L, pr.pages.low)}–${fmtNum(L, pr.pages.high)} ${tr(L, 'halaman*', 'pages*')}</p><p class="muted">${bi(L, p.note)}</p><input type="hidden" name="paket" value="${p.key}"><button class="btn ${pick === p.key ? 'btn-primary' : 'btn-ghost'}" type="submit">${tr(L, 'Pesan', 'Order')}</button></form>`;
  })}</div>
  <p class="muted small reveal">* ${tr(L, `Perkiraan, bukan janji: ±${billing.wordsPerPage} kata per halaman; pemakaian nyata tergantung model AI yang terpakai (Haiku saja, atau naik ke Sonnet/Opus), panjang naskah, dan rubrik.`, `An estimate, not a promise: ±${billing.wordsPerPage} words per page; real usage depends on the AI models used (Haiku only, or escalation to Sonnet/Opus), text length and rubric.`)}</p>
  ${orders.length ? html`<section class="card reveal"><h3>${tr(L, 'Pesanan', 'Orders')}</h3><ul class="clean">${orders.map((o) => html`<li><a href="/app/pesanan/${o.id}">${o.id}</a> · ${o.meta.pkg} · <span class="pill ${o.meta.status === 'credited' ? 'p-hum' : o.meta.status === 'cancelled' ? 'p-unk' : 'p-mix'}">${o.meta.status === 'credited' ? tr(L, 'lunas', 'paid') : o.meta.status === 'cancelled' ? tr(L, 'batal', 'cancelled') : tr(L, 'menunggu', 'pending')}</span> <small class="muted">${fmtDate(L, o.meta.at)}</small></li>`)}</ul></section>` : ''}
  <section class="card reveal"><h3>${tr(L, 'Buku besar token', 'Token ledger')}</h3>${led.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Waktu', 'Time')}</th><th>${tr(L, 'Jenis', 'Kind')}</th><th class="n">Token</th><th>${tr(L, 'Catatan', 'Note')}</th></tr></thead><tbody>${led.map((e) => html`<tr><td><small>${fmtDate(L, e.at)}</small></td><td>${({ reserve: tr(L, 'pesan', 'reserve'), refund: tr(L, 'kembali', 'refund'), purchase: tr(L, 'beli', 'purchase'), admin: 'admin', welcome: tr(L, 'sambutan', 'welcome') } as Record<string, string>)[e.kind] ?? e.kind}</td><td class="n ${e.tokens < 0 ? 'neg' : 'pos'}">${e.tokens > 0 ? '+' : ''}${fmtNum(L, e.tokens)}</td><td><small>${e.note}</small></td></tr>`)}</tbody></table></div>` : html`<p class="muted">${tr(L, 'Belum ada transaksi.', 'No transactions yet.')}</p>`}</section>`;
  return c.html(shell(c, tr(L, 'Token', 'Tokens'), body, 'credits'));
});

app.get('/app/kuota', (c) => c.redirect('/app/token'));

app.post('/app/token/pesan', async (c) => {
  const user = c.get('user')!;
  const store = c.get('store');
  const [billing, eng] = await Promise.all([getBilling(store), getEngine(store)]);
  const f = await c.req.parseBody();
  const p = billing.packages.find((x) => x.key === f.paket);
  if (!p) return c.redirect('/app/token');
  const { items: open } = await store.list<{ status: string }>(`i/user-orders/${user.id}/`, { limit: 20 });
  let pendingN = 0;
  for (const it of open) {
    const o = await store.get<Order>(`c/orders/${it.id}.json`);
    if (o?.status === 'pending') pendingN += 1;
  }
  if (pendingN >= 3) return c.redirect('/app/token?err=pending');
  const now = Date.now();
  // Harga & jumlah token diambil dari setelan server, bukan dari formulir — klien tidak bisa mengubahnya.
  // Harga dihitung dari markup yang berlaku saat ini lalu dibekukan di pesanan: perubahan markup sesudahnya tidak mengubah tagihan ini.
  const pp = packagePrice(p, billing, eng);
  const o: Order = { id: newId('ord'), uid: user.id, email: user.email, pkg: p.key, tokens: p.tokens, priceIdr: pp.idr, priceUsd: pp.usd, status: 'pending', createdAt: now };
  await store.put(`c/orders/${o.id}.json`, o);
  await store.createOnce(`i/user-orders/${user.id}/${invTs(now)}~${o.id}`, {}, { pkg: p.key, status: 'pending', at: now });
  await store.createOnce(`i/orders/${invTs(now)}~${o.id}`, {}, { pkg: p.key, email: user.email, idr: pp.idr, at: now });
  return c.redirect(`/app/pesanan/${o.id}`);
});

app.get('/app/pesanan/:id', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const store = c.get('store');
  const o = await store.get<Order>(`c/orders/${c.req.param('id')}.json`);
  if (!o || (o.uid !== user.id && !isAdmin(user))) return c.notFound();
  const billing = await getBilling(store);
  const body = html`
  ${pageHead(`${tr(L, 'Pesanan', 'Order')} ${o.id}`, `${o.pkg} · ${fmtNum(L, o.tokens)} token`, html`<button class="btn btn-ghost" type="button" data-print>🖨 Invoice</button>`)}
  <article class="paper invoice">
    <div class="row-between"><h2>INVOICE</h2><span class="pill ${o.status === 'credited' ? 'p-hum' : o.status === 'cancelled' ? 'p-unk' : 'p-mix'}">${o.status === 'credited' ? tr(L, 'LUNAS · token masuk', 'PAID · tokens added') : o.status === 'cancelled' ? tr(L, 'Dibatalkan', 'Cancelled') : tr(L, 'Menunggu pembayaran', 'Awaiting payment')}</span></div>
    <dl class="kv"><dt>No.</dt><dd>${o.id}</dd><dt>${tr(L, 'Tanggal', 'Date')}</dt><dd>${fmtDate(L, o.createdAt)}</dd><dt>${tr(L, 'Pembeli', 'Buyer')}</dt><dd>${o.email}</dd><dt>${tr(L, 'Paket', 'Package')}</dt><dd>${o.pkg} — ${fmtNum(L, o.tokens)} token</dd><dt>${tr(L, 'Jumlah', 'Amount')}</dt><dd><b>Rp ${fmtNum(L, o.priceIdr)}</b> (≈ US$${o.priceUsd})</dd>${o.creditedAt ? html`<dt>${tr(L, 'Lunas', 'Paid')}</dt><dd>${fmtDate(L, o.creditedAt)}</dd>` : ''}</dl>
    ${o.status === 'pending'
      ? html`<div class="callout-info"><h4>${tr(L, 'Cara membayar', 'How to pay')}</h4>${billing.manualText ? html`<p class="pre">${billing.manualText}</p>` : html`<p>${tr(L, 'Hubungi hello@axto.io atau WhatsApp dengan menyebut nomor pesanan ini untuk menerima instruksi pembayaran.', 'Contact hello@axto.io or WhatsApp quoting this order number to receive payment instructions.')}</p>`}<p class="muted">${tr(L, 'Token masuk ke dompet setelah admin mengonfirmasi pembayaran — tepat sekali, tercatat di buku besar.', 'Tokens arrive in your wallet once the admin confirms the payment — exactly once, recorded in the ledger.')}</p></div>`
      : ''}
  </article>`;
  return c.html(shell(c, o.id, body, 'credits'));
});

/* ── pengaturan ─────────────────────────────────────────────────────── */

app.get('/app/pengaturan', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const eng = await getEngine(c.get('store'));
  const ret = user.retentionDays ?? eng.retentionDays;
  const ok = c.req.query('ok');
  const err = c.req.query('err');
  const body = html`
  ${pageHead(tr(L, 'Pengaturan', 'Settings'))}
  ${flash(L, ok ? tr(L, 'Tersimpan.', 'Saved.') : null, err === 'pass' ? tr(L, 'Sandi lama salah.', 'Wrong current password.') : null)}
  <div class="grid g2">
    <form method="post" action="/app/pengaturan" class="card form reveal"><h3>${tr(L, 'Profil & privasi', 'Profile & privacy')}</h3>
      <label class="field"><span>${tr(L, 'Nama', 'Name')}</span><input name="name" value="${user.name}" maxlength="80" required></label>
      <label class="field"><span>${tr(L, 'Bahasa portal', 'Portal language')}</span><select name="lang"><option value="id" ${user.lang === 'id' ? 'selected' : ''}>Bahasa Indonesia</option><option value="en" ${user.lang === 'en' ? 'selected' : ''}>English</option></select></label>
      <label class="field"><span>${tr(L, 'Masa simpan teks', 'Text retention')} ${tip(tr(L, 'Setelah masa ini teks naskah dihapus; angka laporan & kode verifikasi tetap.', 'After this the text is deleted; report numbers & the verification code stay.'))}</span><select name="retention">${[0, 7, 30, 90, 365].map((d) => html`<option value="${d}" ${ret === d ? 'selected' : ''}>${d === 0 ? tr(L, 'Hapus segera setelah laporan jadi', 'Delete as soon as the report is ready') : `${d} ${tr(L, 'hari', 'days')}`}</option>`)}</select></label>
      <button class="btn btn-primary" type="submit">${tr(L, 'Simpan', 'Save')}</button></form>
    <form method="post" action="/app/pengaturan/sandi" class="card form reveal"><h3>${tr(L, 'Ganti sandi', 'Change password')}</h3>
      <label class="field"><span>${tr(L, 'Sandi lama', 'Current password')}</span><input type="password" name="old" required autocomplete="current-password"></label>
      <label class="field"><span>${tr(L, 'Sandi baru (min. 8)', 'New password (min. 8)')}</span><input type="password" name="new" required minlength="8" autocomplete="new-password" data-strength></label>
      <div class="strength" aria-hidden="true"><i></i></div>
      <button class="btn btn-primary" type="submit">${tr(L, 'Ganti sandi', 'Change password')}</button>
      <p class="muted">${tr(L, 'Mengganti sandi mengeluarkan semua perangkat lain.', 'Changing the password signs out every other device.')}</p></form>
    <section class="card reveal"><h3>${tr(L, 'Verifikasi 2 langkah', 'Two-step verification')}</h3><p>${user.totp ? html`<span class="pill p-hum">✓ ${tr(L, 'Aktif', 'On')}</span>` : html`<span class="pill p-unk">${tr(L, 'Belum aktif', 'Off')}</span>`}</p>${user.totp ? '' : html`<a class="btn btn-ghost" href="/2fa/pasang">${tr(L, 'Aktifkan 2FA', 'Turn on 2FA')}</a>`}</section>
  </div>`;
  return c.html(shell(c, tr(L, 'Pengaturan', 'Settings'), body, 'settings'));
});

app.post('/app/pengaturan', async (c) => {
  const user = c.get('user')!;
  const f = (await c.req.parseBody()) as Record<string, string>;
  const ret = Number(f.retention);
  await updateUser(c.get('store'), user.id, (u) => ({ ...u, name: String(f.name ?? u.name).slice(0, 80) || u.name, lang: f.lang === 'en' ? 'en' : 'id', retentionDays: [0, 7, 30, 90, 365].includes(ret) ? ret : u.retentionDays }));
  return c.redirect('/app/pengaturan?ok=1');
});

app.post('/app/pengaturan/sandi', async (c) => {
  const user = c.get('user')!;
  const f = (await c.req.parseBody()) as Record<string, string>;
  if (!(await verifyPassword(String(f.old ?? ''), user.pass)) || String(f.new ?? '').length < 8) return c.redirect('/app/pengaturan?err=pass');
  const pass = await hashPassword(String(f.new));
  const store = c.get('store');
  const u = await updateUser(store, user.id, (x) => ({ ...x, pass, sv: x.sv + 1 }));
  await audit(store, user.id, 'password.changed', {});
  if (u) {
    const { startSession } = await import('../lib/session.ts');
    await startSession(c, u, c.get('sess')?.t === 1);
  }
  return c.redirect('/app/pengaturan?ok=1');
});

registerMemberAffiliate(app);

export { textKey };
