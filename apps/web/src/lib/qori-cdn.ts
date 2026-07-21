/**
 * Murottal (Qur'an recitation) audio — streamed directly from existing
 * public CDNs at play time, never re-hosted. Earlier this project downloaded
 * every reciter's every ayah and re-uploaded full copies into R2, which took
 * hours per reciter and stored data that already has a free public home.
 * The correct approach (confirmed against a working reference implementation):
 * point <audio src> straight at the source CDN and let the browser's own
 * HTTP cache handle repeat playback — no backend storage needed at all.
 *
 * Three source CDNs, matching what each reciter is actually published on:
 *   - "aqc"   api.alquran.cloud — returns a JSON audio URL per ayah,
 *             fetched once per surah and cached in localStorage (URLs only,
 *             a few KB — not the audio itself).
 *   - "ey"    everyayah.com — pure URL formula, no fetch needed.
 *   - "surah" quranicaudio.com — one file per surah (no per-ayah split),
 *             used for reciters only published that way (e.g. Indonesia's
 *             Muammar ZA). Returns null for per-ayah lookups; the caller
 *             falls through to the narrated layers, same as any other
 *             "recitation not available for this ayah" case.
 */

export interface QoriDef {
  key: string;
  name: string;
  flag: string;
  country: string;
  cc: string; // country code for the per-country filter
  note: string;
  cdn: "aqc" | "ey" | "surah";
  /** World-renowned reciters surfaced first in the Radio Qori picker. */
  featured?: boolean;
  aqcEdition?: string;
  eyId?: string;
  surahFn?: (surah: number) => string;
}

// Country filter tabs (matches the reference implementation). "all" first.
export const COUNTRIES: { code: string; label: string; flag: string }[] = [
  { code: "all", label: "Semua", flag: "🌍" },
  { code: "sa", label: "Arab Saudi", flag: "🇸🇦" },
  { code: "kw", label: "Kuwait", flag: "🇰🇼" },
  { code: "eg", label: "Mesir", flag: "🇪🇬" },
  { code: "ly", label: "Libya", flag: "🇱🇾" },
  { code: "qa", label: "Qatar", flag: "🇶🇦" },
  { code: "ae", label: "Emirat Arab", flag: "🇦🇪" },
  { code: "ye", label: "Yaman", flag: "🇾🇪" },
  { code: "dz", label: "Aljazair", flag: "🇩🇿" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
];

const pad3 = (n: number) => String(n).padStart(3, "0");

export const RECITERS: QoriDef[] = [
  // Arab Saudi — alquran.cloud
  { key: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", featured: true, cdn: "aqc", aqcEdition: "ar.abdurrahmaansudais" },
  { key: "ar.mahermuaiqly", name: "Maher Al-Muaiqly", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", featured: true, cdn: "aqc", aqcEdition: "ar.mahermuaiqly" },
  { key: "ar.saoodshuraym", name: "Saud Al-Shuraim", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", cdn: "aqc", aqcEdition: "ar.saoodshuraym" },
  { key: "ar.hudhaify", name: "Ali Al-Hudhaify", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjid Nabawi, Madinah", cdn: "aqc", aqcEdition: "ar.hudhaify" },
  { key: "ar.muhammadayyoub", name: "Muhammad Ayyub", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjid Nabawi, Madinah", cdn: "aqc", aqcEdition: "ar.muhammadayyoub" },
  { key: "ar.shaatree", name: "Abu Bakr Al-Shatri", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "aqc", aqcEdition: "ar.shaatree" },
  { key: "ar.abdullahbasfar", name: "Abdullah Basfar", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "aqc", aqcEdition: "ar.abdullahbasfar" },
  { key: "ar.hanirifai", name: "Hani Ar-Rifai", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "aqc", aqcEdition: "ar.hanirifai" },
  // Arab Saudi — everyayah.com
  { key: "ey.dussary", name: "Yasser Ad-Dussary", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Yasser_Ad-Dussary_128kbps" },
  { key: "ey.matroud", name: "Abdullah Al-Matroud", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Abdullah_Matroud_128kbps" },
  // Kuwait
  { key: "ar.alafasy", name: "Mishary Rashid Al-Afasy", flag: "🇰🇼", country: "Kuwait", cc: "kw", note: "Murattal Tartil", featured: true, cdn: "aqc", aqcEdition: "ar.alafasy", eyId: "Alafasy_128kbps" },
  { key: "ar.ahmedajamy", name: "Ahmed Al-Ajami", flag: "🇰🇼", country: "Kuwait", cc: "kw", note: "Murattal", cdn: "aqc", aqcEdition: "ar.ahmedajamy" },
  // Mesir — alquran.cloud
  { key: "ar.abdulbasitmurattal", name: "Abdul Basit Abd us-Samad", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", featured: true, cdn: "aqc", aqcEdition: "ar.abdulbasitmurattal" },
  { key: "ar.husary", name: "Mahmoud Khalil Al-Husary", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", featured: true, cdn: "aqc", aqcEdition: "ar.husary" },
  { key: "ar.husarymujawwad", name: "Al-Husary (Mujawwad)", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Mujawwad", cdn: "aqc", aqcEdition: "ar.husarymujawwad" },
  { key: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", featured: true, cdn: "aqc", aqcEdition: "ar.minshawi" },
  { key: "ar.minshawimujawwad", name: "Al-Minshawi (Mujawwad)", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Mujawwad", cdn: "aqc", aqcEdition: "ar.minshawimujawwad" },
  { key: "ar.muhammadjibreel", name: "Muhammad Jibreel", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", cdn: "aqc", aqcEdition: "ar.muhammadjibreel" },
  { key: "ey.tablawi", name: "Muhammad Al-Tablawi", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", cdn: "ey", eyId: "Mohammad_al_Tablawi_128kbps" },
  // Libya
  { key: "ar.aymansuwayd", name: "Ayman Suwayd", flag: "🇱🇾", country: "Libya", cc: "ly", note: "Murattal Hafalan", cdn: "aqc", aqcEdition: "ar.aymanswoaid" },
  // Qatar
  { key: "ey.qatami", name: "Nasser Al-Qatami", flag: "🇶🇦", country: "Qatar", cc: "qa", note: "Murattal", cdn: "ey", eyId: "Nasser_Alqatami_128kbps" },
  // Emirat Arab
  { key: "ey.tunaiji", name: "Khalifa Al-Tunaiji", flag: "🇦🇪", country: "Emirat Arab", cc: "ae", note: "Murattal", cdn: "ey", eyId: "khalefa_al_tunaiji_128kbps" },
  { key: "ey.bukhatir", name: "Salah Bukhatir", flag: "🇦🇪", country: "Emirat Arab", cc: "ae", note: "Murattal", cdn: "ey", eyId: "Salaah_AbdulRahman_Bukhatir_128kbps" },
  // Tambahan — cakupan lebih luas (per-ayat, everyayah.com)
  { key: "ey.juhany", name: "Abdullah Awad Al-Juhany", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", featured: true, cdn: "ey", eyId: "Abdullaah_3awwaad_Al-Juhaynee_128kbps" },
  { key: "ey.ghamdi", name: "Saad Al-Ghamdi", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal Tartil", featured: true, cdn: "ey", eyId: "Ghamadi_40kbps" },
  { key: "ey.alijaber", name: "Ali Jaber", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Ali_Jaber_64kbps" },
  { key: "ey.akhdar", name: "Ibrahim Al-Akhdar", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Ibrahim_Akhdar_32kbps" },
  { key: "ey.banna", name: "Mahmoud Ali Al-Banna", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", cdn: "ey", eyId: "mahmoud_ali_al_banna_32kbps" },
  { key: "ey.faresabbad", name: "Fares Abbad", flag: "🇾🇪", country: "Yaman", cc: "ye", note: "Murattal", featured: true, cdn: "ey", eyId: "Fares_Abbad_64kbps" },
  { key: "ey.mansouri", name: "Karim Mansouri", flag: "🇩🇿", country: "Aljazair", cc: "dz", note: "Murattal", featured: true, cdn: "ey", eyId: "Karim_Mansouri_128kbps" },
  // Indonesia — surah-mode only (see surahFn note above)
  {
    key: "id.muammar",
    name: "H. Muammar ZA",
    flag: "🇮🇩",
    country: "Indonesia",
    cc: "id",
    note: "Tilawah Mujawwad — per surah",
    featured: true,
    cdn: "surah",
    surahFn: (n) => `https://download.quranicaudio.com/quran/muammar_za/${pad3(n)}.mp3`,
  },
];

export const DEFAULT_QORI_KEY = "ar.alafasy";

/**
 * Per-site CDN separation for the always-on radio (owner: "masing-masing situs
 * narik CDN-nya terpisah agar tidak ada duplikat"). Each domain leads its
 * rotation with a DIFFERENT source CDN, so the four sites never pull the exact
 * same file from the exact same host at the same moment — which both honours
 * the request and spreads load so no single CDN throttles us into choppy,
 * "kaset kusut" audio. Only 128 kbps / alquran.cloud voices are eligible (the
 * low-bitrate everyayah folders are what sounded muffled), so separation never
 * costs audio quality. Every pool still contains the same world-renowned
 * reciters — only the ORDER and the leading CDN differ per site.
 */
export const TENANT_RADIO_CDN: Record<string, ("aqc" | "ey")[]> = {
  ulyah: ["aqc", "ey"], // Indonesia flagship — alquran.cloud first
  "1fr": ["ey", "aqc"], // France — everyayah first
  tilawa: ["aqc", "ey"], // Germany — alquran.cloud first, reversed reciter order
  dawa: ["ey", "aqc"], // Spain — everyayah first, reversed reciter order
};

function buildEyUrl(eyId: string, surah: number, ayah: number): string {
  return `https://everyayah.com/data/${eyId}/${pad3(surah)}${pad3(ayah)}.mp3`;
}

const AQC_API = "https://api.alquran.cloud/v1";
const aqcSurahCache = new Map<string, Promise<(string | null)[]>>();

/** Fetch once per (edition, surah) — just the small per-ayah URL list, not
 * audio bytes — and keep it in both an in-memory Map and localStorage so a
 * repeat visit doesn't even need the metadata fetch again. */
async function fetchAqcSurahAudio(edition: string, surah: number): Promise<(string | null)[]> {
  const cacheKey = `aqc:${edition}:${surah}`;
  // v3: version-busted again — devices that cached audio URL lists under the
  // old key (including any low-bitrate URLs from before the 128 kbps upgrade
  // below) kept replaying muffled audio FOREVER, because localStorage never
  // expires ("suara mendem kaya kaset kusut" persisting after the fix). New
  // key = every device re-resolves fresh, forced-128 kbps URLs.
  const lsKey = `ulyah_qori3_${cacheKey}`;

  if (aqcSurahCache.has(cacheKey)) return aqcSurahCache.get(cacheKey)!;

  const promise = (async () => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(lsKey);
        if (stored) return JSON.parse(stored) as (string | null)[];
      } catch {
        /* ignore */
      }
    }
    const res = await fetch(`${AQC_API}/surah/${surah}/${edition}`);
    if (!res.ok) throw new Error(`aqc fetch failed: ${res.status}`);
    const data = (await res.json()) as { data?: { ayahs?: { audio?: string; audioSecondary?: string[] }[] } };
    const urls = (data.data?.ayahs ?? []).map((a) => {
      // The API's default `audio` for several editions is a LOW-bitrate file
      // (48/64 kbps) that sounds muffled ("mendem"). islamic.network serves the
      // exact same ayah at 128 kbps for every major reciter in the rotation, so
      // force the bitrate path segment up to 128 — same file, clean HiFi audio.
      const raw = a.audio ?? a.audioSecondary?.[0] ?? null;
      return raw ? raw.replace(/\/quran\/audio\/\d+\//, "/quran/audio/128/") : null;
    });
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(lsKey, JSON.stringify(urls));
      } catch {
        /* quota exceeded — fine, just skip persisting */
      }
    }
    return urls;
  })();

  aqcSurahCache.set(cacheKey, promise);
  return promise;
}

/** Resolve the playable URL for one ayah's recitation, or null if this
 * reciter doesn't publish per-ayah audio (surah-mode reciters). Callers
 * already treat null the same as "not available" and fall through to the
 * narrated layers, so no reciter ever leaves the player silently stuck. */
export async function resolveAyahAudioUrl(qoriKey: string, surah: number, ayah: number): Promise<string | null> {
  const rc = RECITERS.find((r) => r.key === qoriKey) ?? RECITERS.find((r) => r.key === DEFAULT_QORI_KEY)!;
  if (rc.cdn === "ey" && rc.eyId) return buildEyUrl(rc.eyId, surah, ayah);
  if (rc.cdn === "aqc" && rc.aqcEdition) {
    try {
      const urls = await fetchAqcSurahAudio(rc.aqcEdition, surah);
      const url = urls[ayah - 1];
      if (url) return url;
    } catch {
      /* api.alquran.cloud unreachable — fall through to the everyayah mirror */
    }
    // If the reciter is also published on everyayah, use that pure-URL mirror
    // so a failed/slow alquran.cloud metadata fetch never leaves it silent.
    if (rc.eyId) return buildEyUrl(rc.eyId, surah, ayah);
    return null;
  }
  return null; // surah-mode: no per-ayah URL
}

/** Whole-surah recitation URL for surah-mode reciters (e.g. Muammar ZA) — one
 * continuous file per surah rather than a per-ayah split. Used by the Radio
 * Qori widget so these reciters are actually playable (previously `surahFn`
 * was defined but nothing ever called it). */
export function resolveSurahAudioUrl(qoriKey: string, surah: number): string | null {
  const rc = RECITERS.find((r) => r.key === qoriKey);
  return rc?.cdn === "surah" && rc.surahFn ? rc.surahFn(surah) : null;
}
