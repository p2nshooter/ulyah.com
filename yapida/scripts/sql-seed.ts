/**
 * Membaca baris dari berkas seed SQL ulyah.com (packages/db-schema/seed/*.sql) TANPA basis data: hanya mengurai teks
 * `INSERT [OR IGNORE] INTO <tabel> (kolom…) VALUES (…),(…);` dan `INSERT INTO <tabel> (kolom…) SELECT …;`.
 * Nilai yang dikenali: teks '…' (dengan '' sebagai kutip), angka, NULL; ekspresi lain (subkueri, fungsi) menjadi null.
 * Dipakai scripts/buat-pustaka.ts untuk menyalin kisah dan hadits milik ulyah.com ke perpustakaan Yapida (bukan D1).
 */
export type Baris = Record<string, string | null>;

function lewatiSpasi(s: string, i: number): number {
  while (i < s.length && /\s/.test(s[i]!)) i += 1;
  return i;
}

/** Satu ekspresi nilai mulai s[i]; berhenti di koma atau kurung tutup/titik koma tingkat atas. */
function ekspresi(s: string, i: number): [string | null, number] {
  i = lewatiSpasi(s, i);
  if (s[i] === "'") {
    let j = i + 1;
    let buf = '';
    for (;;) {
      if (j >= s.length) throw new Error('teks tidak tertutup');
      if (s[j] === "'" && s[j + 1] === "'") { buf += "'"; j += 2; continue; }
      if (s[j] === "'") break;
      buf += s[j]; j += 1;
    }
    i = j + 1;
    // Sambungan 'a' || 'b'
    const k = lewatiSpasi(s, i);
    if (s.startsWith('||', k)) { const [lanjut, akhir] = ekspresi(s, k + 2); return [buf + (lanjut ?? ''), akhir]; }
    return [buf, i];
  }
  // Ekspresi lain: baca sampai koma/kurung tutup tingkat atas.
  let kedalaman = 0;
  let j = i;
  let q = false;
  for (; j < s.length; j += 1) {
    const c = s[j]!;
    if (c === "'") { if (q && s[j + 1] === "'") { j += 1; continue; } q = !q; continue; }
    if (q) continue;
    if (c === '(') kedalaman += 1;
    else if (c === ')') { if (kedalaman === 0) break; kedalaman -= 1; }
    else if ((c === ',' || c === ';') && kedalaman === 0) break;
  }
  const tok = s.slice(i, j).trim();
  return [/^-?\d+(\.\d+)?$/.test(tok) ? tok : null, j];
}

export function barisInsert(sql: string, tabel: string): Baris[] {
  const out: Baris[] = [];
  const re = new RegExp(`INSERT\\s+(?:OR\\s+\\w+\\s+)?INTO\\s+${tabel}\\s*\\(([^)]*)\\)\\s*(VALUES|SELECT)`, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const kolom = m[1]!.split(',').map((c) => c.trim());
    let i = m.index + m[0].length;
    if (m[2]!.toUpperCase() === 'SELECT') {
      const nilai: (string | null)[] = [];
      for (;;) {
        const [v, j] = ekspresi(sql, i);
        nilai.push(v);
        i = lewatiSpasi(sql, j);
        if (sql[i] === ',') { i += 1; continue; }
        break;
      }
      out.push(Object.fromEntries(kolom.map((k, n) => [k, nilai[n] ?? null])));
      re.lastIndex = i;
      continue;
    }
    for (;;) {
      i = lewatiSpasi(sql, i);
      if (sql[i] !== '(') break;
      i += 1;
      const nilai: (string | null)[] = [];
      for (;;) {
        const [v, j] = ekspresi(sql, i);
        nilai.push(v);
        i = lewatiSpasi(sql, j);
        if (sql[i] === ',') { i += 1; continue; }
        if (sql[i] === ')') { i += 1; break; }
        throw new Error(`format VALUES tak dikenal di ${tabel}`);
      }
      out.push(Object.fromEntries(kolom.map((k, n) => [k, nilai[n] ?? null])));
      i = lewatiSpasi(sql, i);
      if (sql[i] === ',') { i += 1; continue; }
      break;
    }
    re.lastIndex = i;
  }
  return out;
}
