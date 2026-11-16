/**
 * Periksa hasil scripts/kamus/build.py SEBELUM diunggah ke R2: dibaca dengan pembaca yang sama dengan Worker
 * (src/kamus/reader.ts) dari folder lokal. Gagal = unggahan dibatalkan, versi kamus yang sedang aktif tetap dipakai.
 * Pemakaian: node --import tsx scripts/kamus/verify.ts <folder keluaran build.py>
 */
import fs from 'node:fs';
import path from 'node:path';
import { Kamus, meaningOf, type KBucket, type KLang, type Meta } from '../../src/kamus/reader.ts';

const dir = path.resolve(process.argv[2] ?? '');
const meta = { ...(JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')) as Omit<Meta, 'ver'>), ver: 'lokal' } as Meta;

const bucket: KBucket = {
  async get(key, opts) {
    if (key === 'kamus/current.json') return { text: async () => JSON.stringify(meta) };
    const rel = key.replace(/^kamus\/lokal\//, '');
    const file = path.join(dir, rel);
    let fd: number;
    try {
      fd = fs.openSync(file, 'r');
    } catch {
      return null;
    }
    try {
      const len = opts?.range ? opts.range.length : fs.fstatSync(fd).size;
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, opts?.range ? opts.range.offset : 0);
      return { text: async () => buf.toString('utf8') };
    } finally {
      fs.closeSync(fd);
    }
  },
};

const fails: string[] = [];
const k = (await Kamus.open(bucket))!;
async function expect(l: KLang, q: string, lemma: string, ui: 'id' | 'ja' | 'en', has?: string) {
  const r = await k.lookup(l, q, 3, ui);
  const top = r.entries[0];
  const m = top ? meaningOf(top, ui, 6) : { m: [], ml: ui };
  const ok = top?.w === lemma && (!has || m.m.some((x) => x.includes(has)));
  console.log(`${ok ? 'OK  ' : 'GAGAL'} ${l}:${q} → ${top?.w ?? '—'} [${ui}] ${m.m.slice(0, 4).join(' · ')}`);
  if (!ok) fails.push(`${l}:${q}`);
}
await expect('de', 'Haus', 'Haus', 'id', 'rumah');
await expect('de', 'Hauses', 'Haus', 'id', 'rumah');
await expect('de', 'ging', 'gehen', 'id', 'pergi');
await expect('de', 'Freund', 'Freund', 'id', 'teman');
await expect('de', 'Kühlschrank', 'Kühlschrank', 'ja', '冷蔵庫');
await expect('en', 'house', 'house', 'id', 'rumah');
await expect('en', 'Go', 'go', 'id', 'pergi');
await expect('en', 'children', 'child', 'id', 'anak');
await expect('en', 'beautiful', 'beautiful', 'ja', '美しい');
await expect('ja', '家', '家', 'id', 'rumah');
await expect('ja', 'たべる', '食べる', 'id', 'makan');
await expect('ja', '食べる', '食べる', 'en', 'eat');
await expect('ja', 'は', 'は', 'id', 'topik');
await expect('ja', '私', '私', 'id', 'saya');
if ((await k.exact('ja', '私'))[0]?.r?.[0] !== 'わたし') fails.push('cara baca 私');
await expect('id', 'rumah', 'rumah', 'ja');
const rumah = (await k.exact('id', 'rumah'))[0];
if (!rumah?.to?.de?.includes('Haus')) fails.push('id:rumah → de:Haus');
const seg = (await k.segment('私は日本語を勉強します。')).filter((x) => x.w).map((x) => x.t);
console.log('pecah:', seg.join(' | '));
if (!seg.includes('日本語') || !seg.some((x) => x.startsWith('勉強'))) fails.push('segmentasi Jepang');
const pre = (await k.prefix('de', 'haus', 5)).map((e) => e.w);
console.log('awalan haus:', pre.join(', '));
if (!pre.length) fails.push('awalan');
for (const l of ['de', 'en', 'ja', 'id'] as const) {
  const st = meta.langs[l];
  console.log(`${l}: ${st?.entries} entri, ${st?.forms} bentuk, arti id ${st?.id}, ja ${st?.ja}`);
  if (!st || st.entries < (l === 'en' ? 300000 : 30000)) fails.push(`jumlah entri ${l}`);
}
if (fails.length) {
  console.error(`\nPemeriksaan kamus GAGAL: ${fails.join(', ')}`);
  process.exit(1);
}
console.log('\nKamus lolos pemeriksaan.');
