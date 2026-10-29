"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SALE_DEFAULTS, toSaleTerms, usd, type SaleTerms } from "@/lib/site-sale";

/**
 * Admin → Situs dijual (owner, 28–29 Oct 2026; docs/ADSENSE-BLUEPRINT.md §17). ulyah.com
 * itself is for sale: shown or hidden (default shown), the price, the minimum offer,
 * negotiable, the contacts, the 24-hour Makkah live link, and every offer with its
 * status and a note. Everything is stored in R2 by the API; each change is logged.
 */
type Status = "new" | "contacted" | "negotiating" | "declined" | "accepted";
const STATUSES: [Status, string][] = [["new", "Baru"], ["contacted", "Sudah dihubungi"], ["negotiating", "Negosiasi"], ["declined", "Ditolak"], ["accepted", "Diterima"]];

interface Offer { id: string; name: string; email: string; whatsapp: string; company: string; country: string; amountUsd: number; message: string; status: Status; note: string; createdAt: string }

function toOffers(raw: unknown): Offer[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((o): o is Offer => !!o && typeof o === "object" && typeof (o as Offer).id === "string" && typeof (o as Offer).amountUsd === "number");
}

export function SaleTab() {
  const [s, setS] = useState<SaleTerms>(SALE_DEFAULTS);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [log, setLog] = useState<Record<string, unknown>[]>([]);
  const [storage, setStorage] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    try {
      const r = await api.get<{ settings?: unknown; offers?: unknown; log?: unknown; storage?: unknown }>("/admin/site-sale");
      setS(toSaleTerms(r?.settings));
      const list = toOffers(r?.offers);
      setOffers(list);
      setNotes(Object.fromEntries(list.map((o) => [o.id, o.note ?? ""])));
      setLog(Array.isArray(r?.log) ? (r.log as Record<string, unknown>[]) : []);
      setStorage(r?.storage !== false);
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal memuat data." });
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save(next: SaleTerms, done: string) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.put<{ settings?: unknown }>("/admin/site-sale", next);
      setS(toSaleTerms(r?.settings));
      setMsg({ ok: true, text: done });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  async function mark(o: Offer, status: Status) {
    setBusy(true);
    setMsg(null);
    try {
      await api.put(`/admin/site-sale/offers/${o.id}`, { status, note: notes[o.id] ?? o.note });
      setMsg({ ok: true, text: `Penawaran ${o.name} (${usd(o.amountUsd)}) disimpan.` });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Gagal menyimpan." });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm";
  const num = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;
  const best = offers.filter((o) => o.status !== "declined").reduce((m, o) => Math.max(m, o.amountUsd), 0);

  return (
    <div className="space-y-6" data-testid="admin-sale">
      <div>
        <h2 className="font-heading text-xl">🏷️ ULYAH.COM dijual</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Pita di paling atas beranda, menu khusus di header dan halaman /acquisition. Perubahan tampil di situs dalam ±5 menit.
        </p>
      </div>
      {!storage && <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger">Penyimpanan R2 sedang tidak aktif di akun Cloudflare — pengaturan dan penawaran belum bisa disimpan.</p>}
      {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`} role="status">{msg.text}</p>}

      <section className="rounded-2xl border border-(--color-border) p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.visible ? "bg-success/15 text-success" : "bg-black/10 text-text-secondary"}`} data-testid="admin-sale-state">
            {s.visible ? "Tampil di situs" : "Disembunyikan"}
          </span>
          <button
            className="rounded-full border border-(--color-border) px-4 py-1.5 text-sm hover:border-accent disabled:opacity-50"
            disabled={busy}
            onClick={() => {
              if (confirm(s.visible ? "Sembunyikan penjualan? Pita beranda, menu header dan halaman /acquisition hilang." : "Tampilkan penjualan ULYAH.COM di situs?"))
                save({ ...s, visible: !s.visible }, s.visible ? "Penjualan disembunyikan." : "Penjualan ditampilkan.");
            }}
            data-testid="admin-sale-toggle"
          >
            {s.visible ? "Sembunyikan" : "Tampilkan"}
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Harga (US$)<input className={input} inputMode="numeric" value={s.priceUsd} onChange={(e) => setS({ ...s, priceUsd: num(e.target.value) })} data-testid="admin-sale-price" /></label>
          <label className="block text-sm font-medium">Penawaran minimum (US$)<input className={input} inputMode="numeric" value={s.minOfferUsd} onChange={(e) => setS({ ...s, minOfferUsd: num(e.target.value) })} /></label>
          <label className="block text-sm font-medium">WhatsApp pemilik<input className={input} value={s.whatsapp} onChange={(e) => setS({ ...s, whatsapp: e.target.value })} placeholder="+62…" /></label>
          <label className="block text-sm font-medium">E-mail penerima penawaran<input className={input} type="email" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} /></label>
          <label className="block text-sm font-medium sm:col-span-2">
            Tautan YouTube live Makkah 24 jam
            <input className={input} value={s.makkahLiveUrl} onChange={(e) => setS({ ...s, makkahLiveUrl: e.target.value })} placeholder="https://www.youtube.com/channel/UC… atau https://www.youtube.com/watch?v=…" data-testid="admin-sale-live" />
            <span className="mt-1 block text-xs text-text-secondary">Kosongkan untuk memakai kanal Masjidil Haram yang diatur di tab 📡 Live Streaming (siaran yang sedang tayang dipilih otomatis).</span>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.negotiable} onChange={(e) => setS({ ...s, negotiable: e.target.checked })} /> Harga bisa nego</label>
        </div>
        <button className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent dark:text-primary" disabled={busy} onClick={() => save(s, "Pengaturan disimpan.")} data-testid="admin-sale-save">
          Simpan
        </button>
      </section>

      <section className="rounded-2xl border border-(--color-border) p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading text-lg">Penawaran masuk ({offers.length})</h3>
          {best > 0 && <p className="text-sm text-text-secondary">Penawaran tertinggi yang masih aktif: <b className="text-text-primary">{usd(best)}</b></p>}
        </div>
        {!offers.length ? (
          <p className="mt-3 text-sm text-text-secondary">Belum ada penawaran.</p>
        ) : (
          <div className="mt-4 space-y-4" data-testid="admin-sale-offers">
            {offers.map((o) => (
              <div key={o.id} className="rounded-xl border border-(--color-border) p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <b>{o.name}</b> · <a href={`mailto:${o.email}`} className="text-accent hover:underline">{o.email}</a>
                    {o.whatsapp && <> · <a href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">WA {o.whatsapp}</a></>}
                    <div className="text-xs text-text-secondary">{[o.company, o.country, o.createdAt.slice(0, 16).replace("T", " ")].filter(Boolean).join(" · ")}</div>
                  </div>
                  <div className="font-heading text-xl">{usd(o.amountUsd)}</div>
                </div>
                {o.message && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-black/5 p-3 text-text-secondary dark:bg-white/5">{o.message}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input className="min-w-[220px] flex-1 rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-1.5 text-sm" placeholder="Catatan (hanya untuk admin)" value={notes[o.id] ?? ""} onChange={(e) => setNotes({ ...notes, [o.id]: e.target.value })} />
                  <select className="rounded-lg border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-sm" value={o.status} onChange={(e) => mark(o, e.target.value as Status)} disabled={busy}>
                    {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <button className="rounded-full border border-(--color-border) px-3 py-1.5 text-xs hover:border-accent" disabled={busy} onClick={() => mark(o, o.status)}>Simpan catatan</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {log.length > 0 && (
        <section className="rounded-2xl border border-(--color-border) p-5">
          <h3 className="font-heading text-lg">Riwayat perubahan</h3>
          <ul className="mt-3 space-y-1 text-xs text-text-secondary">
            {log.map((l, i) => (
              <li key={i}>
                {String(l.at ?? "").slice(0, 16).replace("T", " ")} · {String(l.by ?? "")} · {l.action === "settings" ? `pengaturan: ${JSON.stringify(l.changes ?? {})}` : `penawaran ${String(l.id ?? "")} → ${String(l.status ?? "")}`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
