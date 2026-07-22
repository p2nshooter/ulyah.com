/**
 * Murottal source registry — the ONE mapping from an R2 folder
 * (audio/qori/<folder>/) to where that reciter's per-ayah 128 kbps MP3s can
 * be fetched when a file is not (yet) in R2.
 *
 * The owner's decision: R2 is the PRIMARY player source for the radio, the
 * per-ayah Qur'an reader and the Mushaf Utsmani ("rencana menggunakan R2
 * sebagai pemutar suara radio, alquran per ayat dan alquran usmani"). The
 * bulk importer (scripts/import-murottal.mjs) fills the library to 100%;
 * this registry additionally lets the /audio/qori route self-heal any gap
 * on demand: R2 miss → fetch from the source CDN below → stream to the
 * listener AND store into R2 so the next play is served from R2.
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
// and the r2Folder values in apps/web/src/lib/qori-cdn.ts. Keep the three in
// sync when adding a reciter.
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
  tunaiji: { kind: "ey", folder: "khalefa_al_tunaiji_128kbps", name: "Khalifa Al-Tunaiji" },
  matroud: { kind: "ey", folder: "Abdullah_Matroud_128kbps", name: "Abdullah Al-Matroud" },
  juhany: { kind: "ey", folder: "Abdullaah_3awwaad_Al-Juhaynee_128kbps", name: "Abdullah Awad Al-Juhany" },
  // 128 kbps is not published for these voices — their native bitrate is the
  // best that exists anywhere; still self-hosted so playback never depends on
  // a third-party CDN staying up.
  ghamdi: { kind: "ey", folder: "Ghamadi_40kbps", name: "Saad Al-Ghamdi" },
  fares: { kind: "ey", folder: "Fares_Abbad_64kbps", name: "Fares Abbad" },
  alijaber: { kind: "ey", folder: "Ali_Jaber_64kbps", name: "Ali Jaber" },
  akhdar: { kind: "ey", folder: "Ibrahim_Akhdar_32kbps", name: "Ibrahim Al-Akhdar" },
  banna: { kind: "ey", folder: "mahmoud_ali_al_banna_32kbps", name: "Mahmoud Ali Al-Banna" },
  mansoori: { kind: "ey", folder: "Karim_Mansouri_128kbps", name: "Karim Mansouri" },
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
    // Not every edition is published at every bitrate — walk down from HiFi.
    return [128, 64, 48, 32].map((b) => `https://cdn.islamic.network/quran/audio/${b}/${src.edition}/${g}.mp3`);
  }
  return [];
}
