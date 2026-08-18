import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { canAccessPanelPath, panelHomeFor } from '@/lib/karoseri/panel-access';

/**
 * Dipanggil di awal halaman panel. Peran yang tidak berhak dipantulkan ke
 * halaman pertama yang memang boleh dia buka, bukan dibiarkan melihat formulir
 * yang simpanannya pasti ditolak.
 *
 * Dipisah dari tabelnya karena `getCurrentUser` memakai `next/headers`: kalau
 * disatukan, PanelShell yang komponen klien ikut menarik kode server ini dan
 * build-nya gagal.
 */
export async function guardPanelPage(path: string) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!canAccessPanelPath(path, user.role)) redirect(panelHomeFor(user.role));
  return user;
}
