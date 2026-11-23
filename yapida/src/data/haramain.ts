/**
 * Siaran langsung 24 jam dari Dua Tanah Suci (pemilik, 23 Nov 2026: „tambahin live youtube masjidil harom dan masjid
 * Nabawi yg link nya di isi dari super admin, tp lu isiin dulu linknya yg bener2 24 Jam dari satelit tanpa putus2“).
 *
 * Bawaan: kanal YouTube resmi Kerajaan Arab Saudi yang juga dipancarkan lewat satelit 24 jam —
 *  - Saudi Quran TV (قناة القرآن الكريم) dari Masjidil Haram, Makkah;
 *  - Saudi Sunnah TV (قناة السنة النبوية) dari Masjid Nabawi, Madinah.
 * Kanal yang sama dipakai ulyah.com (slot 101 & 102 hub live). Tautan `/channel/<id>/live` dan sematan
 * `embed/live_stream?channel=<id>` selalu memutar siaran yang sedang berjalan, jadi tidak pernah basi walau siarannya
 * dimulai ulang dengan id video baru. Super admin dapat menggantinya di Portal → Pengaturan situs.
 */
export interface Haramain { makkah: string; madinah: string }

export const KANAL_MAKKAH = 'UCos52azQNBgW63_9uDJoPDA';
export const KANAL_MADINAH = 'UCROKYPep-UuODNwyipe6JMw';
export const HARAMAIN_BAWAAN: Haramain = {
  makkah: `https://www.youtube.com/channel/${KANAL_MAKKAH}/live`,
  madinah: `https://www.youtube.com/channel/${KANAL_MADINAH}/live`,
};

/** Hanya tautan YouTube (https) yang diterima; selain itu → null (formulir memakai bawaan). */
export function tautanYoutube(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol !== 'https:') return null;
    if (!/^(www\.|m\.)?(youtube\.com|youtu\.be)$/.test(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Alamat sematan untuk tautan YouTube: kanal → siaran yang sedang berjalan; video/live → video itu. */
export function sematanYoutube(url: string): string | null {
  const ok = tautanYoutube(url);
  if (!ok) return null;
  const u = new URL(ok);
  const bagian = u.pathname.split('/').filter(Boolean);
  const kanal = bagian[0] === 'channel' && /^UC[\w-]{22}$/.test(bagian[1] ?? '') ? bagian[1] : null;
  if (kanal) return `https://www.youtube.com/embed/live_stream?channel=${kanal}&autoplay=1&mute=1`;
  const id = u.hostname.endsWith('youtu.be') ? bagian[0] : bagian[0] === 'watch' ? u.searchParams.get('v') : ['live', 'embed', 'shorts'].includes(bagian[0] ?? '') ? bagian[1] : null;
  if (id && /^[\w-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0`;
  return null;
}

export const haramainSitus = (s: { haramain?: Partial<Haramain> }): Haramain => ({
  makkah: tautanYoutube(s.haramain?.makkah) ?? HARAMAIN_BAWAAN.makkah,
  madinah: tautanYoutube(s.haramain?.madinah) ?? HARAMAIN_BAWAAN.madinah,
});
