/**
 * Arabic scripture must survive translation untouched.
 *
 * Measured in the live cache before this guard existed: 232 Spanish rows had
 * the Arabic matn of a hadith DELETED and replaced with a Spanish pious phrase,
 * because the translator recognised the Arabic and rendered it. One read:
 *
 *     De Tamim Ad-De … dijo:
 *     si dios quiere                  <- the words of the Prophet, gone
 *     "La religion es un consejo ..."
 *     Fuente: RRHH. Musulman no. 55.  <- RRHH is the HR department
 *
 * No prompt binds gtx, and the on-demand path uses it, so the only guarantee is
 * to hide the script before the text is sent and put it back afterwards. This
 * checks the masking round-trips exactly and leaves nothing for a translator to
 * find.
 *
 *   node scripts/check-arabic-preserved.mjs
 */
const ARABIC_RUN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]+(?:[\s؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]*[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿])?/g;
function mask(text) {
  const map = [];
  const out = text.replace(ARABIC_RUN, (m) => { const i = map.length; map.push(m); return `@@${i}@@`; });
  return { masked: out, map };
}
function restore(text, map) { return text.replace(/@@\s*(\d+)\s*@@/g, (_, d) => map[Number(d)] ?? ""); }

const cases = [
  'Dari Tamim Ad-Dari, Rasulullah bersabda:\n\nالدِّينُ النَّصِيحَةُ\n\n"Agama itu nasihat"',
  'HR. Bukhari no. 1 & Muslim no. 1907',
  'Bacaan: بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ — artinya "Dengan nama Allah"',
  'Tidak ada teks Arab di sini sama sekali.',
];
let bad = 0;
for (const c of cases) {
  const { masked, map } = mask(c);
  const back = restore(masked, map);
  const arabicLeft = /[؀-ۿ]/.test(masked);
  const ok = back === c && !arabicLeft;
  if (!ok) bad++;
  console.log(`${ok ? "ok  " : "FAIL"} round-trip=${back === c} arabic-hidden=${!arabicLeft} runs=${map.length}`);
  console.log(`     ${JSON.stringify(masked.slice(0, 78))}`);
}
console.log(bad ? `\narabic preservation FAILED (${bad})` : "\narabic preservation: ok");
if (bad) process.exit(1);
