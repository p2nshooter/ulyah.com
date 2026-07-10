/**
 * Short, general reminders for the prayer widget's scrolling ticker —
 * everyday wisdom/etiquette, not quoted Qur'an or hadith text (which would
 * need the same sourcing rigor as docs/CONTENT-POLICY.md's narrative
 * content). English is the fallback for locales not listed.
 */

const ID: string[] = [
  "Sholat tepat waktu adalah kunci ketenangan hati.",
  "Sebaik-baik manusia adalah yang paling bermanfaat bagi sesama.",
  "Sabar bukan berarti diam, tapi tetap tenang saat diuji.",
  "Awali harimu dengan doa, akhiri dengan syukur.",
  "Sedekah kecil yang rutin lebih baik dari yang besar tapi jarang.",
  "Jaga lisan, karena diam kadang lebih baik dari berkata-kata.",
  "Ilmu tanpa amal ibarat pohon tanpa buah.",
  "Maafkanlah, karena hati yang lapang mendekatkan pada ketenangan.",
  "Rezeki tak pernah tertukar, tetap ikhtiar dan bertawakal.",
  "Silaturahmi melapangkan rezeki dan memanjangkan usia.",
  "Bersyukur atas yang kecil, mengundang yang lebih besar.",
  "Doa adalah senjata orang beriman — jangan pernah berhenti berdoa.",
  "Kebaikan yang disembunyikan sering kali lebih tulus.",
  "Waktu yang hilang tak pernah kembali, isi dengan kebaikan.",
  "Hati yang bersih memudahkan langkah menuju kebaikan.",
  "Jadikan setiap kesulitan sebagai jalan mendekat kepada Allah.",
];

const EN: string[] = [
  "Praying on time brings peace to the heart.",
  "The best of people are those who benefit others most.",
  "Patience isn't silence — it's staying calm through the test.",
  "Begin your day with prayer, end it with gratitude.",
  "A small, regular charity outweighs a large but rare one.",
  "Guard your tongue — silence is sometimes wiser than words.",
  "Knowledge without practice is a tree without fruit.",
  "Forgive freely; an open heart finds peace faster.",
  "Sustenance is never mistaken for another's — strive, then trust.",
  "Keeping family ties widens provision and lengthens life.",
  "Gratitude for the small invites more of the good.",
  "Prayer is the believer's weapon — never stop asking.",
  "A good deed hidden is often the most sincere.",
  "Lost time never returns — fill it with good.",
  "A clean heart makes every step toward good easier.",
  "Turn every hardship into a path closer to God.",
];

const AR: string[] = [
  "الصلاة في وقتها طمأنينة للقلب.",
  "خير الناس أنفعهم للناس.",
  "الصبر ليس صمتًا، بل ثبات عند الابتلاء.",
  "ابدأ يومك بالدعاء واختمه بالشكر.",
  "صدقة قليلة دائمة خير من كثيرة نادرة.",
  "احفظ لسانك، فالصمت أحيانًا أحكم من الكلام.",
  "العلم بلا عمل كشجرة بلا ثمر.",
  "سامح بسهولة، فالقلب المنشرح أقرب إلى السكينة.",
  "الرزق لا يخطئ صاحبه، فاجتهد وتوكل.",
  "صلة الرحم تبسط الرزق وتطيل العمر.",
  "الشكر على القليل يجلب المزيد من الخير.",
  "الدعاء سلاح المؤمن — لا تكفّ عن الدعاء.",
  "الخير الخفي غالبًا أصدق.",
  "الوقت الضائع لا يعود، فاملأه بالخير.",
  "القلب النقي يسهّل كل خطوة نحو الخير.",
  "اجعل كل شدة طريقًا للقرب من الله.",
];

const MAP: Record<string, string[]> = { en: EN, id: ID, ar: AR };

export function nasehatList(locale: string): string[] {
  return MAP[locale] ?? EN;
}
