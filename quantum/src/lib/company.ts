/**
 * Identitas perusahaan. Semua teks kontak di halaman publik membaca dari sini —
 * ubah di satu tempat ini saja, tidak perlu menyisir komponen satu per satu.
 *
 * Data di bawah diambil dari papan nama & spanduk bengkel. Field yang belum
 * diketahui sengaja dibiarkan kosong dan otomatis disembunyikan di halaman,
 * bukan diisi tebakan.
 */
export const COMPANY = {
  legalName: 'CV. Quantum Karya Bersama',
  shortName: 'Bengkel Quantum',
  businessLine: 'Karoseri, Body Repair & Service Mobil',
  tagline: 'Solusi tepat untuk mobil Anda.',
  pitch: 'Percayakan mobil Anda kepada ahli berpengalaman — hasil maksimal, harga bersahabat.',
  description:
    'CV. Quantum Karya Bersama adalah bengkel karoseri, body repair, dan service mobil di Sukakarya, Kabupaten Bekasi. Mengerjakan pembuatan bodi kendaraan, perbaikan bodi, pengecatan, sampai servis mesin — dengan progres pengerjaan yang bisa dipantau pelanggan secara online.',

  phone: '0858-8669-2214',
  whatsapp: '6285886692214',
  /**
   * Bengkel belum punya email resmi. Sengaja dibiarkan kosong, bukan diisi
   * tebakan: halaman menyembunyikan barisnya sendiri, sementara alamat yang
   * tidak ada pembacanya membuat pelanggan mengirim surat ke ruang kosong.
   * Isi lewat Panel > Tampilan Halaman Depan kalau sudah punya.
   */
  email: '',
  addressLine: 'Jl. Raya Sukakarya–Sukatani, Kp. Tenjo Laut No. 1, RT 01/01',
  addressRegion: 'Desa Sukakarya, Kec. Sukakarya, Kabupaten Bekasi, Jawa Barat',
  mapsUrl: 'https://maps.app.goo.gl/xZRfZcXzmrjXGFuA7',
  workingHours: 'Setiap hari, 08.00–17.00 WIB',

  /** Keunggulan yang tercantum di papan nama bengkel. */
  highlights: [
    { icon: '👷', label: 'Teknisi profesional' },
    { icon: '🧰', label: 'Peralatan lengkap' },
    { icon: '⏱️', label: 'Kerja cepat & tepat' }
  ]
} as const;

export const COMPANY_ADDRESS = `${COMPANY.addressLine}, ${COMPANY.addressRegion}`;

export function whatsappLink(message: string): string {
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(message)}`;
}
