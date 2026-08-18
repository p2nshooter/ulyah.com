import { guardPanelPage } from '@/lib/auth/panel-guard';
import { getInventorySummary, listStockChecks } from '@/lib/data/stock-checks';
import { StockCheckClient } from '@/components/panel/StockCheckClient';

export const dynamic = 'force-dynamic';

export default async function StockCheckPage() {
  const user = await guardPanelPage('/panel/opname');
  const [checks, summary] = await Promise.all([listStockChecks(), getInventorySummary()]);
  const canWrite = user.role === 'admin' || user.role === 'produksi' || user.role === 'keuangan';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Persediaan &amp; opname</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Hitung ulang isi gudang secara berkala. Barang yang rusak atau hilang dikeluarkan dari stok dan nilainya
          langsung masuk laba rugi, supaya nilai persediaan selalu cocok dengan barang yang benar-benar ada.
        </p>
      </div>

      <StockCheckClient initialChecks={checks} summary={summary} canWrite={canWrite} />
    </div>
  );
}
