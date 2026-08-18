import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { landingServices } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth/guards';
import { landingServiceSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { newId } from '@/lib/id';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  const db = await getDb();
  return NextResponse.json({
    services: await db.select().from(landingServices).orderBy(asc(landingServices.sortOrder))
  });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  const parsed = await parseBody(req, landingServiceSchema);
  if ('error' in parsed) return parsed.error;

  const db = await getDb();
  const id = newId('svc');
  await db.insert(landingServices).values({ id, ...parsed.data });
  await logAction(guard.user.id, 'landing_service.create', 'landing_service', id, { title: parsed.data.title });

  return NextResponse.json({ ok: true, id });
});
