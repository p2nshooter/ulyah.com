/**
 * Minimal MP3 bitrate sniffer for the murottal library's self-audit.
 *
 * WHY THIS EXISTS: between the qori2 clean-slate (#98) and the "never persist
 * a fallback fill" fix (#100) there was a window where a low-bitrate fallback
 * (64/48/32 kbps) COULD be stored permanently into audio/qori2/ and then
 * served forever as if it were HiFi — R2 objects are trusted blindly on the
 * hot path. Those poisoned objects are exactly the muffled "mendem, kaya
 * kaset kusut" audio still reported on dawa.es / xad.es after every cache
 * fix, because no cache-bust can repair wrong BYTES in R2 itself.
 *
 * The audio route now sniffs the real frame bitrate of every R2 object it is
 * about to serve (cheap: a few header bytes of an already-buffered small
 * file) and, when the object is below the reciter's published HiFi bitrate,
 * treats it as a miss so the normal tier-3 fill re-fetches the true 128 kbps
 * file and overwrites the poisoned object. The library heals itself the
 * first time anyone plays the damaged ayah.
 */

// bitrate tables (kbps), index 1..14 — index 0 is "free", 15 is invalid.
const BITRATE_MPEG1_L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BITRATE_MPEG2_L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SAMPLE_RATES: Record<number, number[]> = {
  3: [44100, 48000, 32000], // MPEG1
  2: [22050, 24000, 16000], // MPEG2
  0: [11025, 12000, 8000], // MPEG2.5
};

interface Mp3Frame {
  kbps: number;
  frameLength: number;
}

function parseFrameHeader(u8: Uint8Array, i: number): Mp3Frame | null {
  if (i + 4 > u8.length) return null;
  const b1 = u8[i]!;
  const b2 = u8[i + 1]!;
  const b3 = u8[i + 2]!;
  if (b1 !== 0xff || (b2 & 0xe0) !== 0xe0) return null;
  const versionBits = (b2 >> 3) & 0x3; // 0=MPEG2.5, 1=reserved, 2=MPEG2, 3=MPEG1
  const layerBits = (b2 >> 1) & 0x3; // 1 = Layer III
  if (versionBits === 1 || layerBits !== 1) return null;
  const bitrateIdx = (b3 >> 4) & 0xf;
  const sampleIdx = (b3 >> 2) & 0x3;
  if (bitrateIdx === 0 || bitrateIdx === 15 || sampleIdx === 3) return null;
  const kbps = (versionBits === 3 ? BITRATE_MPEG1_L3 : BITRATE_MPEG2_L3)[bitrateIdx]!;
  const sampleRate = SAMPLE_RATES[versionBits]?.[sampleIdx];
  if (!kbps || !sampleRate) return null;
  const padding = (b3 >> 1) & 0x1;
  // Layer III frame size: 144 * bitrate / samplerate for MPEG1, half the
  // samples-per-frame (72 *) for MPEG2/2.5.
  const coef = versionBits === 3 ? 144000 : 72000;
  const frameLength = Math.floor((coef * kbps) / sampleRate) + padding;
  if (frameLength < 24) return null;
  return { kbps, frameLength };
}

/**
 * Best-effort real bitrate (kbps) of an MP3 buffer, or null when no
 * consistent frame sequence is found (corrupt/unknown data — callers must
 * NOT treat null as low bitrate, or unparseable-but-fine files would be
 * re-fetched on every single play).
 *
 * Reads up to the first few consecutive frames and returns the MAXIMUM frame
 * bitrate seen: for the CBR files both source CDNs publish this IS the
 * bitrate, and for anything VBR-ish the max errs on the side of "not
 * poisoned" so a healthy file is never refetched in a loop.
 */
export function sniffMp3Kbps(buf: ArrayBuffer): number | null {
  const u8 = new Uint8Array(buf);
  let i = 0;
  // Skip an ID3v2 tag (syncsafe 28-bit size at bytes 6..9).
  if (u8.length > 10 && u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33) {
    const size = ((u8[6]! & 0x7f) << 21) | ((u8[7]! & 0x7f) << 14) | ((u8[8]! & 0x7f) << 7) | (u8[9]! & 0x7f);
    i = 10 + size;
  }
  const scanEnd = Math.min(u8.length - 4, i + 65536);
  for (; i <= scanEnd; i++) {
    const first = parseFrameHeader(u8, i);
    if (!first) continue;
    // Require the chain to keep parsing where each frame says the next one
    // starts — that rules out false syncs inside tag/art data.
    let maxKbps = first.kbps;
    let pos = i + first.frameLength;
    let verified = 0;
    for (let f = 0; f < 4 && pos + 4 <= u8.length; f++) {
      const next = parseFrameHeader(u8, pos);
      if (!next) break;
      verified++;
      if (next.kbps > maxKbps) maxKbps = next.kbps;
      pos = pos + next.frameLength;
    }
    if (verified >= 2 || pos >= u8.length) return maxKbps;
    // false sync — keep scanning
  }
  return null;
}
