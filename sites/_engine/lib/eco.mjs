/**
 * The ecosystem band at the foot of every page of every article site (owner, 23 Nov 2026):
 *   „Promosikan axto.io dengan bahasa yg elegan, profesional dan tempat yg enak di pandang dan NFT bergulir random
 *    misal 5-10 NFT random bergulir semua stock NFT exclusive, promosikan di seluruh website artikel, promosikan juga
 *    luaja.com, sederhana aja, ambil animasi model di luaja.com dan tambahkan text promosi, bikin seperti banner berjalan"
 *
 * One band, above the footer, outside the article: an AXTO card (a few words and a row of 5–10 exclusive works drawn at
 * random on every view by assets/engine-eco.js) and a LUAJA running banner (luaja.com's guide, waving, beside a ticker).
 * The partner sites outside this repository (axto.us and the five Next.js sites) carry the same band, generated from
 * this file, so every article site of the network shows it alike.
 * It is plainly labelled as the network's own projects, carries two static links (no link scheme: the works are added
 * by the script, outside the article), and every word below is true of the two sites today.
 */

const COPY = {
  en: {
    label: "From our network",
    kicker: "AXTO · Exclusive edition",
    title: "Living art, born only once.",
    lead: "Animated 1/1 originals on Base — ticking clocks, moving stamps, Qur'an calligraphy, hadith and model figures. Each work grows from its own mathematical DNA and is never repeated.",
    cta: "Discover the exclusive collection",
    rail: "A random selection from the exclusive AXTO edition",
    names: { "ex-time": "AXTO Time", "ex-stamp": "AXTO Stamp", "ex-quran": "AXTO Qur'an", "ex-model": "AXTO Model", "ex-hadith": "AXTO Hadith" },
    luaja: "LUAJA — learn languages online",
    ticker: ["<b>LUAJA</b> · Learn Without Limits", "German, English and Japanese, level by level", "TOEFL and IELTS preparation", "Interactive lessons, audio and a digital library", "<b>Start at luaja.com →</b>"],
  },
  de: {
    label: "Aus unserem Netzwerk",
    kicker: "AXTO · Exklusive Edition",
    title: "Lebendige Kunst – nur einmal geboren.",
    lead: "Animierte 1/1-Originale auf Base: tickende Uhren, bewegte Briefmarken, Koran-Kalligrafie, Hadithe und Modellfiguren. Jedes Werk entsteht aus seiner eigenen mathematischen DNA und wird nie wiederholt.",
    cta: "Exklusive Kollektion entdecken",
    rail: "Eine zufällige Auswahl aus der exklusiven AXTO-Edition",
    names: { "ex-time": "AXTO Zeit", "ex-stamp": "AXTO Briefmarke", "ex-quran": "AXTO Koran", "ex-model": "AXTO Modell", "ex-hadith": "AXTO Hadith" },
    luaja: "LUAJA – Sprachen online lernen",
    ticker: ["<b>LUAJA</b> · Lernen ohne Grenzen", "Deutsch, Englisch und Japanisch – Stufe für Stufe", "Vorbereitung auf TOEFL und IELTS", "Interaktive Lektionen, Audio und eine digitale Bibliothek", "<b>Jetzt starten auf luaja.com →</b>"],
  },
  es: {
    label: "De nuestra red",
    kicker: "AXTO · Edición exclusiva",
    title: "Arte vivo, nacido una sola vez.",
    lead: "Originales 1/1 animados en Base: relojes que laten, sellos en movimiento, caligrafía del Corán, hadices y figuras de modelo. Cada obra nace de su propio ADN matemático y nunca se repite.",
    cta: "Descubrir la colección exclusiva",
    rail: "Una selección al azar de la edición exclusiva de AXTO",
    names: { "ex-time": "AXTO Tiempo", "ex-stamp": "AXTO Sello", "ex-quran": "AXTO Corán", "ex-model": "AXTO Modelo", "ex-hadith": "AXTO Hadiz" },
    luaja: "LUAJA: aprende idiomas en línea",
    ticker: ["<b>LUAJA</b> · Aprende sin límites", "Alemán, inglés y japonés, nivel a nivel", "Preparación para TOEFL e IELTS", "Lecciones interactivas, audio y una biblioteca digital", "<b>Empieza en luaja.com →</b>"],
  },
  fr: {
    label: "De notre réseau",
    kicker: "AXTO · Édition exclusive",
    title: "Un art vivant, né une seule fois.",
    lead: "Des originaux 1/1 animés sur Base : horloges qui battent, timbres en mouvement, calligraphie du Coran, hadiths et figures de modèle. Chaque œuvre naît de son propre ADN mathématique et ne se répète jamais.",
    cta: "Découvrir la collection exclusive",
    rail: "Une sélection au hasard de l'édition exclusive AXTO",
    names: { "ex-time": "AXTO Temps", "ex-stamp": "AXTO Timbre", "ex-quran": "AXTO Coran", "ex-model": "AXTO Modèle", "ex-hadith": "AXTO Hadith" },
    luaja: "LUAJA — apprendre les langues en ligne",
    ticker: ["<b>LUAJA</b> · Apprendre sans limites", "Allemand, anglais et japonais, niveau par niveau", "Préparation au TOEFL et à l'IELTS", "Leçons interactives, audio et bibliothèque numérique", "<b>Commencer sur luaja.com →</b>"],
  },
  // oldco.in and profity.in (Hindi + English partner sites) render the band from this copy too.
  hi: {
    label: "हमारे नेटवर्क से",
    kicker: "AXTO · एक्सक्लूसिव संस्करण",
    title: "जीवंत कला, जो बस एक बार जन्म लेती है।",
    lead: "Base पर एनिमेटेड 1/1 मूल कृतियाँ — टिक-टिक करती घड़ियाँ, चलते-फिरते डाक टिकट, क़ुरआन की सुलेख-कला, हदीस और मॉडल आकृतियाँ। हर कृति अपने ही गणितीय DNA से जन्म लेती है और कभी दोहराई नहीं जाती।",
    cta: "एक्सक्लूसिव संग्रह देखें",
    rail: "AXTO के एक्सक्लूसिव संस्करण से एक यादृच्छिक चयन",
    names: { "ex-time": "AXTO समय", "ex-stamp": "AXTO डाक टिकट", "ex-quran": "AXTO क़ुरआन", "ex-model": "AXTO मॉडल", "ex-hadith": "AXTO हदीस" },
    luaja: "LUAJA — ऑनलाइन भाषाएँ सीखें",
    ticker: ["<b>LUAJA</b> · बिना सीमाओं के सीखें", "जर्मन, अंग्रेज़ी और जापानी — स्तर दर स्तर", "TOEFL और IELTS की तैयारी", "इंटरैक्टिव पाठ, ऑडियो और डिजिटल लाइब्रेरी", "<b>luaja.com पर शुरू करें →</b>"],
  },
};

const STYLE =
  "<style>" +
  ".eco{max-width:1120px;margin:56px auto 40px;padding:0 20px;box-sizing:border-box;font-size:16px;line-height:1.5}" +
  ".eco *{box-sizing:border-box}" +
  ".eco__label{margin:0 0 10px;font-size:.74em;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.6}" +
  ".eco-axto{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,330px) minmax(0,1fr);gap:28px;align-items:center;padding:30px;border-radius:24px;" +
  "background:radial-gradient(120% 150% at 0% 0%,#22305a 0%,#0d1326 52%,#070a14 100%);color:#f3eee1;box-shadow:0 20px 50px rgba(7,10,20,.28);isolation:isolate}" +
  ".eco-axto::before{content:\"\";position:absolute;inset:0;border-radius:inherit;padding:1px;background:linear-gradient(135deg,rgba(226,190,106,.75),rgba(226,190,106,0) 40%,rgba(226,190,106,.45));" +
  "-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:-1}" +
  ".eco-axto__kicker{margin:0 0 8px;color:#e2be6a;font-size:.78em;font-weight:700;letter-spacing:.16em;text-transform:uppercase}" +
  ".eco-axto__title{margin:0 0 10px;font-size:clamp(1.35em,2.4vw,1.7em);line-height:1.2;font-weight:700;color:#fffaf0}" +
  ".eco-axto__lead{margin:0 0 20px;font-size:.95em;color:rgba(243,238,225,.82)}" +
  ".eco-axto__cta{display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;background:linear-gradient(135deg,#f0d48a,#c99a3c);color:#16110a!important;" +
  "font-weight:700;font-size:.92em;text-decoration:none!important;box-shadow:0 8px 22px rgba(201,154,60,.32);transition:transform .25s ease,box-shadow .25s ease}" +
  ".eco-axto__cta:hover,.eco-axto__cta:focus-visible{transform:translateY(-2px);box-shadow:0 12px 28px rgba(201,154,60,.45)}" +
  ".eco-rail{position:relative;overflow:hidden;min-height:206px;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}" +
  ".eco-rail__track{display:flex;width:max-content;padding:6px 0 10px}" +
  ".eco-nft{flex:0 0 auto;display:flex;flex-direction:column;gap:8px;width:160px;margin-right:16px;text-decoration:none!important;color:inherit!important;transition:transform .3s ease}" +
  ".eco-nft img{display:block;width:160px;height:160px;border-radius:16px;background:linear-gradient(135deg,#1b2442,#0b0f1d);box-shadow:0 10px 24px rgba(0,0,0,.35),0 0 0 1px rgba(226,190,106,.25)}" +
  ".eco-nft__cap{font-size:.76em;letter-spacing:.02em;color:rgba(243,238,225,.72);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
  ".eco-nft:hover,.eco-nft:focus-visible{transform:translateY(-4px)}" +
  ".eco-nft:hover img,.eco-nft:focus-visible img{box-shadow:0 14px 30px rgba(0,0,0,.45),0 0 0 2px rgba(226,190,106,.7)}" +
  ".eco-luaja{position:relative;display:flex;align-items:center;gap:14px;margin-top:16px;height:92px;padding:0 20px 0 6px;border-radius:20px;overflow:hidden;text-decoration:none!important;" +
  "background:linear-gradient(100deg,#0b1f4d 0%,#1746b8 70%,#2a5fd6 100%);color:#fff!important;box-shadow:0 14px 34px rgba(11,31,77,.25)}" +
  ".eco-luaja__guide{flex:0 0 auto;align-self:flex-end;width:97px;height:104px;margin-bottom:-12px}" +
  ".eco-luaja__guide img{display:block;width:97px;height:104px}" +
  ".eco-ticker{flex:1 1 auto;min-width:0;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}" +
  ".eco-ticker__track{display:flex;width:max-content}" +
  ".eco-ticker__run{display:flex;flex:0 0 auto;white-space:nowrap}" +
  ".eco-ticker__run span{padding-right:22px;font-size:1em;font-weight:600}" +
  ".eco-ticker__run span::after{content:\"✦\";padding-left:22px;color:#ffd766}" +
  ".eco-ticker b{color:#ffd766;font-weight:800}" +
  "@media (prefers-reduced-motion:no-preference){" +
  ".eco-rail.is-on .eco-rail__track{animation:eco-roll var(--eco-dur,48s) linear infinite}" +
  ".eco-rail:hover .eco-rail__track,.eco-rail:focus-within .eco-rail__track{animation-play-state:paused}" +
  ".eco-ticker__track{animation:eco-roll 34s linear infinite}" +
  ".eco-luaja:hover .eco-ticker__track,.eco-luaja:focus-visible .eco-ticker__track{animation-play-state:paused}" +
  "}" +
  "@keyframes eco-roll{from{transform:translateX(0)}to{transform:translateX(-50%)}}" +
  "@media (prefers-reduced-motion:reduce){.eco-rail{overflow-x:auto;scroll-snap-type:x mandatory}.eco-nft{scroll-snap-align:start}.eco-nft[aria-hidden]{display:none}" +
  ".eco-ticker__track{flex-wrap:wrap}.eco-ticker__run[aria-hidden]{display:none}.eco-ticker__run{white-space:normal;flex-wrap:wrap}.eco-luaja{height:auto;min-height:92px;padding-top:10px;padding-bottom:10px}}" +
  "@media (max-width:760px){.eco-axto{grid-template-columns:1fr;padding:24px 20px;gap:20px}.eco-nft,.eco-nft img{width:132px}.eco-nft img{height:132px}.eco-rail{min-height:170px}" +
  ".eco-luaja{height:78px;padding-right:14px}.eco-luaja__guide,.eco-luaja__guide img{width:80px;height:86px}.eco-ticker__run span{font-size:.92em}}" +
  "@media print{.eco{display:none}}" +
  "</style>";

const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The band's HTML for one edition (`lang`: the edition's language), `asset` names the engine files with their version. */
export function ecoBand(lang, asset, { script = true } = {}) {
  const w = COPY[lang] || COPY.en;
  const run = (hidden) =>
    `<span class="eco-ticker__run"${hidden ? ' aria-hidden="true"' : ""}>${w.ticker.map((t) => `<span>${t}</span>`).join("")}</span>`;
  return (
    `<aside class="eco" aria-label="${esc(w.label)}" data-nosnippet>${STYLE}` +
    `<p class="eco__label">${esc(w.label)}</p>` +
    `<div class="eco-axto"><div class="eco-axto__copy"><p class="eco-axto__kicker">${esc(w.kicker)}</p>` +
    `<p class="eco-axto__title">${esc(w.title)}</p><p class="eco-axto__lead">${esc(w.lead)}</p>` +
    `<a class="eco-axto__cta" href="https://axto.io/en/exclusive" target="_blank" rel="noopener">${esc(w.cta)} <span aria-hidden="true">→</span></a></div>` +
    `<div class="eco-rail" data-eco-rail data-axto-lang="en" role="region" aria-label="${esc(w.rail)}" data-labels="${esc(JSON.stringify(w.names))}"></div></div>` +
    `<a class="eco-luaja" href="https://luaja.com/" target="_blank" rel="noopener" aria-label="${esc(w.luaja)}">` +
    `<span class="eco-luaja__guide"><img src="${asset("engine-luaja.svg")}" width="97" height="104" alt="" loading="lazy" decoding="async"></span>` +
    `<span class="eco-ticker"><span class="eco-ticker__track">${run(false)}${run(true)}</span></span></a>` +
    (script ? `<script src="${asset("engine-eco.js")}" defer></script>` : "") +
    `</aside>\n`
  );
}

/** Put the band into a finished page: above the site footer (the first <footer> after </main>), else before </body>. */
export function withEcoBand(html, band) {
  if (html.includes('class="eco"')) return html;
  const main = html.lastIndexOf("</main>");
  const foot = main > -1 ? html.indexOf("<footer", main) : html.search(/<footer[\s>]/);
  if (foot > -1) return html.slice(0, foot) + band + html.slice(foot);
  const body = html.lastIndexOf("</body>");
  return body > -1 ? html.slice(0, body) + band + html.slice(body) : html;
}
