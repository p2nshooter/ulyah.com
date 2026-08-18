'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Pintu tersembunyi: ketuk lambang beberapa kali berturut-turut untuk membuka
 * halaman masuk. Dipakai supaya tautan panel tidak terpampang di halaman
 * publik.
 *
 * PENTING — ini menyembunyikan pintunya, bukan menguncinya. Alamatnya tetap
 * bisa dibuka langsung oleh siapa pun yang tahu, dan memang harus begitu
 * supaya pemilik tidak terkunci di luar. Yang menjaga sistem tetap password
 * dan peran pengguna, bukan jumlah ketukan.
 */
export function KnockGate({
  taps,
  href,
  label,
  resetMs = 3000,
  children
}: {
  /** Berapa kali harus diketuk. */
  taps: number;
  /** Tujuan setelah ketukan lengkap. */
  href: string;
  /** Keterangan untuk pembaca layar. */
  label: string;
  /**
   * Jeda maksimum antar ketukan sebelum hitungan kembali nol.
   *
   * Semula 1,2 detik dan itu terlalu ketat: diuji dengan sentuhan berjeda 1,5
   * detik — kecepatan wajar orang yang mengetuk sambil memperhatikan layar —
   * pintunya tidak pernah terbuka. 3 detik memberi kelonggaran tanpa membuat
   * ketukan tak sengaja menumpuk.
   */
  resetMs?: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hitungan direset kalau ketukan berikutnya terlalu lama — tanpa ini, dua
  // ketukan hari ini dan tiga ketukan besok akan ikut membuka pintunya.
  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clear, [clear]);

  function knock() {
    clear();
    const next = count + 1;
    if (next >= taps) {
      setCount(0);
      router.push(href);
      return;
    }
    setCount(next);
    timer.current = setTimeout(() => setCount(0), resetMs);
  }

  const remaining = taps - count;

  return (
    <span
      onClick={knock}
      // Ketukan dihitung dari `onClick`, yang di peramban seluler sudah
      // mencakup sentuhan — memakai onTouchStart sekaligus akan menghitung
      // satu sentuhan sebagai dua ketukan.
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          knock();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
      className="relative -m-2 inline-flex cursor-pointer select-none items-center p-2"
      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
    >
      {children}

      {/* Penanda kemajuan hanya muncul setelah ketukan pertama, supaya tidak
          mengiklankan keberadaan pintunya kepada pengunjung biasa. */}
      {count > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-1.5"
        >
          {Array.from({ length: taps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition ${
                i < count ? 'bg-quantum-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </span>
      )}
      <span className="sr-only">{count > 0 ? `Kurang ${remaining} ketukan lagi` : ''}</span>
    </span>
  );
}
