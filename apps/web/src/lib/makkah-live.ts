/**
 * The 24-hour live broadcast from Masjidil Haram on YouTube, linked from every Muslim site (owner, 22 Nov 2026:
 * "tambahkan link youtube live Masjidil harom").
 *
 * The channel is the one the /live hub already carries in slot 101 (migration 0031_live_hub_v2): the Saudi
 * Qur'an channel's always-on broadcast from the Haram. YouTube's `/live` path always opens whatever is on air
 * now, so the link never goes stale when the broadcast restarts with a new video id.
 */
export const MAKKAH_LIVE_CHANNEL = "UCos52azQNBgW63_9uDJoPDA";
export const MAKKAH_LIVE_URL = `https://www.youtube.com/channel/${MAKKAH_LIVE_CHANNEL}/live`;

const LABEL: Record<string, string> = {
  id: "🕋 Live Masjidil Haram",
  en: "🕋 Masjid al-Haram Live",
  fr: "🕋 Masjid al-Haram en direct",
  de: "🕋 Masjid al-Haram live",
  es: "🕋 Masjid al-Haram en directo",
  ar: "🕋 المسجد الحرام مباشر",
};

/** The link's words in the page's language (English for a language without its own). */
export function makkahLiveLabel(locale: string): string {
  return LABEL[locale] ?? LABEL.en!;
}
