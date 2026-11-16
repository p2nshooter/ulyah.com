/** Tampilan Pesan antarlembaga: kotak masuk (grup, japri, tiket) dan ruang obrolan. Teks pesan selalu di-escape. */
import { html, raw, type Raw } from '../lib/html.ts';
import { jamWib, tanggal } from '../lib/text.ts';
import type { UserItem } from '../data/users.ts';
import { LABEL_STATUS_TIKET, type Kotak, type Pesan, type StatusTiket, type Tiket } from '../data/pesan.ts';

const inisial = (n: string) => n.replace(/^(admin|kepala|ketua|super)\s+/i, '').charAt(0).toUpperCase() || '•';
const warnaAvatar = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 6; };
export const lencanaTiket = (s: string) => html`<span class="ps-st ps-st-${s}">${LABEL_STATUS_TIKET[s as StatusTiket] ?? s}</span>`;
const waktu = (t: number) => (tanggal(t) === tanggal(Date.now()) ? jamWib(t) : `${tanggal(t).replace(/ \d{4}$/, '')}, ${jamWib(t)}`);

export function berandaPesan(o: {
  grup: { belum: number; terakhir: Pesan[] }; japri: (Kotak & { belum: boolean })[]; tiketMasuk: (Kotak & { belum: boolean; dn?: string; b?: number })[]; tiketSaya: (Kotak & { belum: boolean; b?: number })[];
  akun: UserItem[]; namaTujuan: (t: string) => string; tujuan: [string, string][]; saya: string;
  /** Pesan dari formulir kontak situs (pengunjung): hanya untuk pengelola lembaga ke atas. */
  pengunjung?: { baru: number; terakhir: { id: string; nama: string; cuplikan: string; kapan: string; baru: boolean }[] };
}): Raw {
  return html`<div class="ps-beranda">
  ${o.pengunjung ? html`<section class="p-kartu ps-pengunjung"><div class="ps-kepala"><h2>Pesan pengunjung${o.pengunjung.baru ? html` <b class="ps-belum">${o.pengunjung.baru}</b>` : ''}</h2><a class="tbl tbl-garis tbl-kecil" href="/portal/k/pesan">Lihat semua →</a></div>
      <p class="p-kecil">Pesan yang dikirim masyarakat lewat formulir „Hubungi kami“ di situs — untuk lembaga Anda.</p>
      ${o.pengunjung.terakhir.length ? html`<ul class="ps-daftar">${o.pengunjung.terakhir.map((k) => html`<li${raw(k.baru ? ' class="belum"' : '')}><a href="/portal/k/pesan/${k.id}"><span class="ps-av ps-av-tamu" aria-hidden="true">✉</span><span class="ps-isi"><strong>${k.nama}</strong><small>${k.cuplikan}</small></span><time>${k.kapan}</time></a></li>`)}</ul>` : html`<p class="p-kecil">Belum ada pesan dari pengunjung.</p>`}
    </section>` : ''}
  <a class="ps-grup p-kartu" href="/portal/pesan/grup">
    <span class="ps-grup-ikon" aria-hidden="true">💬</span>
    <span class="ps-grup-teks"><strong>Grup seluruh lembaga</strong><small>Obrolan bersama semua pengelola Yayasan Al-Huda Yapida · bersih setiap hari, riwayat 14 hari</small>
      ${o.grup.terakhir.length ? html`<span class="ps-cuplik">${o.grup.terakhir.map((p) => html`<span><b>${p.n.split(' ').slice(0, 2).join(' ')}:</b> ${p.x.slice(0, 70)}</span>`)}</span>` : html`<span class="ps-cuplik"><span>Belum ada obrolan hari ini.</span></span>`}</span>
    ${o.grup.belum ? html`<b class="ps-belum">${o.grup.belum}</b>` : ''}
  </a>
  <div class="ps-dua">
    <section class="p-kartu"><div class="ps-kepala"><h2>Japri</h2><span class="p-kecil">Pesan pribadi langsung antar-akun, tersimpan.</span></div>
      <form method="get" action="/portal/pesan/japri" class="ps-baru"><select name="ke" required aria-label="Kirim japri ke"><option value="">Tulis japri ke…</option>${o.akun.filter((a) => a.id !== o.saya && a.aktif).map((a) => html`<option value="${a.id}">${a.nama}</option>`)}</select><button class="tbl tbl-emas tbl-kecil" type="submit">Mulai</button></form>
      ${o.japri.length ? html`<ul class="ps-daftar">${o.japri.map((k) => html`<li${raw(k.belum ? ' class="belum"' : '')}><a href="/portal/pesan/japri/${k.w}"><span class="ps-av av-${warnaAvatar(k.w ?? '')}" aria-hidden="true">${inisial(k.wn ?? '')}</span><span class="ps-isi"><b>${k.wn}</b><small>${k.d === o.saya ? 'Anda: ' : ''}${k.c}</small></span><time>${waktu(k.t)}</time>${k.belum ? html`<i class="ps-titik" aria-label="belum dibaca"></i>` : ''}</a></li>`)}</ul>` : html`<p class="p-kecil">Belum ada japri.</p>`}
    </section>
    <section class="p-kartu"><div class="ps-kepala"><h2>Tiket permintaan</h2><a class="tbl tbl-emas tbl-kecil" href="/portal/pesan/tiket/baru">＋ Buat tiket</a></div>
      <p class="p-kecil">Permintaan resmi ke Super Admin, Ketua/Admin Yayasan, atau pengelola lembaga — tanggal, perihal, dan statusnya tercatat.</p>
      ${o.tiketMasuk.length ? html`<h3 class="ps-sub">Masuk ke Anda</h3><ul class="ps-daftar">${o.tiketMasuk.map((k) => html`<li${raw(k.belum ? ' class="belum"' : '')}><a href="/portal/pesan/tiket/${k.id}"><span class="ps-av ps-av-tiket" aria-hidden="true">🎫</span><span class="ps-isi"><b>${k.p}</b><small>dari ${k.dn ?? ''} · ke ${o.namaTujuan(k.tj ?? '')} · ${tanggal(k.b ?? k.t)}</small></span>${lencanaTiket(k.s ?? 'baru')}${k.belum ? html`<i class="ps-titik" aria-label="belum dibaca"></i>` : ''}</a></li>`)}</ul>` : ''}
      ${o.tiketSaya.length ? html`<h3 class="ps-sub">Tiket Anda</h3><ul class="ps-daftar">${o.tiketSaya.map((k) => html`<li${raw(k.belum ? ' class="belum"' : '')}><a href="/portal/pesan/tiket/${k.id}"><span class="ps-av ps-av-tiket" aria-hidden="true">📨</span><span class="ps-isi"><b>${k.p}</b><small>ke ${o.namaTujuan(k.tj ?? '')} · ${tanggal(k.b ?? k.t)} · ${k.c}</small></span>${lencanaTiket(k.s ?? 'baru')}${k.belum ? html`<i class="ps-titik" aria-label="belum dibaca"></i>` : ''}</a></li>`)}</ul>` : ''}
      ${!o.tiketMasuk.length && !o.tiketSaya.length ? html`<p class="p-kecil">Belum ada tiket.</p>` : ''}
    </section>
  </div>
  <p class="ps-notif"><button class="tbl tbl-garis tbl-kecil" type="button" data-notif-izin hidden>🔔 Aktifkan notifikasi di perangkat ini</button><span class="p-kecil" data-notif-ket></span></p>
</div>`;
}

export function gelembung(p: Pesan, saya: string): Raw {
  const sendiri = p.d === saya;
  return html`<li class="ps-msg${sendiri ? ' saya' : ''}${p.x.startsWith('— status') ? ' sistem' : ''}" data-t="${p.t}"><span class="ps-av av-${warnaAvatar(p.d)}" aria-hidden="true">${inisial(p.n)}</span><div class="ps-gel"><p class="ps-siapa"><b>${p.n}</b><span>${p.l}</span></p><p class="ps-teks">${p.x}</p><time datetime="${new Date(p.t).toISOString()}">${jamWib(p.t)}</time></div></li>`;
}

function denganTanggal(pesan: Pesan[], saya: string): Raw {
  let hari = '';
  return html`${pesan.map((p) => { const h = tanggal(p.t); const pisah = h !== hari; hari = h; return html`${pisah ? html`<li class="ps-hari"><span>${h}</span></li>` : ''}${gelembung(p, saya)}`; })}`;
}

export function ruangObrolan(o: {
  judul: string; sub: string; api: string; kirim?: string; pesan: Pesan[]; saya: string; kosong: string;
  hari?: { tgl: string; aktif: boolean; label: string }[]; tiket?: Tiket & { bolehStatus: boolean; namaTujuan: string }; kembali: string; arsip?: boolean;
}): Raw {
  const akhir = o.pesan.length ? o.pesan[o.pesan.length - 1]!.t : 0;
  return html`<section class="ps-ruang p-kartu" data-obrolan data-api="${o.api}" data-setelah="${akhir}" data-saya="${o.saya}">
  <header class="ps-ruang-kepala">
    <a class="tbl-ikon" href="${o.kembali}" aria-label="Kembali ke kotak pesan">←</a>
    <div><h2>${o.judul}</h2><p class="p-kecil">${o.sub}</p></div>
    ${o.tiket ? html`<div class="ps-tiket-status">${lencanaTiket(o.tiket.status)}${o.tiket.bolehStatus ? html`<form method="post" action="/portal/pesan/tiket/${o.tiket.id}/status" class="ps-status-form">${(['baru', 'diproses', 'selesai'] as StatusTiket[]).filter((s) => s !== o.tiket!.status).map((s) => html`<button class="tbl tbl-garis tbl-kecil" type="submit" name="status" value="${s}">Tandai ${LABEL_STATUS_TIKET[s].toLowerCase()}</button>`)}</form>` : ''}</div>` : ''}
  </header>
  ${o.hari ? html`<nav class="ps-hari-pilih" aria-label="Riwayat obrolan grup (14 hari)">${o.hari.map((h) => html`<a href="/portal/pesan/grup?tgl=${h.tgl}"${raw(h.aktif ? ' aria-current="page"' : '')}>${h.label}</a>`)}</nav>` : ''}
  ${o.tiket ? html`<p class="ps-tiket-info">🎫 <b>${o.tiket.perihal}</b> · dari ${o.tiket.dariNama} (${o.tiket.dariLabel}) · ke ${o.tiket.namaTujuan} · dibuat ${tanggal(o.tiket.buat)} ${jamWib(o.tiket.buat)}</p>` : ''}
  <ol class="ps-pesan" data-pesan aria-live="polite">${o.pesan.length ? denganTanggal(o.pesan, o.saya) : html`<li class="ps-kosong" data-kosong>${o.kosong}</li>`}</ol>
  ${o.kirim ? html`<form method="post" action="${o.kirim}" class="ps-tulis" data-tulis>
    <textarea name="teks" rows="1" maxlength="2000" required placeholder="Tulis pesan… (Enter untuk kirim, Shift+Enter baris baru)" aria-label="Tulis pesan"></textarea>
    <button class="tbl tbl-emas" type="submit" aria-label="Kirim">Kirim ➤</button>
  </form>` : o.arsip ? html`<p class="ps-arsip">Riwayat grup ${o.hari?.find((h) => h.aktif)?.label ?? ''} — hanya bisa dibaca. Riwayat lebih dari 14 hari terhapus otomatis.</p>` : ''}
</section>
<script src="/assets/pesan.js" defer></script>`;
}

export function formTiket(o: { tujuan: [string, string][]; galat?: string; nilai?: { tujuan?: string; perihal?: string; teks?: string } }): Raw {
  return html`${o.galat ? html`<p class="p-kilat p-kilat-galat" role="alert">${o.galat}</p>` : ''}
  <form method="post" action="/portal/pesan/tiket" class="p-form p-kartu">
    <label class="p-bidang"><span>Ditujukan kepada <i aria-hidden="true">*</i></span><select name="tujuan" required>${o.tujuan.map(([k, l]) => html`<option value="${k}"${raw(o.nilai?.tujuan === k ? ' selected' : '')}>${l}</option>`)}</select><small>Hanya penerima yang dituju (dan Super Admin) yang bisa membaca tiket ini.</small></label>
    <label class="p-bidang"><span>Perihal / permintaan <i aria-hidden="true">*</i></span><input name="perihal" maxlength="140" required value="${o.nilai?.perihal ?? ''}" placeholder="mis. Permohonan tambahan akun guru MI"></label>
    <label class="p-bidang"><span>Isi permintaan <i aria-hidden="true">*</i></span><textarea name="teks" rows="6" maxlength="2000" required>${o.nilai?.teks ?? ''}</textarea></label>
    <div class="p-form-kaki"><button class="tbl tbl-emas" type="submit">Kirim tiket</button><a class="tbl tbl-garis" href="/portal/pesan">Batal</a></div>
  </form>`;
}
