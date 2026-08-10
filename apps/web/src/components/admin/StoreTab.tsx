"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DEPARTMENTS, searchUrl } from "@/lib/store";
import { shelfPresets } from "@/lib/store-presets";

/**
 * Toko Amazon — kategori, bukan produk satu-satu.
 *
 * Produknya tidak disimpan di sini, dan itu memang rancangannya. Amazon
 * melarang scraping halaman mereka, dan Product Advertising API baru terbuka
 * setelah tiga penjualan — jadi tidak ada cara sah menyimpan ribuan produk hari
 * ini. Yang disimpan adalah RAK: nama kategori dan penjelasan yang Anda tulis
 * sendiri, menunjuk ke pencarian Amazon yang sudah tersaring. Pembeli memilih
 * dari ribuan produk, di Amazon.
 *
 * Menyalin deskripsi bawaan Amazon tetap tidak akan membantu meski diizinkan:
 * teks itu identik di ribuan situs afiliasi, dan Google menganggapnya konten
 * bernilai rendah. Kalimat yang ANDA tulis tentang sebuah kategori tidak ada di
 * situs lain mana pun — itulah satu-satunya bagian halaman ini yang bernilai
 * bagi mesin pencari, dan karena itu wajib diisi.
 */

const MARKETPLACES = [
  { id: "com", site: "xad.es", lang: "Inggris", amazon: "amazon.com" },
  { id: "fr", site: "1fr.fr", lang: "Prancis", amazon: "amazon.fr" },
  { id: "de", site: "tilawa.de", lang: "Jerman", amazon: "amazon.de" },
  { id: "es", site: "dawa.es", lang: "Spanyol", amazon: "amazon.es" },
];

interface Shelf {
  id: number;
  marketplace: string;
  slug: string;
  label: string;
  blurb: string;
  keywords: string;
  department: string | null;
  icon: string | null;
  detail: string | null;
  sort_order: number;
  enabled: number;
}

const blank = { label: "", blurb: "", keywords: "", department: "", icon: "" };

export function StoreTab() {
  const [tags, setTags] = useState<Record<string, string>>({});
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [market, setMarket] = useState("com");
  const [draft, setDraft] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  // Which shelf's buying guide is open for editing, and the text being edited.
  const [editing, setEditing] = useState<number | null>(null);
  const [guide, setGuide] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await api.get<{ tags: { marketplace: string; tag: string }[]; shelves: Shelf[] }>(
        "/admin/store"
      );
      const t: Record<string, string> = {};
      for (const row of r.tags) t[row.marketplace] = row.tag;
      setTags(t);
      setShelves(r.shelves);
    } catch {
      setNote("Gagal memuat data toko.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveTag(marketplace: string, value: string) {
    setBusy(true);
    setNote(null);
    try {
      await api.post("/admin/store/tag", { marketplace, tag: value });
      setNote(value ? "✓ Tag tersimpan." : "Tag dihapus — toko situs itu ikut mati.");
      load();
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function add() {
    setBusy(true);
    setNote(null);
    try {
      await api.post("/admin/store/shelf", { marketplace: market, ...draft });
      setDraft(blank);
      setNote("✓ Kategori ditambahkan.");
      load();
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  /**
   * Add the ready-made set for this marketplace, skipping anything already
   * there. Written for the owner so he does not have to write it himself —
   * dropping the text instead was not an option: a category page with no words
   * of its own is the "little or no added value" pattern that puts both AdSense
   * and search ranking at risk.
   */
  async function addPresets() {
    const presets = shelfPresets(market);
    const have = new Set(mine.map((s) => s.label.toLowerCase()));
    const todo = presets.filter((p) => !have.has(p.label.toLowerCase()));
    if (todo.length === 0) {
      setNote("Semua kategori bawaan sudah terpasang.");
      return;
    }
    setBusy(true);
    setNote(null);
    let added = 0;
    for (const p of todo) {
      try {
        await api.post("/admin/store/shelf", { marketplace: market, ...p });
        added++;
      } catch {
        // A duplicate or a rejected row must not stop the rest.
      }
    }
    setNote(`✓ ${added} kategori ditambahkan.`);
    setBusy(false);
    load();
  }

  /**
   * The buying guide. Writing one is what gives a category its own page — the
   * page is conditional on the text existing, so that a category with nothing
   * to say never becomes a thin page in the sitemap. 400 characters is the
   * floor, enforced by the api as well as here.
   */
  async function saveGuide(id: number) {
    setBusy(true);
    setNote(null);
    try {
      await api.patch(`/admin/store/shelf/${id}`, { detail: guide });
      setNote(
        guide.trim().length >= 400
          ? "✓ Panduan tersimpan — kategori ini sekarang punya halaman sendiri."
          : "Panduan dikosongkan — kategori ini kembali menautkan langsung ke Amazon."
      );
      setEditing(null);
      load();
    } catch (e) {
      setNote((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggle(s: Shelf) {
    await api.patch(`/admin/store/shelf/${s.id}`, { enabled: !s.enabled });
    load();
  }

  async function remove(id: number) {
    await api.del(`/admin/store/shelf/${id}`);
    load();
  }

  const mine = shelves.filter((s) => s.marketplace === market);
  const current = MARKETPLACES.find((m) => m.id === market)!;
  const hasTag = Boolean(tags[market]);

  return (
    <section className="space-y-5">
      <div>
        <p className="font-heading text-base">🛒 Toko Amazon</p>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          Yang Anda buat di sini adalah <b>kategori</b>, bukan produk satu per satu. Tiap kategori membuka pencarian
          Amazon yang sudah tersaring — pembeli memilih sendiri dari ribuan produk di sana. Nama dan penjelasan
          ditulis dalam <b>bahasa marketplace-nya</b>. <b>ulyah.com tidak punya toko</b>: Amazon tidak beroperasi di
          Indonesia.
        </p>
        <p className="mt-2 rounded-lg border border-sky-500/40 bg-sky-500/6 p-3 text-xs leading-relaxed">
          <b>Kenapa bukan deskripsi bawaan Amazon:</b> teks itu identik di ribuan situs afiliasi lain, dan Google
          menganggapnya konten duplikat bernilai rendah — bukan menaikkan SEO, tapi menurunkannya. Kalimat yang{" "}
          <b>Anda tulis sendiri</b> tentang sebuah kategori tidak ada di situs mana pun, dan itulah satu-satunya
          bagian halaman ini yang benar-benar dihitung mesin pencari.
        </p>
        <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/6 p-3 text-xs leading-relaxed">
          <b>Aturan isi:</b> hanya kategori produk <b>fisik</b> yang halal. Tidak ada produk digital, pornografi,
          judi, forex, atau indeks/trading. Sistem tidak bisa memeriksa ini dari kata kunci — Anda yang memutuskan.
        </p>
        {note && <p className="mt-2 text-xs text-accent">{note}</p>}
      </div>

      {/* Tag per marketplace */}
      <div className="rounded-xl border border-(--color-border) bg-(--color-card) p-4">
        <p className="font-heading text-sm">Tag Associates per marketplace</p>
        <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
          <code>ulyah-20</code> hanya berlaku di <b>amazon.com</b>. amazon.fr/de/es butuh akun Associates Eropa
          sendiri. Marketplace tanpa tag <b>tidak menampilkan toko sama sekali</b> — mengirim pengunjung ke Amazon
          tanpa tag berarti memberi trafik gratis.
        </p>
        <div className="mt-3 grid gap-2 desktop:grid-cols-2">
          {MARKETPLACES.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 text-text-secondary">
                {m.site}
                <span className="ml-1 opacity-60">({m.amazon})</span>
              </span>
              <input
                defaultValue={tags[m.id] ?? ""}
                placeholder="tag-20"
                onBlur={(e) => {
                  if (e.target.value.trim() !== (tags[m.id] ?? "")) saveTag(m.id, e.target.value.trim());
                }}
                className="flex-1 rounded-lg border border-(--color-border) bg-transparent px-2 py-1.5"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Pilih situs */}
      <div className="flex flex-wrap gap-1.5">
        {MARKETPLACES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMarket(m.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              market === m.id
                ? "bg-accent text-white"
                : "border border-(--color-border) text-text-secondary"
            }`}
          >
            {m.site}
            <span className="ml-1 opacity-70">{shelves.filter((s) => s.marketplace === m.id).length}</span>
            {!tags[m.id] && (
              <span className="ml-1" title="Belum ada tag — toko ini tidak tampil">
                ⚠
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tambah kategori */}
      <div className="rounded-xl border border-(--color-border) bg-(--color-card) p-4">
        <p className="font-heading text-sm">
          Tambah kategori ke {current.site}{" "}
          <span className="font-normal text-text-secondary">
            — semuanya ditulis dalam bahasa {current.lang}
          </span>
        </p>
        {!hasTag && (
          <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
            Isi tag {current.amazon} dulu, kalau tidak toko ini tidak akan tampil di situsnya.
          </p>
        )}
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <input
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              placeholder="📖"
              className="w-16 rounded-lg border border-(--color-border) bg-transparent px-2 py-1.5 text-center text-xs"
            />
            <input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder={`Nama kategori (bahasa ${current.lang})`}
              className="min-w-56 flex-1 rounded-lg border border-(--color-border) bg-transparent px-2 py-1.5 text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={draft.keywords}
              onChange={(e) => setDraft({ ...draft, keywords: e.target.value })}
              placeholder={`Kata kunci pencarian di ${current.amazon} (bahasa ${current.lang})`}
              className="min-w-56 flex-1 rounded-lg border border-(--color-border) bg-transparent px-2 py-1.5 text-xs"
            />
            <select
              value={draft.department}
              onChange={(e) => setDraft({ ...draft, department: e.target.value })}
              className="rounded-lg border border-(--color-border) bg-(--color-card) px-2 py-1.5 text-xs"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={draft.blurb}
            onChange={(e) => setDraft({ ...draft, blurb: e.target.value })}
            rows={3}
            placeholder={`Penjelasan kategori — minimal 40 karakter, bahasa ${current.lang}`}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-2 py-1.5 text-xs"
          />
          {draft.keywords && (
            <p className="truncate text-[11px] text-text-secondary">
              Pratinjau tautan:{" "}
              <code>{searchUrl(market, draft.keywords, tags[market] || "TAG", draft.department)}</code>
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={add}
              disabled={busy}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              Tambahkan kategori
            </button>
            <button
              onClick={addPresets}
              disabled={busy}
              className="rounded-lg border border-(--color-border) px-4 py-2 text-xs font-bold disabled:opacity-40"
              title="Pasang set kategori siap pakai untuk situs ini"
            >
              ⚡ Pasang {shelfPresets(market).length} kategori bawaan
            </button>
          </div>
        </div>
      </div>

      {/* Daftar */}
      {mine.length === 0 ? (
        <p className="text-xs text-text-secondary">Belum ada kategori untuk {current.site}.</p>
      ) : (
        <ul className="space-y-2">
          {mine.map((s) => (
            <li
              key={s.id}
              className={`rounded-xl border p-3 ${
                s.enabled
                  ? "border-(--color-border) bg-(--color-card)"
                  : "border-(--color-border) bg-transparent opacity-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-heading text-sm">
                    {s.icon && <span className="mr-1">{s.icon}</span>}
                    {s.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">{s.blurb}</p>
                  <p className="mt-1 truncate text-[11px] text-text-secondary">
                    🔍 <code>{s.keywords}</code>
                    {s.department && <> · {DEPARTMENTS.find((d) => d.value === s.department)?.label ?? s.department}</>}
                  </p>
                  <p className="mt-1 text-[11px]">
                    {s.detail ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        📄 Punya halaman sendiri · {s.detail.length} karakter
                      </span>
                    ) : (
                      <span className="text-text-secondary">
                        Tanpa panduan — kartu ini menautkan langsung ke Amazon
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setEditing(editing === s.id ? null : s.id);
                      setGuide(s.detail ?? "");
                    }}
                    className="rounded-lg border border-(--color-border) px-2 py-1 text-[11px]"
                  >
                    {s.detail ? "Edit panduan" : "Tulis panduan"}
                  </button>
                  <button
                    onClick={() => toggle(s)}
                    className="rounded-lg border border-(--color-border) px-2 py-1 text-[11px]"
                  >
                    {s.enabled ? "Sembunyikan" : "Tampilkan"}
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="rounded-lg border border-red-500/40 px-2 py-1 text-[11px] text-red-500"
                  >
                    Hapus
                  </button>
                </div>
              </div>

              {editing === s.id && (
                <div className="mt-3 border-t border-(--color-border) pt-3">
                  <p className="text-[11px] leading-relaxed text-text-secondary">
                    Panduan beli dalam <b>bahasa {current.lang}</b>: apa yang perlu diperhatikan, ukuran, bahan,
                    kesalahan yang sering terjadi. Menulis <b>minimal 400 karakter</b> membuat kategori ini punya
                    halaman sendiri yang masuk sitemap. Mengosongkannya menghapus halaman itu lagi. Pisahkan paragraf
                    dengan baris kosong.
                  </p>
                  <textarea
                    value={guide}
                    onChange={(e) => setGuide(e.target.value)}
                    rows={10}
                    className="mt-2 w-full rounded-lg border border-(--color-border) bg-transparent px-2 py-1.5 text-xs leading-relaxed"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => saveGuide(s.id)}
                      disabled={busy}
                      className="rounded-lg bg-accent px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40"
                    >
                      Simpan panduan
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-lg border border-(--color-border) px-3 py-1.5 text-[11px]"
                    >
                      Batal
                    </button>
                    <span
                      className={`text-[11px] ${
                        guide.trim().length >= 400
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-text-secondary"
                      }`}
                    >
                      {guide.trim().length} / 400
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
