/**
 * Murottal (Qur'an recitation) audio — straight from the reciters' CDNs.
 *
 * Owner decision: "hilangin audio2 alquran murottal ganti dengan cdn." The
 * radio, the per-ayah Qur'an reader and the Mushaf Utsmani all play from the
 * reciter's own CDN now. We store no recitation of our own: the previous
 * design mirrored the whole library into R2 (6,236 files per reciter, twenty-
 * two reciters) and completed itself from real listening, which is storage
 * that grows with traffic, forever, for audio these CDNs already serve.
 *
 * api.ulyah.com/audio/qori2/… stays in the list, LAST, and is no longer a
 * library: it redirects to the same CDN file (see worker-api routes/audio.ts).
 * It earns its place for the alquran.cloud reciters, whose direct URL needs a
 * metadata lookup that can fail — the redirect is a pure formula and needs
 * none, so a reciter is never silent because an API was slow.
 *
 * The source CDNs:
 *   - "aqc"   api.alquran.cloud — JSON audio URL per ayah, forced to the
 *             128 kbps islamic.network path (low bitrates sound muffled).
 *   - "ey"    everyayah.com — pure URL formula, no fetch needed.
 *   - "surah" quranicaudio.com — one file per surah (no per-ayah split),
 *             used for reciters only published that way (e.g. Indonesia's
 *             Muammar ZA). No per-ayah lookup; callers fall through to the
 *             narrated layers, same as any other "not available" case.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ulyah.com";

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
  /** The reciter's folder name in the api.ulyah.com redirect path (a leftover
   * of the deleted R2 library, kept because it is also the key of
   * MUROTTAL_SOURCES in the worker, which is what the redirect resolves with).
   * A reciter without one simply has no backstop URL — it plays from its CDN. */
  r2Folder?: string;
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
  { key: "ar.abdurrahmaansudais", name: "Abdurrahman As-Sudais", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", featured: true, cdn: "aqc", aqcEdition: "ar.abdurrahmaansudais", r2Folder: "sudais" },
  { key: "ar.mahermuaiqly", name: "Maher Al-Muaiqly", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", featured: true, cdn: "aqc", aqcEdition: "ar.mahermuaiqly", r2Folder: "muaiqly" },
  { key: "ar.saoodshuraym", name: "Saud Al-Shuraim", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", cdn: "aqc", aqcEdition: "ar.saoodshuraym", r2Folder: "shuraym" },
  { key: "ar.hudhaify", name: "Ali Al-Hudhaify", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjid Nabawi, Madinah", cdn: "aqc", aqcEdition: "ar.hudhaify", r2Folder: "hudhaify" },
  { key: "ar.muhammadayyoub", name: "Muhammad Ayyub", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjid Nabawi, Madinah", cdn: "aqc", aqcEdition: "ar.muhammadayyoub", r2Folder: "ayyoub" },
  { key: "ar.shaatree", name: "Abu Bakr Al-Shatri", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "aqc", aqcEdition: "ar.shaatree", r2Folder: "shatri" },
  { key: "ar.abdullahbasfar", name: "Abdullah Basfar", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "aqc", aqcEdition: "ar.abdullahbasfar", r2Folder: "basfar" },
  { key: "ar.hanirifai", name: "Hani Ar-Rifai", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "aqc", aqcEdition: "ar.hanirifai", r2Folder: "rifai" },
  // Arab Saudi — everyayah.com
  { key: "ey.dussary", name: "Yasser Ad-Dussary", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Yasser_Ad-Dussary_128kbps", r2Folder: "dosari" },
  { key: "ey.matroud", name: "Abdullah Al-Matroud", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Abdullah_Matroud_128kbps", r2Folder: "matroud" },
  // Kuwait
  { key: "ar.alafasy", name: "Mishary Rashid Al-Afasy", flag: "🇰🇼", country: "Kuwait", cc: "kw", note: "Murattal Tartil", featured: true, cdn: "aqc", aqcEdition: "ar.alafasy", eyId: "Alafasy_128kbps", r2Folder: "alafasy" },
  { key: "ar.ahmedajamy", name: "Ahmed Al-Ajami", flag: "🇰🇼", country: "Kuwait", cc: "kw", note: "Murattal", cdn: "aqc", aqcEdition: "ar.ahmedajamy", r2Folder: "ajmy" },
  // Mesir — alquran.cloud
  { key: "ar.abdulbasitmurattal", name: "Abdul Basit Abd us-Samad", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", featured: true, cdn: "aqc", aqcEdition: "ar.abdulbasitmurattal", r2Folder: "abdulbasit-murattal" },
  { key: "ar.husary", name: "Mahmoud Khalil Al-Husary", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", featured: true, cdn: "aqc", aqcEdition: "ar.husary", r2Folder: "husary" },
  { key: "ar.husarymujawwad", name: "Al-Husary (Mujawwad)", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Mujawwad", cdn: "aqc", aqcEdition: "ar.husarymujawwad", r2Folder: "husary-mujawwad" },
  { key: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", featured: true, cdn: "aqc", aqcEdition: "ar.minshawi", r2Folder: "minshawi" },
  { key: "ar.minshawimujawwad", name: "Al-Minshawi (Mujawwad)", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Mujawwad", cdn: "aqc", aqcEdition: "ar.minshawimujawwad", r2Folder: "minshawi-mujawwad" },
  { key: "ar.muhammadjibreel", name: "Muhammad Jibreel", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", cdn: "aqc", aqcEdition: "ar.muhammadjibreel", r2Folder: "jibreel" },
  { key: "ey.tablawi", name: "Muhammad Al-Tablawi", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", cdn: "ey", eyId: "Mohammad_al_Tablawi_128kbps", r2Folder: "tablawi" },
  // Libya
  { key: "ar.aymansuwayd", name: "Ayman Suwayd", flag: "🇱🇾", country: "Libya", cc: "ly", note: "Murattal Hafalan", cdn: "aqc", aqcEdition: "ar.aymanswoaid", r2Folder: "sowaid" },
  // Qatar
  { key: "ey.qatami", name: "Nasser Al-Qatami", flag: "🇶🇦", country: "Qatar", cc: "qa", note: "Murattal", cdn: "ey", eyId: "Nasser_Alqatami_128kbps", r2Folder: "qatami" },
  // Emirat Arab
  { key: "ey.tunaiji", name: "Khalifa Al-Tunaiji", flag: "🇦🇪", country: "Emirat Arab", cc: "ae", note: "Murattal", cdn: "ey", eyId: "khalefa_al_tunaiji_64kbps", r2Folder: "tunaiji" },
  { key: "ey.bukhatir", name: "Salah Bukhatir", flag: "🇦🇪", country: "Emirat Arab", cc: "ae", note: "Murattal", cdn: "ey", eyId: "Salaah_AbdulRahman_Bukhatir_128kbps", r2Folder: "bukhatir" },
  // Suara anak — the classic "Al-Minshawi teaching children" recording, where
  // the sheikh reads a phrase and a children's choir repeats it. Free on
  // everyayah, per-ayah, and the gentlest voice to learn from, so Al-Qur'an
  // Kids offers it as its own reciter. No R2 folder on purpose: it streams
  // straight from the CDN rather than adding another 6,236-file library.
  { key: "ey.minshawi_children", name: "Al-Minshawi & Anak-anak", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Suara anak — ikuti bacaan", cdn: "ey", eyId: "Minshawy_Children_128kbps" },

  // Tambahan — cakupan lebih luas (per-ayat, everyayah.com)
  { key: "ey.juhany", name: "Abdullah Awad Al-Juhany", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Imam Masjidil Haram, Makkah", featured: true, cdn: "ey", eyId: "Abdullaah_3awwaad_Al-Juhaynee_128kbps", r2Folder: "juhany" },
  { key: "ey.ghamdi", name: "Saad Al-Ghamdi", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal Tartil", featured: true, cdn: "ey", eyId: "Ghamadi_40kbps", r2Folder: "ghamdi" },
  { key: "ey.alijaber", name: "Ali Jaber", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Ali_Jaber_64kbps", r2Folder: "alijaber" },
  { key: "ey.akhdar", name: "Ibrahim Al-Akhdar", flag: "🇸🇦", country: "Arab Saudi", cc: "sa", note: "Murattal", cdn: "ey", eyId: "Ibrahim_Akhdar_32kbps", r2Folder: "akhdar" },
  { key: "ey.banna", name: "Mahmoud Ali Al-Banna", flag: "🇪🇬", country: "Mesir", cc: "eg", note: "Murattal", cdn: "ey", eyId: "mahmoud_ali_al_banna_32kbps", r2Folder: "banna" },
  { key: "ey.faresabbad", name: "Fares Abbad", flag: "🇾🇪", country: "Yaman", cc: "ye", note: "Murattal", featured: true, cdn: "ey", eyId: "Fares_Abbad_64kbps", r2Folder: "fares" },
  { key: "ey.mansouri", name: "Karim Mansouri", flag: "🇩🇿", country: "Aljazair", cc: "dz", note: "Murattal", featured: true, cdn: "ey", eyId: "Karim_Mansoori_40kbps", r2Folder: "mansoori" },
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
  xad: ["ey", "aqc"], // England-facing English site — everyayah first
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

// Cache-bust token for the api.ulyah.com murottal URL. Bytes served under it
// during the R2 era went out immutable (1-year), in browsers and at
// Cloudflare's edge, and an immutable entry can never be corrected in place —
// only a NEW URL escapes it. So this token is how a muffled copy is abandoned.
// v5: that URL no longer serves bytes at all, it redirects to the reciter's own
// CDN (see worker-api routes/audio.ts). Bumping past 4 walks away from every
// entry still holding the old library's audio, including the low-bitrate
// objects stored during the #98→#100 window.
export const MUROTTAL_VERSION = 5;

/**
 * Pure-formula per-ayah URL through api.ulyah.com, which redirects to the
 * reciter's CDN. Zero metadata fetches, so it always resolves — that is why it
 * stays in the source list as the BACKSTOP behind the direct CDN URLs, not
 * because anything of ours is stored behind it any more.
 *
 * The ?v token is kept: old browser and edge entries under this URL may still
 * hold bytes from the R2 era, and only a new URL escapes an immutable cache.
 */
export function apiAyahAudioUrl(qoriKey: string, surah: number, ayah: number): string | null {
  const rc = RECITERS.find((r) => r.key === qoriKey) ?? RECITERS.find((r) => r.key === DEFAULT_QORI_KEY)!;
  if (!rc.r2Folder) return null;
  return `${API_BASE}/audio/qori2/${rc.r2Folder}/${pad3(surah)}${pad3(ayah)}.mp3?v=${MUROTTAL_VERSION}`;
}

/** Resolve the playable URL for one ayah's recitation, or null if this
 * reciter doesn't publish per-ayah audio (surah-mode reciters). Callers
 * already treat null the same as "not available" and fall through to the
 * narrated layers, so no reciter ever leaves the player silently stuck.
 * This is the DIRECT-CDN resolver, and it is what players get FIRST — see
 * resolveAyahAudioSources(). */
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

/**
 * Ordered playable sources for one ayah: the reciter's own CDN first, then the
 * api.ulyah.com redirect as a backstop. Players walk the list on error, so a
 * single bad source never silences playback.
 *
 * The order is the reverse of what it used to be. Our R2 copy came first for
 * years because the direct CDNs had gone quiet on us before ("radio bisu"); the
 * copy is being deleted (owner: "hilangin audio2 alquran murottal ganti dengan
 * cdn"), so the CDN leads and the redirect covers the case the copy used to
 * cover — an alquran.cloud metadata lookup that fails or is slow, where the
 * redirect still resolves from a pure formula.
 */
export async function resolveAyahAudioSources(qoriKey: string, surah: number, ayah: number): Promise<string[]> {
  const sources: string[] = [];
  try {
    const cdn = await resolveAyahAudioUrl(qoriKey, surah, ayah);
    if (cdn) sources.push(cdn);
  } catch {
    /* the backstop below still resolves */
  }
  const viaApi = apiAyahAudioUrl(qoriKey, surah, ayah);
  if (viaApi && !sources.includes(viaApi)) sources.push(viaApi);
  return sources;
}

/**
 * The same ordered list, resolved WITHOUT waiting for anything.
 *
 * A browser only lets audio start inside the gesture that asked for it. The
 * moment a player awaits a metadata lookup before setting `src`, the tap that
 * started it has expired and the first play is blocked — on a page built for
 * children, that is a play button that does nothing.
 *
 * So this returns only the sources that come from a formula: the reciter's
 * everyayah URL when they have one, then the api.ulyah.com redirect, which is
 * a formula too (and, being a redirect, still ends at the reciter's CDN). A
 * reciter published solely through alquran.cloud has just the redirect — which
 * is exactly the case the redirect was kept for.
 */
export function ayahAudioSourcesSync(qoriKey: string, surah: number, ayah: number): string[] {
  const rc = RECITERS.find((r) => r.key === qoriKey) ?? RECITERS.find((r) => r.key === DEFAULT_QORI_KEY)!;
  const out: string[] = [];
  if (rc.eyId) out.push(buildEyUrl(rc.eyId, surah, ayah));
  const viaApi = apiAyahAudioUrl(rc.key, surah, ayah);
  if (viaApi && !out.includes(viaApi)) out.push(viaApi);
  return out;
}

/**
 * One continuous file for a whole surah, for the RADIO.
 *
 * Owner: "radio bisa g bacanya jgn yg per ayat… jd putus2 dengernya kurang
 * bagus". The radio was stitching one ayah at a time — thirty-two of the
 * thirty-three reciters have only per-ayah audio — and every join is a fetch,
 * a decode and a gap. Six short ayah in a row is six gaps, which is what makes
 * it sound broken rather than recited.
 *
 * A surah file has no joins at all. islamic.network publishes `audio-surah`
 * beside the `audio` path the per-ayah URLs already come from, cut from the
 * same masters, so every alquran.cloud reciter has one at the same 128 kbps.
 *
 * This URL is NOT verified from CI — outbound audio fetches are blocked here,
 * including the per-ayah URL that is known to work — so the caller must treat
 * it as a source that MIGHT 404 and keep the per-ayah list behind it. The
 * player does exactly that, and decides how far to advance from which source
 * actually played rather than from this function's existence.
 */
export function resolveRadioSurahUrl(qoriKey: string, surah: number): string | null {
  const rc = RECITERS.find((r) => r.key === qoriKey);
  if (!rc) return null;
  if (rc.cdn === "surah" && rc.surahFn) return rc.surahFn(surah);
  // Same host and bitrate as the per-ayah path this reciter already uses, so
  // nothing new has to be reachable for it to work.
  if (rc.cdn === "aqc" && rc.aqcEdition) {
    return `https://cdn.islamic.network/quran/audio-surah/128/${rc.aqcEdition}/${surah}.mp3`;
  }
  // everyayah publishes per-ayah only — those reciters keep the stitched mode.
  return null;
}
