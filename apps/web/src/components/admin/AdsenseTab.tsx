"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SiteState {
  enabled: boolean;
  approved: boolean;
}
interface Config {
  clientId: string;
  slots: Record<string, string>;
  sites: Record<string, SiteState>;
}

// One responsive unit id can drive every placement the network uses.
const PLACEMENTS = ["in_article", "in_article_1", "in_article_2", "list", "footer", "sidebar"];

const SITE_LABELS: { key: string; label: string; group: "ulyah" | "axto" | "es" }[] = [
  { key: "ulyah", label: "ulyah.com", group: "ulyah" },
  { key: "1fr", label: "1fr.fr", group: "ulyah" },
  { key: "tilawa", label: "tilawa.de", group: "ulyah" },
  { key: "dawa", label: "dawa.es", group: "ulyah" },
  // xad.es reads its ad config as tenant "xad" (TENANT.id) — without this row
  // the English ecosystem site could never be switched on from the admin.
  { key: "xad", label: "xad.es", group: "ulyah" },
  { key: "axto-io", label: "axto.io", group: "axto" },
  { key: "axto-dev", label: "axto.dev", group: "axto" },
  { key: "axto-us", label: "axto.us", group: "axto" },
  { key: "profity-in", label: "profity.in", group: "es" },
  { key: "oldco-in", label: "oldco.in", group: "es" },
  { key: "xaa-es", label: "xaa.es", group: "es" },
  { key: "xad-es", label: "xad.es (lama)", group: "es" },
  { key: "jai-lat", label: "jai.lat", group: "es" },
  { key: "lie-skin", label: "lie.skin", group: "es" },
];

function coerce(v: unknown): SiteState {
  if (typeof v === "boolean") return { enabled: v, approved: false };
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return { enabled: o.enabled === true, approved: o.approved === true };
  }
  return { enabled: false, approved: false };
}

/**
 * Central ad control for the WHOLE network — one network now. Adsterra was
 * removed from the ecosystem (owner: "hapus iklan adsterra di ekosistem
 * ulyah.com, ganti dengan adsense aja"), and its master switch and per-site
 * checklist went with it; what is left is the AdSense flow and nothing else.
 *
 * Every site reads /content/ad-config from api.ulyah.com, so what is set here
 * governs all of them: (1) paste the ONE real ad-unit id once; (2) turn a site
 * ON; (3) tick "ACC" on the sites AdSense has approved — only ON + ACC + an id
 * serves ads, so approving one site never switches them all on at once. Ads
 * never appear in any admin.
 */
export function AdsenseTab() {
  const [config, setConfig] = useState<Config | null>(null);
  const [masterId, setMasterId] = useState("");
  const [sites, setSites] = useState<Record<string, SiteState>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<Config>("/admin/adsense-config")
      .then((cfg) => {
        setConfig(cfg);
        setMasterId(cfg.slots?.in_article ?? cfg.slots?.in_article_1 ?? "");
        const s: Record<string, SiteState> = {};
        for (const { key } of SITE_LABELS) s[key] = coerce(cfg.sites?.[key]);
        setSites(s);
      })
      .catch(() => {});
  }, []);

  // The one write path. Persists an EXPLICIT sites snapshot so an auto-save
  // never races React's async state (using the closure `sites` right after
  // setSites would post the STALE value). Every toggle calls this, so a change
  // is saved the instant it's made — no "refresh reverts it".
  async function persist(nextSites: Record<string, SiteState>) {
    setBusy(true);
    const id = masterId.replace(/[^0-9]/g, "").slice(0, 20);
    const slots: Record<string, string> = {};
    for (const p of PLACEMENTS) slots[p] = id;
    try {
      const next = await api.post<Config>("/admin/adsense-config", { slots, sites: nextSites });
      setConfig(next);
      const s: Record<string, SiteState> = {};
      for (const { key } of SITE_LABELS) s[key] = coerce(next.sites?.[key]);
      setSites(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setBusy(false);
    }
  }

  // The explicit "Simpan" button (also saves the typed ad-unit id).
  function save() {
    return persist(sites);
  }

  // Each toggle computes the next snapshot, updates the UI, AND auto-saves it.
  function toggle(key: string) {
    const next = { ...sites, [key]: { ...coerce(sites[key]), enabled: !coerce(sites[key]).enabled } };
    setSites(next);
    persist(next);
  }
  function toggleApproved(key: string) {
    const next = { ...sites, [key]: { ...coerce(sites[key]), approved: !coerce(sites[key]).approved } };
    setSites(next);
    persist(next);
  }
  function setAll(field: "enabled" | "approved", v: boolean) {
    const next = { ...sites };
    for (const { key } of SITE_LABELS) next[key] = { ...coerce(next[key]), [field]: v };
    setSites(next);
    persist(next);
  }

  if (!config) return <p className="text-sm text-text-secondary">Memuat…</p>;

  const hasRealId = !!masterId.replace(/[^0-9]/g, "");
  const onCount = SITE_LABELS.filter(({ key }) => coerce(sites[key]).enabled).length;
  const liveCount = SITE_LABELS.filter(({ key }) => coerce(sites[key]).enabled && coerce(sites[key]).approved).length;
  const labelOf = (key: string) => SITE_LABELS.find((s) => s.key === key)?.label ?? key;
  const groupIcon = (g: string) => (g === "axto" ? "🛰️" : g === "es" ? "📰" : "🕌");

  // Sites the owner has fully approved but that cannot serve a single ad,
  // because no unit id has been pasted. This is the one failure mode that looks
  // like success from here: every switch is green and the site shows nothing.
  const blockedByMissingId = hasRealId
    ? []
    : SITE_LABELS.filter(({ key }) => coerce(sites[key]).enabled && coerce(sites[key]).approved);

  // The five ecosystem sites used to carry Adsterra whatever their AdSense
  // state. With that network gone, a site that is not ON + ACC now shows
  // NOTHING — which is correct (we may not serve AdSense on a domain Google has
  // not accepted) but is a change worth seeing rather than discovering in the
  // earnings report.
  const ECOSYSTEM = ["ulyah", "1fr", "tilawa", "dawa", "xad"];
  const silent = ECOSYSTEM.filter((k) => {
    const st = coerce(sites[k]);
    return !(st.enabled && st.approved && hasRealId);
  });

  return (
    <div className="space-y-6">
      {silent.length > 0 && (
        <section className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4">
          <p className="font-heading text-base">ℹ️ Situs ekosistem yang belum menayangkan iklan</p>
          <p className="mt-1 text-sm text-text-secondary">
            Adsterra sudah dicabut, jadi sekarang setiap situs bergantung sepenuhnya pada AdSense.{" "}
            <b>{silent.map((k) => labelOf(k)).join(", ")}</b> belum menayangkan iklan apa pun karena belum{" "}
            <b>ON + ACC</b>{hasRealId ? "" : " dan ID unit iklan masih kosong"}. Ini memang benar — AdSense tidak boleh
            ditayangkan di domain yang belum diterima Google — tapi artinya situs itu untuk sementara tanpa iklan.
            Daftarkan domainnya di AdSense, lalu centang ACC di sini begitu diterima.
          </p>
        </section>
      )}
      {blockedByMissingId.length > 0 && (
        <section className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
          <p className="font-heading text-base">⚠️ ID unit iklan masih kosong</p>
          <p className="mt-1 text-sm text-text-secondary">
            {blockedByMissingId.map((s) => s.label).join(", ")} sudah <b>ON + ACC</b>, tapi AdSense tidak bisa
            menayangkan apa pun tanpa ID unit. Ambil ID unit iklan responsif dari dashboard AdSense (angka saja),
            tempel di kotak <b>“1 · ID Unit Iklan AdSense”</b> di bawah, lalu simpan — iklan langsung tayang di situs
            itu dalam ≤1 menit.
          </p>
        </section>
      )}
      <section className="rounded-xl border border-(--color-border) bg-(--color-card) p-4">
        <p className="font-heading text-base">Kontrol Iklan — Google AdSense</p>
        <p className="mt-1 text-sm text-text-secondary">
          <b>Adsterra sudah dihapus dari seluruh ekosistem</b> — sekarang hanya AdSense. Satu tempat mengatur iklan
          untuk <b>seluruh situs</b> (ulyah.com + saudara, AXTO, dan situs artikel:
          profity.in, oldco.in, xaa.es, xad.es, jai.lat, lie.skin). Bawaan semua <b>mati</b>. Isi ID unit iklan sekali,
          nyalakan situsnya, lalu <b>centang “ACC”</b> hanya pada situs yang sudah diterima AdSense — cuma situs
          ON + ACC + ada ID yang menayangkan iklan. Iklan tidak pernah muncul di portal admin.
        </p>
        <p className="mt-2 rounded-lg bg-black/5 px-3 py-2 text-xs text-text-secondary dark:bg-white/5">
          <b>Mau lihat posisi iklannya dulu?</b> Tambahkan <code className="rounded-sm bg-black/10 px-1">?ads=preview</code>{" "}
          di URL halaman mana pun (mis. <code className="rounded-sm bg-black/10 px-1">dawa.es/libros?ads=preview</code>) —
          kotak putus-putus penanda posisi hanya muncul untuk Anda, bukan untuk pengunjung. Dulu penanda ini tampil ke
          semua orang di situs yang ON tapi belum ACC; sekarang tidak lagi.
        </p>
      </section>

      <section className="rounded-xl border border-(--color-border) bg-(--color-card) p-4">
        <p className="font-heading text-base">1 · ID Unit Iklan AdSense</p>
        <p className="mt-0.5 text-xs text-text-secondary">
          Publisher: <code className="rounded-sm bg-black/10 px-1">{config.clientId}</code>. Tempel ID unit iklan
          responsif (angka saja) — dipakai semua posisi (in-article, sidebar, footer, dst.) di semua situs yang ACC.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={masterId}
            onChange={(e) => setMasterId(e.target.value)}
            placeholder="mis. 1234567890"
            inputMode="numeric"
            className="w-52 rounded-lg border border-(--color-border) bg-transparent px-3 py-2 text-sm"
          />
          <span
            className={`rounded-full px-2.5 py-1 text-xs ${hasRealId ? "bg-success/15 text-success" : "bg-black/10 text-text-secondary"}`}
          >
            {hasRealId ? "● Ada ID — situs ON+ACC menayangkan iklan asli" : "○ Belum ada ID — situs ON tampil pratinjau"}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-(--color-border) bg-(--color-card) p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-heading text-base">2 · Aktif (tampil) & ACC (iklan asli) per Situs</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={() => setAll("enabled", true)} disabled={busy} className="rounded-full border border-(--color-border) px-3 py-1 hover:border-accent disabled:opacity-50">
              Semua ON
            </button>
            <button onClick={() => setAll("enabled", false)} disabled={busy} className="rounded-full border border-(--color-border) px-3 py-1 hover:border-accent disabled:opacity-50">
              Semua OFF
            </button>
            <button onClick={() => setAll("approved", false)} disabled={busy} className="rounded-full border border-(--color-border) px-3 py-1 hover:border-accent disabled:opacity-50">
              Hapus semua ACC
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SITE_LABELS.map(({ key, label, group }) => {
            const st = coerce(sites[key]);
            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                  st.enabled ? "border-accent bg-accent/10" : "border-(--color-border)"
                }`}
              >
                <button onClick={() => toggle(key)} disabled={busy} className="flex items-center gap-2 text-left disabled:opacity-60">
                  <span>{groupIcon(group)} {label}</span>
                  <span className={st.enabled ? "font-medium text-accent" : "text-text-secondary"}>
                    {st.enabled ? "ON" : "OFF"}
                  </span>
                </button>
                <label className={`flex cursor-pointer items-center gap-1.5 text-xs ${st.enabled ? "" : "opacity-40"}`}>
                  <input
                    type="checkbox"
                    checked={st.approved}
                    disabled={!st.enabled || busy}
                    onChange={() => toggleApproved(key)}
                    className="h-4 w-4 accent-accent"
                  />
                  ACC
                  {st.enabled && st.approved && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        hasRealId ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                      }`}
                      title={hasRealId ? "Menayangkan iklan AdSense" : "ACC, tapi ID unit iklan masih kosong"}
                    >
                      {hasRealId ? "LIVE" : "butuh ID"}
                    </span>
                  )}
                </label>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-text-secondary/70">
          {onCount} situs aktif · {liveCount} situs menayangkan iklan asli.
        </p>
      </section>

      <button
        onClick={() => save()}
        disabled={busy}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm text-white disabled:opacity-60 dark:bg-accent dark:text-primary"
      >
        {saved ? "Tersimpan ✓ — berlaku ≤1 menit di semua situs" : busy ? "Menyimpan…" : "Simpan ID unit iklan (sakelar ON/OFF sudah otomatis tersimpan)"}
      </button>
    </div>
  );
}
