'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatIdr, formatDate } from '@/lib/format';
import {
  STOCK_CHECK_PERIODS,
  STOCK_CHECK_PERIOD_LABEL,
  STOCK_CHECK_STATUS_LABEL,
  type StockCheckPeriod,
  type StockCheckStatus
} from '@/lib/karoseri/constants';

export type StockCheckRow = {
  id: string;
  checkNumber: string;
  period: StockCheckPeriod;
  status: StockCheckStatus;
  checkedAt: Date | string;
  itemCount: number;
  diffCount: number;
  damagedQty: number;
  lostQty: number;
  lossValueIdr: number;
  checkedBy: string | null;
};

export type InventorySummary = {
  totalItems: number;
  totalQty: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
};

const today = () => new Date().toISOString().slice(0, 10);

export function StockCheckClient({
  initialChecks,
  summary,
  canWrite
}: {
  initialChecks: StockCheckRow[];
  summary: InventorySummary;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [checks, setChecks] = useState(initialChecks);
  const [form, setForm] = useState({
    period: 'mingguan' as StockCheckPeriod,
    checkedAt: today(),
    checkedBy: '',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCheck = useMemo(() => checks.find((c) => c.status === 'draft'), [checks]);
  const totalLoss = useMemo(() => checks.reduce((s, c) => s + c.lossValueIdr, 0), [checks]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/panel/opname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period: form.period,
          checkedAt: form.checkedAt,
          checkedBy: form.checkedBy || null,
          notes: form.notes || null
        })
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(data.error || 'Gagal membuka sesi opname.');
      router.push(`/panel/opname/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuka sesi opname.');
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Batalkan sesi opname ini?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/panel/opname/${id}`, { method: 'DELETE' });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || 'Gagal membatalkan sesi.');
      setChecks((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membatalkan sesi.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Jenis barang" value={`${summary.totalItems} item`} />
        <Tile label="Total unit di gudang" value={`${summary.totalQty.toLocaleString('id-ID')} pcs`} />
        <Tile label="Nilai persediaan" value={formatIdr(summary.totalValue)} />
        <Tile
          label="Perlu perhatian"
          value={`${summary.lowStock} menipis · ${summary.outOfStock} habis`}
          tone={summary.lowStock > 0 ? 'warn' : 'ok'}
        />
      </div>

      {canWrite && (
        <form onSubmit={create} className="card space-y-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Mulai pemeriksaan stok</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sistem menyiapkan daftar seluruh barang aktif beserta stok menurut catatan. Petugas tinggal menghitung
              fisiknya di gudang, lalu menandai yang rusak atau hilang.
            </p>
          </div>

          {openCheck && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Masih ada sesi yang belum ditutup:{' '}
              <Link href={`/panel/opname/${openCheck.id}`} className="font-semibold underline">
                {openCheck.checkNumber}
              </Link>
              . Selesaikan dulu supaya hitungannya tidak tumpang tindih.
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select
              className="input"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value as StockCheckPeriod })}
              aria-label="Jenis pemeriksaan"
            >
              {STOCK_CHECK_PERIODS.map((p) => (
                <option key={p} value={p}>
                  {STOCK_CHECK_PERIOD_LABEL[p]}
                </option>
              ))}
            </select>
            <label className="text-xs text-slate-500 dark:text-slate-400">
              Tanggal pemeriksaan *
              <input
                type="date"
                required
                className="input mt-1"
                value={form.checkedAt}
                onChange={(e) => setForm({ ...form, checkedAt: e.target.value })}
              />
            </label>
            <input
              className="input"
              placeholder="Petugas yang menghitung"
              value={form.checkedBy}
              onChange={(e) => setForm({ ...form, checkedBy: e.target.value })}
            />
            <input
              className="input"
              placeholder="Catatan"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Menyiapkan…' : '+ Mulai opname'}
          </button>
        </form>
      )}

      <div className="card overflow-x-auto">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 dark:text-white">Riwayat pemeriksaan</h2>
          {totalLoss > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Total kerugian tercatat: <span className="font-semibold text-red-600">{formatIdr(totalLoss)}</span>
            </span>
          )}
        </div>
        <table className="table-base">
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th className="text-right">Diperiksa</th>
              <th className="text-right">Selisih</th>
              <th className="text-right">Rusak / Hilang</th>
              <th className="text-right">Nilai kerugian</th>
              <th>Status</th>
              {canWrite && <th />}
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.id}>
                <td className="whitespace-nowrap">
                  <Link href={`/panel/opname/${c.id}`} className="font-mono text-xs font-semibold text-quantum-600 hover:underline">
                    {c.checkNumber}
                  </Link>
                  {c.checkedBy && <div className="text-[11px] text-slate-400">{c.checkedBy}</div>}
                </td>
                <td className="whitespace-nowrap">{formatDate(c.checkedAt)}</td>
                <td className="text-xs">{STOCK_CHECK_PERIOD_LABEL[c.period]}</td>
                <td className="text-right tabular-nums">{c.itemCount}</td>
                <td className="text-right tabular-nums">{c.diffCount}</td>
                <td className="whitespace-nowrap text-right tabular-nums">
                  {c.damagedQty + c.lostQty > 0 ? (
                    <span className="text-amber-600">
                      {c.damagedQty} / {c.lostQty}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap text-right tabular-nums">
                  {c.lossValueIdr > 0 ? (
                    <span className="font-semibold text-red-600">{formatIdr(c.lossValueIdr)}</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.status === 'selesai'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}
                  >
                    {STOCK_CHECK_STATUS_LABEL[c.status]}
                  </span>
                </td>
                {canWrite && (
                  <td className="text-right">
                    {c.status === 'draft' && (
                      <button onClick={() => remove(c.id)} className="text-xs text-red-500 hover:underline">
                        Batalkan
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {checks.length === 0 && (
              <tr>
                <td colSpan={canWrite ? 9 : 8} className="py-8 text-center text-slate-400">
                  Belum pernah ada pemeriksaan stok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ label, value, tone = 'plain' }: { label: string; value: string; tone?: 'plain' | 'ok' | 'warn' }) {
  const cls = tone === 'warn' ? 'text-amber-600' : tone === 'ok' ? 'text-emerald-600' : 'text-slate-900 dark:text-white';
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-black tabular-nums ${cls}`}>{value}</p>
    </div>
  );
}
