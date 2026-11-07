/** Portal admin. Yang wajib diisi hanya kunci API Claude; semua lainnya punya nilai bawaan. */
import { Hono } from 'hono';
import { html, raw, jsonScript, type Raw } from '../lib/html.ts';
import { tr, fmtNum, fmtDate, fmtUsd, LABELS, MODE_INFO, type Lang, type LabelKey } from '../lib/i18n.ts';
import { page, pageHead, guide, flash, stat, labelPill, tip } from '../pages/ui.ts';
import { portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import { isAdmin, getUser, updateUser, findByEmail, type User } from '../data/users.ts';
import { getEngine, getBilling, spendToday, KEY_DOC, wibDate, DEFAULT_ENGINE, DEFAULT_BILLING, MARKUP_MIN, MARKUP_MAX, type EngineSettings, type KeyRecord, type BillingSettings, type Effort } from '../data/settings.ts';
import { estimateTokens, hardBoundUsd, predictByMode, packagePrice, tokenPriceIdr, tokenCostIdr, minRevenueMultiple, freeQuotaForecast, FREE_QUOTA } from '../engine/pricing.ts';
import { registerAdminAffiliate } from './affiliate.ts';
import { getAffiliateSettings } from '../data/affiliate.ts';
import { seal, newId, hashPassword } from '../lib/crypto.ts';
import { clientFor } from '../engine/claude.ts';
import { audit, type AuditEntry } from '../data/audit.ts';
import { balanceOf, credit, ledger } from '../data/wallet.ts';
import { createCheck } from './checks.ts';
import { registerAdminPayments } from './payments.ts';
import { depositBalance, adminAdjust } from '../data/deposit.ts';
import { reportKey, checkKey, type ReportSummary, type CheckDoc } from '../engine/cascade.ts';
import { invTs } from '../lib/store.ts';
import { runBackup } from '../cron.ts';

export const admin = new Hono<HonoEnv>();

admin.use('/admin/*', guard);
admin.use('/admin', guard);
admin.use('/api/admin/*', guard);

async function guard(c: Ctx, next: () => Promise<void>) {
  const u = c.get('user');
  if (!u) return c.redirect('/masuk');
  if (!isAdmin(u)) return c.redirect('/app');
  if (!u.totp) return c.redirect('/2fa/pasang');
  if (c.get('sess')?.t !== 1) return c.redirect('/masuk');
  await next();
}

function shell(c: Ctx, title: string, body: Raw, active: string): string {
  return page({ L: portalLang(c), title, body, user: c.get('user'), area: 'admin', active });
}

const me = (c: Ctx) => c.get('user')!;

/* ── dasbor ─────────────────────────────────────────────────────────── */

admin.get('/admin', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const eng = await getEngine(store);
  const key = await store.get<KeyRecord>(KEY_DOC);
  const billingDoc = await store.get<BillingSettings>('k/billing.json');
  const tested = await store.get<{ at: number }>('k/engine-tested.json');
  const spent = await spendToday(store);
  const { items: users } = await store.list('i/users/', { limit: 1000 });
  const { items: reps } = await store.list<{ title: string; label: LabelKey; ai: number; at: number }>('i/reports/', { limit: 8 });
  const { items: active } = await store.list('i/active/', { limit: 100 });
  const { items: review } = await store.list('i/order-review/', { limit: 200 });
  const { items: losses } = await store.list('i/loss/', { limit: 50 });
  const steps = [
    { done: true, text: tr(L, 'Akun pemilik + 2FA', 'Owner account + 2FA'), href: '/admin' },
    { done: Boolean(key?.primary), text: tr(L, '<b>Tempel kunci API Claude</b> — satu-satunya isian wajib', '<b>Paste the Claude API key</b> — the only required input'), href: '/admin/kunci-api' },
    { done: Boolean(tested), text: tr(L, '<b>Uji mesin</b> dengan naskah contoh', '<b>Test the engine</b> with a sample text'), href: '/admin/mesin' },
    { done: Boolean(billingDoc?.manualText), text: tr(L, '<b>Atur markup</b> (5–500×) — semua harga ikut berubah', '<b>Set the markup</b> (5–500×) — every price follows'), href: '/admin/harga' },
  ];
  const body = html`
  ${pageHead(tr(L, 'Dasbor admin', 'Admin dashboard'), tr(L, 'Semua berjalan sendiri — di sini Anda memantau dan mengatur.', 'Everything runs by itself — here you monitor and adjust.'))}
  <section class="card onboarding reveal"><div class="row-between"><h3>${tr(L, 'Langkah awal', 'First steps')}</h3><span class="progress-text">${steps.filter((s) => s.done).length}/${steps.length}</span></div><div class="progress"><i style="--w:${(steps.filter((s) => s.done).length / steps.length) * 100}%"></i></div>
  <ol class="todo">${steps.map((s) => html`<li class="${s.done ? 'done' : ''}"><a href="${s.href}"><span class="tick">${s.done ? '✓' : ''}</span><span>${raw(s.text)}</span></a></li>`)}</ol></section>
  <div class="grid g4">
    ${stat(tr(L, 'Biaya Claude hari ini', 'Claude cost today'), fmtUsd(spent), tr(L, `plafon ${fmtUsd(eng.dailyCapUsd)}`, `cap ${fmtUsd(eng.dailyCapUsd)}`))}
    ${stat(tr(L, 'Member', 'Members'), fmtNum(L, users.length))}
    ${stat(tr(L, 'Pemeriksaan berjalan', 'Running checks'), fmtNum(L, active.length))}
    ${stat(tr(L, 'Bukti transfer menunggu', 'Proofs awaiting review'), fmtNum(L, review.length), tr(L, 'Pesanan → Perlu diperiksa', 'Orders → To review'))}
  </div>
  ${review.length ? html`<a class="flash err reveal" href="/admin/pesanan?s=review">🧾 ${tr(L, `${review.length} bukti transfer menunggu verifikasi — buka antrean`, `${review.length} transfer proofs await verification — open the queue`)} →</a>` : ''}
  ${losses.length ? html`<div class="flash err reveal">⚠ ${tr(L, `${losses.length} pemeriksaan tercatat sebagai peringatan rugi — periksa harga di menu Harga & token.`, `${losses.length} checks logged as loss alerts — review pricing under Pricing & tokens.`)}</div>` : html`<div class="flash ok reveal">✓ ${tr(L, 'Tidak ada pemeriksaan yang merugi.', 'No loss-making checks.')}</div>`}
  <div class="spend-meter reveal"><div class="row-between"><small>${tr(L, 'Pemakaian plafon harian', 'Daily cap usage')}</small><small>${Math.min(100, Math.round((spent / Math.max(0.01, eng.dailyCapUsd)) * 100))}%</small></div><div class="progress ${spent / eng.dailyCapUsd > 0.8 ? 'warn' : ''}"><i style="--w:${Math.min(100, (spent / Math.max(0.01, eng.dailyCapUsd)) * 100)}%"></i></div></div>
  <section class="card reveal"><div class="row-between"><h3>${tr(L, 'Laporan terbaru', 'Latest reports')}</h3><a href="/admin/laporan">${tr(L, 'Semua', 'All')} →</a></div>
  ${reps.length ? html`<ul class="clean">${reps.map((r) => html`<li>${labelPill(L, r.meta.label)} <a href="/app/laporan/${r.id}">${r.meta.title}</a> <small class="muted">AI ${r.meta.ai}% · ${fmtDate(L, r.meta.at)}</small></li>`)}</ul>` : html`<p class="muted">${tr(L, 'Belum ada.', 'None yet.')}</p>`}</section>`;
  return c.html(shell(c, tr(L, 'Dasbor admin', 'Admin dashboard'), body, 'dash'));
});

/* ── kunci API Claude ───────────────────────────────────────────────── */

admin.get('/admin/kunci-api', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const rec = await store.get<KeyRecord>(KEY_DOC);
  const eng = await getEngine(store);
  const ok = c.req.query('ok');
  const err = c.req.query('err');
  const body = html`
  ${pageHead(tr(L, 'Kunci API Claude', 'Claude API key'), tr(L, 'Satu-satunya isian wajib. Kunci dienkripsi AES-256-GCM dan tidak pernah ditampilkan lagi.', 'The only required input. The key is encrypted with AES-256-GCM and never shown again.'))}
  ${flash(L, ok ? tr(L, `Kunci tersimpan dan sah. Model tersedia: ${ok}.`, `Key saved and valid. Models available: ${ok}.`) : null, err ? decodeURIComponent(err) : null)}
  ${guide(L, 'key', tr(L, 'Dari mana kuncinya?', 'Where does the key come from?'), [
    tr(L, 'Buka <b>platform.claude.com</b> (Console Anthropic) → API Keys → Create Key.', 'Open <b>platform.claude.com</b> (Anthropic Console) → API Keys → Create Key.'),
    tr(L, 'Salin kunci <code>sk-ant-…</code>, tempel di bawah, tekan <b>Uji &amp; simpan</b>.', 'Copy the <code>sk-ant-…</code> key, paste it below, press <b>Test &amp; save</b>.'),
    tr(L, 'Di Console, pasang juga <b>batas belanja bulanan</b> sebagai pengaman kedua.', 'In the Console, also set a <b>monthly spend limit</b> as a second safety net.'),
  ])}
  <div class="grid g2">
    <section class="card reveal"><h3>${tr(L, 'Status', 'Status')}</h3>
      ${rec?.primary
        ? html`<p><span class="pill p-hum">✓ ${tr(L, 'Terpasang', 'Installed')}</span> <code>sk-ant-…${rec.last4}</code></p><p class="muted">${tr(L, 'Disimpan', 'Saved')} ${fmtDate(L, rec.savedAt ?? 0)}</p>${rec.models?.length ? html`<p class="muted">${tr(L, 'Model terlihat', 'Models seen')}: ${rec.models.join(', ')}</p>` : ''}`
        : html`<p><span class="pill p-ai">${tr(L, 'Belum ada kunci', 'No key yet')}</span></p><p class="muted">${tr(L, 'Tanpa kunci, pemeriksaan belum bisa berjalan.', 'Without a key, checks cannot run.')}</p>`}
      <p class="muted">${tr(L, 'Model per tingkat', 'Model per tier')}: Haiku <code>${eng.models.t1}</code> · Sonnet <code>${eng.models.t2}</code> · Opus <code>${eng.models.t3}</code></p>
    </section>
    <form method="post" action="/admin/kunci-api" class="card form reveal" data-busy-form><h3>${rec?.primary ? tr(L, 'Ganti kunci', 'Replace key') : tr(L, 'Pasang kunci', 'Install key')}</h3>
      <label class="field"><span>${tr(L, 'Kunci API', 'API key')}</span><input type="password" name="key" required autocomplete="off" spellcheck="false" placeholder="sk-ant-…" pattern="sk-ant-.{10,}"></label>
      <button class="btn btn-primary" type="submit" data-busy="${tr(L, 'Menguji kunci…', 'Testing the key…')}">${tr(L, 'Uji & simpan', 'Test & save')}</button>
    </form>
  </div>`;
  return c.html(shell(c, tr(L, 'Kunci API Claude', 'Claude API key'), body, 'key'));
});

admin.post('/admin/kunci-api', async (c) => {
  const L = portalLang(c);
  const key = String((await c.req.parseBody()).key ?? '').trim();
  if (!/^sk-ant-[A-Za-z0-9_-]{10,}$/.test(key)) return c.redirect(`/admin/kunci-api?err=${encodeURIComponent(tr(L, 'Format kunci tidak dikenali (harus diawali sk-ant-).', 'Unrecognised key format (must start with sk-ant-).'))}`);
  if (!c.env.MASTER_KEY) return c.redirect(`/admin/kunci-api?err=${encodeURIComponent('MASTER_KEY belum dipasang di Worker.')}`);
  const store = c.get('store');
  const eng = await getEngine(store);
  let models: string[] = [];
  try {
    const client = clientFor(c.env, key);
    for await (const m of client.models.list({ limit: 100 })) models.push(m.id);
  } catch {
    return c.redirect(`/admin/kunci-api?err=${encodeURIComponent(tr(L, 'Kunci ditolak oleh API Anthropic. Periksa kembali kuncinya.', 'The Anthropic API rejected the key. Please check it.'))}`);
  }
  const wanted = [eng.models.t1, eng.models.t2, eng.models.t3];
  const missing = wanted.filter((m) => !models.includes(m));
  models = models.filter((m) => /haiku|sonnet|opus|fable/.test(m)).slice(0, 12);
  const rec: KeyRecord = { primary: await seal(c.env.MASTER_KEY, { key }, 'secrets'), last4: key.slice(-4), savedAt: Date.now(), savedBy: me(c).id, models };
  await store.put(KEY_DOC, rec);
  await audit(store, me(c).id, 'anthropic_key.saved', { last4: rec.last4, missing });
  if (missing.length) return c.redirect(`/admin/kunci-api?err=${encodeURIComponent(tr(L, `Kunci tersimpan, tetapi model ini tidak terlihat: ${missing.join(', ')}. Ubah ID model di menu Mesin bila perlu.`, `Key saved, but these models are not visible: ${missing.join(', ')}. Change the model IDs under Engine if needed.`))}`);
  return c.redirect(`/admin/kunci-api?ok=${encodeURIComponent(wanted.join(', '))}`);
});

/* ── mesin ──────────────────────────────────────────────────────────── */

const EFFORTS: Effort[] = ['low', 'medium', 'high', 'xhigh', 'max'];

admin.get('/admin/mesin', async (c) => {
  const L = portalLang(c);
  const e = await getEngine(c.get('store'));
  const t = e.thresholds;
  const num = (name: string, v: number, step = '0.01', hint = '') => html`<label class="field"><span>${name} ${hint ? tip(hint) : ''}</span><input type="number" step="${step}" name="${name}" value="${v}"></label>`;
  const effortSel = (name: string, v: Effort) => html`<select name="${name}">${EFFORTS.map((x) => html`<option ${x === v ? 'selected' : ''}>${x}</option>`)}</select>`;
  const body = html`
  ${pageHead(tr(L, 'Mesin & ambang', 'Engine & thresholds'), tr(L, 'Nilai bawaan sudah bekerja. Ubah hanya bila hasil benchmark menyarankan.', 'Defaults already work. Change only when benchmark results suggest so.'), html`<form method="post" action="/admin/mesin/uji"><button class="btn btn-primary" type="submit">▶ ${tr(L, 'Uji mesin', 'Test engine')}</button></form>`)}
  ${flash(L, c.req.query('ok') ? tr(L, 'Setelan tersimpan.', 'Settings saved.') : null, null)}
  <form method="post" action="/admin/mesin" class="form">
    <section class="card reveal"><h3>${tr(L, 'Model per tingkat (termurah dulu)', 'Model per tier (cheapest first)')}</h3>
      <div class="grid g3">
        <label class="field"><span>${tr(L, 'Tingkat 1', 'Tier 1')} · Haiku</span><input name="t1" value="${e.models.t1}"></label>
        <label class="field"><span>${tr(L, 'Tingkat 2', 'Tier 2')} · Sonnet</span><input name="t2" value="${e.models.t2}"></label>
        <label class="field"><span>${tr(L, 'Tingkat 3', 'Tier 3')} · Opus</span><input name="t3" value="${e.models.t3}"></label>
        <label class="field"><span>Effort ${tr(L, 'tingkat 1 (Ultra)', 'tier 1 (Ultra)')}</span>${effortSel('e1', e.effort.t1)}</label>
        <label class="field"><span>Effort ${tr(L, 'tingkat 2', 'tier 2')}</span>${effortSel('e2', e.effort.t2)}</label>
        <label class="field"><span>Effort ${tr(L, 'tingkat 3', 'tier 3')}</span>${effortSel('e3', e.effort.t3)}</label>
      </div></section>
    <section class="card reveal"><h3>${tr(L, 'Ambang (blueprint H & I)', 'Thresholds (blueprint H & I)')}</h3>
      <div class="grid g4">
        ${num('aiCls', t.aiCls, '0.01', tr(L, 'Kalimat ≥ nilai ini = AI', 'Sentence ≥ this = AI'))}${num('humCls', t.humCls, '0.01', tr(L, 'Kalimat ≤ nilai ini = manusia', 'Sentence ≤ this = human'))}
        ${num('gate1Lo', t.gate1Lo)}${num('gate1Hi', t.gate1Hi)}${num('greyLo', t.greyLo)}${num('greyHi', t.greyHi)}${num('t3Lo', t.t3Lo)}${num('t3Hi', t.t3Hi)}
        ${num('labelAi', t.labelAi)}${num('labelHum', t.labelHum)}${num('partlyShare', t.partlyShare)}${num('maxOpusSentences', e.maxOpusSentences, '1')}
      </div></section>
    <section class="card reveal"><h3>${tr(L, 'Biaya, kurs & privasi', 'Cost, rate & privacy')}</h3>
      <div class="grid g4">
        ${num('dailyCapUsd', e.dailyCapUsd, '1', tr(L, 'Di atas plafon, pemeriksaan baru ditolak sampai besok.', 'Above the cap, new checks are refused until tomorrow.'))}
        ${num('retentionDays', e.retentionDays, '1')}${num('fx', e.fx, '100', tr(L, 'Kurs Rp per US$ untuk menghitung harga Rupiah (token, paket, per halaman) dan modal.', 'Rp per US$ rate used for Rupiah prices (token, packages, per page) and cost.'))}
        <label class="check"><input type="checkbox" name="regen" ${e.regen ? 'checked' : ''}> <span>${tr(L, 'Uji regenerasi (S3)', 'Regeneration test (S3)')}</span></label>
        <label class="check"><input type="checkbox" name="rubricVerify" ${e.rubricVerify ? 'checked' : ''}> <span>${tr(L, 'Verifikasi rubrik oleh Sonnet bila ragu', 'Sonnet rubric verification when unsure')}</span></label>
      </div></section>
    <div class="form-end"><button class="btn btn-primary" type="submit">${tr(L, 'Simpan setelan', 'Save settings')}</button> <button class="btn btn-ghost" name="reset" value="1" type="submit">${tr(L, 'Kembalikan bawaan', 'Restore defaults')}</button></div>
  </form>`;
  return c.html(shell(c, tr(L, 'Mesin', 'Engine'), body, 'engine'));
});

admin.post('/admin/mesin', async (c) => {
  const store = c.get('store');
  const f = (await c.req.parseBody()) as Record<string, string>;
  const n = (k: string, d: number, lo = 0, hi = 1e9) => {
    const v = Number(f[k]);
    return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
  };
  const ef = (k: string, d: Effort): Effort => (EFFORTS.includes(f[k] as Effort) ? (f[k] as Effort) : d);
  const cur = await getEngine(store);
  const next: EngineSettings = f.reset
    ? structuredClone(DEFAULT_ENGINE)
    : {
        ...cur,
        models: { t1: f.t1?.trim() || cur.models.t1, t2: f.t2?.trim() || cur.models.t2, t3: f.t3?.trim() || cur.models.t3 },
        effort: { ...cur.effort, t1: ef('e1', cur.effort.t1), t2: ef('e2', cur.effort.t2), t3: ef('e3', cur.effort.t3) },
        thresholds: {
          aiCls: n('aiCls', cur.thresholds.aiCls, 0.5, 0.99), humCls: n('humCls', cur.thresholds.humCls, 0.01, 0.5),
          gate1Lo: n('gate1Lo', cur.thresholds.gate1Lo, 0, 0.5), gate1Hi: n('gate1Hi', cur.thresholds.gate1Hi, 0.5, 1),
          greyLo: n('greyLo', cur.thresholds.greyLo, 0, 0.5), greyHi: n('greyHi', cur.thresholds.greyHi, 0.5, 1),
          t3Lo: n('t3Lo', cur.thresholds.t3Lo, 0, 0.5), t3Hi: n('t3Hi', cur.thresholds.t3Hi, 0.5, 1),
          labelAi: n('labelAi', cur.thresholds.labelAi, 0.5, 1), labelHum: n('labelHum', cur.thresholds.labelHum, 0, 0.5), partlyShare: n('partlyShare', cur.thresholds.partlyShare, 0, 1),
        },
        maxOpusSentences: Math.round(n('maxOpusSentences', cur.maxOpusSentences, 0, 500)),
        dailyCapUsd: n('dailyCapUsd', cur.dailyCapUsd, 0, 100_000),
        retentionDays: Math.round(n('retentionDays', cur.retentionDays, 0, 90)),
        fx: n('fx', cur.fx, 1, 1e6),
        regen: Boolean(f.regen),
        rubricVerify: Boolean(f.rubricVerify),
      };
  next.updatedAt = Date.now();
  next.updatedBy = me(c).id;
  await store.put('k/engine.json', next);
  await audit(store, me(c).id, 'engine.saved', { models: next.models, thresholds: next.thresholds, cap: next.dailyCapUsd });
  return c.redirect('/admin/mesin?ok=1');
});

const SAMPLE_TEXT = `Literasi Digital sebagai Benteng Generasi Muda dari Hoaks

Minggu lalu adik saya yang masih kelas 8 menunjukkan pesan berantai tentang beras plastik. Ia percaya karena pesannya diteruskan oleh tiga grup keluarga sekaligus. Saya baru sadar, kami sering menganggap sesuatu benar hanya karena banyak orang membagikannya.

Di sekolah kami, hampir semua murid punya ponsel sendiri. Survei kecil OSIS pada Agustus 2026 menemukan 41 dari 60 siswa pernah membagikan berita tanpa membuka tautannya. Angka itu membuat saya kaget, karena kami juga yang paling sering mengejek orang tua soal hoaks.

Di era digital yang terus berkembang ini, literasi digital memainkan peran yang sangat penting dalam kehidupan generasi muda. Selain itu, kemampuan memilah informasi tidak hanya membantu individu, tetapi juga berkontribusi pada terciptanya masyarakat yang lebih kritis dan bertanggung jawab. Secara keseluruhan, literasi digital merupakan fondasi yang kuat bagi masa depan bangsa.

Karena itu saya mengusulkan piket cek fakta bergilir di setiap kelas setiap Senin. Dua siswa memilih satu kabar yang ramai di grup, lalu memeriksanya lewat situs cek fakta dan berita resmi. Hasilnya ditempel di mading dan dibagikan ke grup kelas, supaya kebiasaan memeriksa sumber tumbuh dari kelas lalu terbawa ke rumah.`;

admin.post('/admin/mesin/uji', async (c) => {
  const store = c.get('store');
  const doc = await createCheck(c.env, store, me(c), { text: SAMPLE_TEXT, title: 'Uji mesin — Literasi Digital', author: 'Contoh', genre: 'essay', level: 'senior_high', reportLang: portalLang(c), rubricId: 'lomba-esai', mode: 'auto' }, portalLang(c), { free: true });
  await store.put('k/engine-tested.json', { at: Date.now(), checkId: doc.id });
  await audit(store, me(c).id, 'engine.test', { checkId: doc.id });
  return c.redirect(`/app/proses/${doc.id}`);
});

/* ── benchmark ──────────────────────────────────────────────────────── */

interface BenchItem {
  n: number;
  text: string;
  label: 'human' | 'ai' | 'mixed' | 'paraphrased';
  lang: string;
  genre: string;
}

admin.get('/admin/benchmark', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const { items: sets } = await store.list<{ name: string; n: number; at: number }>('i/bench-sets/', { limit: 50 });
  const sel = c.req.query('set');
  let results: Raw = html``;
  if (sel) {
    const meta = sets.find((s) => s.id === sel);
    const run = c.req.query('run') ?? '';
    const rows: { truth: string; label: LabelKey; lang: string; words: number; cost: number }[] = [];
    if (run) {
      for await (const k of store.keys(`c/bench-results/${sel}/${run}/`)) {
        const r = await store.get<{ truth: string; label: LabelKey; lang: string; words: number; cost: number }>(k.key);
        if (r) rows.push(r);
      }
    }
    const m = metrics(rows);
    results = html`<section class="card reveal" data-bench="${sel}" data-bench-n="${meta?.meta.n ?? 0}" data-bench-run="${run}">
      <div class="row-between"><h3>${meta?.meta.name ?? sel} · ${fmtNum(L, meta?.meta.n ?? 0)} ${tr(L, 'teks', 'texts')}</h3><button class="btn btn-primary" type="button" data-bench-start>${run ? tr(L, 'Lanjutkan / ulang', 'Continue / rerun') : tr(L, 'Jalankan benchmark', 'Run benchmark')}</button></div>
      <div class="batch-progress" data-bench-progress hidden><div class="progress"><i data-bp style="--w:0%"></i></div><small class="muted" data-bp-text></small></div>
      ${rows.length
        ? html`<div class="grid g4">${stat(tr(L, 'Ketepatan (zona yakin)', 'Accuracy (confident zone)'), `${(m.accuracy * 100).toFixed(1)}%`)}${stat(tr(L, 'Salah tuduh', 'False accusation'), `${(m.fpr * 100).toFixed(1)}%`)}${stat(tr(L, 'Cakupan keputusan', 'Decision coverage'), `${(m.coverage * 100).toFixed(1)}%`)}${stat(tr(L, 'Biaya rata-rata', 'Average cost'), fmtUsd(m.avgCost))}</div>
          <p class="muted">${tr(L, `Diuji ${rows.length} teks. Target: ketepatan ≥ 98%, salah tuduh ≤ 1%, cakupan ≥ 85%.`, `${rows.length} texts tested. Targets: accuracy ≥ 98%, false accusation ≤ 1%, coverage ≥ 85%.`)}</p>
          <form method="post" action="/admin/benchmark/terbit"><input type="hidden" name="set" value="${sel}"><input type="hidden" name="run" value="${run}"><button class="btn btn-ghost" type="submit">${tr(L, 'Terbitkan ke halaman /akurasi', 'Publish to the /accuracy page')}</button></form>`
        : ''}
    </section>`;
  }
  const body = html`
  ${pageHead(tr(L, 'Benchmark akurasi', 'Accuracy benchmark'), tr(L, 'Cara jujur memastikan hasil mendekati 100%: ukur pada teks yang labelnya diketahui.', 'The honest way to get close to 100%: measure on texts whose labels are known.'))}
  ${flash(L, c.req.query('ok') ? tr(L, 'Tersimpan.', 'Saved.') : null, null)}
  ${guide(L, 'bench', tr(L, 'Menyiapkan benchmark', 'Preparing a benchmark'), [
    tr(L, 'Satu baris JSON per teks: <code>{"text":"…","label":"human|ai|mixed|paraphrased","lang":"id","genre":"essay"}</code>.', 'One JSON line per text: <code>{"text":"…","label":"human|ai|mixed|paraphrased","lang":"id","genre":"essay"}</code>.'),
    tr(L, 'Teks manusia: tulisan sebelum 2022 yang berlisensi/berizin. Teks AI: dari banyak model dan gaya prompt.', 'Human texts: pre-2022 writing that is licensed/consented. AI texts: from many models and prompt styles.'),
    tr(L, 'Benchmark memakai kunci API yang sama dan tidak memotong token member. Mulai dari 50–100 teks untuk menguji biaya.', 'The benchmark uses the same API key and no member credits. Start with 50–100 texts to gauge cost.'),
  ])}
  <form method="post" action="/admin/benchmark" class="card form reveal"><h3>${tr(L, 'Set baru', 'New set')}</h3>
    <label class="field"><span>${tr(L, 'Nama set', 'Set name')}</span><input name="name" required maxlength="80" placeholder="ACA-Bench ID v1"></label>
    <label class="field"><span>JSONL</span><textarea name="jsonl" rows="8" required spellcheck="false" class="mono"></textarea></label>
    <button class="btn btn-primary" type="submit">${tr(L, 'Simpan set', 'Save set')}</button></form>
  ${sets.length ? html`<section class="card reveal"><h3>${tr(L, 'Set tersimpan', 'Saved sets')}</h3><ul class="clean">${sets.map((s) => html`<li><a href="/admin/benchmark?set=${s.id}">${s.meta.name}</a> · ${fmtNum(L, s.meta.n)} ${tr(L, 'teks', 'texts')} <small class="muted">${fmtDate(L, s.meta.at)}</small></li>`)}</ul></section>` : ''}
  ${results}
  ${jsonScript('i18n-bench', { running: tr(L, 'Menguji', 'Testing'), of: tr(L, 'dari', 'of'), done: tr(L, 'Selesai — memuat hasil…', 'Done — loading results…') })}`;
  return c.html(shell(c, 'Benchmark', body, 'bench'));
});

function metrics(rows: { truth: string; label: LabelKey; cost: number }[]) {
  const truthAi = (t: string) => t === 'ai' || t === 'paraphrased';
  let decided = 0;
  let correct = 0;
  let humans = 0;
  let falseAcc = 0;
  let cost = 0;
  for (const r of rows) {
    cost += r.cost || 0;
    if (r.truth === 'human') {
      humans += 1;
      if (r.label === 'ai' || r.label === 'partly') falseAcc += 1;
    }
    if (r.label === 'ai' || r.label === 'human') {
      decided += 1;
      if ((r.label === 'ai' && truthAi(r.truth)) || (r.label === 'human' && r.truth === 'human')) correct += 1;
    } else if (r.label === 'partly' && (r.truth === 'mixed' || truthAi(r.truth))) {
      decided += 1;
      correct += 1;
    }
  }
  return { accuracy: decided ? correct / decided : 0, fpr: humans ? falseAcc / humans : 0, coverage: rows.length ? decided / rows.length : 0, avgCost: rows.length ? cost / rows.length : 0 };
}

admin.post('/admin/benchmark', async (c) => {
  const store = c.get('store');
  const f = (await c.req.parseBody()) as Record<string, string>;
  const id = newId('bench');
  const items: BenchItem[] = [];
  for (const line of String(f.jsonl ?? '').split('\n')) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line) as Partial<BenchItem>;
      if (typeof o.text === 'string' && ['human', 'ai', 'mixed', 'paraphrased'].includes(String(o.label))) {
        items.push({ n: items.length, text: o.text.slice(0, 100_000), label: o.label as BenchItem['label'], lang: String(o.lang ?? ''), genre: String(o.genre ?? 'general') });
      }
    } catch {
      /* baris rusak dilewati */
    }
  }
  for (const it of items) await store.put(`c/bench/${id}/${String(it.n).padStart(5, '0')}.json`, it);
  await store.createOnce(`i/bench-sets/${invTs()}~${id}`, {}, { name: String(f.name ?? id).slice(0, 80), n: items.length, at: Date.now() });
  await audit(store, me(c).id, 'bench.created', { id, n: items.length });
  return c.redirect(`/admin/benchmark?set=${id}&ok=1`);
});

admin.post('/api/admin/bench/:set/:n', async (c) => {
  const store = c.get('store');
  const set = c.req.param('set');
  const n = Number(c.req.param('n'));
  const run = c.req.query('run') || 'r1';
  const it = await store.get<BenchItem>(`c/bench/${set}/${String(n).padStart(5, '0')}.json`);
  if (!it) return c.json({ error: 'not found' }, 404);
  const done = await store.get(`c/bench-results/${set}/${run}/${String(n).padStart(5, '0')}.json`);
  if (done) return c.json({ skip: true });
  const doc = await createCheck(c.env, store, me(c), { text: it.text, title: `bench ${set} #${n}`, author: '', genre: it.genre, level: 'unknown', reportLang: 'id', rubricId: null, mode: 'auto' }, 'id', { bench: { set, n, label: it.label, run } });
  return c.json({ id: doc.id });
});

admin.post('/admin/benchmark/terbit', async (c) => {
  const store = c.get('store');
  const f = (await c.req.parseBody()) as Record<string, string>;
  const rows: { truth: string; label: LabelKey; lang: string; words: number; cost: number }[] = [];
  for await (const k of store.keys(`c/bench-results/${f.set}/${f.run}/`)) {
    const r = await store.get<{ truth: string; label: LabelKey; lang: string; words: number; cost: number }>(k.key);
    if (r) rows.push(r);
  }
  const slice = (name: string, rs: typeof rows) => {
    const m = metrics(rs);
    return { slice: name, n: rs.length, accuracy: m.accuracy, falseAccusation: m.fpr, coverage: m.coverage };
  };
  const pub = { at: Date.now(), rows: [slice('Semua / All', rows), slice('Bahasa Indonesia', rows.filter((r) => r.lang === 'id')), slice('English', rows.filter((r) => r.lang === 'en')), slice('≥ 300 kata / words', rows.filter((r) => r.words >= 300))].filter((r) => r.n > 0) };
  await store.put('k/accuracy.json', pub);
  await audit(store, me(c).id, 'accuracy.published', { set: f.set, run: f.run, n: rows.length });
  return c.redirect(`/admin/benchmark?set=${f.set}&run=${f.run}&ok=1`);
});

/* ── anggota ────────────────────────────────────────────────────────── */

admin.get('/admin/anggota', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const qEmail = c.req.query('email');
  if (qEmail) {
    const u = await findByEmail(store, qEmail);
    if (u) return c.redirect(`/admin/anggota/${u.id}`);
  }
  const cursor = c.req.query('c') ?? undefined;
  const { items, cursor: next } = await store.list<{ email: string; name: string; role: string }>('i/users/', { limit: 50, cursor });
  const body = html`
  ${pageHead(tr(L, 'Anggota', 'Members'), tr(L, 'Admin mengendalikan setiap member.', 'Admin controls every member.'))}
  ${qEmail ? html`<div class="flash err">${tr(L, 'E-mail tidak ditemukan.', 'E-mail not found.')}</div>` : ''}
  <form class="card row-form reveal" method="get"><label class="field grow"><span>${tr(L, 'Cari e-mail', 'Find by e-mail')}</span><input type="email" name="email" required></label><button class="btn btn-primary" type="submit">${tr(L, 'Cari', 'Find')}</button></form>
  <div class="card reveal"><div class="tbl-wrap"><table class="tbl hover"><thead><tr><th>${tr(L, 'Nama', 'Name')}</th><th>E-mail</th><th>${tr(L, 'Peran', 'Role')}</th><th>${tr(L, 'Daftar', 'Joined')}</th></tr></thead>
  <tbody>${items.map((u) => html`<tr data-href="/admin/anggota/${u.id}"><td><a href="/admin/anggota/${u.id}">${u.meta.name}</a></td><td>${u.meta.email}</td><td><span class="pill ${u.meta.role === 'member' ? 'p-unk' : 'p-b'}">${u.meta.role}</span></td><td><small>${fmtDate(L, u.uploaded.getTime(), false)}</small></td></tr>`)}</tbody></table></div>
  ${next ? html`<p class="center"><a class="btn btn-ghost" href="/admin/anggota?c=${encodeURIComponent(next)}">${tr(L, 'Berikutnya', 'Next')} →</a></p>` : ''}</div>`;
  return c.html(shell(c, tr(L, 'Anggota', 'Members'), body, 'members'));
});

admin.get('/admin/anggota/:id', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const u = await getUser(store, c.req.param('id'));
  if (!u) return c.notFound();
  const bal = await balanceOf(store, u.id);
  const dep = await depositBalance(store, u.id);
  const led = await ledger(store, u.id, 15);
  const { items: reps } = await store.list<{ title: string; label: LabelKey; ai: number; at: number }>(`i/user-reports/${u.id}/`, { limit: 10 });
  const isOwner = me(c).role === 'owner';
  const body = html`
  ${pageHead(u.name, `${u.email} · ${u.role}${u.suspended ? ' · ' + tr(L, 'DITANGGUHKAN', 'SUSPENDED') : ''}`)}
  ${flash(L, c.req.query('ok') ? tr(L, 'Tersimpan.', 'Saved.') : null, c.req.query('err') === 'deposit' ? tr(L, 'Saldo deposit tidak cukup untuk dikurangi sebanyak itu.', 'Not enough deposit balance to remove that much.') : null)}
  <div class="grid g4">${stat(tr(L, 'Saldo token', 'Token balance'), fmtNum(L, bal))}${stat(tr(L, 'Saldo deposit', 'Deposit balance'), `Rp ${fmtNum(L, dep)}`)}${stat('2FA', u.totp ? '✓' : '—')}${stat(tr(L, 'Masuk terakhir', 'Last login'), u.lastLoginAt ? fmtDate(L, u.lastLoginAt) : '—')}</div>
  <div class="grid g2">
    <form method="post" action="/admin/anggota/${u.id}/kuota" class="card form reveal"><h3>${tr(L, 'Tambah / kurangi token', 'Add / remove tokens')}</h3><input type="hidden" name="idem" value="${newId('adj')}"><label class="field"><span>${tr(L, 'Token (negatif untuk mengurangi)', 'Tokens (negative to remove)')}</span><input type="number" name="tokens" required step="1"></label><label class="field"><span>${tr(L, 'Alasan', 'Reason')}</span><input name="note" required maxlength="200"></label><button class="btn btn-primary" type="submit">${tr(L, 'Terapkan', 'Apply')}</button></form>
    <form method="post" action="/admin/anggota/${u.id}/deposit" class="card form reveal"><h3>${tr(L, 'Koreksi saldo deposit (Rp)', 'Adjust deposit balance (Rp)')}</h3><input type="hidden" name="idem" value="${newId('dadj')}"><label class="field"><span>${tr(L, 'Rupiah (negatif untuk mengurangi)', 'Rupiah (negative to remove)')}</span><input type="number" name="idr" required step="1"></label><label class="field"><span>${tr(L, 'Catatan (wajib)', 'Note (required)')}</span><input name="note" maxlength="200" required></label><button class="btn btn-ghost" type="submit">${tr(L, 'Simpan koreksi', 'Save adjustment')}</button></form>
    <form method="post" action="/admin/anggota/${u.id}/aksi" class="card form reveal"><h3>${tr(L, 'Tindakan akun', 'Account actions')}</h3>
      ${isOwner && u.role !== 'owner' ? html`<label class="field"><span>${tr(L, 'Peran', 'Role')}</span><select name="role"><option value="">—</option><option value="member">member</option><option value="admin">admin</option></select></label>` : ''}
      <label class="field"><span>${tr(L, 'Sandi sementara (opsional)', 'Temporary password (optional)')}</span><input name="temp" minlength="8" autocomplete="off"></label>
      <div class="btn-row"><button class="btn btn-ghost" name="act" value="${u.suspended ? 'unsuspend' : 'suspend'}" type="submit">${u.suspended ? tr(L, 'Aktifkan lagi', 'Reactivate') : tr(L, 'Tangguhkan', 'Suspend')}</button><button class="btn btn-ghost" name="act" value="reset2fa" type="submit">${tr(L, 'Reset 2FA', 'Reset 2FA')}</button><button class="btn btn-ghost" name="act" value="logout" type="submit">${tr(L, 'Keluarkan semua sesi', 'Sign out everywhere')}</button><button class="btn btn-primary" name="act" value="save" type="submit">${tr(L, 'Simpan', 'Save')}</button></div></form>
  </div>
  <section class="card reveal"><h3>${tr(L, 'Laporan', 'Reports')}</h3>${reps.length ? html`<ul class="clean">${reps.map((r) => html`<li>${labelPill(L, r.meta.label)} <a href="/app/laporan/${r.id}">${r.meta.title}</a> <small class="muted">${fmtDate(L, r.meta.at)}</small></li>`)}</ul>` : html`<p class="muted">—</p>`}</section>
  <section class="card reveal"><h3>${tr(L, 'Buku besar', 'Ledger')}</h3>${led.length ? html`<ul class="clean">${led.map((e) => html`<li><small>${fmtDate(L, e.at)}</small> · ${e.kind} · <b>${e.tokens > 0 ? '+' : ''}${fmtNum(L, e.tokens)}</b> token · <small>${e.note}</small></li>`)}</ul>` : html`<p class="muted">—</p>`}</section>`;
  return c.html(shell(c, u.name, body, 'members'));
});

admin.post('/admin/anggota/:id/kuota', async (c) => {
  const store = c.get('store');
  const id = c.req.param('id');
  const f = (await c.req.parseBody()) as Record<string, string>;
  const tokens = Math.round(Number(f.tokens));
  if (Number.isFinite(tokens) && tokens !== 0) {
    await credit(store, id, tokens, 'admin', String(f.note ?? '').slice(0, 200), String(f.idem || newId('adj')), me(c).id);
    await audit(store, me(c).id, 'tokens.adjust', { uid: id, tokens, note: f.note });
  }
  return c.redirect(`/admin/anggota/${id}?ok=1`);
});

admin.post('/admin/anggota/:id/deposit', async (c) => {
  const store = c.get('store');
  const id = c.req.param('id');
  const f = (await c.req.parseBody()) as Record<string, string>;
  const idr = Math.round(Number(f.idr));
  const note = String(f.note ?? '').trim().slice(0, 200);
  if (Number.isFinite(idr) && idr !== 0 && note && (await getUser(store, id))) {
    const r = await adminAdjust(store, id, idr, `Admin: ${note}`, String(f.idem || newId('dadj')));
    await audit(store, me(c).id, 'deposit.adjust', { uid: id, idr, note, result: r });
    if (r === 'insufficient') return c.redirect(`/admin/anggota/${id}?err=deposit`);
  }
  return c.redirect(`/admin/anggota/${id}?ok=1`);
});

admin.post('/admin/anggota/:id/aksi', async (c) => {
  const store = c.get('store');
  const id = c.req.param('id');
  const f = (await c.req.parseBody()) as Record<string, string>;
  const temp = String(f.temp ?? '');
  const pass = temp.length >= 8 ? await hashPassword(temp) : null;
  const isOwner = me(c).role === 'owner';
  await updateUser(store, id, (u: User) => {
    if (u.role === 'owner' && me(c).id !== u.id) return null;
    const next = { ...u };
    if (f.act === 'suspend') next.suspended = true;
    if (f.act === 'unsuspend') next.suspended = false;
    if (f.act === 'reset2fa') {
      next.totp = undefined;
      next.sv += 1;
    }
    if (f.act === 'logout') next.sv += 1;
    if (pass) {
      next.pass = pass;
      next.sv += 1;
    }
    if (isOwner && (f.role === 'admin' || f.role === 'member')) next.role = f.role;
    return next;
  });
  await audit(store, me(c).id, 'member.action', { uid: id, act: f.act, role: f.role || null, tempPassword: Boolean(pass) });
  return c.redirect(`/admin/anggota/${id}?ok=1`);
});

/* ── harga & token ─────────────────────────────────────────────────── */

admin.get('/admin/harga', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const b = await getBilling(store);
  const eng = await getEngine(store);
  const aff = await getAffiliateSettings(store);
  const tp = tokenPriceIdr(b, eng);
  const tc = tokenCostIdr(b, eng);
  const modes = predictByMode(0, b, eng);
  const docs = [300, 1500, 3000].map((w) => ({ w, est: estimateTokens(w, 'auto', true, b, eng), hardIdr: hardBoundUsd(w, 'auto', true, eng) * eng.fx }));
  const body = html`
  ${pageHead(tr(L, 'Harga & token', 'Pricing & tokens'), tr(L, 'Harga jual = modal × markup. Simpan markup baru → semua harga di situs & portal ikut berubah otomatis.', 'Sale price = cost × markup. Save a new markup → every price on the site & portals changes automatically.'))}
  ${flash(L, c.req.query('ok') ? tr(L, 'Tersimpan — semua harga promosi sudah mengikuti markup baru.', 'Saved — every promoted price now follows the new markup.') : null, null)}
  <form method="post" action="/admin/harga" class="form" data-pricing data-unit="${b.tokenUnitUsd}" data-fx="${eng.fx}" data-aff="${aff.enabled ? aff.ratePct : 0}" data-lang="${L}">
    <section class="card reveal"><h3>${tr(L, 'Keuntungan (markup)', 'Profit (markup)')}</h3>
      <div class="grid g2">
        <div class="field"><span>${tr(L, 'Markup (×) — harga = modal × markup', 'Markup (×) — price = cost × markup')} ${tip(tr(L, 'Minimal 5×, maksimal 500×. Bisa digeser, diketik manual, atau pilih cepat.', 'Minimum 5×, maximum 500×. Slide, type it, or pick a preset.'))}</span>
          <div class="markup-ctl"><input type="range" min="${MARKUP_MIN}" max="${MARKUP_MAX}" step="1" value="${b.markup}" data-sync="markupNum" aria-label="markup"><input type="number" id="markupNum" name="markup" min="${MARKUP_MIN}" max="${MARKUP_MAX}" step="1" value="${b.markup}" required data-live><b>×</b></div>
          <div class="preset-row">${[5, 10, 20, 50, 100, 200, 500].map((x) => html`<button type="button" class="chip-btn" data-preset="${x}" data-target="markupNum">${x}×</button>`)}</div></div>
        <div class="grid g2">
          ${stat(tr(L, 'Modal 1 token', 'Cost of 1 token'), `Rp ${fmtNum(L, tc, 1)}`, `US$${b.tokenUnitUsd} ${tr(L, 'biaya AI', 'AI cost')}`)}
          <div class="stat"><span class="stat-k">${tr(L, 'Harga jual 1 token', 'Sale price of 1 token')}</span><b class="stat-v" data-out="tokenPrice">Rp ${fmtNum(L, tp, 0)}</b><small class="muted">${tr(L, 'sebelum diskon paket', 'before package discount')}</small></div>
        </div>
      </div>
    </section>
    <section class="card reveal"><h3>${tr(L, 'Paket token — harga & prediksi modal', 'Token packages — price & cost forecast')}</h3>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Paket', 'Package')}</th><th class="n">Token</th><th class="n">${tr(L, 'Diskon %', 'Discount %')}</th><th class="n">${tr(L, 'Harga jual', 'Sale price')}</th><th class="n">${tr(L, 'Modal maks.', 'Max cost')}</th><th class="n">${tr(L, 'Laba kotor', 'Gross profit')}</th><th class="n">${tr(L, 'Laba bila lewat afiliasi', 'Profit via affiliate')}</th></tr></thead>
      <tbody>${b.packages.map((p, k) => {
        const pp = packagePrice(p, b, eng);
        const affCut = aff.enabled ? Math.floor((pp.idr * aff.ratePct) / 100) : 0;
        return html`<tr data-pkg-row><td><input name="name_${k}" value="${p.name.id}" maxlength="60"></td><td class="n"><input type="number" name="tokens_${k}" value="${p.tokens}" min="1" data-live data-tokens></td><td class="n"><input type="number" name="disc_${k}" value="${p.discountPct}" min="0" max="50" step="1" data-live data-disc></td><td class="n" data-out="price">Rp ${fmtNum(L, pp.idr)}</td><td class="n" data-out="cost">Rp ${fmtNum(L, pp.costIdr)}</td><td class="n pos" data-out="profit">Rp ${fmtNum(L, pp.idr - pp.costIdr)}</td><td class="n" data-out="profitAff">Rp ${fmtNum(L, pp.idr - pp.costIdr - affCut)}</td></tr>`;
      })}</tbody></table></div>
      <p class="muted small">${tr(L, `Modal maks. = semua token paket terpakai (biaya AI terburuk untuk paket itu). Komisi afiliasi ${aff.enabled ? aff.ratePct : 0}% dihitung dari harga jual.`, `Max cost = all package tokens used (the worst AI cost for that package). Affiliate commission ${aff.enabled ? aff.ratePct : 0}% is taken from the sale price.`)}</p>
    </section>
    <section class="card reveal"><h3>${tr(L, 'Harga & modal per halaman', 'Price & cost per page')}</h3>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Mesin', 'Engine')}</th><th class="n">${tr(L, 'Token / halaman', 'Tokens / page')}</th><th class="n">${tr(L, 'Modal / halaman', 'Cost / page')}</th><th class="n">${tr(L, 'Harga / halaman', 'Price / page')}</th></tr></thead>
      <tbody>${modes.map((m) => html`<tr data-page-row data-lo="${m.perPage.low}" data-hi="${m.perPage.high}"><td>${MODE_INFO[m.mode] ? (L === 'en' ? MODE_INFO[m.mode]!.en : MODE_INFO[m.mode]!.id) : m.mode}</td><td class="n">${fmtNum(L, m.perPage.low, 1)}–${fmtNum(L, m.perPage.high, 1)}</td><td class="n">Rp ${fmtNum(L, m.perPage.low * tc)}–${fmtNum(L, m.perPage.high * tc)}</td><td class="n" data-out="pagePrice">Rp ${fmtNum(L, m.idrPerPage.low)}–${fmtNum(L, m.idrPerPage.high)}</td></tr>`)}</tbody></table></div>
      <p class="muted small">${tr(L, `±${b.wordsPerPage} kata per halaman dengan rubrik.`, `±${b.wordsPerPage} words per page with a rubric.`)}</p>
    </section>
    <section class="card reveal"><h3>${tr(L, 'Pengaman tidak-rugi', 'No-loss guard')}</h3>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Naskah (AUTO + rubrik)', 'Text (AUTO + rubric)')}</th><th class="n">${tr(L, 'Token biasanya', 'Usual tokens')}</th><th class="n">${tr(L, 'Disisihkan dulu', 'Set aside first')}</th><th class="n">${tr(L, 'Nilai jual minimum yang disisihkan', 'Minimum sale value set aside')}</th><th class="n">${tr(L, 'Biaya AI terburuk', 'Worst AI cost')}</th></tr></thead>
      <tbody>${docs.map((d) => html`<tr><td>${fmtNum(L, d.w)} ${tr(L, 'kata', 'words')}</td><td class="n">${d.est.min}–${d.est.typical}</td><td class="n">${fmtNum(L, d.est.reserve)}</td><td class="n pos">Rp ${fmtNum(L, d.est.reserve * tc * minRevenueMultiple(b))}</td><td class="n">Rp ${fmtNum(L, d.hardIdr)}</td></tr>`)}</tbody></table></div>
      <p class="muted small">${tr(L, 'Token yang disisihkan selalu bernilai jual ≥ biaya AI terburuk, dan yang dipotong tidak pernah lebih dari yang disisihkan. Bila suatu saat terjadi kerugian, pemeriksaan dicatat sebagai peringatan di dasbor.', 'Tokens set aside are always worth ≥ the worst AI cost, and the deduction never exceeds what was set aside. If a loss ever happens, the check is logged as an alert on the dashboard.')}</p>
    </section>
    <section class="card reveal"><h3>${tr(L, 'Lainnya', 'Other')}</h3>
      <div class="grid g4">
        <label class="field"><span>${tr(L, 'Modal 1 token (US$)', 'Cost of 1 token (US$)')} ${tip(tr(L, 'Satuan kerja AI per token. Mengubahnya mengubah jumlah token per halaman untuk semua orang — biasanya tidak perlu diubah.', 'AI work unit per token. Changing it changes tokens per page for everyone — usually leave it.'))}</span><input type="number" name="tokenUnitUsd" min="0.0001" max="1" step="0.0001" value="${b.tokenUnitUsd}" data-live data-unit-input></label>
        <label class="field"><span>${tr(L, 'Kata per halaman', 'Words per page')}</span><input type="number" name="wordsPerPage" min="100" max="1000" step="10" value="${b.wordsPerPage}"></label>
        <label class="field"><span>${tr(L, 'Token sambutan akun baru', 'Welcome tokens for new accounts')}</span><input type="number" name="welcomeTokens" min="0" step="1" value="${b.welcomeTokens}"></label>
        <label class="field"><span>${tr(L, 'Maks. pemeriksaan bersamaan / member', 'Max concurrent checks / member')}</span><input type="number" name="maxConcurrent" min="1" max="20" value="${b.maxConcurrent}"></label>
      </div>
      <label class="field"><span>${tr(L, 'Instruksi pembayaran (hanya tampil di halaman pesanan pembeli yang sudah masuk)', 'Payment instructions (shown only on a signed-in buyer’s order page)')}</span><textarea name="manualText" rows="5" maxlength="2000" placeholder="${tr(L, 'Mis. transfer ke rekening …, sebutkan nomor pesanan, kirim bukti ke WhatsApp …', 'E.g. transfer to account …, quote the order number, send proof via WhatsApp …')}">${b.manualText}</textarea></label>
    </section>
    <div class="form-end"><button class="btn btn-primary" type="submit">${tr(L, 'Simpan — semua harga ikut berubah', 'Save — every price updates')}</button></div>
  </form>`;
  return c.html(shell(c, tr(L, 'Harga & token', 'Pricing & tokens'), body, 'pricing'));
});

admin.post('/admin/harga', async (c) => {
  const store = c.get('store');
  const f = (await c.req.parseBody()) as Record<string, string>;
  const cur = await getBilling(store);
  const num = (k: string, d: number, lo: number, hi: number) => {
    const v = Number(f[k]);
    return Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
  };
  const next: BillingSettings = {
    ...cur,
    markup: Math.round(num('markup', cur.markup, MARKUP_MIN, MARKUP_MAX)), // dibatasi 5–500× di server (pemilik, 7 Nov 2026)
    tokenUnitUsd: num('tokenUnitUsd', cur.tokenUnitUsd, 0.0001, 1),
    wordsPerPage: Math.round(num('wordsPerPage', cur.wordsPerPage, 100, 1000)),
    welcomeTokens: Math.round(num('welcomeTokens', cur.welcomeTokens, 0, 1e6)),
    maxConcurrent: Math.round(num('maxConcurrent', cur.maxConcurrent, 1, 20)),
    packages: cur.packages.map((p, k) => ({
      ...p,
      name: { ...p.name, id: String(f[`name_${k}`] ?? p.name.id).slice(0, 60) || p.name.id },
      tokens: Math.round(num(`tokens_${k}`, p.tokens, 1, 1e8)),
      discountPct: Math.round(num(`disc_${k}`, p.discountPct, 0, 50)),
    })),
    manualText: String(f.manualText ?? '').slice(0, 2000),
    updatedAt: Date.now(),
    updatedBy: me(c).id,
  };
  await store.put('k/billing.json', next);
  await audit(store, me(c).id, 'billing.saved', { markup: next.markup, tokenUnitUsd: next.tokenUnitUsd, packages: next.packages.map((p) => [p.key, p.tokens, p.discountPct]) });
  return c.redirect('/admin/harga?ok=1');
});

/* ── laporan, biaya, audit ──────────────────────────────────────────── */

admin.get('/admin/laporan', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const cursor = c.req.query('c') ?? undefined;
  const { items, cursor: next } = await store.list<{ title: string; label: LabelKey; ai: number; mix: number; total: number | null; at: number; uid: string }>('i/reports/', { limit: 50, cursor });
  const body = html`
  ${pageHead(tr(L, 'Laporan', 'Reports'), tr(L, 'Metadata semua laporan. Isi naskah hanya dibuka bila perlu (tercatat di audit).', 'Metadata of all reports. Texts are only opened when needed (audited).'))}
  <div class="card reveal"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Judul', 'Title')}</th><th>Label</th><th class="n">AI</th><th class="n">${tr(L, 'Nilai', 'Score')}</th><th>${tr(L, 'Tanggal', 'Date')}</th><th></th></tr></thead>
  <tbody>${items.map((r) => html`<tr><td><a href="/app/laporan/${r.id}">${r.meta.title}</a></td><td>${labelPill(L, r.meta.label)}</td><td class="n">${r.meta.ai}%</td><td class="n">${r.meta.total ?? '—'}</td><td><small>${fmtDate(L, r.meta.at)}</small></td><td><form method="post" action="/admin/laporan/${r.id}/cabut"><button class="btn btn-ghost btn-sm" data-confirm="${tr(L, 'Cabut laporan ini? Halaman verifikasi akan menampilkan “dicabut”.', 'Revoke this report? The verification page will show “revoked”.')}">${tr(L, 'Cabut', 'Revoke')}</button></form></td></tr>`)}</tbody></table></div>
  ${next ? html`<p class="center"><a class="btn btn-ghost" href="/admin/laporan?c=${encodeURIComponent(next)}">${tr(L, 'Lebih lama', 'Older')} →</a></p>` : ''}</div>`;
  return c.html(shell(c, tr(L, 'Laporan', 'Reports'), body, 'reports'));
});

admin.post('/admin/laporan/:id/cabut', async (c) => {
  const store = c.get('store');
  const id = c.req.param('id');
  const s = await store.cas<ReportSummary>(reportKey(id), (cur) => (cur && !cur.revoked ? { ...cur, revoked: true } : null));
  if (s) await store.cas<Record<string, unknown>>(`c/verify/${s.verifyCode}.json`, (cur) => (cur ? { ...cur, revoked: true } : null));
  await audit(store, me(c).id, 'report.revoked', { id });
  return c.redirect('/admin/laporan');
});

admin.get('/admin/biaya', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(c.req.query('d') ?? '') ? c.req.query('d')! : wibDate();
  const eng = await getEngine(store);
  const agg = new Map<string, { calls: number; in: number; out: number; cacheRead: number; cost: number }>();
  let total = 0;
  let calls = 0;
  for await (const k of store.keys(`l/usage/${date}/`)) {
    if (calls >= 3000) break;
    const u = await store.get<{ tier: string; model: string; in: number; out: number; cacheRead: number; cost: number }>(k.key);
    if (!u) continue;
    calls += 1;
    total += u.cost;
    const key = `${u.tier} · ${u.model}`;
    const a = agg.get(key) ?? { calls: 0, in: 0, out: 0, cacheRead: 0, cost: 0 };
    a.calls += 1;
    a.in += u.in;
    a.out += u.out;
    a.cacheRead += u.cacheRead;
    a.cost += u.cost;
    agg.set(key, a);
  }
  // Prediksi biaya kuota gratis per minggu (pemilik, 7 Nov 2026: „Masukan di portal admin agar tau perkiraan di habiskan
  // kuota gratis perminggu“) — rumus yang sama dengan docs/MASTER-BLUEPRINT.md §20.9, dari harga model, kurs, satuan
  // token, markup dan paket yang sedang berlaku.
  const membersQ = Number(c.req.query('anggota'));
  const members = Number.isFinite(membersQ) && membersQ >= 1 ? Math.min(1_000_000, Math.round(membersQ)) : 100;
  const fc = freeQuotaForecast(eng, await getBilling(store), members);
  const idr = (n: number) => `Rp ${fmtNum(L, n)}`;
  const nm = fmtNum(L, members);
  const rows = [
    { k: 'typical', label: tr(L, 'Khas', 'Typical'), note: tr(L, '±500 kata, prompt dari cache', '±500 words, cached prompt'), x: fc.typical },
    { k: 'worst', label: tr(L, 'Terburuk', 'Worst'), note: tr(L, 'halaman penuh, tanpa cache', 'full page, no cache'), x: fc.worst },
  ];
  const explain = tr(
    L,
    `Cek Gratis: ${FREE_QUOTA.pagesPerWeek} halaman normal per member per minggu (halaman Legal: maks. ${FREE_QUOTA.wordsPerPage} kata / ${fmtNum(L, FREE_QUOTA.charsPerPage)} karakter / ${fmtNum(L, FREE_QUOTA.tokensPerPage)} token), satu lintasan model ${fc.model}. Dihitung seolah semua member menghabiskan seluruh kuotanya. Kuota gratis tayang di fase X1; sampai itu ini prediksi, sesudahnya biaya nyata tampil di tabel di bawah.`,
    `Free Check: ${FREE_QUOTA.pagesPerWeek} normal pages per member per week (Legal page: at most ${FREE_QUOTA.wordsPerPage} words / ${fmtNum(L, FREE_QUOTA.charsPerPage)} characters / ${fmtNum(L, FREE_QUOTA.tokensPerPage)} tokens), one pass of ${fc.model}. Assumes every member uses the whole quota. The free quota goes live in phase X1; until then this is a forecast, afterwards the real cost shows in the table below.`,
  );
  const retail = tr(L, `Nilai jual setara kuota gratis per member per minggu (markup yang berlaku): ±${idr(fc.worst.perMemberWeekRetailIdr)}.`, `Retail value of one member's weekly free quota (current markup): ±${idr(fc.worst.perMemberWeekRetailIdr)}.`);
  const be = fc.breakEven
    ? tr(L, `Satu paket ${fc.breakEven.pkg} (${idr(fc.breakEven.priceIdr)}, modal ${idr(fc.breakEven.costIdr)}) menutup biaya gratis ±${fmtNum(L, fc.breakEven.membersCoveredPerMonth)} member aktif selama sebulan (kasus terburuk).`, `One ${fc.breakEven.pkg} package (${idr(fc.breakEven.priceIdr)}, cost ${idr(fc.breakEven.costIdr)}) covers the free cost of ±${fmtNum(L, fc.breakEven.membersCoveredPerMonth)} active members for a month (worst case).`)
    : '';
  const budget = tr(L, `Anggaran gratis harian US$${fc.budget.usdPerDay} = ${fmtNum(L, fc.budget.worstPagesPerDay)} halaman terburuk per hari = kuota mingguan ±${fmtNum(L, fc.budget.memberQuotasPerWeek)} member. Untuk ${nm} member dibutuhkan ±${fmtUsd(fc.budget.neededUsdPerDay)} per hari.`, `Daily free budget US$${fc.budget.usdPerDay} = ${fmtNum(L, fc.budget.worstPagesPerDay)} worst-case pages a day = the weekly quota of ±${fmtNum(L, fc.budget.memberQuotasPerWeek)} members. ${nm} members need ±${fmtUsd(fc.budget.neededUsdPerDay)} a day.`);
  const freeCard = html`<section class="card reveal" id="kuota-gratis"><h3>${tr(L, 'Prediksi biaya kuota gratis per minggu', 'Forecast: weekly cost of the free quota')}</h3>
    <p class="muted">${explain}</p>
    <form class="row-form" method="get"><input type="hidden" name="d" value="${date}"><label class="field"><span>${tr(L, 'Member aktif per minggu', 'Active members per week')}</span><input type="number" name="anggota" min="1" max="1000000" step="1" value="${members}"></label><button class="btn btn-primary" type="submit">${tr(L, 'Hitung', 'Calculate')}</button></form>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th class="n">${tr(L, 'Per halaman', 'Per page')}</th><th class="n">${tr(L, 'Per member / minggu', 'Per member / week')}</th><th class="n">${tr(L, 'Token internal', 'Internal tokens')}</th><th class="n">${tr(L, `${nm} member / minggu`, `${nm} members / week`)}</th><th class="n">${tr(L, `${nm} member / bulan`, `${nm} members / month`)}</th></tr></thead>
    <tbody>${rows.map((r) => html`<tr><td style="min-width:150px"><b>${r.label}</b><br><small class="muted">${r.note}</small></td><td class="n">${fmtUsd(r.x.perPageUsd)}</td><td class="n">${idr(r.x.perMemberWeekIdr)}</td><td class="n">${fmtNum(L, r.x.perMemberWeekTokens)}</td><td class="n" data-forecast="${r.k}-week">${idr(r.x.membersWeekIdr)}</td><td class="n">${idr(r.x.membersMonthIdr)}</td></tr>`)}</tbody></table></div>
    <ul class="muted"><li>${retail}</li>${be ? html`<li>${be}</li>` : ''}<li>${budget}</li></ul></section>`;
  const body = html`
  ${pageHead(tr(L, 'Biaya API Claude', 'Claude API cost'), tr(L, 'Dari token nyata setiap panggilan (usage).', 'From the real tokens of every call (usage).'))}
  ${freeCard}
  <form class="card row-form reveal" method="get"><label class="field"><span>${tr(L, 'Tanggal (WIB)', 'Date (WIB)')}</span><input type="date" name="d" value="${date}"></label><button class="btn btn-primary" type="submit">${tr(L, 'Tampilkan', 'Show')}</button></form>
  <div class="grid g3">${stat(tr(L, 'Total biaya', 'Total cost'), fmtUsd(total), `≈ Rp ${fmtNum(L, total * eng.fx)}`)}${stat(tr(L, 'Panggilan', 'Calls'), fmtNum(L, calls))}${stat(tr(L, 'Rata-rata per panggilan', 'Average per call'), fmtUsd(calls ? total / calls : 0))}</div>
  <div class="card reveal"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Tahap · model', 'Stage · model')}</th><th class="n">${tr(L, 'Panggilan', 'Calls')}</th><th class="n">${tr(L, 'Token masuk', 'Input tok.')}</th><th class="n">${tr(L, 'Token keluar', 'Output tok.')}</th><th class="n">Cache</th><th class="n">US$</th></tr></thead>
  <tbody>${[...agg.entries()].sort((a, b) => b[1].cost - a[1].cost).map(([k, a]) => html`<tr><td>${k}</td><td class="n">${fmtNum(L, a.calls)}</td><td class="n">${fmtNum(L, a.in)}</td><td class="n">${fmtNum(L, a.out)}</td><td class="n">${fmtNum(L, a.cacheRead)}</td><td class="n">${fmtUsd(a.cost)}</td></tr>`)}</tbody></table></div></div>`;
  return c.html(shell(c, tr(L, 'Biaya API', 'API cost'), body, 'cost'));
});

admin.get('/admin/audit', async (c) => {
  const L = portalLang(c);
  const store = c.get('store');
  const date = /^\d{4}-\d{2}-\d{2}$/.test(c.req.query('d') ?? '') ? c.req.query('d')! : wibDate();
  const { items } = await store.list(`l/audit/${date}/`, { limit: 100 });
  const entries: AuditEntry[] = [];
  for (const it of items) {
    const e = await store.get<AuditEntry>(it.key);
    if (e) entries.push(e);
  }
  const backup = await store.get<{ at: number; date: string; copied: number; ok: boolean; error?: string }>('k/backup-state.json');
  const body = html`
  ${pageHead(tr(L, 'Audit & cadangan', 'Audit & backups'))}
  ${flash(L, c.req.query('ok') ? tr(L, 'Backup selesai.', 'Backup finished.') : null, null)}
  <div class="grid g2">
    <section class="card reveal"><h3>${tr(L, 'Backup harian ke R2 privat (35 hari)', 'Daily backup to private R2 (35 days)')}</h3>
      ${backup ? html`<p>${backup.ok ? html`<span class="pill p-hum">✓</span>` : html`<span class="pill p-ai">!</span>`} ${fmtDate(L, backup.at)} · ${fmtNum(L, backup.copied)} ${tr(L, 'objek disalin', 'objects copied')}</p>${backup.error ? html`<p class="warn">${backup.error}</p>` : ''}` : html`<p class="muted">${tr(L, 'Belum ada backup (cron 02.00 WIB).', 'No backup yet (cron 02:00 WIB).')}</p>`}
      <form method="post" action="/admin/cadangan"><button class="btn btn-ghost" type="submit">${tr(L, 'Backup sekarang', 'Back up now')}</button></form></section>
    <form class="card row-form reveal" method="get"><label class="field"><span>${tr(L, 'Tanggal audit', 'Audit date')}</span><input type="date" name="d" value="${date}"></label><button class="btn btn-primary" type="submit">${tr(L, 'Tampilkan', 'Show')}</button></form>
  </div>
  <section class="card reveal"><h3>${tr(L, 'Jejak audit', 'Audit trail')} — ${date}</h3>${entries.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${tr(L, 'Waktu', 'Time')}</th><th>${tr(L, 'Oleh', 'By')}</th><th>${tr(L, 'Tindakan', 'Action')}</th><th>Data</th></tr></thead><tbody>${entries.map((e) => html`<tr><td><small>${fmtDate(L, e.at)}</small></td><td><code>${e.by}</code></td><td>${e.action}</td><td><code class="small">${JSON.stringify(e.data).slice(0, 160)}</code></td></tr>`)}</tbody></table></div>` : html`<p class="muted">—</p>`}</section>`;
  return c.html(shell(c, 'Audit', body, 'audit'));
});

admin.post('/admin/cadangan', async (c) => {
  await runBackup(c.env, true);
  await audit(c.get('store'), me(c).id, 'backup.manual', {});
  return c.redirect('/admin/audit?ok=1');
});

registerAdminAffiliate(admin);
registerAdminPayments(admin);

export { LABELS, checkKey, DEFAULT_BILLING, type CheckDoc, type Lang };
