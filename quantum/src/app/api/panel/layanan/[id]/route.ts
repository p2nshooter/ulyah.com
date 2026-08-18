import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { landingServices } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/guards';
import { landingServiceSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const parsed = await parseBody(req, landingServiceSchema);
  if ('error' in parsed) return parsed.error;

  const db = await getDb();
  const existing = await db
    .select({ id: landingServices.id })
    .from(landingServices)
    .where(eq(landingServices.id, id))
    .limit(1);
  if (existing.length === 0) return NextResponse.json({ error: 'Layanan tidak ditemukan.' }, { status: 404 });

  await db
    .update(landingServices)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(landingServices.id, id));
  await logAction(guard.user.id, 'landing_service.update', 'landing_service', id, { title: parsed.data.title });

  return NextResponse.json({ ok: true });
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const { id } = await params;

  const db = await getDb();
  const existing = await db
    .select({ id: landingServices.id })
    .from(landingServices)
    .where(eq(landingServices.id, id))
    .limit(1);
  if (existing.length === 0) return NextResponse.json({ error: 'Layanan tidak ditemukan.' }, { status: 404 });

  await db.delete(landingServices).where(eq(landingServices.id, id));
  await logAction(guard.user.id, 'landing_service.delete', 'landing_service', id);
  return NextResponse.json({ ok: true });
});
