import Link from 'next/link';
import { COMPANY } from '@/lib/company';
import { getSiteContent } from '@/lib/site-content';
import { LogoWordmark } from '@/components/ui/Logo';
import { KnockGate } from '@/components/ui/KnockGate';
import { HeaderLogo } from '@/components/site/HeaderLogo';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <HeaderLogo />

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
          <Link href="/#layanan" className="hover:text-quantum-600">
            Layanan
          </Link>
          <Link href="/#katalog" className="hover:text-quantum-600">
            Katalog
          </Link>
          <Link href="/#harga" className="hover:text-quantum-600">
            Daftar Harga
          </Link>
          <Link href="/#proses" className="hover:text-quantum-600">
            Proses
          </Link>
          <Link href="/lacak" className="hover:text-quantum-600">
            Lacak Progres
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/lacak" className="btn-secondary md:hidden">
            Lacak
          </Link>
          <Link href="/#penawaran" className="btn-primary hidden sm:inline-flex">
            Minta Penawaran
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * Kaki halaman membaca kontaknya sendiri dari basis data, bukan menerimanya
 * lewat prop. Kalau lewat prop, setiap halaman publik baru wajib ingat
 * mengoperkannya — dan yang lupa akan menampilkan nomor telepon lama.
 */
export async function SiteFooter() {
  const content = await getSiteContent();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          {/* Ketuk lambang 5x untuk membuka halaman masuk staf. Logo di header
              sengaja tidak dipakai — di sana lambang itu tautan ke beranda,
              dan mengubahnya akan merusak kebiasaan pengunjung biasa. */}
          <KnockGate taps={5} href="/login" label={COMPANY.legalName}>
            <LogoWordmark />
          </KnockGate>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{COMPANY.legalName}</p>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{COMPANY.description}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Kontak</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>{content.contactPhone}</li>
            {content.contactEmail && <li>{content.contactEmail}</li>}
            {content.workingHours && <li>{content.workingHours}</li>}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Alamat</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {content.addressLine}
            <br />
            {content.addressRegion}
          </p>
          <Link href="/lacak" className="mt-3 inline-block text-sm font-semibold text-quantum-600 hover:underline">
            Lacak progres unit →
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5 dark:border-slate-900">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName}. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
