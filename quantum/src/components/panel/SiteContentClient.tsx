'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SiteContent } from '@/lib/site-content';

type Field = {
  name: keyof SiteContent;
  label: string;
  hint?: string;
  long?: boolean;
};

const HERO: Field[] = [
  { name: 'heroTitle', label: 'Judul utama', hint: 'Baris pertama judul besar di kepala halaman.' },
  { name: 'heroAccent', label: 'Lanjutan judul (warna emas)' },
  { name: 'heroPitch', label: 'Kalimat pembuka', long: true }
];

const SECTIONS: Field[] = [
  { name: 'promoTitle', label: 'Judul bagian promo' },
  { name: 'promoText', label: 'Keterangan bagian promo', long: true },
  { name: 'servicesTitle', label: 'Judul bagian layanan' },
  { name: 'servicesText', label: 'Keterangan bagian layanan', long: true },
  { name: 'catalogTitle', label: 'Judul bagian katalog model' },
  { name: 'catalogText', label: 'Keterangan bagian katalog', long: true },
  { name: 'priceTitle', label: 'Judul bagian daftar harga' },
  { name: 'priceText', label: 'Keterangan bagian daftar harga', long: true }
];

const CONTACT: Field[] = [
  { name: 'contactPhone', label: 'Nomor telepon yang ditampilkan', hint: 'Boleh pakai tanda hubung, mis. 0858-8669-2214.' },
  { name: 'contactWhatsapp', label: 'Nomor WhatsApp', hint: 'Angka saja dengan kode negara, mis. 6285886692214.' },
  { name: 'contactEmail', label: 'Email', hint: 'Kosongkan bila belum punya — barisnya otomatis hilang.' },
  { name: 'workingHours', label: 'Jam operasional', hint: 'Mis. Senin–Sabtu, 08.00–17.00 WIB.' },
  { name: 'addressLine', label: 'Alamat baris 1' },
  { name: 'addressRegion', label: 'Alamat baris 2' },
  { name: 'mapsUrl', label: 'Tautan Google Maps' }
];

export function SiteContentClient({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter();
  const [form, setForm] = useState(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    try {
      const res = await fetch('/api/panel/tampilan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = (await res.json()) as { content?: SiteContent; error?: string };
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan tampilan.');
      if (data.content) setForm(data.content);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan tampilan.');
    } finally {
      setSaving(false);
    }
  }

  const render = (field: Field) => (
    <label key={field.name} className="block text-xs text-slate-500 dark:text-slate-400">
      {field.label}
      {field.long ? (
        <textarea
          className="input mt-1 min-h-[70px] text-sm text-slate-900 dark:text-white"
          value={form[field.name]}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        />
      ) : (
        <input
          className="input mt-1 text-sm text-slate-900 dark:text-white"
          value={form[field.name]}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        />
      )}
      {field.hint && <span className="mt-1 block text-[11px] text-slate-400">{field.hint}</span>}
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="card space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">Kepala halaman</h2>
        <div className="grid gap-3 sm:grid-cols-2">{HERO.map(render)}</div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">Judul tiap bagian</h2>
        <div className="grid gap-3 sm:grid-cols-2">{SECTIONS.map(render)}</div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">Kontak & alamat</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dipakai di halaman depan, kaki halaman, dan tombol WhatsApp. Identitas kop laporan diatur terpisah di{' '}
          <span className="font-semibold">Pengaturan</span>.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">{CONTACT.map(render)}</div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Tampilan halaman depan tersimpan.</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Menyimpan…' : 'Simpan tampilan'}
        </button>
        <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Lihat halaman depan
        </a>
      </div>
    </form>
  );
}
