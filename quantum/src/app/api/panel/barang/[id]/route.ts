import { NextRequest, NextResponse } from 'next/server';
import { and, eq, ne } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { items, purchaseItems, serviceOrderItems, stockCheckItems, stockMoves } from '@/lib/db/schema';
import { requireRole } from '@/lib/auth/guards';
import { itemSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('produksi', 'keuangan');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const parsed = await parseBody(req, itemSchema);
  if ('error' in parsed) return parsed.error;

  const db = await getDb();
  const current = (await db.select().from(items).where(eq(items.id, id)).limit(1))[0];
  if (!current) return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });

  const duplicate = await db
    .select({ id: items.id })
    .from(items)
    .where(and(eq(items.code, parsed.data.code), ne(items.id, id)))
    .limit(1);
  if (duplicate.length > 0) {
    return NextResponse.json({ error: `Kode ${parsed.data.code} sudah dipakai barang lain.` }, { status: 409 });
  }

  await db.update(items).set({ ...parsed.data, updatedAt: new Date() }).where(eq(items.id, id));
  await logAction(guard.user.id, 'item.update', 'item', id, { code: parsed.data.code });
  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('produksi', 'keuangan');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const db = await getDb();
  const current = (await db.select().from(items).where(eq(items.id, id)).limit(1))[0];
  if (!current) return NextResponse.json({ error: 'Barang tidak ditemukan.' }, { status: 404 });

  // Barang yang sudah punya riwayat tidak pernah dihapus, hanya dinonaktifkan.
  //
  // Sebelumnya hanya order servis yang diperiksa, dan itu meninggalkan dua
  // lubang. Barang yang tercantum di nota pembelian membuat penghapusan gagal
  // dengan galat kunci asing — kasir hanya melihat "kesalahan di server" tanpa
  // tahu sebabnya. Sementara barang yang punya kartu stok atau pernah masuk
  // sesi opname justru terhapus mulus, dan menyeret baris-baris riwayatnya ikut
  // hilang: sesi opname yang sudah ditutup kehilangan rinciannya sementara
  // ringkasan kerugiannya tetap tertulis, sehingga angka itu tidak lagi bisa
  // dijelaskan oleh isinya sendiri.
  const [usedInService, usedInPurchase, usedInStockCheck, hasStockCard] = await Promise.all([
    db.select({ id: serviceOrderItems.id }).from(serviceOrderItems).where(eq(serviceOrderItems.itemId, id)).limit(1),
    db.select({ id: purchaseItems.id }).from(purchaseItems).where(eq(purchaseItems.itemId, id)).limit(1),
    db.select({ id: stockCheckItems.id }).from(stockCheckItems).where(eq(stockCheckItems.itemId, id)).limit(1),
    db.select({ id: stockMoves.id }).from(stockMoves).where(eq(stockMoves.itemId, id)).limit(1)
  ]);

  const reasons: string[] = [];
  if (usedInService.length > 0) reasons.push('dipakai di order servis');
  if (usedInPurchase.length > 0) reasons.push('tercantum di nota pembelian');
  if (usedInStockCheck.length > 0) reasons.push('masuk sesi opname');
  if (hasStockCard.length > 0) reasons.push('punya riwayat kartu stok');

  if (reasons.length > 0) {
    await db.update(items).set({ active: false, updatedAt: new Date() }).where(eq(items.id, id));
    await logAction(guard.user.id, 'item.deactivate', 'item', id, { code: current.code, reasons });
    return NextResponse.json({
      ok: true,
      deactivated: true,
      message: `${current.name} sudah ${reasons.join(', ')}, jadi hanya dinonaktifkan — riwayatnya tetap utuh.`
    });
  }

  await db.delete(items).where(eq(items.id, id));
  await logAction(guard.user.id, 'item.delete', 'item', id, { code: current.code });
  return NextResponse.json({ ok: true });
});
