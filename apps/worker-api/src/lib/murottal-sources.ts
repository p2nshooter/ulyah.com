/**
 * Murottal source registry — the ONE mapping from a reciter's folder name to
 * where that reciter's per-ayah 128 kbps MP3s actually live.
 *
 * The owner's decision: "hilangin audio2 alquran murottal ganti dengan cdn."
 * There is no stored library any more — the players go to these CDNs directly
 * (apps/web/src/lib/qori-cdn.ts) and /audio/qori2/… redirects here rather than
 * serving bytes of ours. The folder names outlive the R2 prefix they were named
 * after, because they are also what the old urls carry and what the redirect
 * resolves with.
 *
 *   kind "aqc" — cdn.islamic.network (alquran.cloud), addressed by GLOBAL
 *                ayah number 1..6236, preferring the 128 kbps path (the
 *                lower default bitrates are the muffled "mendem" audio the
 *                owner reported).
 *   kind "ey"  — everyayah.com, addressed by <SSS><AAA>.mp3.
 */

export interface MurottalSource {
  kind: "aqc" | "ey";
  /** alquran.cloud edition id (kind "aqc"). */
  edition?: string;
  /** everyayah.com folder (kind "ey"). */
  folder?: string;
  /** Human name, used when auto-creating the qori DB row. */
  name: string;
}

// Folder → source. Folders match qori.audio_base_path ('audio/qori/<folder>')
// in D1 and the r2Folder values in apps/web/src/lib/qori-cdn.ts. Keep the three
// in sync when adding a reciter: the pair is what turns an old /audio/qori2/…
// url into a CDN file.
export const MUROTTAL_SOURCES: Record<string, MurottalSource> = {
  alafasy: { kind: "aqc", edition: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  sudais: { kind: "aqc", edition: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais" },
  muaiqly: { kind: "aqc", edition: "ar.mahermuaiqly", name: "Maher Al Muaiqly" },
  shuraym: { kind: "aqc", edition: "ar.saoodshuraym", name: "Saud Al-Shuraim" },
  hudhaify: { kind: "aqc", edition: "ar.hudhaify", name: "Ali Al-Hudhaify" },
  ayyoub: { kind: "aqc", edition: "ar.muhammadayyoub", name: "Muhammad Ayyub" },
  shatri: { kind: "aqc", edition: "ar.shaatree", name: "Abu Bakr Al-Shatri" },
  basfar: { kind: "aqc", edition: "ar.abdullahbasfar", name: "Abdullah Basfar" },
  rifai: { kind: "aqc", edition: "ar.hanirifai", name: "Hani Ar-Rifai" },
  minshawi: { kind: "aqc", edition: "ar.minshawi", name: "Muhammad Siddiq Al-Minshawi" },
  "minshawi-mujawwad": { kind: "aqc", edition: "ar.minshawimujawwad", name: "Al-Minshawi (Mujawwad)" },
  husary: { kind: "aqc", edition: "ar.husary", name: "Mahmoud Khalil Al-Husary" },
  "husary-mujawwad": { kind: "aqc", edition: "ar.husarymujawwad", name: "Al-Husary (Mujawwad)" },
  "abdulbasit-murattal": { kind: "aqc", edition: "ar.abdulbasitmurattal", name: "Abdul Basit Abdul Samad (Murattal)" },
  "abdulbasit-mujawwad": { kind: "aqc", edition: "ar.abdulbasitmurattal", name: "Abdul Basit Abdul Samad (Mujawwad)" },
  ajmy: { kind: "aqc", edition: "ar.ahmedajamy", name: "Ahmed Al-Ajmy" },
  jibreel: { kind: "aqc", edition: "ar.muhammadjibreel", name: "Muhammad Jibreel" },
  sowaid: { kind: "aqc", edition: "ar.aymanswoaid", name: "Ayman Sowaid" },
  qasim: { kind: "aqc", edition: "ar.muhammadalmuhaisany", name: "Muhsin Al-Qasim" },
  tablawi: { kind: "ey", folder: "Mohammad_al_Tablawi_128kbps", name: "Mohammad Al-Tablawi" },
  dosari: { kind: "ey", folder: "Yasser_Ad-Dussary_128kbps", name: "Yasser Al-Dosari" },
  qatami: { kind: "ey", folder: "Nasser_Alqatami_128kbps", name: "Nasser Al Qatami" },
  bukhatir: { kind: "ey", folder: "Salaah_AbdulRahman_Bukhatir_128kbps", name: "Salah Bukhatir" },
  tunaiji: { kind: "ey", folder: "khalefa_al_tunaiji_64kbps", name: "Khalifa Al-Tunaiji" },
  matroud: { kind: "ey", folder: "Abdullah_Matroud_128kbps", name: "Abdullah Al-Matroud" },
  juhany: { kind: "ey", folder: "Abdullaah_3awwaad_Al-Juhaynee_128kbps", name: "Abdullah Awad Al-Juhany" },
  // 128 kbps is not published for these voices — their native bitrate is the
  // best that exists anywhere, so a lower number here is not a poisoned file.
  // (They are served by everyayah like the rest; nothing is self-hosted now.)
  ghamdi: { kind: "ey", folder: "Ghamadi_40kbps", name: "Saad Al-Ghamdi" },
  fares: { kind: "ey", folder: "Fares_Abbad_64kbps", name: "Fares Abbad" },
  alijaber: { kind: "ey", folder: "Ali_Jaber_64kbps", name: "Ali Jaber" },
  akhdar: { kind: "ey", folder: "Ibrahim_Akhdar_32kbps", name: "Ibrahim Al-Akhdar" },
  banna: { kind: "ey", folder: "mahmoud_ali_al_banna_32kbps", name: "Mahmoud Ali Al-Banna" },
  mansoori: { kind: "ey", folder: "Karim_Mansoori_40kbps", name: "Karim Mansouri" },
};

// Hafs/Madinah mushaf ayah count per surah (1..114) — sums to 6236. Used to
// turn (surah, ayah) into the GLOBAL ayah number cdn.islamic.network expects,
// with zero DB reads on the hot audio path.
export const SURAH_AYAH_COUNTS: number[] = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

const CUMULATIVE: number[] = (() => {
  const out: number[] = [0];
  for (let i = 0; i < SURAH_AYAH_COUNTS.length; i++) out.push(out[i]! + SURAH_AYAH_COUNTS[i]!);
  return out;
})();

/** Global (mushaf) ayah number 1..6236, or null when out of range. */
export function globalAyahNumber(surah: number, ayah: number): number | null {
  if (surah < 1 || surah > 114) return null;
  const count = SURAH_AYAH_COUNTS[surah - 1]!;
  if (ayah < 1 || ayah > count) return null;
  return CUMULATIVE[surah - 1]! + ayah;
}

/** Ordered list of source-CDN URLs to try for one ayah of one folder —
 * highest bitrate first, so a cache-fill always stores the cleanest audio
 * that exists for this reciter. */
export function sourceUrlCandidates(folder: string, surah: number, ayah: number): string[] {
  const src = MUROTTAL_SOURCES[folder];
  if (!src) return [];
  if (src.kind === "ey" && src.folder) {
    const pad3 = (n: number) => String(n).padStart(3, "0");
    return [`https://everyayah.com/data/${src.folder}/${pad3(surah)}${pad3(ayah)}.mp3`];
  }
  if (src.kind === "aqc" && src.edition) {
    const g = globalAyahNumber(surah, ayah);
    if (!g) return [];
    // Not every edition is published at every bitrate. 128 first (the
    // rotation's standard), then 192 — several editions (e.g. Abdul Basit
    // murattal) skip 128 but publish 192, and a cache-fill is PERMANENT
    // (stored to R2 + edge-cached immutable), so it must never settle for
    // 64 kbps when a HiFi encode exists. Low bitrates remain the last resort
    // for voices published no other way.
    return [128, 192, 64, 48, 32].map((b) => `https://cdn.islamic.network/quran/audio/${b}/${src.edition}/${g}.mp3`);
  }
  return [];
}

/** The bitrate (kbps) this reciter's TOP source publishes. aqc reciters are
 * addressed through the forced 128 kbps path; ey reciters carry their bitrate
 * in the everyayah folder name (a few voices only exist at 40/64 kbps — that IS
 * their HiFi, never "poisoned"). Used by the bulk importer, which is the only
 * thing left that can write an audio file anywhere. */
export function expectedHiFiKbps(folder: string): number | null {
  const src = MUROTTAL_SOURCES[folder];
  if (!src) return null;
  if (src.kind === "aqc") return 128;
  const m = /(\d+)\s*kbps/i.exec(src.folder ?? "");
  return m ? Number(m[1]) : null;
}
