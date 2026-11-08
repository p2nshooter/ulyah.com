/** Portal member: dasbor, periksa, proses, riwayat kerja, sesi lomba, token, afiliasi, pengaturan. */
import { Hono } from 'hono';
import { html, raw, jsonScript, type Raw } from '../lib/html.ts';
import { tr, fmtNum, fmtDate, fmtScore, GENRES, LEVELS, LABELS, MODE_INFO, type Lang, type LabelKey } from '../lib/i18n.ts';
import { page, pageHead, guide, flash, labelPill, compBar, empty, stat, tip, purgeNotice, BRAND_HOST, assistNotice } from '../pages/ui.ts';
import { PURPOSES, PURPOSE_INFO, pt, isPurpose } from '../lib/purpose.ts';
import { getControls, engineAvailability } from '../data/controls.ts';
import { FABLE_MODEL, PUBLIC_MODE, PUBLIC_NAME, parseMode, publicModelName } from '../engine/pricing.ts';
import { getStats, statsKey, type MemberStats } from '../data/stats.ts';
import { rebuildStats } from '../data/stats-rebuild.ts';
import { PURGE_DAYS } from '../data/policy.ts';
import { getPaypal, paypalReady } from '../data/paypal.ts';
import { registerMemberPaypal } from './paypal.ts';
import { tierOf, modeAllowed, clampTier, isVvip, TIERS, ENGINE_MIN_TIER } from '../data/tiers.ts';
import { planCard, plansNote } from '../pages/plans.ts';
import { reportPages, usagePanel, rateTable, modePagesTable } from '../pages/report.ts';
import { rateCard, predictByMode, packagePrice, tokenPriceIdr } from '../engine/pricing.ts';
import { portalLang, isForeign, type HonoEnv, type Ctx } from '../lib/session.ts';
import { RUBRICS, bi, getRubric } from '../engine/rubrics.ts';
import { getEngine, getBilling, measuredCostPer1k, getFree, type BillingSettings, type EngineSettings } from '../data/settings.ts';
import { freeStatus } from '../data/free.ts';
import { balanceOf, ledger } from '../data/wallet.ts';
import { predictPages } from '../engine/pricing.ts';
import { createCheck, sanitizeInput, CheckInputError, FreeChoiceError, netHashOf, batchKey, settleBatch, type Batch, type FreeChoice } from './checks.ts';
import { checkKey, reportKey, textKey, type CheckDoc, type ReportDetail, type ReportSummary } from '../engine/cascade.ts';
import { newId, unseal, verifyPassword, hashPassword, hmac } from '../lib/crypto.ts';
import { invTs } from '../lib/store.ts';
import { updateUser, isAdmin } from '../data/users.ts';
import { jaccardEstimate } from '../engine/similarity.ts';
import { audit } from '../data/audit.ts';
import { registerMemberAffiliate } from './affiliate.ts';
import { registerMemberPayments, noCashNotice, statusPill, payFlash } from './payments.ts';
import { getPayment, orderKey, invoiceNo, currencyOf, amountOf, fmtMoney, type Order } from '../data/orders.ts';
import { depositBalance, depositLedger } from '../data/deposit.ts';
import { schedulePurge } from '../data/purge.ts';

export const app = new Hono<HonoEnv>();

app.use('/app/*', async (c, next) => {
  if (!c.get('user')) return c.redirect(`/masuk?next=${encodeURIComponent(c.req.path)}`);
  await next();
});
app.use('/app', async (c, next) => {
  if (!c.get('user')) return c.redirect('/masuk');
  await next();
});

function shell(c: Ctx, title: string, body: Raw, active: string, ads = false): string {
  return page({ L: portalLang(c), title, body, user: c.get('user'), area: 'app', active, ads });
}

/** Keadaan kuota gratis member untuk formulir (dari Admin → Kuota gratis). */
async function freeView(c: Ctx) {
  const store = c.get('store');
  const f = await getFree(store);
  const st = await freeStatus(store, c.get('user')!.id, f);
  return { f, remaining: st.remaining, resetAt: st.period.resetAt };
}
type FreeView = Awaited<ReturnType<typeof freeView>>;

function freeChoiceBox(L: Lang, ch: FreeChoice): Raw {
  const per = ch.period === 'week' ? tr(L, 'minggu', 'week') : tr(L, 'bulan', 'month');
  return html`<section class="card free-choice reveal" data-free-choice role="alert">
    <h3>${tr(L, `Naskah ini ${ch.pages} halaman`, `This text is ${ch.pages} pages`)}</h3>
    <p>${tr(L, `Satu halaman dihitung dari teksnya (kertas Legal: maks. ${ch.wordsPerPage} kata). Kuota gratis Anda ${ch.quota} halaman per ${per}, maks. ${ch.maxPerCheck} per pemeriksaan; sisa ${ch.remaining} halaman.`, `A page is measured from the text (Legal paper: at most ${ch.wordsPerPage} words). Your free quota is ${ch.quota} pages per ${per}, at most ${ch.maxPerCheck} per check; ${ch.remaining} pages left.`)}</p>
    ${ch.pages > ch.quota ? html`<p class="warn">${tr(L, `Naskah ini lebih panjang dari seluruh kuota gratis (${ch.quota} halaman).`, `This text is longer than the whole free quota (${ch.quota} pages).`)}</p>` : ''}
    <div class="choice-row">
      ${ch.allowedNow > 0 ? html`<button class="btn btn-ghost" type="submit" name="partial" value="1">${tr(L, `Periksa ${ch.allowedNow} halaman pertama gratis`, `Check the first ${ch.allowedNow} pages for free`)}</button>` : ''}
      <button class="btn btn-primary" type="submit" name="switch" value="paid">${tr(L, 'Periksa semuanya dengan Cek Lengkap (token)', 'Check all of it with the Full Check (tokens)')}</button>
      <a class="btn btn-ghost" href="/app/token">${tr(L, 'Isi saldo', 'Top up')}</a>
    </div>
    <p class="muted small">${tr(L, `Atau tunggu kuota baru: ${fmtDate(L, ch.resetAt)}.`, `Or wait for the new quota: ${fmtDate(L, ch.resetAt)}.`)}</p>
  </section>`;
}

const q = (c: Ctx, k: string) => c.req.query(k) ?? null;

/* ── dasbor ─────────────────────────────────────────────────────────── */

export async function pagesLine(L: Lang, balance: number, b: BillingSettings, eng: EngineSettings, store: Ctx['var']['store']): Promise<Raw> {
  const pr = predictPages(balance, b, eng, await measuredCostPer1k(store));
  return html`<p class="predict">≈ <b>${fmtNum(L, pr.pages.low)}–${fmtNum(L, pr.pages.high)}</b> ${tr(L, 'halaman', 'pages')} <small class="muted">(${tr(L, `±${b.wordsPerPage} kata/halaman · ${pr.perPage.low}–${pr.perPage.high} token per halaman`, `±${b.wordsPerPage} words/page · ${pr.perPage.low}–${pr.perPage.high} tokens per page`)})</small> ${tip(tr(L, 'Perkiraan, bukan janji: pemakaian nyata tergantung model AI yang terpakai (Essential saja, atau naik ke Advanced/Expert), panjang naskah, dan rubrik.', 'An estimate, not a promise: real usage depends on which AI models are used (Essential only, or escalation to Advanced/Expert), text length and rubric.'))}</p>`;
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
  ${assistNotice(L)}
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

function checkForm(c: Ctx, err?: string | null, v: Record<string, string> = {}, fv?: FreeView, choice?: FreeChoice): string {
  const L = portalLang(c);
  const freeOn = Boolean(fv && fv.f.enabled);
  const per = fv?.f.period === 'month' ? tr(L, 'bulan', 'month') : tr(L, 'minggu', 'week');
  const body = html`
  ${pageHead(tr(L, 'Periksa naskah baru', 'Check a new text'), tr(L, 'Tiga langkah: masukkan teks, isi keterangan, pilih cara menilai.', 'Three steps: add the text, describe it, choose how to grade.'))}
  ${assistNotice(L)}
  ${purgeNotice(L, true)}
  ${guide(L, 'check', tr(L, 'Tips agar hasil paling akurat', 'Tips for the most accurate result'), [
    tr(L, 'Masukkan <b>teks utuh</b> (≥ 300 kata ideal). Di bawah 150 kata tidak ada label.', 'Use the <b>whole text</b> (≥ 300 words is ideal). Under 150 words there is no label.'),
    tr(L, 'Pilih <b>jenjang penulis</b> — tulisan pelajar yang sederhana tidak dianggap AI.', 'Pick the <b>writer level</b> — simple student writing is not treated as AI.'),
    tr(L, '<b>Daftar pustaka dan kutipan panjang</b> otomatis dikecualikan dari persen.', '<b>Bibliographies and long quotes</b> are excluded from percentages automatically.'),
  ])}
  ${flash(L, null, err)}
  <form method="post" action="/app/periksa" class="check-form" data-check-form data-lang="${L}">
    ${choice ? freeChoiceBox(L, choice) : ''}
    <section class="card step reveal"><div class="step-n">1</div><div class="step-body">
      <h3>${tr(L, 'Teks naskah', 'The text')}</h3>
      <div class="dropzone" data-drop><input type="file" accept=".txt,.md,.docx,.pdf,.rtf,.html,.htm" data-file hidden id="fileInput"><label for="fileInput" class="drop-label"><span class="drop-ic">⬆</span><b>${tr(L, 'Unggah .docx / .pdf / .rtf / .html / .txt', 'Upload .docx / .pdf / .rtf / .html / .txt')}</b><small class="muted">${tr(L, 'atau seret berkas ke sini — teks diambil di peramban, berkasnya tidak dikirim', 'or drag a file here — text is extracted in your browser, the file is not sent')}</small></label></div>
      <div class="url-row" data-url-box><label class="field"><span>${tr(L, 'Atau ambil dari URL artikel', 'Or fetch from an article URL')}</span><input type="url" inputmode="url" maxlength="2000" placeholder="https://…" data-url-input autocomplete="off"></label><button class="btn btn-ghost" type="button" data-url-fetch>🔗 ${tr(L, 'Ambil', 'Fetch')}</button></div>
      <p class="muted small url-note">${tr(L, 'Hanya halaman publik; robots.txt situs dihormati. Mengambil teks tidak memotong token.', 'Public pages only; the site’s robots.txt is respected. Fetching the text costs no tokens.')}</p>
      <label class="field"><span>${tr(L, 'Atau tempel teks', 'Or paste the text')}</span><textarea name="text" rows="12" required data-wordcount="wc" data-estimate placeholder="${tr(L, 'Tempel naskah di sini…', 'Paste the text here…')}">${v.text ?? ''}</textarea></label>
      <div class="estimate" data-estimate-box aria-live="polite"><div><small class="muted">${tr(L, 'Panjang', 'Length')}</small><b><span id="wc">0</span> ${tr(L, 'kata', 'words')} · <span id="pg">0</span> ${tr(L, 'hal.', 'pages')}</b></div><div><small class="muted">${tr(L, 'Biaya nyata biasanya', 'Real cost usually')}</small><b><span id="estLo">—</span>–<span id="estTy">—</span> token</b></div><div><small class="muted">${tr(L, 'Dipesan dulu (sisa kembali)', 'Reserved first (rest returns)')}</small><b><span id="estRes">—</span> token</b></div><div><small class="muted">${tr(L, 'Saldo', 'Balance')}</small><b>${fmtNum(L, v.__balance ? Number(v.__balance) : 0)} token</b></div></div>
      <p class="muted small" data-reuse-note>♻ ${tr(L, `Bagian naskah yang pernah Anda periksa dengan mesin yang sama dipakai lagi tanpa memanggil AI dan dihitung ${v.__reusePct ?? '50'}%; sisa pesanan kembali otomatis.`, `Parts of the text you already checked with the same engine are reused without calling the AI and count ${v.__reusePct ?? '50'}%; the rest of the reservation returns automatically.`)}</p>
      <p class="est-short warn" data-est-short hidden>${tr(L, 'Saldo kurang', 'Balance short by')} <b data-est-short-n>0</b> token — <a href="/app/token">${tr(L, 'isi saldo dulu', 'top up first')}</a> ${tr(L, 'atau pilih Cek Gratis / mesin yang lebih hemat.', 'or choose the Free Check / a cheaper engine.')}</p>
      <p class="muted small">${tr(L, 'Perkiraan dari server; pemakaian nyata tergantung model AI yang terpakai — sebagian besar naskah cukup diperiksa Essential (paling hemat).', 'Estimates come from the server; real usage depends on the AI models used — most texts only need Essential (the most economical).')}</p>
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
        <label class="field"><span>${tr(L, 'Keperluan laporan', 'What the report is for')} ${tip(tr(L, 'Judul, sebutan penulis, dan kolom tanda tangan laporan menyesuaikan keperluan.', 'The report’s title, how the writer is named and the signature boxes follow its purpose.'))}</span><select name="purpose" data-purpose>${PURPOSES.map((p) => html`<option value="${p}" data-hint="${pt(L, PURPOSE_INFO[p].hint)}" ${(isPurpose(v.purpose) ? v.purpose : 'umum') === p ? 'selected' : ''}>${pt(L, PURPOSE_INFO[p].name)}</option>`)}</select><small class="muted" data-purpose-hint>${pt(L, PURPOSE_INFO[isPurpose(v.purpose) ? v.purpose : 'umum'].hint)}</small></label>
      </div>
      ${freeOn && fv ? html`<fieldset class="modes free-mode"><legend>${tr(L, 'Cek Gratis', 'Free Check')}</legend>
        <label class="mode-card ${fv.remaining > 0 ? '' : 'off'}"><input type="radio" name="mode" value="free" ${v.mode === 'free' ? 'checked' : ''} ${fv.remaining > 0 ? '' : 'disabled'} data-free-remaining="${fv.remaining}"><span><b>${tr(L, `Gratis — sisa ${fv.remaining} dari ${fv.f.pages} halaman per ${per}`, `Free — ${fv.remaining} of ${fv.f.pages} pages left this ${per}`)}</b><small>${tr(L, `Mesin hemat (Essential), penilaian per paragraf, tanpa rubrik. Maks. ${fv.f.maxPerCheck} halaman per pemeriksaan (1 halaman = maks. ${fv.f.wordsPerPage} kata). Kuota baru: ${fmtDate(L, fv.resetAt)}. Laporannya memuat iklan dan tanda air logo ${BRAND_HOST}.`, `Economy engine (Essential), judged per paragraph, no rubric. At most ${fv.f.maxPerCheck} pages per check (1 page = at most ${fv.f.wordsPerPage} words). New quota: ${fmtDate(L, fv.resetAt)}. The report carries ads and a ${BRAND_HOST} logo watermark.`)}</small><em class="mode-est">${tr(L, 'Untuk hasil per kalimat, rubrik dan laporan lengkap: pilih Cek Lengkap di bawah.', 'For per-sentence results, rubrics and the full report: choose a Full Check below.')}</em></span></label>
      </fieldset>` : ''}
      <fieldset class="modes"><legend>${tr(L, 'Mesin AI', 'AI engine')} ${tip(tr(L, 'Smart Auto memilih sendiri: Essential dulu, lalu Advanced/Expert hanya untuk kalimat yang ragu. Atau pilih satu model.', 'Smart Auto chooses for you: Essential first, then Advanced/Expert only for doubtful sentences. Or pick one model.'))}</legend>
        ${(['auto', 'haiku', 'sonnet', 'opus', 'fable', 'forensic'] as const).map((m) => { const isOff = (v.__off ?? '').split(',').includes(m); const locked = !isOff && !modeAllowed(m, clampTier(v.__tier)); const need = TIERS[ENGINE_MIN_TIER[m]]; return html`<label class="mode-card ${m === 'auto' ? 'rec' : ''} ${m === 'fable' ? 'premium' : ''} ${isOff ? 'off soon' : ''} ${locked ? 'off locked' : ''}" ${isOff ? raw(`data-soon="${PUBLIC_MODE[m]}"`) : locked ? raw(`data-locked="${PUBLIC_MODE[m]}"`) : ''}><input type="radio" name="mode" value="${PUBLIC_MODE[m]}" ${!isOff && !locked && (parseMode(v.mode) ?? 'auto') === m && v.mode !== 'free' ? 'checked' : ''} ${isOff || locked ? 'disabled' : ''}><span><b>${L === 'en' ? MODE_INFO[m]!.en : MODE_INFO[m]!.id}${isOff ? html` <em class="soon-tag">${m === 'fable' ? tr(L, 'Segera hadir', 'Coming soon') : tr(L, 'Sedang nonaktif', 'Switched off')}</em>` : locked ? html` <a class="soon-tag lock-tag" href="/app/token#paket">🔒 ${tr(L, `paket ${need.id}`, `${need.en} package`)}</a>` : ''}</b><small>${L === 'en' ? MODE_INFO[m]!.den : MODE_INFO[m]!.did}</small>${m === 'fable' && v.__fableX ? html`<small class="premium-cost">${tr(L, `Biaya per token AI ± ${v.__fableX}`, `Cost per AI token ± ${v.__fableX}`)}</small>` : ''}<em class="mode-est" data-mode-est="${PUBLIC_MODE[m]}">—</em></span></label>`; })}
      </fieldset>
      ${v.__fable === '1' ? html`<input type="hidden" name="elite_ok" value="${v.elite_ok === '1' ? '1' : '0'}" data-elite-ok>
      <dialog class="elite-dialog" data-elite-dialog aria-labelledby="eliteTitle">
        <div class="elite-dialog-in">
          <span class="elite-gem" aria-hidden="true">✦</span>
          <h3 id="eliteTitle">${tr(L, 'Anda yakin ingin memakai Elite?', 'Are you sure you want to use Elite?')}</h3>
          <p>${tr(L, 'Elite adalah mesin paling istimewa yang kami sediakan — telaahnya paling mendalam dan cermat. Keistimewaan itu datang dengan biaya yang jauh lebih tinggi daripada mesin lain', 'Elite is the most exceptional engine we offer — its review is the deepest and most careful. That excellence comes at a far higher cost than the other engines')}${v.__fableX ? ` (± ${v.__fableX})` : ''}${tr(L, ', sehingga saldo token Anda akan berkurang jauh lebih cepat.', ', so your token balance will go down much faster.')}</p>
          <p>${tr(L, 'Kami menyarankannya hanya untuk naskah yang benar-benar menentukan. Untuk pemeriksaan sehari-hari, Smart Auto sudah memberi hasil yang sangat baik dengan biaya jauh lebih ringan.', 'We suggest it only for texts that truly matter. For everyday checks, Smart Auto already gives excellent results at a much lighter cost.')}</p>
          <div class="btn-row"><button type="button" class="btn btn-primary" data-elite-yes>✦ ${tr(L, 'Ya, saya yakin memakai Elite', 'Yes, I am sure — use Elite')}</button><button type="button" class="btn btn-ghost" data-elite-no>${tr(L, 'Tidak, kembali ke Smart Auto', 'No, back to Smart Auto')}</button></div>
        </div>
      </dialog>` : ''}
      <label class="check"><input type="checkbox" name="agree" required ${v.agree ? 'checked' : ''}> <span>${tr(L, 'Saya berhak memeriksa naskah ini (milik sendiri, sebagai guru/juri/editor, atau dengan izin penulis).', 'I am entitled to check this text (my own, as a teacher/judge/editor, or with the author’s consent).')}</span></label>
      <button class="btn btn-primary btn-lg" type="submit" data-busy="${tr(L, 'Menyiapkan…', 'Preparing…')}">${tr(L, 'Periksa sekarang', 'Check now')} →</button>
    </div></section>
  </form>`;
  return shell(c, tr(L, 'Periksa baru', 'New check'), body, 'check');
}

/** Fable 5.1 ditawarkan bila diizinkan admin; perbandingan biayanya dihitung dari harga di Admin → Mesin. */
async function fableVars(c: Ctx): Promise<Record<string, string>> {
  const store = c.get('store');
  const k = await getControls(store);
  const av = engineAvailability(k);
  const off = (['sonnet', 'opus', 'fable', 'forensic'] as const).filter((m) => !av[m]).join(',');
  const __reusePct = String((await getBilling(store)).reusePct);
  const __tier = String(tierOf(c.get('user')));
  if (!av.fable) return { __fable: '0', __off: off, __reusePct, __tier };
  const eng = await getEngine(store);
  const L = portalLang(c);
  const blend = (m: string) => (eng.prices[m] ? 3 * eng.prices[m]!.in + eng.prices[m]!.out : 0);
  const f = blend(FABLE_MODEL), o = blend(eng.models.t3), h = blend(eng.models.t1);
  const x = (n: number) => (n >= 10 ? String(Math.round(n)) : n.toLocaleString(L === 'en' ? 'en-US' : 'id-ID', { maximumFractionDigits: 1 }));
  return { __fable: '1', __off: off, __reusePct, __tier, __fableX: o && h ? tr(L, `${x(f / o)}× Expert, ${x(f / h)}× Essential`, `${x(f / o)}× Expert, ${x(f / h)}× Essential`) : '' };
}

app.get('/app/periksa', async (c) => {
  const u = c.get('user')!;
  // Mesin tujuan dari konversi terakhir (§28.7) jadi pilihan bawaan; Elite tetap lewat jendela „Anda yakin?“.
  const pref = u.preferredMode && u.preferredMode !== 'fable' && modeAllowed(parseMode(u.preferredMode) ?? 'auto', tierOf(u)) ? PUBLIC_MODE[parseMode(u.preferredMode) ?? 'auto'] : undefined;
  return c.html(checkForm(c, null, { __balance: String(await balanceOf(c.get('store'), u.id)), ...(pref ? { mode: pref } : {}), ...(await fableVars(c)) }, await freeView(c)));
});

app.post('/app/periksa', async (c) => {
  const L = portalLang(c);
  const f = (await c.req.parseBody()) as Record<string, string>;
  // „Periksa semuanya dengan Cek Lengkap“ dari kotak pilihan kuota gratis → AUTO berbayar.
  if (f.switch === 'paid' && f.mode === 'free') f.mode = 'auto';
  const withBal = { ...f, __balance: String(await balanceOf(c.get('store'), c.get('user')!.id)), ...(await fableVars(c)) };
  const fv = await freeView(c);
  if (!f.agree) return c.html(checkForm(c, tr(L, 'Centang pernyataan bahwa Anda berhak memeriksa naskah ini.', 'Tick the statement that you are entitled to check this text.'), withBal, fv), 400);
  try {
    const freeQuota = f.mode === 'free' ? { partial: f.partial === '1', netHash: await netHashOf(c) } : undefined;
    const doc = await createCheck(c.env, c.get('store'), c.get('user')!, sanitizeInput(f, L), L, { freeQuota });
    return c.redirect(`/app/proses/${doc.id}`);
  } catch (err) {
    if (err instanceof FreeChoiceError) return c.html(checkForm(c, null, withBal, fv, err.choice), 409);
    if (err instanceof CheckInputError) return c.html(checkForm(c, err.message, withBal, fv), err.status as 400);
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
    ['t1', 'Essential · Ultra', tr(L, 'memeriksa setiap kalimat & paragraf', 'checks every sentence & paragraph')],
    ['t2', 'Advanced', tr(L, 'hanya kalimat yang ragu', 'doubtful sentences only')],
    ['t3', 'Expert', tr(L, 'pemeriksa terakhir bila perlu', 'final checker if needed')],
    ['fuse', tr(L, 'Menggabungkan semua hasil', 'Combining all results'), tr(L, 'menghitung persen & kesimpulan', 'computing percentages & the conclusion')],
    ['rubric2', tr(L, 'Memeriksa ulang nilai', 'Double-checking the score'), tr(L, 'Advanced menilai ulang bila ragu', 'Advanced re-grades when unsure')],
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
/** Penanda riwayat (MASTER-BLUEPRINT §27): riwayat tidak pernah dihapus; setelah 90 hari hanya naskah & rinciannya. */
function archiveMark(L: Lang, at: number): Raw {
  const when = at + PURGE_DAYS * 86_400_000;
  return when <= Date.now()
    ? html`<br><span class="pill p-unk" data-archived title="${tr(L, 'Naskah dihapus otomatis; riwayat dan angka tetap', 'Text deleted automatically; history and figures kept')}">📦 ${tr(L, 'Arsip', 'Archive')} · ${fmtDate(L, when, false)}</span>`
    : html`<br><small class="muted">${tr(L, `naskah s.d. ${fmtDate(L, when, false)}`, `text until ${fmtDate(L, when, false)}`)}</small>`;
}

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
  ${purgeNotice(L)}
  <form class="card filters reveal" method="get">
    <label class="field grow"><span>${tr(L, 'Cari judul / penulis', 'Search title / author')}</span><input name="q" value="${qv}" placeholder="${tr(L, 'mis. literasi', 'e.g. literacy')}"></label>
    <label class="field"><span>Label</span><select name="label"><option value="">${tr(L, 'Semua', 'All')}</option>${(Object.keys(LABELS) as LabelKey[]).map((k) => html`<option value="${k}" ${lv === k ? 'selected' : ''}>${L === 'en' ? LABELS[k].en : LABELS[k].id}</option>`)}</select></label>
    <button class="btn btn-primary" type="submit">${tr(L, 'Terapkan', 'Apply')}</button>
  </form>
  ${items.length
    ? html`<div class="card reveal"><div class="tbl-wrap"><table class="tbl hover">
      <thead><tr><th>${tr(L, 'Judul', 'Title')}</th><th>${tr(L, 'Komposisi', 'Composition')}</th><th>Label</th><th class="n">${tr(L, 'Nilai', 'Score')}</th><th class="n">Token</th><th>${tr(L, 'Tanggal', 'Date')}</th></tr></thead>
      <tbody>${items.map((it) => html`<tr data-href="/app/laporan/${it.id}"><td><a href="/app/laporan/${it.id}"><b>${it.meta.title}</b></a>${it.meta.author ? html`<br><small class="muted">${it.meta.author}</small>` : ''}</td><td class="w-bar">${compBar(it.meta)}<small class="muted">AI ${it.meta.ai}% · ${tr(L, 'Campuran', 'Mixed')} ${it.meta.mix}%</small></td><td>${labelPill(L, it.meta.label)}</td><td class="n">${it.meta.total !== null && it.meta.total !== undefined ? fmtScore(L, it.meta.total) : '—'}</td><td class="n">${it.meta.tokens ?? '—'}</td><td><small>${fmtDate(L, it.meta.at)}</small>${archiveMark(L, it.meta.at)}</td></tr>`)}</tbody>
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
  ${pageHead(s.title, `${fmtDate(L, s.createdAt)} · ${fmtNum(L, s.analyzedWords)} ${tr(L, 'kata dianalisis', 'words analysed')} · ${s.free ? tr(L, `Cek Gratis · ${s.free.pages} halaman kuota`, `Free Check · ${s.free.pages} quota pages`) : `${s.tokens} token`}`, html`<button class="btn btn-primary" type="button" data-print>🖨 ${tr(L, 'Cetak / simpan PDF', 'Print / save PDF')}</button>`)}
  ${s.purged
    ? html`<p class="flash info noprint" data-archive-mark>📦 ${tr(L, `Arsip — dikerjakan ${fmtDate(L, s.createdAt, false)}; naskah dan rincian per kalimatnya dihapus otomatis pada ${fmtDate(L, s.purgedAt ?? s.createdAt + PURGE_DAYS * 86_400_000, false)}. Riwayat, angka hasil, nilai, token, dan kode verifikasinya tetap tersimpan selamanya.`, `Archive — done on ${fmtDate(L, s.createdAt, false)}; its text and per-sentence detail were deleted automatically on ${fmtDate(L, s.purgedAt ?? s.createdAt + PURGE_DAYS * 86_400_000, false)}. Its history, result figures, score, tokens and verification code are kept for good.`)}</p>`
    : html`<p class="muted small noprint" data-archive-mark>🗓 ${tr(L, `Dikerjakan ${fmtDate(L, s.createdAt, false)}. Naskah dan rincian per kalimat dihapus otomatis pada ${fmtDate(L, s.createdAt + PURGE_DAYS * 86_400_000, false)} (${PURGE_DAYS} hari); riwayat dan angka hasilnya tetap tersimpan. Unduh atau cetak bila ingin menyimpan rinciannya.`, `Done on ${fmtDate(L, s.createdAt, false)}. The text and per-sentence detail are deleted automatically on ${fmtDate(L, s.createdAt + PURGE_DAYS * 86_400_000, false)} (${PURGE_DAYS} days); the history and result figures are kept. Download or print it to keep the detail.`)}</p>`}
  <div class="download-bar noprint reveal">
    <span class="muted">${tr(L, 'Unduh & simpan:', 'Download & keep:')}</span>
    <a class="chip-btn" href="/app/laporan/${s.id}/unduh.html" download>⬇ HTML ${tip(tr(L, 'Satu berkas mandiri yang indah, bisa dibuka tanpa internet.', 'One beautiful self-contained file that opens offline.'))}</a>
    ${s.free ? '' : html`<a class="chip-btn" href="/app/laporan/${s.id}/unduh.json" download>⬇ ${tr(L, 'Data (JSON)', 'Data (JSON)')} ${tip(tr(L, 'Data lengkap untuk arsip, dengan segel digital — bila isinya diubah sedikit saja, segelnya tidak cocok lagi.', 'Complete data for your archive, with a digital seal — change anything and the seal no longer matches.'))}</a>`}
    <a class="chip-btn" href="/app/laporan/${s.id}/cetak" target="_blank">🖨 ${tr(L, 'Halaman cetak', 'Print page')}</a>
    <a class="chip-btn" href="/v/${s.verifyCode}" target="_blank">▣ ${tr(L, 'Verifikasi', 'Verify')} ${s.verifyCode}</a>
  </div>
  ${assistNotice(L)}
  ${s.free ? html`<section class="card free-report reveal" data-free-report>
    <p class="free-badge">${tr(L, 'Cek Gratis', 'Free Check')}</p>
    ${s.free.partialOf ? html`<p class="warn">${tr(L, `Sebagian: hanya ${s.free.pages} halaman pertama dari ${s.free.partialOf} halaman yang diperiksa. Persen dan kesimpulan berlaku untuk bagian itu saja.`, `Partial: only the first ${s.free.pages} of ${s.free.partialOf} pages were checked. The percentages and the conclusion apply to that part only.`)}</p>` : ''}
    <p>${tr(L, 'Hasil ini dari mesin hemat (Essential) yang menilai per paragraf. Untuk hasil yang lebih memuaskan — penilaian per kalimat yang diperiksa ulang Advanced dan Expert bila ragu, rubrik, kemiripan antar-naskah, dan laporan tanpa iklan — pakai Cek Lengkap.', 'This result comes from the economy engine (Essential), judged per paragraph. For a more thorough result — per-sentence judgements re-checked by Advanced and Expert when in doubt, rubrics, cross-text similarity and an ad-free report — use the Full Check.')}</p>
    <div class="btn-row"><a class="btn btn-primary" href="/app/periksa">${tr(L, 'Cek Lengkap', 'Full Check')}</a><a class="btn btn-ghost" href="/app/token">${tr(L, 'Isi saldo', 'Top up')}</a></div>
  </section>` : ''}
  ${s.reuseOwn && s.reuseOwn.words > 0 ? html`<div class="flash ok reveal" data-reuse-own>♻ ${tr(L, `${fmtNum(L, s.reuseOwn.words)} kata naskah ini (${Math.round((s.reuseOwn.words * 100) / Math.max(1, s.analyzedWords))}%) pernah Anda periksa dengan mesin yang sama, jadi hasil tersimpannya dipakai lagi tanpa memanggil AI dan ${s.free ? 'halaman kuotanya' : 'tokennya'} dihitung ${s.reuseOwn.pct}%. Untuk menilai ulang dari awal, pakai „Ajukan tinjauan“ atau pilih mesin lain.`, `${fmtNum(L, s.reuseOwn.words)} words of this text (${Math.round((s.reuseOwn.words * 100) / Math.max(1, s.analyzedWords))}%) were checked by you before with the same engine, so the stored result was reused without calling the AI and ${s.free ? 'its quota pages count' : 'its tokens count'} at ${s.reuseOwn.pct}%. To re-assess from scratch, use “Request review” or choose another engine.`)}</div>` : ''}
  ${s.samePrior > 0 ? html`<div class="flash info reveal">ⓘ ${tr(L, `Teks yang sama persis sudah ${s.samePrior}× diperiksa akun ini sebelumnya. Semua hasil tetap tersimpan di riwayat.`, `The exact same text was checked ${s.samePrior}× before by this account. Every result stays in the history.`)}</div>` : ''}
  ${s.revoked ? html`<div class="flash err reveal">⚠ ${tr(L, 'Laporan ini dicabut admin.', 'This report was revoked by the admin.')}</div>` : ''}
  ${guide(L, 'report', tr(L, 'Cara membaca laporan ini', 'How to read this report'), [
    tr(L, '<b>Tiga cincin</b> = porsi kata AI, campuran, dan manusia (selalu 100%).', '<b>Three rings</b> = share of AI, mixed and human words (always 100%).'),
    tr(L, '<b>Label</b> hanya “AI” atau “manusia” bila sistem yakin; selain itu “Tidak meyakinkan”.', 'The <b>label</b> is only “AI” or “human” when the system is confident; otherwise “Inconclusive”.'),
    tr(L, 'Di <b>lampiran</b>, arahkan kursor/ketuk kalimat untuk melihat peluang & alasannya.', 'In the <b>appendix</b>, hover/tap a sentence to see its probability & reasons.'),
    tr(L, 'Merasa keliru? <b>Ajukan tinjauan</b> — Essential, Advanced, dan Expert menilai ulang seluruh teks tanpa melihat hasil ini (ditagih token seperti pemeriksaan forensik).', 'Think it is wrong? <b>Request a review</b> — Essential, Advanced and Expert re-score the whole text blind to this result (charged like a forensic check).'),
  ])}
  <div class="grid g2 noprint">
    <form method="post" action="/app/laporan/${s.id}/catatan" class="card form reveal"><h3>${tr(L, 'Catatan kerja', 'Work note')}</h3><textarea name="note" rows="3" maxlength="1000" placeholder="${tr(L, 'mis. sudah dikonfirmasi ke penulis, draf diterima…', 'e.g. confirmed with the author, drafts received…')}">${note?.text ?? ''}</textarea><button class="btn btn-ghost btn-sm" type="submit">${tr(L, 'Simpan catatan', 'Save note')}</button></form>
    <div class="card reveal"><h3>${tr(L, 'Tindakan', 'Actions')}</h3><div class="btn-row"><button class="btn btn-ghost" type="button" data-review="${s.id}" data-confirm="${tr(L, 'Jalankan tinjauan forensik penuh? Token dipesan dulu dan sisanya dikembalikan.', 'Run a full forensic review? Tokens are reserved first and the rest is returned.')}">⚖ ${tr(L, 'Ajukan tinjauan', 'Request review')}</button>${s.batchId ? html`<a class="btn btn-ghost" href="/app/sesi/${s.batchId}">← ${tr(L, 'Kembali ke sesi', 'Back to session')}</a>` : ''}</div></div>
  </div>
  ${s.free ? '' : usagePanel(L, s)}
  ${reportPages({ L: s.reportLang ?? L, s, d, verifyUrl: `${origin(c)}/v/${s.verifyCode}` })}`;
  // Iklan hanya di laporan Cek Gratis (halaman berisi hasil + panduan membacanya); laporan berbayar bebas iklan.
  // Penanda internal untuk middleware CSP (src/index.ts): hanya halaman ini di area member yang boleh memuat AdSense.
  if (s.free) c.header('x-ads-page', '1');
  return c.html(shell(c, s.title, body, 'reports', Boolean(s.free)));
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
  const inner = html`${reportPages({ L: r.s.reportLang ?? L, s: r.s, d: r.d, verifyUrl: `${origin(c)}/v/${r.s.verifyCode}` })}${r.s.free ? '' : usagePanel(L, r.s)}`;
  const doc = `<!doctype html><html lang="${r.s.reportLang ?? L}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${r.s.title.replace(/</g, '&lt;')} — AI Content Analyzer</title><style>${css}</style></head><body class="area-print standalone"><main class="page-print">${inner}</main></body></html>`;
  const name = r.s.title.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 60) || r.s.id;
  return new Response(doc, { headers: { 'content-type': 'text/html; charset=utf-8', 'content-disposition': `attachment; filename="ai-content-analyzer-${name}.html"` } });
});

/** Unduhan JSON bertanda tangan HMAC-SHA256 (anti-pemalsuan): tanda tangan mencakup seluruh isi. */
app.get('/app/laporan/:id/unduh.json', async (c) => {
  const r = await loadReport(c, c.req.param('id'));
  if (!r) return c.notFound();
  // Laporan Cek Gratis tidak diberi segel digital (tidak untuk dijadikan bukti resmi).
  if (r.s.free) return c.text('Not available for Free Check reports', 403);
  const { enc: _enc, cost: _cost, uid: _uid, ...rest } = r.s;
  // Nama mesin rahasia (MASTER-BLUEPRINT §28.2): unduhan tidak pernah membawa ID model atau nama penyedia AI.
  const sig = rest.signals;
  const pub = {
    ...rest,
    mode: PUBLIC_MODE[rest.mode] ?? rest.mode,
    signals: { stylo: sig.stylo, regen: sig.regen, essentialSentences: sig.haikuA, essentialParagraphs: sig.haikuB, advanced: sig.sonnet, expert: sig.opus, traces: sig.traces },
    path: { ...rest.path, tiers: rest.path.tiers.map((t) => publicModelName(t)) },
    rubric: rest.rubric ? { ...rest.rubric, verifiedBy: rest.rubric.verifiedBy.map((m) => publicModelName(m)) } : rest.rubric,
    usage: rest.usage ? {
      ...rest.usage,
      lines: rest.usage.lines.map((l) => ({ ...l, model: publicModelName(l.model) })),
      rates: Object.fromEntries(Object.entries(rest.usage.rates).map(([m, v]) => [publicModelName(m), v])),
    } : undefined,
  };
  const detail = r.d?.rubric ? { ...r.d, rubric: { ...r.d.rubric, aspects: r.d.rubric.aspects.map((a) => ({ ...a, by: publicModelName(a.by) })) } } : r.d;
  const payload = JSON.stringify({ report: pub, detail });
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
  ${purgeNotice(L, true)}
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
    <label class="field"><span>${tr(L, 'Keperluan sesi', 'What the session is for')}</span><select name="purpose">${PURPOSES.map((p) => html`<option value="${p}" ${p === 'lomba' ? 'selected' : ''}>${pt(L, PURPOSE_INFO[p].name)}</option>`)}</select></label>
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
    purpose: isPurpose(f.purpose) ? f.purpose : 'lomba',
    policy: f.policy === 'flag' ? 'flag' : 'exclude',
    reportLang: f.reportLang === 'en' ? 'en' : 'id',
    createdAt: Date.now(),
    items: 0,
  };
  const store = c.get('store');
  await store.put(batchKey(id), b);
  await store.createOnce(`i/user-batches/${user.id}/${invTs(b.createdAt)}~${id}`, {}, { name: b.name, category: b.category, at: b.createdAt });
  await schedulePurge(store, 'b', id, b.createdAt);
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
    <div class="dropzone" data-drop data-multi><input type="file" accept=".txt,.md,.docx,.pdf,.rtf,.html,.htm" multiple data-files hidden id="filesInput"><label for="filesInput" class="drop-label"><span class="drop-ic">⬆</span><b>${tr(L, 'Pilih atau seret banyak berkas .docx / .pdf / .rtf / .html / .txt', 'Choose or drag many .docx / .pdf / .rtf / .html / .txt files')}</b><small class="muted">${tr(L, 'Contoh nama berkas: 01_Nadia Putri_Literasi Digital.docx', 'Example file name: 01_Nadia Putri_Digital Literacy.docx')}</small></label></div>
    <div class="url-row sitemap-row"><label class="field"><span>${tr(L, 'Atau impor dari sitemap situs (maks. 50 artikel sekali impor)', 'Or import from a site’s sitemap (up to 50 articles per import)')}</span><input type="url" inputmode="url" maxlength="2000" placeholder="https://contoh.id/sitemap.xml" data-sitemap-url autocomplete="off"></label><button class="btn btn-ghost" type="button" data-sitemap-run>🗺 ${tr(L, 'Impor', 'Import')}</button></div>
    <div class="muted small sm-log" data-sitemap-log hidden aria-live="polite"></div>
    <div class="queue" data-queue hidden><table class="tbl"><thead><tr><th>${tr(L, 'Peserta', 'Entrant')}</th><th>${tr(L, 'Judul', 'Title')}</th><th class="n">${tr(L, 'Kata', 'Words')}</th><th></th></tr></thead><tbody data-queue-body></tbody></table>
      <div class="row-between"><small class="muted"><b data-queue-total>0</b> ${tr(L, 'kata', 'words')} · ${tr(L, 'token dipesan saat dijalankan, sisanya kembali', 'tokens are reserved on run, the rest returns')}</small>
      <select data-batch-mode aria-label="${tr(L, 'Mesin AI', 'AI engine')}">${(['auto', 'haiku', 'sonnet', 'opus'] as const).map((m) => html`<option value="${PUBLIC_MODE[m]}">${L === 'en' ? MODE_INFO[m]!.en : MODE_INFO[m]!.id}</option>`)}</select>
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
    smLoading: tr(L, 'Membaca sitemap…', 'Reading the sitemap…'),
    smFound: tr(L, '{n} artikel ditemukan', '{n} articles found'),
    smSkipped: tr(L, '{n} dilewati (batas/alamat tidak diizinkan)', '{n} skipped (limit/disallowed address)'),
    smProgress: tr(L, 'Diambil {ok} · gagal {bad} · dari {n}', 'Fetched {ok} · failed {bad} · of {n}'),
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

app.get('/app/token', async (c) => {
  const L = portalLang(c);
  const user = c.get('user')!;
  const store = c.get('store');
  const [eng, billing, bal, led, pay, dep, depLed, ppDoc, controls] = await Promise.all([
    getEngine(store), getBilling(store), balanceOf(store, user.id), ledger(store, user.id, 25),
    getPayment(store), depositBalance(store, user.id), depositLedger(store, user.id, 15), getPaypal(c.env, store), getControls(store),
  ]);
  // Luar negeri: harga USD lebih dulu dan PayPal disarankan (MASTER-BLUEPRINT §28.4).
  const foreign = isForeign(c);
  const paypalOn = paypalReady(ppDoc);
  const av = engineAvailability(controls);
  const avail = { haiku: true, sonnet: av.sonnet, opus: av.opus, fable: av.fable };
  // Mesin tujuan konversi & „saldo cukup untuk“ per mesin (MASTER-BLUEPRINT §28.7) — hanya mesin yang terbuka & aktif.
  const myTier = tierOf(user);
  const perPage = new Map(predictByMode(bal, billing, eng).map((x) => [x.mode, x]));
  const convertModes = (['auto', 'haiku', 'sonnet', 'opus', 'fable'] as const)
    .filter((m) => modeAllowed(m, myTier) && (m === 'auto' || m === 'haiku' || avail[m]))
    .map((m) => { const x = perPage.get(m); return { mode: m, tpp: x ? Math.round(((x.perPage.low + x.perPage.high) / 2) * 100) / 100 : 0, pages: x?.pages }; });
  // Rekap pemakaian & pembayaran member sendiri (MASTER-BLUEPRINT §27) — tanpa biaya AI atau laba (rahasia perusahaan).
  const mine = (await store.get<MemberStats>(statsKey(user.id)))?.rebuiltAt ? await getStats(store, user.id) : await rebuildStats(store, user.id);
  const { items: oi } = await store.list(`i/user-orders/${user.id}/`, { limit: 6 });
  const orders: Order[] = [];
  for (const it of oi) {
    const o = await store.get<Order>(orderKey(it.id));
    if (o) orders.push(o);
  }
  const pick = c.req.query('paket');
  // Harga 1 token saat menukar saldo deposit (ikut markup perusahaan — markup sendiri tidak pernah ditampilkan).
  const tp = Math.max(1, Math.ceil(tokenPriceIdr(billing, eng)));
  const ok = c.req.query('ok');
  const body = html`
  ${pageHead(tr(L, 'Token & saldo', 'Tokens & balance'), tr(L, 'Beli paket token lewat transfer (Rupiah atau USD), atau isi saldo deposit Rupiah lalu beli/tukar token kapan saja.', 'Buy token packages by bank transfer (Rupiah or USD), or top up a Rupiah deposit and buy/convert tokens any time.'), html`<a class="btn btn-ghost" href="/app/pesanan">🧾 ${tr(L, 'Invoice saya', 'My invoices')}</a>`)}
  ${payFlash(L, ok === 'deposit-buy' ? tr(L, 'Paket dibeli dari saldo deposit — token sudah masuk.', 'Package bought from the deposit — tokens added.') : ok === 'deposit-convert' ? tr(L, 'Saldo deposit ditukar — token sudah masuk.', 'Deposit converted — tokens added.') : null, c.req.query('err') ?? null)}
  <div class="grid g2">
    <div class="stat stat-hero reveal"><span class="stat-k">${tr(L, 'Saldo token', 'Token balance')}</span><b class="stat-v" data-count="${bal}">${fmtNum(L, bal)}</b>${await pagesLine(L, bal, billing, eng, store)}</div>
    <div class="stat stat-hero reveal"><span class="stat-k">${tr(L, 'Saldo deposit (Rupiah)', 'Deposit balance (Rupiah)')}</span><b class="stat-v">Rp ${fmtNum(L, dep)}</b><p class="predict">${tr(L, `≈ ${fmtNum(L, Math.floor(dep / tp))} token bila ditukar sekarang (1 token = Rp ${fmtNum(L, tp)})`, `≈ ${fmtNum(L, Math.floor(dep / tp))} tokens if converted now (1 token = Rp ${fmtNum(L, tp)})`)}</p></div>
  </div>
  ${noCashNotice(L)}
  <section class="card reveal" data-engine-balance><div class="row-between"><h3>${tr(L, 'Saldo Anda cukup untuk', 'Your balance covers')}</h3><span class="pill ${isVvip(myTier) ? 'p-vvip' : 'p-b'}">${isVvip(myTier) ? '♛ VVIP' : tr(L, `Paket ${TIERS[myTier].id}`, `${TIERS[myTier].en} package`)}</span></div>
    <ul class="plan-pages">${convertModes.map((m) => html`<li class="${user.preferredMode === m.mode ? 'rec' : ''}"><span>${PUBLIC_NAME[m.mode]}</span><b>${m.pages ? `${fmtNum(L, m.pages.low)}–${fmtNum(L, m.pages.high)}` : '—'}</b> <small>${tr(L, 'hal.', 'pp.')}</small></li>`)}</ul>
    <p class="muted small">${isVvip(myTier) ? tr(L, 'VVIP: semua mesin terbuka, tanpa batas token harian, dan 3× pemeriksaan bersamaan.', 'VVIP: every engine unlocked, no daily token limit, and 3× concurrent checks.') : tr(L, 'Perkiraan per mesin yang terbuka untuk paket Anda. Total pembayaran ≥ Rp10 jt membuka Enterprise, ≥ Rp20 jt Super Enterprise, ≥ Rp100 jt VVIP.', 'Estimates per engine unlocked by your package. Total payments ≥ Rp10m unlock Enterprise, ≥ Rp20m Super Enterprise, ≥ Rp100m VVIP.')}</p>
  </section>
  <section class="card reveal" data-my-stats><h3>${tr(L, 'Riwayat pemakaian & pembayaran Anda', 'Your usage & payment history')}</h3>
    <div class="grid g4">
      ${stat(tr(L, 'Sudah dibayar', 'Paid so far'), `Rp ${fmtNum(L, mine.paidIdr)}`, mine.paidUsd ? `+ US$ ${fmtNum(L, mine.paidUsd, 2)}` : undefined)}
      ${stat(tr(L, 'Token dibeli', 'Tokens bought'), fmtNum(L, mine.tokensBought))}
      ${stat(tr(L, 'Token terpakai', 'Tokens used'), fmtNum(L, mine.tokensUsed))}
      ${stat(tr(L, 'Pemeriksaan selesai', 'Checks completed'), fmtNum(L, mine.checks), mine.freeChecks ? tr(L, `${fmtNum(L, mine.freeChecks)} di antaranya Cek Gratis`, `${fmtNum(L, mine.freeChecks)} of them Free Checks`) : undefined)}
    </div>
    <p class="muted small">${mine.firstAt ? tr(L, `Sejak ${fmtDate(L, mine.firstAt, false)}. Riwayat ini tidak pernah dihapus.`, `Since ${fmtDate(L, mine.firstAt, false)}. This history is never deleted.`) : tr(L, 'Belum ada pemakaian. Riwayat ini tidak pernah dihapus.', 'No usage yet. This history is never deleted.')}</p>
  </section>
  <h2 class="reveal" id="paket">${tr(L, 'Paket token', 'Token packages')}</h2>
  <div class="grid g3 plans">${billing.packages.map((p) => {
    const pp = packagePrice(p, billing, eng);
    const op = newId('dop');
    const actions = html`<form method="post" action="/app/token/pesan" class="plan-buy"><input type="hidden" name="paket" value="${p.key}">
        ${paypalOn ? html`<button class="btn ${foreign ? 'btn-primary' : 'btn-ghost'} btn-sm pp-btn" type="submit" name="cur" value="PAYPAL" data-paypal>${tr(L, 'Bayar cepat PayPal (USD)', 'Pay fast with PayPal (USD)')}</button>` : ''}
        ${pay.idrEnabled ? html`<button class="btn ${!foreign && pick === p.key ? 'btn-primary' : 'btn-ghost'} btn-sm" type="submit" name="cur" value="IDR">${tr(L, 'Transfer Rupiah', 'Pay in Rupiah')}</button>` : ''}
        ${pay.usdEnabled ? html`<button class="btn btn-ghost btn-sm" type="submit" name="cur" value="USD">${tr(L, 'Transfer USD (luar negeri)', 'USD bank transfer (abroad)')}</button>` : ''}
      </form>
      <form method="post" action="/app/deposit/beli"><input type="hidden" name="paket" value="${p.key}"><input type="hidden" name="op" value="${op}"><button class="btn btn-primary btn-sm" type="submit" ${dep < pp.idr ? 'disabled' : ''} data-confirm="${tr(L, `Beli paket ini dengan saldo deposit Rp ${fmtNum(L, pp.idr)}?`, `Buy this package with Rp ${fmtNum(L, pp.idr)} of deposit?`)}">💰 ${tr(L, 'Beli dari saldo deposit', 'Buy with deposit')}</button></form>`;
    return planCard(L, p, billing, eng, { usdFirst: foreign, featured: pick === p.key, actions, avail });
  })}</div>
  ${plansNote(L, billing)}
  <section class="card reveal" id="deposit"><h3>💰 ${tr(L, 'Saldo deposit Rupiah', 'Rupiah deposit')}</h3>
    <p class="muted">${tr(L, 'Isi saldo sekali, pakai berkali-kali: beli paket token dari saldo, atau tukar sebagian saldo menjadi token kapan saja. Sisa deposit tidak bisa diuangkan, tetapi selalu bisa dipakai untuk membeli atau ditukar menjadi token.', 'Top up once, use many times: buy token packages from the balance, or convert part of it into tokens any time. The remaining deposit cannot be cashed out, but it can always be used to buy or convert into tokens.')}</p>
    <div class="grid g2">
      <form method="post" action="/app/deposit/isi" class="form" data-deposit-form><h4>1 · ${tr(L, 'Isi saldo — nominal bebas', 'Top up — any amount')}</h4>
        <div class="grid g2">
          <label class="field"><span>${tr(L, 'Nominal', 'Amount')}</span><input type="number" name="amount" min="1" step="any" required value="${foreign ? 100 : Math.max(pay.minDepositIdr, 1_000_000)}" id="depAmt" inputmode="decimal"></label>
          <label class="field"><span>${tr(L, 'Mata uang', 'Currency')}</span><select name="cur" data-dep-cur><option value="IDR" ${!foreign ? 'selected' : ''}>IDR (Rp)</option><option value="USD" ${foreign ? 'selected' : ''}>USD (US$)</option></select></label>
        </div>
        <div class="chips">${(foreign ? [100, 500, 1_000, 5_000, 10_000] : [1_000_000, 10_000_000, 20_000_000, 100_000_000, 1_000_000_000]).map((v) => html`<button type="button" class="chip" data-set="#depAmt" data-value="${v}">${foreign ? `US$${fmtNum(L, v)}` : `Rp ${fmtNum(L, v)}`}</button>`)}</div>
        <small class="muted" data-dep-note>${tr(L, `Tanpa batas atas — Rp100 juta sampai Rp1 miliar pun bisa. Minimum Rp ${fmtNum(L, pay.minDepositIdr)}. USD dikonversi ke saldo Rupiah dengan kurs hari ini (1 USD ≈ Rp ${fmtNum(L, eng.fx)}). Total pembayaran ≥ Rp10 jt membuka Enterprise, ≥ Rp20 jt Super Enterprise, ≥ Rp100 jt VVIP — semua mesin.`, `No upper limit — even Rp100 million to Rp1 billion. Minimum Rp ${fmtNum(L, pay.minDepositIdr)}. USD is converted into the Rupiah balance at today’s rate (1 USD ≈ Rp ${fmtNum(L, eng.fx)}). Total payments ≥ Rp10m unlock Enterprise, ≥ Rp20m Super Enterprise, ≥ Rp100m VVIP — every engine.`)}</small>
        <div class="btn-row">
          ${paypalOn ? html`<button class="btn ${foreign ? 'btn-primary' : 'btn-ghost'} pp-btn" type="submit" name="via" value="paypal" data-dep-paypal>⚡ ${tr(L, 'Bayar cepat PayPal (USD)', 'Pay fast with PayPal (USD)')}</button>` : ''}
          ${pay.idrEnabled || pay.usdEnabled ? html`<button class="btn ${foreign && paypalOn ? 'btn-ghost' : 'btn-primary'}" type="submit" name="via" value="transfer">🏦 ${tr(L, 'Transfer bank (BNI)', 'Bank transfer (BNI)')}</button>` : ''}
        </div></form>
      <form method="post" action="/app/deposit/tukar" class="form" data-convert data-tp="${tp}"><h4>2 · ${tr(L, 'Tukar saldo menjadi token', 'Convert balance into tokens')}</h4>
        <input type="hidden" name="op" value="${newId('dop')}">
        <label class="field"><span>${tr(L, 'Nominal yang ditukar (Rp)', 'Amount to convert (Rp)')}</span><input type="number" name="idr" min="${tp}" max="${dep}" step="1" required value="${dep}" data-convert-in></label>
        <label class="field"><span>${tr(L, 'Untuk mesin', 'For engine')} ${tip(tr(L, 'Pilih mesin yang akan Anda pakai. Pratinjau menghitung perkiraan halamannya, dan mesin ini menjadi pilihan bawaan saat memeriksa. Token tetap bisa dipakai di semua mesin yang terbuka untuk paket Anda.', 'Choose the engine you will use. The preview estimates its pages, and it becomes your default when checking. Tokens still work on every engine your package unlocks.'))}</span>
          <select name="engine" data-convert-engine>${convertModes.map((m) => html`<option value="${PUBLIC_MODE[m.mode]}" data-tpp="${m.tpp}" ${m.mode === (user.preferredMode ?? 'auto') ? 'selected' : ''}>${PUBLIC_NAME[m.mode]}${m.mode === 'auto' ? tr(L, ' — fleksibel, termurah yang mampu', ' — flexible, cheapest capable') : ''}</option>`)}</select></label>
        <p class="predict">= <b data-convert-out>${fmtNum(L, Math.floor(dep / tp))}</b> token ≈ <b data-convert-pages>—</b> ${tr(L, 'halaman', 'pages')} · <small class="muted">1 token = Rp ${fmtNum(L, tp)}</small></p>
        <button class="btn btn-ghost" type="submit" ${dep < tp ? 'disabled' : ''}>${tr(L, 'Tukar sekarang', 'Convert now')}</button></form>
    </div>
    ${depLed.length ? html`<details class="more"><summary>${tr(L, 'Riwayat deposit', 'Deposit history')}</summary><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Waktu', 'Time')}</th><th>${tr(L, 'Jenis', 'Kind')}</th><th class="n">Rp</th><th>${tr(L, 'Catatan', 'Note')}</th></tr></thead><tbody>${depLed.map((e) => html`<tr><td><small>${fmtDate(L, e.at)}</small></td><td>${({ topup: tr(L, 'isi saldo', 'top-up'), buy: tr(L, 'beli paket', 'package'), convert: tr(L, 'tukar token', 'to tokens'), admin: 'admin', refund: tr(L, 'kembali', 'refund') } as Record<string, string>)[e.kind] ?? e.kind}</td><td class="n ${e.idr < 0 ? 'neg' : 'pos'}">${e.idr > 0 ? '+' : ''}${fmtNum(L, e.idr)}</td><td><small>${e.note}</small></td></tr>`)}</tbody></table></div></details>` : ''}
  </section>
  ${orders.length ? html`<section class="card reveal"><div class="row-between"><h3>${tr(L, 'Invoice terbaru', 'Latest invoices')}</h3><a href="/app/pesanan">${tr(L, 'Semua', 'All')} →</a></div><ul class="clean">${orders.map((o) => html`<li><a href="/app/pesanan/${o.id}"><b>${invoiceNo(o)}</b></a> · ${fmtMoney(L, currencyOf(o), amountOf(o))} · ${statusPill(L, o.status)} <small class="muted">${fmtDate(L, o.createdAt)}</small></li>`)}</ul></section>` : ''}
  <div class="grid g2">
    <section class="card reveal"><h3>${tr(L, 'Bagaimana token dihitung', 'How tokens are counted')}</h3><ol class="steps-mini">
      <li>${raw(tr(L, 'Sebelum AI bekerja, sejumlah token <b>disisihkan</b> dari saldo.', 'Before the AI starts, some tokens are <b>set aside</b> from your balance.'))}</li>
      <li>${raw(tr(L, 'AI memakai <b>token masuk</b> saat membaca naskah dan <b>token keluar</b> saat menulis jawaban; keduanya tercatat per langkah di laporan.', 'The AI uses <b>input tokens</b> when reading the text and <b>output tokens</b> when writing its answer; both are listed per step in the report.'))}</li>
      <li>${raw(tr(L, 'Yang <b>dipotong</b> hanya pemakaian nyata; sisanya <b>kembali</b> otomatis. Pemeriksaan gagal tidak dipotong.', 'Only real usage is <b>deducted</b>; the rest <b>returns</b> automatically. Failed checks are not deducted.'))}</li></ol></section>
    <section class="card reveal"><h3>${tr(L, 'Prediksi halaman untuk saldo Anda', 'Page estimate for your balance')}</h3>${modePagesTable(L, predictByMode(bal, billing, eng), billing.wordsPerPage)}</section>
  </div>
  <section class="card reveal"><h3>${tr(L, 'Tarif terbuka per model AI', 'Public rates per AI model')}</h3><p class="muted">${tr(L, 'Setiap laporan menampilkan token masuk & keluar tiap panggilan AI, sehingga tagihan bisa Anda hitung ulang sendiri dengan tarif ini.', 'Every report lists the input & output tokens of each AI call, so you can recompute the charge yourself with these rates.')}</p>${rateTable(L, rateCard(billing, eng))}</section>
  <section class="card reveal"><h3>${tr(L, 'Buku besar token', 'Token ledger')}</h3>${led.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Waktu', 'Time')}</th><th>${tr(L, 'Jenis', 'Kind')}</th><th class="n">Token</th><th>${tr(L, 'Catatan', 'Note')}</th></tr></thead><tbody>${led.map((e) => html`<tr><td><small>${fmtDate(L, e.at)}</small></td><td>${({ reserve: tr(L, 'pesan', 'reserve'), refund: tr(L, 'kembali', 'refund'), purchase: tr(L, 'beli', 'purchase'), admin: 'admin', welcome: tr(L, 'sambutan', 'welcome') } as Record<string, string>)[e.kind] ?? e.kind}</td><td class="n ${e.tokens < 0 ? 'neg' : 'pos'}">${e.tokens > 0 ? '+' : ''}${fmtNum(L, e.tokens)}</td><td><small>${e.note}</small></td></tr>`)}</tbody></table></div>` : html`<p class="muted">${tr(L, 'Belum ada transaksi.', 'No transactions yet.')}</p>`}</section>`;
  return c.html(shell(c, tr(L, 'Token', 'Tokens'), body, 'credits'));
});

app.get('/app/kuota', (c) => c.redirect('/app/token'));

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
  ${purgeNotice(L)}
  ${flash(L, ok ? tr(L, 'Tersimpan.', 'Saved.') : null, err === 'pass' ? tr(L, 'Sandi lama salah.', 'Wrong current password.') : null)}
  <div class="grid g2">
    <form method="post" action="/app/pengaturan" class="card form reveal"><h3>${tr(L, 'Profil & privasi', 'Profile & privacy')}</h3>
      <label class="field"><span>${tr(L, 'Nama', 'Name')}</span><input name="name" value="${user.name}" maxlength="80" required></label>
      <label class="field"><span>${tr(L, 'Bahasa portal', 'Portal language')}</span><select name="lang"><option value="id" ${user.lang === 'id' ? 'selected' : ''}>Bahasa Indonesia</option><option value="en" ${user.lang === 'en' ? 'selected' : ''}>English</option></select></label>
      <label class="field"><span>${tr(L, 'Masa simpan teks', 'Text retention')} ${tip(tr(L, `Setelah masa ini teks naskah dan rincian per kalimatnya dihapus lebih awal (paling lama ${PURGE_DAYS} hari). Riwayat kerja dan angka hasilnya tidak pernah dihapus.`, `After this the text and its per-sentence detail are deleted early (at most ${PURGE_DAYS} days). Your work history and result figures are never deleted.`))}</span><select name="retention">${[0, 7, 30, 90].map((d) => html`<option value="${d}" ${ret === d ? 'selected' : ''}>${d === 0 ? tr(L, 'Hapus segera setelah laporan jadi', 'Delete as soon as the report is ready') : `${d} ${tr(L, 'hari', 'days')}`}</option>`)}</select></label>
      <button class="btn btn-primary" type="submit">${tr(L, 'Simpan', 'Save')}</button></form>
    <form method="post" action="/app/pengaturan/sandi" class="card form reveal"><h3>${tr(L, 'Ganti sandi', 'Change password')}</h3>
      <label class="field"><span>${tr(L, 'Sandi lama', 'Current password')}</span><input type="password" name="old" required autocomplete="current-password"></label>
      <label class="field"><span>${tr(L, 'Sandi baru (min. 8)', 'New password (min. 8)')}</span><input type="password" name="new" required minlength="8" autocomplete="new-password" data-strength></label>
      <div class="strength" aria-hidden="true"><i></i></div>
      <button class="btn btn-primary" type="submit">${tr(L, 'Ganti sandi', 'Change password')}</button>
      <p class="muted">${tr(L, 'Mengganti sandi mengeluarkan semua perangkat lain.', 'Changing the password signs out every other device.')}</p></form>
    <form method="post" action="/app/pengaturan/penagihan" class="card form reveal" data-billing-profile><h3>${tr(L, 'Profil penagihan (invoice)', 'Billing profile (invoices)')}</h3>
      <p class="muted small">${tr(L, 'Untuk perusahaan, lembaga, atau pembeli luar negeri: data ini tampil di bagian „Kepada“ setiap invoice baru dan di kepala laporan.', 'For companies, institutions or buyers abroad: this appears under “Bill to” on every new invoice and in report headers.')}</p>
      <label class="field"><span>${tr(L, 'Nama perusahaan / lembaga', 'Company / organisation')}</span><input name="company" value="${user.billing?.company ?? ''}" maxlength="120" autocomplete="organization"></label>
      <div class="grid g2">
        <label class="field"><span>${tr(L, 'NPWP / VAT / Tax ID', 'Tax / VAT ID')}</span><input name="taxId" value="${user.billing?.taxId ?? ''}" maxlength="40"></label>
        <label class="field"><span>${tr(L, 'Nomor PO (opsional)', 'PO number (optional)')}</span><input name="po" value="${user.billing?.po ?? ''}" maxlength="40"></label>
      </div>
      <label class="field"><span>${tr(L, 'Alamat', 'Address')}</span><input name="address" value="${user.billing?.address ?? ''}" maxlength="200" autocomplete="street-address"></label>
      <div class="grid g3">
        <label class="field"><span>${tr(L, 'Kota', 'City')}</span><input name="city" value="${user.billing?.city ?? ''}" maxlength="80" autocomplete="address-level2"></label>
        <label class="field"><span>${tr(L, 'Kode pos', 'Postal code')}</span><input name="postal" value="${user.billing?.postal ?? ''}" maxlength="20" autocomplete="postal-code"></label>
        <label class="field"><span>${tr(L, 'Negara', 'Country')}</span><input name="country" value="${user.billing?.country ?? (user.country === 'ID' ? 'Indonesia' : user.country ?? '')}" maxlength="60" autocomplete="country-name"></label>
      </div>
      <label class="field"><span>${tr(L, 'E-mail penagihan', 'Billing e-mail')}</span><input type="email" name="email" value="${user.billing?.email ?? ''}" maxlength="120"></label>
      <button class="btn btn-primary" type="submit">${tr(L, 'Simpan profil penagihan', 'Save billing profile')}</button>
    </form>
    <section class="card reveal"><h3>${tr(L, 'Verifikasi 2 langkah', 'Two-step verification')}</h3><p>${user.totp ? html`<span class="pill p-hum">✓ ${tr(L, 'Aktif', 'On')}</span>` : html`<span class="pill p-unk">${tr(L, 'Belum aktif', 'Off')}</span>`}</p>${user.totp ? '' : html`<a class="btn btn-ghost" href="/2fa/pasang">${tr(L, 'Aktifkan 2FA', 'Turn on 2FA')}</a>`}</section>
  </div>`;
  return c.html(shell(c, tr(L, 'Pengaturan', 'Settings'), body, 'settings'));
});

app.post('/app/pengaturan', async (c) => {
  const user = c.get('user')!;
  const f = (await c.req.parseBody()) as Record<string, string>;
  const ret = Number(f.retention);
  await updateUser(c.get('store'), user.id, (u) => ({ ...u, name: String(f.name ?? u.name).slice(0, 80) || u.name, lang: f.lang === 'en' ? 'en' : 'id', retentionDays: [0, 7, 30, 90].includes(ret) ? ret : u.retentionDays }));
  return c.redirect('/app/pengaturan?ok=1');
});

app.post('/app/pengaturan/penagihan', async (c) => {
  const user = c.get('user')!;
  const f = (await c.req.parseBody()) as Record<string, string>;
  const t = (k: string, n: number) => String(f[k] ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n) || undefined;
  const email = t('email', 120);
  const billing = { company: t('company', 120), taxId: t('taxId', 40), po: t('po', 40), address: t('address', 200), city: t('city', 80), postal: t('postal', 20), country: t('country', 60), email: email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : undefined };
  await updateUser(c.get('store'), user.id, (u) => ({ ...u, billing }));
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
registerMemberPayments(app);
registerMemberPaypal(app);

export { textKey };
