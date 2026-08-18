'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COMPANY } from '@/lib/company';
import { LogoWordmark } from '@/components/ui/Logo';
import { KnockGate } from '@/components/ui/KnockGate';

/**
 * Lambang di header: tautan ke beranda, kecuali ketika pengunjung memang sudah
 * berada di beranda.
 *
 * Di sana tautannya tidak melakukan apa-apa, jadi ruang itu dipakai untuk pintu
 * ketuk yang sama seperti di kaki halaman. Ini bukan kemewahan: lambang inilah
 * yang paling menonjol, jadi ke sinilah orang mengetuk lebih dulu — dan sebelum
 * ini ketukannya tidak dihitung sama sekali.
 */
export function HeaderLogo() {
  const pathname = usePathname();

  if (pathname === '/') {
    return (
      <KnockGate taps={5} href="/login" label={COMPANY.legalName}>
        <LogoWordmark />
      </KnockGate>
    );
  }

  return (
    <Link href="/" aria-label={COMPANY.legalName}>
      <LogoWordmark />
    </Link>
  );
}
