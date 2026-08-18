import { REPORT_ROLES, type UserRole } from '@/lib/karoseri/constants';

/**
 * Siapa boleh membuka halaman panel yang mana.
 *
 * Satu tabel ini dipakai dua kali: menyusun menu di bilah sisi, dan menjaga
 * halamannya di server. Sebelumnya keduanya terpisah — menu menyembunyikan
 * "SPK" dan "Promo" dari pemilik, tapi halamannya tetap terbuka kalau
 * alamatnya diketik langsung, lengkap dengan formulir yang tidak akan pernah
 * boleh dia simpan. Menyatukannya membuat keduanya mustahil berbeda.
 *
 * `roles` kosong berarti semua peran boleh.
 */
export const PANEL_ACCESS: { path: string; roles?: UserRole[]; exact?: boolean }[] = [
  { path: '/panel', roles: ['admin', 'produksi', 'keuangan'], exact: true },
  { path: '/panel/laporan', roles: REPORT_ROLES },
  { path: '/panel/spk', roles: ['admin', 'produksi', 'keuangan'] },
  { path: '/panel/servis', roles: ['admin', 'produksi', 'keuangan'] },
  { path: '/panel/pelanggan', roles: ['admin', 'produksi', 'keuangan'] },
  { path: '/panel/model', roles: ['admin', 'produksi'] },
  { path: '/panel/barang', roles: ['admin', 'produksi', 'keuangan'] },
  { path: '/panel/keuangan', roles: ['admin', 'keuangan', 'bos'] },
  { path: '/panel/penawaran', roles: ['admin', 'produksi', 'keuangan'] },
  { path: '/panel/karyawan', roles: ['admin', 'keuangan', 'bos', 'produksi'] },
  { path: '/panel/penggajian', roles: ['admin', 'keuangan'] },
  { path: '/panel/promo', roles: ['admin', 'produksi', 'keuangan'] },
  { path: '/panel/pengguna', roles: ['admin'] },
  { path: '/panel/pengaturan', roles: ['admin'] },
  { path: '/panel/aktivitas', roles: ['admin'] },
  { path: '/panel/akun' }
];

export function canAccessPanelPath(path: string, role: UserRole): boolean {
  const entry = PANEL_ACCESS.find((e) =>
    e.exact ? e.path === path : path === e.path || path.startsWith(`${e.path}/`)
  );
  if (!entry) return true;
  return !entry.roles || entry.roles.includes(role);
}

/** Halaman pertama yang boleh dibuka peran ini — tujuan pantulan yang masuk akal. */
export function panelHomeFor(role: UserRole): string {
  const entry = PANEL_ACCESS.find((e) => !e.roles || e.roles.includes(role));
  return entry?.path ?? '/panel/akun';
}

