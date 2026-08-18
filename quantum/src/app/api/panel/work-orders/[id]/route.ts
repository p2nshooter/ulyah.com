import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { expenses, payments, workOrders } from '@/lib/db/schema';
import { requireAdmin, requireRole } from '@/lib/auth/guards';
import { workOrderUpdateSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { getWorkOrderDetail } from '@/lib/data/work-orders';
import { parseDateInput } from '@/lib/format';
import { logAction } from '@/lib/audit';

export const GET = withErrorHandling(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('produksi', 'keuangan');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const detail = await getWorkOrderDetail(id);
  if (!detail) return NextResponse.json({ error: 'SPK tidak ditemukan.' }, { status: 404 });
  return NextResponse.json(detail);
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireRole('produksi');
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const parsed = await parseBody(req, workOrderUpdateSchema);
  if ('error' in parsed) return parsed.error;
  const { startDate, targetDate, deliveredAt, ...rest } = parsed.data;

  const updates: Record<string, unknown> = { ...rest, updatedAt: new Date() };
  // Field tanggal hanya ikut di-update kalau memang dikirim — `undefined` berarti
  // "jangan diubah", sedangkan `null` berarti "kosongkan".
  if (startDate !== undefined) updates.startDate = toDate(startDate);
  if (targetDate !== undefined) updates.targetDate = toDate(targetDate);
  if (deliveredAt !== undefined) updates.deliveredAt = toDate(deliveredAt);

  const db = await getDb();

  // Menandai SPK selesai/diserahkan secara manual juga harus mengunci tanggal
  // pengakuan pendapatannya — kalau tidak, SPK yang dilompatkan langsung ke
  // "diserahkan" tanpa melewati tahapan tidak akan pernah muncul di laba rugi.
  if (rest.status && (rest.status === 'selesai' || rest.status === 'diserahkan')) {
    const current = (await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1))[0];
    if (current && !current.completedAt) updates.completedAt = new Date();
  }

  await db.update(workOrders).set(updates).where(eq(workOrders.id, id));
  await logAction(guard.user.id, 'work_order.update', 'work_order', id, rest);

  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const db = await getDb();
  const target = (await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1))[0];
  if (!target) return NextResponse.json({ error: 'SPK tidak ditemukan.' }, { status: 404 });

  // Pembayaran TIDAK ikut cascade: tabelnya polimorfik (ref_type + ref_id) dan
  // sengaja tanpa foreign key, jadi harus dihapus sendiri. Sebelum ini
  // pembayaran SPK yang dihapus tetap tertinggal dan masih terhitung sebagai
  // uang masuk di arus kas maupun buku kas.
  await db.delete(payments).where(and(eq(payments.refType, 'work_order'), eq(payments.refId, id)));

  // Biaya yang terkait dilepas kaitannya, bukan dihapus: uangnya memang benar
  // keluar, jadi menghapusnya akan memalsukan laba rugi. Tanpa langkah ini
  // penghapusan malah gagal total — foreign key-nya ON DELETE no action.
  await db.update(expenses).set({ workOrderId: null }).where(eq(expenses.workOrderId, id));

  // Tahapan ikut terhapus lewat ON DELETE cascade miliknya sendiri.
  await db.delete(workOrders).where(eq(workOrders.id, id));
  await logAction(guard.user.id, 'work_order.delete', 'work_order', id, {
    spkNumber: target.spkNumber,
    contractValueIdr: target.contractValueIdr
  });

  return NextResponse.json({ ok: true });
});

function toDate(value: string | null): Date | null {
  const ms = parseDateInput(value);
  return ms === null ? null : new Date(ms);
}
