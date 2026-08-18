import { NextRequest, NextResponse } from 'next/server';
import { desc, eq, inArray, like, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { expenses, items, purchaseItems, purchases, stockMoves, suppliers } from '@/lib/db/schema';
import { requireRole } from '@/lib/auth/guards';
import { purchaseSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { parseDateInput } from '@/lib/format';
import { newId } from '@/lib/id';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const guard = await requireRole('keuangan', 'bos');
  if ('error' in guard) return guard.error;

  const db = await getDb();
  const rows = await db
    .select({
      id: purchases.id,
      purchaseNumber: purchases.purchaseNumber,
      invoiceNumber: purchases.invoiceNumber,
      supplierName: purchases.supplierName,
      supplierMaster: suppliers.name,
      totalIdr: purchases.totalIdr,
      paidIdr: purchases.paidIdr,
      purchasedAt: purchases.purchasedAt,
      dueDate: purchases.dueDate
    })
    .from(purchases)
    .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
    .orderBy(desc(purchases.purchasedAt))
    .limit(200);

  return NextResponse.json({ purchases: rows });
});

/** Nomor pembelian `PB/YYYYMM/NNN`, urut per bulan. */
async function generatePurchaseNumber(date: Date, offset = 0): Promise<string> {
  const db = await getDb();
  const period = `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  const prefix = `PB/${period}/`;
  const rows = await db
    .select({ purchaseNumber: purchases.purchaseNumber })
    .from(purchases)
    .where(like(purchases.purchaseNumber, `${prefix}%`))
    .orderBy(desc(purchases.purchaseNumber))
    .limit(1);
  const last = rows[0] ? Number(rows[0].purchaseNumber.slice(prefix.length)) : 0;
  return `${prefix}${String((Number.isFinite(last) ? last : 0) + 1 + offset).padStart(3, '0')}`;
}

type ManualLine = { name: string; qty: number; unitCostIdr: number };

/**
 * Baris nota yang tidak dikaitkan ke barang stok dicatat sebagai biaya
 * operasional, satu catatan per baris, dengan rujukan ke nota fisiknya.
 *
 * Sengaja belum ditandai lunas: pelunasannya lewat menu Biaya, sama seperti
 * tagihan lain, sehingga baris ini muncul di laporan utang selama belum dibayar.
 */
async function recordManualLines(
  db: Awaited<ReturnType<typeof getDb>>,
  lines: ManualLine[],
  ref: {
    reference: string;
    supplierName: string | null;
    invoiceNumber: string | null;
    spentAt: Date;
    dueDate: Date | null;
    actorUserId: string;
  }
): Promise<string[]> {
  const ids: string[] = [];
  for (const line of lines) {
    const expenseId = newId('exp');
    ids.push(expenseId);
    await db.insert(expenses).values({
      id: expenseId,
      category: 'bahan_produksi',
      description: `${line.name}${line.qty > 1 ? ` (${line.qty}x)` : ''} — ${ref.reference}`,
      amountIdr: line.qty * line.unitCostIdr,
      vendorName: ref.supplierName,
      spentAt: ref.spentAt,
      paidAt: null,
      dueDate: ref.dueDate,
      notes: ref.invoiceNumber ? `Nota supplier ${ref.invoiceNumber}` : 'Nota manual tanpa catat stok',
      createdBy: ref.actorUserId
    });
  }
  return ids;
}

export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireRole('keuangan');
  if ('error' in guard) return guard.error;

  const parsed = await parseBody(req, purchaseSchema);
  if ('error' in parsed) return parsed.error;
  const input = parsed.data;

  // Nota dipecah dua. Baris yang menunjuk barang master masuk persediaan;
  // baris tanpa barang master menjadi "nota manual" berupa catatan biaya.
  //
  // Sebelumnya keduanya dicatat sebagai satu pembelian, dan baris tanpa stok
  // menghilang begitu saja: nilainya jadi utang dan arus kas keluar, tapi tidak
  // pernah sampai ke laba rugi maupun ke gudang. Uang keluar tanpa jejak biaya.
  // Dengan dipisah, tiap baris hidup tepat di satu tempat dan tidak ada yang
  // terhitung dua kali.
  const stockLines = input.items.filter((item) => item.itemId);
  const manualLines = input.items.filter((item) => !item.itemId);

  const totalIdr = stockLines.reduce((sum, item) => sum + item.qty * item.unitCostIdr, 0);
  const manualTotalIdr = manualLines.reduce((sum, item) => sum + item.qty * item.unitCostIdr, 0);

  if (input.paidIdr > totalIdr) {
    return NextResponse.json(
      {
        error: manualLines.length
          ? 'Jumlah dibayar melebihi nilai barang berstok. Baris tanpa catat stok jadi nota manual dan dilunasi lewat menu Biaya.'
          : 'Jumlah dibayar melebihi total pembelian.'
      },
      { status: 400 }
    );
  }

  const db = await getDb();
  const purchasedAt = new Date(parseDateInput(input.purchasedAt)!);
  const dueMs = parseDateInput(input.dueDate);
  const dueDate = dueMs === null ? null : new Date(dueMs);
  const id = newId('pur');

  // Nota yang seluruh barisnya tanpa catat stok bukan pembelian persediaan —
  // isinya bahan habis pakai. Nota seperti ini tidak membuat baris pembelian
  // sama sekali: baris pembelian bernilai Rp 0 tanpa satu pun barang hanya
  // mengotori daftar dan membuat kasir mengira notanya gagal tersimpan.
  if (stockLines.length === 0) {
    const reference = input.invoiceNumber
      ? `nota ${input.invoiceNumber}`
      : `nota manual ${input.purchasedAt}`;
    const manualExpenseIds = await recordManualLines(db, manualLines, {
      reference,
      supplierName: input.supplierName,
      invoiceNumber: input.invoiceNumber,
      spentAt: purchasedAt,
      dueDate,
      actorUserId: guard.user.id
    });

    await logAction(guard.user.id, 'purchase.manual', 'expense', manualExpenseIds[0], {
      reference,
      manualNotes: manualLines.length,
      manualTotalIdr
    });

    return NextResponse.json({
      ok: true,
      id: null,
      purchaseNumber: null,
      totalIdr: 0,
      manualTotalIdr,
      manualCount: manualLines.length,
      manualExpenseIds
    });
  }

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const purchaseNumber = await generatePurchaseNumber(purchasedAt, attempt);
    try {
      await db.insert(purchases).values({
        id,
        purchaseNumber,
        supplierId: input.supplierId,
        supplierName: input.supplierName,
        invoiceNumber: input.invoiceNumber,
        totalIdr,
        paidIdr: input.paidIdr,
        purchasedAt,
        dueDate,
        notes: input.notes,
        createdBy: guard.user.id
      });

      await db.insert(purchaseItems).values(
        stockLines.map((item) => ({
          id: newId('pit'),
          purchaseId: id,
          itemId: item.itemId,
          name: item.name,
          qty: item.qty,
          unitCostIdr: item.unitCostIdr,
          subtotalIdr: item.qty * item.unitCostIdr
        }))
      );

      // Stok bertambah dan harga modal master ikut diperbarui ke harga beli
      // terakhir, supaya HPP transaksi berikutnya memakai angka yang benar.
      for (const item of stockLines) {
        if (!item.itemId) continue;
        await db
          .update(items)
          .set({
            stockQty: sql`${items.stockQty} + ${item.qty}`,
            costPriceIdr: item.unitCostIdr,
            updatedAt: new Date()
          })
          .where(eq(items.id, item.itemId));
        await db.insert(stockMoves).values({
          id: newId('stk'),
          itemId: item.itemId,
          type: 'masuk',
          qty: item.qty,
          unitCostIdr: item.unitCostIdr,
          refType: 'purchase',
          refId: id,
          notes: 'Pembelian dari supplier',
          movedAt: purchasedAt,
          createdBy: guard.user.id
        });
      }

      const manualExpenseIds = await recordManualLines(db, manualLines, {
        reference: `nota ${purchaseNumber}`,
        supplierName: input.supplierName,
        invoiceNumber: input.invoiceNumber,
        spentAt: purchasedAt,
        dueDate,
        actorUserId: guard.user.id
      });

      await logAction(guard.user.id, 'purchase.create', 'purchase', id, {
        purchaseNumber,
        totalIdr,
        manualNotes: manualLines.length,
        manualTotalIdr
      });
      return NextResponse.json({
        ok: true,
        id,
        purchaseNumber,
        totalIdr,
        manualTotalIdr,
        manualCount: manualLines.length,
        manualExpenseIds
      });
    } catch (err) {
      lastError = err;
      if (!/UNIQUE constraint failed/i.test(err instanceof Error ? err.message : String(err))) throw err;
    }
  }

  throw new Error(
    `Gagal membuat nomor pembelian: ${lastError instanceof Error ? lastError.message : String(lastError)}`
  );
});
