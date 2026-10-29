import Link from "next/link";
import { routePath } from "@/lib/paths";
import { usd, waLink, type SaleDemo, type SaleTerms } from "@/lib/site-sale";
import { MakkahLive } from "./MakkahLive";
import { SaleOfferForm } from "./SaleOfferForm";

/**
 * /acquisition on ulyah.com — the site itself is for sale (owner, 28–29 Oct 2026;
 * docs/ADSENSE-BLUEPRINT.md §17): the price in the clearest place (US$250,000,
 * negotiable, offers from US$50,000), what the site holds — kitab, features,
 * benefits, listening to the kitab and the Qur'an by voice, Hajj & Umrah
 * advertising, live-slot rental, the 24-hour Makkah and Madinah live — the
 * income it already carries, what the buyer receives, the steps, the offer form
 * and the FAQ. Every number is the site's own (the kitab count is read from the
 * library at build time); nothing about traffic or income is claimed in figures.
 */

interface Stats { kitabTotal: number; kitabCats: number; iqroLevels: number }

const nf = (n: number) => n.toLocaleString("id-ID");

export function UlyahSale({ terms, locale, stats, demo }: { terms: SaleTerms; locale: string; stats: Stats; demo: SaleDemo | null }) {
  const price = usd(terms.priceUsd);
  const min = usd(terms.minOfferUsd);
  const wa = terms.whatsapp ? waLink(terms.whatsapp, `Assalamu'alaikum, saya tertarik membeli ULYAH.COM (${price}).`) : "";
  const p = (path: string) => routePath(locale, path);

  const numbers: [string, string][] = [
    ["114", "surah, 6.236 ayat"],
    ["604", "halaman mushaf bertajwid warna"],
    [stats.kitabTotal ? nf(stats.kitabTotal) : "Ribuan", stats.kitabCats ? `kitab klasik dalam ${nf(stats.kitabCats)} bidang ilmu` : "kitab klasik"],
    ["20+", "qari pilihan untuk murottal"],
    ["24 jam", "live Makkah & Madinah"],
    ["0", "login untuk pengunjung"],
  ];

  const inside: { icon: string; title: string; items: [string, string][] }[] = [
    {
      icon: "📖", title: "Al-Qur'an yang bisa didengar dan dipahami",
      items: [
        ["Mushaf Utsmani 604 halaman", "Bertajwid warna, bisa dibaca seperti mushaf cetak."],
        ["Satu halaman per ayat", "Terjemahan, tafsir, asbabun nuzul, nasakh-mansukh dan hadits pendukung dalam satu tampilan."],
        ["Murottal 20+ qari", "Radio Al-Qur'an yang berjalan terus dan flipbook surah."],
      ],
    },
    {
      icon: "🎧", title: "Mendengar kitab dan Al-Qur'an dengan suara",
      items: [
        ["Tiga cara mendengar Al-Qur'an", "\"Baca Semua\" (Arab + arti + tafsir dibacakan), \"Arab saja\" (murottal imam) dan \"Arti saja\"."],
        ["Kitab, kisah dan amalan dibacakan", "Tombol dengarkan di kitab pesantren, deskripsi kitab, kisah, konten harian dan amalan."],
        ["Audiobook Islami", "Kisah dan hikmah dalam format audio yang bisa diunduh."],
      ],
    },
    {
      icon: "📚", title: "Perpustakaan kitab dan hadits",
      items: [
        [stats.kitabTotal ? `${nf(stats.kitabTotal)} kitab klasik` : "Perpustakaan kitab klasik", "Tafsir, hadits, fiqih, akidah, nahwu, balaghah, tasawuf dan bidang lain, dijelajahi per bidang."],
        ["Kitab pesantren", "Matan berbahasa Arab dengan panel nahwu-sharaf untuk belajar membaca kitab kuning."],
        ["Koleksi hadits dan pohon sanad", "Hadits per kitab dengan derajatnya, dan penjelajah sanad perawi."],
      ],
    },
    {
      icon: "🧒", title: "Kisah dan pendidikan anak",
      items: [
        ["Kisah para nabi dan tokoh", "Kisah bersambung dengan rujukan ayat dan hadits."],
        ["Al-Qur'an Kids", `Huruf hijaiyah, Iqro ${stats.iqroLevels} jilid bersuara, hafalan Juz 'Amma dan film Islami untuk anak.`],
        ["Cerita anak", "Kisah teladan pendek yang dibacakan."],
      ],
    },
    {
      icon: "🕌", title: "Ibadah sehari-hari",
      items: [
        ["Jadwal sholat & pengingat adzan", "Untuk kota di seluruh dunia, plus kompas arah kiblat."],
        ["Kalender hijriyah & imsakiyah", "Kalender bulan hijriyah dan jadwal imsakiyah Ramadhan."],
        ["Kalkulator zakat & waris", "Hitungan zakat dan pembagian warisan (faraid)."],
      ],
    },
    {
      icon: "📡", title: "Live, AI dan aplikasi",
      items: [
        ["Live Makkah & Madinah 24 jam", "Ditambah kanal Islam dunia (Indonesia, Turki, Pakistan, Inggris, Malaysia …) di halaman Live."],
        ["Tanya AI Islami", "Asisten tanya-jawab Islami berbasis AI, langsung di situs."],
        ["Aplikasi di HP", "Bisa dipasang ke layar utama (PWA) dan dibuka lebih cepat."],
      ],
    },
  ];

  const income: [string, string, string][] = [
    ["💵", "Iklan Google AdSense", "Kode iklan sudah terpasang di seluruh halaman situs."],
    ["🕋", "Iklan paket Haji & Umroh", "Halaman Haji & Umroh dikelola dari portal admin: paket biro perjalanan (keberangkatan, fasilitas, kontak) dipasang sebagai slot promosi yang disewakan."],
    ["🎥", "Sewa slot live YouTube", "Enam slot live di halaman Live untuk kajian, masjid dan channel yang ingin tayang di ULYAH.COM; setiap slot kosong sudah menampilkan kontak untuk menyewa."],
    ["🤲", "Donasi", "Halaman donasi dengan PayPal, kripto dan transfer bank, plus sertifikat terima kasih untuk donatur."],
  ];

  const receive = [
    "Domain ulyah.com",
    "Kode sumber lengkap: situs (Next.js) dan API (Cloudflare Workers)",
    "Seluruh konten: Al-Qur'an, terjemahan & tafsir, kitab, hadits, kisah, audio dan konten anak",
    "Portal admin tersembunyi yang mengendalikan semua halaman, live, paket haji & umroh, iklan dan donasi",
    "Merek ULYAH.COM dan alamat e-mail salam@ulyah.com",
    "Infrastruktur serverless yang ringan biaya, siap dipindahkan ke akun Cloudflare Anda",
  ];

  const steps: [string, string][] = [
    ["Ajukan penawaran", `Lewat formulir di halaman ini, WhatsApp atau e-mail. Penawaran minimum ${min}.`],
    ["Bicara dengan pemilik", "Tanya jawab, NDA, dan akses demo portal admin hanya-baca agar Anda melihat semuanya sebelum membeli."],
    ["Sepakati harga & perjanjian", `Harga ${price}${terms.negotiable ? " bisa dinegosiasikan" : ""}; syarat serah terima dituangkan dalam perjanjian jual beli.`],
    ["Pembayaran", "Transfer bank, escrow pihak ketiga atau kripto, sesuai kesepakatan."],
    ["Serah terima", "Domain, kode, data dan akses dipindahkan kepada Anda."],
  ];

  const faq: [string, string][] = [
    ["Apakah harganya bisa dinego?", `${terms.negotiable ? "Ya. " : ""}Harga yang diminta ${price}${terms.negotiable ? " dan bisa dinegosiasikan" : ""}. Penawaran di bawah ${min} tidak kami proses.`],
    ["Apakah situs saudara ikut terjual?", "Tidak. Penawaran ini untuk ULYAH.COM. Situs saudara (1fr.fr, tilawa.de, xad.es, dawa.im) ditawarkan terpisah dan bisa dibicarakan bersama bila Anda menginginkan ekosistemnya."],
    ["Bisakah saya melihat isi portal admin?", demo ? "Bisa, sekarang juga: masuk dengan login demo di bagian \"Lihat portal admin\" di atas. Demo hanya-lihat — semua halaman promosi terlihat, tidak ada yang bisa diubah." : "Bisa. Calon pembeli yang serius mendapat akses demo hanya-lihat: semua halaman promosi terlihat, tidak ada yang bisa diubah."],
    ["Bagaimana dengan data trafik dan pendapatan?", "Data trafik dan pendapatan dapat ditunjukkan kepada calon pembeli yang serius setelah NDA."],
    ["Siapa yang mengatur live Makkah setelah pembelian?", "Anda. Tautan live Makkah 24 jam dan semua kanal live diatur dari portal admin."],
    ["Bagaimana cara pembayarannya?", "Transfer bank, escrow pihak ketiga atau kripto, sesuai kesepakatan dalam perjanjian jual beli."],
  ];

  return (
    <div data-testid="ulyah-sale">
      {/* ── Hero: the offer and the price, first ── */}
      <section className="relative overflow-hidden bg-primary text-[#f4efe3]">
        <div aria-hidden className="pattern-islamic pointer-events-none absolute inset-0 opacity-15" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 desktop:grid-cols-[1.25fr_1fr] desktop:py-20">
          <div className="hero-entrance">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--color-accent-light)">🏷️ Kesempatan akuisisi · ULYAH.COM</p>
            <h1 className="mt-4 font-heading text-3xl leading-tight sm:text-4xl desktop:text-5xl">
              ULYAH.COM dijual — platform Islam digital yang sudah berjalan, siap Anda lanjutkan.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#f4efe3]/85">
              Al-Qur&apos;an lengkap yang bisa didengar beserta tafsir dan hadits, perpustakaan kitab klasik, kisah, pendidikan
              anak, ibadah harian, live Makkah–Madinah 24 jam, dan portal admin yang mengendalikan semuanya. Dialihkan utuh
              kepada pemilik baru: domain, platform, konten dan seluruh saluran pendapatannya.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#tawar" className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-primary shadow-lg transition hover:brightness-110" data-testid="sale-cta">
                Ajukan penawaran →
              </a>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#f4efe3]/40 px-6 py-3 text-sm font-medium transition hover:border-accent">
                  WhatsApp pemilik
                </a>
              )}
            </div>
          </div>
          <div className="hero-entrance rounded-3xl border border-accent/50 bg-black/25 p-7 text-center shadow-2xl backdrop-blur-sm" style={{ animationDelay: "160ms" }} data-testid="sale-price-card">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--color-accent-light)">Harga</p>
            <p className="mt-2 font-heading text-5xl font-bold text-(--color-accent-xl) sm:text-6xl" data-testid="sale-price">{price}</p>
            {terms.negotiable && <p className="mt-3 inline-block rounded-full bg-accent/20 px-4 py-1 text-sm font-semibold text-(--color-accent-xl)">Bisa nego</p>}
            <div className="mt-5 border-t border-[#f4efe3]/15 pt-5">
              <p className="text-sm text-[#f4efe3]/75">Penawaran minimum</p>
              <p className="mt-1 font-heading text-3xl text-[#f4efe3]" data-testid="sale-min">{min}</p>
            </div>
            <p className="mt-5 text-xs text-[#f4efe3]/70">
              E-mail: <a href={`mailto:${terms.email}`} className="font-semibold text-(--color-accent-light) hover:underline">{terms.email}</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── The numbers ── */}
      <section className="border-b border-(--color-border) bg-(--color-bg) px-4 py-10 sm:px-6">
        <div className="reveal-stagger mx-auto grid max-w-7xl grid-cols-2 gap-6 text-center sm:grid-cols-3 desktop:grid-cols-6">
          {numbers.map(([n, label]) => (
            <div key={label}>
              <div className="font-heading text-3xl text-primary dark:text-accent">{n}</div>
              <div className="mt-1 text-xs text-text-secondary">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Makkah, 24 hours ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 desktop:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl sm:text-3xl">Live Makkah & Madinah, 24 jam</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
            Siaran langsung Masjidil Haram dan Masjid Nabawi tayang sepanjang hari, ditambah kanal Islam dari berbagai negara.
            Tautannya diatur dari portal admin, tanpa menyentuh kode. Halaman Live juga punya enam slot milik pemilik untuk
            kajian dan siaran sendiri, atau disewakan.
          </p>
          <Link href={p("/live")} className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">Buka halaman Live →</Link>
        </div>
        <MakkahLive url={terms.makkahLiveUrl} />
      </section>

      {/* ── What is inside ── */}
      <section className="bg-(--color-surface)/50 px-4 py-16 sm:px-6 dark:bg-white/3">
        <div className="mx-auto max-w-7xl">
          <h2 className="section-divider text-center font-heading text-2xl sm:text-3xl"><span>Apa saja yang ada di dalamnya</span></h2>
          <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2 desktop:grid-cols-3">
            {inside.map((g) => (
              <div key={g.title} className="card-premium rounded-3xl p-6">
                <div className="text-3xl" aria-hidden>{g.icon}</div>
                <h3 className="mt-3 font-heading text-lg">{g.title}</h3>
                <ul className="mt-4 space-y-3">
                  {g.items.map(([t, d]) => (
                    <li key={t} className="text-sm">
                      <span className="font-semibold text-text-primary dark:text-[#f4efe3]">{t}</span>
                      <span className="block text-text-secondary">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Income it already carries + why it matters ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="section-divider text-center font-heading text-2xl sm:text-3xl"><span>Saluran pendapatan yang siap jalan</span></h2>
        <div className="reveal-stagger mt-10 grid gap-6 sm:grid-cols-2">
          {income.map(([icon, t, d]) => (
            <div key={t} className="flex gap-4 rounded-3xl border border-(--color-border) p-6">
              <div className="text-3xl" aria-hidden>{icon}</div>
              <div>
                <h3 className="font-heading text-lg">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-3xl bg-primary/5 p-6 text-sm leading-relaxed text-text-secondary dark:bg-white/5">
          <b className="text-text-primary dark:text-[#f4efe3]">Manfaatnya bagi pemilik baru:</b> platform dakwah yang bisa langsung dipakai siapa
          saja tanpa login dan tanpa biaya, konten yang sudah tersusun rapi, dan saluran pendapatan yang tinggal dikembangkan —
          tanpa membangun dari nol.
        </div>
      </section>

      {/* ── What the buyer receives + the steps ── */}
      <section className="bg-primary px-4 py-16 text-[#f4efe3] sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-10 desktop:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl text-(--color-accent-xl) sm:text-3xl">Yang Anda terima</h2>
            <ul className="mt-6 space-y-3">
              {receive.map((r) => (
                <li key={r} className="flex gap-3 text-[15px]"><span className="text-(--color-accent-light)" aria-hidden>◆</span>{r}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-heading text-2xl text-(--color-accent-xl) sm:text-3xl">Langkah pembelian</h2>
            <ol className="mt-6 space-y-4">
              {steps.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent font-heading font-bold text-primary">{i + 1}</span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="text-sm text-[#f4efe3]/75">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── The admin portal, open to look at ── */}
      {demo && (
        <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6" data-testid="sale-demo">
          <div className="card-premium-static grid items-center gap-8 rounded-3xl p-6 sm:p-8 desktop:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl">Lihat portal admin sendiri</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
                Masuk ke portal admin dengan login demo: paket Haji &amp; Umroh, promo YouTube di halaman Live, kanal YouTube anak
                dan halaman situs — persis seperti yang akan Anda kelola. Demo hanya-lihat; tidak ada yang bisa diubah.
              </p>
              <a href={demo.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 dark:bg-accent dark:text-primary">
                Buka portal admin ↗
              </a>
            </div>
            <dl className="rounded-2xl bg-primary p-5 text-sm text-[#f4efe3]">
              <dt className="text-xs uppercase tracking-[0.2em] text-(--color-accent-light)">Alamat</dt>
              <dd className="mt-1 break-all font-mono">{demo.url}</dd>
              <dt className="mt-4 text-xs uppercase tracking-[0.2em] text-(--color-accent-light)">Username</dt>
              <dd className="mt-1 break-all font-mono" data-testid="sale-demo-user">{demo.email}</dd>
              <dt className="mt-4 text-xs uppercase tracking-[0.2em] text-(--color-accent-light)">Password</dt>
              <dd className="mt-1 break-all font-mono" data-testid="sale-demo-pass">{demo.password}</dd>
            </dl>
          </div>
        </section>
      )}

      {/* ── The offer ── */}
      <section id="tawar" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-heading text-2xl sm:text-3xl">Ajukan penawaran</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-text-secondary">
            Harga {price}{terms.negotiable ? ", bisa nego" : ""}. Penawaran minimum {min}. Pemilik membalas lewat e-mail atau WhatsApp.
          </p>
          <div className="card-premium-static mt-8 rounded-3xl p-6 sm:p-8">
            <SaleOfferForm minOfferUsd={terms.minOfferUsd} email={terms.email} />
          </div>
          <p className="mt-4 text-center text-sm text-text-secondary">
            Atau langsung: <a href={`mailto:${terms.email}`} className="font-semibold text-accent hover:underline">{terms.email}</a>
            {wa && <> · <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">WhatsApp</a></>}
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="section-divider text-center font-heading text-2xl"><span>Tanya jawab</span></h2>
        <div className="mt-8 divide-y divide-(--color-border) rounded-2xl border border-(--color-border)">
          {faq.map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold">{q}<span className="float-right text-text-secondary transition group-open:rotate-45" aria-hidden>+</span></summary>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── For international buyers ── */}
      <section lang="en" className="border-t border-(--color-border) bg-(--color-surface)/40 px-4 py-12 sm:px-6 dark:bg-white/3">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-xl">For international buyers</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            ULYAH.COM — a complete Islamic platform (the Qur&apos;an with audio, translation and tafsir, a classical kitab library,
            hadith, stories, children&apos;s learning, daily-worship tools, 24-hour Makkah and Madinah live, an AI assistant and a
            hidden admin portal) — is for sale with its domain, source code, content and income channels. Asking price{" "}
            <b>{usd(terms.priceUsd, "en")}</b>{terms.negotiable ? ", negotiable" : ""}; offers from <b>{usd(terms.minOfferUsd, "en")}</b>. Use the form above or write
            to <a href={`mailto:${terms.email}`} className="font-semibold text-accent hover:underline">{terms.email}</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
