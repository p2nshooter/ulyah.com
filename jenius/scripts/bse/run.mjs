// Pipeline buku pelajaran BSE untuk jenius.es (docs/JENIUS-BLUEPRINT.md §0.26), dijalankan di GitHub Actions:
// unduh PDF → pdftotext → periksa kalimat izin di halaman hak cipta → potong per bab → unggah ke POST /api/ops/book.
// Buku yang sudah tayang atau pernah dilewati tidak dikerjakan ulang (POST /api/ops/state).
//   OPS_KEY=… node scripts/bse/run.mjs --url https://jenius.es --limit 20
//   node scripts/bse/run.mjs --dry --ids 3,5,1203      (tanpa unggah: cetak ringkasan hasil konversi)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hasPermission, findAuthors, segment, VERSION } from './convert.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i < 0 ? d : args[i + 1] ?? d; };
const DRY = args.includes('--dry');
const URL_BASE = opt('url', 'https://jenius.es');
const LIMIT = Number(opt('limit', '20'));
const IDS = opt('ids', '') ? new Set(opt('ids', '').split(',').map((s) => s.trim())) : null;
const KEY = process.env.OPS_KEY || '';
const data = JSON.parse(fs.readFileSync(new URL('../../data/bse.json', import.meta.url), 'utf8'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bse-'));
const headers = { 'content-type': 'application/json', 'x-ops-key': KEY, 'x-ops-name': 'bse' };

async function state(skip = []) {
  const r = await fetch(`${URL_BASE}/api/ops/state`, { method: 'POST', headers, body: JSON.stringify({ prefix: 'bse-', skip }) });
  if (!r.ok) throw new Error(`state ${r.status} ${await r.text()}`);
  return r.json();
}

async function download(url, file) {
  for (let i = 0; i < 3; i += 1) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'jenius.es-bse-import (+https://jenius.es/lisensi)' }, signal: AbortSignal.timeout(180_000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 10_000 || buf.subarray(0, 4).toString() !== '%PDF') throw new Error(`bukan PDF (${buf.length} bita)`);
      fs.writeFileSync(file, buf);
      return buf.length;
    } catch (err) {
      if (i === 2) throw err;
      await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
    }
  }
  return 0;
}

const summary = { done: 0, skipped: 0, failed: 0 };
const skips = [];
let st = { done: [], skipped: [] };
if (!DRY) st = await state();
// Buku yang sudah dikerjakan versi pengonversi ini dilewati; hasil versi lama dikerjakan ulang.
const seen = new Set([...st.done, ...st.skipped].filter((x) => x.v >= VERSION).map((x) => x.id));
const queue = data.books.filter((b) => (IDS ? IDS.has(String(b.id)) : !seen.has(`bse-${b.id}`))).slice(0, IDS ? undefined : LIMIT);
console.log(`BSE (pengonversi v${VERSION}): ${data.books.length} buku dalam daftar, ${st.done.length} tayang, ${st.skipped.length} dilewati; dikerjakan sekarang: ${queue.length}${DRY ? ' (uji kering)' : ''}`);

for (const b of queue) {
  const id = `bse-${b.id}`;
  const pdf = path.join(tmp, `${b.id}.pdf`), txt = path.join(tmp, `${b.id}.txt`);
  try {
    const size = await download(b.file, pdf);
    execFileSync('pdftotext', ['-enc', 'UTF-8', '-q', pdf, txt], { timeout: 300_000 });
    const text = fs.readFileSync(txt, 'utf8');
    if (args.includes('--debug')) {
      // Diagnosis: halaman hak cipta, baris „bab“ per halaman, daftar isi — untuk menyetel pengonversi.
      const pages = text.split('\f');
      console.log(`  [debug] ${id}: ${pages.length} halaman`);
      pages.forEach((p, i) => {
        const ls = p.split('\n').map((l) => l.trim()).filter(Boolean);
        if (/hak cipta|dialih|digandakan|diunduh|penulis|penyusun/i.test(p) && i < 40) console.log(`  [hc p${i}] ${ls.slice(0, 40).join(' | ').slice(0, 700)}`);
        ls.forEach((l, k) => { if (/^\s*(bab|chapter|unit|pelajaran|tema)\b/i.test(l) && l.length < 90) console.log(`  [bab p${i} l${k}/${ls.length}] ${l}`); });
      });
      const mid = pages[Math.floor(pages.length / 2)].split('\n').slice(0, 30).join(' ⏎ ');
      console.log(`  [tengah] ${mid.slice(0, 900)}`);
    }
    if (!hasPermission(text)) {
      skips.push({ id, reason: 'tanpa kalimat izin di halaman hak cipta', v: VERSION });
      summary.skipped += 1;
      console.log(`- ${id} ${b.title}: DILEWATI — kalimat izin tidak ditemukan`);
      continue;
    }
    const { chapters, words } = segment(text);
    if (!chapters.length || words < 1500) {
      skips.push({ id, reason: `teks terlalu sedikit (${words} kata; PDF hasil pindai?)`, v: VERSION });
      summary.skipped += 1;
      console.log(`- ${id} ${b.title}: DILEWATI — ${words} kata terbaca`);
      continue;
    }
    const author = findAuthors(text) || 'Pusat Perbukuan, Departemen Pendidikan Nasional';
    const payload = { id, source: 'bse', converter: VERSION, title: b.title, author, level: b.level, grade: b.grade, subject: b.subject, part: b.part, year: b.year, sourceUrl: b.page, chapters };
    console.log(`+ ${id} ${b.title} — ${(size / 1e6).toFixed(1)} MB, ${chapters.length} bab, ${words} kata, penulis: ${author}`);
    if (DRY) {
      for (const c of chapters.slice(0, 4)) console.log(`    · ${c.title} (${c.blocks.length} blok): ${(c.blocks.find((x) => x.t === 'p')?.text ?? '').slice(0, 160)}`);
      continue;
    }
    const r = await fetch(`${URL_BASE}/api/ops/book`, { method: 'POST', headers, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(`unggah ${r.status} ${JSON.stringify(j)}`);
    summary.done += 1;
  } catch (err) {
    summary.failed += 1;
    console.log(`! ${id} ${b.title}: GAGAL — ${err instanceof Error ? err.message : err}`);
  } finally {
    fs.rmSync(pdf, { force: true });
    fs.rmSync(txt, { force: true });
  }
}
if (!DRY && skips.length) await state(skips);
console.log(`Selesai: ${summary.done} diunggah, ${summary.skipped} dilewati, ${summary.failed} gagal (dicoba lagi pada putaran berikutnya).`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `- BSE: ${summary.done} diunggah, ${summary.skipped} dilewati, ${summary.failed} gagal\n`);
