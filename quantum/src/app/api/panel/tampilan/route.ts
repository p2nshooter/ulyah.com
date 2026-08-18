import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/guards';
import { siteContentSchema } from '@/lib/validation';
import { parseBody, withErrorHandling } from '@/lib/api-handler';
import { getSiteContent, saveSiteContent } from '@/lib/site-content';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  return NextResponse.json({ content: await getSiteContent() });
});

/** Teks halaman depan adalah wajah perusahaan ke publik, jadi admin saja. */
export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;

  const parsed = await parseBody(req, siteContentSchema);
  if ('error' in parsed) return parsed.error;

  await saveSiteContent(parsed.data, guard.user.id);
  await logAction(guard.user.id, 'site_content.update', 'settings', undefined, parsed.data);

  return NextResponse.json({ ok: true, content: await getSiteContent() });
});
