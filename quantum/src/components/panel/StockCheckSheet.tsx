'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatIdr, formatDate } from '@/lib/format';
import { STOCK_CHECK_PERIOD_LABEL, STOCK_CHECK_STATUS_LABEL, type StockCheckPeriod, type StockCheckStatus } from '@/lib/karoseri/constants';

type Line = {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  itemUnit: string;
  systemQty: number;
  physicalQty: number;
  damagedQty: number;
  lostQty: number;
  unitCostIdr: number;
  checked: boolean;
  notes: string | null;
};

export type SheetData = {
  check: {
    id: string;
    checkNumber: string;
    period: StockCheckPeriod;
    status: StockCheckStatus;
    checkedAt: Date | string;
    appliedAt: Date | string | null;
    checkedBy: string | null;
    notes: string | null;
    damagedQty: number;
    lostQty: number;
    lossValueIdr: number;
  };
  lines: Line[];
};

export function StockCheckSheet({ data, canWrite, canApply }: { data: SheetData; canWrite: boolean; canApply: boolean }) {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>(data.lines);
  const [checkedBy, setCheckedBy] = useState(data.check.checkedBy ?? '');
  const [notes, setNotes] = useState(data.check.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const locked = data.check.status === 'selesai' || !canWrite;

  const totals = useMemo(() => {
    let damaged = 0, lost = 0, loss = 0, diff = 0, done = 0;
    for (const l of lines) {
      damaged += l.damagedQty;
      lost += l.lostQty;
      // Batas yang sama seperti di server: hanya barang yang memang tercatat
      // ada yang boleh dihapusbukukan. Tanpa ini layar menjanjikan kerugian
      // yang tidak akan pernah muncul di laporan.
      loss += Math.min(l.damagedQty + l.lostQty, Math.max(0, l.systemQty)) * l.unitCostIdr;
      if (l.systemQty !== l.physicalQty + l.damagedQty + l.lostQty) diff += 1;
      if (l.checked) done += 1;
    }
    return { damaged, lost, loss, diff, done };
  }, [lines]);

  function edit(id: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    setSaved(false);
  }

  async function save() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/panel/opname/${data.check.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkedBy: checkedBy || null,
          notes: notes || null,
          lines: lines.map((l) => ({
            id: l.id,
            physicalQty: l.physicalQty,
            damagedQty: l.damagedQty,
            lostQty: l.lostQty,
            checked: l.checked,
            notes: l.notes || null
          }))
        })
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || 'Gagal menyimpan hasil hitungan.');
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan hasil hitungan.');
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (
      !confirm(
        `Tutup opname ${data.check.checkNumber}?\n\nStok akan disesuaikan ke hasil hitung fisik, dan kerugian ${formatIdr(
          totals.loss
        )} dicatat sebagai biaya. Setelah ditutup, sesi ini tidak bisa diubah lagi.`
      )
    )
      return;
    setError(null);
    setBusy(true);
    try {
      await save();
      const res = await fetch(`/api/panel/opname/${data.check.id}`, { method: 'POST' });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || 'Gagal menutup sesi.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menutup sesi.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/panel/opname" className="no-print text-sm text-slate-500 hover:text-quantum-600">
            ← Semua pemeriksaan
          </Link>
          <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{data.check.checkNumber}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {STOCK_CHECK_PERIOD_LABEL[data.check.period]} · {formatDate(data.check.checkedAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            data.check.status === 'selesai'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
          }`}
        >
          {STOCK_CHECK_STATUS_LABEL[data.check.status]}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Sudah dicek" value={`${totals.done} / ${lines.length}`} />
        <Tile label="Selisih" value={`${totals.diff} item`} tone={totals.diff > 0 ? 'warn' : 'ok'} />
        <Tile label="Rusak / Hilang" value={`${totals.damaged} / ${totals.lost}`} tone={totals.damaged + totals.lost > 0 ? 'warn' : 'ok'} />
        <Tile label="Nilai kerugian" value={formatIdr(totals.loss)} tone={totals.loss > 0 ? 'warn' : 'ok'} />
      </div>

      {!locked && (
        <div className="card grid gap-3 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Petugas yang menghitung"
            value={checkedBy}
            onChange={(e) => { setCheckedBy(e.target.value); setSaved(false); }}
          />
          <input
            className="input"
            placeholder="Catatan pemeriksaan"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
          />
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="w-10">✓</th>
              <th>Barang</th>
              <th className="text-right">Catatan sistem</th>
              <th className="text-right">Ada</th>
              <th className="text-right">Rusak</th>
              <th className="text-right">Hilang</th>
              <th className="text-right">Selisih</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const selisih = l.systemQty - (l.physicalQty + l.damagedQty + l.lostQty);
              return (
                <tr key={l.id} className={l.checked ? 'bg-emerald-50/40 dark:bg-emerald-900/10' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-slate-300"
                      checked={l.checked}
                      disabled={locked}
                      onChange={(e) => edit(l.id, { checked: e.target.checked })}
                      aria-label={`Tandai ${l.itemName} sudah dicek`}
                    />
                  </td>
                  <td>
                    <div className="font-medium text-slate-800 dark:text-slate-100">{l.itemName}</div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {l.itemCode} · modal {formatIdr(l.unitCostIdr)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-right tabular-nums text-slate-500">
                    {l.systemQty} {l.itemUnit}
                  </td>
                  {(['physicalQty', 'damagedQty', 'lostQty'] as const).map((field) => (
                    <td key={field} className="text-right">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        disabled={locked}
                        className="input input-inline w-20 text-right"
                        value={l[field]}
                        onChange={(e) => edit(l.id, { [field]: Math.max(0, Number(e.target.value || 0)) })}
                        aria-label={`${field === 'physicalQty' ? 'Ada' : field === 'damagedQty' ? 'Rusak' : 'Hilang'} — ${l.itemName}`}
                      />
                    </td>
                  ))}
                  <td className="whitespace-nowrap text-right tabular-nums">
                    {selisih === 0 ? (
                      <span className="text-emerald-600">cocok</span>
                    ) : (
                      <span className="font-semibold text-red-600">{selisih > 0 ? `kurang ${selisih}` : `lebih ${-selisih}`}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {lines.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  Tidak ada barang untuk diperiksa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Hasil hitungan tersimpan.</p>}

      {!locked && (
        <div className="flex flex-wrap gap-2">
          <button onClick={save} disabled={busy} className="btn-secondary">
            {busy ? 'Menyimpan…' : 'Simpan sementara'}
          </button>
          {canApply && (
            <button onClick={apply} disabled={busy} className="btn-primary">
              Tutup & sesuaikan stok
            </button>
          )}
        </div>
      )}

      {data.check.status === 'selesai' && (
        <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Sesi ditutup {formatDate(data.check.appliedAt)}. Stok sudah disesuaikan, dan kerugian{' '}
          <strong>{formatIdr(data.check.lossValueIdr)}</strong> ({data.check.damagedQty} rusak, {data.check.lostQty}{' '}
          hilang) tercatat sebagai biaya di laporan laba rugi.
        </p>
      )}
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
