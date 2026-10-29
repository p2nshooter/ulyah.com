"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SALE_DEFAULTS, toSaleTerms, usd, type SaleTerms } from "@/lib/site-sale";

/**
 * Admin → Situs dijual (owner, 28–29 Oct 2026; docs/ADSENSE-BLUEPRINT.md §17, §17.3): the five
 * sites on sale — ulyah.com, 1fr.fr, tilawa.de, dawa.im, xad.es — each shown or hidden, with its
 * price, minimum offer and negotiable; the contacts and the 24-hour Makkah live link that every
 * sale page uses; and every offer with its site, status and a note. Stored in R2 by the API;
 * each change is logged.
 */
type Status = "new" | "contacted" | "negotiating" | "declined" | "accepted";
const STATUSES: [Status, string][] = [["new", "Baru"], ["contacted", "Sudah dihubungi"], ["negotiating", "Negosiasi"], ["declined", "Ditolak"], ["accepted", "Diterima"]];

interface Offer { id: string; site: string; name: string; email: string; whatsapp: string; company: string; country: string; amountUsd: number; message: string; status: Status; note: string; createdAt: string }
interface SiteRow { site: string; domain: string; name: string; terms: SaleTerms }

function toOffers(raw: unknown): Offer[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((o): o is Offer => !!o && typeof o === "object" && typeof (o as Offer).id === "string" && typeof (o as Offer).amountUsd === "number")
    .map((o) => ({ ...o, site: typeof o.site === "string" ? o.site : "ulyah" }));
}

function toSites(raw: unknown): SiteRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r): r is { site: string; domain: string; name: string; settings: unknown } => !!r && typeof r === "object" && typeof (r as SiteRow).site === "string" && typeof (r as SiteRow).domain === "string")
    .map((r) => ({ site: r.site, domain: r.domain, name: typeof r.name === "string" ? r.name : r.domain, terms: toSaleTerms(r.settings) }));
}

export function SaleTab() {
  const [hub, setHub] = useState<SaleTerms>(SALE_DEFAULTS);
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [log, setLog] = useState<Record<string, unknown>[]>([]);
  const [storage, setStorage] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    try {
      const r = await api.get<{ settings?: unknown; sites?: unknown; offers?: unknown; log?: unknown; storage?: unknown }>("/admin/site-sale");
      setHub(toSaleTerms(r?.settings));
      setSites(toSites(r?.sites));
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

  async function save(site: string, body: Partial<SaleTerms>, done: string) {
    setBusy(true);
    setMsg(null);
    try {
      await api.put(`/admin/site-sale?site=${site}`, body);
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

  const setSite = (site: string, patch: Partial<SaleTerms>) => setSites((all) => all.map((r) => (r.site === site ? { ...r, terms: { ...r.terms, ...patch } } : r)));
  const input = "mt-1 w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm";
  const num = (v: string) => Number(v.replace(/[^\d]/g, "")) || 0;
  const domainOf = (site: string) => sites.find((s) => s.site === site)?.domain ?? site;
  const shown = offers.filter((o) => filter === "all" || o.site === filter);
  const best = shown.filter((o) => o.status !== "declined").reduce((m, o) => Math.max(m, o.amountUsd), 0);

  return (
    <div className="space-y-6" data-testid="admin-sale">
      <div>
        <h2 className="font-heading text-xl">🏷️ Situs dijual</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Pita di paling atas beranda, menu khusus di header dan halaman /acquisition di setiap situs, dalam bahasa situs itu. Perubahan tampil dalam ±5 menit.
        </p>
      </div>
      {!storage && <p className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger">Penyimpanan R2 sedang tidak aktif di akun Cloudflare — pengaturan dan penawaran belum bisa disimpan.</p>}
      {msg && <p className={`rounded-lg px-4 py-2 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`} role="status">{msg.text}</p>}

      <section className="rounded-2xl border border-(--color-border) p-5">
        <h3 className="font-heading text-lg">Harga setiap situs</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2" data-testid="admin-sale-sites">
          {sites.map((r) => (
            <div key={r.site} className="rounded-xl border border-(--color-border) p-4" data-testid={`admin-sale-site-${r.site}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a href={`https://${r.domain}/acquisition`} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">{r.domain} ↗</a>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.terms.visible ? "bg-success/15 text-success" : "bg-black/10 text-text-secondary"}`}>
                  {r.terms.visible ? "Tampil di situs" : "Disembunyikan"}
                </span>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">Harga (US$)<input className={input} inputMode="numeric" value={r.terms.priceUsd} onChange={(e) => setSite(r.site, { priceUsd: num(e.target.value) })} data-testid={`admin-sale-price-${r.site}`} /></label>
                <label className="block text-sm font-medium">Penawaran minimum (US$)<input className={input} inputMode="numeric" value={r.terms.minOfferUsd} onChange={(e) => setSite(r.site, { minOfferUsd: num(e.target.value) })} /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={r.terms.negotiable} onChange={(e) => setSite(r.site, { negotiable: e.target.checked })} /> Bisa nego</label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent dark:text-primary" disabled={busy} onClick={() => save(r.site, { priceUsd: r.terms.priceUsd, minOfferUsd: r.terms.minOfferUsd, negotiable: r.terms.negotiable }, `${r.domain}: harga disimpan.`)} data-testid={`admin-sale-save-${r.site}`}>
                  Simpan
                </button>
                <button
                  className="rounded-full border border-(--color-border) px-4 py-1.5 text-sm hover:border-accent disabled:opacity-50"
                  disabled={busy}
                  onClick={() => {
                    if (confirm(r.terms.visible ? `Sembunyikan penjualan ${r.domain}? Pita beranda, menu header dan halaman /acquisition situs itu hilang.` : `Tampilkan penjualan ${r.domain}?`))
                      save(r.site, { visible: !r.terms.visible }, r.terms.visible ? `${r.domain}: penjualan disembunyikan.` : `${r.domain}: penjualan ditampilkan.`);
                  }}
                  data-testid={`admin-sale-toggle-${r.site}`}
                >
                  {r.terms.visible ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) p-5">
        <h3 className="font-heading text-lg">Kontak & live Makkah — dipakai kelima situs</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">WhatsApp pemilik<input className={input} value={hub.whatsapp} onChange={(e) => setHub({ ...hub, whatsapp: e.target.value })} placeholder="+62…" /></label>
          <label className="block text-sm font-medium">E-mail penerima penawaran<input className={input} type="email" value={hub.email} onChange={(e) => setHub({ ...hub, email: e.target.value })} /></label>
          <label className="block text-sm font-medium sm:col-span-2">
            Tautan YouTube live Makkah 24 jam
            <input className={input} value={hub.makkahLiveUrl} onChange={(e) => setHub({ ...hub, makkahLiveUrl: e.target.value })} placeholder="https://www.youtube.com/channel/UC… atau https://www.youtube.com/watch?v=…" data-testid="admin-sale-live" />
            <span className="mt-1 block text-xs text-text-secondary">Kosongkan untuk memakai kanal Masjidil Haram yang diatur di tab 📡 Kanal live dunia (siaran yang sedang tayang dipilih otomatis).</span>
          </label>
        </div>
        <button className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-accent dark:text-primary" disabled={busy} onClick={() => save("ulyah", { whatsapp: hub.whatsapp, email: hub.email, makkahLiveUrl: hub.makkahLiveUrl }, "Kontak dan live Makkah disimpan.")} data-testid="admin-sale-save">
          Simpan
        </button>
      </section>

      <section className="rounded-2xl border border-(--color-border) p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-lg">Penawaran masuk ({shown.length})</h3>
          <select className="rounded-lg border border-(--color-border) bg-(--color-bg) px-2 py-1.5 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Saring per situs" data-testid="admin-sale-filter">
            <option value="all">Semua situs</option>
            {sites.map((s) => <option key={s.site} value={s.site}>{s.domain}</option>)}
          </select>
        </div>
        {best > 0 && <p className="mt-1 text-sm text-text-secondary">Penawaran tertinggi yang masih aktif: <b className="text-text-primary">{usd(best)}</b></p>}
        {!shown.length ? (
          <p className="mt-3 text-sm text-text-secondary">Belum ada penawaran.</p>
        ) : (
          <div className="mt-4 space-y-4" data-testid="admin-sale-offers">
            {shown.map((o) => (
              <div key={o.id} className="rounded-xl border border-(--color-border) p-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="mr-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">{domainOf(o.site)}</span>
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
                {String(l.at ?? "").slice(0, 16).replace("T", " ")} · {String(l.by ?? "")} ·{" "}
                {l.action === "settings" ? `${domainOf(String(l.site ?? "ulyah"))}: ${JSON.stringify(l.changes ?? {})}` : `penawaran ${String(l.id ?? "")} → ${String(l.status ?? "")}`}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
