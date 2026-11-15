/**
 * Tautan video kegiatan dan siaran langsung (pemilik, 14 Nov 2026: „terkoneksi live yg bisa di ambil dr link youtube,
 * facebook, tiktok“). Tautan diubah menjadi pemutar sematan resmi tiap layanan. Pemutar baru dimuat setelah pembaca
 * menekan tombol putar (fasad), supaya halaman tetap ringan dan layanan pihak ketiga tidak memasang cookie sebelum diminta.
 */
export type Layanan = 'youtube' | 'facebook' | 'tiktok';
export interface InfoVideo { layanan: Layanan; embed: string; gambar?: string; asli: string; tegak: boolean }

export function kenaliVideo(url: string): InfoVideo | null {
  let u: URL;
  try { u = new URL(url); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.replace(/^(www\.|m\.|mobile\.)/, '');
  if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com' || host === 'music.youtube.com') {
    let id = '';
    if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0] ?? '';
    else if (u.pathname === '/watch') id = u.searchParams.get('v') ?? '';
    else {
      const m = u.pathname.match(/^\/(?:embed|live|shorts|v)\/([\w-]{11})/);
      if (m) id = m[1]!;
    }
    if (!/^[\w-]{11}$/.test(id)) return null;
    return { layanan: 'youtube', embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`, gambar: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, asli: `https://www.youtube.com/watch?v=${id}`, tegak: u.pathname.startsWith('/shorts/') };
  }
  if (host === 'facebook.com' || host === 'fb.watch' || host === 'web.facebook.com') {
    const asli = `https://${host === 'fb.watch' ? 'fb.watch' : 'www.facebook.com'}${u.pathname}${u.search}`;
    return { layanan: 'facebook', embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(asli)}&show_text=false&autoplay=true`, asli, tegak: /\/reel\//.test(u.pathname) };
  }
  if (host === 'tiktok.com' || host === 'vm.tiktok.com') {
    const m = u.pathname.match(/\/video\/(\d{8,25})/);
    if (!m) return host === 'tiktok.com' && /^\/@[\w.]+\/live/.test(u.pathname) ? { layanan: 'tiktok', embed: '', asli: u.href, tegak: true } : null;
    return { layanan: 'tiktok', embed: `https://www.tiktok.com/embed/v2/${m[1]}`, asli: `https://www.tiktok.com${u.pathname}`, tegak: true };
  }
  return null;
}

export const NAMA_LAYANAN: Record<Layanan, string> = { youtube: 'YouTube', facebook: 'Facebook', tiktok: 'TikTok' };
