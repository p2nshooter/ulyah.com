import { asc } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { landingServices } from '@/lib/db/schema';
import { guardPanelPage } from '@/lib/auth/panel-guard';
import { LandingServicesClient } from '@/components/panel/LandingServicesClient';

export const dynamic = 'force-dynamic';

export default async function LandingServicesPage() {
  await guardPanelPage('/panel/layanan');

  const db = await getDb();
  const services = await db.select().from(landingServices).orderBy(asc(landingServices.sortOrder));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Layanan Halaman Depan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kartu layanan beserta harganya yang tampil di bagian &ldquo;Layanan kami&rdquo;. Perubahan langsung terlihat
          pengunjung tanpa perlu memasang ulang situs.
        </p>
      </div>

      <LandingServicesClient initialServices={services} />
    </div>
  );
}
