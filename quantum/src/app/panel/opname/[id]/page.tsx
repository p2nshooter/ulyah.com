import { notFound } from 'next/navigation';
import { guardPanelPage } from '@/lib/auth/panel-guard';
import { getStockCheckDetail } from '@/lib/data/stock-checks';
import { StockCheckSheet, type SheetData } from '@/components/panel/StockCheckSheet';

export const dynamic = 'force-dynamic';

export default async function StockCheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await guardPanelPage('/panel/opname');
  const { id } = await params;
  const detail = await getStockCheckDetail(id);
  if (!detail) notFound();

  // Bentuk data diratakan di sini supaya komponennya tidak perlu tahu bentuk join.
  const data = {
    check: detail.check,
    lines: detail.lines.map(({ line, itemCode, itemName, itemUnit }) => ({
      ...line,
      itemCode,
      itemName,
      itemUnit
    }))
  } as unknown as SheetData;

  const canWrite = user.role === 'admin' || user.role === 'produksi' || user.role === 'keuangan';
  // Menutup sesi mengubah stok sekaligus membukukan kerugian, jadi dibatasi
  // ke peran yang memang memegang pembukuan.
  const canApply = user.role === 'admin' || user.role === 'keuangan';

  return <StockCheckSheet data={data} canWrite={canWrite} canApply={canApply} />;
}
