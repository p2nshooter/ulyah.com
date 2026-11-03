/* BYOY Nährstoff- und Fruchtfolge-Helfer: Stark-, Mittel- oder Schwachzehrer, Kompostmenge fürs eigene Beet, Pflanzenfamilie
   und Anbaupause – aus unseren Ratgebern zu Zehrern und Fruchtfolge. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "zehrer") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var G = { stark: ["Starkzehrer", [3, 5], "50 bis 80 g Hornspäne pro m², im Sommer Jauche"], mittel: ["Mittelzehrer", [2, 3], "bei Bedarf 30 g Hornspäne pro m²"], schwach: ["Schwachzehrer", [1, 2], "keine zusätzliche Düngung"] };
  var F = {
    kreuz: ["Kreuzblütler", "4 Jahre, bei Kohlhernie deutlich länger"], nacht: ["Nachtschattengewächse", "3 bis 4 Jahre"], kuerbis: ["Kürbisgewächse", "3 Jahre"], dolden: ["Doldenblütler", "3 bis 4 Jahre"],
    huelsen: ["Hülsenfrüchtler", "Erbsen 4 bis 5 Jahre, Bohnen 3 Jahre"], fuchs: ["Fuchsschwanzgewächse", "3 Jahre"], lauch: ["Lauchgewächse", "3 bis 4 Jahre"], korb: ["Korbblütler", "2 bis 3 Jahre"], baldrian: ["Baldriangewächse", "2 Jahre"],
  };
  var V = [["Weißkohl, Rotkohl, Rosenkohl", "stark", "kreuz"], ["Brokkoli, Blumenkohl", "stark", "kreuz"], ["Kürbis, Zucchini", "stark", "kuerbis"], ["Gurken", "stark", "kuerbis"], ["Tomaten", "stark", "nacht"], ["Paprika", "stark", "nacht"], ["Kartoffeln", "stark", "nacht"], ["Knollensellerie", "stark", "dolden"], ["Lauch", "stark", "lauch"],
    ["Möhren, Pastinaken", "mittel", "dolden"], ["Rote Bete, Mangold, Spinat", "mittel", "fuchs"], ["Fenchel", "mittel", "dolden"], ["Kohlrabi", "mittel", "kreuz"], ["Salat, Endivien", "mittel", "korb"], ["Zwiebeln, Knoblauch", "mittel", "lauch"], ["Rettich", "mittel", "kreuz"],
    ["Erbsen", "schwach", "huelsen"], ["Buschbohnen, Stangenbohnen", "schwach", "huelsen"], ["Feldsalat", "schwach", "baldrian"], ["Radieschen, Rucola", "schwach", "kreuz"]];
  var sel = el("select", { id: "wz-gemuese" }, V.map(function (v, i) { return el("option", { value: String(i) }, [v[0]]); }));
  var qm = el("input", { id: "wz-qm", type: "text", inputmode: "decimal", placeholder: "z. B. 4" });
  var out = el("div", { class: "hamon-wz-ergebnis", "aria-live": "polite" });
  root.className += " hamon-wz";
  root.appendChild(el("p", { class: "hamon-wz-titel" }, ["Nährstoff- und Fruchtfolge-Helfer"]));
  root.appendChild(el("p", { class: "hamon-wz-hilfe" }, ["Wähle ein Gemüse und die Beetgröße. Du erfährst, wie hungrig es ist, wie viel Kompost das Beet bekommt und wann es wieder an denselben Platz darf."]));
  root.appendChild(el("div", { class: "hamon-wz-felder" }, [el("label", { for: "wz-gemuese" }, ["Gemüse", sel]), el("label", { for: "wz-qm" }, ["Beetfläche (m²)", qm])]));
  root.appendChild(out);
  function render() {
    var v = V[Number(sel.value)], g = G[v[1]], fam = F[v[2]], a = num(qm);
    out.innerHTML = "";
    var rows = [el("tr", {}, [el("th", { scope: "row" }, ["Nährstoffbedarf"]), el("td", {}, [g[0]])]), el("tr", {}, [el("th", { scope: "row" }, ["Kompost pro m² und Jahr"]), el("td", {}, [g[1][0] + " bis " + g[1][1] + " Liter; " + g[2]])]), el("tr", {}, [el("th", { scope: "row" }, ["Familie"]), el("td", {}, [fam[0]])]), el("tr", {}, [el("th", { scope: "row" }, ["Anbaupause am selben Platz"]), el("td", {}, [fam[1]])])];
    if (a > 0) rows.push(el("tr", {}, [el("th", { scope: "row" }, ["Für dein Beet"]), el("td", {}, [f(a * g[1][0], 0) + " bis " + f(a * g[1][1], 0) + " Liter Kompost im Jahr"])]));
    out.appendChild(el("table", {}, [el("tbody", {}, rows)]));
    out.appendChild(el("p", { class: "hamon-wz-notiz" }, ["Vierfelder-Wechsel: Starkzehrer → Mittelzehrer → Schwachzehrer → Erholung (Gründüngung oder Erdbeeren), jedes Jahr ein Beet weiter. So steht keine Familie zu früh wieder am selben Platz."]));
  }
  sel.addEventListener("change", render); qm.addEventListener("input", render);
  render();
})();
