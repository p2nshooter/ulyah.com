import { guardPanelPage } from '@/lib/auth/panel-guard';
import { getSiteContent } from '@/lib/site-content';
import { SiteContentClient } from '@/components/panel/SiteContentClient';

export const dynamic = 'force-dynamic';

export default async function SiteContentPage() {
  await guardPanelPage('/panel/tampilan');

  const content = await getSiteContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tampilan Halaman Depan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Judul, kalimat pengantar, dan kontak yang dilihat pengunjung situs.
        </p>
      </div>

      <SiteContentClient initialContent={content} />
    </div>
  );
}
