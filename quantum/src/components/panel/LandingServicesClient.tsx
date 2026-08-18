'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIdr } from '@/lib/format';

export type LandingService = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  bullets: string;
  priceIdr: number | null;
  priceLabel: string;
  priceNote: string;
  sortOrder: number;
  active: boolean;
};

const EMPTY = {
  icon: '🔧',
  title: '',
  summary: '',
  bullets: '',
  priceIdr: '',
  priceLabel: 'Mulai dari',
  priceNote: '',
  sortOrder: '0',
  active: true
};

export function LandingServicesClient({ initialServices }: { initialServices: LandingService[] }) {
  const router = useRouter();
  const [services, setServices] = useState(initialServices);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(service: LandingService) {
    setEditingId(service.id);
    setForm({
      icon: service.icon,
      title: service.title,
      summary: service.summary,
      bullets: service.bullets,
      priceIdr: service.priceIdr === null ? '' : String(service.priceIdr),
      priceLabel: service.priceLabel,
      priceNote: service.priceNote,
      sortOrder: String(service.sortOrder),
      active: service.active
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      icon: form.icon.trim() || '🔧',
      title: form.title.trim(),
      summary: form.summary.trim(),
      // Poin dikirim apa adanya; server yang membuang baris kosong.
      bullets: form.bullets,
      // Kolom harga yang dikosongkan berarti kartu tampil tanpa harga,
      // bukan berarti harganya nol.
      priceIdr: form.priceIdr.trim() === '' ? null : Number(form.priceIdr),
      priceLabel: form.priceLabel.trim() || 'Mulai dari',
      priceNote: form.priceNote.trim(),
      sortOrder: Number(form.sortOrder || 0),
      active: form.active
    };

    try {
      const res = await fetch(editingId ? `/api/panel/layanan/${editingId}` : '/api/panel/layanan', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan layanan.');

      const cleanBullets = payload.bullets
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n');
      const saved = { ...payload, bullets: cleanBullets };

      if (editingId) {
        setServices((prev) => prev.map((s) => (s.id === editingId ? { ...saved, id: editingId } : s)));
      } else if (data.id) {
        setServices((prev) =>
          [...prev, { ...saved, id: data.id! }].sort((a, b) => a.sortOrder - b.sortOrder)
        );
      }
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan layanan.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Hapus kartu layanan ini dari halaman depan?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/panel/layanan/${id}`, { method: 'DELETE' });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus layanan.');
      setServices((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus layanan.');
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="card space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white">
          {editingId ? 'Ubah kartu layanan' : 'Tambah kartu layanan'}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="input text-center text-lg"
            required
            maxLength={8}
            placeholder="Ikon"
            aria-label="Ikon (emoji)"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
          <input
            className="input lg:col-span-2"
            required
            placeholder="Judul layanan *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            type="number"
            min={0}
            max={999}
            step={1}
            className="input"
            placeholder="Urutan"
            aria-label="Urutan tampil"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
        </div>

        <input
          className="input"
          placeholder="Kalimat singkat di bawah judul"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />

        <label className="block text-xs text-slate-500 dark:text-slate-400">
          Poin pekerjaan — satu baris satu poin
          <textarea
            className="input mt-1 min-h-[120px] font-mono text-sm"
            placeholder={'Bodi bus besar & medium\nMicrobus\nBox besi & aluminium'}
            value={form.bullets}
            onChange={(e) => setForm({ ...form, bullets: e.target.value })}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="input"
            placeholder="Label harga (Mulai dari)"
            aria-label="Label harga"
            value={form.priceLabel}
            onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
          />
          <input
            type="number"
            min={0}
            step={1}
            className="input"
            placeholder="Harga (Rp) — kosongkan bila tanpa harga"
            aria-label="Harga layanan"
            value={form.priceIdr}
            onChange={(e) => setForm({ ...form, priceIdr: e.target.value })}
          />
          <input
            className="input"
            placeholder="Keterangan harga (per unit / nego)"
            aria-label="Keterangan harga"
            value={form.priceNote}
            onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300"
          />
          Tampilkan kartu ini di halaman depan
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : '+ Tambah layanan'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Urut</th>
              <th>Layanan</th>
              <th>Poin</th>
              <th>Harga</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td className="tabular-nums text-slate-400">{service.sortOrder}</td>
                <td>
                  <div className="font-semibold text-slate-800 dark:text-slate-100">
                    <span className="mr-1.5">{service.icon}</span>
                    {service.title}
                  </div>
                  {service.summary && <div className="max-w-sm text-xs text-slate-400">{service.summary}</div>}
                </td>
                <td className="text-xs text-slate-500">
                  {service.bullets ? `${service.bullets.split('\n').filter(Boolean).length} poin` : '—'}
                </td>
                <td className="whitespace-nowrap tabular-nums">
                  {service.priceIdr === null ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <>
                      <div className="text-[11px] text-slate-400">{service.priceLabel}</div>
                      {formatIdr(service.priceIdr)}
                      {service.priceNote && <div className="text-[11px] text-slate-400">{service.priceNote}</div>}
                    </>
                  )}
                </td>
                <td>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      service.active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {service.active ? 'Tampil' : 'Nonaktif'}
                  </span>
                </td>
                <td className="whitespace-nowrap text-right">
                  <button
                    onClick={() => startEdit(service)}
                    className="text-xs font-semibold text-quantum-600 hover:underline"
                  >
                    Ubah
                  </button>
                  <button onClick={() => remove(service.id)} className="ml-3 text-xs text-red-500 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Belum ada kartu layanan. Bagian &ldquo;Layanan kami&rdquo; di halaman depan akan disembunyikan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
