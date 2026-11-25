import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kopDariProfil, kopDariDok } from '../src/data/dokumen.ts';
import { seedSitus } from '../src/seed.ts';
import { EMAIL_YAYASAN } from '../src/data/site.ts';
import type { Unit } from '../src/data/model.ts';

test('email yayasan salam@yapida.sch.id: kop yayasan, kop lembaga tanpa email, dan kop tersimpan tanpa email', () => {
  const s = seedSitus(Date.now());
  assert.equal(EMAIL_YAYASAN, 'salam@yapida.sch.id');
  assert.equal(s.kontak.email, EMAIL_YAYASAN, 'isi awal situs memuat email yayasan');
  const kopYayasan = kopDariProfil(null, s);
  assert.match(kopYayasan.kontak, /Email: salam@yapida\.sch\.id/);
  // lembaga dengan telepon sendiri tetapi tanpa email → email yayasan ikut tercantum
  const u = { nama: 'MI Al-Huda', jenis: 'Madrasah Ibtidaiyah', alamat: 'Sukakarya', kontak: { telepon: '021-123' } } as unknown as Unit;
  const kopLembaga = kopDariProfil(u, s);
  assert.match(kopLembaga.kontak, /Telp\. 021-123 · Email: salam@yapida\.sch\.id/);
  // lembaga dengan email sendiri → email lembaga yang dipakai
  const u2 = { ...u, kontak: { email: 'mi@yapida.sch.id' } } as unknown as Unit;
  assert.match(kopDariProfil(u2, s).kontak, /Email: mi@yapida\.sch\.id/);
  // kop tersimpan yang kontaknya belum ada email → email ditambahkan
  const simpan = kopDariDok({ judul: 'Yayasan Al-Huda Yapida', d: { kontak: 'Telp. 0812-0000' } } as never, kopYayasan);
  assert.equal(simpan.kontak, 'Telp. 0812-0000 · Email: salam@yapida.sch.id');
  const simpan2 = kopDariDok({ judul: 'Yayasan Al-Huda Yapida', d: { kontak: 'admin@contoh.id' } } as never, kopYayasan);
  assert.equal(simpan2.kontak, 'admin@contoh.id', 'kop yang sudah memuat email tidak diubah');
});
