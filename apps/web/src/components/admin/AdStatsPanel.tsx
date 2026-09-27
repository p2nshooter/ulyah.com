"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { TENANT } from "@/lib/tenant";

/**
 * How often the ads were shown, filled and clicked — and what that is probably
 * worth — for every site in the ecosystem.
 *
 * Owner: "buatkan berapa kali tampil di seluruh pengunjung dan brp kali d klik
 * serta perkiraan pendapatan AdSense … ini berlaku di ekosistem ulyah.com
 * walaupun belum di acc … semua settingan tampil di masing2 situs tp seluruhnya
 * tampil di ulyah.com sebagai control pusat."
 *
 * So: on ulyah.com this shows all five sites side by side; on a sibling's own
 * admin, only that site. There is nothing to configure — the units run
 * everywhere and this only reads what the pages reported.
 *
 * WHICH SITES ARE LIVE is read from the data, not from a setting: a site whose
 * units were FILLED in the period has been approved by Google, because nothing
 * else fills them. That is what keeps "no settings" true here as well.
 *
 * THE REVENUE IS AN ESTIMATE and says so. Impressions come from AdSense's own
 * `data-ad-status`; clicks from focus moving into the ad (see ad-stats.ts); the
 * money from an assumed RPM per market, listed at the bottom of the panel. The
 * AdSense dashboard is the authority — this exists to put the whole ecosystem,
 * including the sites AdSense does not report yet, on one page.
 */

interface Row {
  site: string;
  day: string;
  banner_shown: number;
  banner_filled: number;
  banner_clicked: number;
  flex_shown: number;
  flex_filled: number;
  flex_clicked: number;
}

interface Totals {
  shown: number;
  filled: number;
  clicked: number;
  bannerShown: number;
  bannerFilled: number;
  bannerClicked: number;
  flexShown: number;
  flexFilled: number;
  flexClicked: number;
}

const SITES: { id: string; name: string; domain: string; market: string }[] = [
  { id: "ulyah", name: "ULYAH.COM", domain: "ulyah.com", market: "Indonesia" },
  { id: "1fr", name: "One Faith France", domain: "1fr.fr", market: "Prancis" },
  { id: "tilawa", name: "Tilawa", domain: "tilawa.de", market: "Jerman" },
  { id: "dawa", name: "Dawa", domain: "dawa.es", market: "Spanyol / Amerika Latin" },
  { id: "xad", name: "XAD", domain: "xad.es", market: "Inggris / global" },
];

/** ulyah.com is the central control and sees every site; a sibling sees itself.
 *  The tenant is fixed at build time, so this is decided once. */
const CENTRAL = TENANT.id === "ulyah";
const VISIBLE_SITES = CENTRAL ? SITES : SITES.filter((s) => s.id === TENANT.id);

/**
 * Assumed RPM — US$ earned per 1,000 FILLED impressions — per market.
 *
 * These are deliberately conservative assumptions for Islamic, educational
 * content, NOT figures from the account. They are printed under the table so
 * nobody reads the estimate as a statement from Google; once a site has a few
 * weeks of real AdSense revenue, replace its number here with the RPM the
 * dashboard reports and the estimate becomes a forecast from the account's own
 * history.
 */
const ASSUMED_RPM_USD: Record<string, number> = {
  ulyah: 0.3,
  "1fr": 1.0,
  tilawa: 1.2,
  dawa: 0.8,
  xad: 1.5,
};

/** Used for a site's POTENTIAL until the approved sites give a real fill rate. */
const DEFAULT_FILL_RATE = 0.6;

const PERIODS = [
  { days: 7, label: "7 hari" },
  { days: 30, label: "30 hari" },
  { days: 90, label: "90 hari" },
] as const;

const compact = new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("id-ID");
const usd = (n: number) =>
  `US$${n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (num: number, den: number) =>
  den > 0 ? `${((num / den) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%` : "—";

function emptyTotals(): Totals {
  return {
    shown: 0,
    filled: 0,
    clicked: 0,
    bannerShown: 0,
    bannerFilled: 0,
    bannerClicked: 0,
    flexShown: 0,
    flexFilled: 0,
    flexClicked: 0,
  };
}

function add(t: Totals, r: Row): void {
  t.bannerShown += r.banner_shown;
  t.bannerFilled += r.banner_filled;
  t.bannerClicked += r.banner_clicked;
  t.flexShown += r.flex_shown;
  t.flexFilled += r.flex_filled;
  t.flexClicked += r.flex_clicked;
  t.shown += r.banner_shown + r.flex_shown;
  t.filled += r.banner_filled + r.flex_filled;
  t.clicked += r.banner_clicked + r.flex_clicked;
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-card) p-4">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-text-secondary">{sub}</p>}
    </div>
  );
}

export function AdStatsPanel() {
  const [days, setDays] = useState<number>(30);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setRows(null);
    setFailed(false);
    api
      .get<{ rows: Row[] }>(`/admin/ad-stats?days=${days}`)
      .then((r) => alive && setRows(r.rows ?? []))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [days]);

  const central = CENTRAL;
  const sites = VISIBLE_SITES;

  const view = useMemo(() => {
    const bySite = new Map<string, Totals>();
    for (const s of sites) bySite.set(s.id, emptyTotals());
    for (const r of rows ?? []) {
      const t = bySite.get(r.site);
      if (t) add(t, r);
    }
    const all = emptyTotals();
    for (const t of bySite.values()) {
      all.shown += t.shown;
      all.filled += t.filled;
      all.clicked += t.clicked;
      all.bannerShown += t.bannerShown;
      all.bannerFilled += t.bannerFilled;
      all.bannerClicked += t.bannerClicked;
      all.flexShown += t.flexShown;
      all.flexFilled += t.flexFilled;
      all.flexClicked += t.flexClicked;
    }
    // The fill rate the POTENTIAL of a waiting site is estimated with: what the
    // approved sites actually achieve, once there is any.
    let liveShown = 0;
    let liveFilled = 0;
    for (const t of bySite.values()) {
      if (t.filled > 0) {
        liveShown += t.shown;
        liveFilled += t.filled;
      }
    }
    const fillRate = liveShown > 0 ? liveFilled / liveShown : DEFAULT_FILL_RATE;

    let earned = 0;
    let potential = 0;
    const perSite = sites.map((s) => {
      const t = bySite.get(s.id)!;
      const rpm = ASSUMED_RPM_USD[s.id] ?? 0.5;
      const live = t.filled > 0;
      const est = live ? (t.filled / 1000) * rpm : (t.shown * fillRate * rpm) / 1000;
      if (live) earned += est;
      else potential += est;
      return { site: s, t, live, est, rpm };
    });
    return { all, perSite, earned, potential, fillRate };
  }, [rows]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-base">
          💰 Iklan AdSense {central ? "— seluruh ekosistem" : `— ${sites[0]?.domain ?? ""}`}
        </p>
        <div className="flex gap-1" role="group" aria-label="Periode">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              aria-pressed={days === p.days}
              className={`rounded-lg border px-3 py-1 text-xs transition ${
                days === p.days
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-(--color-border) text-text-secondary hover:border-accent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {failed && <p className="text-sm text-text-secondary">Data iklan belum bisa dimuat — coba lagi sebentar.</p>}
      {!rows && !failed && <p className="text-sm text-text-secondary">Memuat…</p>}

      {rows && (
        <>
          <div className="grid grid-cols-2 gap-3 desktop:grid-cols-4">
            <Tile label="Iklan tampil ke pengunjung" value={compact.format(view.all.shown)} sub={`${whole.format(view.all.shown)} unit`} />
            <Tile
              label="Terisi iklan (tayangan dibayar)"
              value={compact.format(view.all.filled)}
              sub={`tingkat isi ${pct(view.all.filled, view.all.shown)}`}
            />
            <Tile label="Klik (perkiraan)" value={compact.format(view.all.clicked)} sub={`CTR ${pct(view.all.clicked, view.all.filled)}`} />
            <Tile
              label="Perkiraan pendapatan"
              value={usd(view.earned)}
              sub={view.potential > 0 ? `+ potensi ${usd(view.potential)} dari situs yang menunggu ACC` : "dari situs yang sudah aktif"}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-(--color-border) bg-(--color-card)">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-(--color-border) text-left text-xs text-text-secondary">
                  <th className="px-3 py-2 font-medium">Situs</th>
                  <th className="px-3 py-2 font-medium">Status AdSense</th>
                  <th className="px-3 py-2 text-right font-medium">Tampil</th>
                  <th className="px-3 py-2 text-right font-medium">Terisi</th>
                  <th className="px-3 py-2 text-right font-medium">Isi</th>
                  <th className="px-3 py-2 text-right font-medium">Klik*</th>
                  <th className="px-3 py-2 text-right font-medium">CTR</th>
                  <th className="px-3 py-2 text-right font-medium">Perkiraan</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {view.perSite.map(({ site, t, live, est }) => (
                  <tr key={site.id} className="border-b border-(--color-border) last:border-0">
                    <td className="px-3 py-2">
                      <span className="font-medium">{site.domain}</span>
                      <span className="block text-[11px] text-text-secondary">{site.market}</span>
                    </td>
                    <td className="px-3 py-2 text-xs">{live ? "✅ Aktif — iklan terisi" : "⏳ Menunggu ACC"}</td>
                    <td className="px-3 py-2 text-right">{whole.format(t.shown)}</td>
                    <td className="px-3 py-2 text-right">{whole.format(t.filled)}</td>
                    <td className="px-3 py-2 text-right text-text-secondary">{pct(t.filled, t.shown)}</td>
                    <td className="px-3 py-2 text-right">{whole.format(t.clicked)}</td>
                    <td className="px-3 py-2 text-right text-text-secondary">{pct(t.clicked, t.filled)}</td>
                    <td className="px-3 py-2 text-right">
                      {live ? (
                        usd(est)
                      ) : (
                        <span className="text-text-secondary" title="Jika situs ini sudah di-ACC, dengan tingkat isi situs yang aktif">
                          potensi {usd(est)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Which KIND of position earns — the two units split the page, so
              this is the answer to "is the redesign working". */}
          <div className="grid gap-3 desktop:grid-cols-2">
            <div className="rounded-xl border border-(--color-border) bg-(--color-card) p-4 text-sm">
              <p className="font-heading">Posisi banner — pembuka &amp; penutup</p>
              <p className="text-[11px] text-text-secondary">unit “Horizontal” · 4702981509</p>
              <p className="mt-2 tabular-nums">
                {whole.format(view.all.bannerShown)} tampil · {whole.format(view.all.bannerFilled)} terisi ·{" "}
                {whole.format(view.all.bannerClicked)} klik · CTR {pct(view.all.bannerClicked, view.all.bannerFilled)}
              </p>
            </div>
            <div className="rounded-xl border border-(--color-border) bg-(--color-card) p-4 text-sm">
              <p className="font-heading">Posisi konten — di tengah bacaan</p>
              <p className="text-[11px] text-text-secondary">unit “bebas” · 1209764526</p>
              <p className="mt-2 tabular-nums">
                {whole.format(view.all.flexShown)} tampil · {whole.format(view.all.flexFilled)} terisi ·{" "}
                {whole.format(view.all.flexClicked)} klik · CTR {pct(view.all.flexClicked, view.all.flexFilled)}
              </p>
            </div>
          </div>

          <div className="space-y-1 text-[11px] leading-relaxed text-text-secondary">
            <p>
              <b>Status aktif dibaca dari data</b>: situs yang unitnya pernah terisi iklan berarti sudah di-ACC Google —
              tidak ada pengaturan yang perlu diubah saat ACC datang.
            </p>
            <p>
              *<b>Klik adalah perkiraan</b> dari fokus yang berpindah ke dalam iklan; angka resmi ada di dashboard AdSense.
            </p>
            <p>
              <b>Pendapatan adalah perkiraan</b> = tayangan terisi ÷ 1.000 × RPM asumsi per pasar (
              {SITES.map((s) => `${s.domain} US$${ASSUMED_RPM_USD[s.id]}`).join(" · ")}). Potensi situs yang menunggu
              ACC memakai tingkat isi situs yang sudah aktif ({pct(view.fillRate, 1)}). Bandingkan dengan dashboard
              AdSense lalu sesuaikan RPM-nya di kode bila sudah ada data nyata.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
