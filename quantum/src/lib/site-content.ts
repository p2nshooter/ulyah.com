import { inArray } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { settings } from '@/lib/db/schema';
import { COMPANY } from '@/lib/company';

/**
 * Teks dan kontak halaman depan. Nilainya menumpang di tabel `settings` yang
 * sama dengan setelan pajak, tapi dipisah modulnya supaya perubahan tampilan
 * situs tidak pernah bisa menyenggol angka laporan keuangan.
 *
 * Nilai bawaan diambil dari `COMPANY`, jadi kalau tabelnya kosong halaman
 * depan tetap tampil persis seperti sebelum modul ini ada.
 */
export const SITE_KEYS = {
  heroTitle: 'site_hero_title',
  heroAccent: 'site_hero_accent',
  heroPitch: 'site_hero_pitch',
  servicesTitle: 'site_services_title',
  servicesText: 'site_services_text',
  catalogTitle: 'site_catalog_title',
  catalogText: 'site_catalog_text',
  priceTitle: 'site_price_title',
  priceText: 'site_price_text',
  promoTitle: 'site_promo_title',
  promoText: 'site_promo_text',
  contactPhone: 'site_contact_phone',
  contactWhatsapp: 'site_contact_whatsapp',
  contactEmail: 'site_contact_email',
  workingHours: 'site_working_hours',
  addressLine: 'site_address_line',
  addressRegion: 'site_address_region',
  mapsUrl: 'site_maps_url'
} as const;

export type SiteContent = {
  /** Judul besar di kepala halaman; `heroAccent` adalah lanjutannya yang berwarna emas. */
  heroTitle: string;
  heroAccent: string;
  heroPitch: string;
  servicesTitle: string;
  servicesText: string;
  catalogTitle: string;
  catalogText: string;
  priceTitle: string;
  priceText: string;
  promoTitle: string;
  promoText: string;
  /** Nomor yang ditampilkan; boleh pakai tanda hubung agar enak dibaca. */
  contactPhone: string;
  /** Nomor WhatsApp format internasional tanpa tanda apa pun, mis. 6285886692214. */
  contactWhatsapp: string;
  contactEmail: string;
  workingHours: string;
  addressLine: string;
  addressRegion: string;
  mapsUrl: string;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroTitle: 'Karoseri, body repair & service mobil —',
  heroAccent: 'solusi tepat untuk mobil Anda.',
  heroPitch: COMPANY.pitch,
  servicesTitle: 'Layanan kami',
  servicesText: 'Satu bengkel untuk tiga kebutuhan: membangun bodi, memperbaiki bodi, dan merawat mesin.',
  catalogTitle: 'Katalog model bodi',
  catalogText:
    'Harga di bawah adalah estimasi awal per unit dan masih menyesuaikan spesifikasi, chassis, serta material pilihan Anda.',
  priceTitle: 'Daftar harga servis',
  priceText:
    'Harga jasa dan sparepart yang paling sering dikerjakan. Harga dapat berubah menyesuaikan kondisi kendaraan dan ketersediaan barang.',
  promoTitle: 'Promo & info terbaru',
  promoText: 'Penawaran yang sedang berjalan di bengkel kami.',
  contactPhone: COMPANY.phone,
  contactWhatsapp: COMPANY.whatsapp,
  contactEmail: COMPANY.email,
  workingHours: COMPANY.workingHours,
  addressLine: COMPANY.addressLine,
  addressRegion: COMPANY.addressRegion,
  mapsUrl: COMPANY.mapsUrl
};

export async function getSiteContent(): Promise<SiteContent> {
  const db = await getDb();
  const rows = await db.select().from(settings).where(inArray(settings.key, Object.values(SITE_KEYS)));
  const map = new Map(rows.map((row) => [row.key, row.value]));

  const read = (name: keyof SiteContent): string => {
    const raw = map.get(SITE_KEYS[name]);
    // String kosong tetap dihormati: admin memang boleh mengosongkan email
    // atau jam operasional agar barisnya hilang dari halaman.
    return raw === undefined ? DEFAULT_SITE_CONTENT[name] : raw;
  };

  return {
    heroTitle: read('heroTitle'),
    heroAccent: read('heroAccent'),
    heroPitch: read('heroPitch'),
    servicesTitle: read('servicesTitle'),
    servicesText: read('servicesText'),
    catalogTitle: read('catalogTitle'),
    catalogText: read('catalogText'),
    priceTitle: read('priceTitle'),
    priceText: read('priceText'),
    promoTitle: read('promoTitle'),
    promoText: read('promoText'),
    contactPhone: read('contactPhone'),
    contactWhatsapp: read('contactWhatsapp'),
    contactEmail: read('contactEmail'),
    workingHours: read('workingHours'),
    addressLine: read('addressLine'),
    addressRegion: read('addressRegion'),
    mapsUrl: read('mapsUrl')
  };
}

export async function saveSiteContent(patch: Partial<SiteContent>, actorUserId: string): Promise<void> {
  const db = await getDb();

  for (const [name, value] of Object.entries(patch)) {
    const key = SITE_KEYS[name as keyof typeof SITE_KEYS];
    if (!key || value === undefined) continue;
    await db
      .insert(settings)
      .values({ key, value: String(value), updatedBy: actorUserId, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(value), updatedBy: actorUserId, updatedAt: new Date() }
      });
  }
}

/** Tautan WhatsApp memakai nomor dari panel, bukan dari konstanta di kode. */
export function siteWhatsappLink(content: Pick<SiteContent, 'contactWhatsapp'>, message: string): string {
  return `https://wa.me/${content.contactWhatsapp}?text=${encodeURIComponent(message)}`;
}

export const siteAddress = (content: Pick<SiteContent, 'addressLine' | 'addressRegion'>): string =>
  [content.addressLine, content.addressRegion].filter(Boolean).join(', ');
