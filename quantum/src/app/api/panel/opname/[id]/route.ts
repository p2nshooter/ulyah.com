import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { stockCheckItems, stockChecks } from '@/lib/db/schema';
import { requireRole } from '@/lib/auth/guards';
import { stockCheckUpdateSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { applyStockCheck, getStockCheckDetail } from '@/lib/data/stock-checks';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('produksi', 'keuangan', 'bos');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const detail = await getStockCheckDetail(id);
  if (!detail) return NextResponse.json({ error: 'Sesi opname tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ detail });
});

/** Simpan hasil hitungan. Sesi yang sudah ditutup tidak bisa diubah lagi. */
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('produksi', 'keuangan');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const parsed = await parseBody(req, stockCheckUpdateSchema);
  if ('error' in parsed) return parsed.error;

  const db = await getDb();
  const current = (await db.select().from(stockChecks).where(eq(stockChecks.id, id)).limit(1))[0];
  if (!current) return NextResponse.json({ error: 'Sesi opname tidak ditemukan.' }, { status: 404 });
  if (current.status === 'selesai') {
    return NextResponse.json(
      { error: 'Sesi ini sudah ditutup dan stoknya sudah disesuaikan, jadi tidak bisa diubah lagi.' },
      { status: 409 }
    );
  }

  const patch: Partial<typeof stockChecks.$inferInsert> = { updatedAt: new Date() };
  if (parsed.data.checkedBy !== undefined) patch.checkedBy = parsed.data.checkedBy;
  if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;
  await db.update(stockChecks).set(patch).where(eq(stockChecks.id, id));

  for (const line of parsed.data.lines ?? []) {
    await db
      .update(stockCheckItems)
      .set({
        physicalQty: line.physicalQty,
        damagedQty: line.damagedQty,
        lostQty: line.lostQty,
        checked: line.checked,
        notes: line.notes
      })
      .where(eq(stockCheckItems.id, line.id));
  }

  const detail = await getStockCheckDetail(id);
  return NextResponse.json({ ok: true, detail });
});

/** Tutup sesi: stok disesuaikan dan kerugiannya dibukukan. */
export const POST = withErrorHandling(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('keuangan');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const db = await getDb();
  const current = (await db.select().from(stockChecks).where(eq(stockChecks.id, id)).limit(1))[0];
  if (!current) return NextResponse.json({ error: 'Sesi opname tidak ditemukan.' }, { status: 404 });
  if (current.status === 'selesai') {
    return NextResponse.json({ error: 'Sesi ini sudah ditutup sebelumnya.' }, { status: 409 });
  }

  const result = await applyStockCheck(id, guard.user.id);
  await logAction(guard.user.id, 'stock_check.apply', 'stock_check', id, {
    checkNumber: current.checkNumber,
    ...result
  });

  const detail = await getStockCheckDetail(id);
  return NextResponse.json({ ok: true, ...result, detail });
});

/** Batalkan sesi yang belum ditutup. Yang sudah diterapkan harus tetap ada. */
export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('keuangan');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const db = await getDb();
  const current = (await db.select().from(stockChecks).where(eq(stockChecks.id, id)).limit(1))[0];
  if (!current) return NextResponse.json({ error: 'Sesi opname tidak ditemukan.' }, { status: 404 });
  if (current.status === 'selesai') {
    return NextResponse.json(
      { error: 'Sesi yang sudah diterapkan tidak bisa dihapus — riwayat penyesuaian stok harus tetap utuh.' },
      { status: 409 }
    );
  }

  await db.delete(stockChecks).where(eq(stockChecks.id, id));
  await logAction(guard.user.id, 'stock_check.delete', 'stock_check', id, { checkNumber: current.checkNumber });
  return NextResponse.json({ ok: true });
});
