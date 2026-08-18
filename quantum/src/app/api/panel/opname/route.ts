import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/guards';
import { stockCheckCreateSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { createStockCheck, listStockChecks } from '@/lib/data/stock-checks';
import { parseDateInput } from '@/lib/format';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const guard = await requireRole('produksi', 'keuangan', 'bos');
  if ('error' in guard) return guard.error;
  return NextResponse.json({ checks: await listStockChecks() });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireRole('produksi', 'keuangan');
  if ('error' in guard) return guard.error;

  const parsed = await parseBody(req, stockCheckCreateSchema);
  if ('error' in parsed) return parsed.error;

  const ms = parseDateInput(parsed.data.checkedAt);
  if (ms === null) return NextResponse.json({ error: 'Tanggal pemeriksaan tidak valid.' }, { status: 400 });

  const created = await createStockCheck(
    {
      period: parsed.data.period,
      checkedAt: new Date(ms),
      checkedBy: parsed.data.checkedBy,
      notes: parsed.data.notes
    },
    guard.user.id
  );

  if (created.itemCount === 0) {
    return NextResponse.json(
      { error: 'Belum ada barang aktif untuk diperiksa. Daftarkan barang dulu di menu Barang & Jasa.' },
      { status: 400 }
    );
  }

  await logAction(guard.user.id, 'stock_check.create', 'stock_check', created.id, {
    checkNumber: created.checkNumber,
    itemCount: created.itemCount
  });
  return NextResponse.json({ ok: true, ...created });
});
