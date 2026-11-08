/**
 * Pesanan token, pembayaran manual (transfer bank IDR / USD) dan invoice.
 *
 * Alur: member memesan paket dalam IDR atau USD (harga dibekukan saat pesan) → mentransfer → mengunggah bukti
 * transfer → admin memeriksa dana lalu menyetujui (token masuk + komisi afiliasi, tepat sekali) atau menolak
 * dengan alasan (member bisa mengunggah bukti baru). Semua di R2: satu dokumen per pesanan (CAS), berkas bukti
 * di `f/proofs/…` (bucket privat, hanya dilayani ke pemilik pesanan dan admin), antrean verifikasi di
 * `i/order-review/`.
 */
import { B } from '../brand.ts';
import type { Store } from '../lib/store.ts';
import type { Lang } from '../lib/i18n.ts';
import { fmtNum } from '../lib/i18n.ts';

export type OrderStatus = 'pending' | 'review' | 'credited' | 'rejected' | 'cancelled';
export type Currency = 'IDR' | 'USD';
export const CURRENCIES: Currency[] = ['IDR', 'USD'];
export const isCurrency = (x: unknown): x is Currency => x === 'IDR' || x === 'USD';

export interface Proof {
  /** Kunci objek R2 berkas bukti. */
  key: string;
  name: string;
  type: string;
  size: number;
  at: number;
  /** Nama pengirim di rekening asal. */
  sender: string;
  /** Bank / aplikasi / layanan yang dipakai. */
  via: string;
  /** Tanggal transfer (YYYY-MM-DD). */
  paidOn: string;
  amount: number;
  currency: Currency;
  note: string;
  /** Berkas sudah dihapus otomatis (90 hari); ringkasan pembayaran tetap. */
  purged?: boolean;
}

export interface Order {
  id: string;
  /** 'tokens' = paket token (bawaan), 'deposit' = isi saldo Rupiah. */
  kind?: 'tokens' | 'deposit';
  uid: string;
  email: string;
  name?: string;
  pkg: string;
  pkgName?: { id: string; en: string };
  tokens: number;
  discountPct?: number;
  /** Mata uang tagihan; pesanan lama (sebelum 2 Nov 2026) dianggap IDR. */
  currency?: Currency;
  priceIdr: number;
  priceUsd: number;
  /** Harga sebelum diskon paket (untuk baris diskon di invoice). */
  listIdr?: number;
  listUsd?: number;
  status: OrderStatus;
  createdAt: number;
  /** Cara bayar: transfer + unggah bukti (bawaan) atau PayPal (otomatis, tanpa unggah). */
  method?: 'transfer' | 'paypal';
  /** Kurs USD/IDR yang dipakai saat pesanan dibuat (dibekukan di invoice). */
  fxRate?: number;
  paypal?: { orderId?: string; mode?: 'sandbox' | 'live'; captureId?: string; status?: string; payerEmail?: string; amount?: string; refunded?: boolean; at?: number };
  /** Profil penagihan pembeli saat pesanan dibuat (perusahaan, NPWP/VAT, alamat) — tampil di invoice. */
  billTo?: import('./users.ts').BillingProfile;
  creditedAt?: number;
  reviewedAt?: number;
  cancelledAt?: number;
  rejectReason?: string;
  by?: string;
  proofs?: Proof[];
}

export const orderKey = (id: string) => `c/orders/${id}.json`;
export const reviewKey = (id: string) => `i/order-review/${id}`;
export const MAX_PROOFS = 5;
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
/** Pesanan terbuka (belum lunas/batal) per member. */
export const MAX_OPEN_ORDERS = 3;
export const OPEN: OrderStatus[] = ['pending', 'review', 'rejected'];

export const currencyOf = (o: Order): Currency => o.currency ?? 'IDR';
export const amountOf = (o: Order): number => (currencyOf(o) === 'USD' ? o.priceUsd : o.priceIdr);
export const isDeposit = (o: Order): boolean => o.kind === 'deposit';

export function fmtMoney(L: Lang, cur: Currency, v: number): string {
  return cur === 'USD' ? `US$${fmtNum(L, v, Number.isInteger(v) ? 0 : 2)}` : `Rp ${fmtNum(L, v)}`;
}

/** Nomor invoice yang stabil dan mudah dibaca, diturunkan dari nomor pesanan (tidak perlu penghitung bersama). */
export function invoiceNo(o: Pick<Order, 'id' | 'createdAt'>): string {
  const d = new Date(o.createdAt + 7 * 3600_000); // WIB
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
  return `${B.invoicePrefix}-${ymd}-${o.id.slice(-6).toUpperCase()}`;
}

/** Jenis berkas bukti dikenali dari isi (magic bytes), bukan dari nama atau tipe yang dikirim peramban. */
export function sniffProof(bytes: Uint8Array): { type: string; ext: string } | null {
  const b = bytes;
  if (b.length < 12) return null;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { type: 'image/png', ext: 'png' };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { type: 'image/webp', ext: 'webp' };
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return { type: 'application/pdf', ext: 'pdf' };
  return null;
}

/* ── setelan pembayaran (Admin → Pembayaran) ────────────────────────── */

export interface PaymentSettings {
  idrEnabled: boolean;
  usdEnabled: boolean;
  bankName: string;
  bankAddress: string;
  swift: string;
  bankCode: string;
  beneficiary: string;
  beneficiaryAddress: string;
  accountIdr: string;
  accountUsd: string;
  /** Nomor WhatsApp untuk pertanyaan pembayaran (opsional, angka saja dengan kode negara). */
  whatsapp: string;
  note: string;
  /** Deposit Rupiah minimum & maksimum per pesanan; maksimum 0 = tanpa batas (pemilik, 8 Nov 2026). */
  minDepositIdr: number;
  maxDepositIdr: number;
  /** Versi aturan deposit (2 = tanpa batas atas bawaan). */
  depVersion?: number;
}

export const PAYMENT_DOC = 'k/payment.json';

/**
 * Bawaan = rekening pembayaran yang sama dengan ulyah.com (BNI multicurrency „wondr", a.n. YUSRON EFENDI),
 * sesuai perintah pemilik 2 Nov 2026. Bisa diubah di Admin → Pembayaran. Hanya ditampilkan kepada pembeli
 * yang sudah masuk, di halaman pesanannya — tidak pernah di halaman publik.
 */
export const DEFAULT_PAYMENT: PaymentSettings = {
  idrEnabled: true,
  usdEnabled: true,
  bankName: 'PT Bank Negara Indonesia (Persero) Tbk. — BNI',
  bankAddress: 'Grha BNI, Jl. Jenderal Sudirman Kav. 1, Jakarta 10220, Indonesia',
  swift: 'BNINIDJA',
  bankCode: '009',
  beneficiary: 'YUSRON EFENDI',
  beneficiaryAddress: '',
  accountIdr: '2090571484',
  accountUsd: '2090571495',
  whatsapp: '',
  note: '',
  minDepositIdr: 50_000,
  maxDepositIdr: 0,
  depVersion: 2,
};

export async function getPayment(store: Store): Promise<PaymentSettings> {
  const s = await store.get<Partial<PaymentSettings>>(PAYMENT_DOC);
  const p = { ...DEFAULT_PAYMENT, ...(s ?? {}) };
  if (!p.idrEnabled && !p.usdEnabled) p.idrEnabled = true;
  p.minDepositIdr = Math.max(10_000, Math.round(Number(p.minDepositIdr) || DEFAULT_PAYMENT.minDepositIdr));
  // Pemilik, 8 Nov 2026: „tanpa limit, mau deposit 100jt-1milyar jg g apa2“ — batas lama Rp100 jt dihapus sekali.
  if ((s?.depVersion ?? 1) < 2) {
    p.maxDepositIdr = 0;
    p.depVersion = 2;
  }
  const mx = Math.round(Number(p.maxDepositIdr) || 0);
  p.maxDepositIdr = mx > 0 ? Math.max(p.minDepositIdr, mx) : 0;
  return p;
}
