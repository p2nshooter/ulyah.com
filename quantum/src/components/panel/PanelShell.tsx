'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { SessionUser } from '@/lib/auth/session';
import { USER_ROLE_LABEL, type UserRole } from '@/lib/karoseri/constants';
import { PANEL_ACCESS } from '@/lib/karoseri/panel-access';
import { LogoMark } from '@/components/ui/Logo';

type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Peran yang boleh melihat menu ini. Kosong berarti semua peran. */
  roles?: UserRole[];
  exact?: boolean;
};

/** Label & ikon menu. Izin perannya diambil dari PANEL_ACCESS, bukan ditulis
 *  ulang di sini — dulu keduanya terpisah dan sempat berbeda: menu sudah
 *  menyembunyikan SPK dari pemilik sementara halamannya masih terbuka. */
const MENU: Record<string, { label: string; icon: string }> = {
  '/panel': { label: 'Dashboard', icon: '📊' },
  '/panel/laporan': { label: 'Laporan Keuangan', icon: '📈' },
  '/panel/spk': { label: 'SPK & Unit', icon: '🚌' },
  '/panel/servis': { label: 'Order Servis', icon: '🔧' },
  '/panel/pelanggan': { label: 'Pelanggan', icon: '🤝' },
  '/panel/model': { label: 'Model Bodi', icon: '📐' },
  '/panel/barang': { label: 'Barang & Jasa', icon: '🧰' },
  '/panel/keuangan': { label: 'Kas & Pembelian', icon: '💳' },
  '/panel/penawaran': { label: 'Permintaan Penawaran', icon: '📨' },
  '/panel/karyawan': { label: 'Karyawan', icon: '🧑‍🔧' },
  '/panel/penggajian': { label: 'Penggajian', icon: '💰' },
  '/panel/promo': { label: 'Promo & Event', icon: '📣' },
  '/panel/pengguna': { label: 'Pengguna', icon: '👥' },
  '/panel/pengaturan': { label: 'Pengaturan', icon: '🛠️' },
  '/panel/aktivitas': { label: 'Log Aktivitas', icon: '🧾' },
  '/panel/akun': { label: 'Akun Saya', icon: '⚙️' }
};

const NAV: NavItem[] = PANEL_ACCESS.filter((entry) => MENU[entry.path]).map((entry) => ({
  href: entry.path,
  label: MENU[entry.path].label,
  icon: MENU[entry.path].icon,
  roles: entry.roles,
  exact: entry.exact
}));

export function PanelShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Pemilik hanya melihat menu laporan dan akunnya sendiri — menu operasional
  // tidak ditampilkan sama sekali, bukan sekadar diblokir saat diklik.
  const items = NAV.filter((item) => !item.roles || item.roles.includes(user.role));

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <aside className="no-print hidden w-64 shrink-0 flex-col bg-slate-900 p-4 text-slate-200 md:flex">
        <Link href="/panel" className="mb-6 flex items-center gap-2.5 px-2">
          <LogoMark />
          <span className="leading-tight">
            <span className="block text-sm font-black text-white">QUANTUM</span>
            <span className="block text-[10px] uppercase tracking-widest text-gold-400">Panel Produksi</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive(item) ? 'bg-quantum-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-800 pt-4">
          <p className="px-2 text-sm font-semibold text-white">{user.name}</p>
          <p className="px-2 text-xs text-slate-400">{USER_ROLE_LABEL[user.role]}</p>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-950/30"
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="no-print flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <Link href="/" className="ml-auto text-sm text-slate-500 hover:text-quantum-600">
            Lihat situs publik ↗
          </Link>
        </header>

        {mobileOpen && (
          <nav className="no-print grid grid-cols-2 gap-1 border-b border-slate-200 bg-white p-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-500">
              🚪 Keluar
            </button>
          </nav>
        )}

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
