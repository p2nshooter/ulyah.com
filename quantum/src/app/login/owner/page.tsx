import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { COMPANY } from '@/lib/company';
import { LogoMark } from '@/components/ui/Logo';
import { LoginForm } from '../LoginForm';

export const metadata: Metadata = {
  title: 'Portal Pemilik',
  robots: { index: false, follow: false }
};

export const dynamic = 'force-dynamic';

export default async function OwnerLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'bos' ? '/panel/laporan' : '/panel');

  return (
    <main className="grid min-h-screen place-items-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <LogoMark className="h-12 w-12" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            Portal Pemilik
          </span>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
          <h1 className="text-xl font-black text-white">Masuk portal pemilik</h1>
          <p className="mt-1 text-sm text-slate-400">
            Khusus pemilik {COMPANY.legalName}. Berisi laporan keuangan dan data karyawan —
            tanpa menu operasional.
          </p>
          <div className="mt-6">
            <LoginForm redirectTo="/panel/laporan" accent="gold" tone="dark" usernameHint="mis. bos.quantum" />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/login" className="hover:text-gold-400">
            ← Masuk sebagai staf
          </Link>
        </p>
      </div>
    </main>
  );
}
