import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uraiPg } from '../scripts/soal-bse.ts';
import { buatPaketMesin, kepalaMesin } from '../scripts/mesin-soal.ts';
import { KURIKULUM } from '../src/data/kurikulum.ts';
import { FORMAT, uraiSoal } from '../src/data/soal.ts';

test('soal BSE: opsi dua kolom („a. … c. … b. … d. …“) dan nomor soal tanpa batas blok', () => {
  const b = uraiPg('1. Daun kebanyakan berwarna hijau karena mengandung …. a. oksigen c. air b. karbon dioksida d. klorofil 2. Bunyi dihasilkan oleh benda yang .... a. bersinar b. bergetar c. bergerak d. berdawai');
  assert.equal(b.length, 2);
  assert.deepEqual(b[0]!.o, ['oksigen', 'karbon dioksida', 'air', 'klorofil']);
  assert.match(b[0]!.t, /^Daun kebanyakan berwarna hijau karena mengandung/);
  assert.deepEqual(b[1]!.o, ['bersinar', 'bergetar', 'bergerak', 'berdawai']);
});

test('mesin soal Matematika: tiap kelas & semester lolos format baku, kunci = hasil hitung', () => {
  for (const jj of ['mi', 'mts'] as const) for (const kelas of KURIKULUM[jj].kelas) for (const semester of ['ganjil', 'genap'] as const) for (const jenis of ['pts', 'pas'] as const) {
    const m = KURIKULUM[jj].mapel.find((x) => x.slug === 'matematika')!;
    const slot = { jenjang: jj, kelas, m, semester, jenis };
    const h = buatPaketMesin(slot);
    assert.ok(h, `${jj}${kelas} ${semester} ${jenis}`);
    const u = uraiSoal(kepalaMesin(slot, h.sumber) + h.teks);
    assert.ok(u.paket, u.galat.join('; '));
    assert.deepEqual(u.peringatan, []);
    assert.equal(u.paket.pg.length, FORMAT.pg);
    for (const p of u.paket.pg) {
      const m2 = /^([\d.]+) ([+–×:]) ([\d.]+) = \.\.\.\.$/.exec(p.t);
      if (!m2) continue;
      const a = Number(m2[1]!.replace(/\./g, '')), b = Number(m2[3]!.replace(/\./g, ''));
      const j = m2[2] === '+' ? a + b : m2[2] === '–' ? a - b : m2[2] === '×' ? a * b : a / b;
      assert.equal(Number(p.o[p.k]!.replace(/\./g, '')), j, p.t);
    }
  }
});
