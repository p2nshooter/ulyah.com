import { and, asc, desc, eq, like, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { expenses, items, stockCheckItems, stockChecks, stockMoves } from '@/lib/db/schema';
import { newId } from '@/lib/id';
import type { StockCheckPeriod } from '@/lib/karoseri/constants';

/** Nomor opname `OPN/YYYYMM/NNN`, urut per bulan. */
export async function generateCheckNumber(offset = 0): Promise<string> {
  const db = await getDb();
  const now = new Date();
  const period = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const prefix = `OPN/${period}/`;
  const rows = await db
    .select({ checkNumber: stockChecks.checkNumber })
    .from(stockChecks)
    .where(like(stockChecks.checkNumber, `${prefix}%`))
    .orderBy(desc(stockChecks.checkNumber))
    .limit(1);
  const last = rows[0] ? Number(rows[0].checkNumber.slice(prefix.length)) : 0;
  return `${prefix}${String((Number.isFinite(last) ? last : 0) + 1 + offset).padStart(3, '0')}`;
}

/**
 * Buka sesi opname baru berisi seluruh barang aktif.
 *
 * Stok sistem dibekukan ke tiap baris saat sesi dibuka. Kalau dibaca ulang
 * nanti saat sesi ditutup, penjualan yang terjadi di tengah pemeriksaan akan
 * terhitung sebagai barang hilang.
 */
export async function createStockCheck(
  input: { period: StockCheckPeriod; checkedAt: Date; checkedBy: string | null; notes: string | null },
  actorUserId: string
): Promise<{ id: string; checkNumber: string; itemCount: number }> {
  const db = await getDb();
  const stocked = await db
    .select()
    .from(items)
    .where(and(eq(items.active, true), eq(items.kind, 'barang')))
    .orderBy(asc(items.name));

  const id = newId('opn');
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const checkNumber = await generateCheckNumber(attempt);
    try {
      await db.insert(stockChecks).values({
        id,
        checkNumber,
        period: input.period,
        status: 'draft',
        checkedAt: input.checkedAt,
        itemCount: stocked.length,
        checkedBy: input.checkedBy,
        notes: input.notes,
        createdBy: actorUserId
      });

      if (stocked.length > 0) {
        await db.insert(stockCheckItems).values(
          stocked.map((item) => ({
            id: newId('opi'),
            stockCheckId: id,
            itemId: item.id,
            systemQty: item.stockQty,
            // Prasangka awal: semuanya ada. Petugas tinggal mengoreksi yang
            // tidak cocok, bukan mengetik ulang seluruh gudang.
            physicalQty: item.stockQty,
            damagedQty: 0,
            lostQty: 0,
            unitCostIdr: item.costPriceIdr,
            checked: false
          }))
        );
      }
      return { id, checkNumber, itemCount: stocked.length };
    } catch (err) {
      lastError = err;
      if (!/UNIQUE constraint failed/i.test(err instanceof Error ? err.message : String(err))) throw err;
    }
  }
  throw new Error(
    `Gagal membuat nomor opname unik: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
}

export async function getStockCheckDetail(id: string) {
  const db = await getDb();
  const rows = await db.select().from(stockChecks).where(eq(stockChecks.id, id)).limit(1);
  const check = rows[0];
  if (!check) return null;

  const lines = await db
    .select({
      line: stockCheckItems,
      itemCode: items.code,
      itemName: items.name,
      itemUnit: items.unit
    })
    .from(stockCheckItems)
    .innerJoin(items, eq(stockCheckItems.itemId, items.id))
    .where(eq(stockCheckItems.stockCheckId, id))
    .orderBy(asc(items.name));

  return { check, lines };
}

export async function listStockChecks(limit = 60) {
  const db = await getDb();
  return db.select().from(stockChecks).orderBy(desc(stockChecks.checkedAt)).limit(limit);
}

/** Selisih satu baris: stok sistem dikurangi seluruh yang benar-benar ditemukan. */
export function lineDifference(line: { systemQty: number; physicalQty: number; damagedQty: number; lostQty: number }) {
  return line.systemQty - (line.physicalQty + line.damagedQty + line.lostQty);
}

/**
 * Tutup sesi: stok disesuaikan ke hasil hitung fisik, barang rusak dan hilang
 * ditulis ke kartu stok dengan jenisnya sendiri, lalu nilainya dibukukan
 * sebagai biaya kerugian persediaan.
 *
 * Kerugiannya memang harus masuk laba rugi: harga beli barang tadinya menjadi
 * persediaan (harta), dan barang yang rusak atau hilang tidak akan pernah
 * terjual — kalau tidak dihapusbukukan, laba terlihat lebih besar dari
 * kenyataan dan nilai persediaan tidak pernah cocok dengan isi gudang.
 */
export async function applyStockCheck(id: string, actorUserId: string): Promise<{
  applied: number;
  damagedQty: number;
  lostQty: number;
  lossValueIdr: number;
}> {
  const db = await getDb();
  const detail = await getStockCheckDetail(id);
  if (!detail) throw new Error('Sesi opname tidak ditemukan.');

  const now = new Date();
  let applied = 0;
  let damagedQty = 0;
  let lostQty = 0;
  let lossValueIdr = 0;

  for (const { line } of detail.lines) {
    const goodQty = line.physicalQty;
    const broken = line.damagedQty;
    const missing = line.lostQty;

    damagedQty += broken;
    lostQty += missing;

    // Nilai kerugian dibatasi sebanyak barang yang memang tercatat ada.
    // Barang yang ditemukan rusak padahal stok sistemnya sudah nol berarti
    // biayanya sudah pernah masuk pembukuan (terpakai di order servis, misalnya)
    // — menghapusbukukannya lagi berarti menghitung kerugian yang sama dua kali.
    // Jumlah rusak/hilang tetap dicatat apa adanya di kartu stok.
    const writeOffQty = Math.min(broken + missing, Math.max(0, line.systemQty));
    lossValueIdr += writeOffQty * line.unitCostIdr;

    // Stok akhir hanya yang layak pakai. Rusak dan hilang keluar dari gudang.
    if (goodQty !== line.systemQty || broken > 0 || missing > 0) applied += 1;

    await db.update(items).set({ stockQty: goodQty, updatedAt: now }).where(eq(items.id, line.itemId));

    const selisih = line.systemQty - (goodQty + broken + missing);
    if (selisih !== 0) {
      await db.insert(stockMoves).values({
        id: newId('stk'),
        itemId: line.itemId,
        type: 'penyesuaian',
        qty: Math.abs(selisih),
        unitCostIdr: line.unitCostIdr,
        refType: 'stock_check',
        refId: id,
        notes: `Selisih opname ${detail.check.checkNumber}`,
        movedAt: now,
        createdBy: actorUserId
      });
    }
    for (const [qty, type] of [[broken, 'rusak'], [missing, 'hilang']] as const) {
      if (qty <= 0) continue;
      await db.insert(stockMoves).values({
        id: newId('stk'),
        itemId: line.itemId,
        type,
        qty,
        unitCostIdr: line.unitCostIdr,
        refType: 'stock_check',
        refId: id,
        notes: `Opname ${detail.check.checkNumber}`,
        movedAt: now,
        createdBy: actorUserId
      });
    }
  }

  // Satu biaya untuk seluruh kerugian sesi ini, bukan satu per barang: yang
  // dibaca pemilik di laporan adalah nilai kerugian per pemeriksaan.
  let expenseId: string | null = null;
  if (lossValueIdr > 0) {
    expenseId = newId('exp');
    await db.insert(expenses).values({
      id: expenseId,
      category: 'kerugian_stok',
      description: `Kerugian persediaan opname ${detail.check.checkNumber} (${damagedQty} rusak, ${lostQty} hilang)`,
      amountIdr: lossValueIdr,
      spentAt: now,
      paidAt: now,
      notes: 'Dibuat otomatis saat sesi opname ditutup.',
      createdBy: actorUserId
    });
  }

  await db
    .update(stockChecks)
    .set({
      status: 'selesai',
      appliedAt: now,
      diffCount: applied,
      damagedQty,
      lostQty,
      lossValueIdr,
      expenseId,
      updatedAt: now
    })
    .where(eq(stockChecks.id, id));

  return { applied, damagedQty, lostQty, lossValueIdr };
}

/** Ringkasan persediaan untuk kartu di halaman opname. */
export async function getInventorySummary() {
  const db = await getDb();
  const rows = await db
    .select({
      totalItems: sql<number>`count(*)`,
      totalQty: sql<number>`coalesce(sum(${items.stockQty}), 0)`,
      totalValue: sql<number>`coalesce(sum(${items.stockQty} * ${items.costPriceIdr}), 0)`,
      lowStock: sql<number>`sum(case when ${items.stockQty} <= ${items.minStockQty} then 1 else 0 end)`,
      outOfStock: sql<number>`sum(case when ${items.stockQty} <= 0 then 1 else 0 end)`
    })
    .from(items)
    .where(and(eq(items.active, true), eq(items.kind, 'barang')));
  return rows[0] ?? { totalItems: 0, totalQty: 0, totalValue: 0, lowStock: 0, outOfStock: 0 };
}
