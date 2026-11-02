/** Membuat pemeriksaan, menggerakkan tahap (/advance), perkiraan token, tinjauan, sesi lomba. */
import { Hono } from 'hono';
import type { Env } from '../env.ts';
import { Store, invTs } from '../lib/store.ts';
import { newId, seal } from '../lib/crypto.ts';
import { tr, type Lang } from '../lib/i18n.ts';
import { countWords } from '../engine/preprocess.ts';
import { advance, checkKey, textKey, type CheckDoc, type ReportSummary, reportKey } from '../engine/cascade.ts';
import { getEngine, getBilling, spendToday } from '../data/settings.ts';
import { reserve, refund, InsufficientError, type Reservation } from '../data/wallet.ts';
import { estimateTokens, isMode, MODES, type Mode } from '../engine/pricing.ts';
import { isAdmin, type User } from '../data/users.ts';
import { getRubric } from '../engine/rubrics.ts';
import { portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import { limit } from '../lib/ratelimit.ts';

export const checks = new Hono<HonoEnv>();

export interface NewCheck {
  text: string;
  title: string;
  author: string;
  genre: string;
  level: string;
  reportLang: Lang;
  rubricId: string | null;
  mode: Mode;
}

export class CheckInputError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export function sanitizeInput(raw: Record<string, unknown>, L: Lang): NewCheck {
  const text = String(raw.text ?? '').slice(0, 400_000);
  const rubricId = String(raw.rubric ?? '') || null;
  return {
    text,
    title: String(raw.title ?? '').trim().slice(0, 200) || tr(L, 'Tanpa judul', 'Untitled'),
    author: String(raw.author ?? '').trim().slice(0, 120),
    genre: String(raw.genre ?? 'general').slice(0, 30),
    level: String(raw.level ?? 'unknown').slice(0, 30),
    reportLang: raw.reportLang === 'en' ? 'en' : raw.reportLang === 'id' ? 'id' : L,
    rubricId: getRubric(rubricId) ? rubricId : null,
    mode: isMode(raw.mode) ? raw.mode : 'auto',
  };
}


export async function createCheck(
  env: Env,
  store: Store,
  user: User,
  input: NewCheck,
  L: Lang,
  opts: { batchId?: string; prepaid?: boolean; bench?: CheckDoc['bench']; free?: boolean } = {},
): Promise<CheckDoc> {
  if (!env.MASTER_KEY) throw new CheckInputError(500, 'MASTER_KEY belum dipasang.');
  const words = countWords(input.text);
  if (words < 30) throw new CheckInputError(400, tr(L, 'Teks terlalu pendek (minimal 30 kata).', 'Text too short (minimum 30 words).'));
  const maxWords = isAdmin(user) ? 60_000 : 20_000;
  if (words > maxWords) throw new CheckInputError(400, tr(L, `Teks terlalu panjang (maks. ${maxWords} kata per pemeriksaan).`, `Text too long (max ${maxWords} words per check).`));
  const eng = await getEngine(store);
  if ((await spendToday(store)) >= eng.dailyCapUsd) {
    throw new CheckInputError(503, tr(L, 'Kapasitas harian sedang penuh. Coba lagi besok atau hubungi admin.', 'Daily capacity is full. Try again tomorrow or contact the admin.'));
  }
  const billing = await getBilling(store);
  const est = estimateTokens(words, input.mode, Boolean(input.rubricId), billing, eng);
  const id = newId('chk');
  const charge = !(opts.prepaid || opts.free || opts.bench || isAdmin(user));
  if (charge) {
    // Anti-banjir: batas pemeriksaan berjalan bersamaan per member.
    const { items: running } = await store.list(`i/user-active/${user.id}/`, { limit: billing.maxConcurrent + 1 });
    if (running.length >= billing.maxConcurrent) {
      throw new CheckInputError(429, tr(L, `Maksimal ${billing.maxConcurrent} pemeriksaan berjalan bersamaan. Tunggu yang sedang berjalan selesai.`, `At most ${billing.maxConcurrent} checks may run at once. Wait for the running ones to finish.`));
    }
  }
  let res: CheckDoc['reserve'];
  if (opts.prepaid) res = { batch: true };
  else if (!charge) res = { none: true };
  else {
    try {
      res = await reserve(store, user.id, est.reserve, `Pesan ${id} (${words} kata)`, id);
    } catch (err) {
      if (err instanceof InsufficientError) {
        throw new CheckInputError(402, tr(L, `Token tidak cukup: dipesan ${est.reserve} token (pemakaian biasanya ${est.min}–${est.typical} token, sisanya kembali), saldo ${err.available}. Beli token di menu Token.`, `Not enough tokens: ${est.reserve} tokens are reserved (usage is usually ${est.min}–${est.typical}, the rest returns), balance ${err.available}. Buy tokens under Tokens.`));
      }
      throw err;
    }
  }
  const now = Date.now();
  const doc: CheckDoc = {
    id,
    uid: user.id,
    batchId: opts.batchId,
    bench: opts.bench,
    createdAt: now,
    updatedAt: now,
    title: input.title,
    author: input.author,
    genre: input.genre,
    level: input.level,
    reportLang: input.reportLang,
    rubricId: input.rubricId,
    mode: input.mode,
    stage: 'prep',
    attempts: 0,
    lease: 0,
    reserved: res && 'tokens' in res ? res.tokens : 0,
    reserve: res,
    cost: 0,
  };
  try {
    await store.put(textKey(id), await seal(env.MASTER_KEY, { raw: input.text }));
    await store.put(checkKey(id), doc);
    await store.createOnce(`i/active/${id}`, {}, { uid: user.id, at: now });
    if (charge) await store.createOnce(`i/user-active/${user.id}/${id}`, {}, { at: now });
    if (!opts.bench) await store.createOnce(`i/user-checks/${user.id}/${invTs(now)}~${id}`, {}, { title: input.title, at: now, batch: opts.batchId ?? null });
  } catch (err) {
    // Dokumen gagal dibuat setelah token dipesan: kembalikan pesanan (idempoten), jangan sampai saldo hilang.
    if (res && 'tokens' in res) await refund(store, user.id, res.tokens, `Batal membuat ${id}`, `abort:${id}`);
    throw err;
  }
  return doc;
}

export function statusOf(doc: CheckDoc | null) {
  if (!doc) return null;
  return { id: doc.id, stage: doc.stage, t2n: doc.t2n ?? null, t3n: doc.t3n ?? null, skipped: doc.skipped ?? [], reportId: doc.reportId ?? null, error: doc.error ?? null, words: doc.analyzedWords ?? null, lang: doc.lang ?? null, reserved: doc.reserved, charged: doc.charged ?? null, retryAt: doc.lease > Date.now() ? doc.lease : null };
}

async function ownCheck(c: Ctx, store: Store, id: string): Promise<CheckDoc | null> {
  const user = c.get('user');
  if (!user) return null;
  const doc = await store.get<CheckDoc>(checkKey(id));
  if (!doc) return null;
  if (doc.uid !== user.id && !isAdmin(user)) return null;
  return doc;
}

checks.post('/api/checks', async (c) => {
  const user = c.get('user');
  const L = portalLang(c);
  if (!user) return c.json({ error: tr(L, 'Silakan masuk dulu.', 'Please log in first.') }, 401);
  if (!(await limit(c.env, `check:${user.id}`, 30, 3600))) return c.json({ error: tr(L, 'Terlalu banyak pemeriksaan per jam.', 'Too many checks per hour.') }, 429);
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!body.agree) return c.json({ error: tr(L, 'Centang pernyataan bahwa Anda berhak memeriksa naskah ini.', 'Tick the statement that you are entitled to check this text.') }, 400);
  try {
    const doc = await createCheck(c.env, c.get('store'), user, sanitizeInput(body, L), L);
    return c.json({ id: doc.id });
  } catch (err) {
    if (err instanceof CheckInputError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

checks.get('/api/checks/:id', async (c) => {
  const doc = await ownCheck(c, c.get('store'), c.req.param('id'));
  if (!doc) return c.json({ error: 'not found' }, 404);
  return c.json(statusOf(doc));
});

checks.post('/api/checks/:id/advance', async (c) => {
  const doc = await ownCheck(c, c.get('store'), c.req.param('id'));
  if (!doc) return c.json({ error: 'not found' }, 404);
  const after = await advance(c.env, doc.id);
  return c.json(statusOf(after ?? doc));
});

/** Perkiraan token untuk formulir (dihitung server; klien tidak pernah menentukan harga). */
checks.get('/api/estimate', async (c) => {
  if (!c.get('user')) return c.json({ error: 'login' }, 401);
  const store = c.get('store');
  const words = Math.max(0, Math.min(60_000, Number(c.req.query('words') ?? 0) || 0));
  const mode: Mode = isMode(c.req.query('mode')) ? (c.req.query('mode') as Mode) : 'auto';
  const rubric = c.req.query('rubric') === '1';
  const b = await getBilling(store);
  const eng = await getEngine(store);
  const all = Object.fromEntries(MODES.map((m) => [m, estimateTokens(words, m, rubric, b, eng)]));
  return c.json({ ...all[mode], modes: all, pages: Math.round((words / b.wordsPerPage) * 10) / 10 });
});

/* ── tinjauan ulang (sengketa): Forensik penuh oleh tiga model, ditagih seperti pemeriksaan biasa ── */

checks.post('/api/reports/:id/review', async (c) => {
  const user = c.get('user');
  const L = portalLang(c);
  if (!user) return c.json({ error: 'login' }, 401);
  const store = c.get('store');
  const rep = await store.get<ReportSummary>(reportKey(c.req.param('id')));
  if (!rep || (rep.uid !== user.id && !isAdmin(user))) return c.json({ error: 'not found' }, 404);
  const first = await store.createOnce(`u/review/${rep.id}`, { by: user.id, at: Date.now() });
  if (!first) return c.json({ error: tr(L, 'Laporan ini sudah pernah ditinjau ulang.', 'This report has already been reviewed.') }, 409);
  const orig = await store.get<CheckDoc>(checkKey(rep.checkId));
  const textSealed = await store.get<{ v: 1; iv: string; ct: string }>(textKey(rep.checkId));
  if (!orig || !textSealed || !c.env.MASTER_KEY) return c.json({ error: tr(L, 'Teks asli sudah dihapus; tinjauan tidak bisa dijalankan.', 'The original text was deleted; a review cannot run.') }, 410);
  const { unseal } = await import('../lib/crypto.ts');
  const { raw } = await unseal<{ raw: string }>(c.env.MASTER_KEY, textSealed);
  let doc: CheckDoc;
  try {
    doc = await createCheck(c.env, store, user, { text: raw, title: `${orig.title} (${tr(L, 'tinjauan', 'review')})`, author: orig.author, genre: orig.genre, level: orig.level, reportLang: orig.reportLang, rubricId: orig.rubricId, mode: 'forensic' }, L);
  } catch (err) {
    await store.del(`u/review/${rep.id}`);
    if (err instanceof CheckInputError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
  await store.append('disputes', { at: Date.now(), by: user.id, reportId: rep.id, newCheck: doc.id, reason: String(((await c.req.json().catch(() => ({}))) as { reason?: string }).reason ?? '').slice(0, 500) });
  return c.json({ id: doc.id });
});

/* ── sesi lomba: pesan token sekali, buat semua pemeriksaan, selesaikan sekali ──────── */

export interface Batch {
  id: string;
  uid: string;
  name: string;
  category: string;
  rubricId: string | null;
  policy: 'flag' | 'exclude';
  reportLang: Lang;
  createdAt: number;
  /** Token dipesan untuk sesi ini (kumulatif seluruh unggahan). */
  reservedTokens?: number;
  /** Token yang sudah dikembalikan (kumulatif) — mencegah pengembalian ganda saat sesi ditambah naskah. */
  refundedTokens?: number;
  settled?: boolean;
  items: number;
}

export const batchKey = (id: string) => `c/batches/${id}.json`;

checks.post('/api/batches/:id/run', async (c) => {
  const user = c.get('user');
  const L = portalLang(c);
  if (!user) return c.json({ error: 'login' }, 401);
  const store = c.get('store');
  const batch = await store.get<Batch>(batchKey(c.req.param('id')));
  if (!batch || batch.uid !== user.id) return c.json({ error: 'not found' }, 404);
  if (!(await limit(c.env, `batch:${user.id}`, 20, 3600))) return c.json({ error: tr(L, 'Terlalu banyak unggahan sesi per jam.', 'Too many session uploads per hour.') }, 429);
  const body = (await c.req.json().catch(() => ({}))) as { entries?: { title?: string; author?: string; text?: string }[]; agree?: boolean; mode?: string };
  if (!body.agree) return c.json({ error: tr(L, 'Centang pernyataan bahwa Anda berhak memeriksa naskah ini.', 'Tick the statement that you are entitled to check these texts.') }, 400);
  const entries = (body.entries ?? []).filter((e) => countWords(String(e.text ?? '')) >= 30 && countWords(String(e.text ?? '')) <= 20_000).slice(0, 200);
  if (!entries.length) return c.json({ error: tr(L, 'Tidak ada naskah yang memenuhi syarat (30–20.000 kata).', 'No eligible text (30–20,000 words).') }, 400);
  const eng = await getEngine(store);
  const billing = await getBilling(store);
  const mode: Mode = isMode(body.mode) ? body.mode : 'auto';
  const total = entries.reduce((a, e) => a + estimateTokens(countWords(String(e.text)), mode, Boolean(batch.rubricId), billing, eng).reserve, 0);
  let reserved: Reservation | null = null;
  if (!isAdmin(user)) {
    try {
      reserved = await reserve(store, user.id, total, `Pesan sesi ${batch.id} (${entries.length} naskah)`, `${batch.id}:${newId('run')}`);
    } catch (err) {
      if (err instanceof InsufficientError) return c.json({ error: tr(L, `Token tidak cukup: sesi ini memesan ${total} token (sisanya dikembalikan setelah selesai), saldo ${err.available}.`, `Not enough tokens: this session reserves ${total} tokens (the rest returns afterwards), balance ${err.available}.`) }, 402);
      throw err;
    }
  }
  const ids: string[] = [];
  let seq = batch.items;
  try {
    for (const e of entries) {
      const doc = await createCheck(c.env, store, user, sanitizeInput({ ...e, rubric: batch.rubricId, reportLang: batch.reportLang, genre: 'essay', mode }, L), L, { batchId: batch.id, prepaid: true });
      seq += 1;
      await store.createOnce(`i/batch-items/${batch.id}/${String(seq).padStart(5, '0')}~${doc.id}`, {}, { title: doc.title, author: doc.author });
      ids.push(doc.id);
    }
  } finally {
    await store.cas<Batch>(batchKey(batch.id), (cur) => (cur ? { ...cur, items: seq, settled: false, reservedTokens: (cur.reservedTokens ?? 0) + (reserved ? total : 0) } : null));
    // Cron menuntaskan sesi yang terbuka walau tab ditutup sebelum selesai.
    if (reserved) await store.put(`i/open-batches/${batch.id}`, { at: Date.now() });
  }
  return c.json({ ids, reserved: reserved ? total : 0 });
});

/**
 * Selesaikan token sesi: tagih total biaya nyata × markup (≤ total pesanan), kembalikan sisanya.
 * Aman dipanggil berkali-kali dan setelah sesi ditambah naskah: yang dikembalikan selalu
 * (pesanan − ditagih − yang sudah dikembalikan), dengan kunci idempotensi per total kumulatif.
 */
export async function settleBatch(env: Env, store: Store, batchId: string): Promise<{ charged: number; refunded: number } | null> {
  const batch = await store.get<Batch>(batchKey(batchId));
  if (!batch || !batch.reservedTokens) return null;
  const { items } = await store.list(`i/batch-items/${batchId}/`, { limit: 1000 });
  let charged = 0;
  for (const it of items) {
    const doc = await store.get<CheckDoc>(checkKey(it.id));
    if (!doc) continue;
    if (doc.stage !== 'done' && doc.stage !== 'failed') return null; // belum semua selesai
    if (doc.stage === 'done') charged += doc.tokens ?? 0;
  }
  charged = Math.min(charged, batch.reservedTokens);
  const already = batch.refundedTokens ?? 0;
  const due = Math.max(0, batch.reservedTokens - charged - already);
  if (due > 0) {
    await refund(store, batch.uid, due, `Penyelesaian sesi ${batchId} (ditagih ${charged} token)`, `batch:${batchId}:${already + due}`);
  }
  await store.cas<Batch>(batchKey(batchId), (cur) => (cur && (cur.refundedTokens ?? 0) < already + due ? { ...cur, refundedTokens: already + due, settled: true } : cur && !cur.settled ? { ...cur, settled: true } : null));
  await store.del(`i/open-batches/${batchId}`);
  return { charged, refunded: due };
}

checks.post('/api/batches/:id/finalize', async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: 'login' }, 401);
  const store = c.get('store');
  const batch = await store.get<Batch>(batchKey(c.req.param('id')));
  if (!batch || batch.uid !== user.id) return c.json({ error: 'not found' }, 404);
  const r = await settleBatch(c.env, store, batch.id);
  return c.json({ ok: true, settled: r });
});
