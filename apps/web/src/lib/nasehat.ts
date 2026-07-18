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

const FR: string[] = [
  "Prier à l'heure apporte la paix au cœur.",
  "Les meilleurs des hommes sont les plus utiles aux autres.",
  "La patience n'est pas le silence — c'est rester serein dans l'épreuve.",
  "Commence ta journée par une invocation, termine-la par la gratitude.",
  "Une petite aumône régulière vaut mieux qu'une grande mais rare.",
  "Garde ta langue — le silence est parfois plus sage que la parole.",
  "La science sans pratique est un arbre sans fruit.",
  "Pardonne volontiers ; un cœur ouvert trouve la paix plus vite.",
  "La subsistance ne se trompe jamais de destinataire — œuvre, puis remets-t'en à Dieu.",
  "Entretenir les liens familiaux élargit la subsistance et allonge la vie.",
  "La gratitude pour le peu attire davantage de bien.",
  "L'invocation est l'arme du croyant — ne cesse jamais de demander.",
  "Une bonne action cachée est souvent la plus sincère.",
  "Le temps perdu ne revient jamais — remplis-le de bien.",
  "Un cœur pur rend chaque pas vers le bien plus facile.",
  "Fais de chaque difficulté un chemin qui te rapproche de Dieu.",
];

const DE: string[] = [
  "Pünktliches Gebet bringt dem Herzen Frieden.",
  "Die besten Menschen sind die, die anderen am meisten nützen.",
  "Geduld ist nicht Schweigen — sie ist Ruhe in der Prüfung.",
  "Beginne deinen Tag mit einem Bittgebet, beende ihn mit Dankbarkeit.",
  "Eine kleine, regelmäßige Spende wiegt mehr als eine große, seltene.",
  "Hüte deine Zunge — Schweigen ist manchmal weiser als Worte.",
  "Wissen ohne Handeln ist ein Baum ohne Frucht.",
  "Vergib großzügig; ein weites Herz findet schneller Frieden.",
  "Die Versorgung verfehlt nie ihren Empfänger — bemühe dich und vertraue.",
  "Familienbande pflegen weitet die Versorgung und verlängert das Leben.",
  "Dankbarkeit für das Kleine lädt Größeres ein.",
  "Das Bittgebet ist die Waffe des Gläubigen — höre nie auf zu bitten.",
  "Eine verborgene gute Tat ist oft die aufrichtigste.",
  "Verlorene Zeit kehrt nie zurück — fülle sie mit Gutem.",
  "Ein reines Herz erleichtert jeden Schritt zum Guten.",
  "Mache jede Härte zu einem Weg näher zu Gott.",
];

const ES: string[] = [
  "Rezar a tiempo trae paz al corazón.",
  "Las mejores personas son las que más benefician a los demás.",
  "La paciencia no es silencio — es mantener la calma en la prueba.",
  "Comienza tu día con una súplica, termínalo con gratitud.",
  "Una caridad pequeña y constante vale más que una grande pero rara.",
  "Cuida tu lengua — el silencio a veces es más sabio que las palabras.",
  "El conocimiento sin práctica es un árbol sin fruto.",
  "Perdona con generosidad; un corazón abierto encuentra antes la paz.",
  "El sustento nunca se equivoca de destinatario — esfuérzate y confía.",
  "Mantener los lazos familiares amplía el sustento y alarga la vida.",
  "La gratitud por lo pequeño invita a lo más grande.",
  "La súplica es el arma del creyente — nunca dejes de pedir.",
  "Una buena obra oculta suele ser la más sincera.",
  "El tiempo perdido nunca vuelve — llénalo de bien.",
  "Un corazón limpio facilita cada paso hacia el bien.",
  "Convierte cada dificultad en un camino que te acerque a Dios.",
];

const MAP: Record<string, string[]> = { en: EN, id: ID, ar: AR, fr: FR, de: DE, es: ES };

export function nasehatList(locale: string): string[] {
  return MAP[locale] ?? EN;
}
