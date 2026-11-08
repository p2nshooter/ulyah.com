/** Membuat pemeriksaan, menggerakkan tahap (/advance), perkiraan token, tinjauan, sesi lomba. */
import { Hono } from 'hono';
import type { Env } from '../env.ts';
import { Store, invTs } from '../lib/store.ts';
import { schedulePurge } from '../data/purge.ts';
import { newId, seal, unseal, type Sealed } from '../lib/crypto.ts';
import { tr, GENRES, LEVELS, type Lang } from '../lib/i18n.ts';
import { countWords } from '../engine/preprocess.ts';
import { advance, checkKey, textKey, consumedTokens, type CheckDoc, type ReportSummary, type TextDoc, reportKey } from '../engine/cascade.ts';
import { getEngine, getBilling, spendToday, getFree, freeSpendToday, type FreeSettings } from '../data/settings.ts';
import { normalPages, firstPages, freeStatus, reserveFreePages, releaseFreePages, FreeQuotaError, isDisposable, networkAllows, networkOf, periodOf } from '../data/free.ts';
import { sha256Hex } from '../lib/crypto.ts';
import { reserve, refund, balanceOf, InsufficientError, type Reservation } from '../data/wallet.ts';
import { estimateTokens, hardBoundUsd, freeWorstUsd, parseMode, PUBLIC_MODE, PUBLIC_NAME, MODES, type Mode } from '../engine/pricing.ts';
import { isAdmin, type User } from '../data/users.ts';
import { getRubric } from '../engine/rubrics.ts';
import { portalLang, type HonoEnv, type Ctx } from '../lib/session.ts';
import { limit, count } from '../lib/ratelimit.ts';
import { fetchArticle, collectSitemap, InputUrlError } from '../lib/extract.ts';
import { isPurpose, type Purpose } from '../lib/purpose.ts';
import { getControls, addMemberDay, SpendLimitError, engineAvailability } from '../data/controls.ts';
import { applyRouter } from '../engine/router.ts';
import { wibDate } from '../data/settings.ts';
import { addStats } from '../data/stats.ts';
import { tierOf, modeAllowed, autoCeiling, isVvip, TIERS, ENGINE_MIN_TIER } from '../data/tiers.ts';

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
  purpose?: Purpose;
  /** Member sudah menekan „Ya, saya yakin“ di jendela konfirmasi Fable. */
  fableOk?: boolean;
}

export class CheckInputError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/** Naskah lebih panjang dari yang boleh diperiksa gratis sekarang: member memilih (sebagian gratis / isi saldo / tunggu). */
export interface FreeChoice {
  pages: number;
  remaining: number;
  quota: number;
  maxPerCheck: number;
  period: FreeSettings['period'];
  resetAt: number;
  /** Halaman awal yang boleh diperiksa gratis sekarang (0 = tidak ada). */
  allowedNow: number;
  wordsPerPage: number;
}

export class FreeChoiceError extends CheckInputError {
  constructor(message: string, readonly choice: FreeChoice) {
    super(409, message);
  }
}

/** Hash jaringan + perangkat untuk batas akun gratis (tanpa menyimpan IP mentah). */
export async function netHashOf(c: Ctx): Promise<string> {
  const ip = c.req.header('cf-connecting-ip') ?? 'local';
  return (await sha256Hex(`${c.env.MASTER_KEY ?? ''}|${networkOf(ip)}|${c.req.header('user-agent') ?? ''}`)).slice(0, 32);
}

/** Tag blok prompt di teks member dipagari: „<naskah>“ → „‹naskah>“ (sama dengan preprocess.ts). */
export function fenceTags(s: string): string {
  return s.replace(/<(\s*\/?\s*)(naskah|rubrik|target|konteks)\b/gi, '‹$1$2');
}

/** Pemeriksaan gagal yang biayanya ditanggung platform: lebih dari ini dalam 24 jam → jeda (anti-curang). */
export const MAX_COSTLY_FAILURES_PER_DAY = 3;

export function sanitizeInput(raw: Record<string, unknown>, L: Lang): NewCheck {
  const text = String(raw.text ?? '').slice(0, 400_000);
  const rubricId = String(raw.rubric ?? '') || null;
  return {
    text,
    // Judul dan penulis ikut masuk ke prompt: tag blok prompt dipagari seperti isi naskah (preprocess.ts).
    title: fenceTags(String(raw.title ?? '').trim().slice(0, 200)) || tr(L, 'Tanpa judul', 'Untitled'),
    author: fenceTags(String(raw.author ?? '').trim().slice(0, 120)),
    // Genre dan jenjang masuk ke blok <konteks> di luar <naskah>, jadi hanya nilai dari daftar resmi yang diterima
    // (pemilik, 7 Nov 2026: „Perketat logika engine agar tidak bocor dan tidak melebar kemana2“).
    genre: GENRES.some((g) => g.key === raw.genre) ? String(raw.genre) : 'general',
    level: LEVELS.some((l) => l.key === raw.level) ? String(raw.level) : 'unknown',
    reportLang: raw.reportLang === 'en' ? 'en' : raw.reportLang === 'id' ? 'id' : L,
    rubricId: getRubric(rubricId) ? rubricId : null,
    mode: parseMode(raw.mode) ?? 'auto',
    purpose: isPurpose(raw.purpose) ? raw.purpose : 'umum',
    fableOk: raw.elite_ok === '1' || raw.fable_ok === '1' || raw.eliteConfirm === true || raw.fableConfirm === true,
  };
}


export async function createCheck(
  env: Env,
  store: Store,
  user: User,
  inputIn: NewCheck,
  L: Lang,
  opts: { batchId?: string; prepaid?: boolean; waiting?: boolean; bench?: CheckDoc['bench']; free?: boolean; noCache?: boolean; freeQuota?: { partial?: boolean; netHash?: string } } = {},
): Promise<CheckDoc> {
  if (!env.MASTER_KEY) throw new CheckInputError(500, 'MASTER_KEY belum dipasang.');
  const controls = await getControls(store);
  if (controls.emergencyStop && !opts.bench) {
    throw new CheckInputError(503, tr(L, `Pemeriksaan sedang dihentikan sementara oleh admin.${controls.stopNote ? ` ${controls.stopNote}` : ''} Saldo Anda aman.`, `Checks are paused by the admin for now.${controls.stopNote ? ` ${controls.stopNote}` : ''} Your balance is safe.`));
  }
  let input = inputIn;
  // ── Cek Gratis (docs/MASTER-BLUEPRINT.md §20): kuota halaman normal dari Admin → Kuota gratis, Haiku saja ──
  let freeSet: FreeSettings | null = null;
  let free: CheckDoc['free'];
  if (opts.freeQuota) {
    const f = await getFree(store);
    freeSet = f;
    const per = f.period === 'week' ? tr(L, 'minggu', 'week') : tr(L, 'bulan', 'month');
    if (!f.enabled) throw new CheckInputError(403, tr(L, 'Cek Gratis sedang tidak tersedia. Pakai Cek Lengkap (token).', 'The Free Check is not available right now. Use the Full Check (tokens).'));
    if (isDisposable(user.email)) throw new CheckInputError(403, tr(L, 'Akun dengan e-mail sekali pakai tidak mendapat kuota gratis. Pakai e-mail tetap, atau Cek Lengkap (token).', 'Accounts with a throwaway e-mail address get no free quota. Use a permanent address, or the Full Check (tokens).'));
    const st = await freeStatus(store, user.id, f);
    if (opts.freeQuota.netHash && !(await networkAllows(store, user.id, opts.freeQuota.netHash, st.period.key))) {
      throw new CheckInputError(403, tr(L, `Kuota gratis ${per} ini dari jaringan dan perangkat ini sudah dipakai akun lain. Pakai Cek Lengkap (token), atau tunggu periode berikutnya.`, `This ${per}'s free quota from this network and device is already used by other accounts. Use the Full Check (tokens), or wait for the next period.`));
    }
    const count = normalPages(input.text, f);
    const allowedNow = Math.min(st.remaining, f.maxPerCheck);
    if (count.pages > allowedNow) {
      const choice: FreeChoice = { pages: count.pages, remaining: st.remaining, quota: f.pages, maxPerCheck: f.maxPerCheck, period: f.period, resetAt: st.period.resetAt, allowedNow, wordsPerPage: f.wordsPerPage };
      if (!opts.freeQuota.partial || allowedNow < 1) {
        throw new FreeChoiceError(
          count.pages > f.pages
            ? tr(L, `Naskah ini ${count.pages} halaman — lebih dari seluruh kuota gratis (${f.pages} halaman per ${per}).`, `This text is ${count.pages} pages — more than the whole free quota (${f.pages} pages per ${per}).`)
            : tr(L, `Naskah ini ${count.pages} halaman; yang bisa diperiksa gratis sekarang ${allowedNow} halaman.`, `This text is ${count.pages} pages; ${allowedNow} can be checked for free right now.`),
          choice,
        );
      }
      input = { ...input, text: firstPages(input.text, allowedNow, f) };
      free = { pages: normalPages(input.text, f).pages, periodKey: st.period.key, partialOf: count.pages };
    } else {
      free = { pages: count.pages, periodKey: st.period.key };
    }
    input = { ...input, mode: 'haiku', rubricId: null };
  }
  const words = countWords(input.text);
  if (words < 30) throw new CheckInputError(400, tr(L, 'Teks terlalu pendek (minimal 30 kata).', 'Text too short (minimum 30 words).'));
  const maxWords = isAdmin(user) ? 60_000 : 20_000;
  if (words > maxWords) throw new CheckInputError(400, tr(L, `Teks terlalu panjang (maks. ${maxWords} kata per pemeriksaan).`, `Text too long (max ${maxWords} words per check).`));
  // Naskah yang pernah diunggah (MASTER-BLUEPRINT §26): bagian yang tersimpan dengan mesin yang sama tidak dikirim lagi ke
  // AI (biaya perusahaan 0) — dicari di tahap pertama mesin; pesanan di bawah tetap perkiraan penuh, selisihnya kembali.
  // Mesin yang dimatikan admin tidak pernah diganti diam-diam dengan mesin lain (apalagi yang lebih mahal): ditolak.
  const avail = engineAvailability(controls);
  if ((input.mode === 'sonnet' && !avail.sonnet) || (input.mode === 'opus' && !avail.opus) || (input.mode === 'forensic' && !avail.forensic)) {
    throw new CheckInputError(403, tr(L, 'Mesin yang dipilih sedang nonaktif. Pilih Smart Auto atau mesin lain yang aktif.', 'The chosen engine is switched off for now. Choose Smart Auto or another active engine.'));
  }
  // Mesin mengikuti pembelian (MASTER-BLUEPRINT §28.3): mesin di atas paket member ditolak, tidak dialihkan diam-diam.
  const tier = tierOf(user);
  // „Ajukan tinjauan“ (sengketa) tetap terbuka untuk semua member.
  if (!opts.bench && !free && !opts.noCache && !modeAllowed(input.mode, tier)) {
    const need = TIERS[ENGINE_MIN_TIER[input.mode]];
    throw new CheckInputError(403, tr(L, `Mesin ${PUBLIC_NAME[input.mode]} terbuka mulai paket ${need.id}. Pilih Smart Auto, atau beli paket ${need.id} di menu Token.`, `The ${PUBLIC_NAME[input.mode]} engine unlocks from the ${need.en} package. Choose Smart Auto, or buy the ${need.en} package under Tokens.`));
  }
  // Fable 5.1 (pemilik, 8 Nov 2026): hanya bila diizinkan admin, dan hanya setelah member menekan „Ya, saya yakin“.
  if (input.mode === 'fable') {
    if (!controls.fableEnabled || controls.disabledModels.includes('claude-fable-5-1')) throw new CheckInputError(403, tr(L, 'Elite sedang tidak tersedia. Silakan pilih mesin lain.', 'Elite is not available right now. Please choose another engine.'));
    if (!input.fableOk && !opts.bench) throw new CheckInputError(400, tr(L, 'Mohon konfirmasi dulu bahwa Anda memang ingin memakai Elite.', 'Please confirm first that you really want to use Elite.'));
  }
  const routedEng = applyRouter(await getEngine(store), controls);
  if (routedEng.blocked.length) throw new CheckInputError(503, tr(L, 'Tidak ada mesin AI aktif yang mampu untuk pemeriksaan ini. Hubungi admin.', 'No active AI engine can run this check. Contact the admin.'));
  const eng = routedEng.eng;
  // Batas biaya harian menghitung juga biaya TERBURUK semua pemeriksaan yang sedang berjalan (biaya mereka baru dicatat
  // saat selesai), supaya banyak pemeriksaan yang dibuat bersamaan tidak bisa melewati batas.
  const worstUsd = free && freeSet ? freeWorstUsd(eng, freeSet, free.pages) : hardBoundUsd(words, input.mode, Boolean(input.rubricId), eng);
  const inflight = await inflightWorstUsd(store);
  if (free && freeSet && (await freeSpendToday(store)) + inflight.free + worstUsd > freeSet.dailyBudgetUsd) {
    throw new CheckInputError(503, tr(L, 'Kuota gratis platform untuk hari ini sudah penuh. Coba lagi besok, atau pakai Cek Lengkap (token).', 'Today\u2019s platform-wide free capacity is used up. Try again tomorrow, or use the Full Check (tokens).'));
  }
  if ((await spendToday(store)) + inflight.all + worstUsd > eng.dailyCapUsd) {
    throw new CheckInputError(503, tr(L, 'Kapasitas harian sedang penuh. Coba lagi besok atau hubungi admin.', 'Daily capacity is full. Try again tomorrow or contact the admin.'));
  }
  // Anti-curang: member yang berulang kali membuat pemeriksaan gagal (biaya AI-nya ditanggung platform) dijeda 24 jam.
  if (!isAdmin(user) && !opts.bench && (await count(env, `costly-fail:${user.id}`, 86_400)) >= MAX_COSTLY_FAILURES_PER_DAY) {
    throw new CheckInputError(429, tr(L, 'Terlalu banyak pemeriksaan gagal dalam 24 jam terakhir. Coba lagi besok, atau hubungi admin bila ini keliru.', 'Too many failed checks in the last 24 hours. Try again tomorrow, or contact the admin if this is a mistake.'));
  }
  const billing = await getBilling(store);
  const est = estimateTokens(words, input.mode, Boolean(input.rubricId), billing, eng);
  const id = newId('chk');
  const charge = !(opts.prepaid || opts.free || opts.bench || opts.freeQuota || isAdmin(user));
  if (charge || opts.freeQuota) {
    // Anti-banjir: batas pemeriksaan berjalan bersamaan per member.
    // VVIP (MASTER-BLUEPRINT §28.6): 3× pemeriksaan bersamaan.
    const maxRun = billing.maxConcurrent * (isVvip(tier) ? 3 : 1);
    const { items: running } = await store.list(`i/user-active/${user.id}/`, { limit: maxRun + 1 });
    if (running.length >= maxRun) {
      throw new CheckInputError(429, tr(L, `Maksimal ${maxRun} pemeriksaan berjalan bersamaan. Tunggu yang sedang berjalan selesai.`, `At most ${maxRun} checks may run at once. Wait for the running ones to finish.`));
    }
  }
  if (free && freeSet) {
    try {
      await reserveFreePages(store, user.id, freeSet, free.pages, id);
    } catch (err) {
      if (err instanceof FreeQuotaError) {
        const st = periodOf(freeSet);
        throw new FreeChoiceError(tr(L, 'Sisa kuota gratis berubah. Pilih lagi.', 'The free quota left has changed. Choose again.'), { pages: free.pages, remaining: err.remaining, quota: freeSet.pages, maxPerCheck: freeSet.maxPerCheck, period: freeSet.period, resetAt: st.resetAt, allowedNow: Math.min(err.remaining, freeSet.maxPerCheck), wordsPerPage: freeSet.wordsPerPage });
      }
      throw err;
    }
  }
  // Batas belanja (Admin → Kendali biaya): per pemeriksaan dan per member per hari, dicek sebelum token dipesan.
  if (charge && controls.maxTokensPerCheck > 0 && est.reserve > controls.maxTokensPerCheck) {
    throw new CheckInputError(400, tr(L, `Pemeriksaan ini memesan ${est.reserve} token, di atas batas ${controls.maxTokensPerCheck} token per pemeriksaan. Pendekkan naskah atau pilih mesin yang lebih hemat.`, `This check reserves ${est.reserve} tokens, above the limit of ${controls.maxTokensPerCheck} tokens per check. Shorten the text or choose a cheaper engine.`));
  }
  if (charge && controls.memberDailyTokens > 0 && !isVvip(tier)) {
    try {
      await addMemberDay(store, user.id, wibDate(), est.reserve, controls.memberDailyTokens);
    } catch (err) {
      if (err instanceof SpendLimitError) throw new CheckInputError(429, tr(L, `Batas harian ${err.limit} token per member tercapai (sudah dipesan ${err.used}). Coba lagi besok.`, `The daily limit of ${err.limit} tokens per member is reached (${err.used} reserved). Try again tomorrow.`));
      throw err;
    }
  }
  let res: CheckDoc['reserve'];
  let partial = false;
  if (opts.prepaid) res = { batch: true };
  else if (!charge) res = { none: true };
  else {
    try {
      res = await reserve(store, user.id, est.reserve, `Pesan ${id} (${words} kata)`, id);
    } catch (err) {
      if (!(err instanceof InsufficientError)) throw err;
      // §30 (pemilik, 8 Nov 2026: „Limit habis tetep terpotong … pekerjaan bisa d lanjutkan jika deposit lagi“): saldo kurang
      // tetapi cukup untuk mulai → seluruh saldo dipesan; pekerjaan dijeda saat pesanan habis dan dilanjutkan setelah isi token.
      const minStart = Math.max(1, est.min);
      if (err.available < minStart) {
        throw new CheckInputError(402, tr(L, `Token tidak cukup untuk memulai: perlu minimal ${minStart} token (pemakaian biasanya ${est.min}–${est.typical} token), saldo ${err.available}. Beli token atau isi deposit di menu Token.`, `Not enough tokens to start: at least ${minStart} tokens are needed (usage is usually ${est.min}–${est.typical}), balance ${err.available}. Buy tokens or top up under Tokens.`));
      }
      res = await reserve(store, user.id, err.available, `Pesan ${id} (${words} kata, sebagian — dijeda bila habis)`, `${id}:p`);
      partial = true;
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
    purpose: input.purpose ?? 'umum',
    free,
    noReuse: opts.noCache || undefined,
    ceiling: opts.bench || opts.noCache ? undefined : autoCeiling(tier),
    stage: 'prep',
    attempts: 0,
    lease: 0,
    reserved: res && 'tokens' in res ? res.tokens : 0,
    reserve: res,
    cost: 0,
    ...(partial ? { partial: true } : {}),
    // §30: naskah sesi yang belum tertutup token — tersimpan, menunggu member menambah token lalu „Lanjutkan sesi“.
    ...(opts.waiting
      ? { stage: 'failed' as const, batchCharged: 0, resume: { stage: 'prep' as const, reason: 'tokens' as const, at: now }, error: { code: 'no_tokens', msg: 'Menunggu token.' } }
      : {}),
  };
  try {
    await store.put(textKey(id), await seal(env.MASTER_KEY, { raw: input.text }));
    await store.put(checkKey(id), doc);
    if (!opts.waiting) await store.createOnce(`i/active/${id}`, {}, { uid: user.id, at: now, worst: worstUsd, free: Boolean(free) });
    if ((charge || opts.freeQuota) && !opts.waiting) await store.createOnce(`i/user-active/${user.id}/${id}`, {}, { at: now });
    if (!opts.bench) await store.createOnce(`i/user-checks/${user.id}/${invTs(now)}~${id}`, {}, { title: input.title, at: now, batch: opts.batchId ?? null });
    // Naskah member dibersihkan otomatis 90 hari setelah dibuat; riwayat & angka laporan tidak pernah dihapus (§27).
    if (!opts.bench) await schedulePurge(store, 'c', id, now);
  } catch (err) {
    // Dokumen gagal dibuat setelah token dipesan: kembalikan pesanan (idempoten), jangan sampai saldo hilang.
    if (res && 'tokens' in res) await refund(store, user.id, res.tokens, `Batal membuat ${id}`, `abort:${id}`);
    if (free) await releaseFreePages(store, user.id, free.periodKey, id);
    throw err;
  }
  return doc;
}

/** Jumlah biaya terburuk (US$) semua pemeriksaan yang sedang berjalan — dari ringkasan indeks `i/active/`. */
async function inflightWorstUsd(store: Store): Promise<{ all: number; free: number }> {
  let all = 0;
  let free = 0;
  let cursor: string | undefined;
  for (let page = 0; page < 10; page += 1) {
    const { items, cursor: next } = await store.list<{ worst?: number; free?: boolean }>('i/active/', { limit: 1000, cursor });
    for (const it of items) {
      const w = Number(it.meta.worst) || 0;
      all += w;
      if (it.meta.free) free += w;
    }
    if (!next) break;
    cursor = next;
  }
  return { all, free };
}

/**
 * Pesan galat untuk member: tidak pernah menyebut penyedia AI, nama model, kunci, atau saldo akun perusahaan (rahasia
 * perusahaan, MASTER-BLUEPRINT §28.2). Rincian aslinya tetap tersimpan di pemeriksaan untuk admin.
 */
const MEMBER_ERR: Record<string, [string, string]> = {
  no_key: ['Layanan pemeriksaan sedang disiapkan admin.', 'The checking service is being set up by the admin.'],
  bad_key: ['Layanan pemeriksaan sedang mengalami gangguan; admin sudah diberi tahu.', 'The checking service is having trouble; the admin has been notified.'],
  bad_request: ['Layanan pemeriksaan sedang mengalami gangguan; admin sudah diberi tahu.', 'The checking service is having trouble; the admin has been notified.'],
  retry: ['Layanan sedang sibuk; sistem mencoba lagi otomatis.', 'The service is busy; the system retries automatically.'],
  refusal: ['Sebagian naskah tidak bisa dinilai otomatis.', 'Part of the text could not be assessed automatically.'],
  truncated: ['Naskah terlalu rumit untuk diselesaikan sekali jalan.', 'The text was too complex to finish in one go.'],
  timeout: ['Pemeriksaan melewati batas waktu 2 jam dan dijeda; pekerjaan yang sudah selesai tersimpan.', 'The check ran past its 2-hour limit and was paused; finished work is saved.'],
  no_tokens: ['Token pesanan habis — pekerjaan dijeda dan tersimpan.', 'The reserved tokens ran out — the work is paused and saved.'],
  stopped: ['Layanan dihentikan sementara oleh admin — pekerjaan tersimpan.', 'The service was paused by the admin — the work is saved.'],
  no_model: ['Mesin yang diperlukan sedang nonaktif — pekerjaan tersimpan.', 'The engine needed is switched off — the work is saved.'],
};
export function memberError(err: CheckDoc['error'] | undefined, L: Lang = 'id'): { code: string; msg: string } | null {
  if (!err) return null;
  const m = MEMBER_ERR[err.code];
  return { code: err.code, msg: m ? (L === 'en' ? m[1] : m[0]) : err.msg };
}

export function statusOf(doc: CheckDoc | null, L: Lang = 'id') {
  if (!doc) return null;
  return { id: doc.id, stage: doc.stage, t2n: doc.t2n ?? null, t3n: doc.t3n ?? null, skipped: doc.skipped ?? [], reportId: doc.reportId ?? null, error: memberError(doc.error, L), words: doc.analyzedWords ?? null, lang: doc.lang ?? null, reserved: doc.reserved, charged: doc.charged ?? null, retryAt: doc.lease > Date.now() ? doc.lease : null, resumable: Boolean(doc.resume), resumeReason: doc.resume?.reason ?? null, billed: doc.billed ?? 0 };
}

/* ── §30: lanjutkan pemeriksaan yang terhenti ─────────────────────────── */

export class ResumeError extends Error {
  constructor(public status: 402 | 404 | 409 | 410 | 429 | 503, message: string, public code: string) {
    super(message);
  }
}

/**
 * Lanjutkan pemeriksaan yang terhenti (gagal / token habis / dijeda): pesan token untuk sisa pekerjaan lalu teruskan dari
 * tahap yang terhenti. Tahap yang sudah selesai tersimpan dan tidak ditagih ulang; bila saldo masih kurang, seluruh saldo
 * dipesan dan pekerjaan dijeda lagi saat habis (MASTER-BLUEPRINT §30).
 */
export async function resumeCheck(env: Env, store: Store, user: User, id: string, L: Lang): Promise<CheckDoc> {
  const doc = await store.get<CheckDoc>(checkKey(id));
  if (!doc || doc.uid !== user.id) throw new ResumeError(404, tr(L, 'Pemeriksaan tidak ditemukan.', 'Check not found.'), 'not_found');
  if (doc.stage !== 'failed' || !doc.resume) throw new ResumeError(409, tr(L, 'Pemeriksaan ini tidak bisa dilanjutkan.', 'This check cannot be resumed.'), 'not_resumable');
  const sealed = await store.get<Sealed>(textKey(doc.id));
  if (!sealed) throw new ResumeError(410, tr(L, 'Naskahnya sudah terhapus otomatis — unggah ulang untuk memeriksanya lagi.', 'The text was deleted automatically — upload it again to check it.'), 'gone');
  const controls = await getControls(store);
  if (controls.emergencyStop) throw new ResumeError(503, tr(L, 'Pemeriksaan sedang dihentikan sementara oleh admin. Coba lagi nanti — pekerjaan Anda tetap tersimpan.', 'Checks are paused by the admin for now. Try again later — your work stays saved.'), 'stopped');
  const routed = applyRouter(await getEngine(store), controls);
  if (routed.blocked.length) throw new ResumeError(503, tr(L, 'Mesin yang diperlukan sedang nonaktif. Coba lagi nanti — pekerjaan Anda tetap tersimpan.', 'The engine needed is switched off. Try again later — your work stays saved.'), 'no_model');
  const eng = routed.eng;
  const billing = await getBilling(store);
  const words = doc.words ?? countWords((await unseal<TextDoc>(env.MASTER_KEY!, sealed)).raw);
  const est = estimateTokens(words, doc.mode, Boolean(doc.rubricId), billing, eng);
  const billed = doc.billed ?? 0;
  const owed = Math.max(0, Math.ceil((await consumedTokens(store, doc.id, billing, eng)) - 1e-9) - billed);
  const need = Math.max(1, est.reserve - billed, owed + 1);
  const admin = isAdmin(user);
  const tier = tierOf(user);
  if (!admin) {
    const maxRun = billing.maxConcurrent * (isVvip(tier) ? 3 : 1);
    const { items: running } = await store.list(`i/user-active/${user.id}/`, { limit: maxRun + 1 });
    if (running.length >= maxRun) throw new ResumeError(429, tr(L, `Maksimal ${maxRun} pemeriksaan berjalan bersamaan. Tunggu yang sedang berjalan selesai.`, `At most ${maxRun} checks may run at once. Wait for the running ones to finish.`), 'busy');
    if (controls.memberDailyTokens > 0 && !isVvip(tier)) {
      try {
        await addMemberDay(store, user.id, wibDate(), need, controls.memberDailyTokens);
      } catch (err) {
        if (err instanceof SpendLimitError) throw new ResumeError(429, tr(L, `Batas harian ${err.limit} token per member tercapai. Lanjutkan besok — pekerjaan Anda tetap tersimpan.`, `The daily limit of ${err.limit} tokens per member is reached. Resume tomorrow — your work stays saved.`), 'daily');
        throw err;
      }
    }
  }
  const round = (doc.round ?? 0) + 1;
  let res: CheckDoc['reserve'] = { none: true };
  let partial = false;
  if (!admin) {
    try {
      res = await reserve(store, user.id, need, `Lanjutkan ${doc.id} (putaran ${round})`, `${doc.id}:r${round}`);
    } catch (err) {
      if (!(err instanceof InsufficientError)) throw err;
      if (err.available <= owed) {
        throw new ResumeError(402, tr(L, `Saldo token Anda ${err.available}; perlu sekitar ${need} token untuk menyelesaikan pekerjaan ini (minimal ${owed + 1} untuk melanjutkan). Isi deposit atau beli token, lalu klik Lanjutkan lagi — pekerjaan Anda tetap tersimpan.`, `Your token balance is ${err.available}; about ${need} tokens are needed to finish this work (at least ${owed + 1} to resume). Top up or buy tokens, then click Resume again — your work stays saved.`), 'no_tokens');
      }
      res = await reserve(store, user.id, err.available, `Lanjutkan ${doc.id} (putaran ${round}, sebagian)`, `${doc.id}:r${round}:p`);
      partial = true;
    }
  }
  const now = Date.now();
  let ok = false;
  const after = await store.cas<CheckDoc>(checkKey(doc.id), (cur) => {
    ok = false;
    if (!cur || cur.stage !== 'failed' || !cur.resume || (cur.round ?? 0) !== round - 1) return null;
    ok = true;
    return {
      ...cur, stage: cur.resume.stage, resume: undefined, error: undefined, attempts: 0, lease: 0,
      reserved: res && 'tokens' in res ? res.tokens : 0, reserve: res, partial: partial || undefined,
      round, costPrev: cur.cost, charged: undefined, roundAt: now, updatedAt: now,
    };
  });
  if (!ok || !after) {
    if (res && 'tokens' in res) await refund(store, user.id, res.tokens, `Batal melanjutkan ${doc.id}`, `abort:${doc.id}:r${round}`);
    throw new ResumeError(409, tr(L, 'Pemeriksaan ini sudah dilanjutkan.', 'This check has already been resumed.'), 'already');
  }
  await store.createOnce(`i/active/${doc.id}`, {}, { uid: doc.uid, at: now, worst: hardBoundUsd(words, doc.mode, Boolean(doc.rubricId), eng), free: false });
  if (!admin) await store.createOnce(`i/user-active/${doc.uid}/${doc.id}`, {}, { at: now });
  return after;
}

checks.post('/api/checks/:id/resume', async (c) => {
  const user = c.get('user');
  const L = portalLang(c);
  if (!user) return c.json({ error: 'login' }, 401);
  if (!(await limit(c.env, `resume:${user.id}`, 60, 3600))) return c.json({ error: tr(L, 'Terlalu banyak percobaan per jam.', 'Too many attempts per hour.') }, 429);
  try {
    const doc = await resumeCheck(c.env, c.get('store'), user, c.req.param('id'), L);
    return c.json(statusOf(doc, L));
  } catch (err) {
    if (err instanceof ResumeError) return c.json({ error: err.message, code: err.code }, err.status);
    throw err;
  }
});

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
    const freeQuota = body.mode === 'free' ? { partial: body.partial === true || body.partial === '1', netHash: await netHashOf(c) } : undefined;
    const doc = await createCheck(c.env, c.get('store'), user, sanitizeInput(body, L), L, { freeQuota });
    return c.json({ id: doc.id });
  } catch (err) {
    if (err instanceof FreeChoiceError) return c.json({ error: err.message, choice: err.choice }, 409);
    if (err instanceof CheckInputError) return c.json({ error: err.message }, err.status as 400);
    throw err;
  }
});

checks.get('/api/checks/:id', async (c) => {
  const doc = await ownCheck(c, c.get('store'), c.req.param('id'));
  if (!doc) return c.json({ error: 'not found' }, 404);
  return c.json(statusOf(doc, portalLang(c)));
});

checks.post('/api/checks/:id/advance', async (c) => {
  const doc = await ownCheck(c, c.get('store'), c.req.param('id'));
  if (!doc) return c.json({ error: 'not found' }, 404);
  const after = await advance(c.env, doc.id);
  return c.json(statusOf(after ?? doc, portalLang(c)));
});

const URL_ERR_EN: Record<InputUrlError['code'], string> = {
  bad_url: 'Invalid URL — only http/https addresses without a user name or password.',
  blocked_host: 'Internal network addresses cannot be scanned.',
  protected: 'This site cannot be scanned on xscan.es.',
  robots: 'This site’s robots.txt does not allow that page to be fetched.',
  too_big: 'The page is larger than 5 MB.',
  timeout: 'The site took too long to answer.',
  not_html: 'This address is not an article page (HTML/text).',
  http: 'The site could not be reached or answered with an error.',
  redirects: 'Too many redirects.',
  empty: 'No article text found (under 30 words) — the page may need JavaScript or a login.',
  bad_sitemap: 'Not an XML sitemap (urlset/sitemapindex).',
};

/**
 * Ambil artikel dari URL untuk formulir periksa (MASTER-BLUEPRINT §7, file pemilik „Master_xscan“). Hanya mengambil dan
 * mengekstrak teks — tidak memanggil AI dan tidak memotong token; pemeriksaan tetap lewat formulir biasa.
 */
checks.post('/api/extract', async (c) => {
  const user = c.get('user');
  const L = portalLang(c);
  if (!user) return c.json({ error: 'login' }, 401);
  if (!(await limit(c.env, `extract:${user.id}`, 150, 3600))) return c.json({ error: tr(L, 'Terlalu banyak pengambilan URL per jam.', 'Too many URL fetches per hour.') }, 429);
  const body = (await c.req.json().catch(() => ({}))) as { url?: unknown };
  try {
    const a = await fetchArticle(String(body.url ?? '').slice(0, 2000));
    return c.json({ url: a.url, title: a.title.slice(0, 200), author: a.author.slice(0, 120), published: a.published.slice(0, 40), lang: a.lang.slice(0, 12), words: a.words, text: a.text.slice(0, 200_000) });
  } catch (err) {
    if (err instanceof InputUrlError) return c.json({ error: L === 'en' ? URL_ERR_EN[err.code] : err.message, code: err.code }, 422);
    throw err;
  }
});

/** Daftar URL artikel dari sitemap (bertingkat maks. 3) untuk sesi massal. Tanpa AI, tanpa token. */
export const SITEMAP_MAX_PER_IMPORT = 50;
checks.post('/api/sitemap', async (c) => {
  const user = c.get('user');
  const L = portalLang(c);
  if (!user) return c.json({ error: 'login' }, 401);
  if (!(await limit(c.env, `sitemap:${user.id}`, 10, 3600))) return c.json({ error: tr(L, 'Terlalu banyak impor sitemap per jam.', 'Too many sitemap imports per hour.') }, 429);
  const body = (await c.req.json().catch(() => ({}))) as { url?: unknown };
  try {
    const r = await collectSitemap(String(body.url ?? '').slice(0, 2000), SITEMAP_MAX_PER_IMPORT);
    if (!r.urls.length) return c.json({ error: tr(L, 'Sitemap tidak berisi URL artikel yang boleh diambil.', 'The sitemap holds no article URL that may be fetched.') }, 422);
    return c.json(r);
  } catch (err) {
    if (err instanceof InputUrlError) return c.json({ error: L === 'en' ? URL_ERR_EN[err.code] : err.message, code: err.code }, 422);
    throw err;
  }
});

/** Perkiraan token untuk formulir (dihitung server; klien tidak pernah menentukan harga). */
checks.get('/api/estimate', async (c) => {
  if (!c.get('user')) return c.json({ error: 'login' }, 401);
  const store = c.get('store');
  const words = Math.max(0, Math.min(60_000, Number(c.req.query('words') ?? 0) || 0));
  const mode: Mode = parseMode(c.req.query('mode')) ?? 'auto';
  const rubric = c.req.query('rubric') === '1';
  const b = await getBilling(store);
  const eng = applyRouter(await getEngine(store), await getControls(store)).eng;
  const all = Object.fromEntries(MODES.map((m) => [m, estimateTokens(words, m, rubric, b, eng)])) as Record<Mode, ReturnType<typeof estimateTokens>>;
  const modes = Object.fromEntries(MODES.map((m) => [PUBLIC_MODE[m], all[m]]));
  const pages = Math.round((words / b.wordsPerPage) * 10) / 10;
  // Cek Gratis memakai kuota halaman, bukan token: perkiraan token-nya nol (kuota dihitung server saat dikirim).
  if (c.req.query('mode') === 'free') return c.json({ min: 0, typical: 0, reserve: 0, modes, pages, free: true, short: 0 });
  // Pratinjau sebelum memindai (file pemilik „Xscan“ §4): saldo, kekurangan, lalu tombol isi saldo di formulir.
  const balance = isAdmin(c.get('user')!) ? Number.MAX_SAFE_INTEGER : await balanceOf(store, c.get('user')!.id);
  const short = Math.max(0, all[mode]!.reserve - balance);
  return c.json({ ...all[mode], modes, pages, short });
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
    doc = await createCheck(c.env, store, user, { text: raw, title: `${orig.title} (${tr(L, 'tinjauan', 'review')})`, author: orig.author, genre: orig.genre, level: orig.level, reportLang: orig.reportLang, rubricId: orig.rubricId, mode: 'forensic' }, L, { noCache: true });
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
  /** Sesi lomba (bawaan) atau kelas. */
  purpose?: Purpose;
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
  const controls = await getControls(store);
  if (controls.emergencyStop) return c.json({ error: tr(L, 'Pemeriksaan sedang dihentikan sementara oleh admin. Saldo Anda aman.', 'Checks are paused by the admin for now. Your balance is safe.') }, 503);
  const eng = applyRouter(await getEngine(store), controls).eng;
  const billing = await getBilling(store);
  const mode: Mode = parseMode(body.mode) ?? 'auto';
  const each = entries.map((e) => estimateTokens(countWords(String(e.text)), mode, Boolean(batch.rubricId), billing, eng).reserve);
  const total = each.reduce((a, b) => a + b, 0);
  if (!isAdmin(user) && controls.maxTokensPerCheck > 0 && Math.max(...each) > controls.maxTokensPerCheck) {
    return c.json({ error: tr(L, `Ada naskah yang memesan ${Math.max(...each)} token, di atas batas ${controls.maxTokensPerCheck} token per pemeriksaan.`, `One text reserves ${Math.max(...each)} tokens, above the limit of ${controls.maxTokensPerCheck} tokens per check.`) }, 400);
  }
  if (!isAdmin(user) && controls.memberDailyTokens > 0 && !isVvip(tierOf(user))) {
    try {
      await addMemberDay(store, user.id, wibDate(), total, controls.memberDailyTokens);
    } catch (err) {
      if (err instanceof SpendLimitError) return c.json({ error: tr(L, `Batas harian ${err.limit} token per member tercapai (sudah dipesan ${err.used}).`, `The daily limit of ${err.limit} tokens per member is reached (${err.used} reserved).`) }, 429);
      throw err;
    }
  }
  let reserved: Reservation | null = null;
  let fit = entries.length;
  let reservedTotal = total;
  if (!isAdmin(user)) {
    const runId = `${batch.id}:${newId('run')}`;
    try {
      reserved = await reserve(store, user.id, total, `Pesan sesi ${batch.id} (${entries.length} naskah)`, runId);
    } catch (err) {
      if (!(err instanceof InsufficientError)) throw err;
      // §30: naskah dimulai berurutan selama saldo mencukupi; sisanya tersimpan „menunggu token“ dan berjalan setelah member
      // menambah token lalu menekan „Lanjutkan sesi“.
      let acc = 0;
      fit = 0;
      for (const t of each) {
        if (acc + t > err.available) break;
        acc += t;
        fit += 1;
      }
      if (fit === 0) return c.json({ error: tr(L, `Token tidak cukup untuk memulai: naskah pertama memesan ${each[0]} token, saldo ${err.available}. Beli token atau isi deposit di menu Token.`, `Not enough tokens to start: the first entry reserves ${each[0]} tokens, balance ${err.available}. Buy tokens or top up under Tokens.`) }, 402);
      reservedTotal = acc;
      reserved = await reserve(store, user.id, acc, `Pesan sesi ${batch.id} (${fit} dari ${entries.length} naskah; sisanya menunggu token)`, `${runId}:p`);
    }
  }
  const ids: string[] = [];
  let seq = batch.items;
  try {
    for (const [k, e] of entries.entries()) {
      const waiting = k >= fit;
      const doc = await createCheck(c.env, store, user, sanitizeInput({ ...e, rubric: batch.rubricId, reportLang: batch.reportLang, genre: 'essay', mode, purpose: batch.purpose ?? 'lomba' }, L), L, { batchId: batch.id, prepaid: true, waiting });
      seq += 1;
      await store.createOnce(`i/batch-items/${batch.id}/${String(seq).padStart(5, '0')}~${doc.id}`, {}, { title: doc.title, author: doc.author });
      if (!waiting) ids.push(doc.id);
    }
  } finally {
    await store.cas<Batch>(batchKey(batch.id), (cur) => (cur ? { ...cur, items: seq, settled: false, reservedTokens: (cur.reservedTokens ?? 0) + (reserved ? reservedTotal : 0) } : null));
    // Cron menuntaskan sesi yang terbuka walau tab ditutup sebelum selesai.
    if (reserved) await store.put(`i/open-batches/${batch.id}`, { at: Date.now() });
  }
  return c.json({ ids, reserved: reserved ? reservedTotal : 0, waiting: entries.length - fit });
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
    // Naskah yang dilanjutkan dengan pesanan sendiri (§30) tidak menahan penyelesaian sesi: bagian sesinya sudah tetap.
    if (doc.stage !== 'done' && doc.stage !== 'failed' && doc.batchCharged === undefined) return null; // belum semua selesai
    charged += doc.batchCharged ?? (doc.stage === 'done' ? doc.tokens ?? 0 : 0);
  }
  charged = Math.min(charged, batch.reservedTokens);
  const already = batch.refundedTokens ?? 0;
  const due = Math.max(0, batch.reservedTokens - charged - already);
  if (due > 0) {
    await refund(store, batch.uid, due, `Penyelesaian sesi ${batchId} (ditagih ${charged} token)`, `batch:${batchId}:${already + due}`);
  }
  // Rekap member (sekali per sesi): token sesi yang benar-benar dipotong.
  await addStats(store, batch.uid, `batch:${batchId}`, { tokensUsed: charged });
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
